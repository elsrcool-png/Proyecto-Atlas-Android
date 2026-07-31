// PROYECTO ATLAS — Cámara canónica de Dungeon v1.
// Una sola cámara cercana para exploración y combate. La orientación visual
// se fija al entrar y nunca persigue la dirección posterior del personaje.

export const DUNGEON_CAMERA_VERSION = 1;

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
 * Detecta la dirección de entrada más probable. Se usa una sola vez para
 * colocar la cámara detrás del personaje; después el perfil queda congelado.
 */
export function inferDungeonEntryFacing(dungeon, spawn = dungeon?.spawn || { x: 1, y: 1 }) {
  const explicit = dungeon?.cameraProfile?.entryFacing || dungeon?.entryFacing;
  if (CARDINALS.some((entry) => entry.key === explicit)) return explicit;

  const candidates = CARDINALS
    .map((entry) => ({
      ...entry,
      x: spawn.x + entry.dx,
      y: spawn.y + entry.dy,
    }))
    .filter((entry) => isCameraWalkable(dungeon, entry.x, entry.y))
    .sort((a, b) => centerScore(dungeon, a.x, a.y) - centerScore(dungeon, b.x, b.y));

  return candidates[0]?.key || "up";
}

function anchorForEntryFacing(entryFacing) {
  // La cámara conceptual está al lado contrario del avance inicial.
  // El personaje queda en el tercio próximo a la cámara y se ve más terreno delante.
  if (entryFacing === "down") return { x: 0.5, y: 0.34, cameraSide: "north" };
  if (entryFacing === "left") return { x: 0.68, y: 0.52, cameraSide: "east" };
  if (entryFacing === "right") return { x: 0.32, y: 0.52, cameraSide: "west" };
  return { x: 0.5, y: 0.68, cameraSide: "south" };
}

export function resolveDungeonCameraProfile(dungeon, viewport = {}) {
  const width = Math.max(320, Number(viewport.w || viewport.width || 720));
  const height = Math.max(240, Number(viewport.h || viewport.height || 480));
  const entryFacing = inferDungeonEntryFacing(dungeon, dungeon?.spawn || { x: 1, y: 1 });
  const anchor = anchorForEntryFacing(entryFacing);
  const compact = width < 640 || height < 390;
  const medium = width < 1024;
  const explicit = dungeon?.cameraProfile || {};

  return Object.freeze({
    version: DUNGEON_CAMERA_VERSION,
    mode: "fixed_close_follow",
    entryFacing,
    cameraSide: explicit.cameraSide || anchor.cameraSide,
    anchorX: Number(explicit.anchorX ?? anchor.x),
    anchorY: Number(explicit.anchorY ?? anchor.y),
    zoom: Number(explicit.zoom ?? (compact ? 1.14 : medium ? 1.24 : 1.32)),
    wallHeight: Number(explicit.wallHeight ?? (compact ? 24 : 30)),
    deadZonePx: Number(explicit.deadZonePx ?? (compact ? 4 : 8)),
    followMs: Number(explicit.followMs ?? 165),
    minOccludedOpacity: Number(explicit.minOccludedOpacity ?? 0.34),
    maxShake: Number(explicit.maxShake ?? 0.72),
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calcula un transform estable y limitado. La cámara solo cambia de posición;
 * no rota ni altera su perfil al entrar en combate.
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

  let x = w * Number(profile?.anchorX ?? 0.5) - zoom * focusX;
  let y = h * Number(profile?.anchorY ?? 0.62) - zoom * focusY;
  const scaledW = gridW * zoom;
  const scaledH = gridH * zoom;

  if (scaledW <= w) x = (w - scaledW) / 2;
  else x = clamp(x, w - scaledW, 0);
  if (scaledH <= h) y = (h - scaledH) / 2;
  else y = clamp(y, h - scaledH, 0);

  return Object.freeze({ x, y, zoom, gridW, gridH, scaledW, scaledH });
}

export function dungeonCameraVector(cameraSide) {
  if (cameraSide === "north") return { x: 0, y: -1 };
  if (cameraSide === "east") return { x: 1, y: 0 };
  if (cameraSide === "west") return { x: -1, y: 0 };
  return { x: 0, y: 1 };
}
