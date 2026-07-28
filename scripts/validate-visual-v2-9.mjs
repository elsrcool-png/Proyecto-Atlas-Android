import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GREEN_CAMPAIGN_V2 } from "../src/lib/atlasGreenCampaignV2.js";
import { ARCTIC_CAMPAIGN_V2 } from "../src/lib/atlasArcticCampaignV2.js";
import { DESERT_CAMPAIGN_V2 } from "../src/lib/atlasDesertCampaignV2.js";
import { CAMPAIGN_NPCS } from "../src/lib/atlasCampaign.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const errors = [];
const warnings = [];

const campaigns = {
  verde: GREEN_CAMPAIGN_V2,
  fria: ARCTIC_CAMPAIGN_V2,
  desierto: DESERT_CAMPAIGN_V2,
};
const bossIds = { verde: "guardian_verde", fria: "aurel_portador", desierto: "amon_solar" };
const initialUnlocked = { verde: ["A2"], fria: ["A1", "B1"], desierto: ["A1", "B1"] };
const settlementSector = {
  verde: { campamento: "A2", pueblo: "C2", ciudad: "B2" },
  fria: { campamento: "B1", pueblo: "B3", ciudad: "B2" },
  desierto: { campamento: "B1", pueblo: "B3", ciudad: "B2" },
};
const validSectors = new Set(["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"]);
const validObjectiveTypes = new Set(["talk", "interact", "kill", "enter_sector", "boss"]);

function validateCampaign(regionId, campaign) {
  const missions = Object.values(campaign).flat();
  const missionIds = new Set();
  const objectiveIds = new Set();
  const interactIds = new Set();

  for (const mission of missions) {
    if (!mission.id || missionIds.has(mission.id)) errors.push(`${regionId}: misión duplicada o sin id: ${mission.id || "<vacía>"}`);
    missionIds.add(mission.id);
    if (!CAMPAIGN_NPCS[regionId]?.[mission.sector]?.[mission.role]) errors.push(`${regionId}/${mission.id}: NPC de entrega inexistente ${mission.sector}/${mission.role}`);
    if (!mission.name || !mission.desc) errors.push(`${regionId}/${mission.id}: nombre o descripción vacíos`);
    if (!Array.isArray(mission.objectives) || !mission.objectives.length) errors.push(`${regionId}/${mission.id}: sin objetivos`);

    for (const objective of mission.objectives || []) {
      if (!objective.id || objectiveIds.has(objective.id)) errors.push(`${regionId}: objetivo duplicado o sin id: ${objective.id || "<vacío>"}`);
      objectiveIds.add(objective.id);
      if (!validObjectiveTypes.has(objective.type)) errors.push(`${regionId}/${mission.id}/${objective.id}: tipo inválido ${objective.type}`);
      if (objective.sectorId && !validSectors.has(objective.sectorId)) errors.push(`${regionId}/${mission.id}/${objective.id}: sector inválido ${objective.sectorId}`);
      if (!objective.text) errors.push(`${regionId}/${mission.id}/${objective.id}: texto vacío`);
      if (objective.type === "interact") {
        if (!objective.targetId) errors.push(`${regionId}/${mission.id}/${objective.id}: interacción sin targetId`);
        else interactIds.add(objective.targetId);
      }
      if (objective.type === "boss" && objective.targetId !== bossIds[regionId]) errors.push(`${regionId}/${mission.id}/${objective.id}: jefe incorrecto ${objective.targetId}`);
      if (objective.type === "talk" && !CAMPAIGN_NPCS[regionId]?.[objective.npcSector]?.[objective.npcRole]) {
        errors.push(`${regionId}/${mission.id}/${objective.id}: NPC objetivo inexistente ${objective.npcSector}/${objective.npcRole}`);
      }
    }
  }

  for (const mission of missions) {
    for (const prerequisite of mission.prerequisites || []) {
      if (!missionIds.has(prerequisite)) errors.push(`${regionId}/${mission.id}: prerrequisito inexistente ${prerequisite}`);
    }
  }

  // Simula la campaña principal. Una misión solo puede ejecutarse si el NPC de
  // entrega y todos sus sectores objetivo son accesibles al aceptarla.
  const core = missions.filter(mission => !mission.id.includes("paid") && !mission.id.includes("wild"));
  const unlocked = new Set(initialUnlocked[regionId]);
  const completed = new Set();
  let progressed = true;
  while (completed.size < core.length && progressed) {
    progressed = false;
    for (const mission of core) {
      if (completed.has(mission.id)) continue;
      if (!(mission.prerequisites || []).every(id => completed.has(id))) continue;
      if (!unlocked.has(settlementSector[regionId][mission.sector])) continue;
      const available = new Set(unlocked);
      for (const sectorId of mission.onAccept?.unlockSectors || []) available.add(sectorId);
      const targets = [...new Set((mission.objectives || []).map(objective => objective.sectorId).filter(Boolean))];
      if (targets.some(sectorId => !available.has(sectorId))) continue;
      for (const sectorId of mission.onAccept?.unlockSectors || []) unlocked.add(sectorId);
      for (const sectorId of mission.onClaim?.unlockSectors || []) unlocked.add(sectorId);
      completed.add(mission.id);
      progressed = true;
    }
  }
  if (completed.size !== core.length) {
    const blocked = core.filter(mission => !completed.has(mission.id)).map(mission => mission.id).join(", ");
    errors.push(`${regionId}: campaña bloqueada, misiones inaccesibles: ${blocked}`);
  }
  if (unlocked.size !== 9) errors.push(`${regionId}: la campaña termina con ${unlocked.size}/9 sectores desbloqueados`);

  return { missions: missions.length, core: core.length, objectives: objectiveIds.size, interactIds };
}

const results = {};
for (const [regionId, campaign] of Object.entries(campaigns)) results[regionId] = validateCampaign(regionId, campaign);

// Cobertura de puntos narrativos. Verde y Ártico son estáticos; Árido se
// genera directamente desde DESERT_CAMPAIGN_V2.
const storySource = read("src/lib/atlasStoryPoints.js");
const staticPointIds = new Set([...storySource.matchAll(/point\("([^"]+)"/g)].map(match => match[1]));
for (const regionId of ["verde", "fria"]) {
  const missing = [...results[regionId].interactIds].filter(id => !staticPointIds.has(id));
  if (missing.length) errors.push(`${regionId}: puntos narrativos faltantes: ${missing.join(", ")}`);
}
if (!storySource.includes("const DESERT_POINTS = (() =>") || !storySource.includes("Object.values(DESERT_CAMPAIGN_V2).flat()")) {
  errors.push("desierto: los puntos narrativos no se generan desde la campaña oficial");
}

const canonical = read("src/lib/atlasCanonicalWorlds.js");
if (!canonical.includes("filterReferencedStoryPoints")) errors.push("El mundo no filtra puntos narrativos huérfanos");
if (!canonical.includes("const objective = null;")) errors.push("Sigue activo el punto de interés genérico sin misión");
const explore = read("src/components/atlas/ExploreMode.jsx");
for (const forbidden of ["nearObjective", "objectiveActive", "Punto de interés"]) {
  if (explore.includes(forbidden)) errors.push(`Marcador genérico restante en ExploreMode: ${forbidden}`);
}

// Movimiento independiente de NPC.
const entity = read("src/components/atlas/EntitySprite.jsx");
const motion = read("src/lib/atlasNpcMotion.js");
for (const token of ["npcTurnProfile", "animationKey", "profile.initialDelay", "profile.interval"]) if (!entity.includes(token)) errors.push(`NPC sin giro independiente: ${token}`);
for (const token of ["stableEntityHash", "createVillagerMotion", "roamRadius", "walkSpeed"]) if (!motion.includes(token)) errors.push(`Perfil de movimiento incompleto: ${token}`);
if (!explore.includes("createVillagerMotion") || !explore.includes("v.motionMode")) errors.push("Aldeanos ambientales siguen sincronizados");
if (entity.includes("4200")) errors.push("EntitySprite conserva el intervalo global sincronizado de 4200 ms");

// Limpieza de recortes en Verde. Los únicos recursos v1 permitidos son los
// nueve terrenos base, que contienen únicamente suelo, agua y caminos.
const green = read("src/lib/atlasGreenVisualScenes.js");
for (const legacy of ["ruins.png", "cave.png", "city_gate.png", "watchtower_main.webp", "house_green.png", "house_blue.png", "house_brown.png", "house_red.png", "portal_altar.webp", "prop_fence.webp"]) {
  if (green.includes(`"${legacy}"`)) errors.push(`Asset recortado todavía conectado en Verde: ${legacy}`);
}
for (const clean of ["city_gate_complete.webp", "watchtower_complete.webp", "ruin_wall_clean.webp", "cave_entrance_clean.webp", "village_house_green.webp", "city_hall.webp", "fence_segment_clean.webp"]) {
  if (!green.includes(clean)) errors.push(`Asset modular limpio no conectado: ${clean}`);
}

if (errors.length) {
  console.error("VALIDACIÓN v2.9 FALLIDA");
  for (const error of errors) console.error(" -", error);
  for (const warning of warnings) console.warn(" !", warning);
  process.exit(1);
}

console.log("Atlas Visual v2.9 validado");
for (const [regionId, result] of Object.entries(results)) {
  console.log(`${regionId}: ${result.core}/15 misiones principales accesibles · ${result.objectives} objetivos válidos · 9/9 sectores alcanzables`);
}
console.log("Puntos de interés huérfanos eliminados · NPC independientes · Región Verde sin assets recortados conectados");
