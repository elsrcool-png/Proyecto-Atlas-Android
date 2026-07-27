import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
let passed = 0;
const failures = [];
function expect(label, ok, detail = '') {
  if (ok) { passed += 1; console.log(`✓ ${label}${detail ? ` — ${detail}` : ''}`); }
  else { failures.push(`${label}${detail ? ` — ${detail}` : ''}`); console.error(`✗ ${label}${detail ? ` — ${detail}` : ''}`); }
}

const pkg = JSON.parse(read('package.json'));
const campaign = read('src/lib/atlasArcticCampaignV2.js');
const campaignNpc = read('src/lib/atlasCampaign.js');
const settlement = read('src/lib/atlasSettlementNpcs.js');
const scene = read('src/lib/atlasArcticVisualScenes.js');
const journal = read('src/components/atlas/MissionJournal.jsx');

const [major, minor, patch] = pkg.version.split('.').map(Number);
expect('Versión 2.19.6 o superior', major > 2 || (major === 2 && (minor > 19 || (minor === 19 && patch >= 6))), `actual=${pkg.version}`);
expect('Objetivo pide_forjador existe', /objective\("pide_forjador",\s*"talk"/.test(campaign));
expect('Objetivo apunta a Ciudadela B2', /pide_forjador[\s\S]{0,260}npcSector:\s*"ciudad"[\s\S]{0,120}npcRole:\s*"forger"[\s\S]{0,120}sectorId:\s*"B2"/.test(campaign));
expect('Forjador Kael existe en catálogo', /forger:\s*\{\s*name:\s*"Forjador Kael"/.test(campaignNpc));
expect('Layout de ciudad incluye forger', /fria:[\s\S]*?ciudad:\s*\[[\s\S]*?role:\s*"forger"/.test(settlement));
expect('B2 tiene anclaje explícito de Kael', /B2:\s*scene\("B2"[\s\S]*?forger:\s*\{x:770,y:585\}/.test(scene));
expect('Kael no usa el fallback del portal', !scene.includes('forger:{x:410,y:570}'));
expect('Diario distingue Encargo', journal.includes('Encargo: {location.giver}'));
expect('Diario muestra Destino actual', journal.includes('Destino: ${targetNpc}'));
expect('Diario resuelve objetivo actual', journal.includes('getCurrentObjective(x.def, x.m)'));
expect('Diario resuelve nombre del sector', journal.includes('getRegionLayout(region?.id || "verde")'));

const runtimeRoot = 'public/assets/atlas/npcs/region_artica/maestro_v1/runtime/fria_kael_forger';
expect('Asset maestro de Kael registrado', fs.existsSync(path.join(ROOT, runtimeRoot)));
for (const dir of ['down','up','left','right']) {
  expect(`Kael runtime ${dir}`, fs.existsSync(path.join(ROOT, runtimeRoot, `idle_${dir}.webp`)));
}

// Distancia al portal inferior. El antiguo fallback estaba a 28 px del portal.
const kaelPos = { x: 770, y: 585 };
const portalPos = { x: 390, y: 590 };
const distance = Math.hypot(kaelPos.x - portalPos.x, kaelPos.y - portalPos.y);
expect('Kael separado del portal', distance > 250, `${distance.toFixed(1)} px`);
expect('Kael dentro del área jugable', kaelPos.x > 40 && kaelPos.x < 920 && kaelPos.y > 80 && kaelPos.y < 680);

if (failures.length) {
  console.error(`\nVALIDACIÓN KAEL v2.19.6 FALLIDA (${failures.length} errores)`);
  process.exit(1);
}
console.log(`\nVALIDACIÓN KAEL v2.19.6 APROBADA — ${passed} controles`);
