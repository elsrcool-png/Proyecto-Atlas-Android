// PROYECTO ATLAS — Registro canónico de los 27 sectores regionales.
// Fuente visual: mapas 3x3 del Reino Verde, Reino Ártico y Reino Árido.

const sector = (id, name, type, options = {}) => ({
  id,
  col: id.charCodeAt(0) - 65,
  row: Number(id[1]) - 1,
  name,
  type,
  safe: false,
  settlementRole: null,
  dungeon: null,
  miniBoss: false,
  boss: false,
  ...options,
});

export const REGION_SECTOR_LAYOUTS = {
  verde: {
    regionName: "Reino Verde",
    referenceMap: "/assets/atlas/maps/reino-verde.png",
    startSector: "A2",
    initialUnlocked: ["A2"],
    storyOrder: ["A2", "A1", "B1", "C1", "C2", "B2", "A3", "B3", "C3"],
    bossMissionId: "v15",
    bossGateMissionId: "v14",
    sectors: {
      A1: sector("A1", "Laguna de los Susurros", "natural", { subtitle: "Laguna, puentes y rastros de corrupción", features: ["laguna", "puentes", "santuario"] }),
      B1: sector("B1", "Ruinas del Vigía", "ruins", { subtitle: "Primera dungeon táctica", dungeon: "short", features: ["ruinas", "mecanismos", "cofre_antiguo"] }),
      C1: sector("C1", "Guarida del Cazador Marchito", "mini_boss", { subtitle: "Refugio forestal y mini jefe", dungeon: "short", miniBoss: true, features: ["refugio", "mini_jefe"] }),
      A2: sector("A2", "Campamento del Umbral", "camp", { subtitle: "Inicio de la campaña verde", safe: true, settlementRole: "campamento", features: ["campamento", "santuario"] }),
      B2: sector("B2", "Ciudad de Verdalia", "city", { subtitle: "Autoridad, archivo y forja regional", safe: true, settlementRole: "ciudad", features: ["ciudad", "forja", "archivo"] }),
      C2: sector("C2", "Pueblo de Robledal", "town", { subtitle: "Centro agrícola y comercial", safe: true, settlementRole: "pueblo", features: ["pueblo", "caravana"] }),
      A3: sector("A3", "Bosque de las Raíces", "advanced_natural", { subtitle: "Frente activo de la corrupción", features: ["bosque_denso", "patrulla"] }),
      B3: sector("B3", "Paso del Río Antiguo", "long_dungeon", { subtitle: "Río, puente y corredor previo al Guardián", dungeon: "long", features: ["rio", "puente", "nodos_raiz"] }),
      C3: sector("C3", "Santuario del Corazón Verde", "boss", { subtitle: "Cámara del Guardián Verde y futura base de aventureros", boss: true, features: ["fortaleza", "jefe", "dungeon", "aventureros_postregion"] }),
    },
    missionUnlocks: {},
  },

  fria: {
    regionName: "Reino Ártico",
    referenceMap: "/assets/atlas/maps/reino-artico.png",
    startSector: "A1",
    initialUnlocked: ["A1", "B1"],
    storyOrder: ["A1", "B1", "C1", "C2", "B2", "A2", "A3", "B3", "C3"],
    bossMissionId: "f15",
    bossGateMissionId: "f14",
    sectors: {
      A1: sector("A1", "Bahía Helada y Campamento Sepultado", "arrival", { subtitle: "Llegada, naufragio y campamento original bajo la nieve", features: ["bahia", "barco", "campamento_sepultado"] }),
      B1: sector("B1", "Campamento Provisorio Boreal", "camp", { subtitle: "Base precaria de supervivientes", safe: true, settlementRole: "campamento", features: ["campamento", "santuario"] }),
      C1: sector("C1", "Bosque de la Estación Perdida", "short_dungeon", { subtitle: "Sendero de nieve hacia el último mensajero", dungeon: "short", features: ["bosque", "estacion", "mensajero"] }),
      A2: sector("A2", "Ruinas de los Portadores", "ruins", { subtitle: "Arco antiguo y memorias congeladas", features: ["arco", "ruinas", "santuario"] }),
      B2: sector("B2", "Ciudadela Helada", "city", { subtitle: "Autoridad, cristales y forja de Kael", safe: true, settlementRole: "ciudad", features: ["ciudadela", "cristal", "forja"] }),
      C2: sector("C2", "Grieta de los Cristales", "long_dungeon", { subtitle: "Puente, lago y ruinas sumergidas", dungeon: "long", features: ["grieta", "puente", "lago"] }),
      A3: sector("A3", "Puesto Avanzado Boreal", "outpost", { subtitle: "Centro de expedición y defensa", safe: true, features: ["puesto", "torre"] }),
      B3: sector("B3", "Pueblo Pesquero Glacial", "town", { subtitle: "Pueblo, Nivalis y rutas profundas", safe: true, settlementRole: "pueblo", features: ["pueblo", "pesca", "nivalis"] }),
      C3: sector("C3", "Núcleo Glacial", "boss", { subtitle: "Prisión de Aurel, Último Portador", boss: true, features: ["fortaleza", "jefe"] }),
    },
    missionUnlocks: {},
  },

  desierto: {
    regionName: "Reino Árido",
    referenceMap: "/assets/atlas/maps/reino-arido.png",
    startSector: "A1",
    initialUnlocked: ["A1", "B1"],
    storyOrder: ["A1", "B1", "C1", "C2", "B2", "A2", "A3", "B3", "C3"],
    bossMissionId: "d15",
    bossGateMissionId: "d14",
    sectors: {
      A1: sector("A1", "Oasis Escondido y Entrada de las Tormentas", "arrival", { subtitle: "Llegada, oasis y acceso al refugio", safe: true, features: ["oasis", "tormenta"] }),
      B1: sector("B1", "Campamento Subterráneo Nómada", "camp", { subtitle: "Campamento protegido bajo la arena", safe: true, settlementRole: "campamento", features: ["campamento", "entrada_subterranea", "santuario"] }),
      C1: sector("C1", "Santuario de los Roquedales", "natural", { subtitle: "Rocas, cactus y santuario expuesto", features: ["rocas", "santuario"] }),
      A2: sector("A2", "Cañón Rojo", "traversal", { subtitle: "Puente colgante, pinturas y cuevas", features: ["canon", "puente", "cuevas"] }),
      B2: sector("B2", "Ciudadela del Mercado", "city", { subtitle: "Comercio mayor y forja solar", safe: true, settlementRole: "ciudad", features: ["ciudadela", "mercado", "forja"] }),
      C2: sector("C2", "Arco de las Dunas", "ruins", { subtitle: "Ruinas, tormentas y rutas variables", features: ["arco", "dunas", "ruinas"] }),
      A3: sector("A3", "Puesto de Avanzada", "outpost", { subtitle: "Torre de vigilancia y expedición", safe: true, features: ["torre", "puesto"] }),
      B3: sector("B3", "Pueblo del Oasis", "town", { subtitle: "Viviendas, agua y paneles cortaviento", safe: true, settlementRole: "pueblo", features: ["pueblo", "oasis", "paneles"] }),
      C3: sector("C3", "Templo Solar", "boss", { subtitle: "Cámara de Amon, Portador del Sol Eterno", boss: true, features: ["templo", "jefe"] }),
    },
    missionUnlocks: {
      d1: ["C1"], d5: ["C2"], d7: ["B2"], d8: ["A2"], d9: ["A3"], d10: ["B3"], d14: ["C3"],
    },
  },
};

export const SECTOR_TYPE_LABELS = {
  arrival: "Llegada",
  natural: "Zona natural",
  advanced_natural: "Zona natural avanzada",
  ruins: "Ruinas",
  traversal: "Travesía",
  camp: "Campamento",
  town: "Pueblo",
  city: "Ciudad",
  outpost: "Puesto avanzado",
  short_dungeon: "Dungeon corta",
  long_dungeon: "Dungeon larga",
  mini_boss: "Mini jefe",
  boss: "Jefe regional",
};

export function sectorIdFromCoords(col, row) {
  if (col < 0 || col > 2 || row < 0 || row > 2) return null;
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

export function coordsFromSectorId(id) {
  if (!/^[ABC][123]$/.test(id || "")) return null;
  return { col: id.charCodeAt(0) - 65, row: Number(id[1]) - 1 };
}

export function sectorKey(regionId, sectorId) {
  return `${regionId}:${sectorId}`;
}

export function getRegionLayoutStrict(regionId) {
  return REGION_SECTOR_LAYOUTS[regionId] || null;
}

// Compatibilidad con la base previa: los tres IDs jugables siempre existen.
// El fallback Verde se conserva solo para llamadas antiguas; el motor nodal
// debe usar getRegionLayoutStrict() o getRegionGraph().
export function getRegionLayout(regionId) {
  return getRegionLayoutStrict(regionId) || REGION_SECTOR_LAYOUTS.verde;
}

export function hasLegacyRegionLayout(regionId) {
  return Boolean(getRegionLayoutStrict(regionId));
}

export function getSectorDef(regionId, colOrId, row) {
  const id = typeof colOrId === "string" ? colOrId : sectorIdFromCoords(colOrId, row);
  return getRegionLayout(regionId).sectors[id] || null;
}

export function getStartingCoords(regionId) {
  return coordsFromSectorId(getRegionLayout(regionId).startSector);
}

export function getInitialUnlockedSectorKeys(regionId) {
  return getRegionLayout(regionId).initialUnlocked.map(id => sectorKey(regionId, id));
}

export function getMissionUnlocks(regionId, missionId) {
  return getRegionLayout(regionId).missionUnlocks[missionId] || [];
}

export function isSectorUnlocked(unlockedSectors, regionId, sectorId) {
  return unlockedSectors?.has(sectorKey(regionId, sectorId)) || false;
}

export function getNeighborSectorId(col, row, dir) {
  const delta = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[dir];
  if (!delta) return null;
  return sectorIdFromCoords(col + delta[0], row + delta[1]);
}

export function getBlockedReason(regionId, sectorId) {
  const def = getSectorDef(regionId, sectorId);
  if (!def) return "No existe un camino en esa dirección.";
  if (def.boss) return `El acceso a ${def.name} permanece sellado. Completa la preparación regional.`;
  if (def.dungeon) return `La entrada a ${def.name} aún no es segura. Sigue la misión principal.`;
  return `El camino hacia ${def.name} todavía está bloqueado por la campaña.`;
}

export function getBossGateMissionId(regionId) {
  return getRegionLayout(regionId).bossGateMissionId;
}

export function getBossMissionId(regionId) {
  return getRegionLayout(regionId).bossMissionId;
}