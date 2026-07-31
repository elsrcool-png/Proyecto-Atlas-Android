// Persistencia de la aventura — Sistema de 3 ranuras independientes.
// Esquema v8: arquitectura regional v7 + Gremio, Maestrías y misiones especiales persistentes.

import { ATLAS_REGION_REGISTRY, normalizeRegionId } from "@/lib/atlasRegionRegistry";
import { normalizePostRegion3State, syncPlayerMasteryLoadout } from "@/lib/atlasPostRegion3Progression";

const SLOT_KEYS = ["atlas_save_slot_1", "atlas_save_slot_2", "atlas_save_slot_3"];
const BACKUP_KEYS = ["atlas_save_slot_1_bak", "atlas_save_slot_2_bak", "atlas_save_slot_3_bak"];
const ACTIVE_KEY = "atlas_save_active_slot";
const LEGACY_MIGRATED_KEY = "atlas_save_legacy_migrated";
const LEGACY_KEYS = ["atlas_adventure_save_v4", "atlas_adventure_save_v3", "atlas_adventure_save_v2", "atlas_adventure_save_v1"];
const LEGACY_RUNTIME_REGION_IDS = ["verde", "fria", "desierto"];

export const ATLAS_SAVE_VERSION = 8;

const VISUAL_DEFAULTS_V5 = Object.freeze({
  Humano: { raceBase: "humano_neutral_v1", profileId: "appearance_humano_brown_tousled_v1" },
  Elfo: { raceBase: "elfo_neutral_v1", profileId: "appearance_elfo_blonde_v1" },
  Enano: { raceBase: "enano_neutral_v1", profileId: "appearance_enano_copper_beard_v1" },
});

const uniqueStrings = (value) => [...new Set((Array.isArray(value) ? value : []).filter((item) => typeof item === "string" && item.length))];

function migratePlayerV6(player) {
  if (!player || typeof player !== "object") return player;
  const base = VISUAL_DEFAULTS_V5[player.race] || VISUAL_DEFAULTS_V5.Humano;
  const withAppearance = player.appearance?.version >= 1
    ? player
    : { ...player, appearance: { version: 1, ...base, cosmetic: null } };
  return {
    ...withAppearance,
    weaponUpgrades: withAppearance.weaponUpgrades || {},
    armorUpgrades: withAppearance.armorUpgrades || {},
    helmetUpgrades: withAppearance.helmetUpgrades || {},
  };
}

function legacySectorId(save) {
  if (typeof save?.lastSectorId === "string" && save.lastSectorId) return save.lastSectorId;
  if (typeof save?.currentNodeId === "string" && save.currentNodeId) return save.currentNodeId;
  const col = Number(save?.blockIndex);
  const row = Number(save?.sectorRow);
  if (Number.isInteger(col) && col >= 0 && col <= 2 && Number.isInteger(row) && row >= 0 && row <= 2) {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  }
  return "A1";
}

function legacyRegionId(save) {
  const explicit = normalizeRegionId(save?.worldState?.currentRegionId ?? save?.lastRegionId ?? save?.currentRegionId);
  if (explicit) return explicit;
  const index = Number(save?.regionIndex);
  return normalizeRegionId(LEGACY_RUNTIME_REGION_IDS[Number.isInteger(index) ? index : 0], "verde");
}

function visitedNodesByRegion(save) {
  const byRegion = {};
  for (const raw of uniqueStrings(save?.visitedSectors)) {
    const match = /^(\d+):(\d+):(\d+)$/.exec(raw);
    if (!match) continue;
    const regionId = LEGACY_RUNTIME_REGION_IDS[Number(match[1])];
    const col = Number(match[2]);
    const row = Number(match[3]);
    if (!regionId || col < 0 || col > 2 || row < 0 || row > 2) continue;
    const nodeId = `${String.fromCharCode(65 + col)}${row + 1}`;
    if (!byRegion[regionId]) byRegion[regionId] = [];
    byRegion[regionId].push(nodeId);
  }
  return byRegion;
}

function unlockedNodesByRegion(save) {
  const byRegion = {};
  for (const raw of uniqueStrings(save?.unlockedSectors)) {
    const splitAt = raw.indexOf(":");
    if (splitAt <= 0) continue;
    const regionId = normalizeRegionId(raw.slice(0, splitAt));
    const nodeId = raw.slice(splitAt + 1);
    if (!regionId || !nodeId) continue;
    if (!byRegion[regionId]) byRegion[regionId] = [];
    byRegion[regionId].push(nodeId);
  }
  return byRegion;
}

function buildRegionStates(save, currentRegionId) {
  const previous = save?.regionStates && typeof save.regionStates === "object" ? save.regionStates : {};
  const flags = save?.worldFlags && typeof save.worldFlags === "object" ? save.worldFlags : {};
  const visited = visitedNodesByRegion(save);
  const unlockedNodes = unlockedNodesByRegion(save);
  const unlockedRegions = new Set(uniqueStrings(save?.unlockedRegions).map((id) => normalizeRegionId(id)).filter(Boolean));
  unlockedRegions.add(currentRegionId);

  const result = {};
  for (const definition of ATLAS_REGION_REGISTRY) {
    const id = definition.id;
    const old = previous[id] && typeof previous[id] === "object" ? previous[id] : {};
    const completed = Boolean(
      old.status === "LIBERATED"
      || old.status === "POST_LIBERATION"
      || flags[`${id}:completed`]
      || flags[`${id}:restored`]
      || flags[`${id}:boss_defeated`],
    );
    const unlocked = completed || unlockedRegions.has(id) || Boolean(flags[`${id}:unlocked`]);
    const status = completed
      ? (old.status === "POST_LIBERATION" ? "POST_LIBERATION" : "LIBERATED")
      : unlocked
        ? (["DISCOVERED", "CORRUPTED", "BOSS_AVAILABLE", "RING_BROKEN"].includes(old.status) ? old.status : "CORRUPTED")
        : "LOCKED";
    const regionalFlags = Object.fromEntries(Object.entries(flags).filter(([key]) => key.startsWith(`${id}:`)));

    result[id] = {
      status,
      discoveredNodeIds: uniqueStrings([...(old.discoveredNodeIds || []), ...(visited[id] || [])]),
      unlockedNodeIds: uniqueStrings([...(old.unlockedNodeIds || []), ...(unlockedNodes[id] || [])]),
      completedBoss: Boolean(old.completedBoss || flags[`${id}:boss_defeated`] || completed),
      flags: { ...(old.flags || {}), ...regionalFlags },
    };
  }
  return result;
}

export function migrateSaveV8(input) {
  if (!input || typeof input !== "object") return input;
  const sourceVersion = Number(input.saveVersion ?? input.schemaVersion) || 0;
  const currentRegionId = legacyRegionId(input);
  const currentNodeId = input?.worldState?.currentNodeId || legacySectorId(input);
  const unlockedRegionIds = uniqueStrings([
    ...(input?.worldState?.unlockedRegionIds || []),
    ...(input.unlockedRegions || []),
    currentRegionId,
  ].map((id) => normalizeRegionId(id)).filter(Boolean));
  const globalFlags = {
    ...((input?.worldState?.globalFlags && typeof input.worldState.globalFlags === "object") ? input.worldState.globalFlags : {}),
    ...((input.worldFlags && typeof input.worldFlags === "object") ? input.worldFlags : {}),
  };
  const regionStates = buildRegionStates({ ...input, unlockedRegions: unlockedRegionIds, worldFlags: globalFlags }, currentRegionId);
  const dailyState = {
    dayIndex: Number(input?.dailyState?.dayIndex ?? input.dayCount ?? 0) || 0,
    globalSanctuaryUseDay: input?.dailyState?.globalSanctuaryUseDay ?? input.globalSanctuaryUseDay ?? null,
    flags: { ...((input?.dailyState?.flags && typeof input.dailyState.flags === "object") ? input.dailyState.flags : {}) },
  };
  const progressionState = normalizePostRegion3State(input.progressionState, {
    worldFlags: globalFlags,
    defeatedBossIds: input.defeatedBosses || [],
  });
  const migratedPlayer = syncPlayerMasteryLoadout(migratePlayerV6(input.player), progressionState);

  return {
    ...input,
    saveVersion: ATLAS_SAVE_VERSION,
    schemaVersion: ATLAS_SAVE_VERSION,
    migratedFromVersion: sourceVersion < ATLAS_SAVE_VERSION ? sourceVersion : (input.migratedFromVersion ?? null),
    player: migratedPlayer,
    lastRegionId: currentRegionId,
    lastSectorId: currentNodeId,
    currentRegionId,
    currentNodeId,
    unlockedRegions: unlockedRegionIds,
    worldFlags: globalFlags,
    worldState: {
      ...((input.worldState && typeof input.worldState === "object") ? input.worldState : {}),
      schemaVersion: 1,
      currentRegionId,
      currentNodeId,
      unlockedRegionIds,
      globalFlags,
    },
    regionStates,
    dailyState,
    progressionState,
    compatibility: {
      legacyRegionIndex: Number.isInteger(Number(input.regionIndex)) ? Number(input.regionIndex) : 0,
      legacyBlockIndex: Number.isInteger(Number(input.blockIndex)) ? Number(input.blockIndex) : 0,
      legacySectorRow: Number.isInteger(Number(input.sectorRow)) ? Number(input.sectorRow) : 0,
      ...((input.compatibility && typeof input.compatibility === "object") ? input.compatibility : {}),
    },
  };
}

export function migrateSaveV7(input) { return migrateSaveV8(input); }
export const migrateSave = migrateSaveV8;

let activeSaveSlot = null;

function clampSlot(n) { const i = Number(n); return i >= 1 && i <= 3 ? i : null; }

export function getActiveSaveSlot() {
  if (activeSaveSlot != null) return activeSaveSlot;
  try {
    const s = clampSlot(parseInt(localStorage.getItem(ACTIVE_KEY), 10));
    if (s) { activeSaveSlot = s; return s; }
  } catch (e) { }
  return null;
}

export function setActiveSaveSlot(n) {
  activeSaveSlot = clampSlot(n);
  try {
    if (activeSaveSlot != null) localStorage.setItem(ACTIVE_KEY, String(activeSaveSlot));
    else localStorage.removeItem(ACTIVE_KEY);
  } catch (e) { }
}

export function clearActiveSaveSlot() {
  activeSaveSlot = null;
  try { localStorage.removeItem(ACTIVE_KEY); } catch (e) { }
}

function safeWrite(key, backupKey, json) {
  try {
    const prev = localStorage.getItem(key);
    if (prev) localStorage.setItem(backupKey, prev);
    localStorage.setItem(key, json);
    return true;
  } catch (e) { return false; }
}

function isValidSave(parsed) {
  return parsed && typeof parsed === "object" && parsed.player && typeof parsed.player === "object";
}

export function saveToSlot(n, data) {
  const slot = clampSlot(n);
  if (!slot) return false;
  const payload = JSON.stringify(migrateSaveV8({ savedAt: Date.now(), ...data, saveVersion: ATLAS_SAVE_VERSION }));
  return safeWrite(SLOT_KEYS[slot - 1], BACKUP_KEYS[slot - 1], payload);
}

export function loadSlot(n) {
  const slot = clampSlot(n);
  if (!slot) return null;
  try {
    const raw = localStorage.getItem(SLOT_KEYS[slot - 1]);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidSave(parsed)) {
      const bak = localStorage.getItem(BACKUP_KEYS[slot - 1]);
      if (bak) { const bp = JSON.parse(bak); if (isValidSave(bp)) return migrateSaveV8(bp); }
      return null;
    }
    return migrateSaveV8(parsed);
  } catch (e) {
    try {
      const bak = localStorage.getItem(BACKUP_KEYS[slot - 1]);
      if (bak) { const bp = JSON.parse(bak); if (isValidSave(bp)) return migrateSaveV8(bp); }
    } catch (e2) { }
    return null;
  }
}

export function deleteSlot(n) {
  const slot = clampSlot(n);
  if (!slot) return;
  try { localStorage.removeItem(SLOT_KEYS[slot - 1]); localStorage.removeItem(BACKUP_KEYS[slot - 1]); } catch (e) { }
}

export function isSlotOccupied(n) { return !!loadSlot(n); }
export function listSlots() { return [1, 2, 3].map((n) => loadSlot(n)); }

export function migrateLegacySave() {
  try {
    if (localStorage.getItem(LEGACY_MIGRATED_KEY)) return false;
    for (const k of LEGACY_KEYS) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch (e) { continue; }
      if (!isValidSave(parsed)) continue;
      if (!loadSlot(1)) {
        const ok = saveToSlot(1, parsed);
        const verified = ok && !!loadSlot(1);
        if (verified) {
          localStorage.setItem(LEGACY_MIGRATED_KEY, "1");
          return true;
        }
        return false;
      }
      localStorage.setItem(LEGACY_MIGRATED_KEY, "1");
      return false;
    }
    localStorage.setItem(LEGACY_MIGRATED_KEY, "1");
  } catch (e) { }
  return false;
}

export async function saveAdventure(data) {
  const n = getActiveSaveSlot();
  if (!n) return;
  saveToSlot(n, data);
}

export async function loadAdventure() {
  const n = getActiveSaveSlot();
  if (!n) return null;
  return loadSlot(n);
}

export async function clearAdventure() {
  const n = getActiveSaveSlot();
  if (!n) return;
  deleteSlot(n);
}
