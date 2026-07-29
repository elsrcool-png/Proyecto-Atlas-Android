// PROYECTO ATLAS — Generación del mundo de exploración (modo libre)
import { MONSTERS } from "@/lib/atlasData";
import { scaleEnemyForWorld, randomRegionMonster } from "@/lib/atlasEnemyAI";

export const TILE = 56;
export const COLS = 42, ROWS = 42;
export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const GROUND = {
  verde: { base: "#5fa838", alt: "#6cba3f", path: "#c9a063", fog: "rgba(60,110,50,0.16)", water: "#65b9e8", flowers: true, rockBase: "#dcb982", rockHi: "#c69f6e", rockDark: "#8f6f45" },
  fria: { base: "#dceaf5", alt: "#c4daee", path: "#aab8c8", fog: "rgba(210,230,248,0.16)", water: "#66b2ff", pebbles: true, rockBase: "#d1d1d1", rockHi: "#f0f0f0", rockDark: "#9e9e9e" },
  desierto: { base: "#dab45a", alt: "#e0bd66", path: "#e6c289", fog: "rgba(200,150,70,0.14)", water: "#3a8a7a", flowers: false, rockBase: "#c67d45", rockHi: "#d99557", rockDark: "#8a5a30" },
};

export const DECOR_POOL = {
  verde: [{ icon: "treepine", solid: true, sz: 48 }, { icon: "trees", solid: true, sz: 48 }, { icon: "tree2", solid: true, sz: 48 }, { icon: "mountain", solid: true, sz: 36 }, { icon: "leaf", solid: false, sz: 24 }, { icon: "wind", solid: false, sz: 28 }, { icon: "waves", solid: true, sz: 64, lake: true }, { icon: "bush", solid: true, sz: 28 }, { icon: "log", solid: true, sz: 40 }, { icon: "stump", solid: true, sz: 30 }, { icon: "smallrock", solid: true, sz: 26 }, { icon: "mushroom", solid: true, sz: 22 }, { icon: "deadtree", solid: true, sz: 44 }, { icon: "campfire", solid: true, sz: 30 }, { icon: "ruins", solid: true, sz: 40 }],
  fria: [{ icon: "treepine", solid: true, sz: 48 }, { icon: "tree2", solid: true, sz: 48 }, { icon: "mountain", solid: true, sz: 36 }, { icon: "snowflake", solid: true, sz: 40 }, { icon: "wind", solid: false, sz: 22 }, { icon: "mountainsnow", solid: true, sz: 56 }, { icon: "gem", solid: true, sz: 32 }, { icon: "bush", solid: true, sz: 28 }, { icon: "log", solid: true, sz: 40 }, { icon: "stump", solid: true, sz: 30 }, { icon: "smallrock", solid: true, sz: 26 }, { icon: "mushroom", solid: true, sz: 22 }, { icon: "cave", solid: true, sz: 56 }, { icon: "ruins", solid: true, sz: 40 }],
  desierto: [{ icon: "cactus", solid: true, sz: 40 }, { icon: "mountain", solid: true, sz: 36 }, { icon: "landmark", solid: true, sz: 44 }, { icon: "sun", solid: false, sz: 30 }, { icon: "skull", solid: false, sz: 24 }, { icon: "bone", solid: true, sz: 52 }, { icon: "smallrock", solid: true, sz: 26 }, { icon: "stump", solid: true, sz: 30 }, { icon: "log", solid: true, sz: 40 }, { icon: "deadtree", solid: true, sz: 44 }, { icon: "cave", solid: true, sz: 56 }, { icon: "ruins", solid: true, sz: 40 }],
};

export function scaleMonster(m, mul, regionId) {
  return scaleEnemyForWorld(m, mul, regionId || "verde");
}

export function generateExploreWorld(region) {
  const W = COLS * TILE, H = ROWS * TILE;
  const mul = region.difficultyMul;
  const solids = [];
  const decor = [];
  const water = [];
  const pool = DECOR_POOL[region.id];
  for (let i = 0; i < 150; i++) {
    const x = rand(40, W - 80), y = rand(40, H - 80);
    if (Math.hypot(x - W * 0.12, y - H * 0.12) < 140) continue;
    const d = pool[randInt(0, pool.length - 1)];
    const w = d.sz * 0.6, h = d.sz * 0.6;
    if (d.lake) { water.push({ x, y, sz: d.sz }); continue; }
    if (!d.solid) continue;
    decor.push({ x, y, icon: d.icon, sz: d.sz });
    solids.push({ x: x - w / 2, y: y - h / 2, w, h });
  }
  const npcs = [
    { key: "campamento", x: W * 0.12, y: H * 0.12, icon: region.npcs.campamento.icon, name: region.npcs.campamento.name },
    { key: "pueblo", x: W * 0.82, y: H * 0.18, icon: region.npcs.pueblo.icon, name: region.npcs.pueblo.name },
    { key: "ciudad", x: W * 0.5, y: H * 0.86, icon: region.npcs.ciudad.icon, name: region.npcs.ciudad.name },
  ];
  const chests = [];
  for (let i = 0; i < 7; i++) chests.push({ id: i, x: rand(80, W - 80), y: rand(80, H - 80) });
  const enemies = [];
  const enemyCount = 7 + Math.floor(mul * 2);
  for (let i = 0; i < enemyCount; i++) {
    const m = randomRegionMonster(region.id, MONSTERS);
    enemies.push({ id: i, x: rand(120, W - 120), y: rand(120, H - 120), angle: rand(0, Math.PI * 2), timer: 0, monster: scaleMonster(m, mul, region.id) });
  }
  const boss = { x: W * 0.5, y: H * 0.5, monster: scaleEnemyForWorld(region.boss, mul, region.id) };
  const objective = { x: W * 0.72, y: H * 0.32 };
  return { W, H, decor, water, solids, npcs, chests, enemies, boss, spawn: { x: W * 0.12 + 70, y: H * 0.12 + 70 }, portal: { x: W - 50, y: H * 0.5 }, objective, biome: region.id };
}

export function hitSolid(x, y, solids, r = 16) {
  for (const s of solids) {
    const cx = clamp(x, s.x, s.x + s.w), cy = clamp(y, s.y, s.y + s.h);
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
  }
  return false;
}