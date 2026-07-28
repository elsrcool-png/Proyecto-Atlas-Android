import { WEAPONS, ARMORS, HELMETS } from "@/lib/atlasLoot";
import { ACCESSORIES } from "@/lib/atlasSkills";
import {
  EQUIPMENT_REGION_LEVELS,
  REGIONAL_SHOP_STOCK,
  REGIONAL_LOOT_EQUIPMENT,
  equipmentUnlocksFromBosses,
} from "@/lib/atlasRegionalEquipment";

const CATALOGS = { weapon: WEAPONS, armor: ARMORS, helmet: HELMETS, accessory: ACCESSORIES };
const errors = [];
const shopIds = new Set();
const lootIds = new Set();
const stages = ["camp", "town", "city"];
const classes = ["Guerrero", "Mago", "Pícaro"];
const slotLists = { weapons: "weapon", armors: "armor", helmets: "helmet", accessories: "accessory" };

function fail(message) { errors.push(message); }
function itemById(id) {
  for (const [kind, catalog] of Object.entries(CATALOGS)) if (catalog[id]) return { kind, item: catalog[id] };
  return null;
}

function equipmentPower(item = {}) {
  const stats = item.stats || item.bonus || {};
  return (
    ((stats.attack || 0) + (stats.atk || 0) + (stats.arcane || 0) + (stats.precision || 0)) * 3
    + ((stats.physDef || 0) + (stats.magDef || 0) + (stats.defense || 0)) * 2
    + (stats.maxHp || 0) * 0.35
    + ((stats.maxMp || 0) + (item.maxMp || 0)) * 0.4
    + ((stats.crit || 0) + (item.crit || 0)) * 30
    + (stats.hit || 0) * 20
    + ((stats.speed || 0) + (item.speed || 0)) * 1.5
    + (item.passive ? 1.5 : 0)
  );
}

let previousCap = 0;
for (const regionId of ["verde", "fria", "desierto"]) {
  const levels = EQUIPMENT_REGION_LEVELS[regionId];
  if (!levels) { fail(`Región sin tabla de niveles: ${regionId}`); continue; }
  if (!(levels.start <= levels.camp && levels.camp < levels.town && levels.town < levels.city && levels.city <= levels.cap)) {
    fail(`Escalado de niveles inválido en ${regionId}`);
  }
  if (levels.start <= previousCap) fail(`La región ${regionId} no comienza después del límite anterior`);
  previousCap = levels.cap;
}

for (const [regionId, regionStock] of Object.entries(REGIONAL_SHOP_STOCK)) {
  const levels = EQUIPMENT_REGION_LEVELS[regionId];
  if (!levels) fail(`Región sin tabla de niveles: ${regionId}`);
  for (const stage of stages) {
    const stock = regionStock[stage];
    if (!stock) { fail(`Falta tienda ${regionId}/${stage}`); continue; }
    for (const [listName, expectedKind] of Object.entries(slotLists)) {
      const ids = stock[listName] || [];
      const expectedCount = listName === "helmets" && regionId === "verde" ? 0 : 3;
      if (ids.length !== expectedCount) fail(`${regionId}/${stage}/${listName}: se esperaban ${expectedCount}, hay ${ids.length}`);
      if (["weapons", "armors", "helmets"].includes(listName) && ids.length) {
        const presentClasses = ids.map(id => itemById(id)?.item?.recommendedClass).sort();
        if (JSON.stringify(presentClasses) !== JSON.stringify([...classes].sort())) {
          fail(`${regionId}/${stage}/${listName}: debe haber una pieza por clase`);
        }
      }
      for (const id of ids) {
        if (shopIds.has(id)) fail(`Objeto repetido en tiendas: ${id}`);
        shopIds.add(id);
        const found = itemById(id);
        if (!found) { fail(`Objeto de tienda inexistente: ${id}`); continue; }
        if (found.kind !== expectedKind) fail(`${id}: figura como ${expectedKind}, pero pertenece a ${found.kind}`);
        const { item } = found;
        if (item.source !== "shop") fail(`${id}: source debe ser shop, es ${item.source}`);
        if (item.region !== regionId) fail(`${id}: región ${item.region}, esperaba ${regionId}`);
        if (item.settlement !== stage) fail(`${id}: asentamiento ${item.settlement}, esperaba ${stage}`);
        if ((item.requiredLevel || 1) !== levels?.[stage]) fail(`${id}: nivel ${item.requiredLevel}, esperaba ${levels?.[stage]}`);
        if (!(item.price > 0)) fail(`${id}: el objeto comercial debe tener precio positivo`);
      }
    }
  }
}

for (const [regionId, regionStock] of Object.entries(REGIONAL_SHOP_STOCK)) {
  for (const listName of Object.keys(slotLists)) {
    if (listName === "helmets" && regionId === "verde") continue;
    const averages = stages.map(stage => {
      const ids = regionStock[stage]?.[listName] || [];
      return ids.reduce((sum, id) => sum + equipmentPower(itemById(id)?.item), 0) / Math.max(1, ids.length);
    });
    if (!(averages[0] < averages[1] && averages[1] < averages[2])) {
      fail(`${regionId}/${listName}: la potencia comercial no aumenta Campamento → Pueblo → Ciudad`);
    }
  }
}

for (const [regionId, regionLoot] of Object.entries(REGIONAL_LOOT_EQUIPMENT)) {
  for (const stage of stages) {
    const rarityTables = regionLoot[stage] || {};
    const ids = Object.values(rarityTables).flat();
    if (!ids.length) fail(`Tabla de loot vacía: ${regionId}/${stage}`);
    for (const [rarity, rarityIds] of Object.entries(rarityTables)) {
      for (const id of rarityIds) {
      if (lootIds.has(id)) fail(`Objeto repetido en tablas de loot: ${id}`);
      lootIds.add(id);
      if (shopIds.has(id)) fail(`Objeto compartido entre tienda y loot: ${id}`);
      const found = itemById(id);
      if (!found) { fail(`Objeto de loot inexistente: ${id}`); continue; }
      const { kind, item } = found;
      if (item.source !== "loot") fail(`${id}: source debe ser loot, es ${item.source}`);
      if (item.region !== regionId) fail(`${id}: región de loot ${item.region}, esperaba ${regionId}`);
      if (item.settlement !== stage) fail(`${id}: tramo de loot ${item.settlement}, esperaba ${stage}`);
      if (kind === "helmet" && regionId === "verde") fail(`Casco disponible antes de vencer Región Verde: ${id}`);
      const levels = EQUIPMENT_REGION_LEVELS[regionId];
      const minLevel = levels?.[stage] || 1;
      const maxLevel = stage === "camp" ? (levels?.town || minLevel) - 1 : stage === "town" ? (levels?.city || minLevel) - 1 : levels?.cap || minLevel;
      if ((item.requiredLevel || 1) < minLevel || (item.requiredLevel || 1) > maxLevel) fail(`${id}: nivel de loot ${item.requiredLevel}, rango esperado ${minLevel}-${maxLevel}`);
      if (item.rarity !== rarity) fail(`${id}: rareza ${item.rarity}, pero está en tabla ${rarity}`);
      if ((item.price || 0) !== 0) fail(`${id}: el loot exclusivo no debe tener precio de compra`);
      }
    }
  }
}

for (const [kind, catalog] of Object.entries(CATALOGS)) {
  for (const [id, item] of Object.entries(catalog)) {
    if (item.source === "shop" && !shopIds.has(id)) fail(`${kind} de tienda huérfano: ${id}`);
    if (item.source === "loot" && !lootIds.has(id)) fail(`${kind} de loot huérfano: ${id}`);
  }
}

const noBoss = equipmentUnlocksFromBosses([]);
const greenBoss = equipmentUnlocksFromBosses(["guardian_verde"]);
const arcticBoss = equipmentUnlocksFromBosses(["guardian_verde", "aurel_portador"]);
if (noBoss.helmet || noBoss.accessory2) fail("Los espacios comienzan desbloqueados");
if (!greenBoss.helmet || greenBoss.accessory2) fail("El jefe Verde debe desbloquear solo Casco");
if (!arcticBoss.helmet || !arcticBoss.accessory2) fail("El jefe Ártico debe desbloquear Accesorio II conservando Casco");

if (errors.length) {
  console.error("VALIDACIÓN DE EQUIPAMIENTO V2.21 FALLIDA");
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}

console.log(`✓ ${shopIds.size} objetos comerciales únicos`);
console.log(`✓ ${lootIds.size} objetos de botín independientes`);
console.log(`✓ ${Object.keys(HELMETS).length} cascos catalogados`);
console.log("✓ Niveles regionales encadenados: Verde 1-8, Ártica 9-16, Árida 17-25");
console.log("✓ Potencia comercial creciente en Campamento, Pueblo y Ciudad");
console.log("✓ Armas, armaduras y cascos comerciales cubren las tres clases");
console.log("✓ Desbloqueos: Casco tras jefe Verde, Accesorio II tras jefe Ártico");
console.log("VALIDACIÓN DE EQUIPAMIENTO REGIONAL V2.21 CORRECTA");
