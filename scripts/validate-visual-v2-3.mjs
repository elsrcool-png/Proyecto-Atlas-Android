import fs from 'node:fs';
const required = [
  'src/components/atlas/AssetWorldLayer.jsx',
  'src/components/atlas/EntitySprite.jsx',
  'src/lib/atlasEntitySprites.js',
  'src/styles/atlas-world-modular.css',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Falta ${file}`);
}
const layer = fs.readFileSync(required[0], 'utf8');
const css = fs.readFileSync(required[3], 'utf8');
const sprites = fs.readFileSync(required[2], 'utf8');
const checks = [
  ['precarga de escena', layer.includes('sceneSources') && layer.includes('assetsReady')],
  ['posiciones enteras', layer.includes('Math.round(rawPos.left)')],
  ['modo A2 v2.3', css.includes('atlas-world-scene--a2-v23')],
  ['sin filtros caros A2', css.includes('filter: none')],
  ['Bren piloto', sprites.includes('apron: true') && sprites.includes('smith: true')],
  ['Lobo piloto', sprites.includes('muzzle: true') && sprites.includes('beastBody: true')],
];
for (const [name, ok] of checks) {
  if (!ok) throw new Error(`Falló: ${name}`);
  console.log(`✓ ${name}`);
}
console.log('ATLAS VISUAL v2.3: VALIDACIÓN CORRECTA');
