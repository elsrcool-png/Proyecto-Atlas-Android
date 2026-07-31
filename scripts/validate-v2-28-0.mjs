import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DUNGEON_CAMERA_VERSION,
  calculateDungeonCameraTransform,
  resolveDungeonCameraProfile,
} from "@/lib/atlasDungeonCamera";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const checks = [];
const ok = (name, fn) => {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
};

const dungeon = {
  id: "qa_centered_dungeon",
  floor: 2,
  cols: 18,
  rows: 24,
  spawn: { x: 2, y: 2 },
  tiles: Array.from({ length: 24 }, (_, y) => y === 0 || y === 23 ? "#".repeat(18) : `#${".".repeat(16)}#`),
};

ok("la cámara v2 es más cercana y mantiene al jugador centrado", () => {
  assert.equal(DUNGEON_CAMERA_VERSION, 2);
  const viewport = { w: 690, h: 1536 };
  const profile = resolveDungeonCameraProfile(dungeon, viewport);
  assert.equal(profile.mode, "fixed_close_center_follow");
  assert.equal(profile.anchorX, 0.5);
  assert.equal(profile.anchorY, 0.5);
  assert.equal(profile.keepPlayerCentered, true);
  assert.ok(profile.zoom >= 1.38);
  for (const pos of [{ x: 1, y: 1 }, { x: 9, y: 12 }, { x: 16, y: 22 }]) {
    const camera = calculateDungeonCameraTransform({ dungeon, pos, viewport, tileSize: 40, profile });
    assert.ok(Math.abs(camera.focusScreenX - viewport.w / 2) < 0.001);
    assert.ok(Math.abs(camera.focusScreenY - viewport.h / 2) < 0.001);
  }
});

ok("el HUD muestra una mochila accesible y contiene el minimapa ordenado", () => {
  const hud = read("src/components/atlas/ui-v3/DungeonHudV3.jsx");
  const view = read("src/components/atlas/DungeonView.jsx");
  const map = read("src/components/atlas/DungeonMiniMap.jsx");
  assert.match(hud, /data-testid="dungeon-backpack-button"/);
  assert.match(hud, /atlas-dungeon-backpack-button/);
  assert.match(hud, /\{miniMap\}/);
  assert.match(view, /<DungeonMiniMap/);
  assert.match(map, /atlas-dungeon-minimap/);
  assert.match(map, /exitKnown/);
});

ok("los enemigos derrotados no se reinicializan cuando cambia el jugador", () => {
  const hook = read("src/hooks/useDungeonCombat.js");
  assert.match(hook, /initializedDungeonRef/);
  assert.match(hook, /initializedDungeonRef\.current === dungeonKey/);
  assert.match(hook, /\[baseDungeon\?\.id, baseDungeon\?\.floor\]/);
  const effect = hook.slice(hook.indexOf("const dungeonKey"), hook.indexOf("const syncCompanion"));
  assert.doesNotMatch(effect, /\[baseDungeon\?\.id, initEnemies, buildAlly\]/);
  assert.doesNotMatch(hook, /¡Enemigo detectado! Modo táctico activado/);
});

ok("el aviso de enemigos es un aro direccional sin cuadros de texto", () => {
  const indicator = read("src/components/atlas/DungeonOffscreenIndicators.jsx");
  assert.match(indicator, /data-dungeon-enemy-direction-ring/);
  assert.match(indicator, /rounded-full border border-rose/);
  assert.doesNotMatch(indicator, />ENEMIGO</);
  assert.doesNotMatch(indicator, /rounded-full[^\n]+px-1\.5 py-1/);
  const view = read("src/components/atlas/DungeonView.jsx");
  assert.match(view, /atlas-dungeon-encounter-flash/);
});

ok("la salida permanece oculta hasta descubrirla por proximidad y visión", () => {
  const view = read("src/components/atlas/DungeonView.jsx");
  assert.match(view, /chebyshev\(pos, ent\.exit\) <= 2/);
  assert.match(view, /lineOfSight\(liveDungeon, pos\.x, pos\.y, ent\.exit\.x, ent\.exit\.y\)/);
  assert.match(view, /const exitKnown = knownInteractables\.has\("exit"\)/);
  assert.match(view, /\{exitKnown && \(/);
});

ok("el combate clásico del mini jefe reemplaza visualmente la Dungeon", () => {
  const view = read("src/components/atlas/DungeonView.jsx");
  const classicReturn = view.indexOf("if (classicCombatActive && classicCombatView)");
  const dungeonReturn = view.indexOf("data-region={region?.id}");
  assert.ok(classicReturn > 0 && dungeonReturn > classicReturn);
  assert.match(view, /fixed inset-0 z-\[120\] overflow-y-auto bg-slate-950/);
  assert.equal((view.match(/data-dungeon-classic-miniboss="true"/g) || []).length, 1);
});

ok("las animaciones distinguen embestida, magia y proyectil", () => {
  const actor = read("src/components/atlas/DungeonCombatActor.jsx");
  const css = read("src/index.css");
  assert.match(actor, /data-animation-movement/);
  assert.match(actor, /atlas-dungeon-actor-active--/);
  assert.match(css, /atlas-dungeon-actor-stationary/);
  assert.match(css, /atlas-dungeon-actor-projectile/);
  assert.match(css, /data-animation-quality="critico"/);
});

ok("la versión declarada corresponde a v2.28.0", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.version, "2.28.0");
  assert.equal(read("VERSION_ATLAS_VISUAL.txt").trim(), "v2.28.0");
});

console.log(`\nVALIDACIÓN ATLAS v2.28.0 CORRECTA — ${checks.length} bloques aprobados.`);
