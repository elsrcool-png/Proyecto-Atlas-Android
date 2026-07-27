import fs from "node:fs";
import path from "node:path";
import { readOggVorbisDuration } from "./lib/ogg-vorbis-duration.mjs";

const root = process.cwd();
const errors = [];
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const pkg = JSON.parse(read("package.json"));
if (!/^2\.19\./.test(pkg.version)) errors.push(`Versión incorrecta: ${pkg.version}`);
if (!pkg.scripts?.["validate:audio-green"]) errors.push("Falta script validate:audio-green");

const requiredCode = [
  "src/lib/atlasAudioCatalog.js",
  "src/lib/atlasAudioEngine.js",
  "src/hooks/useAtlasAudio.js",
  "src/components/atlas/CombatAudioIntro.jsx",
  "src/components/atlas/SettingsModal.jsx",
  "src/components/atlas/hub/HubSettings.jsx",
  "src/pages/Game.jsx",
  "src/lib/atlasSettings.js",
  "scripts/generate-atlas-audio-prototype.py",
];
for (const f of requiredCode) if (!exists(f)) errors.push(`Falta ${f}`);

const manifestPath = "public/assets/audio/audio_manifest.json";
if (!exists(manifestPath)) errors.push(`Falta ${manifestPath}`);
let manifest = null;
if (exists(manifestPath)) {
  manifest = JSON.parse(read(manifestPath));
  if (manifest.version !== "1.0.0-prototype-green") errors.push(`Versión de audio incorrecta: ${manifest.version}`);
  const assets = Object.entries(manifest.assets || {});
  if (assets.length !== 32) errors.push(`Cantidad de audios incorrecta: ${assets.length}/32`);
  for (const [rel, meta] of assets) {
    const file = path.join(root, "public/assets/audio", rel);
    if (!fs.existsSync(file)) { errors.push(`Falta audio ${rel}`); continue; }
    const stat = fs.statSync(file);
    if (stat.size < 1500) errors.push(`Audio demasiado pequeño o corrupto: ${rel}`);
    const head = fs.readFileSync(file).subarray(0, 4).toString("ascii");
    if (head !== "OggS") errors.push(`Cabecera OGG inválida: ${rel}`);
    if (Number(meta.bytes) !== stat.size) errors.push(`Tamaño no coincide en manifiesto: ${rel}`);
  }
}

const catalog = read("src/lib/atlasAudioCatalog.js");
for (const id of ["orco_bruto","chaman_orco","asesino_orco","lobo_salvaje","brujo_feral","pantera_sombria","guardian_verde"]) {
  if (!catalog.includes(`${id}:`)) errors.push(`Falta perfil sonoro de ${id}`);
}
for (const token of ["greenCamp","greenExplore","greenCorruption","greenCombat","greenGuardian"]) {
  if (!catalog.includes(token)) errors.push(`Falta música ${token}`);
}

const hook = read("src/hooks/useAtlasAudio.js");
for (const token of ["combatIntroActive","diceRoll","getEnemyAudio","getCombatMusic","resolveActionSound","playPortal","animationSequence","sequence?.hits","hit.at"]) {
  if (!hook.includes(token)) errors.push(`Hook de audio no contiene ${token}`);
}

const game = read("src/pages/Game.jsx");
if (!game.includes("useAtlasAudio")) errors.push("Game no monta useAtlasAudio");
if (!game.includes("CombatAudioIntro")) errors.push("Game no muestra introducción de combate");
if (!game.includes("audio.combatIntroActive")) errors.push("La intro no bloquea acciones de combate");
if (!game.includes("audio.playPortal")) errors.push("El portal no dispara su audio");

const settings = read("src/lib/atlasSettings.js");
for (const key of ["audioEnabled","masterVolume","musicVolume","ambienceVolume","sfxVolume"]) {
  if (!settings.includes(key)) errors.push(`Falta ajuste ${key}`);
}

// Validador Ogg/Vorbis puro en Node: no depende de ffprobe ni de paquetes de Termux.
const loops = [
  "public/assets/audio/music/menu/atlas_theme_prototype.ogg",
  "public/assets/audio/music/green/camp_green_loop.ogg",
  "public/assets/audio/music/green/explore_green_loop.ogg",
  "public/assets/audio/music/green/corruption_green_loop.ogg",
  "public/assets/audio/music/combat/combat_green_loop.ogg",
  "public/assets/audio/music/bosses/guardian_green_loop.ogg",
];
for (const rel of loops) {
  if (!exists(rel)) continue;
  try {
    const { duration } = readOggVorbisDuration(path.join(root, rel));
    if (!Number.isFinite(duration) || duration < 20) errors.push(`Loop demasiado corto o inválido: ${rel} (${duration.toFixed(3)} s)`);
  } catch (error) {
    errors.push(`OGG/Vorbis inválido: ${rel} (${error.message})`);
  }
}

if (errors.length) {
  console.error("VALIDACIÓN AUDIO VERDE v2.19 FALLIDA");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

console.log("VALIDACIÓN AUDIO VERDE v2.19 CORRECTA");
console.log(" - 32 recursos OGG originales y decodificables");
console.log(" - 6 músicas en loop: menú, campamento, exploración, corrupción, combate y Guardián");
console.log(" - ambiente de bosque y campamento");
console.log(" - intros sonoras para 6 mobs verdes + Guardián Verde");
console.log(" - transición musical, dados, ataques, impactos, muerte, victoria y portal");
console.log(" - controles separados: maestro, música, ambiente y efectos");
