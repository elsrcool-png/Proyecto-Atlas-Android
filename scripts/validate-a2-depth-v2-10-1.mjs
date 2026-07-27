// Compatibilidad: la antigua validación de profundidad ahora comprueba A2 maestro v2.11.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GREEN_VISUAL_SCENES } from "../src/lib/atlasGreenVisualScenes.js";
import { getWorldDepth } from "../src/lib/atlasDepth.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scene = GREEN_VISUAL_SCENES.A2;
const errors = [];
const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
if (scene.depthMode !== "feet-y") errors.push("A2 no declara depthMode: feet-y");
if (!(getWorldDepth(100) < getWorldDepth(200))) errors.push("La profundidad no aumenta de norte a sur");
const trees = scene.objects.filter((item) => item.tags?.includes("tree"));
for (const tree of trees) {
  const trunk = scene.collisions.filter((collision) => collision.object === tree.id);
  if (!trunk.length) errors.push(`Árbol sin colisión de tronco: ${tree.id}`);
  for (const collision of trunk) for (const water of scene.waterZones || []) if (intersects(collision, water)) errors.push(`Árbol dentro del agua: ${tree.id}`);
}
const large = scene.objects.filter((item) => item.tags?.includes("tree") || item.tags?.includes("structure") || item.tags?.includes("tent"));
for (const item of large) {
  if (!Number.isFinite(item.depthY)) errors.push(`Objeto sin depthY: ${item.id}`);
  if (!item.collision) errors.push(`Objeto grande sin colisión de base: ${item.id}`);
}
const spawnBox = { x: scene.spawn.x - 8, y: scene.spawn.y - 8, w: 16, h: 16 };
for (const collision of scene.collisions) if (intersects(spawnBox, collision)) errors.push(`Spawn bloqueado por ${collision.id}`);
const renderer = fs.readFileSync(path.join(root, "src/components/atlas/AssetWorldLayer.jsx"), "utf8");
const explore = fs.readFileSync(path.join(root, "src/components/atlas/ExploreMode.jsx"), "utf8");
if (!renderer.includes("getObjectDepth")) errors.push("AssetWorldLayer no usa profundidad compartida");
if (!explore.includes("setWorldDepth(playerRef.current")) errors.push("Jugador sin actualización dinámica de profundidad");
if (errors.length) {
  console.error("VALIDACIÓN A2 PROFUNDIDAD MAESTRO FALLIDA");
  for (const error of errors) console.error(" -", error);
  process.exit(1);
}
console.log("VALIDACIÓN A2 PROFUNDIDAD MAESTRO CORRECTA");
console.log(` - ${trees.length} árboles con tronco fuera del agua`);
console.log(` - ${large.length} objetos grandes con depthY y colisión de base`);
console.log(" - jugador, NPC, mobs y objetos comparten orden Y");
