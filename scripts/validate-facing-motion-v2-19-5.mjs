import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = process.cwd();
const checks = [];
const fail = (name, detail) => checks.push({ ok: false, name, detail });
const pass = (name, detail = "") => checks.push({ ok: true, name, detail });
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const exists = rel => fs.existsSync(path.join(root, rel));

function expect(name, condition, detail = "") {
  condition ? pass(name, detail) : fail(name, detail);
}

function syntax(rel) {
  const source = read(rel);
  const result = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true,
    fileName: rel,
  });
  const errors = (result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  expect(`Sintaxis ${rel}`, errors.length === 0, errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, " ")).join(" | "));
}

const pkg = JSON.parse(read("package.json"));
expect("Versión compatible con 2.19.5 o superior", Number(pkg.version.split(".")[0]) > 2 || (Number(pkg.version.split(".")[0]) === 2 && (Number(pkg.version.split(".")[1]) > 19 || (Number(pkg.version.split(".")[1]) === 19 && Number(pkg.version.split(".")[2]) >= 5))), `actual=${pkg.version}`);

for (const rel of [
  "src/components/atlas/CombatView.jsx",
  "src/components/atlas/EntitySprite.jsx",
  "src/components/atlas/ExploreMode.jsx",
  "src/lib/atlasCombatFacing.js",
  "src/lib/atlasNpcAssetSprites.js",
  "src/lib/atlasHeroAssetSprites.js",
]) syntax(rel);

const combat = read("src/components/atlas/CombatView.jsx");
expect("Jugador conserva lado derecho y mira a la izquierda", combat.includes('const PLAYER_COMBAT_DIRECTION = "left"'));
expect("Enemigo conserva lado izquierdo y mira a la derecha", combat.includes('const ENEMY_COMBAT_DIRECTION = "right"'));
expect("Jugador de combate ampliado", /const actorSize = landscape \? 76 : 104/.test(combat));
expect("Jefe de combate ampliado", /enemy\?\.boss \? 132 : 104/.test(combat));
expect("Caminata de combate jugador", combat.includes("playerStepping") && combat.includes("playerBodyMotion"));
expect("Caminata de combate enemigo", combat.includes("enemyStepping") && combat.includes("enemyBodyMotion"));
expect("Respiración anclada sin bob vertical", combat.includes("const groundedIdle") && !combat.includes('y: [0, -3, 0]'));
expect("Sombras reactivas de combate", combat.includes("scaleX: [1.08, 0.90, 1.08, 0.90, 1.08]"));
expect("Arena de combate usa más espacio", combat.includes("minHeight: landscape ? 126 : 238"));

const explore = read("src/components/atlas/ExploreMode.jsx");
expect("Ciclo libre de cuatro fases", explore.includes("frameRef.current = (frameRef.current + 1) % 4"));
expect("Facing de mobs según desplazamiento", explore.includes("e.facing = Math.abs(moveX) > Math.abs(moveY)"));
expect("Facing de mob aplicado sin rerender", explore.includes("directional.dataset.facing = e.facing"));
expect("Villagers reciben orientación lateral", explore.includes('dir="right" size={30}'));
expect("Villagers activan pasos y sombra", explore.includes('el.classList.toggle("atlas-moving-actor", v.motionMode === "walk")'));
expect("Jugador tiene sombra de contacto dinámica", explore.includes("playerShadowRef") && explore.includes("scaleX(${moving"));

const entity = read("src/components/atlas/EntitySprite.jsx");
expect("Mobs libres precargan cuatro direcciones", entity.includes("CARDINAL_DIRECTIONS.map"));
expect("Contenedor direccional manipulable", entity.includes('data-atlas-directional-sprite="true"'));
expect("Frames direccionales con paths reales", entity.includes("getEnemyAssetPath(type, variant, direction)"));

const facing = read("src/lib/atlasCombatFacing.js");
expect("Facing unificado sin doble espejo", facing.includes("normalizedRuntimeAssets: true") && facing.includes("mirrorX: false"));

const css = read("src/index.css");
expect("Paso anclado de máximo 1px", css.includes("translateY(-1px)") && !css.includes("translateY(-3px) rotate"));
expect("Sombra de contacto camina", css.includes("@keyframes atlas-contact-step"));
expect("Actor direccional muestra solo facing activo", css.includes('.atlas-directional-actor[data-facing="right"]'));

const heroes = ["humano_guerrero","humano_mago","humano_picaro","enano_guerrero","enano_mago","enano_picaro","elfo_guerrero","elfo_mago","elfo_picaro"];
const enemies = ["asesino_esqueletico","asesino_orco","aurel_ultimo_portador","brujo_feral","chaman_orco","guardian_verde","guerrero_esqueletico","lobo_salvaje","necromante","orco_bruto","pantera_sombria"];
for (const id of heroes) {
  for (const dir of ["down","up","left","right"]) expect(`Héroe ${id}/${dir}`, exists(`public/assets/atlas/heroes/maestro_v1/runtime/${id}/${dir}.webp`));
}
for (const id of enemies) {
  for (const dir of ["down","up","left","right"]) expect(`Enemigo ${id}/${dir}`, exists(`public/assets/atlas/enemies/maestro_v1/runtime/${id}/${dir}.webp`));
}

const arctic = ["fria_astra","fria_boreas","fria_captain","fria_dvalin","fria_freya","fria_helga","fria_hostelera","fria_kael_forger","fria_lyra_cartographer","fria_lyra_researcher","fria_merchant_camp","fria_merchant_glacial","fria_merchant_royal","fria_queen","fria_refuge_keeper","fria_shaman"];
for (const id of arctic) {
  for (const dir of ["down","up","left","right"]) expect(`NPC ártico ${id}/${dir}`, exists(`public/assets/atlas/npcs/region_artica/maestro_v1/runtime/${id}/idle_${dir}.webp`));
}
expect("Mapa de NPC árticos integrado", read("src/lib/atlasNpcAssetSprites.js").includes("ARCTIC_NPC_ASSET_BY_VARIANT"));
expect("Manifiesto de normalización", exists("docs/ATLAS_V2_19_5_FACING_ASSET_MANIFEST.json"));

const bad = checks.filter(c => !c.ok);
for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
console.log(`\n${checks.length - bad.length}/${checks.length} controles aprobados.`);
if (bad.length) process.exit(1);
