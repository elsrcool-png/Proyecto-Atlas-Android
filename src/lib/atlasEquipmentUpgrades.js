// PROYECTO ATLAS v2.23 — Cotización única para forja y mejora de equipo.
// La UI y la lógica de cobro consumen exactamente esta misma estructura.
import { MATERIALS, REGION_MATERIALS } from "@/lib/atlasLoot";
import { WEAPON_MAX_UPGRADE } from "@/lib/atlasWeapons";

export const EQUIPMENT_MAX_UPGRADE = WEAPON_MAX_UPGRADE;

const RARITY_FACTOR = {
  "Común": 1,
  "Poco común": 1.25,
  "Raro": 1.55,
  "Épico": 2,
  "Legendario": 3,
};

const CLASS_SLOT_REGION = { 0: "verde", 1: "fria", 2: "desierto", 3: "verde", 9: "verde" };
const KIND_LABEL = { classWeapon: "Arma de clase", weapon: "Arma", armor: "Armadura", helmet: "Casco" };

export function equipmentKindLabel(kind) {
  return KIND_LABEL[kind] || "Equipo";
}

export function inferEquipmentRegion(def = {}, kind = "weapon", fallbackRegion = "verde") {
  if (def.region && REGION_MATERIALS[def.region]) return def.region;
  if (kind === "classWeapon" && CLASS_SLOT_REGION[def.slot]) return CLASS_SLOT_REGION[def.slot];
  return REGION_MATERIALS[fallbackRegion] ? fallbackRegion : "verde";
}

function materialPair(regionId, kind) {
  const pool = REGION_MATERIALS[regionId] || REGION_MATERIALS.verde;
  if (kind === "armor") return [pool[1], pool[0]];
  if (kind === "helmet") return [pool[1], pool[2]];
  return [pool[0], pool[2]];
}

function normalizeRequirements(requirements = {}) {
  return Object.fromEntries(Object.entries(requirements).filter(([id, amount]) => MATERIALS[id] && amount > 0));
}

export function getEquipmentUpgradeLevel(player, kind, ref) {
  if (!player || !ref) return 0;
  if (kind === "armor") return Number(player.armorUpgrades?.[ref]) || 0;
  if (kind === "helmet") return Number(player.helmetUpgrades?.[ref]) || 0;
  return Number(player.weaponUpgrades?.[ref]) || 0;
}

export function getEquipmentUpgradeMapKey(kind) {
  if (kind === "armor") return "armorUpgrades";
  if (kind === "helmet") return "helmetUpgrades";
  return "weaponUpgrades";
}

export function getUpgradeStatPreview(kind, level, nextLevel) {
  if (kind === "armor") {
    return {
      current: `DEF física +${level}; DEF mágica +${Math.floor(level / 2)}`,
      next: `DEF física +${nextLevel}; DEF mágica +${Math.floor(nextLevel / 2)}`,
    };
  }
  if (kind === "helmet") {
    return {
      current: `DEF física +${Math.ceil(level / 2)}; DEF mágica +${Math.floor(level / 2)}`,
      next: `DEF física +${Math.ceil(nextLevel / 2)}; DEF mágica +${Math.floor(nextLevel / 2)}`,
    };
  }
  return {
    current: `ATK +${level}`,
    next: `ATK +${nextLevel}`,
  };
}

export function getEquipmentUpgradeQuote({ player, kind, ref, def, regionId = "verde", maxUpgrade = EQUIPMENT_MAX_UPGRADE }) {
  const level = getEquipmentUpgradeLevel(player, kind, ref);
  const localMax = Math.max(0, Math.min(EQUIPMENT_MAX_UPGRADE, Number(maxUpgrade) || 0));
  const nextLevel = level + 1;
  const originRegion = inferEquipmentRegion(def, kind, regionId);
  const rarityFactor = RARITY_FACTOR[def?.rarity] || 1;
  const [primary, secondary] = materialPair(originRegion, kind);
  const baseNeed = Math.max(1, Math.ceil((nextLevel + rarityFactor - 1) * rarityFactor));
  const requirements = { [primary]: baseNeed };
  if (nextLevel >= 3 || rarityFactor >= 1.55) requirements[secondary] = Math.max(1, Math.ceil(baseNeed / 2));
  const materials = normalizeRequirements(requirements);
  const gold = Math.max(1, Math.round((20 + level * 15) * rarityFactor));
  const ownedMaterials = player?.materials || {};
  const missing = Object.entries(materials)
    .filter(([id, need]) => (ownedMaterials[id] || 0) < need)
    .map(([id, need]) => ({ id, need, have: ownedMaterials[id] || 0 }));
  const maxed = level >= EQUIPMENT_MAX_UPGRADE;
  const localMaxed = level >= localMax;
  const hasGold = (player?.gold || 0) >= gold;
  const canUpgrade = !maxed && !localMaxed && hasGold && missing.length === 0;
  let reason = "";
  if (maxed) reason = `Mejora máxima +${EQUIPMENT_MAX_UPGRADE}.`;
  else if (localMaxed) reason = `Esta forja solo trabaja hasta +${localMax}.`;
  else if (!hasGold) reason = `Faltan ${gold - (player?.gold || 0)} de oro.`;
  else if (missing.length) reason = `Faltan ${missing.map(m => `${MATERIALS[m.id]?.name || m.id} ${m.need - m.have}`).join(" y ")}.`;

  return {
    kind, ref, level, nextLevel, localMax, maxed, localMaxed, originRegion,
    gold, materials, missing, hasGold, canUpgrade, reason,
    statPreview: getUpgradeStatPreview(kind, level, nextLevel),
  };
}

export function getEquipmentForgeQuote({ player, kind, def, regionId = "verde" }) {
  const originRegion = inferEquipmentRegion(def, kind, regionId);
  const rarityFactor = RARITY_FACTOR[def?.rarity] || 1;
  const [primary, secondary] = materialPair(originRegion, kind);
  const base = Math.max(1, Math.ceil(2 * rarityFactor));
  const materials = normalizeRequirements({
    [primary]: base,
    [secondary]: Math.max(1, Math.ceil(base / 2)),
  });
  const gold = Math.max(1, Math.round((Number(def?.price) || 20) * 0.65));
  const ownedMaterials = player?.materials || {};
  const missing = Object.entries(materials)
    .filter(([id, need]) => (ownedMaterials[id] || 0) < need)
    .map(([id, need]) => ({ id, need, have: ownedMaterials[id] || 0 }));
  const hasGold = (player?.gold || 0) >= gold;
  return {
    kind, originRegion, gold, materials, missing, hasGold,
    canForge: hasGold && missing.length === 0,
    reason: !hasGold
      ? `Faltan ${gold - (player?.gold || 0)} de oro.`
      : missing.length
        ? `Faltan ${missing.map(m => `${MATERIALS[m.id]?.name || m.id} ${m.need - m.have}`).join(" y ")}.`
        : "",
  };
}

export function consumeEquipmentQuote(player, quote) {
  const materials = { ...(player?.materials || {}) };
  for (const [id, need] of Object.entries(quote?.materials || {})) {
    materials[id] = Math.max(0, (materials[id] || 0) - need);
    if (materials[id] <= 0) delete materials[id];
  }
  return { ...player, gold: Math.max(0, (player?.gold || 0) - (quote?.gold || 0)), materials };
}
