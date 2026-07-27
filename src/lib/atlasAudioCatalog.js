// PROYECTO ATLAS — Catálogo maestro de audio v1.0 (Región Verde).
// Las rutas y los IDs son estables: la música prototipo puede reemplazarse
// por masters finales sin cambiar el código del juego.

const A = "/assets/audio";

export const ATLAS_MUSIC = Object.freeze({
  menu: { id: "mus_menu_atlas", src: `${A}/music/menu/atlas_theme_prototype.ogg`, loop: true, gain: 0.72 },
  greenCamp: { id: "mus_green_camp", src: `${A}/music/green/camp_green_loop.ogg`, loop: true, gain: 0.72 },
  greenExplore: { id: "mus_green_explore", src: `${A}/music/green/explore_green_loop.ogg`, loop: true, gain: 0.72 },
  greenCorruption: { id: "mus_green_corruption", src: `${A}/music/green/corruption_green_loop.ogg`, loop: true, gain: 0.7 },
  greenCombat: { id: "mus_green_combat", src: `${A}/music/combat/combat_green_loop.ogg`, loop: true, gain: 0.82 },
  greenGuardian: { id: "mus_boss_guardian_green", src: `${A}/music/bosses/guardian_green_loop.ogg`, loop: true, gain: 0.86 },
});

export const ATLAS_AMBIENCE = Object.freeze({
  greenForest: { id: "amb_green_forest", src: `${A}/ambience/green/forest_loop.ogg`, loop: true, gain: 0.5 },
  greenCamp: { id: "amb_green_camp", src: `${A}/ambience/green/camp_loop.ogg`, loop: true, gain: 0.52 },
});

export const ATLAS_SFX = Object.freeze({
  combatStart: `${A}/sfx/combat/combat_start.ogg`,
  swordSlash: `${A}/sfx/combat/sword_slash.ogg`,
  daggerSlash: `${A}/sfx/combat/dagger_slash.ogg`,
  heavySwing: `${A}/sfx/combat/heavy_swing.ogg`,
  magicCast: `${A}/sfx/combat/magic_cast.ogg`,
  impact: `${A}/sfx/combat/impact.ogg`,
  impactHeavy: `${A}/sfx/combat/impact_heavy.ogg`,
  miss: `${A}/sfx/combat/miss.ogg`,
  critical: `${A}/sfx/combat/critical.ogg`,
  enemyDeath: `${A}/sfx/combat/enemy_death.ogg`,
  diceRoll: `${A}/sfx/dice/dice_roll.ogg`,
  diceSettle: `${A}/sfx/dice/dice_settle.ogg`,
  uiConfirm: `${A}/sfx/ui/confirm.ogg`,
  portalActivate: `${A}/sfx/world/portal_activate.ogg`,
  greenVictory: `${A}/music/stingers/green_victory.ogg`,
});

export const GREEN_ENEMY_AUDIO = Object.freeze({
  orco_bruto: {
    intro: `${A}/enemies/green/orco_bruto_intro.ogg`,
    introMs: 1500,
    label: "ENCUENTRO",
    attack: "heavy",
  },
  chaman_orco: {
    intro: `${A}/enemies/green/chaman_orco_intro.ogg`,
    introMs: 1850,
    label: "ENEMIGO MÁGICO",
    attack: "magic",
  },
  asesino_orco: {
    intro: `${A}/enemies/green/asesino_orco_intro.ogg`,
    introMs: 1350,
    label: "EMBOSCADA",
    attack: "dagger",
  },
  lobo_salvaje: {
    intro: `${A}/enemies/green/lobo_salvaje_intro.ogg`,
    introMs: 1600,
    label: "BESTIA SALVAJE",
    attack: "beast",
  },
  brujo_feral: {
    intro: `${A}/enemies/green/brujo_feral_intro.ogg`,
    introMs: 1750,
    label: "PRESENCIA CORRUPTA",
    attack: "magic",
  },
  pantera_sombria: {
    intro: `${A}/enemies/green/pantera_sombria_intro.ogg`,
    introMs: 1450,
    label: "DEPREDADOR SOMBRÍO",
    attack: "beast",
  },
  guardian_verde: {
    intro: `${A}/enemies/green/guardian_verde_intro.ogg`,
    death: `${A}/enemies/green/guardian_verde_death.ogg`,
    introMs: 5100,
    musicDelayMs: 4150,
    label: "JEFE REGIONAL",
    title: "El corazón del bosque despierta",
    attack: "heavy",
    boss: true,
  },
});

const ELITE_STINGER = `${A}/enemies/green/elite_stinger.ogg`;

export function getEnemyAudio(enemy) {
  if (!enemy) return null;
  const base = GREEN_ENEMY_AUDIO[enemy.id] || {
    intro: null,
    introMs: enemy.boss ? 3800 : 1100,
    label: enemy.boss ? "JEFE" : "ENCUENTRO",
    attack: enemy.basicAttackType === "magico" ? "magic" : "heavy",
  };
  if (!enemy.elite || base.boss) return base;
  return {
    ...base,
    introMs: Math.max(base.introMs || 0, 2200),
    musicDelayMs: Math.max(base.musicDelayMs || 0, 1650),
    label: "ENEMIGO DE ÉLITE",
    eliteStinger: ELITE_STINGER,
  };
}

export function getWorldAudio(regionId, sectorType) {
  if (regionId !== "verde") return { music: null, ambience: null };
  if (["camp", "town", "city", "outpost"].includes(sectorType)) {
    return { music: ATLAS_MUSIC.greenCamp, ambience: ATLAS_AMBIENCE.greenCamp };
  }
  if (["ruins", "short_dungeon", "long_dungeon", "mini_boss", "boss"].includes(sectorType)) {
    return { music: ATLAS_MUSIC.greenCorruption, ambience: ATLAS_AMBIENCE.greenForest };
  }
  return { music: ATLAS_MUSIC.greenExplore, ambience: ATLAS_AMBIENCE.greenForest };
}

export function getCombatMusic(regionId, enemy) {
  if (regionId !== "verde") return null;
  return enemy?.boss || enemy?.id === "guardian_verde" ? ATLAS_MUSIC.greenGuardian : ATLAS_MUSIC.greenCombat;
}

export function resolveActionSound(animation, playerClass) {
  if (animation?.weaponType === "dagger" || animation?.impactType === "pierce") return ATLAS_SFX.daggerSlash;
  if (animation?.weaponType === "axe" || animation?.impactType === "blunt") return ATLAS_SFX.heavySwing;
  if (animation?.weaponType === "staff" || animation?.dungeonType === "magic" || animation?.dungeonType === "projectile" || playerClass === "Mago") return ATLAS_SFX.magicCast;
  return ATLAS_SFX.swordSlash;
}

export function resolveEnemyAttackSound(enemy) {
  const profile = getEnemyAudio(enemy)?.attack;
  if (profile === "magic") return ATLAS_SFX.magicCast;
  if (profile === "dagger") return ATLAS_SFX.daggerSlash;
  if (profile === "beast") return ATLAS_SFX.daggerSlash;
  return ATLAS_SFX.heavySwing;
}
