import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { getDungeonSkills, resolveSkillHit } from "../src/lib/atlasDungeonSkills.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const checks = [];

function ok(name, fn) {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
}

function withRandom(sequence, fn) {
  const original = Math.random;
  const values = [...sequence];
  Math.random = () => values.shift() ?? 0.999999;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

const skill = getDungeonSkills("Guerrero")[0];
const player = { class: "Guerrero", race: "Enano", attack: 10 };
const target = { defense: 0 };

ok("Versión Atlas v2.23.4 sincronizada", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(pkg.version, "2.23.4");
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].version, pkg.version);
  assert.match(read("VERSION_ATLAS_VISUAL.txt"), /v2\.23\.4/);
});

ok("Un fallo de precisión conserva crit como booleano falso", () => {
  const result = withRandom([0.999], () => resolveSkillHit(skill, player, target));
  assert.equal(result.hit, false);
  assert.equal(result.crit, false);
  assert.equal(typeof result.crit, "boolean");
  assert.equal(typeof result.critChance, "number");
});

ok("Un impacto no crítico conserva crit como booleano falso", () => {
  const result = withRandom([0, 0.999], () => resolveSkillHit(skill, player, target));
  assert.equal(result.hit, true);
  assert.equal(result.crit, false);
  assert.equal(typeof result.crit, "boolean");
  assert.equal(typeof result.critChance, "number");
  assert.equal(result.dmg, 10);
});

ok("Un impacto crítico conserva crit como booleano verdadero", () => {
  const result = withRandom([0, 0], () => resolveSkillHit(skill, player, target));
  assert.equal(result.hit, true);
  assert.equal(result.crit, true);
  assert.equal(typeof result.crit, "boolean");
  assert.equal(typeof result.critChance, "number");
  assert.equal(result.dmg, 15);
});

ok("La probabilidad interna usa una propiedad distinta del resultado crítico", () => {
  const source = read("src/lib/atlasDungeonSkills.js");
  assert.match(source, /critChance:\s*crit/);
  assert.doesNotMatch(source, /crit:\s*false[^}\n]*,\s*crit\s*}/);
  assert.doesNotMatch(source, /crit:\s*isCrit[^}\n]*,\s*crit\s*}/);
});

console.log(`\nVALIDACIÓN ATLAS v2.23.4 CORRECTA — ${checks.length} grupos aprobados`);
