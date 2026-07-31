import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const checks = [];
const ok = async (name, fn) => {
  await fn();
  checks.push(name);
  console.log(`✓ ${name}`);
};

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}
globalThis.localStorage = new MemoryStorage();

const registry = await import("../src/lib/atlasRegionRegistry.js");
const sectors = await import("../src/lib/atlasRegionSectors.js");
const graphApi = await import("../src/lib/atlasWorldGraph.js");
const saveApi = await import("../src/lib/atlasSave.js");
const data = await import("../src/lib/atlasData.js");

await ok("registro canónico contiene diez regiones estables", () => {
  assert.equal(registry.ATLAS_REGION_REGISTRY.length, 10);
  assert.deepEqual(registry.ATLAS_REGION_REGISTRY.map((r) => r.number), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(new Set(registry.ATLAS_REGION_IDS).size, 10);
  for (const def of registry.ATLAS_REGION_REGISTRY) {
    assert.equal(def.threatFloor, def.number);
    assert.ok(["legacy_grid", "nodal"].includes(def.mapMode));
  }
});

await ok("aliases históricos resuelven a IDs canónicos", () => {
  assert.equal(registry.normalizeRegionId("Región Ártica"), "fria");
  assert.equal(registry.normalizeRegionId("árida"), "desierto");
  assert.equal(registry.normalizeRegionId("mareal"), "tempestuosa");
  assert.equal(registry.normalizeRegionId("fractura"), "ignea");
  assert.equal(registry.normalizeRegionId("umbral"), "velo");
});

await ok("runtime actual conserva únicamente las tres regiones jugables", () => {
  assert.deepEqual(data.REGIONS.map((r) => r.id), registry.PLAYABLE_REGION_IDS);
  assert.equal(data.REGIONS.length, 3);
});

await ok("adaptador 3×3 conserva exactamente 27 sectores y sus inicios", () => {
  assert.equal(Object.keys(sectors.REGION_SECTOR_LAYOUTS).length, 3);
  const expectedStarts = { verde: "A2", fria: "A1", desierto: "A1" };
  for (const regionId of registry.PLAYABLE_REGION_IDS) {
    const layout = sectors.getRegionLayoutStrict(regionId);
    assert.ok(layout);
    assert.equal(Object.keys(layout.sectors).length, 9);
    assert.equal(layout.startSector, expectedStarts[regionId]);
  }
});

await ok("grafos legacy son válidos, conexos y no alteran composición", () => {
  for (const regionId of registry.PLAYABLE_REGION_IDS) {
    const graph = graphApi.getRegionGraph(regionId);
    assert.ok(graph);
    assert.equal(graph.metadata.mode, "legacy_grid");
    assert.equal(graph.metadata.compositionLocked, true);
    assert.equal(Object.keys(graph.nodes).length, 9);
    assert.equal(Object.keys(graph.connections).length, 12);
    const report = graphApi.validateRegionGraph(graph);
    assert.equal(report.valid, true, report.errors.join(" | "));
    assert.deepEqual(report.warnings, []);
  }
});

await ok("Regiones 4–10 permanecen sin composición inventada", () => {
  for (const def of registry.ATLAS_REGION_REGISTRY.filter((r) => r.number >= 4)) {
    assert.equal(graphApi.getRegionGraph(def.id), null);
    assert.equal(graphApi.hasRegionComposition(def.id), false);
  }
});

await ok("guardado v6 migra a v7 con región y nodo estables", () => {
  const oldSave = {
    saveVersion: 6,
    player: { race: "Humano", class: "Guerrero", weaponUpgrades: { sword: 2 } },
    regionIndex: 1,
    blockIndex: 2,
    sectorRow: 1,
    unlockedRegions: ["verde", "fria"],
    unlockedSectors: ["fria:A1", "fria:B1", "fria:C2"],
    visitedSectors: ["1:0:0", "1:2:1"],
    worldFlags: { "fria:unlocked": true },
  };
  const migrated = saveApi.migrateSaveV7(oldSave);
  assert.equal(migrated.saveVersion, 7);
  assert.equal(migrated.schemaVersion, 7);
  assert.equal(migrated.lastRegionId, "fria");
  assert.equal(migrated.lastSectorId, "C2");
  assert.equal(migrated.worldState.currentRegionId, "fria");
  assert.equal(migrated.worldState.currentNodeId, "C2");
  assert.equal(migrated.regionStates.fria.status, "CORRUPTED");
  assert.ok(migrated.regionStates.fria.unlockedNodeIds.includes("C2"));
  assert.ok(migrated.regionStates.fria.discoveredNodeIds.includes("C2"));
  assert.equal(migrated.player.weaponUpgrades.sword, 2);
});

await ok("migración v7 es idempotente", () => {
  const once = saveApi.migrateSaveV7({
    saveVersion: 6,
    player: { race: "Elfo", class: "Mago" },
    lastRegionId: "arida",
    lastSectorId: "B3",
    unlockedRegions: ["verde", "fria", "desierto"],
  });
  const twice = saveApi.migrateSaveV7(once);
  assert.deepEqual(twice, once);
});

await ok("ranuras escriben v7 y conservan respaldo", () => {
  saveApi.setActiveSaveSlot(1);
  assert.equal(saveApi.saveToSlot(1, { player: { race: "Enano", class: "Pícaro" }, regionIndex: 0, blockIndex: 0, sectorRow: 1 }), true);
  const firstRaw = localStorage.getItem("atlas_save_slot_1");
  assert.ok(firstRaw);
  assert.equal(JSON.parse(firstRaw).saveVersion, 7);
  assert.equal(saveApi.saveToSlot(1, { player: { race: "Enano", class: "Guerrero" }, lastRegionId: "fria", lastSectorId: "B1" }), true);
  assert.equal(localStorage.getItem("atlas_save_slot_1_bak"), firstRaw);
  const loaded = saveApi.loadSlot(1);
  assert.equal(loaded.player.class, "Guerrero");
  assert.equal(loaded.worldState.currentRegionId, "fria");
});

await ok("sesión usa esquema v7 y resolución por ID estable", () => {
  const session = read("src/hooks/useAtlasSession.js");
  assert.match(session, /ATLAS_SAVE_VERSION/);
  assert.match(session, /resolveSaveRuntimeRegionIndex/);
  assert.match(session, /worldStateRef/);
  assert.match(session, /regionStatesRef/);
  assert.match(session, /dailyStateRef/);
  assert.doesNotMatch(session, /saveVersion:\s*6/);
});

await ok("interfaz de ranuras lee el registro regional", () => {
  assert.match(read("src/components/atlas/SaveSlotsModal.jsx"), /getRegionLabel/);
  assert.match(read("src/components/atlas/ui-v3/SaveSlotsModalV3.jsx"), /getRegionLabel/);
  assert.match(read("src/pages/Game.jsx"), /resolveSaveRuntimeRegionIndex/);
});

console.log(`\nVALIDACIÓN ATLAS v2.24.0 CORRECTA (${checks.length} bloques)`);
console.log("- registro de diez regiones sin activar contenido incompleto");
console.log("- motor de grafos y adaptador 3×3 validados");
console.log("- migración de guardados v6 → v7 validada e idempotente");
console.log("- composición visual de Regiones 1–3 preservada");
