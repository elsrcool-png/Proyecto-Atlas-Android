// PROYECTO ATLAS — Apertura de accesos físicos a zonas importantes.
// Abre una brecha REAL en muros/bordes/colisiones de mesetas y acantilados
// para que el jugador pueda caminar hasta el edificio, NPC, cofre, santuario,
// objetivo narrativo, jefe o entrada de dungeon situados dentro.
//
// No reubica el objetivo: corta la colisión (rectángulo del terreno) en piezas
// dejando un corredor + patio caminable alineado con el camino visual, y
// extiende el camino para que coincida con el hueco de colisión.
import { getDungeonForSector } from "@/lib/atlasDungeons";

const CW = 64;   // ancho del patio alrededor del objetivo
const CH = 64;   // alto del patio
const GAP = 48;  // ancho del corredor (brecha en el borde)
const MARGIN = 14; // cuánto sobresale el corredor fuera del borde (acceso limpio)

// ── Resta de rectángulos axis-aligned: A menos B → hasta 4 piezas ──
function subtractRect(A, B) {
  // Intersección
  const ix0 = Math.max(A.x, B.x);
  const iy0 = Math.max(A.y, B.y);
  const ix1 = Math.min(A.x + A.w, B.x + B.w);
  const iy1 = Math.min(A.y + A.h, B.y + B.h);
  if (ix0 >= ix1 || iy0 >= iy1) return [A]; // sin solape
  const pieces = [];
  // Franja superior
  if (iy0 > A.y) pieces.push({ x: A.x, y: A.y, w: A.w, h: iy0 - A.y });
  // Franja inferior
  if (iy1 < A.y + A.h) pieces.push({ x: A.x, y: iy1, w: A.w, h: A.y + A.h - iy1 });
  // Franja izquierda (entre iy0 e iy1)
  if (ix0 > A.x) pieces.push({ x: A.x, y: iy0, w: ix0 - A.x, h: iy1 - iy0 });
  // Franja derecha
  if (ix1 < A.x + A.w) pieces.push({ x: ix1, y: iy0, w: A.x + A.w - ix1, h: iy1 - iy0 });
  return pieces;
}

function rectContains(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Recopila todos los objetivos importantes del mundo con su id/label.
function collectTargets(world) {
  const out = [];
  if (world.storyPoints) for (const sp of world.storyPoints) out.push({ id: sp.id, label: sp.label, x: sp.x, y: sp.y });
  if (world.chests) for (const c of world.chests) out.push({ id: c.id, label: "Cofre", x: c.x, y: c.y });
  if (world.npcs) for (const n of world.npcs) out.push({ id: n.id, label: n.name, x: n.x, y: n.y });
  if (world.shrines) for (const s of world.shrines) out.push({ id: s.id, label: "Santuario", x: s.x, y: s.y });
  if (world.boss) out.push({ id: "boss", label: "Jefe", x: world.boss.x, y: world.boss.y });
  if (world.objective) out.push({ id: "objective", label: "Objetivo", x: world.objective.x, y: world.objective.y });
  // Entrada de dungeon del sector actual
  const dung = getDungeonForSector(world.biome, world.sectorId);
  if (dung && dung.entrancePos) out.push({ id: `dungeon_${dung.id}`, label: "Entrada dungeon", x: dung.entrancePos.x, y: dung.entrancePos.y });
  return out;
}

// Punto del camino más cercano al objetivo que esté FUERA del sólido (punto de aproximación).
function nearestRoadApproach(world, solid, target) {
  let best = null;
  let bestD = Infinity;
  for (const road of world.roads || []) {
    for (const pt of road) {
      if (rectContains(solid, pt.x, pt.y)) continue; // fuera del sólido
      const d = Math.hypot(pt.x - target.x, pt.y - target.y);
      if (d < bestD) { bestD = d; best = pt; }
    }
  }
  return best;
}

// Determina el lado de la brecha según el punto de aproximación.
function breachSide(solid, approach, target) {
  const left = solid.x;
  const right = solid.x + solid.w;
  const top = solid.y;
  const bottom = solid.y + solid.h;
  if (approach) {
    if (approach.y >= bottom + 4) return "bottom";
    if (approach.y <= top - 4) return "top";
    if (approach.x <= left - 4) return "left";
    if (approach.x >= right - 4) return "right";
  }
  // Fallback: lado del borde más cercano al objetivo
  const dBottom = Math.abs(target.y - bottom);
  const dTop = Math.abs(target.y - top);
  const dLeft = Math.abs(target.x - left);
  const dRight = Math.abs(target.x - right);
  const min = Math.min(dBottom, dTop, dLeft, dRight);
  if (min === dBottom) return "bottom";
  if (min === dTop) return "top";
  if (min === dLeft) return "left";
  return "right";
}

// Construye el rectángulo del corredor desde el patio hasta el borde elegido.
function corridorRect(solid, target, side) {
  const cx = clamp(target.x, solid.x + GAP / 2 + 2, solid.x + solid.w - GAP / 2 - 2);
  const cy = clamp(target.y, solid.y + GAP / 2 + 2, solid.y + solid.h - GAP / 2 - 2);
  const courtyardTop = target.y - CH / 2;
  const courtyardBottom = target.y + CH / 2;
  const courtyardLeft = target.x - CW / 2;
  const courtyardRight = target.x + CW / 2;
  switch (side) {
    case "bottom":
      return { x: cx - GAP / 2, y: courtyardTop, w: GAP, h: (solid.y + solid.h + MARGIN) - courtyardTop };
    case "top":
      return { x: cx - GAP / 2, y: solid.y - MARGIN, w: GAP, h: courtyardBottom - (solid.y - MARGIN) };
    case "left":
      return { x: solid.x - MARGIN, y: cy - GAP / 2, w: courtyardRight - (solid.x - MARGIN), h: GAP };
    case "right":
      return { x: courtyardLeft, y: cy - GAP / 2, w: (solid.x + solid.w + MARGIN) - courtyardLeft, h: GAP };
  }
  return null;
}

// Punto en el borde donde el camino entra a la meseta + punto interior (centro del patio).
function breachEdgePoint(solid, target, side) {
  switch (side) {
    case "bottom": return { x: clamp(target.x, solid.x, solid.x + solid.w), y: solid.y + solid.h };
    case "top": return { x: clamp(target.x, solid.x, solid.x + solid.w), y: solid.y };
    case "left": return { x: solid.x, y: clamp(target.y, solid.y, solid.y + solid.h) };
    case "right": return { x: solid.x + solid.w, y: clamp(target.y, solid.y, solid.y + solid.h) };
  }
  return { x: target.x, y: target.y };
}

// Abre accesos físicos en el mundo. Devuelve un nuevo world con solids/roads/breaches.
export function openTerrainAccess(world) {
  if (!world || !world.solids) return world;
  const terrainSolids = world.solids.filter(s => s && s.terrain && s.shape);
  if (!terrainSolids.length) return world;

  const targets = collectTargets(world);
  if (!targets.length) return world;

  let solids = world.solids.slice();
  const newRoads = [];
  const breaches = [];

  for (const solid of terrainSolids) {
    const inside = targets.filter(t => rectContains(solid, t.x, t.y));
    if (!inside.length) continue;
    // Acumular sustracciones sobre los fragmentos del sólido (varios objetivos lo comparten)
    let pieces = [solid];
    for (const t of inside) {
      const approach = nearestRoadApproach(world, solid, t);
      const side = breachSide(solid, approach, t);
      const corridor = corridorRect(solid, t, side);
      const courtyard = { x: t.x - CW / 2, y: t.y - CH / 2, w: CW, h: CH };
      pieces = subtractRectAll(pieces, corridor);
      pieces = subtractRectAll(pieces, courtyard);
      breaches.push({ rect: corridor, side });
      breaches.push({ rect: courtyard, side });
      const edge = breachEdgePoint(solid, t, side);
      const inner = { x: t.x, y: t.y };
      if (approach) newRoads.push([{ x: approach.x, y: approach.y }, { x: edge.x, y: edge.y }, inner]);
      else newRoads.push([{ x: edge.x, y: edge.y }, inner]);
    }
    // Reemplazar el sólido original por sus fragmentos ya perforados
    solids = solids.filter(s => s !== solid);
    for (const p of pieces) {
      if (p.w > 4 && p.h > 4) solids.push({ ...p, terrain: true, shape: solid.shape });
    }
  }

  if (!breaches.length && !newRoads.length) return world;
  return {
    ...world,
    solids,
    roads: [...(world.roads || []), ...newRoads],
    breaches,
  };
}

function subtractRectAll(pieces, B) {
  let out = pieces;
  for (const p of pieces) {
    const subs = subtractRect(p, B);
    out = out.filter(x => x !== p).concat(subs);
  }
  return out;
}