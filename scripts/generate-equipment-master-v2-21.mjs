import fs from "node:fs";
import path from "node:path";
import { WEAPONS, ARMORS, HELMETS, statsText } from "@/lib/atlasLoot";
import { ACCESSORIES } from "@/lib/atlasSkills";
import { CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { REGIONAL_SHOP_STOCK, REGIONAL_LOOT_EQUIPMENT, EQUIPMENT_REGION_LEVELS } from "@/lib/atlasRegionalEquipment";

const outDir = path.join(process.cwd(), "docs");
fs.mkdirSync(outDir, { recursive: true });
const regionLabel = { verde: "Región Verde", fria: "Región Ártica", desierto: "Región Árida", global: "Global" };
const stageLabel = { camp: "Campamento", town: "Pueblo", city: "Ciudad", starter: "Inicial", special: "Especial" };
const sourceLabel = { shop: "Tienda", loot: "Loot de mobs", starter: "Inicial", forge: "Forja", boss: "Jefe", special: "Especial", legacy: "Legado" };
const slotLabel = { weapon: "Arma", armor: "Armadura", helmet: "Casco", accessory: "Accesorio", classWeapon: "Arma de clase" };

const availability = new Map();
for (const [region, stages] of Object.entries(REGIONAL_SHOP_STOCK)) {
  for (const [stage, stock] of Object.entries(stages)) {
    for (const [list, kind] of Object.entries({ weapons: "weapon", armors: "armor", helmets: "helmet", accessories: "accessory" })) {
      for (const id of stock[list] || []) availability.set(`${kind}:${id}`, { region, stage, source: "shop" });
    }
  }
}
for (const [region, stages] of Object.entries(REGIONAL_LOOT_EQUIPMENT)) {
  for (const [stage, rarities] of Object.entries(stages)) {
    for (const id of Object.values(rarities).flat()) {
      const kind = WEAPONS[id] ? "weapon" : ARMORS[id] ? "armor" : HELMETS[id] ? "helmet" : "accessory";
      availability.set(`${kind}:${id}`, { region, stage, source: "loot" });
    }
  }
}

const rows = [];
function pushCatalog(kind, catalog) {
  for (const [id, item] of Object.entries(catalog)) {
    const av = availability.get(`${kind}:${id}`) || {};
    const region = item.region || av.region || "global";
    const stage = item.settlement || av.stage || (id.startsWith("starter_") ? "starter" : "special");
    const source = item.source || av.source || (id.startsWith("starter_") ? "starter" : "legacy");
    rows.push({
      id,
      name: item.name || id,
      slot: slotLabel[kind],
      region: regionLabel[region] || region,
      stage: stageLabel[stage] || stage,
      source: sourceLabel[source] || source,
      level: item.requiredLevel || (EQUIPMENT_REGION_LEVELS[region]?.[stage] ?? 1),
      rarity: item.rarity || "Sin rareza",
      price: item.price ?? item.sell ?? 0,
      class: item.recommendedClass || "Todas",
      stats: statsText(item),
      effect: item.passive?.desc || item.desc || "",
    });
  }
}
pushCatalog("weapon", WEAPONS);
pushCatalog("armor", ARMORS);
pushCatalog("helmet", HELMETS);
pushCatalog("accessory", ACCESSORIES);
for (const [id, item] of Object.entries(CLASS_WEAPONS)) {
  rows.push({ id, name: item.name, slot: slotLabel.classWeapon, region: "Global", stage: item.relic ? "Especial" : "Forja", source: item.relic ? "Reliquia" : "Forja", level: item.requiredLevel || 1, rarity: item.rarity || "Sin rareza", price: item.sell || 0, class: item.class || "Según clase", stats: statsText(item), effect: `${item.ability?.name || ""}${item.ability?.desc ? `: ${item.ability.desc}` : ""}` });
}

const regionOrder = { "Región Verde": 0, "Región Ártica": 1, "Región Árida": 2, Global: 3 };
const stageOrder = { Inicial: 0, Campamento: 1, Pueblo: 2, Ciudad: 3, Forja: 4, Especial: 5 };
rows.sort((a, b) => (regionOrder[a.region] ?? 9) - (regionOrder[b.region] ?? 9) || (stageOrder[a.stage] ?? 9) - (stageOrder[b.stage] ?? 9) || a.level - b.level || a.slot.localeCompare(b.slot, "es") || a.name.localeCompare(b.name, "es"));

const headers = ["ID", "Nombre", "Espacio", "Región", "Etapa", "Origen", "Nivel requerido", "Rareza", "Precio base", "Clase recomendada", "Estadísticas", "Efecto / descripción"];
const values = row => [row.id, row.name, row.slot, row.region, row.stage, row.source, row.level, row.rarity, row.price, row.class, row.stats, row.effect];
const csvEscape = v => `"${String(v ?? "").replaceAll('"', '""')}"`;
const csv = [headers, ...rows.map(values)].map(r => r.map(csvEscape).join(",")).join("\n") + "\n";
fs.writeFileSync(path.join(outDir, "ATLAS_EQUIPAMIENTO_MAESTRO_V2_21.csv"), csv, "utf8");

const grouped = new Map();
for (const row of rows) {
  const key = `${row.region} · ${row.stage}`;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(row);
}
let md = `# Proyecto Atlas · Equipamiento maestro V2.21\n\n`;
md += `Catálogo generado desde el código. Incluye equipo comercial, loot de mobs, cascos, accesorios, armas de clase y piezas especiales.\n\n`;
md += `## Reglas estructurales\n\n- Inicio: Arma, Armadura y Accesorio I.\n- Jefe de Región Verde: desbloquea Casco.\n- Jefe de Región Ártica: desbloquea Accesorio II.\n- Tiendas: inventarios propios para Campamento, Pueblo y Ciudad.\n- Loot: objetos independientes del inventario comercial.\n\n`;
md += `## Resumen\n\n| Categoría | Cantidad |\n|---|---:|\n`;
for (const slot of [...new Set(rows.map(r => r.slot))]) md += `| ${slot} | ${rows.filter(r => r.slot === slot).length} |\n`;
md += `| **Total** | **${rows.length}** |\n\n`;
for (const [group, list] of grouped) {
  md += `## ${group}\n\n| Nombre | Espacio | Origen | Nv. | Rareza | Precio | Clase | Estadísticas |\n|---|---|---|---:|---|---:|---|---|\n`;
  for (const row of list) md += `| ${row.name.replaceAll("|", "/")} | ${row.slot} | ${row.source} | ${row.level} | ${row.rarity} | ${row.price} | ${row.class} | ${(row.stats || "—").replaceAll("|", "/")} |\n`;
  md += "\n";
}
fs.writeFileSync(path.join(outDir, "ATLAS_EQUIPAMIENTO_MAESTRO_V2_21.md"), md, "utf8");
console.log(`✓ Catálogo maestro generado: ${rows.length} registros`);
