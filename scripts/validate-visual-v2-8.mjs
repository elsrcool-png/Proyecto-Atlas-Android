import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const errors = [];

const hero = read("src/lib/atlasHeroSprites.js");
const heroKeys = [...hero.matchAll(/^\s{2}"(Humano|Elfo|Enano):(Guerrero|Mago|Pícaro)":/gm)].map(m => `${m[1]}:${m[2]}`);
const expectedHeroes = [
  "Humano:Guerrero","Humano:Mago","Humano:Pícaro",
  "Elfo:Guerrero","Elfo:Mago","Elfo:Pícaro",
  "Enano:Guerrero","Enano:Mago","Enano:Pícaro",
];
for (const k of expectedHeroes) if (!heroKeys.includes(k)) errors.push(`Héroe ausente: ${k}`);
if (new Set(heroKeys).size !== 9) errors.push(`Se esperaban 9 héroes distintos y se encontraron ${new Set(heroKeys).size}`);
for (const token of ["swordShield","orbStaff","dualDaggers","spearShield","crystalStaff","bowDagger","hammerShield","runeStaff","crossbowAxe"]) if (!hero.includes(`weapon:"${token}"`)) errors.push(`Arma visual ausente: ${token}`);

const npc = read("src/lib/atlasRegionalNpcSprites.js");
const npcKeys = [...npc.matchAll(/^\s{2}((?:fria|desierto)_[a-z0-9_]+):\{/gm)].map(m => m[1]);
if (npcKeys.length < 34) errors.push(`NPC regionales insuficientes: ${npcKeys.length}/34`);
for (const token of ["fria_boreas","fria_shaman","fria_queen","desierto_sahara_nomad","desierto_oasis_guardian","desierto_pharaoh"]) if (!npcKeys.includes(token)) errors.push(`NPC rector ausente: ${token}`);

const campaign = read("src/lib/atlasCampaign.js");
for (const token of npcKeys) {
  if (["fria_einar"].includes(token) || campaign.includes(`variant: "${token}"`)) continue;
  // Algunos perfiles son variantes de servicio que pueden quedar reservadas, pero los principales deben estar conectados.
}
for (const token of [
  "fria_boreas","fria_lyra_cartographer","fria_freya","fria_merchant_camp","fria_refuge_keeper","fria_dvalin",
  "fria_shaman","fria_merchant_glacial","fria_helga","fria_astra","fria_queen","fria_lyra_researcher","fria_captain","fria_kael_forger","fria_merchant_royal","fria_hostelera","fria_borin","fria_einar",
  "desierto_sahara_nomad","desierto_kael_explorer","desierto_merchant_camp","desierto_oasis_keeper","desierto_dara_bedouin","desierto_oasis_guardian","desierto_aran","desierto_crystal_artisan","desierto_merchant_oasis","desierto_posadera","desierto_dara_trader","desierto_pharaoh","desierto_solar_priest","desierto_merchant_ancient","desierto_hostelera","desierto_solar_forger"
]) if (!campaign.includes(`variant: "${token}"`)) errors.push(`NPC no conectado a campaña: ${token}`);
for (const generic of ['variant: "explorer"','variant: "merchant"','variant: "innkeeper"','variant: "civilian"','variant: "artisan"','variant: "guard"']) {
  const friaBlock = campaign.split("  fria: {")[1]?.split("  desierto: {")[0] || "";
  const desertBlock = campaign.split("  desierto: {")[1]?.split("// ═════════")[0] || "";
  if (friaBlock.includes(generic) || desertBlock.includes(generic)) errors.push(`Sprite genérico restante en regiones nuevas: ${generic}`);
}

const combat = read("src/components/atlas/CombatView.jsx");
for (const token of ["resolveAbilityAnimation","playerMiss","enemyMiss","playerMotion","enemyMotion","hurt={playerHit","poseForAnimation"]) if (!combat.includes(token)) errors.push(`Combate sin conexión: ${token}`);
if (!combat.includes('type === "FALLO"')) errors.push("El fallo no activa una animación");
if (!combat.includes('lastResult.vfxType || "impact"')) errors.push("Impacto enemigo sin VFX conectado");

const entity = read("src/components/atlas/EntitySprite.jsx");
const entityEngine = read("src/lib/atlasEntitySprites.js");
const pixel = read("src/lib/atlasPixel.js");
const explore = read("src/components/atlas/ExploreMode.jsx");
for (const token of ['case "miss"','case "thrust"','case "heavy"','case "shoot"']) if (!entity.includes(token)) errors.push(`Pose ausente: ${token}`);
if (!entityEngine.includes('pose = "idle"') || !entityEngine.includes('race, pose')) errors.push("Pose no atraviesa atlasEntitySprites");
if (!pixel.includes('pose = "idle"') || !pixel.includes('false, pose')) errors.push("Pose no atraviesa atlasPixel");
if (!explore.includes("drawPlayerSprite(playerCanvasRef.current, player.class")) errors.push("Modo libre no usa el mismo renderer de héroe");

if (errors.length) {
  console.error("VALIDACIÓN v2.8 FALLIDA");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.log("Atlas Visual v2.8 validado");
console.log("9/9 héroes · 34 NPC regionales · melee conectado · fallo animado · impacto enemigo · habilidades por arma · mundo/combate sincronizados");
