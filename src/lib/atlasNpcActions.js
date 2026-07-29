// Utilidad central para determinar las acciones disponibles de un NPC multifunción.
import { getCurrentObjective } from "@/lib/atlasMissionEngine";

const FLAVOR_ROLES = ["flavor", "flavor1", "flavor2"];

/**
 * Devuelve una lista ordenada de acciones disponibles para un NPC,
 * según su rol, misiones pendientes, servicios y estado del mundo.
 */
export function getNpcAvailableActions({ npc, missions, missionDefs, getMissionLockReason, worldFlags, regionId }) {
  if (!npc) return [];
  const actions = [];
  const sectorDefs = missionDefs?.[npc.sector] || [];
  const npcDefs = sectorDefs.filter(d => d.role === npc.role);
  let hasContinue = false;

  for (const def of npcDefs) {
    const state = missions?.[def.id];
    if (!state || state.status === "done") continue;

    if (state.status === "ready") {
      actions.push({
        id: `claim_${def.id}`,
        label: `Reclamar: ${def.name}`,
        type: "claim",
        priority: 1,
        missionId: def.id,
      });
    } else if (state.accepted && state.active) {
      const completed = new Set(state.completedObjectives || []);
      const allTalk = def.objectives.length > 1 && def.objectives.every(o => o.type === "talk");
      const talkObj = allTalk
        ? def.objectives.find(o => o.type === "talk" && !completed.has(o.id) && o.npcSector === npc.sector && o.npcRole === npc.role)
        : (() => { const obj = getCurrentObjective(def, state); return (obj?.type === "talk" && obj.npcSector === npc.sector && obj.npcRole === npc.role) ? obj : null; })();
      if (talkObj) {
        hasContinue = true;
        actions.push({
          id: `continue_${def.id}`,
          label: `Continuar: ${def.name}`,
          type: "continue",
          priority: 2,
          missionId: def.id,
        });
      }
    } else if (!state.accepted) {
      const locked = getMissionLockReason?.(def.id);
      if (!locked) {
        actions.push({
          id: `accept_${def.id}`,
          label: "Ver misiones",
          type: "view_missions",
          priority: 5,
          missionId: def.id,
        });
      }
    }
  }

  // Restaurar reliquia (forja de la ciudad en región verde)
  if (
    npc.role === "smith" && npc.sector === "ciudad" && regionId === "verde" &&
    worldFlags?.["verde:broken_relic_found"] && worldFlags?.["verde:city_services_open"] &&
    missions?.v12?.status !== "done"
  ) {
    actions.push({
      id: "restore_relic",
      label: "Restaurar reliquia",
      type: "restore_relic",
      priority: 3,
    });
  }

  // Servicios comerciales
  if (npc.role === "merchant" && npc.shop) {
    actions.push({ id: "shop", label: "Ver tienda", type: "shop", priority: 6 });
  }
  if (npc.role === "smith" && npc.smithTier) {
    actions.push({ id: "smith", label: "Abrir herrería", type: "smith", priority: 6 });
  }
  if (npc.role === "inn" && npc.rest != null) {
    actions.push({ id: "rest", label: `Descansar (${npc.rest} oro)`, type: "rest", priority: 6 });
  }

  // Diálogo (se oculta si hay acción de continuar misión)
  if (!hasContinue) {
    actions.push({
      id: "talk",
      label: FLAVOR_ROLES.includes(npc.role) ? "Hablar" : "Hablar",
      type: "dialogue",
      priority: 7,
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

/** Devuelve un identificador de indicador visual para un NPC. */
export function getNpcIndicator(npc, missions, missionDefs) {
  if (!npc || !missionDefs) return null;
  const defs = missionDefs?.[npc.sector] || [];
  const npcDefs = defs.filter(d => d.role === npc.role);
  const isReady = npcDefs.some(d => missions?.[d.id]?.status === "ready");
  if (isReady) return "ready";
  const hasMission = npcDefs.some(d => {
    const s = missions?.[d.id];
    return s && s.status !== "done";
  });
  if (hasMission) return "mission";
  if (npc.role === "smith") return "smith";
  if (npc.role === "merchant") return "shop";
  if (npc.role === "inn") return "inn";
  return null;
}