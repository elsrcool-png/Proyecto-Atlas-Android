import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { rm, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = async (relative) => readFile(path.join(root, relative), "utf8");
const staticAssert = (condition, message) => { if (!condition) throw new Error(message); };
const [sessionCode, exploreCode, dungeonViewCode, travelCode] = await Promise.all([
  read("src/hooks/useAtlasSession.js"),
  read("src/components/atlas/ExploreMode.jsx"),
  read("src/components/atlas/DungeonView.jsx"),
  read("src/hooks/useAtlasRegionTravel.js"),
]);
staticAssert(sessionCode.includes("weaponDurability") && sessionCode.includes("damageWeapon(2)"), "Desgaste de arma no integrado");
staticAssert(exploreCode.includes("runToggle") && exploreCode.includes("Footprints"), "Interruptor de correr no integrado");
staticAssert(dungeonViewCode.includes("absolute top-14 right-3"), "Minimapa de dungeon no está arriba a la derecha");
staticAssert(travelCode.includes("resolveCanonicalWorld") && travelCode.includes("getSafeSanctuarySpawn"), "Hotfix de viaje regional no integrado");
const outfile = path.join(root, ".atlas-consolidated-v2-validation.mjs");
const source = `
import { DUNGEONS, getDungeonAccessState, generateDungeonFloor, getEntities } from "@/lib/atlasDungeons";
import { getSectorBaseLevel, getRegionalBossLevel, resolveEnemyLevel } from "@/lib/atlasEnemyScaling";
import { getMissionEncounterEnemies } from "@/lib/atlasMissionEncounters";
import { shouldClearSectorEnemies } from "@/lib/atlasWorldProgression";
import { getVisualScene, getVisualSceneVariant } from "@/lib/atlasVisualScenes";
import { WEAPON_ABILITIES, LOOT_WA } from "@/lib/atlasWeapons";

const assert = (condition, message) => { if (!condition) throw new Error(message); };

const optional = DUNGEONS.verde_b1;
assert(getDungeonAccessState(optional, { bossDefeated: false }).unlocked === false, "Dungeon opcional abierta antes del jefe");
assert(getDungeonAccessState(optional, { bossDefeated: true }).unlocked === true, "Dungeon opcional no abre tras el jefe");

const gateway = DUNGEONS.verde_c3;
assert(getDungeonAccessState(gateway, { bossUnlocked: false }).unlocked === false, "Ruta al jefe abierta antes de la preparación");
assert(getDungeonAccessState(gateway, { bossUnlocked: true }).unlocked === true, "Ruta al jefe no abre con la preparación completa");
const finalFloor = generateDungeonFloor(gateway, gateway.floorCount, 424242);
const finalEntities = getEntities(finalFloor);
assert(finalEntities.sanctuary, "El piso final no contiene Santuario del Umbral");
assert(finalFloor.tiles.some(row => row.includes("P")), "No se escribió el tile P del santuario");

assert(getSectorBaseLevel("verde", "A2") === 1, "A2 Verde no inicia en nivel 1");
assert(getSectorBaseLevel("verde", "C3") === 9, "C3 Verde no termina en nivel 9");
assert(getRegionalBossLevel("verde") === 10, "Jefe Verde no es nivel 10");
assert(getRegionalBossLevel("fria") === 20, "Jefe Ártico no es nivel 20");
assert(getRegionalBossLevel("desierto") === 30, "Jefe Árido no es nivel 30");
assert(resolveEnemyLevel("verde", "A2", 9, false) < 10, "Un mob Verde alcanzó el nivel del jefe");

assert(shouldClearSectorEnemies("verde", "A2", true, {}), "A2 no queda segura tras el jefe");
assert(shouldClearSectorEnemies("verde", "B2", true, {}), "B2 no queda segura tras el jefe");
assert(shouldClearSectorEnemies("verde", "C2", true, {}), "C2 no queda segura tras el jefe");
assert(!shouldClearSectorEnemies("verde", "C3", true, {}), "C3 fue limpiada, pero debe reservarse para la dungeon y aventureros");
assert(!shouldClearSectorEnemies("verde", "A1", true, {}), "A1 fue limpiada sin ser zona segura");

const c3Base = getVisualScene("verde", "C3");
const c3Post = getVisualSceneVariant(c3Base, null, { worldFlags: { "verde:guild_seed": true } });
assert(c3Post.runtimeVariant?.type === "postboss", "C3 no activa su variante post-región");
assert(c3Post.objects.some(o => o.id === "c3_adv_tent_command"), "Falta la zona visual de aventureros en C3");
assert(c3Post.collisions.some(c => c.object === "c3_adv_tent_command"), "La carpa de aventureros no tiene colisión modular");
assert(!c3Post.objects.some(o => o.id === "c3_corrupt_arch"), "El arco corrupto no fue retirado al instalar la base");

const pointBlocked = (x, y) => (c3Post.collisions || []).some(c => x + 16 > c.x && x - 16 < c.x + c.w && y + 16 > c.y && y - 16 < c.y + c.h);
const reachableFromSpawn = (() => {
  const step = 12;
  const start = [Math.round(c3Post.spawn.x / step), Math.round(c3Post.spawn.y / step)];
  const queue = [start];
  const seen = new Set([start.join(",")]);
  for (let qi = 0; qi < queue.length; qi++) {
    const [x, y] = queue[qi];
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy, px = nx * step, py = ny * step;
      const key = nx + "," + ny;
      if (seen.has(key) || px < 16 || px > 944 || py < 16 || py > 704 || pointBlocked(px, py)) continue;
      seen.add(key); queue.push([nx, ny]);
    }
  }
  return (x, y) => {
    const tx = Math.round(x / step), ty = Math.round(y / step);
    for (let ox = -2; ox <= 2; ox++) for (let oy = -2; oy <= 2; oy++) if (seen.has((tx + ox) + "," + (ty + oy))) return true;
    return false;
  };
})();
assert(reachableFromSpawn(505, 505), "La entrada de la dungeon C3 quedó bloqueada por la base de aventureros");
assert(reachableFromSpawn(480, 20), "La salida norte de C3 quedó bloqueada");
assert(reachableFromSpawn(20, 360), "La salida oeste de C3 quedó bloqueada");
assert(reachableFromSpawn(650, 345), "La zona del antiguo Guardián quedó inaccesible");

const world = { W: 960, H: 720, solids: [], terrainShapes: [] };
const wave = getMissionEncounterEnemies({ regionId: "fria", sectorId: "B2", missionId: "f13", objectiveId: "repela_criaturas", world });
assert(Array.isArray(wave) && wave.length === 5, "F13 no genera exactamente cinco mobs");
assert(wave.every(e => e.monster.missionTag === "fria_f13_defensa_ciudadela"), "F13 contiene un mob sin etiqueta de misión");
assert(new Set(wave.map(e => e.id)).size === 5, "F13 contiene IDs repetidos");

for (const [id, ability] of Object.entries({ ...WEAPON_ABILITIES, ...LOOT_WA })) {
  const power = ability.effect?.power ?? 1;
  assert(power <= 1.05, id + " supera el límite táctico de daño");
  assert(ability.effect?.statusId || ability.effect?.statusPool, id + " no tiene efecto táctico");
}

console.log(JSON.stringify({
  ok: true,
  dungeons: Object.keys(DUNGEONS).length,
  gatewaySanctuary: finalEntities.sanctuary.id,
  f13Enemies: wave.length,
  greenBossLevel: getRegionalBossLevel("verde"),
  liberatedSafeSectors: ["A2", "B2", "C2"],
  c3AdventurerObjects: c3Post.objects.filter(o => o.id.startsWith("c3_adv_")).length,
  weaponAbilities: Object.keys(WEAPON_ABILITIES).length + Object.keys(LOOT_WA).length,
}, null, 2));
`;

await build({
  stdin: { contents: source, resolveDir: root, sourcefile: "atlas-v2-validation-entry.js", loader: "js" },
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  logLevel: "silent",
  plugins: [{
    name: "atlas-alias",
    setup(builder) {
      builder.onResolve({ filter: /^@\// }, args => ({ path: path.join(root, "src", args.path.slice(2)) + (path.extname(args.path) ? "" : ".js") }));
    },
  }],
});

try {
  await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
} finally {
  await rm(outfile, { force: true });
}
