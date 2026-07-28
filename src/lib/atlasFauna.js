// PROYECTO ATLAS — Fauna neutral del mundo conectado (ecosistema vivo).
import { rand, randInt } from "@/lib/atlasWorld";

const SPECIES = {
  verde: [
    { id: "deer", emoji: "🦌", speed: 1.1 },
    { id: "rabbit", emoji: "🐰", speed: 1.5 },
    { id: "bird", emoji: "🐦", speed: 1.7 },
    { id: "fox", emoji: "🦊", speed: 1.2 },
  ],
  fria: [
    { id: "fox", emoji: "🦊", speed: 1.2 },
    { id: "wolf", emoji: "🐺", speed: 1.1 },
    { id: "snowbird", emoji: "🦅", speed: 1.6 },
    { id: "hare", emoji: "🐰", speed: 1.5 },
  ],
  desierto: [
    { id: "lizard", emoji: "🦎", speed: 1.3 },
    { id: "desertbird", emoji: "🦅", speed: 1.6 },
    { id: "jerboa", emoji: "🐭", speed: 1.6 },
    { id: "vulture", emoji: "🦅", speed: 1.2 },
  ],
};

const DENSITY_BY_ROW = { 0: 6, 1: 3, 2: 3 };

export function generateFauna(world, ctx) {
  if (!world) return [];
  const { regionId, col, row } = ctx;
  const pool = SPECIES[regionId] || SPECIES.verde;
  const W = world.W, H = world.H;
  const base = DENSITY_BY_ROW[row] ?? 4;
  const rifts = (world.loreMarkers || []).filter(m => m.kind === "rift");
  const avoid = (x, y) => {
    if (world.safeCenter && Math.hypot(x - world.safeCenter.x, y - world.safeCenter.y) < (world.safeRadius || 60) + 30) return true;
    for (const r of rifts) if (Math.hypot(x - r.x, y - r.y) < 100) return true;
    return false;
  };
  const out = [];
  let tries = 0;
  while (out.length < base && tries < 300) {
    tries++;
    const x = rand(40, W - 40), y = rand(40, H - 40);
    if (avoid(x, y)) continue;
    if (out.some(f => Math.hypot(f.x - x, f.y - y) < 64)) continue;
    const sp = pool[randInt(0, pool.length - 1)];
    out.push({ id: `fa_${col}_${row}_${out.length}`, emoji: sp.emoji, x, y, angle: rand(0, Math.PI * 2), timer: randInt(20, 120), speed: sp.speed });
  }
  return out;
}