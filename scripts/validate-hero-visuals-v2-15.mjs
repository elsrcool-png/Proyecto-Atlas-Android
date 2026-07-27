import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const assetRoot = path.join(root, "public/assets/atlas/heroes/maestro_v1");
const manifestPath = path.join(assetRoot, "manifest.json");
const checksumPath = path.join(assetRoot, "checksums_sha256.json");
const loaderPath = path.join(root, "src/lib/atlasHeroAssetSprites.js");
const bridgePath = path.join(root, "src/lib/atlasHeroSprites.js");
const selectionPath = path.join(root, "src/components/atlas/CharacterSelect.jsx");

const errors = [];
const requiredIds = [
  "humano_guerrero", "humano_mago", "humano_picaro",
  "enano_guerrero", "enano_mago", "enano_picaro",
  "elfo_guerrero", "elfo_mago", "elfo_picaro",
];
const directions = ["down", "up", "left", "right"];

for (const file of [manifestPath, checksumPath, loaderPath, bridgePath, selectionPath]) {
  if (!fs.existsSync(file)) errors.push(`Falta ${path.relative(root, file)}`);
}

if (!errors.length) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const ids = Object.keys(manifest.characters || {});
  for (const id of requiredIds) if (!ids.includes(id)) errors.push(`Personaje ausente en manifest: ${id}`);
  if (ids.length !== 9) errors.push(`Manifest contiene ${ids.length} personajes; se esperaban 9`);
  if (JSON.stringify(manifest.directions) !== JSON.stringify(directions)) errors.push("Direcciones del manifest incorrectas");

  const checksums = JSON.parse(fs.readFileSync(checksumPath, "utf8"));
  if (checksums.length !== 72) errors.push(`Checksums: ${checksums.length}; se esperaban 72`);
  for (const entry of checksums) {
    const absolute = path.join(assetRoot, entry.file);
    if (!fs.existsSync(absolute)) { errors.push(`Falta asset: ${entry.file}`); continue; }
    const hash = crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
    if (hash !== entry.sha256) errors.push(`Checksum incorrecto: ${entry.file}`);
  }

  for (const id of requiredIds) {
    for (const dir of directions) {
      for (const family of ["runtime", "masters"]) {
        const file = path.join(assetRoot, family, id, `${dir}.webp`);
        if (!fs.existsSync(file)) errors.push(`Falta ${family}/${id}/${dir}.webp`);
      }
    }
  }

  const loader = fs.readFileSync(loaderPath, "utf8");
  const bridge = fs.readFileSync(bridgePath, "utf8");
  const selection = fs.readFileSync(selectionPath, "utf8");
  if (!loader.includes('HERO_MASTER_ROOT = "/assets/atlas/heroes/maestro_v1/runtime"')) errors.push("Ruta runtime no conectada");
  for (const id of requiredIds) if (!loader.includes(`"${id}"`)) errors.push(`Loader sin ID ${id}`);
  if (!bridge.includes("drawHeroAssetSprite")) errors.push("atlasHeroSprites no usa el cargador maestro");
  if (!bridge.includes("drawProceduralHeroSprite")) errors.push("Falta respaldo procedural");
  if (!selection.includes("preloadHeroAssetVisuals")) errors.push("Selección no precarga los personajes");
}

if (errors.length) {
  console.error("VALIDACIÓN PERSONAJES v2.15 FALLIDA");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("VALIDACIÓN PERSONAJES v2.15 CORRECTA");
console.log(" - 9/9 combinaciones raza-clase conectadas");
console.log(" - 36/36 sprites runtime presentes");
console.log(" - 36/36 sprites maestros presentes");
console.log(" - 72/72 checksums SHA-256 correctos");
console.log(" - selección, mundo libre y combate usan el mismo arte maestro");
console.log(" - respaldo procedural conservado");
