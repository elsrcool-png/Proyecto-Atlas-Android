// PROYECTO ATLAS — Adaptador único entre combate clásico y Dungeon.
// Dungeon usa el mismo director temporal, catálogo de habilidades y eventos
// de impacto. Los dados siguen resolviéndose internamente y no se exponen.

import { buildCombatSequence } from "@/lib/atlasCombatDirector";

export const DUNGEON_COMBAT_ADAPTER_VERSION = 1;

export function dungeonQualityId(result = {}) {
  if (!result.hit || result.missed) return "fallo_critico";
  if (result.crit) return "critico";
  if (Number(result.totalDamage ?? result.dmg ?? 0) >= Number(result.highDamageThreshold || 12)) return "alto";
  return "medio";
}

export function buildDungeonCombatSequence(options = {}) {
  const result = options.result || {};
  const totalDamage = Math.max(0, Number(result.totalDamage ?? result.dmg ?? 0));
  const qualityId = options.qualityId || dungeonQualityId({ ...result, totalDamage });
  const sequence = buildCombatSequence({
    skill: options.skill || { name: options.skillName || "Ataque", hits: options.hits || 1 },
    className: options.className,
    weaponType: options.weaponType,
    element: options.element,
    diceGroup: "hidden",
    rollTotal: null,
    qualityId,
    totalDamage,
    playerDamage: 0,
    counter: false,
    statusId: options.statusId || null,
    kind: options.kind || "basic",
    landed: !!result.hit && !result.missed && totalDamage > 0,
  });
  return Object.freeze({
    ...sequence,
    context: "DUNGEON",
    diceVisible: false,
    diceGroup: "hidden",
    rollTotal: null,
  });
}

export function dungeonSequenceImpactDelay(sequence) {
  if (sequence?.hits?.length) return Number(sequence.hits[sequence.hits.length - 1].at || 0);
  const miss = sequence?.events?.find((event) => event.type === "MISS_REACTION");
  return Number(miss?.at || Math.max(240, Number(sequence?.totalDuration || 640) * 0.55));
}
