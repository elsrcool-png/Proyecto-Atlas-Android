// PROYECTO ATLAS — Economía dirigida por asentamiento.
// Cada tienda ofrece una selección breve y deliberada, no un catálogo infinito.

import { REGIONAL_SHOP_STOCK } from "@/lib/atlasRegionalEquipment";

const STOCK = REGIONAL_SHOP_STOCK;

export const SMITH_TIERS = {
  camp: {
    id: "camp",
    label: "Herrería de campaña",
    services: ["repair", "basic_upgrade"],
    canCraftSlots: [0],
    maxUpgrade: 1,
    description: "Repara equipo y realiza mejoras sencillas. No puede restaurar reliquias ni forjar armas avanzadas.",
  },
  town: {
    id: "town",
    label: "Forja del pueblo",
    services: ["repair", "basic_upgrade", "limited_forge"],
    canCraftSlots: [0, 1],
    maxUpgrade: 3,
    description: "Forja armas comunes e intermedias, repara y mejora hasta +3.",
  },
  city: {
    id: "city",
    label: "Forja regional",
    services: ["repair", "advanced_upgrade", "relic_restore"],
    canCraftSlots: [0, 1, 2],
    maxUpgrade: 5,
    description: "Forja equipo avanzado y es el único lugar capaz de restaurar una reliquia regional.",
  },
};

export function getSettlementStock(regionId, tier) {
  const region = STOCK[regionId] || STOCK.verde;
  return region[tier] || region.camp;
}

export function isStockUnlocked(regionId, tier, worldFlags = {}) {
  const stock = getSettlementStock(regionId, tier);
  return !stock.requiredFlag || !!worldFlags[stock.requiredFlag];
}

export function getSmithTierForSettlement(settlementRole) {
  if (settlementRole === "ciudad") return SMITH_TIERS.city;
  if (settlementRole === "pueblo") return SMITH_TIERS.town;
  return SMITH_TIERS.camp;
}

export function getSmithTierById(tierId) {
  return SMITH_TIERS[tierId] || SMITH_TIERS.camp;
}
