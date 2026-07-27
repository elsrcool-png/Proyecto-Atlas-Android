// Compatibilidad: la antigua validación de A2 ahora comprueba la escena maestra v2.11.
import fs from "node:fs";
import path from "node:path";
import { GREEN_VISUAL_SCENES } from "../src/lib/atlasGreenVisualScenes.js";

const root = process.cwd();
const scene = GREEN_VISUAL_SCENES.A2;
const required = [
  "terrain_a2.webp", "tree_pine_tall_01.webp", "tree_pine_tall_02.webp", "tree_pine_tall_03.webp",
  "tree_round_01.webp", "tree_round_02.webp", "bush_medium_01.webp", "bush_medium_02.webp",
  "wildflowers_01.webp", "rock_medium_01.webp", "bridge_main.webp", "sanctuary_portal_clean.webp",
  "watchtower_complete.webp", "smithy_building_main.webp", "tent_red_01.webp", "tent_beige_01.webp",
  "tent_beige_02.webp", "tent_green_01.webp", "campfire_main.webp", "crate_01.webp", "barrel_01.webp",
  "fence_segment_clean.webp", "woodpile_01.webp", "sign_to_lagoon.webp", "sign_to_city.webp", "sign_to_forest.webp",
];
const errors = [];
const assetRoot = path.join(root, "public/assets/atlas/verde/maestro_v1");
for (const file of required) if (!fs.existsSync(path.join(assetRoot, file))) errors.push(`Falta asset maestro: ${file}`);
if (scene.version !== "2.11.0") errors.push(`Versión inesperada: ${scene.version}`);
if (scene.baseLayers?.[0]?.src !== "/assets/atlas/verde/maestro_v1/terrain_a2.webp") errors.push("terrain_a2 maestro no conectado");
if (!scene.objects.every((item) => item.src.startsWith("/assets/atlas/verde/maestro_v1/"))) errors.push("A2 contiene un asset fuera del catálogo maestro");
if (errors.length) {
  console.error("VALIDACIÓN A2 MAESTRO FALLIDA");
  for (const error of errors) console.error(" -", error);
  process.exit(1);
}
console.log("VALIDACIÓN A2 MAESTRO CORRECTA");
console.log(` - ${required.length}/${required.length} assets presentes`);
console.log(" - terreno, naturaleza, estructuras, carpas, utilería y señales conectados");
