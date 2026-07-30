import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import {
  computeD20RawDamage,
  resolveAttack,
  resolveD20DamageBand,
} from "../src/lib/atlasDamageSystem.js";
import {
  getEquipmentForgeQuote,
  getEquipmentUpgradeQuote,
  consumeEquipmentQuote,
} from "../src/lib/atlasEquipmentUpgrades.js";
import { WEAPONS, ARMORS } from "../src/lib/atlasLoot.js";
import { getMissionEncounterEnemies } from "../src/lib/atlasMissionEncounters.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const checks = [];
function ok(name, fn) {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
}

ok("Versión Atlas de la familia v2.23", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(pkg.version, /^2\.23\./);
});

ok("Las 20 caras del D20 usan las bandas aprobadas", () => {
  const expectedOffsets = {
    1: null,
    2: -3, 3: -3,
    4: -2, 5: -2,
    6: -1, 7: -1, 8: -1,
    9: 0, 10: 0, 11: 0, 12: 0,
    13: 1, 14: 1, 15: 1,
    16: 2, 17: 2,
    18: 3, 19: 3,
    20: null,
  };
  for (let roll = 1; roll <= 20; roll += 1) {
    const band = resolveD20DamageBand(roll);
    assert.equal(band.offset ?? null, expectedOffsets[roll]);
    const result = computeD20RawDamage(roll, 10, 4);
    if (roll === 1) {
      assert.equal(result.isFallo, true);
      assert.equal(result.rawDamage, 0);
    } else if (roll === 20) {
      assert.equal(result.isCritical, true);
      assert.equal(result.rawDamage, 10);
    } else {
      assert.equal(result.rawDamage, Math.max(1, 10 - 4 + expectedOffsets[roll]));
    }
  }
});

ok("La reducción existente se aplica después del daño bruto", () => {
  const result = resolveAttack({
    qualityId: "alto",
    atk: 10,
    def: 4,
    opponentAtk: 14,
    opponentDef: 5,
    rollTotal: 18,
  });
  assert.equal(result.rawDamage, 9);
  assert.equal(result.reduction, 0.10);
  assert.equal(result.damage, 8);
});

ok("El 1 activa contraataque y conserva reducción", () => {
  const result = resolveAttack({
    qualityId: "fallo_critico",
    atk: 16,
    def: 4,
    opponentAtk: 12,
    opponentDef: 2,
    rollTotal: 1,
  });
  assert.equal(result.isFalloCritico, true);
  assert.equal(result.counter.reduction, 0.10);
  assert.equal(result.counter.damage, 9);
});

ok("El 20 inflige ATK e ignora DEF", () => {
  const result = resolveAttack({
    qualityId: "critico",
    atk: 11,
    def: 999,
    opponentAtk: 0,
    opponentDef: 0,
    rollTotal: 20,
  });
  assert.equal(result.rawDamage, 11);
  assert.equal(result.damage, 11);
  assert.equal(result.ignoresDef, true);
});

ok("Los enemigos de misión tienen IDs estables y no dependen del respawn", () => {
  const world = { W: 960, H: 720, safeCenter: { x: 480, y: 360 }, safeRadius: 90, solids: [], terrainShapes: [] };
  const args = {
    regionId: "fria",
    sectorId: "B2",
    missionId: "f13",
    objectiveId: "repela_criaturas",
    objective: { id: "repela_criaturas", type: "kill", count: 5, sectorId: "B2", targetId: "fria_f13_defensa_ciudadela" },
    world,
  };
  const first = getMissionEncounterEnemies(args);
  const second = getMissionEncounterEnemies(args);
  assert.equal(first.length, 5);
  assert.deepEqual(first.map(x => x.id), second.map(x => x.id));
  assert.ok(first.every(x => x.missionOnly && x.combatAllowedInSafeZone));
  assert.ok(first.every(x => x.monster.missionTag === "fria_f13_defensa_ciudadela"));
});

ok("La forja regional muestra y consume todos los requisitos", () => {
  const player = { gold: 100, materials: { hierro: 5, madera_dura: 4 } };
  const quote = getEquipmentForgeQuote({ player, kind: "weapon", def: WEAPONS.sword_thorn, regionId: "verde" });
  assert.equal(quote.canForge, true);
  assert.ok(Object.keys(quote.materials).length >= 2);
  const after = consumeEquipmentQuote(player, quote);
  assert.equal(after.gold, player.gold - quote.gold);
  for (const [id, need] of Object.entries(quote.materials)) assert.equal(after.materials[id] || 0, (player.materials[id] || 0) - need);
});

ok("Armas regionales y armaduras poseen ruta de mejora", () => {
  const player = {
    gold: 500,
    materials: { hierro: 20, cuero: 20, madera_dura: 20, colmillos: 20 },
    weaponUpgrades: {}, armorUpgrades: {}, helmetUpgrades: {},
  };
  const weaponQuote = getEquipmentUpgradeQuote({ player, kind: "weapon", ref: "uid-verde", def: WEAPONS.sword_thorn, regionId: "verde", maxUpgrade: 5 });
  const armorQuote = getEquipmentUpgradeQuote({ player, kind: "armor", ref: "armor_leaf", def: ARMORS.armor_leaf, regionId: "verde", maxUpgrade: 5 });
  assert.equal(weaponQuote.canUpgrade, true);
  assert.equal(weaponQuote.statPreview.next, "ATK +1");
  assert.equal(armorQuote.canUpgrade, true);
  assert.match(armorQuote.statPreview.next, /DEF física \+1/);
});

ok("UI integra Consumible y herrería regional completa", () => {
  const combat = read("src/components/atlas/CombatView.jsx");
  const actions = read("src/lib/createAtlasCombatActions.js");
  const smith = read("src/components/atlas/BlacksmithModal.jsx");
  const explore = read("src/components/atlas/ExploreMode.jsx");
  assert.match(combat, />Consumible</);
  assert.match(combat, /Antídoto/);
  assert.match(actions, /useCombatConsumable/);
  assert.match(smith, /Catálogo local/);
  assert.match(smith, /Mejorar equipo/);
  assert.match(smith, /armorInventory/);
  assert.match(smith, /weaponInventory/);
  assert.match(explore, /onForgeEquipment=\{game\.forgeEquipment\}/);
});

ok("Guardado v6 migra mapas de mejora", () => {
  const save = read("src/lib/atlasSave.js");
  const session = read("src/hooks/useAtlasSession.js");
  assert.match(save, /saveVersion:\s*6/);
  assert.match(save, /armorUpgrades/);
  assert.match(save, /helmetUpgrades/);
  assert.match(session, /armorUpgrades:\s*\{\}/);
  assert.match(session, /helmetUpgrades:\s*\{\}/);
});

ok("Exploración prioriza misión y derrota solo tras victoria", () => {
  const explore = read("src/components/atlas/ExploreMode.jsx");
  const session = read("src/hooks/useAtlasSession.js");
  assert.match(explore, /if \(nearStoryPoint\)[\s\S]*else if \(nearDungeon\)/);
  assert.match(explore, /combatAllowedInSafeZone/);
  assert.match(explore, /onStartCombatThreat\?\.\(e\.monster, \{ worldEnemyId: e\.id/);
  assert.match(session, /if \(deadEnemy\?\.worldEnemyId\) markEnemyDefeated/);
});

ok("Misiones se descubren sin aceptación automática", () => {
  const regionMissions = read("src/lib/atlasRegionMissions.js");
  const safety = read("src/hooks/useAtlasMissionSafety.js");
  assert.match(regionMissions, /discovered:\s*true, accepted:\s*false, active:\s*false/);
  assert.doesNotMatch(safety, /activateMission\(/);
});

console.log(`\nVALIDACIÓN ATLAS v2.23.x CORRECTA — ${checks.length} grupos aprobados`);
