// PROYECTO ATLAS — Generador procedural de pisos de dungeon.
// Estilo "habitaciones + pasillos" inspirado en mazmorras de exploración
// tipo Exploradores del Cielo: salas de tamaño variable conectadas por
// pasillos estrechos, bifurcaciones, entrada segura y escalera/salida.
// La cuadrícula existe internamente; visualmente el suelo es continuo.
//
// Leyenda (compatible con atlasDungeons.getEntities):
//   #  muro · . suelo · S aparición · E escalera/salida
//   C cofre · M enemigo · B jefe · O objetivo · T trampa

// PRNG determinista (mulberry32) — misma semilla => mismo piso.
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roomsOverlap(a, b, pad = 1) {
  return !(a.x + a.w + pad <= b.x || b.x + b.w + pad <= a.x || a.y + a.h + pad <= b.y || b.y + b.h + pad <= a.y);
}

function carveRoom(grid, r) {
  for (let y = r.y; y < r.y + r.h; y++)
    for (let x = r.x; x < r.x + r.w; x++)
      if (grid[y] && grid[y][x] !== undefined) grid[y][x] = ".";
}

function carveCorridor(grid, x1, y1, x2, y2, rng) {
  if (rng() < 0.5) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) if (grid[y1][x] === "#") grid[y1][x] = ".";
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) if (grid[y][x2] === "#") grid[y][x2] = ".";
  } else {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) if (grid[y][x1] === "#") grid[y][x1] = ".";
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) if (grid[y2][x] === "#") grid[y2][x] = ".";
  }
}

// BFS de conectividad: el spawn debe alcanzar la salida por suelo transitable.
function bfsReachable(grid, cols, rows, sx, sy, ex, ey) {
  if (sx === ex && sy === ey) return true;
  const seen = new Set([`${sx},${sy}`]);
  const q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
      if (seen.has(k)) continue;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const ch = grid[ny][nx];
      if (ch === "#" || ch === " " || ch === "L") continue;
      if (nx === ex && ny === ey) return true;
      seen.add(k); q.push([nx, ny]);
    }
  }
  return false;
}

// Elige un punto de inicio seguro en una sala: suelo interior con vecinos
// transitables, preferentemente el centro. Evita que el jugador aparezca
// sobre un muro o en una casilla rodeada de paredes.
function pickSpawnInRoom(grid, r) {
  const candidates = [];
  for (let y = r.y; y < r.y + r.h; y++)
    for (let x = r.x; x < r.x + r.w; x++) {
      if (!grid[y] || grid[y][x] !== ".") continue;
      let open = 0;
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) if (grid[y + dy] && grid[y + dy][x + dx] === ".") open++;
      candidates.push({ x, y, open, d: Math.abs(x - r.cx) + Math.abs(y - r.cy) });
    }
  candidates.sort((a, b) => (b.open - a.open) || (a.d - b.d));
  return candidates[0] || null;
}

// Devuelve todas las casillas de suelo de una sala alcanzables (para cofres/accesibilidad).
function floorTilesInRoom(grid, r) {
  const out = [];
  for (let y = r.y; y < r.y + r.h; y++)
    for (let x = r.x; x < r.x + r.w; x++)
      if (grid[y] && grid[y][x] === ".") out.push({ x, y });
  return out;
}

export function generateDungeonFloor(archetype, floor, seed) {
  if (!archetype) return null;
  const floorCount = archetype.floorCount || 1;
  const isBossFloor = floor >= floorCount && !!archetype.bossId;
  const isGatewayFloor = floor >= floorCount && !!archetype.finalSanctuary;
  const pool = archetype.enemyPool || [];

  for (let attempt = 0; attempt < 60; attempt++) {
    const rng = mulberry32(((seed | 0) || 1) + floor * 7919 + attempt * 13);
    const cols = 26 + Math.floor(rng() * 8);
    const rows = 20 + Math.floor(rng() * 7);
    const grid = Array.from({ length: rows }, () => Array(cols).fill("#"));
    const rooms = [];
    const want = 5 + Math.floor(rng() * 4);
    let tries = 0;
    while (rooms.length < want && tries < 90) {
      tries++;
      const w = 4 + Math.floor(rng() * 5);
      const h = 4 + Math.floor(rng() * 4);
      const x = 1 + Math.floor(rng() * (cols - w - 2));
      const y = 1 + Math.floor(rng() * (rows - h - 2));
      const room = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) };
      if (rooms.some((r) => roomsOverlap(room, r, 1))) continue;
      rooms.push(room);
      carveRoom(grid, room);
    }
    if (rooms.length < 3) continue;

    // Conectar salas secuencialmente + un par de atajos para crear bucles.
    for (let i = 1; i < rooms.length; i++) carveCorridor(grid, rooms[i - 1].cx, rooms[i - 1].cy, rooms[i].cx, rooms[i].cy, rng);
    for (let k = 0; k < 2; k++) {
      const a = rooms[Math.floor(rng() * rooms.length)];
      const b = rooms[Math.floor(rng() * rooms.length)];
      if (a !== b) carveCorridor(grid, a.cx, a.cy, b.cx, b.cy, rng);
    }

    const spawnRoom = rooms[0];
    const exitRoom = rooms[rooms.length - 1];
    const spawnPick = pickSpawnInRoom(grid, spawnRoom) || { x: spawnRoom.cx, y: spawnRoom.cy };
    const sx = spawnPick.x, sy = spawnPick.y;
    grid[sy][sx] = "S";
    const spawn = { x: sx, y: sy };

    const used = new Set([`${sy},${sx}`]);

    // Salida/escalera en la última sala.
    let stairs = { x: exitRoom.cx, y: exitRoom.cy };
    grid[stairs.y][stairs.x] = "E";
    used.add(`${stairs.y},${stairs.x}`);

    if (!bfsReachable(grid, cols, rows, sx, sy, stairs.x, stairs.y)) continue;

    // Objetivo narrativo (solo piso 1, si está definido).
    if (floor === 1 && archetype.objectiveStoryPointId && rooms.length > 2) {
      const or = rooms[1 + Math.floor(rng() * (rooms.length - 2))];
      const tiles = floorTilesInRoom(grid, or).filter((t) => !used.has(`${t.y},${t.x}`));
      if (tiles.length) { const p = tiles[Math.floor(rng() * tiles.length)]; grid[p.y][p.x] = "O"; used.add(`${p.y},${p.x}`); }
    }

    // Santuario final de la ruta al jefe: se coloca junto a la salida,
    // conservando una casilla E para retirada de emergencia.
    if (isGatewayFloor) {
      const candidates = [[0, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
      let placed = false;
      for (const [dx, dy] of candidates) {
        const px = stairs.x + dx, py = stairs.y + dy;
        if (grid[py] && grid[py][px] === ".") {
          grid[py][px] = "P";
          used.add(`${py},${px}`);
          placed = true;
          break;
        }
      }
      if (!placed) {
        grid[stairs.y][stairs.x] = "P";
        const ex = Math.max(1, stairs.x - 1);
        grid[stairs.y][ex] = "E";
        stairs = { x: ex, y: stairs.y };
      }
    }

    // Jefe en el piso jefe: junto a la escalera.
    if (isBossFloor) {
      const bx = exitRoom.cx, by = exitRoom.cy;
      let placedBoss = false;
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const ex = bx + dx, ey = by + dy;
        if (grid[ey] && grid[ey][ex] === ".") { grid[ey][ex] = "B"; used.add(`${ey},${ex}`); placedBoss = true; break; }
      }
      if (!placedBoss) { grid[by][bx] = "B"; used.add(`${by},${bx}`); grid[by][bx + 1] = "E"; stairs = { x: bx + 1, y: by }; used.add(`${by},${bx + 1}`); }
      if (!bfsReachable(grid, cols, rows, sx, sy, stairs.x, stairs.y)) continue;
    }

    // Enemigos: nada en la sala inicial (zona segura); más escasos en pisos bajos.
    const enemyMax = isBossFloor ? 3 : Math.max(2, 5 - Math.floor(floor / 2));
    let placedEnemies = 0;
    const order = rooms.slice(1).sort(() => rng() - 0.5);
    for (const r of order) {
      if (placedEnemies >= enemyMax) break;
      const tiles = floorTilesInRoom(grid, r).filter((t) => !used.has(`${t.y},${t.x}`));
      if (!tiles.length) continue;
      const n = 1 + Math.floor(rng() * 2);
      for (let i = 0; i < n && placedEnemies < enemyMax && tiles.length; i++) {
        const p = tiles.splice(Math.floor(rng() * tiles.length), 1)[0];
        grid[p.y][p.x] = "M"; used.add(`${p.y},${p.x}`); placedEnemies++;
      }
    }

    // Cofres.
    const chestMax = 1 + Math.floor(rng() * 3);
    let placedChests = 0;
    for (const r of rooms.slice(1).sort(() => rng() - 0.5)) {
      if (placedChests >= chestMax) break;
      const tiles = floorTilesInRoom(grid, r).filter((t) => !used.has(`${t.y},${t.x}`));
      if (!tiles.length) continue;
      const p = tiles[Math.floor(rng() * tiles.length)];
      grid[p.y][p.x] = "C"; used.add(`${p.y},${p.x}`); placedChests++;
    }

    // Trampas en pasillos (a partir del piso 2): solo en cuellos estrechos.
    if (floor >= 2) {
      const trapMax = 1 + Math.floor(rng() * 2);
      let placedTraps = 0;
      for (let t = 0; t < 30 && placedTraps < trapMax; t++) {
        const tx = 1 + Math.floor(rng() * (cols - 2));
        const ty = 1 + Math.floor(rng() * (rows - 2));
        if (grid[ty][tx] !== "." || used.has(`${ty},${tx}`)) continue;
        const open = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => grid[ty + dy] && grid[ty + dy][tx + dx] && grid[ty + dy][tx + dx] !== "#").length;
        if (open <= 2) { grid[ty][tx] = "T"; used.add(`${ty},${tx}`); placedTraps++; }
      }
    }

    const tiles = grid.map((r) => r.join(""));
    return {
      ...archetype,
      id: `${archetype.id}_f${floor}_s${seed}`,
      baseId: archetype.id,
      cols, rows, tiles,
      floor, floorCount, isBossFloor, isGatewayFloor,
      rooms,
      spawn,
      stairs,
      seed,
    };
  }

  // Reserva: sala única abierta válida (no debería llegar aquí).
  const cols = 20, rows = 14;
  const grid = Array.from({ length: rows }, () => Array(cols).fill("#"));
  for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) grid[y][x] = ".";
  grid[1][1] = "S";
  grid[rows - 2][cols - 2] = "E";
  if (isBossFloor) grid[rows - 2][cols - 3] = "B";
  if (isGatewayFloor) grid[rows - 2][cols - 3] = "P";
  if (floor === 1 && archetype.objectiveStoryPointId) grid[1][cols - 2] = "O";
  return { ...archetype, id: `${archetype.id}_f${floor}_s${seed}_fb`, baseId: archetype.id, cols, rows, tiles: grid.map((r) => r.join("")), floor, floorCount, isBossFloor, isGatewayFloor, rooms: [{ x: 1, y: 1, w: cols - 2, h: rows - 2, cx: 1, cy: 1 }], spawn: { x: 1, y: 1 }, stairs: { x: cols - 2, y: rows - 2 }, seed };
}