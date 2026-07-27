// PROYECTO ATLAS — Motor de reglas
import { MONSTERS, TRAPS } from "@/lib/atlasData";
import { prepareEnemy, randomRegionMonster } from "@/lib/atlasEnemyAI";
import { resolveAttack } from "@/lib/atlasDamageSystem";

export const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;

export function getUmbralCritico(enemyAttack) {
  if (enemyAttack >= 10) return 16;
  if (enemyAttack >= 7) return 17;
  if (enemyAttack >= 5) return 18;
  return 19;
}

export function canTravel(topology, from, to) {
  return (topology[from] || []).includes(to);
}

export function resolveTravel(preRolled) {
  const roll = preRolled ?? rollDie(12);
  if (roll <= 4) return { roll, moves: 0, threatDelta: 1, log: `Viaje d12: ${roll} → Fallo. No avanzas. Amenaza +1.` };
  if (roll <= 8) return { roll, moves: 1, threatDelta: 0, log: `Viaje d12: ${roll} → Avanzas 1 nodo.` };
  return { roll, moves: 2, threatDelta: -1, log: `Viaje d12: ${roll} → ¡Viaje excepcional! Hasta 2 nodos. Amenaza -1.` };
}

// Resolución canónica del turno de ataque del jugador (Atlas Alpha 1.0).
// Recibe la calidad del impacto (de resolveQuality) — los dados determinan la
// calidad, no el daño. Fallo crítico = 0 daño + contraataque automático.
export function resolveCombatTurn(player, enemy, quality) {
  const res = resolveAttack({
    qualityId: quality.id,
    atk: player.attack,
    def: enemy.defense,
    opponentAtk: enemy.attack,
    opponentDef: player.defense,
  });
  if (res.isFalloCritico) {
    return {
      quality, type: "FALLO_CRÍTICO", enemyDamage: 0,
      playerDamage: res.counter.damage, counter: true,
      log: `Fallo crítico. ¡Contraataque! Recibes ${res.counter.damage} daño.`,
    };
  }
  const typeMap = { bajo: "BAJO", medio: "MEDIO", alto: "ALTO", critico: "CRÍTICO" };
  const type = typeMap[quality.id] || "BAJO";
  const redPct = res.reduction ? Math.round(res.reduction * 100) : 0;
  return {
    quality, type, enemyDamage: res.damage, playerDamage: 0, counter: false,
    log: `${quality.name}. Infliges ${res.damage} daño${redPct ? ` (presión −${redPct}%)` : ""}${quality.id === "critico" ? " — ignora DEF" : ""}.`,
  };
}

export function resolveEscape(player, enemy, preRolled) {
  const d20 = preRolled ?? rollDie(20);
  if (d20 > enemy.defense) return { d20, success: true, playerDamage: 0, log: `Escape. d20 ${d20} > Def ${enemy.defense}. Huyes.` };
  const dmg = Math.max(1, enemy.attack - player.defense);
  return { d20, success: false, playerDamage: dmg, log: `Escape fallido. d20 ${d20} ≤ Def ${enemy.defense}. Recibes ${dmg} daño.` };
}

export function resolveEncounter(node, threat, defeatedBosses, difficultyMul = 1, regionId = "verde", playerLevel = 1, regionStart = 1, playerProfile = null) {
  if (!node || node.safe) return null;
  if (node.boss && !defeatedBosses.has(node.boss.id)) {
    const b = node.boss;
    const data = prepareEnemy(b, difficultyMul, playerLevel, regionStart, regionId, null, playerProfile);
    return { type: "boss", data };
  }
  const chance = Math.min(0.80, 0.35 + threat * 0.05);
  if (Math.random() >= chance) return null;
  if (Math.random() < 0.7) {
    const m = randomRegionMonster(regionId, MONSTERS);
    const data = prepareEnemy(m, difficultyMul, playerLevel, regionStart, regionId, null, playerProfile);
    return { type: "monster", data };
  }
  const t = TRAPS[Math.floor(Math.random() * TRAPS.length)];
  return { type: "trap", data: { ...t, damage: Math.max(1, Math.round(t.damage * difficultyMul)) } };
}