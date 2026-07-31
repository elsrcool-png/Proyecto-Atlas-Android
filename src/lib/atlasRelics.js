// PROYECTO ATLAS — Reliquias regionales restaurables.

export const GREEN_RELIC_COMPONENTS = [
  { id: "mineral_antiguo_guardian", name: "Mineral antiguo del Guardián" },
  { id: "carbon_ritual_verde", name: "Carbón ritual" },
  { id: "nucleo_cristal_verde", name: "Núcleo de cristal verde" },
];

export const GREEN_RELIC_FORMS = {
  Guerrero: {
    weaponId: "reliquia_verde_guerrero",
    name: "Espada-Raíz del Guardián",
    form: "Hoja de guerra",
  },
  Mago: {
    weaponId: "reliquia_verde_mago",
    name: "Bastón de Savia Ancestral",
    form: "Canalizador arcano",
  },
  "Pícaro": {
    weaponId: "reliquia_verde_picaro",
    name: "Hojas Gemelas del Brote",
    form: "Filos de precisión",
  },
};

export function getGreenRelicForm(playerClass) {
  return GREEN_RELIC_FORMS[playerClass] || GREEN_RELIC_FORMS.Guerrero;
}

export function getMissingGreenRelicComponents(player) {
  const questItems = player?.questItems || {};
  return GREEN_RELIC_COMPONENTS.filter(component => (questItems[component.id] || 0) < 1);
}

export function canRestoreGreenRelic(player, worldFlags = {}) {
  if (!worldFlags["verde:broken_relic_found"]) return false;
  if (!worldFlags["verde:city_services_open"]) return false;
  return getMissingGreenRelicComponents(player).length === 0;
}

export function consumeGreenRelicComponents(player) {
  const questItems = { ...(player.questItems || {}) };
  for (const component of GREEN_RELIC_COMPONENTS) {
    questItems[component.id] = Math.max(0, (questItems[component.id] || 0) - 1);
    if (questItems[component.id] <= 0) delete questItems[component.id];
  }
  return questItems;
}

export const REGIONAL_BOSS_RELICS = Object.freeze({
  fria: Object.freeze({
    id: "fragmento_nucleo_artico",
    state: "obtenida",
    name: "Fragmento del Núcleo Ártico",
    form: "Fragmento regional",
    source: "Aurel, Último Portador",
    desc: "Un fragmento del núcleo que Aurel sostuvo durante siglos bajo el hielo.",
  }),
  desierto: Object.freeze({
    id: "nucleo_solar_antiguo",
    state: "obtenida",
    name: "Núcleo Solar Antiguo",
    form: "Reliquia regional",
    source: "Amon, Portador del Sol Eterno",
    desc: "El núcleo abrasado que mantuvo activo el sello de la Región Árida.",
  }),
});

export function getRegionalBossRelic(regionId) {
  const relic = REGIONAL_BOSS_RELICS[regionId];
  return relic ? { ...relic } : null;
}

export function reconcileRegionalBossRelics(player, defeatedBosses = []) {
  if (!player) return player;
  const defeated = defeatedBosses instanceof Set ? defeatedBosses : new Set(defeatedBosses || []);
  const relics = { ...(player.relics || {}) };
  let changed = false;
  if (defeated.has("aurel_portador") && !relics.fria) { relics.fria = getRegionalBossRelic("fria"); changed = true; }
  if (defeated.has("amon_solar") && !relics.desierto) { relics.desierto = getRegionalBossRelic("desierto"); changed = true; }
  return changed ? { ...player, relics } : player;
}
