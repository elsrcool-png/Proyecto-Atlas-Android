// PROYECTO ATLAS — Catálogo de producción de Región Árida v1.0.
// Integra activos aprobados sin imponer posiciones, rutas ni composición de mapas.

export const ARID_TERRAIN_ROOT = "/assets/atlas/desierto/maestro_v1/terrains";
export const ARID_ACTIVE_TERRAIN_ROOT = "/assets/atlas/desierto/modular_v27";
export const ARID_NPC_ROOT = "/assets/atlas/npcs/region_arida/maestro_v1/runtime";

export const ARID_TERRAIN_IDS = Object.freeze([
  "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3",
]);

export const ARID_NPC_IDS = Object.freeze([
  "nayla", "nomada_desierto", "explorador_kael", "guia_ilyan", "nomada_sahara",
  "herrero_rashid", "posadera_laila", "guardian_oasis", "beduina_dara", "mercader_nomada",
  "historiador_aran", "mercader_oasis", "artesana_cristales", "comerciante_dara", "guardiana_desierto",
  "anfitriona_ruinas", "faraon_solar", "posadera_sahara", "sacerdote_solar", "mercader_desierto",
]);

export const ARID_OBJECT_SOURCE_STATUS = Object.freeze({
  individualSources: 31,
  groupedSources: 10,
  runtimeReady: false,
  reason: "Requieren transparencia real, separación, escala, anclaje, sombras, colisiones y exportación WebP.",
});

export const ARID_PRODUCTION_STATUS = Object.freeze({
  version: "2.27.0",
  terrainBases: { count: 9, runtimeReady: true, active: true },
  npcMasters: { count: 20, directionCount: 80, runtimeReady: true, connectedVariants: 16 },
  objects: ARID_OBJECT_SOURCE_STATUS,
  enemies: { runtimeReady: false, reason: "Diseños todavía pendientes de aprobación canónica." },
  miniBosses: { runtimeReady: false, reason: "Diseños todavía pendientes de producción." },
  regionalBoss: { id: "amon", runtimeReady: false, reason: "Modelo maestro y fases pendientes." },
  combatBackgrounds: { runtimeReady: false },
  mapComposition: { owner: "user", status: "pending_user_composition", modifiedByIntegration: false },
});

export function getAridTerrainPath(sectorId, { active = true } = {}) {
  const normalized = String(sectorId || "").toUpperCase();
  if (!ARID_TERRAIN_IDS.includes(normalized)) return null;
  const root = active ? ARID_ACTIVE_TERRAIN_ROOT : ARID_TERRAIN_ROOT;
  return `${root}/terrain_${normalized.toLowerCase()}.webp`;
}

export function getAridNpcPaths(npcId) {
  if (!ARID_NPC_IDS.includes(npcId)) return null;
  return Object.freeze({
    down: `${ARID_NPC_ROOT}/${npcId}/idle_down.webp`,
    up: `${ARID_NPC_ROOT}/${npcId}/idle_up.webp`,
    left: `${ARID_NPC_ROOT}/${npcId}/idle_left.webp`,
    right: `${ARID_NPC_ROOT}/${npcId}/idle_right.webp`,
  });
}
