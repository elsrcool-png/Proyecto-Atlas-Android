// PROYECTO ATLAS — Encuentros obligatorios anclados a misiones (v2.23.0).
// Los objetivos de eliminación ya no dependen de mobs ambientales ni del sueño.
import { MONSTERS } from "@/lib/atlasData";
import { resolveAccessibleTarget } from "@/lib/atlasAccessibility";

const byId = (id) => MONSTERS.find(m => m.id === id) || MONSTERS[0];

const REGION_ENCOUNTER = Object.freeze({
  verde: {
    pool: ["lobo_salvaje", "orco_bruto", "chaman_orco"],
    level: 6, hpMul: 1.15, atkMul: 1.05, defMul: 1.0,
    names: ["Acechador Corrupto", "Saqueador de Raíces", "Guardián Marchito"],
  },
  fria: {
    pool: ["guerrero_esqueletico", "pantera_sombria", "necromante"],
    level: 15, hpMul: 1.35, atkMul: 1.15, defMul: 1.15,
    names: ["Sabueso de Escarcha", "Bestia de Cristal", "Custodio Boreal"],
  },
  desierto: {
    pool: ["orco_bruto", "asesino_esqueletico", "necromante"],
    level: 20, hpMul: 1.55, atkMul: 1.25, defMul: 1.2,
    names: ["Asaltante de Ceniza", "Depredador de Obsidiana", "Custodio del Sol Negro"],
  },
});

function encounterAnchor(world, index, count) {
  const cx = world.safeCenter?.x ?? Math.round(world.W / 2);
  const cy = world.safeCenter?.y ?? Math.round(world.H / 2);
  const radius = Math.max(110, (world.safeRadius || 70) + 55);
  const angle = (-Math.PI / 2) + ((Math.PI * 2 * index) / Math.max(1, count));
  return {
    x: Math.max(35, Math.min(world.W - 35, cx + Math.cos(angle) * radius)),
    y: Math.max(35, Math.min(world.H - 35, cy + Math.sin(angle) * radius)),
  };
}

function missionEnemy({ world, regionId, missionId, objective, index, count }) {
  const cfg = REGION_ENCOUNTER[regionId] || REGION_ENCOUNTER.verde;
  const monsterId = cfg.pool[index % cfg.pool.length];
  const base = byId(monsterId);
  const id = `mission:${regionId}:${missionId}:${objective.id}:${index + 1}`;
  const anchor = encounterAnchor(world, index, count);
  const pos = resolveAccessibleTarget(world, { id, ...anchor, label: cfg.names[index % cfg.names.length] });
  const elite = count >= 4 && index === count - 1;
  const hpMul = cfg.hpMul * (elite ? 1.35 : 1);
  const atkMul = cfg.atkMul * (elite ? 1.12 : 1);
  const defMul = cfg.defMul * (elite ? 1.15 : 1);
  const hp = Math.max(1, Math.round((base.hp || 8) * hpMul));
  const baseAttack = base.attack || 3;
  const baseDefense = base.defense || 1;
  const missionTag = objective.targetId || base.id;

  return {
    id,
    x: pos.x,
    y: pos.y,
    angle: 0,
    timer: 90,
    missionOnly: true,
    combatAllowedInSafeZone: true,
    encounterGroupId: `mission:${regionId}:${missionId}:${objective.id}`,
    monster: {
      ...base,
      id: base.id,
      uid: id,
      name: elite ? `${cfg.names[index % cfg.names.length]} Veterano` : cfg.names[index % cfg.names.length],
      hp,
      maxHp: hp,
      attack: Math.max(1, Math.round(baseAttack * atkMul)),
      physicalAttack: Math.max(1, Math.round(baseAttack * atkMul)),
      magicalAttack: Math.max(0, Math.round((base.magicalAttack || 0) * atkMul)),
      defense: Math.max(1, Math.round(baseDefense * defMul)),
      physicalDefense: Math.max(1, Math.round((base.physicalDefense || baseDefense) * defMul)),
      magicalDefense: Math.max(1, Math.round((base.magicalDefense || baseDefense) * defMul)),
      level: Math.max(cfg.level, Number(base.level) || 1),
      xpReward: Math.max(12, Math.round((base.xpReward || base.xp || 16) * (elite ? 1.35 : 1))),
      missionTag,
      missionSpawnId: id,
      missionOnly: true,
      elite,
      _atlasScaled: true,
    },
  };
}

export function getMissionEncounterEnemies({ regionId, sectorId, missionId, objectiveId, objective, world }) {
  if (!world || !missionId || !objectiveId || objective?.type !== "kill") return null;
  if (objective.sectorId && objective.sectorId !== sectorId) return null;
  const count = Math.max(1, Math.min(8, Number(objective.count) || 1));
  return Array.from({ length: count }, (_, index) => missionEnemy({
    world, regionId, missionId, objective, index, count,
  }));
}
