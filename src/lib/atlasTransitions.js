// PROYECTO ATLAS — Corredores seguros de transición entre sectores.
// Define puntos fijos de salida/llegada, corredores libres de colisiones,
// triggers centrados y validación de puntos de aparición.
// Sin semillas, sin Math.random, sin generación procedural.

import { coordsFromSectorId, getNeighborSectorId } from "@/lib/atlasRegionSectors";
import { hitSolid, clamp } from "@/lib/atlasWorld";

// Dimensiones canónicas de todos los mapas de sector.
const W = 960;
const H = 720;
const CX = W / 2; // 480
const CY = H / 2; // 360
const HALF_W = 70;  // mitad del ancho seguro (140 total)
const DEPTH = 150;   // profundidad del corredor hacia el interior
const EXIT_MARGIN = 20;
const ARRIVAL_MARGIN = 48;
const TRIGGER_HALF = 34; // semiancho del trigger centrado

// Datos por dirección: punto de salida, punto de llegada, rectángulo del corredor.
const DIR_DATA = {
  north: {
    exit: { x: CX, y: EXIT_MARGIN },
    arrival: { x: CX, y: H - ARRIVAL_MARGIN },
    facing: "up",
    corridor: { x: CX - HALF_W, y: 0, w: HALF_W * 2, h: DEPTH },
  },
  south: {
    exit: { x: CX, y: H - EXIT_MARGIN },
    arrival: { x: CX, y: ARRIVAL_MARGIN },
    facing: "down",
    corridor: { x: CX - HALF_W, y: H - DEPTH, w: HALF_W * 2, h: DEPTH },
  },
  east: {
    exit: { x: W - EXIT_MARGIN, y: CY },
    arrival: { x: ARRIVAL_MARGIN, y: CY },
    facing: "right",
    corridor: { x: W - DEPTH, y: CY - HALF_W, w: DEPTH, h: HALF_W * 2 },
  },
  west: {
    exit: { x: EXIT_MARGIN, y: CY },
    arrival: { x: W - ARRIVAL_MARGIN, y: CY },
    facing: "left",
    corridor: { x: 0, y: CY - HALF_W, w: DEPTH, h: HALF_W * 2 },
  },
};

function buildTransition(regionId, fromSector, direction) {
  const coords = coordsFromSectorId(fromSector);
  if (!coords) return null;
  const toSector = getNeighborSectorId(coords.col, coords.row, direction);
  if (!toSector) return null;
  const data = DIR_DATA[direction];
  return {
    id: `${regionId}_${fromSector}_${direction}`,
    fromSector,
    toSector,
    direction,
    exit: { ...data.exit },
    arrival: { ...data.arrival },
    facing: data.facing,
    safeWidth: HALF_W * 2,
    safeDepth: DEPTH,
    corridor: { ...data.corridor },
    trigger: {
      x: data.exit.x - TRIGGER_HALF,
      y: data.exit.y - TRIGGER_HALF,
      w: TRIGGER_HALF * 2,
      h: TRIGGER_HALF * 2,
      direction,
    },
  };
}

/**
 * Devuelve todas las transiciones de un sector (una por dirección disponible).
 */
export function getSectorTransitions(regionId, sectorId) {
  const result = [];
  for (const dir of ["north", "south", "east", "west"]) {
    const t = buildTransition(regionId, sectorId, dir);
    if (t) result.push(t);
  }
  return result;
}

/**
 * Devuelve la transición específica para una dirección desde un sector.
 */
export function getTransition(regionId, fromSector, direction) {
  return buildTransition(regionId, fromSector, direction);
}

/**
 * Devuelve el rectángulo del corredor para una transición.
 */
export function getCorridorRect(transition) {
  return transition?.corridor || null;
}

// ── Utilidades geométricas ──

function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function pointNearRect(px, py, r, margin) {
  return px >= r.x - margin && px <= r.x + r.w + margin && py >= r.y - margin && py <= r.y + r.h + margin;
}

/**
 * Comprueba si una posición está dentro del trigger de una transición.
 */
export function isInTransitionTrigger(x, y, transition) {
  if (!transition?.trigger) return false;
  const t = transition.trigger;
  return pointInRect(x, y, t);
}

/**
 * Comprueba si una posición está dentro del corredor de una transición.
 */
export function isInCorridor(x, y, transition) {
  if (!transition?.corridor) return false;
  return pointInRect(x, y, transition.corridor);
}

// ── Limpieza de corredores ──

/**
 * Elimina sólidos y decoración que invaden los corredores reservados.
 * También desplaza NPC, cofres, enemigos, puntos narrativos y aldeanos
 * que caigan dentro de un corredor, para garantizar una ruta caminable.
 * No usa posiciones aleatorias: los objetos desplazados se mueven a
 * posiciones fijas de respaldo (fallback) definidas por sector.
 */
export function clearTransitionCorridors(world, transitions) {
  if (!world || !transitions?.length) return world;
  const corridors = transitions.map(t => t.corridor);

  // 1. Quitar sólidos que invaden los corredores
  if (world.solids) {
    world.solids = world.solids.filter(s => !corridors.some(c => rectOverlap(s, c)));
  }

  // 2. Quitar decoración dentro de corredores (árboles, rocas, arbustos, etc.)
  if (world.decor) {
    world.decor = world.decor.filter(d => !corridors.some(c => pointInRect(d.x, d.y, c)));
  }

  // 3. Desplazar NPCs fuera de corredores
  if (world.npcs) {
    world.npcs = world.npcs.map(n => {
      if (!corridors.some(c => pointInRect(n.x, n.y, c))) return n;
      const fb = getFallbackPosition(n.sector, n.role, n.id);
      return fb ? { ...n, x: fb.x, y: fb.y } : n;
    }).filter(Boolean);
  }

  // 4. Desplazar cofres fuera de corredores
  if (world.chests) {
    world.chests = world.chests.map(c => {
      if (!corridors.some(cor => pointInRect(c.x, c.y, cor))) return c;
      return { ...c, x: clamp(c.x, 200, W - 200), y: clamp(c.y, 200, H - 200) };
    });
  }

  // 5. Desplazar enemigos fuera de corredores
  if (world.enemies) {
    world.enemies = world.enemies.map(e => {
      if (!corridors.some(c => pointInRect(e.x, e.y, c))) return e;
      return { ...e, x: clamp(e.x, 200, W - 200), y: clamp(e.y, 200, H - 200) };
    });
  }

  // 6. Desplazar puntos narrativos fuera de corredores
  if (world.storyPoints) {
    world.storyPoints = world.storyPoints.map(sp => {
      if (!corridors.some(c => pointInRect(sp.x, sp.y, c))) return sp;
      return { ...sp, x: clamp(sp.x, 200, W - 200), y: clamp(sp.y, 200, H - 200) };
    });
  }

  // 7. Desplazar aldeanos fuera de corredores
  if (world.villagers) {
    world.villagers = world.villagers.map(v => {
      if (!corridors.some(c => pointInRect(v.x, v.y, c))) return v;
      const fx = clamp(v.x, 200, W - 200);
      const fy = clamp(v.y, 200, H - 200);
      return { ...v, x: fx, y: fy, home: { ...v.home, x: fx, y: fy } };
    });
  }

  // 8. Desplazar fauna fuera de corredores
  if (world.fauna) {
    world.fauna = world.fauna.map(f => {
      if (!corridors.some(c => pointInRect(f.x, f.y, c))) return f;
      return { ...f, x: clamp(f.x, 200, W - 200), y: clamp(f.y, 200, H - 200) };
    });
  }

  return world;
}

// Posiciones de respaldo manuales para NPCs desplazados.
// Solo se usan si un NPC cae dentro de un corredor por cambios de layout.
const FALLBACK_POSITIONS = {};
export function getFallbackPosition(sector, role, npcId) {
  const key = `${sector}:${role}`;
  return FALLBACK_POSITIONS[key] || null;
}

// ── Validación de punto de llegada ──

/**
 * Valida que el punto de llegada de una transición sea seguro:
 * - dentro de límites del mapa;
 * - fuera de sólidos;
 * - camino libre durante al menos 100 unidades hacia el interior.
 * No usa posiciones aleatorias. Si falla, marca error de desarrollo.
 */
export function validateTransitionArrival(world, transition) {
  if (!world || !transition) return { valid: false, reason: "Sin datos" };
  const { arrival, direction } = transition;
  const ax = arrival.x, ay = arrival.y;

  // 1. Dentro de límites
  if (ax < 20 || ax > W - 20 || ay < 20 || ay > H - 20) {
    return { valid: false, reason: `Llegada fuera de límites: (${ax},${ay})` };
  }

  // 2. Fuera de sólidos
  if (hitSolid(ax, ay, world.solids || [], 18)) {
    return { valid: false, reason: `Llegada sobre sólido: (${ax},${ay})` };
  }

  // 3. Camino libre durante 100 unidades hacia el interior
  const interior = getInteriorVector(direction, 100);
  for (let step = 10; step <= 100; step += 10) {
    const tx = ax + interior.x * step;
    const ty = ay + interior.y * step;
    if (hitSolid(tx, ty, world.solids || [], 16)) {
      return { valid: false, reason: `Camino bloqueado a ${step}u de la llegada` };
    }
  }

  // 4. Sin enemigos cercanos (radio 50)
  if (world.enemies) {
    for (const e of world.enemies) {
      if (Math.hypot(e.x - ax, e.y - ay) < 50) {
        return { valid: false, reason: `Enemigo cercano en llegada: (${e.x},${e.y})` };
      }
    }
  }

  // 5. Sin NPCs cercanos (radio 40)
  if (world.npcs) {
    for (const n of world.npcs) {
      if (Math.hypot(n.x - ax, n.y - ay) < 40) {
        return { valid: false, reason: `NPC cercano en llegada: (${n.x},${n.y})` };
      }
    }
  }

  return { valid: true, reason: null };
}

function getInteriorVector(direction, length) {
  const vec = { north: { x: 0, y: 1 }, south: { x: 0, y: -1 }, east: { x: -1, y: 0 }, west: { x: 1, y: 0 } }[direction];
  if (!vec) return { x: 0, y: 0 };
  return { x: vec.x * length, y: vec.y * length };
}

/**
 * Valida todas las transiciones de un sector y devuelve las que fallan.
 */
export function validateAllTransitions(world, transitions) {
  const failures = [];
  for (const t of transitions || []) {
    const result = validateTransitionArrival(world, t);
    if (!result.valid) failures.push({ transition: t, ...result });
  }
  return failures;
}

// ── Datos de camino visible por región ──

export const PATH_STYLE = {
  verde: { color: "#c9a063", border: "#a07f4a", icon: "pebbles" },
  fria: { color: "#aab8c8", border: "#8a9aaa", icon: "stakes" },
  desierto: { color: "#e6c289", border: "#c6a060", icon: "tracks" },
};

/**
 * Devuelve los datos de estilo de camino para una región.
 */
export function getPathStyle(regionId) {
  return PATH_STYLE[regionId] || PATH_STYLE.verde;
}