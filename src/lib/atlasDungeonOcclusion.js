// PROYECTO ATLAS — Oclusión selectiva de paredes para cámara fija de Dungeon.

import { dungeonCameraVector } from "@/lib/atlasDungeonCamera";

export const DUNGEON_OCCLUSION_VERSION = 1;

export function isDungeonOccluderTile(ch) {
  return ch === "#" || ch === " " || ch === "L" || ch === "D";
}

function tileAt(dungeon, x, y) {
  if (!dungeon || x < 0 || y < 0 || x >= dungeon.cols || y >= dungeon.rows) return null;
  return dungeon.tiles?.[y]?.[x] ?? null;
}

function lineTiles(ax, ay, bx, by) {
  const out = [];
  let x = Math.round(ax), y = Math.round(ay);
  const tx = Math.round(bx), ty = Math.round(by);
  const dx = Math.abs(tx - x), dy = Math.abs(ty - y);
  const sx = x < tx ? 1 : -1, sy = y < ty ? 1 : -1;
  let err = dx - dy;
  for (let guard = 0; guard < 128; guard += 1) {
    out.push({ x, y });
    if (x === tx && y === ty) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return out;
}

function addOccluder(out, dungeon, x, y) {
  if (isDungeonOccluderTile(tileAt(dungeon, x, y))) out.add(`${x},${y}`);
}

/**
 * Devuelve solo los segmentos que bloquean jugador/objetivo crítico.
 * No vuelve transparente la sala completa.
 */
export function computeDungeonOcclusion(dungeon, criticalTargets = [], options = {}) {
  const out = new Set();
  const side = options.cameraSide || "south";
  const v = dungeonCameraVector(side);
  const rayLength = Math.max(3, Number(options.rayLength || 6));

  for (const target of criticalTargets.filter(Boolean)) {
    const tx = Number(target.x);
    const ty = Number(target.y);
    if (!Number.isFinite(tx) || !Number.isFinite(ty)) continue;
    const cameraX = tx + v.x * rayLength;
    const cameraY = ty + v.y * rayLength;
    const ray = lineTiles(cameraX, cameraY, tx, ty);
    // No se transparenta la propia casilla objetivo. Solo bloqueantes intermedios.
    for (const point of ray.slice(0, -1)) {
      addOccluder(out, dungeon, point.x, point.y);
      // Engrosa un poco el volumen para columnas/esquinas altas.
      if (v.x === 0) {
        addOccluder(out, dungeon, point.x - 1, point.y);
        addOccluder(out, dungeon, point.x + 1, point.y);
      } else {
        addOccluder(out, dungeon, point.x, point.y - 1);
        addOccluder(out, dungeon, point.x, point.y + 1);
      }
    }
  }
  return out;
}
