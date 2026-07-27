import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";

const root = process.cwd();
const checks = [];
const failures = [];

function ok(name, detail = "") {
  checks.push({ name, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  failures.push({ name, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

function expect(condition, name, detail = "") {
  if (condition) ok(name, detail);
  else fail(name, detail);
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function exists(relative) {
  return fs.existsSync(path.join(root, relative));
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function webpSize(file) {
  const b = fs.readFileSync(file);
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("cabecera WebP inválida");
  }
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    const width = 1 + b.readUIntLE(24, 3);
    const height = 1 + b.readUIntLE(27, 3);
    return [width, height];
  }
  if (chunk === "VP8L") {
    if (b[20] !== 0x2f) throw new Error("firma VP8L inválida");
    const bits = b.readUInt32LE(21);
    const width = 1 + (bits & 0x3fff);
    const height = 1 + ((bits >> 14) & 0x3fff);
    return [width, height];
  }
  if (chunk === "VP8 ") {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) throw new Error("firma VP8 inválida");
    return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  throw new Error(`chunk WebP no soportado: ${chunk}`);
}

function parseSimpleCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.map(line => {
    const cells = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  });
}

const npcRootRel = "public/assets/atlas/npcs/region_verde/maestro_v1/runtime";
const npcRoot = path.join(root, npcRootRel);
const backgrounds = [
  "public/assets/atlas/combat/backgrounds/v1/region_verde_bosque.webp",
  "public/assets/atlas/combat/backgrounds/v1/region_artica_tundra.webp",
  "public/assets/atlas/combat/backgrounds/v1/region_artica_aurel.webp",
];
const references = [
  "docs/combate-fondos-maestro-v1/referencias/region_verde_bosque_anotada.png",
  "docs/combate-fondos-maestro-v1/referencias/region_artica_tundra_anotada.png",
  "docs/combate-fondos-maestro-v1/referencias/region_artica_aurel_anotada.png",
];

expect(exists("src/lib/atlasNpcAssetSprites.js"), "Existe el conector de NPC maestros");
expect(exists("src/lib/atlasCombatScenes.js"), "Existe el catálogo de escenas de combate");
expect(exists("src/components/atlas/EntitySprite.jsx"), "Existe EntitySprite");
expect(exists("src/components/atlas/CombatView.jsx"), "Existe CombatView");

const npcModule = read("src/lib/atlasNpcAssetSprites.js");
const sceneModule = read("src/lib/atlasCombatScenes.js");
const entitySprite = read("src/components/atlas/EntitySprite.jsx");
const combatView = read("src/components/atlas/CombatView.jsx");

const canonicalIds = [
  "capitan_roland", "bren", "elia", "cedric", "mercader_bryn", "guardian_refugio", "aldeano_kael", "darian",
  "alcalde_tomas", "mercader_aldric", "posadero_oleg", "forjador_orin", "aldeana_ira", "viajero_inn", "cartografo",
  "capitan_real", "mercader_real_senn", "hostelera_senna", "herrero_brun", "guardia_rurik",
];
const directions = ["down", "up", "left", "right"];
const runtimeFiles = [];
for (const id of canonicalIds) {
  for (const direction of directions) {
    runtimeFiles.push(path.join(npcRoot, id, `idle_${direction}.webp`));
  }
}
const discoveredRuntime = fs.existsSync(npcRoot)
  ? fs.readdirSync(npcRoot, { withFileTypes: true }).filter(e => e.isDirectory()).flatMap(e => (
      fs.readdirSync(path.join(npcRoot, e.name)).filter(name => name.endsWith(".webp")).map(name => path.join(npcRoot, e.name, name))
    ))
  : [];
expect(discoveredRuntime.length === 80, "El runtime contiene exactamente 80 sprites NPC", `${discoveredRuntime.length}/80`);
expect(canonicalIds.every(id => fs.existsSync(path.join(npcRoot, id))), "Están los 20 NPC canónicos", `${canonicalIds.length}/20`);
expect(runtimeFiles.every(fs.existsSync), "Cada NPC tiene down/up/left/right", `${runtimeFiles.filter(fs.existsSync).length}/80`);

let npcSizesOk = true;
for (const file of runtimeFiles) {
  try {
    const [w, h] = webpSize(file);
    if (w !== 72 || h !== 96) npcSizesOk = false;
  } catch {
    npcSizesOk = false;
  }
}
expect(npcSizesOk, "Todos los sprites NPC miden 72×96");

const inventoryRel = "docs/npc-region-verde-maestro-v1/inventario.csv";
expect(exists(inventoryRel), "Se conserva el inventario original de NPC");
if (exists(inventoryRel)) {
  const rows = parseSimpleCsv(read(inventoryRel));
  let hashOk = rows.length === 80;
  for (const row of rows) {
    const file = path.join(npcRoot, row.npc_id, `idle_${row.direccion}.webp`);
    if (!fs.existsSync(file) || sha256(file) !== row.sha256_runtime) {
      hashOk = false;
      break;
    }
  }
  expect(hashOk, "Los 80 sprites coinciden con los SHA-256 del paquete maestro", `${rows.length}/80 inventariados`);
}

for (const id of canonicalIds) {
  expect(npcModule.includes(`"${id}"`), `NPC mapeado: ${id}`);
}
expect(npcModule.includes('verde_dungeon_bren: "bren"'), "Alias de Bren en entrada de dungeon conectado");
expect(npcModule.includes('verde_roland_vigilante: "capitan_roland"'), "Alias de Roland vigilante conectado");
expect(npcModule.includes('\"verde_vera_hunter\"'), "Vera conserva fallback procedural explícito");
expect(npcModule.includes("new Map(profiles.map") || npcModule.includes("new Set(Object.values(GREEN_NPC_ASSET_BY_VARIANT))"), "Precarga deduplicada por NPC canónico");

expect(entitySprite.includes('from "@/lib/atlasNpcAssetSprites"'), "EntitySprite importa el catálogo NPC");
expect(entitySprite.includes("hasNpcAssetVisual(type, variant)"), "EntitySprite detecta NPC con arte maestro");
expect(entitySprite.includes("getNpcAssetPath(variant, face)"), "EntitySprite selecciona dirección del NPC");
expect(entitySprite.includes("getNpcAssetDisplayMetrics(size)"), "EntitySprite conserva proporción 72×96");
expect(entitySprite.includes("directAssetPath = heroAssetPath || enemyAssetPath || npcAssetPath"), "NPC comparte ruta directa robusta con héroes y enemigos");

for (const bg of backgrounds) {
  expect(exists(bg), `Fondo runtime presente: ${path.basename(bg)}`);
  if (exists(bg)) {
    const [w, h] = webpSize(path.join(root, bg));
    expect(w === 1280 && h === 720, `Fondo 1280×720: ${path.basename(bg)}`, `${w}×${h}`);
  }
}
for (const ref of references) expect(exists(ref), `Referencia anotada archivada: ${path.basename(ref)}`);

expect(sceneModule.includes('path: `${COMBAT_BACKGROUND_ROOT}/region_verde_bosque.webp`'), "Escena verde usa fondo maestro");
expect(sceneModule.includes('path: `${COMBAT_BACKGROUND_ROOT}/region_artica_tundra.webp`'), "Escena ártica usa fondo tundra");
expect(sceneModule.includes('path: `${COMBAT_BACKGROUND_ROOT}/region_artica_aurel.webp`'), "Aurel usa arena de jefe");
expect(sceneModule.includes('id === "aurel_portador" || id === "aurel_ultimo_portador"'), "Se reconocen ambos identificadores de Aurel");
expect(sceneModule.includes('playerSide: "right"') && sceneModule.includes('enemySide: "left"'), "Escenas declaran jugador derecha y enemigo izquierda");

expect(combatView.includes('const PLAYER_COMBAT_DIRECTION = "left"'), "Jugador mira hacia la izquierda");
expect(combatView.includes('const ENEMY_COMBAT_DIRECTION = "right"'), "Enemigo mira hacia la derecha");
expect(combatView.includes("const gap = Math.max(0, playerRect.left - enemyRect.right)"), "Distancia cuerpo a cuerpo calculada para formación invertida");
expect(combatView.includes('className="order-2 relative'), "Actor del jugador está a la derecha");
expect(combatView.includes('className="order-1 relative'), "Actor enemigo está a la izquierda");
expect(combatView.includes('data-atlas-combat-scene={sceneAsset.id}'), "CombatView marca la escena runtime activa");
expect(combatView.includes('backgroundImage: `url(${sceneAsset.path})`'), "CombatView renderiza el fondo maestro");
expect(combatView.includes('sceneAsset ? [] : Array.from'), "Los props procedurales se desactivan con fondo maestro");
expect(combatView.includes('readCombatAnchors("player", "enemy")'), "VFX del jugador usan anclajes reales");
expect(combatView.includes('readCombatAnchors("enemy", "player")'), "VFX enemigos usan anclajes reales");
expect(combatView.includes('f.side === "enemy" ? "16%" : "70%"'), "Fallback de daño flotante respeta los nuevos lados");

const forbiddenBackups = [
  "src/components/atlas/CombatView.jsx.bak_v2192",
  "public/assets/atlas/combat/backgrounds/v1/region_artica_aurel_preclean.webp",
];
expect(forbiddenBackups.every(item => !exists(item)), "No se empaquetan respaldos temporales de integración");

console.log(`\nControles aprobados: ${checks.length}`);
if (failures.length) {
  console.error(`Controles fallidos: ${failures.length}`);
  for (const item of failures) console.error(`- ${item.name}${item.detail ? `: ${item.detail}` : ""}`);
  process.exit(1);
}
console.log("Integración visual Atlas v2.19.3 validada.");
