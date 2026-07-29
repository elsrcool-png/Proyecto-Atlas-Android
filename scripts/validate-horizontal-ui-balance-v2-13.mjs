import fs from "node:fs";
import path from "node:path";
import { balanceEnemyFromPlayerBase } from "../src/lib/atlasEnemyBalance.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const pass = (message) => console.log(`✓ ${message}`);
const fail = (message) => {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
};
const assertIncludes = (source, token, message) => {
  if (!source.includes(token)) fail(message);
  else pass(message);
};
const assertRange = (value, min, max, message) => {
  if (!Number.isFinite(value) || value < min || value > max) {
    fail(`${message}: ${value}, esperado ${min}..${max}`);
  } else {
    pass(`${message}: ${value}`);
  }
};

const pkg = JSON.parse(read("package.json"));
const [major, minor] = String(pkg.version || "0.0.0").split(".").map(Number);
if (major !== 2 || minor < 13) fail(`package.json esperado Atlas 2.13 o superior, recibido ${pkg.version}`);
else pass(`versión ${pkg.version} conserva horizontal, HUD y balance v2.13`);

const settings = read("src/lib/atlasSettings.js");
const game = read("src/pages/Game.jsx");
const explore = read("src/components/atlas/ExploreMode.jsx");
const exploreHud = fs.existsSync(path.join(root, "src/components/atlas/ui-v3/ExploreHudV3.jsx"))
  ? read("src/components/atlas/ui-v3/ExploreHudV3.jsx")
  : "";
const exploreUi = `${explore}\n${exploreHud}`;
const settingsModal = read("src/components/atlas/SettingsModal.jsx");
const feedback = read("src/components/atlas/FeedbackToasts.jsx");
const combat = read("src/components/atlas/CombatView.jsx");
const session = read("src/hooks/useAtlasSession.js");
const enemyAi = read("src/lib/atlasEnemyAI.js");
const css = read("src/index.css");
const manifest = JSON.parse(read("public/manifest.json"));

assertIncludes(settings, 'orientation: "horizontal"', "horizontal es la orientación predeterminada");
if (settings.includes('hudDensity: "adaptive"') || settings.includes('hudDensity: "clean"')) pass("HUD adaptativo o limpio es el modo predeterminado"); else fail("HUD adaptativo o limpio es el modo predeterminado");
if (/layoutVersion:\s*(?:1[3-9]|[2-9]\d)/.test(settings)) pass("ajustes anteriores migran una vez al HUD adaptativo"); else fail("ajustes anteriores migran una vez al HUD adaptativo");
assertIncludes(settings, "export async function requestPreferredOrientation", "existe bloqueo de orientación con fallback");
assertIncludes(game, 'requestPreferredOrientation("horizontal")', "inicio y carga solicitan horizontal desde gesto del usuario");
if (manifest.orientation !== "landscape") fail(`manifest.orientation esperado landscape, recibido ${manifest.orientation}`);
else pass("PWA declara orientación landscape");

assertIncludes(explore, "const horizontal = deviceLandscape;", "el layout horizontal depende de la orientación real del dispositivo");
assertIncludes(explore, "const viewScale = horizontal ? 1.08 : 1.55;", "escala de mapa horizontal conserva legibilidad");
assertIncludes(explore, "const hudClean", "ExploreMode reconoce HUD limpio");
assertIncludes(exploreUi, "atlas-objective-compass", "brújula usa clase adaptable");
if (exploreUi.includes("atlas-adaptive-hud") || exploreUi.includes("atlas-top-hud")) pass("HUD superior usa clase adaptable"); else fail("HUD superior usa clase adaptable");
assertIncludes(exploreUi, "atlas-joystick-wrap", "joystick usa área segura adaptable");
assertIncludes(settingsModal, 'value="clean"', "Ajustes permite HUD limpio");
assertIncludes(css, "@media (orientation: landscape) and (max-height: 640px)", "hay reglas para móviles horizontales bajos");
assertIncludes(css, "env(safe-area-inset", "los controles respetan recortes y bordes del teléfono");
assertIncludes(css, ".atlas-landscape-dialog", "diálogos largos permiten desplazamiento horizontal legible");
assertIncludes(combat, "atlas-combat-landscape", "combate dispone de layout horizontal compacto");

assertIncludes(feedback, "compact ? toasts.slice(-1) : toasts.slice(-3)", "HUD limpio limita avisos visibles a uno");
assertIncludes(session, "recentToastRef", "avisos repetidos se deduplican");
assertIncludes(session, "slice(-2)", "cola interna de avisos queda limitada");
assertIncludes(explore, "compact={hudClean}", "nombres ambientales se reducen en HUD limpio");

assertIncludes(enemyAi, "balanceEnemyFromPlayerBase", "prepareEnemy usa balance base del jugador");
assertIncludes(enemyAi, "_atlasPlayerAnchored", "enemigos comunes registran anclaje al jugador");
assertIncludes(session, "monster?._atlasPlayerAnchored", "encuentros del mapa normalizan enemigos antiguos");
assertIncludes(session, "playerRef.current || player", "combates reciben estadísticas actuales del jugador");

const playerWarrior = {
  baseMaxHp: 16,
  baseAttack: 4,
  baseDefense: 3,
  baseMagicalDefense: 2,
};
const playerScholar = {
  baseMaxHp: 10,
  baseAttack: 4,
  baseDefense: 1,
  baseMagicalDefense: 3,
};
const wolf = { id: "lobo_salvaje" };
const a2Scaled = { hp: 9, attack: 3, defense: 1, level: 1, _atlasBaseLevel: 1 };
const c3Scaled = { hp: 18, attack: 7, defense: 5, level: 9, _atlasBaseLevel: 9 };

const a2 = balanceEnemyFromPlayerBase({
  monster: wolf,
  scaled: a2Scaled,
  playerProfile: playerWarrior,
  regionStart: 1,
  personality: "aggressive",
  focus: { phys: 1.25, mag: 0.7 },
});
assertRange(a2.hp, 10, 17, "HP inicial cercano al jugador base");
assertRange(a2.attack, 3, 5, "ATK inicial cercano al jugador base");
assertRange(a2.physicalDefense, 1, 4, "DEF física inicial razonable");
if (!a2.anchored) fail("enemigo común A2 no quedó anclado");
else pass("enemigo común A2 queda anclado");

const scholarEnemy = balanceEnemyFromPlayerBase({
  monster: { id: "brujo_feral" },
  scaled: { hp: 8, attack: 4, defense: 1, level: 1, _atlasBaseLevel: 1 },
  playerProfile: playerScholar,
  regionStart: 1,
  personality: "magical",
  focus: { phys: 0.7, mag: 1.25 },
});
assertRange(scholarEnemy.hp, 6, 13, "HP contra Erudito evita muro artificial");
assertRange(scholarEnemy.attack, 3, 5, "ATK contra Erudito conserva paridad");
assertRange(scholarEnemy.magicalDefense, 1, 4, "DEF mágica mantiene identidad sin exceso");

const late = balanceEnemyFromPlayerBase({
  monster: wolf,
  scaled: c3Scaled,
  playerProfile: playerWarrior,
  regionStart: 1,
  personality: "aggressive",
  focus: { phys: 1.25, mag: 0.7 },
});
if (late.hp <= a2.hp || late.attack < a2.attack) fail("progresión C3 no supera suavemente A2");
else pass("C3 progresa suavemente sobre A2");
assertRange(late.hp, a2.hp + 1, Math.round(playerWarrior.baseMaxHp * 1.35), "progresión de HP permanece contenida");
assertRange(late.attack, a2.attack, Math.round(playerWarrior.baseAttack * 1.5), "progresión de ATK permanece contenida");

const boss = balanceEnemyFromPlayerBase({
  monster: { id: "guardian", boss: true },
  scaled: c3Scaled,
  playerProfile: playerWarrior,
  regionStart: 1,
});
if (boss.anchored || boss.hp !== c3Scaled.hp || boss.attack !== c3Scaled.attack) fail("jefes fueron alterados por el anclaje común");
else pass("jefes conservan escalado canónico");

if (process.exitCode) {
  console.error("\nVALIDACIÓN HORIZONTAL, HUD Y BALANCE v2.13 FALLIDA");
} else {
  console.log("\nVALIDACIÓN HORIZONTAL, HUD Y BALANCE v2.13 CORRECTA");
  console.log("- horizontal predeterminado con fallback legible");
  console.log("- HUD adaptativo, avisos cercanos y cola reducida");
  console.log("- controles y combate adaptados a pantalla baja");
  console.log("- mobs comunes parten cerca de las estadísticas base del jugador");
  console.log("- equipo del jugador conserva ventaja y jefes mantienen su escala");
}
