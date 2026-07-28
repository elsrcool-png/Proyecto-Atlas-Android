#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || process.cwd());
const errors = [];
const required = [
  "src/styles/atlas-ui-v3-tokens.css",
  "src/styles/atlas-ui-v3-components.css",
  "src/styles/atlas-ui-v3-responsive.css",
  "src/styles/atlas-ui-v3-compat.css",
  "src/components/atlas/ui/index.js",
  "src/components/atlas/ui-v3/MainMenuV3.jsx",
  "src/components/atlas/ui-v3/SaveSlotsModalV3.jsx",
  "src/components/atlas/ui-v3/CharacterSelectV3.jsx",
  "src/components/atlas/ui-v3/PlayerHubV3.jsx",
  "src/components/atlas/ui-v3/SettingsModalV3.jsx",
  "src/components/atlas/ui-v3/ExploreHudV3.jsx",
  "src/components/atlas/ui-v3/DungeonHudV3.jsx",
  "src/components/atlas/ui-v3/CombatViewAdapterV3.jsx",
  "public/assets/atlas/ui/v3/menu_region_verde.jpg",
];
for (const relative of required) if (!fs.existsSync(path.join(root, relative))) errors.push(`Falta ${relative}`);

function contains(rel, tokens) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, "utf8");
  for (const token of tokens) if (!text.includes(token)) errors.push(`${rel} no conserva ${token}`);
}
contains("src/components/atlas/ui-v3/PlayerHubV3.jsx", ["onEquipHelmet", "onSellHelmet", "onEquipAccessory", "player={player}"]);
contains("src/lib/atlasUiContracts.js", ["onEquipHelmet", "onSellHelmet"]);
contains("src/components/atlas/ui-v3/ExploreHudV3.jsx", ["ExploreSeparatedControlsV3"]);

const freeHud = path.join(root, "src/components/atlas/ui-v3/ExploreHudV3.jsx");
if (fs.existsSync(freeHud)) {
  const source = fs.readFileSync(freeHud, "utf8").toLowerCase();
  if (source.includes("onskill") || source.includes("habilidad de clase")) errors.push("ExploreHudV3 contiene habilidades; el modo libre no debe mostrarlas");
}

if (errors.length) {
  console.error("[Atlas UI v3/v2.21] Validación fallida:");
  errors.forEach(e => console.error(` - ${e}`));
  process.exit(1);
}
console.log("PASS UI V3 PREINTEGRACION V2.21");
console.log("Contratos de casco, segundo accesorio, HUD libre y archivos: OK");
