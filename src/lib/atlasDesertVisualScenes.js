// PROYECTO ATLAS — Reino Árido modular v2.7.
// Suelo continuo y objetos transparentes individuales. Sin recortes de fondos.
import { makeVisualKit } from "./atlasRegionVisualSceneFactory.js";

const ROOT = "/assets/atlas/desierto/modular_v27";
const { sprite, rect, scene } = makeVisualKit({ regionId: "desierto", root: ROOT, theme: "desert", version: "2.7.0" });

const palm = (id, variant, x, y, scale = 1) => sprite(id, `palm_0${variant}.webp`, x, y, Math.round(170 * scale), Math.round(225 * scale), {
  collision: { x: -14 * scale, y: -22 * scale, w: 28 * scale, h: 22 * scale }, tags: ["tree", "palm", "individual"], occlusion: "entity-visible", eager: true,
});
const cactus = (id, variant, x, y, scale = 1, solid = true) => sprite(id, `cactus_0${variant}.webp`, x, y, Math.round(100 * scale), Math.round(150 * scale), {
  collision: solid ? { x: -13 * scale, y: -22 * scale, w: 26 * scale, h: 22 * scale } : null, layer: solid ? "solid" : "low", tags: ["cactus", "individual"],
});
const rock = (id, variant, x, y, scale = 1, solid = true) => sprite(id, `desert_rock_0${variant}.webp`, x, y, Math.round(145 * scale), Math.round(110 * scale), {
  collision: solid ? { x: -30 * scale, y: -18 * scale, w: 60 * scale, h: 18 * scale } : null, layer: solid ? "solid" : "low", tags: ["rock", "individual"],
});
const tent = (id, x, y, scale = 1, dark = false) => sprite(id, dark ? "tent_nomad_dark.webp" : "tent_nomad_01.webp", x, y, Math.round(220 * scale), Math.round(165 * scale), {
  collision: { x: -60 * scale, y: -28 * scale, w: 120 * scale, h: 28 * scale }, tags: ["tent", "structure", "individual"], occlusion: "entity-visible", eager: true,
});
const house = (id, x, y, scale = 1, hall = false) => sprite(id, hall ? "adobe_hall_01.webp" : "adobe_house_01.webp", x, y, Math.round((hall ? 300 : 235) * scale), Math.round((hall ? 235 : 190) * scale), {
  collision: { x: -(hall ? 92 : 68) * scale, y: -45 * scale, w: (hall ? 184 : 136) * scale, h: 45 * scale }, tags: ["house", "structure", "individual"], occlusion: "entity-visible", eager: true,
});
const market = (id, x, y, scale = 1) => sprite(id, "market_building_01.webp", x, y, Math.round(360 * scale), Math.round(245 * scale), { collision: { x: -118 * scale, y: -48 * scale, w: 236 * scale, h: 48 * scale }, tags: ["market", "structure", "individual"], occlusion: "entity-visible", eager: true });
const portal = (id, x, y, scale = 1) => sprite(id, "portal_sand.webp", x, y, Math.round(180 * scale), Math.round(210 * scale), {
  effect: "portal", collision: [{ x: -62 * scale, y: -36 * scale, w: 25 * scale, h: 36 * scale }, { x: 37 * scale, y: -36 * scale, w: 25 * scale, h: 36 * scale }], tags: ["portal", "structure", "individual"], eager: true,
});
const campfire = (id, x, y, scale = 1) => sprite(id, "campfire_01.webp", x, y, Math.round(110 * scale), Math.round(95 * scale), { effect: "fire", collision: { x: -18 * scale, y: -12 * scale, w: 36 * scale, h: 12 * scale }, tags: ["fire", "individual"] });
const crate = (id, x, y, scale = 1) => sprite(id, "crate_01.webp", x, y, Math.round(90 * scale), Math.round(80 * scale), { collision: { x: -16 * scale, y: -13 * scale, w: 32 * scale, h: 13 * scale }, tags: ["prop", "individual"] });
const arch = (id, x, y, scale = 1) => sprite(id, "desert_arch_01.webp", x, y, Math.round(260 * scale), Math.round(220 * scale), { collision: [{ x: -93 * scale, y: -40 * scale, w: 35 * scale, h: 40 * scale }, { x: 58 * scale, y: -40 * scale, w: 35 * scale, h: 40 * scale }], tags: ["ruin", "structure", "individual"] });
const bridge = (id, x, y, scale = 1, rotate = 0) => sprite(id, "rope_bridge_01.webp", x, y, Math.round(330 * scale), Math.round(125 * scale), { rotate, layer: "solid", tags: ["bridge", "individual"], eager: true });
const cave = (id, x, y, scale = 1) => sprite(id, "canyon_cave_01.webp", x, y, Math.round(285 * scale), Math.round(190 * scale), { collision: [{ x: -112 * scale, y: -30 * scale, w: 44 * scale, h: 30 * scale }, { x: 68 * scale, y: -30 * scale, w: 44 * scale, h: 30 * scale }], tags: ["cave", "structure", "individual"] });
const tower = (id, x, y, scale = 1) => sprite(id, "desert_watchtower_01.webp", x, y, Math.round(195 * scale), Math.round(250 * scale), { collision: { x: -36 * scale, y: -30 * scale, w: 72 * scale, h: 30 * scale }, tags: ["tower", "structure", "individual"], occlusion: "entity-visible" });
const temple = (id, x, y, scale = 1) => sprite(id, "solar_temple_01.webp", x, y, Math.round(430 * scale), Math.round(315 * scale), { collision: [{ x: -177 * scale, y: -54 * scale, w: 72 * scale, h: 54 * scale }, { x: 105 * scale, y: -54 * scale, w: 72 * scale, h: 54 * scale }], tags: ["temple", "structure", "individual"], occlusion: "entity-visible", eager: true });
const caravan = (id, x, y, scale = 1) => sprite(id, "caravan_01.webp", x, y, Math.round(220 * scale), Math.round(135 * scale), { collision: { x: -75 * scale, y: -26 * scale, w: 150 * scale, h: 26 * scale }, tags: ["caravan", "structure", "individual"] });

const edgePlants = (prefix, entries) => entries.map((e, i) => e[0] === "p" ? palm(`${prefix}_${i}`, e[1], e[2], e[3], e[4] || 1) : cactus(`${prefix}_${i}`, e[1], e[2], e[3], e[4] || 1));

export const DESERT_VISUAL_SCENES = {
  A1: scene("A1", {
    spawn:{x:820,y:610}, safeCenter:{x:730,y:500},
    objects:[
      ...edgePlants("da1_edge",[["p",1,80,120,.78],["p",2,240,95,.8],["p",1,520,100,.78],["p",2,760,110,.8],["p",1,885,165,.76],["p",2,90,610,.72],["p",1,880,600,.72]]),
      house("da1_wayhouse",735,365,.68), rock("da1_rock_1",1,760,515,.62), cactus("da1_cactus",1,660,525,.65,false), crate("da1_crate",835,475,.55),
    ],
    terrainCollisions:[rect("da1_oasis",80,80,590,500,{terrain:"water"})],
    enemyAnchors:[{x:705,y:180},{x:820,y:300},{x:720,y:560}], chestAnchors:[{x:850,y:190},{x:700,y:610}], objectiveAnchor:{x:730,y:365},
  }),

  B1: scene("B1", {
    spawn:{x:160,y:210}, sanctuary:{x:160,y:125,spawnX:160,spawnY:210}, safeCenter:{x:490,y:390},
    objects:[
      ...edgePlants("db1_edge",[["c",1,70,110,.78],["c",2,885,115,.78],["p",1,90,610,.7],["p",2,875,600,.7]]),
      portal("db1_portal",160,125,.72), tent("db1_tent_1",335,300,.7), tent("db1_tent_2",555,285,.7,true), tent("db1_tent_3",730,435,.66), tent("db1_tent_4",365,545,.62,true),
      campfire("db1_fire",505,430,.72), caravan("db1_caravan",745,300,.62), crate("db1_crate_1",625,350,.65), crate("db1_crate_2",780,515,.58), rock("db1_rock",2,250,500,.62,false),
    ],
    npcAnchors:{main:{x:430,y:350},merchant:{x:610,y:370},inn:{x:350,y:470},smith:{x:665,y:485},explorer:{x:525,y:540},flavor:{x:770,y:395}},
    enemyAnchors:[{x:835,y:610},{x:820,y:190}], chestAnchors:[{x:815,y:510},{x:250,y:575}], objectiveAnchor:{x:745,y:300},
  }),

  C1: scene("C1", {
    spawn:{x:480,y:650}, safeCenter:{x:500,y:390},
    objects:[
      ...edgePlants("dc1_edge",[["c",1,75,110,.92],["c",2,220,105,.86],["c",1,740,105,.9],["c",2,880,120,.88],["c",1,85,610,.84],["c",2,875,590,.82]]),
      portal("dc1_secondary_shrine",480,230,.62), arch("dc1_arch",700,320,.72), rock("dc1_rock_1",1,285,340,.85), rock("dc1_rock_2",2,790,500,.78), rock("dc1_rock_3",1,250,535,.65), cactus("dc1_cactus",2,610,520,.66,false),
    ],
    enemyAnchors:[{x:245,y:480},{x:430,y:520},{x:620,y:490},{x:795,y:425}], chestAnchors:[{x:155,y:520},{x:820,y:570}], objectiveAnchor:{x:480,y:250},
  }),

  A2: scene("A2", {
    spawn:{x:480,y:650}, safeCenter:{x:480,y:385},
    objects:[
      bridge("da2_bridge",480,380,.76,90), cave("da2_cave_l",250,260,.68), cave("da2_cave_r",740,275,.68), rock("da2_rock_1",1,310,500,.68), rock("da2_rock_2",2,660,520,.7), cactus("da2_cactus_1",1,260,520,.62,false), cactus("da2_cactus_2",2,760,505,.62,false),
    ],
    terrainCollisions:[rect("da2_canyon_l",0,0,360,720,{terrain:"canyon"}),rect("da2_canyon_r",600,0,360,720,{terrain:"canyon"})],
    enemyAnchors:[{x:420,y:540},{x:545,y:520},{x:430,y:230},{x:555,y:250}], chestAnchors:[{x:410,y:150},{x:560,y:585}], objectiveAnchor:{x:480,y:300},
  }),

  B2: scene("B2", {
    spawn:{x:390,y:500}, sanctuary:{x:390,y:590,spawnX:390,spawnY:500}, safeCenter:{x:500,y:380},
    objects:[
      market("db2_market",500,225,.82), house("db2_hall",250,400,.64,true), house("db2_house_1",760,380,.72), house("db2_house_2",700,570,.62), house("db2_house_3",245,570,.61),
      portal("db2_portal",390,590,.63), tower("db2_tower_l",105,270,.58), tower("db2_tower_r",865,270,.58), caravan("db2_caravan",770,500,.56), crate("db2_crate",610,465,.58),
    ],
    npcAnchors:{main:{x:505,y:315},merchant:{x:645,y:385},inn:{x:340,y:425},smith:{x:255,y:480},explorer:{x:535,y:520},flavor:{x:755,y:525}},
    enemyAnchors:[{x:850,y:140}], chestAnchors:[{x:140,y:165},{x:835,y:170}], objectiveAnchor:{x:500,y:270},
  }),

  C2: scene("C2", {
    spawn:{x:480,y:650}, safeCenter:{x:500,y:390},
    objects:[
      ...edgePlants("dc2_edge",[["c",1,80,115,.82],["c",2,230,105,.78],["c",1,730,105,.82],["c",2,880,120,.78],["c",1,85,610,.78],["c",2,875,600,.76]]),
      arch("dc2_arch",500,310,.86), rock("dc2_rock_1",1,280,260,.68), rock("dc2_rock_2",2,740,300,.72), rock("dc2_rock_3",1,300,525,.62), cactus("dc2_cactus",2,770,510,.7,false),
    ],
    enemyAnchors:[{x:240,y:480},{x:410,y:535},{x:620,y:500},{x:790,y:430},{x:500,y:385}], chestAnchors:[{x:160,y:520},{x:820,y:565}], objectiveAnchor:{x:500,y:330},
  }),

  A3: scene("A3", {
    spawn:{x:480,y:55}, safeCenter:{x:500,y:390},
    objects:[
      ...edgePlants("da3_edge",[["c",1,80,110,.82],["c",2,875,120,.8],["c",1,85,610,.8],["c",2,875,600,.78]]),
      tower("da3_tower",260,265,.75), tent("da3_tent_1",520,300,.62,true), tent("da3_tent_2",700,400,.6), campfire("da3_fire",520,475,.56), caravan("da3_caravan",730,520,.53), crate("da3_crate",650,540,.54), rock("da3_rock",2,250,520,.65),
    ],
    npcAnchors:{main:{x:430,y:365},explorer:{x:590,y:385},guard:{x:345,y:465},flavor:{x:650,y:500}},
    enemyAnchors:[{x:190,y:520},{x:810,y:520}], chestAnchors:[{x:160,y:190},{x:830,y:580}], objectiveAnchor:{x:260,y:300},
  }),

  B3: scene("B3", {
    spawn:{x:300,y:490}, sanctuary:{x:300,y:560,spawnX:300,spawnY:490}, safeCenter:{x:500,y:385},
    objects:[
      ...edgePlants("db3_edge",[["p",1,80,105,.75],["p",2,245,100,.72],["p",1,720,100,.75],["p",2,880,115,.73],["p",1,90,610,.7],["p",2,875,600,.7]]),
      house("db3_house_1",220,300,.64), house("db3_house_2",470,270,.68), house("db3_house_3",735,335,.62), house("db3_hall",650,570,.58,true), portal("db3_portal",300,560,.58),
      campfire("db3_fire",480,470,.52), crate("db3_crate",800,500,.58), cactus("db3_cactus",1,165,455,.58,false), rock("db3_rock",2,795,585,.55,false),
    ],
    npcAnchors:{main:{x:430,y:350},merchant:{x:605,y:370},inn:{x:350,y:440},smith:{x:710,y:460},explorer:{x:500,y:535},flavor:{x:790,y:380}},
    enemyAnchors:[{x:845,y:180}], chestAnchors:[{x:150,y:170},{x:840,y:570}], objectiveAnchor:{x:650,y:570},
  }),

  C3: scene("C3", {
    spawn:{x:480,y:650}, safeCenter:{x:500,y:370},
    objects:[
      rock("dc3_rock_l",1,190,410,.82), rock("dc3_rock_r",2,810,420,.82), cactus("dc3_cactus_l",1,125,530,.68), cactus("dc3_cactus_r",2,865,525,.68),
      temple("dc3_temple",500,305,.96), rock("dc3_rock_bl",2,280,570,.65), rock("dc3_rock_br",1,720,570,.65),
    ],
    enemyAnchors:[], chestAnchors:[{x:820,y:555}], bossAnchor:{x:500,y:390}, objectiveAnchor:{x:500,y:390},
  }),
};

export const DESERT_VISUAL_SCENE_LIST = Object.values(DESERT_VISUAL_SCENES);
export default DESERT_VISUAL_SCENES;
