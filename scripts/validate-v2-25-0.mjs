import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const checks = [];
const ok = async (name, fn) => {
  await fn();
  checks.push(name);
  console.log(`✓ ${name}`);
};

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}
globalThis.localStorage = new MemoryStorage();

const progression = await import("../src/lib/atlasPostRegion3Progression.js");
const saveApi = await import("../src/lib/atlasSave.js");
const skillsApi = await import("../src/lib/atlasSkills.js");

await ok("el Gremio permanece bloqueado antes de cerrar Región 3", () => {
  const state = progression.createPostRegion3State();
  const result = progression.unlockGuild(state, { worldFlags: {}, defeatedBossIds: [] });
  assert.equal(result.changed, false);
  assert.equal(result.state.guild.status, "LOCKED");
  for (const contract of Object.values(result.state.contracts)) assert.equal(contract.status, "LOCKED");
});

await ok("cerrar Región 3 desbloquea Gremio y contratos una sola vez", () => {
  const state = progression.createPostRegion3State();
  const first = progression.unlockGuild(state, { worldFlags: { "desierto:completed": true } });
  assert.equal(first.changed, true);
  assert.equal(first.state.guild.status, "OPEN");
  assert.ok(Object.values(first.state.contracts).every((contract) => contract.status === "AVAILABLE"));
  const second = progression.unlockGuild(first.state, { worldFlags: { "desierto:completed": true } });
  assert.equal(second.changed, false);
  assert.equal(second.state.notificationHistory.length, first.state.notificationHistory.length);
});

await ok("prueba inicial del Gremio progresa, entrega maestrías y no duplica", () => {
  let state = progression.createPostRegion3State({ guildUnlocked: true });
  let result = progression.acceptGuildContract(state, progression.GUILD_INTRO_CONTRACT_ID);
  assert.equal(result.changed, true);
  state = result.state;
  for (let i = 0; i < 3; i += 1) state = progression.recordPostRegion3Event(state, { type: "combat_win" }).state;
  assert.equal(state.contracts[progression.GUILD_INTRO_CONTRACT_ID].status, "READY");
  const claimed = progression.claimGuildContract(state, progression.GUILD_INTRO_CONTRACT_ID, "Guerrero");
  assert.equal(claimed.changed, true);
  assert.deepEqual(claimed.rewardSkillIds, ["guild_breaker_guerrero", "guild_guarded_stance"]);
  assert.equal(new Set(claimed.state.masteries.learnedSkillIds).size, claimed.state.masteries.learnedSkillIds.length);
  const repeated = progression.claimGuildContract(claimed.state, progression.GUILD_INTRO_CONTRACT_ID, "Guerrero");
  assert.equal(repeated.changed, false);
});

await ok("las Maestrías evolucionan por uso demostrado y contrato, no por nivel", () => {
  let state = progression.createPostRegion3State({ guildUnlocked: true });
  state = progression.acceptGuildContract(state, progression.GUILD_INTRO_CONTRACT_ID).state;
  for (let i = 0; i < 3; i += 1) state = progression.recordPostRegion3Event(state, { type: "combat_win" }).state;
  state = progression.claimGuildContract(state, progression.GUILD_INTRO_CONTRACT_ID, "Guerrero").state;
  assert.equal(state.masteries.skillProgress.guild_breaker_guerrero.rank, 1);
  assert.equal(state.masteries.skillProgress.guild_guarded_stance.rank, 1);
  state = progression.equipMasterySkill(state, "classAbility", "guild_breaker_guerrero").state;
  state = progression.equipMasteryPassive(state, "passive1", "guild_guarded_stance").state;
  state = progression.acceptGuildContract(state, "guild:dungeon_record").state;
  state = progression.recordPostRegion3Event(state, { type: "dungeon_complete" }).state;
  state = progression.claimGuildContract(state, "guild:dungeon_record", "Guerrero").state;
  for (let i = 0; i < 5; i += 1) {
    state = progression.recordPostRegion3Event(state, { type: "skill_use", skillId: "guild_breaker_guerrero" }).state;
    state = progression.recordPostRegion3Event(state, { type: "combat_win" }).state;
  }
  assert.equal(progression.canUpgradeMasterySkill(state, "guild_breaker_guerrero").eligible, true);
  assert.equal(progression.canUpgradeMasterySkill(state, "guild_guarded_stance").eligible, true);
  state = progression.upgradeMasterySkill(state, "guild_breaker_guerrero").state;
  state = progression.upgradeMasterySkill(state, "guild_guarded_stance").state;
  const resolved = progression.resolveMasterySkillSet({ classAbility: { name: "Original", cost: 99 } }, state);
  assert.equal(resolved.classAbility.rank, 2);
  assert.equal(resolved.classAbility.cost, 3);
  const player = progression.syncPlayerMasteryLoadout({ race: "Humano", class: "Guerrero", level: 20 }, state);
  assert.equal(progression.getEquippedMasteryPassiveBonuses(player).physDef, 2);
  assert.equal(progression.canUpgradeMasterySkill(state, "guild_breaker_guerrero").eligible, false);
});

await ok("equipar reemplaza configuración sin borrar conocimientos", () => {
  let state = progression.createPostRegion3State({ guildUnlocked: true });
  state = {
    ...state,
    masteries: {
      ...state.masteries,
      learnedSkillIds: ["guild_breaker_guerrero", "guild_guarded_stance"],
    },
  };
  const wrong = progression.equipMasterySkill(state, "hybrid", "guild_breaker_guerrero");
  assert.equal(wrong.changed, false);
  const active = progression.equipMasterySkill(state, "classAbility", "guild_breaker_guerrero");
  assert.equal(active.changed, true);
  assert.equal(active.state.masteries.equippedActive.classAbility, "guild_breaker_guerrero");
  assert.ok(active.state.masteries.learnedSkillIds.includes("guild_breaker_guerrero"));
  const passive = progression.equipMasteryPassive(active.state, "passive1", "guild_guarded_stance");
  assert.equal(passive.changed, true);
  const player = progression.syncPlayerMasteryLoadout({ race: "Humano", class: "Guerrero", level: 1 }, passive.state);
  const bonuses = progression.getEquippedMasteryPassiveBonuses(player);
  assert.equal(bonuses.physDef, 1);
  assert.ok(bonuses.passives.some((entry) => entry.id === "guild_guarded_stance"));
});

await ok("la técnica equipada reemplaza solo su espacio de combate", () => {
  const base = {
    basic: { name: "Ataque" },
    classAbility: { name: "Original" },
    hybrid: { name: "Híbrida" },
    definitive: { name: "Definitiva" },
  };
  let state = progression.createPostRegion3State({ guildUnlocked: true });
  state = {
    ...state,
    masteries: {
      ...state.masteries,
      learnedSkillIds: ["guild_breaker_guerrero"],
      equippedActive: { ...state.masteries.equippedActive, classAbility: "guild_breaker_guerrero" },
    },
  };
  const resolved = progression.resolveMasterySkillSet(base, state);
  assert.equal(resolved.classAbility.name, "Golpe Quebrador");
  assert.equal(resolved.hybrid.name, "Híbrida");
  assert.equal(resolved.basic.name, "Ataque");
});

await ok("misiones de Amenaza no se activan en Regiones 1–3", () => {
  const state = progression.createPostRegion3State({ guildUnlocked: true });
  const result = progression.evaluateSpecialQuestActivations(state, { regionId: "desierto", threat: 10, now: 1000 });
  assert.equal(result.changed, false);
  assert.deepEqual(result.activated, []);
});

await ok("Amenaza regional registra y notifica una misión especial persistente", () => {
  const state = progression.createPostRegion3State({ guildUnlocked: true });
  const result = progression.evaluateSpecialQuestActivations(state, { regionId: "tempestuosa", threat: 6, now: 1234 });
  assert.equal(result.changed, true);
  assert.deepEqual(result.activated, ["threat:r4_pulse"]);
  const quest = result.state.specialQuests["threat:r4_pulse"];
  assert.equal(quest.status, "AVAILABLE");
  assert.equal(quest.notificationSeen, false);
  assert.ok(result.state.notificationHistory.some((entry) => entry.questId === "threat:r4_pulse"));
  const repeated = progression.evaluateSpecialQuestActivations(result.state, { regionId: "tempestuosa", threat: 10, now: 1500 });
  assert.equal(repeated.changed, false);
});

await ok("misión especial oculta su recompensa hasta completarse", () => {
  let state = progression.createPostRegion3State({ guildUnlocked: true });
  state = progression.evaluateSpecialQuestActivations(state, { regionId: "tempestuosa", threat: 6, now: 1234 }).state;
  assert.equal(progression.getProgressionDisplayData(state).specialQuests.find((entry) => entry.def.id === "threat:r4_pulse").def.hiddenRewardSkillId, "threat_pulse_mastery");
  state = progression.acceptSpecialQuest(state, "threat:r4_pulse").state;
  for (let i = 0; i < 4; i += 1) state = progression.recordPostRegion3Event(state, { type: "combat_win" }).state;
  assert.equal(state.specialQuests["threat:r4_pulse"].status, "READY");
  const claim = progression.claimSpecialQuest(state, "threat:r4_pulse");
  assert.equal(claim.changed, true);
  assert.deepEqual(claim.rewardSkillIds, ["threat_pulse_mastery"]);
  assert.ok(claim.state.masteries.learnedSkillIds.includes("threat_pulse_mastery"));
});

await ok("guardado v7 migra a v8 y conserva la progresión", () => {
  const oldSave = {
    saveVersion: 7,
    player: { race: "Humano", class: "Guerrero", level: 5, baseMaxHp: 12, maxHp: 12, hp: 12, baseAttack: 4, attack: 4, baseDefense: 2, defense: 2, baseMaxMp: 6, maxMp: 6, mp: 6 },
    lastRegionId: "desierto",
    lastSectorId: "C3",
    worldFlags: { "desierto:completed": true },
    worldState: { currentRegionId: "desierto", currentNodeId: "C3", unlockedRegionIds: ["verde", "fria", "desierto"], globalFlags: { "desierto:completed": true } },
  };
  const migrated = saveApi.migrateSaveV8(oldSave);
  assert.equal(migrated.saveVersion, 8);
  assert.equal(migrated.progressionState.guild.status, "OPEN");
  assert.ok(migrated.player.masteryLoadout);
  const twice = saveApi.migrateSaveV8(migrated);
  assert.deepEqual(twice, migrated);
});

await ok("ranuras escriben v8 y restauran progresión", () => {
  saveApi.setActiveSaveSlot(2);
  const state = progression.createPostRegion3State({ guildUnlocked: true });
  assert.equal(saveApi.saveToSlot(2, { player: { race: "Elfo", class: "Mago" }, progressionState: state, lastRegionId: "desierto", lastSectorId: "C3" }), true);
  const raw = JSON.parse(localStorage.getItem("atlas_save_slot_2"));
  assert.equal(raw.saveVersion, 8);
  const loaded = saveApi.loadSlot(2);
  assert.equal(loaded.progressionState.guild.status, "OPEN");
});

await ok("bonificaciones pasivas se integran al cálculo del personaje", () => {
  const player = {
    race: "Humano", class: "Guerrero", level: 1,
    baseMaxHp: 12, maxHp: 12, hp: 12,
    baseAttack: 4, attack: 4,
    baseDefense: 2, defense: 2,
    baseMagicalDefense: 2,
    baseMaxMp: 6, maxMp: 6, mp: 6,
    masteryLoadout: { equippedPassive: { passive1: "guild_guarded_stance", passive2: null } },
  };
  const recomputed = skillsApi.recomputePlayer(player);
  assert.equal(recomputed.physicalDefense, 3);
});

await ok("UI expone Gremio, Maestrías y misiones especiales sin dados", () => {
  const hub = read("src/components/atlas/PlayerHub.jsx");
  const guild = read("src/components/atlas/hub/HubGuild.jsx");
  const masteries = read("src/components/atlas/hub/HubMasteries.jsx");
  const journal = read("src/components/atlas/MissionJournal.jsx");
  assert.match(hub, /HubGuild/);
  assert.match(hub, /HubMasteries/);
  assert.match(guild, /Recompensa: desconocida/);
  assert.match(masteries, /Registro de Maestrías/);
  assert.match(masteries, /Evolucionar/);
  assert.match(masteries, /onUpgradeSkill/);
  assert.match(read("src/lib/createAtlasCombatActions.js"), /onMasterySkillUsed/);
  assert.match(read("src/lib/atlasSkillStatusHints.js"), /Golpe Quebrador/);
  assert.match(journal, /Especiales \/ Amenaza/);
});

await ok("la campaña de tres regiones termina como prólogo, no como victoria final", () => {
  const session = read("src/hooks/useAtlasSession.js");
  assert.match(session, /El prólogo de las tres regiones queda completo/);
  const claimStart = session.indexOf("const claimMission");
  const claimEnd = session.indexOf("// Red de seguridad de campaña", claimStart);
  const claimBlock = session.slice(claimStart, claimEnd);
  assert.doesNotMatch(claimBlock, /setStatus\(["']victory["']\)/);
});

console.log(`\nVALIDACIÓN ATLAS v2.25.0 CORRECTA (${checks.length} bloques)`);
console.log("- Gremio posterior a Región 3 y contratos validados");
console.log("- Maestrías aprendibles, equipables, evolucionables y persistentes validadas");
console.log("- misiones especiales por Amenaza notificadas y protegidas contra duplicados");
console.log("- guardados v7 → v8 compatibles e idempotentes");
