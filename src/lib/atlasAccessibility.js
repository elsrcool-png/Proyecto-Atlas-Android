// PROYECTO ATLAS — Validación global de accesibilidad de objetivos importantes.
// Garantiza que NPC, cofre, santuario, entrada de dungeon, salida, jefe, etc.
// tengan una ruta caminable real desde la zona jugable. Si un objetivo cae sobre
// sólido/agua/fuera de límites, se reubica a la posición caminable más cercana
// (espiral). Esto evita misiones o cofres obligatorios en zonas inalcanzables.
import { hitSolid } from "@/lib/atlasWorld";

function inWater(world, x, y) {
  if (!world?.terrainShapes) return false;
  for (const w of world.terrainShapes) {
    if (w.type !== "water" && w.type !== "river") continue;
    if (x >= w.x && x <= w.x + (w.w || 0) && y >= w.y && y <= w.y + (w.h || 0)) return true;
  }
  return false;
}

export function isWalkablePoint(world, x, y) {
  if (!world) return false;
  if (x < 24 || y < 24 || x > (world.W || 960) - 24 || y > (world.H || 720) - 24) return false;
  if (hitSolid(x, y, world.solids)) return false;
  if (inWater(world, x, y)) return false;
  return true;
}

// Valida que un objetivo importante sea accesible (caminable). Devuelve {ok, issues}.
export function validateImportantTargetAccessibility(world, target) {
  if (!world || !target) return { ok: true, issues: [] };
  const issues = [];
  const x = target.x, y = target.y;
  const W = world.W || 960, H = world.H || 720;
  if (x < 24 || y < 24 || x > W - 24 || y > H - 24) issues.push({ type: "bounds", message: "Fuera de los límites" });
  if (hitSolid(x, y, world.solids)) issues.push({ type: "solid", message: "Dentro de un objeto sólido" });
  if (inWater(world, x, y)) issues.push({ type: "water", message: "Dentro del agua" });
  return { ok: issues.length === 0, issues };
}

// Reubica un objetivo bloqueado a la posición caminable más cercana (búsqueda espiral).
// Si ya es accesible, lo devuelve sin cambios. No mueve el objetivo si ya es válido.
export function resolveAccessibleTarget(world, target) {
  if (!world || !target) return target;
  const check = validateImportantTargetAccessibility(world, target);
  if (check.ok) return target;
  for (let r = 20; r <= 220; r += 15) {
    for (let a = 0; a < 360; a += 30) {
      const x = target.x + Math.round(Math.cos(a * Math.PI / 180) * r);
      const y = target.y + Math.round(Math.sin(a * Math.PI / 180) * r);
      if (isWalkablePoint(world, x, y)) return { ...target, x, y };
    }
  }
  console.warn(`[Atlas] Objetivo "${target.id || target.label || "?"}" sin posición caminable cercana; se conserva la original.`);
  return target;
}

// Aplica la validación a una lista de objetivos y devuelve la lista corregida.
export function resolveAccessibleTargets(world, targets) {
  if (!world || !targets) return targets || [];
  return targets.map((t) => resolveAccessibleTarget(world, t));
}

// Devuelve una posición de entrada de dungeon caminable (reubica si está bloqueada).
export function getValidDungeonEntrance(dungeon, world) {
  if (!dungeon) return null;
  const e = dungeon.entrancePos;
  if (!world || isWalkablePoint(world, e.x, e.y)) return e;
  const fixed = resolveAccessibleTarget(world, { id: `entrance_${dungeon.id}`, x: e.x, y: e.y, label: "Entrada dungeon" });
  return { x: fixed.x, y: fixed.y };
}