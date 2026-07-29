// PROYECTO ATLAS — Expansión del Sistema de Amenaza Global
import { tierOf } from "@/lib/atlasThreat";
import { randInt } from "@/lib/atlasWorld";
import { COMMON_MATERIALS, RARE_MATERIALS, MATERIALS } from "@/lib/atlasLoot";

export function threatChestModifier(threat) {
  const tier = tierOf(threat);
  switch (tier.id) {
    case "baja": return { luckBonus: 0, guardianChance: 0, qualityBoost: 0 };
    case "media": return { luckBonus: 1, guardianChance: 0, qualityBoost: 0.05 };
    case "alta": return { luckBonus: 2, guardianChance: 0.10, qualityBoost: 0.15 };
    case "muy_alta": return { luckBonus: 3, guardianChance: 0.20, qualityBoost: 0.30 };
    default: return { luckBonus: 0, guardianChance: 0, qualityBoost: 0 };
  }
}

export function resolveThreatChest(roll, threat, regionIndex) {
  const mod = threatChestModifier(threat);
  const tier = tierOf(threat);
  const effRoll = Math.min(20, roll + mod.luckBonus);

  if (effRoll >= 8 && Math.random() < mod.guardianChance) {
    return { kind: "guardian" };
  }

  if (effRoll >= 16) {
    const pools = {
      baja: ["anillo_fuerza", "capa_resistencia", "amuleto_vida"],
      media: ["brazal_arcano", "escudo_portatil", "corazon_leon", "anillo_fuerza", "capa_resistencia"],
      alta: ["brazal_arcano", "escudo_portatil", "corazon_leon"],
      muy_alta: ["corazon_leon", "brazal_arcano", "escudo_portatil"],
    };
    const pool = pools[tier.id] || pools.baja;
    return { kind: "item", accessoryId: pool[randInt(0, pool.length - 1)] };
  }

  if (effRoll >= 8) {
    const r = Math.random();
    if (tier.id === "baja") {
      if (r < 0.35) return { kind: "gold", amount: 5 + randInt(0, 5) };
      if (r < 0.65) return { kind: "heal", amount: 4 };
      const mid = COMMON_MATERIALS[randInt(0, COMMON_MATERIALS.length - 1)];
      return { kind: "material", id: mid, name: MATERIALS[mid].name };
    }
    if (tier.id === "media") {
      if (r < 0.25) return { kind: "gold", amount: 8 + randInt(0, 5) };
      if (r < 0.50) {
        const mid = COMMON_MATERIALS[randInt(0, COMMON_MATERIALS.length - 1)];
        return { kind: "material", id: mid, name: MATERIALS[mid].name };
      }
      return { kind: "heal", amount: 5 };
    }
    if (tier.id === "alta") {
      if (r < 0.30) {
        const mid = RARE_MATERIALS[randInt(0, RARE_MATERIALS.length - 1)];
        return { kind: "material", id: mid, name: MATERIALS[mid].name };
      }
      if (r < 0.55) return { kind: "consumable", id: "hp_m", name: "Poción mediana de vida" };
      return { kind: "heal", amount: 6 };
    }
    if (r < 0.25) return { kind: "material", id: "fragmentos_atlas", name: MATERIALS.fragmentos_atlas.name };
    if (r < 0.45) return { kind: "consumable", id: "hp_l", name: "Poción grande de vida" };
    if (r < 0.70) {
      const mid = RARE_MATERIALS[randInt(0, RARE_MATERIALS.length - 1)];
      return { kind: "material", id: mid, name: MATERIALS[mid].name };
    }
    return { kind: "heal", amount: 8 };
  }

  const trapDmg = 2 + Math.floor(threat / 3);
  return { kind: "trap", amount: trapDmg };
}

export const THREAT_SPECIAL_EVENTS = {
  baja: [],
  media: [],
  alta: [
    { id: "patrol", name: "Patrulla enemiga", type: "ambush", desc: "Una patrulla enemiga te encuentra." },
    { id: "beast", name: "Bestia legendaria", type: "elite", desc: "Una bestia legendaria merodea cerca." },
    { id: "scout", name: "Explorador hostil", type: "ambush", desc: "Un explorador hostil te localiza." },
    { id: "merchant", name: "Comerciante velado", type: "merchant", desc: "Un comerciante velado te ofrece un obsequio." },
    { id: "shrine_minor", name: "Santuario menor", type: "shrine", desc: "Un santuario menor restaura parte de tu vigor." },
  ],
  muy_alta: [
    { id: "horde", name: "Horda", type: "ambush", desc: "Una horda de enemigos se aproxima." },
    { id: "guardian", name: "Guardián de Atlas", type: "elite", desc: "Un Guardián de Atlas despierta." },
    { id: "rift", name: "Grieta de Atlas", type: "rift", desc: "Una grieta de Atlas se abre ante ti." },
    { id: "protected_chest", name: "Cofre protegido", type: "chest", desc: "Encuentras un cofre protegido con botín." },
    { id: "warband", name: "Banda de guerra", type: "ambush", desc: "Una banda de guerra élite te rodea." },
    { id: "champion", name: "Campeón enemigo", type: "elite", desc: "Un campeón enemigo busca desafío." },
    { id: "merchant_rare", name: "Mercader del Destino", type: "merchant", desc: "Un mercader del Destino regala mercancía valiosa." },
    { id: "rift_major", name: "Grieta inestable", type: "rift", desc: "Una grieta inestable derrama fragmentos de Atlas." },
  ],
};

const RECENT_THREAT = [];
export function rollThreatEvent(threat) {
  const tier = tierOf(threat);
  const events = THREAT_SPECIAL_EVENTS[tier.id] || [];
  if (!events.length) return null;
  const triggerChance = tier.id === "alta" ? 0.10 : tier.id === "muy_alta" ? 0.18 : 0;
  if (Math.random() > triggerChance) return null;
  const fresh = events.filter(e => !RECENT_THREAT.includes(e.id));
  const src = fresh.length ? fresh : events;
  const ev = src[Math.floor(Math.random() * src.length)];
  RECENT_THREAT.splice(0, RECENT_THREAT.length, ...[...RECENT_THREAT.filter(k => k !== ev.id), ev.id].slice(-3));
  return ev;
}

export function threatWorldMod(threat) {
  const tier = tierOf(threat);
  switch (tier.id) {
    case "baja": return { patrolSpeed: 1, chaseSpeed: 1, aggression: 1 };
    case "media": return { patrolSpeed: 1, chaseSpeed: 1, aggression: 1 };
    case "alta": return { patrolSpeed: 1.3, chaseSpeed: 1.2, aggression: 1.2 };
    case "muy_alta": return { patrolSpeed: 1.6, chaseSpeed: 1.4, aggression: 1.4 };
    default: return { patrolSpeed: 1, chaseSpeed: 1, aggression: 1 };
  }
}

export function threatEconomyMod(threat) {
  const tier = tierOf(threat);
  switch (tier.id) {
    case "baja": return { restCostMult: 1, shopPriceMult: 1, qualityBonus: 0 };
    case "media": return { restCostMult: 1, shopPriceMult: 1, qualityBonus: 0.05 };
    case "alta": return { restCostMult: 1.3, shopPriceMult: 1.1, qualityBonus: 0.15 };
    case "muy_alta": return { restCostMult: 1.6, shopPriceMult: 1.2, qualityBonus: 0.25 };
    default: return { restCostMult: 1, shopPriceMult: 1, qualityBonus: 0 };
  }
}

export const THREAT_NPC_WARNINGS = {
  baja: [],
  media: ["Se dice que algo se mueve en los caminos. Ten cuidado, viajero."],
  alta: ["¡Patrullas enemigas recorren los alrededores! Deberías reducir tu presencia.", "Algo te sigue. El mundo siente tu amenaza."],
  muy_alta: ["¡Atlas te observa! El mundo responde a tus acciones con furia.", "Invasiones, guardianes... el peligro crece contigo. Quizás deberías descansar."],
};

export function threatNpcWarning(threat) {
  const tier = tierOf(threat);
  const lines = THREAT_NPC_WARNINGS[tier.id];
  if (!lines || !lines.length) return null;
  return lines[0];
}