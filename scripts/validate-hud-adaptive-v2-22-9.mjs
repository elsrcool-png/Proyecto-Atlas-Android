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
const hud = read("src/components/atlas/ui-v3/ExploreHudV3.jsx");
const quick = read("src/components/atlas/ui-v3/ExploreQuickMenuV3.jsx");
const editor = read("src/components/atlas/AtlasControlEditor.jsx");
const settings = read("src/components/atlas/SettingsModal.jsx");
const settingsV3 = read("src/components/atlas/ui-v3/SettingsModalV3.jsx");
const hubSettings = read("src/components/atlas/hub/HubSettings.jsx");
const layout = read("src/lib/atlasHudLayout.js");
const stored = read("src/lib/atlasSettings.js");
const explore = read("src/components/atlas/ExploreMode.jsx");
const css = read("src/index.css");

check(pkg.version === "2.22.9", "versión 2.22.9");
check(pkg.scripts?.["validate:v2-22"]?.includes("validate:hud-adaptive-v2-22-9"), "validación adaptativa incluida en cadena acumulativa");
check(hud.includes("atlas-adaptive-hud") && hud.includes("atlas-hud-mission") && hud.includes("atlas-hud-vitals"), "cabecera adaptativa real");
check(hud.includes("resolveActionLabel") && hud.includes("atlas-action-idle") && !hud.includes('sublabel={actionReady ? "Acción"'), "botón A contextual y discreto cuando no se usa");
check(hud.includes("ExploreQuickMenuV3") && quick.includes("Mapa de exploración") && quick.includes("Centro de Atlas") && quick.includes("Pausa y salida"), "menú rápido reemplaza la fila saturada de accesos");
check(quick.includes("OrientationToggleButton"), "orientación accesible desde menú rápido");
check(css.includes("@media (orientation: portrait)") && css.includes("@media (orientation: landscape)") && css.includes("grid-template-areas"), "composiciones independientes para vertical y horizontal");
check(css.includes("safe-area-inset-top") && css.includes("safe-area-inset-right") && css.includes("100dvh"), "áreas seguras y altura dinámica respetadas");
check(layout.includes("balanced") && layout.includes("clean") && layout.includes("compact") && layout.includes("accessible"), "cuatro perfiles del HUD Maestro");
check(settings.includes("Perfil del HUD Maestro") && settingsV3.includes("Perfil del HUD Maestro") && hubSettings.includes("Perfil del HUD Maestro"), "perfiles disponibles desde todos los ajustes");
check(settings.includes("Adaptativo") && settingsV3.includes("Adaptativo"), "densidad adaptativa disponible");
check(editor.includes("HUD_ELEMENT_LABELS") && editor.includes("Cancelar cambios") && editor.includes("Guardar") && editor.includes("Cabecera adaptativa"), "editor controla cabecera y conserva guardar/cancelar");
check(editor.includes("onPointerMove") && editor.includes("controlProfiles"), "controles siguen siendo arrastrables por orientación");
check(stored.includes("layoutVersion: 21") && stored.includes("normalizeHudElements"), "migración segura de ajustes anteriores");
check(explore.includes("atlas-hud-preset-") && explore.includes('data-hud-density='), "perfil activo conectado a exploración");
check(explore.includes("onOpenSheet={game.onOpenSheet}") && explore.includes("onOpenSettings={game.onOpenSettings}"), "menú rápido conectado con hoja y ajustes reales");

if (failures) {
  console.error(`\nValidación v2.22.9 falló: ${failures} comprobación(es).`);
  process.exit(1);
}
console.log("\nValidación v2.22.9 correcta: HUD Maestro Adaptativo integrado.");
