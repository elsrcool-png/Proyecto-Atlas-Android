// PROYECTO ATLAS — NPCs y servicios de los asentamientos (campamento/pueblo/ciudad).
// Integrado con el Documento Maestro: NPCs nombrados por región, con identidad y presentación.
import { CAMPAIGN_NPCS } from "@/lib/atlasCampaign";

export const REST_COST = { campamento: 5, pueblo: 12, ciudad: 25 };
export const SHOP_TIER = { campamento: "camp", pueblo: "town", ciudad: "city" };

// ─── LAYOUT POR REGIÓN ──────────────────────────────────────
// Cada región coloca solo los NPCs que necesita, evitando genéricos.
const NPC_LAYOUT = {
  verde: {
    campamento: [
      { role: "main", dx: -50, dy: -80 },
      { role: "merchant", dx: 60, dy: -80 },
      { role: "inn", dx: -110, dy: 20 },
      { role: "explorer", dx: 60, dy: 100 },
      { role: "smith", dx: -80, dy: 130 },
      { role: "herbalist", dx: 110, dy: 20 },
      { role: "flavor", dx: 110, dy: 60 },
      { role: "survivor", dx: 15, dy: 145 },
    ],
    pueblo: [
      { role: "main", dx: -100, dy: -80 },
      { role: "merchant", dx: 100, dy: -80 },
      { role: "inn", dx: -10, dy: 40 },
      { role: "smith", dx: 15, dy: -120 },
      { role: "explorer", dx: -110, dy: 60 },
      { role: "flavor1", dx: -40, dy: 120 },
      { role: "flavor2", dx: 50, dy: 120 },
      { role: "cartographer", dx: 115, dy: 55 },
    ],
    ciudad: [
      { role: "main", dx: 0, dy: 15 },
      { role: "merchant", dx: 80, dy: 50 },
      { role: "inn", dx: -80, dy: 50 },
      { role: "smith", dx: -150, dy: 40 },
      { role: "flavor", dx: -90, dy: 130 },
    ],
  },
  fria: {
    campamento: [
      { role: "main", dx: -50, dy: -80 },
      { role: "merchant", dx: 60, dy: -80 },
      { role: "inn", dx: -110, dy: 20 },
      { role: "cartographer", dx: 60, dy: 100 },
      { role: "hunter", dx: -80, dy: 130 },
      { role: "flavor", dx: 110, dy: 60 },
    ],
    pueblo: [
      { role: "main", dx: -100, dy: -80 },
      { role: "merchant", dx: 100, dy: -80 },
      { role: "inn", dx: -10, dy: 40 },
      { role: "flavor", dx: -40, dy: 120 },
    ],
    ciudad: [
      { role: "main", dx: 0, dy: 15 },
      { role: "merchant", dx: 80, dy: 50 },
      { role: "inn", dx: -80, dy: 50 },
      { role: "smith", dx: -150, dy: 40 },
      { role: "researcher", dx: 150, dy: 40 },
      { role: "captain", dx: -40, dy: 130 },
      { role: "forger", dx: 50, dy: 130 },
    ],
  },
  desierto: {
    campamento: [
      { role: "main", dx: -50, dy: -80 },
      { role: "merchant", dx: 60, dy: -80 },
      { role: "inn", dx: -110, dy: 20 },
      { role: "explorer", dx: 60, dy: 100 },
      { role: "flavor", dx: 110, dy: 60 },
    ],
    pueblo: [
      { role: "main", dx: -100, dy: -80 },
      { role: "merchant", dx: 100, dy: -80 },
      { role: "inn", dx: -10, dy: 40 },
      { role: "historian", dx: -110, dy: 60 },
      { role: "artisan", dx: 110, dy: 60 },
      { role: "flavor", dx: -40, dy: 120 },
    ],
    ciudad: [
      { role: "main", dx: 0, dy: 15 },
      { role: "merchant", dx: 80, dy: 50 },
      { role: "inn", dx: -80, dy: 50 },
      { role: "smith", dx: -150, dy: 40 },
      { role: "priest", dx: 50, dy: 130 },
    ],
  },
};

// ─── PRESENTACIONES POR NPC ─────────────────────────────────
// Cada NPC importante tiene una breve descripción de quién es y qué función cumple.
const NPC_PRESENTATIONS = {
  // Verde
  "verde_campamento_main": "Capitán del Campamento. Coordina las patrullas y protege a los habitantes del bosque.",
  "verde_campamento_smith": "Herrero del Campamento. Forja armas y armaduras con los escasos recursos del bosque.",
  "verde_campamento_herbalist": "Herbolaria del Campamento. Prepara remedios con las plantas del bosque cercano.",
  "verde_campamento_explorer": "Explorador veterano. Conoce cada sendero del bosque como la palma de su mano.",
  "verde_campamento_merchant": "Mercader del Campamento. Vende provisiones básicas para aventureros.",
  "verde_campamento_inn": "Custodio del refugio. Mantiene el fuego encendido para quienes buscan descanso.",
  "verde_campamento_flavor": "Habitante del Campamento. Sobrevive día a día junto a los guardias.",
  "verde_campamento_survivor": "Comerciante rescatado de la caravana. Conoce las señales dejadas por los Vigilantes del Sendero.",
  "verde_pueblo_main": "Alcalde del Pueblo. Cree que la comida mantiene unido al reino más que las espadas.",
  "verde_pueblo_merchant": "Mercader del Pueblo. Comercia provisiones medianas y equipo mejorado.",
  "verde_pueblo_inn": "Posadero del Pueblo. Ofrece descanso que cura cuerpo y mente.",
  "verde_pueblo_smith": "Forjador del Pueblo. Repara, mejora y fabrica equipo intermedio, pero no puede restaurar reliquias.",
  "verde_pueblo_explorer": "Explorador veterano. Viaja entre asentamientos siguiendo rastros antiguos.",
  "verde_pueblo_flavor1": "Habitante del Pueblo. Preocupada por las desapariciones recientes.",
  "verde_pueblo_flavor2": "Viajero que recorre las regiones. Trae noticias de tierras lejanas.",
  "verde_pueblo_cartographer": "Anciano cartógrafo. Conserva mapas anteriores al reino y reconoce los símbolos de los Guardianes.",
  "verde_ciudad_main": "Comandante de la Ciudadela. Recibe órdenes del reino que tardan en llegar.",
  "verde_ciudad_merchant": "Mercader Real. Vende el mejor equipo de la región.",
  "verde_ciudad_inn": "Hostelera de la Ciudadela. Ofrece alojamiento a guardias y aventureros.",
  "verde_ciudad_smith": "Herrero Real. Forja acero para los guardias de la ciudadela.",
  "verde_ciudad_flavor": "Guardia de la Ciudadela. Patrulla las murallas día y noche.",
  // Ártica
  "fria_campamento_main": "Líder del Campamento Boreal. Vigila el bosque congelado y sus peligros.",
  "fria_campamento_cartographer": "Cartógrafa del Campamento. Estudia los mapas antiguos de rutas perdidas.",
  "fria_campamento_hunter": "Cazadora del Campamento. Conoce las bestias del hielo mejor que nadie.",
  "fria_campamento_merchant": "Mercader del Campamento Boreal. Vende provisiones para el frío.",
  "fria_campamento_inn": "Custodio del refugio boreal. Mantiene el fuego vivo contra el hielo.",
  "fria_campamento_flavor": "Montañista experimentado. Ha escalado picos que otros ni nombran.",
  "fria_pueblo_main": "Chamán del Pueblo Glacial. Guardián de antiguas tradiciones bajo el hielo.",
  "fria_pueblo_merchant": "Mercader del Pueblo Glacial. Comercia pieles y provisiones.",
  "fria_pueblo_inn": "Posadera del Pueblo. Ofrece calor y descanso en la tormenta.",
  "fria_pueblo_flavor": "Pescadora del hielo. Extrae peces de aguas heladas con paciencia.",
  "fria_ciudad_main": "Reina de la Ciudadela. Gobierna con sabiduría sobre el hielo eterno.",
  "fria_ciudad_researcher": "Investigadora de la Ciudadela. Estudia los cristales y su energía.",
  "fria_ciudad_captain": "Capitán de la Guardia. Defiende la Ciudadela de las criaturas del hielo.",
  "fria_ciudad_forger": "Forjador de la Ciudadela. Trabaja con minerales antiguos del hielo.",
  "fria_ciudad_merchant": "Mercader Real. Vende equipo superior de la Ciudadela.",
  "fria_ciudad_inn": "Hostelera de la Ciudadela. Ofrece reposo a los guardias.",
  "fria_ciudad_smith": "Herrero de la Ciudadela. Forja armas resistentes al frío.",
  // Árida
  "desierto_campamento_main": "Líder del Campamento Nómada. Guía a su pueblo por las dunas.",
  "desierto_campamento_explorer": "Explorador del desierto. Sigue caminos que solo el sol revela.",
  "desierto_campamento_merchant": "Mercader del Campamento. Vende provisiones para el desierto.",
  "desierto_campamento_inn": "Custodio del oasis. Protege el agua que da vida en el desierto.",
  "desierto_campamento_flavor": "Beduino del desierto. Conoce cada duna y cada estrella.",
  "desierto_pueblo_main": "Guardiana del Pueblo Oasis. Protege el agua que mantiene viva a su gente.",
  "desierto_pueblo_historian": "Historiador del Oasis. Estudia las ruinas enterradas bajo la arena.",
  "desierto_pueblo_artisan": "Artesana del Oasis. Trabaja cristales antiguos con técnicas perdidas.",
  "desierto_pueblo_merchant": "Mercader del Pueblo. Comercia especias y provisiones.",
  "desierto_pueblo_inn": "Posadera del Oasis. Ofrece sombra y descanso.",
  "desierto_pueblo_flavor": "Comerciante del oasis. Conoce los secretos del desierto.",
  "desierto_ciudad_main": "Gobernante de la Ciudad Antigua. Decidió quedarse para proteger el conocimiento.",
  "desierto_ciudad_priest": "Sacerdote del Sol. Guardián del Templo Solar y sus secretos.",
  "desierto_ciudad_merchant": "Mercader de la Ciudad Antigua. Vende reliquias y provisiones raras.",
  "desierto_ciudad_inn": "Hostelera de la Ciudad Antigua. Ofrece descanso entre las ruinas.",
  "desierto_ciudad_smith": "Forjador de la Ciudad Antigua. Trabaja con metal y energía solar.",
};

function resolveNpc(regionId, sector, roleEntry) {
  const role = roleEntry.role;
  const regionNpcs = CAMPAIGN_NPCS[regionId] || CAMPAIGN_NPCS.verde;
  const sectorNpcs = regionNpcs[sector] || {};
  const campaignNpc = sectorNpcs[role];
  const id = `${sector}_${role}`;
  const presentationKey = `${regionId}_${sector}_${role}`;
  const shop = role === "merchant" ? (sector === "campamento" ? "camp" : sector === "pueblo" ? "town" : "city") : undefined;
  const rest = role === "inn" ? REST_COST[sector] : undefined;
  return {
    id,
    role,
    roleLabel: campaignNpc?.roleLabel || roleEntry.roleLabel || role,
    name: campaignNpc?.name || role,
    icon: campaignNpc?.icon || "shield",
    sprite: campaignNpc?.sprite || { type: "villager", variant: "civilian" },
    shop, rest,
    smithTier: role === "smith" ? (sector === "ciudad" ? "city" : sector === "pueblo" ? "town" : "camp") : undefined,
    dx: roleEntry.dx, dy: roleEntry.dy,
    sector,
    dialogues: campaignNpc?.dialogues || {},
    presentation: NPC_PRESENTATIONS[presentationKey] || "",
  };
}

function getNpcsForRegion(regionId) {
  const out = {};
  const layout = NPC_LAYOUT[regionId] || NPC_LAYOUT.verde;
  for (const sector of ["campamento", "pueblo", "ciudad"]) {
    out[sector] = (layout[sector] || []).map(e => resolveNpc(regionId, sector, e));
  }
  return out;
}

const NPCS_CACHE = {};
function getRegionNpcs(regionId) {
  if (!NPCS_CACHE[regionId]) NPCS_CACHE[regionId] = getNpcsForRegion(regionId);
  return NPCS_CACHE[regionId];
}

export const FLAVOR_LINES = {
  campamento_flavor: ["Estas tiendas resisten viento y bestias. Buen refugio antes de adentrarte.", "Compra provisiones al mercader: son básicas pero baratas.", "El bosque acecha. No te alejes de noche."],
  pueblo_flavor1: ["Las desapariciones nos inquietan. Habla con el alcalde.", "El mercader tiene pociones medianas y mejor equipo.", "Bienvenido al pueblo, forastero."],
  pueblo_flavor2: ["Viajo entre regiones. El desierto es brutal sin equipo.", "Dicen que el jefe aún guarda las ruinas del norte.", "Descansa en la posada: cura cuerpo y mente, pero cuesta."],
  ciudad_smith: ["Forjo acero para los guardias de la ciudadela.", "El mercader real vende el mejor equipo de la región.", "La amenaza crece: afila tu acero antes del jefe."],
  ciudad_flavor: ["Mis joyas adornan a los nobles de la ciudad.", "El mercado es variado: pociones grandes y objetos especiales.", "Que la fortuna te acompañe, aventurero."],
  campamento_explorer: ["Las rutas ya no son seguras. Ve preparado.", "Si encuentras algo extraño en el bosque, vuelve a contarlo.", "Los animales huyen de algo. No sé qué es."],
  pueblo_historian: ["Estudio el pasado. Y el pasado empieza a repetirse.", "Estos símbolos son anteriores al reino. Mucho anteriores.", "La historia no se pierde. Solo se olvida dónde está enterrada."],
  ciudad_priest: ["El sol lo ve todo. Incluso lo que ocultamos.", "El Templo Solar guarda secretos que ningún rey debería conocer.", "La fe sin conocimiento es ciega. El conocimiento sin fe es arrogancia."],
  pueblo_explorer: ["Estos senderos guardan memoria. Ruinas, símbolos, algo antiguo.", "No confíes en los caminos que no figuraban en tu mapa.", "El bosque cambia cuando nadie mira."],
  fria_campamento_flavor: ["El frío no perdona al novato. Abrígate bien.", "Los cristales brillan de noche. No sé si es hermoso o aterrador.", "Cazadora Freya sabe más de bestias que yo de nieve."],
  fria_pueblo_flavor: ["Pesco bajo el hielo. Es lento, pero alimenta.", "El chamán dice que el hielo recuerda. Yo le creo.", "Las tormentas duran días aquí. Acostúmbrate."],
  desierto_campamento_flavor: ["El desierto toma algo de cada viajero. Agua, sombra, a veces más.", "Conozco cada duna por su nombre. Sí, tienen nombre.", "La noche aquí es tan hermosa como peligrosa."],
  desierto_pueblo_flavor: ["El oasis no es natural. Los antiguos lo crearon, ¿sabías?", "Comercio especias del sur. Tienen aromas que despiertan recuerdos.", "El agua es vida aquí. No la desperdicies."],
};

export function getSettlementNpcs(sector, region, center) {
  const regionNpcs = getRegionNpcs(region.id);
  const defs = regionNpcs[sector] || [];
  return defs.map((d) => {
    const x = center.x + (d.dx || 0);
    const y = center.y + (d.dy || 0);
    return { ...d, sector, x, y };
  });
}

export function getNpcNameByRole(sector, role, region) {
  const regionNpcs = getRegionNpcs(region?.id || "verde");
  const d = (regionNpcs[sector] || []).find(n => n.role === role);
  return d?.name || role;
}

export function randomFlavorLine(npcId) {
  const lines = FLAVOR_LINES[npcId] || ["Hola, forastero."];
  return lines[Math.floor(Math.random() * lines.length)];
}