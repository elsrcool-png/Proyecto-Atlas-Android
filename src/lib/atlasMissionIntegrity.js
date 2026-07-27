// PROYECTO ATLAS — Integridad canónica de campañas.
// Centraliza las tres campañas oficiales y evita que el mundo renderice
// puntos narrativos que no pertenecen a ninguna misión válida.
import { GREEN_CAMPAIGN_V2 } from "@/lib/atlasGreenCampaignV2";
import { ARCTIC_CAMPAIGN_V2 } from "@/lib/atlasArcticCampaignV2";
import { DESERT_CAMPAIGN_V2 } from "@/lib/atlasDesertCampaignV2";
import { CAMPAIGN_NPCS } from "@/lib/atlasCampaign";

export const OFFICIAL_CAMPAIGNS = {
  verde: GREEN_CAMPAIGN_V2,
  fria: ARCTIC_CAMPAIGN_V2,
  desierto: DESERT_CAMPAIGN_V2,
};

const BOSS_IDS = {
  verde: "guardian_verde",
  fria: "aurel_portador",
  desierto: "amon_solar",
};

const VALID_OBJECTIVE_TYPES = new Set(["talk", "interact", "kill", "enter_sector", "boss"]);
const VALID_SECTOR_IDS = new Set(["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"]);
const SETTLEMENTS = new Set(["campamento", "pueblo", "ciudad"]);

export function getCampaignForRegion(regionId) {
  return OFFICIAL_CAMPAIGNS[regionId] || null;
}

export function getCampaignMissions(regionId) {
  const campaign = getCampaignForRegion(regionId);
  return campaign ? Object.values(campaign).flat() : [];
}

export function getReferencedStoryPointIds(regionId) {
  return new Set(
    getCampaignMissions(regionId)
      .flatMap(mission => mission.objectives || [])
      .filter(objective => objective.type === "interact" && objective.targetId)
      .map(objective => objective.targetId),
  );
}

export function filterReferencedStoryPoints(regionId, storyPoints = []) {
  const referenced = getReferencedStoryPointIds(regionId);
  return storyPoints.filter(point => referenced.has(point.id));
}

export function validateMissionCampaign(regionId) {
  const issues = [];
  const campaign = getCampaignForRegion(regionId);
  const npcs = CAMPAIGN_NPCS[regionId];
  if (!campaign) return [`Campaña inexistente: ${regionId}`];
  if (!npcs) return [`NPC canónicos inexistentes: ${regionId}`];

  const missions = getCampaignMissions(regionId);
  const missionIds = new Set();
  const objectiveIds = new Set();

  for (const mission of missions) {
    if (!mission.id) issues.push("Misión sin id");
    else if (missionIds.has(mission.id)) issues.push(`ID de misión duplicado: ${mission.id}`);
    else missionIds.add(mission.id);

    if (!SETTLEMENTS.has(mission.sector)) issues.push(`${mission.id}: asentamiento inválido ${mission.sector}`);
    if (!npcs[mission.sector]?.[mission.role]) issues.push(`${mission.id}: NPC ${mission.sector}/${mission.role} no existe`);
    if (!mission.name || !mission.desc) issues.push(`${mission.id}: nombre o descripción vacíos`);
    if (!Array.isArray(mission.objectives) || mission.objectives.length === 0) issues.push(`${mission.id}: sin objetivos`);

    for (const prerequisite of mission.prerequisites || []) {
      // Se verifica en una segunda pasada cuando todos los ids ya están reunidos.
      if (!prerequisite) issues.push(`${mission.id}: prerrequisito vacío`);
    }

    for (const objective of mission.objectives || []) {
      if (!objective.id) issues.push(`${mission.id}: objetivo sin id`);
      else if (objectiveIds.has(objective.id)) issues.push(`ID de objetivo duplicado: ${objective.id}`);
      else objectiveIds.add(objective.id);

      if (!VALID_OBJECTIVE_TYPES.has(objective.type)) issues.push(`${mission.id}/${objective.id}: tipo inválido ${objective.type}`);
      if (!objective.text) issues.push(`${mission.id}/${objective.id}: texto vacío`);
      if (objective.sectorId && !VALID_SECTOR_IDS.has(objective.sectorId)) issues.push(`${mission.id}/${objective.id}: sector inválido ${objective.sectorId}`);

      if (objective.type === "interact" && !objective.targetId) issues.push(`${mission.id}/${objective.id}: interacción sin targetId`);
      if (objective.type === "boss" && objective.targetId !== BOSS_IDS[regionId]) issues.push(`${mission.id}/${objective.id}: jefe incorrecto ${objective.targetId}`);
      if (objective.type === "talk") {
        const settlement = objective.npcSector;
        const role = objective.npcRole;
        if (!SETTLEMENTS.has(settlement) || !role || !npcs[settlement]?.[role]) {
          issues.push(`${mission.id}/${objective.id}: conversación apunta a NPC inexistente ${settlement}/${role}`);
        }
      }
    }
  }

  for (const mission of missions) {
    for (const prerequisite of mission.prerequisites || []) {
      if (!missionIds.has(prerequisite)) issues.push(`${mission.id}: prerrequisito inexistente ${prerequisite}`);
    }
  }

  return issues;
}
