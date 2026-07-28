// Documentación ejecutable de los contratos que deben conservarse al sustituir pantallas.

export const ATLAS_UI_COMPONENT_CONTRACTS = Object.freeze({
  MainMenu: ["onNewGame", "onLoadGame", "onOpenSettings", "hasAnySave"],
  SaveSlotsModal: ["mode", "slots", "onPick", "onDelete", "onClose"],
  CharacterSelect: ["onSelect"],
  PlayerHub: [
    "player", "region", "missions", "missionDefs", "settings", "onUpdateSettings",
    "onUseConsumable", "onEquipWeapon", "onEquipArmor", "onEquipHelmet", "onEquipAccessory",
    "onSellWeapon", "onSellArmor", "onSellHelmet", "onSellAccessory", "onSellMaterial",
    "onEquipClassWeapon", "onSellClassWeapon", "onClose",
  ],
  SettingsModal: ["settings", "onChange", "onClose", "onReset", "onRequestOrientation"],
  CombatView: [
    "player", "enemy", "region", "lastResult", "busy", "onAttack", "onSkill",
    "onItem", "onEscape", "onEnemyDead", "skills", "skillCosts", "playerStatuses",
  ],
});

export function validateAtlasUiContract(name, props) {
  const contract = ATLAS_UI_COMPONENT_CONTRACTS[name];
  if (!contract) return { ok: false, missing: [], unknownContract: true };
  const missing = contract.filter(key => !(key in (props || {})));
  return { ok: missing.length === 0, missing, unknownContract: false };
}
