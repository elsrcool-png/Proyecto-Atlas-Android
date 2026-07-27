// PROYECTO ATLAS — Encuentros obligatorios anclados a misiones.
// Evita depender del respawn ambiental para objetivos de defensa o asedio.
import { MONSTERS } from "@/lib/atlasData";
import { resolveAccessibleTarget } from "@/lib/atlasAccessibility";

const byId = (id) => MONSTERS.find(m => m.id === id) || MONSTERS[0];

function missionEnemy(world, id, monsterId, x, y, options = {}) {
  const base = byId(monsterId);
  const pos = resolveAccessibleTarget(world, { id, x, y, label: options.name || base.name });
  const level = options.level || 16;
  const hpMul = options.hpMul || 1.75;
  const atkMul = options.atkMul || 1.35;
  const defMul = options.defMul || 1.4;
  const hp = Math.max(1, Math.round((base.hp || 8) * hpMul));
  return {
    id,
    x: pos.x,
    y: pos.y,
    angle: 0,
    timer: 90,
    missionOnly: true,
    monster: {
      ...base,
      id: monsterId,
      name: options.name || base.name,
      hp,
      maxHp: hp,
      attack: Math.max(1, Math.round((base.attack || 3) * atkMul)),
      defense: Math.max(1, Math.round((base.defense || 1) * defMul)),
      physicalDefense: Math.max(1, Math.round((base.defense || 1) * defMul)),
      magicalDefense: Math.max(1, Math.round((base.defense || 1) * (options.magDefMul || defMul))),
      level,
      xpReward: options.xpReward || 22,
      missionTag: "fria_f13_defensa_ciudadela",
      missionSpawnId: id,
      elite: !!options.elite,
    },
  };
}

export function getMissionEncounterEnemies({ regionId, sectorId, missionId, objectiveId, world }) {
  if (!world) return null;
  if (regionId === "fria" && sectorId === "B2" && missionId === "f13" && objectiveId === "repela_criaturas") {
    return [
      missionEnemy(world, "fria_f13_1", "lobo_salvaje", 250, 555, { name: "Sabueso de Escarcha", level: 16 }),
      missionEnemy(world, "fria_f13_2", "lobo_salvaje", 715, 545, { name: "Sabueso de Escarcha", level: 16 }),
      missionEnemy(world, "fria_f13_3", "guerrero_esqueletico", 205, 300, { name: "Bestia de Cristal", level: 16, hpMul: 1.65 }),
      missionEnemy(world, "fria_f13_4", "guerrero_esqueletico", 765, 310, { name: "Bestia de Cristal", level: 16, hpMul: 1.65 }),
      missionEnemy(world, "fria_f13_5", "orco_bruto", 505, 185, { name: "Guardián Glacial", level: 17, hpMul: 2.1, atkMul: 1.55, defMul: 1.55, elite: true, xpReward: 30 }),
    ];
  }
  return null;
}
