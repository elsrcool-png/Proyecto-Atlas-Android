import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { defaultControlProfiles, normalizeControlProfiles, applyControlPreset } from '../src/lib/atlasControlLayout.js';
import { tickPlayerStatuses } from '../src/lib/atlasEnemyAI.js';
import { getSkillStatusHints } from '../src/lib/atlasSkillStatusHints.js';
import { buildCanonicalExploreMaps } from '../src/lib/atlasCanonicalWorlds.js';
import { auditWorldAccessibility } from '../src/lib/atlasWorldAccessibility.js';
import { auditInteractionClearance, ATLAS_INTERACTION_CLEARANCE } from '../src/lib/atlasInteractionClearance.js';
import { GREEN_STORY_POINT_IDS, GREEN_CAMPAIGN_V2 } from '../src/lib/atlasGreenCampaignV2.js';
import { FRIA_STORY_POINT_IDS, ARCTIC_CAMPAIGN_V2 } from '../src/lib/atlasArcticCampaignV2.js';
import DESERT_CAMPAIGN_V2, { DESERT_STORY_POINT_IDS } from '../src/lib/atlasDesertCampaignV2.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const checks = [];
function ok(name, fn) {
  fn();
  checks.push(name);
  console.log(`✓ ${name}`);
}

ok('Versión del paquete 2.20.0', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.version, '2.20.0');
});

ok('Perfiles vertical y horizontal con cuatro controles', () => {
  const profiles = defaultControlProfiles('right');
  for (const orientation of ['portrait', 'landscape']) {
    for (const id of ['joystick', 'run', 'b', 'a']) assert.ok(profiles[orientation][id]);
  }
  const normalized = normalizeControlProfiles({ portrait: { a: { x: 8, y: -4, scale: 99, opacity: 0 } } }, 'right');
  assert.equal(normalized.portrait.a.x, 0.95);
  assert.equal(normalized.portrait.a.y, 0.08);
  assert.equal(normalized.portrait.a.scale, 1.7);
  assert.equal(normalized.portrait.a.opacity, 0.35);
  assert.equal(applyControlPreset({}, 'left').handedness, 'left');
});

ok('Botones Pointer Events y joystick con pointerId independiente', () => {
  const button = read('src/components/atlas/AtlasPressButton.jsx');
  const joystick = read('src/components/atlas/Joystick.jsx');
  assert.match(button, /onPointerDown/);
  assert.match(button, /pointerId/);
  assert.match(button, /setPointerCapture/);
  assert.match(button, /touchAction:\s*"none"/);
  assert.match(joystick, /activePointer/);
  assert.match(joystick, /activePointer\.current !== e\.pointerId/);
});

ok('Selección accidental desactivada solo en superficies jugables', () => {
  const css = read('src/index.css');
  assert.match(css, /atlas-mobile-controls[\s\S]*user-select:\s*none/);
  assert.match(css, /atlas-touch-control[\s\S]*touch-action:\s*none/);
  assert.match(css, /atlas-modal-panel[\s\S]*user-select:\s*text/);
});

ok('Editor de controles con arrastre, tamaño, opacidad y presets', () => {
  const editor = read('src/components/atlas/AtlasControlEditor.jsx');
  assert.match(editor, /onPointerMove/);
  assert.match(editor, /Tamaño:/);
  assert.match(editor, /Opacidad:/);
  for (const preset of ['right', 'left', 'compact', 'tablet']) assert.ok(editor.includes(`"${preset}"`));
});

ok('Botón de orientación disponible en exploración, combate y dungeon', () => {
  const explore = read('src/components/atlas/ExploreMode.jsx');
  const game = read('src/pages/Game.jsx');
  const dungeon = read('src/components/atlas/DungeonView.jsx');
  assert.match(explore, /OrientationToggleButton/);
  assert.match(game, /s\.enemy && <OrientationToggleButton/);
  assert.match(dungeon, /OrientationToggleButton/);
});

ok('Respuesta háptica configurable y sincronizada con impactos', () => {
  const haptics = read('src/lib/atlasHaptics.js');
  const combat = read('src/components/atlas/CombatView.jsx');
  const settings = read('src/lib/atlasSettings.js');
  assert.match(haptics, /navigator\.vibrate/);
  assert.match(settings, /hapticsEnabled/);
  assert.match(settings, /hapticIntensity/);
  assert.match(combat, /atlasVibrate\(hit\.crit \? "critical"/);
  assert.match(combat, /atlasVibrate\("paralyzed"/);
});

ok('Iconos de estado visibles en habilidades de combate y dungeon', () => {
  const combat = read('src/components/atlas/CombatView.jsx');
  const dungeon = read('src/components/atlas/DungeonView.jsx');
  assert.match(combat, /getSkillStatusHints/);
  assert.match(combat, /statusHints\.slice/);
  assert.match(dungeon, /getSkillStatusHints/);
  const fire = getSkillStatusHints({ name: 'Bola de Fuego', desc: 'Aplica Quemadura.' });
  assert.ok(fire.some(h => h.id === 'quemadura' && h.icon === '🔥'));
  const storm = getSkillStatusHints({ name: 'Tormenta Eléctrica', desc: 'Una tirada alta puede paralizar.' });
  assert.ok(storm.some(h => h.id === 'paralisis' && h.icon === '⚡' && h.conditional));
});

ok('Parálisis de un turno consume exactamente una acción', () => {
  const first = tickPlayerStatuses({ stun: { duration: 1 } });
  assert.equal(first.canAct, false);
  assert.equal(first.blockedBy, 'stun');
  assert.equal(first.nextStatuses.stun, undefined);
  const next = tickPlayerStatuses(first.nextStatuses);
  assert.equal(next.canAct, true);
});

ok('Congelación de dos turnos consume dos acciones', () => {
  const first = tickPlayerStatuses({ freeze: { duration: 2 } });
  assert.equal(first.canAct, false);
  assert.equal(first.nextStatuses.freeze.duration, 1);
  const second = tickPlayerStatuses(first.nextStatuses);
  assert.equal(second.canAct, false);
  assert.equal(second.nextStatuses.freeze, undefined);
});

ok('Acción bloqueada no gasta durabilidad, energía ni consumibles', () => {
  const actions = read('src/lib/createAtlasCombatActions.js');
  for (const attempted of ['el ataque básico', 'la habilidad', 'la definitiva', 'usar una poción']) assert.ok(actions.includes(attempted));
  assert.match(actions, /if \(!statusResult\.canAct\).*resolveBlockedPlayerAction[\s\S]{0,120}damageWeapon\(1\)/);
  assert.match(actions, /No gastas energía, consumibles ni durabilidad/);
  assert.match(actions, /skipDice:\s*true/);
});

ok('Intro de combate conserva título y elimina barra de carga', () => {
  const intro = read('src/components/atlas/CombatAudioIntro.jsx');
  assert.match(intro, /intro\.name/);
  assert.match(intro, /intro\.title/);
  assert.doesNotMatch(intro, /progress|scaleX|animate-pulse.*h-1|barra/i);
});

ok('Objeto C2 Verde separado del altar de teletransporte', () => {
  const green = read('src/lib/atlasGreenVisualScenes.js');
  const m = green.match(/squareSprite\("c2_notice"[^\n]*?,(\d+),(\d+),108/);
  assert.ok(m, 'No se encontró c2_notice');
  const x = Number(m[1]);
  const y = Number(m[2]);
  const distance = Math.hypot(x - 200, y - 515);
  assert.ok(distance >= ATLAS_INTERACTION_CLEARANCE.storyShrine, `distancia ${distance}`);
});

ok('Marcadores de misión dominan el orden visual', () => {
  const explore = read('src/components/atlas/ExploreMode.jsx');
  const story = read('src/components/atlas/StoryPointMarker.jsx');
  assert.match(explore, /isTarget \? 9998/);
  assert.match(story, /9999/);
});

ok('Todos los encargos y objetivos de diálogo conservan su NPC accesible', () => {
  const maps = buildCanonicalExploreMaps();
  const campaigns = [GREEN_CAMPAIGN_V2, ARCTIC_CAMPAIGN_V2, DESERT_CAMPAIGN_V2];
  const missing = [];
  for (let region = 0; region < campaigns.length; region += 1) {
    const worlds = [...maps.blocks[region], ...Object.values(maps.wilds[region])].filter(Boolean);
    const bySector = Object.fromEntries(worlds.map(world => [world.sectorId, world]));
    const allNpcs = worlds.flatMap(world => world.npcs || []);
    for (const mission of Object.values(campaigns[region]).flat()) {
      if (!allNpcs.some(npc => npc.sector === mission.sector && npc.role === mission.role)) {
        missing.push(`giver:${region}:${mission.id}:${mission.sector}/${mission.role}`);
      }
      for (const objective of mission.objectives || []) {
        if (objective.type !== 'talk') continue;
        const world = bySector[objective.sectorId];
        if (!world?.npcs?.some(npc => npc.sector === objective.npcSector && npc.role === objective.npcRole)) {
          missing.push(`talk:${region}:${mission.id}:${objective.id}`);
        }
      }
    }
  }
  assert.deepEqual(missing, []);
});

ok('Todos los objetivos interactivos de campaña conservan marcador físico', () => {
  const maps = buildCanonicalExploreMaps();
  const worldIds = new Set();
  for (let r = 0; r < maps.blocks.length; r += 1) {
    for (const world of [...maps.blocks[r], ...Object.values(maps.wilds[r])].filter(Boolean)) {
      for (const point of world.storyPoints || []) worldIds.add(point.id);
    }
  }
  const expected = new Set([...GREEN_STORY_POINT_IDS, ...FRIA_STORY_POINT_IDS, ...DESERT_STORY_POINT_IDS]);
  const missing = [...expected].filter(id => !worldIds.has(id));
  assert.deepEqual(missing, []);
  assert.equal(worldIds.size, expected.size);
});

ok('Los 27 sectores son caminables y sin superposiciones interactivas', () => {
  const maps = buildCanonicalExploreMaps();
  let count = 0;
  const failures = [];
  for (let r = 0; r < maps.blocks.length; r += 1) {
    const worlds = [
      ...maps.blocks[r].map((world, col) => [`${col}_1`, world]),
      ...Object.entries(maps.wilds[r]),
    ];
    for (const [sector, world] of worlds) {
      if (!world) continue;
      count += 1;
      const accessibility = auditWorldAccessibility(world);
      const clearance = auditInteractionClearance(world);
      if (accessibility.issues.length || clearance.issues.length) {
        failures.push({ region: r, sector, accessibility: accessibility.issues, clearance: clearance.issues });
      }
    }
  }
  assert.equal(count, 27);
  assert.deepEqual(failures, []);
});

console.log(`\nVALIDACIÓN ATLAS v2.20 CORRECTA — ${checks.length} grupos aprobados`);
