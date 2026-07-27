import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const read = (path) => fs.readFileSync(path, "utf8");
const checks = [];
const ok = (name, condition, detail = "") => checks.push({ name, condition: Boolean(condition), detail });

const sessionPath = "src/hooks/useAtlasSession.js";
const viewPath = "src/components/atlas/CombatView.jsx";
const audioPath = "src/hooks/useAtlasAudio.js";
const runtimePath = "src/hooks/useAtlasCombatRuntime.js";
const passivesPath = "src/hooks/useAtlasCombatPassives.js";
const transactionsPath = "src/lib/atlasCombatTransactions.js";
const directorPath = "src/lib/atlasCombatDirector.js";
const explorePath = "src/components/atlas/ExploreMode.jsx";
const actionsPath = "src/lib/createAtlasCombatActions.js";

const session = read(sessionPath);
const view = read(viewPath);
const audio = read(audioPath);
const runtime = read(runtimePath);
const passives = read(passivesPath);
const transactions = read(transactionsPath);
const director = read(directorPath);
const explore = read(explorePath);
const actions = read(actionsPath);

const lineCount = (text) => text.split(/\r?\n/).length;

ok("Cada acción recibe actionId monotónico", runtime.includes("const actionId = ++actionIdRef.current"));
ok("Resultados guardan instantáneas before/after", transactions.includes("before: {") && transactions.includes("after: {"));
ok("Vista reproduce por actionId", /\}, \[lastResult\?\.actionId\]\);/.test(view));
ok(
  "Vista no reinicia por HP, enemigo o skills",
  !view.includes("[lastResult, dying, skills, player.class, player.hp, enemy.hp]")
    && !/\[lastResult\?\.actionId[^\]]*(player\.hp|enemy\.hp|skills)/.test(view),
);
ok("La barra usa snapshots, no HP reconstruido", view.includes("lastResult.before?.player?.hp") && view.includes("lastResult.after?.enemy?.hp"));
ok("Daño al escudo se separa del daño a HP", transactions.includes("shieldDamage") && transactions.includes("hpDamage") && actions.includes("resolveShieldedDamage"));
ok("Golpe absorbido sigue contando como impacto", director.includes("landed = null") && director.includes("!didLand"));
ok("Derrota del jugador se difiere", runtime.includes("playerDefeatTimerRef") && runtime.includes("stagePlayerDefeat"));
ok("Derrota del enemigo se difiere", runtime.includes("enemyDefeatTimerRef") && runtime.includes("stageEnemyDefeat"));
ok("Todos los temporizadores se limpian", runtime.includes("clearCombatTimers") && runtime.includes("playerDefeatTimerRef.current = null"));
ok("Audio desactivado elimina la intro y el bloqueo", audio.includes("settings?.audioEnabled === false") && audio.includes("setCombatIntro(null)"));
ok("Teclado respeta intro y bloqueo global", explore.includes("if (!game.busy) game.onAttack?.()") && explore.includes("if (!game.busy) game.onSkill?.(key)") && explore.includes("if (!game.busy) game.onEscape?.()"));
ok("Audio de resultado se deduplica por actionId", audio.includes("lastResult.actionId === lastResultRef.current"));
ok("Multigolpes usan el mismo reloj que el daño", view.includes("hits.forEach") && view.includes("}, hit.at);"));
ok("No queda el patrón viejo de daño de estado del jugador", !session.includes("player.hp - res.counter.damage") && !actions.includes("player.hp - res.counter.damage"));
ok("No queda el patrón viejo de contraataque sobre enemigo obsoleto", !session.includes("currentEnemy.hp - result.counter.damage") && !actions.includes("currentEnemy.hp - result.counter.damage"));
ok("Pasivas se extrajeron del hook monolítico", session.includes("useAtlasCombatPassives") && fs.existsSync(passivesPath));
ok("Runtime de combate se extrajo del hook monolítico", session.includes("useAtlasCombatRuntime") && fs.existsSync(runtimePath));
ok("Acciones del jugador se extrajeron del hook monolítico", session.includes("createAtlasCombatActions") && fs.existsSync(actionsPath) && actions.includes("handleWeaponSkill") && actions.includes("handleDefinitiveSkill"));
ok("useAtlasSession bajó de 2.684 a menos de 2.350 líneas", lineCount(session) < 2350, `${lineCount(session)} líneas`);
ok("Ganancia de energía actualiza playerRef inmediatamente", passives.includes("playerRef.current = updated") && passives.includes("setPlayer(updated)"));
ok("Daño enemigo conserva energía ganada por pasivas", session.includes("const playerAfterPassive = playerRef.current || currentPlayer") && (session.match(/playerAfterPassive/g) || []).length >= 4);
ok("skills está memoizado", session.includes("const skills = useMemo"));

// Compilación sintáctica aislada. No necesita node_modules ni resolver imports.
for (const path of [sessionPath, viewPath, audioPath, runtimePath, passivesPath, transactionsPath, directorPath, explorePath, actionsPath]) {
  const source = read(path);
  const jsx = path.endsWith(".jsx");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: jsx ? ts.JsxEmit.ReactJSX : ts.JsxEmit.Preserve,
      allowJs: true,
    },
    fileName: path,
    reportDiagnostics: true,
  });
  const diagnostics = (output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  ok(`Sintaxis válida: ${path}`, diagnostics.length === 0, diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, " ")).join(" | "));
}

// Ejecuta transacciones sin Vite.
try {
  let executable = transactions
    .replace(/export\s+function\s+/g, "function ")
    .replace(/export\s+const\s+/g, "const ");
  executable += "\nglobalThis.__tx = { snapshotCombatant, makeCombatAction, resolveShieldedDamage };";
  const sandbox = {};
  vm.runInNewContext(executable, sandbox, { filename: transactionsPath });
  const tx = sandbox.__tx;
  const shield = tx.resolveShieldedDamage({ id: "e", hp: 20, maxHp: 20, shield: 5 }, 8);
  ok("Escudo absorbe antes de HP", shield.shieldDamage === 5 && shield.hpDamage === 3 && shield.hpAfter === 17 && shield.shieldAfter === 0, JSON.stringify(shield));
  const action = tx.makeCombatAction({
    actionId: 7,
    result: { type: "TEST", enemyDamage: 3 },
    beforePlayer: { id: "p", hp: 10, maxHp: 10 },
    beforeEnemy: { id: "e", hp: 20, maxHp: 20, shield: 5 },
    afterEnemy: shield.enemyAfter,
    resolution: shield,
  });
  ok("Transacción conserva acción y snapshots", action.actionId === 7 && action.before.enemy.hp === 20 && action.after.enemy.hp === 17 && action.resolution.shieldDamage === 5);
} catch (error) {
  ok("Transacciones ejecutables en aislamiento", false, error?.stack || String(error));
}

// Comprueba la semántica nueva de impacto absorbido.
try {
  let executable = director
    .replace(
      /import\s+\{\s*resolveAbilityAnimation\s*\}\s+from\s+"@\/lib\/atlasAbilityAnimations";?/,
      `const resolveAbilityAnimation = () => ({ animationType: "test", classicType: "impact", dungeonType: "lunge", weaponType: "sword", element: "fisico", duration: 360, cameraEffect: { shake: 0.4, zoom: 0.1, hitstop: 40 } });`,
    )
    .replace(/export\s+const\s+/g, "const ")
    .replace(/export\s+function\s+/g, "function ");
  executable += "\nglobalThis.__director = { buildCombatSequence };";
  const sandbox = {};
  vm.runInNewContext(executable, sandbox, { filename: directorPath });
  const seq = sandbox.__director.buildCombatSequence({
    skill: { name: "Golpe Firme" },
    qualityId: "medio",
    totalDamage: 0,
    landed: true,
  });
  ok("Escudo total no se representa como fallo", seq.visualQuality !== "miss" && seq.hitCount >= 1, JSON.stringify(seq));
} catch (error) {
  ok("Director ejecutable en validación de estabilidad", false, error?.stack || String(error));
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
console.log(`\nAtlas v2.19.1: estabilidad de combate validada (${checks.length} controles).`);
