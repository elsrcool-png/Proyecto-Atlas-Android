import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { DICE_GROUPS } from "../src/lib/atlasDiceSystem.js";
import {
  computeD20RawDamage,
  resolveAttack,
  resolveD20DamageBand,
  upgradeCombatRollBand,
} from "../src/lib/atlasDamageSystem.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const checks = [];
function ok(name, fn) {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
}

ok("Versión Atlas v2.23.1 o posterior de la familia", () => {
  const pkg = JSON.parse(read("package.json"));
  const [major, minor, patch] = pkg.version.split(".").map(Number);
  assert.ok(major > 2 || (major === 2 && (minor > 23 || (minor === 23 && patch >= 1))));
});

ok("Todos los grupos ofensivos alcanzan un máximo de 20", () => {
  for (const id of ["basico", "tecnica", "fuerza", "versatil"]) {
    const group = DICE_GROUPS[id];
    assert.ok(group, `Falta el grupo ${id}`);
    const max = group.dice.reduce((sum, die) => sum + die.count * die.sides, 0);
    assert.equal(max, 20, `${id} no suma un máximo de 20`);
  }
});

ok("La tabla universal resuelve cualquier suma entre 1 y 20", () => {
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
  for (let total = 1; total <= 20; total += 1) {
    const band = resolveD20DamageBand(total);
    assert.equal(band.offset ?? null, expectedOffsets[total]);
    const result = computeD20RawDamage(total, 12, 5);
    if (total === 1) {
      assert.equal(result.isFallo, true);
      assert.equal(result.rawDamage, 0);
    } else if (total === 20) {
      assert.equal(result.isCritical, true);
      assert.equal(result.rawDamage, 12);
    } else {
      assert.equal(result.rawDamage, Math.max(1, 12 - 5 + expectedOffsets[total]));
    }
  }
});

ok("Técnica, Fuerza y Versátil usan sus totales reales en la tabla", () => {
  const samples = [
    { group: "tecnica", total: 4, expected: 5 },
    { group: "tecnica", total: 13, expected: 8 },
    { group: "fuerza", total: 16, expected: 9 },
    { group: "versatil", total: 19, expected: 10 },
    { group: "versatil", total: 20, expected: 12 },
  ];
  for (const sample of samples) {
    const group = DICE_GROUPS[sample.group];
    const min = group.dice.reduce((sum, die) => sum + die.count, 0);
    const max = group.dice.reduce((sum, die) => sum + die.count * die.sides, 0);
    assert.ok(sample.total >= min && sample.total <= max);
    const result = resolveAttack({
      qualityId: "medio",
      atk: 12,
      def: 5,
      opponentAtk: 12,
      opponentDef: 5,
      rollTotal: sample.total,
    });
    assert.equal(result.rawDamage, sample.expected, `${sample.group} total ${sample.total}`);
  }
});

ok("La reducción establecida se aplica después de la tabla universal", () => {
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

ok("Las mejoras de calidad permanecen dentro de la misma tabla", () => {
  assert.equal(upgradeCombatRollBand(1), 1);
  assert.equal(upgradeCombatRollBand(4), 9);
  assert.equal(upgradeCombatRollBand(10), 16);
  assert.equal(upgradeCombatRollBand(18), 20);
  assert.equal(upgradeCombatRollBand(20), 20);
});

ok("Todas las habilidades clásicas entregan un total efectivo a resolveAttack", () => {
  const actions = read("src/lib/createAtlasCombatActions.js");
  assert.doesNotMatch(actions, /resolveQuality\(dr\)/);
  assert.doesNotMatch(actions, /upgradeQuality\(/);
  assert.match(actions, /handleWeaponSkill[\s\S]*rollTotal:\s*effectiveRoll[\s\S]*forceCritical:\s*(?:effectiveRoll === 20|isCrit)/);
  assert.match(actions, /handleDefinitiveSkill[\s\S]*rollTotal:\s*effectiveRoll[\s\S]*forceCritical:\s*(?:effectiveRoll === 20|isCrit)/);
  assert.match(actions, /const handleSkill = \(key\)[\s\S]*rollTotal:\s*effectiveRoll[\s\S]*forceCritical:\s*(?:effectiveRoll === 20|isCrit)/);
  assert.match(actions, /const groupId = key === "classAbility" \? "tecnica" : key === "hybrid" \? "fuerza" : "basico"/);
});

ok("El registro identifica correctamente cada grupo de dados", () => {
  const actions = read("src/lib/createAtlasCombatActions.js");
  assert.match(actions, /\$\{dr\.label\} = \$\{roll\}/);
  assert.doesNotMatch(actions, /fallo crítico \(d20 \$\{roll\}\).*habilidad/);
  assert.match(actions, /effectiveRollTotal/);
  assert.match(actions, /rollBand: res\.rollBand\?\.label/);
});

console.log(`\nVALIDACIÓN ATLAS v2.23.1 CORRECTA — ${checks.length} grupos aprobados`);
