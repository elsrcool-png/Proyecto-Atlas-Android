// PROYECTO ATLAS — Registro estable de regiones v1.
//
// Este archivo desacopla la identidad de una región de su posición en arrays,
// de su composición visual y del nombre histórico usado por versiones previas.
// La composición de mapas de las Regiones 4–10 NO se define aquí.

const region = ({
  id,
  number,
  name,
  aliases = [],
  hand,
  finger,
  ring,
  threatFloor,
  mapMode,
  runtimePlayable = false,
  productionStatus = "planned",
}) => Object.freeze({
  id,
  number,
  name,
  aliases: Object.freeze([...aliases]),
  hand,
  finger,
  ring,
  threatFloor,
  mapMode,
  runtimePlayable,
  productionStatus,
});

export const ATLAS_REGION_REGISTRY = Object.freeze([
  region({ id: "verde", number: 1, name: "Región Verde", aliases: ["green", "reino_verde"], hand: "left", finger: "little", ring: "Anillo de la Raíz", threatFloor: 1, mapMode: "legacy_grid", runtimePlayable: true, productionStatus: "playable" }),
  region({ id: "fria", number: 2, name: "Región Ártica", aliases: ["artica", "ártica", "arctic", "reino_artico"], hand: "left", finger: "ring", ring: "Anillo de la Resistencia", threatFloor: 2, mapMode: "legacy_grid", runtimePlayable: true, productionStatus: "playable" }),
  region({ id: "desierto", number: 3, name: "Región Árida", aliases: ["arida", "árida", "arid", "reino_arido"], hand: "left", finger: "middle", ring: "Anillo del Sol y el Conocimiento", threatFloor: 3, mapMode: "legacy_grid", runtimePlayable: true, productionStatus: "playable" }),
  region({ id: "tempestuosa", number: 4, name: "Región Tempestuosa", aliases: ["mareal"], hand: "left", finger: "index", ring: "Anillo del Pulso", threatFloor: 4, mapMode: "nodal", productionStatus: "preproduction" }),
  region({ id: "ignea", number: 5, name: "Región Ígnea", aliases: ["ígnea", "fractura"], hand: "left", finger: "thumb", ring: "Anillo de la Carga", threatFloor: 5, mapMode: "nodal", productionStatus: "preproduction" }),
  region({ id: "abisal", number: 6, name: "Región Abisal", aliases: ["ruinas"], hand: "right", finger: "thumb", ring: "Anillo de la Memoria", threatFloor: 6, mapMode: "nodal" }),
  region({ id: "celeste", number: 7, name: "Región Celeste", aliases: ["onirica", "onírica"], hand: "right", finger: "index", ring: "Anillo del Equilibrio", threatFloor: 7, mapMode: "nodal" }),
  region({ id: "cristalina", number: 8, name: "Región Cristalina", aliases: ["tempestad"], hand: "right", finger: "middle", ring: "Anillo de la Identidad", threatFloor: 8, mapMode: "nodal" }),
  region({ id: "crepuscular", number: 9, name: "Región Crepuscular", aliases: ["ciclo_roto", "ciclo-roto"], hand: "right", finger: "ring", ring: "Anillo del Tiempo", threatFloor: 9, mapMode: "nodal" }),
  region({ id: "velo", number: 10, name: "Región del Velo", aliases: ["umbral", "region_del_velo"], hand: "right", finger: "little", ring: "Anillo de la Voluntad", threatFloor: 10, mapMode: "nodal" }),
]);

const normalizeToken = (value) => String(value ?? "")
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const BY_ID = new Map();
const BY_NUMBER = new Map();
for (const def of ATLAS_REGION_REGISTRY) {
  BY_NUMBER.set(def.number, def);
  for (const token of [def.id, def.name, ...def.aliases]) BY_ID.set(normalizeToken(token), def);
}

export function normalizeRegionId(value, fallback = null) {
  if (typeof value === "number" && Number.isInteger(value)) return BY_NUMBER.get(value)?.id || fallback;
  const def = BY_ID.get(normalizeToken(value));
  return def?.id || fallback;
}

export function getAtlasRegion(value) {
  if (typeof value === "object" && value?.id) return getAtlasRegion(value.id);
  if (typeof value === "number" && Number.isInteger(value)) return BY_NUMBER.get(value) || null;
  return BY_ID.get(normalizeToken(value)) || null;
}

export function getAtlasRegionByNumber(number) {
  return BY_NUMBER.get(Number(number)) || null;
}

export function getAtlasRegionNumber(value) {
  return getAtlasRegion(value)?.number || null;
}

export function getRegionThreatFloor(value) {
  return getAtlasRegion(value)?.threatFloor ?? 1;
}

export function isLegacyGridRegion(value) {
  return getAtlasRegion(value)?.mapMode === "legacy_grid";
}

export function isRuntimePlayableRegion(value) {
  return getAtlasRegion(value)?.runtimePlayable === true;
}

export function getRuntimeRegionIndex(value, runtimeRegions = []) {
  const id = normalizeRegionId(value);
  if (!id || !Array.isArray(runtimeRegions)) return -1;
  return runtimeRegions.findIndex((candidate) => normalizeRegionId(candidate?.id) === id);
}

export function resolveSaveRegionId(save, runtimeRegions = []) {
  const explicit = normalizeRegionId(
    save?.worldState?.currentRegionId
      ?? save?.lastRegionId
      ?? save?.currentRegionId,
  );
  if (explicit) return explicit;
  const legacy = runtimeRegions?.[Number(save?.regionIndex) || 0]?.id;
  return normalizeRegionId(legacy, "verde");
}

export function resolveSaveRuntimeRegionIndex(save, runtimeRegions = []) {
  const byStableId = getRuntimeRegionIndex(resolveSaveRegionId(save, runtimeRegions), runtimeRegions);
  if (byStableId >= 0) return byStableId;
  const legacy = Number(save?.regionIndex);
  return Number.isInteger(legacy) && legacy >= 0 && legacy < runtimeRegions.length ? legacy : 0;
}

export function getRegionLabel(value, fallback = "Región desconocida") {
  return getAtlasRegion(value)?.name || fallback;
}

export const ATLAS_REGION_IDS = Object.freeze(ATLAS_REGION_REGISTRY.map((def) => def.id));
export const PLAYABLE_REGION_IDS = Object.freeze(ATLAS_REGION_REGISTRY.filter((def) => def.runtimePlayable).map((def) => def.id));
