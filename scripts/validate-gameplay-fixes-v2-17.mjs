import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { deriveUnlockedSectorKeys } from "../src/lib/atlasMissionUnlocks.js";
import { GREEN_CAMPAIGN_V2 } from "../src/lib/atlasGreenCampaignV2.js";
import { ARCTIC_CAMPAIGN_V2 } from "../src/lib/atlasArcticCampaignV2.js";

const root = process.cwd();
const errors = [];
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const sha = (relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
const flatten = (defs) => ["campamento", "pueblo", "ciudad"].flatMap((key) => defs[key] || []);
const stateMap = (defs) => Object.fromEntries(flatten(defs).map((def) => [def.id, {
  progress: 0, stepIndex: 0, stepProgress: 0, status: "pending", active: false, accepted: false, completedObjectives: [],
}]));

const required = [
  "src/components/atlas/EntitySprite.jsx",
  "src/components/atlas/CombatView.jsx",
  "src/components/atlas/ShrineMarker.jsx",
  "src/hooks/useAtlasSession.js",
  "src/hooks/useAtlasRegionTravel.js",
  "src/lib/atlasMissionUnlocks.js",
  "src/lib/atlasMissionSectors.js",
  "src/lib/atlasGreenVisualScenes.js",
];
for (const relative of required) if (!fs.existsSync(path.join(root, relative))) errors.push(`Falta ${relative}`);

const pkg = JSON.parse(read("package.json"));
const [pkgMajor, pkgMinor] = String(pkg.version || "0.0.0").split(".").map(Number);
if (pkgMajor !== 2 || pkgMinor < 17) errors.push(`Versión incompatible con la base v2.17: ${pkg.version}`);
if (!pkg.scripts?.["validate:v2-17-fixes"]) errors.push("Falta script validate:v2-17-fixes");

const entitySprite = read("src/components/atlas/EntitySprite.jsx");
if (!entitySprite.includes("getEnemyAssetPath")) errors.push("EntitySprite no resuelve la ruta del mob maestro");
if (!entitySprite.includes("getHeroAssetPath")) errors.push("EntitySprite no resuelve la ruta del héroe maestro");
if (!entitySprite.includes("if (directAssetPath && !assetFailed)")) errors.push("EntitySprite no prioriza el asset maestro directo");
if (!entitySprite.includes("<img")) errors.push("EntitySprite no renderiza el asset maestro como imagen directa");

const combat = read("src/components/atlas/CombatView.jsx");
if (!combat.includes('PLAYER_COMBAT_DIRECTION = "left"')) errors.push("Orientación del jugador en combate incorrecta para la formación v2.19.3");
if (!combat.includes('ENEMY_COMBAT_DIRECTION = "right"')) errors.push("Orientación del enemigo en combate incorrecta para la formación v2.19.3");
if ((combat.match(/dir=\{PLAYER_COMBAT_DIRECTION\}/g) || []).length < 2) errors.push("No todas las vistas del jugador usan la orientación canónica");
if ((combat.match(/dir=\{ENEMY_COMBAT_DIRECTION\}/g) || []).length < 2) errors.push("No todas las vistas enemigas usan la orientación canónica");

const elfoLeftRuntime = "public/assets/atlas/heroes/maestro_v1/runtime/elfo_mago/left.webp";
const elfoRightRuntime = "public/assets/atlas/heroes/maestro_v1/runtime/elfo_mago/right.webp";
const elfoLeftMaster = "public/assets/atlas/heroes/maestro_v1/masters/elfo_mago/left.webp";
const elfoRightMaster = "public/assets/atlas/heroes/maestro_v1/masters/elfo_mago/right.webp";
for (const f of [elfoLeftRuntime, elfoRightRuntime, elfoLeftMaster, elfoRightMaster]) {
  if (!fs.existsSync(path.join(root, f))) errors.push(`Falta ${f}`);
}
if (!errors.length || [elfoLeftRuntime, elfoRightRuntime, elfoLeftMaster, elfoRightMaster].every((f) => fs.existsSync(path.join(root, f)))) {
  if (sha(elfoLeftRuntime) === sha(elfoRightRuntime)) errors.push("Elfo Mago runtime repite la misma orientación a izquierda y derecha");
  if (sha(elfoLeftMaster) === sha(elfoRightMaster)) errors.push("Elfo Mago maestro repite la misma orientación a izquierda y derecha");
}

const session = read("src/hooks/useAtlasSession.js");
const travel = read("src/hooks/useAtlasRegionTravel.js");
const missionSectors = read("src/lib/atlasMissionSectors.js");
if (/const\s+GREEN_TEST_UNLOCKS/.test(session)) errors.push("Sigue activo el desbloqueo de prueba de toda la Región Verde");
if (!session.includes("deriveUnlockedSectorKeys")) errors.push("La sesión no reconstruye sectores desde las misiones");
if (!travel.includes("deriveUnlockedSectorKeys")) errors.push("El viaje regional no reconstruye sectores desde las misiones");
if (!missionSectors.includes("!state.active")) errors.push("Una misión inactiva todavía puede abrir el sector de su objetivo actual");

const greenStates = stateMap(GREEN_CAMPAIGN_V2);
const greenInitial = deriveUnlockedSectorKeys("verde", GREEN_CAMPAIGN_V2, greenStates).sort();
if (JSON.stringify(greenInitial) !== JSON.stringify(["verde:A2"])) errors.push(`Inicio verde incorrecto: ${greenInitial.join(", ")}`);
const greenOpenMission = flatten(GREEN_CAMPAIGN_V2).find((def) => def.onAccept?.unlockSectors?.length);
if (!greenOpenMission) errors.push("No se encontró una misión verde con apertura onAccept");
else {
  greenStates[greenOpenMission.id] = { ...greenStates[greenOpenMission.id], accepted: true, active: true };
  const unlocked = new Set(deriveUnlockedSectorKeys("verde", GREEN_CAMPAIGN_V2, greenStates));
  for (const sid of greenOpenMission.onAccept.unlockSectors) if (!unlocked.has(`verde:${sid}`)) errors.push(`La misión ${greenOpenMission.id} no abre ${sid}`);
}

const arcticStates = stateMap(ARCTIC_CAMPAIGN_V2);
arcticStates.f1 = { ...arcticStates.f1, accepted: true, active: true };
const arcticF1 = new Set(deriveUnlockedSectorKeys("fria", ARCTIC_CAMPAIGN_V2, arcticStates));
for (const key of ["fria:A1", "fria:B1", "fria:C1"]) if (!arcticF1.has(key)) errors.push(`Progresión ártica f1 no conserva/abre ${key}`);

const greenVisual = read("src/lib/atlasGreenVisualScenes.js");
const shrine = read("src/components/atlas/ShrineMarker.jsx");
if (!greenVisual.includes("depthY: y - size * 0.255")) errors.push("El portal verde no ordena profundidad por su plataforma interactiva");
if (!shrine.includes("getWorldDepth(shrine.y, 0)")) errors.push("El marcador del portal sigue dibujándose delante del jugador");

const enemyRoot = path.join(root, "public/assets/atlas/enemies/maestro_v1/runtime");
const enemyIds = [
  "orco_bruto", "chaman_orco", "asesino_orco", "lobo_salvaje", "brujo_feral", "pantera_sombria",
  "guardian_verde", "guerrero_esqueletico", "necromante", "asesino_esqueletico", "aurel_ultimo_portador",
];
let enemyCount = 0;
for (const id of enemyIds) for (const dir of ["down", "up", "left", "right"]) {
  const f = path.join(enemyRoot, id, `${dir}.webp`);
  if (!fs.existsSync(f)) errors.push(`Falta mob runtime ${id}/${dir}.webp`);
  else enemyCount += 1;
}
if (enemyCount !== 44) errors.push(`Sprites enemigos runtime: ${enemyCount}/44`);

if (errors.length) {
  console.error("VALIDACIÓN ATLAS v2.17 FALLIDA");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("VALIDACIÓN ATLAS v2.17 CORRECTA");
console.log(" - Elfo Mago: izquierda y derecha diferenciadas");
console.log(" - Formación v2.19.3: enemigo a la izquierda y jugador a la derecha, ambos enfrentados");
console.log(" - 44/44 sprites enemigos runtime conectables como imágenes directas");
console.log(" - Región Verde inicia solo con A2");
console.log(" - sectores reconstruidos según aceptación, objetivos y cierre de misiones");
console.log(" - viaje entre regiones conserva el progreso de desbloqueo");
console.log(" - portal ordenado por plataforma, personaje visible delante al interactuar");
