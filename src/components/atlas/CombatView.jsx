import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Rabbit, FlaskConical, Lock } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";
import EntitySprite from "./EntitySprite";
import CombatVfx from "./CombatVfx";
import { ENERGY } from "@/lib/atlasSkillDesign";
import { DICE_GROUPS } from "@/lib/atlasDiceSystem";
import { STATUS_INFO } from "@/lib/atlasEnemyAI";
import { ATLAS_STATUSES } from "@/lib/atlasStatusAtlas";
import { resolveAbilityAnimation, weaponTypeFromPlayer } from "@/lib/atlasAbilityAnimations";
import { buildCombatSequence } from "@/lib/atlasCombatDirector";
import { resolveCombatScene } from "@/lib/atlasCombatScenes";
import { atlasVibrate } from "@/lib/atlasHaptics";
import { getSkillStatusHints } from "@/lib/atlasSkillStatusHints";
import AtlasPressButton from "./AtlasPressButton";

const CLASS_ELEMENT = { Guerrero: "fisico", Mago: "arcano", "Pícaro": "sombra" };
const ENERGY_BAR_COLOR = { Guerrero: "bg-red-500", Mago: "bg-blue-500", "Pícaro": "bg-amber-500" };
const RESOURCE_ICON = { Guerrero: "🔥", Mago: "💙", "Pícaro": "🎯" };
const OFF_ICON = { Guerrero: "⚔️", Mago: "✨", "Pícaro": "🎯" };
const ELEMENT_VFX = { fisico: { color: "#fbbf24", icon: "swords" }, arcano: { color: "#c084fc", icon: "sparkles" }, sombra: { color: "#a78bfa", icon: "moon" } };
const SKILL_KEYS = ["classAbility", "hybrid", "weapon", "definitive"];
const SLOT_DICE = { basic: "basico", classAbility: "tecnica", hybrid: "fuerza", weapon: "versatil", definitive: "versatil" };

const SCENE = {
  verde: { grad: "from-green-700 via-emerald-800 to-emerald-950", ground: "from-green-900/80 to-emerald-950", decor: ["treepine", "trees", "leaf", "wind", "mountain"] },
  fria: { grad: "from-cyan-600 via-blue-800 to-blue-950", ground: "from-blue-900/80 to-slate-950", decor: ["treepine", "snowflake", "mountainsnow", "bone", "wind"] },
  desierto: { grad: "from-amber-600 via-orange-700 to-amber-950", ground: "from-amber-800/80 to-orange-950", decor: ["cactus", "mountain", "sun", "bone", "skull"] },
};

function Bar({ value, max, color }) {
  const pct = Math.max(0, (value / max) * 100);
  return (<div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden"><div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} /></div>);
}

function bannerInfo(t) {
  if (t === "CRÍTICO") return ["¡CRÍTICO!", "bg-amber-400 text-slate-900"];
  if (t === "FALLO") return ["¡Fallo!", "bg-red-600 text-white"];
  if (t === "JUSTO") return ["Impacto justo", "bg-sky-500 text-white"];
  if (t === "MAYOR") return ["Golpe mayor", "bg-orange-500 text-white"];
  if (t === "¡HABILIDAD CRÍTICA!") return ["¡HABILIDAD CRÍTICA!", "bg-amber-400 text-slate-900"];
  if (/HABILIDAD/.test(t)) return ["¡Habilidad!", "bg-fuchsia-500 text-white"];
  if (t === "OBJETO") return ["Poción", "bg-emerald-500 text-white"];
  if (t === "ENEMY_ATTACK") return ["¡Ataque enemigo!", "bg-red-600 text-white"];
  if (t === "ENEMY_ABILITY") return ["¡Habilidad enemiga!", "bg-fuchsia-600 text-white"];
  if (t === "PLAYER_PARALYZED") return ["⚡ PARALIZADO · acción perdida", "bg-fuchsia-600 text-white"];
  if (t === "PLAYER_FROZEN") return ["❄️ CONGELADO · acción perdida", "bg-cyan-600 text-white"];
  if (t === "¡Enemigo falla!") return ["¡Enemigo falla!", "bg-slate-600 text-white"];
  return [t, "bg-slate-600 text-white"];
}

function poseForAnimation(anim, player) {
  const t = anim?.animationType || "";
  if (anim?.weaponType === "bow" || t.includes("bow")) return "shoot";
  if (anim?.weaponType === "staff" && (anim?.dungeonType === "magic" || anim?.dungeonType === "projectile")) return "cast";
  if (t.includes("thrust") || anim?.impactType === "pierce" && anim?.weaponType === "sword") return "thrust";
  if (t.includes("dagger") || t.includes("multi") || t.includes("flurry") || anim?.weaponType === "dagger") return "dual";
  if (t.includes("axe") || t.includes("heavy") || t.includes("shockwave") || anim?.impactType === "blunt") return "heavy";
  if (anim?.dungeonType === "magic" || player?.class === "Mago") return "cast";
  return "slash";
}

const PLAYER_COMBAT_DIRECTION = "left";
const ENEMY_COMBAT_DIRECTION = "right";

export default function CombatView({ player, enemy, region, lastResult, busy, onAttack, onSkill, onItem, onEscape, onEnemyDead, skills, skillCosts, playerStatuses }) {
  const energy = ENERGY[player.class];
  const [action, setAction] = useState("idle");
  const [floaters, setFloaters] = useState([]);
  const [banner, setBanner] = useState(null);
  const [shake, setShake] = useState(false);
  const [vfx, setVfx] = useState(null);
  const [attackPose, setAttackPose] = useState("slash");
  const [sequenceBusy, setSequenceBusy] = useState(false);
  const [displayPlayerHp, setDisplayPlayerHp] = useState(() => Math.max(0, Number(player?.hp || 0)));
  const [displayEnemyHp, setDisplayEnemyHp] = useState(() => Math.max(0, Number(enemy?.hp || 0)));
  const [landscape, setLandscape] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(orientation: landscape) and (max-height: 640px)").matches);
  const floaterId = useRef(0);
  const arenaRef = useRef(null);
  const playerActorRef = useRef(null);
  const enemyActorRef = useRef(null);
  const [combatGeometry, setCombatGeometry] = useState({ width: 100, height: 100, gap: 64, playerAdvance: 52, enemyAdvance: 52 });
  const scene = SCENE[region.id] || SCENE.verde;
  const sceneAsset = resolveCombatScene(region.id, enemy);
  const dying = !!enemy?.dying;
  const element = CLASS_ELEMENT[player.class] || "físico";
  const energyBarColor = ENERGY_BAR_COLOR[player.class] || "bg-amber-500";
  const resourceIcon = RESOURCE_ICON[player.class] || "⚡";
  const offIcon = OFF_ICON[player.class] || "⚔️";
  const eAtkType = enemy?.basicAttackType || "fisico";
  const eAtkValue = eAtkType === "magico" ? (enemy?.magicalAttack ?? enemy?.attack ?? 0) : (enemy?.physicalAttack ?? enemy?.attack ?? 0);
  // v2.19.5: actores más grandes para ocupar la arena sin invadir el HUD.
  const actorSize = landscape ? 76 : 104;
  const enemyActorSize = landscape ? (enemy?.boss ? 98 : 76) : (enemy?.boss ? 132 : 104);

  useEffect(() => {
    const mq = window.matchMedia?.("(orientation: landscape) and (max-height: 640px)");
    if (!mq) return undefined;
    const update = () => setLandscape(mq.matches);
    update();
    try { mq.addEventListener("change", update); } catch { mq.addListener(update); }
    return () => { try { mq.removeEventListener("change", update); } catch { mq.removeListener(update); } };
  }, []);

  useEffect(() => {
    const measure = () => {
      const arena = arenaRef.current?.getBoundingClientRect?.();
      const playerRect = playerActorRef.current?.getBoundingClientRect?.();
      const enemyRect = enemyActorRef.current?.getBoundingClientRect?.();
      if (!arena || !playerRect || !enemyRect) return;
      const gap = Math.max(0, playerRect.left - enemyRect.right);
      const stopDistance = landscape ? 8 : 14;
      const advance = Math.max(24, gap - stopDistance);
      setCombatGeometry(current => {
        const next = { width: arena.width, height: arena.height, gap, playerAdvance: advance, enemyAdvance: advance };
        return Math.abs(current.width - next.width) < 0.5
          && Math.abs(current.height - next.height) < 0.5
          && Math.abs(current.gap - next.gap) < 0.5 ? current : next;
      });
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (observer) {
      if (arenaRef.current) observer.observe(arenaRef.current);
      if (playerActorRef.current) observer.observe(playerActorRef.current);
      if (enemyActorRef.current) observer.observe(enemyActorRef.current);
    }
    window.addEventListener("resize", measure);
    const frame = window.requestAnimationFrame(measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.cancelAnimationFrame(frame);
    };
  }, [landscape, player.race, player.class, enemy.id, enemy.boss]);

  const readCombatAnchors = (attackerSide = "player", targetSide = "enemy") => {
    const arena = arenaRef.current?.getBoundingClientRect?.();
    const playerRect = playerActorRef.current?.getBoundingClientRect?.();
    const enemyRect = enemyActorRef.current?.getBoundingClientRect?.();
    const width = arena?.width || combatGeometry.width || 100;
    const height = arena?.height || combatGeometry.height || 100;
    const relativePoint = (rect, side, role) => {
      if (!arena || !rect) {
        const leftSide = side === "enemy";
        return { x: width * (leftSide ? (role === "origin" ? 0.24 : 0.20) : (role === "origin" ? 0.76 : 0.80)), y: height * 0.55 };
      }
      const inward = side === "enemy" ? 0.72 : 0.28;
      const targetCenter = side === "enemy" ? 0.54 : 0.46;
      return {
        x: rect.left - arena.left + rect.width * (role === "origin" ? inward : targetCenter),
        y: rect.top - arena.top + rect.height * (role === "origin" ? 0.48 : 0.50),
      };
    };
    const rects = { player: playerRect, enemy: enemyRect };
    return {
      origin: relativePoint(rects[attackerSide], attackerSide, "origin"),
      target: relativePoint(rects[targetSide], targetSide, "target"),
      arenaSize: { width, height },
    };
  };

  const playerHit = action === "playerAtk" || action === "playerSkill";
  const playerMiss = action === "playerMiss";
  const enemyHit = action === "enemyAtk";
  const enemyMiss = action === "enemyMiss";
  const playerPose = playerHit ? attackPose : playerMiss ? "miss" : enemyHit ? "hurt" : action === "victory" ? "victory" : "idle";
  const enemyPose = dying ? "defeat" : playerHit ? "hurt" : enemyHit ? "attack" : enemyMiss ? "miss" : "idle";
  const playerAdvance = Math.max(24, combatGeometry.playerAdvance || 52);
  const enemyAdvance = Math.max(24, combatGeometry.enemyAdvance || 52);
  const rangedPose = attackPose === "shoot" || attackPose === "cast";
  const playerMotion = action === "playerAtk"
    ? (rangedPose ? { x: [0, 5, 0] }
      : attackPose === "heavy"
        ? { x: [0, -playerAdvance * 0.28, -playerAdvance * 0.62, -playerAdvance, -playerAdvance * 0.95, 0], y: [0, 0, -7, -2, 0, 0] }
        : { x: [0, -playerAdvance * 0.24, -playerAdvance * 0.52, -playerAdvance * 0.78, -playerAdvance, -playerAdvance * 0.96, 0] })
    : action === "playerSkill"
      ? (rangedPose ? { x: [0, 5, 0] } : { x: [0, -playerAdvance * 0.24, -playerAdvance * 0.52, -playerAdvance * 0.78, -playerAdvance, -playerAdvance * 0.96, 0] })
      : action === "playerMiss" ? { x: [0, -playerAdvance * 0.32, -playerAdvance * 0.70, -playerAdvance * 0.82, -playerAdvance * 0.58, 0], y: [0, 0, -2, 0, 3, 0], rotate: [0, -2, -5, 8, 3, 0] }
      : action === "enemyAtk" ? { x: [0, 8, 13, 0] }
      : action === "victory" ? { scaleY: [1, 1.035, 1], scaleX: [1, 0.985, 1] } : { x: 0, y: 0 };
  const enemyMotion = dying ? { opacity: 0, scale: 0.7, y: 8, rotate: 8 }
    : action === "enemyAtk" ? { x: [0, enemyAdvance * 0.24, enemyAdvance * 0.52, enemyAdvance * 0.78, enemyAdvance, enemyAdvance * 0.96, 0] }
    : action === "enemyMiss" ? { x: [0, enemyAdvance * 0.32, enemyAdvance * 0.70, enemyAdvance * 0.82, enemyAdvance * 0.58, 0], y: [0, 0, -2, 0, 3, 0], rotate: [0, 2, 5, -8, -3, 0] }
    : playerHit ? { x: [0, -8, -13, 0], scale: [1, 0.97, 1.035, 1] }
    : { x: 0 };
  const playerStepping = ["playerAtk", "playerSkill", "playerMiss"].includes(action) && !rangedPose;
  const enemyStepping = ["enemyAtk", "enemyMiss"].includes(action);
  const groundedIdle = { scaleX: [1, 1.006, 1], scaleY: [1, 0.994, 1] };
  const playerBodyMotion = playerStepping
    ? { rotate: [0, -1.8, 1.8, -1.2, 1.2, 0], scaleX: [1, 0.985, 1.018, 0.987, 1.014, 1], scaleY: [1, 1.018, 0.982, 1.014, 0.986, 1] }
    : groundedIdle;
  const enemyBodyMotion = enemyStepping
    ? { rotate: [0, 1.8, -1.8, 1.2, -1.2, 0], scaleX: [1, 0.985, 1.018, 0.987, 1.014, 1], scaleY: [1, 1.018, 0.982, 1.014, 0.986, 1] }
    : groundedIdle;

  const decorElems = useMemo(() => (
    sceneAsset ? [] : Array.from({ length: 8 }).map((_, i) => ({ id: i, left: Math.random() * 100, top: Math.random() * 55, icon: scene.decor[Math.floor(Math.random() * scene.decor.length)], size: 22 + Math.random() * 26, opacity: 0.2 + Math.random() * 0.25 }))
  ), [region.id, sceneAsset?.id]);

  useEffect(() => {
    if (!lastResult?.actionId || dying) return undefined;
    const timers = [];
    const later = (fn, ms) => { const t = window.setTimeout(fn, Math.max(0, ms)); timers.push(t); };
    const actionToken = lastResult.actionId;
    const type = lastResult.type || "";
    const actionAnchors = {
      playerToEnemy: readCombatAnchors("player", "enemy"),
      enemyToPlayer: readCombatAnchors("enemy", "player"),
    };
    const actionVfx = (payload, attackerSide = "player", targetSide = "enemy") => ({
      ...payload,
      attackerSide,
      targetSide,
      ...(attackerSide === "enemy" ? actionAnchors.enemyToPlayer : actionAnchors.playerToEnemy),
    });
    const enemyDamage = Math.max(0, Number(lastResult.enemyDamage || 0));
    const rawEnemyDamage = Math.max(0, Number(lastResult.resolution?.rawDamage ?? lastResult.rawEnemyDamage ?? enemyDamage));
    const shieldDamage = Math.max(0, Number(lastResult.resolution?.shieldDamage ?? lastResult.shieldDamage ?? 0));
    const playerDamage = Math.max(0, Number(lastResult.playerDamage || 0));
    const beforePlayerHp = Math.max(0, Number(lastResult.before?.player?.hp ?? player.hp ?? 0));
    const afterPlayerHp = Math.max(0, Number(lastResult.after?.player?.hp ?? Math.max(0, beforePlayerHp - playerDamage)));
    const beforeEnemyHp = Math.max(0, Number(lastResult.before?.enemy?.hp ?? enemy.hp ?? 0));
    const afterEnemyHp = Math.max(0, Number(lastResult.after?.enemy?.hp ?? Math.max(0, beforeEnemyHp - enemyDamage)));
    const isEnemyResult = type === "ENEMY_ATTACK" || type === "ENEMY_ABILITY";
    const landedDamage = isEnemyResult ? playerDamage : rawEnemyDamage;
    const isMiss = type === "FALLO" || type === "MISS" || type === "FALLO_CRÍTICO" || landedDamage <= 0;

    const addFloater = (side, value, extra = {}) => {
      if (value <= 0) return;
      const floaterKey = ++floaterId.current;
      const anchors = readCombatAnchors(side === "enemy" ? "player" : "enemy", side);
      setFloaters(current => [...current, { id: floaterKey, actionToken, side, value, x: anchors.target.x, y: anchors.target.y, ...extra }]);
    };

    let duration = 720;
    setSequenceBusy(true);
    setDisplayPlayerHp(beforePlayerHp);
    setDisplayEnemyHp(beforeEnemyHp);

    if (lastResult.item === "potion") {
      duration = 620;
      const healAmount = Math.max(0, Number(lastResult.healAmount ?? afterPlayerHp - beforePlayerHp));
      later(() => {
        addFloater("player", healAmount, { heal: true });
        setDisplayPlayerHp(afterPlayerHp);
      }, 120);
      setAction("idle");
    } else if (type === "PLAYER_PARALYZED" || type === "PLAYER_FROZEN") {
      duration = 560;
      setAction("idle");
      const frozen = type === "PLAYER_FROZEN";
      setVfx(actionVfx({ id: `${actionToken}:blocked`, type: frozen ? "ice" : "lightning", element: frozen ? "hielo" : "electrico", hitCount: 1, quality: "high" }, "enemy", "player"));
      later(() => atlasVibrate("paralyzed", { force: true }), 90);
      later(() => setVfx(null), 430);
    } else if (!isEnemyResult) {
      const skill = lastResult.skill ? (skills?.[lastResult.skill] || {}) : (skills?.basic || { name: "Espadazo" });
      const sequence = lastResult.animationSequence || buildCombatSequence({
        skill,
        className: player.class,
        weaponType: weaponTypeFromPlayer(player),
        element: lastResult.element || element,
        diceGroup: lastResult.diceGroup || (lastResult.skill ? SLOT_DICE[lastResult.skill] : "basico"),
        rollTotal: lastResult.rollTotal,
        qualityId: lastResult.qualityId || (isMiss ? "fallo_critico" : /CRÍTICA|CRÍTICO/.test(type) ? "critico" : "medio"),
        totalDamage: enemyDamage,
        landed: rawEnemyDamage > 0,
        playerDamage,
        counter: !!lastResult.counter,
        statusId: lastResult.statusId || null,
        kind: lastResult.skill || "basic",
      });
      const anim = sequence.animation || resolveAbilityAnimation(skill, { class: player.class, weaponType: weaponTypeFromPlayer(player), element: lastResult.element || element });
      const pose = poseForAnimation(anim, player);
      const el = lastResult.element || anim.element || element;
      duration = Math.max(620, Number(sequence.totalDuration || anim.duration + 180));
      setAttackPose(pose);

      if (sequence.visualQuality === "miss" || isMiss) {
        setAction("playerMiss");
        setVfx(null);
        const counterEvent = sequence.events?.find(event => event.type === "COUNTER_HIT");
        if (playerDamage > 0) {
          later(() => {
            setAction("enemyAtk");
            setVfx(actionVfx({ id: `${actionToken}:counter`, type: "impact", element: lastResult.counterElement || "fisico", hitCount: 1, quality: "high" }, "enemy", "player"));
            addFloater("player", playerDamage, { crit: !!lastResult.crit });
            setDisplayPlayerHp(afterPlayerHp);
            atlasVibrate(lastResult.crit ? "critical" : "hit", { force: true });
            setShake(true);
            later(() => setShake(false), 330);
          }, counterEvent?.at || 470);
        }
      } else {
        setAction(lastResult.skill ? "playerSkill" : "playerAtk");
        const hits = sequence.hits?.length
          ? sequence.hits
          : [{ at: 260, damage: enemyDamage, crit: /CRÍTICA|CRÍTICO/.test(type), final: true }];
        const firstImpact = hits[0]?.at || 260;
        const finalImpact = hits[hits.length - 1]?.at || firstImpact;

        if (hits.length === 1) {
          later(() => {
            setVfx(actionVfx({
              id: `${actionToken}:hit:0`, type: anim.classicType, element: el,
              crit: !!hits[0].crit, hitCount: 1, quality: sequence.visualQuality || "normal",
            }, "player", "enemy"));
          }, Math.max(0, firstImpact - 140));
        } else {
          hits.forEach((hit, index) => {
            later(() => {
              setVfx(actionVfx({
                id: `${actionToken}:hit:${index}`, type: anim.classicType, element: el,
                crit: !!hit.crit, hitCount: 1, quality: hit.final ? (sequence.visualQuality || "normal") : "normal",
              }, "player", "enemy"));
            }, Math.max(0, hit.at - 70));
          });
        }

        if (shieldDamage > 0) {
          later(() => addFloater("enemy", shieldDamage, { shield: true }), firstImpact);
        }
        hits.forEach(hit => {
          later(() => {
            addFloater("enemy", Number(hit.damage || 0), { crit: !!hit.crit, element: el });
            if (Number(hit.damage || 0) > 0) atlasVibrate(hit.crit ? "critical" : (hit.final ? "heavy" : "hit"), { force: !!hit.crit });
            if (Number(hit.damage || 0) > 0) {
              setDisplayEnemyHp(current => Math.max(afterEnemyHp, current - Number(hit.damage || 0)));
            }
            if (hit.final && ((sequence.camera?.shake || anim.cameraEffect?.shake || 0) > 0.35 || hit.crit)) {
              setShake(true);
              later(() => setShake(false), hit.crit ? 460 : 330);
            }
          }, hit.at);
        });
        if (lastResult.statusId) later(() => atlasVibrate("status"), finalImpact + 70);
        later(() => setVfx(null), Math.min(duration - 80, finalImpact + Math.max(260, anim.duration || 360)));
      }
    } else {
      duration = lastResult.crit ? 860 : 720;
      const enemyLanded = playerDamage > 0;
      setAction(enemyLanded ? "enemyAtk" : "enemyMiss");
      if (enemyLanded) {
        const el = lastResult.element || "fisico";
        setVfx(actionVfx({ id: `${actionToken}:enemy`, type: lastResult.vfxType || "impact", element: el, crit: !!lastResult.crit, hitCount: 1, quality: lastResult.crit ? "exceptional" : "normal" }, "enemy", "player"));
        later(() => {
          addFloater("player", playerDamage, { crit: !!lastResult.crit, element: el });
          atlasVibrate(lastResult.crit ? "critical" : "heavy", { force: !!lastResult.crit });
          setDisplayPlayerHp(afterPlayerHp);
        }, 240);
        setShake(true);
        later(() => setShake(false), lastResult.crit ? 450 : 280);
      } else setVfx(null);
    }

    const bText = type === "ENEMY_ATTACK" ? (playerDamage > 0 ? "¡Ataque enemigo!" : "¡Enemigo falla!")
      : type === "ENEMY_ABILITY" ? (lastResult.enemySkill || "Habilidad enemiga") : type;
    setBanner({ text: bText, id: actionToken });
    later(() => setAction("idle"), duration);
    later(() => setVfx(null), duration);
    later(() => setFloaters(current => current.filter(item => item.actionToken !== actionToken)), duration + 480);
    later(() => setBanner(null), Math.min(1200, duration));
    later(() => {
      setDisplayPlayerHp(afterPlayerHp);
      setDisplayEnemyHp(afterEnemyHp);
    }, duration + 20);
    later(() => setSequenceBusy(false), duration + 40);

    return () => {
      timers.forEach(window.clearTimeout);
      setSequenceBusy(false);
    };
  }, [lastResult?.actionId]);

  useEffect(() => {
    if (!busy && !sequenceBusy) setDisplayPlayerHp(Math.max(0, Number(player.hp || 0)));
  }, [player.hp, busy, sequenceBusy]);

  useEffect(() => {
    if (!busy && !sequenceBusy) setDisplayEnemyHp(Math.max(0, Number(enemy.hp || 0)));
  }, [enemy.hp, busy, sequenceBusy]);

  useEffect(() => {
    if (dying) { setAction("victory"); const t = setTimeout(() => onEnemyDead?.(), 800); return () => clearTimeout(t); }
  }, [dying]);

  const [bannerLabel, bannerColor] = banner ? bannerInfo(banner.text) : ["", ""];
  const potions = player.potions || 0;
  const hpFull = player.hp >= player.maxHp;
  const controlsLocked = busy || sequenceBusy;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className={`atlas-combat-view relative rounded-2xl overflow-hidden border border-red-900/40 flex flex-col h-full ${landscape ? "atlas-combat-landscape" : ""}`} style={{ minHeight: landscape ? 0 : 460 }}>
      <div className={`absolute inset-0 bg-gradient-to-b ${scene.grad}`} style={{ opacity: sceneAsset ? 0.22 : 1 }} />
      <div className="absolute inset-0 pointer-events-none">{decorElems.map(d => (<span key={d.id} className="absolute" style={{ left: `${d.left}%`, top: `${d.top}%`, opacity: d.opacity }}><GIcon name={d.icon} size={d.size} /></span>))}</div>
      <div className={`absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t ${scene.ground}`} style={{ opacity: sceneAsset ? 0.18 : 1 }} />

      <div className={`atlas-combat-scene relative flex-1 overflow-hidden ${landscape ? "min-h-0" : "min-h-[260px]"}`}>
        {sceneAsset && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-no-repeat"
              data-atlas-combat-scene={sceneAsset.id}
              style={{
                backgroundImage: `url(${sceneAsset.path})`,
                backgroundPosition: landscape ? sceneAsset.positionLandscape : sceneAsset.position,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/5 to-slate-950/35" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/30 to-transparent" />
          </>
        )}
        <motion.div animate={shake ? { x: [0, -5, 5, -4, 0], y: [0, 2, -2, 0] } : { x: 0, y: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
          <div className={`atlas-combat-stats relative z-10 grid grid-cols-2 ${landscape ? "p-2 gap-3" : "p-4 gap-6"}`}>
            <div className="order-2 text-right">
              <div className="flex items-center gap-2 mb-1.5 justify-end"><EntitySprite type="player" cls={player.class} race={player.race} dir={PLAYER_COMBAT_DIRECTION} size={20} combatMode /><span className="text-xs font-medium text-white truncate">{player.race} {player.class}</span></div>
              <div className="text-[11px] text-white/85 mb-0.5">❤️ <span className="font-mono text-white">{displayPlayerHp}/{player.maxHp}</span></div>
              <Bar value={displayPlayerHp} max={player.maxHp} color="bg-emerald-500" />
              <div className="mt-1 text-[11px] text-white/85 mb-0.5">{resourceIcon} {energy?.name || "Energía"} <span className="font-mono text-white">{player.mp || 0}/{player.maxMp || 0}</span></div>
              <div><Bar value={player.mp || 0} max={player.maxMp || 1} color={energyBarColor} /></div>
              <div className="mt-1.5 text-[11px] text-white/85 flex items-center gap-2.5 justify-end"><span>{offIcon} <span className="font-mono text-white">{player.attack}</span></span><span>🛡️ <span className="font-mono text-white">{player.physicalDefense ?? player.defense}</span></span><span>🔷 <span className="font-mono text-white">{player.magicalDefense ?? player.defense}</span></span></div>
              {playerStatuses && Object.keys(playerStatuses).length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap justify-end">
                  {Object.entries(playerStatuses).map(([type, s]) => {
                    const info = STATUS_INFO[type]; if (!info) return null;
                    return (<span key={type} className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full border" style={{ color: info.color, borderColor: info.color + "66", background: info.color + "11" }}><GIcon name={info.icon} size={10} /> {info.name} ({s.duration})</span>);
                  })}
                </div>
              )}
            </div>
            <div className="order-1 text-left">
              <div className="flex items-center gap-2 mb-1.5"><EntitySprite type={enemy.boss ? "boss" : "monster"} variant={enemy.id} dir={ENEMY_COMBAT_DIRECTION} size={20} combatMode /><span className="text-xs font-medium text-white truncate">{enemy.name}{enemy.level ? ` · Nv ${enemy.level}` : ""}</span></div>
              <div className="text-[11px] text-white/85 mb-0.5">❤️ <span className="font-mono text-white">{displayEnemyHp}/{enemy.maxHp}</span></div>
              <Bar value={displayEnemyHp} max={enemy.maxHp} color="bg-red-500" />
              <div className="mt-1.5 text-[11px] text-white/85 flex items-center gap-2.5"><span>{eAtkType === "magico" ? "✨" : "⚔️"} <span className="font-mono text-white">{eAtkValue}</span></span><span>🛡️ <span className="font-mono text-white">{enemy.physicalDefense ?? enemy.defense}</span></span><span>🔷 <span className="font-mono text-white">{enemy.magicalDefense ?? enemy.defense}</span></span></div>
              {enemy.statuses && Object.keys(enemy.statuses).length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {Object.entries(enemy.statuses).map(([type, s]) => {
                    const info = ATLAS_STATUSES[type]; if (!info) return null;
                    return (<span key={type} className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/20 bg-slate-950/55 text-white">{info.icon} {info.name} ({s.duration})</span>);
                  })}
                </div>
              )}
            </div>
          </div>
          <div ref={arenaRef} className={`atlas-combat-actors relative z-10 flex justify-between items-end ${landscape ? "px-8 pb-1" : "px-6 sm:px-12 pb-4"}`} style={{ minHeight: landscape ? 126 : 238 }}>
            <motion.div ref={playerActorRef} className="order-2 relative atlas-combat-grounded-actor" animate={playerMotion} transition={action === "victory" ? { repeat: Infinity, duration: 0.9, ease: "easeInOut" } : { duration: action === "playerSkill" ? 0.78 : 0.66, ease: "easeInOut" }} style={{ transformOrigin: "bottom center" }}>
              <motion.span
                className="absolute left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-slate-950/55 blur-[2px]"
                style={{ bottom: -2, transformOrigin: "center" }}
                animate={playerStepping ? { scaleX: [1.08, 0.90, 1.08, 0.90, 1.08], opacity: [0.56, 0.38, 0.56, 0.38, 0.56] } : { scaleX: 1, opacity: 0.50 }}
                transition={playerStepping ? { duration: 0.42, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
              />
              <motion.div animate={dying ? {} : playerBodyMotion} transition={playerStepping ? { duration: 0.42, repeat: Infinity, ease: "linear" } : { repeat: Infinity, duration: 2.8, ease: "easeInOut" }} className="relative flex flex-col items-center" style={{ transformOrigin: "bottom center" }}>
                <EntitySprite type="player" cls={player.class} race={player.race} dir={PLAYER_COMBAT_DIRECTION} size={actorSize} combatMode pose={playerPose} hurt={action === "enemyAtk"} className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.68)]" />
              </motion.div>
            </motion.div>
            <motion.div ref={enemyActorRef} animate={enemyMotion} transition={{ duration: dying ? 0.7 : 0.66, ease: "easeInOut" }} className="order-1 relative atlas-combat-grounded-actor" style={{ transformOrigin: "bottom center" }}>
              <motion.span
                className={`absolute left-1/2 -translate-x-1/2 ${enemy.boss ? "w-32" : "w-24"} h-4 rounded-full bg-slate-950/55 blur-[2px]`}
                style={{ bottom: -2, transformOrigin: "center" }}
                animate={enemyStepping ? { scaleX: [1.08, 0.90, 1.08, 0.90, 1.08], opacity: [0.56, 0.38, 0.56, 0.38, 0.56] } : { scaleX: 1, opacity: 0.50 }}
                transition={enemyStepping ? { duration: 0.42, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
              />
              <motion.div animate={dying ? {} : enemyBodyMotion} transition={enemyStepping ? { duration: 0.42, repeat: Infinity, ease: "linear" } : { repeat: Infinity, duration: 2.8, ease: "easeInOut" }} className="relative flex flex-col items-center" style={{ transformOrigin: "bottom center" }}>
                <EntitySprite type={enemy.boss ? "boss" : "monster"} variant={enemy.id} dir={ENEMY_COMBAT_DIRECTION} size={enemyActorSize} combatMode pose={enemyPose} hurt={playerHit && !dying} className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.68)]" />
              </motion.div>
              {dying && (<div className="absolute inset-0 flex items-center justify-center pointer-events-none">{["wind", "sparkles", "flame"].map((p, i) => (<motion.span key={i} initial={{ opacity: 1, scale: 0.4 }} animate={{ opacity: 0, scale: 1.6, y: i === 0 ? 20 : i === 1 ? -20 : 0, x: i === 2 ? 20 : 0 }} transition={{ duration: 0.7 }} className="absolute"><GIcon name={p} size={28} /></motion.span>))}</div>)}
            </motion.div>
            {vfx && !dying && (
              <CombatVfx
                key={vfx.id}
                type={vfx.type}
                element={vfx.element}
                crit={vfx.crit}
                hitCount={vfx.hitCount || 1}
                quality={vfx.quality || "normal"}
                origin={vfx.origin}
                target={vfx.target}
                arenaSize={vfx.arenaSize}
              />
            )}
            {floaters.map(f => (
              <motion.span key={f.id} initial={{ y: 0, opacity: 1, scale: f.crit ? 1.8 : 1.2 }} animate={{ y: -70, opacity: 0, scale: f.crit ? 2.3 : 1.4 }} transition={{ duration: 0.9, ease: "easeOut" }} className={`absolute z-30 font-bold drop-shadow ${f.heal ? "text-emerald-300 text-3xl" : f.shield ? "text-sky-300 text-3xl" : f.crit ? "text-amber-300 text-4xl" : "text-3xl"}`} style={{ left: Number.isFinite(f.x) ? f.x : (f.side === "enemy" ? "16%" : "70%"), top: Number.isFinite(f.y) ? f.y : "46%", color: f.element ? ELEMENT_VFX[f.element]?.color : undefined }}>{f.heal ? "+" : f.shield ? "🛡−" : (f.crit ? "★" : "-")}{f.value}</motion.span>
            ))}
          </div>
          <AnimatePresence>
            {banner && !dying && (<motion.div key={banner.id} initial={{ opacity: 0, y: -10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={`absolute z-20 left-1/2 -translate-x-1/2 top-1/3 px-4 py-1.5 rounded-full text-sm font-bold ${bannerColor}`}>{bannerLabel}</motion.div>)}
          </AnimatePresence>
        </motion.div>
        {enemy.skill && !dying && !landscape && (<div className="absolute z-20 bottom-2 left-3 sm:left-6 max-w-[220px]"><div className="text-[10px] text-red-100 bg-red-950/80 border border-red-700/50 rounded-lg px-2.5 py-1.5 text-center leading-snug shadow-lg">{enemy.skill}</div></div>)}
      </div>

      <div className={`atlas-combat-actions relative z-10 bg-slate-950/85 border-t border-slate-800/80 backdrop-blur ${landscape ? "p-1.5" : "p-3"}`}>
        <div className={`grid gap-2 ${landscape ? "grid-cols-6" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"}`}>
          <AtlasPressButton onPress={onAttack} disabled={controlsLocked || dying} haptic="uiStrong" className="flex items-center gap-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 disabled:opacity-40 border border-red-400/30 px-2 py-1.5 transition text-left">
            <Swords className="w-4 h-4 text-white shrink-0" />
            <div className="min-w-0 flex-1 leading-tight"><span className="block text-[10px] font-medium text-white truncate">{skills?.basic?.name || "Atacar"}</span><span className="block text-[9px] text-white/70 font-mono">{DICE_GROUPS.basico?.label || ""} · 0</span></div>
          </AtlasPressButton>
          {SKILL_KEYS.map(k => {
            const sk = skills?.[k]; if (!sk) return null;
            const cost = sk.cost; const unlocked = player.level >= sk.unlock; const enoughMp = (player.mp || 0) >= cost;
            const usable = unlocked && enoughMp && !controlsLocked && !dying;
            const el = CLASS_ELEMENT[player.class] || "físico";
            const elVfx = ELEMENT_VFX[el] || ELEMENT_VFX.fisico;
            const dgKey = sk.diceGroup || SLOT_DICE[k];
            const dg = dgKey ? DICE_GROUPS[dgKey] : null;
            const statusHints = getSkillStatusHints(sk);
            return (
              <AtlasPressButton key={k} onPress={() => onSkill(k)} disabled={!usable} haptic="uiStrong" title={`${sk.name}: ${sk.desc || ""}`} className={`relative flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition text-left ${usable ? "bg-fuchsia-600/80 hover:bg-fuchsia-500 border-fuchsia-400/40" : "bg-slate-900/70 border-slate-700/60 opacity-60 cursor-not-allowed"}`}>
                <GIcon name={elVfx.icon} size={15} style={{ color: elVfx.color }} className="shrink-0" />
                {!unlocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                <div className="min-w-0 flex-1 leading-tight pr-6">
                  <span className="block text-[10px] font-medium text-white truncate">{sk.name}</span>
                  {unlocked ? (<span className="block text-[9px] font-mono"><span className="text-amber-300">{cost}{energy?.short || "MP"}</span>{dg && <span className="text-slate-400"> · {dg.label}</span>}{!enoughMp && <span className="text-red-400"> · sin energía</span>}</span>) : (<span className="block text-[9px] text-slate-500">Bloq. Nv {sk.unlock}</span>)}
                </div>
                {statusHints.length > 0 && <span className="absolute top-1 right-1 flex gap-0.5" aria-label={statusHints.map(h => h.name).join(", ")}>{statusHints.slice(0, 3).map(h => <span key={h.id} title={`${h.name}${h.conditional ? " · depende de la tirada" : ""}${h.random ? " · aleatorio" : ""}`} className="text-[12px] leading-none">{h.icon}{h.conditional && <sup className="text-[7px] text-amber-200">🎲</sup>}</span>)}</span>}
              </AtlasPressButton>
            );
          })}
          <AtlasPressButton onPress={onItem} disabled={potions <= 0 || hpFull || controlsLocked || dying} className="flex items-center gap-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-40 border border-emerald-400/30 px-2 py-1.5 transition text-left">
            <FlaskConical className="w-4 h-4 text-white shrink-0" />
            <div className="min-w-0 flex-1 leading-tight"><span className="block text-[10px] font-medium text-white truncate">Poción</span><span className="block text-[9px] text-white/70 font-mono">{hpFull ? "Lleno" : `x${potions} usar`}</span></div>
          </AtlasPressButton>
        </div>
        <AtlasPressButton onPress={onEscape} disabled={controlsLocked || dying || enemy.boss} className={`w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 transition ${landscape ? "mt-1 py-1" : "mt-2 py-2"}`}>
          <Rabbit className="w-3.5 h-3.5" /> {enemy.boss ? "No puedes huir de un jefe" : "Escapar"}
        </AtlasPressButton>
      </div>
    </motion.div>
  );
}