// Activación gradual. El valor predeterminado es false para no alterar partidas actuales.

export const ATLAS_UI_V3_DEFAULT_FLAGS = Object.freeze({
  enabled: false,
  mainMenu: false,
  saveSlots: false,
  characterSelect: false,
  explorationHud: false,
  dungeonHud: false,
  combatFrame: false,
  playerHub: false,
  settings: false,
  legacyModalBridge: false,
});

export function normalizeAtlasUiFlags(flags) {
  return { ...ATLAS_UI_V3_DEFAULT_FLAGS, ...(flags || {}) };
}

export function isAtlasUiFeatureEnabled(flags, feature) {
  const normalized = normalizeAtlasUiFlags(flags);
  return Boolean(normalized.enabled && normalized[feature]);
}

export function enableAtlasUiPhase(flags, phase) {
  const next = normalizeAtlasUiFlags(flags);
  if (phase >= 1) Object.assign(next, { enabled: true, mainMenu: true, saveSlots: true, characterSelect: true });
  if (phase >= 2) Object.assign(next, { playerHub: true, settings: true, legacyModalBridge: true });
  if (phase >= 3) Object.assign(next, { explorationHud: true, dungeonHud: true });
  if (phase >= 4) Object.assign(next, { combatFrame: true });
  return next;
}


// Este módulo queda preparado, pero la activación debe conectarse desde el orquestador común.
export const ATLAS_UI_V3_FLAGS_REQUIRE_WIRING = true;
