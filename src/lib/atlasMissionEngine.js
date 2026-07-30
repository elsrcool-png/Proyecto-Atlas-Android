// Utilidades puras del motor de misiones por pasos.

export function createMissionState(def) {
  return {
    progress: 0,
    stepIndex: 0,
    stepProgress: 0,
    status: "pending",
    active: false,
    accepted: false,
    discovered: false,
    completedObjectives: [],
  };
}

export function normalizeMissionState(def, state = {}) {
  const normalized = {
    ...createMissionState(def),
    ...state,
    stepIndex: Number.isFinite(state.stepIndex) ? state.stepIndex : Math.min(state.progress || 0, def.objectives?.length || 0),
    stepProgress: Number.isFinite(state.stepProgress) ? state.stepProgress : 0,
  };
  if (!normalized.completedObjectives) {
    normalized.completedObjectives = [];
    if (def?.objectives && normalized.stepIndex > 0) {
      for (let i = 0; i < normalized.stepIndex && i < def.objectives.length; i++) {
        if (def.objectives[i]?.id) normalized.completedObjectives.push(def.objectives[i].id);
      }
    }
  }
  return normalized;
}

export function prerequisitesMet(def, missions) {
  return (def.prerequisites || []).every(id => missions?.[id]?.status === "done");
}

export function requiredFlagsMet(def, worldFlags) {
  return (def.requiredFlags || []).every(flag => !!worldFlags?.[flag]);
}

export function getMissionLockReason(def, missions, worldFlags, threat = 0) {
  const missingMission = (def.prerequisites || []).find(id => missions?.[id]?.status !== "done");
  if (missingMission) return `Completa primero la misión ${missingMission.toUpperCase()}.`;
  const missingFlag = (def.requiredFlags || []).find(flag => !worldFlags?.[flag]);
  if (missingFlag) return "Falta completar una preparación narrativa de la campaña.";
  if ((def.threatMin || 0) > threat) return `Requiere amenaza ≥ ${def.threatMin}.`;
  return null;
}

export function getCurrentObjective(def, state) {
  if (!def?.objectives?.length) return null;
  const completed = new Set(state?.completedObjectives || []);
  for (const obj of def.objectives) {
    if (!completed.has(obj.id)) return obj;
  }
  return def.objectives[def.objectives.length - 1] || null;
}

export function getCurrentObjectiveText(def, state) {
  if (state?.status === "done") return "Misión completada";
  if (state?.status === "ready") return "Vuelve con el NPC para completar la misión";
  const objective = getCurrentObjective(def, state);
  if (!objective) return def?.desc || "";
  const total = objective.count || 1;
  const current = state?.stepProgress || 0;
  return total > 1 ? `${objective.text} (${current}/${total})` : objective.text;
}

export function getMissionProgressLabel(def, state) {
  if (state?.status === "done") return "Completada";
  if (state?.status === "ready") return "Objetivos cumplidos";
  const total = def?.objectives?.length || def?.target || 1;
  const completed = (state?.completedObjectives || []).length;
  const step = Math.min(completed + 1, total);
  return `Paso ${step}/${total}`;
}

export function objectiveMatches(objective, event) {
  if (!objective || !event || objective.type !== event.type) return false;
  if (objective.sectorId && objective.sectorId !== event.sectorId) return false;
  if (objective.targetId && objective.targetId !== event.targetId) return false;
  if (objective.npcSector && objective.npcSector !== event.npcSector) return false;
  if (objective.npcRole && objective.npcRole !== event.npcRole) return false;
  return true;
}

export function advanceMission(def, rawState, event) {
  const state = normalizeMissionState(def, rawState);
  if (!state.active || state.status !== "pending") return { changed: false, state };

  const completed = new Set(state.completedObjectives || []);

  // Misiones donde todos los objetivos son tipo talk: permiten cualquier orden
  const allTalk = def.objectives.length > 1 && def.objectives.every(o => o.type === "talk");
  if (allTalk && event.type === "talk") {
    let matched = null;
    for (const obj of def.objectives) {
      if (completed.has(obj.id)) continue;
      if (objectiveMatches(obj, event)) { matched = obj; break; }
    }
    if (!matched) return { changed: false, state };
    completed.add(matched.id);
    const allDone = completed.size >= def.objectives.length;
    return {
      changed: true,
      objectiveCompleted: true,
      missionReady: allDone,
      objective: matched,
      state: {
        ...state,
        completedObjectives: [...completed],
        progress: completed.size,
        stepIndex: allDone ? def.objectives.length : state.stepIndex,
        stepProgress: 0,
        status: allDone ? "ready" : "pending",
      },
    };
  }

  // Lógica secuencial para el resto de objetivos
  const objective = getCurrentObjective(def, state);
  if (!objectiveMatches(objective, event)) return { changed: false, state };

  const required = objective.count || 1;
  const amount = Math.max(1, event.amount || 1);
  const nextStepProgress = Math.min(required, state.stepProgress + amount);
  if (nextStepProgress < required) {
    return {
      changed: true,
      objectiveCompleted: false,
      state: { ...state, stepProgress: nextStepProgress },
      objective,
    };
  }

  const nextIndex = state.stepIndex + 1;
  const ready = nextIndex >= (def.objectives?.length || 0);
  if (objective.id) completed.add(objective.id);
  return {
    changed: true,
    objectiveCompleted: true,
    missionReady: ready,
    objective,
    state: {
      ...state,
      completedObjectives: [...completed],
      progress: Math.min((def.objectives?.length || 1), state.progress + 1),
      stepIndex: nextIndex,
      stepProgress: 0,
      status: ready ? "ready" : "pending",
    },
  };
}

export function activeStoryPointIds(missionDefs, missions) {
  const ids = new Set();
  for (const def of Object.values(missionDefs || {})) {
    const state = missions?.[def.id];
    if (!state?.active || state.status !== "pending") continue;
    const objective = getCurrentObjective(def, state);
    if (objective?.type === "interact" && objective.targetId) ids.add(objective.targetId);
  }
  return ids;
}