// PROYECTO ATLAS — Combate táctico en dungeon (v3).
// Sistema central de animaciones: toda acción pasa por una cola que
// orienta → anticipa → golpea → impacta → aplica resultado. El daño no
// aparece instantáneamente; se aplica al llegar al paso de impacto.
// 8 dirs, giro en casilla, ataque al aire, precisión/crítico internos.
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { getEntities, isWalkable } from "@/lib/atlasDungeons";
import { resolveAbilityAnimation } from "@/lib/atlasAbilityAnimations";
import {
  lineOfSight, chebyshev, stepToward, resolveSkillHit,
  tileInFacing, hasCover, isWalkableDiag,
} from "@/lib/atlasDungeonSkills";
import { prepareEnemy } from "@/lib/atlasEnemyAI";
import { MONSTERS } from "@/lib/atlasData";

const monsterById = (id) => MONSTERS.find((m) => m.id === id) || MONSTERS[0];

function findAllySpawn(dungeon, spawn) {
  const tries = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  for (const [dx, dy] of tries) {
    const nx = spawn.x + dx, ny = spawn.y + dy;
    if (isWalkableDiag(dungeon, spawn.x, spawn.y, nx, ny)) return { x: nx, y: ny };
  }
  return { x: spawn.x, y: spawn.y };
}

let _eid = 1;
const nextEffectId = () => `vfx_${Date.now()}_${_eid++}`;

// Duraciones (ms) de cada fase de animación.
const ANTICIP = 120;
const STRIKE_MELEE = 360;
const STRIKE_PROJ = 430;
const STRIKE_MAGIC = 400;
const IMPACT_SETTLE = 280;

export default function useDungeonCombat({ baseDungeon, dungeon, region, regionIndex, playerLevel, companion, player, callbacks }) {
  const [tactical, setTactical] = useState(false);
  const [turn, setTurn] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [allies, setAllies] = useState([]);
  const [keys, setKeys] = useState(0);
  const [defeated, setDefeated] = useState(new Set());
  const [cooldowns, setCooldowns] = useState({});
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [effects, setEffects] = useState([]);
  const [hurtPulses, setHurtPulses] = useState(() => new Set());
  const [shake, setShake] = useState(0);
  const [debug, setDebug] = useState(null);

  const enemiesRef = useRef([]);
  const alliesRef = useRef([]);
  const defeatedRef = useRef(new Set());
  const keysRef = useRef(0);
  const companionRef = useRef(companion);
  const playerRef = useRef(player);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { alliesRef.current = allies; }, [allies]);
  useEffect(() => { defeatedRef.current = defeated; }, [defeated]);
  useEffect(() => { keysRef.current = keys; }, [keys]);
  useEffect(() => { companionRef.current = companion; }, [companion]);
  useEffect(() => { playerRef.current = player; }, [player]);

  const hasLockedDoors = useMemo(() => {
    if (!baseDungeon) return false;
    return (baseDungeon.tiles || []).some((r) => r.includes("L"));
  }, [baseDungeon]);

  const pushLog = useCallback((line) => setLog((l) => [...l, line].slice(-8)), []);

  const emitVfx = useCallback((e) => {
    const eff = { id: nextEffectId(), ...e };
    setEffects((prev) => [...prev, eff]);
    const life = e.type === "miss" ? 820 : e.type === "defeat" ? 680 : e.type === "impact" ? 460 : e.crit ? 880 : 760;
    setTimeout(() => setEffects((prev) => prev.filter((x) => x.id !== eff.id)), life);
    return eff;
  }, []);

  // Reacción visual de una unidad al recibir daño (flash + sacudida breve).
  const pushHurt = useCallback((id) => {
    if (!id) return;
    setHurtPulses((prev) => { const n = new Set(prev); n.add(id); return n; });
    setTimeout(() => setHurtPulses((prev) => { const n = new Set(prev); n.delete(id); return n; }), 400);
  }, []);

  // Sacudida de cámara: magnitud 0..1.
  const triggerShake = useCallback((mag) => {
    if (!mag) return;
    setShake(mag);
    setTimeout(() => setShake(0), 260);
  }, []);

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const initEnemies = useCallback(() => {
    if (!baseDungeon) return [];
    const ent = getEntities(baseDungeon);
    const list = [];
    const diffMul = region?.difficultyMul || 1;
    const start = regionIndex === 0 ? 1 : regionIndex === 1 ? 6 : 12;
    ent.enemies.forEach((e) => {
      const m = monsterById(e.monsterId);
      const prepared = prepareEnemy(m, diffMul, playerLevel || 1, start, region?.id, baseDungeon?.sectorId, playerRef.current || player);
      list.push({ id: e.id, x: e.x, y: e.y, monsterId: e.monsterId, name: prepared.name || m.name, hp: prepared.hp, maxHp: prepared.hp, attack: prepared.attack || m.attack || 0, defense: prepared.defense || m.defense || 0, detectRange: 5, attackRange: 1, alerted: false });
    });
    // El mini jefe final se resuelve con combate clásico (no táctico):
    // no se añade a la lista de enemigos tácticos.
    return list;
  }, [baseDungeon, region, regionIndex, playerLevel]);

  const buildAlly = useCallback(() => {
    const c = companionRef.current;
    if (!c) return [];
    const ent = getEntities(baseDungeon);
    const sp = findAllySpawn(baseDungeon, ent.spawn);
    const hp = c.hp != null ? c.hp : c.maxHp;
    return [{ id: "companion", name: c.name, race: c.race, class: c.class, x: sp.x, y: sp.y, facing: "down", hp, maxHp: c.maxHp, attack: c.attack, defense: c.defense || 0, ability: c.ability, level: c.level || 1, incapacitated: hp <= 0 }];
  }, [baseDungeon]);

  useEffect(() => {
    const list = initEnemies();
    setEnemies(list); enemiesRef.current = list;
    const allyList = buildAlly();
    setAllies(allyList); alliesRef.current = allyList;
    setKeys(0); keysRef.current = 0;
    setTactical(false); setTurn(null); setCooldowns({}); setDefeated(new Set()); setLog([]); setBusy(false); setEffects([]); setHurtPulses(new Set()); setShake(0); setDebug(null);
  }, [baseDungeon?.id, initEnemies, buildAlly]);

  const syncCompanion = useCallback((a) => {
    if (a && a.id === "companion") callbacksRef.current.onCompanionUpdate?.({ hp: Math.max(0, a.hp), incapacitated: a.hp <= 0 });
  }, []);

  const maybeStartTactical = useCallback((pp) => {
    setTactical((prevT) => {
      if (prevT) return prevT;
      const list = enemiesRef.current;
      let any = false;
      for (const e of list) {
        if (e.hp <= 0) continue;
        if (chebyshev(e, pp) <= e.detectRange && lineOfSight(dungeon, e.x, e.y, pp.x, pp.y)) { any = true; break; }
      }
      if (any) {
        setTurn("player");
        setEnemies((prev) => prev.map((e) => ({ ...e, alerted: e.hp > 0 && chebyshev(e, pp) <= e.detectRange && lineOfSight(dungeon, e.x, e.y, pp.x, pp.y) })));
        pushLog("¡Enemigo detectado! Modo táctico activado.");
        triggerShake(0.5);
        callbacksRef.current.onTacticalStart?.();
      }
      return any;
    });
  }, [dungeon, pushLog, triggerShake]);

  const patroll = useCallback((pp) => {
    if (tactical) return;
    setEnemies((prev) => {
      if (!prev.length) return prev;
      const occ = new Set([`${pp.x},${pp.y}`]);
      alliesRef.current.forEach((a) => a.hp > 0 && occ.add(`${a.x},${a.y}`));
      const next = prev.map((e) => {
        if (e.hp <= 0) return e;
        if (Math.random() > 0.4) return e;
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]].sort(() => Math.random() - 0.5);
        for (const [dx, dy] of dirs) {
          const nx = e.x + dx, ny = e.y + dy;
          if (isWalkable(dungeon, nx, ny) && !occ.has(`${nx},${ny}`)) {
            occ.delete(`${e.x},${e.y}`); occ.add(`${nx},${ny}`);
            return { ...e, x: nx, y: ny };
          }
        }
        return e;
      });
      return next;
    });
    setAllies((prev) => {
      if (!prev.length) return prev;
      const a = { ...prev[0] };
      if (a.incapacitated || a.hp <= 0) return prev;
      const d = chebyshev(a, pp);
      if (d <= 1) return prev;
      const occ = new Set([`${pp.x},${pp.y}`]);
      enemiesRef.current.forEach((e) => e.hp > 0 && occ.add(`${e.x},${e.y}`));
      const step = stepToward(dungeon, { x: a.x, y: a.y }, { x: pp.x, y: pp.y }, occ);
      if (step) { a.x = step.x; a.y = step.y; a.facing = _vecFacing(a, pp); return [a]; }
      return prev;
    });
    setTimeout(() => maybeStartTactical(pp), 60);
  }, [tactical, dungeon, maybeStartTactical]);

  function _vecFacing(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    if (dx > 0 && dy === 0) return "right";
    if (dx < 0 && dy === 0) return "left";
    if (dx === 0 && dy > 0) return "down";
    if (dx === 0 && dy < 0) return "up";
    if (dx > 0 && dy > 0) return "down_right";
    if (dx < 0 && dy > 0) return "down_left";
    if (dx > 0 && dy < 0) return "up_right";
    if (dx < 0 && dy < 0) return "up_left";
    return a.facing || "down";
  }

  // ── Núcleo del sistema de animaciones ──
  // playStrike: emite la animación de golpe (lunge/projectile/magic),
  // y al llegar al impacto invoca onImpact (donde se aplica el daño).
  const playStrike = useCallback((opts, onImpact) => {
    const { attacker, target, vfx = "lunge", miss, isCrit, text, element, impactType, projectileType } = opts;
    const vfxType = vfx === "projectile" ? "projectile" : vfx === "magic" ? "magic" : "lunge";
    emitVfx({ type: vfxType, from: attacker, x: target.x, y: target.y, text: miss ? null : text, crit: isCrit, miss: !!miss, element, impactType, projectileType });
    const dur = vfxType === "projectile" ? STRIKE_PROJ : vfxType === "magic" ? STRIKE_MAGIC : STRIKE_MELEE;
    setTimeout(() => {
      if (miss) {
        emitVfx({ type: "miss", x: target.x, y: target.y, element });
      } else {
        emitVfx({ type: "impact", x: target.x, y: target.y, crit: isCrit, element, impactType });
        if (isCrit) triggerShake(0.7);
        else triggerShake(0.3);
      }
      onImpact?.();
    }, dur);
  }, [emitVfx, triggerShake]);

  const reviveCompanion = useCallback(() => {
    setAllies((prev) => {
      if (!prev.length) return prev;
      const a = { ...prev[0] };
      if (a.hp <= 0) { a.hp = Math.max(1, Math.round(a.maxHp * 0.5)); a.incapacitated = false; pushLog(`${a.name} se recupera y vuelve a la lucha.`); callbacksRef.current.onCompanionUpdate?.({ hp: a.hp, incapacitated: false }); }
      return [a];
    });
  }, [pushLog]);

  // ── Cola de acciones de la fase enemiga/aliada ──
  // Procesa un actor a la vez: orientar → golpear → impactar → siguiente.
  const endPlayerTurn = useCallback((pp) => {
    setBusy(true); setTurn("enemies");
    setDebug({ phase: "enemy_start", queue: [], action: null });

    const list = enemiesRef.current.map((e) => ({ ...e }));
    const alliesList = alliesRef.current.map((a) => ({ ...a }));
    let totalPlayerDmg = 0;

    const queue = [];
    for (const a of alliesList) if (a.hp > 0 && !a.incapacitated) queue.push({ kind: "ally", actor: a });
    for (const e of list) if (e.hp > 0) queue.push({ kind: "enemy", actor: e });

    let idx = 0;
    const next = () => {
      if (idx >= queue.length) { finishTurn(); return; }
      const act = queue[idx++];
      if (act.actor.hp <= 0 || (act.kind === "ally" && act.actor.incapacitated)) { next(); return; }
      processActor(act, next);
    };

    const processActor = (act, done) => {
      if (act.kind === "ally") {
        const a = act.actor;
        const alive = list.filter((e) => e.hp > 0);
        if (!alive.length) { done(); return; }
        const target = alive.sort((x, y) => chebyshev(x, a) - chebyshev(y, a))[0];
        a.facing = _vecFacing(a, target);
        if (chebyshev(target, a) <= 1) {
          const canAbility = a.ability && (a.level || 1) >= 5 && Math.random() < 0.35;
          const dmg = Math.max(1, a.attack - (target.defense || 0)) + (canAbility ? 2 + Math.floor((a.level || 1) / 2) : 0);
          const isCrit = Math.random() < 0.1;
          const final = isCrit ? Math.round(dmg * 1.5) : dmg;
          setDebug({ phase: "enemy", action: { attacker: a.id, target: target.id, type: "lunge", dmg: final, crit: isCrit } });
          playStrike({ attacker: { x: a.x, y: a.y }, target: { x: target.x, y: target.y }, vfx: "lunge", isCrit, text: String(final), element: resolveAbilityAnimation(null, { class: a.class }).element, impactType: "slash" }, () => {
            target.hp = Math.max(0, target.hp - final);
            pushHurt(target.id);
            setEnemies(list.map((e) => ({ ...e })));
            if (target.hp <= 0) emitVfx({ type: "defeat", x: target.x, y: target.y });
            pushLog(`${a.name} ${canAbility ? `usa ${a.ability}: ${final}` : `ataca a ${target.name}: ${final}`}${isCrit ? " (¡crítico!)" : ""}.`);
            setTimeout(done, IMPACT_SETTLE);
          });
        } else {
          const occ = new Set(list.filter((e) => e.hp > 0).map((e) => `${e.x},${e.y}`)); occ.add(`${pp.x},${pp.y}`);
          const st = stepToward(dungeon, { x: a.x, y: a.y }, { x: target.x, y: target.y }, occ);
          if (st) { a.x = st.x; a.y = st.y; setAllies([{ ...a }]); }
          done();
        }
        return;
      }
      // enemy
      const e = act.actor;
      const dist = chebyshev(e, pp);
      const los = lineOfSight(dungeon, e.x, e.y, pp.x, pp.y);
      e.alerted = (los && dist <= Math.round(e.detectRange * 1.4)) || dist <= 1;
      if (!e.alerted) { done(); return; }
      const targets = [{ x: pp.x, y: pp.y, def: callbacksRef.current.getPlayerDefense?.() || 0, isPlayer: true }];
      for (const a of alliesList) if (a.hp > 0 && !a.incapacitated) targets.push({ x: a.x, y: a.y, def: a.defense || 0, ally: a });
      const tgt = targets.sort((x, y) => chebyshev(x, e) - chebyshev(y, e))[0];
      if (chebyshev(tgt, e) <= e.attackRange) {
        if (tgt.isPlayer) rotate(_vecFacing(pp, e));
        const hit = Math.random() < 0.85;
        const isCrit = hit && Math.random() < 0.08;
        let dmg = hit ? Math.max(1, e.attack - tgt.def) : 0;
        if (hit && isCrit) dmg = Math.round(dmg * 1.5);
        setDebug({ phase: "enemy", action: { attacker: e.id, target: tgt.isPlayer ? "player" : tgt.ally.id, type: "lunge", dmg, crit: isCrit, miss: !hit } });
        playStrike({ attacker: { x: e.x, y: e.y }, target: { x: tgt.x, y: tgt.y }, vfx: "lunge", miss: !hit, isCrit, text: hit ? String(dmg) : null, element: monsterById(e.monsterId)?.element || "fisico", impactType: "slash" }, () => {
          if (!hit) { pushLog(`${e.name} falla el ataque.`); setTimeout(done, IMPACT_SETTLE); return; }
          if (tgt.isPlayer) {
            totalPlayerDmg += dmg;
            pushHurt("player");
            callbacksRef.current.onPlayerDamage?.(dmg);
            pushLog(`${e.name} te ataca: ${dmg}${isCrit ? " (¡crítico!)" : ""}.`);
          } else {
            tgt.ally.hp = Math.max(0, tgt.ally.hp - dmg);
            pushHurt(tgt.ally.id);
            setAllies(alliesList.map((a) => ({ ...a })));
            alliesList.forEach(syncCompanion);
            pushLog(`${e.name} ataca a ${tgt.ally.name}: ${dmg}.`);
            if (tgt.ally.hp <= 0) { tgt.ally.incapacitated = true; emitVfx({ type: "defeat", x: tgt.ally.x, y: tgt.ally.y }); pushLog(`${tgt.ally.name} queda incapacitado.`); }
          }
          setTimeout(done, IMPACT_SETTLE);
        });
      } else {
        const occ = new Set(list.filter((x) => x.hp > 0).map((x) => `${x.x},${x.y}`));
        const st = stepToward(dungeon, { x: e.x, y: e.y }, { x: tgt.x, y: tgt.y }, occ);
        if (st) { e.x = st.x; e.y = st.y; setEnemies(list.map((x) => ({ ...x }))); }
        done();
      }
    };

    const finishTurn = () => {
      const dead = list.filter((e) => e.hp <= 0 && !defeatedRef.current.has(e.id));
      if (dead.length) {
        setDefeated((prev) => new Set([...prev, ...dead.map((e) => e.id)]));
        for (const k of dead) {
          emitVfx({ type: "defeat", x: k.x, y: k.y });
          callbacksRef.current.onEnemyKilled?.(k, !!k.boss);
          if (k.boss && hasLockedDoors) { keysRef.current += 1; setKeys(keysRef.current); pushLog("El jefe deja caer una llave."); }
          pushLog(`Derrotas a ${k.name}.`);
        }
      }
      const alive = list.filter((e) => e.hp > 0);
      if (alive.length === 0) {
        setTactical(false); setTurn(null); setBusy(false); setDebug(null);
        reviveCompanion();
        callbacksRef.current.onEndTactical?.(); callbacksRef.current.onClear?.();
        pushLog("La dungeon queda despejada. Vuelves a la exploración.");
        return;
      }
      setTimeout(() => {
        const anyAlert = alive.some((e) => e.alerted || chebyshev(e, pp) <= 1);
        if (!anyAlert) {
          setTactical(false); setTurn(null); setBusy(false); setDebug(null);
          reviveCompanion();
          callbacksRef.current.onEndTactical?.(); callbacksRef.current.onClear?.();
          pushLog("Pierdes de vista a los enemigos. Vuelves a la exploración.");
        } else {
          setTurn("player"); setBusy(false);
          setCooldowns((cd) => { const n = { ...cd }; for (const k in n) n[k] = Math.max(0, n[k] - 1); return n; });
        }
      }, 360);
    };

    setTimeout(next, 240);
  }, [dungeon, hasLockedDoors, pushLog, syncCompanion, reviveCompanion, playStrike, pushHurt, triggerShake, emitVfx]);

  const afterMove = useCallback((pp) => {
    if (!tactical) { maybeStartTactical(pp); return; }
    if (busy || turn !== "player") return;
    endPlayerTurn(pp);
  }, [tactical, busy, turn, maybeStartTactical, endPlayerTurn]);

  const [facingState, setFacingState] = useState("down");
  const rotate = useCallback((facing) => { setFacingState(facing); }, []);

  // Ataque básico: calcula el resultado, anima el golpe y aplica el daño al impacto.
  const basicAttack = useCallback((pp, facing) => {
    if (!tactical || busy || turn !== "player") return;
    callbacksRef.current.onWeaponWear?.(1);
    // Orientación automática: mirar al enemigo adyacente más cercano antes de atacar.
    const adj = enemiesRef.current.filter((e) => e.hp > 0 && chebyshev(pp, e) <= 1);
    let useFacing = facing;
    if (adj.length) {
      const tgt0 = adj.slice().sort((a, b) => chebyshev(pp, a) - chebyshev(pp, b))[0];
      useFacing = _vecFacing(pp, tgt0);
      rotate(useFacing);
    }
    const tgt = tileInFacing(pp, useFacing);
    if (!tgt) return;
    setBusy(true);
    const target = enemiesRef.current.find((e) => e.hp > 0 && e.x === tgt.x && e.y === tgt.y && lineOfSight(dungeon, pp.x, pp.y, e.x, e.y));
    const anim = resolveAbilityAnimation({ name: "Ataque básico" }, { class: playerRef.current?.class });
    if (!target) {
      emitVfx({ type: anim.dungeonType, from: { x: pp.x, y: pp.y }, x: tgt.x, y: tgt.y, miss: true, element: anim.element, impactType: anim.impactType });
      pushLog("Atacas al aire. Los enemigos avanzan.");
      setDebug({ phase: "player", action: { attacker: "player", target: null, type: anim.dungeonType, miss: true } });
      setTimeout(() => endPlayerTurn(pp), STRIKE_MELEE + 120);
      return;
    }
    const dist = chebyshev(pp, target);
    const cover = hasCover(dungeon, target);
    const r = resolveSkillHit({ accuracy: 0.9, critChance: 0.1, critMult: 1.5, damage: (p) => p.attack || 0 }, playerRef.current, target, { distance: dist, cover });
    setDebug({ phase: "player", action: { attacker: "player", target: target.id, type: anim.dungeonType, dmg: r.dmg, crit: r.crit, miss: !r.hit } });
    playStrike({ attacker: { x: pp.x, y: pp.y }, target: { x: target.x, y: target.y }, vfx: anim.dungeonType, miss: !r.hit, isCrit: r.crit, text: r.hit ? String(r.dmg) : null, element: anim.element, impactType: anim.impactType, projectileType: anim.projectileType }, () => {
      if (!r.hit) { pushLog(`Tu ataque falla a ${target.name}.`); setTimeout(() => endPlayerTurn(pp), IMPACT_SETTLE); return; }
      const willDie = target.hp - r.dmg <= 0;
      setEnemies((prev) => prev.map((e) => e.id === target.id ? { ...e, hp: Math.max(0, e.hp - r.dmg) } : e));
      pushHurt(target.id);
      if (willDie) emitVfx({ type: "defeat", x: target.x, y: target.y });
      pushLog(`Atacas a ${target.name}: ${r.dmg}${r.crit ? " (¡crítico!)" : ""}.`);
      setTimeout(() => endPlayerTurn(pp), IMPACT_SETTLE);
    });
  }, [tactical, busy, turn, dungeon, emitVfx, pushLog, playStrike, pushHurt, endPlayerTurn]);

  const useSkill = useCallback((skill, pp, facing, pl) => {
    if (!tactical || busy || turn !== "player") return;
    if (skill.energyCost > 0 && (pl?.mp || 0) < skill.energyCost) { callbacksRef.current.onMessage?.("Energía insuficiente."); return; }
    if ((cooldowns[skill.id] || 0) > 0) { callbacksRef.current.onMessage?.("Habilidad en enfriamiento."); return; }
    callbacksRef.current.onWeaponWear?.(skill.type === "weapon" ? 2 : 1);
    const targets = enemiesRef.current.filter((e) => e.hp > 0 && chebyshev(e, pp) <= skill.range && lineOfSight(dungeon, pp.x, pp.y, e.x, e.y));
    if (!targets.length) { callbacksRef.current.onMessage?.("Sin objetivo en alcance."); return; }
    // Orientación automática hacia el objetivo principal.
    const primary = targets.slice().sort((a, b) => chebyshev(a, pp) - chebyshev(b, pp))[0];
    if (primary) rotate(_vecFacing(pp, primary));
    setBusy(true);
    if (skill.energyCost > 0) callbacksRef.current.onSpendEnergy?.(skill.energyCost);
    if (skill.cooldown > 0) setCooldowns((cd) => ({ ...cd, [skill.id]: skill.cooldown }));
    const hits = skill.hits || 1;
    const hitList = skill.aoe ? targets : [targets.sort((a, b) => chebyshev(a, pp) - chebyshev(b, pp))[0]];
    const anim = resolveAbilityAnimation(skill, { class: (pl || playerRef.current)?.class });
    const vfx = anim.dungeonType;
    if (skill.aoe) emitVfx({ type: "area", tiles: hitList.map((h) => ({ x: h.x, y: h.y })), element: anim.element });
    // Calcular resultados sin aplicar daño todavía.
    const results = hitList.map((t) => {
      const dist = chebyshev(pp, t);
      const cover = hasCover(dungeon, t);
      let total = 0, crit = false, missed = true;
      for (let h = 0; h < hits; h++) {
        const r = resolveSkillHit(skill, pl || playerRef.current, t, { distance: dist, cover });
        if (!r.hit) continue;
        missed = false; total += r.dmg; if (r.crit) crit = true;
      }
      return { id: t.id, x: t.x, y: t.y, total, crit, missed };
    });
    // Emitir animaciones de golpe para cada objetivo.
    let anyCrit = false;
    results.forEach((r) => {
      if (r.missed) emitVfx({ type: vfx, from: { x: pp.x, y: pp.y }, x: r.x, y: r.y, miss: true, element: anim.element, projectileType: anim.projectileType });
      else { emitVfx({ type: vfx, from: { x: pp.x, y: pp.y }, x: r.x, y: r.y, text: String(r.total), crit: r.crit, element: anim.element, projectileType: anim.projectileType, impactType: anim.impactType }); if (r.crit) anyCrit = true; }
    });
    if (anyCrit || skill.aoe) triggerShake(anim.cameraEffect?.shake || 0.4);
    setDebug({ phase: "player", action: { skill: skill.name, type: vfx, element: anim.element, targets: results.length, aoe: !!skill.aoe } });
    const dur = vfx === "projectile" ? STRIKE_PROJ : vfx === "magic" ? STRIKE_MAGIC : STRIKE_MELEE;
    setTimeout(() => {
      const list = enemiesRef.current.map((e) => ({ ...e }));
      results.forEach((r) => {
        if (r.missed) { emitVfx({ type: "miss", x: r.x, y: r.y, element: anim.element }); pushLog(`${skill.name} falla a un enemigo.`); return; }
        const tgt = list.find((e) => e.id === r.id);
        if (!tgt) return;
        tgt.hp = Math.max(0, tgt.hp - r.total);
        pushHurt(tgt.id);
        emitVfx({ type: "impact", x: r.x, y: r.y, crit: r.crit, element: anim.element, impactType: anim.impactType });
        if (skill.status) emitVfx({ type: "status", x: r.x, y: r.y, element: anim.element });
        if (tgt.hp <= 0) emitVfx({ type: "defeat", x: r.x, y: r.y });
        pushLog(`${skill.name} → ${tgt.name}: ${r.total}${r.crit ? " (¡crítico!)" : ""}.${skill.status ? ` + ${skill.status.type}` : ""}`);
      });
      setEnemies(list);
      setTimeout(() => endPlayerTurn(pp), IMPACT_SETTLE);
    }, dur);
  }, [tactical, busy, turn, cooldowns, dungeon, emitVfx, pushLog, pushHurt, triggerShake, endPlayerTurn]);

  const useItem = useCallback((pp) => {
    if (!tactical || busy || turn !== "player") return;
    setBusy(true);
    callbacksRef.current.onUseConsumable?.("hp_s");
    emitVfx({ type: "heal", x: pp.x, y: pp.y, text: "+HP" });
    pushLog("Usas una poción.");
    setDebug({ phase: "player", action: { type: "heal", target: "player" } });
    setTimeout(() => endPlayerTurn(pp), 480);
  }, [tactical, busy, turn, emitVfx, pushLog, endPlayerTurn]);

  const wait = useCallback((pp) => {
    if (!tactical || busy || turn !== "player") return;
    pushLog("Esperas.");
    endPlayerTurn(pp);
  }, [tactical, busy, turn, pushLog, endPlayerTurn]);

  const spendKey = useCallback(() => {
    if (keysRef.current <= 0) return false;
    keysRef.current -= 1; setKeys(keysRef.current);
    return true;
  }, []);

  // Reinicia el estado táctico (p.ej. al iniciar el combate clásico del mini jefe).
  const clearTactical = useCallback(() => {
    setTactical(false); setTurn(null); setBusy(false); setDebug(null);
  }, []);

  return {
    tactical, turn, enemies, allies, keys, defeated, cooldowns, log, busy, effects, facing: facingState,
    hurtPulses, shake, debug,
    maybeStartTactical, afterMove, useSkill, useItem, wait, spendKey, patroll, basicAttack, rotate, clearTactical,
  };

}