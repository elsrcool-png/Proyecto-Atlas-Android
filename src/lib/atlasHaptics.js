// PROYECTO ATLAS — Respuesta háptica móvil centralizada.
// Usa navigator.vibrate cuando está disponible y falla en silencio en PC/iOS web.
const PATTERNS = Object.freeze({
  ui: 8,
  uiStrong: 14,
  hit: 14,
  heavy: 24,
  critical: [18, 28, 30],
  status: [10, 18, 10],
  paralyzed: [12, 22, 12],
  portal: [12, 20, 18],
});

let enabled = true;
let intensity = 1;
let lastAt = 0;

export function configureAtlasHaptics(settings = {}) {
  enabled = settings.hapticsEnabled !== false;
  intensity = Math.max(0.35, Math.min(1.5, Number(settings.hapticIntensity ?? 0.75)));
}

function scaledPattern(pattern) {
  if (Array.isArray(pattern)) return pattern.map((value, index) => index % 2 === 0 ? Math.max(1, Math.round(value * intensity)) : value);
  return Math.max(1, Math.round(Number(pattern || 0) * intensity));
}

export function atlasVibrate(kind = "ui", options = {}) {
  if (!enabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  const now = Date.now();
  const minGap = Number(options.minGap ?? (kind === "ui" ? 28 : 16));
  if (!options.force && now - lastAt < minGap) return false;
  lastAt = now;
  try {
    return !!navigator.vibrate(scaledPattern(PATTERNS[kind] || kind || PATTERNS.ui));
  } catch {
    return false;
  }
}

export function stopAtlasVibration() {
  try { navigator?.vibrate?.(0); } catch {}
}

export { PATTERNS as ATLAS_HAPTIC_PATTERNS };
