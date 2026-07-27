// PROYECTO ATLAS — Sistema de habilidades y equipamiento (capa adicional, sin tocar mecánicas)
import { WEAPONS, ARMORS } from "@/lib/atlasLoot";
import { CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { resolveWeaponDefId, resolveWeaponInstance } from "@/lib/atlasWeaponInstances";

export const CLASS_OFF_TYPE = { Guerrero: "atk", Mago: "arcane", "Pícaro": "precision" };

export const UNLOCK = { basic: 1, racePassive: 3, raceAbility: 5, classPassive: 8, classAbility: 5, hybrid: 10, definitive: 15 };

export const RACE_PASSIVES = {
  Humano: { name: "Versatilidad", desc: "+1 Ataque. Los humanos se adaptan a cualquier rol.", bonus: { atk: 1, def: 0, maxHp: 0 } },
  Elfo: { name: "Gracia Élfica", desc: "+1 Defensa. Agilidad y reflejos superiores.", bonus: { atk: 0, def: 1, maxHp: 0 } },
  Enano: { name: "Robustez", desc: "+2 Vida máxima. Constitución enana de hierro.", bonus: { atk: 0, def: 0, maxHp: 2 } },
};

export const CLASS_PASSIVES = {
  Guerrero: { name: "Defensa de Hierro", desc: "+1 Defensa. Entrenamiento avanzado con escudo.", bonus: { atk: 0, def: 1, maxHp: 0 } },
  Mago: { name: "Mente Arcana", desc: "+1 Ataque. Dominio profundo de los hechizos.", bonus: { atk: 1, def: 0, maxHp: 0 } },
  Pícaro: { name: "Reflejos Felinos", desc: "+1 Ataque. Velocidad y precisión letales.", bonus: { atk: 1, def: 0, maxHp: 0 } },
};

export const BASIC_ATTACKS = {
  Guerrero: { name: "Ataque Básico", desc: "Golpe con tu arma cuerpo a cuerpo." },
  Mago: { name: "Golpe con Bastón", desc: "Ataque físico débil con tu bastón arcano." },
  Pícaro: { name: "Golpe Ligero", desc: "Ataque físico rápido con arma corta." },
};

export const RACE_ABILITIES = {
  humano_mago: { name: "Proyectil Arcano", desc: "Lanzas un rayo de energía arcana que impacta a distancia." },
  elfo_mago: { name: "Flecha Solar", desc: "Disparas una flecha de luz solar que abrasa al objetivo." },
  enano_mago: { name: "Runa Explosiva", desc: "Activas una runa grabada que estalla bajo el enemigo." },
  humano_guerrero: { name: "Corte Preciso", desc: "Golpe certero dirigido al punto vital del enemigo." },
  elfo_guerrero: { name: "Estocada Veloz", desc: "Estocada rápida y elegante, difícil de esquivar." },
  enano_guerrero: { name: "Martillo Sísmico", desc: "Golpe sísmico que sacude el suelo bajo el enemigo." },
  humano_picaro: { name: "Ataque Rápido", desc: "Una serie de cortes veloces encadenados." },
  elfo_picaro: { name: "Disparo Silencioso", desc: "Un disparo sigiloso sin hacer el menor ruido." },
  enano_picaro: { name: "Bomba Improvisada", desc: "Lanzas una bomba artesanal improvisada." },
};

export const CLASS_ABILITIES = {
  humano_mago: { name: "Escudo Rúnico", desc: "Invocas un escudo de runas que absorbe el daño entrante." },
  elfo_mago: { name: "Invocar Espíritu", desc: "Llamas a un espíritu del bosque para que te asista en combate." },
  enano_mago: { name: "Forja de Maná", desc: "Transformas maná en una barrera de acero mágico." },
  humano_guerrero: { name: "Guardia Real", desc: "Postura defensiva imperial que protege y fomenta el contraataque." },
  elfo_guerrero: { name: "Danza de Espadas", desc: "Movimiento fluido que combina ataque y defensa a la vez." },
  enano_guerrero: { name: "Muro de Piedra", desc: "Te conviertes en un muro de roca inamovible." },
  humano_picaro: { name: "Emboscada Urbana", desc: "Aprovechas el entorno urbano para tender una emboscada letal." },
  elfo_picaro: { name: "Paso Sombrío", desc: "Te deslizas entre sombras sin ser visto ni oído." },
  enano_picaro: { name: "Trampa de Acero", desc: "Colocas una trampa mecánica de acero oculta." },
};

export const HYBRID_ABILITIES = {
  humano_mago: { name: "Arcano Imperial", desc: "Canalizas el linaje imperial en una explosión arcana devastadora." },
  elfo_mago: { name: "Magia del Bosque", desc: "Invocas la energía primigenia del bosque ancestral." },
  enano_mago: { name: "Runas de Guerra", desc: "Gravas runas de batalla en tu propia piel endurecida." },
  humano_guerrero: { name: "Corneta de Guerra", desc: "Tocas la corneta real que inspira a aliados y aterraza a enemigos." },
  elfo_guerrero: { name: "Furia del Bosque", desc: "La furia ancestral del bosque posee tu espada." },
  enano_guerrero: { name: "Furia de la Montaña", desc: "Golpeas con la fuerza aplastante de la montaña misma." },
  humano_picaro: { name: "Sigilo Urbano", desc: "Desapareces entre la multitud de la ciudad sin dejar rastro." },
  elfo_picaro: { name: "Sombra Élfica", desc: "Tu sombra se separa de ti y ataca por su cuenta." },
  enano_picaro: { name: "Sabotaje Enano", desc: "Desmontas las defensas enemigas pieza por pieza." },
};

export const ACCESSORIES = {
  anillo_fuerza: { name: "Anillo de Fuerza", rarity: "Común", desc: "+1 ATK. Potencia la fuerza física del portador.", bonus: { atk: 1 } },
  capa_resistencia: { name: "Capa de Resististencia", rarity: "Común", desc: "+1 Def. Física. Tela resistente al daño.", bonus: { physDef: 1 } },
  amuleto_vida: { name: "Amuleto de Vida", rarity: "Común", desc: "+2 Vida máxima. Pulsa con energía vital.", bonus: { maxHp: 2 } },
  brazal_arcano: { name: "Brazal del Mago", rarity: "Raro", desc: "+2 Poder Arcano. Canaliza poder arcano en cada hechizo.", bonus: { arcane: 2 } },
  escudo_portatil: { name: "Escudo Portátil", rarity: "Raro", desc: "+2 Def. Física. Se despliega ante el peligro.", bonus: { physDef: 2 } },
  corazon_leon: { name: "Corazón de León", rarity: "Raro", desc: "+4 Vida máxima. Infunde un coraje insuperable.", bonus: { maxHp: 4 } },
  corona_reinos: { name: "Corona de los Reinos", rarity: "Legendario", desc: "+1 ATK, +1 Poder Arcano, +1 Precisión, +1 Def. Física, +1 Def. Mágica, +3 Vida. Forjada con el poder unificado de los reinos.", bonus: { atk: 1, arcane: 1, precision: 1, physDef: 1, magDef: 1, maxHp: 3 } },
  totem_ancestral: { name: "Tótem Ancestral", rarity: "Legendario", desc: "+2 a tu estadística ofensiva. Contiene el conocimiento de una raza ajena: otorga destrezas foráneas a su portador.", bonus: { atk: 2, arcane: 2, precision: 2 } },
  manto_heroe: { name: "Manto del Héroe", rarity: "Legendario", desc: "+2 Def. Física, +2 Def. Mágica, +4 Vida. El manto tejido de un héroe legendario.", bonus: { physDef: 2, magDef: 2, maxHp: 4 } },
};

export const LOOT_ACCESSORIES = {
  amulet_vitality: { name: "Amuleto de Vitalidad", rarity: "Poco común", desc: "+10 Vida máxima.", bonus: { atk: 0, def: 0, maxHp: 10 } },
  ring_warrior: { name: "Anillo del Guerrero", rarity: "Poco común", desc: "+5 Energía máxima.", bonus: { atk: 0, def: 0, maxHp: 0 }, maxMp: 5 },
  crystal_arcane: { name: "Cristal Arcano", rarity: "Poco común", desc: "+5 Energía máxima.", bonus: { atk: 0, def: 0, maxHp: 0 }, maxMp: 5 },
  medallion_assassin: { name: "Medallón del Asesino", rarity: "Raro", desc: "+5 Energía máxima y +5% crítico.", bonus: { atk: 0, def: 0, maxHp: 0 }, maxMp: 5, crit: 0.05 },
  boots_explorer: { name: "Botas del Explorador", rarity: "Raro", desc: "+1 Movimiento.", bonus: { atk: 0, def: 0, maxHp: 0 }, speed: 1 },
  compass_ancient: { name: "Brújula Antigua", rarity: "Épico", desc: "+10% oro obtenido.", bonus: { atk: 0, def: 0, maxHp: 0 }, passive: { desc: "+10% oro", type: "gold_bonus", value: 0.10 } },
  pendant_merchant: { name: "Colgante del Comerciante", rarity: "Épico", desc: "Precios reducidos 15%.", bonus: { atk: 0, def: 0, maxHp: 0 }, passive: { desc: "Precios -15%", type: "price_reduce", value: 0.15 } },
  talisman_wolf: { name: "Talismán del Lobo", rarity: "Raro", desc: "+5% crítico.", bonus: { atk: 0, def: 0, maxHp: 0 }, crit: 0.05 },
  emblem_atlas: { name: "Emblema de Atlas", rarity: "Legendario", desc: "Reduce la amenaza obtenida y aumenta las recompensas.", bonus: { atk: 0, def: 0, maxHp: 0 }, passive: { desc: "Amenaza -25%, recompensas +25%", type: "legendary_atlas", value: 0.25 }, sellable: false },
  charm_verde: { name: "Amuleto de Hojas", rarity: "Raro", desc: "+1 Def. Física, +3 Vida. Tejido con hojas del bosque.", bonus: { physDef: 1, maxHp: 3 }, region: "verde" },
  charm_fria: { name: "Amuleto de Escarcha", rarity: "Raro", desc: "+1 Def. Mágica, +3 Vida. Cristal de hielo encantado.", bonus: { magDef: 1, maxHp: 3 }, region: "fria" },
  charm_desierto: { name: "Amuleto de Dunas", rarity: "Raro", desc: "+1 Def. Física, +1 Def. Mágica. Reliquia del desierto.", bonus: { physDef: 1, magDef: 1 }, region: "desierto" },
};
Object.assign(ACCESSORIES, LOOT_ACCESSORIES);

export const STARTER_ACCESSORIES = ["anillo_fuerza"];
export const BOSS_DROPS = ["totem_ancestral", "corona_reinos", "manto_heroe"];

export const RARITY_VALUE = { Común: 8, "Poco común": 18, Raro: 40, "Épico": 90, Legendario: 0 };
export const RARITY_SELLABLE = { Común: true, "Poco común": true, Raro: true, "Épico": true, Legendario: false };

export const RARITY_COLOR = {
  Común: "text-slate-300 border-slate-600",
  "Poco común": "text-emerald-300 border-emerald-600",
  Raro: "text-sky-300 border-sky-600",
  "Épico": "text-violet-300 border-violet-600",
  Legendario: "text-amber-300 border-amber-500",
};

export function getBonuses(player) {
  let atk = 0, def = 0, magDef = 0, maxHp = 0, maxMp = 0, crit = 0, speed = 0;
  const passives = [];
  const lvl = player.level || 1;
  const myOff = CLASS_OFF_TYPE[player.class];
  const addOff = (offType, val) => { if (val && offType === myOff) atk += val; };

  if (lvl >= UNLOCK.racePassive && RACE_PASSIVES[player.race]) {
    const b = RACE_PASSIVES[player.race].bonus; atk += b.atk; def += b.def; maxHp += b.maxHp;
  }
  if (lvl >= UNLOCK.classPassive && CLASS_PASSIVES[player.class]) {
    const b = CLASS_PASSIVES[player.class].bonus; atk += b.atk; def += b.def; maxHp += b.maxHp;
  }

  if (player.accessory && ACCESSORIES[player.accessory]) {
    const a = ACCESSORIES[player.accessory];
    const b = a.bonus || {};
    addOff("atk", b.atk || 0);
    addOff("arcane", b.arcane || 0);
    addOff("precision", b.precision || 0);
    def += b.physDef || 0; magDef += b.magDef || 0;
    def += b.def || 0;
    maxHp += b.maxHp || 0;
    if (a.maxMp) maxMp += a.maxMp;
    if (a.crit) crit += a.crit;
    if (a.speed) speed += a.speed;
    if (a.passive) passives.push(a.passive);
  }

  const wDefId = resolveWeaponDefId(player, player.weapon);
  if (wDefId) {
    const w = WEAPONS[wDefId];
    const instance = resolveWeaponInstance(player, player.weapon);
    const ib = (instance && typeof instance !== "string") ? (instance.bonus || {}) : {};
    const s = w.stats || {};
    addOff(w.offType, (s.attack || 0) + (ib.attack || 0));
    maxMp += (s.maxMp || 0) + (ib.maxMp || 0);
    crit += (s.crit || 0) + (ib.crit || 0);
    speed += (s.speed || 0) + (ib.speed || 0);
    if (w.passive) passives.push(w.passive);
    if (instance?.passive) passives.push(instance.passive);
  }

  if (player.classWeapon && CLASS_WEAPONS[player.classWeapon]) {
    const w = CLASS_WEAPONS[player.classWeapon];
    const s = w.stats || {};
    addOff(w.offType, s.attack || 0);
    maxMp += s.maxMp || 0; crit += s.crit || 0; speed += s.speed || 0;
    atk += player.weaponUpgrades?.[player.classWeapon] || 0;
  }

  if (player.armor && ARMORS[player.armor]) {
    const a = ARMORS[player.armor];
    const s = a.stats || {};
    def += s.physDef || 0; magDef += s.magDef || 0;
    def += s.defense || 0;
    maxHp += s.maxHp || 0; maxMp += s.maxMp || 0;
    crit += s.crit || 0; speed += s.speed || 0;
    if (a.passive) passives.push(a.passive);
  }

  return { atk, def, magDef, maxHp, maxMp, crit, speed, passives };
}

export function recomputePlayer(p) {
  const b = getBonuses(p);
  const baseMaxHp = p.baseMaxHp ?? p.maxHp;
  const baseAttack = p.baseAttack ?? p.attack;
  const baseDefense = p.baseDefense ?? p.defense;
  const baseMagicalDefense = p.baseMagicalDefense ?? baseDefense;
  const baseMaxMp = p.baseMaxMp ?? p.maxMp;
  const newMaxHp = baseMaxHp + b.maxHp;
  const condition = p.equipmentCondition ?? 100;
  const weaponDurability = p.weaponDurability ?? condition ?? 100;
  const armorPenalty = condition < 25 ? 2 : condition < 50 ? 1 : 0;
  const weaponPenalty = weaponDurability <= 0 ? 3 : weaponDurability < 25 ? 2 : weaponDurability < 50 ? 1 : 0;
  const newAttack = Math.max(1, baseAttack + b.atk - weaponPenalty);
  const newPhysicalDefense = Math.max(0, baseDefense + b.def - armorPenalty);
  const newMagicalDefense = Math.max(0, baseMagicalDefense + (b.magDef || 0) - armorPenalty);
  const newMaxMp = Math.max(1, baseMaxMp + (b.maxMp || 0));
  const prevMaxHp = p.maxHp ?? newMaxHp;
  let hp = p.hp ?? newMaxHp;
  if (newMaxHp > prevMaxHp) hp = Math.min(newMaxHp, hp + (newMaxHp - prevMaxHp));
  else hp = Math.min(hp, newMaxHp);
  let mp = p.mp ?? newMaxMp;
  mp = Math.min(mp, newMaxMp);
  return { ...p, equipmentCondition: condition, weaponDurability, weaponDurabilityMax: p.weaponDurabilityMax ?? 100, baseMaxHp, baseAttack, baseDefense, baseMagicalDefense, baseMaxMp, attack: newAttack, defense: newPhysicalDefense, physicalDefense: newPhysicalDefense, magicalDefense: newMagicalDefense, maxHp: newMaxHp, hp, maxMp: newMaxMp, mp, crit: b.crit, speedBonus: b.speed, passives: b.passives };
}

export function getSkillSet(character) {
  const id = character.id;
  return {
    basic: { ...BASIC_ATTACKS[character.class], unlock: UNLOCK.basic, kind: "Ataque básico" },
    racePassive: { ...RACE_PASSIVES[character.race], unlock: UNLOCK.racePassive, kind: "Pasiva de raza" },
    raceAbility: { ...RACE_ABILITIES[id], unlock: UNLOCK.raceAbility, kind: "Habilidad de raza" },
    classPassive: { ...CLASS_PASSIVES[character.class], unlock: UNLOCK.classPassive, kind: "Pasiva de clase" },
    classAbility: { ...CLASS_ABILITIES[id], unlock: UNLOCK.classAbility, kind: "Habilidad de clase" },
    hybrid: { ...HYBRID_ABILITIES[id], unlock: UNLOCK.hybrid, kind: "Habilidad híbrida" },
  };
}