import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const need = (p) => {
  const abs = path.join(root, p);
  if (!fs.existsSync(abs)) throw new Error(`Falta ${p}`);
  return abs;
};
const read = (p) => fs.readFileSync(need(p), 'utf8');

const campaignText = read('src/lib/atlasCampaign.js');
const npcSpriteText = read('src/lib/atlasGreenNpcSprites.js');
const entityText = read('src/lib/atlasEntitySprites.js');
const dungeonText = read('src/lib/atlasDungeonEntry.js');
const worldText = read('src/lib/atlasWorldDesign.js');
const exploreText = read('src/components/atlas/ExploreMode.jsx');
const dialogText = read('src/components/atlas/NPCDialog.jsx');

const npcModule = await import(pathToFileURL(need('src/lib/atlasGreenNpcSprites.js')).href);
const profiles = npcModule.GREEN_NPC_PROFILES;
const profileIds = Object.keys(profiles);

if (profileIds.length !== 25) throw new Error(`Se esperaban 25 perfiles verdes y hay ${profileIds.length}`);
if (!entityText.includes('drawGreenNpc') || !entityText.includes('isGreenNpcVariant')) {
  throw new Error('atlasEntitySprites no conecta el renderer de NPC verdes');
}

const greenStart = campaignText.indexOf('  verde: {');
const greenEnd = campaignText.indexOf('\n\n  fria: {');
if (greenStart < 0 || greenEnd < 0) throw new Error('No se pudo aislar CAMPAIGN_NPCS.verde');
const greenBlock = campaignText.slice(greenStart, greenEnd);
const campaignVariants = [...greenBlock.matchAll(/variant:\s*"([^"]+)"/g)].map((m) => m[1]);
const allowedSpecials = new Set(['bren_smith']);
for (const variant of campaignVariants) {
  if (!profiles[variant] && !allowedSpecials.has(variant)) {
    throw new Error(`NPC verde aún usa variante no propia: ${variant}`);
  }
}

const requiredNamed = [
  'verde_roland', 'verde_elia', 'verde_cedric', 'verde_bryn', 'verde_refuge_keeper',
  'verde_kael_villager', 'verde_darian', 'verde_tomas', 'verde_aldric', 'verde_oleg',
  'verde_orin', 'verde_ira', 'verde_inn_traveler', 'verde_cartographer',
  'verde_royal_captain', 'verde_senn', 'verde_senna', 'verde_brun', 'verde_rurik',
];
for (const id of requiredNamed) {
  if (!profiles[id]) throw new Error(`Falta perfil nombrado ${id}`);
  if (!greenBlock.includes(`variant: "${id}"`)) throw new Error(`${id} no está conectado a CAMPAIGN_NPCS.verde`);
}
if (!greenBlock.includes('variant: "bren_smith"')) throw new Error('Bren no conserva el sprite piloto aprobado');

const dungeonVariants = ['verde_dungeon_bren', 'verde_vera_hunter', 'verde_roland_vigilante'];
for (const id of dungeonVariants) {
  if (!profiles[id] || !dungeonText.includes(`variant: "${id}"`)) throw new Error(`Falta guardián de dungeon ${id}`);
}

const ambientVariants = ['verde_ambient_traveler', 'verde_ambient_hunter', 'verde_ambient_caravan'];
for (const id of ambientVariants) {
  if (!profiles[id] || !worldText.includes(id)) throw new Error(`Falta NPC ambiental ${id}`);
}

if (!exploreText.includes('Visual 2.5 · Región Verde completa · NPC propios activos')) {
  throw new Error('Falta marcador visible Visual 2.5');
}
if (!dialogText.includes('EntitySprite') || !dialogText.includes('npc.sprite?.variant')) {
  throw new Error('NPCDialog no muestra el sprite individual del NPC');
}
if (!npcSpriteText.includes('Capucha abierta')) throw new Error('No está aplicada la corrección de capuchas abiertas');

const distAssets = path.join(root, 'dist/assets');
if (!fs.existsSync(distAssets)) throw new Error('Falta dist/assets; ejecuta npm run build');
const bundle = fs.readdirSync(distAssets)
  .filter((name) => name.endsWith('.js'))
  .map((name) => fs.readFileSync(path.join(distAssets, name), 'utf8'))
  .join('\n');
for (const token of ['Visual 2.5', 'verde_roland', 'verde_cartographer', 'verde_vera_hunter']) {
  if (!bundle.includes(token)) throw new Error(`La build no contiene ${token}`);
}

console.log(`✓ Perfiles NPC verdes propios: ${profileIds.length}`);
console.log(`✓ NPC de campaña conectados: ${campaignVariants.length} apariciones`);
console.log('✓ Bren conserva el piloto aprobado');
console.log('✓ Guardianes de dungeon: 3/3');
console.log('✓ Arquetipos ambientales: 3/3');
console.log('✓ Retratos de diálogo conectados');
console.log('✓ Build dist contiene Visual 2.5 y variantes verdes');
console.log('ATLAS VISUAL v2.5: NPC DE REGIÓN VERDE VERIFICADOS');
