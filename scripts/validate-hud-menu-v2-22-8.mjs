import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failures += 1;
};

const pkg = JSON.parse(read("package.json"));
const css = read("src/index.css");
const editor = read("src/components/atlas/AtlasControlEditor.jsx");
const pause = read("src/components/atlas/ui-v3/PauseMenuV3.jsx");
const explore = read("src/components/atlas/ExploreMode.jsx");
const game = read("src/pages/Game.jsx");
const legacySettings = read("src/components/atlas/SettingsModal.jsx");
const v3Settings = read("src/components/atlas/ui-v3/SettingsModalV3.jsx");

check(pkg.version === "2.22.8", "versión 2.22.8");
check(!css.includes("atlas-right-handed .atlas-joystick-wrap") && !css.includes("atlas-left-handed .atlas-joystick-wrap"), "CSS no fuerza la posición del joystick sobre el perfil guardado");
check(editor.includes("Personalizar HUD táctil") && editor.includes("controlProfiles"), "editor del HUD táctil disponible");
check(legacySettings.includes("Personalizar HUD táctil") && v3Settings.includes("Personalizar HUD táctil"), "editor accesible desde ambos ajustes");
check(pause.includes("Volver al menú principal") && pause.includes("Guardar y volver"), "pausa incluye retorno seguro al menú principal");
check(pause.includes("onCustomizeHud") && explore.includes("setShowHudEditor(true)"), "pausa abre el editor del HUD");
check(explore.includes("onReturnMainMenu={game.onReturnMainMenu}"), "ExploreMode conecta retorno al menú");
check(game.includes("const returnToMainMenu") && game.includes("s.reset();") && game.includes("setMode(null);"), "retorno guarda y vuelve al menú sin borrar ranura");

if (failures) {
  console.error(`\nValidación v2.22.8 falló: ${failures} comprobación(es).`);
  process.exit(1);
}
console.log("\nValidación v2.22.8 correcta: HUD táctil personalizable y retorno seguro al menú principal.");
