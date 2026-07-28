// PROYECTO ATLAS — Región Ártica Visual Maestro v1.0, integrada en Atlas v2.14.
// Nueve terrenos y dieciocho objetos aprobados. Los sprites maestros usan
// lienzo cuadrado 1024×1024 y su contacto visible con el suelo termina en
// Y=968. Norte se dibuja primero; sur se dibuja después y queda delante.
import { makeVisualKit } from "./atlasRegionVisualSceneFactory.js";

const ROOT = "/assets/atlas/fria/maestro_v1";
const MASTER_GROUND_ANCHOR_Y = 968 / 1024;
const { sprite, rect, scene } = makeVisualKit({ regionId: "fria", root: ROOT, theme: "arctic", version: "2.14.0" });

const squareSprite = (id, file, x, y, size, options = {}) => sprite(
  id, file, x, y, Math.round(size), Math.round(size),
  {
    ...options,
    anchorY: options.anchorY ?? MASTER_GROUND_ANCHOR_Y,
    outline: options.outline ?? false,
    tags: [...(options.tags || []), "master-v1"],
  },
);

const tree = (id, variant, x, y, scale = 1) => squareSprite(id, `tree_snow_0${variant}.webp`, x, y, 220 * scale, {
  collision: { x: -14 * scale, y: -20 * scale, w: 28 * scale, h: 20 * scale },
  tags: ["tree", "individual"], occlusion: "entity-visible", eager: true,
});
const rock = (id, x, y, scale = 1, crystal = false, solid = true) => squareSprite(id, crystal ? "ice_crystal_01.webp" : "ice_rock_01.webp", x, y, (crystal ? 145 : 145) * scale, {
  layer: solid ? "solid" : "low",
  collision: solid ? { x: -26 * scale, y: -15 * scale, w: 52 * scale, h: 15 * scale } : null,
  tags: [crystal ? "crystal" : "rock", "individual"],
});
const bush = (id, x, y, scale = 1) => squareSprite(id, "snow_bush_01.webp", x, y, 136 * scale, {
  layer: "low", outline: false, tags: ["bush", "individual"],
});
const tent = (id, x, y, scale = 1, blue = false) => squareSprite(id, blue ? "tent_boreal_blue.webp" : "tent_boreal_01.webp", x, y, 245 * scale, {
  collision: { x: -58 * scale, y: -28 * scale, w: 116 * scale, h: 28 * scale },
  tags: ["tent", "structure", "individual"], occlusion: "entity-visible", eager: true,
});
const house = (id, x, y, scale = 1, hall = false) => squareSprite(id, hall ? "ice_hall_01.webp" : "ice_house_01.webp", x, y, (hall ? 310 : 275) * scale, {
  collision: { x: -(hall ? 90 : 70) * scale, y: -48 * scale, w: (hall ? 180 : 140) * scale, h: 48 * scale },
  tags: ["house", "structure", "individual"], occlusion: "entity-visible", eager: true,
});
const portal = (id, x, y, scale = 1) => squareSprite(id, "portal_ice.webp", x, y, 235 * scale, {
  effect: "portal",
  collision: [
    { x: -62 * scale, y: -36 * scale, w: 25 * scale, h: 36 * scale },
    { x: 37 * scale, y: -36 * scale, w: 25 * scale, h: 36 * scale },
  ],
  tags: ["portal", "structure", "individual"], eager: true,
});
const campfire = (id, x, y, scale = 1) => squareSprite(id, "campfire_01.webp", x, y, 110 * scale, {
  effect: "fire", collision: { x: -18 * scale, y: -12 * scale, w: 36 * scale, h: 12 * scale },
  tags: ["fire", "individual"],
});
const crate = (id, x, y, scale = 1) => squareSprite(id, "crate_01.webp", x, y, 92 * scale, {
  collision: { x: -16 * scale, y: -13 * scale, w: 32 * scale, h: 13 * scale }, tags: ["prop", "individual"],
});
const bridge = (id, x, y, scale = 1, rotate = 0) => squareSprite(id, "ice_bridge_01.webp", x, y, 330 * scale, {
  rotate, layer: "low", tags: ["bridge", "individual"], eager: true, occlusion: "none",
});
const arch = (id, x, y, scale = 1) => squareSprite(id, "ice_arch_01.webp", x, y, 300 * scale, {
  collision: [
    { x: -93 * scale, y: -42 * scale, w: 35 * scale, h: 42 * scale },
    { x: 58 * scale, y: -42 * scale, w: 35 * scale, h: 42 * scale },
  ],
  tags: ["ruin", "structure", "individual"],
});
const cave = (id, x, y, scale = 1) => squareSprite(id, "ice_cave_01.webp", x, y, 305 * scale, {
  collision: [
    { x: -112 * scale, y: -30 * scale, w: 44 * scale, h: 30 * scale },
    { x: 68 * scale, y: -30 * scale, w: 44 * scale, h: 30 * scale },
  ],
  tags: ["cave", "structure", "individual"],
});
const tower = (id, x, y, scale = 1) => squareSprite(id, "ice_watchtower_01.webp", x, y, 280 * scale, {
  collision: { x: -34 * scale, y: -28 * scale, w: 68 * scale, h: 28 * scale },
  tags: ["tower", "structure", "individual"], occlusion: "entity-visible",
});
const fortress = (id, x, y, scale = 1) => squareSprite(id, "ice_fortress_01.webp", x, y, 410 * scale, {
  collision: [
    { x: -172 * scale, y: -52 * scale, w: 70 * scale, h: 52 * scale },
    { x: 102 * scale, y: -52 * scale, w: 70 * scale, h: 52 * scale },
  ],
  tags: ["fortress", "structure", "individual"], occlusion: "entity-visible", eager: true,
});
const ship = (id, x, y, scale = 1, rotate = 0) => squareSprite(id, "shipwreck_01.webp", x, y, 390 * scale, {
  rotate, collision: { x: -112 * scale, y: -27 * scale, w: 224 * scale, h: 27 * scale },
  tags: ["ship", "structure", "individual"], eager: true,
});

const edgeTrees = (prefix, entries) => entries.map((e, i) => tree(`${prefix}_${i}`, e[0], e[1], e[2], e[3] || 1));

export const ARCTIC_VISUAL_SCENES = {
  A1: scene("A1", {
    spawn: { x: 820, y: 610 }, safeCenter: { x: 780, y: 520 },
    objects: [
      ...edgeTrees("fa1_tree", [[1,80,110,.78],[2,850,110,.82],[1,885,570,.78],[2,100,625,.74]]),
      ship("fa1_ship",390,390,.83,-8), rock("fa1_rock_1",735,235,.72), rock("fa1_rock_2",820,425,.58), bush("fa1_bush",770,530,.72),
    ],
    terrainCollisions: [rect("fa1_bay",70,70,620,540,{terrain:"ice-water"})],
    enemyAnchors: [{x:745,y:190},{x:820,y:300},{x:745,y:520}], chestAnchors: [{x:875,y:190},{x:735,y:610}], objectiveAnchor:{x:735,y:390},
  }),

  B1: scene("B1", {
    spawn:{x:165,y:210}, sanctuary:{x:165,y:125,spawnX:165,spawnY:210}, safeCenter:{x:470,y:385},
    objects:[
      ...edgeTrees("fb1_tree",[[1,75,100,.86],[2,260,95,.82],[1,710,100,.88],[2,885,120,.8],[1,80,610,.82],[2,885,600,.78]]),
      portal("fb1_portal",165,125,.72), tent("fb1_tent_1",335,300,.7), tent("fb1_tent_2",550,290,.68,true), tent("fb1_tent_3",710,455,.66), tent("fb1_tent_4",360,535,.62,true),
      campfire("fb1_fire",505,430,.72), crate("fb1_crate_1",635,340,.66), crate("fb1_crate_2",770,520,.6), rock("fb1_crystal",790,265,.62,true,false), bush("fb1_bush",250,500,.68),
    ],
    npcAnchors:{main:{x:435,y:350},merchant:{x:610,y:370},inn:{x:350,y:470},smith:{x:665,y:480},explorer:{x:535,y:535},flavor:{x:770,y:390}},
    enemyAnchors:[{x:835,y:610},{x:820,y:190}], chestAnchors:[{x:815,y:510},{x:250,y:575}], objectiveAnchor:{x:790,y:265},
  }),

  C1: scene("C1", {
    spawn:{x:480,y:650}, safeCenter:{x:510,y:390},
    objects:[
      ...edgeTrees("fc1_tree",[[1,85,115,.95],[2,230,105,.9],[1,390,110,.86],[2,700,105,.95],[1,865,120,.9],[2,90,610,.84],[1,270,660,.84],[2,720,655,.88],[1,885,585,.8]]),
      cave("fc1_station",710,250,.72), tower("fc1_watch",250,315,.65), rock("fc1_crystal_1",500,240,.62,true), rock("fc1_rock_1",380,500,.65), bush("fc1_bush_1",570,510,.7), bush("fc1_bush_2",800,480,.64),
    ],
    enemyAnchors:[{x:250,y:520},{x:430,y:530},{x:610,y:500},{x:790,y:430},{x:700,y:320}], chestAnchors:[{x:150,y:500},{x:820,y:555}], objectiveAnchor:{x:710,y:300},
  }),

  A2: scene("A2", {
    spawn:{x:480,y:650}, safeCenter:{x:480,y:390},
    objects:[
      ...edgeTrees("fa2_tree",[[2,90,110,.85],[1,260,100,.8],[2,700,100,.82],[1,875,120,.78],[2,90,610,.8],[1,270,650,.78],[2,720,650,.82],[1,880,590,.76]]),
      arch("fa2_arch",480,285,.88), portal("fa2_secondary_shrine",165,155,.58), rock("fa2_crystal_1",310,355,.72,true), rock("fa2_crystal_2",670,380,.68,true), rock("fa2_rock",780,520,.62), bush("fa2_bush",260,520,.68),
    ],
    enemyAnchors:[{x:250,y:470},{x:410,y:520},{x:610,y:500},{x:780,y:440}], chestAnchors:[{x:160,y:520},{x:820,y:570}], objectiveAnchor:{x:480,y:300},
  }),

  B2: scene("B2", {
    spawn:{x:390,y:500}, sanctuary:{x:390,y:590,spawnX:390,spawnY:500}, safeCenter:{x:500,y:380},
    objects:[
      fortress("fb2_gate",500,205,.74), house("fb2_hall",260,350,.65,true), house("fb2_house_1",735,330,.72), house("fb2_house_2",690,555,.66), house("fb2_house_3",255,560,.64),
      portal("fb2_portal",390,590,.63), tower("fb2_tower_l",115,265,.58), tower("fb2_tower_r",855,265,.58), rock("fb2_crystal",555,470,.55,true,false), crate("fb2_crate",805,470,.58),
    ],
    npcAnchors:{main:{x:505,y:310},merchant:{x:650,y:410},inn:{x:330,y:420},smith:{x:250,y:475},researcher:{x:565,y:520},captain:{x:445,y:430},forger:{x:770,y:585}},
    enemyAnchors:[{x:850,y:140}], chestAnchors:[{x:140,y:165},{x:835,y:170}], objectiveAnchor:{x:500,y:265},
  }),

  C2: scene("C2", {
    spawn:{x:480,y:650}, safeCenter:{x:480,y:390},
    objects:[
      ...edgeTrees("fc2_tree",[[1,80,110,.8],[2,220,100,.76],[1,740,100,.8],[2,885,120,.76],[1,85,615,.76],[2,875,600,.75]]),
      bridge("fc2_bridge",480,385,.78,90), cave("fc2_cave",760,240,.68), arch("fc2_ruin",250,250,.62), rock("fc2_crystal_1",325,510,.66,true), rock("fc2_crystal_2",680,530,.65,true), bush("fc2_bush",785,500,.62),
    ],
    terrainCollisions:[rect("fc2_chasm_left",0,60,355,480,{terrain:"chasm"}),rect("fc2_chasm_right",605,60,355,500,{terrain:"chasm"})],
    enemyAnchors:[{x:410,y:560},{x:550,y:540},{x:455,y:230},{x:565,y:260}], chestAnchors:[{x:400,y:150},{x:565,y:585}], objectiveAnchor:{x:480,y:300},
  }),

  A3: scene("A3", {
    spawn:{x:480,y:55}, safeCenter:{x:500,y:380},
    objects:[
      ...edgeTrees("fa3_tree",[[1,90,115,.83],[2,260,105,.82],[1,700,105,.85],[2,875,125,.78],[1,90,610,.8],[2,870,600,.77]]),
      tower("fa3_tower",260,255,.72), tent("fa3_tent_1",520,295,.62,true), tent("fa3_tent_2",700,390,.6), campfire("fa3_fire",520,470,.58), crate("fa3_crates",730,500,.6), rock("fa3_crystal",790,260,.58,true), bush("fa3_bush",280,520,.7),
    ],
    npcAnchors:{main:{x:430,y:365},explorer:{x:590,y:380},guard:{x:345,y:465},flavor:{x:650,y:500}},
    enemyAnchors:[{x:190,y:520},{x:790,y:520}], chestAnchors:[{x:160,y:190},{x:830,y:580}], objectiveAnchor:{x:260,y:300},
  }),

  B3: scene("B3", {
    spawn:{x:300,y:490}, sanctuary:{x:300,y:560,spawnX:300,spawnY:490}, safeCenter:{x:500,y:385},
    objects:[
      ...edgeTrees("fb3_tree",[[1,85,105,.82],[2,245,100,.8],[1,715,100,.82],[2,875,115,.78],[1,90,610,.78],[2,870,600,.76]]),
      house("fb3_house_1",240,300,.64), house("fb3_house_2",500,270,.7), house("fb3_house_3",745,335,.63), house("fb3_hall",630,565,.58,true), portal("fb3_portal",300,560,.58),
      campfire("fb3_fire",480,450,.53), crate("fb3_crate",795,500,.58), rock("fb3_crystal",165,440,.5,true,false), bush("fb3_bush",760,580,.6),
    ],
    npcAnchors:{main:{x:430,y:350},merchant:{x:605,y:370},inn:{x:350,y:440},smith:{x:710,y:460},explorer:{x:500,y:535},flavor:{x:790,y:380}},
    enemyAnchors:[{x:845,y:180}], chestAnchors:[{x:150,y:170},{x:840,y:570}], objectiveAnchor:{x:630,y:565},
  }),

  C3: scene("C3", {
    spawn:{x:480,y:650}, safeCenter:{x:500,y:370},
    objects:[
      ...edgeTrees("fc3_tree",[[1,90,110,.78],[2,260,105,.76],[1,700,105,.78],[2,875,120,.74],[1,90,610,.74],[2,875,590,.72]]),
      fortress("fc3_fortress",500,300,.94), rock("fc3_crystal_l",230,420,.72,true), rock("fc3_crystal_r",770,430,.72,true), rock("fc3_rock_l",290,560,.65), rock("fc3_rock_r",725,560,.65),
    ],
    enemyAnchors:[], chestAnchors:[{x:820,y:555}], bossAnchor:{x:500,y:385}, objectiveAnchor:{x:500,y:385},
  }),
};

export const ARCTIC_VISUAL_SCENE_LIST = Object.values(ARCTIC_VISUAL_SCENES);
export default ARCTIC_VISUAL_SCENES;
