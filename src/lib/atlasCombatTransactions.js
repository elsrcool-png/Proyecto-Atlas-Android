// PROYECTO ATLAS — Transacciones inmutables de combate.
// Congela el estado visible antes/después de cada acción para que React no
// tenga que reconstruir la vida anterior desde valores que ya cambiaron.

function cloneStatuses(statuses) {
  if (!statuses || typeof statuses !== "object") return {};
  return Object.fromEntries(
    Object.entries(statuses).map(([key, value]) => [key, value && typeof value === "object" ? { ...value } : value]),
  );
}

export function snapshotCombatant(entity) {
  if (!entity) return null;
  return {
    id: entity.id ?? entity.uid ?? null,
    name: entity.name ?? null,
    hp: Math.max(0, Number(entity.hp || 0)),
    maxHp: Math.max(0, Number(entity.maxHp || 0)),
    mp: Math.max(0, Number(entity.mp || 0)),
    maxMp: Math.max(0, Number(entity.maxMp || 0)),
    shield: Math.max(0, Number(entity.shield || 0)),
    statuses: cloneStatuses(entity.statuses),
  };
}

export function makeCombatAction({
  actionId,
  result,
  beforePlayer,
  beforeEnemy,
  afterPlayer,
  afterEnemy,
  resolution,
}) {
  return {
    ...result,
    actionId,
    before: {
      player: snapshotCombatant(beforePlayer),
      enemy: snapshotCombatant(beforeEnemy),
    },
    after: {
      player: snapshotCombatant(afterPlayer ?? beforePlayer),
      enemy: snapshotCombatant(afterEnemy ?? beforeEnemy),
    },
    resolution: {
      rawDamage: Math.max(0, Number(resolution?.rawDamage ?? result?.rawEnemyDamage ?? result?.enemyDamage ?? result?.playerDamage ?? 0)),
      shieldDamage: Math.max(0, Number(resolution?.shieldDamage || 0)),
      hpDamage: Math.max(0, Number(resolution?.hpDamage ?? result?.enemyDamage ?? result?.playerDamage ?? 0)),
      ...(resolution || {}),
    },
  };
}

export function resolveShieldedDamage(enemy, rawDamage) {
  const raw = Math.max(0, Math.round(Number(rawDamage) || 0));
  const shieldBefore = Math.max(0, Math.round(Number(enemy?.shield) || 0));
  const shieldDamage = Math.min(shieldBefore, raw);
  const hpDamage = Math.max(0, raw - shieldDamage);
  const shieldAfter = Math.max(0, shieldBefore - shieldDamage);
  const hpAfter = Math.max(0, Math.round(Number(enemy?.hp || 0)) - hpDamage);

  return {
    rawDamage: raw,
    shieldDamage,
    hpDamage,
    shieldBefore,
    shieldAfter,
    hpAfter,
    enemyAfter: enemy ? { ...enemy, hp: hpAfter, shield: shieldAfter } : enemy,
  };
}
