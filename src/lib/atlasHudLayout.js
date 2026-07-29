// PROYECTO ATLAS — configuración del HUD Maestro Adaptativo v3.
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));

export const HUD_ELEMENT_LABELS = Object.freeze({
  zone: "Zona",
  threat: "Amenaza",
  mission: "Misión rastreada",
  vitals: "Vida y energía",
  menu: "Pausa y menú rápido",
});

const BASE_ELEMENTS = Object.freeze({
  zone: { visible: true, scale: 1, opacity: 0.94 },
  threat: { visible: true, scale: 1, opacity: 0.94 },
  mission: { visible: true, scale: 1, opacity: 0.96 },
  vitals: { visible: true, scale: 1, opacity: 0.92 },
  menu: { visible: true, scale: 1, opacity: 0.96 },
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function defaultHudElements() {
  return clone(BASE_ELEMENTS);
}

export function normalizeHudElements(elements) {
  const normalized = {};
  for (const id of Object.keys(BASE_ELEMENTS)) {
    const source = elements?.[id] || BASE_ELEMENTS[id];
    normalized[id] = {
      visible: source.visible !== false,
      scale: clamp(source.scale ?? 1, 0.72, 1.35),
      opacity: clamp(source.opacity ?? 0.94, 0.4, 1),
    };
  }
  return normalized;
}

export function hudElementStyle(elements, id) {
  const item = normalizeHudElements(elements)[id];
  return {
    opacity: item.opacity,
    transform: `scale(${item.scale})`,
    transformOrigin: id === "menu" ? "top right" : id === "mission" ? "top center" : "top left",
  };
}

export function applyHudPreset(settings, preset = "balanced") {
  const elements = defaultHudElements();
  const next = { ...settings, hudPreset: preset, hudElements: elements };

  if (preset === "clean") {
    next.hudDensity = "clean";
    elements.vitals.visible = false;
    elements.zone.scale = 0.92;
    elements.threat.scale = 0.9;
    elements.mission.scale = 0.94;
  } else if (preset === "compact") {
    next.hudDensity = "clean";
    next.controlSize = "small";
    elements.vitals.visible = false;
    for (const item of Object.values(elements)) {
      item.scale = 0.84;
      item.opacity = 0.88;
    }
  } else if (preset === "accessible") {
    next.hudDensity = "full";
    next.controlSize = "large";
    for (const item of Object.values(elements)) {
      item.scale = 1.12;
      item.opacity = 1;
    }
  } else {
    next.hudPreset = "balanced";
    next.hudDensity = "adaptive";
    next.controlSize = settings?.controlSize || "normal";
  }

  return { ...next, hudElements: normalizeHudElements(elements) };
}
