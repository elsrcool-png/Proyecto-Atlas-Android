// PROYECTO ATLAS — Economía dirigida por asentamiento.
// Cada tienda ofrece una selección breve y deliberada, no un catálogo infinito.

const STOCK = {
  verde: {
    camp: {
      label: "Campamento del Umbral",
      weapons: ["sword_thorn", "wand_sapling", "knife_bramble"],
      armors: ["armor_leaf", "robe_sprout", "vest_scout"],
      accessories: ["anillo_fuerza", "capa_resistencia", "amuleto_vida"],
      requiredFlag: "verde:camp_basic_stock",
    },
    town: {
      label: "Pueblo de Robledal",
      weapons: ["sword_explorer", "staff_hazel", "bow_hawthorn"],
      armors: ["armor_leather", "robe_herbalist", "vest_ranger"],
      accessories: ["amulet_vitality", "ring_warrior", "crystal_arcane"],
      requiredFlag: "verde:trade_route_partial",
    },
    city: {
      label: "Ciudad de Verdalia",
      weapons: ["spear_guardian", "robe_arcane_w", "bow_verdant"],
      armors: ["armor_iron", "robe_arcane", "cloak_shadow"],
      accessories: ["escudo_portatil", "brazal_arcano", "corazon_leon"],
      requiredFlag: "verde:city_services_open",
    },
  },
  fria: {
    camp: {
      label: "Campamento Boreal",
      weapons: ["axe_frost", "wand_sapling", "knife_bramble"],
      armors: ["armor_pelt", "robe_sprout", "vest_scout"],
      accessories: ["anillo_fuerza", "capa_resistencia", "amuleto_vida"],
    },
    town: {
      label: "Pueblo Glacial",
      weapons: ["sword_explorer", "staff_hazel", "bow_hawthorn"],
      armors: ["armor_leather", "robe_herbalist", "vest_ranger"],
      accessories: ["amulet_vitality", "ring_warrior", "crystal_arcane"],
    },
    city: {
      label: "Ciudadela Helada",
      weapons: ["spear_glacier", "robe_arcane_w", "daggers_twin"],
      armors: ["armor_frost", "robe_arcane", "cloak_shadow"],
      accessories: ["escudo_portatil", "brazal_arcano", "corazon_leon"],
    },
  },
  desierto: {
    camp: {
      label: "Campamento Nómada",
      weapons: ["scimitar_sand", "wand_sapling", "knife_bramble"],
      armors: ["armor_silk", "robe_sprout", "vest_scout"],
      accessories: ["anillo_fuerza", "capa_resistencia", "amuleto_vida"],
    },
    town: {
      label: "Pueblo del Oasis",
      weapons: ["sword_explorer", "staff_hazel", "bow_hawthorn"],
      armors: ["armor_leather", "robe_herbalist", "vest_ranger"],
      accessories: ["amulet_vitality", "ring_warrior", "crystal_arcane"],
    },
    city: {
      label: "Ciudadela del Mercado",
      weapons: ["spear_guardian", "staff_dune", "daggers_twin"],
      armors: ["armor_bronze", "robe_arcane", "cloak_shadow"],
      accessories: ["escudo_portatil", "brazal_arcano", "corazon_leon"],
    },
  },
};

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
