// PROYECTO ATLAS — Progresión por regiones: techo de nivel y curva de XP
export const REGION_META = [
  { start: 1, cap: 8, nextStart: 9 },
  { start: 9, cap: 16, nextStart: 17 },
  { start: 17, cap: 25, nextStart: 26 },
];

export const KILL_XP = [20, 35, 55];

export function xpToNext(level) {
  const l = Math.max(1, level);
  return Math.round(40 * Math.pow(1.45, l - 1));
}

export function energyMilestoneBonus(oldLevel, newLevel) {
  return Math.max(0, Math.floor(newLevel / 3) - Math.floor(oldLevel / 3));
}

export function applyXp(player, amount, regionIndex, bossAlive) {
  const meta = REGION_META[regionIndex] || REGION_META[0];
  const startLevel = player.level;
  let xp = (player.xp || 0) + amount;
  let level = player.level;
  let statPoints = player.statPoints || 0;
  let levelsGained = 0;
  const hardCap = bossAlive ? meta.cap : 99;
  while (level < hardCap && xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level++;
    statPoints++;
    levelsGained++;
  }
  const capped = level >= hardCap && bossAlive;
  if (capped) xp = Math.min(xp, xpToNext(level) - 1);
  const eBonus = energyMilestoneBonus(startLevel, level);
  const baseMaxMp = eBonus > 0 ? (player.baseMaxMp ?? player.maxMp) + eBonus : (player.baseMaxMp ?? player.maxMp);
  return { player: { ...player, xp, level, statPoints, baseMaxMp }, levelsGained, capped, energyGained: eBonus };
}

export function bossAutoLevel(player, regionIndex) {
  const meta = REGION_META[regionIndex] || REGION_META[0];
  const target = Math.max(player.level, meta.nextStart);
  const delta = target - player.level;
  const eBonus = energyMilestoneBonus(player.level, target);
  const baseMaxMp = eBonus > 0 ? (player.baseMaxMp ?? player.maxMp) + eBonus : (player.baseMaxMp ?? player.maxMp);
  return { player: { ...player, level: target, statPoints: (player.statPoints || 0) + delta, xp: 0, baseMaxMp }, delta, energyGained: eBonus };
}