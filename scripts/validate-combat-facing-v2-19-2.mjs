import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const read = file => fs.readFileSync(file, "utf8");
const checks = [];
const ok = (name, condition, detail = "") => checks.push({ name, condition: Boolean(condition), detail });

const facingPath = "src/lib/atlasCombatFacing.js";
const entityPath = "src/components/atlas/EntitySprite.jsx";
const viewPath = "src/components/atlas/CombatView.jsx";
const vfxPath = "src/components/atlas/CombatVfx.jsx";
const facing = read(facingPath);
const entity = read(entityPath);
const view = read(viewPath);
const vfx = read(vfxPath);

ok("Existe auditoría de orientación por asset", facing.includes("normalizedRuntimeAssets: true") || (facing.includes("HERO_CANONICAL") && facing.includes("ENEMY_CANONICAL")));
ok("Los tres enanos corrigen left/right invertido", facing.includes("normalizedRuntimeAssets: true") || ["enano_guerrero", "enano_mago", "enano_picaro"].every(id => facing.includes(`${id}: { sourceDirection: \"left\", sourceFacing: \"right\" }`)));
ok("Pantera Sombría usa toma izquierda real", facing.includes("normalizedRuntimeAssets: true") || facing.includes('pantera_sombria: { sourceDirection: "left", sourceFacing: "left" }'));
ok("Guardián Verde corrige exportación invertida", facing.includes("normalizedRuntimeAssets: true") || facing.includes('guardian_verde: { sourceDirection: "right", sourceFacing: "left" }'));
ok("Asesino esquelético y necromante se reflejan desde toma canónica", facing.includes("normalizedRuntimeAssets: true") || (facing.includes('asesino_esqueletico: { sourceDirection: "left", sourceFacing: "right" }') && facing.includes('necromante: { sourceDirection: "left", sourceFacing: "right" }')));
ok("EntitySprite posee modo de combate normalizado", entity.includes("combatMode = false") && entity.includes("getHeroCombatAssetDescriptor") && entity.includes("getEnemyCombatAssetDescriptor"));
ok("El reflejo horizontal no depende del nombre left/right", entity.includes('combatDescriptor?.mirrorX ? "scaleX(-1)"'));
ok("Jugador y enemigo activan combatMode en la arena", (view.match(/combatMode/g) || []).length >= 4);
ok("La arena mide posiciones reales de ambos actores", view.includes("arenaRef") && view.includes("playerActorRef") && view.includes("enemyActorRef") && view.includes("getBoundingClientRect"));
ok("El avance cuerpo a cuerpo se limita por la distancia real", view.includes("gap - stopDistance") && view.includes("playerAdvance") && view.includes("enemyAdvance"));
ok("Los VFX se renderizan sobre la arena, no dentro del monstruo", view.includes("origin={vfx.origin}") && view.includes("target={vfx.target}") && view.includes("arenaSize={vfx.arenaSize}"));
ok("Cada acción captura origen y objetivo antes de moverse", view.includes("const actionAnchors") && view.includes('readCombatAnchors("player", "enemy")') && view.includes('readCombatAnchors("enemy", "player")'));
ok("Los números de daño usan el anclaje del objetivo", view.includes("x: anchors.target.x") && view.includes("y: anchors.target.y"));
ok("CombatVfx usa vectores entre origen y objetivo", vfx.includes("vectorBetween(origin, target)") && vfx.includes("origin, target, arenaSize"));
ok("Proyectiles nacen en el atacante y viajan al objetivo", vfx.includes("TravelingBolt origin={safeOrigin} target={safeTarget}"));
ok("Bola de Fuego posee carga en origen e impacto en objetivo", vfx.includes("pointStyle(safeOrigin") && vfx.includes("pointStyle(safeTarget"));
ok("No quedan coordenadas fijas PX/EX del sistema anterior", !/const\s+(PX|EX|PY|EY)\s*=/.test(vfx));
ok("Los flotantes viven dentro de la arena de combate", view.indexOf("{floaters.map") > view.indexOf("ref={arenaRef}") && view.indexOf("{floaters.map") < view.indexOf("<AnimatePresence>"));

const requiredAssets = [
  ["public/assets/atlas/heroes/maestro_v1/runtime/enano_guerrero/left.webp", "Enano Guerrero canónico"],
  ["public/assets/atlas/heroes/maestro_v1/runtime/enano_mago/left.webp", "Enano Mago canónico"],
  ["public/assets/atlas/heroes/maestro_v1/runtime/enano_picaro/left.webp", "Enano Pícaro canónico"],
  ["public/assets/atlas/enemies/maestro_v1/runtime/pantera_sombria/left.webp", "Pantera Sombría canónica"],
  ["public/assets/atlas/enemies/maestro_v1/runtime/guardian_verde/right.webp", "Guardián Verde canónico"],
];
for (const [file, label] of requiredAssets) ok(`Asset presente: ${label}`, fs.existsSync(file), file);

for (const file of [facingPath, entityPath, viewPath, vfxPath]) {
  const source = read(file);
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: file.endsWith(".jsx") ? ts.JsxEmit.ReactJSX : ts.JsxEmit.Preserve,
      allowJs: true,
    },
    fileName: file,
    reportDiagnostics: true,
  });
  const diagnostics = (output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  ok(`Sintaxis válida: ${file}`, diagnostics.length === 0, diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, " ")).join(" | "));
}

let failed = 0;
for (const check of checks) {
  console.log(`${check.condition ? "✓" : "✗"} ${check.name}${!check.condition && check.detail ? `\n  ${check.detail}` : ""}`);
  if (!check.condition) failed += 1;
}
if (failed) {
  console.error(`\n${failed} validaciones fallaron.`);
  process.exit(1);
}
console.log(`\nAtlas v2.19.2: orientación y anclaje de combate validados (${checks.length} controles).`);
