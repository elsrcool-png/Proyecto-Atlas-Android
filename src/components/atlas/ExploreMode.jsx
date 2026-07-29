import { useState, useRef, useEffect, useMemo } from "react";
import { Navigation, Star } from "lucide-react";
import useKeyboardControls from "@/hooks/useKeyboardControls";
import CombatView from "./ui-v3/CombatViewAdapterV3";
import TileGround from "./TileGround";
import TerrainHeightLayer from "./TerrainHeightLayer";
import WorldSprite from "./WorldSprite";
import { GIcon } from "@/lib/atlasIcons";
import EntitySprite from "./EntitySprite";
import ShrineMarker from "./ShrineMarker";
import PlayerHub from "./PlayerHub";
import GroundTufts from "./GroundTufts";
import BiomeAmbience from "./BiomeAmbience";
import FoliageDot from "./FoliageDot";
import DayNightOverlay from "./DayNightOverlay";
import ExplorationMap from "./ExplorationMap";
import MissionJournal from "./MissionJournal";
import RestSequence from "./RestSequence";
import BlacksmithModal from "./BlacksmithModal";
import SectorMapModal from "./SectorMapModal";
import RoadLayer from "./RoadLayer";
import AssetWorldLayer from "./AssetWorldLayer";
import { getVisualScene, getVisualSceneById, getVisualSceneVariant } from "@/lib/atlasVisualScenes";
import Signpost from "./Signpost";
import AmbientNpc from "./AmbientNpc";
import LoreMarker from "./LoreMarker";
import ExplorationEvent from "./ExplorationEvent";
import StoryPointMarker from "./StoryPointMarker";
import NpcInteractionMenu from "./NpcInteractionMenu";
import { getNpcAvailableActions } from "@/lib/atlasNpcActions";
import { rollExplorationEvent, randomEventLine } from "@/lib/atlasExplorationEvents";
import { drawPlayerSprite, PixelSprite, getChestPixel, CHEST_PALETTE } from "@/lib/atlasPixel";
import { drawPlayerFrameWithModularFallback } from "@/lib/atlasHeroCanvasBridge";
import { GROUND, clamp, hitSolid } from "@/lib/atlasWorld";
import { getWorldDepth, setWorldDepth } from "@/lib/atlasDepth";
import { tierOf, worldBehavior } from "@/lib/atlasThreat";
import { getCurrentObjective } from "@/lib/atlasMissionEngine";
import { coordsFromSectorId, getRegionLayout } from "@/lib/atlasRegionSectors";
import { getSectorTransitions, getPathStyle } from "@/lib/atlasTransitions";
import { getDungeonForSector, getDungeonAccessState } from "@/lib/atlasDungeons";
import { getRecruitsForDungeon, getRecruitCampPos } from "@/lib/atlasRecruits";
import { getValidDungeonEntrance } from "@/lib/atlasAccessibility";
import { getDungeonEntranceNpc, isTutorialDone } from "@/lib/atlasDungeonEntry";
import { isOnSanctuaryPlatform } from "@/lib/atlasSanctuaries";
import { getMissionEncounterEnemies } from "@/lib/atlasMissionEncounters";
import { shouldClearSectorEnemies } from "@/lib/atlasWorldProgression";
import { createVillagerMotion, npcIdleAnimationStyle } from "@/lib/atlasNpcMotion";
import RecruitDialog from "./RecruitDialog";
import DungeonEntryDialog from "./DungeonEntryDialog";
import { normalizeControlProfiles } from "@/lib/atlasControlLayout";
import ExploreHudV3, { ExploreSeparatedControlsV3 } from "./ui-v3/ExploreHudV3";
import PauseMenuV3 from "./ui-v3/PauseMenuV3";

export default function ExploreMode({ game }) {
  const { player, region, regionIndex, bossDefeated, bossUnlocked } = game;
  const baseWorld = game.exploreWorld;
  const visualScene = useMemo(() => {
    if (!baseWorld) return null;
    const source = baseWorld.visualSceneId
      ? getVisualSceneById(baseWorld.visualSceneId)
      : getVisualScene(region.id, game.currentSectorId);
    return getVisualSceneVariant(source, null, {
      bossDefeated,
      worldFlags: game.worldFlags || {},
    });
  }, [baseWorld?.visualSceneId, region.id, game.currentSectorId, bossDefeated, game.worldFlags]);
  const world = useMemo(() => {
    if (!baseWorld || !visualScene?.runtimeVariant) return baseWorld;
    const removeIds = new Set(visualScene.runtimeVariant.removeCollisionObjectIds || []);
    return {
      ...baseWorld,
      solids: [
        ...(baseWorld.solids || []).filter(collision => !removeIds.has(collision.object)),
        ...(visualScene.runtimeVariant.addCollisions || []).map(collision => ({ ...collision })),
      ],
      layoutMode: `${baseWorld.layoutMode || "modular"}:postboss`,
    };
  }, [baseWorld, visualScene]);
  const ground = GROUND[region.id];
  const [flavorMsg, setFlavorMsg] = useState(null);
  const flavorTimer = useRef(null);
  const showFlavor = (msg) => { if (!msg) return; setFlavorMsg(msg); if (flavorTimer.current) clearTimeout(flavorTimer.current); flavorTimer.current = setTimeout(() => setFlavorMsg(null), 3600); };
  const vpRef = useRef(null);
  const worldRef = useRef(null);
  const playerRef = useRef(null);
  const playerCanvasRef = useRef(null);
  const playerShadowRef = useRef(null);
  const facingRef = useRef("down");
  const frameRef = useRef(0);
  const stepRef = useRef(0);
  const drawnRef = useRef({ dir: "", frame: -1 });
  const enemyEls = useRef([]);
  const villagerEls = useRef([]);
  const villagerBodyEls = useRef([]);
  const villagers = useRef([]);
  const faunaEls = useRef([]);
  const fauna = useRef([]);
  const bossEl = useRef(null);
  const pos = useRef({ x: world?.spawn.x || 0, y: world?.spawn.y || 0 });
  const cam = useRef({ x: 0, y: 0 });
  const dir = useRef({ x: 0, y: 0 });
  const runRef = useRef(false);
  const [runToggle, setRunToggle] = useState(false);
  const runToggleRef = useRef(false);
  useEffect(() => { runToggleRef.current = runToggle; }, [runToggle]);
  const enemies = useRef([]);
  const bossState = useRef({ x: world?.boss?.x || 0, y: world?.boss?.y || 0, defeated: !world?.boss });
  const lastNear = useRef({ npc: null, chest: null, storyPoint: null });
  const lastNearShrine = useRef(null);
  const portalCooldown = useRef(0);
  const dungeonCdRef = useRef(0);
  const lastNearRecruits = useRef(false);
  const strangerUsed = useRef(false);
  const lastNearStranger = useRef(false);
  const moveAccum = useRef(0);
  const idleAccum = useRef(0);
  const eventTimer = useRef(0);
  const crossingRef = useRef(false);
  const graceUntilRef = useRef(0);
  const transitionsRef = useRef([]);

  const [nearNpc, setNearNpc] = useState(null);
  const [nearChest, setNearChest] = useState(null);
  const [nearStoryPoint, setNearStoryPoint] = useState(null);
  const [paused, setPaused] = useState(false);
  const [enemyList, setEnemyList] = useState([]);
  const [faunaMeta, setFaunaMeta] = useState([]);
  const [joystickKey, setJoystickKey] = useState(0);
  const [nearStranger, setNearStranger] = useState(false);
  const [strangerDialog, setStrangerDialog] = useState(false);
  const [nearShrine, setNearShrine] = useState(null);
  const [showHub, setShowHub] = useState(false);
  const [showExploreMap, setShowExploreMap] = useState(false);
  const [showSectorMap, setShowSectorMap] = useState(false);
  const [expEvent, setExpEvent] = useState(null);
  const [nearEvent, setNearEvent] = useState(false);
  const [nearRecruits, setNearRecruits] = useState(false);
  const [showRecruits, setShowRecruits] = useState(false);
  const [nearDungeon, setNearDungeon] = useState(null);
  const [showDungeonEntry, setShowDungeonEntry] = useState(false);
  const lastNearDungeon = useRef(null);
  const inCombat = !!game.enemy;
  const dungeonHere = world ? getDungeonForSector(region.id, game.currentSectorId) : null;
  const dungeonAccess = useMemo(() => getDungeonAccessState(dungeonHere, {
    bossDefeated,
    bossUnlocked,
    worldFlags: game.worldFlags || {},
  }), [dungeonHere?.id, bossDefeated, bossUnlocked, game.worldFlags]);
  const regionalBossReady = bossUnlocked && (region.id !== "verde" || !!game.worldFlags?.["verde:boss_gateway_ready"]);
  const dungeonEntryNpc = useMemo(() => (dungeonHere ? getDungeonEntranceNpc(dungeonHere) : null), [dungeonHere?.id]);
  const dungeonFirstTime = !isTutorialDone(game.worldFlags);
  const recruitCampPos = useMemo(() => (world && dungeonHere ? getRecruitCampPos(world, dungeonHere) : null), [world, dungeonHere?.id]);
  const recruitsList = useMemo(() => (dungeonHere ? getRecruitsForDungeon(dungeonHere.id, game.companion?.id || null) : []), [dungeonHere?.id, game.companion?.id]);
  const missionNpcIds = (() => {
    const set = new Set();
    if (!world) return set;
    const talkRoles = ["main", "quest", "paid", "smith", "explorer", "herbalist", "cartographer", "hunter", "historian", "artisan", "researcher", "captain", "priest", "forger", "flavor1", "flavor2", "survivor"];
    for (const n of world.npcs) {
      if (!talkRoles.includes(n.role)) continue;
      const defs = game.missionDefs?.[n.sector] || [];
      const has = defs.some(d => {
        if (d.role !== n.role) return false;
        const state = game.missions?.[d.id];
        if (!state || state.status === "done") return false;
        if (state.accepted || state.status === "ready") {
          const completed = new Set(state.completedObjectives || []);
          const allTalk = d.objectives.length > 1 && d.objectives.every(o => o.type === "talk");
          if (allTalk) {
            const talkObj = d.objectives.find(o => o.type === "talk" && o.npcSector === n.sector && o.npcRole === n.role);
            if (talkObj && completed.has(talkObj.id)) return false;
          }
          return true;
        }
        return !game.getMissionLockReason?.(d.id);
      });
      if (has) set.add(n.id);
    }
    return set;
  })();
  const flatDefMap = (() => { const m = {}; if (game.missionDefs) for (const sec of Object.keys(game.missionDefs)) for (const d of game.missionDefs[sec]) m[d.id] = d; return m; })();
  const flatDefMapRef = useRef(flatDefMap); flatDefMapRef.current = flatDefMap;
  const priorityMissionIdRef = useRef(game.priorityMissionId); priorityMissionIdRef.current = game.priorityMissionId;
  const missionsRef = useRef(game.missions); missionsRef.current = game.missions;
  const missionDefsRef = useRef(game.missionDefs); missionDefsRef.current = game.missionDefs;
  const navTickRef = useRef(0);
  const navWrapRef = useRef(null);
  const navIconRef = useRef(null);
  const navLabelRef = useRef(null);
  const navDistRef = useRef(null);
  const currentMissionEntry = (() => {
    const preferred = game.priorityMissionId && flatDefMap[game.priorityMissionId]
      ? [game.priorityMissionId, flatDefMap[game.priorityMissionId]]
      : Object.entries(flatDefMap).find(([id]) => game.missions?.[id]?.active && game.missions[id]?.status !== "done");
    if (!preferred) return null;
    const [id, def] = preferred;
    return { id, def, state: game.missions?.[id] };
  })();
  const currentObjective = currentMissionEntry ? getCurrentObjective(currentMissionEntry.def, currentMissionEntry.state) : null;
  const missionEncounterEnemies = useMemo(() => getMissionEncounterEnemies({
    regionId: region.id,
    sectorId: game.currentSectorId,
    missionId: currentMissionEntry?.id || null,
    objectiveId: currentObjective?.id || null,
    world,
  }), [region.id, game.currentSectorId, currentMissionEntry?.id, currentObjective?.id, world]);
  const clearAmbientEnemies = shouldClearSectorEnemies(region.id, game.currentSectorId, bossDefeated, game.worldFlags || {});
  const activeEnemySource = missionEncounterEnemies || (clearAmbientEnemies ? [] : (world?.enemies || []));
  const missionNavTarget = (() => {
    if (!world || !currentMissionEntry) return null;
    const { def, state } = currentMissionEntry;
    let objective = currentObjective;
    let targetSectorId = objective?.sectorId || game.currentSectorId;
    let label = objective?.text || def.name;
    let kind = objective?.type || "mission";
    let targetId = objective?.targetId || null;

    if (state?.status === "ready") {
      objective = null;
      label = `Entrega: ${def.name}`;
      kind = "turn_in";
      targetId = null;
      const layout = getRegionLayout(region.id);
      targetSectorId = Object.values(layout.sectors).find(s => s.settlementRole === def.sector)?.id || game.currentSectorId;
      if (targetSectorId === game.currentSectorId) {
        const npc = world.npcs.find(n => n.sector === def.sector && n.role === def.role);
        if (npc) return { x: npc.x, y: npc.y, label, kind, targetId: npc.id, targetSectorId };
      }
    }

    if (targetSectorId === game.currentSectorId) {
      if (objective?.type === "talk") {
        const npc = world.npcs.find(n => n.sector === objective.npcSector && n.role === objective.npcRole);
        if (npc) return { x: npc.x, y: npc.y, label, kind, targetId: npc.id, targetSectorId };
      }
      if (objective?.type === "interact") {
        const point = (world.storyPoints || []).find(sp => sp.id === objective.targetId);
        if (point) return { x: point.x, y: point.y, label, kind, targetId: point.id, targetSectorId };
      }
      if (objective?.type === "boss" && world.boss) return { x: world.boss.x, y: world.boss.y, label, kind, targetId: world.boss.monster.id, targetSectorId };
      if (objective?.type === "kill") {
        const alive = enemies.current.filter(e => !e.defeated);
        const exact = alive.find(e => objective.targetId && (e.monster?.missionTag === objective.targetId || e.monster?.id === objective.targetId));
        const chosen = exact || alive[0];
        if (chosen) return { x: chosen.x, y: chosen.y, label, kind, targetId: chosen.id, targetSectorId };
      }
    }

    const currentCoords = coordsFromSectorId(game.currentSectorId);
    const targetCoords = coordsFromSectorId(targetSectorId);
    if (!currentCoords || !targetCoords) return null;
    const dx = targetCoords.col - currentCoords.col;
    const dy = targetCoords.row - currentCoords.row;
    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) return { x: dx > 0 ? world.W - 28 : 28, y: world.H / 2, label, kind: "sector", targetId: targetSectorId, targetSectorId };
    if (dy !== 0) return { x: world.W / 2, y: dy > 0 ? world.H - 28 : 28, label, kind: "sector", targetId: targetSectorId, targetSectorId };
    return null;
  })();
  const missionNavTargetRef = useRef(null);
  missionNavTargetRef.current = missionNavTarget;
  const activeStoryPointIdsRef = useRef(game.activeStoryPointIds || new Set()); activeStoryPointIdsRef.current = game.activeStoryPointIds || new Set();
  const visibleStoryPoints = (world?.storyPoints || []).filter(p => activeStoryPointIdsRef.current.has(p.id));
  const visibleStoryPointsRef = useRef(visibleStoryPoints); visibleStoryPointsRef.current = visibleStoryPoints;
  const exploreBlocksRef = useRef(game.exploreBlocks); exploreBlocksRef.current = game.exploreBlocks;
  const expEventRef = useRef(null); expEventRef.current = expEvent;
  const lastNearEvent = useRef(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showHudDetails, setShowHudDetails] = useState(false);
  const [resting, setResting] = useState(null);
  const [npcMenu, setNpcMenu] = useState(null);
  const nearNpcDef = world?.npcs.find(n => n.id === nearNpc) || null;
  const threatRef = useRef(game.threat || 0);
  threatRef.current = game.threat || 0;
  const strangerPos = world ? { x: clamp(world.spawn.x + 140, 40, world.W - 40), y: clamp(world.spawn.y - 90, 40, world.H - 40) } : null;
  const strangerVisible = (tierOf(game.threat || 0).id === "alta" || tierOf(game.threat || 0).id === "muy_alta") && !strangerUsed.current;
  useEffect(() => {
    if (!inCombat) {
      dir.current = { x: 0, y: 0 };
      setJoystickKey(k => k + 1);
    } else {
      runRef.current = false;
      setRunToggle(false);
      if (navWrapRef.current) navWrapRef.current.style.display = "none";
    }
  }, [inCombat]);

  const [deviceLandscape, setDeviceLandscape] = useState(false);
  useEffect(() => { const mq = window.matchMedia("(orientation: landscape)"); const update = () => setDeviceLandscape(mq.matches); update(); try { mq.addEventListener("change", update); } catch { mq.addListener(update); } return () => { try { mq.removeEventListener("change", update); } catch { mq.removeListener(update); } }; }, []);

  const settings = game.settings || {};
  const orient = settings.orientation || "horizontal";
  const kbEnabled = (settings.controls || "auto") !== "mobile";
  // El diseño horizontal solo se activa cuando el dispositivo realmente está
  // en paisaje. Si el navegador rechaza el bloqueo, queda un fallback vertical.
  const horizontal = deviceLandscape;
  const wantsHorizontal = orient === "horizontal";
  const leftHanded = settings.handedness === "left";
  const baseControlScale = settings.controlSize === "small" ? 0.8 : settings.controlSize === "large" ? 1.3 : 1;
  const cScale = baseControlScale * (horizontal ? 0.86 : 1);
  const controlProfiles = normalizeControlProfiles(settings.controlProfiles, settings.handedness);
  const activeControlProfile = controlProfiles[horizontal ? "landscape" : "portrait"];
  const separatedRequested = (settings.controlLayout || "integrated") === "separated";
  const separated = separatedRequested && !horizontal;
  const hudClean = (settings.hudDensity || "clean") === "clean";
  const viewScale = horizontal ? 1.08 : 1.55;
  const viewScaleRef = useRef(viewScale);
  viewScaleRef.current = viewScale;

  useEffect(() => {
    if (!world) return;
    pos.current = { x: world.spawn.x, y: world.spawn.y };
    cam.current = { x: 0, y: 0 };
    transitionsRef.current = getSectorTransitions(region.id, game.currentSectorId);
    graceUntilRef.current = Date.now() + 600;
    enemies.current = activeEnemySource.map(e => ({ ...e, defeated: game.defeatedEnemyIds?.has(e.id) }));
    bossState.current = world.boss ? { x: world.boss.x, y: world.boss.y, defeated: game.defeatedBosses?.has(world.boss.monster.id) } : { x: -999, y: -999, defeated: true };
    setEnemyList([...enemies.current]);
    villagers.current = (world.villagers || []).map((v, i) => createVillagerMotion(v, i));
    fauna.current = (world.fauna || []).map(f => ({ ...f, angle: Math.random() * Math.PI * 2, timer: Math.random() * 120 }));
    setFaunaMeta((world.fauna || []).map(f => ({ id: f.id, emoji: f.emoji })));
    setExpEvent(rollExplorationEvent(world, { regionId: region.id, col: game.blockIndex, row: game.sectorRow, threat: game.threat || 0, progress: game.regionProgress || 0 }));
    setNearEvent(false); lastNearEvent.current = false;
    lastNear.current = { npc: null, chest: null, storyPoint: null };
    lastNearShrine.current = null;
    setNearNpc(null); setNearChest(null); setNearStoryPoint(null); setNearShrine(null);
    drawnRef.current = { dir: "", frame: -1 }; facingRef.current = "down"; frameRef.current = 0;
    crossingRef.current = false;
    portalCooldown.current = 0;
    lastNearStranger.current = false; setNearStranger(false); setStrangerDialog(false);
    moveAccum.current = 0; idleAccum.current = 0; eventTimer.current = 0;
  }, [world, missionEncounterEnemies, clearAmbientEnemies]);

  useEffect(() => {
    if (!world) return;
    enemies.current = activeEnemySource.map((e, i) => { const prev = enemies.current.find(p => p.id === e.id) || enemies.current[i]; const wasAlive = prev && !prev.defeated; return { ...e, x: wasAlive ? prev.x : e.x, y: wasAlive ? prev.y : e.y, angle: wasAlive ? prev.angle : e.angle, timer: wasAlive ? prev.timer : 0, defeated: game.defeatedEnemyIds?.has(e.id) }; });
    setEnemyList([...enemies.current]);
    enemies.current.forEach((e, i) => { const el = enemyEls.current[i]; if (el) el.style.display = e.defeated ? "none" : ""; });
  }, [game.defeatedEnemyIds, world, missionEncounterEnemies, clearAmbientEnemies]);

  useEffect(() => { if (game.respawnPos) { pos.current = { x: game.respawnPos.x, y: game.respawnPos.y }; facingRef.current = game.respawnPos.facing || facingRef.current; cam.current = { x: 0, y: 0 }; graceUntilRef.current = Date.now() + 600; game.consumeRespawn?.(); } }, [game.respawnPos]);

  useEffect(() => {
    if (!world) return;
    let raf;
    const loop = () => {
      if (!inCombat && !paused) {
        const speed = Math.max(1.6, 3.2 * (1 + (player.speedBonus || 0) * 0.08)) * ((runRef.current || runToggleRef.current) ? 1.6 : 1);
        let { x, y } = pos.current;
        if (!crossingRef.current && Date.now() > graceUntilRef.current) {
          const M = 22;
          const trans = transitionsRef.current;
          const northT = trans.find(t => t.direction === "north");
          const southT = trans.find(t => t.direction === "south");
          const eastT = trans.find(t => t.direction === "east");
          const westT = trans.find(t => t.direction === "west");
          const inCorridorX = (t) => t && x >= t.corridor.x && x <= t.corridor.x + t.corridor.w;
          const inCorridorY = (t) => t && y >= t.corridor.y && y <= t.corridor.y + t.corridor.h;
          const attemptCross = (direction, coord) => {
            crossingRef.current = true;
            graceUntilRef.current = Date.now() + 600;
            const result = game.onTravelSector?.(direction, coord);
            if (result?.ok === false) {
              showFlavor(result.reason);
              setTimeout(() => { crossingRef.current = false; }, 500);
            }
          };
          if (game.hasTravelNorth && dir.current.y < -0.25 && y <= M && inCorridorX(northT)) attemptCross("north", x);
          else if (game.hasTravelSouth && dir.current.y > 0.25 && y >= world.H - M && inCorridorX(southT)) attemptCross("south", x);
          else if (game.hasTravelEast && dir.current.x > 0.25 && x >= world.W - M && inCorridorY(eastT)) attemptCross("east", y);
          else if (game.hasTravelWest && dir.current.x < -0.25 && x <= M && inCorridorY(westT)) attemptCross("west", y);
        }
        const dx = dir.current.x * speed, dy = dir.current.y * speed;
        let nx = clamp(x + dx, 16, world.W - 16), ny = clamp(y + dy, 16, world.H - 16);
        if (!hitSolid(nx, ny, world.solids)) { x = nx; y = ny; }
        else if (!hitSolid(nx, y, world.solids)) { x = nx; }
        else if (!hitSolid(x, ny, world.solids)) { y = ny; }
        pos.current = { x, y };
        navTickRef.current += 1;
        if (navTickRef.current >= 10) {
          navTickRef.current = 0;
          const nav = missionNavTargetRef.current;
          const wrap = navWrapRef.current;
          if (wrap) {
            if (nav) {
              const angle = Math.atan2(nav.y - y, nav.x - x) * 180 / Math.PI + 90;
              const distance = Math.round(Math.hypot(nav.x - x, nav.y - y));
              wrap.style.display = "";
              if (navIconRef.current) navIconRef.current.style.transform = `rotate(${angle}deg)`;
              if (navLabelRef.current) navLabelRef.current.textContent = nav.label;
              if (navDistRef.current) navDistRef.current.textContent = `${distance} m`;
            } else {
              wrap.style.display = "none";
            }
          }
        }
        game.onShrineCheck?.(x, y);
        const moving = Math.abs(dir.current.x) + Math.abs(dir.current.y) > 0.1;
        if (moving) {
          if (Math.abs(dir.current.x) > Math.abs(dir.current.y)) facingRef.current = dir.current.x < 0 ? "left" : "right";
          else facingRef.current = dir.current.y < 0 ? "up" : "down";
          stepRef.current += 1;
          if (stepRef.current >= ((runRef.current || runToggleRef.current) ? 3 : 6)) {
            stepRef.current = 0;
            frameRef.current = (frameRef.current + 1) % 4;
          }
        } else {
          stepRef.current = 0;
          frameRef.current = 0;
        }
        if (playerCanvasRef.current && (drawnRef.current.dir !== facingRef.current || drawnRef.current.frame !== frameRef.current)) {
          drawPlayerFrameWithModularFallback({ surface: "world", legacyDraw: () => drawPlayerSprite(playerCanvasRef.current, player.class, facingRef.current, frameRef.current, 3, player.race) });
          playerCanvasRef.current.dataset.atlasFacing = facingRef.current;
          playerCanvasRef.current.dataset.atlasMoving = moving ? "true" : "false";
          drawnRef.current = { dir: facingRef.current, frame: frameRef.current };
        }
        if (playerShadowRef.current) {
          const planted = frameRef.current % 2 === 0;
          playerShadowRef.current.style.transform = `translateX(-50%) scaleX(${moving ? (planted ? 1.12 : 0.91) : 1})`;
          playerShadowRef.current.style.opacity = moving ? (planted ? "0.56" : "0.40") : "0.48";
        }
        const tier = tierOf(threatRef.current);
        const beh = worldBehavior(tier.id);
        if (moving) { moveAccum.current += 1; idleAccum.current = 0; } else { idleAccum.current += 1; moveAccum.current = 0; }
        if (moveAccum.current >= 2400) { moveAccum.current = 0; }
        if (idleAccum.current >= 3000) { idleAccum.current = 0; game.onIdleThreat?.(); }
        eventTimer.current += 1;
        if (eventTimer.current >= 1700) { eventTimer.current = 0; game.onThreatEvent?.(); }
        if ((tier.id === "alta" || tier.id === "muy_alta") && strangerPos && !strangerUsed.current) { const ns = Math.hypot(strangerPos.x - x, strangerPos.y - y) < 44; if (ns !== lastNearStranger.current) { lastNearStranger.current = ns; setNearStranger(ns); } } else if (lastNearStranger.current) { lastNearStranger.current = false; setNearStranger(false); }
        const vw = vpRef.current?.clientWidth || 800, vh = vpRef.current?.clientHeight || 600;
        const vs = viewScaleRef.current;
        const worldSW = world.W * vs, worldSH = world.H * vs;
        let tx = x * vs - vw / 2; let ty = y * vs - vh / 2;
        if (worldSW <= vw) tx = (worldSW - vw) / 2; else tx = Math.max(0, Math.min(worldSW - vw, tx));
        if (worldSH <= vh) ty = (worldSH - vh) / 2; else ty = Math.max(0, Math.min(worldSH - vh, ty));
        cam.current.x += (tx - cam.current.x) * 0.12; cam.current.y += (ty - cam.current.y) * 0.12;
        if (worldRef.current) worldRef.current.style.transform = `translate(${-cam.current.x}px, ${-cam.current.y}px) scale(${vs})`;
        if (playerRef.current) { playerRef.current.style.transform = `translate(${x - 18}px, ${y - 48}px)`; setWorldDepth(playerRef.current, y, 1); }
        const safe = world.safeCenter; const safeR = world.safeRadius || 0;
        const inSafe = (px, py) => safe && Math.hypot(px - safe.x, py - safe.y) < safeR;
        const playerInSafe = inSafe(x, y);
        enemies.current.forEach((e, i) => {
          if (e.defeated) return;
          const prevX = e.x;
          const prevY = e.y;
          const dist = Math.hypot(e.x - x, e.y - y);
          if (beh.chase && dist < beh.detectRange && dist > 0 && !playerInSafe) {
            const sp = 1.5 * (beh.chaseSpeed || 1);
            const ang = Math.atan2(y - e.y, x - e.x);
            e.angle = ang;
            const ex = e.x + Math.cos(ang) * sp;
            const ey = e.y + Math.sin(ang) * sp;
            if (!inSafe(ex, ey) && !hitSolid(ex, ey, world.solids)) { e.x = ex; e.y = ey; }
          } else {
            e.timer -= 1;
            if (e.timer <= 0) { e.angle = Math.random() * Math.PI * 2; e.timer = 60 + Math.random() * 120; }
            const patrolSp = beh.patrolSpeed || 1;
            const ex = e.x + Math.cos(e.angle) * (0.9 * patrolSp);
            const ey = e.y + Math.sin(e.angle) * (0.9 * patrolSp);
            if (ex < 20 || ex > world.W - 20 || ey < 20 || ey > world.H - 20 || hitSolid(ex, ey, world.solids) || inSafe(ex, ey)) e.angle = Math.random() * Math.PI * 2;
            else { e.x = ex; e.y = ey; }
          }
          const moveX = e.x - prevX;
          const moveY = e.y - prevY;
          const enemyMoving = Math.abs(moveX) + Math.abs(moveY) > 0.01;
          if (enemyMoving) {
            e.facing = Math.abs(moveX) > Math.abs(moveY)
              ? (moveX < 0 ? "left" : "right")
              : (moveY < 0 ? "up" : "down");
          }
          const el = enemyEls.current[i];
          if (el) {
            el.style.transform = `translate(${e.x - 17}px, ${e.y - 23}px)`;
            el.classList.toggle("atlas-moving-actor", enemyMoving);
            const directional = el.querySelector('[data-atlas-directional-sprite="true"]');
            if (directional && e.facing) directional.dataset.facing = e.facing;
            setWorldDepth(el, e.y, 2);
          }
          if (dist < 30 && !playerInSafe && Date.now() > graceUntilRef.current) {
            e.defeated = true;
            if (el) el.style.display = "none";
            game.markEnemyDefeated?.(e.id);
            game.onStartCombatThreat?.(e.monster);
          }
        });
        if (regionalBossReady && !bossState.current.defeated && Math.hypot(bossState.current.x - x, bossState.current.y - y) < 36 && Date.now() > graceUntilRef.current) { bossState.current.defeated = true; if (bossEl.current) bossEl.current.style.display = "none"; game.onStartCombat(world.boss.monster); }
        villagers.current.forEach((v, i) => {
          v.timer -= 1;
          if (v.timer <= 0) {
            if (v.motionMode === "walk") {
              v.motionMode = "rest";
              v.timer = 90 + Math.floor(Math.random() * 240);
            } else {
              v.motionMode = "walk";
              v.angle = Math.random() * Math.PI * 2;
              v.timer = 55 + Math.floor(Math.random() * 150);
            }
          }
          if (v.motionMode === "walk") {
            const speed = v.walkSpeed || 0.34;
            const vx = v.x + Math.cos(v.angle) * speed;
            const vy = v.y + Math.sin(v.angle) * speed;
            const outsideHome = Math.hypot(vx - v.home.x, vy - v.home.y) > (v.roamRadius || 55);
            if (outsideHome || hitSolid(vx, vy, world.solids)) {
              v.angle += Math.PI * (0.65 + Math.random() * 0.7);
              v.motionMode = "rest";
              v.timer = 40 + Math.floor(Math.random() * 110);
            } else {
              v.x = vx;
              v.y = vy;
              if (Math.abs(Math.cos(v.angle)) > 0.15) v.facing = Math.cos(v.angle) < 0 ? "left" : "right";
            }
          }
          const el = villagerEls.current[i];
          if (el) {
            el.style.transform = `translate(${v.x - 15}px, ${v.y - 20}px)`;
            el.classList.toggle("atlas-moving-actor", v.motionMode === "walk");
            setWorldDepth(el, v.y, 1);
          }
          const body = villagerBodyEls.current[i];
          if (body) {
            body.classList.toggle("atlas-sprite-walk", v.motionMode === "walk");
            body.classList.toggle("atlas-sprite-idle", v.motionMode !== "walk");
            body.style.setProperty("--atlas-npc-mirror", v.facing === "left" ? "-1" : "1");
          }
        });
        fauna.current.forEach((f, i) => { const el = faunaEls.current[i]; const d = Math.hypot(f.x - x, f.y - y); if (d > 300) return; f.timer -= 1; let ang, sp; if (d < 70) { ang = Math.atan2(f.y - y, f.x - x); sp = (f.speed || 1.2) * 1.7; } else { if (f.timer <= 0) { f.angle = Math.random() * Math.PI * 2; f.timer = 90 + Math.random() * 160; } ang = f.angle; sp = 0.4 * (f.speed || 1.2); } const fx = f.x + Math.cos(ang) * sp, fy = f.y + Math.sin(ang) * sp; if (fx > 14 && fx < world.W - 14 && fy > 14 && fy < world.H - 14 && !hitSolid(fx, fy, world.solids)) { f.x = fx; f.y = fy; f.angle = ang; } else f.angle = Math.random() * Math.PI * 2; if (el) { el.style.transform = `translate(${f.x - 10}px, ${f.y - 10}px)`; setWorldDepth(el, f.y); } });
        // Prioridad: punto narrativo (objetivo de misión) > NPC > santuario > cofre
        let nn = null, nc = null, nsp = null;
        for (const sp of visibleStoryPointsRef.current) {
          const r = sp.interactionRadius || 42;
          if (Math.hypot(sp.x - x, sp.y - y) < r) { nsp = sp.id; break; }
        }
        if (!nsp) for (const n of world.npcs) if (Math.hypot(n.x - x, n.y - y) < 52) { nn = n.id; break; }
        let nsh = null;
        if (!nsp && !nn && game.shrines) for (const s of game.shrines) {
          if (!s.revealed) continue;
          if (s.isSanctuary) {
            // El botón A solo se habilita cuando los pies están realmente
            // sobre la plataforma central del portal, no desde los lados.
            if (isOnSanctuaryPlatform(s, x, y)) { nsh = s.id; break; }
          } else if (!s.activated && Math.hypot(s.x - x, s.y - y) < 46) {
            nsh = s.id; break;
          }
        }
        if (!nsp && !nn && !nsh) for (const c of world.chests) if (!game.openedChests?.has(c.id) && Math.hypot(c.x - x, c.y - y) < 52) { nc = c.id; break; }
        if (nn !== lastNear.current.npc) { lastNear.current.npc = nn; setNearNpc(nn); }
        if (nc !== lastNear.current.chest) { lastNear.current.chest = nc; setNearChest(nc); }
        if (nsp !== lastNear.current.storyPoint) { lastNear.current.storyPoint = nsp; setNearStoryPoint(nsp); }
        if (nsh !== lastNearShrine.current) { lastNearShrine.current = nsh; setNearShrine(nsh); }
        if (expEventRef.current) { const ne = Math.hypot(expEventRef.current.x - x, expEventRef.current.y - y) < 50; if (ne !== lastNearEvent.current) { lastNearEvent.current = ne; setNearEvent(ne); } } else if (lastNearEvent.current) { lastNearEvent.current = false; setNearEvent(false); }
        if (portalCooldown.current > 0) portalCooldown.current--;
        if (portalCooldown.current === 0 && Date.now() > graceUntilRef.current && world.portals) { for (const p of world.portals) { if (!p.to.nextRegion) continue; if (Math.hypot(p.x - x, p.y - y) < 30) { portalCooldown.current = 60; if (game.canTravelNextRegion && regionIndex < 2) game.pushLog?.(`✦ El portal a la siguiente región resuena. Usa un Portal de Invocación para viajar a la nueva región.`); break; } } }
        if (dungeonCdRef.current > 0) dungeonCdRef.current--;
        const dung = getDungeonForSector(region.id, game.currentSectorId);
        const ent = getValidDungeonEntrance(dung, world);
        const nearCamp = recruitCampPos && Math.hypot(recruitCampPos.x - x, recruitCampPos.y - y) < 52;
        if (nearCamp !== lastNearRecruits.current) { lastNearRecruits.current = nearCamp; setNearRecruits(nearCamp); }
        // Entrada controlada: NO entrar automáticamente. Detectar proximidad al guardián.
        if (ent) {
          const nd = Math.hypot(ent.x - x, ent.y - y) < 46 ? dung?.id : null;
          if (nd !== lastNearDungeon.current) { lastNearDungeon.current = nd; setNearDungeon(nd); }
        } else if (lastNearDungeon.current) { lastNearDungeon.current = null; setNearDungeon(null); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inCombat, paused, world, bossDefeated, regionalBossReady, regionIndex, game.openedChests, game.defeatedEnemyIds, game.defeatedBosses, game.shrines]);

  const onA = () => {
    if (inCombat) return;
    if (nearDungeon) { if (!dungeonAccess.unlocked) { showFlavor(dungeonAccess.reason); return; } setShowDungeonEntry(true); return; }
    if (nearRecruits) { setShowRecruits(true); return; }
    // Prioridad: objetivo de misión / punto narrativo > NPC > objetivo > desconocido > santuario > evento > cofre
    if (nearStoryPoint) {
      const point = visibleStoryPointsRef.current.find(p => p.id === nearStoryPoint);
      const result = game.onStoryPoint?.(point || nearStoryPoint);
      showFlavor(result?.message || point?.description || point?.label);
      setNearStoryPoint(null);
      return;
    }
    if (nearNpcDef) {
      if (nearNpcActions.length <= 1) {
        executeNpcAction(nearNpcActions[0] || { type: "dialogue" }, nearNpcDef);
      } else {
        setNpcMenu({ npc: nearNpcDef, actions: nearNpcActions });
      }
      return;
    }
    else if (nearStranger) { setStrangerDialog(true); }
    else if (nearShrine) { game.onOpenShrine?.(nearShrine); }
    else if (nearEvent && expEventRef.current) { const ev = expEventRef.current; if (ev.kind === "merchant") { game.onOpenShop?.("camp"); showFlavor(randomEventLine(ev)); } else { showFlavor(randomEventLine(ev)); } }
    else if (nearChest != null) { const chest = world.chests.find(c => c.id === nearChest) || nearChest; setNearChest(null); game.openChest(chest); }
  };

  useKeyboardControls({
    enabled: kbEnabled,
    dir,
    run: runRef,
    onInteract: onA,
    onCancel: () => {
      if (inCombat) { if (!game.busy) game.onEscape?.(); }
      else if (npcMenu) setNpcMenu(null);
      else if (showHub) setShowHub(false);
      else if (showJournal) setShowJournal(false);
      else if (showExploreMap) setShowExploreMap(false);
      else setPaused(p => !p);
    },
    onAttack: () => { if (!game.busy) game.onAttack?.(); },
    onSkill: (key) => { if (!game.busy) game.onSkill?.(key); },
    onInventory: () => setShowHub(true),
    onJournal: () => setShowJournal(true),
    onMap: () => setShowExploreMap(true),
    onTogglePause: () => setPaused(p => !p),
    isCombat: inCombat,
  });

  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  const faunaCount = Math.max(0, Math.round(faunaMeta.length * (1 - (game.threat || 0) * 0.07)));
  const nearStoryPointDef = visibleStoryPoints.find(p => p.id === nearStoryPoint) || null;
  const nearNpcActions = nearNpcDef ? getNpcAvailableActions({
    npc: nearNpcDef, missions: game.missions, missionDefs: game.missionDefs,
    getMissionLockReason: game.getMissionLockReason, worldFlags: game.worldFlags, regionId: region.id,
  }) : [];
  const npcReadyIds = (() => {
    const set = new Set();
    if (!world || !game.missionDefs) return set;
    for (const n of world.npcs) {
      const defs = game.missionDefs[n.sector] || [];
      if (defs.some(d => d.role === n.role && game.missions?.[d.id]?.status === "ready")) set.add(n.id);
    }
    return set;
  })();
  const executeNpcAction = (action, npc) => {
    setNpcMenu(null);
    switch (action.type) {
      case "claim": case "continue": case "view_missions":
        game.onTalkNpc?.(npc.sector, npc.role);
        game.onOpenSettlementNpc?.(npc);
        break;
      case "shop": game.onOpenShop?.(npc.shop); break;
      case "smith": game.onOpenSmith?.(npc.smithTier || "camp"); break;
      case "rest": {
        const cost = npc.rest || 0;
        if ((player.gold || 0) < cost) { game.onRestAt?.(npc.sector); return; }
        const isDay = (game.dayPhase || 0) < 0.5;
        setResting({ sector: npc.sector, label: isDay ? "Anochece" : "Amanece" });
        setTimeout(() => game.onAdvanceTime?.(0.5), 650);
        break;
      }
      case "restore_relic": game.onRestoreGreenRelic?.(); break;
      case "dialogue":
        game.onTalkNpc?.(npc.sector, npc.role);
        if (["flavor", "flavor1", "flavor2"].includes(npc.role)) game.onOpenFlavor?.(npc);
        else game.onOpenSettlementNpc?.(npc);
        break;
    }
  };
  const nearShrineDef = nearShrine ? (game.shrines || []).find(sh => sh.id === nearShrine) : null;
  const proxHint = !inCombat && (nearDungeon ? `Hablar con el guardián de la dungeon` : nearRecruits ? "Hablar con los aventureros" : nearStoryPointDef ? (nearStoryPointDef.proximityLabel || `Examinar: ${nearStoryPointDef.label}`) : nearNpcDef ? (nearNpcActions.length > 1 ? `Interactuar con ${nearNpcDef.name}` : nearNpcActions[0]?.type === "shop" ? `Comprar a ${nearNpcDef.name}` : nearNpcActions[0]?.type === "smith" ? `Forjar en la herrería` : nearNpcActions[0]?.type === "rest" ? `Descansar en ${nearNpcDef.name} (${nearNpcDef.rest} oro)` : nearNpcActions[0]?.type === "restore_relic" ? `Restaurar reliquia` : nearNpcActions[0]?.type === "claim" ? `Reclamar recompensa` : nearNpcActions[0]?.type === "continue" ? `Continuar misión` : `Hablar con ${nearNpcDef.name}`) : nearChest != null ? (() => { const c = world.chests.find(x => x.id === nearChest); return c?.type === "legendary" ? "Abrir cofre legendario (3d20)" : c?.type === "ancient" ? "Abrir cofre antiguo (d20)" : "Abrir cofre común"; })() : nearStranger ? "Hablar con el desconocido" : nearShrineDef ? (nearShrineDef.isSanctuary ? (nearShrineDef.activated ? "Usar Portal de Invocación" : "Activar Portal de Invocación") : "Santuario de Atlas") : nearEvent && expEventRef.current ? (expEventRef.current.kind === "merchant" ? "Comprar al comerciante ambulante" : "Examinar") : null);
  const actionReady = !!proxHint;
  const actionButtonClass = actionReady
    ? "bg-emerald-500/95 border-emerald-100 ring-4 ring-emerald-300/35 shadow-[0_0_18px_rgba(52,211,153,.65)] animate-pulse"
    : "bg-emerald-800/70 border-emerald-500/70";
  const decorEls = useMemo(() => (world?.decor || []).map((d, i) => { if (d.visual) return <FoliageDot key={i} d={d} biome={world.biome} />; const sway = d.icon === "treepine" || d.icon === "trees" || d.icon === "tree2" || d.icon === "deadtree" ? "atlas-sway" : (d.icon === "cactus" || d.icon === "bush" || d.icon === "mushroom") ? "atlas-sway-slow" : ""; return (<span key={i} className={`absolute flex items-end justify-center ${sway}`} style={{ left: d.x - d.sz / 2, top: d.y - d.sz / 2, width: d.sz, height: d.sz, zIndex: getWorldDepth(d.y), filter: "drop-shadow(3px 5px 5px rgba(0,0,0,0.5))" }}><div className="absolute bottom-0 pointer-events-none" style={{ left: "60%", transform: "translateX(-50%)", width: d.sz * 0.74, height: d.sz * 0.2, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5), transparent 72%)" }} /><WorldSprite icon={d.icon} size={d.sz} biome={world.biome} /></span>); }), [world]);
  const waterEls = useMemo(() => (world?.water || []).map((w, i) => (<div key={i} className="absolute atlas-water" style={{ left: w.x - w.sz / 2, top: w.y - w.sz / 2, width: w.sz, height: w.sz, background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.35), ${ground?.water} 70%)` }} />)), [world, ground?.water]);
  const onB = () => setShowHub(true);
  const toggleRun = () => setRunToggle(v => !v);
  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="text-center px-4">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm">{game.regionError || "Cargando región…"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`atlas-ui-v3 atlas-explore-root min-h-screen relative flex flex-col ${horizontal ? "atlas-explore-horizontal" : "atlas-explore-vertical"} ${wantsHorizontal ? "atlas-prefers-horizontal" : ""} ${leftHanded ? "atlas-left-handed" : "atlas-right-handed"}`} style={{ background: "#0a0a0a" }}>
      <div ref={vpRef} className={`atlas-explore-viewport relative w-full overflow-hidden ${visualScene ? "atlas-green-stable-viewport" : ""}`} style={{ height: separated ? "calc(100dvh - 92px)" : "100dvh" }}>
        <div ref={worldRef} className="absolute top-0 left-0" style={{ width: world.W, height: world.H, transformOrigin: "0 0" }}>
          {(!hudClean || settings.debugTargets) && (world.spawnZones || []).map((z, i) => (<div key={i} className="absolute pointer-events-none flex items-center justify-center" style={{ left: z.x - 40, top: z.y - 40, width: 80, height: 80 }}><div className="absolute rounded-full border-2 border-emerald-300/50 animate-pulse" style={{ width: 72, height: 72 }} /><div className="absolute rounded-full border border-emerald-300/30" style={{ width: 48, height: 48 }} /><div className="absolute text-emerald-200/70 text-[9px] font-heading whitespace-nowrap">Invocación</div></div>))}
          {visualScene ? (
            <AssetWorldLayer scene={visualScene} phase="all" debugCollisions={!!settings.debugTargets} />
          ) : (
            <>
              <TileGround world={world} ground={ground} />
              <TerrainHeightLayer world={world} />
              {(world.breaches || []).map((b, i) => {
                const r = b.rect;
                if (!r || r.w <= 0 || r.h <= 0) return null;
                return (
                  <div key={`br_${i}`} className="absolute pointer-events-none" style={{
                    left: r.x, top: r.y, width: r.w, height: r.h,
                    background: `linear-gradient(160deg, ${ground.base}, ${ground.alt})`,
                    borderRadius: 6,
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.28), inset 0 2px 0 rgba(255,255,255,0.06)",
                    border: "1px solid rgba(0,0,0,0.22)",
                  }} />
                );
              })}
              <RoadLayer world={world} />
              {waterEls}
              <GroundTufts world={world} biome={world.biome} />
            </>
          )}
          {transitionsRef.current.map(t => { const c = t.corridor; const ps = getPathStyle(region.id); return <div key={`path_${t.id}`} className="absolute pointer-events-none" style={{ left: c.x, top: c.y, width: c.w, height: c.h, background: `${ps.color}33` }} />; })}
          {settings.debugTargets && transitionsRef.current.map(t => { const c = t.corridor; return (<div key={`dbg_${t.id}`} className="absolute pointer-events-none"><div className="absolute" style={{ left: c.x, top: c.y, width: c.w, height: c.h, border: "1px dashed rgba(34,197,94,0.5)" }} /><div className="absolute" style={{ left: t.trigger.x, top: t.trigger.y, width: t.trigger.w, height: t.trigger.h, border: "1px dotted rgba(251,191,36,0.6)" }} /><div className="absolute rounded-full" style={{ left: t.exit.x - 3, top: t.exit.y - 3, width: 6, height: 6, background: "#22c55e" }} /><div className="absolute rounded-full" style={{ left: t.arrival.x - 3, top: t.arrival.y - 3, width: 6, height: 6, background: "#3b82f6" }} /><div className="absolute rounded bg-slate-950/80 px-1 py-0.5 text-[7px] font-mono text-emerald-300 whitespace-nowrap" style={{ left: c.x + 4, top: c.y + 2 }}>{t.fromSector}→{t.toSector}</div></div>); })}
          {!visualScene && decorEls}
          {world.chests.map(c => { const opened = game.openedChests?.has(c.id); const glow = c.type === "legendary" ? "drop-shadow(0 0 10px rgba(251,191,36,0.9))" : c.type === "ancient" ? "drop-shadow(0 0 8px rgba(167,139,250,0.75))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.6))"; return (<span key={c.id} className="absolute flex flex-col items-center" style={{ left: c.x - 22, top: c.y - 22, zIndex: getWorldDepth(c.y, 1) }}><div className="atlas-shadow" /><PixelSprite grid={getChestPixel(opened ? "open" : "closed")} palette={CHEST_PALETTE} scale={3} className={opened ? "atlas-toast-in" : ""} style={{ filter: glow }} />{!opened && c.type !== "common" && (!hudClean || nearChest === c.id) && <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[8px] font-heading ${c.type === "legendary" ? "bg-amber-900/85 text-amber-200" : "bg-violet-950/85 text-violet-200"}`}>{c.type === "legendary" ? "3d20" : "ANTIGUO"}</span>}</span>); })}
          {world.npcs.map(n => { const near = nearNpc === n.id; const isMission = missionNpcIds.has(n.id); const isTarget = missionNavTarget?.targetId === n.id; return (<div key={n.id} className="absolute flex flex-col items-center atlas-world-entity" style={{ left: n.x - 22, top: n.y - 42, zIndex: isTarget ? 9998 : getWorldDepth(n.y, 1) }}><div className="relative"><div className="atlas-shadow" />{isTarget && !inCombat && (<><span className="absolute -inset-2 rounded-full border-2 border-amber-300 animate-pulse z-0" style={{ boxShadow: "0 0 16px 6px rgba(251,191,36,0.45)" }} /><span className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 rounded-full bg-amber-300 text-slate-950 p-1 shadow-lg"><Navigation className="w-3 h-3" /></span></>)}{npcReadyIds.has(n.id) && !inCombat && !isTarget && (<span className="absolute -top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center z-10 text-[8px] text-slate-950 font-bold" style={{ boxShadow: "0 0 8px 3px rgba(251,191,36,0.7)" }}><Star className="w-2 h-2" /></span>)}{!npcReadyIds.has(n.id) && isMission && !inCombat && !isTarget && (<span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse z-10" style={{ boxShadow: "0 0 8px 3px rgba(251,191,36,0.7)" }} />)}{!npcReadyIds.has(n.id) && !isMission && (n.role === "smith" || n.role === "merchant" || n.role === "inn") && !inCombat && !isTarget && (!hudClean || near) && (<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/85 border border-slate-500 p-0.5 z-10 flex items-center justify-center"><GIcon name={n.role === "smith" ? "hammer" : n.role === "merchant" ? "package" : "moon"} size={9} /></span>)}<span className="atlas-sprite-idle block relative z-10" style={npcIdleAnimationStyle(n.id)}><EntitySprite type={n.sprite.type} variant={n.sprite.variant} turn animationKey={n.id} size={42} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" /></span></div><div className="flex items-center gap-1 mt-0.5 transition-opacity duration-200 pointer-events-none whitespace-nowrap" style={{ opacity: (near || isTarget) && !inCombat ? 1 : 0 }}><span className={`text-[9px] px-1.5 py-0.5 rounded leading-none ${isTarget ? "bg-amber-300 text-slate-950 font-bold" : "text-white bg-slate-900/75"}`}>{n.name}</span>{isMission && !isTarget && (<span className="text-[9px] text-slate-900 bg-amber-300 rounded px-1 py-0.5 font-bold leading-none shadow">!</span>)}</div></div>); })}
          {(world.villagers || []).map((v, i) => (<span key={v.id} ref={el => villagerEls.current[i] = el} className="absolute atlas-world-entity" style={{ left: 0, top: 0, transform: `translate(${v.x - 15}px, ${v.y - 20}px)`, zIndex: getWorldDepth(v.y, 1), willChange: "transform" }}><div className="flex flex-col items-center"><div className="atlas-shadow" /><span ref={el => villagerBodyEls.current[i] = el} className="atlas-npc-independent atlas-sprite-idle" style={npcIdleAnimationStyle(v.id)}><EntitySprite type="villager" variant={v.icon === "shield" ? "guard" : "civilian"} dir="right" size={30} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" /></span></div></span>))}
          {faunaMeta.slice(0, faunaCount).map((m, i) => { const f = fauna.current[i] || { x: 0, y: 0 }; return (<span key={m.id} ref={el => faunaEls.current[i] = el} className="absolute atlas-sprite-idle atlas-world-entity" style={{ left: 0, top: 0, transform: `translate(${f.x - 10}px, ${f.y - 10}px)`, zIndex: getWorldDepth(f.y), fontSize: 18, lineHeight: 1, willChange: "transform", filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.5))", pointerEvents: "none" }}>{m.emoji}</span>); })}
          {(world.smoke || []).map((s, i) => (<div key={i} className="absolute pointer-events-none" style={{ left: s.x, top: s.y, zIndex: getWorldDepth(s.y, 12) }}><div className="absolute w-2.5 h-2.5 rounded-full bg-slate-100/25 atlas-smoke" /><div className="absolute w-2.5 h-2.5 rounded-full bg-slate-100/20 atlas-smoke" style={{ animationDelay: "1.2s" }} /><div className="absolute w-2.5 h-2.5 rounded-full bg-slate-100/20 atlas-smoke" style={{ animationDelay: "2.4s" }} /></div>))}
          {(world.signposts || []).map((s, i) => <Signpost key={`sg${i}`} s={s} />)}
          {(world.ambientNpcs || []).map(n => <AmbientNpc key={n.id} npc={n} compact={hudClean} onTalk={(npc) => showFlavor(npc.lines[0])} />)}
          {(world.loreMarkers || []).map(m => <LoreMarker key={m.id} m={m} onInspect={(mm) => showFlavor(mm.lore)} />)}
          {visibleStoryPoints.map(sp => { const near = nearStoryPoint === sp.id; const isTarget = missionNavTarget?.targetId === sp.id; return <StoryPointMarker key={sp.id} sp={sp} near={near} isTarget={isTarget} debug={settings.debugTargets} />; })}
          {settings.debugTargets && missionNavTarget && pos.current && (() => { const px = pos.current.x, py = pos.current.y; const tx = missionNavTarget.x, ty = missionNavTarget.y; const dist = Math.round(Math.hypot(tx - px, ty - py)); const angle = Math.atan2(ty - py, tx - px) * 180 / Math.PI; const len = Math.hypot(tx - px, ty - py); return (<div className="absolute pointer-events-none" style={{ left: px, top: py }}><div className="absolute origin-left" style={{ width: len, height: 2, background: "rgba(252,211,77,0.5)", transform: `rotate(${angle}deg)` }} /><div className="absolute rounded bg-slate-950/90 border border-amber-500/50 px-1.5 py-0.5 text-[7px] text-amber-300 font-mono whitespace-nowrap" style={{ left: (tx - px) / 2 - 20, top: (ty - py) / 2 - 8 }}>{dist}m</div></div>); })()}
          <ExplorationEvent event={expEvent} near={nearEvent} inCombat={inCombat} />
          {strangerVisible && strangerPos && (<div className="absolute flex flex-col items-center atlas-world-entity" style={{ left: strangerPos.x - 22, top: strangerPos.y - 36, zIndex: getWorldDepth(strangerPos.y, 1) }}><div className="relative"><div className="atlas-shadow" /><span className="atlas-sprite-idle block"><EntitySprite type="stranger" turn animationKey={`stranger_${region.id}_${game.currentSectorId}`} size={44} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" /></span>{nearStranger && !inCombat && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-900 bg-fuchsia-300 rounded-full px-1.5 py-0.5 font-bold animate-bounce shadow">?</span>}</div>{(!hudClean || nearStranger) && <span className="text-[9px] text-fuchsia-200 bg-slate-900/70 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">Desconocido</span>}</div>)}
          {(game.shrines || []).filter(s => s.revealed).map(s => (<ShrineMarker key={s.id} shrine={s} near={nearShrine === s.id} compact={hudClean} />))}
          {world.boss && !bossState.current.defeated && (<div ref={bossEl} className="absolute flex flex-col items-center atlas-world-entity" style={{ left: world.boss.x - 28, top: world.boss.y - 42, zIndex: missionNavTarget?.targetId === world.boss.monster.id ? 9998 : getWorldDepth(world.boss.y, 2) }}><div className="relative"><div className="atlas-shadow" />{missionNavTarget?.targetId === world.boss.monster.id && <span className="absolute -inset-3 rounded-full border-2 border-amber-300 animate-pulse" style={{ boxShadow: "0 0 20px 8px rgba(251,191,36,.45)" }} />}<span className="atlas-sprite-idle block relative z-10"><EntitySprite type="boss" variant={world.boss.monster.id} turn animationKey={world.boss.monster.id} size={56} className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]" /></span></div><span className="text-[9px] text-red-300 bg-red-950/70 px-1.5 py-0.5 rounded mt-0.5">JEFE</span></div>)}
          {enemyList.map((e, i) => { if (e.defeated) return null; const isTarget = missionNavTarget?.targetId === e.id; return (<span key={e.id} ref={el => enemyEls.current[i] = el} className="absolute atlas-world-entity" style={{ left: 0, top: 0, zIndex: isTarget ? 9998 : getWorldDepth(e.y, 2), willChange: "transform" }}><div className="relative flex flex-col items-center">{isTarget && <span className="absolute -inset-2 rounded-full border-2 border-amber-300 animate-pulse" style={{ boxShadow: "0 0 14px 5px rgba(251,191,36,.4)" }} />}<div className="atlas-shadow" /><span className="relative z-10"><EntitySprite type="monster" variant={e.monster.id} moving size={34} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" /></span></div></span>); })}
          {world.portals && world.portals.filter(p => p.to.nextRegion).map((p, i) => { if (!(game.canTravelNextRegion && regionIndex < 2)) return null; return (<div key={i} className="absolute flex flex-col items-center animate-pulse" style={{ left: p.x - 20, top: p.y - 24, zIndex: getWorldDepth(p.y, 2) }}><GIcon name="globe" size={36} />{!hudClean && <span className="text-[8px] text-fuchsia-300 whitespace-nowrap">Siguiente región</span>}</div>); })}
          {(() => { const d = getDungeonForSector(region.id, game.currentSectorId); if (!d) return null; const e = getValidDungeonEntrance(d, world); const guardian = getDungeonEntranceNpc(d); return (<div className="absolute flex flex-col items-center atlas-world-entity" style={{ left: e.x - 20, top: e.y - 42, zIndex: getWorldDepth(e.y, 1) }}><div className="relative"><div className="atlas-shadow" />{nearDungeon && !inCombat && <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse z-10" style={{ boxShadow: "0 0 8px 3px rgba(251,191,36,0.7)" }} />}<span className="atlas-sprite-idle block relative z-10">{guardian && <EntitySprite type={guardian.sprite.type} variant={guardian.sprite.variant} turn animationKey={guardian.id || guardian.name} size={40} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />}</span></div>{(!hudClean || nearDungeon) && <span className={`text-[8px] mt-0.5 px-1.5 py-0.5 rounded whitespace-nowrap ${nearDungeon ? "bg-amber-300 text-slate-900 font-bold" : "bg-slate-900/70 text-amber-200"}`}>{guardian?.name || "Guardián"}</span>}</div>); })()}
          {recruitCampPos && (<div className="absolute flex flex-col items-center atlas-world-entity" style={{ left: recruitCampPos.x - 26, top: recruitCampPos.y - 30, zIndex: getWorldDepth(recruitCampPos.y, 1) }}><div className="flex items-end gap-0.5"><div className="w-7 h-7 rounded-sm bg-amber-700 border-2 border-amber-300 flex items-center justify-center" style={{ boxShadow: "0 0 10px 3px rgba(217,119,6,0.4)" }}><span className="text-amber-100 text-sm">⛺</span></div></div><div className="flex gap-0.5 mt-0.5">{recruitsList.slice(0, 3).map((r, i) => (<span key={r.id} className="w-2 h-2 rounded-full" style={{ background: i === 0 ? "#f87171" : i === 1 ? "#38bdf8" : "#a78bfa" }} />))}</div>{(!hudClean || nearRecruits) && <span className={`text-[8px] mt-0.5 px-1.5 py-0.5 rounded whitespace-nowrap ${nearRecruits ? "bg-amber-300 text-slate-900 font-bold" : "bg-slate-900/70 text-amber-200"}`}>Aventureros</span>}</div>)}
          <div ref={playerRef} className="absolute flex flex-col items-center atlas-world-entity atlas-grounded-player" style={{ left: 0, top: 0, zIndex: getWorldDepth(pos.current.y, 1), willChange: "transform" }}><div className="relative"><div ref={playerShadowRef} className="atlas-shadow atlas-player-contact-shadow" /><canvas ref={playerCanvasRef} width={36} height={48} style={{ imageRendering: "pixelated" }} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" /></div><div className="w-9 h-1.5 rounded-full bg-slate-900/60 mt-0.5 overflow-hidden mx-auto"><div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${hpPct}%` }} /></div></div>
        </div>
        <div className="atlas-fog z-10" style={{ background: `radial-gradient(circle at 30% 40%, ${ground.fog}, transparent 60%), radial-gradient(circle at 70% 60%, ${ground.fog}, transparent 55%)` }} />
        <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(circle at center, transparent 55%, rgba(0,0,0,0.45))" }} />
        <DayNightOverlay phase={game.dayPhase} />
        <BiomeAmbience biome={world.biome} />
        {!inCombat && !paused && (
          <ExploreHudV3
            navWrapRef={navWrapRef}
            navIconRef={navIconRef}
            navLabelRef={navLabelRef}
            navDistRef={navDistRef}
            sectorName={game.sectorName}
            region={region}
            player={player}
            threat={game.threat}
            settings={settings}
            onUpdateSettings={game.onUpdateSettings}
            onRequestOrientation={game.onRequestOrientation}
            showHudDetails={showHudDetails}
            onToggleHudDetails={() => setShowHudDetails(v => !v)}
            onPause={() => setPaused(true)}
            onOpenExploreMap={() => setShowExploreMap(true)}
            onOpenSectorMap={() => setShowSectorMap(true)}
            onOpenJournal={() => setShowJournal(true)}
            onSwitchBoard={() => game.onSwitchMode("board")}
            proxHint={proxHint}
            separated={separated}
            renderSeparatedControls={false}
            activeControlProfile={activeControlProfile}
            controlScale={cScale}
            joystickKey={joystickKey}
            onMove={(x, y) => { dir.current.x = x; dir.current.y = y; }}
            runToggle={runToggle}
            onToggleRun={toggleRun}
            onOpenHub={onB}
            onAction={onA}
            actionReady={actionReady}
            leftHanded={leftHanded}
          />
        )}
        {flavorMsg && (<div className="atlas-flavor-message absolute top-28 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-[88%] w-[340px]"><div className="rounded-xl bg-slate-950/90 border border-amber-600/60 backdrop-blur px-3.5 py-2.5 shadow-lg atlas-toast-in"><p className="text-xs text-amber-100 italic text-center leading-snug">{flavorMsg}</p></div></div>)}
        {paused && !inCombat && (
          <PauseMenuV3
            settings={settings}
            onUpdateSettings={game.onUpdateSettings}
            onRequestOrientation={game.onRequestOrientation}
            onResume={() => setPaused(false)}
            onOpenExploreMap={() => { setPaused(false); setShowExploreMap(true); }}
            onSwitchBoard={() => game.onSwitchMode("board")}
            onOpenSheet={game.onOpenSheet}
            onOpenSettings={game.onOpenSettings}
            onAbandon={game.onReset}
          />
        )}
        {strangerDialog && !inCombat && (<div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4"><div className="rounded-2xl bg-slate-900 border border-fuchsia-800 p-6 max-w-sm w-full text-center"><div className="flex justify-center mb-3"><GIcon name="user" size={40} style={{ color: "#e9d5ff" }} /></div><p className="text-sm text-fuchsia-100 italic mb-4">«He estado siguiéndote. Atlas conoce tu nombre. Ven conmigo.»</p><div className="flex gap-2"><button onClick={() => { game.onStrangerMeet?.(); strangerUsed.current = true; setStrangerDialog(false); setNearStranger(false); }} className="flex-1 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 py-2.5 text-sm font-medium text-white">Aceptar</button><button onClick={() => setStrangerDialog(false)} className="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-sm text-slate-200">Ignorar</button></div></div></div>)}
        {inCombat && (<div className="atlas-combat-overlay absolute inset-0 z-40 flex flex-col bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4"><div className="w-full max-w-3xl mx-auto flex-1 min-h-0"><CombatView player={player} enemy={game.enemy} region={region} lastResult={game.lastResult} onAttack={game.onAttack} onSkill={game.onSkill} onItem={game.onItem} onEscape={game.onEscape} onEnemyDead={game.onEnemyDead} busy={game.busy} skills={game.skills} skillCosts={game.skillCosts} playerStatuses={game.playerStatuses} /></div></div>)}
      </div>
      {separated && !inCombat && !paused && (
        <ExploreSeparatedControlsV3
          leftHanded={leftHanded}
          joystickKey={joystickKey}
          controlScale={cScale}
          onMove={(x, y) => { dir.current.x = x; dir.current.y = y; }}
          runToggle={runToggle}
          onToggleRun={toggleRun}
          onOpenHub={onB}
          onAction={onA}
          actionReady={actionReady}
          proxHint={proxHint}
        />
      )}
      {showHub && (<PlayerHub player={player} region={region} missions={game.missions} missionDefs={game.missionDefs} settings={game.settings} onUpdateSettings={game.onUpdateSettings} onUseConsumable={game.onUseConsumable} onEquipWeapon={game.onEquipWeapon} onEquipArmor={game.onEquipArmor} onEquipHelmet={game.onEquipHelmet} onEquipAccessory={game.onEquipAccessory} onSellWeapon={game.onSellWeapon} onSellArmor={game.onSellArmor} onSellHelmet={game.onSellHelmet} onSellAccessory={game.onSellAccessory} onSellMaterial={game.onSellMaterial} onEquipClassWeapon={game.onEquipClassWeapon} onSellClassWeapon={game.onSellClassWeapon} onClose={() => setShowHub(false)} />)}
      {showExploreMap && (<ExplorationMap discovered={game.discoveredBlocks || new Set()} currentRegion={game.regionIndex} currentBlock={game.blockIndex} defeatedBosses={game.defeatedBosses} game={game} exploreBlocks={game.exploreBlocks} playerPos={pos.current} playerDir={facingRef.current} lastShrine={game.lastShrine} onClose={() => setShowExploreMap(false)} />)}
      {showSectorMap && (<SectorMapModal region={region} regionIndex={regionIndex} col={game.blockIndex} row={game.sectorRow} visitedSectors={game.visitedSectors} unlockedSectors={game.unlockedSectors} bossDefeated={bossDefeated} onClose={() => setShowSectorMap(false)} />)}
      {showJournal && (<MissionJournal missions={game.missions} missionDefs={game.missionDefs} region={region} priorityMissionId={game.priorityMissionId} onSetActive={game.setMissionActive} onSetPriority={game.setPriorityMission} onClose={() => setShowJournal(false)} />)}
      {resting && (<RestSequence label={resting.label} onComplete={() => { game.onRestAt?.(resting.sector); setResting(null); }} />)}
      {npcMenu && (<NpcInteractionMenu npc={npcMenu.npc} actions={npcMenu.actions} onSelect={(action) => executeNpcAction(action, npcMenu.npc)} onClose={() => setNpcMenu(null)} />)}
      {showRecruits && recruitsList.length > 0 && (<RecruitDialog recruits={recruitsList} companion={game.companion} playerGold={player.gold} onHire={(r) => { game.hireAdventurer?.(r); }} onDismiss={() => game.dismissCompanion?.()} onClose={() => setShowRecruits(false)} />)}
      {showDungeonEntry && dungeonHere && dungeonEntryNpc && dungeonAccess.unlocked && (<DungeonEntryDialog npc={dungeonEntryNpc} dungeon={dungeonHere} isFirstTime={dungeonFirstTime} hasCompanion={!!game.companion} canHire={recruitsList.length > 0} onAsk={() => game.onDungeonAsk?.(dungeonHere.id)} onEnter={() => { setShowDungeonEntry(false); game.enterDungeon?.(dungeonHere.id); }} onHire={() => setShowRecruits(true)} onClose={() => setShowDungeonEntry(false)} />)}
      {game.showSmith && (<BlacksmithModal player={player} tier={game.smithTier} worldFlags={game.worldFlags} onCraft={game.onCraftWeapon} onUpgrade={game.onUpgradeWeapon} onEquip={game.onEquipClassWeapon} onRepair={game.onRepairEquipment} onRestoreRelic={game.onRestoreGreenRelic} onClose={game.onCloseSmith} />)}
    </div>
  );
}
