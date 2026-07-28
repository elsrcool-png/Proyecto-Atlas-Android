// PROYECTO ATLAS — Sistema Global de Loot (capa independiente del motor)
import { randInt } from "@/lib/atlasWorld";
import { WEAPONS, ARMORS, HELMETS, MATERIALS, rollLootD10, consumableName } from "@/lib/atlasLoot";
import { ACCESSORIES } from "@/lib/atlasSkills";
import { REGIONAL_LOOT_EQUIPMENT, equipmentStageForProgress } from "@/lib/atlasRegionalEquipment";

export const REGION_LOOT = {
  verde: {
    label: "Bosque",
    flavor: "del bosque",
    commonMaterials: ["madera", "hierbas", "cuero", "piedra"],
    rareMaterials: ["cristal_magico", "nucleo_monstruo"],
    consumables: ["hp_s", "hp_m", "en_g_s", "en_m_s", "en_p_s", "antidote"],
    specialConsumables: ["return_scroll", "antidote"],
    equipment: {
      "Común": ["sword_rusty", "armor_adventurer", "anillo_fuerza", "capa_resistencia", "amuleto_vida"],
      "Poco común": ["sword_explorer", "axe_oak", "staff_apprentice", "armor_leather", "amulet_vitality", "ring_warrior", "crystal_arcane"],
      "Raro": ["bow_forest", "robe_arcane_w", "spear_guardian", "daggers_twin", "talisman_wolf", "boots_explorer", "medallion_assassin"],
      "Épico": ["staff_sage", "armor_guardian", "compass_ancient", "pendant_merchant"],
    },
  },
  fria: {
    label: "Montaña/Tundra",
    flavor: "de la montaña",
    commonMaterials: ["piedra", "huesos", "madera", "cuero"],
    rareMaterials: ["acero_antiguo", "escama", "runa"],
    consumables: ["hp_s", "hp_m", "en_g_s", "en_m_s", "en_p_s"],
    specialConsumables: ["return_scroll"],
    equipment: {
      "Común": ["sword_rusty", "armor_adventurer", "anillo_fuerza", "capa_resistencia", "amuleto_vida"],
      "Poco común": ["staff_apprentice", "armor_leather", "amulet_vitality", "ring_warrior", "crystal_arcane"],
      "Raro": ["hammer_dwarven", "armor_iron", "robe_arcane", "cloak_shadow", "spear_guardian", "talisman_wolf", "boots_explorer"],
      "Épico": ["hammer_dwarven", "armor_guardian", "armor_runic", "compass_ancient"],
    },
  },
  desierto: {
    label: "Desierto/Ruinas",
    flavor: "del desierto",
    commonMaterials: ["piedra", "huesos", "hierbas"],
    rareMaterials: ["runa", "acero_antiguo", "cristal_magico"],
    consumables: ["hp_s", "hp_m", "en_g_s", "en_m_s", "en_p_s"],
    specialConsumables: ["return_scroll", "antidote"],
    equipment: {
      "Común": ["sword_rusty", "armor_adventurer", "anillo_fuerza", "amuleto_vida"],
      "Poco común": ["sword_explorer", "staff_apprentice", "armor_leather", "crystal_arcane", "amulet_vitality"],
      "Raro": ["robe_arcane", "armor_runic", "cloak_shadow", "daggers_twin", "talisman_wolf", "medallion_assassin", "boots_explorer"],
      "Épico": ["staff_sage", "armor_runic", "compass_ancient", "pendant_merchant"],
    },
  },
};

export const ENEMY_MODIFIERS = {
  Bestia: { favor: "material_common", shiftChance: 0.30 },
  Humanoide: { favor: "equipment", shiftChance: 0.28 },
  "No Muerto": { favor: "material_rare", shiftChance: 0.30 },
  default: { favor: null, shiftChance: 0 },
};

const BOSS_MODIFIER = { favor: "equipment", shiftChance: 0.45, minRoll: 7 };

const ROLL_CATEGORY = {
  1: "none",
  2: "recovery",
  3: "material_common",
  4: "material_common",
  5: "consumable",
  6: "consumable_special",
  7: "material_rare",
  8: "equipment",
  9: "equipment_rare",
  10: "destiny",
};

function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

function equipKindOf(id) {
  if (WEAPONS[id]) return "weapon";
  if (ARMORS[id]) return "armor";
  if (HELMETS[id]) return "helmet";
  return "accessory";
}
function equipNameOf(kind, id) {
  if (kind === "weapon") return WEAPONS[id].name;
  if (kind === "armor") return ARMORS[id].name;
  if (kind === "helmet") return HELMETS[id].name;
  return ACCESSORIES[id].name;
}

const RARITY_ORDER = ["Común", "Poco común", "Raro", "Épico"];
function rarityForEquipment(roll, regionId, stage) {
  const stageRarity = {
    verde: { camp: "Común", town: roll === 9 ? "Raro" : "Poco común", city: roll === 9 ? "Épico" : "Raro" },
    fria: { camp: "Poco común", town: "Raro", city: "Épico" },
    desierto: { camp: "Raro", town: "Épico", city: "Épico" },
  };
  return stageRarity[regionId]?.[stage] || "Común";
}

function pickEquipment(regionId, stage, rarity, equipmentUnlocks = {}) {
  const stages = REGIONAL_LOOT_EQUIPMENT[regionId] || REGIONAL_LOOT_EQUIPMENT.verde;
  const table = stages[stage] || stages.camp;
  const start = Math.max(0, RARITY_ORDER.indexOf(rarity));
  const order = [rarity, ...RARITY_ORDER.slice(0, start).reverse(), ...RARITY_ORDER.slice(start + 1)];
  for (const r of order) {
    const rawPool = table[r] || [];
    const pool = rawPool.filter(id => equipmentUnlocks.helmet || !HELMETS[id]);
    if (pool.length) {
      const id = pick(pool);
      const kind = equipKindOf(id);
      return { kind, id, name: equipNameOf(kind, id), rarity: r };
    }
  }
  return null;
}

function shiftToFavor(favor) {
  switch (favor) {
    case "material_common": return Math.random() < 0.5 ? 3 : 4;
    case "material_rare": return 7;
    case "equipment": return Math.random() < 0.5 ? 8 : 9;
    default: return null;
  }
}

const DESTINY_EVENTS = [
  {
    id: "rare_chest", name: "Cofre Raro",
    desc: (ctx) => `Entre la maleza ${REGION_LOOT[ctx.regionId].flavor} aparece un cofre raro cubierto de runas.`,
    rewards: (ctx) => {
      const g = 18 + randInt(0, 22) + ctx.blockIndex * 6;
      const mid = pick(REGION_LOOT[ctx.regionId].rareMaterials);
      return [
        { kind: "loot", loot: { type: "gold", amount: g }, text: `+${g} oro` },
        { kind: "loot", loot: { type: "material", id: mid, name: MATERIALS[mid].name, rarity: "Raro", amount: 1 }, text: MATERIALS[mid].name },
      ];
    },
  },
  {
    id: "mystery_merchant", name: "Comerciante Misterioso",
    desc: (ctx) => `Un comerciante velado surge ${REGION_LOOT[ctx.regionId].flavor} y te obsequia mercancía antes de desaparecer.`,
    rewards: (ctx) => {
      const cid = "hp_m";
      const g = 6 + randInt(0, 12) + ctx.blockIndex * 3;
      return [
        { kind: "loot", loot: { type: "consumable", id: cid, name: consumableName(cid, ctx.playerClass) }, text: `${consumableName(cid, ctx.playerClass)} (obsequio)` },
        { kind: "loot", loot: { type: "gold", amount: g }, text: `+${g} oro` },
      ];
    },
  },
  {
    id: "hidden_cave", name: "Cueva Oculta",
    desc: (ctx) => `Se abre una cueva oculta ${REGION_LOOT[ctx.regionId].flavor}; dentro, materiales raros brillan en la penumbra.`,
    rewards: (ctx) => {
      const out = [];
      const n = 2;
      for (let i = 0; i < n; i++) {
        const mid = pick(REGION_LOOT[ctx.regionId].rareMaterials);
        out.push({ kind: "loot", loot: { type: "material", id: mid, name: MATERIALS[mid].name, rarity: "Raro", amount: 1 }, text: MATERIALS[mid].name });
      }
      return out;
    },
  },
  {
    id: "elite_enemy", name: "Enemigo Élite",
    desc: (ctx) => `Un enemigo élite merodea ${REGION_LOOT[ctx.regionId].flavor}; tras una escaramuza, recoges su botín.`,
    rewards: (ctx) => {
      const g = 28 + randInt(0, 24) + ctx.blockIndex * 8 + Math.round(ctx.threat * 2);
      const out = [{ kind: "loot", loot: { type: "gold", amount: g }, text: `+${g} oro (botín de élite)` }];
      if (Math.random() < 0.5) {
        const mid = pick(REGION_LOOT[ctx.regionId].rareMaterials);
        out.push({ kind: "loot", loot: { type: "material", id: mid, name: MATERIALS[mid].name, rarity: "Raro", amount: 1 }, text: MATERIALS[mid].name });
      }
      return out;
    },
  },
  {
    id: "ancient_shrine", name: "Santuario Antiguo",
    desc: (ctx) => `Un santuario olvidado ${REGION_LOOT[ctx.regionId].flavor} late con energía y restaura todo tu vigor.`,
    rewards: () => [
      { kind: "heal_full", text: "Vida y energía restauradas" },
    ],
  },
  {
    id: "secret_mission", name: "Misión Secreta",
    desc: (ctx) => `Recibes el encargo de una misión secreta ${REGION_LOOT[ctx.regionId].flavor}; la recompensa es generosa.`,
    rewards: (ctx) => {
      const g = 22 + randInt(0, 18) + ctx.blockIndex * 6;
      return [
        { kind: "xp", amount: 12 + ctx.regionIndex * 6 + ctx.blockIndex * 4, text: "Experiencia" },
        { kind: "loot", loot: { type: "gold", amount: g }, text: `+${g} oro` },
      ];
    },
  },
];

function rollGlobalDestiny(ctx) {
  const weights = DESTINY_EVENTS.map((ev, i) => {
    let w = 1;
    if (ev.id === "elite_enemy" && ctx.threat >= 7) w += 1;
    if (ev.id === "rare_chest" && ctx.regionIndex >= 1) w += 1;
    if (ev.id === "secret_mission" && ctx.regionProgress < 0.5) w += 1;
    if (ev.id === "ancient_shrine" && ctx.threat >= 6) w += 0.5;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let idx = 0;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) { idx = i; break; } }
  const ev = DESTINY_EVENTS[idx];
  return { id: ev.id, name: ev.name, desc: ev.desc(ctx), rewards: ev.rewards(ctx) };
}

export function resolveGlobalLoot(ctx) {
  const table = REGION_LOOT[ctx.regionId] || REGION_LOOT.verde;
  const mod = ctx.isBoss ? BOSS_MODIFIER : (ENEMY_MODIFIERS[ctx.enemyType] || ENEMY_MODIFIERS.default);

  let roll = rollLootD10();
  const equipmentStage = ctx.settlementStage || equipmentStageForProgress(ctx.regionProgress || 0);
  if (ctx.isBoss && roll < BOSS_MODIFIER.minRoll) roll = BOSS_MODIFIER.minRoll;
  if (ctx.isElite && roll < 7) roll = Math.random() < 0.55 ? 7 : 8;
  if (roll < 10 && mod.favor && Math.random() < mod.shiftChance) {
    const shifted = shiftToFavor(mod.favor);
    if (shifted) roll = shifted;
  }

  const zoneScale = 1 + ctx.blockIndex * 0.15;
  const diffScale = ctx.difficultyMul || 1;

  switch (roll) {
    case 1:
      return { roll, type: "none", text: "Sin recompensa." };
    case 2: {
      const amount = Math.round((3 + randInt(0, 4)) * zoneScale);
      return { roll, type: "hp", amount, text: `Recuperas ${amount} de vida.` };
    }
    case 3: {
      const id = pick(table.commonMaterials);
      return { roll, type: "material", id, name: MATERIALS[id].name, rarity: "Común", amount: 1, text: `Obtienes un material común ${table.flavor}: ${MATERIALS[id].name}.` };
    }
    case 4: {
      if (Math.random() < 0.4) {
        const amount = Math.round((5 + randInt(0, 6)) * zoneScale * diffScale);
        return { roll, type: "gold", amount, text: `Obtienes ${amount} de oro.` };
      }
      const id = pick(table.commonMaterials);
      return { roll, type: "material", id, name: MATERIALS[id].name, rarity: "Común", amount: 1, text: `Obtienes un material común ${table.flavor}: ${MATERIALS[id].name}.` };
    }
    case 5: {
      const id = pick(table.consumables);
      return { roll, type: "consumable", id, name: consumableName(id, ctx.playerClass), text: `Obtienes un consumible: ${consumableName(id, ctx.playerClass)}.` };
    }
    case 6: {
      const id = pick(table.specialConsumables);
      return { roll, type: "consumable", id, name: consumableName(id, ctx.playerClass), rarity: "Poco común", text: `Obtienes un consumible especial: ${consumableName(id, ctx.playerClass)}.` };
    }
    case 7: {
      const id = pick(table.rareMaterials);
      return { roll, type: "material", id, name: MATERIALS[id].name, rarity: "Raro", amount: 1, text: `Obtienes un material raro ${table.flavor}: ${MATERIALS[id].name}.` };
    }
    case 8: {
      const rarity = rarityForEquipment(8, ctx.regionId, equipmentStage);
      const eq = pickEquipment(ctx.regionId, equipmentStage, rarity, ctx.equipmentUnlocks);
      if (!eq) return { roll, type: "gold", amount: Math.round(10 * zoneScale), text: "Obtienes oro." };
      return { roll, type: "equipment", kind: eq.kind, id: eq.id, name: eq.name, rarity: eq.rarity, text: `Obtienes equipo ${table.flavor}: ${eq.name}.` };
    }
    case 9: {
      const rarity = rarityForEquipment(9, ctx.regionId, equipmentStage);
      const eq = pickEquipment(ctx.regionId, equipmentStage, rarity, ctx.equipmentUnlocks);
      if (!eq) return { roll, type: "gold", amount: Math.round(15 * zoneScale), text: "Obtienes oro." };
      return { roll, type: "equipment", kind: eq.kind, id: eq.id, name: eq.name, rarity: eq.rarity, text: `Obtienes equipo raro: ${eq.name}.` };
    }
    case 10: {
      const destiny = rollGlobalDestiny(ctx);
      return { roll, type: "destiny", event: { id: destiny.id, name: destiny.name, desc: destiny.desc }, rewards: destiny.rewards, text: "¡El Destino de Atlas se activa!" };
    }
    default:
      return { roll, type: "none", text: "Sin recompensa." };
  }
}