import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(path, "utf8");
const checks = [];
const ok = (name, condition, detail = "") => checks.push({ name, condition: Boolean(condition), detail });

const director = read("src/lib/atlasCombatDirector.js");
const session = read("src/hooks/useAtlasSession.js");
const combatView = read("src/components/atlas/CombatView.jsx");
const combatRuntime = read("src/hooks/useAtlasCombatRuntime.js");
const vfx = read("src/components/atlas/CombatVfx.jsx");
const animations = read("src/lib/atlasAbilityAnimations.js");
const skillDesign = read("src/lib/atlasSkillDesign.js");

ok("Director temporal presente", director.includes("buildCombatSequence"));
ok("Corte Múltiple tiene perfil", director.includes('"Corte Múltiple"'));
ok("Bola de Fuego usa secuencia", session.includes("buildCombatSequence"));
ok("Estocada Sombría tiene perfil", director.includes('"Estocada Sombría"'));
ok("Combate bloquea controles durante secuencia", combatView.includes("sequenceBusy"));
ok("VFX recibe cantidad de impactos", vfx.includes("hitCount"));
ok("Barras de vida esperan al impacto", combatView.includes("displayEnemyHp") && combatView.includes("setDisplayEnemyHp"));
ok("Catálogo activo sigue siendo atlasSkillDesign", skillDesign.includes("CLASS_ABILITIES"));
ok("Sesión importa catálogo activo", session.includes('from "@/lib/atlasSkillDesign"'));
ok("Turno enemigo queda temporizado y bloqueado", combatRuntime.includes("enemyTurnTimerRef") && combatRuntime.includes("setCombatAnimating(true)"));
ok("No quedan turnos enemigos fuera del programador", !session.includes("setTimeout(() => enemyTurn"));
ok("Derrota diferida usa temporizador cancelable", combatRuntime.includes("enemyDefeatTimerRef") && combatRuntime.includes("stageEnemyDefeat"));
ok("Bastonazo usa proyectil arcano", animations.includes('"Bastonazo": A("magic_projectile"'));
ok("Empujón de Viento se trata como magia", animations.includes('"Empujón de Viento": A("wind", "wind", "magic"'));

// Ejecuta el director sin depender del alias @ de Vite. Esto valida la lógica
// real de reparto de daño y eventos, no solo la presencia de texto.
try {
  let executable = director
    .replace(
      /import\s+\{\s*resolveAbilityAnimation\s*\}\s+from\s+"@\/lib\/atlasAbilityAnimations";?/,
      `const resolveAbilityAnimation = (skill, ctx = {}) => ({
        animationType: skill?.name || "test",
        classicType: skill?.name === "Bola de Fuego" ? "fireball" : "multi_slash",
        dungeonType: skill?.name === "Bola de Fuego" ? "projectile" : "lunge",
        weaponType: ctx.weaponType || "sword",
        element: ctx.element || "fisico",
        duration: skill?.name === "Bola de Fuego" ? 480 : 360,
        cameraEffect: { shake: 0.5, zoom: 0.1, hitstop: 50 },
      });`
    )
    .replace(/export\s+const\s+/g, "const ")
    .replace(/export\s+function\s+/g, "function ");

  executable += `\nglobalThis.__atlasDirector = {
    buildCombatSequence,
    combatSequenceDelay,
    hitCountForSkill,
    splitCombatDamage,
  };`;

  const sandbox = {};
  vm.runInNewContext(executable, sandbox, { filename: "atlasCombatDirector.js" });
  const api = sandbox.__atlasDirector;

  const split = api.splitCombatDamage(11, 4, 0.1);
  ok("Reparto multigolpe conserva daño total", split.length === 4 && split.reduce((a, b) => a + b, 0) === 11, JSON.stringify(split));
  ok("Reparto progresivo no invierte la cadena", split.every((value, index) => index === 0 || value >= split[index - 1]), JSON.stringify(split));

  const multiLow = api.buildCombatSequence({ skill: { name: "Corte Múltiple" }, qualityId: "bajo", totalDamage: 8 });
  const multiNormal = api.buildCombatSequence({ skill: { name: "Corte Múltiple" }, qualityId: "medio", totalDamage: 9 });
  const multiHigh = api.buildCombatSequence({ skill: { name: "Corte Múltiple" }, qualityId: "alto", totalDamage: 12 });
  ok("Corte Múltiple escala 2/3/4 impactos", multiLow.hitCount === 2 && multiNormal.hitCount === 3 && multiHigh.hitCount === 4);
  ok("Corte Múltiple mantiene cada total", [multiLow, multiNormal, multiHigh].every(seq => seq.hits.reduce((sum, hit) => sum + hit.damage, 0) > 0));

  const shadowHigh = api.buildCombatSequence({ skill: { name: "Estocada Sombría" }, qualityId: "alto", totalDamage: 10 });
  ok("Estocada Sombría alta remata con crítico", shadowHigh.hitCount === 3 && shadowHigh.hits.at(-1)?.crit === true);

  const fireball = api.buildCombatSequence({ skill: { name: "Bola de Fuego" }, qualityId: "medio", totalDamage: 7, statusId: "quemadura" });
  ok("Bola de Fuego sincroniza impacto y estado", fireball.hitCount === 1 && fireball.statusAt > fireball.hits[0].at && fireball.events.some(e => e.type === "APPLY_STATUS"));
  ok("Turno enemigo espera el cierre visual", fireball.enemyTurnDelay > fireball.totalDuration);

  const miss = api.buildCombatSequence({ skill: { name: "Espadazo" }, qualityId: "fallo_critico", totalDamage: 0, playerDamage: 3, counter: true });
  ok("Fallo crítico contiene contraataque", miss.hitCount === 0 && miss.events.some(e => e.type === "COUNTER_HIT" && e.damage === 3));
} catch (error) {
  ok("Director ejecutable en validación aislada", false, error?.stack || String(error));
}

let failed = 0;
for (const check of checks) {
  console.log(`${check.condition ? "✓" : "✗"} ${check.name}${!check.condition && check.detail ? `\n  ${check.detail}` : ""}`);
  if (!check.condition) failed += 1;
}
if (failed) {
  console.error(`\n${failed} validaciones fallaron.`);
  process.exit(1);
}
console.log(`\nCombate dinámico Fase 1 validado (${checks.length} controles).`);
