import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import {
  DICE_GROUPS,
  countNaturalOnes,
  criticalFailureThreshold,
  isCriticalFailureRoll,
  resolveQuality,
} from "../src/lib/atlasDiceSystem.js";
import { computeD20RawDamage, resolveAttack } from "../src/lib/atlasDamageSystem.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const checks = [];
function ok(name, fn) {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
}

function roll(group, faces) {
  const def = DICE_GROUPS[group];
  assert.ok(def, `Grupo inexistente: ${group}`);
  const sides = def.dice.flatMap(die => Array.from({ length: die.count }, () => die.sides));
  assert.equal(faces.length, sides.length, `Cantidad de caras inválida para ${group}`);
  return {
    group,
    label: def.label,
    rolls: faces.map((result, index) => ({ sides: sides[index], result })),
    total: faces.reduce((sum, value) => sum + value, 0),
    min: sides.length,
    max: sides.reduce((sum, value) => sum + value, 0),
  };
}

ok("Versión Atlas v2.23.2", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(pkg.version, "2.23.2");
  assert.equal(lock.version, "2.23.2");
  assert.equal(lock.packages[""].version, "2.23.2");
});

ok("La mitad o más de los dados en 1 produce fallo crítico", () => {
  const tecnica = roll("tecnica", [1, 1, 4, 8]);
  assert.equal(tecnica.rolls.length, 4);
  assert.equal(criticalFailureThreshold(tecnica), 2);
  assert.equal(countNaturalOnes(tecnica), 2);
  assert.equal(isCriticalFailureRoll(tecnica), true);
  assert.equal(resolveQuality(tecnica).id, "fallo_critico");

  const fuerza = roll("fuerza", [1, 1, 4]);
  assert.equal(fuerza.rolls.length, 3);
  assert.equal(criticalFailureThreshold(fuerza), 2);
  assert.equal(countNaturalOnes(fuerza), 2);
  assert.equal(isCriticalFailureRoll(fuerza), true);

  const versatil = roll("versatil", [1, 1, 4]);
  assert.equal(versatil.rolls.length, 3);
  assert.equal(criticalFailureThreshold(versatil), 2);
  assert.equal(isCriticalFailureRoll(versatil), true);
});

ok("Menos de la mitad de dados en 1 no falla críticamente", () => {
  const tecnica = roll("tecnica", [1, 2, 2, 2]);
  assert.equal(countNaturalOnes(tecnica), 1);
  assert.equal(criticalFailureThreshold(tecnica), 2);
  assert.equal(isCriticalFailureRoll(tecnica), false);
  assert.notEqual(resolveQuality(tecnica).id, "fallo_critico");

  const fuerza = roll("fuerza", [1, 2, 2]);
  assert.equal(countNaturalOnes(fuerza), 1);
  assert.equal(criticalFailureThreshold(fuerza), 2);
  assert.equal(isCriticalFailureRoll(fuerza), false);
});

ok("1d20 mantiene el 1 natural como fallo crítico", () => {
  const one = roll("basico", [1]);
  const two = roll("basico", [2]);
  assert.equal(criticalFailureThreshold(one), 1);
  assert.equal(isCriticalFailureRoll(one), true);
  assert.equal(isCriticalFailureRoll(two), false);
});

ok("El fallo compuesto domina la suma, el crítico y las mejoras", () => {
  const forced = computeD20RawDamage(20, 15, 4, { forceCritical: true, forceCriticalFailure: true });
  assert.equal(forced.isFallo, true);
  assert.equal(forced.isCritical, false);
  assert.equal(forced.rawDamage, 0);
  assert.equal(forced.band.compoundFailure, true);

  const result = resolveAttack({
    qualityId: "critico",
    atk: 15,
    def: 4,
    opponentAtk: 12,
    opponentDef: 5,
    rollTotal: 20,
    forceCritical: true,
    forceCriticalFailure: true,
  });
  assert.equal(result.isFalloCritico, true);
  assert.equal(result.damage, 0);
  assert.ok(result.counter.damage >= 1);
  assert.equal(result.rollBand.compoundFailure, true);
});

ok("Sin fallo compuesto, la suma sigue usando la tabla universal", () => {
  const result = resolveAttack({
    qualityId: "medio",
    atk: 12,
    def: 5,
    opponentAtk: 12,
    opponentDef: 5,
    rollTotal: 13,
    forceCriticalFailure: false,
  });
  assert.equal(result.isFalloCritico, false);
  assert.equal(result.rawDamage, 8);
  assert.equal(result.rollBand.label, "ATK − DEF + 1");
});

ok("Todas las ofensivas del jugador transmiten la regla al resolver daño", () => {
  const actions = read("src/lib/createAtlasCombatActions.js");
  const engine = read("src/lib/atlasEngine.js");
  assert.match(actions, /isCriticalFailureRoll/);
  assert.match(actions, /countNaturalOnes/);
  assert.match(actions, /criticalFailureThreshold/);
  assert.equal((actions.match(/forceCriticalFailure:\s*criticalFailure/g) || []).length, 4);
  assert.match(actions, /const isCrit = !criticalFailure && effectiveRoll === 20/g);
  assert.match(actions, /Fallo crítico \(\$\{formatCriticalFailure\(dr\)\}/);
  assert.match(engine, /forceCriticalFailure:\s*!!options\.forceCriticalFailure/);
});

ok("El evento conserva las caras, cantidad de unos y umbral", () => {
  const actions = read("src/lib/createAtlasCombatActions.js");
  assert.match(actions, /criticalFailureByOnes/);
  assert.match(actions, /naturalOnes/);
  assert.match(actions, /criticalFailureThreshold/);
  assert.match(actions, /diceFaces/);
});

console.log(`\nVALIDACIÓN ATLAS v2.23.2 CORRECTA — ${checks.length} grupos aprobados`);
