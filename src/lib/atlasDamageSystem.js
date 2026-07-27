// ═══════════════════════════════════════════════════════════════════════════
// PROYECTO ATLAS — Sistema de Daño (Alpha 1.0)
// ---------------------------------------------------------------------------
// Capa independiente. No modifica atlasEngine.js ni ningún sistema existente.
// El daño depende de ATK, DEF y la calidad del impacto — no del dado directo.
// ═══════════════════════════════════════════════════════════════════════════

import { QUALITY } from "@/lib/atlasDiceSystem";

// ======================== DAÑO BRUTO POR CALIDAD ========================
export function computeRawDamage(qualityId, atk, def) {
  const safeAtk = atk || 0;
  const safeDef = def || 0;

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
      return safeAtk; // ignora DEF
    default:
      return Math.max(1, safeAtk - safeDef);
  }
}

// ======================== REDUCCIÓN DE DAÑO ========================
export function computeReduction(enemyAtk, playerAtk) {
  const diff = (enemyAtk || 0) - (playerAtk || 0);
  if (diff <= 0) return 0;
  return Math.min(diff * 0.025, 0.40);
}

export const REDUCTION_TABLE = [
  { diff: 0,  reduction: 0.00 },
  { diff: 1,  reduction: 0.025 },
  { diff: 2,  reduction: 0.05 },
  { diff: 3,  reduction: 0.075 },
  { diff: 4,  reduction: 0.10 },
  { diff: 5,  reduction: 0.125 },
  { diff: 6,  reduction: 0.15 },
  { diff: 8,  reduction: 0.20 },
  { diff: 10, reduction: 0.25 },
  { diff: 12, reduction: 0.30 },
  { diff: 14, reduction: 0.35 },
  { diff: 16, reduction: 0.40 },
];

export function applyReduction(rawDamage, reduction) {
  if (reduction <= 0) return rawDamage;
  return Math.max(1, Math.round(rawDamage * (1 - reduction)));
}

// ======================== CONTRAATAQUE ========================
export function computeCounterattack(atk, def, enemyAtk, playerAtk) {
  const raw = Math.max(1, (atk || 0) - (def || 0));
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

// ======================== RESOLUCIÓN CANÓNICA DE ATAQUE ========================
// Unifica jugador, enemigos y jefes. Los dados determinan la CALIDAD del impacto,
// no el daño. Fallo crítico = 0 daño + contraataque automático.

// Construye un resultado de dado plano (1d20) para enemigos que no usan grupo.
export function singleDieResult(sides, total) {
  return { group: "single", label: `1d${sides}`, rolls: [{ sides, result: total }], total, min: 1, max: sides };
}

// Resuelve un ataque completo según Atlas Alpha 1.0.
//   qualityId    : calidad del impacto (QUALITY.*.id)
//   atk         : ATK del atacante (ya incluye multiplicadores de habilidad si aplica)
//   def         : DEF del defensor (ya modificada por pasivas/pierce)
//   opponentAtk : ATK del defensor (para reducción y como ATK del contraataque)
//   opponentDef : DEF del atacante (como DEF del defensor del contraataque)
export function resolveAttack({ qualityId, atk, def, opponentAtk, opponentDef }) {
  const safeAtk = atk || 0;
  const safeDef = def || 0;
  const isFallo = qualityId === QUALITY.fallo_critico.id;

  if (isFallo) {
    // Contraataque: el defensor ataca al atacante original.
    // Sin dados, sin fallo, sin crítico, sin cadena. Solo reducción normal.
    const counterRaw = Math.max(1, (opponentAtk || 0) - (opponentDef || 0));
    const counterReduction = computeReduction(safeAtk, opponentAtk || 0);
    const counterDamage = applyReduction(counterRaw, counterReduction);
    return {
      quality: qualityId,
      isFalloCritico: true,
      damage: 0,
      rawDamage: 0,
      reduction: 0,
      ignoresDef: false,
      counter: { damage: counterDamage, reduction: counterReduction },
    };
  }

  const rawDamage = computeRawDamage(qualityId, safeAtk, safeDef);
  const reduction = computeReduction(opponentAtk || 0, safeAtk);
  const finalDamage = applyReduction(rawDamage, reduction);
  return {
    quality: qualityId,
    isFalloCritico: false,
    damage: finalDamage,
    rawDamage,
    reduction,
    ignoresDef: qualityId === QUALITY.critico.id,
    counter: null,
  };
}