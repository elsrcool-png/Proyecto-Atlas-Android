// PROYECTO ATLAS — A2 Campamento del Umbral, reconstrucción modular v2.
// El terreno contiene únicamente materiales de suelo, agua y caminos.
// Cada estructura, árbol y objeto existe como sprite RGBA independiente.

const ROOT = "/assets/atlas/verde/a2/modular_v2";
const W = 960;
const H = 720;

const item = (id, asset, x, y, width, height, options = {}) => ({
  id,
  asset: `${ROOT}/${asset}.webp`,
  src: `${ROOT}/${asset}.webp`,
  x,
  y,
  width,
  height,
  anchorX: options.anchorX ?? 0.5,
  anchorY: options.anchorY ?? 1,
  positionMode: options.positionMode,
  layer: options.layer || "solid",
  outline: false, // El contorno suave ya está horneado en el sprite.
  bakedOutline: true,
  shadow: false, // La sombra también está integrada; evita filtros costosos.
  opacity: options.opacity ?? 1,
  effect: options.effect,
  depthY: options.depthY ?? y,
  depthSort: options.depthSort,
  zOffset: options.zOffset || 0,
  eager: options.eager ?? false,
  collision: options.collision || null,
  tags: options.tags || [],
  occlusion: options.occlusion || "none",
});

const rect = (id, x, y, w, h, meta = {}) => ({ id, x, y, w, h, ...meta });

const collisionsFrom = (objects) => {
  const out = [];
  for (const object of objects) {
    const entries = Array.isArray(object.collision)
      ? object.collision
      : object.collision
        ? [object.collision]
        : [];
    entries.forEach((c, index) => {
      out.push(rect(
        `${object.id}_collision_${index}`,
        object.x + c.x,
        object.y + c.y,
        c.w,
        c.h,
        { object: object.id, visibleObject: true },
      ));
    });
  }
  return out;
};

const tree = (id, variant, x, y, scale = 1) => item(
  id,
  `tree_pine_tall_0${variant}`,
  x,
  y,
  Math.round(92 * scale),
  Math.round(126 * scale),
  {
    collision: { x: -10 * scale, y: -20 * scale, w: 20 * scale, h: 20 * scale },
    tags: ["tree", "forest", "individual"],
    occlusion: "entity-visible",
  },
);

const roundTree = (id, variant, x, y, scale = 1) => item(
  id,
  `tree_round_0${variant}`,
  x,
  y,
  Math.round(104 * scale),
  Math.round(110 * scale),
  {
    collision: { x: -11 * scale, y: -19 * scale, w: 22 * scale, h: 19 * scale },
    tags: ["tree", "forest", "individual"],
    occlusion: "entity-visible",
  },
);

const bush = (id, variant, x, y, scale = 1) => item(
  id,
  `bush_medium_0${variant}`,
  x,
  y,
  Math.round(78 * scale),
  Math.round(52 * scale),
  { layer: "low", tags: ["bush", "individual"] },
);

const tent = (id, asset, x, y, scale = 1) => item(
  id,
  asset,
  x,
  y,
  Math.round(128 * scale),
  Math.round(108 * scale),
  {
    collision: { x: -39 * scale, y: -25 * scale, w: 78 * scale, h: 25 * scale },
    tags: ["tent", "structure", "individual"],
    occlusion: "entity-visible",
    eager: true,
  },
);

const prop = (id, asset, x, y, width, height, collision = null, options = {}) => item(
  id,
  asset,
  x,
  y,
  width,
  height,
  {
    collision,
    tags: ["prop", "individual", ...(options.tags || [])],
    layer: options.layer || "solid",
    effect: options.effect,
    depthY: options.depthY,
    depthSort: options.depthSort,
    zOffset: options.zOffset || 0,
    eager: options.eager || false,
  },
);

const objects = [
  // Santuario aprobado: sprite completo, transparente y con colisión solo en la base.
  item("a2v2_portal", "sanctuary_portal_clean", 309, 187, 170, 170, {
    layer: "solid",
    collision: [
      { x: -58, y: -26, w: 28, h: 20 },
      { x: 30, y: -26, w: 28, h: 20 },
    ],
    effect: "portal",
    tags: ["portal", "structure", "approved-v2-10"],
    occlusion: "entity-visible",
    eager: true,
  }),

  // Puente. Solo las barandas bloquean; el tablero permanece transitable.
  item("a2v2_bridge", "bridge_main", 147, 397, 178, 91, {
    layer: "low",
    depthSort: false,
    collision: [
      { x: -75, y: -64, w: 150, h: 11 },
      { x: -75, y: -13, w: 150, h: 11 },
    ],
    tags: ["bridge", "structure", "individual"],
    eager: true,
  }),

  // Puesto de vigilancia y herrería.
  item("a2v2_watchtower", "watchtower_complete", 492, 192, 130, 170, {
    collision: { x: -26, y: -25, w: 52, h: 25 },
    tags: ["tower", "structure", "approved-v2-10"],
    occlusion: "entity-visible",
    eager: true,
  }),
  item("a2v2_smithy", "smithy_building_main", 771, 255, 235, 175, {
    collision: { x: -84, y: -50, w: 168, h: 50 },
    tags: ["forge", "house", "structure", "individual"],
    occlusion: "entity-visible",
    eager: true,
  }),
  item("a2v2_smithy_glow", "smithy_forge_glow", 716, 236, 82, 66, {
    layer: "fx",
    depthY: 255,
    effect: "forge",
    tags: ["forge", "effect", "individual"],
  }),
  prop("a2v2_anvil", "smithy_anvil", 696, 283, 62, 48, { x: -17, y: -13, w: 34, h: 13 }, { eager: true }),
  prop("a2v2_toolrack", "smithy_tool_rack", 837, 279, 60, 58, { x: -17, y: -12, w: 34, h: 12 }),

  // Carpas, todas separadas de sus suministros.
  tent("a2v2_tent_healer", "tent_red_01", 345, 350, 1),
  tent("a2v2_tent_scout", "tent_green_01", 558, 341, 1),
  tent("a2v2_tent_command", "tent_beige_02", 672, 438, 1),
  tent("a2v2_tent_rest", "tent_beige_01", 345, 513, 1),
  tent("a2v2_tent_supply", "tent_beige_01", 558, 528, 1),

  // Centro social.
  prop("a2v2_campfire", "campfire_main", 492, 410, 78, 68, { x: -18, y: -15, w: 36, h: 15 }, { effect: "fire", eager: true }),
  prop("a2v2_fire_glow", "light_fire_glow", 492, 401, 112, 86, null, { layer: "fx", depthY: 410, effect: "fire" }),
  prop("a2v2_bench_w", "bench_small_01", 426, 433, 80, 45, { x: -28, y: -10, w: 56, h: 10 }),
  prop("a2v2_bench_e", "bench_small_01", 561, 436, 80, 45, { x: -28, y: -10, w: 56, h: 10 }),

  // Señalética individual.
  prop("a2v2_notice", "sign_notice_small", 258, 502, 78, 81, { x: -12, y: -11, w: 24, h: 11 }, { tags: ["sign"] }),
  prop("a2v2_sign_lagoon", "sign_to_lagoon", 219, 426, 108, 63, { x: -7, y: -10, w: 14, h: 10 }, { tags: ["sign"] }),
  prop("a2v2_sign_city", "sign_to_city", 895, 397, 108, 63, { x: -7, y: -10, w: 14, h: 10 }, { tags: ["sign"] }),
  prop("a2v2_sign_forest", "sign_to_forest", 501, 680, 108, 63, { x: -7, y: -10, w: 14, h: 10 }, { tags: ["sign"], layer: "foreground" }),
  prop("a2v2_banner_west", "prop_banner", 246, 359, 52, 81, { x: -5, y: -11, w: 10, h: 11 }),
  prop("a2v2_banner_center", "prop_banner", 462, 329, 48, 75, { x: -5, y: -11, w: 10, h: 11 }),

  // Suministros y mobiliario, una pieza por instancia.
  prop("a2v2_crate_healer", "crate_01", 390, 376, 52, 46, { x: -14, y: -14, w: 28, h: 14 }),
  prop("a2v2_crate_open_supply", "crate_open_01", 609, 548, 54, 48, { x: -15, y: -13, w: 30, h: 13 }),
  prop("a2v2_barrel_smithy_a", "barrel_01", 858, 257, 43, 53, { x: -11, y: -13, w: 22, h: 13 }),
  prop("a2v2_barrel_smithy_b", "barrel_02", 879, 272, 40, 49, { x: -10, y: -12, w: 20, h: 12 }),
  prop("a2v2_woodpile_forge", "woodpile_01", 792, 291, 78, 49, { x: -27, y: -12, w: 54, h: 12 }),
  prop("a2v2_fence_north", "fence_segment_clean", 615, 205, 92, 42, { x: -34, y: -9, w: 68, h: 9 }),
  prop("a2v2_fence_east", "fence_segment_clean", 856, 325, 92, 42, { x: -34, y: -9, w: 68, h: 9 }),
  prop("a2v2_rope_scout", "rope_bundle_01", 606, 363, 42, 35, null, { layer: "low" }),
  prop("a2v2_lantern_north", "lantern_ground", 420, 260, 36, 50, { x: -5, y: -8, w: 10, h: 8 }),
  prop("a2v2_lantern_east", "lantern_ground", 774, 362, 36, 50, { x: -5, y: -8, w: 10, h: 8 }),
  prop("a2v2_log_rest", "log_small_01", 282, 558, 72, 38, { x: -21, y: -10, w: 42, h: 10 }),
  prop("a2v2_stump_north", "stump_01", 624, 228, 48, 43, { x: -10, y: -10, w: 20, h: 10 }),
  prop("a2v2_rock_west", "rock_small_01", 203, 526, 44, 36, { x: -12, y: -9, w: 24, h: 9 }),
  prop("a2v2_rock_east", "rock_medium_01", 756, 612, 64, 48, { x: -19, y: -12, w: 38, h: 12 }),
  prop("a2v2_rock_south", "rock_cluster_01", 657, 648, 75, 51, { x: -23, y: -13, w: 46, h: 13 }),

  // Decoración baja, sin colisión.
  prop("a2v2_flowers_portal", "wildflowers_01", 288, 235, 60, 42, null, { layer: "decal" }),
  prop("a2v2_flowers_fire", "wildflowers_02", 438, 470, 58, 41, null, { layer: "decal" }),
  prop("a2v2_fern_river", "fern_patch_01", 215, 326, 66, 46, null, { layer: "decal" }),
  prop("a2v2_grass_east", "grass_tall_cluster_01", 870, 504, 64, 52, null, { layer: "decal" }),

  // Borde forestal. Cada árbol es una instancia individual con colisión en tronco.
  // Ribera oeste despejada: ningún tronco nace dentro del agua.
  // Se conservaron tres pinos en tierra firme para enmarcar la orilla sin
  // bloquear el puente ni la ruta principal.
  tree("a2v2_pine_02", 3, 190, 145, .95),
  tree("a2v2_pine_04", 1, 188, 305, .92),
  tree("a2v2_pine_07", 1, 205, 662, .92),
  tree("a2v2_pine_08", 3, 216, 86, .95),
  tree("a2v2_pine_09", 2, 414, 76, .9),
  tree("a2v2_pine_10", 1, 564, 80, .92),
  tree("a2v2_pine_11", 3, 672, 86, .95),
  tree("a2v2_pine_12", 2, 780, 82, .9),
  tree("a2v2_pine_13", 1, 888, 120, .92),
  tree("a2v2_pine_14", 3, 925, 230, .95),
  tree("a2v2_pine_15", 2, 912, 568, .9),
  tree("a2v2_pine_16", 1, 870, 648, .92),
  tree("a2v2_pine_17", 3, 792, 705, .95),
  tree("a2v2_pine_18", 2, 696, 694, .9),
  tree("a2v2_pine_19", 1, 618, 710, .92),
  tree("a2v2_pine_20", 3, 354, 704, .95),
  tree("a2v2_pine_21", 2, 252, 682, .9),
  roundTree("a2v2_round_00", 1, 189, 150, .85),
  roundTree("a2v2_round_01", 2, 183, 570, .85),
  roundTree("a2v2_round_02", 3, 822, 612, .85),
  roundTree("a2v2_round_03", 1, 876, 330, .85),

  bush("a2v2_bush_00", 1, 235, 270, .85),
  bush("a2v2_bush_01", 2, 408, 178, .85),
  bush("a2v2_bush_02", 1, 648, 344, .85),
  bush("a2v2_bush_03", 2, 828, 474, .85),
  bush("a2v2_bush_04", 1, 252, 640, .85),
  bush("a2v2_bush_05", 2, 708, 628, .85),
];

const terrainCollisions = [
  // Río. El vano central queda libre únicamente donde cruza el puente.
  rect("a2v2_river_north", 0, 0, 145, 325, { terrain: "water" }),
  rect("a2v2_river_south", 0, 459, 145, 261, { terrain: "water" }),
];

export const A2_MODULAR_V2_SCENE = {
  id: "verde_A2_modular_v2",
  version: "2.10.1",
  architecture: "individual-assets",
  regionId: "verde",
  sectorId: "A2",
  width: W,
  height: H,
  depthMode: "feet-y",
  waterZones: [
    rect("a2v2_water_north", 0, 0, 165, 325),
    rect("a2v2_water_south", 0, 459, 165, 261),
  ],
  spawn: { x: 501, y: 618 },
  sanctuary: { x: 309, y: 187, spawnX: 334, spawnY: 247 },
  safeCenter: { x: 492, y: 418 },
  baseLayers: [
    item("a2v2_terrain", "terrain_a2", 0, 0, W, H, {
      anchorX: 0,
      anchorY: 0,
      positionMode: "top-left",
      layer: "ground",
      tags: ["terrain", "ground-only"],
      eager: true,
    }),
  ],
  objects,
  collisions: [...terrainCollisions, ...collisionsFrom(objects)],
  corridors: {
    westBridge: rect("a2v2_corridor_west", 78, 330, 320, 100),
    mainHorizontal: rect("a2v2_corridor_horizontal", 205, 305, 755, 116),
    mainVertical: rect("a2v2_corridor_vertical", 432, 180, 138, 540),
    portal: rect("a2v2_corridor_portal", 234, 150, 258, 138),
    smithy: rect("a2v2_corridor_smithy", 540, 168, 336, 144),
    campLoop: rect("a2v2_corridor_loop", 264, 276, 510, 312),
  },
  npcAnchors: {
    main: { x: 375, y: 246 },
    smith: { x: 732, y: 292 },
    merchant: { x: 666, y: 495 },
    inn: { x: 345, y: 555 },
    explorer: { x: 561, y: 396 },
    herbalist: { x: 366, y: 392 },
    flavor: { x: 507, y: 485 },
    survivor: { x: 470, y: 560 },
  },
  enemyAnchors: [
    { x: 835, y: 565 },
    { x: 878, y: 500 },
    { x: 846, y: 443 },
    { x: 188, y: 575 },
  ],
  chestAnchors: [{ x: 826, y: 455 }, { x: 854, y: 610 }],
  objectiveAnchor: { x: 720, y: 275 },
  protectedZones: [
    rect("a2v2_spawn_safe", 455, 575, 95, 105),
    rect("a2v2_portal_safe", 250, 165, 120, 115),
    rect("a2v2_camp_center_safe", 420, 350, 155, 130),
  ],
  exits: {
    west: { x: 28, y: 375, sectorId: "A1" },
    east: { x: 932, y: 360, sectorId: "B2" },
    south: { x: 501, y: 696, sectorId: "A3" },
  },
  performance: {
    outlinesBaked: true,
    shadowsBaked: true,
    runtimeFilters: false,
    terrainLayers: 1,
  },
  theme: "green-camp-approved",
};

export default A2_MODULAR_V2_SCENE;
