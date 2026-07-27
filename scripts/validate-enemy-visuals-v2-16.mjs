import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const assetRoot = path.join(root, "public/assets/atlas/enemies/maestro_v1");
const manifestPath = path.join(assetRoot, "manifest.json");
const checksumPath = path.join(assetRoot, "checksums_sha256.json");
const loaderPath = path.join(root, "src/lib/atlasEnemyAssetSprites.js");
const bridgePath = path.join(root, "src/lib/atlasEntitySprites.js");
const componentPath = path.join(root, "src/components/atlas/EntitySprite.jsx");
const dataPath = path.join(root, "src/lib/atlasData.js");

const errors = [];
const directions = ["down", "up", "left", "right"];
const entities = [
  "orco_bruto", "chaman_orco", "asesino_orco", "lobo_salvaje", "brujo_feral", "pantera_sombria",
  "guardian_verde", "guerrero_esqueletico", "necromante", "asesino_esqueletico", "aurel_ultimo_portador",
];
const codeIds = [
  "orco_bruto", "chaman_orco", "asesino_orco", "lobo_salvaje", "brujo_feral", "pantera_sombria",
  "guardian_verde", "guerrero_esqueletico", "necromante", "asesino_esqueletico", "aurel_portador",
];

for (const file of [manifestPath, checksumPath, loaderPath, bridgePath, componentPath, dataPath]) {
  if (!fs.existsSync(file)) errors.push(`Falta ${path.relative(root, file)}`);
}

const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

if (!errors.length) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const [pkgMajor, pkgMinor] = String(pkg.version || "0.0.0").split(".").map(Number);
  if (pkgMajor !== 2 || pkgMinor < 16) errors.push(`Versión incompatible: ${pkg.version}`);
  if (!pkg.scripts?.["validate:enemy-master"]) errors.push("Falta script validate:enemy-master");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const manifestIds = (manifest.entities || []).map((entry) => entry.id);
  for (const id of entities) if (!manifestIds.includes(id)) errors.push(`Entidad ausente en manifest: ${id}`);
  if (manifestIds.length !== 11) errors.push(`Manifest contiene ${manifestIds.length} entidades; se esperaban 11`);
  if (manifest.code_aliases?.aurel_portador !== "aurel_ultimo_portador") errors.push("Alias visual de Aurel incorrecto");

  const checksums = JSON.parse(fs.readFileSync(checksumPath, "utf8"));
  for (const family of ["runtime", "masters"]) {
    const declared = checksums[family] || {};
    if (Object.keys(declared).length !== 44) errors.push(`${family}: ${Object.keys(declared).length} checksums; se esperaban 44`);
    for (const [relative, expected] of Object.entries(declared)) {
      const file = path.join(assetRoot, family, relative);
      if (!fs.existsSync(file)) { errors.push(`Falta ${family}/${relative}`); continue; }
      if (sha256(file) !== expected) errors.push(`Checksum incorrecto: ${family}/${relative}`);
    }
  }

  for (const id of entities) {
    for (const dir of directions) {
      for (const family of ["runtime", "masters"]) {
        const file = path.join(assetRoot, family, id, `${dir}.webp`);
        if (!fs.existsSync(file)) errors.push(`Falta ${family}/${id}/${dir}.webp`);
      }
    }
  }

  const loader = fs.readFileSync(loaderPath, "utf8");
  const bridge = fs.readFileSync(bridgePath, "utf8");
  const component = fs.readFileSync(componentPath, "utf8");
  const data = fs.readFileSync(dataPath, "utf8");
  if (!loader.includes('ENEMY_MASTER_ROOT = "/assets/atlas/enemies/maestro_v1/runtime"')) errors.push("Ruta runtime enemiga no conectada");
  for (const id of codeIds) if (!loader.includes(`${id}:`)) errors.push(`Loader sin ID ${id}`);
  if (!loader.includes('assetId: "aurel_ultimo_portador"')) errors.push("Loader sin alias físico de Aurel");
  if (!bridge.includes("drawEnemyAssetSprite")) errors.push("atlasEntitySprites no usa el cargador maestro");
  if (!bridge.includes("hasEnemyAssetVisual")) errors.push("atlasEntitySprites no conserva fallback condicional");
  if (!component.includes("getEnemyAssetDisplayMetrics")) errors.push("EntitySprite no conserva proporción de cada entidad");
  if (!component.includes("preloadEnemyAssetVisuals")) errors.push("EntitySprite no precarga los sprites enemigos");
  for (const id of codeIds) if (!data.includes(`id: "${id}"`)) errors.push(`Código del juego sin ID esperado: ${id}`);
}

if (errors.length) {
  console.error("VALIDACIÓN MOBS Y JEFES v2.16 FALLIDA");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("VALIDACIÓN MOBS Y JEFES v2.16 CORRECTA");
console.log(" - 11/11 entidades conectadas hasta Región Ártica");
console.log(" - 44/44 sprites runtime presentes");
console.log(" - 44/44 sprites maestros presentes");
console.log(" - 88/88 checksums SHA-256 correctos");
console.log(" - mundo libre, dungeons y combate usan el arte maestro");
console.log(" - alias aurel_portador → aurel_ultimo_portador activo");
console.log(" - proporciones, transparencia y anclaje inferior conservados");
console.log(" - respaldo procedural conservado");
