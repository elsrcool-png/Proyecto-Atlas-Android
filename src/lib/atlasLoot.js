// PROYECTO ATLAS — Sistema de Loot y Equipamiento V1
import { randInt } from "@/lib/atlasWorld";
import { getSettlementStock, isStockUnlocked } from "@/lib/atlasEconomyV3";
import { HELMETS, applyWeaponCatalog, applyArmorCatalog } from "@/lib/atlasRegionalEquipment";

export { HELMETS };

export const RARITIES = {
  "Común": { name: "Común", color: "#9ca3af", sell: 8, sellable: true },
  "Poco común": { name: "Poco común", color: "#4ade80", sell: 18, sellable: true },
  "Raro": { name: "Raro", color: "#60a5fa", sell: 40, sellable: true },
  "Épico": { name: "Épico", color: "#c084fc", sell: 90, sellable: true },
  "Legendario": { name: "Legendario", color: "#fbbf24", sell: 0, sellable: false },
};

export function sellValueOf(rarity) {
  const r = RARITIES[rarity];
  return r ? r.sell : 8;
}
export function isSellable(rarity) {
  const r = RARITIES[rarity];
  return r ? r.sellable : true;
}

export const REGION_IDS = ["verde", "fria", "desierto"];
export function regionIdOf(regionIndex) { return REGION_IDS[regionIndex] || REGION_IDS[0]; }

const RECENT = { equip: [], destiny: [] };

export const WEAPONS = {
  sword_rusty: { name: "Espada Oxidada", rarity: "Común", offType: "atk", stats: { attack: 1 }, passive: null, price: 12, desc: "Vieja pero funcional." },
  sword_explorer: { name: "Espada del Explorador", rarity: "Poco común", offType: "atk", stats: { attack: 2 }, passive: { desc: "+5% EXP", type: "xp_bonus", value: 0.05 }, price: 35, desc: "Afinada para viajeros." },
  axe_oak: { name: "Hacha de Roble", rarity: "Poco común", offType: "atk", stats: { attack: 3, speed: -1 }, passive: null, price: 40, desc: "Pesada pero potente." },
  staff_apprentice: { name: "Bastón del Aprendiz", rarity: "Poco común", offType: "arcane", stats: { attack: 1, maxMp: 2 }, passive: null, price: 35, desc: "Para magos novatos." },
  spear_guardian: { name: "Lanza del Guardián", rarity: "Raro", offType: "atk", stats: { attack: 3 }, passive: null, price: 70, desc: "Larga y fiable." },
  daggers_twin: { name: "Dagas Gemelas", rarity: "Raro", offType: "precision", stats: { attack: 1, crit: 0.10 }, passive: null, price: 75, desc: "Golpes rápidos." },
  bow_forest: { name: "Arco del Bosque", rarity: "Raro", offType: "precision", stats: { attack: 2, hit: 0.10 }, passive: null, price: 70, desc: "Mayor precisión." },
  robe_arcane_w: { name: "Báculo del Bosque", rarity: "Raro", offType: "arcane", stats: { attack: 1, maxMp: 3 }, passive: null, price: 70, desc: "Canaliza magia natural." },
  staff_sage: { name: "Bastón del Sabio", rarity: "Épico", offType: "arcane", stats: { attack: 2, maxMp: 4 }, passive: { desc: "Reduce el coste de magia en 1", type: "mp_cost_reduce", value: 1 }, price: 130, desc: "Sabiduría arcana." },
  hammer_dwarven: { name: "Martillo Enano", rarity: "Épico", offType: "atk", stats: { attack: 3 }, passive: { desc: "Ignora parte de la defensa", type: "armor_pen", value: 2 }, price: 120, desc: "Forjado en piedra." },
  sword_atlas: { name: "Espada de Atlas", rarity: "Legendario", offType: "atk", stats: { attack: 5 }, passive: { desc: "Pasiva única (próximamente)", type: "legendary_atlas", value: 0 }, price: 0, sellable: false, desc: "Leyenda por escribir." },
  sword_thorn: { name: "Espada de Espinas", rarity: "Común", offType: "atk", stats: { attack: 1 }, region: "verde", price: 14, desc: "Hojas afiladas como espinas del bosque." },
  bow_verdant: { name: "Arco del Bosque Ancestral", rarity: "Raro", offType: "precision", stats: { attack: 2, maxMp: 2 }, region: "verde", price: 72, desc: "Tallado del bosque ancestral." },
  axe_frost: { name: "Hacha de Escarcha", rarity: "Común", offType: "atk", stats: { attack: 1 }, region: "fria", price: 14, desc: "Hacha de escarcha resistente." },
  spear_glacier: { name: "Lanza del Glaciar", rarity: "Raro", offType: "atk", stats: { attack: 2, crit: 0.05 }, region: "fria", price: 72, desc: "Tallada del glaciar eterno." },
  scimitar_sand: { name: "Cimitarra del Desierto", rarity: "Común", offType: "atk", stats: { attack: 1 }, region: "desierto", price: 14, desc: "Cimitarra curva de las dunas." },
  staff_dune: { name: "Bastón de las Dunas", rarity: "Raro", offType: "arcane", stats: { attack: 1, maxMp: 3 }, region: "desierto", price: 72, desc: "Bastón tallado de las dunas." },
  wand_sapling: { name: "Vara de Retoño", rarity: "Común", offType: "arcane", stats: { attack: 1, maxMp: 1 }, region: "verde", price: 14, desc: "Una rama viva preparada para canalizar magia menor." },
  knife_bramble: { name: "Cuchillos de Zarza", rarity: "Común", offType: "precision", stats: { attack: 1, crit: 0.03 }, region: "verde", price: 14, desc: "Filos cortos usados por exploradores del campamento." },
  staff_hazel: { name: "Bastón de Avellano", rarity: "Poco común", offType: "arcane", stats: { attack: 1, maxMp: 2 }, region: "verde", price: 38, desc: "Madera flexible elegida por los estudiosos de Robledal." },
  bow_hawthorn: { name: "Arco de Espino", rarity: "Poco común", offType: "precision", stats: { attack: 2, hit: 0.05 }, region: "verde", price: 40, desc: "Arco ligero para patrullar caminos estrechos." },
};
applyWeaponCatalog(WEAPONS);

export const ARMORS = {
  armor_adventurer: { name: "Ropa de Aventurero", rarity: "Común", stats: { maxHp: 5, physDef: 1 }, passive: null, price: 12, desc: "Tela recia." },
  armor_leather: { name: "Armadura de Cuero", rarity: "Poco común", stats: { physDef: 2 }, passive: null, price: 35, desc: "Cuero curtido." },
  armor_iron: { name: "Armadura de Hierro", rarity: "Raro", stats: { physDef: 4, magDef: 1, speed: -1 }, passive: null, price: 70, desc: "Resistente pero pesada." },
  robe_arcane: { name: "Túnica Arcana", rarity: "Raro", stats: { magDef: 3, maxMp: 8 }, passive: null, price: 75, desc: "Tejida con maná." },
  cloak_shadow: { name: "Capa Sombría", rarity: "Raro", stats: { physDef: 1, magDef: 2, maxMp: 8 }, passive: null, price: 75, desc: "Ropa reforzada para pícaros sigilosos." },
  armor_guardian: { name: "Coraza del Guardián", rarity: "Épico", stats: { physDef: 4, magDef: 2, maxHp: 10 }, passive: null, price: 130, desc: "Protección total." },
  armor_runic: { name: "Armadura Rúnica", rarity: "Épico", stats: { physDef: 2, magDef: 4 }, passive: { desc: "Reduce daño mágico", type: "magic_resist", value: 0.15 }, price: 140, desc: "Runas protectoras." },
  armor_dragon: { name: "Armadura del Dragón", rarity: "Legendario", stats: { physDef: 6, magDef: 4, maxHp: 20 }, passive: { desc: "Pasiva especial (próximamente)", type: "legendary_dragon", value: 0 }, price: 0, sellable: false, desc: "Escamas de dragón." },
  armor_leaf: { name: "Coraza de Hojas", rarity: "Común", stats: { physDef: 1, maxHp: 3 }, region: "verde", price: 14, desc: "Hojas entretejidas del bosque." },
  cloak_moss: { name: "Capa de Musgo", rarity: "Raro", stats: { physDef: 1, magDef: 2, maxHp: 5 }, region: "verde", price: 75, desc: "Musgo del bosque profundo." },
  armor_pelt: { name: "Piel del Norte", rarity: "Común", stats: { physDef: 1, maxHp: 4 }, region: "fria", price: 14, desc: "Piel abrigada del norte." },
  armor_frost: { name: "Coraza de Escarcha", rarity: "Raro", stats: { physDef: 3, magDef: 1 }, region: "fria", price: 75, desc: "Escarcha endurecida." },
  armor_silk: { name: "Seda del Oasis", rarity: "Común", stats: { magDef: 1, maxHp: 3 }, region: "desierto", price: 14, desc: "Seda ligera del oasis." },
  armor_bronze: { name: "Bronce del Desierto", rarity: "Raro", stats: { physDef: 3, maxHp: 5 }, region: "desierto", price: 75, desc: "Bronce forjado en el desierto." },
  starter_armor_cuero: { name: "Cuero de Recluta", rarity: "Común", stats: { physDef: 1 }, passive: null, price: 0, starter: true, desc: "Cuero curtido básico de recluta." },
  starter_tunica_aprendiz: { name: "Túnica de Aprendiz", rarity: "Común", stats: { magDef: 1 }, passive: null, price: 0, starter: true, desc: "Túnica sencilla del aprendiz." },
  starter_ropaje_ligero: { name: "Ropaje Ligero", rarity: "Común", stats: { physDef: 1, magDef: 1 }, passive: null, price: 0, starter: true, desc: "Ropaje ligero para moverse sin ruido." },
  robe_sprout: { name: "Túnica de Retoños", rarity: "Común", stats: { magDef: 1, maxMp: 2 }, region: "verde", price: 14, desc: "Tejido sencillo tratado por la herbolaria del campamento." },
  vest_scout: { name: "Chaleco del Explorador", rarity: "Común", stats: { physDef: 1, speed: 1 }, region: "verde", price: 14, desc: "Protección ligera para moverse entre raíces." },
  robe_herbalist: { name: "Túnica de la Herbolaria", rarity: "Poco común", stats: { magDef: 2, maxMp: 4 }, region: "verde", price: 38, desc: "Tela impregnada con resinas protectoras de Robledal." },
  vest_ranger: { name: "Coraza del Vigilante", rarity: "Poco común", stats: { physDef: 2, magDef: 1, maxHp: 3 }, region: "verde", price: 42, desc: "Equipo flexible de los Vigilantes del Sendero." },
};
applyArmorCatalog(ARMORS);

export const MATERIALS = {
  cuero: { name: "Cuero", rarity: "Común", price: 3 },
  madera: { name: "Madera", rarity: "Común", price: 2 },
  piedra: { name: "Piedra", rarity: "Común", price: 2 },
  hierbas: { name: "Hierbas", rarity: "Común", price: 3 },
  huesos: { name: "Huesos", rarity: "Común", price: 3 },
  cristal_magico: { name: "Cristal Mágico", rarity: "Raro", price: 12 },
  runa: { name: "Runa", rarity: "Raro", price: 15 },
  nucleo_monstruo: { name: "Núcleo de Monstruo", rarity: "Raro", price: 18 },
  escama: { name: "Escama", rarity: "Raro", price: 14 },
  acero_antiguo: { name: "Acero Antiguo", rarity: "Raro", price: 20 },
  hierro: { name: "Hierro", rarity: "Común", price: 4 },
  madera_dura: { name: "Madera Dura", rarity: "Común", price: 4 },
  colmillos: { name: "Colmillos", rarity: "Poco común", price: 6 },
  acero: { name: "Acero", rarity: "Poco común", price: 8 },
  cristal_arcano: { name: "Cristal Arcano", rarity: "Raro", price: 14 },
  escamas: { name: "Escamas", rarity: "Poco común", price: 7 },
  seda: { name: "Seda", rarity: "Poco común", price: 7 },
  titanio: { name: "Titanio", rarity: "Raro", price: 18 },
  obsidiana: { name: "Obsidiana", rarity: "Raro", price: 16 },
  fragmentos_atlas: { name: "Fragmentos de Atlas", rarity: "Épico", price: 30 },
  nucleo_arcano: { name: "Núcleo Arcano", rarity: "Épico", price: 35 },
};
export const COMMON_MATERIALS = ["cuero", "madera", "piedra", "hierbas", "huesos"];
export const RARE_MATERIALS = ["cristal_magico", "runa", "nucleo_monstruo", "escama", "acero_antiguo"];

export const REGION_MATERIALS = {
  verde: ["hierro", "cuero", "madera_dura", "colmillos"],
  fria: ["acero", "cristal_arcano", "escamas", "seda"],
  desierto: ["titanio", "obsidiana", "fragmentos_atlas", "nucleo_arcano"],
};
export function rollRegionMaterial(regionIndex) {
  const ids = ["verde", "fria", "desierto"];
  const pool = REGION_MATERIALS[ids[regionIndex]] || REGION_MATERIALS.verde;
  return pool[randInt(0, pool.length - 1)];
}

export const NEW_CONSUMABLES = {
  antidote: { name: "Antídoto", rarity: "Común", price: 8, desc: "Purga veneno. (+3 HP mientras el veneno no exista)." },
  return_scroll: { name: "Pergamino de Regreso", rarity: "Poco común", price: 20, desc: "Amenaza -2 y +5 HP (te sientes más cerca de casa)." },
};
export function isLootConsumable(id) {
  return id === "antidote" || id === "return_scroll";
}

const ENERGY_SMALL = { Guerrero: "en_g_s", Mago: "en_m_s", "Pícaro": "en_p_s" };
function lootConsumablePool(cls) {
  return ["hp_s", "hp_m", ENERGY_SMALL[cls] || "en_g_s", "antidote", "return_scroll"];
}
export function consumableName(id, cls) {
  if (NEW_CONSUMABLES[id]) return NEW_CONSUMABLES[id].name;
  const ENERGY_NAMES = { en_g_s: "Poción pequeña de adrenalina", en_m_s: "Poción pequeña de magia", en_p_s: "Poción pequeña de concentración" };
  if (ENERGY_NAMES[id]) return ENERGY_NAMES[id];
  if (id === "hp_s") return "Poción pequeña de vida";
  if (id === "hp_m") return "Poción mediana de vida";
  return id;
}

export function rollLootD10() { return randInt(1, 10); }

function pickEquip(rarity, ACCESSORIES, regionId, player = null) {
  const weaps = Object.keys(WEAPONS).filter(id => WEAPONS[id].rarity === rarity && WEAPONS[id].source !== "shop").map(id => ({ id, kind: "weapon" }));
  const arms = Object.keys(ARMORS).filter(id => ARMORS[id].rarity === rarity && !ARMORS[id].starter && ARMORS[id].source !== "shop").map(id => ({ id, kind: "armor" }));
  const helmets = player?.equipmentUnlocks?.helmet
    ? Object.keys(HELMETS).filter(id => HELMETS[id].rarity === rarity && HELMETS[id].source !== "shop").map(id => ({ id, kind: "helmet" }))
    : [];
  const accs = Object.keys(ACCESSORIES).filter(id => ACCESSORIES[id].rarity === rarity && ACCESSORIES[id].source !== "shop").map(id => ({ id, kind: "accessory" }));
  const all = [...weaps, ...arms, ...helmets, ...accs];
  if (!all.length) return null;
  const refOf = e => e.kind === "weapon" ? WEAPONS[e.id] : e.kind === "armor" ? ARMORS[e.id] : e.kind === "helmet" ? HELMETS[e.id] : ACCESSORIES[e.id];
  const local = all.filter(e => { const r = refOf(e).region; return !r || r === regionId; });
  const pool = local.length ? local : all;
  const fresh = pool.filter(e => !RECENT.equip.includes(e.kind + ":" + e.id));
  const src = fresh.length ? fresh : pool;
  const choice = src[randInt(0, src.length - 1)];
  const key = choice.kind + ":" + choice.id;
  RECENT.equip = [...RECENT.equip.filter(k => k !== key), key].slice(-4);
  return choice;
}

function equipName(kind, id, ACCESSORIES) {
  if (kind === "weapon") return WEAPONS[id].name;
  if (kind === "armor") return ARMORS[id].name;
  if (kind === "helmet") return HELMETS[id].name;
  return ACCESSORIES[id].name;
}

export function resolveLoot(roll, player, ACCESSORIES, regionIndex) {
  const regionId = regionIdOf(regionIndex);
  switch (roll) {
    case 1: return { type: "none", text: "No se obtiene recompensa." };
    case 2: return { type: "hp", amount: 4 + randInt(0, 4), text: "Recuperas una pequeña cantidad de vida." };
    case 3: return { type: "energy", amount: 2 + randInt(0, 3), text: "Recuperas una pequeña cantidad de energía." };
    case 4: return { type: "gold", amount: 5 + randInt(0, 8), text: "Obtienes oro." };
    case 5: { const id = COMMON_MATERIALS[randInt(0, COMMON_MATERIALS.length - 1)]; return { type: "material", id, name: MATERIALS[id].name, rarity: "Común", amount: 1, text: "Obtienes un material común." }; }
    case 6: { const id = lootConsumablePool(player.class)[randInt(0, 4)]; return { type: "consumable", id, name: consumableName(id, player.class), text: "Obtienes un consumible." }; }
    case 7: { const id = RARE_MATERIALS[randInt(0, RARE_MATERIALS.length - 1)]; return { type: "material", id, name: MATERIALS[id].name, rarity: "Raro", amount: 1, text: "Obtienes un material raro." }; }
    case 8: { const pk = pickEquip("Común", ACCESSORIES, regionId, player); if (!pk) return { type: "gold", amount: 10, text: "Obtienes oro." }; return { type: "equipment", kind: pk.kind, id: pk.id, name: equipName(pk.kind, pk.id, ACCESSORIES), rarity: "Común", text: "Obtienes un equipo común." }; }
    case 9: { const pk = pickEquip("Raro", ACCESSORIES, regionId, player); if (!pk) return { type: "gold", amount: 15, text: "Obtienes oro." }; return { type: "equipment", kind: pk.kind, id: pk.id, name: equipName(pk.kind, pk.id, ACCESSORIES), rarity: "Raro", text: "Obtienes un equipo raro." }; }
    case 10: return { type: "destiny", text: "¡El Destino de Atlas se activa!" };
    default: return { type: "none", text: "No se obtiene recompensa." };
  }
}

export const DESTINY_EVENTS = [
  { id: "rare_chest", name: "Cofre Raro", desc: "Aparece un cofre raro cargado de botín." },
  { id: "mystery_merchant", name: "Comerciante Misterioso", desc: "Un comerciante velado te obsequia mercancía y algo de oro." },
  { id: "hidden_cave", name: "Cueva Oculta", desc: "Se abre una cueva oculta llena de materiales raros." },
  { id: "elite_enemy", name: "Enemigo Élite", desc: "Un enemigo élite merodea cerca: más peligro, mejor botín." },
  { id: "ancient_shrine", name: "Santuario Antiguo", desc: "Un santuario olvidado restaura todo tu vigor." },
  { id: "secret_mission", name: "Misión Secreta", desc: "Recibes el encargo de una misión secreta: oro y experiencia." },
];
export function rollDestiny() {
  const fresh = DESTINY_EVENTS.filter(e => !RECENT.destiny.includes(e.id));
  const src = fresh.length ? fresh : DESTINY_EVENTS;
  const ev = src[randInt(0, src.length - 1)];
  RECENT.destiny = [...RECENT.destiny.filter(k => k !== ev.id), ev.id].slice(-3);
  return ev;
}

export const SHOP_RARITIES_BY_TIER = {
  camp: ["Común"],
  town: ["Común", "Poco común"],
  city: ["Raro", "Épico"],
};
export function shopEquipmentForTier(tier, ACCESSORIES, regionId = "verde", worldFlags = {}) {
  const stock = getSettlementStock(regionId, tier);
  if (!isStockUnlocked(regionId, tier, worldFlags)) return [];
  const list = [];
  const add = (kind, id, ref) => {
    if (!ref) return;
    list.push({
      id,
      kind,
      name: ref.name,
      rarity: ref.rarity,
      price: ref.price || sellValueOf(ref.rarity) * 3,
      requiredLevel: ref.requiredLevel || 1,
      recommendedClass: ref.recommendedClass || null,
      region: ref.region || regionId,
      settlement: ref.settlement || tier,
      desc: ref.desc,
    });
  };
  for (const id of stock.weapons || []) add("weapon", id, WEAPONS[id]);
  for (const id of stock.armors || []) add("armor", id, ARMORS[id]);
  for (const id of stock.helmets || []) add("helmet", id, HELMETS[id]);
  for (const id of stock.accessories || []) add("accessory", id, ACCESSORIES[id]);
  return list;
}

const OFF_LABELS = { atk: "ATK", arcane: "Poder Arcano", precision: "Precisión" };
export function statsText(item) {
  if (!item) return "—";
  const s = item.stats || item.bonus || {};
  const parts = [];
  if (item.offType && s.attack) parts.push(`+${s.attack} ${OFF_LABELS[item.offType] || "ATK"}`);
  else {
    if (s.atk) parts.push(`+${s.atk} ATK`);
    if (s.arcane) parts.push(`+${s.arcane} Poder Arcano`);
    if (s.precision) parts.push(`+${s.precision} Precisión`);
  }
  if (s.physDef) parts.push(`+${s.physDef} Def. Física`);
  if (s.magDef) parts.push(`+${s.magDef} Def. Mágica`);
  if (s.defense) parts.push(`+${s.defense} DEF`);
  const maxHp = s.maxHp || 0; if (maxHp) parts.push(`+${maxHp} Vida`);
  const maxMp = (s.maxMp || 0) + (item.maxMp || 0); if (maxMp) parts.push(`+${maxMp} Energía`);
  const crit = (s.crit || 0) + (item.crit || 0); if (crit) parts.push(`+${Math.round(crit * 100)}% crít`);
  const speed = (s.speed || 0) + (item.speed || 0); if (speed) parts.push(`${speed > 0 ? "+" : ""}${speed} mov`);
  const hit = s.hit || 0; if (hit) parts.push(`+${Math.round(hit * 100)}% prec`);
  return parts.join(" · ") || "—";
}