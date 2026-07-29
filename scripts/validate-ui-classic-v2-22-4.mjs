import fs from "node:fs";

function read(path) { return fs.readFileSync(path, "utf8"); }
function check(ok, label) {
  if (!ok) throw new Error(`Fallo: ${label}`);
  console.log(`✓ ${label}`);
}

const flags = read("src/lib/atlasHeroIntegrationFlags.js");
const game = read("src/pages/Game.jsx");
const explore = read("src/components/atlas/ExploreMode.jsx");
const hub = read("src/components/atlas/PlayerHub.jsx");
const backpack = read("src/components/atlas/BackpackModal.jsx");
const press = read("src/components/atlas/AtlasPressButton.jsx");
const action = read("src/components/atlas/ui/AtlasActionButton.jsx");
const css = read("src/index.css");
const pkg = JSON.parse(read("package.json"));

check(flags.includes('uiV3: Object.freeze({ enabled: false })'), "UI v3 desactivada por defecto");
check(game.includes("uiV3Enabled ? MainMenuV3 : MainMenuLegacy"), "fallback clásico conservado");
check(explore.includes('import PlayerHub from "./PlayerHub";'), "Centro de Atlas usa menú clásico");
check(!hub.includes("AtlasTabs"), "Centro de Atlas sin pestañas");
check(hub.includes('useState("home")'), "Centro abre en menú de secciones");
check(hub.includes("Volver al menú del Centro"), "cada sección tiene regreso explícito");
check(!backpack.includes("AtlasTabs"), "Mochila sin pestañas");
check(!backpack.includes("max-h-[50vh]"), "Mochila sin corte interno de 50vh");
check(backpack.includes("atlas-backpack-classic__body"), "Mochila con una sola zona desplazable");
check(press.includes("pressOnPointerUp = false"), "botón admite activación al soltar");
check(!press.includes("setPointerCapture"), "toque Android sin captura invasiva");
check(action.includes('pressOnPointerDown={activateImmediately}'), "botón A responde al primer contacto");
check(css.includes("Atlas v2.22.4 — interfaz clásica adaptativa"), "adaptación horizontal y áreas seguras");
check(["2.22.4", "2.22.5", "2.22.6", "2.22.7", "2.22.8"].includes(pkg.version), "base clásica v2.22.4 o correcciones posteriores");

console.log("\nValidación de interfaz clásica correcta: mochila completa y acción A inmediata.");
