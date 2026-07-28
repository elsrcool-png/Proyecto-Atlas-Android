#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."); const errors=[]; const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const gate=read('src/data/atlasHeroModular/asset_gate_status.json');
if(gate.definition_gates.weapon_families.count!==13)errors.push('Fase 7: familias != 13');
if(gate.definition_gates.weapon_clips.count!==65)errors.push('Fase 7: clips != 65');
if(gate.definition_gates.weapon_assignments.count!==56)errors.push('Fase 7: armas != 56');
if(gate.definition_gates.equipment_catalog.count!==164)errors.push('Fase 8: objetos != 164');
const clips=read('src/data/atlasHeroModular/phase7_weapon_clips.json'); if(Object.keys(clips.clips||{}).length!==65)errors.push('Registro Phase7 incompleto');
const equipment=read('src/data/atlasHeroModular/phase8_equipment_visual_catalog.json'); if((equipment.items||[]).length!==164)errors.push('Registro Phase8 incompleto');
const ids=(equipment.items||[]).map(x=>x.id); if(new Set(ids).size!==ids.length)errors.push('IDs visuales duplicados');
const required=['hair_front_socket','hair_back_socket','book_socket','orb_socket','effect_head_socket','effect_weapon_socket','belt_left_socket','belt_right_socket','scabbard_socket'];
for(const race of ['humano','elfo','enano']){const rig=read(`src/data/atlasHeroModular/rigs/${race}_rig_v1.json`);for(const [dir,d] of Object.entries(rig.directions||{})){for(const s of required)if(!d.sockets?.[s])errors.push(`${race}/${dir}: falta ${s}`);if(race==='elfo')for(const s of ['ear_near_socket','ear_far_socket'])if(!d.sockets?.[s])errors.push(`${race}/${dir}: falta ${s}`);if(race==='enano')for(const s of ['beard_front_socket','beard_back_socket'])if(!d.sockets?.[s])errors.push(`${race}/${dir}: falta ${s}`);}}
const flags=fs.readFileSync(path.join(root,'src/lib/atlasHeroIntegrationFlags.js'),'utf8'); if(!/enabled:\s*false/.test(flags))errors.push('Flags no están apagados');
for(const rel of ['src/components/atlas/ModularHeroSprite.jsx','src/lib/atlasHeroAnimationRuntime.js','src/lib/atlasHeroEquipmentVisualCatalog.js','src/lib/atlasHeroCanvasBridge.js'])if(!fs.existsSync(path.join(root,rel)))errors.push(`Falta ${rel}`);
if(errors.length){console.error('FAIL MODULAR INTEGRATION V2.21');errors.forEach(e=>console.error('ERROR:',e));process.exit(1);}console.log('PASS MODULAR INTEGRATION V2.21');console.log('3 rigs · sockets completos en rig-space · 16 universales · 13 familias · 65 clips · 56 armas · 164 objetos');console.warn('ART PENDING: renderer permanece apagado y usa maestro_v1.');
