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

const bestiaryText = read('src/lib/atlasGreenBestiary.js');
const entityText = read('src/lib/atlasEntitySprites.js');
const greenEntityText = read('src/lib/atlasGreenEntitySprites.js');
const visualText = read('src/lib/atlasGreenVisualScenes.js');
const registryText = read('src/lib/atlasVisualScenes.js');
const layerText = read('src/components/atlas/AssetWorldLayer.jsx');
const exploreText = read('src/components/atlas/ExploreMode.jsx');
const canonicalText = read('src/lib/atlasCanonicalWorlds.js');
const aiText = read('src/lib/atlasEnemyAI.js');

const monsterIds = [
  'pantera_sombria', 'lobo_salvaje', 'brujo_feral',
  'asesino_orco', 'orco_bruto', 'chaman_orco',
];
const drawFns = [
  'drawGreenPanther', 'drawPilotWolf', 'drawGreenFeralWarlock',
  'drawGreenOrcAssassin', 'drawGreenOrcBrute', 'drawGreenOrcShaman',
  'drawGreenGuardian',
];

const checks = [
  ['Bestiario canónico presente', monsterIds.every(id => bestiaryText.includes(`"${id}"`))],
  ['A2 usa Pantera Sombría', /A2:\s*Object\.freeze\(\["pantera_sombria"\]\)/.test(bestiaryText)],
  ['Los seis mobs tienen ruta visual', monsterIds.every(id => entityText.includes(`variant === "${id}"`))],
  ['Guardián Verde tiene ruta visual', entityText.includes('variant === "guardian_verde"')],
  ['Dibujos regionales presentes', drawFns.filter(n => n !== 'drawPilotWolf').every(name => greenEntityText.includes(`export function ${name}`))],
  ['Mundo canónico usa pools por sector', canonicalText.includes('getGreenEnemyPool(sectorId)')],
  ['IA usa bestiario unificado', aiText.includes('verde: [...GREEN_MONSTER_IDS]')],
  ['Registro visual incluye A2 v2', registryText.includes('A2_MODULAR_V2_SCENE') && registryText.includes('GREEN_RUNTIME_SCENES')],
  ['HUD conserva marcador Visual Verde', exploreText.includes('Visual 2.4 · Región Verde modular activa') || exploreText.includes('Visual 2.5 · Región Verde completa · NPC propios activos')],
  ['Renderer marca v2.4', layerText.includes('atlas-world-scene--green-v24') && layerText.includes('data-atlas-visual-version')],
  ['Escenas no usan clusters de árboles', !visualText.includes('pine_cluster_')],
  ['Escenas no usan clusters de arbustos', !visualText.includes('bush_cluster_')],
  ['Escenas declaran arquitectura individual', visualText.includes('architecture: "individual-assets"')],
];
for (const [label, ok] of checks) {
  if (!ok) throw new Error(`Falló: ${label}`);
  console.log(`✓ ${label}`);
}

const greenScenes = await import(pathToFileURL(need('src/lib/atlasGreenVisualScenes.js')).href);
const a2 = await import(pathToFileURL(need('src/lib/atlasA2ModularV2.js')).href);
const scenes = { ...greenScenes.GREEN_VISUAL_SCENES, A2: { ...a2.A2_MODULAR_V2_SCENE, version: '2.4.0' } };
const expected = ['A1','B1','C1','A2','B2','C2','A3','B3','C3'];
for (const id of expected) {
  const scene = scenes[id];
  if (!scene) throw new Error(`Falta escena ${id}`);
  if (!scene.baseLayers?.length) throw new Error(`${id}: falta terreno base`);
  if (!scene.objects?.length) throw new Error(`${id}: falta objetos`);
  if (!scene.spawn) throw new Error(`${id}: falta spawn`);
  for (const item of [...scene.baseLayers, ...scene.objects]) {
    const src = item.src || item.asset;
    if (!src) throw new Error(`${id}/${item.id}: falta asset`);
    const file = path.join(root, 'public', src.replace(/^\//, ''));
    if (!fs.existsSync(file)) throw new Error(`${id}/${item.id}: no existe ${src}`);
  }
  console.log(`✓ ${id}: ${scene.objects.length} objetos · ${(scene.collisions || []).length} colisiones`);
}

const distAssets = path.join(root, 'dist/assets');
if (!fs.existsSync(distAssets)) throw new Error('Falta dist/assets; ejecuta npm run build');
const bundle = fs.readdirSync(distAssets)
  .filter(name => name.endsWith('.js'))
  .map(name => fs.readFileSync(path.join(distAssets, name), 'utf8'))
  .join('\n');
for (const token of ['pantera_sombria', 'guardian_verde', 'modular-assets-v2.4']) {
  if (!bundle.includes(token)) throw new Error(`La build no contiene ${token}`);
}
console.log('✓ Build dist contiene visuales, bestiario y marcador v2.4');
console.log('ATLAS VISUAL v2.4: REGIÓN VERDE VERIFICADA');
