import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { GREEN_VISUAL_SCENES } from "../src/lib/atlasGreenVisualScenes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(root, "public/assets/atlas/verde/maestro_v1");
const docsRoot = path.join(root, "docs/region-verde-maestro");
const manifestRoot = path.join(docsRoot, "03_SECTORES");
const errors = [];
const notes = [];

const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const filenameOf = (item) => path.basename(item.src || item.asset || "");

function countObjects(objects) {
  const counts = {};
  for (const item of objects) {
    const filename = filenameOf(item);
    counts[filename] = (counts[filename] || 0) + 1;
    for (const tag of item.tags || []) counts[`tag:${tag}`] = (counts[`tag:${tag}`] || 0) + 1;
  }
  return counts;
}

function countForKey(counts, key) {
  if (key === "tree") return counts["tag:tree"] || 0;
  if (key === "bush") return counts["tag:bush"] || 0;
  if (key === "sign") {
    return ["sign_to_lagoon.webp", "sign_to_city.webp", "sign_to_forest.webp"]
      .reduce((sum, filename) => sum + (counts[filename] || 0), 0);
  }
  return counts[key] || 0;
}

function loadSectorManifest(sectorId) {
  const dir = fs.readdirSync(manifestRoot).find((name) => name.startsWith(`${sectorId}_`));
  if (!dir) return null;
  return JSON.parse(fs.readFileSync(path.join(manifestRoot, dir, "manifest.json"), "utf8"));
}

// 1) Integridad del paquete maestro.
const checksumEntries = JSON.parse(fs.readFileSync(path.join(docsRoot, "checksums_sha256.json"), "utf8"));
if (checksumEntries.length !== 49) errors.push(`checksums: se esperaban 49 entradas y hay ${checksumEntries.length}`);
for (const entry of checksumEntries) {
  const file = path.join(assetRoot, entry.archivo);
  if (!fs.existsSync(file)) {
    errors.push(`asset faltante: ${entry.archivo}`);
    continue;
  }
  const actual = sha256(file);
  if (actual !== entry.sha256) errors.push(`checksum incorrecto: ${entry.archivo}`);
}

const sceneIds = Object.keys(GREEN_VISUAL_SCENES).sort();
if (sceneIds.join(",") !== "A1,A2,A3,B1,B2,B3,C1,C2,C3") {
  errors.push(`escenas verdes incompletas: ${sceneIds.join(", ")}`);
}

// 2) Conexión por sector, conteos del manifiesto y profundidad.
for (const sectorId of sceneIds) {
  const scene = GREEN_VISUAL_SCENES[sectorId];
  const manifest = loadSectorManifest(sectorId);
  if (!manifest) {
    errors.push(`${sectorId}: manifiesto no encontrado`);
    continue;
  }

  if (scene.version !== "2.12.0") errors.push(`${sectorId}: versión visual inesperada ${scene.version}`);
  if (scene.depthMode !== "feet-y") errors.push(`${sectorId}: depthMode no es feet-y`);
  if (scene.baseLayers?.length !== 1) errors.push(`${sectorId}: debe tener exactamente un terreno base`);
  if (filenameOf(scene.baseLayers?.[0] || {}) !== manifest.terrain) {
    errors.push(`${sectorId}: terreno conectado ${filenameOf(scene.baseLayers?.[0] || {})}, esperado ${manifest.terrain}`);
  }

  const allItems = [...(scene.baseLayers || []), ...(scene.objects || []), ...(scene.postBossObjects || [])];
  for (const item of allItems) {
    const src = item.src || item.asset;
    if (!src?.startsWith("/assets/atlas/verde/maestro_v1/")) errors.push(`${sectorId}/${item.id}: raíz no maestra ${src}`);
    const relative = src?.replace(/^\//, "");
    if (relative && !fs.existsSync(path.join(root, "public", relative))) errors.push(`${sectorId}/${item.id}: archivo inexistente ${src}`);
  }

  for (const item of scene.objects || []) {
    const isPortal = item.tags?.includes("portal");
    if (item.layer !== "ground" && !isPortal && item.depthY !== item.y) errors.push(`${sectorId}/${item.id}: depthY no coincide con el anclaje Y`);
    if (isPortal && !(item.depthY < item.y && item.depthY > item.y - item.height * 0.4)) errors.push(`${sectorId}/${item.id}: profundidad de plataforma del portal inválida`);
    if (item.layer !== "ground" && !(item.anchorY > 0.94 && item.anchorY < 0.95)) errors.push(`${sectorId}/${item.id}: anchorY maestro inválido ${item.anchorY}`);
  }

  const beforeCounts = countObjects(scene.objects || []);
  for (const [key, expected] of Object.entries(manifest.placements_before_boss || {})) {
    const actual = countForKey(beforeCounts, key);
    if (actual !== expected) errors.push(`${sectorId}: ${key} antes del jefe ${actual}, esperado ${expected}`);
  }

  if (manifest.placements_after_boss) {
    const removeIds = new Set(scene.postBossRemoveIds || []);
    const afterObjects = [
      ...(scene.objects || []).filter((item) => !removeIds.has(item.id)),
      ...(scene.postBossObjects || []),
    ];
    const afterCounts = countObjects(afterObjects);
    for (const [key, expected] of Object.entries(manifest.placements_after_boss)) {
      const actual = countForKey(afterCounts, key);
      if (actual !== expected) errors.push(`${sectorId}: ${key} después del jefe ${actual}, esperado ${expected}`);
    }
  }

  for (const tree of (scene.objects || []).filter((item) => item.tags?.includes("tree"))) {
    for (const water of scene.waterZones || []) {
      const inside = tree.x >= water.x && tree.x <= water.x + water.w && tree.y >= water.y && tree.y <= water.y + water.h;
      if (inside) errors.push(`${sectorId}/${tree.id}: tronco dentro del agua en ${tree.x},${tree.y}`);
    }
  }

  notes.push(`${sectorId}: ${scene.objects.length} objetos, ${scene.collisions.length} colisiones`);
}

const c3 = GREEN_VISUAL_SCENES.C3;
if (!c3.objects.some((item) => filenameOf(item) === "ruin_arch_corrupted_01.webp")) {
  errors.push("C3: arco corrompido maestro no conectado");
}

if (errors.length) {
  console.error("VALIDACIÓN REGIÓN VERDE MAESTRO v1 FALLIDA");
  for (const error of errors) console.error(" -", error);
  process.exit(1);
}

console.log("VALIDACIÓN REGIÓN VERDE MAESTRO v1 CORRECTA");
console.log(" - 49/49 assets con checksum correcto");
console.log(" - 9/9 terrenos conectados");
console.log(" - 40/40 objetos maestros disponibles");
console.log(" - Y-sort por pies activo en los nueve sectores");
console.log(" - Ningún tronco está anclado dentro de una zona de agua declarada");
for (const note of notes) console.log(` - ${note}`);
