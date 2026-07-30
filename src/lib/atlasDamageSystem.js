// ═══════════════════════════════════════════════════════════════════════════
// PROYECTO ATLAS — Sistema de Daño (v2.23.2)
// ---------------------------------------------------------------------------
// Todo ataque y habilidad cuyo total esté entre 1 y 20 usa las mismas bandas
// exactas. Los grupos básico, Técnica, Fuerza y Versátil alcanzan un máximo de
// 20, por lo que comparten una sola resolución. Después del daño bruto se aplica
// el sistema canónico de reducción por presión.
// ═══════════════════════════════════════════════════════════════════════════

import { QUALITY } from "@/lib/atlasDiceSystem";

export const D20_DAMAGE_BANDS = Object.freeze([
  { min: 1, max: 1, qualityId: QUALITY.fallo_critico.id, offset: null, counter: true, label: "Fallo y contraataque" },
  { min: 2, max: 3, qualityId: QUALITY.bajo.id, offset: -3, label: "ATK − DEF − 3" },
  { min: 4, max: 5, qualityId: QUALITY.bajo.id, offset: -2, label: "ATK − DEF − 2" },
  { min: 6, max: 8, qualityId: QUALITY.bajo.id, offset: -1, label: "ATK − DEF − 1" },
  { min: 9, max: 12, qualityId: QUALITY.medio.id, offset: 0, label: "ATK − DEF" },
  { min: 13, max: 15, qualityId: QUALITY.medio.id, offset: 1, label: "ATK − DEF + 1" },
  { min: 16, max: 17, qualityId: QUALITY.alto.id, offset: 2, label: "ATK − DEF + 2" },
  { min: 18, max: 19, qualityId: QUALITY.alto.id, offset: 3, label: "ATK − DEF + 3" },
  { min: 20, max: 20, qualityId: QUALITY.critico.id, offset: null, critical: true, label: "Crítico: ATK" },
]);

export function resolveD20DamageBand(rollTotal) {
  const roll = Math.max(1, Math.min(20, Number(rollTotal) || 1));
  return D20_DAMAGE_BANDS.find(band => roll >= band.min && roll <= band.max) || D20_DAMAGE_BANDS[0];
}

export function resolveD20Quality(rollTotal) {
  return QUALITY[resolveD20DamageBand(rollTotal).qualityId] || QUALITY.fallo_critico;
}

// Conserva el antiguo efecto de “subir una calidad” usando ahora la tabla
// universal. El resultado se desplaza al inicio de la siguiente categoría:
// Bajo → Medio (9), Medio → Alto (16), Alto → Crítico (20).
export function upgradeCombatRollBand(rollTotal) {
  const roll = Math.max(1, Math.min(20, Number(rollTotal) || 1));
  if (roll === 1 || roll === 20) return roll;
  if (roll <= 8) return 9;
  if (roll <= 15) return 16;
  return 20;
}

// ======================== DAÑO BRUTO POR CALIDAD ========================
// Se conserva únicamente como compatibilidad para resoluciones sin total de dados.
export function computeRawDamage(qualityId, atk, def) {
  const safeAtk = Number(atk) || 0;
  const safeDef = Number(def) || 0;

  switch (qualityId) {
    case QUALITY.fallo_critico.id:
      return 0;
    case QUALITY.bajo.id:
      return Math.max(1, safeAtk - safeDef);
    case QUALITY.medio.id:
      return Math.max(1, safeAtk - safeDef + 2);
    case QUALITY.alto.id:
      return Math.max(1, safeAtk - safeDef + 4);
    case QUALITY.critico.id:
      return Math.max(1, safeAtk); // ignora DEF
    default:
      return Math.max(1, safeAtk - safeDef);
  }
}

export function computeD20RawDamage(rollTotal, atk, def, { forceCritical = false, forceCriticalFailure = false } = {}) {
  const safeAtk = Number(atk) || 0;
  const safeDef = Number(def) || 0;
  const baseBand = resolveD20DamageBand(rollTotal);
  const band = forceCriticalFailure
    ? { ...D20_DAMAGE_BANDS[0], compoundFailure: true, label: "Fallo crítico por dados en 1" }
    : baseBand;
  if (forceCriticalFailure) return { rawDamage: 0, band, isFallo: true, isCritical: false };
  if (band.counter) return { rawDamage: 0, band, isFallo: true, isCritical: false };
  if (forceCritical || band.critical) {
    return { rawDamage: Math.max(1, safeAtk), band: { ...band, qualityId: QUALITY.critico.id }, isFallo: false, isCritical: true };
  }
  return {
    rawDamage: Math.max(1, safeAtk - safeDef + band.offset),
    band,
    isFallo: false,
    isCritical: false,
  };
}

// ======================== REDUCCIÓN DE DAÑO ========================
export function computeReduction(enemyAtk, playerAtk) {
  const diff = (Number(enemyAtk) || 0) - (Number(playerAtk) || 0);
  if (diff <= 0) return 0;
  return Math.min(diff * 0.025, 0.40);
}

export const REDUCTION_TABLE = [
  { diff: 0, reduction: 0.00 },
  { diff: 1, reduction: 0.025 },
  { diff: 2, reduction: 0.05 },
  { diff: 3, reduction: 0.075 },
  { diff: 4, reduction: 0.10 },
  { diff: 5, reduction: 0.125 },
  { diff: 6, reduction: 0.15 },
  { diff: 8, reduction: 0.20 },
  { diff: 10, reduction: 0.25 },
  { diff: 12, reduction: 0.30 },
  { diff: 14, reduction: 0.35 },
  { diff: 16, reduction: 0.40 },
];

export function applyReduction(rawDamage, reduction) {
  if (rawDamage <= 0) return 0;
  if (reduction <= 0) return rawDamage;
  return Math.max(1, Math.round(rawDamage * (1 - reduction)));
}

// ======================== CONTRAATAQUE ========================
export function computeCounterattack(atk, def, enemyAtk, playerAtk) {
  const raw = Math.max(1, (Number(atk) || 0) - (Number(def) || 0));
  const reduction = computeReduction(enemyAtk, playerAtk);
  const final = applyReduction(raw, reduction);
  return { rawDamage: raw, reduction, finalDamage: final, isCounterattack: true };
}

// ======================== RESOLUCIÓN COMPLETA DE DAÑO ========================
export function resolveDamage(qualityId, atk, def, opponentAtk) {
  const rawDamage = computeRawDamage(qualityId, atk, def);
  const reduction = computeReduction(opponentAtk, atk);
  const finalDamage = applyReduction(rawDamage, reduction);
  const isFallo = qualityId === QUALITY.fallo_critico.id;

  return {
    quality: qualityId,
    rawDamage,
    reduction,
    reductionPct: Math.round(reduction * 100),
    finalDamage: isFallo ? 0 : finalDamage,
    isFalloCritico: isFallo,
    ignoresDef: qualityId === QUALITY.critico.id,
  };
}

export function singleDieResult(sides, total) {
  return { group: "single", label: `1d${sides}`, rolls: [{ sides, result: total }], total, min: 1, max: sides };
}

// rollTotal acepta cualquier suma de dados de combate entre 1 y 20. Sin
// rollTotal se mantiene la resolución histórica como compatibilidad. Los
// modificadores que mejoran calidad entregan un total efectivo dentro de la
// misma tabla universal.
export function resolveAttack({ qualityId, atk, def, opponentAtk, opponentDef, rollTotal = null, forceCritical = false, forceCriticalFailure = false }) {
  const safeAtk = Number(atk) || 0;
  const safeDef = Number(def) || 0;
  const usesD20Table = Number.isFinite(Number(rollTotal)) && Number(rollTotal) >= 1 && Number(rollTotal) <= 20;
  const d20Result = usesD20Table ? computeD20RawDamage(Number(rollTotal), safeAtk, safeDef, { forceCritical, forceCriticalFailure }) : null;
  const resolvedQualityId = d20Result?.band?.qualityId || qualityId;
  const isFallo = usesD20Table ? d20Result.isFallo : resolvedQualityId === QUALITY.fallo_critico.id;

  if (isFallo) {
    const counterRaw = Math.max(1, (Number(opponentAtk) || 0) - (Number(opponentDef) || 0));
    const counterReduction = computeReduction(safeAtk, opponentAtk || 0);
    const counterDamage = applyReduction(counterRaw, counterReduction);
    return {
      quality: QUALITY.fallo_critico.id,
      isFalloCritico: true,
      damage: 0,
      rawDamage: 0,
      reduction: 0,
      ignoresDef: false,
      rollBand: d20Result?.band || null,
      counter: { damage: counterDamage, reduction: counterReduction },
    };
  }

  const isCritical = usesD20Table ? d20Result.isCritical : resolvedQualityId === QUALITY.critico.id;
  const rawDamage = usesD20Table ? d20Result.rawDamage : computeRawDamage(resolvedQualityId, safeAtk, safeDef);
  const reduction = computeReduction(opponentAtk || 0, safeAtk);
  const finalDamage = applyReduction(rawDamage, reduction);
  return {
    quality: isCritical ? QUALITY.critico.id : resolvedQualityId,
    isFalloCritico: false,
    damage: finalDamage,
    rawDamage,
    reduction,
    ignoresDef: isCritical,
    rollBand: d20Result?.band || null,
    counter: null,
  };
}
