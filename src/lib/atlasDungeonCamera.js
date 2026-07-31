// PROYECTO ATLAS — Cámara canónica de Dungeon v2.
// Cámara cercana, orientación fija y seguimiento centrado. La dirección de
// entrada solo define el lado conceptual de cámara para la oclusión; la vista
// mantiene siempre al jugador en el centro durante exploración y combate.

export const DUNGEON_CAMERA_VERSION = 2;

const CARDINALS = Object.freeze([
  { key: "up", dx: 0, dy: -1 },
  { key: "down", dx: 0, dy: 1 },
  { key: "left", dx: -1, dy: 0 },
  { key: "right", dx: 1, dy: 0 },
]);

const WALKABLE = new Set([".", "S", "E", "C", "M", "B", "O", "P", "D", "T"]);

function tileAt(dungeon, x, y) {
  if (!dungeon || x < 0 || y < 0 || x >= dungeon.cols || y >= dungeon.rows) return null;
  return dungeon.tiles?.[y]?.[x] ?? null;
}

function isCameraWalkable(dungeon, x, y) {
  return WALKABLE.has(tileAt(dungeon, x, y));
}

function centerScore(dungeon, x, y) {
  const cx = Math.max(0, (Number(dungeon?.cols || 1) - 1) / 2);
  const cy = Math.max(0, (Number(dungeon?.rows || 1) - 1) / 2);
  return Math.hypot(x - cx, y - cy);
}

/**
 * Detecta la dirección de entrada más probable. Solo se usa para resolver el
 * lado conceptual de la cámara y la oclusión; la vista no rota después.
 */
export function inferDungeonEntryFacing(dungeon, spawn = dungeon?.spawn || { x: 1, y: 1 }) {
  const explicit = dungeon?.cameraProfile?.entryFacing || dungeon?.entryFacing;
  if (CARDINALS.some((entry) => entry.key === explicit)) return explicit;

  const candidates = CARDINALS
    .map((entry) => ({ ...entry, x: spawn.x + entry.dx, y: spawn.y + entry.dy }))
    .filter((entry) => isCameraWalkable(dungeon, entry.x, entry.y))
    .sort((a, b) => centerScore(dungeon, a.x, a.y) - centerScore(dungeon, b.x, b.y));

  return candidates[0]?.key || "up";
}

function cameraSideForEntryFacing(entryFacing) {
  if (entryFacing === "down") return "north";
  if (entryFacing === "left") return "east";
  if (entryFacing === "right") return "west";
  return "south";
}

export function resolveDungeonCameraProfile(dungeon, viewport = {}) {
  const width = Math.max(320, Number(viewport.w || viewport.width || 720));
  const height = Math.max(240, Number(viewport.h || viewport.height || 480));
  const entryFacing = inferDungeonEntryFacing(dungeon, dungeon?.spawn || { x: 1, y: 1 });
  const compact = width < 640 || height < 390;
  const medium = width < 1024;
  const explicit = dungeon?.cameraProfile || {};

  return Object.freeze({
    version: DUNGEON_CAMERA_VERSION,
    mode: "fixed_close_center_follow",
    entryFacing,
    cameraSide: explicit.cameraSide || cameraSideForEntryFacing(entryFacing),
    anchorX: Number(explicit.anchorX ?? 0.5),
    anchorY: Number(explicit.anchorY ?? 0.5),
    zoom: Number(explicit.zoom ?? (compact ? 1.32 : medium ? 1.38 : 1.44)),
    wallHeight: Number(explicit.wallHeight ?? (compact ? 28 : 34)),
    deadZonePx: 0,
    followMs: Number(explicit.followMs ?? 105),
    keepPlayerCentered: explicit.keepPlayerCentered !== false,
    minOccludedOpacity: Number(explicit.minOccludedOpacity ?? 0.34),
    maxShake: Number(explicit.maxShake ?? 0.72),
  });
}

/**
 * Calcula un transform centrado. No se limita al borde del mapa porque ese
 * clamp desplazaba al jugador hacia una esquina al aproximarse a una pared.
 * El vacío fuera del mapa permanece negro, pero el personaje conserva siempre
 * la posición central solicitada.
 */
export function calculateDungeonCameraTransform({ dungeon, pos, viewport, tileSize, profile }) {
  const w = Math.max(1, Number(viewport?.w || viewport?.width || 1));
  const h = Math.max(1, Number(viewport?.h || viewport?.height || 1));
  const t = Math.max(1, Number(tileSize || 40));
  const zoom = Math.max(0.8, Number(profile?.zoom || 1));
  const gridW = Math.max(t, Number(dungeon?.cols || 1) * t);
  const gridH = Math.max(t, Number(dungeon?.rows || 1) * t);
  const focusX = (Number(pos?.x || 0) * t) + t / 2;
  const focusY = (Number(pos?.y || 0) * t) + t / 2;
  const anchorX = Number(profile?.anchorX ?? 0.5);
  const anchorY = Number(profile?.anchorY ?? 0.5);

  const x = w * anchorX - zoom * focusX;
  const y = h * anchorY - zoom * focusY;
  const scaledW = gridW * zoom;
  const scaledH = gridH * zoom;

  return Object.freeze({
    x,
    y,
    zoom,
    gridW,
    gridH,
    scaledW,
    scaledH,
    focusScreenX: x + zoom * focusX,
    focusScreenY: y + zoom * focusY,
  });
}

export function dungeonCameraVector(cameraSide) {
  if (cameraSide === "north") return { x: 0, y: -1 };
  if (cameraSide === "east") return { x: 1, y: 0 };
  if (cameraSide === "west") return { x: -1, y: 0 };
  return { x: 0, y: 1 };
}
