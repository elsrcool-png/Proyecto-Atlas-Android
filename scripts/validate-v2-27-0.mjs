import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ARID_NPC_IDS,
  ARID_PRODUCTION_STATUS,
  ARID_TERRAIN_IDS,
  getAridNpcPaths,
  getAridTerrainPath,
} from "@/lib/atlasAridAssetCatalog";
import {
  ARID_NPC_ASSET_BY_VARIANT,
  ATLAS_NPC_ASSET_AUDIT,
  getNpcAssetPath,
} from "@/lib/atlasNpcAssetSprites";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const existsPublic = (publicPath) => fs.existsSync(path.join(ROOT, "public", publicPath.replace(/^\//, "")));
const checks = [];
const ok = (name, fn) => {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
};

ok("el indicador de dirección es un aro alrededor del personaje", () => {
  const view = read("src/components/atlas/DungeonView.jsx");
  assert.match(view, /rounded-full border-2 border-emerald-300/);
  assert.match(view, /FACING_ROTATION\[facing\]/);
  assert.doesNotMatch(view, /FACING_LABEL/);
  assert.doesNotMatch(view, /-top-4[^\n]+FACING/);
});

ok("la mochila puede abrirse dentro de Dungeon y pausa el control", () => {
  const view = read("src/components/atlas/DungeonView.jsx");
  const hud = read("src/components/atlas/ui-v3/DungeonHudV3.jsx");
  const game = read("src/pages/Game.jsx");
  assert.match(view, /inputPaused = backpackOpen \|\| classicCombatActive/);
  assert.match(view, /onOpenBackpack/);
  assert.match(view, /k === "i"/);
  assert.match(hud, /Backpack/);
  assert.match(hud, /Mochila\s*</);
  assert.match(game, /onOpenBackpack=\{\(\) => s\.setShowBackpack\(true\)\}/);
  assert.match(game, /backpackOpen=\{s\.showBackpack\}/);
});

ok("las escaleras solo se renderizan después de descubrir la salida", () => {
  const view = read("src/components/atlas/DungeonView.jsx");
  assert.match(view, /knownInteractables/);
  assert.match(view, /chebyshev\(pos, ent\.exit\) <= 2/);
  assert.match(view, /lineOfSight\(liveDungeon/);
  assert.match(view, /\{exitKnown && \(/);
});

ok("solo el mini jefe final abre el combate clásico", () => {
  const hook = read("src/hooks/useDungeonCombat.js");
  const view = read("src/components/atlas/DungeonView.jsx");
  const game = read("src/pages/Game.jsx");
  const session = read("src/hooks/useAtlasSession.js");
  assert.match(hook, /classicBoss/);
  assert.match(hook, /dungeonMiniBoss: true/);
  assert.match(hook, /El mini jefe se conserva como encuentro clásico separado/);
  assert.doesNotMatch(hook.slice(hook.indexOf("const initEnemies"), hook.indexOf("const buildAlly")), /list\.push\([^\n]+boss/);
  assert.match(view, /onStartMiniBossCombat/);
  assert.match(view, /data-dungeon-classic-miniboss="true"/);
  assert.match(game, /classicCombatActive=\{!!s\.enemy\?\.dungeonMiniBoss\}/);
  assert.match(game, /<CombatView/);
  assert.match(session, /const startDungeonMiniBossCombat/);
  assert.match(session, /if \(deadEnemy\?\.dungeonMiniBoss\)/);
  assert.match(session, /setDungeonBossDefeated\(true\)/);
  assert.match(session, /completeDungeon\(true\)/);
});

ok("los enemigos normales conservan el combate vivo de Dungeon", () => {
  const hook = read("src/hooks/useDungeonCombat.js");
  const block = hook.slice(hook.indexOf("const initEnemies"), hook.indexOf("const buildAlly"));
  assert.match(block, /ent\.enemies\.forEach/);
  assert.match(block, /alerted: false/);
  assert.doesNotMatch(block, /startCombat/);
  assert.match(hook, /buildDungeonCombatSequence/);
});

ok("los nueve terrenos maestros áridos están activos sin cambiar la composición", () => {
  assert.equal(ARID_TERRAIN_IDS.length, 9);
  for (const id of ARID_TERRAIN_IDS) {
    const master = getAridTerrainPath(id, { active: false });
    const active = getAridTerrainPath(id);
    assert.ok(existsPublic(master), `falta terreno maestro ${id}`);
    assert.ok(existsPublic(active), `falta terreno activo ${id}`);
    assert.ok(fs.statSync(path.join(ROOT, "public", active.replace(/^\//, ""))).size > 10_000, `terreno ${id} inválido`);
  }
  const scenes = read("src/lib/atlasDesertVisualScenes.js");
  for (const id of ARID_TERRAIN_IDS) assert.match(scenes, new RegExp(`\\b${id}: scene\\("${id}"`));
  assert.equal(ARID_PRODUCTION_STATUS.mapComposition.modifiedByIntegration, false);
  assert.equal(ARID_PRODUCTION_STATUS.mapComposition.owner, "user");
});

ok("los veinte NPC maestros áridos y sus cuatro direcciones están empaquetados", () => {
  assert.equal(ARID_NPC_IDS.length, 20);
  assert.equal(ATLAS_NPC_ASSET_AUDIT.aridNpcCount, 20);
  assert.equal(ATLAS_NPC_ASSET_AUDIT.connectedAridVariantCount, 16);
  for (const id of ARID_NPC_IDS) {
    const paths = getAridNpcPaths(id);
    assert.ok(paths);
    for (const file of Object.values(paths)) assert.ok(existsPublic(file), `falta ${file}`);
  }
  assert.equal(Object.keys(ARID_NPC_ASSET_BY_VARIANT).length, 16);
  assert.equal(getNpcAssetPath("desierto_sahara_nomad", "left"), "/assets/atlas/npcs/region_arida/maestro_v1/runtime/nomada_sahara/idle_left.webp");
});

ok("los objetos no preparados permanecen fuera del runtime", () => {
  assert.equal(ARID_PRODUCTION_STATUS.objects.runtimeReady, false);
  assert.equal(ARID_PRODUCTION_STATUS.objects.individualSources, 31);
  assert.equal(ARID_PRODUCTION_STATUS.objects.groupedSources, 10);
  assert.equal(ARID_PRODUCTION_STATUS.enemies.runtimeReady, false);
  assert.equal(ARID_PRODUCTION_STATUS.regionalBoss.runtimeReady, false);
});

ok("la versión declarada conserva la base v2.27.0 o superior", () => {
  const pkg = JSON.parse(read("package.json"));
  const [major, minor] = pkg.version.split(".").map(Number);
  assert.ok(major > 2 || (major === 2 && minor >= 27));
});

console.log(`\nVALIDACIÓN ATLAS v2.27.0 CORRECTA — ${checks.length} bloques aprobados.`);
