// PROYECTO ATLAS — Armas de clase (nueva capa, autónoma)
export const WEAPON_ABILITIES = {
  espada_guerrero: { name: "Torbellino", cost: 3, diceGroup: "versatil", desc: "Daño similar al ataque básico y deja al enemigo vulnerable.", effect: { hits: 1, ignoreDef: 0, crit: "none", power: 1.0, statusId: "vulnerable", statusAmount: 1 } },
  hacha_guerrero: { name: "Golpe Brutal", cost: 4, diceGroup: "versatil", desc: "Golpe pesado que debilita la defensa sin multiplicar el daño base.", effect: { hits: 1, ignoreDef: 0.1, crit: "highroll", power: 1.03, statusId: "vulnerable", statusAmount: 2 } },
  martillo_guerrero: { name: "Impacto Sísmico", cost: 5, diceGroup: "versatil", desc: "Impacto táctico que puede aturdir según la calidad del dado.", effect: { hits: 1, ignoreDef: 0.05, crit: "none", power: 1.0, statusId: "aturdido", statusAmount: 1 } },
  baston_mago: { name: "Rayo Arcano", cost: 3, diceGroup: "versatil", desc: "Daño base y reducción temporal del poder ofensivo enemigo.", effect: { hits: 1, ignoreDef: 0.08, crit: "none", power: 1.0, statusId: "debilitado", statusAmount: 1 } },
  vara_mago: { name: "Explosión Elemental", cost: 4, diceGroup: "versatil", desc: "Daño base con un estado elemental aleatorio.", effect: { hits: 1, ignoreDef: 0.05, crit: "highroll", power: 1.0, statusPool: ["quemadura", "lento", "aturdido"], statusAmount: 1 } },
  grimorio_mago: { name: "Invocar Familiar", cost: 5, diceGroup: "versatil", desc: "El familiar golpea y marca la apertura creada.", effect: { hits: 1, ignoreDef: 0, crit: "none", power: 0.98, statusId: "debilitado", statusAmount: 1, summon: true } },
  dagas_picaro: { name: "Danza de Cuchillas", cost: 3, diceGroup: "versatil", desc: "Ataque rápido que aplica sangrado según la calidad.", effect: { hits: 1, ignoreDef: 0.05, crit: "none", power: 0.98, statusId: "sangrado", statusAmount: 1 } },
  katar_picaro: { name: "Perforación Mortal", cost: 4, diceGroup: "versatil", desc: "Perfora parcialmente y deja al objetivo vulnerable.", effect: { hits: 1, ignoreDef: 0.12, crit: "highroll", power: 1.02, statusId: "vulnerable", statusAmount: 1 } },
  ballesta_picaro: { name: "Disparo Preciso", cost: 3, diceGroup: "versatil", desc: "Disparo de daño base que debilita la ofensiva enemiga.", effect: { hits: 1, ignoreDef: 0.06, crit: "highroll", power: 1.0, statusId: "debilitado", statusAmount: 1 } },
  starter_espada_recluta: { name: "Golpe Firme", cost: 2, diceGroup: "versatil", desc: "Daño equivalente al básico y una vulnerabilidad breve.", effect: { hits: 1, ignoreDef: 0, crit: "none", power: 1.0, statusId: "vulnerable", statusAmount: 1 } },
  starter_baston_aprendiz: { name: "Chispa Arcana", cost: 2, diceGroup: "versatil", desc: "Daño equivalente al básico y debilitamiento breve.", effect: { hits: 1, ignoreDef: 0, crit: "none", power: 1.0, statusId: "debilitado", statusAmount: 1 } },
  starter_dagas_bronce: { name: "Estocada Veloz", cost: 2, diceGroup: "versatil", desc: "Daño equivalente al básico y una carga de sangrado.", effect: { hits: 1, ignoreDef: 0, crit: "highroll", power: 0.98, statusId: "sangrado", statusAmount: 1 } },
  reliquia_verde_guerrero: { name: "Corte de Renovación", cost: 4, diceGroup: "versatil", desc: "Purifica la corrupción y vuelve vulnerable al Guardián.", effect: { hits: 1, ignoreDef: 0.12, crit: "highroll", power: 1.05, statusId: "vulnerable", statusAmount: 2, purify: true } },
  reliquia_verde_mago: { name: "Pulso de Savia Ancestral", cost: 4, diceGroup: "versatil", desc: "Purifica y debilita el poder ofensivo de la corrupción.", effect: { hits: 1, ignoreDef: 0.12, crit: "highroll", power: 1.05, statusId: "debilitado", statusAmount: 2, purify: true } },
  reliquia_verde_picaro: { name: "Danza del Brote", cost: 4, diceGroup: "versatil", desc: "Sella la corrupción con sangrado purificador.", effect: { hits: 1, ignoreDef: 0.1, crit: "highroll", power: 1.03, statusId: "sangrado", statusAmount: 2, purify: true } },
};

export const CLASS_WEAPONS = {
  espada_guerrero: { id: "espada_guerrero", cls: "Guerrero", slot: 0, name: "Espada", style: "Equilibrado", rarity: "Poco común", sell: 18, offType: "atk", stats: { attack: 2 }, ability: WEAPON_ABILITIES.espada_guerrero, recipe: { gold: 30, materials: { hierro: 3, madera_dura: 2 } }, desc: "Estilo equilibrado: corte y defensa." },
  hacha_guerrero: { id: "hacha_guerrero", cls: "Guerrero", slot: 1, name: "Hacha", style: "Daño explosivo", rarity: "Raro", sell: 40, offType: "atk", stats: { attack: 3 }, ability: WEAPON_ABILITIES.hacha_guerrero, recipe: { gold: 50, materials: { acero: 3, escamas: 2 } }, desc: "Lenta pero devastadora." },
  martillo_guerrero: { id: "martillo_guerrero", cls: "Guerrero", slot: 2, name: "Martillo", style: "Control", rarity: "Épico", sell: 90, offType: "atk", stats: { attack: 4 }, ability: WEAPON_ABILITIES.martillo_guerrero, recipe: { gold: 80, materials: { titanio: 3, obsidiana: 2 } }, desc: "Control del campo de batalla." },
  baston_mago: { id: "baston_mago", cls: "Mago", slot: 0, name: "Bastón", style: "Versátil", rarity: "Poco común", sell: 18, offType: "arcane", stats: { attack: 1, maxMp: 2 }, ability: WEAPON_ABILITIES.baston_mago, recipe: { gold: 30, materials: { madera_dura: 3, hierro: 1 } }, desc: "Magia directa y versátil." },
  vara_mago: { id: "vara_mago", cls: "Mago", slot: 1, name: "Vara Elemental", style: "Estados alterados", rarity: "Raro", sell: 40, offType: "arcane", stats: { attack: 2, maxMp: 2 }, ability: WEAPON_ABILITIES.vara_mago, recipe: { gold: 50, materials: { cristal_arcano: 3, seda: 2 } }, desc: "Elementos y estados." },
  grimorio_mago: { id: "grimorio_mago", cls: "Mago", slot: 2, name: "Grimorio", style: "Invocación", rarity: "Épico", sell: 90, offType: "arcane", stats: { attack: 2, maxMp: 4 }, ability: WEAPON_ABILITIES.grimorio_mago, recipe: { gold: 80, materials: { nucleo_arcano: 3, fragmentos_atlas: 2 } }, desc: "Invoca aliados temporales." },
  dagas_picaro: { id: "dagas_picaro", cls: "Pícaro", slot: 0, name: "Dagas Gemelas", style: "Velocidad", rarity: "Poco común", sell: 18, offType: "precision", stats: { attack: 1, crit: 0.05 }, ability: WEAPON_ABILITIES.dagas_picaro, recipe: { gold: 30, materials: { cuero: 3, hierro: 2 } }, desc: "Golpes rápidos encadenados." },
  katar_picaro: { id: "katar_picaro", cls: "Pícaro", slot: 1, name: "Katar", style: "Críticos", rarity: "Raro", sell: 40, offType: "precision", stats: { attack: 3, crit: 0.05 }, ability: WEAPON_ABILITIES.katar_picaro, recipe: { gold: 50, materials: { acero: 3, escamas: 2 } }, desc: "Críticos perforantes." },
  ballesta_picaro: { id: "ballesta_picaro", cls: "Pícaro", slot: 2, name: "Ballesta Ligera", style: "Distancia", rarity: "Épico", sell: 90, offType: "precision", stats: { attack: 2, crit: 0.10 }, ability: WEAPON_ABILITIES.ballesta_picaro, recipe: { gold: 80, materials: { titanio: 3, obsidiana: 2 } }, desc: "Precisión a distancia." },
  starter_espada_recluta: { id: "starter_espada_recluta", cls: "Guerrero", slot: 3, name: "Espada de Recluta", style: "Básico", rarity: "Común", sell: 5, offType: "atk", stats: { attack: 1 }, ability: WEAPON_ABILITIES.starter_espada_recluta, recipe: { gold: 0, materials: {} }, starter: true, desc: "Arma de recluta. Sólida pero sin distinción." },
  starter_baston_aprendiz: { id: "starter_baston_aprendiz", cls: "Mago", slot: 3, name: "Bastón de Aprendiz", style: "Básico", rarity: "Común", sell: 5, offType: "arcane", stats: { attack: 1, maxMp: 1 }, ability: WEAPON_ABILITIES.starter_baston_aprendiz, recipe: { gold: 0, materials: {} }, starter: true, desc: "Primer bastón del aprendiz. Canaliza magia justa." },
  starter_dagas_bronce: { id: "starter_dagas_bronce", cls: "Pícaro", slot: 3, name: "Dagas de Bronce", style: "Básico", rarity: "Común", sell: 5, offType: "precision", stats: { attack: 1, crit: 0.05 }, ability: WEAPON_ABILITIES.starter_dagas_bronce, recipe: { gold: 0, materials: {} }, starter: true, desc: "Dagas de bronce. Rápidas y reemplazables." },
  reliquia_verde_guerrero: { id: "reliquia_verde_guerrero", cls: "Guerrero", slot: 9, name: "Espada-Raíz del Guardián", style: "Reliquia regional", rarity: "Legendario", sell: 0, offType: "atk", stats: { attack: 4 }, ability: WEAPON_ABILITIES.reliquia_verde_guerrero, recipe: null, relic: true, region: "verde", desc: "La hoja restaurada del antiguo protector. No puede venderse ni mejorarse como un arma común." },
  reliquia_verde_mago: { id: "reliquia_verde_mago", cls: "Mago", slot: 9, name: "Bastón de Savia Ancestral", style: "Reliquia regional", rarity: "Legendario", sell: 0, offType: "arcane", stats: { attack: 3, maxMp: 3 }, ability: WEAPON_ABILITIES.reliquia_verde_mago, recipe: null, relic: true, region: "verde", desc: "La reliquia adopta una forma capaz de canalizar el pulso del bosque." },
  reliquia_verde_picaro: { id: "reliquia_verde_picaro", cls: "Pícaro", slot: 9, name: "Hojas Gemelas del Brote", style: "Reliquia regional", rarity: "Legendario", sell: 0, offType: "precision", stats: { attack: 3, crit: 0.08 }, ability: WEAPON_ABILITIES.reliquia_verde_picaro, recipe: null, relic: true, region: "verde", desc: "La hoja fracturada se divide en dos filos enlazados por la misma savia." },
};

export const WEAPON_MAX_UPGRADE = 5;

export function getWeaponAbility(player) {
  if (!player?.classWeapon) return null;
  const w = CLASS_WEAPONS[player.classWeapon];
  if (!w || !w.ability) return null;
  return { ...w.ability, diceGroup: w.ability.diceGroup || "versatil", unlock: 1, kind: "Habilidad de arma" };
}

export const LOOT_WA = {
  atk: { name: "Golpe Firme", cost: 2, diceGroup: "versatil", desc: "Daño base y vulnerabilidad breve.", effect: { hits: 1, ignoreDef: 0, crit: "none", power: 1.0, statusId: "vulnerable", statusAmount: 1 } },
  arcane: { name: "Impulso Arcano", cost: 2, diceGroup: "versatil", desc: "Daño base y debilitamiento breve.", effect: { hits: 1, ignoreDef: 0.04, crit: "none", power: 1.0, statusId: "debilitado", statusAmount: 1 } },
  precision: { name: "Puntería Certera", cost: 2, diceGroup: "versatil", desc: "Daño base y una carga de sangrado.", effect: { hits: 1, ignoreDef: 0.04, crit: "highroll", power: 0.98, statusId: "sangrado", statusAmount: 1 } },
};

export function getLootWeaponAbility(weaponDef) {
  if (!weaponDef || !weaponDef.offType) return null;
  const a = LOOT_WA[weaponDef.offType];
  return a ? { ...a, unlock: 1, kind: "Habilidad de arma" } : null;
}

export function weaponsForClass(cls) {
  return Object.values(CLASS_WEAPONS).filter(w => w.cls === cls && !w.starter && !w.relic).sort((a, b) => a.slot - b.slot);
}
export function getGreenRelicWeaponId(cls) {
  return { Guerrero: "reliquia_verde_guerrero", Mago: "reliquia_verde_mago", "Pícaro": "reliquia_verde_picaro" }[cls] || "reliquia_verde_guerrero";
}
