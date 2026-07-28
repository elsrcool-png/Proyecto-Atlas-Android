import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";

const root = process.cwd();
const checks = [];
const failures = [];
const directions = ["down", "up", "left", "right"];
const arcticNpcIds = [
  "fria_astra", "fria_boreas", "fria_borin", "fria_captain", "fria_dvalin", "fria_einar",
  "fria_freya", "fria_helga", "fria_hostelera", "fria_kael_forger", "fria_lyra_cartographer",
  "fria_lyra_researcher", "fria_merchant_camp", "fria_merchant_glacial", "fria_merchant_royal",
  "fria_queen", "fria_refuge_keeper", "fria_shaman",
];

function ok(name, detail = "") { checks.push({ name, detail }); console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`); }
function fail(name, detail = "") { failures.push({ name, detail }); console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`); }
function expect(condition, name, detail = "") { condition ? ok(name, detail) : fail(name, detail); }
function rel(...parts) { return path.join(root, ...parts); }
function exists(...parts) { return fs.existsSync(rel(...parts)); }
function read(...parts) { return fs.readFileSync(rel(...parts), "utf8"); }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

function webpSize(file) {
  const b = fs.readFileSync(file);
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") throw new Error("cabecera WebP inválida");
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (chunk === "VP8L") {
    if (b[20] !== 0x2f) throw new Error("firma VP8L inválida");
    const bits = b.readUInt32LE(21);
    return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
  }
  if (chunk === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  throw new Error(`chunk WebP no soportado: ${chunk}`);
}

const pkg = JSON.parse(read("package.json"));
{
  const [major = 0, minor = 0, patch = 0] = String(pkg.version || "0.0.0").split(".").map(Number);
  expect(major > 2 || (major === 2 && (minor > 19 || (minor === 19 && patch >= 7))), "Versión compatible con Atlas v2.19.7 o superior", `actual=${pkg.version}`);
}
expect(pkg.scripts?.["validate:v2-19-7"], "Script agregado a package.json");

const npcModule = read("src/lib/atlasNpcAssetSprites.js");
expect(npcModule.includes('fria_borin: "fria_borin"'), "Borin conectado al catálogo maestro");
expect(npcModule.includes('fria_einar: "fria_einar"'), "Einar conectado al catálogo maestro");
expect(npcModule.includes('arcticNpcCount: 18'), "Auditoría declara 18 NPC árticos");
expect(npcModule.includes('proceduralFallbacks: ["verde_vera_hunter"]'), "Borin y Einar dejaron de ser fallback procedural");

let runtimeCount = 0;
for (const id of arcticNpcIds) {
  for (const direction of directions) {
    const file = rel("public", "assets", "atlas", "npcs", "region_artica", "maestro_v1", "runtime", id, `idle_${direction}.webp`);
    if (!fs.existsSync(file)) { fail(`${id}/${direction}`, "archivo faltante"); continue; }
    runtimeCount += 1;
    const [w, h] = webpSize(file);
    expect(w === 72 && h === 96, `${id}/${direction} usa lienzo 72×96`, `${w}×${h}`);
    expect(fs.statSync(file).size > 900, `${id}/${direction} contiene arte visible`, `${fs.statSync(file).size} bytes`);
  }
}
expect(runtimeCount === 72, "18 NPC × 4 direcciones presentes", `${runtimeCount}/72`);

for (const id of ["fria_borin", "fria_einar"]) {
  const folder = rel("public", "assets", "atlas", "npcs", "region_artica", "maestro_v1", "runtime", id);
  const sideA = hash(path.join(folder, "idle_left.webp"));
  const sideB = hash(path.join(folder, "idle_right.webp"));
  const front = hash(path.join(folder, "idle_down.webp"));
  const back = hash(path.join(folder, "idle_up.webp"));
  expect(sideA !== sideB, `${id} diferencia izquierda y derecha`);
  expect(front !== back, `${id} diferencia frente y espalda`);
}

expect(exists("docs", "npc-region-artica-maestro-v1", "fuentes", "herrero_borin_cuatro_direcciones.png"), "Fuente maestra de Borin conservada");
expect(exists("docs", "npc-region-artica-maestro-v1", "fuentes", "einar_cuatro_direcciones.png"), "Fuente maestra de Einar conservada");
expect(exists("docs", "previews", "npc_artica_18_maestro_v2197.png"), "Preview de los 18 NPC disponible");

const campaign = read("src/lib/atlasCampaign.js");
expect(campaign.includes('variant: "fria_borin"'), "Herrero Borin usa la variante maestra");
expect(campaign.includes('variant: "fria_einar"'), "Einar usa la variante maestra");

const storyPoints = read("src/lib/atlasStoryPoints.js");
expect(storyPoints.includes('sprite: options.sprite || null'), "Puntos narrativos admiten sprite maestro");
expect((storyPoints.match(/variant: "fria_einar"/g) || []).length >= 2, "Einar aparece visualmente herido y recuperado");

const marker = read("src/components/atlas/StoryPointMarker.jsx");
expect(marker.includes('import EntitySprite from "./EntitySprite"'), "StoryPointMarker carga EntitySprite");
expect(marker.includes("sp.sprite ?"), "StoryPointMarker renderiza NPC narrativo");

console.log(`\n${checks.length - failures.length}/${checks.length} controles aprobados.`);
if (failures.length) process.exit(1);
