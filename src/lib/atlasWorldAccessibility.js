// PROYECTO ATLAS — Validación global de accesibilidad de los 27 mapas.
// Garantiza que todo objetivo importante (NPC, cofre, santuario, jefe, objetivo
// de misión, punto narrativo, enemigo) sea alcanzable desde los puntos reales
// de entrada del sector: spawn del santuario, spawn del sector y las llegadas
// de transición (centro de cada borde despejado).
//
// Estrategia (sin Math.random):
//  1. Limpia sólidos que invadan los 4 corredores de cambio de mapa.
//  2. Calcula el conjunto de celdas alcanzables (BFS multi-fuente) usando el
//     mismo hitSolid del juego.
//  3. Reubica anclas (NPC, cofres, puntos narrativos, enemigos, santuarios
//     menores) que queden dentro de un sólido/agua o aisladas: primero a sus
//     fallbackPositions manuales, luego a la celda caminable+alcanzable más
//     cercana (búsqueda espiral determinista).
//  4. Para jefe, objetivo y santuario-portales (posiciones canónicas fijas):
//     si quedan aislados, abre un corredor eliminando SÓLO sólidos de terreno
//     (mesetas/acantilados) que bloqueen el camino — nunca edificios/muros.
//
// No altera misiones, combate, stats ni el diseño visual de los mapas.
// Sólo corrige colisiones, superposiciones, caminos y accesibilidad.
import { hitSolid } from "@/lib/atlasWorld";

const W = 960;
const H = 720;
const STEP = 16;          // resolución de la malla BFS
const CR = 16;            // radio de colisión del jugador (coincide con hitSolid del modo exploración)
const CORRIDOR_HALF = 26; // semiancho del corredor a abrir hacia jefe/objetivo

// ── Colisión puntual ──
// El modo exploración sólo bloquea contra sólidos (hitSolid, radio 16). El agua y
// los ríos son capas visuales que NO impiden el paso del jugador.
function blocked(world, x, y) {
  if (x < 24 || y < 24 || x > W - 24 || y > H - 24) return true;
  if (hitSolid(x, y, world.solids || [], CR)) return true;
  return false;
}

// ── Puntos reales de entrada del sector ──
function entrySources(world) {
  const pts = [];
  if (world.shrines) {
    for (const s of world.shrines) {
      if (s.isSanctuary && s.spawnX != null) pts.push({ x: s.spawnX, y: s.spawnY });
    }
  }
  if (world.spawn) pts.push({ x: world.spawn.x, y: world.spawn.y });
  // Llegadas de transición: centro de cada borde, 48 px dentro. Si el borde no
  // tiene vecino, el corredor no se despejó y el punto queda bloqueado → se descarta.
  pts.push({ x: 480, y: 48 }, { x: 480, y: 672 }, { x: 48, y: 360 }, { x: 912, y: 360 });
  return pts;
}

// ── BFS multi-fuente: conjunto de celdas alcanzables ──
function computeReach(world) {
  const cols = Math.ceil(W / STEP);
  const rows = Math.ceil(H / STEP);
  const reach = new Uint8Array(cols * rows);
  const q = [];
  for (const p of entrySources(world)) {
    if (blocked(world, p.x, p.y)) continue;
    const cx = Math.floor(p.x / STEP);
    const cy = Math.floor(p.y / STEP);
    if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) continue;
    const idx = cy * cols + cx;
    if (!reach[idx]) { reach[idx] = 1; q.push([cx, cy]); }
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const idx = ny * cols + nx;
      if (reach[idx]) continue;
      if (blocked(world, nx * STEP, ny * STEP)) continue;
      reach[idx] = 1;
      q.push([nx, ny]);
    }
  }
  return { reach, cols, rows };
}

function isReached(set, x, y) {
  const cx = Math.floor(x / STEP);
  const cy = Math.floor(y / STEP);
  if (cx < 0 || cy < 0 || cx >= set.cols || cy >= set.rows) return false;
  return set.reach[cy * set.cols + cx] === 1;
}

// Celda caminable y alcanzable más cercana a (x, y) — espiral determinista.
function nearestReachable(world, set, x, y, maxR = 300) {
  if (!blocked(world, x, y) && isReached(set, x, y)) return { x, y };
  for (let r = STEP; r <= maxR; r += STEP) {
    for (let a = 0; a < 360; a += 18) {
      const nx = x + Math.round(Math.cos(a * Math.PI / 180) * r);
      const ny = y + Math.round(Math.sin(a * Math.PI / 180) * r);
      if (!blocked(world, nx, ny) && isReached(set, nx, ny)) return { x: nx, y: ny };
    }
  }
  return null;
}

// Celda caminable más cercana a (x, y) sin requisito de alcance (para reubicar
// el spawn del sector, que es él mismo un punto de entrada).
function nearestWalkable(world, x, y, maxR = 200) {
  if (!blocked(world, x, y)) return { x, y };
  for (let r = STEP; r <= maxR; r += STEP) {
    for (let a = 0; a < 360; a += 18) {
      const nx = x + Math.round(Math.cos(a * Math.PI / 180) * r);
      const ny = y + Math.round(Math.sin(a * Math.PI / 180) * r);
      if (!blocked(world, nx, ny)) return { x: nx, y: ny };
    }
  }
  return null;
}

// Punto ya alcanzable más cercano a (x, y) — para trazar un corredor hacia él.
function nearestReachedPoint(set, x, y, maxR = 340) {
  if (isReached(set, x, y)) return { x, y };
  for (let r = STEP; r <= maxR; r += STEP) {
    for (let a = 0; a < 360; a += 18) {
      const nx = x + Math.round(Math.cos(a * Math.PI / 180) * r);
      const ny = y + Math.round(Math.sin(a * Math.PI / 180) * r);
      if (isReached(set, nx, ny)) return { x: nx, y: ny };
    }
  }
  return null;
}

// Distancia de un punto al rectángulo del sólido.
function distToRect(px, py, s) {
  const cx = Math.max(s.x, Math.min(px, s.x + (s.w || 0)));
  const cy = Math.max(s.y, Math.min(py, s.y + (s.h || 0)));
  return Math.hypot(px - cx, py - cy);
}

// Elimina SÓLO sólidos de terreno (mesetas/acantilados) cuyo centro esté dentro
// del corredor grueso entre a y b. Nunca retira edificios, muros ni objetos.
function clearTerrainCorridor(world, ax, ay, bx, by) {
  if (!world.solids) return;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  world.solids = world.solids.filter((s) => {
    if (!s.terrain) return true;
    const sx = s.x + (s.w || 0) / 2;
    const sy = s.y + (s.h || 0) / 2;
    const t = Math.max(0, Math.min(1, ((sx - ax) * dx + (sy - ay) * dy) / len2));
    const px = ax + dx * t;
    const py = ay + dy * t;
    return distToRect(px, py, s) > CORRIDOR_HALF;
  });
}

// Abre un corredor hacia un objetivo canónico fijo (jefe/objetivo/santuario)
// si está aislado, recalcular reach tras limpiar.
function ensureReachable(world, set, target) {
  if (!target) return set;
  if (isReached(set, target.x, target.y)) return set;
  const from = nearestReachedPoint(set, target.x, target.y);
  if (!from) return set;
  clearTerrainCorridor(world, from.x, from.y, target.x, target.y);
  return computeReach(world);
}

// Reubica un ancla (NPC/cofre/punto narrativo/enemigo/santuario menor) a una
// posición caminable y alcanzable. Usa primero fallbacks manuales si los tiene.
function relocateAnchor(world, set, anchor, allowFallbacks) {
  if (!anchor) return anchor;
  if (!blocked(world, anchor.x, anchor.y) && isReached(set, anchor.x, anchor.y)) return anchor;
  if (allowFallbacks && anchor.fallbackPositions) {
    for (const fp of anchor.fallbackPositions) {
      if (!blocked(world, fp.x, fp.y) && isReached(set, fp.x, fp.y)) {
        return { ...anchor, x: fp.x, y: fp.y };
      }
    }
  }
  const np = nearestReachable(world, set, anchor.x, anchor.y);
  return np ? { ...anchor, x: np.x, y: np.y } : anchor;
}

// Los 4 corredores de transición (centro de cada borde, 140×150 / 150×140).
function transitionCorridors() {
  return [
    { x: 480 - 70, y: 0, w: 140, h: 150 },
    { x: 480 - 70, y: H - 150, w: 140, h: 150 },
    { x: 0, y: 360 - 70, w: 150, h: 140 },
    { x: W - 150, y: 360 - 70, w: 150, h: 140 },
  ];
}

function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}


// Instantánea pública de recorrido para otros sistemas de colocación. Permite
// comprobar muchos candidatos sin recalcular el BFS en cada punto.
export function createWorldReachability(world) {
  const set = computeReach(world);
  return {
    isReachable(pointOrX, maybeY) {
      const x = typeof pointOrX === "object" ? pointOrX?.x : pointOrX;
      const y = typeof pointOrX === "object" ? pointOrX?.y : maybeY;
      return Number.isFinite(Number(x)) && Number.isFinite(Number(y))
        && !blocked(world, Number(x), Number(y))
        && isReached(set, Number(x), Number(y));
    },
    reachableCells: set.reach.reduce((total, value) => total + value, 0),
  };
}

// ── API pública: validación global de un mundo de sector ──
export function validateWorldAccessibility(world) {
  if (!world) return world;

  // 1. Corredores de cambio de mapa libres de sólidos (idempotente).
  if (world.solids) {
    const corridors = transitionCorridors();
    world.solids = world.solids.filter((s) => !corridors.some((c) => rectOverlap(s, c)));
  }

  // 1b. Spawn del sector: si cae dentro de un sólido, reubicarlo a la celda
  //     caminable más cercana. Es un punto de entrada real del jugador.
  if (world.spawn && blocked(world, world.spawn.x, world.spawn.y)) {
    const np = nearestWalkable(world, world.spawn.x, world.spawn.y);
    if (np) world.spawn = { ...world.spawn, x: np.x, y: np.y };
  }

  // 2. Conjunto de celdas alcanzables desde los puntos reales de entrada.
  let set = computeReach(world);

  // 3. Reubicar anclas a posiciones manuales / celda alcanzable más cercana.
  if (world.npcs) world.npcs = world.npcs.map((n) => relocateAnchor(world, set, n, false));
  if (world.chests) world.chests = world.chests.map((c) => relocateAnchor(world, set, c, false));
  if (world.storyPoints) world.storyPoints = world.storyPoints.map((sp) => relocateAnchor(world, set, sp, true));
  if (world.enemies) world.enemies = world.enemies.map((e) => relocateAnchor(world, set, e, false));
  if (world.shrines) {
    world.shrines = world.shrines.map((s) => (s.isSanctuary ? s : relocateAnchor(world, set, s, false)));
  }

  // 4. Jefe y objetivo de misión: si están DENTRO de un sólido (demasiado cerca
  //    de un muro/meseta), reubicarlos a la celda caminable+alcanzable más
  //    cercana. Si están caminables pero aislados, abrir un corredor de terreno;
  //    si tras tallar siguen aislados (bloqueo por edificios), reubicarlos.
  set = computeReach(world);
  const place = (target, key) => {
    if (!target) return;
    if (blocked(world, target.x, target.y)) {
      const np = nearestReachable(world, set, target.x, target.y);
      if (np) { world[key] = { ...target, x: np.x, y: np.y }; set = computeReach(world); }
      return;
    }
    set = ensureReachable(world, set, target);
    if (!isReached(set, target.x, target.y)) {
      const np = nearestReachable(world, set, target.x, target.y);
      if (np) { world[key] = { ...target, x: np.x, y: np.y }; set = computeReach(world); }
    }
  };
  place(world.boss, "boss");
  place(world.objective, "objective");
  // Santuarios-portales: posiciones canónicas fijas; sólo abrir corredor si aislados.
  if (world.shrines) {
    for (const s of world.shrines) {
      if (s.isSanctuary) set = ensureReachable(world, set, s);
    }
  }

  return world;
}

// ── Diagnóstico (para auditoría): lista de anclas inaccesibles de un mundo ──
export function auditWorldAccessibility(world) {
  if (!world) return { issues: [] };
  const set = computeReach(world);
  const issues = [];
  const check = (key, t) => {
    if (!t) return;
    const inSolid = blocked(world, t.x, t.y);
    const reached = isReached(set, t.x, t.y);
    if (inSolid || !reached) issues.push({ key, x: t.x, y: t.y, inSolid, reached });
  };
  if (world.spawn) check("spawn", world.spawn);
  if (world.objective) check("objective", world.objective);
  if (world.boss) check("boss", world.boss);
  (world.npcs || []).forEach((n) => check("npc:" + (n.id || n.name), n));
  (world.chests || []).forEach((c) => check("chest:" + c.id, c));
  (world.shrines || []).forEach((s) => check("shrine:" + s.id, s));
  (world.storyPoints || []).forEach((sp) => check("sp:" + sp.id, sp));
  (world.enemies || []).forEach((e) => check("enemy:" + e.id, e));
  return { issues, reachableCells: set.reach.reduce((a, v) => a + v, 0) };
}