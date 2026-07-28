import { HERO_EQUIPMENT_VISUAL_CATALOG, HERO_WEAPON_ASSIGNMENTS } from "@/lib/atlasHeroModularData";
const equipmentMap = new Map((HERO_EQUIPMENT_VISUAL_CATALOG.items || []).map(item => [item.id, item]));
const weaponMap = new Map((HERO_WEAPON_ASSIGNMENTS.items || []).map(item => [item.id, item]));
export function getEquipmentVisualDefinition(itemId) { return itemId ? equipmentMap.get(itemId) || null : null; }
export function getWeaponAnimationAssignment(itemId) { return itemId ? weaponMap.get(itemId) || null : null; }
export function resolveEquipmentVisual(itemId, { race, direction, performanceMode = "full" } = {}) {
  const item = getEquipmentVisualDefinition(itemId); if (!item) return { mode: "hidden", reason: "unknown_item", itemId };
  const profile = item.visual_spec?.effect_profile || "none";
  return { itemId, item, race, direction, family: item.visual_family, visibility: item.visibility, chain: item.fallback_chain || [itemId], effectProfile: performanceMode === "low" && profile !== "none" ? "static_reduced" : profile, keepGameplayStats: true };
}
export function resolveHelmetAppearance(itemId, appearance = {}) {
  const item = getEquipmentVisualDefinition(itemId); if (!item || item.slot !== "Casco") return appearance;
  const r = item.helmet_rules || {};
  return { ...appearance, showHairFront: !r.hide_hair_front, showHairBack: r.hair_back_rule !== "hide", showElfEars: !r.hide_elf_ears, showDwarfBeard: r.dwarf_beard_rule !== "hide" };
}
export function equipmentCatalogStats() {
  return { itemCount: equipmentMap.size, weaponAssignments: weaponMap.size, visualFamilies: HERO_EQUIPMENT_VISUAL_CATALOG.visual_family_count || 0 };
}
