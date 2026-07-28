// PROYECTO ATLAS — Expansión del mundo en sectores conectados (capa adicional).
import { REGIONS, MONSTERS } from "@/lib/atlasData";
import { TILE, rand, randInt, scaleMonster, DECOR_POOL } from "@/lib/atlasWorld";
import { BLOCK_DEFS } from "@/lib/atlasBlocks";
import { enrichWorld, scatterClusters } from "@/lib/atlasWorldDesign";
import { GREEN_MONSTER_IDS } from "@/lib/atlasGreenBestiary";

export const SECTOR_ROWS = 3;
export const SECTOR_COLS = 3;

export const WILD_IDENTITIES = {
  verde: [
    { name: "Claros del Norte", subtitle: "Área abierta, poca vegetación", flora: "tallgrass" },
    { name: "Sendero del Río", subtitle: "Camino natural junto al agua", flora: "flower" },
    { name: "Bosque Cerrado", subtitle: "Vegetación densa", flora: "fern" },
    { name: "Zona de Transición", subtitle: "Límite entre claro y bosque", flora: "bush" },
    { name: "Maleza Profunda", subtitle: "Mayor presencia de criaturas", flora: "mushroom" },
    { name: "Claro de las Fieras", subtitle: "Territorio de caza", flora: "fern" },
  ],
  fria: [
    { name: "Camino Congelado", subtitle: "Sendero de hielo", flora: "tallgrass" },
    { name: "Páramo Nevado", subtitle: "Zona nevada abierta", flora: "smallrock" },
    { name: "Bosque de Pinos", subtitle: "Pinos bajo la nieve", flora: "fern" },
    { name: "Ruinas Heladas", subtitle: "Estructuras olvidadas", flora: "smallrock" },
    { name: "Ventisca Peligrosa", subtitle: "Zona de mayor peligro", flora: "bone" },
    { name: "Tundra Olvidada", subtitle: "Llanura helada sin retorno", flora: "tallgrass" },
  ],
  desierto: [
    { name: "Dunas del Norte", subtitle: "Arena movediza", flora: "smallrock" },
    { name: "Oasis Escondido", subtitle: "Agua y vida en el yermo", flora: "flower" },
    { name: "Camino Antiguo", subtitle: "Ruta de los antiguos", flora: "bone" },
    { name: "Ruinas del Sur", subtitle: "Restos de civilización", flora: "smallrock" },
    { name: "Tierras Rocosas", subtitle: "Piedra y calor", flora: "smallrock" },
    { name: "Desierto Profundo", subtitle: "El corazón del yermo", flora: "bone" },
  ],
};

const WILD_ENEMY_POOL = {
  verde: [...GREEN_MONSTER_IDS],
  fria: ["lobo_salvaje", "pantera_sombria", "orco_bruto", "chaman_orco", "guerrero_esqueletico"],
  desierto: ["guerrero_esqueletico", "asesino_esqueletico", "necromante", "asesino_orco", "orco_bruto"],
};
const monsterById = (id) => MONSTERS.find(m => m.id === id) || MONSTERS[0];

const VISUAL_POOL = {
  verde: ["bush", "mushroom", "bush", "tallgrass", "flower", "fern", "tallgrass", "flower"],
  fria: ["bush", "mushroom", "smallrock", "tallgrass", "fern", "smallrock", "tallgrass"],
  desierto: ["smallrock", "bone", "smallrock", "tallgrass", "flower", "smallrock", "bone"],
};

export function generateWildSector(region, col, row) {
  const LC = 26, LR = 26;
  const W = LC * TILE, H = LR * TILE;
  const mul = region.difficultyMul;
  const identity = WILD_IDENTITIES[region.id][row === 0 ? col : col + 3];
  const pool = DECOR_POOL[region.id];
  const cx = W / 2, cy = H / 2;
  let solids = [], decor = [], water = [];
  const keepClear = (x, y) => Math.hypot(x - cx, y - cy) < 70;
  const cluster = scatterClusters(pool, W, H, { keepClear, count: 16, perCluster: 5 });
  decor.push(...cluster.decor);
  solids.push(...cluster.solids);
  water.push(...cluster.water);
  const vpool = VISUAL_POOL[region.id];
  const floraIcon = identity.flora;
  for (let i = 0; i < 120; i++) {
    const x = rand(30, W - 30), y = rand(30, H - 30);
    if (Math.hypot(x - cx, y - cy) < 56) continue;
    const icon = Math.random() < 0.35 && floraIcon ? floraIcon : vpool[randInt(0, vpool.length - 1)];
    const sz = icon === "tallgrass" ? 22 : icon === "flower" ? 16 : icon === "mushroom" ? 18 : icon === "smallrock" ? 18 : icon === "bone" ? 28 : 24;
    decor.push({ x, y, icon, sz, visual: true, scatter: true });
  }
  const enemyPool = WILD_ENEMY_POOL[region.id];
  const baseByRow = row === 2 ? 6 : row === 0 ? 5 : 4;
  const enemyCount = baseByRow + Math.round(mul);
  const enemies = [];
  let tries = 0;
  while (enemies.length < enemyCount && tries < 450) {
    tries++;
    const x = rand(80, W - 80), y = rand(80, H - 80);
    if (Math.hypot(x - cx, y - cy) < 90) continue;
    if (enemies.some(e => Math.hypot(e.x - x, e.y - y) < 120)) continue;
    enemies.push({ id: `w${col}_${row}_${enemies.length}`, x, y, angle: rand(0, Math.PI * 2), timer: 0, monster: scaleMonster(monsterById(enemyPool[randInt(0, enemyPool.length - 1)]), mul) });
  }
  const chests = [];
  let ct = 0;
  while (chests.length < 2 && ct < 300) {
    ct++;
    const x = rand(80, W - 80), y = rand(80, H - 80);
    if (Math.hypot(x - cx, y - cy) < 90) continue;
    if (chests.some(c => Math.hypot(c.x - x, c.y - y) < 160)) continue;
    chests.push({ id: `w${col}_${row}_${chests.length}`, x, y });
  }
  if (chests.length) {
    const ch = chests[0];
    enemies.push({ id: `w${col}_${row}_camp_p`, x: ch.x + 34, y: ch.y - 24, angle: rand(0, Math.PI * 2), timer: 0, monster: scaleMonster(monsterById(enemyPool[randInt(0, enemyPool.length - 1)]), mul * 1.3) });
    for (let k = 0; k < 2; k++) enemies.push({ id: `w${col}_${row}_camp_${k}`, x: ch.x + (k === 0 ? -34 : 18), y: ch.y + 30, angle: rand(0, Math.PI * 2), timer: 0, monster: scaleMonster(monsterById(enemyPool[randInt(0, enemyPool.length - 1)]), mul) });
  }
  solids = solids.filter(s => s.y > 52 && s.y + s.h < H - 52 && s.x > 52 && s.x + s.w < W - 52);
  return enrichWorld({
    W, H, decor, water, solids, npcs: [], chests, enemies,
    boss: null, objective: { x: Math.round(W * 0.72), y: Math.round(H * 0.3) }, portals: [], spawn: { x: cx, y: cy },
    biome: region.id, blockIndex: col, villagers: [], smoke: [], shrines: [],
    spawnZones: [{ x: cx, y: cy }], safeCenter: { x: cx, y: cy }, safeRadius: 60,
    sectorName: identity.name, sectorSubtitle: identity.subtitle, sectorRow: row,
  }, { regionId: region.id, col, row });
}

export function getSectorName(regionId, col, row) {
  if (row === 1) return BLOCK_DEFS[regionId]?.[col]?.name || "Asentamiento";
  const idx = row === 0 ? col : col + 3;
  return WILD_IDENTITIES[regionId]?.[idx]?.name || "Sector salvaje";
}

export function buildExploreWilds() {
  return REGIONS.map((region) => {
    const m = {};
    for (const row of [0, 2]) for (let col = 0; col < SECTOR_COLS; col++) m[`${col}_${row}`] = generateWildSector(region, col, row);
    return m;
  });
}