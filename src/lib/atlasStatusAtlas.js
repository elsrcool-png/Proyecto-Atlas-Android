// ═══════════════════════════════════════════════════════════════════════════
// PROYECTO ATLAS — Sistema de Estados (Alpha 1.0)
// ---------------------------------------------------------------------------
import { QUALITY } from "@/lib/atlasDiceSystem";

export function statusDurationFor(qualityId) {
  switch (qualityId) {
    case QUALITY.fallo_critico.id: return 0;
    case QUALITY.bajo.id:          return 1;
    case QUALITY.medio.id:         return 2;
    case QUALITY.alto.id:          return 3;
    case QUALITY.critico.id:       return 4;
    default:                       return 1;
  }
}

export const ATLAS_STATUSES = {
  sangrado:      { id: "sangrado",      name: "Sangrado",      icon: "🩸", category: "ofensivo",   desc: "Daño progresivo durante varios turnos.", stacks: true },
  quemadura:     { id: "quemadura",     name: "Quemadura",     icon: "🔥", category: "ofensivo",   desc: "Daño progresivo y reduce recuperación de vida.", stacks: false },
  vulnerable:    { id: "vulnerable",    name: "Vulnerable",    icon: "💀", category: "ofensivo",   desc: "Reduce DEF del objetivo.", stacks: false },
  debilitado:    { id: "debilitado",    name: "Debilitado",    icon: "⛓️", category: "ofensivo",   desc: "Reduce ATK del objetivo.", stacks: false },
  marcado:       { id: "marcado",       name: "Marcado",       icon: "🎯", category: "ofensivo",   desc: "Mejora el siguiente ataque contra el objetivo.", stacks: false },
  fortificado:   { id: "fortificado",   name: "Fortificado",   icon: "🪨", category: "defensivo",  desc: "Aumenta DEF.", stacks: false },
  escudo:        { id: "escudo",        name: "Escudo",        icon: "🛡️", category: "defensivo",  desc: "Absorbe daño recibido.", stacks: false },
  regeneracion:  { id: "regeneracion",  name: "Regeneración",  icon: "🌿", category: "defensivo",  desc: "Recupera HP cada turno.", stacks: false },
  oculto:        { id: "oculto",        name: "Oculto",        icon: "🌑", category: "defensivo",  desc: "Evita el próximo ataque enemigo.", stacks: false },
  inspirado:     { id: "inspirado",     name: "Inspirado",     icon: "✨", category: "energia",    desc: "Mejora recuperación de energía.", stacks: false },
  agotado:       { id: "agotado",       name: "Agotado",       icon: "🔻", category: "energia",    desc: "Reduce recursos disponibles.", stacks: false },
  bloqueado:     { id: "bloqueado",     name: "Bloqueado",     icon: "🔒", category: "energia",    desc: "Impide recuperar energía.", stacks: false },
  lento:         { id: "lento",         name: "Lento",         icon: "🐌", category: "control",    desc: "Reduce movilidad o prioridad.", stacks: false },
  inmovilizado:  { id: "inmovilizado",  name: "Inmovilizado",  icon: "🪤", category: "control",    desc: "Impide desplazamiento.", stacks: false },
  aturdido:      { id: "aturdido",      name: "Aturdido",      icon: "😵", category: "control",    desc: "Pierde una acción.", stacks: false },
  veneno:        { id: "veneno",        name: "Veneno",        icon: "☠️", category: "especial",   desc: "Daño progresivo acumulable.", stacks: true },
  maldito:       { id: "maldito",       name: "Maldito",       icon: "🌙", category: "especial",   desc: "Reduce eficacia de habilidades.", stacks: false },
  revelado:      { id: "revelado",      name: "Revelado",      icon: "👁️", category: "especial",   desc: "Elimina ocultación.", stacks: false },
  acelerado:     { id: "acelerado",     name: "Acelerado",     icon: "🌪️", category: "especial",   desc: "Mejora acciones o velocidad.", stacks: false },
};

export const OPPOSITES = {
  fortificado: "vulnerable",
  vulnerable: "fortificado",
  inspirado: "agotado",
  agotado: "inspirado",
  oculto: "revelado",
  revelado: "oculto",
};

export function applyAtlasStatus(statuses, statusId, qualityId, amount = 1) {
  if (!statusId || !ATLAS_STATUSES[statusId]) return statuses || {};
  const duration = statusDurationFor(qualityId);
  if (duration <= 0) return statuses || {};

  const next = { ...(statuses || {}) };
  const def = ATLAS_STATUSES[statusId];

  const opp = OPPOSITES[statusId];
  if (opp) delete next[opp];

  if (def.stacks) {
    const existing = next[statusId];
    next[statusId] = {
      type: statusId,
      duration,
      amount,
      charges: (existing?.charges || 0) + 1,
    };
  } else {
    next[statusId] = { type: statusId, duration, amount };
  }
  return next;
}

export function tickAtlasStatuses(statuses) {
  if (!statuses) return { damage: 0, heal: 0, canAct: true, expired: [], logs: [], nextStatuses: {} };

  let damage = 0;
  let heal = 0;
  let energyRegenBonus = 0;
  let energyBlocked = false;
  let skipAction = false;
  const logs = [];
  const expired = [];
  const next = {};

  for (const [type, s] of Object.entries(statuses)) {
    const def = ATLAS_STATUSES[type];
    if (!def) continue;

    if (type === "sangrado" || type === "quemadura" || type === "veneno") {
      const dmg = (s.amount || 1) * (s.charges || 1);
      damage += dmg;
      logs.push(`${def.name}: -${dmg} HP`);
    }
    if (type === "regeneracion") {
      heal += s.amount || 6;
      logs.push(`${def.name}: +${s.amount || 6} HP`);
    }
    if (type === "quemadura") {
      logs.push(`${def.name}: recuperación de vida reducida`);
    }
    if (type === "inspirado") energyRegenBonus += 1;
    if (type === "agotado") energyRegenBonus -= 1;
    if (type === "bloqueado") energyBlocked = true;
    if (type === "aturdido" || type === "inmovilizado") skipAction = true;

    const newDur = s.duration - 1;
    if (newDur > 0) {
      next[type] = { ...s, duration: newDur };
    } else {
      expired.push(type);
    }
  }

  if (skipAction) {
    delete next.aturdido;
    delete next.inmovilizado;
    logs.push("No puedes actuar este turno.");
  }

  return {
    damage,
    heal,
    canAct: !skipAction,
    energyRegenBonus,
    energyBlocked,
    expired,
    logs,
    nextStatuses: next,
  };
}

export function atlasStatusAtkMod(statuses) {
  if (!statuses) return 0;
  let mod = 0;
  if (statuses.debilitado) mod -= statuses.debilitado.amount || 2;
  if (statuses.inspirado) mod += 1;
  return mod;
}

export function atlasStatusDefMod(statuses) {
  if (!statuses) return 0;
  let mod = 0;
  if (statuses.vulnerable) mod -= statuses.vulnerable.amount || 2;
  if (statuses.fortificado) mod += statuses.fortificado.amount || 2;
  return mod;
}

export function atlasStatusNextAttackBonus(statuses) {
  if (!statuses?.marcado) return { bonus: 0, consume: false };
  return { bonus: statuses.marcado.amount || 2, consume: true };
}