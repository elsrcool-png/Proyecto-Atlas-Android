// PROYECTO ATLAS — Ajustes de interfaz móvil, orientación y accesibilidad.
import { defaultControlProfiles, normalizeControlProfiles } from "@/lib/atlasControlLayout";

const KEY = "atlas_settings";
const DEFAULT = {
  // Atlas se diseña primero para horizontal. Si el navegador no permite
  // bloquear la pantalla, la interfaz conserva un fallback vertical legible.
  orientation: "horizontal",
  controlLayout: "integrated",
  handedness: "right",
  controlSize: "normal",
  controls: "auto",
  hudDensity: "clean",
  layoutVersion: 20,
  debugTargets: false,
  controlProfiles: defaultControlProfiles("right"),
  hapticsEnabled: true,
  hapticIntensity: 0.75,

  // Audio v1.0. Valores normalizados 0..1 para mezcla móvil.
  audioEnabled: true,
  masterVolume: 0.8,
  musicVolume: 0.55,
  ambienceVolume: 0.45,
  sfxVolume: 0.8,
};

export function defaultSettings() {
  return { ...DEFAULT, controlProfiles: defaultControlProfiles(DEFAULT.handedness) };
}

export function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
    // Las instalaciones anteriores usaban orientación automática. La primera
    // carga de v2.13 migra una sola vez al diseño horizontal limpio; después
    // se respeta cualquier cambio manual del jugador.
    const migrated = Number(stored.layoutVersion || 0) < DEFAULT.layoutVersion
      ? { ...stored, orientation: "horizontal", hudDensity: "clean", layoutVersion: DEFAULT.layoutVersion }
      : stored;
    const next = { ...DEFAULT, ...migrated };
    next.controlProfiles = normalizeControlProfiles(next.controlProfiles, next.handedness);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    return next;
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function applyOrientationPreference(mode = "auto") {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.atlasOrientation = mode;
}

// Debe llamarse desde un gesto del usuario para que Chrome Android permita
// pantalla completa y bloqueo de orientación. Siempre devuelve un resultado,
// nunca rompe la sesión si el navegador no soporta la API.
export async function requestPreferredOrientation(mode = "auto") {
  applyOrientationPreference(mode);
  if (typeof window === "undefined") return { ok: false, reason: "unavailable" };

  const orientation = window.screen?.orientation;
  if (mode === "auto") {
    try { orientation?.unlock?.(); } catch {}
    return { ok: true, mode: "auto" };
  }

  const target = mode === "horizontal" ? "landscape" : "portrait";
  if (!orientation?.lock) return { ok: false, mode, reason: "unsupported" };

  try {
    await orientation.lock(target);
    return { ok: true, mode };
  } catch (firstError) {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
      await orientation.lock(target);
      return { ok: true, mode, fullscreen: !!document.fullscreenElement };
    } catch (secondError) {
      return {
        ok: false,
        mode,
        reason: secondError?.name || firstError?.name || "lock_failed",
      };
    }
  }
}
