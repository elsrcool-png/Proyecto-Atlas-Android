// PROYECTO ATLAS — Fondos maestros para el nodo de combate v1.
// Las láminas anotadas permanecen en docs; runtime usa derivados limpios 1280×720.

export const COMBAT_BACKGROUND_ROOT = "/assets/atlas/combat/backgrounds/v1";

const SCENES = Object.freeze({
  verde_bosque: Object.freeze({
    id: "verde_bosque",
    path: `${COMBAT_BACKGROUND_ROOT}/region_verde_bosque.webp`,
    position: "center 48%",
    positionLandscape: "center 50%",
    playerSide: "right",
    enemySide: "left",
  }),
  verde_guardian: Object.freeze({
    id: "verde_guardian",
    path: `${COMBAT_BACKGROUND_ROOT}/region_verde_guardian.webp`,
    position: "center 45%",
    positionLandscape: "center 48%",
    playerSide: "right",
    enemySide: "left",
  }),
  fria_tundra: Object.freeze({
    id: "fria_tundra",
    path: `${COMBAT_BACKGROUND_ROOT}/region_artica_tundra.webp`,
    position: "center 46%",
    positionLandscape: "center 49%",
    playerSide: "right",
    enemySide: "left",
  }),
  fria_aurel: Object.freeze({
    id: "fria_aurel",
    path: `${COMBAT_BACKGROUND_ROOT}/region_artica_aurel.webp`,
    position: "center 43%",
    positionLandscape: "center 47%",
    playerSide: "right",
    enemySide: "left",
  }),
});

export function resolveCombatScene(regionId, enemy) {
  const id = String(enemy?.id || "").toLowerCase();
  if (regionId === "verde" && id === "guardian_verde") return SCENES.verde_guardian;
  if (regionId === "fria" && (id === "aurel_portador" || id === "aurel_ultimo_portador")) {
    return SCENES.fria_aurel;
  }
  if (regionId === "fria") return SCENES.fria_tundra;
  if (regionId === "verde") return SCENES.verde_bosque;
  return null;
}

export const ATLAS_COMBAT_SCENE_AUDIT = Object.freeze({
  runtimeSize: [1280, 720],
  scenes: SCENES,
  fallbackPolicy: "Regiones sin fondo maestro conservan gradiente procedural.",
});
