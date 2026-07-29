// PROYECTO ATLAS — Sistema de Dungeons consolidado v2.
// - Las dungeons opcionales se habilitan al completar su región.
// - La dungeon de acceso al jefe Verde es la excepción narrativa.
// - El piso final de la ruta al jefe contiene un Santuario de Umbral.

import { generateDungeonFloor as generateProceduralFloor } from "@/lib/atlasDungeonGen";
import { GREEN_DUNGEON_ENEMY_POOLS } from "@/lib/atlasGreenBestiary";

export const DUNGEON_TILE = 40;

const def = (id, name, regionId, sectorId, options = {}) => ({
  id, name, regionId, sectorId,
  enemyPool: options.enemyPool || [],
  bossId: options.bossId || null,
  objectiveStoryPointId: options.objectiveStoryPointId || null,
  entrancePos: options.entrancePos || { x: 480, y: 480 },
  floorCount: options.floorCount || 1,
  biome: options.biome || regionId,
  optional: options.optional !== false,
  gatewayToBoss: !!options.gatewayToBoss,
  finalSanctuary: !!options.finalSanctuary,
  requiredFlag: options.requiredFlag || null,
});

export const DUNGEONS = {
  verde_b1: def("verde_b1", "Ruinas del Vigía", "verde", "B1", {
    enemyPool: [...GREEN_DUNGEON_ENEMY_POOLS.verde_b1],
    bossId: "brujo_feral",
    objectiveStoryPointId: "verde_b1_inscripcion",
    entrancePos: { x: 360, y: 495 },
    floorCount: 3,
  }),
  verde_c1: def("verde_c1", "Guarida del Cazador Marchito", "verde", "C1", {
    enemyPool: [...GREEN_DUNGEON_ENEMY_POOLS.verde_c1],
    bossId: "pantera_sombria",
    objectiveStoryPointId: "verde_c1_santuario",
    entrancePos: { x: 390, y: 500 },
    floorCount: 3,
  }),
  verde_b3: def("verde_b3", "Paso del Río Antiguo", "verde", "B3", {
    enemyPool: [...GREEN_DUNGEON_ENEMY_POOLS.verde_b3],
    objectiveStoryPointId: "verde_b3_nodo_raiz_1",
    entrancePos: { x: 470, y: 410 },
    floorCount: 2,
  }),
  // Excepción: esta es la ruta de campaña hacia el Guardián Verde.
  verde_c3: def("verde_c3", "Raíces del Umbral", "verde", "C3", {
    enemyPool: [...GREEN_DUNGEON_ENEMY_POOLS.verde_c3],
    entrancePos: { x: 505, y: 505 },
    floorCount: 2,
    optional: false,
    gatewayToBoss: true,
    finalSanctuary: true,
  }),
  fria_c1: def("fria_c1", "Estación del Mensajero", "fria", "C1", {
    enemyPool: ["guerrero_esqueletico", "asesino_esqueletico", "necromante"],
    bossId: "guerrero_esqueletico",
    objectiveStoryPointId: "fria_c1_mensajero",
    entrancePos: { x: 480, y: 360 },
    floorCount: 2,
  }),
  desierto_c1: def("desierto_c1", "Tumba del Sol Primero", "desierto", "C1", {
    enemyPool: ["asesino_esqueletico", "guerrero_esqueletico", "necromante"],
    bossId: "asesino_esqueletico",
    objectiveStoryPointId: "desierto_c1_tumba",
    entrancePos: { x: 480, y: 360 },
    floorCount: 2,
  }),
};

export function getDungeonForSector(regionId, sectorId) {
  for (const d of Object.values(DUNGEONS)) {
    if (d.regionId === regionId && d.sectorId === sectorId) return d;
  }
  return null;
}

export function getDungeonById(id) {
  return DUNGEONS[id] || null;
}

/**
 * Estado canónico de acceso a una dungeon.
 * Las opcionales son contenido de post-región. La ruta al jefe es accesible
 * cuando la misión principal ya abrió C3, pero deja de ser necesaria tras vencerlo.
 */
export function getDungeonAccessState(dungeonOrId, context = {}) {
  const dungeon = typeof dungeonOrId === "string" ? getDungeonById(dungeonOrId) : dungeonOrId;
  if (!dungeon) return { unlocked: false, reason: "Dungeon no encontrada.", mode: "missing" };

  const flags = context.worldFlags || {};
  const bossDefeated = !!context.bossDefeated || !!flags[`${dungeon.regionId}:boss_defeated`] || !!flags[`${dungeon.regionId}:restored`];
  const bossUnlocked = !!context.bossUnlocked || !!flags[`${dungeon.regionId}:boss_gate_ready`] || !!flags[`${dungeon.regionId}:boss_preparation_ready`];

  if (dungeon.gatewayToBoss) {
    if (bossDefeated) return { unlocked: false, reason: "El Guardián ya fue liberado. El Umbral permanece en calma.", mode: "completed" };
    if (!bossUnlocked) return { unlocked: false, reason: "Las raíces del Umbral siguen selladas. Completa la preparación contra el jefe.", mode: "story_locked" };
    return { unlocked: true, reason: null, mode: "boss_gateway" };
  }

  if (dungeon.requiredFlag && !flags[dungeon.requiredFlag]) {
    return { unlocked: false, reason: "Aún no has cumplido el requisito de esta dungeon.", mode: "flag_locked" };
  }

  if (!bossDefeated) {
    return {
      unlocked: false,
      reason: "Las dungeons opcionales se abren después de liberar esta región.",
      mode: "post_region_locked",
    };
  }

  return { unlocked: true, reason: null, mode: "post_region" };
}

export function generateDungeonFloor(archetype, floor, seed) {
  return generateProceduralFloor(archetype, floor, seed);
}

export function generateFloor(archetypeId, floor, seed) {
  return generateDungeonFloor(DUNGEONS[archetypeId], floor, seed);
}

export function isWalkable(dungeon, x, y) {
  if (!dungeon) return false;
  if (x < 0 || y < 0 || x >= dungeon.cols || y >= dungeon.rows) return false;
  const row = dungeon.tiles[y];
  if (!row) return false;
  const ch = row[x];
  if (ch === undefined || ch === "#" || ch === " " || ch === "L") return false;
  // '.', 'S', 'E', 'C', 'M', 'B', 'O', 'P', 'D', 'T' son transitables.
  return true;
}

export function getEntities(dungeon) {
  const enemies = [];
  const chests = [];
  const doors = [];
  const traps = [];
  let spawn = dungeon?.spawn ? { x: dungeon.spawn.x, y: dungeon.spawn.y } : { x: 1, y: 1 };
  let exit = dungeon?.stairs ? { x: dungeon.stairs.x, y: dungeon.stairs.y } : { x: 1, y: 1 };
  let objective = null;
  let boss = null;
  let sanctuary = null;
  if (!dungeon) return { enemies, chests, doors, traps, spawn, exit, objective, boss, sanctuary, hasLockedDoors: false };

  for (let y = 0; y < dungeon.rows; y++) {
    const row = dungeon.tiles[y] || "";
    for (let x = 0; x < dungeon.cols; x++) {
      const ch = row[x];
      if (ch === "S") spawn = { x, y };
      else if (ch === "E") exit = { x, y };
      else if (ch === "C") chests.push({ id: `${dungeon.id}_chest_${x}_${y}`, x, y, type: "common" });
      else if (ch === "L") doors.push({ id: `${dungeon.id}_door_${x}_${y}`, x, y });
      else if (ch === "T") traps.push({ id: `${dungeon.id}_trap_${x}_${y}`, x, y });
      else if (ch === "M") {
        const pool = dungeon.enemyPool || [];
        enemies.push({ id: `${dungeon.id}_enemy_${x}_${y}`, x, y, monsterId: pool[enemies.length % pool.length] || "lobo_salvaje" });
      } else if (ch === "B") boss = { x, y, monsterId: dungeon.bossId || "pantera_sombria" };
      else if (ch === "O") objective = { x, y, storyPointId: dungeon.objectiveStoryPointId };
      else if (ch === "P") sanctuary = { x, y, id: `${dungeon.baseId || dungeon.id}_final_sanctuary` };
    }
  }
  const hasLockedDoors = doors.length > 0;
  if (boss) boss.keyHolder = hasLockedDoors;
  return { enemies, chests, doors, traps, spawn, exit, objective, boss, sanctuary, hasLockedDoors };
}
