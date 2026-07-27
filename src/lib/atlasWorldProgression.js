// PROYECTO ATLAS — Cambios persistentes del mundo tras liberar regiones.
export const LIBERATED_SAFE_SECTORS = {
  verde: new Set(["A2", "B2", "C2"]),
};

export function shouldClearSectorEnemies(regionId, sectorId, bossDefeated, worldFlags = {}) {
  const liberated = !!bossDefeated || !!worldFlags[`${regionId}:boss_defeated`] || !!worldFlags[`${regionId}:restored`];
  if (!liberated) return false;
  return !!LIBERATED_SAFE_SECTORS[regionId]?.has(sectorId);
}
