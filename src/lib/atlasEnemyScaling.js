// PROYECTO ATLAS — Escalado canónico de enemigos por región y sector.
// El nivel adaptativo modifica estadísticas, pero nunca la EXP otorgada.

export const REGION_LEVEL_BANDS = {
  verde: { start: 1, boss: 10, xpMul: 1 },
  fria: { start: 11, boss: 20, xpMul: 1.35 },
  desierto: { start: 21, boss: 30, xpMul: 1.7 },
};

// Orden narrativo de desbloqueo. A2 es el inicio; C3 es la antesala del jefe.
export const SECTOR_PROGRESS_INDEX = {
  A2: 0,
  A1: 1,
  B1: 2,
  C1: 3,
  C2: 4,
  B2: 5,
  A3: 6,
  B3: 7,
  C3: 8,
};

export function getSectorBaseLevel(regionId, sectorId) {
  const band = REGION_LEVEL_BANDS[regionId] || REGION_LEVEL_BANDS.verde;
  const idx = SECTOR_PROGRESS_INDEX[sectorId] ?? 0;
  return Math.min(band.boss - 1, band.start + idx);
}

export function getRegionalBossLevel(regionId) {
  return (REGION_LEVEL_BANDS[regionId] || REGION_LEVEL_BANDS.verde).boss;
}

export function resolveEnemyLevel(regionId, sectorId, playerLevel = 1, isBoss = false) {
  const band = REGION_LEVEL_BANDS[regionId] || REGION_LEVEL_BANDS.verde;
  if (isBoss) return band.boss;
  const base = getSectorBaseLevel(regionId, sectorId);
  // Cada tres niveles reales del jugador por encima del sector, el enemigo gana uno.
  // El ajuste no puede alcanzar ni superar al jefe regional.
  const catchup = Math.max(0, Math.floor(((playerLevel || base) - base) / 3));
  return Math.min(band.boss - 1, base + catchup);
}

export function scaleMonsterStats(monster, {
  regionId = "verde",
  sectorId = "A2",
  playerLevel = 1,
  boss = !!monster?.boss,
  elite = !!monster?.elite,
  roleFactor,
} = {}) {
  const band = REGION_LEVEL_BANDS[regionId] || REGION_LEVEL_BANDS.verde;
  const baseLevel = boss ? band.boss : getSectorBaseLevel(regionId, sectorId);
  const level = resolveEnemyLevel(regionId, sectorId, playerLevel, boss);
  const factor = roleFactor ?? (boss ? 1.12 : elite ? 1 : 0.86);

  const rawHp = monster?.hp || 8;
  const rawAtk = monster?.attack || 3;
  const rawDef = monster?.defense || 1;
  const hpGrowth = 0.92 + level * 0.09;
  const hp = Math.max(3, Math.round(rawHp * hpGrowth * factor));
  const attack = Math.max(1, Math.round((rawAtk + (level - 1) * 0.34) * factor));
  const defense = Math.max(0, Math.round((rawDef + (level - 1) * 0.22) * factor));
  const energy = Math.max(4, Math.round((monster?.energy || monster?.maxMp || 8) * (0.92 + level * 0.025)));

  // EXP usa el nivel base del sector/región, no el catch-up adaptativo.
  const baseXp = monster?.xpReward || monster?.xp || 15;
  const xpReward = Math.max(1, Math.round(baseXp * band.xpMul * (1 + (baseLevel - band.start) * 0.025) * (elite ? 1.25 : boss ? 2 : 1)));

  return {
    ...monster,
    level,
    hp,
    maxHp: hp,
    attack,
    defense,
    physicalDefense: monster?.physicalDefense ?? defense,
    magicalDefense: monster?.magicalDefense ?? defense,
    mp: energy,
    maxMp: energy,
    energy,
    xpReward,
    sectorId,
    _atlasScaled: true,
    _atlasBaseLevel: baseLevel,
  };
}
