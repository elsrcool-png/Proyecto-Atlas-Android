// Persistencia de la aventura — Sistema de 3 ranuras independientes.
// Cada ranura usa su propia clave de guardado y una copia de respaldo.
// El guardado automático escribe únicamente en la ranura activa.
const SLOT_KEYS = ["atlas_save_slot_1", "atlas_save_slot_2", "atlas_save_slot_3"];
const BACKUP_KEYS = ["atlas_save_slot_1_bak", "atlas_save_slot_2_bak", "atlas_save_slot_3_bak"];
const ACTIVE_KEY = "atlas_save_active_slot";
const LEGACY_MIGRATED_KEY = "atlas_save_legacy_migrated";
const LEGACY_KEYS = ["atlas_adventure_save_v4", "atlas_adventure_save_v3", "atlas_adventure_save_v2", "atlas_adventure_save_v1"];


const VISUAL_DEFAULTS_V5 = Object.freeze({
  Humano: { raceBase: "humano_neutral_v1", profileId: "appearance_humano_brown_tousled_v1" },
  Elfo: { raceBase: "elfo_neutral_v1", profileId: "appearance_elfo_blonde_v1" },
  Enano: { raceBase: "enano_neutral_v1", profileId: "appearance_enano_copper_beard_v1" },
});

function migrateSaveV6(save) {
  if (!save?.player) return save;
  const base = VISUAL_DEFAULTS_V5[save.player.race] || VISUAL_DEFAULTS_V5.Humano;
  const withAppearance = save.player.appearance?.version >= 1
    ? save.player
    : { ...save.player, appearance: { version: 1, ...base, cosmetic: null } };
  const player = {
    ...withAppearance,
    weaponUpgrades: withAppearance.weaponUpgrades || {},
    armorUpgrades: withAppearance.armorUpgrades || {},
    helmetUpgrades: withAppearance.helmetUpgrades || {},
  };
  return { ...save, saveVersion: Math.max(6, Number(save.saveVersion) || 0), player };
}

let activeSaveSlot = null; // 1..3 o null

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

// Escritura segura: conserva una copia de respaldo antes de reemplazar.
function safeWrite(key, backupKey, json) {
  try {
    const prev = localStorage.getItem(key);
    if (prev) localStorage.setItem(backupKey, prev);
    localStorage.setItem(key, json);
    return true;
  } catch (e) { return false; }
}

// Valida que el contenido tenga la estructura mínima de una partida jugable.
function isValidSave(parsed) {
  return parsed && typeof parsed === "object" && parsed.player && typeof parsed.player === "object";
}

export function saveToSlot(n, data) {
  const slot = clampSlot(n);
  if (!slot) return false;
  const payload = JSON.stringify(migrateSaveV6({ saveVersion: 6, savedAt: Date.now(), ...data }));
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
      // Contenido corrupto: intentar recuperar desde el respaldo.
      const bak = localStorage.getItem(BACKUP_KEYS[slot - 1]);
      if (bak) { const bp = JSON.parse(bak); if (isValidSave(bp)) return migrateSaveV6(bp); }
      return null;
    }
    return migrateSaveV6(parsed);
  } catch (e) {
    try {
      const bak = localStorage.getItem(BACKUP_KEYS[slot - 1]);
      if (bak) { const bp = JSON.parse(bak); if (isValidSave(bp)) return migrateSaveV6(bp); }
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

export function listSlots() {
  return [1, 2, 3].map((n) => loadSlot(n));
}

// Migración del guardado antiguo único: copia al Espacio 1 si está vacío.
// No elimina el guardado antiguo hasta confirmar que la copia funcionó.
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
        // Confirmar la migración leyendo la ranura recién escrita.
        const verified = ok && !!loadSlot(1);
        if (verified) {
          localStorage.setItem(LEGACY_MIGRATED_KEY, "1");
          return true; // migrado al Espacio 1; el original se conserva.
        }
        return false;
      }
      // El Espacio 1 ya estaba ocupado: marcamos la migración como hecha sin copiar.
      localStorage.setItem(LEGACY_MIGRATED_KEY, "1");
      return false;
    }
    localStorage.setItem(LEGACY_MIGRATED_KEY, "1");
  } catch (e) { }
  return false;
}

// ── API retrocompatible usada por useAtlasSession ──
// Toda escritura automática va a la ranura activa (si existe).
export async function saveAdventure(data) {
  const n = getActiveSaveSlot();
  if (!n) return; // sin ranura activa: no escribe nada (evita pérdida de datos).
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
  // Se mantiene la ranura activa: la nueva partida sobrescribirá el mismo espacio.
}