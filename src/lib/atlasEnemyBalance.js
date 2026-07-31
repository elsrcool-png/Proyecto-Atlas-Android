// PROYECTO ATLAS v2.23.3 — Balance regional de enemigos.
// El nivel define la progresión interna del sector, pero la región, el rol y las
// estadísticas efectivas del jugador fijan pisos de amenaza reales. El anclaje
// nunca rebaja las estadísticas regionales ya escaladas.

export const REGION_COMBAT_PROFILES = Object.freeze({
  verde: Object.freeze({
    hpMul: 1.00, atkMul: 1.00, defMul: 1.00,
    minHp: 8, minAtk: 3, minDef: 1,
    playerHpRatio: 0.72, playerAtkRatio: 0.58, playerDefRatio: 0.42,
    attackPressure: -1,
  }),
  fria: Object.freeze({
    hpMul: 1.10, atkMul: 1.10, defMul: 1.12,
    minHp: 22, minAtk: 11, minDef: 7,
    playerHpRatio: 1.20, playerAtkRatio: 0.75, playerDefRatio: 0.58,
    attackPressure: 1,
  }),
  desierto: Object.freeze({
    hpMul: 1.25, atkMul: 1.18, defMul: 1.18,
    minHp: 32, minAtk: 15, minDef: 9,
    playerHpRatio: 1.55, playerAtkRatio: 0.86, playerDefRatio: 0.62,
    attackPressure: 2,
  }),
});

const ROLE_PROFILE = Object.freeze({
  normal: Object.freeze({ hp: 1, atk: 1, def: 1, playerHp: 1, attackPressure: 0, playerDef: 1 }),
  elite: Object.freeze({ hp: 1.28, atk: 1.10, def: 1.08, playerHp: 1.18, attackPressure: 1, playerDef: 1.08 }),
  boss: Object.freeze({ hp: 1.00, atk: 1.08, def: 1.04, playerHp: 3.10, attackPressure: 3, playerDef: 1.12 }),
});

function numeric(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function roleFor(monster = {}) {
  if (monster.boss) return "boss";
  if (monster.elite) return "elite";
  return "normal";
}

export function getRegionCombatProfile(regionId = "verde") {
  return REGION_COMBAT_PROFILES[regionId] || REGION_COMBAT_PROFILES.verde;
}

export function balanceEnemyFromPlayerBase({
  monster,
  scaled,
  playerProfile,
  regionStart = 1,
  regionId = scaled?._atlasRegionId || "verde",
  personality = "aggressive",
  focus = { phys: 1, mag: 1 },
} = {}) {
  if (!scaled) throw new Error("scaled es obligatorio");

  const profile = getRegionCombatProfile(regionId);
  const roleId = roleFor(monster);
  const role = ROLE_PROFILE[roleId];

  const pHp = numeric(playerProfile?.maxHp ?? playerProfile?.baseMaxHp, 14);
  const pAtk = numeric(playerProfile?.attack ?? playerProfile?.baseAttack, 4);
  const pPhys = numeric(playerProfile?.physicalDefense ?? playerProfile?.defense ?? playerProfile?.baseDefense, 2);
  const pMag = numeric(playerProfile?.magicalDefense ?? playerProfile?.baseMagicalDefense ?? pPhys, pPhys);

  const scaledPhys = numeric(scaled.physicalDefense ?? scaled.defense, 0);
  const scaledMag = numeric(scaled.magicalDefense ?? scaled.defense, scaledPhys);

  const regionalHp = numeric(scaled.hp, 8) * (roleId === "boss" ? 1 : profile.hpMul) * role.hp;
  const regionalAtk = numeric(scaled.attack, 3) * profile.atkMul * role.atk;
  const regionalPhys = scaledPhys * profile.defMul * role.def * (focus.phys ?? 1);
  const regionalMag = scaledMag * profile.defMul * role.def * (focus.mag ?? 1);

  const playerHpFloor = pHp * profile.playerHpRatio * role.playerHp;
  const playerAttackFloor = Math.max(
    pPhys + profile.attackPressure + role.attackPressure,
    pMag + profile.attackPressure + role.attackPressure - 1,
    pAtk * profile.playerAtkRatio * role.atk,
  );
  const playerPhysFloor = pAtk * profile.playerDefRatio * role.playerDef * (0.72 + (focus.phys ?? 1) * 0.28);
  const playerMagFloor = pAtk * profile.playerDefRatio * role.playerDef * (0.72 + (focus.mag ?? 1) * 0.28);

  const hp = Math.max(profile.minHp * role.hp, regionalHp, playerHpFloor);
  const attack = Math.max(profile.minAtk + role.attackPressure, regionalAtk, playerAttackFloor);
  const physicalDefense = Math.max(profile.minDef * role.def, regionalPhys, playerPhysFloor);
  const magicalDefense = Math.max(profile.minDef * role.def, regionalMag, playerMagFloor);

  return {
    hp: Math.max(3, Math.round(hp)),
    attack: Math.max(1, Math.round(attack)),
    physicalDefense: Math.max(0, Math.round(physicalDefense)),
    magicalDefense: Math.max(0, Math.round(magicalDefense)),
    anchored: !!playerProfile,
    anchor: playerProfile ? {
      hp: pHp,
      attack: pAtk,
      physicalDefense: pPhys,
      magicalDefense: pMag,
      regionId,
      role: roleId,
      personality,
    } : null,
  };
}
