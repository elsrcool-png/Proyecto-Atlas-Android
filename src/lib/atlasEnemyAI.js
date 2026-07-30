// PROYECTO ATLAS — Inteligencia Artificial de Enemigos
import { QUALITY } from "@/lib/atlasDiceSystem";
import { resolveAttack, resolveD20Quality } from "@/lib/atlasDamageSystem";
import { scaleMonsterStats } from "@/lib/atlasEnemyScaling";
import { GREEN_MONSTER_IDS } from "@/lib/atlasGreenBestiary";
import { balanceEnemyFromPlayerBase } from "@/lib/atlasEnemyBalance";

export const PERSONALITIES = {
  aggressive: { name: "Agresivo", abilityChance: 0.55, energyRegen: 1, desc: "Ataca constantemente, usa habilidades con frecuencia." },
  defensive: { name: "Defensivo", abilityChance: 0.25, energyRegen: 1, desc: "Prioriza supervivencia, pocas habilidades defensivas." },
  magical: { name: "Mágico", abilityChance: 0.6, energyRegen: 2, desc: "Prioriza magia, mantiene distancia, apoya a otros." },
  resilient: { name: "Resistente", abilityChance: 0.2, energyRegen: 1, desc: "Resistente, ataques constantes, pocas habilidades." },
  unpredictable: { name: "Impredecible", abilityChance: 0.5, energyRegen: 1, desc: "Alterna entre ataques normales y habilidades sin patrón." },
  tactical: { name: "Táctico", abilityChance: 0.65, energyRegen: 2, desc: "Inteligente, mayor uso de habilidades y estados alterados." },
};

export const ENEMY_ABILITIES = {
  golpe_poderoso: { name: "Golpe Poderoso", cost: 3, vfx: "impact", element: "fisico", desc: "Aplastamiento brutal que inflige daño físico elevado.", effect: { damage: 1.7, status: null } },
  embestida: { name: "Embestida", cost: 2, vfx: "charge", element: "fisico", desc: "Carga veloz que golpea al jugador.", effect: { damage: 1.4, status: null } },
  ataque_sorpresa: { name: "Ataque Sorpresa", cost: 3, vfx: "shadow_clones", element: "sombra", desc: "Golpe traicionero con bonus de crítico.", effect: { damage: 1.3, crit: 0.35, status: null } },
  golpe_letal: { name: "Golpe Letal", cost: 4, vfx: "slash", element: "fisico", desc: "Ataque con alta probabilidad de crítico.", effect: { damage: 1.2, crit: 0.45, status: null } },
  imparable: { name: "Imparable", cost: 3, vfx: "shield_break", element: "fisico", desc: "Ignora la defensa del jugador.", effect: { damage: 1.1, ignoreDef: 0.8, status: null } },
  aullido: { name: "Aullido", cost: 2, vfx: "aura_red", element: "fisico", desc: "Reduce el ataque del jugador durante 2 turnos.", effect: { damage: 0.4, status: { type: "shock", duration: 2, amount: 1 } } },
  invocar: { name: "Invocación", cost: 4, vfx: "shadow_clones", element: "arcano", desc: "Invoca aliados sombra que atacan al jugador.", effect: { damage: 1.0, status: null } },
  resurreccion: { name: "Resurrección", cost: 5, vfx: "aura_red", element: "arcano", desc: "Se cura cuando está crítico.", effect: { damage: 0, heal: 0.25, status: null } },
  sigilo: { name: "Sigilo", cost: 3, vfx: "smoke", element: "sombra", desc: "Daño bonus desde las sombras.", effect: { damage: 1.5, status: null } },
  congelacion: { name: "Congelación", cost: 4, vfx: "ice", element: "hielo", desc: "Puede congelar al jugador 1 turno.", effect: { damage: 1.1, status: { type: "freeze", duration: 1, chance: 0.4 } } },
  escudo_hielo: { name: "Escudo de Hielo", cost: 3, vfx: "shield", element: "hielo", desc: "Gana un escudo protector que reduce daño entrante.", effect: { damage: 0, selfShield: 4, status: null } },
  rafaga_helada: { name: "Ráfaga Helada", cost: 3, vfx: "wind", element: "hielo", desc: "Ralentiza al jugador, reduce su defensa.", effect: { damage: 0.7, status: { type: "slow", duration: 2, amount: 1 } } },
  llamarada: { name: "Llamarada", cost: 4, vfx: "fireball", element: "fuego", desc: "Aplica quemadura durante 3 turnos.", effect: { damage: 1.2, status: { type: "burn", duration: 3, amount: 2 } } },
  nube_toxica: { name: "Nube Tóxica", cost: 3, vfx: "smoke", element: "veneno", desc: "Envenena al jugador durante 3 turnos.", effect: { damage: 0.6, status: { type: "poison", duration: 3, amount: 1 } } },
  terremoto: { name: "Terremoto", cost: 5, vfx: "shockwave", element: "fisico", desc: "Onda sísmica devastadora.", effect: { damage: 1.5, status: null } },
  invocacion_sombras: { name: "Invocación Sombría", cost: 5, vfx: "shadow_clones", element: "sombra", desc: "Invoca sombras que atacan al jugador.", effect: { damage: 1.3, status: null } },
  rayo: { name: "Rayo", cost: 4, vfx: "lightning", element: "electrico", desc: "Descarga eléctrica que puede aturdir.", effect: { damage: 1.3, status: { type: "stun", duration: 1, chance: 0.3 } } },
};

export const ENEMY_DEFS = {
  orco_bruto: { personality: "aggressive", energy: 8, crit: 0.12, speed: 1, abilities: ["golpe_poderoso", "embestida"], hp: 12, attack: 4, defense: 3, xp: 18, lootBonus: 0 },
  chaman_orco: { personality: "magical", energy: 12, crit: 0.05, speed: 1, abilities: ["invocar", "aullido"], hp: 8, attack: 2, defense: 1, xp: 20, lootBonus: 0.1 },
  asesino_orco: { personality: "unpredictable", energy: 8, crit: 0.2, speed: 1, abilities: ["ataque_sorpresa", "golpe_letal"], hp: 9, attack: 3, defense: 1, xp: 19, lootBonus: 0.05 },
  lobo_salvaje: { personality: "aggressive", energy: 6, crit: 0.15, speed: 2, abilities: ["embestida"], hp: 9, attack: 3, defense: 1, xp: 16, lootBonus: 0 },
  brujo_feral: { personality: "magical", energy: 10, crit: 0.05, speed: 1, abilities: ["aullido", "sigilo"], hp: 8, attack: 2, defense: 1, xp: 18, lootBonus: 0.05 },
  pantera_sombria: { personality: "unpredictable", energy: 8, crit: 0.2, speed: 2, abilities: ["sigilo", "embestida"], hp: 9, attack: 3, defense: 1, xp: 19, lootBonus: 0.05 },
  guerrero_esqueletico: { personality: "resilient", energy: 6, crit: 0.08, speed: 1, abilities: ["imparable"], hp: 12, attack: 3, defense: 4, xp: 18, lootBonus: 0 },
  necromante: { personality: "magical", energy: 14, crit: 0.05, speed: 1, abilities: ["invocar", "resurreccion", "nube_toxica"], hp: 7, attack: 2, defense: 1, xp: 22, lootBonus: 0.15 },
  asesino_esqueletico: { personality: "unpredictable", energy: 8, crit: 0.25, speed: 1, abilities: ["golpe_letal", "ataque_sorpresa"], hp: 9, attack: 3, defense: 1, xp: 19, lootBonus: 0.05 },
  rey_orco: { personality: "aggressive", energy: 20, crit: 0.15, speed: 1, abilities: ["golpe_poderoso", "terremoto", "embestida"], hp: 24, attack: 6, defense: 5, xp: 100, lootBonus: 0.5 },
  dragon: { personality: "tactical", energy: 25, crit: 0.15, speed: 1, abilities: ["llamarada", "rayo", "terremoto"], hp: 28, attack: 6, defense: 4, xp: 150, lootBonus: 0.5 },
  lich: { personality: "magical", energy: 30, crit: 0.1, speed: 1, abilities: ["invocacion_sombras", "nube_toxica", "resurreccion", "congelacion"], hp: 22, attack: 5, defense: 3, xp: 200, lootBonus: 0.5 },
};

export const REGION_POOLS = {
  verde: [...GREEN_MONSTER_IDS],
  fria: ["guerrero_esqueletico", "necromante", "pantera_sombria", "chaman_orco", "asesino_esqueletico"],
  desierto: ["orco_bruto", "necromante", "asesino_esqueletico", "pantera_sombria", "chaman_orco"],
};

export const REGION_ABILITY_BONUSES = {
  fria: { congelacion: 0.3, escudo_hielo: 0.25, rafaga_helada: 0.25 },
  desierto: { llamarada: 0.3, nube_toxica: 0.2, terremoto: 0.15, invocacion_sombras: 0.2, rayo: 0.15 },
};

const REGION_BASE_LEVEL = { verde: 1, fria: 5, desierto: 10 };
const REGION_BOSS_LEVEL = { verde: 5, fria: 10, desierto: 15 };
const REGION_LVL_RANGE = { verde: 2, fria: 4, desierto: 5 };

export const ENEMY_ABILITY_UNLOCK = [5, 10, 15];

export const ABILITY_TYPE = {
  golpe_poderoso: "fisico", embestida: "fisico", ataque_sorpresa: "fisico",
  golpe_letal: "fisico", imparable: "fisico", aullido: "fisico", sigilo: "fisico",
  terremoto: "fisico",
  invocar: "magico", resurreccion: "magico", congelacion: "magico",
  escudo_hielo: "magico", rafaga_helada: "magico", llamarada: "magico",
  nube_toxica: "magico", invocacion_sombras: "magico", rayo: "magico",
};

export const ENEMY_OFFENSE = {
  orco_bruto: { basic: "fisico", phys: true, mag: false },
  chaman_orco: { basic: "magico", phys: true, mag: true },
  asesino_orco: { basic: "fisico", phys: true, mag: false },
  lobo_salvaje: { basic: "fisico", phys: true, mag: false },
  brujo_feral: { basic: "fisico", phys: true, mag: false },
  pantera_sombria: { basic: "fisico", phys: true, mag: false },
  guerrero_esqueletico: { basic: "fisico", phys: true, mag: false },
  necromante: { basic: "magico", phys: false, mag: true },
  asesino_esqueletico: { basic: "fisico", phys: true, mag: false },
  rey_orco: { basic: "fisico", phys: true, mag: false },
  dragon: { basic: "magico", phys: true, mag: true },
  lich: { basic: "magico", phys: false, mag: true },
};

export const ENEMY_DEFENSE_FOCUS = {
  orco_bruto: "phys", chaman_orco: "mag", asesino_orco: "balanced",
  lobo_salvaje: "phys", brujo_feral: "mag", pantera_sombria: "balanced",
  guerrero_esqueletico: "phys", necromante: "mag", asesino_esqueletico: "balanced",
  rey_orco: "phys", dragon: "balanced", lich: "mag",
};

export function enemyDefenseMul(enemyId) {
  const focus = ENEMY_DEFENSE_FOCUS[enemyId] || "balanced";
  if (focus === "phys") return { phys: 1.25, mag: 0.7 };
  if (focus === "mag") return { phys: 0.7, mag: 1.25 };
  return { phys: 1, mag: 1 };
}

export function balanceEnemyToPlayerBase(monster, scaled, playerProfile, regionStart = 1) {
  const personality = ENEMY_DEFS[monster.id]?.personality || monster.personality || "aggressive";
  return balanceEnemyFromPlayerBase({
    monster,
    scaled,
    playerProfile,
    regionStart,
    personality,
    focus: enemyDefenseMul(monster?.id),
  });
}

export function prepareEnemy(monster, regionMul, playerLevel, regionStart, regionId, sectorId = null, playerProfile = null) {
  const def = ENEMY_DEFS[monster.id] || {};
  const resolvedSector = sectorId || monster.sectorId || "A2";
  const baseRegionMul = { verde: 1, fria: 1.3, desierto: 1.6 }[regionId] || 1;
  const encounterMul = Math.max(0.8, Math.min(1.65, (regionMul || baseRegionMul) / baseRegionMul));
  const baseMonster = {
    ...monster,
    hp: def.hp || monster.hp || 10,
    attack: def.attack || monster.attack || 3,
    defense: def.defense || monster.defense || 1,
    energy: def.energy || monster.energy || 8,
    xp: def.xp || monster.xpReward || 15,
  };
  const scaled = scaleMonsterStats(baseMonster, {
    regionId,
    sectorId: resolvedSector,
    playerLevel: playerLevel || 1,
    boss: !!monster.boss,
    elite: !!monster.elite,
  });

  const balanced = balanceEnemyToPlayerBase(monster, scaled, playerProfile, regionStart || 1);
  const hp = Math.max(1, Math.round(balanced.hp * encounterMul));
  const baseAtk = Math.max(1, Math.round(balanced.attack * encounterMul));
  const physicalDefense = Math.max(0, Math.round(balanced.physicalDefense * encounterMul));
  const magicalDefense = Math.max(0, Math.round(balanced.magicalDefense * encounterMul));
  const energy = Math.max(1, Math.round((scaled.maxMp || scaled.energy || 8) * Math.min(1.25, encounterMul)));

  let abilities = [...(def.abilities || monster.abilities || [])];
  const regionBonus = REGION_ABILITY_BONUSES[regionId] || {};
  for (const [abilId, prob] of Object.entries(regionBonus)) {
    if (ENEMY_ABILITIES[abilId] && Math.random() < prob && !abilities.includes(abilId)) abilities.push(abilId);
  }

  const off = ENEMY_OFFENSE[monster.id] || { basic: "fisico", phys: true, mag: false };
  const physicalAttack = off.phys ? baseAtk : 0;
  const magicalAttack = off.mag ? baseAtk : 0;
  const basicAttackType = off.basic;

  return {
    ...monster,
    level: scaled.level,
    sectorId: resolvedSector,
    hp,
    maxHp: hp,
    attack: basicAttackType === "magico" ? magicalAttack : physicalAttack,
    defense: physicalDefense,
    physicalAttack,
    magicalAttack,
    physicalDefense,
    magicalDefense,
    basicAttackType,
    mp: energy,
    maxMp: energy,
    energy,
    crit: def.crit || monster.crit || 0.05,
    speed: def.speed || monster.speed || 1,
    personality: def.personality || monster.personality || "aggressive",
    abilities,
    // La dificultad adaptativa nunca aumenta la experiencia.
    xpReward: scaled.xpReward,
    lootBonus: def.lootBonus || monster.lootBonus || 0,
    shield: monster.shield || 0,
    _atlasScaled: true,
    _atlasPlayerAnchored: balanced.anchored,
    _atlasPlayerBase: balanced.anchor || null,
    _atlasBaseLevel: scaled._atlasBaseLevel,
  };
}

export function scaleEnemyForWorld(monster, mul, regionId) {
  const def = ENEMY_DEFS[monster.id] || {};
  const hp = Math.round((def.hp || monster.hp || 10) * mul);
  const attack = Math.round((def.attack || monster.attack || 3) * mul);
  const defense = Math.round((def.defense || monster.defense || 1) * mul);
  const energy = Math.round((def.energy || 8) * mul);

  let abilities = [...(def.abilities || [])];
  const regionBonus = REGION_ABILITY_BONUSES[regionId] || {};
  for (const [abilId, prob] of Object.entries(regionBonus)) {
    if (ENEMY_ABILITIES[abilId] && Math.random() < prob) {
      if (!abilities.includes(abilId)) abilities.push(abilId);
    }
  }

  const baseLvl = REGION_BASE_LEVEL[regionId] || 1;
  const lvlRange = REGION_LVL_RANGE[regionId] || 2;
  const level = monster.boss
    ? (REGION_BOSS_LEVEL[regionId] || 5)
    : (baseLvl + Math.floor(Math.random() * lvlRange));

  const off = ENEMY_OFFENSE[monster.id] || { basic: "fisico", phys: true, mag: false };
  const physicalAttack = off.phys ? Math.round((def.attack || monster.attack || 3) * mul) : 0;
  const magicalAttack = off.mag ? Math.round((def.attack || monster.attack || 3) * mul) : 0;
  const dmul = enemyDefenseMul(monster.id);
  const baseDefW = def.defense || monster.defense || 1;
  const physicalDefense = Math.round(baseDefW * mul * dmul.phys);
  const magicalDefense = Math.round(baseDefW * mul * dmul.mag);
  const basicAttackType = off.basic;
  return {
    ...monster,
    level,
    hp, maxHp: hp,
    attack: basicAttackType === "magico" ? magicalAttack : physicalAttack,
    defense: physicalDefense,
    physicalAttack, magicalAttack, physicalDefense, magicalDefense, basicAttackType,
    mp: energy, maxMp: energy, energy,
    crit: def.crit || 0.05,
    speed: def.speed || 1,
    personality: def.personality || "aggressive",
    abilities,
    xpReward: Math.round((def.xp || 15) * mul),
    lootBonus: def.lootBonus || 0,
    shield: 0,
  };
}

export function getRegionMonsters(regionId, allMonsters) {
  const pool = REGION_POOLS[regionId] || REGION_POOLS.verde;
  return pool.map(id => allMonsters.find(m => m.id === id)).filter(Boolean);
}

export function randomRegionMonster(regionId, allMonsters) {
  const pool = getRegionMonsters(regionId, allMonsters);
  return pool[Math.floor(Math.random() * pool.length)] || allMonsters[0];
}

export function decideEnemyAction(enemy, roll) {
  const level = enemy.level || 1;
  const personality = PERSONALITIES[enemy.personality] || PERSONALITIES.aggressive;

  const availableAbilities = (enemy.abilities || [])
    .map((id, idx) => ({ ability: ENEMY_ABILITIES[id], idx }))
    .filter(a => a.ability && level >= (ENEMY_ABILITY_UNLOCK[a.idx] || 15) && (enemy.mp || 0) >= a.ability.cost)
    .map(a => a.ability);

  if (availableAbilities.length === 0) {
    return { type: "basic" };
  }

  const rollBonus = roll >= 16 ? 0.2 : roll >= 12 ? 0.1 : 0;

  let baseChance;
  if (level <= 2) baseChance = 0.10;
  else if (level <= 4) baseChance = 0.20;
  else if (level <= 9) baseChance = personality.abilityChance;
  else baseChance = Math.min(0.85, personality.abilityChance + 0.15);

  if (enemy.boss) baseChance = Math.min(0.9, baseChance + 0.10);

  const chance = personality.name === "Impredecible"
    ? Math.random() * 0.7 + 0.15
    : Math.min(0.85, baseChance + rollBonus);

  if (Math.random() < chance) {
    let ability;
    if (personality.name === "Mágico" || personality.name === "Táctico") {
      const statusAbilities = availableAbilities.filter(a => a.effect?.status);
      ability = statusAbilities.length > 0 && Math.random() < 0.6
        ? statusAbilities[Math.floor(Math.random() * statusAbilities.length)]
        : availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
    } else if (personality.name === "Agresivo") {
      const sorted = [...availableAbilities].sort((a, b) => (b.effect?.damage || 0) - (a.effect?.damage || 0));
      ability = sorted[0];
    } else {
      ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
    }
    return { type: "ability", ability };
  }

  return { type: "basic" };
}

// Resolución canónica de la habilidad de un enemigo (Atlas Alpha 1.0).
// El dado (1d20) determina la CALIDAD del impacto. El daño sigue la misma fórmula
// que el jugador. Fallo crítico = 0 daño + contraataque. El ATK efectivo conserva
// el multiplicador de la habilidad (datos intactos). Sanar/escudo son efectos
// propios no dañinos y se aplican siempre; el estado solo si no hubo fallo.
export function executeEnemyAbility(enemy, ability, player, roll) {
  const eff = ability.effect || {};
  const quality = resolveD20Quality(roll);
  const qId = quality.id; // Solo 20 natural es crítico en tiradas 1d20.
  const effAtk = Math.max(0, Math.round((enemy.attack || 0) * (eff.damage || 1)));
  const res = resolveAttack({
    qualityId: qId,
    atk: effAtk,
    def: player.defense || 0,
    opponentAtk: player.attack || 0,
    opponentDef: enemy.defense || 0,
    rollTotal: roll,
    forceCritical: roll === 20,
  });

  let heal = 0;
  if (eff.heal && enemy.hp <= enemy.maxHp * 0.4) {
    heal = Math.round(enemy.maxHp * eff.heal);
  }
  let selfShield = 0;
  if (eff.selfShield) selfShield = eff.selfShield;

  let statusApplied = null;
  if (!res.isFalloCritico && eff.status) {
    const s = eff.status;
    const chance = s.chance != null ? s.chance : 1;
    if (Math.random() < chance) {
      statusApplied = { type: s.type, duration: s.duration, amount: s.amount || 1 };
    }
  }

  return {
    damage: res.damage,
    isCrit: qId === QUALITY.critico.id,
    isFallo: res.isFalloCritico,
    counter: res.counter,
    quality: qId,
    heal, selfShield, status: statusApplied, ability,
  };
}

// Resolución canónica del ataque básico de un enemigo (Atlas Alpha 1.0).
// Mismo daño que el jugador. Fallo crítico = 0 daño + contraataque del jugador.
export function executeEnemyBasicAttack(enemy, player, roll) {
  const quality = resolveD20Quality(roll);
  const qId = quality.id; // Solo 20 natural es crítico en tiradas 1d20.
  const res = resolveAttack({
    qualityId: qId,
    atk: enemy.attack,
    def: player.defense || 0,
    opponentAtk: player.attack || 0,
    opponentDef: enemy.defense || 0,
    rollTotal: roll,
    forceCritical: roll === 20,
  });
  return {
    damage: res.damage,
    isCrit: qId === QUALITY.critico.id,
    isFallo: res.isFalloCritico,
    counter: res.counter,
    quality: qId,
  };
}

export const STATUS_INFO = {
  burn: { name: "Quemadura", icon: "flame", color: "#ff6a1a", desc: "Recibe daño cada turno." },
  poison: { name: "Veneno", icon: "skull", color: "#22c55e", desc: "Recibe daño cada turno." },
  freeze: { name: "Congelación", icon: "snowflake", color: "#7dd3fc", desc: "No puede actuar." },
  slow: { name: "Ralentización", icon: "wind", color: "#a78bfa", desc: "Defensa reducida." },
  shock: { name: "Aturdimiento", icon: "zap", color: "#fbbf24", desc: "Ataque reducido." },
  stun: { name: "Parálisis", icon: "brain", color: "#f472b6", desc: "No puede actuar." },
};

export function tickPlayerStatuses(statuses) {
  if (!statuses) return { damage: 0, canAct: true, blockedBy: null, logs: [], expired: [], nextStatuses: {} };
  let damage = 0;
  const logs = [];
  const expired = [];
  const next = {};
  // El bloqueo se evalúa ANTES de reducir duración. Una parálisis de 1 turno
  // debe consumir exactamente una acción, no desaparecer antes de aplicarse.
  const blockedBy = statuses.freeze ? "freeze" : statuses.stun ? "stun" : null;

  for (const [type, s] of Object.entries(statuses)) {
    const info = STATUS_INFO[type];
    if (type === "burn" || type === "poison") {
      damage += s.amount || 1;
      logs.push(`${info?.name || type}: -${s.amount || 1} HP`);
    }
    const newDur = Math.max(0, Number(s.duration || 0) - 1);
    if (newDur > 0) next[type] = { ...s, duration: newDur };
    else expired.push(type);
  }

  if (blockedBy) logs.push(`${STATUS_INFO[blockedBy].name}: tu acción falla automáticamente.`);
  return { damage, canAct: !blockedBy, blockedBy, logs, expired, nextStatuses: next };
}

export function statusDefMod(statuses) {
  if (!statuses?.slow) return 0;
  return -(statuses.slow.amount || 1);
}

export function statusAtkMod(statuses) {
  if (!statuses?.shock) return 0;
  return -(statuses.shock.amount || 1);
}

export function enemyEnergyRegen(enemy) {
  const personality = PERSONALITIES[enemy.personality] || PERSONALITIES.aggressive;
  return personality.energyRegen || 1;
}