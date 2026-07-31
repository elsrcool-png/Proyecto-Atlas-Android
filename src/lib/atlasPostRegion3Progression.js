// PROYECTO ATLAS — Progresión sistémica posterior a Región 3.
//
// Reglas centrales:
// - Regiones 1–3 conservan sus habilidades y progresión actuales.
// - El Gremio, Maestrías y habilidades aprendibles se habilitan al cerrar Región 3.
// - Las habilidades nuevas se obtienen por condiciones del mundo, no por nivel.
// - Las misiones especiales de Amenaza se notifican y registran automáticamente.

import { getAtlasRegionNumber } from "@/lib/atlasRegionRegistry";

export const POST_REGION3_SCHEMA_VERSION = 1;
export const GUILD_UNLOCK_FLAG = "atlas:guild_unlocked";
export const GUILD_INTRO_CONTRACT_ID = "guild:intro_trials";

export const POST_REGION3_SKILLS = Object.freeze({
  guild_breaker_guerrero: Object.freeze({
    id: "guild_breaker_guerrero",
    name: "Golpe Quebrador",
    class: "Guerrero",
    category: "active",
    slot: "classAbility",
    kind: "Técnica de Gremio",
    cost: 4,
    unlock: 1,
    desc: "Un golpe técnico que concentra la fuerza en la defensa enemiga. Se aprende superando la prueba inicial del Gremio.",
    source: "Gremio de Aventureros",
    rank: 1,
    maxRank: 2,
    upgradeRequirement: Object.freeze({ uses: 5, contractId: "guild:dungeon_record" }),
    rankAdjustments: Object.freeze({ 2: Object.freeze({ costDelta: -1, descAppend: "Rango II: reduce su coste en 1 y prolonga la apertura creada." }) }),
  }),
  guild_channel_mago: Object.freeze({
    id: "guild_channel_mago",
    name: "Canal Concentrado",
    class: "Mago",
    category: "active",
    slot: "classAbility",
    kind: "Técnica de Gremio",
    cost: 4,
    unlock: 1,
    desc: "Comprime el flujo mágico antes de liberarlo en un impacto estable. Se aprende superando la prueba inicial del Gremio.",
    source: "Gremio de Aventureros",
    rank: 1,
    maxRank: 2,
    upgradeRequirement: Object.freeze({ uses: 5, contractId: "guild:dungeon_record" }),
    rankAdjustments: Object.freeze({ 2: Object.freeze({ costDelta: -1, descAppend: "Rango II: reduce su coste en 1 y estabiliza la canalización." }) }),
  }),
  guild_hunter_picaro: Object.freeze({
    id: "guild_hunter_picaro",
    name: "Marca del Cazador",
    class: "Pícaro",
    category: "active",
    slot: "classAbility",
    kind: "Técnica de Gremio",
    cost: 4,
    unlock: 1,
    desc: "Lee la postura del objetivo y ataca su abertura más clara. Se aprende superando la prueba inicial del Gremio.",
    source: "Gremio de Aventureros",
    rank: 1,
    maxRank: 2,
    upgradeRequirement: Object.freeze({ uses: 5, contractId: "guild:dungeon_record" }),
    rankAdjustments: Object.freeze({ 2: Object.freeze({ costDelta: -1, descAppend: "Rango II: reduce su coste en 1 y mantiene la marca durante más tiempo." }) }),
  }),
  guild_guarded_stance: Object.freeze({
    id: "guild_guarded_stance",
    name: "Postura Protegida",
    class: "Guerrero",
    category: "passive",
    slot: "passive1",
    kind: "Pasiva de Gremio",
    desc: "+1 Defensa física mientras esté equipada.",
    source: "Gremio de Aventureros",
    rank: 1,
    maxRank: 2,
    upgradeRequirement: Object.freeze({ uses: 5, contractId: "guild:dungeon_record" }),
    rankAdjustments: Object.freeze({ 2: Object.freeze({ bonus: Object.freeze({ physDef: 2 }), descAppend: "Rango II: la bonificación aumenta a +2 Defensa física." }) }),
    bonus: Object.freeze({ physDef: 1 }),
  }),
  guild_arcane_reserve: Object.freeze({
    id: "guild_arcane_reserve",
    name: "Reserva Arcana",
    class: "Mago",
    category: "passive",
    slot: "passive1",
    kind: "Pasiva de Gremio",
    desc: "+2 Magia máxima mientras esté equipada.",
    source: "Gremio de Aventureros",
    rank: 1,
    maxRank: 2,
    upgradeRequirement: Object.freeze({ uses: 5, contractId: "guild:dungeon_record" }),
    rankAdjustments: Object.freeze({ 2: Object.freeze({ bonus: Object.freeze({ maxMp: 4 }), descAppend: "Rango II: la reserva aumenta a +4 Energía máxima." }) }),
    bonus: Object.freeze({ maxMp: 2 }),
  }),
  guild_sharp_focus: Object.freeze({
    id: "guild_sharp_focus",
    name: "Enfoque Afilado",
    class: "Pícaro",
    category: "passive",
    slot: "passive1",
    kind: "Pasiva de Gremio",
    desc: "+3% de probabilidad crítica mientras esté equipada.",
    source: "Gremio de Aventureros",
    rank: 1,
    maxRank: 2,
    upgradeRequirement: Object.freeze({ uses: 5, contractId: "guild:dungeon_record" }),
    rankAdjustments: Object.freeze({ 2: Object.freeze({ bonus: Object.freeze({ crit: 0.05 }), descAppend: "Rango II: la probabilidad crítica aumenta a +5%." }) }),
    bonus: Object.freeze({ crit: 0.03 }),
  }),
  threat_pulse_mastery: Object.freeze({
    id: "threat_pulse_mastery",
    name: "Pulso de Sobrecarga",
    class: null,
    category: "active",
    slot: "hybrid",
    kind: "Técnica de Amenaza",
    cost: 7,
    unlock: 1,
    desc: "Convierte la presión acumulada de la Amenaza en una descarga ofensiva. Su origen no se anuncia antes de completar la misión.",
    source: "Misión especial de Amenaza",
    rank: 1,
    maxRank: 1,
  }),
});

export const GUILD_CONTRACT_DEFINITIONS = Object.freeze({
  [GUILD_INTRO_CONTRACT_ID]: Object.freeze({
    id: GUILD_INTRO_CONTRACT_ID,
    title: "Prueba de ingreso",
    description: "Demuestra que puedes actuar sin la guía del prólogo. Vence tres enemigos en cualquier región liberada.",
    objective: Object.freeze({ type: "combat_win", count: 3, text: "Vence enemigos" }),
    unique: true,
    rewardHint: "El Gremio promete enseñarte una técnica adaptada a tu clase.",
    reputation: 10,
  }),
  "guild:dungeon_record": Object.freeze({
    id: "guild:dungeon_record",
    title: "Registro de mazmorra",
    description: "Completa una Dungeon y entrega un informe operativo al Gremio.",
    objective: Object.freeze({ type: "dungeon_complete", count: 1, text: "Completa una Dungeon" }),
    unique: true,
    rewardHint: "El informe abrirá nuevas cadenas de dominio cuando existan regiones posteriores.",
    reputation: 15,
  }),
});

export const SPECIAL_QUEST_DEFINITIONS = Object.freeze({
  "threat:r4_pulse": Object.freeze({
    id: "threat:r4_pulse",
    title: "El pulso bajo la tormenta",
    regionId: "tempestuosa",
    trigger: Object.freeze({ minimumThreat: 6 }),
    persistenceType: "persistent",
    rumorText: "Se dice que un poder oculto responde cuando la tormenta reconoce a quien no retrocede.",
    objective: Object.freeze({ type: "combat_win", count: 4, text: "Vence enemigos con Amenaza alta" }),
    hiddenRewardSkillId: "threat_pulse_mastery",
    unique: true,
  }),
  "threat:r5_forge": Object.freeze({
    id: "threat:r5_forge",
    title: "La forja que escucha",
    regionId: "ignea",
    trigger: Object.freeze({ minimumThreat: 7 }),
    persistenceType: "persistent",
    rumorText: "Los fundidores hablan de una técnica que solo aparece cuando el calor y la presión alcanzan el mismo límite.",
    objective: Object.freeze({ type: "dungeon_complete", count: 1, text: "Completa una Dungeon bajo alta Amenaza" }),
    hiddenRewardSkillId: null,
    unique: true,
  }),
});

const uniqueStrings = (value) => [...new Set((Array.isArray(value) ? value : []).filter((item) => typeof item === "string" && item.length))];

function normalizeSkillProgress(skillId, raw = {}) {
  const def = POST_REGION3_SKILLS[skillId];
  const maxRank = Math.max(1, Number(def?.maxRank) || 1);
  return {
    ...raw,
    rank: Math.min(maxRank, Math.max(1, Number(raw?.rank) || Number(def?.rank) || 1)),
    uses: Math.max(0, Number(raw?.uses) || 0),
    upgradedAt: raw?.upgradedAt || null,
  };
}

function applyMasteryRank(def, progress) {
  if (!def) return null;
  const rank = Math.min(Math.max(1, Number(def.maxRank) || 1), Math.max(1, Number(progress?.rank) || Number(def.rank) || 1));
  let cost = Number(def.cost) || 0;
  let desc = def.desc || "";
  let bonus = def.bonus ? { ...def.bonus } : undefined;
  for (let level = 2; level <= rank; level += 1) {
    const adjustment = def.rankAdjustments?.[level];
    if (!adjustment) continue;
    cost += Number(adjustment.costDelta) || 0;
    if (adjustment.bonus) bonus = { ...adjustment.bonus };
    if (adjustment.descAppend) desc = `${desc} ${adjustment.descAppend}`.trim();
  }
  return { ...def, cost: Math.max(0, cost), desc, ...(bonus ? { bonus } : {}), rank, progress: normalizeSkillProgress(def.id, progress) };
}

function ensureLearnedSkillProgress(masteries, learnedSkillIds) {
  const skillProgress = { ...(masteries?.skillProgress || {}) };
  for (const id of learnedSkillIds) skillProgress[id] = normalizeSkillProgress(id, skillProgress[id]);
  return skillProgress;
}

function contractState(def, state = {}) {
  return {
    status: "AVAILABLE",
    progress: 0,
    acceptedAt: null,
    completedAt: null,
    claimedAt: null,
    ...state,
    progress: Math.max(0, Number(state.progress) || 0),
  };
}

function specialQuestState(def, state = {}) {
  return {
    status: "LOCKED",
    progress: 0,
    activatedAt: null,
    acceptedAt: null,
    completedAt: null,
    claimedAt: null,
    notificationSeen: false,
    ...state,
    progress: Math.max(0, Number(state.progress) || 0),
  };
}

export function isGuildUnlockCondition({ worldFlags = {}, defeatedBossIds = [] } = {}) {
  const bossSet = new Set(defeatedBossIds || []);
  return Boolean(
    worldFlags[GUILD_UNLOCK_FLAG]
    || worldFlags["desierto:completed"]
    || worldFlags["desierto:boss_defeated"]
    || worldFlags["desierto:amon_freed"]
    || bossSet.has("amon_solar"),
  );
}

export function classGuildRewardIds(playerClass) {
  if (playerClass === "Mago") return ["guild_channel_mago", "guild_arcane_reserve"];
  if (playerClass === "Pícaro") return ["guild_hunter_picaro", "guild_sharp_focus"];
  return ["guild_breaker_guerrero", "guild_guarded_stance"];
}

export function createPostRegion3State({ guildUnlocked = false } = {}) {
  const contracts = {};
  for (const def of Object.values(GUILD_CONTRACT_DEFINITIONS)) contracts[def.id] = contractState(def, { status: guildUnlocked ? "AVAILABLE" : "LOCKED" });
  const specialQuests = {};
  for (const def of Object.values(SPECIAL_QUEST_DEFINITIONS)) specialQuests[def.id] = specialQuestState(def);
  return {
    schemaVersion: POST_REGION3_SCHEMA_VERSION,
    guild: {
      status: guildUnlocked ? "OPEN" : "LOCKED",
      rank: 1,
      reputation: 0,
      unlockedAt: guildUnlocked ? Date.now() : null,
      introCompleted: false,
    },
    masteries: {
      learnedSkillIds: [],
      equippedActive: { classAbility: null, hybrid: null, definitive: null },
      equippedPassive: { passive1: null, passive2: null },
      skillProgress: {},
      hints: {},
    },
    contracts,
    specialQuests,
    classAscension: { status: "LOCKED", unlockedAfterRegion: 5, selectedClassId: null },
    racialEvolution: { status: "LOCKED", preparationRegion: 7, unlockRegion: 8, affinity: 0 },
    notificationHistory: [],
  };
}

export function normalizePostRegion3State(raw, context = {}) {
  const unlocked = isGuildUnlockCondition(context) || raw?.guild?.status === "OPEN";
  const base = createPostRegion3State({ guildUnlocked: unlocked });
  const source = raw && typeof raw === "object" ? raw : {};
  const learned = uniqueStrings(source?.masteries?.learnedSkillIds).filter((id) => POST_REGION3_SKILLS[id]);
  const equippedActive = { ...base.masteries.equippedActive, ...(source?.masteries?.equippedActive || {}) };
  const equippedPassive = { ...base.masteries.equippedPassive, ...(source?.masteries?.equippedPassive || {}) };
  for (const [slot, id] of Object.entries(equippedActive)) if (id && (!learned.includes(id) || POST_REGION3_SKILLS[id]?.category !== "active")) equippedActive[slot] = null;
  for (const [slot, id] of Object.entries(equippedPassive)) if (id && (!learned.includes(id) || POST_REGION3_SKILLS[id]?.category !== "passive")) equippedPassive[slot] = null;

  const contracts = {};
  for (const def of Object.values(GUILD_CONTRACT_DEFINITIONS)) {
    const state = contractState(def, source?.contracts?.[def.id]);
    if (!unlocked && state.status !== "COMPLETED") state.status = "LOCKED";
    else if (unlocked && state.status === "LOCKED") state.status = "AVAILABLE";
    contracts[def.id] = state;
  }
  const specialQuests = {};
  for (const def of Object.values(SPECIAL_QUEST_DEFINITIONS)) specialQuests[def.id] = specialQuestState(def, source?.specialQuests?.[def.id]);

  return {
    ...base,
    ...source,
    schemaVersion: POST_REGION3_SCHEMA_VERSION,
    guild: {
      ...base.guild,
      ...(source.guild || {}),
      status: unlocked ? "OPEN" : "LOCKED",
      unlockedAt: unlocked ? (source?.guild?.unlockedAt || Date.now()) : null,
      reputation: Math.max(0, Number(source?.guild?.reputation) || 0),
      rank: Math.max(1, Number(source?.guild?.rank) || 1),
    },
    masteries: {
      ...base.masteries,
      ...(source.masteries || {}),
      learnedSkillIds: learned,
      equippedActive,
      equippedPassive,
      skillProgress: ensureLearnedSkillProgress(source?.masteries, learned),
      hints: { ...(source?.masteries?.hints || {}) },
    },
    contracts,
    specialQuests,
    classAscension: { ...base.classAscension, ...(source.classAscension || {}) },
    racialEvolution: { ...base.racialEvolution, ...(source.racialEvolution || {}) },
    notificationHistory: Array.isArray(source.notificationHistory) ? source.notificationHistory.slice(-50) : [],
  };
}

export function unlockGuild(state, context = {}) {
  const eligible = state?.guild?.status === "OPEN" || isGuildUnlockCondition(context);
  const next = normalizePostRegion3State(state, context);
  if (!eligible) return { changed: false, state: next };
  if (state?.guild?.status === "OPEN") return { changed: false, state: next };
  return {
    changed: true,
    state: {
      ...next,
      guild: { ...next.guild, status: "OPEN", unlockedAt: next.guild.unlockedAt || Date.now() },
      contracts: Object.fromEntries(Object.entries(next.contracts).map(([id, contract]) => [id, contract.status === "LOCKED" ? { ...contract, status: "AVAILABLE" } : contract])),
      notificationHistory: [...next.notificationHistory, { id: `guild-open-${Date.now()}`, type: "guild_unlocked", at: Date.now() }].slice(-50),
    },
  };
}

export function acceptGuildContract(state, contractId) {
  const def = GUILD_CONTRACT_DEFINITIONS[contractId];
  if (!def) return { changed: false, state, reason: "Contrato desconocido." };
  const current = state?.contracts?.[contractId];
  if (!current || current.status !== "AVAILABLE") return { changed: false, state, reason: "El contrato no está disponible." };
  return {
    changed: true,
    state: { ...state, contracts: { ...state.contracts, [contractId]: { ...current, status: "ACTIVE", acceptedAt: Date.now() } } },
  };
}

function advanceObjectiveState(current, def, event) {
  if (!current || current.status !== "ACTIVE" || def.objective.type !== event.type) return current;
  const amount = Math.max(1, Number(event.amount) || 1);
  const progress = Math.min(def.objective.count, (current.progress || 0) + amount);
  return { ...current, progress, status: progress >= def.objective.count ? "READY" : "ACTIVE", completedAt: progress >= def.objective.count ? Date.now() : current.completedAt };
}

export function recordPostRegion3Event(state, event) {
  if (!state || state.guild?.status !== "OPEN" || !event?.type) return { changed: false, state };
  let changed = false;
  const contracts = { ...state.contracts };
  for (const def of Object.values(GUILD_CONTRACT_DEFINITIONS)) {
    const next = advanceObjectiveState(contracts[def.id], def, event);
    if (next !== contracts[def.id]) { contracts[def.id] = next; changed = true; }
  }
  const specialQuests = { ...state.specialQuests };
  for (const def of Object.values(SPECIAL_QUEST_DEFINITIONS)) {
    const next = advanceObjectiveState(specialQuests[def.id], def, event);
    if (next !== specialQuests[def.id]) { specialQuests[def.id] = next; changed = true; }
  }

  const learned = new Set(state.masteries?.learnedSkillIds || []);
  const skillProgress = { ...(state.masteries?.skillProgress || {}) };
  const incrementUse = (skillId, amount = 1) => {
    if (!skillId || !learned.has(skillId) || !POST_REGION3_SKILLS[skillId]) return;
    const current = normalizeSkillProgress(skillId, skillProgress[skillId]);
    skillProgress[skillId] = { ...current, uses: current.uses + Math.max(1, Number(amount) || 1) };
    changed = true;
  };
  if (event.type === "skill_use") incrementUse(event.skillId, event.amount);
  if (event.type === "combat_win") {
    const equippedPassives = [...new Set(Object.values(state.masteries?.equippedPassive || {}).filter(Boolean))];
    for (const skillId of equippedPassives) incrementUse(skillId, event.amount);
  }

  return changed ? { changed: true, state: { ...state, contracts, specialQuests, masteries: { ...state.masteries, skillProgress } } } : { changed: false, state };
}

export function claimGuildContract(state, contractId, playerClass) {
  const def = GUILD_CONTRACT_DEFINITIONS[contractId];
  const current = state?.contracts?.[contractId];
  if (!def || !current || current.status !== "READY") return { changed: false, state, rewardSkillIds: [], reason: "El contrato todavía no está listo." };
  const rewardSkillIds = contractId === GUILD_INTRO_CONTRACT_ID ? classGuildRewardIds(playerClass) : [];
  const learnedSkillIds = uniqueStrings([...(state.masteries?.learnedSkillIds || []), ...rewardSkillIds]);
  const skillProgress = ensureLearnedSkillProgress(state.masteries, learnedSkillIds);
  const next = {
    ...state,
    guild: {
      ...state.guild,
      reputation: (state.guild.reputation || 0) + (def.reputation || 0),
      introCompleted: state.guild.introCompleted || contractId === GUILD_INTRO_CONTRACT_ID,
    },
    masteries: { ...state.masteries, learnedSkillIds, skillProgress },
    contracts: { ...state.contracts, [contractId]: { ...current, status: "COMPLETED", claimedAt: Date.now() } },
  };
  return { changed: true, state: next, rewardSkillIds };
}

export function equipMasterySkill(state, slot, skillId) {
  const def = POST_REGION3_SKILLS[skillId];
  if (!def || def.category !== "active") return { changed: false, state, reason: "La técnica no es equipable en un espacio activo." };
  if (!(state?.masteries?.learnedSkillIds || []).includes(skillId)) return { changed: false, state, reason: "La técnica todavía no ha sido aprendida." };
  if (def.slot !== slot) return { changed: false, state, reason: "La técnica pertenece a otro tipo de espacio." };
  return { changed: true, state: { ...state, masteries: { ...state.masteries, equippedActive: { ...state.masteries.equippedActive, [slot]: skillId } } } };
}

export function unequipMasterySkill(state, slot) {
  if (!state?.masteries?.equippedActive || !(slot in state.masteries.equippedActive)) return { changed: false, state };
  return { changed: true, state: { ...state, masteries: { ...state.masteries, equippedActive: { ...state.masteries.equippedActive, [slot]: null } } } };
}

export function equipMasteryPassive(state, slot, skillId) {
  const def = POST_REGION3_SKILLS[skillId];
  if (!def || def.category !== "passive") return { changed: false, state, reason: "La maestría no es una pasiva." };
  if (!(state?.masteries?.learnedSkillIds || []).includes(skillId)) return { changed: false, state, reason: "La pasiva todavía no ha sido aprendida." };
  if (!Object.prototype.hasOwnProperty.call(state.masteries.equippedPassive || {}, slot)) return { changed: false, state, reason: "Espacio pasivo desconocido." };
  const equippedPassive = { ...state.masteries.equippedPassive };
  for (const key of Object.keys(equippedPassive)) if (equippedPassive[key] === skillId) equippedPassive[key] = null;
  equippedPassive[slot] = skillId;
  return { changed: true, state: { ...state, masteries: { ...state.masteries, equippedPassive } } };
}

export function unequipMasteryPassive(state, slot) {
  if (!state?.masteries?.equippedPassive || !(slot in state.masteries.equippedPassive)) return { changed: false, state };
  return { changed: true, state: { ...state, masteries: { ...state.masteries, equippedPassive: { ...state.masteries.equippedPassive, [slot]: null } } } };
}

export function resolveMasteryDefinition(state, skillId) {
  const def = POST_REGION3_SKILLS[skillId];
  if (!def) return null;
  const progress = normalizeSkillProgress(skillId, state?.masteries?.skillProgress?.[skillId]);
  const eligibility = canUpgradeMasterySkill(state, skillId);
  return { ...applyMasteryRank(def, progress), canUpgrade: eligibility.eligible, upgradeReason: eligibility.reason };
}

export function canUpgradeMasterySkill(state, skillId) {
  const def = POST_REGION3_SKILLS[skillId];
  if (!def) return { eligible: false, reason: "Maestría desconocida." };
  if (!(state?.masteries?.learnedSkillIds || []).includes(skillId)) return { eligible: false, reason: "La Maestría todavía no ha sido aprendida." };
  const progress = normalizeSkillProgress(skillId, state?.masteries?.skillProgress?.[skillId]);
  const maxRank = Math.max(1, Number(def.maxRank) || 1);
  if (progress.rank >= maxRank) return { eligible: false, reason: "La Maestría ya alcanzó su rango máximo.", progress };
  const requirement = def.upgradeRequirement || {};
  const requiredUses = Math.max(0, Number(requirement.uses) || 0);
  if (progress.uses < requiredUses) return { eligible: false, reason: `Dominio insuficiente: ${progress.uses}/${requiredUses} usos.`, progress };
  if (requirement.contractId && state?.contracts?.[requirement.contractId]?.status !== "COMPLETED") {
    return { eligible: false, reason: "Debes completar el contrato Registro de mazmorra.", progress };
  }
  return { eligible: true, reason: null, progress };
}

export function upgradeMasterySkill(state, skillId) {
  const eligibility = canUpgradeMasterySkill(state, skillId);
  if (!eligibility.eligible) return { changed: false, state, reason: eligibility.reason };
  const nextProgress = { ...eligibility.progress, rank: eligibility.progress.rank + 1, upgradedAt: Date.now() };
  return { changed: true, skill: applyMasteryRank(POST_REGION3_SKILLS[skillId], nextProgress), state: { ...state, masteries: { ...state.masteries, skillProgress: { ...state.masteries.skillProgress, [skillId]: nextProgress } } } };
}

export function getEquippedMasterySkill(state, slot) {
  const id = state?.masteries?.equippedActive?.[slot];
  return id ? resolveMasteryDefinition(state, id) : null;
}

export function resolveMasterySkillSet(baseSkills, state) {
  if (!baseSkills || state?.guild?.status !== "OPEN") return baseSkills;
  const result = { ...baseSkills };
  for (const slot of ["classAbility", "hybrid", "definitive"]) {
    const skill = getEquippedMasterySkill(state, slot);
    if (skill) result[slot] = { ...skill };
  }
  return result;
}

export function getEquippedMasteryPassiveBonuses(player) {
  const ids = Object.values(player?.masteryLoadout?.equippedPassive || {}).filter(Boolean);
  const total = { atk: 0, physDef: 0, magDef: 0, maxHp: 0, maxMp: 0, crit: 0, speed: 0, passives: [] };
  for (const id of ids) {
    const def = applyMasteryRank(POST_REGION3_SKILLS[id], player?.masteryLoadout?.skillProgress?.[id]);
    if (!def || def.category !== "passive") continue;
    const bonus = def.bonus || {};
    total.atk += bonus.atk || 0;
    total.physDef += bonus.physDef || 0;
    total.magDef += bonus.magDef || 0;
    total.maxHp += bonus.maxHp || 0;
    total.maxMp += bonus.maxMp || 0;
    total.crit += bonus.crit || 0;
    total.speed += bonus.speed || 0;
    total.passives.push({ type: "mastery", id, desc: def.desc, rank: def.rank });
  }
  return total;
}

export function syncPlayerMasteryLoadout(player, state) {
  if (!player) return player;
  return {
    ...player,
    masteryLoadout: {
      learnedSkillIds: [...(state?.masteries?.learnedSkillIds || [])],
      equippedActive: { ...(state?.masteries?.equippedActive || {}) },
      equippedPassive: { ...(state?.masteries?.equippedPassive || {}) },
      skillProgress: { ...(state?.masteries?.skillProgress || {}) },
    },
  };
}

export function evaluateSpecialQuestActivations(state, { regionId, threat = 0, now = Date.now() } = {}) {
  if (!state || state.guild?.status !== "OPEN") return { changed: false, state, activated: [] };
  const regionNumber = getAtlasRegionNumber(regionId) || 0;
  if (regionNumber < 4) return { changed: false, state, activated: [] };
  const specialQuests = { ...state.specialQuests };
  const activated = [];
  for (const def of Object.values(SPECIAL_QUEST_DEFINITIONS)) {
    const current = specialQuests[def.id] || specialQuestState(def);
    if (current.status !== "LOCKED") continue;
    if (def.regionId !== regionId) continue;
    if (threat < (def.trigger?.minimumThreat || 0)) continue;
    specialQuests[def.id] = { ...current, status: "AVAILABLE", activatedAt: now, notificationSeen: false };
    activated.push(def.id);
  }
  if (!activated.length) return { changed: false, state, activated };
  return {
    changed: true,
    activated,
    state: {
      ...state,
      specialQuests,
      notificationHistory: [...state.notificationHistory, ...activated.map((id) => ({ id: `special-${id}-${now}`, type: "special_quest_activated", questId: id, at: now }))].slice(-50),
    },
  };
}

export function acceptSpecialQuest(state, questId) {
  const def = SPECIAL_QUEST_DEFINITIONS[questId];
  const current = state?.specialQuests?.[questId];
  if (!def || !current || current.status !== "AVAILABLE") return { changed: false, state, reason: "La misión especial no está disponible." };
  return { changed: true, state: { ...state, specialQuests: { ...state.specialQuests, [questId]: { ...current, status: "ACTIVE", acceptedAt: Date.now(), notificationSeen: true } } } };
}

export function claimSpecialQuest(state, questId) {
  const def = SPECIAL_QUEST_DEFINITIONS[questId];
  const current = state?.specialQuests?.[questId];
  if (!def || !current || current.status !== "READY") return { changed: false, state, rewardSkillIds: [], reason: "La misión especial todavía no está lista." };
  const rewardSkillIds = def.hiddenRewardSkillId ? [def.hiddenRewardSkillId] : [];
  const learnedSkillIds = uniqueStrings([...(state.masteries?.learnedSkillIds || []), ...rewardSkillIds]);
  const skillProgress = ensureLearnedSkillProgress(state.masteries, learnedSkillIds);
  return {
    changed: true,
    rewardSkillIds,
    state: {
      ...state,
      masteries: { ...state.masteries, learnedSkillIds, skillProgress },
      specialQuests: { ...state.specialQuests, [questId]: { ...current, status: "COMPLETED", claimedAt: Date.now() } },
    },
  };
}

export function getProgressionDisplayData(state) {
  const safe = state || createPostRegion3State();
  return {
    guildOpen: safe.guild?.status === "OPEN",
    contracts: Object.values(GUILD_CONTRACT_DEFINITIONS).map((def) => ({ def, state: safe.contracts?.[def.id] || contractState(def) })),
    specialQuests: Object.values(SPECIAL_QUEST_DEFINITIONS).map((def) => ({ def, state: safe.specialQuests?.[def.id] || specialQuestState(def) })),
    learnedSkills: (safe.masteries?.learnedSkillIds || []).map((id) => resolveMasteryDefinition(safe, id)).filter(Boolean),
  };
}
