// ═══════════════════════════════════════════════════════════════════════════
// PROYECTO ATLAS — Sistema de Resolución de Dados (Alpha 1.0)
// ---------------------------------------------------------------------------

export const DICE_GROUPS = {
  basico: { id: "basico", name: "Ataque Básico", icon: "🎲", dice: [{ count: 1, sides: 20 }], label: "1d20" },
  tecnica: { id: "tecnica", name: "Técnica", icon: "🔥", dice: [{ count: 3, sides: 4 }, { count: 1, sides: 8 }], label: "3d4 + 1d8" },
  fuerza: { id: "fuerza", name: "Fuerza", icon: "🔨", dice: [{ count: 1, sides: 12 }, { count: 2, sides: 4 }], label: "1d12 + 2d4" },
  versatil: { id: "versatil", name: "Versátil", icon: "🗡️", dice: [{ count: 2, sides: 8 }, { count: 1, sides: 4 }], label: "2d8 + 1d4" },
  cofre_legendario: { id: "cofre_legendario", name: "Ceremonia del Cofre Legendario", icon: "✦", dice: [{ count: 3, sides: 20 }], label: "3d20" },
};

export const QUALITY = {
  fallo_critico: { id: "fallo_critico", name: "Fallo crítico", icon: "❌", tier: 0, color: "#ef4444" },
  bajo:          { id: "bajo",          name: "Impacto Bajo",   icon: "🟢", tier: 1, color: "#22c55e" },
  medio:         { id: "medio",         name: "Impacto Medio",  icon: "🟡", tier: 2, color: "#eab308" },
  alto:          { id: "alto",          name: "Impacto Alto",   icon: "🔴", tier: 3, color: "#f97316" },
  critico:       { id: "critico",       name: "Impacto Crítico",icon: "⭐", tier: 4, color: "#fbbf24" },
};

export const QUALITY_ORDER = ["fallo_critico", "bajo", "medio", "alto", "critico"];

export function rollDiceGroup(groupId) {
  const group = DICE_GROUPS[groupId];
  if (!group) return null;

  const rolls = [];
  let total = 0;
  let min = 0;
  let max = 0;

  for (const die of group.dice) {
    for (let i = 0; i < die.count; i++) {
      const result = Math.floor(Math.random() * die.sides) + 1;
      rolls.push({ sides: die.sides, result });
      total += result;
    }
    min += die.count * 1;
    max += die.count * die.sides;
  }

  return { group: groupId, label: group.label, rolls, total, min, max };
}

export function countNaturalOnes(rollResult) {
  if (!rollResult || !Array.isArray(rollResult.rolls)) return 0;
  return rollResult.rolls.reduce((count, die) => count + (Number(die?.result) === 1 ? 1 : 0), 0);
}

export function criticalFailureThreshold(rollResult) {
  const diceCount = Array.isArray(rollResult?.rolls) ? rollResult.rolls.length : 0;
  return diceCount > 0 ? Math.ceil(diceCount / 2) : 0;
}

// Regla canónica Atlas: una tirada falla críticamente cuando la mitad o más
// de sus dados individuales muestran 1. Para 1d20, esto conserva el 1 natural.
export function isCriticalFailureRoll(rollResult) {
  const threshold = criticalFailureThreshold(rollResult);
  return threshold > 0 && countNaturalOnes(rollResult) >= threshold;
}

export function resolveQuality(rollResult) {
  if (!rollResult || isCriticalFailureRoll(rollResult)) return QUALITY.fallo_critico;
  const { total, min, max } = rollResult;
  const range = max - min;
  if (range <= 0) return QUALITY.medio;

  const ratio = (total - min) / range;

  if (ratio <= 0.33) return QUALITY.bajo;
  if (ratio <= 0.65) return QUALITY.medio;
  if (ratio <= 0.89) return QUALITY.alto;
  return QUALITY.critico;
}

export function rollAndResolve(groupId) {
  const roll = rollDiceGroup(groupId);
  const quality = resolveQuality(roll);
  return { roll, quality };
}

export function upgradeQuality(qualityId) {
  const idx = QUALITY_ORDER.indexOf(qualityId);
  if (idx < 0 || idx >= QUALITY_ORDER.length - 1) return qualityId;
  return QUALITY_ORDER[idx + 1];
}

export function qualityMeets(qualityId, minTier) {
  const q = QUALITY[qualityId];
  return q && q.tier >= minTier;
}