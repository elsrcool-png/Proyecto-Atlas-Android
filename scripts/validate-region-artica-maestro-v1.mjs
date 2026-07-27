import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { ARCTIC_VISUAL_SCENES } from "../src/lib/atlasArcticVisualScenes.js";
import { getObjectDepth } from "../src/lib/atlasDepth.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const assetRoot = path.join(root, "public/assets/atlas/fria/maestro_v1");
const expectedRoot = "/assets/atlas/fria/maestro_v1";
const expectedCounts = { A1: 8, B1: 16, C1: 15, A2: 14, B2: 10, C2: 12, A3: 13, B3: 15, C3: 11 };
const expectedTerrains = Object.keys(expectedCounts).map((sector) => `terrain_${sector.toLowerCase()}.webp`);
const failures = [];
const passes = [];
const fail = (message) => failures.push(`✗ ${message}`);
const pass = (message) => passes.push(`✓ ${message}`);
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const [major = 0, minor = 0] = String(pkg.version || "0.0.0").split(".").map(Number);
const arcticCompatible = major > 2 || (major === 2 && minor >= 14);
if (!arcticCompatible) fail(`package.json requiere v2.14.0 o superior, recibida ${pkg.version}`);
else pass(`versión ${pkg.version} compatible con Región Ártica Maestro`);

const sceneSource = fs.readFileSync(path.join(root, "src/lib/atlasArcticVisualScenes.js"), "utf8");
if (!sceneSource.includes(`const ROOT = "${expectedRoot}"`)) fail("atlasArcticVisualScenes.js no apunta al catálogo maestro");
else pass("catálogo maestro conectado");
if (!sceneSource.includes("MASTER_GROUND_ANCHOR_Y = 968 / 1024")) fail("falta anclaje inferior normalizado 968/1024");
else pass("anclaje de contacto con suelo 968/1024 activo");
if (sceneSource.includes("/assets/atlas/fria/modular_v27")) fail("quedó una referencia activa al catálogo ártico heredado");
else pass("sin referencias activas al catálogo heredado");

const checksumFile = path.join(assetRoot, "checksums_sha256.json");
if (!fs.existsSync(checksumFile)) {
  fail("falta checksums_sha256.json");
} else {
  const entries = JSON.parse(fs.readFileSync(checksumFile, "utf8"));
  if (entries.length !== 27) fail(`checksums esperados 27, recibidos ${entries.length}`);
  else pass("27 recursos declarados en checksums");
  for (const entry of entries) {
    const file = path.join(assetRoot, entry.archivo);
    if (!fs.existsSync(file)) fail(`falta asset ${entry.archivo}`);
    else if (sha256(file) !== entry.sha256) fail(`checksum incorrecto: ${entry.archivo}`);
  }
  if (!failures.some((item) => item.includes("asset") || item.includes("checksum"))) pass("27/27 assets coinciden con el paquete aprobado");
}

for (const terrain of expectedTerrains) {
  if (!fs.existsSync(path.join(assetRoot, terrain))) fail(`falta terreno ${terrain}`);
}
if (!failures.some((item) => item.includes("terreno"))) pass("9/9 terrenos presentes");

const sectors = Object.keys(ARCTIC_VISUAL_SCENES);
if (sectors.length !== 9) fail(`escenas esperadas 9, recibidas ${sectors.length}`);
else pass("9/9 escenas árticas registradas");

let total = 0;
for (const [sector, expected] of Object.entries(expectedCounts)) {
  const scene = ARCTIC_VISUAL_SCENES[sector];
  if (!scene) {
    fail(`falta escena ${sector}`);
    continue;
  }
  if (scene.version !== "2.14.0") fail(`${sector}: versión visual ${scene.version}`);
  const terrain = scene.baseLayers?.[0]?.src || scene.baseLayers?.[0]?.asset || "";
  const expectedTerrain = `${expectedRoot}/terrain_${sector.toLowerCase()}.webp`;
  if (terrain !== expectedTerrain) fail(`${sector}: terreno conectado a ${terrain}`);
  if (scene.objects.length !== expected) fail(`${sector}: ${scene.objects.length} objetos, esperados ${expected}`);
  total += scene.objects.length;
  for (const object of scene.objects) {
    const src = object.src || object.asset || "";
    if (!src.startsWith(`${expectedRoot}/`)) fail(`${sector}/${object.id}: asset fuera del catálogo maestro`);
    if (Math.abs((object.anchorY ?? 0) - 968 / 1024) > 1e-8) fail(`${sector}/${object.id}: anchorY incorrecto`);
    if (object.width !== object.height) fail(`${sector}/${object.id}: lienzo maestro deformado ${object.width}×${object.height}`);
  }
}
if (total !== 114) fail(`colocaciones esperadas 114, recibidas ${total}`);
else pass("114/114 colocaciones conservadas");
if (!failures.some((item) => item.includes("lienzo maestro"))) pass("todos los objetos conservan proporción cuadrada");
if (!failures.some((item) => item.includes("anchorY"))) pass("todos los objetos usan el contacto visible con el suelo");

const north = getObjectDepth({ y: 100, layer: "world" });
const south = getObjectDepth({ y: 500, layer: "world" });
if (south <= north) fail("Y-sort invertido: el sur no queda delante");
else pass("Y-sort correcto: norte detrás, sur delante");

for (const line of passes) console.log(line);
if (failures.length) {
  console.error("\nVALIDACIÓN REGIÓN ÁRTICA MAESTRO v1.0 FALLIDA");
  for (const line of failures) console.error(line);
  process.exit(1);
}
console.log("\nVALIDACIÓN REGIÓN ÁRTICA MAESTRO v1.0 CORRECTA");
