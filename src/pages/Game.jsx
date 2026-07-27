import React, { useState, useEffect, useRef } from "react";
import { REGIONS } from "@/lib/atlasData";
import { SECTOR_NEED } from "@/lib/atlasMissions";
import useAtlasSession from "@/hooks/useAtlasSession";
import MainMenu from "@/components/atlas/MainMenu";
import CharacterSelect from "@/components/atlas/CharacterSelect";
import CharacterPanel from "@/components/atlas/CharacterPanel";
import RhombusMap from "@/components/atlas/RhombusMap";
import ActionLog from "@/components/atlas/ActionLog";
import CombatView from "@/components/atlas/CombatView";
import DiceRoll from "@/components/atlas/DiceRoll";
import RegionBackdrop from "@/components/atlas/RegionBackdrop";
import NPCDialog from "@/components/atlas/NPCDialog";
import LevelUpModal from "@/components/atlas/LevelUpModal";
import CharacterSheet from "@/components/atlas/CharacterSheet";
import BackpackModal from "@/components/atlas/BackpackModal";
import ExploreMode from "@/components/atlas/ExploreMode";
import DungeonView from "@/components/atlas/DungeonView";
import ChestRewardModal from "@/components/atlas/ChestRewardModal";
import ShopModal from "@/components/atlas/ShopModal";
import FlavorDialog from "@/components/atlas/FlavorDialog";
import LootRewardModal from "@/components/atlas/LootRewardModal";
import DestinyEventModal from "@/components/atlas/DestinyEventModal";
import EquipmentModal from "@/components/atlas/EquipmentModal";
import BossIntroModal from "@/components/atlas/BossIntroModal";
import FeedbackToasts from "@/components/atlas/FeedbackToasts";
import { GIcon } from "@/lib/atlasIcons";
import { Moon, Trophy, Skull, RotateCcw, MapPin, MessageCircle, Star, Compass, Dices, ShoppingBag, Backpack, Settings as SettingsIcon, Map as MapIcon } from "lucide-react";
import SettingsModal from "@/components/atlas/SettingsModal";
import ShrineModal from "@/components/atlas/ShrineModal";
import ShrineNotify from "@/components/atlas/ShrineNotify";
import IntroNarrative from "@/components/atlas/IntroNarrative";
import { loadSettings, saveSettings, defaultSettings, applyOrientationPreference, requestPreferredOrientation } from "@/lib/atlasSettings";
import { pickLoreLine } from "@/lib/atlasLore";
import { threatNpcWarning } from "@/lib/atlasThreatExpansion";
import useDayNight from "@/hooks/useDayNight";
import useAtlasAudio from "@/hooks/useAtlasAudio";
import CombatAudioIntro from "@/components/atlas/CombatAudioIntro";
import DayNightOverlay from "@/components/atlas/DayNightOverlay";
import { listSlots, loadSlot, deleteSlot, migrateLegacySave, setActiveSaveSlot } from "@/lib/atlasSave";
import SaveSlotsModal from "@/components/atlas/SaveSlotsModal";
import { sectorIdFromCoords, getSectorDef } from "@/lib/atlasRegionSectors";
import { generateMissions } from "@/lib/atlasMissions";

const NPC_KEYS = ["campamento", "pueblo", "ciudad"];

export default function Game() {
  const board = useAtlasSession();
  const libre = useAtlasSession();
  const [mode, setMode] = useState(null);
  const [settings, setSettings] = useState(() => loadSettings());
  const [showSettings, setShowSettings] = useState(false);
  const updateSettings = (next) => { setSettings(next); saveSettings(next); applyOrientationPreference(next.orientation); };
  const requestOrientation = (mode) => requestPreferredOrientation(mode);
  const activatePreferredOrientation = () => {
    if (settings.orientation === "horizontal") requestPreferredOrientation("horizontal");
  };
  useEffect(() => { applyOrientationPreference(settings.orientation); }, [settings.orientation]);

  // Audio unificado: observa la sesión activa y usa el director de combate
  // como reloj para no adelantarse a las animaciones.
  const audioSession = mode === "board" ? board : libre;
  const audio = useAtlasAudio({
    mode,
    player: audioSession.player,
    region: audioSession.region,
    sectorDef: audioSession.sectorDef,
    enemy: audioSession.enemy,
    lastResult: audioSession.lastResult,
    diceAnim: audioSession.diceAnim,
    settings,
    skills: audioSession.skills,
  });

  const { phase: dayPhase, advance: advanceTime, dayCount } = useDayNight();
  const prevDayRef = useRef(dayCount);
  useEffect(() => {
    if (dayCount === prevDayRef.current) return;
    prevDayRef.current = dayCount;
    if (mode === "libre" && libre.player) libre.respawnDaily();
    else if (mode === "board" && board.player) board.respawnDaily();
  }, [dayCount]);
  const [discovered, setDiscovered] = useState(() => new Set(["0:0"]));
  const [slotList, setSlotList] = useState(() => listSlots());
  const [menuView, setMenuView] = useState(null); // null | "slots_new" | "slots_load"
  const [pendingNewSlot, setPendingNewSlot] = useState(null); // ranura elegida para nueva partida (falta elegir modo)
  const refreshSlots = () => setSlotList(listSlots());
  useEffect(() => { migrateLegacySave(); refreshSlots(); }, []);

  // Resúmenes enriquecidos para el modal de ranuras.
  const slotSummaries = React.useMemo(() => slotList.map((save) => {
    if (!save) return null;
    const regionId = save.lastRegionId || REGIONS[save.regionIndex]?.id || "verde";
    const secName = (() => { try { return getSectorDef(regionId, sectorIdFromCoords(save.blockIndex || 0, save.sectorRow || 0))?.name; } catch (e) { return null; } })();
    let missionName = null;
    try {
      const defs = generateMissions(REGIONS[save.regionIndex] || REGIONS[0]);
      const all = [...(defs.campamento || []), ...(defs.pueblo || []), ...(defs.ciudad || [])];
      const pid = save.priorityMissionId;
      const def = pid ? all.find(d => d.id === pid) : all.find(d => save.missions?.[d.id]?.active && save.missions?.[d.id]?.status !== "done");
      missionName = def?.name || (save.missions ? Object.keys(save.missions).filter(id => save.missions[id]?.status !== "done").length + " pendientes" : "—");
    } catch (e) { missionName = "—"; }
    return { ...save, lastRegionId: regionId, lastSectorName: secName, priorityMissionName: missionName };
  }), [slotList]);

  const hasAnySave = slotList.some(s => s);

  useEffect(() => {
    if (mode !== "libre" || !libre.player) return;
    const key = `${libre.regionIndex}:${libre.blockIndex}`;
    setDiscovered(prev => (prev.has(key) ? prev : new Set([...prev, key])));
  }, [mode, libre.player, libre.regionIndex, libre.blockIndex]);

  const handleLoadSlot = (n) => {
    activatePreferredOrientation();
    const save = loadSlot(n);
    if (!save) return;
    setActiveSaveSlot(n);
    libre.resume(save, n);
    refreshSlots();
    setMenuView(null);
    setMode("libre");
  };
  const handleDeleteSlot = (n) => { deleteSlot(n); refreshSlots(); };
  const handlePickNewSlot = (n) => { setPendingNewSlot(n); setMenuView(null); };
  const handleChooseMode = (m) => {
    activatePreferredOrientation();
    setMode(m);
    // pendingNewSlot se consumirá en el onSelect de CharacterSelect.
  };

  if (mode === null && pendingNewSlot != null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-sky-300 mb-2">Elige el modo de juego</h2>
          <p className="text-slate-400 text-sm mb-6">Espacio {pendingNewSlot} seleccionado para la nueva partida.</p>
          <div className="space-y-3">
            <button onClick={() => handleChooseMode("board")} className="w-full max-w-xs mx-auto flex items-center gap-3 justify-center rounded-xl bg-sky-600 hover:bg-sky-500 py-4 px-8 font-semibold text-white transition">
              <MapIcon className="w-5 h-5" /> Modo Tablero
            </button>
            <button onClick={() => handleChooseMode("libre")} className="w-full max-w-xs mx-auto flex items-center gap-3 justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-4 px-8 font-semibold text-white transition">
              <Compass className="w-5 h-5" /> Modo Libre
            </button>
            <button onClick={() => setPendingNewSlot(null)} className="text-xs text-slate-400 hover:text-slate-200">‹ Volver a las ranuras</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === null) return (
    <>
      <MainMenu
        onNewGame={() => { refreshSlots(); setMenuView("slots_new"); }}
        onLoadGame={() => { refreshSlots(); setMenuView("slots_load"); }}
        onOpenSettings={() => setShowSettings(true)}
        hasAnySave={hasAnySave}
      />
      {menuView && (
        <SaveSlotsModal
          mode={menuView === "slots_new" ? "new" : "load"}
          slots={slotSummaries}
          onPick={menuView === "slots_new" ? handlePickNewSlot : handleLoadSlot}
          onDelete={handleDeleteSlot}
          onClose={() => setMenuView(null)}
        />
      )}
      {showSettings && <SettingsModal settings={settings} onChange={updateSettings} onRequestOrientation={requestOrientation} onReset={() => updateSettings(defaultSettings())} onClose={() => setShowSettings(false)} />}
    </>
  );

  const s = mode === "board" ? board : libre;
  if (!s.player) return <CharacterSelect onSelect={(c) => { activatePreferredOrientation(); s.start(c, pendingNewSlot); setPendingNewSlot(null); }} />;

  const region = s.region;
  const snpc = s.activeSettlementNpc;
  const snpcMissions = snpc ? (s.missionDefs[snpc.sector] || []).filter(d => d.role === snpc.role).map(d => ({ def: d, state: s.missions[d.id], lockReason: s.getMissionLockReason(d.id) })) : [];
  const snpcIntro = snpc && snpc.role === "main" ? `${region.name}: ${Math.round(s.regionProgress * 100)}% completado. ${s.bossUnlocked ? "El jefe te espera al final del bloque 3." : "Completa más misiones para desbloquear al jefe."}` : null;
  const snpcLore = snpc && snpc.role === "main" ? pickLoreLine() : null;

  const exploreGame = {
    player: s.player, region, regionIndex: s.regionIndex, blockIndex: s.blockIndex, dayPhase, discoveredBlocks: discovered, missions: s.missions,
    defeatedBosses: s.defeatedBosses, bossDefeated: s.bossDefeated, bossUnlocked: s.bossUnlocked, missionDefs: s.missionDefs,
    enemy: s.enemy, lastResult: s.lastResult, busy: s.combatBusy || audio.combatIntroActive,
    onAttack: s.handleAttack, onEscape: s.handleEscape, onEnemyDead: s.onEnemyDead,
    onStartCombat: (monster) => (monster?.boss ? s.startBossWithIntro(monster) : s.startCombat(monster)), onOpenNpc: s.talkToNpc,
    onOpenSheet: () => s.setShowSheet(true), onOpenBackpack: () => s.setShowBackpack(true),
    onRest: s.onRest, onOpenShop: s.onOpenShop, onAdvanceTime: advanceTime,
    threat: s.threat, onStartCombatThreat: s.onStartCombatThreat, onThreatEvent: s.onThreatEvent,
    onExploreThreat: s.onExploreThreat, onIdleThreat: s.onIdleThreat, onStrangerMeet: s.onStrangerMeet,
    onSwitchMode: (m) => setMode(m), onTravelNextRegion: s.travelNextRegion, onReset: s.reset,
    onTravelSector: s.onTravelSector, canTravelNorth: s.canTravelNorth, canTravelSouth: s.canTravelSouth,
    canTravelEast: s.canTravelEast, canTravelWest: s.canTravelWest,
    hasTravelNorth: s.hasTravelNorth, hasTravelSouth: s.hasTravelSouth, hasTravelEast: s.hasTravelEast, hasTravelWest: s.hasTravelWest,
    sectorName: s.sectorName, sectorRow: s.sectorRow, visitedSectors: s.visitedSectors, unlockedSectors: s.unlockedSectors,
    currentSectorId: s.currentSectorId, sectorDef: s.sectorDef,
    pushLog: s.pushLog, rollDice: s.rollDice,
    openChest: s.openChest, openedChests: s.openedChests, defeatedEnemyIds: s.defeatedEnemyIds,
    exploreWorld: s.exploreWorld, markEnemyDefeated: s.markEnemyDefeated,
    onHeal: s.onHeal, onChestDrop: s.onChestDrop, onReachObjective: s.onReachObjective, onTravelNextBlock: s.onTravelNextBlock,
    companion: s.player?.companion || null, hireAdventurer: s.hireAdventurer, dismissCompanion: s.dismissCompanion,
    onSkill: s.onSkill, onItem: s.onItem, skills: s.skills, skillCosts: s.skillCosts,
    onRestAt: s.onRestAt, onOpenSettlementNpc: s.onOpenSettlementNpc, onOpenFlavor: s.onOpenFlavor,
    onOpenEquipment: () => s.setShowEquipment(true),
    settings, onOpenSettings: () => setShowSettings(true),
    onUseConsumable: s.useConsumable,
    onEquipWeapon: s.equipWeapon, onEquipArmor: s.equipArmor, onEquipAccessory: s.equipAccessory,
    onSellWeapon: s.sellWeapon, onSellArmor: s.sellArmor, onSellAccessory: s.sellAccessory, onSellMaterial: s.sellMaterial,
    onEquipClassWeapon: s.equipClassWeapon, onSellClassWeapon: s.sellClassWeapon,
    onOpenSmith: s.openSmith, onCloseSmith: () => s.setShowSmith(false), onCraftWeapon: s.craftWeapon, onUpgradeWeapon: s.upgradeWeapon, showSmith: s.showSmith,
    smithTier: s.smithTier, onRepairEquipment: s.repairEquipment, onRestoreGreenRelic: s.restoreGreenRelic, worldFlags: s.worldFlags,
    onUpdateSettings: updateSettings,
    shrines: s.shrines, onShrineCheck: s.onShrineCheck, onOpenShrine: s.onOpenShrine, onActivateShrine: s.onActivateShrine,
    activatedSanctuaries: s.activatedSanctuaries, unlockedSanctuaries: s.unlockedSanctuaries, unlockedRegions: s.unlockedRegions,
    lastActivatedSanctuaryId: s.lastActivatedSanctuaryId, travelToSanctuary: s.travelToSanctuary, regionLoading: s.regionLoading, regionError: s.regionError,
    respawnPos: s.respawnPos, consumeRespawn: s.consumeRespawn, lastShrine: s.lastShrine,
    exploreBlocks: s.exploreBlocks, priorityMissionId: s.priorityMissionId,
    setMissionActive: s.setMissionActive, setPriorityMission: s.setPriorityMission,
    onTalkNpc: s.onTalkNpc,
    onStoryPoint: s.onStoryPoint,
    inDungeon: s.inDungeon, currentDungeon: s.currentDungeon, enterDungeon: s.enterDungeon, exitDungeon: s.exitDungeon,
    activeStoryPointIds: s.activeStoryPointIds,
    getMissionLockReason: s.getMissionLockReason,
    playerStatuses: s.playerStatuses,
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[15] atlas-scanlines" aria-hidden />
      <CombatAudioIntro intro={audio.combatIntro} />
      {s.showIntro && <IntroNarrative onDone={s.dismissIntro} />}
      {mode === "board" ? (
        <div className="min-h-screen text-slate-100 px-4 py-6 relative">
          <RegionBackdrop region={region} />
          <DayNightOverlay phase={dayPhase} />
          <div className="max-w-6xl mx-auto relative z-10">
            <header className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: region.theme.accent }}>Región {s.regionIndex + 1}/{REGIONS.length}</p>
                <h1 className="text-2xl font-heading tracking-tight">{region.name}</h1>
                <p className="text-xs text-slate-400">{region.subtitle}</p>
                <p className="text-[11px] text-slate-500">Bloque {s.blockIndex + 1}/3 · {s.block.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">{s.nodeLabel}</p>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => setMode("libre")} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition">
                    <Compass className="w-3.5 h-3.5" /> Modo Libre
                  </button>
                  <button onClick={() => setShowSettings(true)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
                    <SettingsIcon className="w-3.5 h-3.5" /> Ajustes
                  </button>
                  <button onClick={s.reset} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition">
                    <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
                  </button>
                </div>
              </div>
            </header>

            <div className="flex flex-wrap gap-2 mb-4">
              {NPC_KEYS.map(k => {
                const list = s.missionDefs[k] || [];
                const dn = list.filter(d => s.missions[d.id]?.status === "done").length;
                const need = SECTOR_NEED[k];
                const met = dn >= need;
                const label = k === "campamento" ? "Campamento" : k === "pueblo" ? "Pueblo" : "Ciudad";
                return <span key={k} className={`text-[11px] px-2.5 py-1 rounded-full text-white ${met ? "bg-emerald-600" : "bg-slate-700"}`}>{label}: {dn}/{list.length} (meta {need})</span>;
              })}
              <span className={`text-[11px] px-2.5 py-1 rounded-full text-white ${s.bossUnlocked ? "bg-fuchsia-600" : "bg-slate-800 text-slate-400"}`}>Jefe: {s.bossUnlocked ? "desbloqueado" : `${Math.round(s.regionProgress * 100)}%`}</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-5">
              <div className="space-y-5">
                {s.enemy ? (
                  <CombatView player={s.player} enemy={s.enemy} region={region} lastResult={s.lastResult} onAttack={s.handleAttack} onSkill={s.onSkill} onItem={s.onItem} onEscape={s.handleEscape} onEnemyDead={s.onEnemyDead} busy={s.combatBusy || audio.combatIntroActive} skills={s.skills} skillCosts={s.skillCosts} playerStatuses={s.playerStatuses} />
                ) : (
                  <RhombusMap region={region} map={s.map} current={s.location} onNodeClick={s.handleNodeClick} disabled={!s.showReachable || s.ended} defeatedBosses={s.defeatedBosses} player={s.player} />
                )}
                {!s.enemy && !s.ended && (
                  <div className="flex flex-wrap gap-3 items-center">
                    {s.canRoll && (
                      <button onClick={s.handleTravelRoll} className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-3 font-medium transition"><Dices className="w-4 h-4" /> Lanzar d12</button>
                    )}
                    {s.canRoll && s.node.safe && (
                      <button onClick={s.rest} className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 font-medium transition"><Moon className="w-4 h-4" /> Descansar</button>
                    )}
                    {s.canRoll && s.node.safe && (
                      <button onClick={() => s.setShowShop(true)} className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-3 font-medium transition"><ShoppingBag className="w-4 h-4" /> Tienda</button>
                    )}
                    {s.canRoll && s.npcKey && (
                      <button onClick={() => s.talkToNpc(s.npcKey)} className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-3 font-medium transition"><MessageCircle className="w-4 h-4" /> Hablar con {region.npcs[s.npcKey].name}</button>
                    )}
                    {s.canRoll && (
                      <button onClick={() => s.setShowBackpack(true)} className="flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 px-5 py-3 font-medium transition"><Backpack className="w-4 h-4" /> Mochila</button>
                    )}
                    {s.player.statPoints > 0 && (
                      <button onClick={() => s.setShowLevelUp(true)} className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-3 font-medium text-slate-900 transition"><Star className="w-4 h-4" /> Subir nivel ({s.player.statPoints})</button>
                    )}
                    {s.pendingMoves > 0 && (
                      <p className="text-sm text-emerald-400 font-medium">Selecciona un nodo verde{s.pendingMoves === 2 ? " (hasta 2 nodos)" : ""}.</p>
                    )}
                    {s.bonusMove && (
                      <>
                        <button onClick={s.skipBonus} className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-3 font-medium transition"><MapPin className="w-4 h-4" /> Quedarse aquí</button>
                        <p className="text-sm text-amber-400">Avanza o quédate.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-5">
                <CharacterPanel player={s.player} threat={s.threat} onOpenSheet={() => s.setShowSheet(true)} bossAlive={s.bossAlive} regionIndex={s.regionIndex} />
                <ActionLog entries={s.log} />
              </div>
            </div>
          </div>
        </div>
      ) : s.inDungeon ? (
        <DungeonView dungeon={s.currentDungeon} player={s.player} region={s.region} regionIndex={s.regionIndex} companion={s.player?.companion || null} onExit={s.exitDungeon} onDescend={s.descendDungeon} onOpenChest={s.openChest} onStoryPoint={s.onStoryPoint} onPlayerDamage={s.onDungeonPlayerDamage} onSpendEnergy={s.onDungeonSpendEnergy} onEnemyKilled={s.onDungeonEnemyKilled} onUseConsumable={s.useConsumable} onCompanionUpdate={s.onCompanionUpdate} onWeaponWear={s.damageWeapon} enemy={s.enemy} lastResult={s.lastResult} onAttack={s.handleAttack} onSkill={s.onSkill} onItem={s.onItem} onEscape={s.handleEscape} onEnemyDead={s.onEnemyDead} worldSkills={s.skills} worldSkillCosts={s.skillCosts} playerStatuses={s.playerStatuses} combatBusy={s.combatBusy || audio.combatIntroActive} onStartBossCombat={s.startDungeonBossCombat} onActivateFinalSanctuary={() => { audio.playPortal(); s.activateDungeonFinalSanctuary(); }} bossDefeated={s.dungeonBossDefeated} />
      ) : (
        <ExploreMode game={exploreGame} />
      )}

      {s.diceAnim && <DiceRoll diceResult={s.diceAnim.diceResult} label={s.diceAnim.label} isEnemy={!!s.diceAnim.isEnemy} onComplete={s.onDiceComplete} />}
      {s.npcDialog && (
        <NPCDialog
          npc={region.npcs[s.npcDialog]}
          sectorMissions={(s.missionDefs[s.npcDialog] || []).map(d => ({ def: d, state: s.missions[d.id], lockReason: s.getMissionLockReason(d.id) }))}
          threat={s.threat}
          threatWarning={threatNpcWarning(s.threat)}
          onActivate={s.activateMission}
          onClaim={s.claimMission}
          onClose={() => s.setNpcDialog(null)}
        />
      )}
      {snpc && (
        <NPCDialog
          npc={snpc}
          sectorMissions={snpcMissions}
          threat={s.threat}
          threatWarning={threatNpcWarning(s.threat)}
          intro={snpcIntro}
          lore={snpcLore}
          onActivate={s.activateMission}
          onClaim={s.claimMission}
          onClose={s.closeSettlementNpc}
        />
      )}
      {s.flavorDialog && (<FlavorDialog data={s.flavorDialog} onClose={s.closeFlavor} />)}
      {s.lootReward && (<LootRewardModal data={s.lootReward} onClose={s.closeLootReward} />)}
      {s.destinyEvent && (<DestinyEventModal data={s.destinyEvent} onClose={s.closeDestinyEvent} />)}
      {s.showEquipment && (
        <EquipmentModal
          player={s.player}
          onEquipWeapon={s.equipWeapon} onEquipArmor={s.equipArmor} onEquipAccessory={s.equipAccessory}
          onEquipClassWeapon={s.equipClassWeapon}
          onSellClassWeapon={s.sellClassWeapon}
          onSellWeapon={s.sellWeapon} onSellArmor={s.sellArmor} onSellAccessory={s.sellAccessory} onSellMaterial={s.sellMaterial}
          onClose={() => s.setShowEquipment(false)}
        />
      )}
      {s.bossIntro && (<BossIntroModal canon={s.bossIntro} onClose={s.dismissBossIntro} />)}
      {s.showLevelUp && s.player.statPoints > 0 && (<LevelUpModal onChoose={s.allocateStat} onClose={() => s.setShowLevelUp(false)} />)}
      {s.showSheet && (<CharacterSheet player={s.player} missionsDone={Object.values(s.missions).filter(m => m.status === "done").length} onEquip={s.equipAccessory} onClose={() => s.setShowSheet(false)} />)}
      {s.showBackpack && (<BackpackModal player={s.player} onEquip={s.equipAccessory} onSell={s.sellAccessory} onDiscard={s.discardAccessory} onUseConsumable={s.useConsumable} onClose={() => s.setShowBackpack(false)} />)}
      {s.chestReward && (<ChestRewardModal reward={s.chestReward} onClose={s.closeChestReward} />)}
      {s.showShop && (<ShopModal player={s.player} onBuy={s.buyPotion} onBuyEquipment={s.buyEquipment} onSellWeapon={s.sellWeapon} onSellArmor={s.sellArmor} onSellAccessory={s.sellAccessory} onSellMaterial={s.sellMaterial} tier={s.shopTier} regionId={s.region.id} worldFlags={s.worldFlags} onClose={() => s.setShowShop(false)} />)}
      <FeedbackToasts toasts={s.enemy ? [] : s.toasts} compact={(settings.hudDensity || "clean") === "clean"} />
      {showSettings && <SettingsModal settings={settings} onChange={updateSettings} onRequestOrientation={requestOrientation} onReset={() => updateSettings(defaultSettings())} onClose={() => setShowSettings(false)} />}
      {s.shrineModal && <ShrineModal data={s.shrineModal} onActivate={() => { audio.playPortal(); s.onActivateShrine(s.shrineModal.id); }} onClose={s.closeShrine} onTravel={(id) => { audio.playPortal(); s.travelToSanctuary(id); }} onRest={s.restAtSanctuary} activatedSanctuaries={s.activatedSanctuaries} unlockedSanctuaries={s.unlockedSanctuaries} unlockedRegions={s.unlockedRegions} lastActivatedSanctuaryId={s.lastActivatedSanctuaryId} />}
      <ShrineNotify data={s.enemy ? null : s.shrineNotify} onDone={s.consumeShrineNotify} />
      {s.status === "downed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur px-4">
          <div className="rounded-2xl bg-slate-900 border border-teal-700 p-8 max-w-sm w-full text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
                <span className="absolute rounded-full animate-pulse" style={{ width: 64, height: 64, background: "radial-gradient(circle, rgba(94,234,212,0.5), transparent 70%)" }} />
                <span className="absolute rounded-full border-2 border-teal-400" style={{ width: 46, height: 46 }} />
                <span className="relative font-display text-lg text-teal-300">✦</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-teal-200">Atlas intercede</h2>
            <p className="text-slate-400 text-sm mb-6">Tu viaje no termina aquí. Atlas te devuelve al último santuario, pero el mundo recuerda tu caída: pierdes parte de tu oro y la amenaza aumenta.</p>
            <button onClick={s.respawnAtShrine} className="w-full rounded-xl bg-teal-600 hover:bg-teal-500 py-3 font-medium text-slate-900 transition">Volver al santuario</button>
          </div>
        </div>
      )}
      {s.ended && (s.status === "victory" || s.status === "defeat") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 max-w-sm w-full text-center">
            <div className="mb-4 flex justify-center"><GIcon name={s.status === "victory" ? "trophy" : "skull"} size={56} /></div>
            {s.status === "victory" ? (
              <>
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2"><Trophy className="w-6 h-6 text-amber-400" /> Victoria</h2>
                <p className="text-slate-400 text-sm mb-6">Has completado las 3 regiones y derrotado a todos los jefes. ¡Atlas es libre!</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2"><Skull className="w-6 h-6 text-rose-400" /> Derrota</h2>
                <p className="text-slate-400 text-sm mb-6">Tu vida llegó a 0. Atlas espera otra expedición.</p>
              </>
            )}
            <button onClick={s.reset} className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3 font-medium transition">Nueva partida</button>
          </div>
        </div>
      )}
    </>
  );
}