// PROYECTO ATLAS — Reconstrucción canónica de sectores desbloqueados.
// El acceso se deriva de la campaña, no de listas de prueba ni de guardados
// antiguos que pudieron haber dejado toda una región abierta.
import { getCurrentObjective } from "./atlasMissionEngine.js";
import {
  getInitialUnlockedSectorKeys,
  getMissionUnlocks,
  sectorKey,
} from "./atlasRegionSectors.js";

const VALID_SECTOR_ID = /^[ABC][123]$/;

export function flattenMissionDefs(defs) {
  if (!defs) return [];
  if (Array.isArray(defs)) return defs.filter(Boolean);
  return ["campamento", "pueblo", "ciudad"]
    .flatMap((group) => Array.isArray(defs[group]) ? defs[group] : [])
    .filter(Boolean);
}

function addSector(target, regionId, sectorId) {
  if (!VALID_SECTOR_ID.test(String(sectorId || ""))) return;
  target.add(sectorKey(regionId, sectorId));
}

function addEffectSectors(target, regionId, effects) {
  for (const sectorId of effects?.unlockSectors || []) {
    addSector(target, regionId, sectorId);
  }
}

// Reconstruye el acceso permanente y el acceso necesario para el objetivo
// activo. Así una partida vieja se repara al cargar, sin conservar el antiguo
// GREEN_TEST_UNLOCKS que abría los nueve sectores desde el comienzo.
export function deriveUnlockedSectorKeys(regionId, defs, missions) {
  const unlocked = new Set(getInitialUnlockedSectorKeys(regionId));

  for (const def of flattenMissionDefs(defs)) {
    const state = missions?.[def.id];
    if (!state) continue;

    const completed = new Set(state.completedObjectives || []);
    const started = !!state.accepted
      || !!state.active
      || state.status === "ready"
      || state.status === "done"
      || completed.size > 0;

    if (!started) continue;

    // Aceptar una misión puede abrir una ruta narrativa explícita.
    addEffectSectors(unlocked, regionId, def.onAccept);

    // Cada paso ya completado conserva el camino que el jugador tuvo que usar
    // y aplica cualquier apertura declarada por ese objetivo.
    for (const objective of def.objectives || []) {
      if (!completed.has(objective.id) && state.status !== "done") continue;
      addSector(unlocked, regionId, objective.sectorId);
      addEffectSectors(unlocked, regionId, objective.onComplete);
    }

    // Solo la misión activa puede abrir temporalmente el sector de su objetivo
    // actual. Las misiones aceptadas pero guardadas en el diario no adelantan
    // rutas futuras.
    if (state.active && state.status !== "done") {
      const currentObjective = getCurrentObjective(def, state);
      addSector(unlocked, regionId, currentObjective?.sectorId);
    }

    if (state.status === "ready" || state.status === "done") {
      addEffectSectors(unlocked, regionId, def.onReady);
    }

    if (state.status === "done") {
      addEffectSectors(unlocked, regionId, def.onClaim);
      for (const sectorId of getMissionUnlocks(regionId, def.id)) {
        addSector(unlocked, regionId, sectorId);
      }
    }
  }

  return [...unlocked];
}
