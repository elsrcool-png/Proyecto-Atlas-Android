import React, { useState, useRef, useMemo, useEffect } from "react";
import { REGIONS, MONSTERS } from "@/lib/atlasData";
import { recomputePlayer, ACCESSORIES, STARTER_ACCESSORIES, BOSS_DROPS, CLASS_OFF_TYPE } from "@/lib/atlasSkills";
import { makeWeaponInstance, normalizeWeaponInventory, resolveWeaponDefId } from "@/lib/atlasWeaponInstances";
import { ENERGY, getSkillSet } from "@/lib/atlasSkillDesign";
import { getWeaponAbility, getLootWeaponAbility, CLASS_WEAPONS, getGreenRelicWeaponId } from "@/lib/atlasWeapons";
import { getPotion } from "@/lib/atlasShop";
import { rollDie, canTravel, resolveTravel, resolveEscape, resolveEncounter } from "@/lib/atlasEngine";
import { randInt } from "@/lib/atlasWorld";
import { applyXp, bossAutoLevel, xpToNext, REGION_META, KILL_XP } from "@/lib/atlasProgression";
import { buildValidatedBlockMaps, BLOCK_DEFS } from "@/lib/atlasBlocks";
import { buildCanonicalExploreMaps } from "@/lib/atlasCanonicalWorlds";
import { generateMissions, SECTOR_NEED } from "@/lib/atlasMissions";
import { REST_COST, randomFlavorLine } from "@/lib/atlasSettlementNpcs";
import { RARITIES, WEAPONS, ARMORS, MATERIALS, COMMON_MATERIALS, RARE_MATERIALS, rollLootD10, resolveLoot, rollDestiny, rollRegionMaterial } from "@/lib/atlasLoot";
import { equipmentUnlocksFromBosses } from "@/lib/atlasRegionalEquipment";
import { resolveGlobalLoot } from "@/lib/atlasLootEngine";
import { SHRINE_TYPES, rollShrineType, revealThreshold, pickNotify, shrineLore } from "@/lib/atlasShrines";
import {
  SANCTUARIES, getSanctuaryById, getSanctuaryForSector, getSanctuariesForRegion,
  getInitialSanctuary, getRegionIndex as sanctuaryRegionIndex,
  getSafeSanctuarySpawn, resolveContinueSpawn, migrateSaveSanctuaries,
  canTravelToSanctuary,
} from "@/lib/atlasSanctuaries";
import { tierOf, THREAT_GAIN, THREAT_REDUCE, worldBehavior, rollEvent, THREAT_MAX, isThreatEnemy, rollLootThreat, COMBAT_WIN_THRESHOLD } from "@/lib/atlasThreat";
import { rollThreatEvent, threatEconomyMod } from "@/lib/atlasThreatExpansion";
import { getBossCanon } from "@/lib/atlasLore";
import { saveAdventure, clearAdventure, getActiveSaveSlot, setActiveSaveSlot } from "@/lib/atlasSave";
import { DUNGEONS, generateDungeonFloor, getDungeonAccessState } from "@/lib/atlasDungeons";
import { TUTORIAL_FLAG, TUTORIAL_DONE_FLAG } from "@/lib/atlasDungeonEntry";
import { decideEnemyAction, executeEnemyAbility, executeEnemyBasicAttack, statusDefMod, statusAtkMod, enemyEnergyRegen, prepareEnemy, randomRegionMonster, STATUS_INFO, ABILITY_TYPE } from "@/lib/atlasEnemyAI";
import { rollDiceGroup } from "@/lib/atlasDiceSystem";
import { buildCombatSequence } from "@/lib/atlasCombatDirector";
import { tickAtlasStatuses } from "@/lib/atlasStatusAtlas";
import { getSmithTierById } from "@/lib/atlasEconomyV3";
import { createAtlasSmithActions } from "@/lib/createAtlasSmithActions";
import { canRestoreGreenRelic, consumeGreenRelicComponents, getGreenRelicForm, getMissingGreenRelicComponents } from "@/lib/atlasRelics";
import { resolveCommonChest, resolveAncientChest, generateLegendaryChestWeapon, missingLegendarySeals, requiredSealsForRegion } from "@/lib/atlasChestSystem";
import { getSectorDef, getStartingCoords, getInitialUnlockedSectorKeys, getMissionUnlocks, sectorIdFromCoords, sectorKey, getNeighborSectorId, getBlockedReason, getBossGateMissionId, getBossMissionId, isSectorUnlocked, coordsFromSectorId } from "@/lib/atlasRegionSectors";
import { createMissionState, normalizeMissionState, getMissionLockReason as missionLockReason, getCurrentObjectiveText, advanceMission, activeStoryPointIds as collectActiveStoryPointIds } from "@/lib/atlasMissionEngine";
import { getMissingMissionSectors } from "@/lib/atlasMissionSectors";
import { getTransition } from "@/lib/atlasTransitions";
import { initMissionsFromDefs, REGION_FIRST_MISSION, activateFirstMissionInFresh, resolveRegionEntryMissions } from "@/lib/atlasRegionMissions";
import { deriveUnlockedSectorKeys } from "@/lib/atlasMissionUnlocks";
import useAtlasMissionSafety from "@/hooks/useAtlasMissionSafety";
import useAtlasRegionTravel from "@/hooks/useAtlasRegionTravel";
import useAtlasCombatRuntime from "@/hooks/useAtlasCombatRuntime";
import useAtlasCombatPassives from "@/hooks/useAtlasCombatPassives";
import createAtlasCombatActions from "@/lib/createAtlasCombatActions";
import createAtlasEquipmentActions from "@/lib/createAtlasEquipmentActions";

const NPC_KEYS = ["campamento", "pueblo", "ciudad"];
const SECTOR_OF_BLOCK = ["campamento", "pueblo", "ciudad"];

export default function useAtlasSession() {
  const [screen, setScreen] = useState("select");
  const [player, setPlayer] = useState(null);
  const [regionIndex, setRegionIndex] = useState(0);
  const [blockIndex, setBlockIndex] = useState(0);
  const canonicalMapsRef = useRef(null);
  if (!canonicalMapsRef.current) canonicalMapsRef.current = buildCanonicalExploreMaps();
  const [blockMaps, setBlockMaps] = useState(() => buildValidatedBlockMaps());
  const [location, setLocation] = useState(() => blockMaps[0][0].spawnId);
  const [exploreBlocks, setExploreBlocks] = useState(() => canonicalMapsRef.current.blocks);
  const [exploreWilds, setExploreWilds] = useState(() => canonicalMapsRef.current.wilds);
  const [sectorRow, setSectorRow] = useState(1);
  const [threat, setThreat] = useState(0);
  const [enemy, setEnemy] = useState(null);
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState("playing");
  const [lastResult, setLastResult] = useState(null);
  const [bonusMove, setBonusMove] = useState(false);
  const [defeatedBosses, setDefeatedBosses] = useState(new Set());
  const [bossIntro, setBossIntro] = useState(null);
  const [pendingMoves, setPendingMoves] = useState(0);
  const [diceAnim, setDiceAnim] = useState(null);
  const [combatAnimating, setCombatAnimating] = useState(false);
  const [missions, setMissions] = useState(() => initMissionsFromDefs(generateMissions(REGIONS[0])));
  const [npcDialog, setNpcDialog] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showBackpack, setShowBackpack] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopTier, setShopTier] = useState("city");
  const [showSmith, setShowSmith] = useState(false);
  const [smithTier, setSmithTier] = useState("camp");
  const [activeSettlementNpc, setActiveSettlementNpc] = useState(null);
  const [flavorDialog, setFlavorDialog] = useState(null);
  const [lootReward, setLootReward] = useState(null);
  const [destinyEvent, setDestinyEvent] = useState(null);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [chestReward, setChestReward] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [openedChests, setOpenedChests] = useState(new Set());
  const [defeatedEnemyIds, setDefeatedEnemyIds] = useState(new Set());
  const [shrines, setShrines] = useState([]);
  const [shrineModal, setShrineModal] = useState(null);
  const [shrineNotify, setShrineNotify] = useState(null);
  const [respawnPos, setRespawnPos] = useState(null);
  const [lastShrine, setLastShrine] = useState(null);
  const [activatedSanctuaries, setActivatedSanctuaries] = useState(() => new Set());
  const [unlockedSanctuaries, setUnlockedSanctuaries] = useState(() => new Set());
  const [lastActivatedSanctuaryId, setLastActivatedSanctuaryId] = useState(null);
  const [unlockedRegions, setUnlockedRegions] = useState(() => new Set(["verde"]));
  const [portalTravel, setPortalTravel] = useState(false);
  const [inDungeon, setInDungeon] = useState(false);
  const [dungeonBossDefeated, setDungeonBossDefeated] = useState(false);
  const [currentDungeonId, setCurrentDungeonId] = useState(null);
  const [dungeonFloor, setDungeonFloor] = useState(1);
  const [dungeonSeed, setDungeonSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [dungeonSession, setDungeonSession] = useState(null);
  const dungeonSessionRef = useRef(null);
  useEffect(() => { dungeonSessionRef.current = dungeonSession; }, [dungeonSession]);
  const dungeonBossContextRef = useRef(null);
  const [priorityMissionId, setPriorityMissionId] = useState(null);
  const [visitedSectors, setVisitedSectors] = useState(new Set());
  const [unlockedSectors, setUnlockedSectors] = useState(() => new Set(getInitialUnlockedSectorKeys("verde")));
  const [worldFlags, setWorldFlags] = useState({});
  const missionsRef = useRef(missions);
  const missionsByRegionRef = useRef({});
  const worldFlagsRef = useRef(worldFlags);
  const diceCallbackRef = useRef(null);
  const pendingDeadRef = useRef(null);
  const playerRef = useRef(null);
  const enemyRef = useRef(null);
  const playerDefeatHandlerRef = useRef(null);
  const sessionStartRef = useRef(Date.now());
  const playTimeRef = useRef(0);
  const shrinesRef = useRef([]);
  const activatedSanctuariesRef = useRef(new Set());
  const unlockedRegionsRef = useRef(new Set(["verde"]));
  const lastActivatedSanctuaryIdRef = useRef(null);
  const lastRevealPosRef = useRef(null);
  const lastShrineRef = useRef(null);
  const shrineSnapshotRef = useRef(null);
  const recentToastRef = useRef({ msg: "", at: 0 });

  const region = REGIONS[regionIndex];
  const block = BLOCK_DEFS[region.id][blockIndex];
  const isLastBlock = blockIndex === 2;
  const map = blockMaps[regionIndex][blockIndex];
  const exploreWorld = sectorRow === 1 ? exploreBlocks[regionIndex][blockIndex] : exploreWilds[regionIndex][`${blockIndex}_${sectorRow}`];
  const currentSectorId = sectorIdFromCoords(blockIndex, sectorRow);
  const sectorDef = getSectorDef(region.id, currentSectorId);
  const node = map.nodes[location] || map.nodes[map.spawnId] || Object.values(map.nodes)[0];
  const terrain = region.terrains[node.terrain] || {};
  const npcKey = NPC_KEYS.includes(node.terrain) ? node.terrain : null;
  const skills = useMemo(() => player ? {
    ...(getSkillSet(player) || {}),
    weapon: getWeaponAbility(player) || getLootWeaponAbility(player?.weapon ? WEAPONS[resolveWeaponDefId(player, player.weapon)] : null),
  } : null, [player?.race, player?.class, player?.level, player?.weapon, player?.classWeapon, player?.weaponUpgrades]);
  const missionDefs = useMemo(() => generateMissions(region), [region]);
  const missionDefMap = useMemo(() => { const m = {}; for (const s of ["campamento", "pueblo", "ciudad"]) for (const d of missionDefs[s]) m[d.id] = d; return m; }, [missionDefs]);
  const allMissionsDone = useMemo(() => Object.keys(missionDefMap).every(id => missions[id]?.status === "done"), [missions, missionDefMap]);
  const regionDoneCount = useMemo(() => Object.values(missions).filter(m => m.status === "done").length, [missions]);
  const regionTotal = useMemo(() => Object.values(missionDefMap).length, [missionDefMap]);
  const regionProgress = regionTotal > 0 ? regionDoneCount / regionTotal : 0;
  const bossGateMissionId = getBossGateMissionId(region.id);
  const bossUnlocked = isSectorUnlocked(unlockedSectors, region.id, "C3") && missions[bossGateMissionId]?.status === "done";
  const bossDefeated = defeatedBosses.has(region.boss.id);
  const bossAlive = !defeatedBosses.has(region.boss.id);
  const activeStoryPointIds = useMemo(() => collectActiveStoryPointIds(missionDefMap, missions), [missionDefMap, missions]);
  const canTravelNextRegion = bossDefeated && regionIndex < REGIONS.length - 1;

  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { enemyRef.current = enemy; }, [enemy]);
  useEffect(() => { missionsRef.current = missions; }, [missions]);
  useEffect(() => { worldFlagsRef.current = worldFlags; }, [worldFlags]);
  useEffect(() => { unlockedRegionsRef.current = unlockedRegions; }, [unlockedRegions]);

  useEffect(() => {
    const key = `${regionIndex}:${blockIndex}:${sectorRow}`;
    setVisitedSectors(prev => prev.has(key) ? prev : new Set([...prev, key]));
  }, [regionIndex, blockIndex, sectorRow]);

  const threatStateRef = useRef(threat);
  threatStateRef.current = threat;
  const pendingBossRef = useRef(null);
  const prevTierRef = useRef(null);
  useEffect(() => {
    const tier = tierOf(threat);
    if (prevTierRef.current && prevTierRef.current.id !== tier.id) {
      pushLog(`▲ ${tier.label}: ${tier.message}`);
      toast(tier.message, tier.id === "muy_alta" ? "boss" : "info");
    }
    prevTierRef.current = tier;
  }, [threat]);

  useEffect(() => {
    const slots = (exploreWorld?.shrines || []).map(s => {
      // Los santuarios-portales siempre están revelados; conservan su tipo "portal"
      if (s.isSanctuary) {
        const activated = activatedSanctuariesRef.current.has(s.sanctuaryId || s.id);
        return { ...s, revealed: true, type: "portal", activated };
      }
      return { ...s, revealed: false, activated: false, type: null };
    });
    shrinesRef.current = slots;
    setShrines(slots);
    lastRevealPosRef.current = null;
  }, [regionIndex, blockIndex, sectorRow]);

  const applyMissionEffects = (effects, source = "campaign") => {
    if (!effects) return;
    if (effects.unlockSectors?.length) {
      setUnlockedSectors(prev => {
        const next = new Set(prev);
        for (const sid of effects.unlockSectors) next.add(sectorKey(region.id, sid));
        return next;
      });
      for (const sid of effects.unlockSectors) {
        const sd = getSectorDef(region.id, sid);
        toast(`Nuevo sector: ${sd?.name || sid}`, "mission");
        pushLog(`◆ Se abre ${sid}: ${sd?.name || "nuevo sector"}.`);
      }
    }
    if (effects.flags?.length) {
      setWorldFlags(prev => {
        const next = { ...prev };
        effects.flags.forEach(flag => { next[flag] = true; });
        worldFlagsRef.current = next;
        return next;
      });
    }
    if (effects.questItems?.length) {
      setPlayer(prev => {
        if (!prev) return prev;
        const questItems = { ...(prev.questItems || {}) };
        effects.questItems.forEach(id => { questItems[id] = (questItems[id] || 0) + 1; });
        return { ...prev, questItems };
      });
    }
    if (effects.respawnSectors?.length) {
      const prefixes = effects.respawnSectors.map(sid => `${sid}_e_`);
      setDefeatedEnemyIds(prev => new Set([...prev].filter(id => !prefixes.some(prefix => String(id).startsWith(prefix)))));
    }
    if (effects.log) pushLog(effects.log);
  };

  const advanceMissionEvent = (event) => {
    const current = missionsRef.current || {};
    let changed = false;
    const next = { ...current };
    const queuedEffects = [];
    const notices = [];

    for (const [id, rawState] of Object.entries(current)) {
      const def = missionDefMap[id];
      if (!def?.objectives?.length) continue;
      const result = advanceMission(def, rawState, event);
      if (!result.changed) continue;
      changed = true;
      next[id] = result.state;
      if (result.objectiveCompleted) {
        notices.push(result.missionReady ? `Misión lista: ${def.name}` : `Objetivo cumplido: ${result.objective.text}`);
        if (result.objective.onComplete) queuedEffects.push(result.objective.onComplete);
      }
      if (result.missionReady && def.onReady) queuedEffects.push(def.onReady);
    }

    if (changed) {
      missionsRef.current = next;
      setMissions(next);
      queuedEffects.forEach(e => applyMissionEffects(e, "objective"));
      notices.forEach(msg => pushLog(`◆ ${msg}`));
      const primaryNotice = [...notices].reverse().find(msg => msg.startsWith("Misión lista")) || notices.at(-1);
      if (primaryNotice) toast(primaryNotice, primaryNotice.startsWith("Misión lista") ? "mission" : "info");
    }
    return changed;
  };

  const progressTracker = (tracker, sector, amount = 1, role, targetId = null) => {
    const event = tracker === "talk"
      ? { type: "talk", npcSector: sector, npcRole: role || "main", sectorId: currentSectorId, amount }
      : { type: tracker, sectorId: currentSectorId, targetId, amount };
    const changed = advanceMissionEvent(event);
    if (changed) return true;
    // Legacy fallback: solo misiones sin objetivos (ej. desierto).
    setMissions(prev => {
      let changed2 = false; const next = { ...prev };
      for (const id of Object.keys(next)) {
        const m = next[id];
        const def = missionDefMap[id];
        if (def?.objectives?.length) continue;
        if (m.status !== "pending" || !m.active) continue;
        if (!def || def.tracker !== tracker) continue;
        if (sector && def.sector !== sector) continue;
        if (role && def.role !== role) continue;
        const prog = Math.min(def.target, m.progress + amount);
        if (prog !== m.progress) {
          next[id] = { ...m, progress: prog, status: prog >= def.target ? "ready" : "pending" };
          changed2 = true;
          if (prog >= def.target) toast(`Misión lista: ${def.name}`, "mission");
        }
      }
      return changed2 ? next : prev;
    });
    return false;
  };

  const getMissionLockReason = (id) => {
    const def = missionDefMap[id];
    if (!def) return "Misión no disponible.";
    return missionLockReason(def, missionsRef.current, worldFlagsRef.current, threat);
  };

  const activateMission = (id) => {
    const def = missionDefMap[id]; if (!def) return;
    const cur = missionsRef.current[id];
    if (!cur || cur.status !== "pending" || cur.accepted) return;
    const locked = getMissionLockReason(id);
    if (locked) { toast(locked, "info"); return; }
    if (def.cost) {
      const p = playerRef.current;
      if ((p?.gold || 0) < def.cost) { toast(`Necesitas ${def.cost} oro para este encargo`, "info"); return; }
      setPlayer(prev => ({ ...prev, gold: (prev.gold || 0) - def.cost }));
      pushLog(`Pagas ${def.cost} oro a cambio de información: ${def.name}.`);
    }
    const activeCount = Object.values(missionsRef.current).filter(m => m.active && m.status !== "done").length;
    const canActive = activeCount < 3;
    const next = { ...missionsRef.current, [id]: { ...normalizeMissionState(def, cur), accepted: true, active: canActive } };
    missionsRef.current = next;
    setMissions(next);
    if (def.onAccept) applyMissionEffects(def.onAccept, "accept");
    if (canActive && !priorityMissionId) setPriorityMissionId(id);
    toast(canActive ? `Misión aceptada: ${def.name}` : `Misión aceptada: ${def.name} (diario lleno)`, "mission");
    pushLog(`▶ ${def.name} — ${def.desc}`);
    if (def.storySummary) pushLog(`Historia: ${def.storySummary}`);
    if (def.objectives?.[0]?.text) pushLog(`Objetivo inicial: ${def.objectives[0].text}`);

    // Si la misión se acepta estando ya dentro del sector solicitado,
    // registra la entrada de inmediato. Esto evita que una partida reanudada
    // o una aceptación tardía deje el primer paso atascado.
    const firstObjective = def.objectives?.[0];
    if (canActive && firstObjective?.type === "enter_sector" && firstObjective.sectorId === currentSectorId) {
      advanceMissionEvent({ type: "enter_sector", sectorId: currentSectorId });
    }
  };

  const setMissionActive = (id, active) => {
    const m = missionsRef.current[id]; if (!m || m.status === "done" || !m.accepted) return;
    if (active) {
      const activeCount = Object.values(missionsRef.current).filter(x => x.active && x.status !== "done").length;
      if (activeCount >= 3 && !m.active) { toast("Ya tienes 3 misiones activas", "info"); return; }
      const next = { ...missionsRef.current, [id]: { ...m, active: true } };
      missionsRef.current = next; setMissions(next);
      if (!priorityMissionId) setPriorityMissionId(id);
    } else {
      const next = { ...missionsRef.current, [id]: { ...m, active: false } };
      missionsRef.current = next; setMissions(next);
      if (priorityMissionId === id) {
        const candidate = Object.entries(next).find(([oid, x]) => oid !== id && x.active && x.status !== "done");
        setPriorityMissionId(candidate ? candidate[0] : null);
      }
    }
  };
  const setPriorityMission = (id) => {
    const m = missionsRef.current[id]; if (!m || !m.active || m.status === "done") return;
    setPriorityMissionId(id);
  };

  const talkToNpc = (key) => {
    progressTracker("talk", key);
    setNpcDialog(key);
  };
  const onTalkNpc = (sector, role) => {
    progressTracker("talk", sector, 1, role);
  };
  const onStoryPoint = (storyPoint) => {
    const id = typeof storyPoint === "string" ? storyPoint : storyPoint?.id;
    if (!id) return { ok: false, message: "No hay nada que examinar." };
    if (id === "verde_b2_forja_reliquia") return restoreGreenRelic();

    // Reconciliación defensiva: si el cambio de mapa no registró la entrada,
    // la interacción dentro del sector completa primero ese paso y luego
    // procesa el punto narrativo correcto.
    advanceMissionEvent({ type: "enter_sector", sectorId: currentSectorId });
    const matched = advanceMissionEvent({ type: "interact", targetId: id, sectorId: currentSectorId });
    const label = typeof storyPoint === "object" ? storyPoint.label : "Punto narrativo";
    const activeEntry = Object.entries(missionsRef.current || {}).find(([mid, state]) => state?.active && state.status !== "done" && missionDefMap[mid]);
    const nextText = activeEntry ? getCurrentObjectiveText(missionDefMap[activeEntry[0]], activeEntry[1]) : "La pista queda registrada en el diario.";
    return matched
      ? { ok: true, message: `${label}: ${storyPoint?.description || "encuentras una nueva pista"}. Nuevo objetivo: ${nextText}` }
      : { ok: false, message: `${label}: este no es el objetivo actual de la misión.` };
  };

  const enteredSectorEventRef = useRef("");
  useEffect(() => {
    const key = `${region.id}:${currentSectorId}`;
    if (enteredSectorEventRef.current === key) return;
    enteredSectorEventRef.current = key;
    advanceMissionEvent({ type: "enter_sector", sectorId: currentSectorId });
  }, [region.id, currentSectorId]);

  // ── Desbloqueo central de sectores por misión activa ──
  // Garantiza que toda misión accepted+active tenga el sector de su objetivo
  // actual desbloqueado. Cubre: aceptar, activar, encadenar, avanzar objetivo,
  // continuar partida y migrar guardado. No desbloquea sectores futuros.
  useEffect(() => {
    if (!player) return;
    const missing = getMissingMissionSectors(missionDefMap, missions, region.id, currentSectorId, unlockedSectors);
    if (!missing.length) return;
    setUnlockedSectors(prev => {
      const next = new Set(prev);
      for (const sid of missing) next.add(sectorKey(region.id, sid));
      return next;
    });
    for (const sid of missing) {
      const sd = getSectorDef(region.id, sid);
      toast(`Nuevo acceso: ${sd?.name || sid}`, "mission");
      pushLog(`◆ Se habilita el paso hacia ${sd?.name || sid}.`);
    }
  }, [player, missions, region.id, currentSectorId, unlockedSectors, missionDefMap]);

  const pushLog = (...lines) => setLog(l => [...l, ...lines].slice(-80));

  const {
    combatRef,
    playerStatuses,
    setPlayerStatuses,
    turnStart,
    modifyIncoming,
    modifyOutgoing,
    onKillEnergy,
    maybeChannel,
    enemyDefForClass,
    playerDefVsType,
    enemyAtkVsType,
    applyStatusToEnemy,
    statusForSkillName,
    applyPierce,
    roguePhysAtkReduce,
    withEnemyAtkBonus,
  } = useAtlasCombatPassives({
    player,
    enemy,
    skills,
    playerRef,
    setPlayer,
    pushLog,
  });

  const toast = (msg, kind = "info") => {
    const now = Date.now();
    if (recentToastRef.current.msg === msg && now - recentToastRef.current.at < 3500) return;
    recentToastRef.current = { msg, at: now };
    const id = now + Math.random();
    setToasts(current => {
      // Los avisos informativos se sustituyen entre sí. Los avisos relevantes
      // pueden convivir, pero nunca llenan la pantalla con una cola larga.
      const base = kind === "info" ? current.filter(item => item.kind !== "info") : current;
      return [...base, { id, msg, kind }].slice(-2);
    });
    const duration = kind === "boss" || kind === "levelup" ? 2400 : 1800;
    setTimeout(() => setToasts(current => current.filter(item => item.id !== id)), duration);
  };

  // ── Centralización del descanso ──
  // Única fuente de recuperación al descansar. Restaura HP y Energía al máximo,
  // limpia estados negativos temporales y NO repone consumibles ni repara equipo.
  // source: "camp" | "inn" | "sanctuary". extraPlayer: ajustes extra (p.ej. oro).
  const restorePlayerAtRest = (source, extraPlayer = null) => {
    const p = playerRef.current; if (!p) return source;
    const base = { ...p, hp: p.maxHp, mp: p.maxMp || 0 };
    const np = extraPlayer ? { ...base, ...extraPlayer } : base;
    playerRef.current = np; setPlayer(np);
    combatRef.current.playerStatuses = {};
    setPlayerStatuses({});
    return source;
  };

  // Guardado de sesión: escribe ÚNICAMENTE en la ranura activa.
  // Acumula tiempo jugado y registra la fecha del último guardado.
  const persistSession = (extra = {}) => {
    const now = Date.now();
    const elapsed = now - sessionStartRef.current;
    sessionStartRef.current = now;
    playTimeRef.current += elapsed;
    saveAdventure({
      player: playerRef.current, regionIndex, blockIndex, sectorRow, threat: threatStateRef.current,
      missions, openedChests: [...openedChests], defeatedBosses: [...defeatedBosses],
      defeatedEnemyIds: [...defeatedEnemyIds], visitedSectors: [...visitedSectors],
      priorityMissionId, unlockedSectors: [...unlockedSectors], worldFlags: worldFlagsRef.current, saveVersion: 6,
      activatedSanctuaries: [...activatedSanctuariesRef.current], unlockedSanctuaries: [...unlockedSanctuaries],
      lastActivatedSanctuaryId: lastActivatedSanctuaryIdRef.current,
      unlockedRegions: [...unlockedRegionsRef.current], lastRegionId: region.id, lastSectorId: currentSectorId,
      playTimeMs: playTimeRef.current, savedAt: now,
      missionsByRegion: missionsByRegionRef.current, ...extra,
    });
  };

  // ── Amenaza: incrementos solo por evento definido, máx +1, con anti-duplicado ──
  const recentThreatEventsRef = useRef(new Map());
  const THREAT_DEDUP_MS = 1000;
  const applyThreatEvent = (eventKey, delta) => {
    if (!delta) return;
    const now = Date.now();
    const last = recentThreatEventsRef.current.get(eventKey) || 0;
    if (now - last < THREAT_DEDUP_MS) return; // el mismo evento ya se registró
    recentThreatEventsRef.current.set(eventKey, now);
    setThreat(t => {
      const gain = delta > 0 ? Math.min(1, delta) : delta; // máximo +1 por evento
      return Math.max(0, Math.min(THREAT_MAX, t + gain));
    });
  };

  // ── Reequilibrio de Amenaza ──
  // Contador de combates normales ganados: +1 cada 3. Se reinicia al descansar en santuario.
  const combatWinCounterRef = useRef(0);
  // Aplica un único cambio de Amenaza con causa visible en el HUD (mín 0, máx THREAT_MAX).
  const applyThreatDelta = (delta, cause) => {
    if (!delta || !cause) return;
    setThreat(t => Math.max(0, Math.min(THREAT_MAX, t + delta)));
    const sign = delta > 0 ? `+${delta}` : `${delta}`;
    toast(`Amenaza ${sign}: ${cause}`, delta > 0 ? "trap" : "heal");
    pushLog(`◆ Amenaza ${sign}: ${cause}.`);
  };
  // Una sola modificación de Amenaza por combate (evita duplicados).
  const resolveCombatThreat = (enemy) => {
    if (isThreatEnemy(enemy)) {
      const cause = enemy?.boss ? "guardián derrotado"
        : enemy?.corrupted ? "criatura corrupta"
        : (enemy?.addsThreat && !enemy?.elite) ? "enemigo de evento"
        : "enemigo élite";
      return { delta: 1, cause };
    }
    combatWinCounterRef.current += 1;
    if (combatWinCounterRef.current >= COMBAT_WIN_THRESHOLD) {
      combatWinCounterRef.current = 0;
      return { delta: 1, cause: "3 victorias acumuladas" };
    }
    const lt = rollLootThreat();
    return { delta: lt.delta, cause: lt.cause };
  };

  const showDice = (diceResult, label, callback, isEnemy = false) => {
    diceCallbackRef.current = callback;
    setDiceAnim({ diceResult, label, isEnemy });
  };
  const singleDie = (sides, val) => ({ group: "single", label: `1d${sides}`, rolls: [{ sides, result: val }], total: val, min: 1, max: sides });
  const onDiceComplete = () => {
    setDiceAnim(null);
    const cb = diceCallbackRef.current;
    diceCallbackRef.current = null;
    if (cb) cb();
  };
  const rollDice = (label, callback) => {
    const r = rollDie(20);
    showDice(singleDie(20, r), label, () => callback(r));
  };

  const threatAtkBonus = (t) => (t >= 10 ? 2 : t >= 7 ? 1 : 0);
  const ambushChance = (t) => (t >= 9 ? 0.6 : t >= 7 ? 0.45 : t >= 4 ? 0.2 : 0);

  const start = (character, slot = null) => {
    if (slot) setActiveSaveSlot(slot);
    clearAdventure();
    sessionStartRef.current = Date.now();
    playTimeRef.current = 0;
    const r0 = REGIONS[0];
    const newMaps = buildValidatedBlockMaps();
    setBlockMaps(newMaps);
    const canonical = buildCanonicalExploreMaps();
    canonicalMapsRef.current = canonical;
    setExploreBlocks(canonical.blocks);
    setExploreWilds(canonical.wilds);
    const startCoords = getStartingCoords(r0.id);
    setSectorRow(startCoords.row);
    const maxMp = character.class === "Mago" ? 14 : character.class === "Pícaro" ? 9 : 6;
    const en = ENERGY[character.class];
    const starterWeaponId = { Guerrero: "starter_espada_recluta", Mago: "starter_baston_aprendiz", "Pícaro": "starter_dagas_bronce" }[character.class];
    const starterArmorId = { Guerrero: "starter_armor_cuero", Mago: "starter_tunica_aprendiz", "Pícaro": "starter_ropaje_ligero" }[character.class];
    const base = { ...character, level: 1, statPoints: 0, baseAttack: character.attack, baseDefense: character.physicalDefense ?? character.defense, baseMagicalDefense: character.magicalDefense ?? character.defense, baseMaxHp: character.hp, hp: character.hp, accessory: null, accessory2: null, accessoryInventory: [...STARTER_ACCESSORIES], helmet: null, helmetInventory: [], equipmentUnlocks: { helmet: false, accessory2: false }, weapon: null, armor: starterArmorId, armorInventory: [starterArmorId], weaponInventory: [], classWeapon: starterWeaponId, classWeaponInventory: [starterWeaponId], weaponUpgrades: {}, armorUpgrades: {}, helmetUpgrades: {}, materials: {}, baseMaxMp: maxMp, xp: 0, gold: 0, maxMp, mp: maxMp, energyType: en?.id, energyName: en?.name, potions: 3, consumables: {}, questItems: {}, relics: {}, equipmentCondition: 100, weaponDurability: 100, weaponDurabilityMax: 100 };
    setPlayer(recomputePlayer(base));
    setRegionIndex(0);
    setBlockIndex(startCoords.col);
    setLocation(newMaps[0][0].spawnId);
    setThreat(0); combatWinCounterRef.current = 0; setEnemy(null); setStatus("playing"); setLastResult(null); setBonusMove(false);
    setDefeatedBosses(new Set()); setPendingMoves(0); setDiceAnim(null);
    const initialMissions = initMissionsFromDefs(generateMissions(r0));
    const startFirstId = activateFirstMissionInFresh(r0.id, initialMissions);
    missionsByRegionRef.current = { [r0.id]: initialMissions };
    missionsRef.current = initialMissions;
    setMissions(initialMissions); setNpcDialog(null); setShowLevelUp(false); setShowSheet(false); setShowBackpack(false); setPriorityMissionId(null);
    setChestReward(null); setToasts([]); setOpenedChests(new Set()); setDefeatedEnemyIds(new Set());
    setVisitedSectors(new Set());
    setUnlockedSectors(new Set(deriveUnlockedSectorKeys(r0.id, generateMissions(r0), initialMissions)));
    worldFlagsRef.current = {};
    setWorldFlags({});
    // Portal de Invocación inicial: santuario del Campamento del Umbral (verde A2)
    const initialSanctuary = getInitialSanctuary();
    const initialSpawn = { x: initialSanctuary.spawnX, y: initialSanctuary.spawnY };
    const initialSet = new Set([initialSanctuary.id]);
    activatedSanctuariesRef.current = initialSet;
    setActivatedSanctuaries(initialSet);
    setUnlockedSanctuaries(initialSet);
    unlockedRegionsRef.current = new Set(["verde"]);
    setUnlockedRegions(new Set(["verde"]));
    lastActivatedSanctuaryIdRef.current = initialSanctuary.id;
    setLastActivatedSanctuaryId(initialSanctuary.id);
    setRespawnPos(initialSpawn);
    lastShrineRef.current = { regionIndex: 0, blockIndex: startCoords.col, sectorRow: startCoords.row, x: initialSpawn.x, y: initialSpawn.y, sanctuaryId: initialSanctuary.id };
    setLastShrine(lastShrineRef.current);
    setLog([`Nuevo aventurero: ${character.race} ${character.class} llega a ${r0.name}.`, startFirstId ? "◆ Hay un nuevo encargo disponible en el campamento. Habla con sus habitantes para conocer qué ocurre." : ""] .filter(Boolean));
    setShowIntro(true);
    setScreen("playing");
  };
  const currentDungeon = useMemo(
    () => (currentDungeonId ? generateDungeonFloor(DUNGEONS[currentDungeonId], dungeonFloor, dungeonSeed) : null),
    [currentDungeonId, dungeonFloor, dungeonSeed]
  );

  // Mini jefe de dungeon: inicia el combate clásico (no táctico).
  const startDungeonBossCombat = (monster) => {
    if (enemy || diceAnim) return;
    const m = MONSTERS.find(x => x.id === monster?.monsterId) || MONSTERS[0];
    const prepared = prepareEnemy(m, (region.difficultyMul || 1) * 1.3, player?.level || 1, REGION_META[regionIndex].start, region.id, currentSectorId, playerRef.current || player);
    const data = { ...prepared, id: m.id, uid: `${currentDungeonId}_miniboss`, dungeonBoss: true, missionTag: m.id, name: prepared.name || m.name, boss: false };
    dungeonBossContextRef.current = { monsterId: m.id, dungeonId: currentDungeonId };
    startCombat(data);
  };

  const enterDungeon = (id) => {
    if (enemy || diceAnim || !DUNGEONS[id]) return;
    const d = DUNGEONS[id];
    const access = getDungeonAccessState(d, { bossDefeated, bossUnlocked, worldFlags: worldFlagsRef.current });
    if (!access.unlocked) {
      toast(access.reason || "La entrada permanece sellada.", "info");
      pushLog(access.reason || "La entrada de la dungeon permanece sellada.");
      return;
    }
    setCurrentDungeonId(id);
    setDungeonFloor(1);
    setDungeonSeed(Math.floor(Math.random() * 1e9));
    setInDungeon(true);
    setEnemy(null);
    dungeonBossContextRef.current = null;
    setDungeonBossDefeated(false);
    // Guarda el punto de regreso exterior: frente al NPC de entrada (entrada de la dungeon).
    const extX = d.entrancePos?.x ?? 0;
    const extY = d.entrancePos?.y ?? 0;
    const session = {
      dungeonId: id,
      exteriorRegion: region.id,
      exteriorSector: currentSectorId,
      exteriorReturnX: extX,
      exteriorReturnY: extY,
      dungeonCompleted: false,
      dungeonLoot: [],
      companionState: player?.companion ? { id: player.companion.id, hp: player.companion.hp, incapacitated: !!player.companion.incapacitated } : null,
    };
    setDungeonSession(session);
    dungeonSessionRef.current = session;
    // Salida de emergencia + reaparición frente al guardián al volver.
    setRespawnPos({ x: extX, y: extY });
    // Misión secundaria tutorial: se activa la primera vez que entras a una dungeon.
    if (!worldFlags[TUTORIAL_FLAG]) {
      const nextFlags = { ...worldFlags, [TUTORIAL_FLAG]: true };
      worldFlagsRef.current = nextFlags; setWorldFlags(nextFlags);
      toast("Misión tutorial: completa tu primera dungeon", "mission");
      pushLog("▶ Tutorial del subsuelo: derrota al jefe o cumple el objetivo y vuelve al exterior.");
    }
    persistSession({ dungeonSession: session });
    pushLog(`Desciendes a ${d.name}.`);
  };

  const onDungeonAsk = (_id) => {
    // La explicación la muestra el diálogo; aquí solo registramos que preguntaste.
    pushLog("El guardián te explica cómo se mueve y se lucha en el subsuelo.");
  };

  const activateDungeonFinalSanctuary = () => {
    const arch = DUNGEONS[currentDungeonId];
    if (!arch?.gatewayToBoss || !arch.finalSanctuary || bossDefeated) return;

    const nextFlags = {
      ...worldFlagsRef.current,
      [`${region.id}:boss_gateway_ready`]: true,
      [`${region.id}:dungeon_sanctuary_activated`]: true,
    };
    worldFlagsRef.current = nextFlags;
    setWorldFlags(nextFlags);
    setThreat(0);
    combatRef.current.playerStatuses = {};
    setPlayerStatuses({});
    const healedPlayer = playerRef.current ? { ...playerRef.current, hp: playerRef.current.maxHp, mp: playerRef.current.maxMp || 0 } : playerRef.current;
    if (healedPlayer) { playerRef.current = healedPlayer; setPlayer(healedPlayer); }
    completeDungeon(true);
    setInDungeon(false);
    setCurrentDungeonId(null);
    setDungeonSession(null);
    dungeonSessionRef.current = null;

    persistSession({
      dungeonSession: null,
      threat: 0,
      worldFlags: nextFlags,
      player: healedPlayer,
    });
    pushLog("✦ El Santuario del Umbral guarda tu partida, restaura tus fuerzas y abre la arena del Guardián.");
    toast("Santuario del Umbral activado", "boss");

    const preparedBoss = prepareEnemy(
      { ...region.boss, boss: true, sectorId: "C3" },
      region.difficultyMul || 1,
      playerRef.current?.level || player?.level || 1,
      REGION_META[regionIndex].start,
      region.id,
      "C3",
      playerRef.current || player,
    );
    setTimeout(() => startBossWithIntro({ ...preparedBoss, boss: true, id: region.boss.id, uid: `${region.id}_regional_boss` }), 420);
  };

  const completeDungeon = (completed) => {
    const s = dungeonSessionRef.current;
    if (!s) return;
    const ns = { ...s, dungeonCompleted: !!completed };
    setDungeonSession(ns);
    dungeonSessionRef.current = ns;
    if (completed && !worldFlagsRef.current[TUTORIAL_DONE_FLAG]) {
      const nf = { ...worldFlagsRef.current, [TUTORIAL_DONE_FLAG]: true };
      worldFlagsRef.current = nf; setWorldFlags(nf);
      gainXp(KILL_XP[regionIndex]);
      toast("Tutorial de dungeon completado", "mission");
      pushLog("✦ Has sobrevivido a tu primera dungeon. El tutorial se completa.");
    }
  };

  const descendDungeon = () => {
    const arch = DUNGEONS[currentDungeonId];
    if (!arch) return;
    const total = arch.floorCount || 1;
    if (dungeonFloor < total) {
      dungeonBossContextRef.current = null;
      setDungeonBossDefeated(false);
      setDungeonFloor((f) => f + 1);
      pushLog(`Desciendes al piso ${dungeonFloor + 1} de ${arch.name}.`);
    } else {
      completeDungeon(true);
      exitDungeon();
    }
  };

  const exitDungeon = () => {
    const d = DUNGEONS[currentDungeonId];
    // Asegura completar el tutorial si quedó despejada (el combate lo marca).
    setInDungeon(false);
    setCurrentDungeonId(null);
    setDungeonSession(null); dungeonSessionRef.current = null;
    // Vuelves frente al guardián de la entrada (punto seguro exterior).
    if (d?.entrancePos) setRespawnPos({ x: d.entrancePos.x, y: d.entrancePos.y });
    persistSession({ dungeonSession: null });
    pushLog(`Sales de la dungeon y vuelves al exterior, frente al guardián.`);
  };

  const onDungeonPlayerDamage = (n) => {
    const p = playerRef.current; if (!p) return;
    const nh = Math.max(0, (p.hp || 0) - n);
    const np = { ...p, hp: nh };
    playerRef.current = np; setPlayer(np);
    if (nh <= 0) {
      setInDungeon(false); setCurrentDungeonId(null);
      downed("combat");
      pushLog("Caes en la dungeon. Atlas intercede.");
    }
  };
  const onDungeonSpendEnergy = (n) => setPlayer(p => ({ ...p, mp: Math.max(0, (p.mp || 0) - n) }));
  const onDungeonEnemyKilled = (e, isBoss) => {
    gainXp(KILL_XP[regionIndex] * (isBoss ? 2 : 1));
    const _dtr = isBoss ? { delta: 1, cause: "guardián de mazmorra" } : resolveCombatThreat(e);
    if (_dtr.delta) applyThreatDelta(_dtr.delta, _dtr.cause);
    progressTracker("kill", null, 1, null, e.monsterId);
    if (Math.random() < 0.3) { const mid = rollRegionMaterial(regionIndex); setPlayer(p => ({ ...p, materials: { ...(p.materials || {}), [mid]: (p.materials?.[mid] || 0) + 1 } })); }
    pushLog(`Derrotas a ${e.name || "enemigo"} en la dungeon.`);
  };

  const hireAdventurer = (adv) => {
    const p = playerRef.current; if (!p || !adv) return;
    const cost = adv.cost || 0;
    if ((p.gold || 0) < cost) { toast("Oro insuficiente para contratar", "info"); return; }
    const companion = { id: adv.id, name: adv.name, race: adv.race, class: adv.class, level: adv.level, hp: adv.maxHp, maxHp: adv.maxHp, energy: adv.energy, maxEnergy: adv.maxEnergy, attack: adv.attack, defense: adv.defense, ability: adv.ability, abilityDesc: adv.abilityDesc, desc: adv.desc, cost };
    const np = recomputePlayer({ ...p, gold: (p.gold || 0) - cost, companion });
    playerRef.current = np; setPlayer(np);
    pushLog(`${companion.name} (${companion.race} ${companion.class}) se une a tu expedición por ${cost} oro.`);
    toast(`Compañero contratado: ${companion.name}`, "info");
  };
  const dismissCompanion = () => {
    const p = playerRef.current; if (!p) return;
    const np = recomputePlayer({ ...p, companion: null });
    playerRef.current = np; setPlayer(np);
    pushLog("Tu compañero se despide y regresa al campamento.");
    toast("Compañero despedido", "info");
  };
  const onCompanionUpdate = ({ hp, incapacitated }) => {
    const p = playerRef.current; if (!p || !p.companion) return;
    if (p.companion.hp === hp && !!p.companion.incapacitated === !!incapacitated) return;
    const np = recomputePlayer({ ...p, companion: { ...p.companion, hp, incapacitated } });
    playerRef.current = np; setPlayer(np);
  };

  const reset = () => {
    if (playerRef.current && getActiveSaveSlot()) persistSession();
    missionsByRegionRef.current = {};
    setPlayer(null); setScreen("select");
  };

  const resume = (save, slot = null) => {
    if (!save || !save.player) return;
    if (slot) setActiveSaveSlot(slot);
    sessionStartRef.current = Date.now();
    playTimeRef.current = save.playTimeMs || 0;
    const normInv = normalizeWeaponInventory(save.player.weaponInventory || []);
    let equipped = save.player.weapon || null;
    if (equipped && typeof equipped === "string" && WEAPONS[equipped]) {
      const inst = normInv.find(w => w.defId === equipped);
      equipped = inst ? inst.uid : null;
    }
    const bossUnlocks = equipmentUnlocksFromBosses(save.defeatedBosses || []);
    const equipmentUnlocks = {
      helmet: !!(save.player.equipmentUnlocks?.helmet || bossUnlocks.helmet),
      accessory2: !!(save.player.equipmentUnlocks?.accessory2 || bossUnlocks.accessory2),
    };
    const migratedPlayer = {
      ...save.player,
      weaponInventory: normInv,
      weapon: equipped,
      helmetInventory: save.player.helmetInventory || [],
      helmet: equipmentUnlocks.helmet ? (save.player.helmet || null) : null,
      accessory2: equipmentUnlocks.accessory2 ? (save.player.accessory2 || null) : null,
      accessoryInventory: save.player.accessoryInventory || [],
      equipmentUnlocks,
      questItems: save.player.questItems || {},
      relics: save.player.relics || {},
      equipmentCondition: save.player.equipmentCondition ?? 100,
      weaponDurability: save.player.weaponDurability ?? save.player.equipmentCondition ?? 100,
      weaponDurabilityMax: save.player.weaponDurabilityMax ?? 100,
      weaponUpgrades: save.player.weaponUpgrades || {},
      armorUpgrades: save.player.armorUpgrades || {},
      helmetUpgrades: save.player.helmetUpgrades || {},
    };
    if (migratedPlayer.accessory2 && migratedPlayer.accessory2 === migratedPlayer.accessory) migratedPlayer.accessory2 = null;
    setPlayer(recomputePlayer(migratedPlayer));
    setRegionIndex(save.regionIndex ?? 0);
    setBlockIndex(save.blockIndex ?? 0);
    setSectorRow(save.sectorRow ?? getStartingCoords(REGIONS[save.regionIndex ?? 0].id).row);
    setThreat(save.threat ?? 0);
    const resumedDefs = generateMissions(REGIONS[save.regionIndex ?? 0]);
    const resumedMissions = initMissionsFromDefs(resumedDefs, save.missions || null);
    missionsRef.current = resumedMissions;
    setMissions(resumedMissions);
    setPriorityMissionId(save.priorityMissionId || null);
    // Restaurar (o migrar) el almacén de misiones por región.
    const savedRegionIdForMissions = REGIONS[save.regionIndex ?? 0]?.id || "verde";
    const savedByRegion = (save.missionsByRegion && typeof save.missionsByRegion === "object") ? { ...save.missionsByRegion } : {};
    if (!savedByRegion[savedRegionIdForMissions] && save.missions) savedByRegion[savedRegionIdForMissions] = save.missions;
    missionsByRegionRef.current = savedByRegion;
    setOpenedChests(new Set(save.openedChests || []));
    setDefeatedBosses(new Set(save.defeatedBosses || []));
    setDefeatedEnemyIds(new Set(save.defeatedEnemyIds || []));
    setVisitedSectors(new Set(save.visitedSectors || []));
    const savedRegionId = REGIONS[save.regionIndex ?? 0].id;
    // Recalcular desde la campaña repara guardados de versiones que abrían
    // toda la Región Verde mediante GREEN_TEST_UNLOCKS.
    const campaignUnlocks = deriveUnlockedSectorKeys(savedRegionId, resumedDefs, resumedMissions);
    setUnlockedSectors(new Set(campaignUnlocks));
    worldFlagsRef.current = save.worldFlags || {};
    setWorldFlags(save.worldFlags || {});
    const rR = save.unlockedRegions?.length ? new Set(save.unlockedRegions) : new Set(["verde", ...Object.keys(save.worldFlags || {}).filter(k => k.endsWith(":unlocked")).map(k => k.replace(":unlocked", ""))]);
    unlockedRegionsRef.current = rR; setUnlockedRegions(rR);
    setEnemy(null); setLastResult(null); setBonusMove(false); setPendingMoves(0); setDiceAnim(null);
    setStatus("playing"); setScreen("playing");
    setShowIntro(false); setNpcDialog(null); setShowShop(false); setShowBackpack(false); setShowSheet(false);
    setChestReward(null); setLootReward(null); setDestinyEvent(null); setToasts([]);
    // Migrar santuarios y resolver spawn seguro en el último portal activado
    const migrated = migrateSaveSanctuaries(save, REGIONS[save.regionIndex ?? 0]?.id);
    const migratedSet = new Set(migrated.activatedSanctuaries || []);
    const migratedUnlocked = new Set(migrated.unlockedSanctuaries || migrated.activatedSanctuaries || []);
    activatedSanctuariesRef.current = migratedSet;
    setActivatedSanctuaries(migratedSet);
    setUnlockedSanctuaries(migratedUnlocked);
    lastActivatedSanctuaryIdRef.current = migrated.lastActivatedSanctuaryId;
    setLastActivatedSanctuaryId(migrated.lastActivatedSanctuaryId);

    // ── Reparación de desbloqueo al cargar ──
    // Si el jefe de la región actual ya está derrotado pero la siguiente
    // región no quedó marcada como desbloqueada (partida antigua o guardado
    // antes del avance automático), reparar: marcar completada, desbloquear
    // la siguiente y añadir su santuario inicial al menú de viaje.
    const loadedRegionIdx = save.regionIndex ?? 0;
    const loadedRegion = REGIONS[loadedRegionIdx];
    if (loadedRegion && (save.defeatedBosses || []).includes(loadedRegion.boss?.id) && loadedRegionIdx < REGIONS.length - 1) {
      const nr = REGIONS[loadedRegionIdx + 1];
      const wf = save.worldFlags || {};
      if (!wf[`${nr.id}:unlocked`]) {
        const repairedFlags = { ...wf, [`${loadedRegion.id}:completed`]: true, [`${nr.id}:unlocked`]: true };
        worldFlagsRef.current = repairedFlags; setWorldFlags(repairedFlags);
        const camp = getSanctuariesForRegion(nr.id).find(s => s.settlementType === "campamento") || getSanctuariesForRegion(nr.id)[0];
        if (camp) {
          const ua = new Set(migratedUnlocked); ua.add(camp.id);
          setUnlockedSanctuaries(ua);
          const aa = new Set(migratedSet); aa.add(camp.id);
          activatedSanctuariesRef.current = aa; setActivatedSanctuaries(aa);
        }
        pushLog(`✦ Reparación: ${nr.name} desbloqueada. Viaja a su campamento desde un Portal de Invocación.`);
        toast(`Nueva región desbloqueada: ${nr.name}`, "boss");
      }
    }

    // Resolver spawn: usar santuario del save, no coordenadas de muerte
    const continueData = resolveContinueSpawn(save, REGIONS[save.regionIndex ?? 0]?.id, exploreWorld);
    const sanctuary = continueData.sanctuary;
    const sp = { x: sanctuary.spawnX, y: sanctuary.spawnY };
    const sRegionIndex = continueData.regionIndex;
    const sSectorId = sanctuary.sectorId;
    const sCoords = coordsFromSectorId(sSectorId);
    setRespawnPos(sp);
    lastShrineRef.current = { regionIndex: sRegionIndex, blockIndex: sCoords.col, sectorRow: sCoords.row, x: sp.x, y: sp.y, sanctuaryId: sanctuary.id };
    setLastShrine(lastShrineRef.current);
    // Si el santuario está en una región/sector distinto al del save viejo, ajustar
    if (sRegionIndex !== (save.regionIndex ?? 0)) setRegionIndex(sRegionIndex);
    if (sCoords.col !== (save.blockIndex ?? 0)) setBlockIndex(sCoords.col);
    setSectorRow(sCoords.row);
    lastRevealPosRef.current = null;
    // Restauración de sesión de dungeon: si se cerró dentro, regresar al punto
    // seguro exterior (frente al guardián) según la regla actual de guardado.
    if (save.dungeonSession && save.dungeonSession.dungeonId && DUNGEONS[save.dungeonSession.dungeonId]) {
      const ds = save.dungeonSession;
      const dr = DUNGEONS[ds.dungeonId];
      const rx = ds.exteriorReturnX ?? dr.entrancePos?.x ?? 0;
      const ry = ds.exteriorReturnY ?? dr.entrancePos?.y ?? 0;
      const dRegIdx = ds.exteriorRegion ? sanctuaryRegionIndex(ds.exteriorRegion) : sRegionIndex;
      if (dRegIdx != null && dRegIdx !== sRegionIndex) setRegionIndex(dRegIdx);
      const dCoords = ds.exteriorSector ? coordsFromSectorId(ds.exteriorSector) : sCoords;
      if (dCoords.col !== sCoords.col) setBlockIndex(dCoords.col);
      setSectorRow(dCoords.row);
      setRespawnPos({ x: rx, y: ry });
      lastShrineRef.current = { ...lastShrineRef.current, x: rx, y: ry };
      setLastShrine(lastShrineRef.current);
      setDungeonSession(null);
      pushLog(`Reanudas frente a la entrada de ${dr.name}. El guardián te espera.`);
      toast("Continúas frente a la dungeon", "info");
    } else {
      pushLog(`Reanudas tu aventura: el Portal de Invocación de ${sanctuary.destinationName} te recibe.`);
      toast("Partida continuada desde el santuario", "info");
    }
  };

  const startCombat = (data) => {
    clearCombatTimers();
    setCombatAnimating(false);
    combatRef.current = { turn: 0, physStacks: 0, firstCritUsed: false, sigilUsed: false, playerStatuses: {} };
    setPlayerStatuses({});
    const enemyData = {
      ...data,
      mp: data.maxMp || data.energy || 0,
      maxMp: data.maxMp || data.energy || 0,
      shield: data.shield || 0,
      statuses: data.statuses || {},
    };
    enemyRef.current = enemyData;
    setEnemy(enemyData);
    pushLog(`¡${enemyData.name} aparece! (ATK ${enemyData.attack} · DEF ${enemyData.defense} · HP ${enemyData.hp})`);
  };

  const startCombatThreat = (monster, context = {}) => {
    const beh = worldBehavior(tierOf(threatStateRef.current).id);
    const isElite = Math.random() < beh.eliteChance;
    const normalized = monster?._atlasPlayerAnchored
      ? monster
      : prepareEnemy(monster, region.difficultyMul || 1, playerRef.current?.level || 1, REGION_META[regionIndex].start, region.id, currentSectorId, playerRef.current || player);
    let m = normalized;
    if (isElite) {
      const hp = Math.round(normalized.hp * 1.3);
      const atkMul = 1.25;
      const mp = Math.round((normalized.maxMp || normalized.energy || 8) * 1.3);
      m = {
        ...normalized, hp, maxHp: hp,
        attack: Math.round((normalized.attack || 0) * atkMul),
        physicalAttack: Math.round((normalized.physicalAttack ?? normalized.attack ?? 0) * atkMul),
        magicalAttack: Math.round((normalized.magicalAttack ?? 0) * atkMul),
        mp, maxMp: mp, elite: true, bonusGold: 12 + Math.round(beh.rewardBonus * 40),
      };
    }
    startCombat({ ...m, worldEnemyId: context.worldEnemyId || m.worldEnemyId || null, missionOnly: !!(context.missionOnly || m.missionOnly) });
  };

  const enemyTurn = (currentEnemy, currentPlayer) => {
    if (!currentEnemy || currentEnemy.dying || currentEnemy.hp <= 0) return;
    if (!currentPlayer || currentPlayer.hp <= 0) return;

    const statusTick = tickAtlasStatuses(currentEnemy.statuses || {});
    statusTick.logs.forEach(line => pushLog(`${currentEnemy.name}: ${line}`));
    const statusHp = Math.min(currentEnemy.maxHp, currentEnemy.hp - statusTick.damage + statusTick.heal);
    const enemyAfterStatus = { ...currentEnemy, hp: statusHp, statuses: statusTick.nextStatuses };
    if (statusHp <= 0) {
      pendingDeadRef.current = { wasBoss: !!currentEnemy.boss, enemyId: currentEnemy.id };
      const defeatedByStatus = { ...enemyAfterStatus, hp: 0, dying: true };
      enemyRef.current = defeatedByStatus;
      setEnemy(defeatedByStatus);
      pushLog(`${currentEnemy.name} cae por los estados acumulados.`);
      onKillEnergy();
      return;
    }
    if (!statusTick.canAct) {
      enemyRef.current = enemyAfterStatus;
      setEnemy(enemyAfterStatus);
      pushLog(`${currentEnemy.name} pierde su acción.`);
      return;
    }

    const regen = enemyEnergyRegen(enemyAfterStatus);
    const enemyReady = {
      ...enemyAfterStatus,
      mp: Math.min(enemyAfterStatus.maxMp || 0, (enemyAfterStatus.mp || 0) + regen),
    };
    enemyRef.current = enemyReady;
    setEnemy(enemyReady);

    const roll = rollDie(20);
    showDice(singleDie(20, roll), `${currentEnemy.name}`, () => {
      const action = decideEnemyAction(enemyReady, roll);

      if (action.type === "basic") {
        const bType = enemyReady.basicAttackType || "fisico";
        const eAtk = enemyAtkVsType(enemyReady, bType);
        const rAtk = bType === "fisico" ? Math.max(0, eAtk - roguePhysAtkReduce()) : eAtk;
        const routedEnemy = { ...enemyReady, attack: rAtk };
        const pMod = {
          ...currentPlayer,
          defense: Math.max(0, playerDefVsType(currentPlayer, bType) + statusDefMod(combatRef.current.playerStatuses)),
          attack: Math.max(0, currentPlayer.attack + statusAtkMod(combatRef.current.playerStatuses)),
        };
        const result = executeEnemyBasicAttack(routedEnemy, pMod, roll);
        if (result.isFallo) {
          // Fallo crítico del enemigo: el jugador contraataca (sin dados/crítico/cadena).
          const animationSequence = buildCombatSequence({
            skill: skills?.basic, className: currentPlayer.class, diceGroup: "basico", rollTotal: roll,
            qualityId: "medio", totalDamage: result.counter.damage, kind: "counter",
          });
          const enemyAfterCounter = { ...enemyReady, hp: Math.max(0, enemyReady.hp - result.counter.damage) };
          commitCombatResult(
            { type: "CONTRAATAQUE", enemyDamage: result.counter.damage, playerDamage: 0, counter: true, rollTotal: roll, diceGroup: "basico", qualityId: "medio", animationSequence },
            null,
            { beforePlayer: currentPlayer, afterPlayer: currentPlayer, beforeEnemy: enemyReady, afterEnemy: enemyAfterCounter, resolution: { rawDamage: result.counter.damage, hpDamage: result.counter.damage } },
          );
          pushLog(`${currentEnemy.name} falla (d20 ${roll}). ¡Contraataque! Le infliges ${result.counter.damage} daño.`);
          if (enemyAfterCounter.hp <= 0) {
            pushLog(`¡Derrotas a ${currentEnemy.name} con un contraataque!`);
            pendingDeadRef.current = { wasBoss: !!currentEnemy.boss, enemyId: currentEnemy.id };
            stageEnemyDefeat(enemyAfterCounter, animationSequence);
            onKillEnergy();
            return;
          }
          enemyRef.current = enemyAfterCounter;
          setEnemy(enemyAfterCounter);
          return;
        }
        const inc = modifyIncoming(result.damage);
        if (inc.dodged || inc.log) pushLog(inc.log || "Esquivas el ataque.");
        const playerAfterPassive = playerRef.current || currentPlayer;
        const playerAfterHit = { ...playerAfterPassive, hp: Math.max(0, playerAfterPassive.hp - inc.dmg) };
        commitCombatResult(
          { type: "ENEMY_ATTACK", playerDamage: inc.dmg, enemyDamage: 0, crit: result.isCrit, enemyBasic: true },
          result.isCrit ? 860 : 720,
          { beforePlayer: currentPlayer, afterPlayer: playerAfterHit, beforeEnemy: enemyReady, afterEnemy: enemyReady, resolution: { rawDamage: inc.dmg, hpDamage: inc.dmg } },
        );
        pushLog(`${currentEnemy.name} ataca (${result.quality}): ${inc.dmg} daño${result.isCrit ? " (¡crítico, ignora DEF!)" : ""}.`);
        if (playerAfterHit.hp <= 0) {
          stagePlayerDefeat(playerAfterHit, { totalDuration: result.isCrit ? 860 : 720 }, { toastMessage: "Has caído en combate" });
          return;
        }
        playerRef.current = playerAfterHit;
        setPlayer(playerAfterHit);
      } else {
        const ability = action.ability;
        const newMp = Math.max(0, (enemyReady.mp || 0) - ability.cost);
        const aType = ABILITY_TYPE[ability.id] || "fisico";
        const eAtk = enemyAtkVsType(enemyReady, aType);
        const rAtk = aType === "fisico" ? Math.max(0, eAtk - roguePhysAtkReduce()) : eAtk;
        const routedEnemy = { ...enemyReady, attack: rAtk };
        const pMod = {
          ...currentPlayer,
          defense: Math.max(0, playerDefVsType(currentPlayer, aType) + statusDefMod(combatRef.current.playerStatuses)),
          attack: Math.max(0, currentPlayer.attack + statusAtkMod(combatRef.current.playerStatuses)),
        };
        const result = executeEnemyAbility(routedEnemy, ability, pMod, roll);

        // Sanar/escudo se resuelven sobre una sola instantánea para evitar
        // que varias llamadas a setEnemy se pisen entre sí.
        let enemyAfterAbility = { ...enemyReady, mp: newMp };
        if (result.heal > 0) {
          enemyAfterAbility.hp = Math.min(enemyAfterAbility.maxHp, enemyAfterAbility.hp + result.heal);
          pushLog(`${currentEnemy.name} se cura ${result.heal} HP.`);
        }
        if (result.selfShield > 0) {
          enemyAfterAbility.shield = (enemyAfterAbility.shield || 0) + result.selfShield;
          pushLog(`${currentEnemy.name} gana un escudo de ${result.selfShield}.`);
        }
        enemyRef.current = enemyAfterAbility;
        setEnemy(enemyAfterAbility);

        if (result.isFallo) {
          // Fallo crítico del enemigo: el jugador contraataca (sin dados/crítico/cadena).
          const animationSequence = buildCombatSequence({
            skill: skills?.basic, className: currentPlayer.class, diceGroup: "basico", rollTotal: roll,
            qualityId: "medio", totalDamage: result.counter.damage, kind: "counter",
          });
          const enemyAfterCounter = { ...enemyAfterAbility, hp: Math.max(0, enemyAfterAbility.hp - result.counter.damage) };
          commitCombatResult(
            { type: "CONTRAATAQUE", enemyDamage: result.counter.damage, playerDamage: 0, counter: true, enemySkill: ability.name, rollTotal: roll, diceGroup: "basico", qualityId: "medio", animationSequence },
            null,
            { beforePlayer: currentPlayer, afterPlayer: currentPlayer, beforeEnemy: enemyAfterAbility, afterEnemy: enemyAfterCounter, resolution: { rawDamage: result.counter.damage, hpDamage: result.counter.damage } },
          );
          pushLog(`${currentEnemy.name} falla con ${ability.name} (d20 ${roll}). ¡Contraataque! Le infliges ${result.counter.damage} daño.`);
          if (enemyAfterCounter.hp <= 0) {
            pushLog(`¡Derrotas a ${currentEnemy.name} con un contraataque!`);
            pendingDeadRef.current = { wasBoss: !!currentEnemy.boss, enemyId: currentEnemy.id };
            stageEnemyDefeat(enemyAfterCounter, animationSequence);
            onKillEnergy();
            return;
          }
          enemyRef.current = enemyAfterCounter;
          setEnemy(enemyAfterCounter);
          return;
        }

        const inc = modifyIncoming(result.damage);
        if (inc.dodged || inc.log) pushLog(inc.log || "Esquivas la habilidad.");
        const playerAfterPassive = playerRef.current || currentPlayer;
        const playerAfterHit = { ...playerAfterPassive, hp: Math.max(0, playerAfterPassive.hp - inc.dmg) };
        commitCombatResult({
          type: "ENEMY_ABILITY", playerDamage: inc.dmg, enemyDamage: 0, crit: result.isCrit,
          enemySkill: ability.name, element: ability.element, vfxType: ability.vfx,
        }, result.isCrit ? 860 : 720, {
          beforePlayer: currentPlayer, afterPlayer: playerAfterHit, beforeEnemy: enemyAfterAbility, afterEnemy: enemyAfterAbility,
          resolution: { rawDamage: inc.dmg, hpDamage: inc.dmg },
        });
        pushLog(`${currentEnemy.name} usa ${ability.name}: ${inc.dmg} daño${result.isCrit ? " (¡crítico, ignora DEF!)" : ""}${result.status ? ` + ${STATUS_INFO[result.status.type]?.name || result.status.type}` : ""}.`);

        if (result.status) {
          combatRef.current.playerStatuses = {
            ...combatRef.current.playerStatuses,
            [result.status.type]: { duration: result.status.duration, amount: result.amount || 1 },
          };
          setPlayerStatuses({ ...combatRef.current.playerStatuses });
        }

        if (playerAfterHit.hp <= 0) {
          stagePlayerDefeat(playerAfterHit, { totalDuration: result.isCrit ? 860 : 720 }, { toastMessage: "Has caído en combate" });
          return;
        }
        playerRef.current = playerAfterHit;
        setPlayer(playerAfterHit);
      }
    }, true);
  };

  const onThreatEvent = () => {
    if (enemy) return;
    const threatVal = threatStateRef.current;
    const tier = tierOf(threatVal);
    const special = rollThreatEvent(threatVal);
    if (special) {
      pushLog(`⚠ ${special.name}: ${special.desc}`);
      toast(special.name, "boss");
      if (special.type === "ambush") {
        const m = randomRegionMonster(region.id, MONSTERS);
        const prepared = prepareEnemy(m, (region.difficultyMul || 1) * 1.1, player?.level || 1, REGION_META[regionIndex].start, region.id, currentSectorId, playerRef.current || player);
        startCombat(withEnemyAtkBonus({ ...prepared, addsThreat: true }, threatAtkBonus(threatVal)));
      } else if (special.type === "elite") {
        const m = randomRegionMonster(region.id, MONSTERS);
        const prepared = prepareEnemy(m, (region.difficultyMul || 1) * 1.4, player?.level || 1, REGION_META[regionIndex].start, region.id, currentSectorId, playerRef.current || player);
        startCombat({ ...prepared, elite: true, bonusGold: 15 + Math.round(threatVal * 3) });
      } else if (special.type === "rift") {
        setPlayer(p => ({ ...p, materials: { ...(p.materials || {}), fragmentos_atlas: (p.materials?.fragmentos_atlas || 0) + 1 } }));
        applyThreatEvent("rift", 1);
        toast("Fragmentos de Atlas obtenidos", "item");
      } else if (special.type === "chest") {
        const g = 10 + randInt(0, 15);
        const mid = RARE_MATERIALS[randInt(0, RARE_MATERIALS.length - 1)];
        setPlayer(p => ({ ...p, gold: (p.gold || 0) + g, materials: { ...(p.materials || {}), [mid]: (p.materials?.[mid] || 0) + 1 } }));
        toast(`Botín: +${g} oro y ${MATERIALS[mid].name}`, "gold");
      } else if (special.type === "merchant") {
        const g = 10 + randInt(0, 15);
        const mid = COMMON_MATERIALS[randInt(0, COMMON_MATERIALS.length - 1)];
        setPlayer(p => ({ ...p, gold: (p.gold || 0) + g, materials: { ...(p.materials || {}), [mid]: (p.materials?.[mid] || 0) + 1 } }));
        toast(`Comerciante: +${g} oro y ${MATERIALS[mid].name}`, "gold");
      } else if (special.type === "shrine") {
        setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, (p.hp || 0) + 6), mp: Math.min(p.maxMp || 0, (p.mp || 0) + 3) }));
        toast("Santuario menor: vigor restaurado", "info");
      }
      return;
    }
    const msg = rollEvent(tier.id);
    if (msg) { pushLog(msg); toast(msg, "info"); }
  };

  const onExploreThreat = () => {};
  const onIdleThreat = () => setThreat(t => Math.max(0, t - THREAT_REDUCE.idleTick));

  const onStrangerMeet = () => {
    setPlayer(p => recomputePlayer({ ...p, gold: (p.gold || 0) + 25 }));
    pushLog("El desconocido asiente: «Atlas conoce tu nombre.» Te entrega 25 oro y desaparece entre la niebla.");
    toast("Encuentro secreto: +25 oro", "item");
  };

  const sumPassive = (p, type) => (p?.passives || []).filter(x => x.type === type).reduce((s, x) => s + (x.value || 0), 0);
  const goldMult = (p) => 1 + sumPassive(p, "gold_bonus") + sumPassive(p, "legendary_atlas");
  const xpMult = (p) => 1 + sumPassive(p, "xp_bonus");
  const priceMult = (p) => {
    const base = Math.max(0.5, 1 - sumPassive(p, "price_reduce"));
    const econ = threatEconomyMod(threat);
    return base * econ.shopPriceMult;
  };
  const threatMult = (p) => Math.max(0, 1 - sumPassive(p, "legendary_atlas"));

  const gainXp = (amount) => {
    const p = playerRef.current; if (!p) return;
    const amt = Math.max(1, Math.round(amount * xpMult(p)));
    const res = applyXp(p, amt, regionIndex, bossAlive);
    const np = recomputePlayer(res.player);
    setPlayer(np);
    if (res.levelsGained > 0) {
      toast(`¡Subes a nivel ${np.level}!`, "levelup");
      setShowLevelUp(true);
      if (res.energyGained > 0) toast(`Atlas fortalece tu dominio: +${res.energyGained} ${np.energyName || "energía"} máxima`, "info");
    }
  };

  const handleArrival = (nodeId, currentThreat) => {
    const n = map.nodes[nodeId];
    if (n && n.gatewayTo) {
      const { block: nb, node: nn } = n.gatewayTo;
      setBlockIndex(nb);
      setSectorRow(1);
      setLocation(nn);
      const blk = BLOCK_DEFS[region.id][nb];
      pushLog(`Cruzas al bloque ${nb + 1}: ${blk.name}.`);
      toast(`Bloque ${nb + 1}: ${blk.name}`, "info");
      return;
    }
    const t = region.terrains[n.terrain] || {};
    pushLog(`Llegas a ${t.name || "Zona"}.`);
    if (map.objectiveId && nodeId === map.objectiveId) {
      progressTracker("reach");
      pushLog("¡Punto de interés alcanzado! Vuelve a la zona segura para reclamar.");
    }
    if (n.safe) { pushLog("Zona segura. Descansa o habla con el NPC."); return; }
    const enc = resolveEncounter(n, currentThreat, defeatedBosses, region.difficultyMul, region.id, player?.level || 1, REGION_META[regionIndex].start, playerRef.current || player);
    if (!enc) { pushLog("El área parece despejada."); return; }
    if (enc.type === "boss") {
      if (bossUnlocked) startBossWithIntro(enc.data);
      else { pushLog("El jefe aún no está disponible. Completa más misiones (progreso 80%)."); toast("Completa más misiones para desafiar al jefe", "info"); }
    }
    else if (enc.type === "monster") startCombat(withEnemyAtkBonus(enc.data, threatAtkBonus(currentThreat)));
    else {
      pushLog(`¡Trampa! ${enc.data.name}: ${enc.data.desc}`);
      if (enc.data.damage > 0) {
        setPlayer(p => {
          const nh = Math.max(0, p.hp - enc.data.damage);
          if (nh <= 0) { downed("trap"); toast("La trampa te derrotó", "trap"); }
          return { ...p, hp: nh };
        });
        toast(`Trampa: -${enc.data.damage} de vida`, "trap");
      }
    }
  };

  const handleTravelRoll = () => {
    if (enemy || bonusMove || pendingMoves || status !== "playing" || diceAnim) return;
    const roll = rollDie(12);
    showDice(singleDie(12, roll), "Viaje", () => {
      const res = resolveTravel(roll);
      pushLog(res.log);
      // Viajar ya no modifica la Amenaza (regla 2).
      const newThreat = threat;
      if (res.moves > 0) {
        setPendingMoves(res.moves);
      } else if (!node.safe) {
        const amb = ambushChance(newThreat);
        if (amb > 0 && Math.random() < amb) {
          const m = randomRegionMonster(region.id, MONSTERS);
          const prepared = prepareEnemy(m, region.difficultyMul, player?.level || 1, REGION_META[regionIndex].start, region.id, currentSectorId, playerRef.current || player);
          startCombat(withEnemyAtkBonus(prepared, threatAtkBonus(newThreat)));
          pushLog("¡Emboscada! Un enemigo te ataca durante el viaje.");
          toast("¡Emboscada!", "trap");
        }
      }
    });
  };

  const selectDestination = (targetId) => {
    if (!pendingMoves || !canTravel(map.topology, location, targetId)) return;
    setLocation(targetId);
    if (pendingMoves === 2) {
      const tn = map.nodes[targetId];
      const stop = (tn.boss && !defeatedBosses.has(tn.boss.id)) || !!tn.gatewayTo;
      if (stop) {
        setPendingMoves(0); handleArrival(targetId, threat);
      } else {
        setPendingMoves(0); setBonusMove(true);
        pushLog("Puedes avanzar a un segundo nodo o quedarte aquí.");
      }
    } else {
      setPendingMoves(0); handleArrival(targetId, threat);
    }
  };

  const bonusTravelTo = (targetId) => {
    if (!bonusMove || !canTravel(map.topology, location, targetId)) return;
    setLocation(targetId); setBonusMove(false); handleArrival(targetId, threat);
  };
  const skipBonus = () => { setBonusMove(false); handleArrival(location, threat); };

  const handleNodeClick = (targetId) => {
    if (bonusMove) bonusTravelTo(targetId);
    else if (pendingMoves > 0) selectDestination(targetId);
  };

  const rest = () => {
    if (enemy || !node.safe || status !== "playing") return;
    restorePlayerAtRest("camp");
    setThreat(t => Math.max(0, t - THREAT_REDUCE.rest));
    pushLog(`Descansas en zona segura: vida y ${playerRef.current?.energyName || "energía"} restauradas. Estados limpiados. Amenaza -${THREAT_REDUCE.rest}.`);
    toast("Descanso: vida y energía al máximo", "heal");
    persistSession();
  };

  const restInField = () => {
    if (enemy || status !== "playing") return;
    restorePlayerAtRest("camp");
    setThreat(t => Math.max(0, t - THREAT_REDUCE.rest));
    pushLog(`Descansas en el refugio: vida y ${playerRef.current?.energyName || "energía"} restauradas. Estados limpiados. Amenaza -${THREAT_REDUCE.rest}.`);
    toast("Descanso: vida y energía al máximo", "heal");
    persistSession();
  };

  const restAt = (sector) => {
    if (enemy || status !== "playing") return;
    const econ = threatEconomyMod(threat);
    const cost = Math.round((REST_COST[sector] || 0) * econ.restCostMult);
    const p = playerRef.current;
    if ((p?.gold || 0) < cost) { toast(`Necesitas ${cost} oro para descansar aquí`, "info"); return; }
    restorePlayerAtRest("inn", { gold: Math.max(0, (p.gold || 0) - cost) });
    setThreat(t => Math.max(0, t - THREAT_REDUCE.rest));
    pushLog(`Descansas por ${cost} oro: vida y ${p?.energyName || "energía"} restauradas. Estados limpiados. Amenaza -${THREAT_REDUCE.rest}.`);
    toast(`Descanso (-${cost} oro)`, "heal");
    persistSession();
  };

  const restAtSanctuary = () => {
    if (enemy || status !== "playing") return;
    restorePlayerAtRest("sanctuary");
    setThreat(0);
    combatWinCounterRef.current = 0;
    pushLog("Descansas en el santuario: vida y energía al máximo, estados negativos limpiados. Amenaza eliminada.");
    toast("Amenaza eliminada por santuario", "heal");
    persistSession();
    setShrineModal(null);
  };

  const openShop = (tier) => { setShopTier(tier || "city"); setShowShop(true); };
  const openSmith = (tier = "camp") => { setSmithTier(tier); setShowSmith(true); };

  const damageWeapon = (amount = 1) => {
    const p = playerRef.current;
    if (!p || amount <= 0) return;
    const current = p.weaponDurability ?? 100;
    const next = Math.max(0, current - amount);
    if (next === current) return;
    const np = recomputePlayer({ ...p, weaponDurability: next, weaponDurabilityMax: p.weaponDurabilityMax ?? 100 });
    playerRef.current = np;
    setPlayer(np);
    if (next === 0) toast("Tu arma está inutilizable: repárala en una herrería.", "trap");
    else if (current >= 25 && next < 25) toast("Tu arma está muy desgastada.", "info");
  };

  const repairEquipment = () => {
    const p = playerRef.current; if (!p) return;
    const condition = p.equipmentCondition ?? 100;
    const weaponDurability = p.weaponDurability ?? 100;
    if (condition >= 100 && weaponDurability >= 100) { toast("Tu equipo ya está en perfectas condiciones", "info"); return; }
    const tier = getSmithTierById(smithTier);
    const missingArmor = 100 - condition;
    const missingWeapon = 100 - weaponDurability;
    const baseRate = tier.id === "city" ? 0.32 : tier.id === "town" ? 0.38 : 0.45;
    const cost = Math.max(4, Math.ceil((missingArmor * 0.65 + missingWeapon) * baseRate));
    if ((p.gold || 0) < cost) { toast(`Necesitas ${cost} oro para reparar el equipo`, "info"); return; }
    const np = recomputePlayer({ ...p, gold: (p.gold || 0) - cost, equipmentCondition: 100, weaponDurability: 100, weaponDurabilityMax: 100 });
    playerRef.current = np;
    setPlayer(np);
    toast(`Arma y equipo reparados (-${cost} oro)`, "equip");
    pushLog(`${tier.label}: arma y protección vuelven al 100% de condición.`);
  };

  const restoreGreenRelic = () => {
    const p = playerRef.current;
    if (!p || region.id !== "verde") return { ok: false, message: "Esta forja no reconoce esa reliquia." };
    if (p.relics?.verde?.state === "restored") {
      advanceMissionEvent({ type: "interact", targetId: "verde_b2_forja_reliquia", sectorId: "B2" });
      return { ok: true, message: `${p.relics.verde.name} ya está restaurada y vinculada a ti.` };
    }
    const missing = getMissingGreenRelicComponents(p);
    if (!canRestoreGreenRelic(p, worldFlagsRef.current)) {
      const reason = !worldFlagsRef.current["verde:broken_relic_found"]
        ? "Todavía no has encontrado los restos del arma del Guardián."
        : !worldFlagsRef.current["verde:city_services_open"]
          ? "La forja regional de Verdalia aún no está disponible."
          : `Faltan componentes: ${missing.map(x => x.name).join(", ")}.`;
      toast(reason, "info");
      return { ok: false, message: reason };
    }
    const form = getGreenRelicForm(p.class);
    const weaponId = getGreenRelicWeaponId(p.class);
    const nextPlayer = recomputePlayer({
      ...p,
      questItems: consumeGreenRelicComponents(p),
      classWeaponInventory: [...new Set([...(p.classWeaponInventory || []), weaponId])],
      classWeapon: weaponId,
      weapon: null,
      relics: {
        ...(p.relics || {}),
        verde: { state: "restored", name: form.name, form: form.form, weaponId },
      },
    });
    playerRef.current = nextPlayer;
    setPlayer(nextPlayer);
    const nextFlags = { ...worldFlagsRef.current, "verde:relic_restored": true, "verde:relic_bound": true };
    worldFlagsRef.current = nextFlags;
    setWorldFlags(nextFlags);
    advanceMissionEvent({ type: "interact", targetId: "verde_b2_forja_reliquia", sectorId: "B2" });
    toast(`Reliquia restaurada: ${form.name}`, "boss");
    pushLog(`✦ La hoja fracturada adopta la forma ${form.form}: ${form.name}.`);
    return { ok: true, message: `${form.name} despierta y queda equipada. La corrupción del Santuario ya puede romperse.` };
  };
  const openSettlementNpc = (npc) => setActiveSettlementNpc(npc);
  const closeSettlementNpc = () => setActiveSettlementNpc(null);
  const openFlavor = (npc) => setFlavorDialog({ npc, line: randomFlavorLine(npc.id) });
  const closeFlavor = () => setFlavorDialog(null);

  const addConsumable = (id) => setPlayer(prev => {
    if (id === "hp_s") return { ...prev, potions: (prev.potions || 0) + 1 };
    return { ...prev, consumables: { ...(prev.consumables || {}), [id]: (prev.consumables?.[id] || 0) + 1 } };
  });
  const addEquipment = (res) => {
    if (res.kind === "accessory") setPlayer(prev => recomputePlayer({ ...prev, accessoryInventory: [...new Set([...(prev.accessoryInventory || []), res.id])] }));
    else if (res.kind === "weapon") setPlayer(prev => ({ ...prev, weaponInventory: [...(prev.weaponInventory || []), makeWeaponInstance(res.id)] }));
    else if (res.kind === "armor") setPlayer(prev => recomputePlayer({ ...prev, armorInventory: [...new Set([...(prev.armorInventory || []), res.id])] }));
    else if (res.kind === "helmet") setPlayer(prev => recomputePlayer({ ...prev, helmetInventory: [...new Set([...(prev.helmetInventory || []), res.id])] }));
    toast(`¡${res.name} obtenido!`, "item");
  };
  const applyLoot = (res) => {
    const p = playerRef.current; if (!p) return;
    switch (res.type) {
      case "none": return;
      case "hp": setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + res.amount) })); return;
      case "energy": setPlayer(prev => ({ ...prev, mp: Math.min(prev.maxMp || 0, (prev.mp || 0) + res.amount) })); return;
      case "gold": setPlayer(prev => ({ ...prev, gold: Math.round((prev.gold || 0) + res.amount * goldMult(prev)) })); return;
      case "material": setPlayer(prev => ({ ...prev, materials: { ...(prev.materials || {}), [res.id]: (prev.materials?.[res.id] || 0) + (res.amount || 1) } })); return;
      case "consumable": addConsumable(res.id); return;
      case "equipment": addEquipment(res); return;
    }
  };
  const applyDestiny = (ev) => {
    const rewards = [];
    const addGold = (g) => setPlayer(prev => ({ ...prev, gold: Math.round((prev.gold || 0) + g * goldMult(prev)) }));
    const addMat = (id) => setPlayer(prev => ({ ...prev, materials: { ...(prev.materials || {}), [id]: (prev.materials?.[id] || 0) + 1 } }));
    switch (ev.id) {
      case "rare_chest": { const g = 20 + randInt(0, 25); addGold(g); rewards.push({ text: `+${g} oro` }); const mid = RARE_MATERIALS[randInt(0, RARE_MATERIALS.length - 1)]; addMat(mid); rewards.push({ text: MATERIALS[mid].name }); break; }
      case "mystery_merchant": { addConsumable("hp_m"); rewards.push({ text: "Poción mediana (obsequio)" }); const g = 5 + randInt(0, 12); addGold(g); rewards.push({ text: `+${g} oro` }); break; }
      case "hidden_cave": { for (let i = 0; i < 2; i++) { const mid = RARE_MATERIALS[randInt(0, RARE_MATERIALS.length - 1)]; addMat(mid); rewards.push({ text: MATERIALS[mid].name }); } break; }
      case "elite_enemy": { const g = 30 + randInt(0, 25); addGold(g); rewards.push({ text: `+${g} oro (botín de élite)` }); break; }
      case "ancient_shrine": { setPlayer(prev => ({ ...prev, hp: prev.maxHp, mp: prev.maxMp || 0 })); rewards.push({ text: "Vida y energía restauradas" }); break; }
      case "secret_mission": { gainXp(KILL_XP[regionIndex]); const g = 25 + randInt(0, 20); addGold(g); rewards.push({ text: `+${g} oro` }); rewards.push({ text: "Experiencia" }); break; }
    }
    return rewards;
  };
  const rollLoot = () => {
    if (status !== "playing") return;
    const p = playerRef.current; if (!p) return;
    const roll = rollLootD10();
    if (roll === 10) {
      const ev = rollDestiny();
      const rewards = applyDestiny(ev);
      pushLog(`✦ Destino de Atlas: ${ev.name}.`);
      setDestinyEvent({ event: ev, rewards });
      return;
    }
    const res = resolveLoot(roll, p, ACCESSORIES, regionIndex);
    applyLoot(res);
    pushLog(`Dado D10: ${roll} → ${res.text}${res.name ? ` (${res.name})` : ""}`);
    setLootReward({ roll, ...res });
  };

  const applyGlobalDestinyRewards = (rewards) => rewards.map(r => {
    if (r.kind === "loot" && r.loot) applyLoot(r.loot);
    else if (r.kind === "heal_full") setPlayer(prev => ({ ...prev, hp: prev.maxHp, mp: prev.maxMp || 0 }));
    else if (r.kind === "energy_full") setPlayer(prev => ({ ...prev, mp: prev.maxMp || 0 }));
    else if (r.kind === "xp") gainXp(r.amount || 0);
    return { text: r.text };
  });

  const rollGlobalLoot = (defeatedEnemy) => {
    if (status !== "playing") return;
    const p = playerRef.current; if (!p) return;
    const ctx = {
      regionId: region.id,
      regionIndex,
      blockIndex,
      settlementStage: ["camp", "town", "city"][Math.max(0, Math.min(2, blockIndex || 0))],
      enemyType: defeatedEnemy?.type,
      isBoss: !!defeatedEnemy?.boss,
      isElite: !!defeatedEnemy?.elite,
      equipmentUnlocks: p.equipmentUnlocks || {},
      threat: threatStateRef.current,
      difficultyMul: region.difficultyMul,
      playerClass: p.class,
      regionProgress,
    };
    const result = resolveGlobalLoot(ctx);
    if (result.type === "destiny") {
      const rewards = applyGlobalDestinyRewards(result.rewards);
      pushLog(`✦ Destino de Atlas: ${result.event.name}.`);
      setDestinyEvent({ event: result.event, rewards });
      return;
    }
    applyLoot(result);
    pushLog(`D10 ${result.roll} → ${result.text}${result.name ? ` (${result.name})` : ""}`);
    setLootReward(result);
  };

  const onShrineCheck = (x, y) => {
    const slots = shrinesRef.current;
    if (!slots || !slots.length || slots.every(s => s.revealed)) return;
    const tier = tierOf(threatStateRef.current).id;
    const threshold = revealThreshold(tier);
    const last = lastRevealPosRef.current;
    if (last && Math.hypot(x - last.x, y - last.y) < threshold) return;
    const hidden = slots.filter(s => !s.revealed).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
    if (!hidden.length) return;
    const slot = hidden[0];
    const type = rollShrineType(tier, regionIndex, regionProgress);
    lastRevealPosRef.current = { x, y };
    const next = slots.map(s => s.id === slot.id ? { ...s, revealed: true, type } : s);
    shrinesRef.current = next;
    setShrines(next);
    setShrineNotify({ id: slot.id, type, message: pickNotify(type) });
    pushLog("Una energía antigua altera el ambiente... Atlas ha dejado una marca en este lugar.");
    toast("Un Santuario de Atlas se manifiesta", "info");
  };

  const openShrine = (id) => {
    const slot = shrinesRef.current.find(s => s.id === id);
    if (!slot || !slot.revealed) return;

    // Los Portales de Invocación siempre abren su menú al pulsar A desde
    // la plataforma. Un portal ya activado no se reactiva ni cura de forma
    // automática: únicamente muestra los destinos y la opción de descanso.
    if (slot.isSanctuary) {
      const sanctuaryId = slot.sanctuaryId || slot.id;
      const sanctuary = getSanctuaryById(sanctuaryId);
      if (!sanctuary) return;
      const activated = activatedSanctuariesRef.current.has(sanctuaryId) || slot.activated;
      setShrineModal({ ...slot, activated, sanctuary });
      return;
    }

    if (slot.activated) return;
    setShrineModal(slot);
  };
  const closeShrine = () => setShrineModal(null);

  const activateShrine = (id) => {
    const slot = shrinesRef.current.find(s => s.id === id);
    if (!slot) return;

    // ── SANTUARIO-PORTAL: activación persistente + viaje rápido ──
    if (slot.isSanctuary) {
      const sanctuaryId = slot.sanctuaryId || slot.id;
      const sanctuary = getSanctuaryById(sanctuaryId);
      if (!sanctuary) return;
      const wasActivated = activatedSanctuariesRef.current.has(sanctuaryId);
      const newActivated = new Set(activatedSanctuariesRef.current);
      newActivated.add(sanctuaryId);
      activatedSanctuariesRef.current = newActivated;
      setActivatedSanctuaries(newActivated);
      const newUnlocked = new Set(unlockedSanctuaries);
      newUnlocked.add(sanctuaryId);
      setUnlockedSanctuaries(newUnlocked);
      lastActivatedSanctuaryIdRef.current = sanctuaryId;
      setLastActivatedSanctuaryId(sanctuaryId);

      // Marcar el slot como activado sin desactivar los demás portales
      const next = shrinesRef.current.map(s => s.id === id ? { ...s, activated: true } : s);
      shrinesRef.current = next;
      setShrines(next);

      lastShrineRef.current = { regionIndex, blockIndex, sectorRow, x: sanctuary.spawnX, y: sanctuary.spawnY, sanctuaryId };
      setLastShrine(lastShrineRef.current);
      setRespawnPos({ x: sanctuary.spawnX, y: sanctuary.spawnY });
      restorePlayerAtRest("sanctuary");
      pushLog("El Portal de Invocación irradia energía: vida y energía al máximo, estados negativos disipados.");
      if (!wasActivated) toast("Santuario: vigor restaurado", "heal");

      persistSession({
        shrinePos: { x: sanctuary.spawnX, y: sanctuary.spawnY },
        activatedSanctuaries: [...newActivated], unlockedSanctuaries: [...newUnlocked],
        lastActivatedSanctuaryId: sanctuaryId,
      });
      pushLog(`Portal de Invocación activado en ${sanctuary.destinationName}. Ahora puedes viajar aquí.`);
      toast(`Portal vinculado: ${sanctuary.destinationName}`, "info");
      setShrineModal({ ...slot, activated: true, isSanctuary: true, sanctuary });
      return;
    }

    // ── SANTUARIO MENOR (normal/antiguo/corrupto) ──
    if (slot.activated) return;
    const type = slot.type || "normal";
    const tdef = SHRINE_TYPES[type];
    const hadPrev = shrinesRef.current.some(s => s.activated);
    const next = shrinesRef.current.map(s => s.id === id ? { ...s, activated: true } : { ...s, activated: false });
    shrinesRef.current = next;
    setShrines(next);
    shrineSnapshotRef.current = {
      level: playerRef.current?.level,
      xp: playerRef.current?.xp,
      regionIndex, blockIndex,
      threat: threatStateRef.current,
      missions, openedChests, defeatedBosses, defeatedEnemyIds,
    };
    lastShrineRef.current = { regionIndex, blockIndex, sectorRow, x: slot.x, y: slot.y };
    setLastShrine({ regionIndex, blockIndex, sectorRow, x: slot.x, y: slot.y });
    persistSession({ shrinePos: { x: slot.x, y: slot.y } });
    pushLog(hadPrev ? "Activas este santuario: el vínculo anterior se disuelve. Atlas ahora te ancla aquí." : "Santuario de Atlas activado: el mundo registra su paso.");
    if (type === "corrupted") {
      applyThreatEvent("shrine_corrupt:" + slot.id, 1);
      setPlayer(p => ({ ...p, hp: Math.max(1, Math.round((p.maxHp || 1) * 0.35)), mp: Math.round((p.maxMp || 0) * 0.35) }));
      setShrineModal(null);
      if (Math.random() < 0.6) {
        const m = randomRegionMonster(region.id, MONSTERS);
        const prepared = prepareEnemy(m, (region.difficultyMul || 1) * 1.2, player?.level || 1, REGION_META[regionIndex].start, region.id, currentSectorId, playerRef.current || player);
        startCombat({ ...prepared, elite: true, corrupted: true, addsThreat: true, bonusGold: 15 });
        toast("¡La corrupción desata un enemigo!", "trap");
      } else {
        rollGlobalLoot({ boss: true, type: "corrupted" });
      }
    } else {
      setThreat(t => Math.max(0, t - 2));
      setPlayer(p => ({
        ...p,
        hp: Math.min(p.maxHp, Math.max(p.hp, Math.round((p.maxHp || 1) * 0.6))),
        mp: Math.min(p.maxMp || 0, Math.max(p.mp || 0, Math.round((p.maxMp || 0) * 0.6))),
      }));
      if (type === "ancient") {
        const lore = shrineLore(region.id);
        setShrineModal({ ...slot, activated: true, lore });
        pushLog(`«${lore}»`);
      } else {
        setShrineModal(null);
      }
    }
    toast(`${tdef.name} activado`, "info");
  };

  const consumeShrineNotify = () => setShrineNotify(null);
  const consumeRespawn = () => setRespawnPos(null);

  const downed = (reason) => {
    if (lastShrineRef.current) {
      setStatus("downed");
      pushLog(reason === "trap" ? "La trampa te derrotó, pero Atlas intercede..." : "Tu vida llega a 0, pero Atlas intercede...");
    } else {
      setStatus("defeat");
      pushLog(reason === "trap" ? "La trampa te derrotó." : "Tu vida llega a 0.");
    }
  };

  playerDefeatHandlerRef.current = downed;
  const {
    clearCombatTimers, commitCombatResult, stageEnemyDefeat, stagePlayerDefeat, scheduleEnemyTurn,
  } = useAtlasCombatRuntime({
    setLastResult, setCombatAnimating, setEnemy, setPlayer,
    playerRef, enemyRef, onPlayerDefeatRef: playerDefeatHandlerRef, toast,
  });

  const respawnAtShrine = () => {
    const ls = lastShrineRef.current;
    if (!ls) { setStatus("defeat"); return; }
    // Si hay un santuario vinculado, usar su spawn seguro validado
    let spawnX = ls.x, spawnY = ls.y;
    if (ls.sanctuaryId) {
      const sanctuary = getSanctuaryById(ls.sanctuaryId);
      if (sanctuary) {
        const safeSpawn = getSafeSanctuarySpawn(sanctuary.regionId, sanctuary.sectorId, sanctuary.id, exploreWorld);
        if (safeSpawn) { spawnX = safeSpawn.x; spawnY = safeSpawn.y; }
      }
    }
    setPlayer(p => {
      const lost = Math.round((p.gold || 0) * 0.25);
      return {
        ...p,
        hp: Math.max(1, Math.round((p.maxHp || 1) * 0.5)),
        mp: Math.round((p.maxMp || 0) * 0.5),
        gold: Math.max(0, (p.gold || 0) - lost),
        equipmentCondition: Math.max(20, (p.equipmentCondition ?? 100) - 15),
      };
    });
    applyThreatEvent("respawn", 3);
    dungeonBossContextRef.current = null;
    setEnemy(null); setLastResult(null); setCombatAnimating(false);
    clearCombatTimers();
    combatRef.current.playerStatuses = {};
    setPlayerStatuses({});
    setRespawnPos({ x: spawnX, y: spawnY });
    if (ls.regionIndex !== regionIndex) setRegionIndex(ls.regionIndex);
    if (ls.blockIndex !== blockIndex) setBlockIndex(ls.blockIndex);
    setSectorRow(ls.sectorRow ?? 1);
    setStatus("playing");
    pushLog("Atlas te devuelve al Portal de Invocación. El mundo recuerda tu caída.");
    toast("Atlas te ha traído de vuelta", "info");
  };

  // ── Viaje rápido entre santuarios-portales activados ──
  // La lógica de viaje/avance de región vive en useAtlasRegionTravel: valida
  // el mapa destino antes de mutar el estado y hace fallback si no carga.
  const regionTravel = useAtlasRegionTravel({
    canonicalMapsRef, unlockedRegionsRef, worldFlagsRef, missionsRef, missionsByRegionRef,
    activatedSanctuariesRef, lastActivatedSanctuaryIdRef, lastShrineRef,
    enemy, diceAnim, npcDialog, showIntro, regionIndex, blockIndex, region, unlockedSanctuaries, bossDefeated,
    setMissions, setPriorityMissionId, setRegionIndex, setBlockIndex, setSectorRow, setRespawnPos,
    setLastShrine, setLastActivatedSanctuaryId, setShrineModal, setThreat, setShowIntro,
    setWorldFlags, setUnlockedRegions, setActivatedSanctuaries, setUnlockedSanctuaries, setUnlockedSectors,
    setEnemy, setPendingMoves, setBonusMove, setLastResult, setOpenedChests, setDefeatedEnemyIds,
    setVisitedSectors, setNpcDialog, setPlayer,
    toast, pushLog, persistSession,
  });
  const { travelToSanctuary, advanceToNextRegion, travelNextRegion, unlockNextRegion, regionLoading, regionError } = regionTravel;

  const equipWeapon = (uid) => {
    const p = playerRef.current;
    const defId = resolveWeaponDefId(p, uid);
    const w = defId ? WEAPONS[defId] : null;
    if (!w) return;
    if (w.offType !== CLASS_OFF_TYPE[p.class]) { toast("Arma incompatible con la clase actual", "info"); return; }
    const was = p.weapon === uid;
    setPlayer(prev => recomputePlayer({ ...prev, weapon: was ? null : uid, classWeapon: null }));
    toast(was ? "Arma desequipada" : `Equipado: ${w.name}`, "equip");
  };
  const equipClassWeapon = (id) => { const was = playerRef.current?.classWeapon === id; setPlayer(p => recomputePlayer({ ...p, classWeapon: was ? null : id, weapon: null })); toast(was ? "Arma de clase desequipada" : `Equipada: ${CLASS_WEAPONS[id]?.name || ""}`, "equip"); };
  const sellClassWeapon = (id) => {
    const w = CLASS_WEAPONS[id]; if (!w) return;
    if (w.relic || w.rarity === "Legendario") { toast("Las reliquias no pueden venderse", "info"); return; }
    const val = w.sell || 0;
    setPlayer(p => recomputePlayer({ ...p, classWeapon: p.classWeapon === id ? null : p.classWeapon, classWeaponInventory: (p.classWeaponInventory || []).filter(x => x !== id), gold: (p.gold || 0) + val }));
    toast(`Vendido: +${val} oro`, "gold");
  };
  const { forgeEquipment, upgradeEquipment, craftWeapon, upgradeWeapon } = createAtlasSmithActions({
    playerRef, setPlayer, smithTier, region, worldFlagsRef, toast, pushLog,
  });
  const equipArmor = (id) => { const was = playerRef.current?.armor === id; setPlayer(p => recomputePlayer({ ...p, armor: p.armor === id ? null : id })); toast(was ? "Armadura desequipada" : `Equipado: ${ARMORS[id]?.name || ""}`, "equip"); };
  const sellWeapon = (uid) => {
    const inv = playerRef.current?.weaponInventory || [];
    const inst = inv.find(x => (typeof x === "string" ? x : x.uid) === uid);
    const defId = inst ? (typeof inst === "string" ? inst : inst.defId) : (WEAPONS[uid] ? uid : null);
    const w = defId ? WEAPONS[defId] : null;
    const rarity = typeof inst === "object" && inst.rarity ? inst.rarity : w?.rarity;
    if (!w || inst?.sellable === false || !RARITIES[rarity]?.sellable) { toast("Este objeto no puede venderse", "info"); return; }
    const val = RARITIES[rarity].sell;
    setPlayer(p => recomputePlayer({ ...p, weapon: p.weapon === uid ? null : p.weapon, weaponInventory: (p.weaponInventory || []).filter(x => (typeof x === "string" ? x : x.uid) !== uid), gold: (p.gold || 0) + val }));
    toast(`Vendido: +${val} oro`, "gold");
  };
  const sellArmor = (id) => { const a = ARMORS[id]; if (!a || !RARITIES[a.rarity].sellable) return; const val = RARITIES[a.rarity].sell; setPlayer(p => recomputePlayer({ ...p, armor: p.armor === id ? null : p.armor, armorInventory: (p.armorInventory || []).filter(x => x !== id), gold: (p.gold || 0) + val })); toast(`Vendido: +${val} oro`, "gold"); };
  const sellMaterial = (id) => { const m = MATERIALS[id]; if (!m) return; setPlayer(prev => { const n = (prev.materials?.[id] || 0) - 1; if (n < 0) return prev; const nm = { ...prev.materials }; if (n <= 0) delete nm[id]; else nm[id] = n; return { ...prev, materials: nm, gold: (prev.gold || 0) + m.price }; }); toast(`Vendido: +${m.price} oro`, "gold"); };

  const buyPotion = (id) => {
    const p = playerRef.current; if (!p) return;
    const pot = getPotion(id); if (!pot) return;
    const cost = Math.round(pot.price * priceMult(p));
    if ((p.gold || 0) < cost) { toast("No tienes oro suficiente", "info"); return; }
    setPlayer(prev => {
      const np = { ...prev, gold: (prev.gold || 0) - cost };
      if (pot.id === "hp_s") np.potions = (prev.potions || 0) + 1;
      else np.consumables = { ...(prev.consumables || {}), [pot.id]: (prev.consumables?.[pot.id] || 0) + 1 };
      return np;
    });
    toast(`Comprado: ${pot.name} (-${cost} oro)`, "gold");
  };

  const buyEquipment = (entry) => {
    const p = playerRef.current; if (!p || !entry) return;
    if ((p.level || 1) < (entry.requiredLevel || 1)) { toast(`Requiere nivel ${entry.requiredLevel}`, "info"); return; }
    if (entry.kind === "weapon" && WEAPONS[entry.id]?.offType !== CLASS_OFF_TYPE[p.class]) { toast("Esta arma pertenece a otra clase", "info"); return; }
    if (entry.kind === "helmet" && !p.equipmentUnlocks?.helmet) { toast("El espacio de Casco aún está bloqueado", "info"); return; }
    const cost = Math.round((entry.price || 0) * priceMult(p));
    if ((p.gold || 0) < cost) { toast("No tienes oro suficiente", "info"); return; }
    setPlayer(prev => {
      const np = { ...prev, gold: (prev.gold || 0) - cost };
      if (entry.kind === "weapon") np.weaponInventory = [...(prev.weaponInventory || []), makeWeaponInstance(entry.id)];
      else if (entry.kind === "armor") np.armorInventory = [...new Set([...(prev.armorInventory || []), entry.id])];
      else if (entry.kind === "helmet") np.helmetInventory = [...new Set([...(prev.helmetInventory || []), entry.id])];
      else np.accessoryInventory = [...new Set([...(prev.accessoryInventory || []), entry.id])];
      return recomputePlayer(np);
    });
    toast(`Comprado: ${entry.name} (-${cost} oro)`, "gold");
  };

  const useConsumable = (id) => {
    const p = playerRef.current; if (!p) return;
    if (enemy) { toast("Solo puedes usar pociones fuera de combate", "info"); return; }
    if (id === "antidote") {
      if ((p.consumables?.antidote || 0) <= 0) return;
      setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 3), consumables: { ...prev.consumables, antidote: (prev.consumables?.antidote || 0) - 1 } }));
      toast("Antídoto: +3 HP", "heal"); return;
    }
    if (id === "return_scroll") {
      if ((p.consumables?.return_scroll || 0) <= 0) return;
      setThreat(t => Math.max(0, t - 2));
      setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 5), consumables: { ...prev.consumables, return_scroll: (prev.consumables?.return_scroll || 0) - 1 } }));
      toast("Pergamino de Regreso: amenaza -2, +5 HP", "heal"); return;
    }
    if (id === "hp_s") {
      if ((p.potions || 0) <= 0) return;
      if (p.hp >= p.maxHp) { toast("La vida ya está llena", "info"); return; }
      setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 6), potions: prev.potions - 1 }));
      toast("Poción pequeña: +6 HP", "heal"); return;
    }
    const pot = getPotion(id); if (!pot) return;
    const count = p.consumables?.[id] || 0;
    if (count <= 0) return;
    if (pot.heal && p.hp >= p.maxHp) { toast("La vida ya está llena", "info"); return; }
    if (pot.restore && (p.mp || 0) >= (p.maxMp || 0)) { toast("La energía ya está llena", "info"); return; }
    setPlayer(prev => {
      const np = { ...prev, consumables: { ...prev.consumables, [id]: count - 1 } };
      if (pot.heal) np.hp = Math.min(prev.maxHp, prev.hp + pot.heal);
      if (pot.restore) np.mp = Math.min(prev.maxMp || 0, (prev.mp || 0) + pot.restore);
      return np;
    });
    toast(`Usas ${pot.name}`, "heal");
  };

  const { handleAttack, handleSkill, useCombatConsumable, triggerEnemyTurn, tickPlayerStatusTurn } = createAtlasCombatActions({
    enemy,
    player,
    diceAnim,
    combatAnimating,
    skills,
    combatRef,
    playerRef,
    enemyRef,
    pendingDeadRef,
    setPlayer,
    setEnemy,
    setPlayerStatuses,
    pushLog,
    toast,
    damageWeapon,
    turnStart,
    showDice,
    modifyOutgoing,
    enemyAtkVsType,
    enemyDefForClass,
    playerDefVsType,
    applyPierce,
    applyStatusToEnemy,
    statusForSkillName,
    maybeChannel,
    commitCombatResult,
    stagePlayerDefeat,
    stageEnemyDefeat,
    scheduleEnemyTurn,
    enemyTurn,
    onKillEnergy,
  });

  const onEnemyDead = () => {
    const deadEnemy = enemy;
    const info = pendingDeadRef.current;
    pendingDeadRef.current = null;
    clearCombatTimers();
    setCombatAnimating(false);
    setEnemy(null); setLastResult(null);
    combatRef.current.playerStatuses = {};
    setPlayerStatuses({});
    if (!info) return;
    if (deadEnemy?.worldEnemyId) markEnemyDefeated(deadEnemy.worldEnemyId);
    // Mini jefe de dungeon: combate clásico — recompensa y salida libre.
    if (dungeonBossContextRef.current) {
      dungeonBossContextRef.current = null;
      gainXp(KILL_XP[regionIndex] * 2);
      rollGlobalLoot({ boss: true, type: "miniboss" });
      setDungeonBossDefeated(true);
      completeDungeon(true);
      toast("¡Mini jefe de la dungeon derrotado!", "boss");
      pushLog("✦ Derrotas al mini jefe. El camino a la salida queda libre.");
      return;
    }
    if (info.wasBoss) {
      const next = new Set(defeatedBosses); next.add(info.enemyId); setDefeatedBosses(next);
      const drop = BOSS_DROPS[regionIndex];
      const p = playerRef.current;
      const equipmentUnlocks = {
        ...(p.equipmentUnlocks || {}),
        helmet: !!(p.equipmentUnlocks?.helmet || region.id === "verde"),
        accessory2: !!(p.equipmentUnlocks?.accessory2 || region.id === "fria"),
      };
      const rewardInventory = region.id === "verde" || !drop
        ? (p.accessoryInventory || [])
        : [...new Set([...(p.accessoryInventory || []), drop])];
      const bossRewardPlayer = recomputePlayer({ ...p, equipmentUnlocks, accessoryInventory: rewardInventory });
      const r = bossAutoLevel(bossRewardPlayer, regionIndex);
      setPlayer(recomputePlayer(r.player));
      if (r.player.level > p.level) toast(`¡Subes a nivel ${r.player.level}!`, "levelup");
      progressTracker("boss", null, 1, null, deadEnemy?.id || info.enemyId);
      setWorldFlags(prev => {
        const nextFlags = { ...prev, [`${region.id}:boss_defeated`]: true };
        if (region.id !== "verde") nextFlags[`${region.id}:restored`] = true;
        worldFlagsRef.current = nextFlags; return nextFlags;
      });
      pushLog(region.id === "verde" ? "La corrupción se separa del Guardián. Su espíritu aún espera ser liberado." : "¡Jefe regional liberado! La región cambia y la siguiente etapa se prepara.");
      toast(`¡${deadEnemy?.name || "Jefe"} derrotado!`, "boss");
      if (region.id === "verde") {
        toast("Nuevo espacio de equipo: Casco", "levelup");
        pushLog("✦ Se desbloquea Casco. Aparecerá en tiendas y botín desde Región Ártica.");
      } else if (region.id === "fria") {
        toast("Nuevo espacio de equipo: Accesorio II", "levelup");
        pushLog("✦ Se desbloquea Accesorio II. Puedes combinar dos accesorios diferentes.");
      }
      if (region.id !== "verde" && drop && ACCESSORIES[drop]) toast(`¡${ACCESSORIES[drop].name} obtenido!`, "item");
    } else {
      progressTracker("kill", null, 1, null, deadEnemy?.missionTag || deadEnemy?.id);
      gainXp(deadEnemy?.xpReward || KILL_XP[regionIndex]);
      if (deadEnemy?.elite) {
        const bg = Math.round((deadEnemy.bonusGold || 0) * goldMult(playerRef.current));
        setPlayer(p => recomputePlayer({ ...p, gold: (p.gold || 0) + bg }));
        toast(`¡Enemigo élite! +${bg} oro`, "boss");
      }
      pushLog(`Derrotas a ${deadEnemy?.name || "enemigo"}.`);
      toast(`Derrotas a ${deadEnemy?.name || "enemigo"}`, "kill");
    }
    // Amenaza: una sola modificación por combate (especial / 3 victorias / dado de botín).
    const _tr = resolveCombatThreat(deadEnemy);
    if (_tr.delta) applyThreatDelta(_tr.delta, _tr.cause);
    if (Math.random() < 0.3) {
      const mid = rollRegionMaterial(regionIndex);
      setPlayer(p => ({ ...p, materials: { ...(p.materials || {}), [mid]: (p.materials?.[mid] || 0) + 1 } }));
      toast(`Material: ${MATERIALS[mid]?.name || mid}`, "item");
    }
    rollGlobalLoot(deadEnemy);
  };

  const handleEscape = () => {
    if (!enemy || enemy.boss || diceAnim || combatAnimating) return;
    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    if (!stChk.canAct) {
      const afterPlayer = stChk.playerAfterTick || { ...playerRef.current };
      const frozen = stChk.blockedBy === "freeze";
      commitCombatResult(
        { type: frozen ? "PLAYER_FROZEN" : "PLAYER_PARALYZED", enemyDamage: 0, playerDamage: 0, blockedBy: stChk.blockedBy, attemptedAction: "escapar", actionFailed: true, skipDice: true },
        540,
        { beforePlayer: stChk.playerBeforeTick || player, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: 0, hpDamage: 0 } },
      );
      pushLog(`${frozen ? "Congelación" : "Parálisis"}: el intento de escape falla automáticamente.`);
      triggerEnemyTurn(enemy, afterPlayer, 620);
      return;
    }
    const roll = rollDie(20);
    showDice(singleDie(20, roll), "Escape", () => {
      const res = resolveEscape({ ...player, defense: playerDefVsType(player, "fisico") }, { ...enemy, defense: enemy.physicalDefense ?? enemy.defense }, roll);
      pushLog(res.log);
      if (res.success) { dungeonBossContextRef.current = null; clearCombatTimers(); setEnemy(null); setLastResult(null); setCombatAnimating(false); combatRef.current.playerStatuses = {}; setPlayerStatuses({}); toast("Has escapado", "info"); }
      else { triggerEnemyTurn(enemy); }
    });
  };

  const claimMission = (id) => {
    const def = missionDefMap[id]; if (!def) return;
    const cur = missionsRef.current[id];
    if (!cur || cur.status !== "ready") return;
    const completedMissions = { ...missionsRef.current, [id]: { ...cur, status: "done", active: false } };
    missionsRef.current = completedMissions;
    setMissions(completedMissions);
    if (def.onClaim) applyMissionEffects(def.onClaim, "claim");
    const sectorUnlocks = getMissionUnlocks(region.id, id);
    if (sectorUnlocks.length) {
      setUnlockedSectors(prev => {
        const next = new Set(prev);
        sectorUnlocks.forEach(sid => next.add(sectorKey(region.id, sid)));
        return next;
      });
      sectorUnlocks.forEach(sid => {
        const sd = getSectorDef(region.id, sid);
        toast(`Nuevo sector: ${sd?.name || sid}`, "mission");
        pushLog(`◆ Se abre ${sid}: ${sd?.name || "nuevo sector"}.`);
      });
    }
    setNpcDialog(null);
    if (priorityMissionId === id) {
      const next = Object.entries(completedMissions).find(([oid, x]) => oid !== id && x.active && x.status !== "done");
      setPriorityMissionId(next ? next[0] : null);
    }
    if (def.type === "combate" || def.type === "proteccion" || def.type === "evento") applyThreatEvent("mission:" + id, 1);
    else setThreat(t => Math.max(0, t - THREAT_REDUCE.helpMission));
    const r = def.reward || {};
    setPlayer(p => {
      let np = { ...p, gold: (p.gold || 0) + (r.gold || 0) };
      if (r.potion) {
        if (r.potion === "hp_s") np.potions = (p.potions || 0) + 1;
        else np.consumables = { ...(p.consumables || {}), [r.potion]: (p.consumables?.[r.potion] || 0) + 1 };
      }
      if (r.item) np.accessoryInventory = [...new Set([...(p.accessoryInventory || []), r.item])];
      if (r.material) np.materials = { ...(p.materials || {}), [r.material]: (p.materials?.[r.material] || 0) + 1 };
      if (r.questItem) np.questItems = { ...(p.questItems || {}), [r.questItem]: (p.questItems?.[r.questItem] || 0) + 1 };
      if (id === "v12") np.relics = { ...(p.relics || {}), verde: { state: "restored", name: "Reliquia Verde" } };
      if (id === "v15") np.relics = { ...(np.relics || p.relics || {}), equilibrio_verde: { state: "obtained", name: "Reliquia de Equilibrio Verde" } };
      return recomputePlayer(np);
    });
    if (r.xp) gainXp(KILL_XP[regionIndex] * r.xp);

    // La siguiente misión queda disponible en su NPC, pero nunca se acepta sola.
    let chainedMissions = completedMissions;
    const orderedDefs = Object.values(missionDefMap).sort((a, b) => {
      const actDiff = (a.act || 0) - (b.act || 0);
      return actDiff !== 0 ? actDiff : String(a.id).localeCompare(String(b.id));
    });
    const nextUnlocked = orderedDefs.find(def2 => {
      if (!def2 || def2.id === id) return false;
      const state = chainedMissions[def2.id];
      if (!state || state.status === "done" || state.accepted) return false;
      return !missionLockReason(def2, chainedMissions, worldFlagsRef.current, threat);
    });
    if (nextUnlocked) {
      chainedMissions = {
        ...chainedMissions,
        [nextUnlocked.id]: { ...normalizeMissionState(nextUnlocked, chainedMissions[nextUnlocked.id]), discovered: true, accepted: false, active: false },
      };
      missionsRef.current = chainedMissions;
      setMissions(chainedMissions);
      toast(`Nuevo encargo disponible: ${nextUnlocked.name}`, "mission");
      pushLog(`◆ ${nextUnlocked.name} está disponible. Habla con el NPC correspondiente para conocer la historia y aceptarla.`);
    }

    const done = Object.keys(missionDefMap).every(id2 => chainedMissions[id2]?.status === "done");
    if (done && regionIndex >= REGIONS.length - 1) setStatus("victory");
    toast(`Recompensa obtenida${r.gold ? `: ${r.gold} oro` : ""}`, "gold");
    if (id === getBossMissionId(region.id) && regionIndex < REGIONS.length - 1) unlockNextRegion();
  };

  // Red de seguridad de campaña + cierre automático de la misión introductoria.
  useAtlasMissionSafety({
    player, missions, regionId: region.id, missionDefMap, threat, worldFlags, worldFlagsRef, missionsRef,
    claimMission, activateMission,
  });

  const allocateStat = (stat) => {
    setPlayer(p => {
      if (p.statPoints <= 0) return p;
      const np = { ...p, statPoints: p.statPoints - 1 };
      if (stat === "hp") { np.baseMaxHp = (p.baseMaxHp || p.maxHp) + 3; np.hp = p.hp + 3; }
      else if (stat === "attack") np.baseAttack = (p.baseAttack || p.attack) + 1;
      else if (stat === "defense") { np.baseDefense = (p.baseDefense || p.defense) + 1; np.baseMagicalDefense = (p.baseMagicalDefense ?? p.baseDefense ?? p.defense) + 1; }
      return recomputePlayer(np);
    });
    setShowLevelUp(false);
  };

  const {
    equipAccessory,
    equipHelmet,
    sellHelmet,
    sellAccessory,
    discardAccessory,
  } = createAtlasEquipmentActions({ playerRef, setPlayer, toast });

  const equipSmithEquipment = (kind, ref) => {
    if (kind === "classWeapon") return equipClassWeapon(ref);
    if (kind === "weapon") return equipWeapon(ref);
    if (kind === "armor") return equipArmor(ref);
    if (kind === "helmet") return equipHelmet(ref);
  };

  const openChest = (chestInput) => {
    const chest = typeof chestInput === "object"
      ? chestInput
      : (exploreWorld?.chests || []).find(c => c.id === chestInput) || { id: chestInput, type: "common" };
    const id = chest?.id;
    if (!id || openedChests.has(id) || diceAnim) return;
    const chestType = chest.type || "common";

    const finishOpen = () => {
      setOpenedChests(prev => new Set([...prev, id]));
      progressTracker("chest", SECTOR_OF_BLOCK[blockIndex]);
    };

    if (chestType === "common") {
      const reward = resolveCommonChest(region.id);
      finishOpen();
      setPlayer(prev => {
        const materials = { ...(prev.materials || {}) };
        for (const mat of reward.materials || []) materials[mat.id] = (materials[mat.id] || 0) + (mat.amount || 1);
        const next = { ...prev, gold: (prev.gold || 0) + (reward.gold || 0), materials };
        if (reward.consumable === "hp_s") next.potions = (prev.potions || 0) + 1;
        return next;
      });
      setChestReward(reward);
      toast(`Cofre común: +${reward.gold} oro`, "gold");
      return;
    }

    if (chestType === "ancient") {
      const roll = rollDie(20);
      showDice(singleDie(20, roll), "Cofre antiguo", () => {
        const reward = resolveAncientChest(region.id, roll, chest.seal || null);
        finishOpen();
        setPlayer(prev => {
          const materials = { ...(prev.materials || {}) };
          const questItems = { ...(prev.questItems || {}) };
          for (const mat of reward.materials || []) materials[mat.id] = (materials[mat.id] || 0) + (mat.amount || 1);
          if (reward.seal?.id) questItems[reward.seal.id] = Math.max(1, questItems[reward.seal.id] || 0);
          return { ...prev, gold: (prev.gold || 0) + (reward.gold || 0), materials, questItems };
        });
        setChestReward(reward);
        toast(reward.seal ? `Sello obtenido: ${reward.seal.name}` : "Cofre antiguo abierto", "item");
      });
      return;
    }

    if (chestType === "legendary") {
      const missing = missingLegendarySeals(playerRef.current, region.id);
      if (missing.length) {
        const reward = {
          kind: "legendary_locked",
          chestType: "legendary",
          missing,
          required: requiredSealsForRegion(region.id),
        };
        setChestReward(reward);
        toast(`Faltan ${missing.length} sellos para abrir el cofre`, "info");
        return;
      }
      const diceResult = rollDiceGroup("cofre_legendario");
      showDice(diceResult, "Ceremonia del Cofre Legendario", () => {
        const reward = generateLegendaryChestWeapon(playerRef.current, region.id, diceResult);
        finishOpen();
        setPlayer(prev => {
          const questItems = { ...(prev.questItems || {}) };
          for (const seal of requiredSealsForRegion(region.id)) {
            questItems[seal.id] = Math.max(0, (questItems[seal.id] || 0) - 1);
            if (questItems[seal.id] <= 0) delete questItems[seal.id];
          }
          return recomputePlayer({
            ...prev,
            questItems,
            weaponInventory: [...(prev.weaponInventory || []), reward.instance],
          });
        });
        setChestReward(reward);
        toast(`${reward.name} generada por 3d20`, "boss");
        pushLog(`✦ Cofre legendario: ${diceResult.rolls.map(r => r.result).join(" + ")} = ${diceResult.total}. ${reward.tier.name}.`);
      });
      return;
    }
  };

  const markEnemyDefeated = (id) => setDefeatedEnemyIds(s => new Set([...s, id]));

  const respawnDaily = () => {
    setDefeatedEnemyIds(prev => new Set([...prev].filter(id => String(id).startsWith("mission:"))));
    pushLog("Amanece. Los enemigos ambientales han regresado al mundo.");
    toast("Nuevo día: los enemigos han reaparecido", "info");
  };

  const onChestDrop = (drop) => {
    setPlayer(p => recomputePlayer({ ...p, accessoryInventory: [...new Set([...(p.accessoryInventory || []), drop])] }));
    toast(`¡${ACCESSORIES[drop].name} obtenido!`, "item");
  };
  const onHeal = (amount) => setPlayer(p => ({ ...p, hp: Math.max(0, Math.min(p.maxHp, p.hp + amount)) }));
  const closeChestReward = () => setChestReward(null);

  // travelToSanctuary / advanceToNextRegion / travelNextRegion -> useAtlasRegionTravel

  const onTravelNextBlock = (nb) => {
    setBlockIndex(nb);
    setSectorRow(1);
    const blk = BLOCK_DEFS[region.id][nb];
    pushLog(`Cruzas al bloque ${nb + 1}: ${blk.name}.`);
    toast(`Bloque ${nb + 1}: ${blk.name}`, "info");
  };

  const hasTravelNorth = sectorRow > 0;
  const hasTravelSouth = sectorRow < 2;
  const hasTravelEast = blockIndex < 2;
  const hasTravelWest = blockIndex > 0;
  const canTravelDir = (dir) => {
    const targetId = getNeighborSectorId(blockIndex, sectorRow, dir);
    return !!targetId && isSectorUnlocked(unlockedSectors, region.id, targetId);
  };
  const canTravelNorth = canTravelDir("north");
  const canTravelSouth = canTravelDir("south");
  const canTravelEast = canTravelDir("east");
  const canTravelWest = canTravelDir("west");
  const onTravelSector = (dir, coord) => {
    const targetId = getNeighborSectorId(blockIndex, sectorRow, dir);
    if (!targetId) return { ok: false, reason: "No existe un camino en esa dirección." };
    if (!isSectorUnlocked(unlockedSectors, region.id, targetId)) {
      const reason = getBlockedReason(region.id, targetId);
      pushLog(`⛔ ${reason}`);
      toast(reason, "info");
      return { ok: false, reason };
    }
    const w = exploreWorld; if (!w) return { ok: false, reason: "El sector todavía no está preparado." };
    const transition = getTransition(region.id, currentSectorId, dir);
    const arrival = transition ? transition.arrival : { x: Math.round(w.W / 2), y: Math.round(w.H / 2) };
    const facing = transition ? transition.facing : "down";
    const dirLabel = { north: "norte", south: "sur", east: "este", west: "oeste" }[dir];
    let tc = blockIndex, tr = sectorRow;
    if (dir === "north") { tr -= 1; setSectorRow(tr); }
    else if (dir === "south") { tr += 1; setSectorRow(tr); }
    else if (dir === "east") { tc += 1; setBlockIndex(tc); }
    else if (dir === "west") { tc -= 1; setBlockIndex(tc); }
    setRespawnPos({ x: arrival.x, y: arrival.y, facing });
    const td = getSectorDef(region.id, tc, tr);
    pushLog(`Cruzas al ${dirLabel}: ${td?.name || targetId}.`);
    toast(`Entras en ${td?.name || targetId}`, "info");
    return { ok: true };
  };
  const sectorName = sectorDef?.name || exploreWorld?.sectorName || "Sector";

  const onReachObjective = (col, row) => {
    setMissions(prev => {
      let changed = false; const next = { ...prev };
      for (const id of Object.keys(next)) {
        const m = next[id];
        if (m.status !== "pending" || !m.active) continue;
        const def = missionDefMap[id]; if (!def || def.tracker !== "reach") continue;
        const here = def.wildSector
          ? (def.wildSector.col === col && def.wildSector.row === row)
          : (row === 1 && col === 1);
        if (!here) continue;
        const prog = Math.min(def.target, m.progress + 1);
        if (prog !== m.progress) {
          next[id] = { ...m, progress: prog, status: prog >= def.target ? "ready" : "pending" };
          changed = true;
          if (prog >= def.target) toast(`Misión lista: ${def.name}`, "mission");
        }
      }
      return changed ? next : prev;
    });
    pushLog("¡Punto de interés descubierto! Vuelve a la zona segura para reclamar.");
    toast("Punto de interés descubierto", "mission");
  };

  const ended = status !== "playing";
  const canRoll = !enemy && !bonusMove && !pendingMoves && !ended && !diceAnim;
  const showReachable = pendingMoves > 0 || bonusMove;
  const startBossWithIntro = (data) => {
    const preparedData = data?._atlasScaled
      ? data
      : prepareEnemy({ ...data, boss: true }, region.difficultyMul || 1, playerRef.current?.level || 1, REGION_META[regionIndex].start, region.id, data?.sectorId || currentSectorId, playerRef.current || player);
    const canon = getBossCanon(region.id);
    if (canon) { pendingBossRef.current = { ...preparedData, name: canon.name }; setBossIntro(canon); }
    else startCombat(preparedData);
  };
  const dismissBossIntro = () => {
    const b = pendingBossRef.current;
    pendingBossRef.current = null;
    setBossIntro(null);
    if (b) startCombat(b);
  };

  const bossHere = node.boss && !defeatedBosses.has(node.boss.id);
  const nodeLabel = bossHere ? node.boss.name : (node.gatewayTo ? "Portal" : (terrain.name || ""));

  return {
    screen, player, regionIndex, blockIndex, block, isLastBlock, location, threat, enemy, log, status, lastResult,
    activeSaveSlot: getActiveSaveSlot(),
    bonusMove, defeatedBosses, pendingMoves, diceAnim, combatBusy: !!diceAnim || combatAnimating, missions, npcDialog, showLevelUp,
    showSheet, showBackpack, showShop, chestReward, toasts, openedChests, defeatedEnemyIds, exploreWorld,
    region, map, node, terrain, npcKey, allMissionsDone, bossAlive,
    ended, canRoll, showReachable, bossHere, nodeLabel, bossIntro, dismissBossIntro, startBossWithIntro,
    start, reset, resume, startCombat, handleTravelRoll, handleNodeClick, rest, handleAttack, onEnemyDead,
    handleEscape, claimMission, allocateStat, equipAccessory, equipHelmet, sellHelmet, sellAccessory, discardAccessory,
    activateMission, setMissionActive, setPriorityMission, talkToNpc, onTalkNpc, onStoryPoint, missionDefs, regionProgress, bossUnlocked, bossDefeated,
    activeStoryPointIds, getMissionLockReason, canTravelNextRegion,
    openChest, markEnemyDefeated, onChestDrop, onHeal, closeChestReward, gainXp, onReachObjective, travelNextRegion, onTravelNextBlock, onTravelSector,
    canTravelNorth, canTravelSouth, canTravelEast, canTravelWest, hasTravelNorth, hasTravelSouth, hasTravelEast, hasTravelWest, sectorName, sectorRow, visitedSectors,
    unlockedSectors, worldFlags, currentSectorId, sectorDef,
    onRest: restInField, onOpenShop: openShop, shopTier, onRestAt: restAt, restAtSanctuary,
    onOpenSettlementNpc: openSettlementNpc, closeSettlementNpc, onOpenFlavor: openFlavor, closeFlavor, flavorDialog, activeSettlementNpc,
    buyPotion, useConsumable, buyEquipment,
    equipWeapon, equipArmor, sellWeapon, sellArmor, sellMaterial,
    equipClassWeapon, sellClassWeapon, craftWeapon, upgradeWeapon, forgeEquipment, upgradeEquipment, equipSmithEquipment, showSmith, setShowSmith, smithTier, openSmith, repairEquipment, damageWeapon, restoreGreenRelic,
    lootReward, closeLootReward: () => setLootReward(null), destinyEvent, closeDestinyEvent: () => setDestinyEvent(null),
    showEquipment, setShowEquipment,
    showIntro, dismissIntro: () => setShowIntro(false),
    shrines, shrineModal, shrineNotify, respawnPos, lastShrine, priorityMissionId, exploreBlocks,
    onShrineCheck, onOpenShrine: openShrine, onActivateShrine: activateShrine, closeShrine, consumeShrineNotify, consumeRespawn, respawnAtShrine,
    activatedSanctuaries, unlockedSanctuaries, lastActivatedSanctuaryId, unlockedRegions, travelToSanctuary, regionLoading, regionError,
    onStartCombatThreat: startCombatThreat, onThreatEvent, onExploreThreat, onIdleThreat, onStrangerMeet,
    skills, skillCosts: skills ? { classAbility: skills.classAbility?.cost, hybrid: skills.hybrid?.cost } : {}, onSkill: handleSkill, onItem: useCombatConsumable,
    playerStatuses, respawnDaily,
    inDungeon, currentDungeonId, currentDungeon, enterDungeon, exitDungeon, descendDungeon, dungeonFloor, dungeonBossDefeated, startDungeonBossCombat, activateDungeonFinalSanctuary,
    onDungeonPlayerDamage, onDungeonSpendEnergy, onDungeonEnemyKilled,
    hireAdventurer, dismissCompanion, onCompanionUpdate,
    setNpcDialog, setShowLevelUp, setShowSheet, setShowBackpack, setShowShop, onDiceComplete, pushLog, rollDice,
  };
}