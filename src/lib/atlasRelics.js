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
