import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const sceneFile=path.join(root,'src/lib/atlasGreenVisualScenes.js');
const text=fs.readFileSync(sceneFile,'utf8');
const sectors=['A1','B1','C1','A2','B2','C2','A3','B3','C3'];
const errors=[];
for(const s of sectors){ if(!text.includes(`${s}: scene("${s}"`)) errors.push(`Falta escena ${s}`); }
for(const b of ['/modular_v1/house_green.webp','/modular_v1/house_blue.webp','/modular_v1/house_brown.webp','/modular_v1/house_red.webp','/modular_v1/fortress_gate.webp','/modular_v1/ruins_cluster.webp','/modular_v1/portal_altar.webp','/modular_v1/cave_entrance.webp']) if(text.includes(b)) errors.push(`Asset heredado: ${b}`);
for(const id of ['c1_shrine','a3_old_shrine','b3_shrine','c3_boss_portal']) if(text.includes(id)) errors.push(`Elemento incorrecto: ${id}`);
for(const f of ['city_gate_complete.webp','village_inn.webp','city_hall.webp','ruin_arch_clean.webp','cave_entrance_clean.webp','corruption_seal.webp']){
 const p=path.join(root,'public/assets/atlas/verde/modular_v26',f); if(!fs.existsSync(p)||fs.statSync(p).size<500) errors.push(`Asset ausente: ${f}`);
}
const combat=fs.readFileSync(path.join(root,'src/components/atlas/CombatView.jsx'),'utf8');
const entity=fs.readFileSync(path.join(root,'src/components/atlas/EntitySprite.jsx'),'utf8');
const hero=fs.readFileSync(path.join(root,'src/lib/atlasHeroSprites.js'),'utf8');
if(!combat.includes('resolveAbilityAnimation') || !combat.includes('playerMotion')) errors.push('Animación melee no conectada');
if(!combat.includes('playerMiss') || !combat.includes('type === "FALLO"')) errors.push('Fallo sin animación');
if(!combat.includes('hurt={playerHit')) errors.push('Impacto enemigo no conectado');
if(!entity.includes('pose });') || !hero.includes('pose="idle"')) errors.push('Pose de combate no sincronizada con el sprite');
if(errors.length){ console.error('VALIDACIÓN v2.6 FALLIDA'); errors.forEach(e=>console.error(' -',e)); process.exit(1); }
console.log('Atlas Visual v2.6 validado');
console.log('9/9 escenas · melee conectado · fallo animado · impacto conectado · poses sincronizadas');
