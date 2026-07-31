import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DUNGEON_CAMERA_VERSION,
  calculateDungeonCameraTransform,
  inferDungeonEntryFacing,
  resolveDungeonCameraProfile,
} from "@/lib/atlasDungeonCamera";
import { computeDungeonOcclusion } from "@/lib/atlasDungeonOcclusion";
import { buildDungeonCombatSequence, DUNGEON_COMBAT_ADAPTER_VERSION } from "@/lib/atlasDungeonCombatAdapter";
import { buildCombatSequence, COMBAT_SEQUENCE_VERSION } from "@/lib/atlasCombatDirector";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const checks = [];
const ok = (name, fn) => {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
};

const dungeon = {
  id: "validation_dungeon",
  cols: 9,
  rows: 9,
  spawn: { x: 4, y: 7 },
  tiles: [
    "#########",
    "#.......#",
    "#..###..#",
    "#..#.#..#",
    "#..#.#..#",
    "#..#.#..#",
    "#.......#",
    "#...S...#",
    "#########",
  ],
};

ok("la cámara Dungeon usa un único perfil cercano y fijo", () => {
  assert.equal(DUNGEON_CAMERA_VERSION, 1);
  assert.equal(inferDungeonEntryFacing(dungeon), "up");
  const profile = resolveDungeonCameraProfile(dungeon, { w: 720, h: 420 });
  assert.equal(profile.mode, "fixed_close_follow");
  assert.ok(profile.zoom > 1, "la cámara no quedó más cerca que la exterior");
  assert.ok(profile.wallHeight >= 24, "las paredes no ganaron altura visual");
  assert.equal(profile.cameraSide, "south");
  assert.ok(!("direction" in profile), "el perfil no debe perseguir la dirección posterior del jugador");
});

ok("el seguimiento queda limitado al mapa y no altera orientación en combate", () => {
  const profile = resolveDungeonCameraProfile(dungeon, { w: 520, h: 360 });
  const start = calculateDungeonCameraTransform({ dungeon, pos: dungeon.spawn, viewport: { w: 520, h: 360 }, tileSize: 40, profile });
  const corner = calculateDungeonCameraTransform({ dungeon, pos: { x: 1, y: 1 }, viewport: { w: 520, h: 360 }, tileSize: 40, profile });
  for (const camera of [start, corner]) {
    assert.ok(camera.zoom > 1);
    assert.ok(camera.x <= 0 || camera.scaledW <= 520);
    assert.ok(camera.y <= 0 || camera.scaledH <= 360);
    assert.ok(camera.x >= 520 - camera.scaledW - 0.001 || camera.scaledW <= 520);
    assert.ok(camera.y >= 360 - camera.scaledH - 0.001 || camera.scaledH <= 360);
  }
  assert.equal(profile.mode, "fixed_close_follow");
});

ok("la transparencia selecciona segmentos bloqueantes y no toda la sala", () => {
  const targets = [{ x: 4, y: 4 }];
  const occluded = computeDungeonOcclusion(dungeon, targets, { cameraSide: "south", rayLength: 5 });
  assert.ok(occluded.size > 0, "no se detectó ninguna pared oclusora");
  const totalWalls = dungeon.tiles.join("").split("").filter((ch) => ch === "#").length;
  assert.ok(occluded.size < totalWalls, "se transparentó toda la Dungeon");
  for (const key of occluded) {
    const [x, y] = key.split(",").map(Number);
    assert.equal(dungeon.tiles[y][x], "#");
  }
});

ok("Dungeon reutiliza el mismo director temporal y oculta los dados", () => {
  assert.equal(DUNGEON_COMBAT_ADAPTER_VERSION, 1);
  const skill = { name: "Corte Múltiple", hits: 3 };
  const adapted = buildDungeonCombatSequence({
    skill,
    className: "Guerrero",
    kind: "classAbility",
    result: { hit: true, crit: false, dmg: 15, totalDamage: 15 },
  });
  const direct = buildCombatSequence({
    skill,
    className: "Guerrero",
    diceGroup: "hidden",
    rollTotal: null,
    qualityId: "alto",
    totalDamage: 15,
    playerDamage: 0,
    counter: false,
    statusId: null,
    kind: "classAbility",
    landed: true,
  });
  assert.equal(adapted.version, COMBAT_SEQUENCE_VERSION);
  assert.equal(adapted.version, direct.version);
  assert.equal(adapted.animation.animationType, direct.animation.animationType);
  assert.equal(adapted.animation.dungeonType, direct.animation.dungeonType);
  assert.deepEqual(adapted.hits, direct.hits);
  assert.equal(adapted.totalDuration, direct.totalDuration);
  assert.equal(adapted.diceVisible, false);
  assert.equal(adapted.diceGroup, "hidden");
  assert.equal(adapted.rollTotal, null);
});

ok("la vista Dungeon no abre una segunda cámara ni el combate clásico", () => {
  const view = read("src/components/atlas/DungeonView.jsx");
  assert.match(view, /data-camera-mode=\{cameraProfile\.mode\}/);
  assert.match(view, /DungeonWallLayer/);
  assert.match(view, /DungeonOffscreenIndicators/);
  assert.match(view, /DungeonCombatActor/);
  assert.doesNotMatch(view, /CombatView/);
  assert.doesNotMatch(view, /combatFlash/);
  assert.doesNotMatch(view, /canvasRef/);
  assert.doesNotMatch(view, /onStartBossCombat/);
});

ok("el combate Dungeon ejecuta secuencias compartidas para jugador, aliados y enemigos", () => {
  const hook = read("src/hooks/useDungeonCombat.js");
  assert.match(hook, /buildDungeonCombatSequence/);
  assert.match(hook, /actorAnimations/);
  assert.match(hook, /activeTargetId/);
  assert.match(hook, /attackerId: "player"/);
  assert.match(hook, /attackerId: a\.id/);
  assert.match(hook, /attackerId: e\.id/);
  assert.match(hook, /ent\.boss && !bossDefeatedRef\.current/);
  assert.doesNotMatch(hook, /inicia el combate clásico/);
});

ok("derrotar al mini jefe se resuelve dentro de Dungeon y libera la salida", () => {
  const session = read("src/hooks/useAtlasSession.js");
  const block = session.slice(session.indexOf("const onDungeonEnemyKilled"), session.indexOf("const hireAdventurer"));
  assert.match(block, /setDungeonBossDefeated\(true\)/);
  assert.match(block, /completeDungeon\(true\)/);
  assert.match(block, /rollGlobalLoot/);
  assert.doesNotMatch(block, /startCombat\(/);
});

ok("las paredes altas, cámara y actor respetan movimiento reducido", () => {
  const css = read("src/index.css");
  assert.match(css, /atlas-dungeon-actor-sequence/);
  assert.match(css, /atlas-dungeon-wall-segment/);
  assert.match(css, /prefers-reduced-motion/);
});

ok("la versión declarada corresponde a v2.26.0", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.version, "2.26.0");
});

console.log(`\nVALIDACIÓN ATLAS v2.26.0 CORRECTA — ${checks.length} bloques aprobados.`);
