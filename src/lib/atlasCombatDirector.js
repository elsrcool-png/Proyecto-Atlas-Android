// PROYECTO ATLAS — Director temporal del combate dinámico.
// Convierte resultado, calidad y habilidad en una secuencia visual reproducible.
// La lógica de daño sigue perteneciendo al motor; este archivo decide ritmo,
// cantidad de impactos visibles, pausas, cámara y momento de cada reacción.

import { resolveAbilityAnimation } from "@/lib/atlasAbilityAnimations";

export const COMBAT_SEQUENCE_VERSION = 1;

export const ANIMATION_QUALITY = {
  fallo_critico: { id: "miss", label: "Fallo", intensity: 0.45 },
  bajo: { id: "low", label: "Bajo", intensity: 0.7 },
  medio: { id: "normal", label: "Normal", intensity: 1 },
  alto: { id: "high", label: "Alto", intensity: 1.2 },
  critico: { id: "exceptional", label: "Excepcional", intensity: 1.45 },
};

const PROFILE = {
  "Corte Múltiple": { hits: [2, 2, 3, 4, 4], growth: 0.10, interval: 150, windup: 170 },
  "Estocada Sombría": { hits: [0, 2, 2, 3, 3], growth: 0.06, interval: 145, windup: 210, finalCritFrom: "alto" },
  "Estocada Salvaje": { hits: [0, 3, 3, 4, 4], growth: 0.08, interval: 135, windup: 170 },
  "Castigo Nocturno": { hits: [0, 2, 3, 4, 4], growth: 0.07, interval: 125, windup: 230, finalCritFrom: "alto" },
  "Danza Final del Bosque": { hits: [0, 4, 5, 6, 7], growth: 0.08, interval: 105, windup: 260 },
  "Mil Cortes del Crepúsculo": { hits: [0, 5, 6, 7, 8], growth: 0.04, interval: 90, windup: 280 },
  "Torbellino": { hits: [0, 2, 3, 3, 4], growth: 0.05, interval: 130, windup: 190 },
  "Danza de Cuchillas": { hits: [0, 2, 3, 3, 4], growth: 0.06, interval: 120, windup: 170 },
  "Danza del Brote": { hits: [0, 2, 3, 3, 4], growth: 0.06, interval: 120, windup: 190 },
  "Aniquilación Mecánica": { hits: [0, 3, 4, 5, 6], growth: 0.05, interval: 120, windup: 260 },
};

const QUALITY_INDEX = { fallo_critico: 0, bajo: 1, medio: 2, alto: 3, critico: 4 };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function animationQualityFor(qualityId) {
  return ANIMATION_QUALITY[qualityId] || ANIMATION_QUALITY.medio;
}

export function hitCountForSkill(skill, qualityId) {
  const name = skill?.name || "";
  const profile = PROFILE[name];
  const index = QUALITY_INDEX[qualityId] ?? 2;
  if (profile?.hits) return Math.max(0, profile.hits[index] ?? 1);
  const declared = Number(skill?.effect?.hits || skill?.hits || 1);
  return Math.max(1, Math.round(declared));
}

// Reparte un daño entero entre impactos preservando exactamente el total.
// growth > 0 hace que cada golpe pese un poco más que el anterior.
export function splitCombatDamage(totalDamage, hitCount, growth = 0) {
  const total = Math.max(0, Math.round(Number(totalDamage) || 0));
  const count = Math.max(1, Math.round(Number(hitCount) || 1));
  if (total <= 0) return Array.from({ length: count }, () => 0);

  const weights = Array.from({ length: count }, (_, index) => 1 + growth * index);
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  const raw = weights.map(weight => (total * weight) / weightTotal);
  const parts = raw.map(value => Math.floor(value));
  let remainder = total - parts.reduce((sum, value) => sum + value, 0);

  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || b.index - a.index);

  for (let i = 0; i < remainder; i += 1) parts[order[i % order.length].index] += 1;
  return parts;
}

function missSequence({ animation, skillName, counter, playerDamage, qualityId, diceGroup, rollTotal }) {
  const hasCounter = !!counter && Number(playerDamage || 0) > 0;
  const totalDuration = hasCounter ? 980 : 640;
  return {
    version: COMBAT_SEQUENCE_VERSION,
    skillName,
    qualityId,
    visualQuality: "miss",
    diceGroup,
    rollTotal,
    totalDuration,
    enemyTurnDelay: totalDuration + 120,
    hitCount: 0,
    hits: [],
    statusAt: null,
    animation,
    camera: { shake: hasCounter ? 0.45 : 0.12, zoom: 0, hitstop: 0 },
    events: [
      { at: 0, type: "LOCK_CONTROLS" },
      { at: 80, type: "ATTACK_START" },
      { at: 330, type: "MISS_REACTION" },
      ...(hasCounter ? [{ at: 470, type: "COUNTER_HIT", damage: Number(playerDamage || 0) }] : []),
      { at: totalDuration - 150, type: "RETURN_ATTACKER" },
      { at: totalDuration, type: "UNLOCK_CONTROLS" },
    ],
  };
}

/**
 * @param {any} options
 */
export function buildCombatSequence(options = {}) {
  const {
    skill,
    className,
    weaponType,
    element,
    diceGroup = "basico",
    rollTotal = null,
    qualityId = "medio",
    totalDamage = 0,
    playerDamage = 0,
    counter = false,
    statusId = null,
    kind = "basic",
    landed = null,
  } = options;
  const skillName = skill?.name || (kind === "basic" ? "Ataque" : "Habilidad");
  const animation = resolveAbilityAnimation(skill || { name: skillName }, {
    class: className,
    weaponType,
    element,
  });

  const didLand = landed == null ? Number(totalDamage || 0) > 0 : !!landed;
  if (qualityId === "fallo_critico" || !didLand) {
    return missSequence({ animation, skillName, counter, playerDamage, qualityId, diceGroup, rollTotal });
  }

  const visual = animationQualityFor(qualityId);
  const profile = PROFILE[skillName] || {};
  const hitCount = hitCountForSkill(skill, qualityId);
  const windup = Math.max(100, profile.windup || (animation.dungeonType === "projectile" ? 220 : animation.dungeonType === "magic" ? 250 : 150));
  const interval = Math.max(80, profile.interval || (hitCount > 1 ? 140 : 0));
  const growth = Number(profile.growth || 0);
  const damageParts = splitCombatDamage(totalDamage, hitCount, growth);
  const firstImpact = windup + (animation.dungeonType === "projectile" ? 190 : animation.dungeonType === "magic" ? 150 : 120);
  const hitstopBase = Number(animation.cameraEffect?.hitstop || 0);
  const hitstop = Math.round(clamp(hitstopBase + (qualityId === "critico" ? 45 : qualityId === "alto" ? 20 : 0), 0, 130));

  const hits = damageParts.map((damage, index) => ({
    index,
    at: firstImpact + interval * index,
    damage,
    final: index === damageParts.length - 1,
    crit: qualityId === "critico" || (profile.finalCritFrom === "alto" && index === damageParts.length - 1 && ["alto", "critico"].includes(qualityId)),
    hitstop: index === damageParts.length - 1 ? hitstop : Math.round(hitstop * 0.45),
  }));

  const lastImpact = hits[hits.length - 1]?.at || firstImpact;
  const returnAt = lastImpact + Math.max(180, Number(animation.duration || 360) * 0.38);
  const totalDuration = Math.max(returnAt + 180, Number(animation.duration || 360) + windup + 220);
  const statusAt = statusId ? lastImpact + 70 : null;

  return {
    version: COMBAT_SEQUENCE_VERSION,
    skillName,
    kind,
    qualityId,
    visualQuality: visual.id,
    qualityLabel: visual.label,
    intensity: visual.intensity,
    diceGroup,
    rollTotal,
    totalDuration,
    enemyTurnDelay: totalDuration + 140,
    hitCount,
    hits,
    statusAt,
    statusId,
    animation,
    camera: {
      shake: clamp(Number(animation.cameraEffect?.shake || 0.25) * visual.intensity, 0, 1),
      zoom: clamp(Number(animation.cameraEffect?.zoom || 0) * visual.intensity, 0, 0.35),
      hitstop,
    },
    events: [
      { at: 0, type: "LOCK_CONTROLS" },
      { at: 40, type: "PREPARE_ATTACK" },
      { at: windup, type: "MOVE_ATTACKER" },
      ...hits.map(hit => ({ at: hit.at, type: "APPLY_HIT", ...hit })),
      ...(statusAt ? [{ at: statusAt, type: "APPLY_STATUS", statusId }] : []),
      { at: returnAt, type: "RETURN_ATTACKER" },
      { at: totalDuration, type: "UNLOCK_CONTROLS" },
    ],
  };
}

export function combatSequenceDelay(sequence, fallback = 720) {
  return Math.max(fallback, Number(sequence?.enemyTurnDelay || sequence?.totalDuration || 0));
}
