// PROYECTO ATLAS — Sprites pixel art del jugador (HD 2D, estilo GBA/JRPG)
export const PLAYER_SPRITES = {
  Guerrero: "https://media.base44.com/images/public/6a508459ae691da9bade1664/8e07c670c_generated_image.png",
  Mago: "https://media.base44.com/images/public/6a508459ae691da9bade1664/a0996d2ed_generated_image.png",
  "Pícaro": "https://media.base44.com/images/public/6a508459ae691da9bade1664/6a1da209a_generated_image.png",
};

export const getPlayerSprite = (cls) => PLAYER_SPRITES[cls] || null;

export const BOSS_SPRITES = {
  guardian_verde: "/assets/atlas/enemies/maestro_v1/runtime/guardian_verde/down.webp",
  aurel_portador: "/assets/atlas/enemies/maestro_v1/runtime/aurel_ultimo_portador/down.webp",
  rey_orco: "https://media.base44.com/images/public/6a508459ae691da9bade1664/4dc137592_generated_image.png",
  dragon: "https://media.base44.com/images/public/6a508459ae691da9bade1664/40c56fe48_generated_image.png",
  lich: "https://media.base44.com/images/public/6a508459ae691da9bade1664/c4cfd7663_generated_image.png",
};

export const getBossSprite = (id) => BOSS_SPRITES[id] || null;

export const MONSTER_SPRITES = {
  orco_bruto: "/assets/atlas/enemies/maestro_v1/runtime/orco_bruto/down.webp",
  chaman_orco: "/assets/atlas/enemies/maestro_v1/runtime/chaman_orco/down.webp",
  asesino_orco: "/assets/atlas/enemies/maestro_v1/runtime/asesino_orco/down.webp",
  lobo_salvaje: "/assets/atlas/enemies/maestro_v1/runtime/lobo_salvaje/down.webp",
  brujo_feral: "/assets/atlas/enemies/maestro_v1/runtime/brujo_feral/down.webp",
  pantera_sombria: "/assets/atlas/enemies/maestro_v1/runtime/pantera_sombria/down.webp",
  guerrero_esqueletico: "/assets/atlas/enemies/maestro_v1/runtime/guerrero_esqueletico/down.webp",
  necromante: "/assets/atlas/enemies/maestro_v1/runtime/necromante/down.webp",
  asesino_esqueletico: "/assets/atlas/enemies/maestro_v1/runtime/asesino_esqueletico/down.webp",
};

export const getMonsterSprite = (id) => MONSTER_SPRITES[id] || null;

export const NPC_SPRITES = {
  verde_campamento: "https://media.base44.com/images/public/6a508459ae691da9bade1664/5a0ae2c14_generated_image.png",
  verde_pueblo: "https://media.base44.com/images/public/6a508459ae691da9bade1664/079514581_generated_image.png",
  verde_ciudad: "https://media.base44.com/images/public/6a508459ae691da9bade1664/104d32a2f_generated_image.png",
  fria_campamento: "https://media.base44.com/images/public/6a508459ae691da9bade1664/c436b6619_generated_image.png",
  fria_pueblo: "https://media.base44.com/images/public/6a508459ae691da9bade1664/1a8ce5318_generated_image.png",
  fria_ciudad: "https://media.base44.com/images/public/6a508459ae691da9bade1664/2b489c28a_generated_image.png",
  desierto_campamento: "https://media.base44.com/images/public/6a508459ae691da9bade1664/067d87f3a_generated_image.png",
  desierto_pueblo: "https://media.base44.com/images/public/6a508459ae691da9bade1664/2f4e3c79a_generated_image.png",
  desierto_ciudad: "https://media.base44.com/images/public/6a508459ae691da9bade1664/a80b15da3_generated_image.png",
};

export const getNpcSprite = (regionId, key) => NPC_SPRITES[`${regionId}_${key}`] || null;

export const CHEST_SPRITES = {
  closed: "https://media.base44.com/images/public/6a508459ae691da9bade1664/ac44eb334_generated_image.png",
  open: "https://media.base44.com/images/public/6a508459ae691da9bade1664/85b77e308_generated_image.png",
};

export const getChestSprite = (state) => CHEST_SPRITES[state] || null;