// Proyecto Atlas — Gestión de misiones por región.
// Centraliza la primera misión principal de cada región y la lógica de
// activación/ restauración al entrar a una región (nueva o ya visitada).
import { createMissionState, normalizeMissionState } from "@/lib/atlasMissionEngine";
import { generateMissions } from "@/lib/atlasMissions";
import { REGIONS } from "@/lib/atlasData";

// Primera misión principal (act 1, campamento) de cada región.
export const REGION_FIRST_MISSION = { verde: "v1", fria: "f1", desierto: "d1" };

// Inicializa el estado de misiones a partir de las defs de una región.
export function initMissionsFromDefs(defs, saved = null) {
  const m = {};
  for (const sector of ["campamento", "pueblo", "ciudad"]) {
    for (const def of defs[sector]) {
      const legacy = saved?.[def.id];
      m[def.id] = def.objectives?.length
        ? normalizeMissionState(def, legacy || createMissionState(def))
        : { progress: 0, status: "pending", active: false, accepted: false, ...(legacy || {}) };
    }
  }
  return m;
}

// Marca la primera misión principal de la región como accepted+active dentro
// de un objeto de misiones recién inicializado. Devuelve el id activado o
// null si no existe / ya fue iniciada / ya está completada.
export function activateFirstMissionInFresh(regionId, freshMissions) {
  const firstId = REGION_FIRST_MISSION[regionId];
  if (!firstId || !freshMissions || !freshMissions[firstId]) return null;
  const cur = freshMissions[firstId];
  if (cur.accepted || cur.status === "done" || cur.status === "ready") return null;
  freshMissions[firstId] = { ...cur, accepted: true, active: true };
  return firstId;
}

// Resuelve las misiones al entrar a una región destino.
// - Si la región ya fue visitada (hay stash): restaura sus misiones tal cual.
// - Si es primera visita: inicializa fresh y activa la primera misión principal.
// Devuelve { missions, isFirstVisit, firstId, def } o null si la región es desconocida.
export function resolveRegionEntryMissions(targetRegionId, missionsByRegion) {
  const stashed = missionsByRegion?.[targetRegionId];
  if (stashed) return { missions: stashed, isFirstVisit: false, firstId: null, def: null };
  const targetRegion = REGIONS.find(r => r.id === targetRegionId);
  if (!targetRegion) return null;
  const defs = generateMissions(targetRegion);
  const fresh = initMissionsFromDefs(defs);
  const firstId = activateFirstMissionInFresh(targetRegionId, fresh);
  const def = firstId ? [...defs.campamento, ...defs.pueblo, ...defs.ciudad].find(d => d.id === firstId) : null;
  return { missions: fresh, isFirstVisit: !!firstId, firstId, def };
}