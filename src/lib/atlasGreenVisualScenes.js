// PROYECTO ATLAS — Región Verde Visual Maestro v1.1, integrada en Atlas v2.12.
// Los nueve sectores usan los terrenos y objetos aprobados del paquete maestro.
// Profundidad global: norte primero, sur después, usando el punto de contacto
// con el suelo como anclaje. Terreno y calcomanías permanecen debajo.

const ROOT_MASTER = "/assets/atlas/verde/maestro_v1";
// Alias conservados para llamadas heredadas dentro de las definiciones de escena.
const ROOT_V1 = ROOT_MASTER;
const ROOT_V2 = ROOT_MASTER;
const ROOT_V26 = ROOT_MASTER;
const ROOT_V29 = ROOT_MASTER;
const W = 960;
const H = 720;
const MASTER_GROUND_ANCHOR_Y = 968 / 1024;

const sprite = (id, file, x, y, width, height, options = {}) => {
  const root = options.root || ROOT_MASTER;
  return {
    id,
    asset: `${root}/${file}`,
    src: `${root}/${file}`,
    x,
    y,
    width,
    height,
    anchorX: options.anchorX ?? 0.5,
    // Los sprites maestros dejan 56 px transparentes bajo el objeto. Este
    // anclaje alinea el borde visible inferior con la coordenada de mundo Y.
    anchorY: options.anchorY ?? MASTER_GROUND_ANCHOR_Y,
    positionMode: options.positionMode,
    layer: options.layer || "world",
    outline: options.outline ?? false,
    bakedOutline: true,
    shadow: options.shadow ?? false,
    opacity: options.opacity ?? 1,
    effect: options.effect,
    depthY: options.depthY ?? y,
    depthSort: options.depthSort,
    zOffset: options.zOffset || 0,
    rotate: options.rotate || 0,
    collision: options.collision || null,
    tags: options.tags || [],
    occlusion: options.occlusion || "entity-visible",
    eager: options.eager || false,
    objectFit: options.objectFit,
  };
};

// Todos los assets maestros de objetos usan un lienzo cuadrado 1024×1024.
 // Renderizarlos dentro de rectángulos distintos deformaba la escala efectiva
 // y desplazaba visualmente el punto de apoyo. El contenedor cuadrado conserva
 // proporciones, anclaje inferior y lectura de distancia.
const squareSprite = (id, file, x, y, size, options = {}) =>
  sprite(id, file, x, y, size, size, options);

const base = (sectorId) => ({
  id: `terrain_${sectorId.toLowerCase()}`,
  asset: `${ROOT_MASTER}/terrain_${sectorId.toLowerCase()}.webp`,
  src: `${ROOT_MASTER}/terrain_${sectorId.toLowerCase()}.webp`,
  x: 0,
  y: 0,
  width: W,
  height: H,
  anchorX: 0,
  anchorY: 0,
  positionMode: "top-left",
  layer: "ground",
  outline: false,
  shadow: false,
  depthSort: false,
  objectFit: "cover",
  eager: true,
});

const rect = (id, x, y, w, h, meta = {}) => ({ id, x, y, w, h, ...meta });

const TREE_VARIANTS = {
  1: ["tree_pine_tall_01.webp", 195],
  2: ["tree_pine_tall_02.webp", 195],
  3: ["tree_pine_tall_03.webp", 195],
  4: ["tree_round_01.webp", 205],
  5: ["tree_round_02.webp", 205],
};

const tree = (id, variant, x, y, scale = 1, layer = "world") => {
  const [file, size] = TREE_VARIANTS[variant] || TREE_VARIANTS[1];
  return squareSprite(id, file, x, y, Math.round(size * scale), {
    layer,
    collision: { x: -15 * scale, y: -22 * scale, w: 30 * scale, h: 22 * scale },
    tags: ["tree", "forest", "individual", "master-v1"],
    eager: true,
  });
};

const bush = (id, variant, x, y, scale = 1) => squareSprite(id, `bush_medium_0${variant === 2 ? 2 : 1}.webp`, x, y, Math.round(112 * scale), {
  layer: "world", tags: ["bush", "individual", "master-v1"], collision: null,
});
const rock = (id, x, y, scale = 1, solid = true) => squareSprite(id, "rock_medium_01.webp", x, y, Math.round(102 * scale), {
  layer: "world",
  collision: solid ? { x: -22 * scale, y: -16 * scale, w: 44 * scale, h: 16 * scale } : null,
  tags: ["rock", "individual", "master-v1"],
});
const flowers = (id, x, y, scale = 1) => squareSprite(id, "wildflowers_01.webp", x, y, Math.round(92 * scale), {
  layer: "decal", depthSort: false, outline: false, tags: ["flowers", "individual", "master-v1"], occlusion: "none",
});
const barrels = (id, x, y, scale = 1) => squareSprite(id, "barrel_01.webp", x, y, Math.round(78 * scale), {
  collision: { x: -11 * scale, y: -13 * scale, w: 22 * scale, h: 13 * scale }, tags: ["prop", "barrel", "individual", "master-v1"],
});
const crates = (id, x, y, scale = 1) => squareSprite(id, "crate_01.webp", x, y, Math.round(86 * scale), {
  collision: { x: -15 * scale, y: -14 * scale, w: 30 * scale, h: 14 * scale }, tags: ["prop", "crate", "individual", "master-v1"],
});
const fence = (id, x, y, scale = 1) => squareSprite(id, "fence_segment_clean.webp", x, y, Math.round(160 * scale), {
  collision: { x: -70 * scale, y: -22 * scale, w: 140 * scale, h: 22 * scale }, tags: ["fence", "individual", "master-v1"],
});
const logs = (id, x, y, scale = 1) => squareSprite(id, "woodpile_01.webp", x, y, Math.round(110 * scale), {
  collision: { x: -30 * scale, y: -13 * scale, w: 60 * scale, h: 13 * scale }, tags: ["prop", "woodpile", "individual", "master-v1"],
});

const TENT_FILES = {
  command: "tent_red_01.webp",
  healer: "tent_red_01.webp",
  supply: "tent_beige_01.webp",
  rest: "tent_beige_02.webp",
  scout: "tent_green_01.webp",
};
const tent = (id, type, x, y, scale = 1) => squareSprite(id, TENT_FILES[type] || "tent_beige_01.webp", x, y, Math.round(205 * scale), {
  collision: { x: -52 * scale, y: -30 * scale, w: 104 * scale, h: 30 * scale },
  tags: ["tent", "structure", "individual", "master-v1"], eager: true,
});
const villageBuilding = (id, file, x, y, scale = 1) => squareSprite(id, file, x, y, Math.round(280 * scale), {
  collision: { x: -78 * scale, y: -49 * scale, w: 156 * scale, h: 49 * scale },
  tags: ["village-building", "structure", "individual", "master-v1"], eager: true,
});
const cityBuilding = (id, file, x, y, scale = 1) => squareSprite(id, file, x, y, Math.round(290 * scale), {
  collision: { x: -76 * scale, y: -49 * scale, w: 152 * scale, h: 49 * scale },
  tags: ["city-building", "structure", "individual", "master-v1"], eager: true,
});
const portal = (id, x, y, scale = 1) => {
  const size = Math.round(230 * scale);
  return squareSprite(id, "sanctuary_portal_clean.webp", x, y, size, {
    effect: "portal",
    collision: [{ x: -79 * scale, y: -34 * scale, w: 30 * scale, h: 34 * scale }, { x: 49 * scale, y: -34 * scale, w: 30 * scale, h: 34 * scale }],
    // El centro interactivo está dentro del arco, por encima de la base visual.
    // Ordenar el portal por esa plataforma permite que el personaje aparezca
    // delante al entrar, sin tener que buscar la opción detrás de la estructura.
    depthY: y - size * 0.255,
    tags: ["portal", "structure", "individual", "master-v1"], eager: true,
  });
};
const watchtower = (id, x, y, scale = 1) => squareSprite(id, "watchtower_complete.webp", x, y, Math.round(230 * scale), {
  collision: { x: -25 * scale, y: -25 * scale, w: 50 * scale, h: 25 * scale },
  tags: ["tower", "structure", "individual", "master-v1"], eager: true,
});
const forge = (id, x, y, scale = 1) => squareSprite(id, "smithy_building_main.webp", x, y, Math.round(310 * scale), {
  effect: "forge", collision: { x: -92 * scale, y: -50 * scale, w: 184 * scale, h: 50 * scale },
  tags: ["forge", "structure", "individual", "master-v1"], eager: true,
});
const bridge = (id, x, y, scale = 1, rotate = 0) => squareSprite(id, "bridge_main.webp", x, y, Math.round(235 * scale), {
  layer: "low", depthSort: false, outline: false, tags: ["bridge", "individual", "master-v1"], rotate, eager: true, occlusion: "none",
});
const campfire = (id, x, y, scale = 1) => squareSprite(id, "campfire_main.webp", x, y, Math.round(88 * scale), {
  effect: "fire", collision: { x: -18 * scale, y: -15 * scale, w: 36 * scale, h: 15 * scale }, tags: ["fire", "prop", "individual", "master-v1"], eager: true,
});
const SIGN_FILES = {
  "sign_laguna.webp": "sign_to_lagoon.webp",
  "sign_verdalia.webp": "sign_to_city.webp",
  "sign_bosque.webp": "sign_to_forest.webp",
};
const sign = (id, file, x, y, scale = 1, layer = "world") => squareSprite(id, SIGN_FILES[file] || "sign_notice_small.webp", x, y, Math.round(96 * scale), {
  layer, collision: null, tags: ["sign", "individual", "master-v1"],
});
const ruin = (id, x, y, scale = 1) => squareSprite(id, "ruin_wall_clean.webp", x, y, Math.round(220 * scale), {
  collision: { x: -70 * scale, y: -30 * scale, w: 140 * scale, h: 30 * scale }, tags: ["ruin", "structure", "individual", "master-v1"],
});
const ruinArch = (id, x, y, scale = 1) => squareSprite(id, "ruin_arch_clean.webp", x, y, Math.round(230 * scale), {
  collision: [{ x: -78 * scale, y: -42 * scale, w: 34 * scale, h: 42 * scale }, { x: 44 * scale, y: -42 * scale, w: 34 * scale, h: 42 * scale }],
  tags: ["ruin", "arch", "structure", "individual", "master-v1"],
});
const corruptedRuinArch = (id, x, y, scale = 1) => squareSprite(id, "ruin_arch_corrupted_01.webp", x, y, Math.round(240 * scale), {
  collision: [{ x: -82 * scale, y: -44 * scale, w: 36 * scale, h: 44 * scale }, { x: 46 * scale, y: -44 * scale, w: 36 * scale, h: 44 * scale }],
  tags: ["ruin", "arch", "corrupted", "structure", "individual", "master-v1"],
});
const cave = (id, x, y, scale = 1) => squareSprite(id, "cave_entrance_clean.webp", x, y, Math.round(255 * scale), {
  collision: [{ x: -105 * scale, y: -32 * scale, w: 45 * scale, h: 32 * scale }, { x: 60 * scale, y: -32 * scale, w: 45 * scale, h: 32 * scale }],
  tags: ["cave", "structure", "individual", "master-v1"],
});
const fortress = (id, x, y, scale = 1) => squareSprite(id, "city_gate_complete.webp", x, y, Math.round(350 * scale), {
  collision: [{ x: -150 * scale, y: -56 * scale, w: 92 * scale, h: 56 * scale }, { x: 58 * scale, y: -56 * scale, w: 92 * scale, h: 56 * scale }],
  tags: ["fortress", "structure", "individual", "master-v1"],
});

const collOfObjects = (objects) => {
  const result = [];
  for (const item of objects) {
    const list = Array.isArray(item.collision) ? item.collision : item.collision ? [item.collision] : [];
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      result.push(rect(`${item.id}_collision_${i}`, item.x + c.x, item.y + c.y, c.w, c.h, { object: item.id, visibleObject: true }));
    }
  }
  return result;
};

const scene = (sectorId, data) => {
  const objects = data.objects || [];
  const postBossObjects = data.postBossObjects || [];
  const terrainCollisions = data.terrainCollisions || [];
  return {
    id: `verde_${sectorId}_maestro_v1`,
    version: "2.12.0",
    architecture: "individual-assets",
    assetCatalogVersion: "region-verde-maestro-v1.0",
    depthMode: "feet-y",
    regionId: "verde",
    sectorId,
    width: W,
    height: H,
    spawn: data.spawn,
    sanctuary: data.sanctuary || null,
    safeCenter: data.safeCenter || { x: 480, y: 360 },
    baseLayers: [base(sectorId)],
    objects,
    collisions: [...terrainCollisions, ...collOfObjects(objects)],
    waterZones: terrainCollisions.filter((entry) => entry.terrain === "water"),
    postBossObjects,
    postBossCollisions: collOfObjects(postBossObjects),
    postBossRemoveIds: data.postBossRemoveIds || [],
    corridors: data.corridors || {},
    navigationLanes: data.navigationLanes || [],
    npcAnchors: data.npcAnchors || {},
    enemyAnchors: data.enemyAnchors || [],
    chestAnchors: data.chestAnchors || [],
    bossAnchor: data.bossAnchor || null,
    objectiveAnchor: data.objectiveAnchor || { x: 700, y: 180 },
    protectedZones: data.protectedZones || [],
    theme: data.theme || "green-master-v1",
    performance: { outlinesBaked: true, shadowsBaked: true, runtimeFilters: false, terrainLayers: 1 },
  };
};

const edgeTrees = (prefix, entries) => entries.map((e, i) => tree(`${prefix}_${i}`, e[0], e[1], e[2], e[3] || 1, e[4] || "world"));

export const GREEN_VISUAL_SCENES = {
  A1: scene("A1", {
    spawn: { x: 480, y: 650 }, safeCenter: { x: 500, y: 390 },
    navigationLanes: [
      rect("a1_path_horizontal", 300, 175, 660, 90),
      rect("a1_path_vertical", 320, 205, 100, 515),
    ],
    objects: [
      ...edgeTrees("a1_tree", [[2,80,350,1.05],[1,455,108,1],[3,575,108,.95],[4,710,115,.9],[2,850,120,1.05],[5,875,620,.85],[3,690,650,.88],[1,250,655,.9],[2,80,625,.95]]),
      bridge("a1_bridge_1", 235, 285, .75), bridge("a1_bridge_2", 395, 220, .66),
      ruinArch("a1_ancient_arch", 700, 215, .82), rock("a1_rock_1", 535, 210,.85), rock("a1_rock_2", 335,410,.7),
      bush("a1_bush_1",1,560,510,.75), bush("a1_bush_2",2,790,450,.8), flowers("a1_flowers",640,335,.9),
    ],
    terrainCollisions: [
      rect("a1_lake_top",45,45,375,96,{terrain:"water"}), rect("a1_lake_left",45,135,170,160,{terrain:"water"}),
      rect("a1_lake_mid",285,115,135,80,{terrain:"water"}),
    ],
    enemyAnchors: [{x:555,y:550},{x:735,y:530},{x:830,y:400},{x:580,y:285}],
    chestAnchors: [{x:150,y:470},{x:820,y:575}], objectiveAnchor:{x:700,y:215},
  }),

  B1: scene("B1", {
    spawn:{x:480,y:650}, safeCenter:{x:480,y:390},
    navigationLanes:[
      rect("b1_path_horizontal",0,95,960,90),
      rect("b1_path_vertical",440,100,80,620),
    ],
    objects:[
      ...edgeTrees("b1_tree",[[2,110,82,1],[3,260,78,.95],[1,690,80,1],[4,850,84,.9],[5,90,610,.83],[3,255,650,.85],[2,725,650,.9],[1,875,600,.88]]),
      ruin("b1_ruins_left",330,330,.9), ruinArch("b1_ruin_arch",620,250,.75), ruin("b1_ruins_right",725,430,.72),
      watchtower("b1_abandoned_tower",190,300,.72), campfire("b1_dead_fire",570,500,.58),
      rock("b1_rock_1",560,520,.7), rock("b1_rock_2",815,250,.7), bush("b1_bush",1,420,180,.75),
    ],
    enemyAnchors:[{x:300,y:540},{x:470,y:530},{x:650,y:505},{x:780,y:355},{x:245,y:245}],
    chestAnchors:[{x:180,y:515},{x:790,y:555},{x:815,y:180}], objectiveAnchor:{x:620,y:250},
  }),

  C1: scene("C1", {
    spawn:{x:480,y:650}, safeCenter:{x:500,y:410},
    navigationLanes:[
      rect("c1_path_horizontal",0,90,760,90),
      rect("c1_path_vertical",655,95,95,625),
    ],
    objects:[
      ...edgeTrees("c1_tree",[[5,100,84,.85],[3,265,78,1],[4,480,76,.85],[1,690,80,1.05],[2,855,88,1],[2,95,610,.95],[3,250,650,.85],[4,600,650,.82],[5,880,585,.75]]),
      fortress("c1_fortress",710,235,.72), cave("c1_cave",815,430,.7), ruin("c1_ruin",440,350,.82),
      rock("c1_rock_1",300,410,.8), rock("c1_rock_2",820,530,.7),
      bush("c1_bush_1",2,365,215,.75), flowers("c1_flower",535,260,.75),
    ],
    enemyAnchors:[{x:305,y:555},{x:470,y:540},{x:620,y:510},{x:780,y:500},{x:690,y:320}],
    chestAnchors:[{x:165,y:515},{x:815,y:560},{x:820,y:280}], objectiveAnchor:{x:690,y:320},
  }),

  A2: scene("A2", {
    spawn:{x:235,y:245}, sanctuary:{x:235,y:165,spawnX:235,spawnY:245,interactionZone:{shape:"ellipse",x:235,y:165,rx:34,ry:24}}, safeCenter:{x:485,y:390},
    navigationLanes:[
      rect("a2_path_vertical",445,0,80,720),
      rect("a2_path_horizontal",445,325,515,90),
    ],
    objects:[
      ...edgeTrees("a2_tree",[[2,190,145,1.05],[3,390,105,.88],[1,570,110,.98],[4,870,115,.82],[5,905,610,.72],[3,775,660,.82],[2,650,670,.85],[4,275,675,.77],[1,205,662,.9]]),
      bridge("a2_bridge",135,430,.78), portal("a2_portal",235,210,.9), watchtower("a2_watchtower",380,215,.82), forge("a2_forge",735,255,.82),
      tent("a2_tent_command","command",330,405,.76), tent("a2_tent_supply","supply",590,455,.76), tent("a2_tent_healer","healer",720,520,.72),
      tent("a2_tent_rest","rest",340,575,.72), tent("a2_tent_scout","scout",565,575,.72), campfire("a2_fire",410,490,.62),
      sign("a2_sign_laguna","sign_laguna.webp",480,104,.78), sign("a2_sign_verdalia","sign_verdalia.webp",850,385,.78), sign("a2_sign_bosque","sign_bosque.webp",480,690,.72,"foreground"),
      crates("a2_crates",610,300,.72), barrels("a2_barrels",840,315,.62), fence("a2_fence",790,560,.55), logs("a2_logs",860,470,.66),
      bush("a2_bush_1",1,285,260,.65), bush("a2_bush_2",2,815,450,.7), rock("a2_rock",850,535,.58,false), flowers("a2_flowers",600,260,.72),
    ],
    terrainCollisions:[rect("a2_river_north",0,0,153,352,{terrain:"water"}),rect("a2_river_south",0,500,153,220,{terrain:"water"})],
    npcAnchors:{
      main:{x:250,y:445}, merchant:{x:640,y:490}, inn:{x:315,y:620}, explorer:{x:585,y:620},
      smith:{x:800,y:300}, herbalist:{x:720,y:565}, flavor:{x:800,y:625}, survivor:{x:420,y:620},
    },
    enemyAnchors:[{x:780,y:610},{x:860,y:545},{x:825,y:455},{x:195,y:600}], chestAnchors:[{x:820,y:455},{x:850,y:610}], objectiveAnchor:{x:660,y:260},
    protectedZones:[rect("portal_spawn",180,195,110,100),rect("camp_center",395,405,150,120)],
  }),

  B2: scene("B2", {
    spawn:{x:155,y:640}, sanctuary:{x:155,y:520,spawnX:155,spawnY:640,interactionZone:{shape:"ellipse",x:155,y:520,rx:31,ry:22}}, safeCenter:{x:480,y:375},
    navigationLanes:[
      rect("b2_path_horizontal",0,320,960,85),
      rect("b2_path_vertical",435,90,90,630),
    ],
    objects:[
      ...edgeTrees("b2_tree",[[2,90,105,.9],[3,255,95,.78],[1,710,100,.86],[4,875,115,.77],[2,90,620,.85],[3,875,610,.8]]),
      fortress("b2_city_gate",480,195,.86), cityBuilding("b2_city_hall","city_hall.webp",270,315,.78), cityBuilding("b2_city_barracks","city_barracks.webp",690,315,.76),
      cityBuilding("b2_city_smithy","city_smithy.webp",300,535,.74), cityBuilding("b2_city_inn","city_inn.webp",700,530,.74), portal("b2_portal",155,565,.66),
      watchtower("b2_tower_left",125,240,.72), watchtower("b2_tower_right",835,240,.72),
      squareSprite("b2_notice", "sign_notice_small.webp", 565, 465, 112, { root: ROOT_V2, collision: { x: -28, y: -24, w: 56, h: 24 }, tags: ["notice", "clean-v29"] }),
    ].filter(Boolean),
    npcAnchors:{main:{x:390,y:305},merchant:{x:575,y:420},inn:{x:715,y:585},smith:{x:300,y:585},flavor:{x:560,y:555}},
    enemyAnchors:[{x:850,y:135}], chestAnchors:[{x:170,y:175},{x:830,y:180}], objectiveAnchor:{x:480,y:260},
  }),

  C2: scene("C2", {
    spawn:{x:200,y:640}, sanctuary:{x:200,y:515,spawnX:200,spawnY:640,interactionZone:{shape:"ellipse",x:200,y:515,rx:31,ry:22}}, safeCenter:{x:500,y:390},
    navigationLanes:[
      rect("c2_path_horizontal",0,315,710,95),
      rect("c2_path_vertical",625,0,95,720),
    ],
    objects:[
      ...edgeTrees("c2_tree",[[2,90,115,.9],[3,270,105,.82],[1,560,105,.87],[4,875,125,.77],[5,90,610,.72],[2,280,660,.78],[3,560,655,.8],[1,880,600,.78]]),
      villageBuilding("c2_house_green","village_house_green.webp",285,285,.78), villageBuilding("c2_village_shop","village_shop.webp",555,285,.76), villageBuilding("c2_village_inn","village_inn.webp",820,505,.72),
      villageBuilding("c2_village_smithy","village_smithy.webp",420,520,.74), portal("c2_portal",200,555,.62), campfire("c2_fire",600,485,.50),
      squareSprite("c2_notice","sign_notice_small.webp",690,430,108,{root:ROOT_V2,collision:{x:-27,y:-23,w:54,h:23},tags:["notice","clean-v220","portal-clearance"]}),
      barrels("c2_barrels",610,565,.55), crates("c2_crates",900,445,.58), fence("c2_fence",825,395,.55),
      bush("c2_bush",1,500,185,.72), flowers("c2_flowers",410,250,.75),
    ],
    npcAnchors:{main:{x:375,y:305},merchant:{x:555,y:305},inn:{x:820,y:570},smith:{x:420,y:585},explorer:{x:310,y:450},flavor1:{x:300,y:540},flavor2:{x:555,y:555},cartographer:{x:750,y:545}},
    enemyAnchors:[{x:175,y:215},{x:230,y:315},{x:160,y:470}], chestAnchors:[{x:830,y:145},{x:185,y:560}], objectiveAnchor:{x:640,y:210},
  }),

  A3: scene("A3", {
    spawn:{x:480,y:55}, safeCenter:{x:480,y:360},
    navigationLanes:[
      rect("a3_path_horizontal",0,325,960,95),
      rect("a3_path_north",40,0,100,345),
      rect("a3_path_south",625,385,95,335),
    ],
    objects:[
      ...edgeTrees("a3_tree",[[5,170,95,.83],[4,245,100,.9],[3,420,100,.98],[2,620,105,1],[5,860,120,.78],[4,90,610,.9],[5,250,650,.82],[3,600,650,.9],[2,875,600,.94]]),
      cave("a3_cave",215,285,.82), tent("a3_outpost","scout",665,230,.67), campfire("a3_fire",730,265,.48),
      ruin("a3_ruin",520,515,.72), rock("a3_rock_1",350,250,.75), rock("a3_rock_2",805,455,.72),
      bush("a3_bush_1",1,290,520,.8), bush("a3_bush_2",2,590,290,.7), flowers("a3_flowers",520,560,.8),
    ],
    enemyAnchors:[{x:250,y:320},{x:400,y:260},{x:550,y:520},{x:720,y:500},{x:825,y:580}], chestAnchors:[{x:155,y:500},{x:825,y:220}], objectiveAnchor:{x:650,y:500},
  }),

  B3: scene("B3", {
    spawn:{x:700,y:600}, safeCenter:{x:480,y:360},
    navigationLanes:[
      rect("b3_path_horizontal",0,310,960,100),
    ],
    objects:[
      ...edgeTrees("b3_tree",[[2,90,110,.95],[3,275,100,.88],[1,690,110,.95],[4,865,120,.8],[5,90,605,.78],[3,250,655,.82],[2,710,655,.9],[1,875,600,.85]]),
      bridge("b3_bridge",475,400,.76), bridge("b3_north_walkway",480,135,.72,90), ruin("b3_ruins",720,250,.82), cave("b3_cave",225,250,.65),
      rock("b3_rock_1",300,480,.72), rock("b3_rock_2",670,500,.72), bush("b3_bush",1,815,450,.7), flowers("b3_flower",580,280,.7),
    ],
    terrainCollisions:[
      rect("b3_river_top_left",395,0,42,315,{terrain:"water"}),
      rect("b3_river_top_right",523,0,17,315,{terrain:"water"}),
      rect("b3_river_bottom",395,475,145,245,{terrain:"water"}),
    ],
    enemyAnchors:[{x:220,y:500},{x:330,y:390},{x:600,y:540},{x:760,y:390},{x:820,y:570}], chestAnchors:[{x:170,y:190},{x:790,y:290},{x:850,y:600}], objectiveAnchor:{x:720,y:250},
  }),

  C3: scene("C3", {
    spawn:{x:480,y:650}, safeCenter:{x:600,y:345},
    navigationLanes:[
      rect("c3_path_west",0,295,410,105),
    ],
    objects:[
      ...edgeTrees("c3_tree",[[5,90,115,.82],[4,270,105,.82],[3,690,105,.9],[5,875,125,.78],[4,90,610,.78],[3,260,660,.82],[2,720,655,.85],[5,885,590,.72]]),
      fortress("c3_fortress",650,245,.92), corruptedRuinArch("c3_corrupt_arch",475,360,.65), ruin("c3_ruin_left",290,390,.72), ruin("c3_ruin_right",785,410,.68),
      rock("c3_rock_1",350,530,.75), rock("c3_rock_2",780,535,.72),
      bush("c3_bush_1",2,260,250,.68), bush("c3_bush_2",1,825,260,.65),
    ],
    // Tras completar la campaña, los aventureros limpian el flanco occidental
    // y levantan una base permanente frente a la futura dungeon de C3.
    postBossRemoveIds:["c3_corrupt_arch","c3_ruin_left","c3_rock_1"],
    postBossObjects:[
      tent("c3_adv_tent_command","command",245,500,.58),
      tent("c3_adv_tent_scout","scout",375,535,.54),
      campfire("c3_adv_fire",300,610,.42),
      crates("c3_adv_crates",430,610,.46),
      barrels("c3_adv_barrels",205,620,.38),
      sprite("c3_adv_notice","sign_notice_small.webp",175,555,96,96,{root:ROOT_V2,collision:{x:-23,y:-18,w:46,h:18},tags:["notice","adventurer_zone","clean-v29"]}),
      sprite("c3_adv_banner","prop_banner.webp",455,535,78,132,{root:ROOT_V2,collision:{x:-9,y:-26,w:18,h:26},tags:["banner","adventurer_zone","clean-v29"]}),
      logs("c3_adv_logs",380,635,.48),
      flowers("c3_adv_flowers",255,565,.58),
    ],
    enemyAnchors:[], chestAnchors:[{x:825,y:520}], bossAnchor:{x:650,y:345}, objectiveAnchor:{x:650,y:345},
  }),
};

export const GREEN_VISUAL_SCENE_LIST = Object.values(GREEN_VISUAL_SCENES);
export default GREEN_VISUAL_SCENES;
