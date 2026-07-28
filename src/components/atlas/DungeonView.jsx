import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Swords, FlaskRound, Hourglass } from "lucide-react";
import { getEntities, DUNGEON_TILE } from "@/lib/atlasDungeons";
import {
  getUnlockedDungeonSkills, DIR8, DIR8_KEYS, facingFromVector,
  lineOfSight, isWalkableDiag,
} from "@/lib/atlasDungeonSkills";
import { drawPlayerSprite } from "@/lib/atlasPixel";
import { drawPlayerFrameWithModularFallback } from "@/lib/atlasHeroCanvasBridge";
import useDungeonCombat from "@/hooks/useDungeonCombat";
import EntitySprite from "./EntitySprite";
import DungeonVfx from "./DungeonVfx";
import CombatView from "./ui-v3/CombatViewAdapterV3";
import AtlasPressButton from "./AtlasPressButton";
import DungeonHudV3 from "./ui-v3/DungeonHudV3";
import { getSkillStatusHints } from "@/lib/atlasSkillStatusHints";

const T = DUNGEON_TILE;
const FACING_LABEL = { up: "↑", down: "↓", left: "←", right: "→", up_left: "↖", up_right: "↗", down_left: "↙", down_right: "↘" };

export default function DungeonView({ dungeon, player, region, regionIndex, companion, onExit, onDescend, onOpenChest, onStoryPoint, onPlayerDamage, onSpendEnergy, onEnemyKilled, onUseConsumable, onCompanionUpdate, onWeaponWear, enemy, lastResult, onAttack, onSkill, onItem, onEscape, onEnemyDead, worldSkills, worldSkillCosts, playerStatuses, combatBusy, onStartBossCombat, onActivateFinalSanctuary, bossDefeated, settings, onUpdateSettings, onRequestOrientation }) {
  const [pos, setPos] = useState(dungeon?.spawn || { x: 1, y: 1 });
  const [facing, setFacing] = useState("down");
  const [opened, setOpened] = useState(new Set());
  const [msg, setMsg] = useState(null);
  const [vp, setVp] = useState({ w: 520, h: 360 });
  const [liveTiles, setLiveTiles] = useState(() => (dungeon ? [...dungeon.tiles] : []));
  const [revealed, setRevealed] = useState(() => new Set());
  const [showMore, setShowMore] = useState(false);
  const [combatFlash, setCombatFlash] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const vpRef = useRef(null);
  const canvasRef = useRef(null);
  const msgTimer = useRef(null);
  const posRef = useRef(pos);
  posRef.current = pos;
  const facingRef = useRef(facing);
  facingRef.current = facing;
  const entitiesRef = useRef(getEntities(dungeon));
  const stepLock = useRef(false);
  const moveCooldown = useRef(0);
  const joyVecRef = useRef({ x: 0, y: 0 });

  const liveDungeon = useMemo(() => (dungeon ? { ...dungeon, tiles: liveTiles } : dungeon), [dungeon, liveTiles]);

  const flash = useCallback((m) => {
    setMsg(m);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMsg(null), 2000);
  }, []);

  const combat = useDungeonCombat({
    baseDungeon: dungeon, dungeon: liveDungeon, region, regionIndex,
    playerLevel: player?.level || 1, companion, player,
    callbacks: {
      onPlayerDamage, onSpendEnergy, onEnemyKilled, onUseConsumable, onCompanionUpdate, onWeaponWear,
      getPlayerDefense: () => player?.physicalDefense ?? player?.defense ?? 0,
      onMessage: flash, onTacticalStart: () => {}, onEndTactical: () => {}, onClear: () => {},
    },
  });

  useEffect(() => { setFacing(combat.facing); }, [combat.facing]);

  useEffect(() => {
    setPos(dungeon?.spawn || { x: 1, y: 1 });
    setOpened(new Set()); setFacing("down"); setMsg(null);
    setLiveTiles(dungeon ? [...dungeon.tiles] : []);
    setRevealed(new Set()); setShowMore(false);
    entitiesRef.current = getEntities(dungeon);
    const sp = dungeon?.spawn || { x: 1, y: 1 };
    setTimeout(() => combat.maybeStartTactical(sp), 200);
  }, [dungeon?.id]);

  // Niebla de guerra: revela casillas vistas por el jugador (radio 3 + línea de visión).
  useEffect(() => {
    if (!dungeon) return;
    setRevealed((prev) => {
      const next = new Set(prev);
      const R = 3;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) > R) continue;
        const nx = pos.x + dx, ny = pos.y + dy;
        if (nx < 0 || ny < 0 || nx >= dungeon.cols || ny >= dungeon.rows) continue;
        if (lineOfSight(liveDungeon, pos.x, pos.y, nx, ny)) next.add(`${nx},${ny}`);
      }
      // Revela la habitación completa al entrar (estilo mazmorra de exploración).
      const rooms = dungeon.rooms || [];
      for (const r of rooms) {
        if (pos.x >= r.x && pos.x < r.x + r.w && pos.y >= r.y && pos.y < r.y + r.h) {
          for (let yy = r.y; yy < r.y + r.h; yy++) for (let xx = r.x; xx < r.x + r.w; xx++) next.add(`${xx},${yy}`);
        }
      }
      return next;
    });
  }, [pos, dungeon?.id, liveDungeon]);

  // Destello visual al entrar en combate táctico.
  useEffect(() => {
    if (combat.tactical) {
      setCombatFlash(true);
      const t = setTimeout(() => setCombatFlash(false), 650);
      return () => clearTimeout(t);
    }
  }, [combat.tactical]);

  // Sacudida de cámara en impactos/críticos (Web Animations API, sin remontar).
  useEffect(() => {
    if (!combat.shake) return;
    const el = vpRef.current;
    if (!el || !el.animate) return;
    const m = Math.min(1.2, combat.shake);
    const rx = (Math.random() * 2 - 1) * 5 * m, ry = (Math.random() * 2 - 1) * 5 * m;
    el.animate([
      { transform: "translate(0,0)" },
      { transform: `translate(${rx}px,${ry}px)` },
      { transform: `translate(${-rx * 0.5}px,${-ry * 0.5}px)` },
      { transform: "translate(0,0)" },
    ], { duration: 250, easing: "ease-out" });
  }, [combat.shake]);

  useEffect(() => {
    const update = () => { if (vpRef.current) setVp({ w: vpRef.current.clientWidth, h: vpRef.current.clientHeight }); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (canvasRef.current && player) drawPlayerFrameWithModularFallback({ surface: "dungeon", legacyDraw: () => drawPlayerSprite(canvasRef.current, player.class, facingToCardinal(facing), 0, 3, player.race) });
  }, [facing, player, pos]);

  useEffect(() => {
    if (combat.tactical) return;
    const id = setInterval(() => combat.patroll(posRef.current), 1600);
    return () => clearInterval(id);
  }, [combat.tactical, combat.patroll]);

  const skills = useMemo(() => getUnlockedDungeonSkills(player), [player]);

  const moveStep = useCallback((dirKey) => {
    const delta = DIR8[dirKey];
    if (!delta) return;
    setFacing(dirKey);
    const cur = posRef.current;
    const nx = cur.x + delta[0], ny = cur.y + delta[1];
    if (!isWalkableDiag(liveDungeon, cur.x, cur.y, nx, ny)) { flash("No puedes pasar por ahí."); return; }
    if (combat.enemies.some((e) => e.hp > 0 && e.x === nx && e.y === ny)) { flash("Casilla ocupada por un enemigo."); return; }
    if (combat.allies.some((a) => a.hp > 0 && a.x === nx && a.y === ny)) { flash("Tu escolta bloquea el paso."); return; }
    const np = { x: nx, y: ny };
    setPos(np);
    combat.afterMove(np);
    // Mini jefe: al pisar su casilla, inicia el combate clásico.
    const mb = entitiesRef.current.boss;
    if (mb && !bossDefeated && np.x === mb.x && np.y === mb.y) {
      combat.clearTactical?.();
      onStartBossCombat?.(mb);
    }
    // Trampa: pinchazo leve al pisarla (se consume).
    const tile = liveTiles[np.y] && liveTiles[np.y][np.x];
    if (tile === "T") {
      setLiveTiles((prev) => prev.map((r, i) => (i === np.y ? r.substring(0, np.x) + "." + r.substring(np.x + 1) : r)));
      flash("¡Trampa! Recibes un pinchazo.");
      onPlayerDamage?.(3);
    }
  }, [liveDungeon, combat, flash, onPlayerDamage, liveTiles, bossDefeated, onStartBossCombat, onActivateFinalSanctuary]);

  const rotateTo = useCallback((dirKey) => {
    if (!dirKey) return;
    setFacing(dirKey);
  }, []);

  // Joystick: sub-umbral → giro; sobre umbral → paso.
  // Fuera de combate: avance continuo por casillas con pausa corta constante.
  // En combate táctico: un paso por empujón (respeta turnos).
  const STEP_PAUSE = 180;
  const tryStep = useCallback((dirKey) => {
    if (stepLock.current) return false;
    stepLock.current = true;
    moveStep(dirKey);
    setTimeout(() => { stepLock.current = false; }, STEP_PAUSE);
    return true;
  }, [moveStep]);

  const onJoyMove = useCallback((x, y) => {
    const mag = Math.hypot(x, y);
    if (mag < 0.12) { joyVecRef.current = { x: 0, y: 0 }; stepLock.current = false; return; }
    joyVecRef.current = { x, y };
    const dirKey = facingFromVector(x, y);
    if (!dirKey) return;
    if (mag < 0.55) { rotateTo(dirKey); stepLock.current = false; return; }
    tryStep(dirKey);
  }, [rotateTo, tryStep]);

  // Bucle de avance continuo fuera de combate táctico.
  useEffect(() => {
    if (combat.tactical) return;
    const id = setInterval(() => {
      const v = joyVecRef.current;
      if (Math.hypot(v.x, v.y) < 0.55) return;
      const dirKey = facingFromVector(v.x, v.y);
      if (dirKey) tryStep(dirKey);
    }, 60);
    return () => clearInterval(id);
  }, [combat.tactical, tryStep]);

  const onInteract = useCallback(() => {
    const ent = entitiesRef.current;
    const cur = posRef.current;
    // Mini jefe: combate clásico al interactuar (en casilla o adyacente).
    if (ent.boss && !bossDefeated) {
      const adj = Math.max(Math.abs(cur.x - ent.boss.x), Math.abs(cur.y - ent.boss.y)) <= 1;
      if (adj) { combat.clearTactical?.(); onStartBossCombat?.(ent.boss); return; }
    }
    if (ent.sanctuary) {
      const adj = Math.max(Math.abs(cur.x - ent.sanctuary.x), Math.abs(cur.y - ent.sanctuary.y)) <= 1;
      if (adj) {
        if (combat.tactical) { flash("No puedes vincular el santuario mientras haya enemigos alertados."); return; }
        flash("Atlas registra tu paso. Vida, energía y amenaza se restauran.");
        setTimeout(() => onActivateFinalSanctuary?.(ent.sanctuary), 250);
        return;
      }
    }
    const chest = ent.chests.find((c) => c.x === cur.x && c.y === cur.y && !opened.has(c.id));
    if (chest) {
      setOpened((prev) => new Set([...prev, chest.id]));
      onOpenChest?.(chest);
      flash("Abres un cofre de la dungeon.");
      return;
    }
    if (ent.objective && ent.objective.x === cur.x && ent.objective.y === cur.y) {
      const res = onStoryPoint?.({ id: ent.objective.storyPointId, label: "Objetivo de la dungeon" });
      flash(res?.ok ? res.message : "Examinas el punto de interés de la dungeon.");
      return;
    }
    // Salida final (E) o entrada (S) como salida de emergencia
    const isExit = ent.exit.x === cur.x && ent.exit.y === cur.y;
    const isSpawn = ent.spawn.x === cur.x && ent.spawn.y === cur.y;
    if (isExit || isSpawn) {
      if (combat.tactical) { flash("No puedes salir mientras haya enemigos alertados."); return; }
      if (isExit) {
        const lastFloor = dungeon.floorCount && dungeon.floor >= dungeon.floorCount;
        if (ent.boss && !bossDefeated) { flash("El mini jefe bloquea la salida. Derrota primero."); return; }
        if (!lastFloor && onDescend) {
          flash(`Bajas las escaleras al piso ${dungeon.floor + 1}.`);
          setTimeout(() => onDescend?.(), 200);
        } else {
          flash(dungeon.isBossFloor ? "Completas la dungeon y regresas al exterior." : "Sales de la dungeon.");
          setTimeout(() => onExit?.(), 200);
        }
        return;
      }
      flash("Usas la entrada como salida de emergencia.");
      setTimeout(() => onExit?.(), 180);
      return;
    }
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      const row = liveTiles[ny];
      if (row && row[nx] === "L") {
        if (combat.spendKey()) {
          setLiveTiles((prev) => prev.map((r, i) => i === ny ? r.substring(0, nx) + "." + r.substring(nx + 1) : r));
          flash("Usas una llave. La puerta se abre.");
        } else {
          flash("Puerta cerrada. Necesitas una llave (cae del jefe).");
        }
        return;
      }
    }
    flash("No hay nada que inspeccionar aquí.");
  }, [liveTiles, opened, onOpenChest, onStoryPoint, onExit, combat, flash, bossDefeated, onStartBossCombat, onActivateFinalSanctuary]);

  // Acción A: en combate → ataque básico a la casilla mirada; fuera → interactuar.
  const onA = useCallback(() => {
    if (combat.tactical) {
      if (combat.turn !== "player" || combat.busy) return;
      combat.basicAttack(posRef.current, facingRef.current);
    } else {
      onInteract();
    }
  }, [combat, onInteract]);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const diagMap = { "7": "up_left", "9": "up_right", "1": "down_left", "3": "down_right", y: "up_left", u: "up_right", b: "down_left", n: "down_right" };
      if (diagMap[k]) { e.preventDefault(); moveStep(diagMap[k]); }
      else if (k === "arrowup" || k === "w") { e.preventDefault(); moveStep("up"); }
      else if (k === "arrowdown" || k === "s") { e.preventDefault(); moveStep("down"); }
      else if (k === "arrowleft" || k === "a") { e.preventDefault(); moveStep("left"); }
      else if (k === "arrowright" || k === "d") { e.preventDefault(); moveStep("right"); }
      else if (k === "r") { e.preventDefault(); const i = DIR8_KEYS.indexOf(facingRef.current); setFacing(DIR8_KEYS[(i + 1) % DIR8_KEYS.length]); }
      else if (k === " " || k === "enter" || k === "e") { e.preventDefault(); onA(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveStep, onA]);

  if (!dungeon || !player) return null;

  const ent = entitiesRef.current;
  // Vista ampliada: aleja la cámara en móvil para mostrar más terreno.
  const zoom = vp.w < 640 ? 0.82 : vp.w < 1000 ? 0.92 : 1;
  const camX = vp.w / 2 - zoom * (pos.x * T + T / 2);
  const camY = vp.h / 2 - zoom * (pos.y * T + T / 2);
  const gridW = dungeon.cols * T, gridH = dungeon.rows * T;

  const tileBg = (ch) => {
    if (ch === "#" || ch === " ") return { background: "linear-gradient(180deg,#b9743a,#8a5226)", boxShadow: "inset 0 4px 0 #6fb04a, inset 0 -3px 0 rgba(0,0,0,0.35)" };
    if (ch === "L") return { background: "#7a4a1a", boxShadow: "inset 0 0 0 2px #3a1a0a, inset 0 0 12px rgba(0,0,0,0.4)" };
    if (ch === "D") return { background: "#9a6a2a", boxShadow: "inset 0 0 0 2px #5a3a14" };
    return { background: "#e0d084" };
  };

  const canAct = combat.tactical && combat.turn === "player" && !combat.busy;

  return (
    <div className="atlas-ui-v3 min-h-screen relative flex flex-col" data-region={region?.id} style={{ background: "#1a1206" }}>
      <div ref={vpRef} className="relative w-full overflow-hidden" style={{ height: "100dvh" }}>
        <div className="absolute top-0 left-0" style={{ width: gridW, height: gridH, transform: `translate(${camX}px, ${camY}px) scale(${zoom})`, transformOrigin: "0 0" }}>
          {liveTiles.map((row, y) => Array.from(row).map((ch, x) => {
            const vis = revealed.has(`${x},${y}`);
            return (
            <div key={`${x}_${y}`} className="absolute" style={{ left: x * T, top: y * T, width: T, height: T, transition: "background 320ms ease, opacity 320ms ease", ...(vis ? tileBg(ch) : { background: "#0a0810", opacity: 0.55 }) }}>
              {vis && ch === "L" && <div className="flex items-center justify-center w-full h-full text-base">🔒</div>}
              {vis && ch === "D" && <div className="flex items-center justify-center w-full h-full text-lg">🚪</div>}
              {vis && ch === "S" && <div className="absolute inset-1 rounded border-2 border-emerald-400/60 bg-emerald-900/30 flex items-center justify-center text-[9px] text-emerald-200 font-bold">▼</div>}
            </div>
            );
          }))}

          <div className="absolute flex items-center justify-center" style={{ left: ent.exit.x * T, top: ent.exit.y * T, width: T, height: T }}>
            <div className="flex items-center justify-center rounded font-bold" style={{ width: T - 8, height: T - 8, background: "linear-gradient(180deg,#3b82f6,#1e3a8a)", color: "#dbeafe", boxShadow: "0 0 10px 3px rgba(59,130,246,0.5)" }}>▼</div>
          </div>

          {ent.objective && revealed.has(`${ent.objective.x},${ent.objective.y}`) && (
            <div className="absolute flex items-center justify-center animate-pulse" style={{ left: ent.objective.x * T, top: ent.objective.y * T, width: T, height: T }}>
              <span style={{ fontSize: T - 12, filter: "drop-shadow(0 0 6px rgba(94,234,212,0.7))" }}>💎</span>
            </div>
          )}

          {ent.sanctuary && revealed.has(`${ent.sanctuary.x},${ent.sanctuary.y}`) && (
            <div className="absolute flex items-center justify-center animate-pulse" style={{ left: ent.sanctuary.x * T, top: ent.sanctuary.y * T, width: T, height: T, zIndex: 6 }}>
              <div className="rounded-full border-2 border-cyan-200 bg-cyan-500/30 flex items-center justify-center" style={{ width: T - 4, height: T - 4, boxShadow: "0 0 16px 5px rgba(34,211,238,.55), inset 0 0 10px rgba(255,255,255,.35)" }}>
                <span className="text-cyan-50 text-xl">◉</span>
              </div>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-cyan-100 font-bold bg-slate-950/85 rounded px-1 whitespace-nowrap">SANTUARIO DEL UMBRAL</span>
            </div>
          )}

          {ent.chests.map((c) => {
            if (!revealed.has(`${c.x},${c.y}`)) return null;
            return (
            <div key={c.id} className="absolute flex items-center justify-center" style={{ left: c.x * T, top: c.y * T, width: T, height: T, opacity: opened.has(c.id) ? 0.35 : 1 }}>
              <span style={{ fontSize: T - 12 }}>📦</span>
            </div>
            );
          })}

          {ent.boss && !bossDefeated && revealed.has(`${ent.boss.x},${ent.boss.y}`) && (
            <div className="absolute flex items-center justify-center animate-pulse" style={{ left: ent.boss.x * T, top: ent.boss.y * T, width: T, height: T, zIndex: 5 }}>
              <div className="relative flex items-center justify-center">
                <EntitySprite type="boss" variant={ent.boss.monsterId} size={T - 2} className="drop-shadow-[0_0_8px_rgba(244,63,94,0.85)]" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] text-rose-200 font-bold bg-slate-950/85 rounded px-1 whitespace-nowrap" style={{ pointerEvents: "none" }}>MINI JEFE</span>
              </div>
            </div>
          )}

          {combat.allies.map((a) => {
            const down = a.incapacitated || a.hp <= 0;
            return (
              <div key={a.id} className={`absolute flex flex-col items-center ${combat.hurtPulses?.has(a.id) ? "atlas-dg-hurt" : ""}`} style={{ left: a.x * T, top: a.y * T, width: T, height: T, transition: "left 0.2s ease-out, top 0.2s ease-out", opacity: down ? 0.45 : 1 }}>
                <div className="flex items-center justify-center atlas-sprite-idle" style={{ width: T, height: T, filter: down ? "grayscale(1)" : "none" }}>
                  <div className="flex items-center justify-center rounded-full font-bold text-[10px] text-teal-50" style={{ width: T - 12, height: T - 12, background: "linear-gradient(180deg,#0d9488,#0f766e)", boxShadow: "0 0 8px 2px rgba(13,148,136,0.5)", border: "2px solid #5eead4" }}>{a.name ? a.name[0] : "E"}</div>
                </div>
                {combat.tactical && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-900/80 overflow-hidden z-20">
                    <div className="h-full bg-teal-300" style={{ width: `${Math.max(0, (a.hp / a.maxHp) * 100)}%` }} />
                  </div>
                )}
                {down && <span className="absolute -top-1 right-0 text-[8px] text-rose-300 bg-slate-950/80 rounded px-1">✖</span>}
              </div>
            );
          })}

          {combat.enemies.filter((e) => e.hp > 0 && revealed.has(`${e.x},${e.y}`)).map((e) => (
            <div key={e.id} className={`absolute flex flex-col items-center ${combat.hurtPulses?.has(e.id) ? "atlas-dg-hurt" : ""}`} style={{ left: e.x * T, top: e.y * T, width: T, height: T, transition: "left 0.2s ease-out, top 0.2s ease-out" }}>
              {e.alerted && combat.tactical && <div className="absolute -inset-1 rounded-md border-2 border-red-500 animate-pulse z-0" />}
              <div className="flex items-center justify-center atlas-sprite-idle relative z-10" style={{ width: T, height: T }}>
                <EntitySprite type={e.boss ? "boss" : "monster"} variant={e.monsterId} size={e.boss ? T - 2 : T - 8} className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]" />
              </div>
              {combat.tactical && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-900/80 overflow-hidden z-20">
                  <div className="h-full bg-rose-400" style={{ width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%` }} />
                </div>
              )}
            </div>
          ))}

          <div className={`absolute flex flex-col items-center justify-center ${combat.hurtPulses?.has("player") ? "atlas-dg-hurt" : ""}`} style={{ left: pos.x * T, top: pos.y * T, width: T, height: T, transition: "left 0.16s ease-out, top 0.16s ease-out" }}>
            {combat.tactical && <div className="absolute -inset-1 rounded-md border-2 border-emerald-400 z-0" />}
            <div className="atlas-shadow" />
            <canvas ref={canvasRef} width={36} height={48} style={{ imageRendering: "pixelated" }} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] relative z-10" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] text-emerald-300 font-bold bg-slate-950/80 rounded px-1.5 py-0.5 z-20" style={{ pointerEvents: "none" }}>{FACING_LABEL[facing]}</div>
          </div>

          <DungeonVfx effects={combat.effects} />
        </div>

        {enemy && (
          <div className="absolute inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4">
            <div className="w-full max-w-3xl mx-auto flex-1 min-h-0">
              <CombatView player={player} enemy={enemy} region={region} lastResult={lastResult} onAttack={onAttack} onSkill={onSkill} onItem={onItem} onEscape={onEscape} onEnemyDead={onEnemyDead} busy={combatBusy} skills={worldSkills} skillCosts={worldSkillCosts} playerStatuses={playerStatuses} />
            </div>
          </div>
        )}

        <DungeonHudV3
          dungeon={dungeon}
          player={player}
          keys={combat.keys}
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onRequestOrientation={onRequestOrientation}
          showDebug={showDebug}
          onToggleDebug={() => setShowDebug(v => !v)}
          onExit={onExit}
          onMove={onJoyMove}
          onRotate={() => { const i = DIR8_KEYS.indexOf(facing); setFacing(DIR8_KEYS[(i + 1) % DIR8_KEYS.length]); }}
          onAction={onA}
          tactical={combat.tactical}
        />

        {combat.tactical && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-rose-950/85 border border-rose-600 flex items-center gap-2">
            <Swords className="w-3.5 h-3.5 text-rose-300" />
            <span className="text-[11px] text-rose-100 font-medium">{combat.turn === "player" ? "Tu turno — mueve, gira o ataca" : "Turno de los enemigos..."}</span>
          </div>
        )}
        {combatFlash && (
          <div className="absolute inset-0 z-30 pointer-events-none atlas-dg-vfx-burst" style={{ border: "3px solid rgba(244,63,94,0.75)", boxShadow: "inset 0 0 80px rgba(244,63,94,0.35)" }} />
        )}
        {showDebug && (
          <div className="absolute top-12 left-2 z-40 rounded-lg bg-slate-950/92 border border-emerald-500/50 p-2 text-[10px] text-emerald-200 font-mono max-w-[230px] leading-tight">
            <div className="text-emerald-400 font-bold mb-0.5">DEPURACIÓN</div>
            <div>turno: {String(combat.turn)} · busy: {String(combat.busy)}</div>
            <div>tactical: {String(combat.tactical)}</div>
            <div>effects: {combat.effects?.length || 0} · enemigos: {combat.enemies?.length || 0}</div>
            <div>shake: {String(combat.shake)} · hurt: {[...(combat.hurtPulses || [])].join(",") || "—"}</div>
            {combat.debug && <div className="mt-1 text-amber-300">acción: {JSON.stringify(combat.debug.action || combat.debug)}</div>}
          </div>
        )}

        {combat.tactical && combat.log.length > 0 && (
          <div className="absolute top-24 left-2 z-20 max-w-[60%] space-y-0.5">
            {combat.log.slice(-4).map((l, i) => (
              <p key={i} className="text-[10px] text-slate-200 bg-slate-950/70 rounded px-1.5 py-0.5 leading-tight">{l}</p>
            ))}
          </div>
        )}

        {/* Minimapa */}
        <div className="absolute top-14 right-3 z-20 rounded-md bg-slate-950/88 border border-slate-600 p-1 shadow-lg" style={{ lineHeight: 0 }}>
          {liveTiles.map((row, y) => (
            <div key={y} className="flex" style={{ height: 3 }}>
              {Array.from(row).map((ch, x) => {
                let bg = "#3a2a14";
                const en = combat.enemies.find((e) => e.boss && e.x === x && e.y === y) || combat.enemies.find((e) => e.x === x && e.y === y);
                const al = combat.allies.find((a) => a.x === x && a.y === y);
                if (ch === "#" || ch === " ") bg = "#6b4220";
                else if (x === pos.x && y === pos.y) bg = "#38f838";
                else if (al) bg = "#2dd4bf";
                else if (ch === "E") bg = "#3b82f6";
                else if (ch === "S") bg = "#22c55e";
                else if (en && en.hp > 0) bg = en.alerted && combat.tactical ? "#ef4444" : "#f97316";
                else if (ch === "P") bg = "#22d3ee";
                else if (ch === "C" || ch === "O") bg = "#fbbf24";
                else if (ch === "L") bg = "#7a4a1a";
                else if (ch === "D") bg = "#9a6a2a";
                else bg = "#e8d98c";
                if (!revealed.has(`${x},${y}`)) bg = "#0a0a0a";
                return <div key={x} style={{ width: 3, height: 3, background: bg }} />;
              })}
            </div>
          ))}
        </div>

        {msg && (
          <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-[80%]" style={{ bottom: combat.tactical ? 150 : 140 }}>
            <div className="rounded-xl bg-slate-950/90 border border-amber-600/60 px-3.5 py-2 shadow-lg atlas-toast-in text-center">
              <p className="text-xs text-amber-100 leading-snug">{msg}</p>
            </div>
          </div>
        )}

        {combat.tactical && (() => {
          const typeStyle = (t) => t === "definitive" ? { bg: "rgba(251,191,36,0.22)", bd: "#fbbf24" } : t === "hybrid" ? { bg: "rgba(217,70,239,0.25)", bd: "#d946ef" } : t === "class" ? { bg: "rgba(245,158,11,0.25)", bd: "#f59e0b" } : t === "weapon" ? { bg: "rgba(56,189,248,0.2)", bd: "#38bdf8" } : { bg: "rgba(100,116,139,0.3)", bd: "#94a3b8" };
          const combatSkills = skills.filter((s) => s.type !== "basic");
          const visible = combatSkills.slice(0, 4);
          const extra = combatSkills.slice(4);
          const SkillBtn = ({ sk }) => {
            const cd = combat.cooldowns[sk.id] || 0;
            const noEnergy = sk.energyCost > 0 && (player.mp || 0) < sk.energyCost;
            const disabled = !canAct || cd > 0 || noEnergy;
            const ts = typeStyle(sk.type);
            const hints = getSkillStatusHints(sk);
            return (
              <AtlasPressButton onPress={() => combat.useSkill(sk, pos, facing, player)} disabled={disabled} haptic="uiStrong" className="relative flex flex-col items-center justify-center rounded-lg border w-[66px] h-[50px] leading-none transition active:scale-95"
                style={{ background: ts.bg, borderColor: ts.bd, color: "#f1f5f9", opacity: disabled ? 0.4 : 1 }} title={`${sk.name}${hints.length ? ` · ${hints.map(h => h.name).join(", ")}` : ""}`}>
                <span className="font-bold text-[10px] truncate max-w-[60px]">{sk.name}</span>
                <span className="text-[8px] text-slate-300 mt-0.5">{sk.range > 1 ? `Alc${sk.range} ` : ""}{sk.energyCost ? `EN ${sk.energyCost}` : "gratis"}{cd > 0 ? ` CD${cd}` : ""}</span>
                {hints.length > 0 && <span className="absolute top-0.5 right-0.5 flex gap-0.5">{hints.slice(0, 2).map(h => <span key={h.id} className="text-[10px]">{h.icon}{h.conditional && <sup className="text-[6px]">🎲</sup>}</span>)}</span>}
              </AtlasPressButton>
            );
          };
          return (
            <div className="absolute z-20 flex flex-col items-end gap-1.5" style={{ bottom: 108, right: 16 }}>
              {showMore && (
                <div className="flex flex-col gap-1.5 mb-1 p-1.5 rounded-lg bg-slate-950/85 border border-slate-700">
                  {extra.map((sk) => <SkillBtn key={sk.id} sk={sk} />)}
                  <AtlasPressButton onPress={() => combat.useItem(pos)} disabled={!canAct} className="flex items-center justify-center gap-1 rounded-lg bg-violet-700/80 border border-violet-400 px-2 py-1 text-[10px] text-white disabled:opacity-40"><FlaskRound className="w-3 h-3" /> Objeto</AtlasPressButton>
                  <AtlasPressButton onPress={() => combat.wait(pos)} disabled={!canAct} className="flex items-center justify-center gap-1 rounded-lg bg-slate-700/80 border border-slate-400 px-2 py-1 text-[10px] text-white disabled:opacity-40"><Hourglass className="w-3 h-3" /> Esperar</AtlasPressButton>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {visible.map((sk) => <SkillBtn key={sk.id} sk={sk} />)}
              </div>
              <AtlasPressButton onPress={() => setShowMore((v) => !v)} className="self-end rounded-md bg-slate-800/85 border border-slate-500 px-2 py-0.5 text-[10px] text-slate-200">{showMore ? "✕" : "Más"}</AtlasPressButton>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function facingToCardinal(f) {
  if (f.startsWith("up")) return "up";
  if (f.startsWith("down")) return "down";
  if (f.startsWith("left")) return "left";
  if (f.startsWith("right")) return "right";
  return "down";
}
