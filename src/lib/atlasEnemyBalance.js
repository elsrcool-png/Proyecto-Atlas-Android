// PROYECTO ATLAS — Balance puro de enemigos comunes contra estadísticas base.
// Este módulo no depende de React ni de alias internos, por lo que puede probarse
// directamente desde Node y reutilizarse en modo libre, tablero y dungeon.

export const PLAYER_ANCHOR_PROFILE = {
  aggressive: { hp: 0.92, atk: 1.05, phys: 0.82, mag: 0.78 },
  defensive: { hp: 1.05, atk: 0.86, phys: 1.08, mag: 0.92 },
  magical: { hp: 0.84, atk: 0.98, phys: 0.74, mag: 1.08 },
  resilient: { hp: 1.12, atk: 0.88, phys: 1.12, mag: 0.84 },
  unpredictable: { hp: 0.9, atk: 1.02, phys: 0.84, mag: 0.84 },
  tactical: { hp: 0.98, atk: 0.98, phys: 0.96, mag: 0.96 },
};

function numericBase(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function balanceEnemyFromPlayerBase({
  monster,
  scaled,
  playerProfile,
  regionStart = 1,
  personality = "aggressive",
  focus = { phys: 1, mag: 1 },
} = {}) {
  if (!scaled) throw new Error("scaled es obligatorio");

  if (!playerProfile || monster?.boss) {
    return {
      hp: scaled.hp,
      attack: scaled.attack,
      physicalDefense: Math.max(0, Math.round(scaled.defense * (focus.phys ?? 1))),
      magicalDefense: Math.max(0, Math.round(scaled.defense * (focus.mag ?? 1))),
      anchored: false,
      anchor: null,
    };
  }

  const profile = PLAYER_ANCHOR_PROFILE[personality] || PLAYER_ANCHOR_PROFILE.aggressive;
  const pHp = numericBase(playerProfile.baseMaxHp ?? playerProfile.maxHp, 14);
  const pAtk = numericBase(playerProfile.baseAttack ?? playerProfile.attack, 4);
  const pPhys = numericBase(playerProfile.baseDefense ?? playerProfile.physicalDefense ?? playerProfile.defense, 2);
  const pMag = numericBase(playerProfile.baseMagicalDefense ?? playerProfile.magicalDefense ?? playerProfile.defense, pPhys);

  const sectorSteps = Math.max(0, (scaled._atlasBaseLevel || scaled.level || regionStart) - regionStart);
  const hpProgress = 1 + Math.min(0.28, sectorSteps * 0.035);
  const atkProgress = 1 + Math.min(0.18, sectorSteps * 0.0225);
  const defProgress = 1 + Math.min(0.16, sectorSteps * 0.02);
  const softenedPhysFocus = 0.6 + (focus.phys ?? 1) * 0.4;
  const softenedMagFocus = 0.6 + (focus.mag ?? 1) * 0.4;

  const anchorHp = pHp * profile.hp * hpProgress;
  const anchorAtk = pAtk * profile.atk * atkProgress;
  const anchorPhys = pPhys * profile.phys * softenedPhysFocus * defProgress;
  const anchorMag = pMag * profile.mag * softenedMagFocus * defProgress;
  const mix = (anchor, original) => anchor * 0.78 + original * 0.22;

  return {
    hp: Math.max(3, Math.round(mix(anchorHp, scaled.hp))),
    attack: Math.max(1, Math.round(mix(anchorAtk, scaled.attack))),
    physicalDefense: Math.max(0, Math.round(mix(anchorPhys, scaled.defense * (focus.phys ?? 1)))),
    magicalDefense: Math.max(0, Math.round(mix(anchorMag, scaled.defense * (focus.mag ?? 1)))),
    anchored: true,
    anchor: { hp: pHp, attack: pAtk, physicalDefense: pPhys, magicalDefense: pMag },
  };
}
