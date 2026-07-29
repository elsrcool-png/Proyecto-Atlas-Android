// PROYECTO ATLAS — Cofres comunes, antiguos y legendarios.
import { randInt } from "@/lib/atlasWorld";
import { MATERIALS, REGION_MATERIALS } from "@/lib/atlasLoot";
import { makeWeaponInstance } from "@/lib/atlasWeaponInstances";

export const CHEST_TYPES = {
  common: {
    id: "common",
    name: "Cofre común",
    dice: null,
    description: "Entrega suministros básicos sin ceremonia de dados.",
  },
  ancient: {
    id: "ancient",
    name: "Cofre antiguo",
    dice: "1d20",
    description: "Un sello antiguo responde a una única tirada de d20.",
  },
  legendary: {
    id: "legendary",
    name: "Cofre legendario",
    dice: "3d20",
    description: "Requiere tres sellos regionales. Los tres dados generan una pieza única.",
  },
};

export const REGION_CHEST_SEALS = {
  verde: [
    { id: "sello_verde_hoja", name: "Sello de la Hoja" },
    { id: "sello_verde_raiz", name: "Sello de la Raíz" },
    { id: "sello_verde_savia", name: "Sello de la Savia" },
  ],
  fria: [
    { id: "sello_frio_alba", name: "Sello del Alba" },
    { id: "sello_frio_cristal", name: "Sello del Cristal" },
    { id: "sello_frio_vacio", name: "Sello del Vacío" },
  ],
  desierto: [
    { id: "sello_arido_amanecer", name: "Sello del Amanecer" },
    { id: "sello_arido_mediodia", name: "Sello del Mediodía" },
    { id: "sello_arido_eclipse", name: "Sello del Eclipse" },
  ],
};

const COMMON_MATERIAL_BY_REGION = {
  verde: ["hierro", "cuero", "madera_dura", "hierbas"],
  fria: ["acero", "escamas", "seda", "cristal_arcano"],
  desierto: ["titanio", "obsidiana", "fragmentos_atlas", "nucleo_arcano"],
};

export function resolveCommonChest(regionId = "verde") {
  const pool = COMMON_MATERIAL_BY_REGION[regionId] || COMMON_MATERIAL_BY_REGION.verde;
  const materialId = pool[randInt(0, pool.length - 1)];
  const gold = 6 + randInt(0, 8);
  return {
    kind: "common_bundle",
    chestType: "common",
    gold,
    materials: [{ id: materialId, amount: 1, name: MATERIALS[materialId]?.name || materialId }],
    consumable: Math.random() < 0.45 ? "hp_s" : null,
  };
}

export function resolveAncientChest(regionId, d20, seal) {
  const regionPool = REGION_MATERIALS[regionId] || REGION_MATERIALS.verde;
  const materialId = regionPool[randInt(0, regionPool.length - 1)];
  const tier = d20 >= 18 ? "exceptional" : d20 >= 13 ? "high" : d20 >= 7 ? "medium" : "low";
  const amount = tier === "exceptional" ? 3 : tier === "high" ? 2 : 1;
  const gold = tier === "exceptional" ? 45 : tier === "high" ? 30 : tier === "medium" ? 20 : 12;
  return {
    kind: "ancient_bundle",
    chestType: "ancient",
    d20,
    tier,
    gold,
    materials: [{ id: materialId, amount, name: MATERIALS[materialId]?.name || materialId }],
    seal,
  };
}

export function requiredSealsForRegion(regionId) {
  return REGION_CHEST_SEALS[regionId] || REGION_CHEST_SEALS.verde;
}

export function missingLegendarySeals(player, regionId) {
  const questItems = player?.questItems || {};
  return requiredSealsForRegion(regionId).filter(seal => (questItems[seal.id] || 0) < 1);
}

function legendaryTier(total) {
  if (total === 60) return { id: "perfect", name: "Ancestral perfecto", rarity: "Legendario", attack: 5, maxMp: 4, crit: 0.12 };
  if (total >= 51) return { id: "legendary", name: "Legendario", rarity: "Legendario", attack: 4, maxMp: 3, crit: 0.10 };
  if (total >= 41) return { id: "epic_high", name: "Épico superior", rarity: "Épico", attack: 3, maxMp: 2, crit: 0.08 };
  if (total >= 28) return { id: "epic", name: "Épico", rarity: "Épico", attack: 2, maxMp: 2, crit: 0.05 };
  return { id: "rare", name: "Raro", rarity: "Raro", attack: 1, maxMp: 1, crit: 0.03 };
}

const BASE_BY_CLASS = {
  Guerrero: { verde: "sword_thorn", fria: "axe_frost", desierto: "scimitar_sand", noun: "Hoja" },
  Mago: { verde: "wand_sapling", fria: "wand_sapling", desierto: "staff_dune", noun: "Catalizador" },
  "Pícaro": { verde: "knife_bramble", fria: "knife_bramble", desierto: "daggers_twin", noun: "Filos" },
};

const REGION_EPITHET = {
  verde: "del Corazón Verde",
  fria: "del Núcleo Glacial",
  desierto: "del Sol Sepultado",
};

export function generateLegendaryChestWeapon(player, regionId, diceResult) {
  const total = diceResult.total;
  const tier = legendaryTier(total);
  const clsBase = BASE_BY_CLASS[player?.class] || BASE_BY_CLASS.Guerrero;
  const defId = clsBase[regionId] || clsBase.verde;
  const bonus = {
    attack: tier.attack,
    maxMp: player?.class === "Mago" ? tier.maxMp : Math.max(0, tier.maxMp - 1),
    crit: player?.class === "Pícaro" ? tier.crit : Math.max(0, tier.crit - 0.02),
  };
  const name = `${clsBase.noun} ${REGION_EPITHET[regionId] || REGION_EPITHET.verde}`;
  const instance = makeWeaponInstance(defId, {
    name,
    rarity: tier.rarity,
    quality: tier.name,
    bonus,
    source: "legendary_chest_3d20",
    rollTotal: total,
    rolls: diceResult.rolls.map(r => r.result),
    sellable: false,
  });
  return {
    kind: "legendary_weapon",
    chestType: "legendary",
    diceResult,
    tier,
    instance,
    name,
    baseDefId: defId,
    bonus,
  };
}
