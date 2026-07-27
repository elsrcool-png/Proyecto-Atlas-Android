import fs from "node:fs";
import path from "node:path";
import { readOggVorbisDuration } from "./lib/ogg-vorbis-duration.mjs";

const root = process.cwd();
const checks = [];
const failures = [];
const abs = relative => path.join(root, relative);
const exists = relative => fs.existsSync(abs(relative));
const read = relative => fs.readFileSync(abs(relative), "utf8");

function expect(condition, name, detail = "") {
  if (condition) {
    checks.push(name);
    console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failures.push({ name, detail });
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function webpSize(file) {
  const b = fs.readFileSync(file);
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("cabecera WebP inválida");
  }
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
  }
  if (chunk === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  throw new Error(`chunk WebP no soportado: ${chunk}`);
}

const packageJson = JSON.parse(read("package.json"));
{
  const [major = 0, minor = 0, patch = 0] = String(packageJson.version || "0.0.0").split(".").map(Number);
  expect(major === 2 && (minor > 19 || (minor === 19 && patch >= 4)), "Versión compatible con v2.19.4 o superior", packageJson.version);
}
expect(Boolean(packageJson.scripts?.["validate:v2-19-4"]), "Existe validate:v2-19-4");

const sceneFile = "src/lib/atlasCombatScenes.js";
const bossBackground = "public/assets/atlas/combat/backgrounds/v1/region_verde_guardian.webp";
const bossReference = "docs/combate-fondos-maestro-v1/referencias/region_verde_guardian_anotada.png";
const oggReader = "scripts/lib/ogg-vorbis-duration.mjs";
const audioValidator = "scripts/validate-audio-green-v2-19.mjs";

for (const file of [sceneFile, bossBackground, bossReference, oggReader, audioValidator]) {
  expect(exists(file), `Archivo presente: ${file}`);
}

if (exists(bossBackground)) {
  try {
    const [width, height] = webpSize(abs(bossBackground));
    expect(width === 1280 && height === 720, "Fondo del Guardián mide 1280×720", `${width}×${height}`);
    expect(fs.statSync(abs(bossBackground)).size > 80_000, "Fondo del Guardián contiene detalle suficiente", `${fs.statSync(abs(bossBackground)).size} bytes`);
  } catch (error) {
    expect(false, "Fondo del Guardián WebP válido", error.message);
  }
}

if (exists(sceneFile)) {
  const scenes = read(sceneFile);
  expect(scenes.includes('id: "verde_guardian"'), "Catálogo contiene escena verde_guardian");
  expect(scenes.includes('region_verde_guardian.webp'), "Escena usa el fondo del Guardián");
  expect(scenes.includes('regionId === "verde" && id === "guardian_verde"'), "Guardián Verde selecciona su arena exclusiva");
  expect(scenes.indexOf('id === "guardian_verde"') < scenes.indexOf('if (regionId === "verde") return SCENES.verde_bosque'), "La escena del jefe tiene prioridad sobre el bosque genérico");
}

if (exists(audioValidator)) {
  const validator = read(audioValidator);
  expect(validator.includes("readOggVorbisDuration"), "Validador de audio usa lector Ogg/Vorbis interno");
  expect(!validator.includes("execFileSync(\"ffprobe\""), "Validador no depende de ffprobe");
  expect(!validator.includes("ffprobe no pudo leer"), "Mensajes de error ya no culpan falsamente al audio");
}

const loops = [
  "public/assets/audio/music/menu/atlas_theme_prototype.ogg",
  "public/assets/audio/music/green/camp_green_loop.ogg",
  "public/assets/audio/music/green/explore_green_loop.ogg",
  "public/assets/audio/music/green/corruption_green_loop.ogg",
  "public/assets/audio/music/combat/combat_green_loop.ogg",
  "public/assets/audio/music/bosses/guardian_green_loop.ogg",
];
for (const relative of loops) {
  try {
    const { duration, sampleRate } = readOggVorbisDuration(abs(relative));
    expect(duration >= 20, `OGG válido sin ffprobe: ${path.basename(relative)}`, `${duration.toFixed(3)} s · ${sampleRate} Hz`);
  } catch (error) {
    expect(false, `OGG válido sin ffprobe: ${path.basename(relative)}`, error.message);
  }
}

console.log(`\nControles aprobados: ${checks.length}`);
if (failures.length) {
  console.error(`Controles fallidos: ${failures.length}`);
  process.exit(1);
}
console.log("Atlas v2.19.4: escena del Guardián y validación de audio portátil correctas.");
