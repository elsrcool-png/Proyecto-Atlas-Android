import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { A2_MODULAR_V2_SCENE as scene } from "../src/lib/atlasA2ModularV2.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const ids = new Set();

const all = [...scene.baseLayers, ...scene.objects];
for (const object of all) {
  if (ids.has(object.id)) errors.push(`ID duplicado: ${object.id}`);
  ids.add(object.id);
  const rel = String(object.src || object.asset || "").replace(/^\//, "");
  if (!rel || !fs.existsSync(path.join(root, "public", rel))) errors.push(`Asset ausente: ${object.id} -> ${rel}`);
  if (!Number.isFinite(object.x) || !Number.isFinite(object.y)) errors.push(`Posición inválida: ${object.id}`);
}

if (scene.baseLayers.length !== 1) errors.push(`A2 debe usar una sola capa base conectada; recibió ${scene.baseLayers.length}.`);
if (scene.baseLayers[0]?.tags?.includes("ground-only") !== true) errors.push("La capa base no está marcada como ground-only.");
if (scene.objects.some(o => o.outline !== false)) errors.push("Hay objetos que aún dependen del filtro CSS de contorno.");
if (scene.objects.some(o => o.shadow !== false)) warnings.push("Hay objetos con sombra de runtime habilitada.");

const R = 11;
const solids = scene.collisions.map(c => ({ x: c.x - R, y: c.y - R, w: c.w + R * 2, h: c.h + R * 2, id: c.id }));
const inside = (x, y, c) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h;
const blocked = (x, y) => x < R || y < R || x > scene.width - R || y > scene.height - R || solids.some(c => inside(x, y, c));

for (const c of scene.collisions) {
  if (c.w <= 0 || c.h <= 0) errors.push(`Colisión inválida: ${c.id}`);
  if (c.x < -1 || c.y < -1 || c.x + c.w > scene.width + 1 || c.y + c.h > scene.height + 1) warnings.push(`Colisión fuera del mapa: ${c.id}`);
}

if (blocked(scene.spawn.x, scene.spawn.y)) errors.push("El spawn principal está dentro de una colisión.");
if (blocked(scene.sanctuary.spawnX, scene.sanctuary.spawnY)) errors.push("El spawn del santuario está dentro de una colisión.");

const step = 8;
const cols = Math.floor(scene.width / step) + 1;
const rows = Math.floor(scene.height / step) + 1;
const key = (cx, cy) => cy * cols + cx;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const toCell = ({ x, y }) => ({ cx: clamp(Math.round(x / step), 0, cols - 1), cy: clamp(Math.round(y / step), 0, rows - 1) });
const center = (cx, cy) => ({ x: cx * step, y: cy * step });

function reachable(start, target) {
  const s = toCell(start); const t = toCell(target);
  const queue = [s]; let qi = 0;
  const seen = new Uint8Array(cols * rows); seen[key(s.cx, s.cy)] = 1;
  while (qi < queue.length) {
    const cur = queue[qi++];
    if (Math.abs(cur.cx - t.cx) <= 1 && Math.abs(cur.cy - t.cy) <= 1) return true;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = cur.cx + dx, ny = cur.cy + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const k = key(nx, ny); if (seen[k]) continue;
      const p = center(nx, ny); if (blocked(p.x, p.y)) continue;
      seen[k] = 1; queue.push({ cx: nx, cy: ny });
    }
  }
  return false;
}

const targets = [
  ["santuario", { x: scene.sanctuary.x, y: scene.sanctuary.y + 58 }],
  ["salida oeste", scene.exits.west],
  ["salida este", scene.exits.east],
  ["salida sur", scene.exits.south],
  ...Object.entries(scene.npcAnchors).map(([name, pos]) => [`NPC ${name}`, pos]),
];
for (const [name, pos] of targets) {
  if (blocked(pos.x, pos.y)) errors.push(`${name} está dentro de una colisión.`);
  else if (!reachable(scene.spawn, pos)) errors.push(`${name} no es alcanzable desde el spawn.`);
}

const categories = {
  trees: scene.objects.filter(o => o.tags?.includes("tree")).length,
  tents: scene.objects.filter(o => o.tags?.includes("tent")).length,
  structures: scene.objects.filter(o => o.tags?.includes("structure")).length,
  props: scene.objects.filter(o => o.tags?.includes("prop")).length,
};

console.log(`A2 modular v2: ${scene.objects.length} objetos, ${scene.collisions.length} colisiones.`);
console.log(`Árboles: ${categories.trees}; carpas: ${categories.tents}; estructuras: ${categories.structures}; props: ${categories.props}.`);
console.log(`Assets únicos usados: ${new Set(all.map(o => o.src)).size}.`);
console.log(`Rutas verificadas: ${targets.length}.`);
for (const warning of warnings) console.warn(`ADVERTENCIA: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log("VALIDACIÓN A2 MODULAR V2: CORRECTA");
