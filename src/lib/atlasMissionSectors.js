// Desbloqueo central y automático de sectores basado en el objetivo actual de misiones activas.
import { getCurrentObjective } from "@/lib/atlasMissionEngine";
import { getMissionUnlocks } from "@/lib/atlasRegionSectors";

// Tipos de objetivo que implican viajar a un sector distinto del actual.
const SECTOR_DESTINATION_TYPES = new Set([
  "enter_sector", "reach_sector", "travel", "explore_sector",
  "investigate_sector", "reach", "interact", "talk", "boss", "kill",
]);

/**
 * Devuelve el sectorId que requiere el objetivo actual de la misión.
 * Solo devuelve el sector si es distinto al sector actual del jugador.
 * No devuelve sectores de objetivos futuros.
 */
export function getMissionRequiredSector(def, state, currentSectorId) {
  if (!def?.objectives?.length) return null;

  const objective = getCurrentObjective(def, state);
  if (!objective) return null;

  if (!SECTOR_DESTINATION_TYPES.has(objective.type)) return null;

  const requiredSectorId = objective.sectorId || objective.npcSector || null;
  if (!requiredSectorId || requiredSectorId === currentSectorId) return null;

  return requiredSectorId;
}

/**
 * Devuelve todos los sectores que deben desbloquearse para una misión activa.
 * Combina:
 *   1. El sector del objetivo actual (campañas con objetivos detallados, ej: verde).
 *   2. Los sectores de missionUnlocks del layout regional (campañas ártica y árida).
 * No incluye el sector actual del jugador.
 */
export function getMissionUnlockSectors(def, state, regionId, currentSectorId) {
  const sectors = new Set();

  const objSector = getMissionRequiredSector(def, state, currentSectorId);
  if (objSector) sectors.add(objSector);

  const layoutUnlocks = getMissionUnlocks(regionId, def.id);
  for (const sid of layoutUnlocks) {
    if (sid !== currentSectorId) sectors.add(sid);
  }

  return [...sectors];
}

/**
 * Recorre todas las misiones activas y devuelve los sectores que faltan por desbloquear.
 * Solo considera misiones accepted=true, active=true y status !== "done".
 */
export function getMissingMissionSectors(missionDefMap, missions, regionId, currentSectorId, unlockedSectors) {
  const missing = [];
  const seen = new Set();
  for (const [id, state] of Object.entries(missions || {})) {
    if (!state?.accepted || !state.active || state.status === "done") continue;
    const def = missionDefMap?.[id];
    if (!def) continue;
    const sectors = getMissionUnlockSectors(def, state, regionId, currentSectorId);
    for (const sid of sectors) {
      if (seen.has(sid)) continue;
      const key = `${regionId}:${sid}`;
      if (!unlockedSectors?.has(key)) {
        missing.push(sid);
        seen.add(sid);
      }
    }
  }
  return missing;
}