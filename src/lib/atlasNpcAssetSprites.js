// PROYECTO ATLAS — NPC maestros de Región Verde, Región Ártica y Región Árida.
// Conecta variantes narrativas con sprites runtime 72×96 de cuatro direcciones.

export const GREEN_NPC_MASTER_ROOT = "/assets/atlas/npcs/region_verde/maestro_v1/runtime";
export const ARCTIC_NPC_MASTER_ROOT = "/assets/atlas/npcs/region_artica/maestro_v1/runtime";
export const ARID_NPC_MASTER_ROOT = "/assets/atlas/npcs/region_arida/maestro_v1/runtime";

export const GREEN_NPC_ASSET_BY_VARIANT = Object.freeze({
  verde_roland: "capitan_roland",
  bren_smith: "bren",
  verde_elia: "elia",
  verde_cedric: "cedric",
  verde_bryn: "mercader_bryn",
  verde_refuge_keeper: "guardian_refugio",
  verde_kael_villager: "aldeano_kael",
  verde_darian: "darian",

  verde_tomas: "alcalde_tomas",
  verde_aldric: "mercader_aldric",
  verde_oleg: "posadero_oleg",
  verde_orin: "forjador_orin",
  verde_ira: "aldeana_ira",
  verde_inn_traveler: "viajero_inn",
  verde_cartographer: "cartografo",

  verde_royal_captain: "capitan_real",
  verde_senn: "mercader_real_senn",
  verde_senna: "hostelera_senna",
  verde_brun: "herrero_brun",
  verde_rurik: "guardia_rurik",

  verde_dungeon_bren: "bren",
  verde_roland_vigilante: "capitan_roland",
});

export const ARCTIC_NPC_ASSET_BY_VARIANT = Object.freeze({
  fria_boreas: "fria_boreas",
  fria_lyra_cartographer: "fria_lyra_cartographer",
  fria_freya: "fria_freya",
  fria_merchant_camp: "fria_merchant_camp",
  fria_refuge_keeper: "fria_refuge_keeper",
  fria_dvalin: "fria_dvalin",
  fria_shaman: "fria_shaman",
  fria_merchant_glacial: "fria_merchant_glacial",
  fria_helga: "fria_helga",
  fria_astra: "fria_astra",
  fria_queen: "fria_queen",
  fria_lyra_researcher: "fria_lyra_researcher",
  fria_captain: "fria_captain",
  fria_kael_forger: "fria_kael_forger",
  fria_merchant_royal: "fria_merchant_royal",
  fria_hostelera: "fria_hostelera",
  fria_borin: "fria_borin",
  fria_einar: "fria_einar",
});


export const ARID_NPC_ASSET_BY_VARIANT = Object.freeze({
  desierto_sahara_nomad: "nomada_sahara",
  desierto_kael_explorer: "explorador_kael",
  desierto_merchant_camp: "mercader_nomada",
  desierto_oasis_keeper: "guardian_oasis",
  desierto_dara_bedouin: "beduina_dara",

  desierto_oasis_guardian: "guardiana_desierto",
  desierto_aran: "historiador_aran",
  desierto_crystal_artisan: "artesana_cristales",
  desierto_merchant_oasis: "mercader_oasis",
  desierto_posadera: "posadera_sahara",
  desierto_dara_trader: "comerciante_dara",

  desierto_pharaoh: "faraon_solar",
  desierto_solar_priest: "sacerdote_solar",
  desierto_merchant_ancient: "mercader_desierto",
  desierto_hostelera: "anfitriona_ruinas",
  desierto_solar_forger: "herrero_rashid",
});

const VALID_DIRECTIONS = new Set(["down", "up", "left", "right"]);
const PRELOAD_DIRECTIONS = ["down", "up", "left", "right"];
let preloadPromise = null;

function normalizeDirection(direction) {
  return VALID_DIRECTIONS.has(direction) ? direction : "down";
}

export function getNpcAssetProfile(variant) {
  const green = GREEN_NPC_ASSET_BY_VARIANT[variant];
  if (green) return { root: GREEN_NPC_MASTER_ROOT, assetId: green, region: "verde" };
  const arctic = ARCTIC_NPC_ASSET_BY_VARIANT[variant];
  if (arctic) return { root: ARCTIC_NPC_MASTER_ROOT, assetId: arctic, region: "fria" };
  const arid = ARID_NPC_ASSET_BY_VARIANT[variant];
  if (arid) return { root: ARID_NPC_MASTER_ROOT, assetId: arid, region: "desierto" };
  return null;
}

export function getGreenNpcAssetId(variant) {
  return GREEN_NPC_ASSET_BY_VARIANT[variant] || null;
}

export function hasNpcAssetVisual(type, variant) {
  return (type === "npc" || type === "villager") && !!getNpcAssetProfile(variant);
}

export function getNpcAssetPath(variant, direction = "down") {
  const profile = getNpcAssetProfile(variant);
  if (!profile) return null;
  return `${profile.root}/${profile.assetId}/idle_${normalizeDirection(direction)}.webp`;
}

export function getNpcAssetDisplayMetrics(size = 44) {
  const width = Math.max(1, Number(size || 44));
  return {
    width,
    height: Math.round(width * (96 / 72)),
    nativeWidth: 72,
    nativeHeight: 96,
  };
}

export function preloadNpcAssetVisuals() {
  if (preloadPromise || typeof Image === "undefined") return preloadPromise;
  const profiles = [
    ...Object.values(GREEN_NPC_ASSET_BY_VARIANT).map(assetId => ({ root: GREEN_NPC_MASTER_ROOT, assetId })),
    ...Object.values(ARCTIC_NPC_ASSET_BY_VARIANT).map(assetId => ({ root: ARCTIC_NPC_MASTER_ROOT, assetId })),
    ...Object.values(ARID_NPC_ASSET_BY_VARIANT).map(assetId => ({ root: ARID_NPC_MASTER_ROOT, assetId })),
  ];
  const unique = [...new Map(profiles.map(profile => [`${profile.root}|${profile.assetId}`, profile])).values()];
  preloadPromise = Promise.allSettled(unique.flatMap(profile => (
    PRELOAD_DIRECTIONS.map(direction => new Promise(resolve => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = `${profile.root}/${profile.assetId}/idle_${direction}.webp`;
    }))
  )));
  return preloadPromise;
}

export const ATLAS_NPC_ASSET_AUDIT = Object.freeze({
  version: "2.27.0",
  greenNpcCount: 20,
  arcticNpcCount: 18,
  aridNpcCount: 20,
  connectedAridVariantCount: Object.keys(ARID_NPC_ASSET_BY_VARIANT).length,
  expectedDirectionCount: (20 + 18 + 20) * 4,
  proceduralFallbacks: ["verde_vera_hunter"],
  runtimeCanvas: [72, 96],
  greenVariants: GREEN_NPC_ASSET_BY_VARIANT,
  arcticVariants: ARCTIC_NPC_ASSET_BY_VARIANT,
  aridVariants: ARID_NPC_ASSET_BY_VARIANT,
});

export const ATLAS_GREEN_NPC_ASSET_AUDIT = ATLAS_NPC_ASSET_AUDIT;
