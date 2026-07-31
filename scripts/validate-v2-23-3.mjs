import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createAtlasSmithActions } from "../src/lib/createAtlasSmithActions.js";
import {
  ENEMY_ABILITIES,
  computeEnemyAbilityAttack,
  executeEnemyAbility,
  prepareEnemy,
} from "../src/lib/atlasEnemyAI.js";
import {
  getRegionalBossRelic,
  reconcileRegionalBossRelics,
} from "../src/lib/atlasRelics.js";
import { getSettlementStock } from "../src/lib/atlasEconomyV3.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const checks = [];
function ok(name, fn) {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
}

ok("Versión Atlas v2.23.3 o posterior de la familia", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.match(pkg.version, /^2\.23\.(?:3|[4-9]|[1-9]\d+)$/);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].version, pkg.version);
  assert.match(read("VERSION_ATLAS_VISUAL.txt"), new RegExp(`v${pkg.version.replaceAll(".", "\\.")}`));
});

ok("La herrería recibe las tres acciones desde Game hasta el modal", () => {
  const game = read("src/pages/Game.jsx");
  const explore = read("src/components/atlas/ExploreMode.jsx");
  assert.match(game, /forgeEquipment:\s*s\.forgeEquipment/);
  assert.match(game, /upgradeEquipment:\s*s\.upgradeEquipment/);
  assert.match(game, /equipSmithEquipment:\s*s\.equipSmithEquipment/);
  assert.match(explore, /onForgeEquipment=\{game\.forgeEquipment\}/);
  assert.match(explore, /onUpgradeEquipment=\{game\.upgradeEquipment\}/);
  assert.match(explore, /onEquipEquipment=\{game\.equipSmithEquipment\}/);
});

ok("Forjar y mejorar ejecutan cambios reales de inventario, oro y materiales", () => {
  let state = {
    class: "Pícaro", race: "Humano", level: 11,
    gold: 999,
    materials: {
      hierro: 99, cuero: 99, madera_dura: 99, colmillos: 99,
      acero: 99, cristal_arcano: 99, escamas: 99, seda: 99,
      titanio: 99, obsidiana: 99, fragmentos_atlas: 99, nucleo_arcano: 99,
    },
    classWeaponInventory: [], weaponInventory: [], armorInventory: [], helmetInventory: [],
    weaponUpgrades: {}, armorUpgrades: {}, helmetUpgrades: {},
    equipmentUnlocks: { helmet: true, accessory2: false },
    accessoryInventory: [], consumables: {},
    baseMaxHp: 15, hp: 15, baseAttack: 4, baseDefense: 2, baseMagicalDefense: 2,
    maxMp: 12, mp: 12,
  };
  const playerRef = { current: state };
  const setPlayer = updater => {
    state = typeof updater === "function" ? updater(state) : updater;
    playerRef.current = state;
  };
  const messages = [];
  const actions = createAtlasSmithActions({
    playerRef,
    setPlayer,
    smithTier: "camp",
    region: { id: "verde", name: "Región Verde" },
    worldFlagsRef: { current: { "verde:camp_basic_stock": true } },
    toast: (message, type) => messages.push({ message, type }),
    pushLog: message => messages.push({ message, type: "log" }),
  });

  const initialGold = state.gold;
  actions.forgeEquipment("weapon", "knife_bramble");
  assert.equal(state.weaponInventory.length, 1);
  assert.ok(state.gold < initialGold);
  const weaponRef = state.weaponInventory[0].uid;
  actions.upgradeEquipment("weapon", weaponRef);
  assert.equal(state.weaponUpgrades[weaponRef], 1);

  actions.forgeEquipment("armor", "vest_scout");
  assert.ok(state.armorInventory.includes("vest_scout"));
  actions.upgradeEquipment("armor", "vest_scout");
  assert.equal(state.armorUpgrades.vest_scout, 1);
  assert.ok(messages.some(entry => /Forjado/.test(entry.message)));
  assert.ok(messages.some(entry => /Mejorado/.test(entry.message)));
});

ok("Los herreros conservan catálogos regionales distintos", () => {
  const green = getSettlementStock("verde", "camp");
  const arctic = getSettlementStock("fria", "camp");
  const desert = getSettlementStock("desierto", "camp");
  assert.notDeepEqual(green.weapons, arctic.weapons);
  assert.notDeepEqual(arctic.weapons, desert.weapons);
  assert.notDeepEqual(green.armors, desert.armors);
});

ok("La reliquia ártica se registra y migra en partidas anteriores", () => {
  const relic = getRegionalBossRelic("fria");
  assert.equal(relic.id, "fragmento_nucleo_artico");
  assert.match(relic.name, /Núcleo Ártico/);
  const migrated = reconcileRegionalBossRelics({ relics: {} }, ["aurel_portador"]);
  assert.equal(migrated.relics.fria.id, "fragmento_nucleo_artico");

  const session = read("src/hooks/useAtlasSession.js");
  assert.match(session, /getRegionalBossRelic\(region\.id\)/);
  assert.match(session, /reconcileRegionalBossRelics\(migratedPlayer, defeatedBossList\)/);
  assert.match(session, /fria:boss_defeated/);
  const backpack = read("src/components/atlas/BackpackModal.jsx");
  assert.match(backpack, /Reliquia/);
  assert.match(backpack, /Fragmento del Núcleo Ártico/);
});

const playerProfile = Object.freeze({
  level: 11,
  maxHp: 20,
  attack: 17,
  physicalDefense: 13,
  magicalDefense: 10,
});

function regionalEnemy(regionId, mul, sectorId) {
  return prepareEnemy(
    { id: "asesino_esqueletico" },
    mul,
    playerProfile.level,
    1,
    regionId,
    sectorId,
    playerProfile,
  );
}

ok("La región, no solo el nivel, aumenta HP, ataque y defensas", () => {
  const green = regionalEnemy("verde", 1, "C3");
  const arctic = regionalEnemy("fria", 1.3, "A2");
  const desert = regionalEnemy("desierto", 1.6, "A2");

  assert.ok(arctic.maxHp > green.maxHp, `${arctic.maxHp} no supera ${green.maxHp}`);
  assert.ok(desert.maxHp > arctic.maxHp, `${desert.maxHp} no supera ${arctic.maxHp}`);
  assert.ok(arctic.attack > green.attack, `${arctic.attack} no supera ${green.attack}`);
  assert.ok(desert.attack > arctic.attack, `${desert.attack} no supera ${arctic.attack}`);
  assert.ok(arctic.physicalDefense > green.physicalDefense);
  assert.ok(desert.physicalDefense >= arctic.physicalDefense);

  assert.ok(arctic.attack >= playerProfile.physicalDefense + 2);
  assert.ok(desert.attack >= playerProfile.physicalDefense + 4);
  assert.ok(arctic.maxHp >= 22);
  assert.ok(desert.maxHp >= 32);
});

ok("Ártica y Árida incorporan habilidades y equipamiento regional", () => {
  const arctic = regionalEnemy("fria", 1.3, "A2");
  const desert = regionalEnemy("desierto", 1.6, "A2");
  const arcticPool = new Set(["congelacion", "escudo_hielo", "rafaga_helada"]);
  const desertPool = new Set(["llamarada", "nube_toxica", "terremoto", "invocacion_sombras", "rayo"]);
  assert.ok(arctic.abilities.filter(id => arcticPool.has(id)).length >= 1);
  assert.ok(desert.abilities.filter(id => desertPool.has(id)).length >= 2);
  assert.ok(arctic.regionalEquipment?.name);
  assert.ok(desert.regionalEquipment?.name);
});

ok("Aurel mantiene presión de jefe sobre un pícaro equipado", () => {
  const aurel = prepareEnemy(
    { id: "aurel_portador", boss: true },
    1.3,
    playerProfile.level,
    11,
    "fria",
    "C3",
    playerProfile,
  );
  assert.equal(aurel.level, 20);
  assert.ok(aurel.maxHp >= playerProfile.maxHp * 5);
  assert.ok(aurel.attack >= playerProfile.physicalDefense + 6);
  assert.ok(aurel.physicalDefense >= 12);
  assert.ok(aurel.abilities.length >= 4);
  assert.equal(aurel.regionalEquipment?.id, "armadura_portador");
});

ok("Las habilidades regionales no multiplican el ATK hasta volverlo letal por defecto", () => {
  assert.equal(computeEnemyAbilityAttack(21, 1.7), 25);
  assert.equal(computeEnemyAbilityAttack(18, 1.3), 20);
  assert.equal(computeEnemyAbilityAttack(16, 0.4), 6);
  assert.equal(computeEnemyAbilityAttack(21, 0), 0);

  const enemy = prepareEnemy(
    { id: "aurel_portador", boss: true },
    1.3,
    playerProfile.level,
    11,
    "fria",
    "C3",
    playerProfile,
  );
  const shield = { ...ENEMY_ABILITIES.escudo_hielo, id: "escudo_hielo" };
  const result = executeEnemyAbility(enemy, shield, playerProfile, 15);
  assert.equal(result.damage, 0);
  assert.equal(result.selfShield, 4);
  assert.equal(result.counter, null);
});

ok("Las habilidades mágicas atacan la defensa mágica", () => {
  const enemy = prepareEnemy(
    { id: "necromante" },
    1.3,
    playerProfile.level,
    11,
    "fria",
    "A2",
    playerProfile,
  );
  const ability = { ...ENEMY_ABILITIES.congelacion, id: "congelacion" };
  const lowMagicDefense = executeEnemyAbility(enemy, ability, { ...playerProfile, magicalDefense: 2 }, 15);
  const highMagicDefense = executeEnemyAbility(enemy, ability, { ...playerProfile, magicalDefense: 20 }, 15);
  assert.ok(lowMagicDefense.damage > highMagicDefense.damage);
});

ok("El selector de consumibles no queda tapado por la descripción enemiga", () => {
  const combat = read("src/components/atlas/CombatView.jsx");
  assert.match(combat, /!showConsumables\s*&&/);
});

console.log(`\nVALIDACIÓN ATLAS v2.23.3 CORRECTA — ${checks.length} grupos aprobados`);
