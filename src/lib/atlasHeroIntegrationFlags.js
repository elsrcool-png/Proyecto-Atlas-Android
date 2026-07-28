const DEFAULT_FLAGS = Object.freeze({
  uiV3: Object.freeze({ enabled: false }),
  heroModular: Object.freeze({
    enabled: false,
    characterSelect: false,
    characterSheet: false,
    characterPanel: false,
    playerHub: false,
    world: false,
    dungeon: false,
    combat: false,
  }),
  universalAnimations: Object.freeze({ enabled: false, world: false, dungeon: false, combatReactions: false, contextual: false }),
  weaponFamilyAnimations: Object.freeze({ enabled: false, combat: false }),
  equipmentVisualCatalog: Object.freeze({ enabled: true }),
  fallbacks: Object.freeze({ legacyHero: true, missingAsset: true, runtimeError: true, sitRestToIdle: true, genericWeaponPose: true }),
});

function mergeSection(base, override) { return { ...base, ...(override && typeof override === "object" ? override : {}) }; }

export function getAtlasIntegrationFlags() {
  const override = typeof globalThis !== "undefined" ? globalThis.__ATLAS_INTEGRATION_FLAGS__ : null;
  if (!override) return DEFAULT_FLAGS;
  return {
    ...DEFAULT_FLAGS,
    ...override,
    uiV3: mergeSection(DEFAULT_FLAGS.uiV3, override.uiV3),
    heroModular: mergeSection(DEFAULT_FLAGS.heroModular, override.heroModular),
    universalAnimations: mergeSection(DEFAULT_FLAGS.universalAnimations, override.universalAnimations),
    weaponFamilyAnimations: mergeSection(DEFAULT_FLAGS.weaponFamilyAnimations, override.weaponFamilyAnimations),
    equipmentVisualCatalog: mergeSection(DEFAULT_FLAGS.equipmentVisualCatalog, override.equipmentVisualCatalog),
    fallbacks: mergeSection(DEFAULT_FLAGS.fallbacks, override.fallbacks),
  };
}

export function isHeroModularSurfaceEnabled(surface) {
  const flags = getAtlasIntegrationFlags();
  return !!(flags.heroModular.enabled && flags.heroModular[surface]);
}

export function isUniversalAnimationSurfaceEnabled(surface) {
  const flags = getAtlasIntegrationFlags();
  return !!(flags.universalAnimations.enabled && flags.universalAnimations[surface]);
}

export function isWeaponFamilyAnimationEnabled(surface = "combat") {
  const flags = getAtlasIntegrationFlags();
  return !!(flags.weaponFamilyAnimations.enabled && flags.weaponFamilyAnimations[surface]);
}

export { DEFAULT_FLAGS as ATLAS_INTEGRATION_FLAGS_DEFAULTS };
