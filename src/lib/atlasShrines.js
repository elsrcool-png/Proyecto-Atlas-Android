// PROYECTO ATLAS — Sistema de Santuarios de Atlas
// v3.3: Portales de Invocación fijos, sin generación aleatoria.
import { randInt } from "@/lib/atlasWorld";

export const SHRINE_TYPES = {
  portal: {
    id: "portal",
    name: "Portal de Atlas",
    color: "#5eead4",
    glow: "rgba(94,234,212,0.55)",
    desc: "Un Portal de Invocación de Atlas. Al activarlo, este lugar se convierte en tu ancla: puedes reaparecer y viajar aquí cuando lo necesites.",
  },
  normal: {
    id: "normal",
    name: "Santuario de Atlas",
    color: "#5eead4",
    glow: "rgba(94,234,212,0.5)",
    desc: "Una marca de Atlas late con luz serena. El mundo reconoce tu paso y conserva tu historia.",
  },
  ancient: {
    id: "ancient",
    name: "Santuario Antiguo",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.5)",
    desc: "Restos de un santuario anterior a los asentamientos. Guarda fragmentos de la historia de Atlas.",
  },
  corrupted: {
    id: "corrupted",
    name: "Santuario Corrompido",
    color: "#fb7185",
    glow: "rgba(251,113,133,0.55)",
    desc: "La marca de Atlas aquí está distorsionada. Algo acecha tras la energía corrupta.",
  },
};

const NOTIFY_LINES = [
  "Una energía antigua altera el ambiente...",
  "Atlas ha dejado una marca en este lugar.",
  "El aire se detiene: algo ha reconocido tu presencia.",
  "Una luz tenue se manifiesta entre la maleza.",
];
const CORRUPT_NOTIFY = [
  "La energía del lugar se tuerce en sombras...",
  "Atlas marca, pero algo corrompe la señal.",
  "Un escalofrío recorre el suelo: el santuario está contaminado.",
];

export function pickNotify(type) {
  const pool = type === "corrupted" ? CORRUPT_NOTIFY : NOTIFY_LINES;
  return pool[randInt(0, pool.length - 1)];
}

export function rollShrineType(tierId, regionIndex, regionProgress) {
  const r = Math.random();
  if (tierId === "muy_alta") {
    if (r < 0.5) return "corrupted";
    if (r < 0.78) return "ancient";
    return "normal";
  }
  if (tierId === "alta") {
    if (r < 0.32) return "corrupted";
    if (r < 0.62) return "ancient";
    return "normal";
  }
  if (tierId === "media") {
    if (r < 0.35) return "ancient";
    return "normal";
  }
  return "normal";
}

export function revealThreshold(tierId) {
  switch (tierId) {
    case "baja": return 320;
    case "media": return 480;
    case "alta": return 680;
    case "muy_alta": return 900;
    default: return 420;
  }
}

const LORE = {
  verde: [
    "Los primeros senderos fueron trazados por Atlas antes de que los árboles recordaran.",
    "Aquí el bosque custodia los nombres de quienes pasaron antes que tú.",
    "Atlas no juzga: solo observa y conserva.",
  ],
  fria: [
    "Bajo el hielo, las marcas de Atlas no se borran.",
    "El frío preserva lo que el tiempo intenta olvidar.",
    "Cada pico guardaba un nombre. Ahora guarda el tuyo.",
  ],
  desierto: [
    "La arena cubre las ruinas, pero no las marcas de Atlas.",
    "Donde hubo ciudades, Atlas dejó memoria. Donde hubo olvido, dejó preguntas.",
    "El desierto recuerda lo que los imperios enterraron.",
  ],
};

export function shrineLore(regionId) {
  const pool = LORE[regionId] || LORE.verde;
  return pool[randInt(0, pool.length - 1)];
}

// [ELIMINADO v3.3] generateShrineSlots — la generación aleatoria de santuarios
// ha sido reemplazada por posiciones fijas manuales en atlasSanctuaries.js y
// atlasCanonicalWorlds.js (fixedShrines). No se usan semillas ni Math.random.