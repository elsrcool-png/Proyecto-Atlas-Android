// PROYECTO ATLAS — Equipamiento regional progresivo V2.21
// Catálogo maestro: tiendas por Campamento/Pueblo/Ciudad y botín separado.

export const EQUIPMENT_REGION_LEVELS = {
  verde: { start: 1, camp: 1, town: 4, city: 7, cap: 8 },
  fria: { start: 9, camp: 9, town: 12, city: 15, cap: 16 },
  desierto: { start: 17, camp: 17, town: 20, city: 23, cap: 25 },
};

export const EQUIPMENT_SLOT_UNLOCKS = {
  helmet: { bossId: "guardian_verde", regionId: "verde", label: "Casco" },
  accessory2: { bossId: "aurel_portador", regionId: "fria", label: "Accesorio II" },
};

export function equipmentUnlocksFromBosses(bosses = []) {
  const set = bosses instanceof Set ? bosses : new Set(bosses || []);
  return {
    helmet: set.has(EQUIPMENT_SLOT_UNLOCKS.helmet.bossId),
    accessory2: set.has(EQUIPMENT_SLOT_UNLOCKS.accessory2.bossId),
  };
}

export function equipmentStageForProgress(progress = 0) {
  if (progress >= 0.67) return "city";
  if (progress >= 0.34) return "town";
  return "camp";
}

export const WEAPON_OVERRIDES = {
  sword_thorn: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Espada de Espinas",
    rarity: "Común",
    offType: "atk",
    stats: {
      attack: 1
    },
    price: 14,
    desc: "Hoja sencilla del Campamento del Umbral."
  },
  wand_sapling: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    recommendedClass: "Mago",
    name: "Vara de Retoño",
    rarity: "Común",
    offType: "arcane",
    stats: {
      attack: 1,
      maxMp: 1
    },
    price: 14,
    desc: "Rama viva preparada para canalizar magia menor."
  },
  knife_bramble: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Cuchillos de Zarza",
    rarity: "Común",
    offType: "precision",
    stats: {
      attack: 1,
      crit: 0.03
    },
    price: 14,
    desc: "Filos cortos usados por exploradores del campamento."
  },
  sword_explorer: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Espada del Explorador",
    rarity: "Poco común",
    offType: "atk",
    stats: {
      attack: 2
    },
    passive: {
      desc: "+5% EXP",
      type: "xp_bonus",
      value: 0.05
    },
    price: 38,
    desc: "Afinada para los caminos de Robledal."
  },
  staff_hazel: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    recommendedClass: "Mago",
    name: "Bastón de Avellano",
    rarity: "Poco común",
    offType: "arcane",
    stats: {
      attack: 1,
      maxMp: 3
    },
    price: 40,
    desc: "Madera flexible elegida por los estudiosos de Robledal."
  },
  bow_hawthorn: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Arco de Espino",
    rarity: "Poco común",
    offType: "precision",
    stats: {
      attack: 2,
      hit: 0.05
    },
    price: 42,
    desc: "Arco ligero para patrullar senderos estrechos."
  },
  spear_guardian: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Lanza del Guardián",
    rarity: "Raro",
    offType: "atk",
    stats: {
      attack: 3
    },
    price: 76,
    desc: "Arma de la guardia de Verdalia."
  },
  robe_arcane_w: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    recommendedClass: "Mago",
    name: "Báculo del Bosque",
    rarity: "Raro",
    offType: "arcane",
    stats: {
      attack: 2,
      maxMp: 4
    },
    price: 78,
    desc: "Canaliza la magia natural de la Región Verde."
  },
  bow_verdant: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Arco del Bosque Ancestral",
    rarity: "Raro",
    offType: "precision",
    stats: {
      attack: 3,
      crit: 0.05
    },
    price: 80,
    desc: "Tallado con madera del bosque ancestral."
  },
  sword_rusty: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "loot",
    recommendedClass: "Guerrero",
    name: "Espada Oxidada",
    rarity: "Común",
    offType: "atk",
    stats: {
      attack: 1
    },
    price: 0,
    desc: "Botín deteriorado, todavía funcional."
  },
  axe_oak: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "loot",
    recommendedClass: "Guerrero",
    name: "Hacha de Roble Hendida",
    rarity: "Poco común",
    offType: "atk",
    stats: {
      attack: 3,
      speed: -1
    },
    price: 0,
    desc: "Pesada pieza recuperada de un enemigo del bosque."
  },
  staff_apprentice: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "loot",
    recommendedClass: "Mago",
    name: "Bastón Abandonado del Aprendiz",
    rarity: "Poco común",
    offType: "arcane",
    stats: {
      attack: 1,
      maxMp: 3
    },
    price: 0,
    desc: "Conserva residuos de magia natural."
  },
  bow_forest: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "loot",
    recommendedClass: "Pícaro",
    name: "Arco del Acechador Feral",
    rarity: "Raro",
    offType: "precision",
    stats: {
      attack: 3,
      hit: 0.08
    },
    price: 0,
    desc: "Arco recuperado de un cazador corrompido."
  },
  daggers_twin: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "loot",
    recommendedClass: "Pícaro",
    name: "Dagas Gemelas del Asesino Orco",
    rarity: "Raro",
    offType: "precision",
    stats: {
      attack: 2,
      crit: 0.1
    },
    price: 0,
    desc: "Dos filos desequilibrados, rápidos y peligrosos."
  },
  staff_sage: {
    region: "verde",
    settlement: "city",
    requiredLevel: 8,
    source: "loot",
    recommendedClass: "Mago",
    name: "Bastón del Sabio Caído",
    rarity: "Épico",
    offType: "arcane",
    stats: {
      attack: 3,
      maxMp: 5
    },
    passive: {
      desc: "Reduce el coste de magia en 1",
      type: "mp_cost_reduce",
      value: 1
    },
    price: 0,
    desc: "Una pieza excepcional que no aparece en tiendas."
  },
  hammer_dwarven: {
    region: "verde",
    settlement: "city",
    requiredLevel: 8,
    source: "loot",
    recommendedClass: "Guerrero",
    name: "Martillo Enano Perdido",
    rarity: "Épico",
    offType: "atk",
    stats: {
      attack: 4
    },
    passive: {
      desc: "Ignora 2 de defensa",
      type: "armor_pen",
      value: 2
    },
    price: 0,
    desc: "Forjado en piedra y recuperado como botín raro."
  },
  axe_frost: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Hacha de Escarcha",
    rarity: "Poco común",
    offType: "atk",
    stats: {
      attack: 3
    },
    price: 90,
    desc: "Hacha robusta del Campamento Boreal."
  },
  spear_glacier: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Lanza del Glaciar",
    rarity: "Épico",
    offType: "atk",
    stats: {
      attack: 5,
      crit: 0.05
    },
    price: 214,
    desc: "Tallada con cristal del glaciar eterno."
  },
  scimitar_sand: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Cimitarra del Desierto",
    rarity: "Raro",
    offType: "atk",
    stats: {
      attack: 5
    },
    price: 250,
    desc: "Cimitarra curva de los nómadas de las dunas."
  },
  staff_dune: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Mago",
    name: "Bastón de las Dunas",
    rarity: "Raro",
    offType: "arcane",
    stats: {
      attack: 4,
      maxMp: 9
    },
    price: 255,
    desc: "Tallado para canalizar magia bajo calor extremo."
  }
};
export const NEW_REGIONAL_WEAPONS = {
  staff_rime: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Mago",
    name: "Bastón de Cencellada",
    rarity: "Poco común",
    offType: "arcane",
    stats: {
      attack: 2,
      maxMp: 4
    },
    price: 92,
    desc: "Canalizador básico del Campamento Boreal."
  },
  knives_icefang: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Cuchillos Colmillo de Hielo",
    rarity: "Poco común",
    offType: "precision",
    stats: {
      attack: 2,
      crit: 0.06
    },
    price: 94,
    desc: "Filos cortos hechos para combatir sobre nieve."
  },
  sword_blizzard: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Espada de Ventisca",
    rarity: "Raro",
    offType: "atk",
    stats: {
      attack: 4
    },
    price: 138,
    desc: "Hoja templada en los vientos del Pueblo Glacial."
  },
  staff_glacial_sigil: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Mago",
    name: "Bastón del Sello Glacial",
    rarity: "Raro",
    offType: "arcane",
    stats: {
      attack: 3,
      maxMp: 6
    },
    price: 142,
    desc: "Amplifica conjuros y estabiliza la energía del portador."
  },
  daggers_rime: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Dagas de Escarcha Silente",
    rarity: "Raro",
    offType: "precision",
    stats: {
      attack: 3,
      crit: 0.08
    },
    price: 146,
    desc: "No reflejan luz sobre la nieve."
  },
  staff_crystal_heart: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Mago",
    name: "Báculo del Corazón de Cristal",
    rarity: "Épico",
    offType: "arcane",
    stats: {
      attack: 4,
      maxMp: 9
    },
    passive: {
      desc: "+10% resistencia mágica",
      type: "magic_resist",
      value: 0.1
    },
    price: 218,
    desc: "Obra mayor de los artesanos de la Ciudadela Helada."
  },
  twin_blades_zero: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Hojas Gemelas del Cero",
    rarity: "Épico",
    offType: "precision",
    stats: {
      attack: 4,
      crit: 0.12
    },
    price: 222,
    desc: "Filos que parecen inmóviles incluso al atacar."
  },
  blades_sirocco: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Hojas del Siroco",
    rarity: "Raro",
    offType: "precision",
    stats: {
      attack: 4,
      crit: 0.09
    },
    price: 260,
    desc: "Armas ligeras del Campamento Nómada."
  },
  saber_mirage: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Sable del Espejismo",
    rarity: "Épico",
    offType: "atk",
    stats: {
      attack: 6
    },
    price: 365,
    desc: "Su brillo distorsiona la distancia del golpe."
  },
  staff_sunstone: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Mago",
    name: "Bastón de Piedra Solar",
    rarity: "Épico",
    offType: "arcane",
    stats: {
      attack: 5,
      maxMp: 10
    },
    price: 375,
    desc: "Acumula calor arcano sin consumir la madera."
  },
  chakrams_dune: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Chakrams de las Dunas",
    rarity: "Épico",
    offType: "precision",
    stats: {
      attack: 5,
      crit: 0.11
    },
    price: 385,
    desc: "Discos de combate adaptados al viento del oasis."
  },
  blade_solar_crown: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Hoja de la Corona Solar",
    rarity: "Épico",
    offType: "atk",
    stats: {
      attack: 7
    },
    passive: {
      desc: "Ignora 1 de defensa",
      type: "armor_pen",
      value: 1
    },
    price: 545,
    desc: "Arma principal de la Ciudadela del Mercado."
  },
  staff_eternal_noon: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Mago",
    name: "Báculo del Mediodía Eterno",
    rarity: "Épico",
    offType: "arcane",
    stats: {
      attack: 6,
      maxMp: 13
    },
    passive: {
      desc: "Reduce el coste de magia en 1",
      type: "mp_cost_reduce",
      value: 1
    },
    price: 560,
    desc: "Mantiene una luz inmóvil en su núcleo."
  },
  daggers_eclipse: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Dagas del Eclipse",
    rarity: "Épico",
    offType: "precision",
    stats: {
      attack: 6,
      crit: 0.14
    },
    price: 575,
    desc: "Una hoja absorbe luz; la otra la devuelve."
  },
  bone_axe_frost: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "loot",
    recommendedClass: "Guerrero",
    name: "Hacha Ósea Congelada",
    rarity: "Poco común",
    offType: "atk",
    stats: {
      attack: 3
    },
    price: 0,
    desc: "Forjada con huesos endurecidos por el hielo."
  },
  wand_necrotic_rime: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "loot",
    recommendedClass: "Mago",
    name: "Vara de Escarcha Necrótica",
    rarity: "Raro",
    offType: "arcane",
    stats: {
      attack: 3,
      maxMp: 7
    },
    price: 0,
    desc: "Botín de un necromante de la tundra."
  },
  daggers_grave_ice: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "loot",
    recommendedClass: "Pícaro",
    name: "Dagas del Sepulcro Helado",
    rarity: "Épico",
    offType: "precision",
    stats: {
      attack: 5,
      crit: 0.12
    },
    price: 0,
    desc: "Armas exclusivas de los asesinos esqueléticos."
  },
  khopesh_ruined: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "loot",
    recommendedClass: "Guerrero",
    name: "Khopesh de Ruina",
    rarity: "Raro",
    offType: "atk",
    stats: {
      attack: 5
    },
    price: 0,
    desc: "Hoja desenterrada entre ruinas abrasadas."
  },
  staff_buried_oracle: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "loot",
    recommendedClass: "Mago",
    name: "Bastón del Oráculo Sepultado",
    rarity: "Épico",
    offType: "arcane",
    stats: {
      attack: 5,
      maxMp: 11
    },
    price: 0,
    desc: "Conserva ecos de una civilización enterrada."
  },
  blades_scorched_revenant: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "loot",
    recommendedClass: "Pícaro",
    name: "Filos del Retornado Calcinado",
    rarity: "Épico",
    offType: "precision",
    stats: {
      attack: 6,
      crit: 0.15
    },
    price: 0,
    desc: "Solo aparecen en enemigos avanzados de las ruinas."
  }
};
export const ARMOR_OVERRIDES = {
  armor_leaf: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Coraza de Hojas",
    rarity: "Común",
    stats: {
      physDef: 1,
      maxHp: 3
    },
    price: 14,
    desc: "Protección básica del Campamento del Umbral."
  },
  robe_sprout: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    recommendedClass: "Mago",
    name: "Túnica de Retoños",
    rarity: "Común",
    stats: {
      magDef: 1,
      maxMp: 2
    },
    price: 14,
    desc: "Tejido tratado por la herbolaria del campamento."
  },
  vest_scout: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Chaleco del Explorador",
    rarity: "Común",
    stats: {
      physDef: 1,
      speed: 1
    },
    price: 14,
    desc: "Protección ligera para moverse entre raíces."
  },
  armor_leather: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Armadura de Cuero Reforzado",
    rarity: "Poco común",
    stats: {
      physDef: 2,
      maxHp: 3
    },
    price: 38,
    desc: "Cuero tratado por los artesanos de Robledal."
  },
  robe_herbalist: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    recommendedClass: "Mago",
    name: "Túnica de la Herbolaria",
    rarity: "Poco común",
    stats: {
      magDef: 2,
      maxMp: 4
    },
    price: 40,
    desc: "Tela impregnada con resinas protectoras."
  },
  vest_ranger: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Coraza del Vigilante",
    rarity: "Poco común",
    stats: {
      physDef: 2,
      magDef: 1,
      maxHp: 3
    },
    price: 42,
    desc: "Equipo flexible de los Vigilantes del Sendero."
  },
  armor_iron: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Armadura de Hierro de Verdalia",
    rarity: "Raro",
    stats: {
      physDef: 4,
      magDef: 1,
      speed: -1
    },
    price: 78,
    desc: "Resistente y pesada, fabricada en la ciudad."
  },
  robe_arcane: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    recommendedClass: "Mago",
    name: "Túnica Arcana de Verdalia",
    rarity: "Raro",
    stats: {
      magDef: 3,
      maxMp: 8
    },
    price: 80,
    desc: "Tejida por el círculo arcano de la ciudad."
  },
  cloak_shadow: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Capa Sombría de Verdalia",
    rarity: "Raro",
    stats: {
      physDef: 1,
      magDef: 2,
      maxMp: 6,
      speed: 1
    },
    price: 82,
    desc: "Ropaje reforzado para operaciones discretas."
  },
  armor_adventurer: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "loot",
    name: "Ropa de Aventurero Dañada",
    rarity: "Común",
    stats: {
      maxHp: 5,
      physDef: 1
    },
    price: 0,
    desc: "Botín usado, útil al comienzo."
  },
  cloak_moss: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "loot",
    name: "Capa de Musgo Vivo",
    rarity: "Raro",
    stats: {
      physDef: 1,
      magDef: 2,
      maxHp: 5
    },
    price: 0,
    desc: "Crece lentamente sobre quien la porta."
  },
  armor_guardian: {
    region: "verde",
    settlement: "city",
    requiredLevel: 8,
    source: "loot",
    name: "Coraza del Guardián Menor",
    rarity: "Épico",
    stats: {
      physDef: 4,
      magDef: 2,
      maxHp: 10
    },
    price: 0,
    desc: "Protección rara recuperada de un guardián antiguo."
  },
  armor_runic: {
    region: "verde",
    settlement: "city",
    requiredLevel: 8,
    source: "loot",
    name: "Armadura Rúnica Quebrada",
    rarity: "Épico",
    stats: {
      physDef: 2,
      magDef: 4
    },
    passive: {
      desc: "Reduce daño mágico 15%",
      type: "magic_resist",
      value: 0.15
    },
    price: 0,
    desc: "Las runas siguen activas pese a las fracturas."
  },
  armor_pelt: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Piel del Norte",
    rarity: "Poco común",
    stats: {
      physDef: 3,
      maxHp: 6
    },
    price: 92,
    desc: "Protección gruesa del Campamento Boreal."
  },
  armor_frost: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Coraza de Escarcha",
    rarity: "Épico",
    stats: {
      physDef: 5,
      magDef: 2,
      maxHp: 8
    },
    price: 220,
    desc: "Escarcha endurecida sobre una estructura metálica."
  },
  armor_silk: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Mago",
    name: "Seda del Oasis",
    rarity: "Raro",
    stats: {
      magDef: 5,
      maxMp: 9
    },
    price: 258,
    desc: "Seda ligera preparada para disipar calor mágico."
  },
  armor_bronze: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Bronce del Sol Eterno",
    rarity: "Épico",
    stats: {
      physDef: 8,
      magDef: 3,
      maxHp: 12,
      speed: -1
    },
    price: 565,
    desc: "Armadura ceremonial convertida en una fortaleza móvil."
  }
};
export const NEW_REGIONAL_ARMORS = {
  robe_aurora: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Mago",
    name: "Túnica de Aurora",
    rarity: "Poco común",
    stats: {
      magDef: 3,
      maxMp: 6
    },
    price: 94,
    desc: "Vestimenta inicial de los estudiosos boreales."
  },
  vest_white_trail: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Chaleco del Rastro Blanco",
    rarity: "Poco común",
    stats: {
      physDef: 2,
      magDef: 2,
      speed: 1
    },
    price: 96,
    desc: "Oculta el movimiento sobre nieve abierta."
  },
  armor_icebound: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Armadura Vinculada al Hielo",
    rarity: "Raro",
    stats: {
      physDef: 4,
      magDef: 2,
      maxHp: 7
    },
    price: 145,
    desc: "Placas unidas con resina glacial."
  },
  robe_runic_snow: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Mago",
    name: "Túnica de Nieve Rúnica",
    rarity: "Raro",
    stats: {
      magDef: 4,
      maxMp: 8
    },
    price: 148,
    desc: "Las runas mantienen estable el flujo mágico."
  },
  cloak_blizzard: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Capa de Ventisca",
    rarity: "Raro",
    stats: {
      physDef: 2,
      magDef: 3,
      speed: 1
    },
    price: 152,
    desc: "La tela dispersa la silueta en movimiento."
  },
  robe_crystal_council: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Mago",
    name: "Vestidura del Consejo de Cristal",
    rarity: "Épico",
    stats: {
      magDef: 5,
      maxMp: 11
    },
    price: 224,
    desc: "Reservada para los magos de la Ciudadela Helada."
  },
  mantle_white_shadow: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Manto de la Sombra Blanca",
    rarity: "Épico",
    stats: {
      physDef: 3,
      magDef: 4,
      speed: 1,
      crit: 0.03
    },
    price: 228,
    desc: "Desvía la vista justo antes del golpe."
  },
  armor_sunhide: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Coraza de Cuero Solar",
    rarity: "Raro",
    stats: {
      physDef: 6,
      maxHp: 9
    },
    price: 255,
    desc: "Cuero endurecido por calor y aceites minerales."
  },
  vest_dune_runner: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Chaleco del Corredor de Dunas",
    rarity: "Raro",
    stats: {
      physDef: 4,
      magDef: 2,
      speed: 1
    },
    price: 262,
    desc: "No atrapa arena durante movimientos rápidos."
  },
  armor_scarab: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Armadura del Escarabajo",
    rarity: "Épico",
    stats: {
      physDef: 7,
      magDef: 2,
      maxHp: 10
    },
    price: 372,
    desc: "Placas superpuestas inspiradas en caparazones del oasis."
  },
  robe_mirage: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Mago",
    name: "Túnica del Espejismo",
    rarity: "Épico",
    stats: {
      magDef: 6,
      maxMp: 12
    },
    price: 382,
    desc: "Desvía calor y energía a través de capas ilusorias."
  },
  mantle_sirocco: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Manto del Siroco",
    rarity: "Épico",
    stats: {
      physDef: 4,
      magDef: 4,
      speed: 1,
      crit: 0.03
    },
    price: 392,
    desc: "Acompaña el movimiento sin ofrecer resistencia."
  },
  robe_solar_oracle: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Mago",
    name: "Vestidura del Oráculo Solar",
    rarity: "Épico",
    stats: {
      magDef: 8,
      maxMp: 15
    },
    passive: {
      desc: "+10% resistencia mágica",
      type: "magic_resist",
      value: 0.1
    },
    price: 575,
    desc: "Vestimenta mayor de los guardianes del conocimiento solar."
  },
  cloak_eclipse: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Capa del Eclipse",
    rarity: "Épico",
    stats: {
      physDef: 5,
      magDef: 5,
      speed: 2,
      crit: 0.04
    },
    price: 585,
    desc: "Alterna entre brillo abrasador y sombra absoluta."
  },
  mail_frozen_dead: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "loot",
    name: "Malla del Muerto Congelado",
    rarity: "Poco común",
    stats: {
      physDef: 3,
      magDef: 1,
      maxHp: 5
    },
    price: 0,
    desc: "Malla recuperada de un guerrero esquelético."
  },
  robe_necromancer_frost: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "loot",
    name: "Ropaje del Necromante de Escarcha",
    rarity: "Raro",
    stats: {
      magDef: 5,
      maxMp: 8
    },
    price: 0,
    desc: "Conserva una energía incómodamente fría."
  },
  shroud_skeleton_assassin: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "loot",
    name: "Sudario del Asesino Esquelético",
    rarity: "Épico",
    stats: {
      physDef: 3,
      magDef: 4,
      speed: 2,
      crit: 0.04
    },
    price: 0,
    desc: "Botín exclusivo de enemigos avanzados."
  },
  mail_sand_worn: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "loot",
    name: "Malla Desgastada por Arena",
    rarity: "Raro",
    stats: {
      physDef: 6,
      maxHp: 8
    },
    price: 0,
    desc: "Miles de impactos de arena pulieron sus placas."
  },
  robe_buried_priest: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "loot",
    name: "Ropaje del Sacerdote Sepultado",
    rarity: "Épico",
    stats: {
      magDef: 7,
      maxMp: 13
    },
    price: 0,
    desc: "Una vestidura ritual hallada bajo las dunas."
  },
  shroud_ashen_raider: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "loot",
    name: "Sudario del Saqueador de Ceniza",
    rarity: "Épico",
    stats: {
      physDef: 5,
      magDef: 5,
      speed: 2,
      crit: 0.05
    },
    price: 0,
    desc: "Nunca se ofrece en comercios."
  }
};
export const HELMETS = {
  helm_boreal_guard: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Yelmo del Guardia Boreal",
    rarity: "Poco común",
    stats: {
      physDef: 1,
      magDef: 1,
      maxHp: 3
    },
    price: 72,
    desc: "Primer casco disponible tras liberar Región Verde."
  },
  hood_frost_scholar: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Mago",
    name: "Capucha del Erudito de Escarcha",
    rarity: "Poco común",
    stats: {
      magDef: 2,
      maxMp: 3
    },
    price: 74,
    desc: "Protege la concentración del frío exterior."
  },
  mask_white_hunter: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Máscara del Cazador Blanco",
    rarity: "Poco común",
    stats: {
      physDef: 1,
      crit: 0.03
    },
    price: 76,
    desc: "Reduce reflejos visibles sobre la nieve."
  },
  helm_icewatch: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Yelmo de la Guardia Glacial",
    rarity: "Raro",
    stats: {
      physDef: 2,
      magDef: 1,
      maxHp: 4
    },
    price: 112,
    desc: "Utilizado por la defensa del Pueblo Glacial."
  },
  crown_aurora: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Mago",
    name: "Corona de Aurora",
    rarity: "Raro",
    stats: {
      magDef: 3,
      maxMp: 5
    },
    price: 116,
    desc: "Concentra luz boreal alrededor de la mente."
  },
  hood_snow_stalker: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Capucha del Acechador de Nieve",
    rarity: "Raro",
    stats: {
      physDef: 1,
      magDef: 1,
      crit: 0.05
    },
    price: 118,
    desc: "Diseñada para rastrear sin ser rastreado."
  },
  helm_aurel_guard: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Yelmo del Último Portador",
    rarity: "Épico",
    stats: {
      physDef: 3,
      magDef: 2,
      maxHp: 6
    },
    price: 172,
    desc: "Réplica de la armadura ceremonial de Aurel."
  },
  diadem_ice_core: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Mago",
    name: "Diadema del Núcleo de Hielo",
    rarity: "Épico",
    stats: {
      magDef: 4,
      maxMp: 7
    },
    price: 176,
    desc: "Mantiene un fragmento glacial en suspensión."
  },
  mask_frozen_moon: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Máscara de la Luna Congelada",
    rarity: "Épico",
    stats: {
      physDef: 2,
      magDef: 2,
      crit: 0.07
    },
    price: 180,
    desc: "La superficie no revela expresión alguna."
  },
  helm_dune_guard: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Yelmo del Guardia de Dunas",
    rarity: "Raro",
    stats: {
      physDef: 3,
      magDef: 1,
      maxHp: 5
    },
    price: 205,
    desc: "Protege de arena y golpes frontales."
  },
  veil_oasis_sage: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Mago",
    name: "Velo del Sabio del Oasis",
    rarity: "Raro",
    stats: {
      magDef: 4,
      maxMp: 6
    },
    price: 210,
    desc: "Conserva humedad y claridad mental."
  },
  goggles_sand_scout: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Visor del Explorador de Arena",
    rarity: "Raro",
    stats: {
      physDef: 2,
      crit: 0.05,
      speed: 1
    },
    price: 215,
    desc: "Mantiene visión estable durante tormentas."
  },
  helm_scarab: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Yelmo del Escarabajo Dorado",
    rarity: "Épico",
    stats: {
      physDef: 4,
      magDef: 2,
      maxHp: 7
    },
    price: 305,
    desc: "Caparazón metálico de gran resistencia."
  },
  circlet_mirage: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Mago",
    name: "Círculo del Espejismo",
    rarity: "Épico",
    stats: {
      magDef: 5,
      maxMp: 8
    },
    price: 312,
    desc: "Multiplica las señales arcanas alrededor del portador."
  },
  hood_sirocco: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Capucha del Siroco",
    rarity: "Épico",
    stats: {
      physDef: 2,
      magDef: 2,
      crit: 0.07,
      speed: 1
    },
    price: 318,
    desc: "Permanece inmóvil incluso bajo viento violento."
  },
  helm_solar_bastion: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Guerrero",
    name: "Yelmo del Bastión Solar",
    rarity: "Épico",
    stats: {
      physDef: 5,
      magDef: 3,
      maxHp: 9
    },
    price: 455,
    desc: "La cúspide defensiva de la Región Árida."
  },
  crown_eternal_noon: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Mago",
    name: "Corona del Mediodía Eterno",
    rarity: "Épico",
    stats: {
      magDef: 6,
      maxMp: 10
    },
    price: 465,
    desc: "Convierte luz y calor en energía estable."
  },
  mask_eclipse: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    recommendedClass: "Pícaro",
    name: "Máscara del Eclipse",
    rarity: "Épico",
    stats: {
      physDef: 3,
      magDef: 3,
      crit: 0.09,
      speed: 1
    },
    price: 475,
    desc: "Oculta al portador entre luz extrema y sombra."
  },
  skull_icebound: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "loot",
    name: "Cráneo Encadenado al Hielo",
    rarity: "Poco común",
    stats: {
      physDef: 2,
      maxHp: 3
    },
    price: 0,
    desc: "Casco improvisado de origen no muerto."
  },
  hood_dead_seer: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "loot",
    name: "Capucha del Vidente Muerto",
    rarity: "Raro",
    stats: {
      magDef: 3,
      maxMp: 6
    },
    price: 0,
    desc: "El tejido murmura cuando hay magia cerca."
  },
  mask_bone_hunter: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "loot",
    name: "Máscara del Cazador Óseo",
    rarity: "Épico",
    stats: {
      physDef: 2,
      magDef: 2,
      crit: 0.08
    },
    price: 0,
    desc: "Solo cae de élites y enemigos avanzados."
  },
  helm_broken_sun: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "loot",
    name: "Yelmo del Sol Quebrado",
    rarity: "Raro",
    stats: {
      physDef: 4,
      maxHp: 6
    },
    price: 0,
    desc: "Una insignia antigua permanece partida en dos."
  },
  veil_dust_prophet: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "loot",
    name: "Velo del Profeta de Polvo",
    rarity: "Épico",
    stats: {
      magDef: 5,
      maxMp: 9
    },
    price: 0,
    desc: "Hallado en guardianes rituales de las ruinas."
  },
  mask_ashen_jackal: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "loot",
    name: "Máscara del Chacal de Ceniza",
    rarity: "Épico",
    stats: {
      physDef: 3,
      magDef: 3,
      crit: 0.1
    },
    price: 0,
    desc: "Botín exclusivo de los depredadores finales."
  }
};
export const ACCESSORY_OVERRIDES = {
  anillo_fuerza: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    name: "Anillo de Fuerza",
    rarity: "Común",
    desc: "+1 ATK físico. Pieza básica del campamento.",
    bonus: {
      atk: 1
    },
    price: 14
  },
  capa_resistencia: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    name: "Capa de Resistencia",
    rarity: "Común",
    desc: "+1 Def. Física. Tela resistente al daño.",
    bonus: {
      physDef: 1
    },
    price: 14
  },
  amuleto_vida: {
    region: "verde",
    settlement: "camp",
    requiredLevel: 1,
    source: "shop",
    name: "Amuleto de Vida",
    rarity: "Común",
    desc: "+2 Vida máxima. Pulsa con energía vital.",
    bonus: {
      maxHp: 2
    },
    price: 14
  },
  amulet_vitality: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    name: "Amuleto de Vitalidad",
    rarity: "Poco común",
    desc: "+6 Vida máxima.",
    bonus: {
      maxHp: 6
    },
    price: 40
  },
  ring_warrior: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    name: "Anillo del Impulso",
    rarity: "Poco común",
    desc: "+3 Energía máxima.",
    bonus: {},
    maxMp: 3,
    price: 40
  },
  crystal_arcane: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "shop",
    name: "Cristal Arcano Menor",
    rarity: "Poco común",
    desc: "+1 Poder Arcano y +2 Energía.",
    bonus: {
      arcane: 1
    },
    maxMp: 2,
    price: 42
  },
  escudo_portatil: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    name: "Escudo Portátil",
    rarity: "Raro",
    desc: "+2 Def. Física. Se despliega ante el peligro.",
    bonus: {
      physDef: 2
    },
    price: 78
  },
  brazal_arcano: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    name: "Brazal del Mago",
    rarity: "Raro",
    desc: "+2 Poder Arcano.",
    bonus: {
      arcane: 2
    },
    price: 80
  },
  corazon_leon: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "shop",
    name: "Corazón de León",
    rarity: "Raro",
    desc: "+5 Vida máxima.",
    bonus: {
      maxHp: 5
    },
    price: 82
  },
  talisman_wolf: {
    region: "verde",
    settlement: "town",
    requiredLevel: 4,
    source: "loot",
    name: "Talismán del Lobo Salvaje",
    rarity: "Raro",
    desc: "+5% crítico. Solo se obtiene como botín.",
    bonus: {},
    crit: 0.05,
    price: 0
  },
  boots_explorer: {
    region: "verde",
    settlement: "city",
    requiredLevel: 7,
    source: "loot",
    name: "Botas del Explorador Perdido",
    rarity: "Raro",
    desc: "+1 Movimiento. Solo botín.",
    bonus: {},
    speed: 1,
    price: 0
  },
  compass_ancient: {
    region: "verde",
    settlement: "city",
    requiredLevel: 8,
    source: "loot",
    name: "Brújula Antigua",
    rarity: "Épico",
    desc: "+10% oro obtenido.",
    bonus: {},
    passive: {
      desc: "+10% oro",
      type: "gold_bonus",
      value: 0.1
    },
    price: 0
  },
  pendant_merchant: {
    region: "verde",
    settlement: "city",
    requiredLevel: 8,
    source: "loot",
    name: "Colgante del Comerciante Caído",
    rarity: "Épico",
    desc: "Precios reducidos 15%.",
    bonus: {},
    passive: {
      desc: "Precios -15%",
      type: "price_reduce",
      value: 0.15
    },
    price: 0
  },
  charm_fria: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    name: "Amuleto de Escarcha",
    rarity: "Poco común",
    desc: "+1 Def. Mágica y +4 Vida.",
    bonus: {
      magDef: 1,
      maxHp: 4
    },
    price: 74
  },
  charm_desierto: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    name: "Amuleto de Dunas",
    rarity: "Raro",
    desc: "+2 Def. Física y +2 Def. Mágica.",
    bonus: {
      physDef: 2,
      magDef: 2
    },
    price: 210
  }
};
export const NEW_REGIONAL_ACCESSORIES = {
  boots_boreal: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    name: "Botas del Caminante Boreal",
    rarity: "Poco común",
    desc: "+1 Movimiento. Favorecen los viajes árticos.",
    bonus: {},
    speed: 1,
    passive: {
      desc: "+1 a viajes en Región Ártica",
      type: "regional_travel_bonus",
      region: "fria",
      value: 1
    },
    price: 76
  },
  rune_warmth: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "shop",
    name: "Runa de Calor Interior",
    rarity: "Poco común",
    desc: "+5 Vida máxima.",
    bonus: {
      maxHp: 5
    },
    price: 78
  },
  ring_glacial_pulse: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    name: "Anillo del Pulso Glacial",
    rarity: "Raro",
    desc: "+6 Energía máxima.",
    bonus: {},
    maxMp: 6,
    price: 116
  },
  pendant_silent_winter: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    name: "Colgante del Invierno Silente",
    rarity: "Raro",
    desc: "+2 Def. Mágica.",
    bonus: {
      magDef: 2
    },
    passive: {
      desc: "+10% resistencia a estados",
      type: "status_resist",
      value: 0.1
    },
    price: 120
  },
  clasp_aurora: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "shop",
    name: "Broche de Aurora",
    rarity: "Raro",
    desc: "+1 a la estadística ofensiva de tu clase y +3 Energía.",
    bonus: {
      atk: 1,
      arcane: 1,
      precision: 1
    },
    maxMp: 3,
    price: 124
  },
  amulet_frozen_heart: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    name: "Amuleto del Corazón Congelado",
    rarity: "Épico",
    desc: "+6 Vida y anula la primera Parálisis de cada combate.",
    bonus: {
      maxHp: 6
    },
    passive: {
      desc: "Anula la primera Parálisis",
      type: "first_paralysis_immunity",
      value: 1
    },
    price: 178
  },
  ring_eternal_ice: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    name: "Anillo de Hielo Eterno",
    rarity: "Épico",
    desc: "+1 ofensiva de clase y +5% crítico.",
    bonus: {
      atk: 1,
      arcane: 1,
      precision: 1
    },
    crit: 0.05,
    price: 182
  },
  emblem_boreal: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "shop",
    name: "Emblema Boreal",
    rarity: "Épico",
    desc: "+2 Def. Física, +2 Def. Mágica y +4 Vida.",
    bonus: {
      physDef: 2,
      magDef: 2,
      maxHp: 4
    },
    price: 186
  },
  anklet_dune: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    name: "Tobillera de las Dunas",
    rarity: "Raro",
    desc: "+1 Movimiento y +4 Vida.",
    bonus: {
      maxHp: 4
    },
    speed: 1,
    price: 215
  },
  seal_oasis: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "shop",
    name: "Sello del Oasis",
    rarity: "Raro",
    desc: "+7 Energía máxima.",
    bonus: {},
    maxMp: 7,
    price: 220
  },
  ring_sunstone: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    name: "Anillo de Piedra Solar",
    rarity: "Épico",
    desc: "+2 a la estadística ofensiva de tu clase.",
    bonus: {
      atk: 2,
      arcane: 2,
      precision: 2
    },
    price: 315
  },
  pendant_sirocco: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    name: "Colgante del Siroco",
    rarity: "Épico",
    desc: "+1 Movimiento y +6% crítico.",
    bonus: {},
    speed: 1,
    crit: 0.06,
    price: 322
  },
  scarab_luck: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "shop",
    name: "Escarabajo de la Fortuna",
    rarity: "Épico",
    desc: "+15% oro obtenido.",
    bonus: {},
    passive: {
      desc: "+15% oro",
      type: "gold_bonus",
      value: 0.15
    },
    price: 328
  },
  heart_eternal_noon: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    name: "Corazón del Mediodía Eterno",
    rarity: "Épico",
    desc: "+10 Vida y +2 Def. Mágica.",
    bonus: {
      maxHp: 10,
      magDef: 2
    },
    price: 468
  },
  eclipse_token: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    name: "Ficha del Eclipse",
    rarity: "Épico",
    desc: "+2 ofensiva de clase y +8% crítico.",
    bonus: {
      atk: 2,
      arcane: 2,
      precision: 2
    },
    crit: 0.08,
    price: 478
  },
  atlas_sandglass: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "shop",
    name: "Reloj de Arena de Atlas",
    rarity: "Épico",
    desc: "+8 Energía y reduce precios 10%.",
    bonus: {},
    maxMp: 8,
    passive: {
      desc: "Precios -10%",
      type: "price_reduce",
      value: 0.1
    },
    price: 488
  },
  fingerbone_ring: {
    region: "fria",
    settlement: "camp",
    requiredLevel: 9,
    source: "loot",
    name: "Anillo de Falange Helada",
    rarity: "Poco común",
    desc: "+4 Vida y +1 Def. Mágica.",
    bonus: {
      maxHp: 4,
      magDef: 1
    },
    price: 0
  },
  phylactery_chip: {
    region: "fria",
    settlement: "town",
    requiredLevel: 12,
    source: "loot",
    name: "Esquirla de Filacteria",
    rarity: "Raro",
    desc: "+7 Energía máxima.",
    bonus: {},
    maxMp: 7,
    price: 0
  },
  rune_dead_winter: {
    region: "fria",
    settlement: "city",
    requiredLevel: 15,
    source: "loot",
    name: "Runa del Invierno Muerto",
    rarity: "Épico",
    desc: "+2 Def. Mágica y +6% crítico.",
    bonus: {
      magDef: 2
    },
    crit: 0.06,
    price: 0
  },
  scarab_cracked: {
    region: "desierto",
    settlement: "camp",
    requiredLevel: 17,
    source: "loot",
    name: "Escarabajo Agrietado",
    rarity: "Raro",
    desc: "+6 Vida y +1 Def. Física.",
    bonus: {
      maxHp: 6,
      physDef: 1
    },
    price: 0
  },
  eye_sandstorm: {
    region: "desierto",
    settlement: "town",
    requiredLevel: 20,
    source: "loot",
    name: "Ojo de la Tormenta de Arena",
    rarity: "Épico",
    desc: "+7% crítico y +1 Movimiento.",
    bonus: {},
    crit: 0.07,
    speed: 1,
    price: 0
  },
  seal_fallen_sun: {
    region: "desierto",
    settlement: "city",
    requiredLevel: 23,
    source: "loot",
    name: "Sello del Sol Caído",
    rarity: "Épico",
    desc: "+2 ofensiva de clase, +2 Def. Mágica.",
    bonus: {
      atk: 2,
      arcane: 2,
      precision: 2,
      magDef: 2
    },
    price: 0
  }
};
export const REGIONAL_SHOP_STOCK = {
  verde: {
    camp: {
      label: "Campamento del Umbral",
      weapons: [
        "sword_thorn",
        "wand_sapling",
        "knife_bramble"
      ],
      armors: [
        "armor_leaf",
        "robe_sprout",
        "vest_scout"
      ],
      helmets: [],
      accessories: [
        "anillo_fuerza",
        "capa_resistencia",
        "amuleto_vida"
      ],
      requiredFlag: "verde:camp_basic_stock"
    },
    town: {
      label: "Pueblo de Robledal",
      weapons: [
        "sword_explorer",
        "staff_hazel",
        "bow_hawthorn"
      ],
      armors: [
        "armor_leather",
        "robe_herbalist",
        "vest_ranger"
      ],
      helmets: [],
      accessories: [
        "amulet_vitality",
        "ring_warrior",
        "crystal_arcane"
      ],
      requiredFlag: "verde:trade_route_partial"
    },
    city: {
      label: "Ciudad de Verdalia",
      weapons: [
        "spear_guardian",
        "robe_arcane_w",
        "bow_verdant"
      ],
      armors: [
        "armor_iron",
        "robe_arcane",
        "cloak_shadow"
      ],
      helmets: [],
      accessories: [
        "escudo_portatil",
        "brazal_arcano",
        "corazon_leon"
      ],
      requiredFlag: "verde:city_services_open"
    }
  },
  fria: {
    camp: {
      label: "Campamento Boreal",
      weapons: [
        "axe_frost",
        "staff_rime",
        "knives_icefang"
      ],
      armors: [
        "armor_pelt",
        "robe_aurora",
        "vest_white_trail"
      ],
      helmets: [
        "helm_boreal_guard",
        "hood_frost_scholar",
        "mask_white_hunter"
      ],
      accessories: [
        "charm_fria",
        "boots_boreal",
        "rune_warmth"
      ]
    },
    town: {
      label: "Pueblo Glacial",
      weapons: [
        "sword_blizzard",
        "staff_glacial_sigil",
        "daggers_rime"
      ],
      armors: [
        "armor_icebound",
        "robe_runic_snow",
        "cloak_blizzard"
      ],
      helmets: [
        "helm_icewatch",
        "crown_aurora",
        "hood_snow_stalker"
      ],
      accessories: [
        "ring_glacial_pulse",
        "pendant_silent_winter",
        "clasp_aurora"
      ]
    },
    city: {
      label: "Ciudadela Helada",
      weapons: [
        "spear_glacier",
        "staff_crystal_heart",
        "twin_blades_zero"
      ],
      armors: [
        "armor_frost",
        "robe_crystal_council",
        "mantle_white_shadow"
      ],
      helmets: [
        "helm_aurel_guard",
        "diadem_ice_core",
        "mask_frozen_moon"
      ],
      accessories: [
        "amulet_frozen_heart",
        "ring_eternal_ice",
        "emblem_boreal"
      ]
    }
  },
  desierto: {
    camp: {
      label: "Campamento Nómada",
      weapons: [
        "scimitar_sand",
        "staff_dune",
        "blades_sirocco"
      ],
      armors: [
        "armor_sunhide",
        "armor_silk",
        "vest_dune_runner"
      ],
      helmets: [
        "helm_dune_guard",
        "veil_oasis_sage",
        "goggles_sand_scout"
      ],
      accessories: [
        "charm_desierto",
        "anklet_dune",
        "seal_oasis"
      ]
    },
    town: {
      label: "Pueblo del Oasis",
      weapons: [
        "saber_mirage",
        "staff_sunstone",
        "chakrams_dune"
      ],
      armors: [
        "armor_scarab",
        "robe_mirage",
        "mantle_sirocco"
      ],
      helmets: [
        "helm_scarab",
        "circlet_mirage",
        "hood_sirocco"
      ],
      accessories: [
        "ring_sunstone",
        "pendant_sirocco",
        "scarab_luck"
      ]
    },
    city: {
      label: "Ciudadela del Mercado",
      weapons: [
        "blade_solar_crown",
        "staff_eternal_noon",
        "daggers_eclipse"
      ],
      armors: [
        "armor_bronze",
        "robe_solar_oracle",
        "cloak_eclipse"
      ],
      helmets: [
        "helm_solar_bastion",
        "crown_eternal_noon",
        "mask_eclipse"
      ],
      accessories: [
        "heart_eternal_noon",
        "eclipse_token",
        "atlas_sandglass"
      ]
    }
  }
};
export const REGIONAL_LOOT_EQUIPMENT = {
  verde: {
    camp: {
      Común: [
        "sword_rusty",
        "armor_adventurer"
      ]
    },
    town: {
      "Poco común": [
        "axe_oak",
        "staff_apprentice"
      ],
      Raro: [
        "cloak_moss",
        "talisman_wolf"
      ]
    },
    city: {
      Raro: [
        "bow_forest",
        "daggers_twin",
        "boots_explorer"
      ],
      Épico: [
        "staff_sage",
        "hammer_dwarven",
        "armor_guardian",
        "armor_runic",
        "compass_ancient",
        "pendant_merchant"
      ]
    }
  },
  fria: {
    camp: {
      "Poco común": [
        "bone_axe_frost",
        "mail_frozen_dead",
        "skull_icebound",
        "fingerbone_ring"
      ]
    },
    town: {
      Raro: [
        "wand_necrotic_rime",
        "robe_necromancer_frost",
        "hood_dead_seer",
        "phylactery_chip"
      ]
    },
    city: {
      Épico: [
        "daggers_grave_ice",
        "shroud_skeleton_assassin",
        "mask_bone_hunter",
        "rune_dead_winter"
      ]
    }
  },
  desierto: {
    camp: {
      Raro: [
        "khopesh_ruined",
        "mail_sand_worn",
        "helm_broken_sun",
        "scarab_cracked"
      ]
    },
    town: {
      Épico: [
        "staff_buried_oracle",
        "robe_buried_priest",
        "veil_dust_prophet",
        "eye_sandstorm"
      ]
    },
    city: {
      Épico: [
        "blades_scorched_revenant",
        "shroud_ashen_raider",
        "mask_ashen_jackal",
        "seal_fallen_sun"
      ]
    }
  }
};

export function applyWeaponCatalog(target) {
  Object.assign(target, NEW_REGIONAL_WEAPONS);
  for (const [id, patch] of Object.entries(WEAPON_OVERRIDES)) {
    if (target[id]) target[id] = { ...target[id], ...patch };
  }
  return target;
}

export function applyArmorCatalog(target) {
  Object.assign(target, NEW_REGIONAL_ARMORS);
  for (const [id, patch] of Object.entries(ARMOR_OVERRIDES)) {
    if (target[id]) target[id] = { ...target[id], ...patch };
  }
  return target;
}

export function applyAccessoryCatalog(target) {
  Object.assign(target, NEW_REGIONAL_ACCESSORIES);
  for (const [id, patch] of Object.entries(ACCESSORY_OVERRIDES)) {
    if (target[id]) target[id] = { ...target[id], ...patch };
  }
  return target;
}
