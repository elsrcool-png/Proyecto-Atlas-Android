import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const checks = [];
const check = (condition, message) => {
  checks.push({ condition, message });
  if (!condition) console.error(`[ERROR] ${message}`);
};

const hub = read("src/components/atlas/ui-v3/PlayerHubV3.jsx");
const backpack = read("src/components/atlas/BackpackModal.jsx");
const tabs = read("src/components/atlas/ui/AtlasTabs.jsx");
const css = read("src/styles/atlas-ui-v3-responsive.css");
const flags = read("src/lib/atlasHeroIntegrationFlags.js");

check(hub.includes("atlas-hub-layout"), "PlayerHubV3 debe usar el layout horizontal dedicado.");
check(hub.includes("key={view}") && hub.includes("role=\"tabpanel\""), "PlayerHubV3 debe renderizar una sola pestaña activa.");
check(!hub.includes("lg:grid-cols-[250px_1fr]"), "PlayerHubV3 no debe depender del breakpoint lg para horizontal móvil.");
check(backpack.includes('useState("consumables")'), "La mochila debe mantener una pestaña activa.");
check(backpack.includes('view === "consumables"') && backpack.includes('view === "campaign"') && backpack.includes('view === "accessories"'), "La mochila debe separar Consumibles, Campaña y Accesorios.");
check(backpack.includes("atlas-backpack-content") && !backpack.includes("max-h-[50vh]"), "La mochila debe usar una sola zona de desplazamiento y no un corte fijo al 50%.");
check(tabs.includes("AtlasPressButton") && tabs.includes("aria-selected"), "AtlasTabs debe conservar entrada táctil compatible y semántica de pestañas.");
check(css.includes("@media (orientation: landscape) and (max-height: 640px)"), "Debe existir adaptación específica para horizontal móvil.");
check(css.includes("grid-template-columns: clamp(168px, 24vw, 214px) minmax(0, 1fr)"), "El Centro de Atlas debe usar navegación lateral en horizontal.");
check(css.includes("overflow-y: auto") && css.includes("overscroll-behavior: contain"), "Los paneles deben desplazar solo su contenido interno.");
check(flags.includes("uiV3: Object.freeze({ enabled: true })"), "La UI v3 corregida debe quedar activa.");

const failed = checks.filter(item => !item.condition);
if (failed.length) {
  console.error(`\nValidación UI v2.22.3 falló: ${failed.length}/${checks.length} comprobaciones.`);
  process.exit(1);
}
console.log(`Validación UI v2.22.3 correcta: ${checks.length} comprobaciones.`);
