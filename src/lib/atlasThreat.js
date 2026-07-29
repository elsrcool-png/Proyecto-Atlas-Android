// PROYECTO ATLAS — Motor de Amenaza (modo aventura)
export const THREAT_MAX = 10;

export const TIERS = [
  { id: "baja", min: 0, max: 2, roman: "I", label: "Amenaza baja", message: "El mundo apenas nota tu presencia.", color: "text-emerald-300", dot: "bg-emerald-400", ring: "border-emerald-500/40", bar: "bg-emerald-500" },
  { id: "media", min: 3, max: 5, roman: "II", label: "Amenaza media", message: "Has comenzado a llamar la atención.", color: "text-amber-300", dot: "bg-amber-400", ring: "border-amber-500/50", bar: "bg-amber-400" },
  { id: "alta", min: 6, max: 8, roman: "III", label: "Amenaza alta", message: "Algo te está observando...", color: "text-rose-300", dot: "bg-rose-400", ring: "border-rose-500/50", bar: "bg-rose-500" },
  { id: "muy_alta", min: 9, max: 10, roman: "IV", label: "Amenaza muy alta", message: "Atlas ha fijado su mirada sobre ti.", color: "text-fuchsia-300", dot: "bg-fuchsia-400", ring: "border-fuchsia-500/60", bar: "bg-fuchsia-500" },
];

export function tierOf(threat) {
  const t = Math.max(0, Math.min(THREAT_MAX, threat || 0));
  return TIERS.find(x => t >= x.min && t <= x.max) || TIERS[0];
}

export const THREAT_GAIN = {
  kill: 1,
  elite: 2,
  chest: 1,
  discover: 1,
  mission: 1,
  boss: 3,
  exploreTick: 1,
};

export const THREAT_REDUCE = {
  rest: 2,
  idleTick: 1,
  helpMission: 2,
};

export function worldBehavior(tierId) {
  switch (tierId) {
    case "baja": return { detectRange: 0, chase: false, eliteChance: 0, rewardBonus: 0, patrolSpeed: 1, chaseSpeed: 1 };
    case "media": return { detectRange: 130, chase: false, eliteChance: 0, rewardBonus: 0, patrolSpeed: 1, chaseSpeed: 1 };
    case "alta": return { detectRange: 220, chase: true, eliteChance: 0.25, rewardBonus: 0.2, patrolSpeed: 1.3, chaseSpeed: 1.2 };
    case "muy_alta": return { detectRange: 320, chase: true, eliteChance: 0.4, rewardBonus: 0.35, patrolSpeed: 1.6, chaseSpeed: 1.4 };
    default: return { detectRange: 0, chase: false, eliteChance: 0, rewardBonus: 0, patrolSpeed: 1, chaseSpeed: 1 };
  }
}

export const THREAT_EVENTS = {
  baja: [],
  media: [
    "Escuchas pasos entre los árboles.",
    "Los habitantes parecen nerviosos.",
    "Una brisa inusual recorre el camino.",
  ],
  alta: [
    "Una presencia desconocida recorre el bosque.",
    "Una patrulla enemiga ha llegado a la zona.",
    "Sientes que algo te sigue entre la maleza.",
  ],
  muy_alta: [
    "Una cueva acaba de abrirse en la lejanía.",
    "El bosque enmudece: emboscada inminente.",
    "Un comerciante misterioso merodea cerca del refugio.",
    "Atlas susurra tu nombre entre las sombras.",
  ],
};

export function rollEvent(tierId) {
  const pool = THREAT_EVENTS[tierId] || [];
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Reequilibrio de Amenaza ──
// Combates normales necesarios para +1 de Amenaza.
export const COMBAT_WIN_THRESHOLD = 3;

// Enemigos especiales que pueden modificar la Amenaza al derrotarlos o encontrarlos:
// élites, criaturas corruptas, guardianes y enemigos de evento (marcados con addsThreat).
export function isThreatEnemy(e) {
  return !!(e && (e.addsThreat || e.elite || e.boss || e.corrupted));
}

// Dado de botín de Amenaza (d20 separado, post-combate).
// 1-4: Amenaza +1 (botín desafortunado); 5-16: sin cambio; 17-20: Amenaza -1 (botín favorable).
export function rollLootThreat() {
  const roll = 1 + Math.floor(Math.random() * 20);
  if (roll <= 4) return { roll, delta: 1, cause: "botín desafortunado" };
  if (roll >= 17) return { roll, delta: -1, cause: "botín favorable" };
  return { roll, delta: 0, cause: null };
}