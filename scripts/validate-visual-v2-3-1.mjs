import fs from 'node:fs';

const files = {
  pilots: 'src/lib/atlasPilotSprites.js',
  pixel: 'src/lib/atlasPixel.js',
  entities: 'src/lib/atlasEntitySprites.js',
  campaign: 'src/lib/atlasCampaign.js',
  explore: 'src/components/atlas/ExploreMode.jsx',
  layer: 'src/components/atlas/AssetWorldLayer.jsx',
  css: 'src/styles/atlas-world-modular.css',
};

for (const path of Object.values(files)) {
  if (!fs.existsSync(path)) throw new Error(`Falta ${path}`);
}

const read = path => fs.readFileSync(path, 'utf8');
const pilots = read(files.pilots);
const pixel = read(files.pixel);
const entities = read(files.entities);
const campaign = read(files.campaign);
const explore = read(files.explore);
const layer = read(files.layer);
const css = read(files.css);

const checks = [
  ['Humano Guerrero usa el piloto real', pixel.includes('drawPilotHumanWarrior(canvas, dir, frame, false)')],
  ['Bren tiene variante exclusiva', campaign.includes('variant: "bren_smith"')],
  ['Bren entra al renderer piloto', entities.includes('variant === "bren_smith"') && entities.includes('drawPilotBren')],
  ['Lobo entra al renderer cuadrúpedo', entities.includes('variant === "lobo_salvaje"') && entities.includes('drawPilotWolf')],
  ['Los tres dibujos piloto existen', ['drawPilotHumanWarrior', 'drawPilotBren', 'drawPilotWolf'].every(name => pilots.includes(`export function ${name}`))],
  ['A2 usa una sola capa visual', (explore.match(/<AssetWorldLayer/g) || []).length === 1 && explore.includes('phase="all"')],
  ['A2 tiene marcador de versión', layer.includes('data-atlas-visual-version') && layer.includes('2.3.1')],
  ['A2 ya no se oculta durante precarga', !css.includes('.atlas-world-scene--a2-v23 {\n  opacity: 0') && css.includes('.atlas-world-scene--a2-v231')],
  ['Nieblas móviles estabilizadas', css.includes('.atlas-a2-stable-viewport .atlas-fog') && css.includes('animation: none !important')],
  ['Scanlines móviles desactivadas', css.includes('.atlas-scanlines { display: none !important; }')],
];

for (const [label, ok] of checks) {
  if (!ok) throw new Error(`Falló: ${label}`);
  console.log(`✓ ${label}`);
}

const distFiles = fs.existsSync('dist/assets') ? fs.readdirSync('dist/assets') : [];
const distJs = distFiles.filter(name => name.endsWith('.js')).map(name => read(`dist/assets/${name}`)).join('\n');
if (!distJs.includes('bren_smith') || !distJs.includes('2.3.1')) {
  throw new Error('La build dist no contiene las rutas visuales v2.3.1');
}
console.log('✓ Build dist contiene Bren piloto y marcador v2.3.1');
console.log('ATLAS VISUAL v2.3.1: INTEGRACIÓN REAL VERIFICADA');
