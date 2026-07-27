// PROYECTO ATLAS — Orden de profundidad 2.5D por eje Y.
// Norte (Y menor) queda detrás. Sur (Y mayor) queda delante.

export const ATLAS_WORLD_DEPTH_BASE = 1000;
export const ATLAS_WORLD_DEPTH_STEP = 10;

export function getWorldDepth(y = 0, offset = 0) {
  const safeY = Number.isFinite(Number(y)) ? Number(y) : 0;
  const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 0;
  return ATLAS_WORLD_DEPTH_BASE
    + Math.round(safeY * ATLAS_WORLD_DEPTH_STEP)
    + Math.round(safeOffset);
}

export function setWorldDepth(element, y = 0, offset = 0) {
  if (!element) return;
  element.style.zIndex = String(getWorldDepth(y, offset));
}

export function getObjectDepth(item = {}) {
  const layer = item.layer || "solid";
  const depthY = item.depthY ?? item.y ?? 0;
  const offsetByLayer = {
    back: -3,
    solid: 0,
    world: 0,
    front: 3,
    foreground: 3,
    overlay: 6,
    fx: 12,
  };
  return getWorldDepth(depthY, (offsetByLayer[layer] || 0) + (item.zOffset || 0));
}
