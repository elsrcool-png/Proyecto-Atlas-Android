// PROYECTO ATLAS — Eventos aleatorios de exploración (Modo Libre).
import { rand, randInt, hitSolid } from "@/lib/atlasWorld";

const MERCHANT_LINES = [
  "«Mercancías de paso. El camino es largo y Atlas acecha.»",
  "«Compro y vendo; el oro habla más fuerte que la corrupción.»",
  "«Cuidado con los sectores del sur: algo los ha alterado.»",
  "«Si buscas materiales, los campamentos enemigos suelen guardarlos.»",
];
const ADVENTURER_LINES = [
  "Un grupo de aventureros descansa junto a la fogata. «Vimos una grieta al este. No te acerques.»",
  "«¿Tú también buscas los restos de los antiguos? No vuelvas solo.»",
  "Comentan en voz baja sobre un campamento enemigo que custodia un cofre cerca de aquí.",
  "«La fauna huye hacia el norte; algo la asusta en los sectores profundos.»",
];
const CAMP_LINES = [
  "Un campamento abandonado. Restos de una hoguera apagada y provisiones olvidadas.",
  "Las tiendas están desiertas. Algo obligó a sus dueños a huir con prisa.",
  "Huellas de corrupción marcan el suelo: la influencia de Atlas pasó por aquí.",
];

const EVENT_POOL = [
  { id: "wander_merchant", weight: 3 },
  { id: "adventurers", weight: 4 },
  { id: "abandoned_camp", weight: 3 },
  { id: "rare_creature", weight: 2 },
];

export function rollExplorationEvent(world, ctx) {
  if (!world) return null;
  const { regionId, col, row, threat = 0, progress = 0 } = ctx;
  if (row === 1 && col === 1) return null;
  const chance = Math.min(0.5, 0.16 + threat * 0.025 + progress * 0.1);
  if (Math.random() > chance) return null;
  const total = EVENT_POOL.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total, picked = EVENT_POOL[0];
  for (const e of EVENT_POOL) { r -= e.weight; if (r <= 0) { picked = e; break; } }
  let x = 0, y = 0, tries = 0, ok = false;
  while (!ok && tries < 80) {
    tries++;
    x = rand(70, world.W - 70); y = rand(70, world.H - 70);
    if (world.safeCenter && Math.hypot(x - world.safeCenter.x, y - world.safeCenter.y) < (world.safeRadius || 60) + 50) continue;
    if (world.solids && hitSolid(x, y, world.solids)) continue;
    ok = true;
  }
  if (!ok) return null;
  const ev = { id: `ev_${col}_${row}_${Date.now()}`, type: picked.id, x, y, regionId };
  if (picked.id === "wander_merchant") { ev.kind = "merchant"; ev.lines = MERCHANT_LINES; }
  else if (picked.id === "adventurers") { ev.kind = "adventurers"; ev.lines = ADVENTURER_LINES; }
  else if (picked.id === "abandoned_camp") { ev.kind = "camp"; ev.lines = CAMP_LINES; }
  else { ev.kind = "creature"; ev.lines = ["Una criatura especial te observa a distancia y se desvanece entre la niebla."]; }
  return ev;
}

export function randomEventLine(ev) {
  if (!ev || !ev.lines || !ev.lines.length) return null;
  return ev.lines[randInt(0, ev.lines.length - 1)];
}