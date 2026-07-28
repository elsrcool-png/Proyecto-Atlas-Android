// PROYECTO ATLAS — Posiciones normalizadas de controles móviles v2.20.
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));

const RIGHT_PORTRAIT = {
  joystick: { x: 0.16, y: 0.82, scale: 1, opacity: 0.9 },
  run: { x: 0.67, y: 0.86, scale: 1, opacity: 0.88 },
  b: { x: 0.80, y: 0.84, scale: 1, opacity: 0.9 },
  a: { x: 0.91, y: 0.76, scale: 1, opacity: 0.94 },
};
const RIGHT_LANDSCAPE = {
  joystick: { x: 0.10, y: 0.73, scale: 0.9, opacity: 0.88 },
  run: { x: 0.78, y: 0.82, scale: 0.88, opacity: 0.86 },
  b: { x: 0.87, y: 0.79, scale: 0.9, opacity: 0.9 },
  a: { x: 0.95, y: 0.67, scale: 0.94, opacity: 0.94 },
};

function mirror(profile) {
  return Object.fromEntries(Object.entries(profile).map(([id, item]) => [id, { ...item, x: 1 - item.x }]));
}

export function defaultControlProfiles(handedness = "right") {
  const right = handedness !== "left";
  return {
    portrait: structuredCloneSafe(right ? RIGHT_PORTRAIT : mirror(RIGHT_PORTRAIT)),
    landscape: structuredCloneSafe(right ? RIGHT_LANDSCAPE : mirror(RIGHT_LANDSCAPE)),
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeControlProfiles(profiles, handedness = "right") {
  const fallback = defaultControlProfiles(handedness);
  const normalized = {};
  for (const orientation of ["portrait", "landscape"]) {
    normalized[orientation] = {};
    for (const id of ["joystick", "run", "b", "a"]) {
      const source = profiles?.[orientation]?.[id] || fallback[orientation][id];
      normalized[orientation][id] = {
        x: clamp(source.x, 0.05, 0.95),
        y: clamp(source.y, 0.08, 0.94),
        scale: clamp(source.scale ?? 1, 0.6, 1.7),
        opacity: clamp(source.opacity ?? 0.9, 0.35, 1),
      };
    }
  }
  return normalized;
}

export function controlStyle(item, baseScale = 1) {
  return {
    position: "absolute",
    left: `${clamp(item?.x ?? 0.5, 0.03, 0.97) * 100}%`,
    top: `${clamp(item?.y ?? 0.5, 0.04, 0.96) * 100}%`,
    transform: "translate(-50%, -50%)",
    opacity: clamp(item?.opacity ?? 0.9, 0.35, 1),
    zIndex: 24,
    "--atlas-control-scale": clamp((item?.scale ?? 1) * baseScale, 0.48, 2.1),
  };
}

export function applyControlPreset(settings, preset = "right") {
  const handedness = preset === "left" ? "left" : preset === "right" ? "right" : settings?.handedness || "right";
  const profiles = defaultControlProfiles(handedness);
  if (preset === "compact") {
    for (const orientation of Object.keys(profiles)) {
      for (const item of Object.values(profiles[orientation])) item.scale *= 0.8;
    }
  }
  if (preset === "tablet") {
    for (const orientation of Object.keys(profiles)) {
      for (const item of Object.values(profiles[orientation])) item.scale *= 1.25;
    }
  }
  return { ...settings, handedness, controlProfiles: normalizeControlProfiles(profiles, handedness) };
}

export const CONTROL_LABELS = Object.freeze({ joystick: "Joystick", run: "Correr", b: "Menú B", a: "Acción A" });
