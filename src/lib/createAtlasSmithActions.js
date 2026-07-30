import { recomputePlayer, CLASS_OFF_TYPE } from "@/lib/atlasSkills";
import { makeWeaponInstance, resolveWeaponDefId } from "@/lib/atlasWeaponInstances";
import { CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { WEAPONS, ARMORS, HELMETS, MATERIALS } from "@/lib/atlasLoot";
import { getSmithTierById, getSettlementStock, isStockUnlocked } from "@/lib/atlasEconomyV3";
import {
  getEquipmentForgeQuote,
  getEquipmentUpgradeQuote,
  getEquipmentUpgradeMapKey,
  consumeEquipmentQuote,
} from "@/lib/atlasEquipmentUpgrades";

function resolveForgeDef(kind, ref, player) {
  if (kind === "classWeapon") return CLASS_WEAPONS[ref] || null;
  if (kind === "weapon") {
    const defId = resolveWeaponDefId(player, ref) || (WEAPONS[ref] ? ref : null);
    return defId ? WEAPONS[defId] : null;
  }
  if (kind === "armor") return ARMORS[ref] || null;
  if (kind === "helmet") return HELMETS[ref] || null;
  return null;
}

function ownsForgeItem(player, kind, ref) {
  if (kind === "classWeapon") return (player.classWeaponInventory || []).includes(ref);
  if (kind === "weapon") return (player.weaponInventory || []).some(entry => (typeof entry === "string" ? entry : entry?.uid) === ref);
  if (kind === "armor") return (player.armorInventory || []).includes(ref);
  if (kind === "helmet") return (player.helmetInventory || []).includes(ref);
  return false;
}

export function createAtlasSmithActions({
  playerRef,
  setPlayer,
  smithTier,
  region,
  worldFlagsRef,
  toast,
  pushLog,
}) {
  const forgeEquipment = (kind, id) => {
    const player = playerRef.current;
    const def = resolveForgeDef(kind, id, player);
    if (!player || !def) return;
    const tier = getSmithTierById(smithTier);

    if (kind === "classWeapon") {
      const expectedRegion = { 0: "verde", 1: "fria", 2: "desierto" }[def.slot];
      if (def.starter || def.relic) { toast("Este diseño no se forja desde el catálogo común", "info"); return; }
      if (expectedRegion && expectedRegion !== region.id) { toast("Este diseño pertenece a otra región", "info"); return; }
      if (!tier.canCraftSlots.includes(def.slot)) { toast(`${tier.label} no puede forjar esta categoría`, "info"); return; }
      if (ownsForgeItem(player, kind, id)) { toast("Ya posees esta arma de clase", "info"); return; }
      const recipe = def.recipe || { gold: 0, materials: {} };
      const missing = Object.entries(recipe.materials || {}).filter(([materialId, need]) => (player.materials?.[materialId] || 0) < need);
      if ((player.gold || 0) < (recipe.gold || 0)) { toast(`Faltan ${(recipe.gold || 0) - (player.gold || 0)} de oro`, "info"); return; }
      if (missing.length) {
        const detail = missing.map(([materialId, need]) => `${MATERIALS[materialId]?.name || materialId} ${need - (player.materials?.[materialId] || 0)}`).join(" y ");
        toast(`Faltan ${detail}`, "info");
        return;
      }
      setPlayer(previous => {
        const materials = { ...(previous.materials || {}) };
        for (const [materialId, need] of Object.entries(recipe.materials || {})) {
          materials[materialId] = (materials[materialId] || 0) - need;
          if (materials[materialId] <= 0) delete materials[materialId];
        }
        return recomputePlayer({
          ...previous,
          gold: (previous.gold || 0) - (recipe.gold || 0),
          materials,
          classWeaponInventory: [...(previous.classWeaponInventory || []), id],
        });
      });
      toast(`Forjado: ${def.name}`, "item");
      pushLog(`Forjas ${def.name} en ${tier.label}.`);
      return;
    }

    const stock = getSettlementStock(region.id, smithTier);
    if (!isStockUnlocked(region.id, smithTier, worldFlagsRef.current)) { toast("Este catálogo todavía no está habilitado", "info"); return; }
    const listKey = kind === "weapon" ? "weapons" : kind === "armor" ? "armors" : "helmets";
    if (!(stock[listKey] || []).includes(id)) { toast("Este herrero no trabaja ese equipo", "info"); return; }
    if (kind === "weapon" && def.offType !== CLASS_OFF_TYPE[player.class]) { toast("Esta arma pertenece a otra clase", "info"); return; }
    if (kind === "helmet" && !player.equipmentUnlocks?.helmet) { toast("El espacio de Casco aún está bloqueado", "info"); return; }
    const alreadyOwned = kind === "weapon"
      ? (player.weaponInventory || []).some(entry => resolveWeaponDefId(player, typeof entry === "string" ? entry : entry?.uid) === id)
      : ownsForgeItem(player, kind, id);
    if (alreadyOwned) { toast("Ya posees esta pieza", "info"); return; }
    const quote = getEquipmentForgeQuote({ player, kind, def, regionId: region.id });
    if (!quote.canForge) { toast(quote.reason || "No cumples los requisitos", "info"); return; }
    setPlayer(previous => {
      const next = consumeEquipmentQuote(previous, quote);
      if (kind === "weapon") next.weaponInventory = [...(previous.weaponInventory || []), makeWeaponInstance(id)];
      else if (kind === "armor") next.armorInventory = [...new Set([...(previous.armorInventory || []), id])];
      else next.helmetInventory = [...new Set([...(previous.helmetInventory || []), id])];
      return recomputePlayer(next);
    });
    toast(`Forjado: ${def.name}`, "item");
    pushLog(`${tier.label} forja ${def.name} con materiales de ${region.name}.`);
  };

  const upgradeEquipment = (kind, ref) => {
    const player = playerRef.current;
    const def = resolveForgeDef(kind, ref, player);
    if (!player || !def || !ownsForgeItem(player, kind, ref)) { toast("No posees esta pieza", "info"); return; }
    const tier = getSmithTierById(smithTier);
    const quote = getEquipmentUpgradeQuote({ player, kind, ref, def, regionId: region.id, maxUpgrade: tier.maxUpgrade });
    if (!quote.canUpgrade) { toast(quote.reason || "No se puede mejorar", "info"); return; }
    const mapKey = getEquipmentUpgradeMapKey(kind);
    setPlayer(previous => {
      const next = consumeEquipmentQuote(previous, quote);
      next[mapKey] = { ...(previous[mapKey] || {}), [ref]: quote.nextLevel };
      return recomputePlayer(next);
    });
    toast(`Mejorado: ${def.name} +${quote.nextLevel}`, "equip");
    pushLog(`${def.name} alcanza +${quote.nextLevel}.`);
  };

  return {
    forgeEquipment,
    upgradeEquipment,
    craftWeapon: id => forgeEquipment("classWeapon", id),
    upgradeWeapon: id => upgradeEquipment("classWeapon", id),
  };
}
