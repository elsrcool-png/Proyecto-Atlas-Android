// Proyecto Atlas — Viaje entre regiones (santuarios-portales y avance automático).
// Validación completa del destino antes de mutar el estado: región, sector,
// santuario y mapa destino. Fallback al santuario de origen si el mapa destino
// no carga. Evita la pantalla blanca al cruzar de región.
import { useState } from "react";
import { REGIONS } from "@/lib/atlasData";
import {
  getSanctuaryById,
  getSanctuariesForRegion,
  getSafeSanctuarySpawn,
  canTravelToSanctuary,
  getRegionIndex as sanctuaryRegionIndex,
} from "@/lib/atlasSanctuaries";
import { coordsFromSectorId, getStartingCoords, getInitialUnlockedSectorKeys } from "@/lib/atlasRegionSectors";
import { resolveRegionEntryMissions, initMissionsFromDefs } from "@/lib/atlasRegionMissions";
import { deriveUnlockedSectorKeys } from "@/lib/atlasMissionUnlocks";
import { generateMissions } from "@/lib/atlasMissions";

// Resuelve el mundo canónico destino leyendo del ref de mapas canónicos.
// No depende del estado de React, así que se puede validar ANTES de viajar.
export function resolveCanonicalWorld(canonicalMaps, regionId, sectorId) {
  if (!canonicalMaps) return null;
  const idx = sanctuaryRegionIndex(regionId);
  const coords = coordsFromSectorId(sectorId);
  if (idx == null || idx < 0 || idx >= REGIONS.length || !coords) return null;
  return coords.row === 1
    ? (canonicalMaps.blocks[idx]?.[coords.col] || null)
    : (canonicalMaps.wilds[idx]?.[`${coords.col}_${coords.row}`] || null);
}

const startSectorOf = (regionId) => (getInitialUnlockedSectorKeys(regionId)[0] || "").split(":")[1] || "A1";

export default function useAtlasRegionTravel(ctx) {
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState(null);

  const travelToSanctuary = (sanctuaryId) => {
    const check = canTravelToSanctuary({ enemy: ctx.enemy, diceAnim: ctx.diceAnim, npcDialog: ctx.npcDialog, showIntro: ctx.showIntro });
    if (!check.ok) { ctx.toast(check.reason, "info"); return; }
    // 1. Validar regionId, sectorId y sanctuaryId destino
    const sanctuary = getSanctuaryById(sanctuaryId);
    if (!sanctuary) { ctx.toast("Santuario no encontrado", "info"); return; }
    const regionUnlocked = sanctuary.regionId === "verde" || ctx.unlockedRegionsRef.current.has(sanctuary.regionId) || ctx.worldFlagsRef.current[`${sanctuary.regionId}:unlocked`];
    if (!regionUnlocked) { ctx.toast("Esa región aún no ha sido desbloqueada", "info"); return; }
    if (!ctx.unlockedSanctuaries.has(sanctuaryId)) { ctx.toast("Ese portal aún no ha sido descubierto", "info"); return; }
    const targetRegionIndex = sanctuaryRegionIndex(sanctuary.regionId);
    const targetCoords = coordsFromSectorId(sanctuary.sectorId);
    if (targetRegionIndex == null || !targetCoords) { ctx.toast("No se pudo cargar la región", "info"); return; }
    // 2. Cargar primero la definición del mapa destino
    const targetWorld = resolveCanonicalWorld(ctx.canonicalMapsRef.current, sanctuary.regionId, sanctuary.sectorId);
    // 3. Confirmar que world no sea null
    if (!targetWorld) { ctx.toast("No se pudo cargar la región", "info"); return; }
    // 5. Spawn seguro validado contra el mundo DESTINO (no el actual)
    const safeSpawn = getSafeSanctuarySpawn(sanctuary.regionId, sanctuary.sectorId, sanctuary.id, targetWorld);
    const spawnPos = safeSpawn ? { x: safeSpawn.x, y: safeSpawn.y } : { x: sanctuary.spawnX, y: sanctuary.spawnY };
    const isCrossRegion = targetRegionIndex !== ctx.regionIndex;
    setRegionLoading(true); setRegionError(null);
    // Al cruzar de región, guarda las misiones actuales y resuelve la destino
    if (isCrossRegion && ctx.region.id && ctx.missionsRef.current) {
      ctx.missionsByRegionRef.current = { ...ctx.missionsByRegionRef.current, [ctx.region.id]: ctx.missionsRef.current };
    }
    let entryMissions = null;
    if (isCrossRegion) {
      entryMissions = resolveRegionEntryMissions(sanctuary.regionId, ctx.missionsByRegionRef.current);
      if (entryMissions) ctx.missionsByRegionRef.current = { ...ctx.missionsByRegionRef.current, [sanctuary.regionId]: entryMissions.missions };
    }
    if (isCrossRegion && entryMissions) {
      ctx.missionsRef.current = entryMissions.missions;
      ctx.setMissions(entryMissions.missions);
      ctx.setPriorityMissionId(entryMissions.firstId || null);
    }
    // 4. Actualizar región y sector en una sola transición. El acceso de la
    // región destino se reconstruye desde sus misiones, no se reinicia ni se
    // abre mediante datos de prueba.
    if (isCrossRegion) {
      ctx.setRegionIndex(targetRegionIndex);
      const targetRegion = REGIONS[targetRegionIndex];
      const targetDefs = generateMissions(targetRegion);
      const targetMissions = entryMissions?.missions || initMissionsFromDefs(targetDefs);
      ctx.setUnlockedSectors(new Set(deriveUnlockedSectorKeys(sanctuary.regionId, targetDefs, targetMissions)));
    }
    if (targetCoords.col !== ctx.blockIndex) ctx.setBlockIndex(targetCoords.col);
    ctx.setSectorRow(targetCoords.row);
    ctx.setRespawnPos(spawnPos);
    ctx.lastShrineRef.current = { regionIndex: targetRegionIndex, blockIndex: targetCoords.col, sectorRow: targetCoords.row, x: spawnPos.x, y: spawnPos.y, sanctuaryId };
    ctx.setLastShrine(ctx.lastShrineRef.current);
    ctx.lastActivatedSanctuaryIdRef.current = sanctuaryId;
    ctx.setLastActivatedSanctuaryId(sanctuaryId);
    // 6. Cerrar el menú del portal
    ctx.setShrineModal(null);
    // Viajar por portal sin descansar no reduce la Amenaza (regla 1).
    if (entryMissions?.isFirstVisit && entryMissions.def) {
      ctx.toast(`Misión iniciada: ${entryMissions.def.name}`, "mission");
      ctx.pushLog(`▶ ${entryMissions.def.name} — ${entryMissions.def.desc}`);
      ctx.setShowIntro(true);
    }
    ctx.pushLog(`Viajas por el Portal de Invocación hasta ${sanctuary.destinationName}.`);
    ctx.toast(`Viaje rápido: ${sanctuary.destinationName}`, "info");
    // 7. Quitar el loading overlay al terminar
    setRegionLoading(false);
    // 8. Guardar solo después de que el mapa cargue correctamente
    setTimeout(() => ctx.persistSession({ regionIndex: targetRegionIndex, blockIndex: targetCoords.col, sectorRow: targetCoords.row, lastActivatedSanctuaryId: sanctuaryId, lastRegionId: sanctuary.regionId, lastSectorId: sanctuary.sectorId, missionsByRegion: ctx.missionsByRegionRef.current }), 60);
  };

  const advanceToNextRegion = () => {
    const next = ctx.regionIndex + 1;
    if (next >= REGIONS.length) return;
    const nr = REGIONS[next];
    const campSanctuary = getSanctuariesForRegion(nr.id).find(s => s.settlementType === "campamento") || getSanctuariesForRegion(nr.id)[0] || null;
    const sCoords = campSanctuary ? coordsFromSectorId(campSanctuary.sectorId) : getStartingCoords(nr.id);
    if (!sCoords) { ctx.toast("No se pudo cargar la región", "info"); return; }
    const sectorIdForWorld = campSanctuary?.sectorId || startSectorOf(nr.id);
    // 2 & 3. Cargar y validar el mapa destino antes de mutar
    const targetWorld = resolveCanonicalWorld(ctx.canonicalMapsRef.current, nr.id, sectorIdForWorld);
    if (!targetWorld) { ctx.toast("No se pudo cargar la región", "info"); return; }
    setRegionLoading(true); setRegionError(null);
    const nextFlags = { ...ctx.worldFlagsRef.current, [`${ctx.region.id}:completed`]: true, [`${nr.id}:unlocked`]: true };
    ctx.worldFlagsRef.current = nextFlags; ctx.setWorldFlags(nextFlags);
    const nextRegions = new Set(ctx.unlockedRegionsRef.current); nextRegions.add(nr.id);
    ctx.unlockedRegionsRef.current = nextRegions; ctx.setUnlockedRegions(nextRegions);
    const newActivated = new Set(ctx.activatedSanctuariesRef.current);
    const newUnlocked = new Set(ctx.unlockedSanctuaries);
    if (campSanctuary) { newActivated.add(campSanctuary.id); newUnlocked.add(campSanctuary.id); }
    ctx.activatedSanctuariesRef.current = newActivated; ctx.setActivatedSanctuaries(newActivated);
    ctx.setUnlockedSanctuaries(newUnlocked);
    ctx.lastActivatedSanctuaryIdRef.current = campSanctuary?.id || null; ctx.setLastActivatedSanctuaryId(campSanctuary?.id || null);
    ctx.setRegionIndex(next); ctx.setBlockIndex(sCoords.col); ctx.setSectorRow(sCoords.row);
    ctx.setThreat(0); ctx.setEnemy(null); ctx.setPendingMoves(0); ctx.setBonusMove(false); ctx.setLastResult(null);
    ctx.setOpenedChests(new Set()); ctx.setDefeatedEnemyIds(new Set()); ctx.setVisitedSectors(new Set()); ctx.setNpcDialog(null);
    if (ctx.region.id && ctx.missionsRef.current) {
      ctx.missionsByRegionRef.current = { ...ctx.missionsByRegionRef.current, [ctx.region.id]: ctx.missionsRef.current };
    }
    const entry = resolveRegionEntryMissions(nr.id, ctx.missionsByRegionRef.current);
    const nextRegionMissions = entry ? entry.missions : initMissionsFromDefs(generateMissions(nr));
    const nextFirstId = entry?.firstId || null;
    if (entry) ctx.missionsByRegionRef.current = { ...ctx.missionsByRegionRef.current, [nr.id]: nextRegionMissions };
    ctx.missionsRef.current = nextRegionMissions; ctx.setMissions(nextRegionMissions); ctx.setPriorityMissionId(nextFirstId || null);
    const nextRegionUnlocks = deriveUnlockedSectorKeys(nr.id, generateMissions(nr), nextRegionMissions);
    ctx.setUnlockedSectors(new Set(nextRegionUnlocks));
    if (entry?.isFirstVisit && entry.def) {
      ctx.toast(`Misión iniciada: ${entry.def.name}`, "mission");
      ctx.pushLog(`▶ ${entry.def.name} — ${entry.def.desc}`);
      ctx.setShowIntro(true);
    }
    if (campSanctuary) {
      ctx.setRespawnPos({ x: campSanctuary.spawnX, y: campSanctuary.spawnY });
      ctx.lastShrineRef.current = { regionIndex: next, blockIndex: sCoords.col, sectorRow: sCoords.row, x: campSanctuary.spawnX, y: campSanctuary.spawnY, sanctuaryId: campSanctuary.id };
      ctx.setLastShrine(ctx.lastShrineRef.current);
    }
    ctx.setPlayer(p => p ? { ...p, hp: p.maxHp, mp: p.maxMp || 0, potions: Math.max(p.potions || 0, 3) } : p);
    ctx.pushLog(`✦ ¡${ctx.region.name} completada! Atlas abre el camino hacia ${nr.name}. ${nr.subtitle}`);
    ctx.toast(`Nueva región desbloqueada: ${nr.name}`, "boss");
    setRegionLoading(false);
    ctx.persistSession({
      regionIndex: next, blockIndex: sCoords.col, sectorRow: sCoords.row, threat: 0,
      missions: nextRegionMissions, openedChests: [], defeatedEnemyIds: [], visitedSectors: [],
      priorityMissionId: nextFirstId || null, unlockedSectors: nextRegionUnlocks, worldFlags: nextFlags,
      activatedSanctuaries: [...newActivated], unlockedSanctuaries: [...newUnlocked], lastActivatedSanctuaryId: campSanctuary?.id || null,
      unlockedRegions: [...nextRegions], lastRegionId: nr.id, lastSectorId: campSanctuary?.sectorId || "A2",
      missionsByRegion: ctx.missionsByRegionRef.current,
    });
  };

  // Desbloquea la siguiente región sin transportar al jugador:
  // marca la actual como completada, desbloquea la siguiente, añade su
  // santuario-campamento al menú de viaje del portal, activa su misión
  // inicial como disponible y guarda. El jugador permanece en su santuario
  // o mapa actual y viaja después desde un Portal de Invocación.
  const unlockNextRegion = () => {
    const next = ctx.regionIndex + 1;
    if (next >= REGIONS.length) return;
    const nr = REGIONS[next];
    const campSanctuary = getSanctuariesForRegion(nr.id).find(s => s.settlementType === "campamento") || getSanctuariesForRegion(nr.id)[0] || null;
    const nextFlags = { ...ctx.worldFlagsRef.current, [`${ctx.region.id}:completed`]: true, [`${nr.id}:unlocked`]: true };
    ctx.worldFlagsRef.current = nextFlags; ctx.setWorldFlags(nextFlags);
    const nextRegions = new Set(ctx.unlockedRegionsRef.current); nextRegions.add(nr.id);
    ctx.unlockedRegionsRef.current = nextRegions; ctx.setUnlockedRegions(nextRegions);
    const newActivated = new Set(ctx.activatedSanctuariesRef.current);
    const newUnlocked = new Set(ctx.unlockedSanctuaries);
    if (campSanctuary) { newActivated.add(campSanctuary.id); newUnlocked.add(campSanctuary.id); }
    ctx.activatedSanctuariesRef.current = newActivated; ctx.setActivatedSanctuaries(newActivated);
    ctx.setUnlockedSanctuaries(newUnlocked);
    if (ctx.region.id && ctx.missionsRef.current) {
      ctx.missionsByRegionRef.current = { ...ctx.missionsByRegionRef.current, [ctx.region.id]: ctx.missionsRef.current };
    }
    const entry = resolveRegionEntryMissions(nr.id, ctx.missionsByRegionRef.current);
    const nextRegionMissions = entry ? entry.missions : initMissionsFromDefs(generateMissions(nr));
    if (entry) ctx.missionsByRegionRef.current = { ...ctx.missionsByRegionRef.current, [nr.id]: nextRegionMissions };
    ctx.pushLog(`✦ ¡${ctx.region.name} completada! ${nr.name} espera al otro lado de un Portal de Invocación.`);
    ctx.toast(`Región ${nr.name} desbloqueada`, "boss");
    ctx.persistSession({
      worldFlags: nextFlags,
      unlockedRegions: [...nextRegions],
      activatedSanctuaries: [...newActivated],
      unlockedSanctuaries: [...newUnlocked],
      missionsByRegion: ctx.missionsByRegionRef.current,
    });
  };

  const travelNextRegion = () => {
    if (!ctx.bossDefeated) { ctx.toast("Derrota al jefe regional antes de viajar.", "info"); return; }
    if (ctx.regionIndex >= REGIONS.length - 1) return;
    advanceToNextRegion();
  };

  return { travelToSanctuary, advanceToNextRegion, travelNextRegion, unlockNextRegion, regionLoading, regionError };
}