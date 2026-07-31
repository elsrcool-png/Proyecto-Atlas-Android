import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recomputePlayer } from "@/lib/atlasSkills";
import { getSkillSet } from "@/lib/atlasSkillDesign";
import { getWeaponAbility, getLootWeaponAbility } from "@/lib/atlasWeapons";
import { WEAPONS } from "@/lib/atlasLoot";
import { resolveWeaponDefId } from "@/lib/atlasWeaponInstances";
import {
  POST_REGION3_SKILLS,
  SPECIAL_QUEST_DEFINITIONS,
  createPostRegion3State,
  normalizePostRegion3State,
  unlockGuild,
  acceptGuildContract as acceptGuildContractState,
  claimGuildContract as claimGuildContractState,
  recordPostRegion3Event as recordPostRegion3EventState,
  equipMasterySkill as equipMasterySkillState,
  unequipMasterySkill as unequipMasterySkillState,
  equipMasteryPassive as equipMasteryPassiveState,
  unequipMasteryPassive as unequipMasteryPassiveState,
  upgradeMasterySkill as upgradeMasterySkillState,
  evaluateSpecialQuestActivations,
  acceptSpecialQuest as acceptSpecialQuestState,
  claimSpecialQuest as claimSpecialQuestState,
  resolveMasterySkillSet,
  syncPlayerMasteryLoadout,
  getProgressionDisplayData,
  GUILD_UNLOCK_FLAG,
} from "@/lib/atlasPostRegion3Progression";

const noop = () => {};

export default function useAtlasPostRegion3Progression({
  player,
  playerRef,
  setPlayer,
  worldFlags,
  setWorldFlags,
  worldFlagsRef,
  defeatedBosses,
  regionId,
  threat,
  bridgeRef,
}) {
  const [progressionState, setProgressionState] = useState(() => createPostRegion3State());
  const progressionStateRef = useRef(progressionState);
  useEffect(() => { progressionStateRef.current = progressionState; }, [progressionState]);

  const feedback = useCallback((method, ...args) => {
    const fn = bridgeRef?.current?.[method];
    return (typeof fn === "function" ? fn : noop)(...args);
  }, [bridgeRef]);
  const persist = useCallback((extra) => {
    const fn = bridgeRef?.current?.persist;
    if (typeof fn === "function") fn(extra);
  }, [bridgeRef]);

  const replaceProgressionState = useCallback((nextState, { syncPlayer = true } = {}) => {
    if (!nextState) return progressionStateRef.current;
    progressionStateRef.current = nextState;
    setProgressionState(nextState);
    if (syncPlayer && playerRef.current) {
      const synced = recomputePlayer(syncPlayerMasteryLoadout(playerRef.current, nextState));
      playerRef.current = synced;
      setPlayer(synced);
    }
    return nextState;
  }, [playerRef, setPlayer]);

  const recordProgressionEvent = useCallback((event) => {
    const before = progressionStateRef.current;
    const result = recordPostRegion3EventState(before, event);
    if (!result.changed) return false;
    replaceProgressionState(result.state, { syncPlayer: false });
    persist({ progressionState: result.state, player: playerRef.current });
    const display = getProgressionDisplayData(result.state);
    for (const [id, nextContract] of Object.entries(result.state.contracts || {})) {
      if (before?.contracts?.[id]?.status !== "READY" && nextContract.status === "READY") {
        const title = display.contracts.find((entry) => entry.def.id === id)?.def.title || "Contrato";
        feedback("toast", `Contrato listo: ${title}`, "mission");
        feedback("pushLog", `◆ Contrato del Gremio listo para reclamar: ${title}.`);
      }
    }
    for (const [id, nextQuest] of Object.entries(result.state.specialQuests || {})) {
      if (before?.specialQuests?.[id]?.status !== "READY" && nextQuest.status === "READY") {
        const title = SPECIAL_QUEST_DEFINITIONS[id]?.title || "Misión especial";
        feedback("toast", `Misión especial lista: ${title}`, "mission");
        feedback("pushLog", `◆ La misión especial «${title}» está lista para completarse.`);
      }
    }
    return true;
  }, [feedback, persist, playerRef, replaceProgressionState]);

  const acceptGuildContract = useCallback((contractId) => {
    const result = acceptGuildContractState(progressionStateRef.current, contractId);
    if (!result.changed) { if (result.reason) feedback("toast", result.reason, "info"); return false; }
    replaceProgressionState(result.state, { syncPlayer: false });
    const title = getProgressionDisplayData(result.state).contracts.find((entry) => entry.def.id === contractId)?.def.title || "Contrato";
    feedback("toast", `Contrato aceptado: ${title}`, "mission");
    feedback("pushLog", `▶ Contrato del Gremio: ${title}.`);
    persist({ progressionState: result.state });
    return true;
  }, [feedback, persist, replaceProgressionState]);

  const claimGuildContract = useCallback((contractId) => {
    const result = claimGuildContractState(progressionStateRef.current, contractId, playerRef.current?.class);
    if (!result.changed) { if (result.reason) feedback("toast", result.reason, "info"); return false; }
    replaceProgressionState(result.state);
    const names = result.rewardSkillIds.map((id) => POST_REGION3_SKILLS[id]?.name).filter(Boolean);
    feedback("toast", names.length ? `Maestrías aprendidas: ${names.join(" · ")}` : "Contrato completado", "levelup");
    feedback("pushLog", names.length ? `✦ El Gremio registra nuevas Maestrías: ${names.join(", ")}.` : "✦ Contrato del Gremio completado.");
    persist({ progressionState: result.state, player: playerRef.current });
    return true;
  }, [feedback, persist, playerRef, replaceProgressionState]);

  const equipMasterySkill = useCallback((slot, skillId = null) => {
    const current = progressionStateRef.current?.masteries?.equippedActive?.[slot] || null;
    const result = current === skillId || !skillId
      ? unequipMasterySkillState(progressionStateRef.current, slot)
      : equipMasterySkillState(progressionStateRef.current, slot, skillId);
    if (!result.changed) { if (result.reason) feedback("toast", result.reason, "info"); return false; }
    replaceProgressionState(result.state);
    feedback("toast", skillId && current !== skillId ? `Técnica equipada: ${POST_REGION3_SKILLS[skillId]?.name || skillId}` : "Técnica original restaurada", "equip");
    persist({ progressionState: result.state, player: playerRef.current });
    return true;
  }, [feedback, persist, playerRef, replaceProgressionState]);

  const equipMasteryPassive = useCallback((slot, skillId = null) => {
    const current = progressionStateRef.current?.masteries?.equippedPassive?.[slot] || null;
    const result = current === skillId || !skillId
      ? unequipMasteryPassiveState(progressionStateRef.current, slot)
      : equipMasteryPassiveState(progressionStateRef.current, slot, skillId);
    if (!result.changed) { if (result.reason) feedback("toast", result.reason, "info"); return false; }
    replaceProgressionState(result.state);
    feedback("toast", skillId && current !== skillId ? `Pasiva equipada: ${POST_REGION3_SKILLS[skillId]?.name || skillId}` : "Pasiva retirada", "equip");
    persist({ progressionState: result.state, player: playerRef.current });
    return true;
  }, [feedback, persist, playerRef, replaceProgressionState]);

  const upgradeMasterySkill = useCallback((skillId) => {
    const result = upgradeMasterySkillState(progressionStateRef.current, skillId);
    if (!result.changed) { if (result.reason) feedback("toast", result.reason, "info"); return false; }
    replaceProgressionState(result.state);
    feedback("toast", `${result.skill?.name || "Maestría"} alcanza Rango ${result.skill?.rank || 2}`, "levelup");
    feedback("pushLog", `✦ Maestría evolucionada: ${result.skill?.name || skillId}, Rango ${result.skill?.rank || 2}.`);
    persist({ progressionState: result.state, player: playerRef.current });
    return true;
  }, [feedback, persist, playerRef, replaceProgressionState]);

  const recordMasterySkillUse = useCallback((skillId) => recordProgressionEvent({ type: "skill_use", skillId }), [recordProgressionEvent]);

  const acceptSpecialQuest = useCallback((questId) => {
    const result = acceptSpecialQuestState(progressionStateRef.current, questId);
    if (!result.changed) { if (result.reason) feedback("toast", result.reason, "info"); return false; }
    replaceProgressionState(result.state, { syncPlayer: false });
    feedback("toast", `Misión especial activada: ${SPECIAL_QUEST_DEFINITIONS[questId]?.title || questId}`, "mission");
    persist({ progressionState: result.state });
    return true;
  }, [feedback, persist, replaceProgressionState]);

  const claimSpecialQuest = useCallback((questId) => {
    const result = claimSpecialQuestState(progressionStateRef.current, questId);
    if (!result.changed) { if (result.reason) feedback("toast", result.reason, "info"); return false; }
    replaceProgressionState(result.state);
    const names = result.rewardSkillIds.map((id) => POST_REGION3_SKILLS[id]?.name).filter(Boolean);
    feedback("toast", names.length ? `Poder descubierto: ${names.join(" · ")}` : "Misión especial completada", "boss");
    persist({ progressionState: result.state, player: playerRef.current });
    return true;
  }, [feedback, persist, playerRef, replaceProgressionState]);

  useEffect(() => {
    const result = unlockGuild(progressionStateRef.current, { worldFlags, defeatedBossIds: [...defeatedBosses] });
    if (!result.changed) return;
    replaceProgressionState(result.state);
    const nextFlags = worldFlags[GUILD_UNLOCK_FLAG] ? worldFlags : { ...worldFlags, [GUILD_UNLOCK_FLAG]: true };
    worldFlagsRef.current = nextFlags;
    if (nextFlags !== worldFlags) setWorldFlags(nextFlags);
    feedback("toast", "Gremio de Aventureros desbloqueado", "levelup");
    feedback("pushLog", "✦ Termina el prólogo. El Gremio abre contratos, Maestrías y progresión condicionada por el mundo.");
    persist({ progressionState: result.state, worldFlags: nextFlags, player: playerRef.current });
  }, [defeatedBosses, feedback, persist, playerRef, replaceProgressionState, setWorldFlags, worldFlags, worldFlagsRef]);

  useEffect(() => {
    const result = evaluateSpecialQuestActivations(progressionStateRef.current, { regionId, threat });
    if (!result.changed) return;
    replaceProgressionState(result.state, { syncPlayer: false });
    for (const questId of result.activated) {
      const def = SPECIAL_QUEST_DEFINITIONS[questId];
      feedback("toast", `Evento de Amenaza detectado: ${def?.title || questId}`, "boss");
      feedback("pushLog", `◆ Nueva misión especial: ${def?.title || questId}. ${def?.rumorText || "Se rumorea que hay un poder oculto..."}`);
    }
    persist({ progressionState: result.state });
  }, [feedback, persist, regionId, replaceProgressionState, threat, progressionState.guild?.status]);

  const skills = useMemo(() => {
    if (!player) return null;
    const base = {
      ...(getSkillSet(player) || {}),
      weapon: getWeaponAbility(player) || getLootWeaponAbility(player?.weapon ? WEAPONS[resolveWeaponDefId(player, player.weapon)] : null),
    };
    return resolveMasterySkillSet(base, progressionState);
  }, [player, progressionState]);

  return {
    progressionState,
    progressionStateRef,
    progressionDisplay: useMemo(() => getProgressionDisplayData(progressionState), [progressionState]),
    skills,
    recordProgressionEvent,
    acceptGuildContract,
    claimGuildContract,
    equipMasterySkill,
    equipMasteryPassive,
    upgradeMasterySkill,
    recordMasterySkillUse,
    acceptSpecialQuest,
    claimSpecialQuest,
    replaceProgressionState,
    createProgressionState: createPostRegion3State,
    normalizeProgressionState: normalizePostRegion3State,
    syncProgressionPlayer: syncPlayerMasteryLoadout,
  };
}
