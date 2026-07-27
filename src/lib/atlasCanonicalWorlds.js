// PROYECTO ATLAS — Mundo manual canónico v3.3.
// Los 27 sectores se construyen con posiciones fijas, sin semillas ni generación procedural.
import { REGIONS, MONSTERS } from "@/lib/atlasData";
import { buildSettlement } from "@/lib/atlasSettlements";
import { getSettlementNpcs } from "@/lib/atlasSettlementNpcs";
import { getSectorDef, sectorIdFromCoords } from "@/lib/atlasRegionSectors";
import { getSectorTransitions, clearTransitionCorridors } from "@/lib/atlasTransitions";
import { buildStoryPoints } from "@/lib/atlasStoryPoints";
import { openTerrainAccess } from "@/lib/atlasAccessBreaches";
import { REGION_CHEST_SEALS } from "@/lib/atlasChestSystem";
import { SANCTUARIES, getSanctuaryForSector, validateSanctuaryZone } from "@/lib/atlasSanctuaries";
import { validateAllStoryPoints } from "@/lib/atlasStoryPoints";
import { validateWorldAccessibility } from "@/lib/atlasWorldAccessibility";
import { getVisualScene } from "@/lib/atlasVisualScenes";
import { scaleMonsterStats } from "@/lib/atlasEnemyScaling";
import { getGreenEnemyPool } from "@/lib/atlasGreenBestiary";
import { filterReferencedStoryPoints } from "@/lib/atlasMissionIntegrity";

const W = 960;
const H = 720;
const monsterById = (id) => MONSTERS.find(m => m.id === id) || MONSTERS[0];
const REGION_ENEMIES = {
  fria: ["lobo_salvaje", "pantera_sombria", "orco_bruto", "chaman_orco", "guerrero_esqueletico"],
  desierto: ["guerrero_esqueletico", "asesino_esqueletico", "necromante", "asesino_orco", "orco_bruto"],
};

const p = (x, y) => ({ x, y });
const shape = (type, x, y, w, h, options = {}) => ({ type, x, y, w, h, ...options });
const road = (...points) => points.map(([x, y]) => ({ x, y }));
const obj = (icon, x, y, sz, options = {}) => ({ icon, x, y, sz, ...options });

const LAYOUTS = {
  verde: {
    A1: {
      spawn: p(80, 610), safeCenter: p(170, 560),
      roads: [road([70, 650], [170, 570], [310, 500], [470, 390], [690, 390], [880, 350])],
      terrain: [shape("water", 40, 55, 390, 260), shape("plateau", 610, 45, 270, 170, { depth: 14 }), shape("groundPatch", 430, 300, 360, 210, { color: "#6f8d50", opacity: .45 })],
      decor: [obj("bridge", 420, 240, 120), obj("shrine", 210, 155, 62), obj("deadtree", 650, 185, 72, { solid: true }), obj("statue", 835, 190, 88, { solid: true }), obj("tent", 660, 105, 70, { solid: true }), obj("campfire", 720, 150, 42)],
      edge: "forest", edgeDensity: 26,
      enemySpawns: [p(560, 560), p(760, 510), p(830, 620), p(510, 190)],
      chestSpawns: [p(120, 360), p(825, 310)],
    },
    B1: {
      spawn: p(70, 610), safeCenter: p(460, 370),
      roads: [road([70, 640], [220, 560], [360, 465], [470, 380], [650, 300], [890, 210])],
      terrain: [shape("plateau", 270, 145, 420, 300, { depth: 20 }), shape("cliff", 700, 60, 190, 220, { depth: 22 })],
      decor: [obj("gate", 470, 255, 130, { solid: true }), obj("ruins", 370, 360, 100, { solid: true }), obj("ruins", 575, 360, 110, { solid: true }), obj("statue", 475, 410, 72, { solid: true }), obj("torch", 330, 455, 38), obj("torch", 615, 455, 38), obj("anvil", 165, 205, 50)],
      edge: "forest", edgeDensity: 24,
      enemySpawns: [p(330, 520), p(500, 510), p(650, 485), p(770, 330), p(215, 260)],
      chestSpawns: [p(175, 520), p(790, 540), p(810, 155)],
    },
    C1: {
      spawn: p(70, 615), safeCenter: p(540, 350),
      roads: [road([70, 645], [230, 560], [390, 470], [520, 375], [710, 250], [890, 150])],
      terrain: [shape("cliff", 560, 65, 330, 220, { depth: 24 }), shape("plateau", 340, 270, 360, 230, { depth: 16 })],
      decor: [obj("cave", 735, 145, 160, { solid: true }), obj("fortress", 540, 270, 190, { solid: true }), obj("shrine", 680, 310, 70), obj("deadtree", 265, 260, 82, { solid: true }), obj("deadtree", 820, 390, 72, { solid: true }), obj("ruins", 425, 430, 90, { solid: true })],
      edge: "forest", edgeDensity: 25,
      enemySpawns: [p(310, 560), p(470, 530), p(620, 500), p(780, 470), p(700, 255)],
      chestSpawns: [p(150, 500), p(820, 560), p(825, 235)],
    },
    A2: {
      spawn: p(75, 610), safeCenter: p(350, 380), settlement: "campamento",
      roads: [road([70, 650], [180, 570], [300, 455], [390, 360], [570, 315], [760, 310], [900, 280])],
      terrain: [shape("river", 20, 90, 140, 530, { rotate: -4 }), shape("plateau", 535, 65, 340, 210, { depth: 14 }), shape("groundPatch", 205, 250, 360, 300, { color: "#8f8056", opacity: .35 })],
      decor: [obj("bridge", 145, 340, 150), obj("shrine", 130, 120, 72), obj("tower", 750, 120, 120, { solid: true })],
      edge: "forest", edgeDensity: 18,
      enemySpawns: [p(700, 580), p(820, 530), p(700, 390), p(190, 590)],
      chestSpawns: [p(775, 420), p(835, 610)],
    },
    B2: {
      spawn: p(70, 630), safeCenter: p(500, 360), settlement: "ciudad",
      roads: [road([70, 650], [250, 545], [410, 455], [500, 390]), road([500, 390], [680, 470], [890, 590])],
      terrain: [shape("plateau", 220, 90, 560, 470, { depth: 18, radius: "18%" }), shape("groundPatch", 365, 460, 270, 120, { color: "#a68b66", opacity: .45 })],
      decor: [obj("castle", 660, 130, 230, { solid: true })],
      edge: "forest", edgeDensity: 10,
      enemySpawns: [p(840, 140)],
      chestSpawns: [p(160, 190), p(835, 190)],
    },
    C2: {
      spawn: p(75, 620), safeCenter: p(520, 380), settlement: "pueblo",
      roads: [road([70, 650], [220, 560], [360, 470], [520, 390], [700, 300], [890, 220]), road([520, 390], [520, 690])],
      terrain: [shape("groundPatch", 250, 220, 520, 350, { color: "#8f805e", opacity: .45 }), shape("plateau", 650, 70, 250, 160, { depth: 10 })],
      decor: [obj("house", 680, 140, 100, { solid: true }), obj("house2", 780, 280, 105, { solid: true }), obj("fence", 815, 500, 80, { solid: true })],
      edge: "forest", edgeDensity: 15,
      enemySpawns: [p(175, 220), p(230, 315), p(150, 470)],
      chestSpawns: [p(830, 125), p(185, 560)],
    },
    A3: {
      spawn: p(75, 620), safeCenter: p(430, 380),
      roads: [road([70, 650], [170, 555], [275, 480], [400, 410], [520, 315], [660, 220], [885, 130])],
      terrain: [shape("plateau", 560, 65, 300, 180, { depth: 18 }), shape("cliff", 80, 80, 230, 190, { depth: 20 })],
      decor: [obj("tent", 635, 170, 75, { solid: true }), obj("campfire", 700, 205, 44), obj("deadtree", 580, 300, 82, { solid: true }), obj("deadtree", 770, 370, 75, { solid: true }), obj("cave", 190, 170, 120, { solid: true }), obj("statue", 300, 530, 72, { solid: true })],
      edge: "forest_dense", edgeDensity: 32,
      enemySpawns: [p(250, 300), p(400, 250), p(550, 515), p(720, 500), p(825, 580)],
      chestSpawns: [p(150, 500), p(830, 220)],
    },
    B3: {
      spawn: p(75, 620), safeCenter: p(480, 380),
      roads: [road([70, 650], [220, 565], [390, 470], [470, 380], [590, 300], [760, 220], [890, 150])],
      terrain: [shape("river", 400, -20, 120, 760, { rotate: 12 }), shape("plateau", 610, 80, 260, 175, { depth: 18 }), shape("cliff", 85, 115, 230, 165, { depth: 16 })],
      decor: [obj("bridge", 465, 380, 150), obj("ruins", 730, 190, 110, { solid: true }), obj("shrine", 790, 145, 58), obj("deadtree", 260, 270, 75, { solid: true }), obj("deadtree", 680, 500, 80, { solid: true }), obj("gem", 700, 440, 70)],
      edge: "forest", edgeDensity: 22,
      enemySpawns: [p(220, 500), p(330, 390), p(600, 540), p(760, 390), p(820, 570)],
      chestSpawns: [p(170, 190), p(790, 290), p(850, 600)],
    },
    C3: {
      spawn: p(75, 620), safeCenter: p(600, 330), boss: true,
      roads: [road([70, 650], [230, 560], [400, 465], [560, 380], [690, 295])],
      terrain: [shape("plateau", 390, 70, 500, 410, { depth: 26, radius: "28%" }), shape("cliff", 610, 20, 270, 170, { depth: 24 })],
      decor: [obj("fortress", 680, 190, 260, { solid: true }), obj("gate", 600, 380, 145, { solid: true }), obj("ruins", 440, 270, 95, { solid: true }), obj("ruins", 820, 330, 90, { solid: true }), obj("torch", 520, 415, 42), obj("torch", 680, 415, 42), obj("statue", 600, 300, 80, { solid: true })],
      edge: "forest_dark", edgeDensity: 18,
      enemySpawns: [], chestSpawns: [p(825, 520)],
    },
  },

  fria: {
    A1: {
      spawn: p(80, 610), safeCenter: p(300, 430),
      roads: [road([80, 650], [210, 560], [330, 470], [470, 390], [650, 330], [890, 310])],
      terrain: [shape("water", -70, 10, 430, 300), shape("snowbank", 540, 45, 340, 170, { depth: 14 }), shape("cliff", 670, 330, 240, 230, { depth: 20 })],
      decor: [obj("ship", 145, 150, 190, { solid: true }), obj("bridge", 315, 250, 130), obj("tent", 380, 480, 70, { solid: true }), obj("campfire", 440, 505, 42), obj("mountainsnow", 790, 420, 160, { solid: true }), obj("shrine", 650, 120, 62)],
      edge: "snow", edgeDensity: 22,
      enemySpawns: [p(530, 560), p(690, 570), p(820, 610)], chestSpawns: [p(420, 170), p(830, 170)],
    },
    B1: {
      spawn: p(75, 620), safeCenter: p(450, 390), settlement: "campamento",
      roads: [road([70, 650], [220, 560], [360, 460], [450, 390], [640, 300], [890, 250])],
      terrain: [shape("snowbank", 120, 50, 300, 170, { depth: 12 }), shape("snowbank", 640, 60, 270, 160, { depth: 14 })],
      decor: [obj("shrine", 165, 125, 65), obj("tower", 770, 150, 125, { solid: true })],
      edge: "snow", edgeDensity: 20,
      enemySpawns: [p(720, 540), p(830, 480), p(720, 370)], chestSpawns: [p(165, 520), p(845, 610)],
    },
    C1: {
      spawn: p(75, 620), safeCenter: p(500, 380),
      roads: [road([70, 650], [220, 560], [350, 470], [500, 380], [690, 280], [890, 180])],
      terrain: [shape("snowbank", 560, 55, 320, 180, { depth: 16 }), shape("cliff", 130, 90, 250, 190, { depth: 18 })],
      decor: [obj("fortress", 700, 165, 180, { solid: true }), obj("treepine", 310, 280, 90, { solid: true }), obj("treepine", 410, 220, 95, { solid: true }), obj("treepine", 620, 360, 88, { solid: true }), obj("ruins", 500, 420, 90, { solid: true }), obj("lamppost", 670, 300, 42)],
      edge: "snow_forest", edgeDensity: 28,
      enemySpawns: [p(250, 500), p(430, 520), p(620, 500), p(790, 430), p(815, 600)], chestSpawns: [p(160, 180), p(800, 235), p(850, 540)],
    },
    A2: {
      spawn: p(75, 620), safeCenter: p(480, 365),
      roads: [road([70, 650], [210, 560], [360, 470], [480, 380], [620, 280], [850, 160])],
      terrain: [shape("plateau", 250, 110, 470, 310, { depth: 22 }), shape("snowbank", 690, 70, 210, 150, { depth: 12 })],
      decor: [obj("gate", 480, 235, 140, { solid: true }), obj("ruins", 355, 345, 105, { solid: true }), obj("ruins", 610, 350, 110, { solid: true }), obj("statue", 480, 410, 72, { solid: true }), obj("shrine", 755, 150, 60), obj("mountainsnow", 150, 180, 140, { solid: true })],
      edge: "snow", edgeDensity: 18,
      enemySpawns: [p(280, 520), p(470, 535), p(660, 500), p(790, 420)], chestSpawns: [p(150, 500), p(815, 270)],
    },
    B2: {
      spawn: p(75, 620), safeCenter: p(500, 365), settlement: "ciudad",
      roads: [road([70, 650], [240, 555], [405, 465], [500, 390]), road([500, 390], [680, 480], [890, 590])],
      terrain: [shape("plateau", 210, 80, 580, 470, { depth: 20, radius: "20%" }), shape("snowbank", 260, 470, 470, 110, { depth: 8 })],
      decor: [obj("fortress", 660, 130, 250, { solid: true })],
      edge: "snow", edgeDensity: 10,
      enemySpawns: [p(845, 160)], chestSpawns: [p(160, 175), p(835, 175)],
    },
    C2: {
      spawn: p(75, 620), safeCenter: p(500, 380),
      roads: [road([70, 650], [220, 560], [390, 470], [500, 390], [640, 300], [860, 200])],
      terrain: [shape("river", 410, -30, 145, 780, { rotate: -10 }), shape("cliff", 610, 70, 280, 200, { depth: 22 }), shape("snowbank", 90, 80, 250, 160, { depth: 12 })],
      decor: [obj("bridge", 480, 390, 155), obj("gem", 690, 220, 85), obj("gem", 780, 280, 70), obj("ruins", 250, 250, 100, { solid: true }), obj("cave", 770, 150, 130, { solid: true }), obj("mountainsnow", 210, 500, 130, { solid: true })],
      edge: "snow", edgeDensity: 18,
      enemySpawns: [p(230, 520), p(350, 400), p(620, 520), p(760, 430), p(840, 590), p(700, 300)], chestSpawns: [p(150, 170), p(820, 250), p(850, 560)],
    },
    A3: {
      spawn: p(75, 620), safeCenter: p(470, 390),
      roads: [road([70, 650], [220, 560], [360, 470], [480, 390], [650, 300], [880, 230])],
      terrain: [shape("snowbank", 580, 70, 300, 180, { depth: 16 }), shape("cliff", 110, 90, 250, 200, { depth: 20 })],
      decor: [obj("tower", 690, 160, 150, { solid: true }), obj("fortress", 520, 340, 180, { solid: true }), obj("banner", 620, 430, 50), obj("campfire", 400, 470, 42), obj("tent", 330, 440, 70, { solid: true }), obj("mountainsnow", 200, 180, 150, { solid: true })],
      edge: "snow", edgeDensity: 20,
      enemySpawns: [p(220, 510), p(350, 290), p(680, 520), p(820, 500)], chestSpawns: [p(160, 300), p(825, 180)],
    },
    B3: {
      spawn: p(75, 620), safeCenter: p(520, 390), settlement: "pueblo",
      roads: [road([70, 650], [220, 555], [380, 470], [520, 395], [690, 305], [890, 235])],
      terrain: [shape("water", 590, 40, 310, 220), shape("snowbank", 90, 60, 260, 150, { depth: 12 })],
      decor: [obj("bridge", 650, 250, 130), obj("house2", 790, 480, 100, { solid: true }), obj("ship", 740, 120, 140, { solid: true })],
      edge: "snow", edgeDensity: 15,
      enemySpawns: [p(180, 230), p(240, 350), p(160, 520)], chestSpawns: [p(840, 160), p(180, 570)],
    },
    C3: {
      spawn: p(75, 620), safeCenter: p(620, 330), boss: true,
      roads: [road([70, 650], [220, 560], [390, 470], [550, 380], [690, 280])],
      terrain: [shape("plateau", 390, 55, 500, 410, { depth: 28 }), shape("snowbank", 620, 10, 250, 160, { depth: 14 })],
      decor: [obj("fortress", 690, 170, 280, { solid: true }), obj("gate", 610, 390, 145, { solid: true }), obj("gem", 500, 270, 82), obj("gem", 820, 320, 80), obj("ruins", 420, 390, 100, { solid: true }), obj("torch", 540, 430, 42), obj("torch", 680, 430, 42)],
      edge: "snow", edgeDensity: 14,
      enemySpawns: [], chestSpawns: [p(840, 550)],
    },
  },

  desierto: {
    A1: {
      spawn: p(75, 620), safeCenter: p(310, 430),
      roads: [road([70, 650], [220, 555], [340, 470], [470, 390], [650, 315], [890, 260])],
      terrain: [shape("water", 65, 65, 300, 215), shape("dune", 540, 45, 340, 170, { depth: 12 }), shape("cliff", 680, 340, 220, 200, { depth: 20 })],
      decor: [obj("tree2", 175, 155, 95, { solid: true }), obj("tree2", 275, 195, 90, { solid: true }), obj("shrine", 180, 110, 62), obj("tent", 380, 470, 72, { solid: true }), obj("campfire", 445, 495, 42), obj("mountain", 790, 430, 145, { solid: true })],
      edge: "desert", edgeDensity: 18,
      enemySpawns: [p(560, 560), p(720, 570), p(830, 610)], chestSpawns: [p(420, 160), p(830, 170)],
    },
    B1: {
      spawn: p(75, 620), safeCenter: p(470, 390), settlement: "campamento",
      roads: [road([70, 650], [220, 560], [370, 470], [470, 390], [650, 310], [890, 250])],
      terrain: [shape("dune", 100, 50, 300, 160, { depth: 12 }), shape("dune", 650, 55, 250, 150, { depth: 12 })],
      decor: [obj("shrine", 160, 125, 64), obj("tower", 770, 145, 125, { solid: true })],
      edge: "desert", edgeDensity: 16,
      enemySpawns: [p(720, 540), p(830, 480), p(720, 370)], chestSpawns: [p(170, 520), p(845, 610)],
    },
    C1: {
      spawn: p(75, 620), safeCenter: p(500, 380),
      roads: [road([70, 650], [220, 560], [360, 470], [500, 380], [680, 285], [890, 190])],
      terrain: [shape("cliff", 560, 50, 330, 210, { depth: 24 }), shape("dune", 90, 70, 280, 160, { depth: 12 })],
      decor: [obj("shrine", 690, 175, 72), obj("mountain", 780, 200, 145, { solid: true }), obj("mountain", 590, 300, 130, { solid: true }), obj("ruins", 470, 420, 100, { solid: true }), obj("cactus", 280, 270, 85, { solid: true }), obj("cactus", 820, 430, 80, { solid: true })],
      edge: "desert_rock", edgeDensity: 22,
      enemySpawns: [p(250, 520), p(430, 530), p(620, 510), p(790, 460)], chestSpawns: [p(155, 175), p(820, 250)],
    },
    A2: {
      spawn: p(75, 620), safeCenter: p(500, 380),
      roads: [road([70, 650], [220, 560], [380, 465], [500, 380], [650, 290], [875, 170])],
      terrain: [shape("cliff", 60, 60, 300, 520, { depth: 30, radius: "24%" }), shape("cliff", 620, 50, 280, 520, { depth: 30, radius: "24%" })],
      decor: [obj("bridge", 500, 370, 180), obj("cave", 745, 165, 140, { solid: true }), obj("ruins", 250, 250, 110, { solid: true }), obj("banner", 500, 480, 50), obj("mountain", 180, 500, 130, { solid: true }), obj("mountain", 820, 500, 130, { solid: true })],
      edge: "desert_rock", edgeDensity: 16,
      enemySpawns: [p(280, 520), p(390, 250), p(610, 510), p(760, 300), p(830, 590)], chestSpawns: [p(150, 170), p(835, 220)],
    },
    B2: {
      spawn: p(75, 620), safeCenter: p(500, 365), settlement: "ciudad",
      roads: [road([70, 650], [240, 555], [400, 465], [500, 390]), road([500, 390], [680, 480], [890, 590])],
      terrain: [shape("plateau", 210, 80, 580, 470, { depth: 20, radius: "20%" }), shape("dune", 250, 500, 500, 100, { depth: 8 })],
      decor: [obj("castle", 660, 130, 245, { solid: true })],
      edge: "desert", edgeDensity: 8,
      enemySpawns: [p(845, 160)], chestSpawns: [p(160, 175), p(835, 175)],
    },
    C2: {
      spawn: p(75, 620), safeCenter: p(500, 380),
      roads: [road([70, 650], [220, 560], [390, 470], [500, 390], [650, 300], [865, 195])],
      terrain: [shape("dune", 80, 50, 300, 170, { depth: 12 }), shape("dune", 590, 60, 300, 180, { depth: 14 }), shape("plateau", 330, 250, 350, 240, { depth: 18 })],
      decor: [obj("gate", 520, 260, 135, { solid: true }), obj("ruins", 390, 390, 105, { solid: true }), obj("ruins", 650, 390, 110, { solid: true }), obj("statue", 520, 430, 72, { solid: true }), obj("cactus", 250, 300, 82, { solid: true }), obj("cactus", 810, 310, 82, { solid: true })],
      edge: "desert", edgeDensity: 18,
      enemySpawns: [p(260, 520), p(430, 530), p(620, 510), p(790, 460)], chestSpawns: [p(155, 170), p(825, 250)],
    },
    A3: {
      spawn: p(75, 620), safeCenter: p(470, 390),
      roads: [road([70, 650], [220, 560], [360, 470], [480, 390], [650, 300], [880, 230])],
      terrain: [shape("dune", 560, 70, 300, 170, { depth: 14 }), shape("cliff", 100, 90, 260, 210, { depth: 20 })],
      decor: [obj("tower", 690, 160, 150, { solid: true }), obj("fortress", 520, 340, 180, { solid: true }), obj("banner", 620, 430, 50), obj("tent", 330, 440, 72, { solid: true }), obj("campfire", 400, 470, 42), obj("mountain", 200, 180, 145, { solid: true })],
      edge: "desert", edgeDensity: 16,
      enemySpawns: [p(220, 510), p(350, 290), p(680, 520), p(820, 500)], chestSpawns: [p(160, 300), p(825, 180)],
    },
    B3: {
      spawn: p(75, 620), safeCenter: p(520, 390), settlement: "pueblo",
      roads: [road([70, 650], [220, 555], [380, 470], [520, 395], [690, 305], [890, 235])],
      terrain: [shape("water", 590, 40, 310, 220), shape("dune", 80, 50, 300, 170, { depth: 12 })],
      decor: [obj("tree2", 680, 155, 90, { solid: true }), obj("tree2", 790, 170, 85, { solid: true }), obj("house2", 790, 480, 100, { solid: true }), obj("fence", 830, 520, 80, { solid: true })],
      edge: "desert", edgeDensity: 12,
      enemySpawns: [p(180, 230), p(240, 350), p(160, 520)], chestSpawns: [p(840, 160), p(180, 570)],
    },
    C3: {
      spawn: p(75, 620), safeCenter: p(620, 330), boss: true,
      roads: [road([70, 650], [220, 560], [390, 470], [550, 380], [690, 280])],
      terrain: [shape("plateau", 390, 55, 500, 410, { depth: 28 }), shape("dune", 620, 10, 250, 160, { depth: 12 })],
      decor: [obj("temple", 690, 170, 280, { solid: true }), obj("gate", 610, 390, 145, { solid: true }), obj("ruins", 420, 390, 100, { solid: true }), obj("statue", 500, 270, 82, { solid: true }), obj("torch", 540, 430, 42), obj("torch", 680, 430, 42), obj("banner", 760, 330, 52)],
      edge: "desert_rock", edgeDensity: 14,
      enemySpawns: [], chestSpawns: [p(840, 550)],
    },
  },
};

function cloneDecor(items = []) { return items.map(item => ({ ...item })); }
function addSolidFor(decor, solids) {
  for (const d of decor) {
    if (!d.solid) continue;
    const w = d.hitW || d.sz * 0.55;
    const h = d.hitH || d.sz * 0.38;
    solids.push({ x: d.x - w / 2, y: d.y - h / 2 + d.sz * 0.15, w, h });
  }
}

function shiftSettlement(region, role, center) {
  const tier = role === "campamento" ? 0 : role === "pueblo" ? 1 : 2;
  const built = buildSettlement(region, tier, W, H);
  const dx = center.x - built.center.x;
  const dy = center.y - built.center.y;
  const shiftPoint = item => ({ ...item, x: item.x + dx, y: item.y + dy });
  const decor = built.decor.map(shiftPoint);
  const solids = built.solids.map(s => ({ ...s, x: s.x + dx, y: s.y + dy }));
  const villagers = built.villagers.map(v => ({ ...v, x: v.x + dx, y: v.y + dy, home: { x: v.home.x + dx, y: v.home.y + dy } }));
  const smoke = built.smoke.map(s => ({ ...s, x: s.x + dx, y: s.y + dy }));
  const npcs = getSettlementNpcs(role, region, center);
  return { decor, solids, villagers, smoke, npcs };
}

function applyNpcAnchors(npcs, anchors = {}) {
  const used = new Set();
  return (npcs || []).map((npc, index) => {
    const direct = anchors[npc.role] || anchors[npc.id];
    if (direct) {
      used.add(npc.role);
      return { ...npc, x: direct.x, y: direct.y };
    }
    // Respaldo determinista alrededor del centro. Nunca coloca dos NPC en el mismo punto.
    const fallback = [
      { x: 390, y: 330 }, { x: 500, y: 330 }, { x: 610, y: 350 },
      { x: 350, y: 455 }, { x: 470, y: 470 }, { x: 590, y: 470 },
      { x: 410, y: 570 }, { x: 540, y: 570 },
    ][index % 8];
    return { ...npc, ...fallback };
  });
}

function addEdgeObjects(regionId, style, count, decor, solids) {
  const icon = regionId === "fria" ? "treepine" : regionId === "desierto" ? (style.includes("rock") ? "mountain" : "cactus") : style.includes("dark") ? "deadtree" : "trees";
  const positions = [];
  const topCount = Math.ceil(count * .28);
  const sideCount = Math.ceil(count * .22);
  for (let i = 0; i < topCount; i++) positions.push(p(55 + i * ((W - 110) / Math.max(1, topCount - 1)), 52 + (i % 2) * 16));
  for (let i = 0; i < topCount; i++) positions.push(p(55 + i * ((W - 110) / Math.max(1, topCount - 1)), H - 45 - (i % 2) * 14));
  for (let i = 0; i < sideCount; i++) positions.push(p(45 + (i % 2) * 14, 125 + i * ((H - 250) / Math.max(1, sideCount - 1))));
  for (let i = 0; i < sideCount; i++) positions.push(p(W - 45 - (i % 2) * 14, 125 + i * ((H - 250) / Math.max(1, sideCount - 1))));
  positions.slice(0, count).forEach((pt, index) => {
    const sz = style.includes("dense") ? 82 + (index % 3) * 8 : regionId === "desierto" ? 68 + (index % 3) * 8 : 72 + (index % 3) * 8;
    const item = { icon, x: pt.x, y: pt.y, sz, solid: true };
    decor.push(item);
    const w = sz * .46, h = sz * .3;
    solids.push({ x: pt.x - w / 2, y: pt.y - h / 2 + sz * .16, w, h });
  });
}

function fixedEnemies(region, sectorId, slots, boss) {
  if (boss) return [];
  const pool = region.id === "verde"
    ? getGreenEnemyPool(sectorId)
    : (REGION_ENEMIES[region.id] || REGION_ENEMIES.fria);
  if (!pool.length) return [];
  return (slots || []).map((slot, index) => {
    const base = monsterById(pool[(sectorId.charCodeAt(0) + Number(sectorId[1]) + index) % pool.length]);
    const missionTag = region.id === "verde" && sectorId === "C1" && index === 0 ? "custodio_santuario" : null;
    const scaled = scaleMonsterStats({
      ...base,
      elite: !!missionTag,
      missionTag,
      name: missionTag ? "Custodio del Santuario" : base.name,
    }, {
      regionId: region.id,
      sectorId,
      playerLevel: 1,
      elite: !!missionTag,
      roleFactor: missionTag ? 1.05 : undefined,
    });
    return {
      id: `${sectorId}_e_${index}`,
      x: slot.x,
      y: slot.y,
      angle: 0,
      timer: 120 + index * 25,
      monster: scaled,
    };
  });
}

function chestPlan(regionId, sectorId, slots) {
  const seals = REGION_CHEST_SEALS[regionId] || REGION_CHEST_SEALS.verde;
  const ancient = { A1: 0, B1: 1, C1: 2 };
  return (slots || []).map((slot, index) => {
    let type = "common";
    let extra = {};
    if (sectorId === "B3" && index === 0) { type = "legendary"; extra = { sealsRequired: seals.map(s => s.id) }; }
    else if (ancient[sectorId] != null && index === 0) { type = "ancient"; extra = { seal: seals[ancient[sectorId]] }; }
    return { id: `${regionId}_${sectorId}_${index}`, x: slot.x, y: slot.y, type, ...extra };
  });
}

function fixedShrines(def, sectorId, regionId) {
  // Santuario de asentamiento (Portal de Invocación de Atlas) — posición fija manual
  const sanctuary = getSanctuaryForSector(regionId, sectorId);
  if (sanctuary) {
    return [{
      id: sanctuary.id,
      sanctuaryId: sanctuary.id,
      x: sanctuary.x,
      y: sanctuary.y,
      spawnX: sanctuary.spawnX,
      spawnY: sanctuary.spawnY,
      safeRadius: sanctuary.safeRadius,
      interactionZone: sanctuary.interactionZone,
      destinationName: sanctuary.destinationName,
      settlementType: sanctuary.settlementType,
      isSanctuary: true,
      revealed: true,
      activated: false,
      type: "portal",
    }];
  }
  // Santuarios secundarios (no de asentamiento) en sectores con feature "santuario"
  if (!(def?.features || []).includes("santuario")) return [];
  return [{ id: `shrine_${regionId}_${sectorId}_secondary`, x: 165, y: 135, revealed: false, activated: false, type: null }];
}

function fixedFauna(regionId, sectorId) {
  const emojis = regionId === "fria" ? ["🐇", "🦊"] : regionId === "desierto" ? ["🦎", "🐪"] : ["🐇", "🦌"];
  return emojis.map((emoji, index) => ({ id: `${sectorId}_fauna_${index}`, emoji, x: 260 + index * 360, y: 580 - index * 90, speed: 1.1, angle: 0, timer: 140 + index * 40 }));
}

function fixedSignposts(regionId, col, row) {
  const result = [];
  const push = (x, y, dir, c, r) => {
    const def = getSectorDef(regionId, c, r);
    if (def) result.push({ x, y, labels: [{ dir, text: def.name }] });
  };
  if (row > 0) push(W / 2, 42, "up", col, row - 1);
  if (row < 2) push(W / 2, H - 42, "down", col, row + 1);
  if (col > 0) push(42, H / 2, "left", col - 1, row);
  if (col < 2) push(W - 42, H / 2, "right", col + 1, row);
  return result;
}

function makeBoss(region, sectorId, layout, visualScene) {
  if (!layout.boss) return null;
  const anchor = visualScene?.bossAnchor || { x: 690, y: 315 };
  const monster = scaleMonsterStats({ ...region.boss, boss: true }, {
    regionId: region.id,
    sectorId,
    playerLevel: 1,
    boss: true,
  });
  return { x: anchor.x, y: anchor.y, monster };
}

function addTerrainCollision(shapes, solids) {
  for (const s of shapes) {
    if (!["cliff", "plateau"].includes(s.type)) continue;
    const inset = 18;
    solids.push({ x: s.x + inset, y: s.y + inset, w: Math.max(20, s.w - inset * 2), h: Math.max(20, s.h - inset * 2), terrain: true, shape: s });
  }
}

function buildSectorWorld(region, col, row) {
  const sectorId = sectorIdFromCoords(col, row);
  const def = getSectorDef(region.id, sectorId);
  const layout = LAYOUTS[region.id][sectorId];
  const visualScene = getVisualScene(region.id, sectorId);
  const decor = visualScene ? [] : cloneDecor(layout.decor);
  const solids = [];
  const villagers = [];
  const smoke = [];
  let npcs = [];

  if (layout.settlement) {
    if (visualScene) {
      // La escena modular sustituye exclusivamente el arte del asentamiento.
      // Los NPC y servicios existentes se conservan y se anclan manualmente.
      npcs = applyNpcAnchors(getSettlementNpcs(layout.settlement, region, visualScene.safeCenter || layout.safeCenter), visualScene.npcAnchors);
    } else {
      const settlement = shiftSettlement(region, layout.settlement, layout.safeCenter);
      decor.push(...settlement.decor);
      solids.push(...settlement.solids);
      villagers.push(...settlement.villagers);
      smoke.push(...settlement.smoke);
      npcs = settlement.npcs;
    }
  }

  if (visualScene) {
    solids.push(...(visualScene.collisions || []).map(c => ({ ...c })));
  } else {
    addSolidFor(decor, solids);
    addEdgeObjects(region.id, layout.edge || "forest", layout.edgeDensity || 18, decor, solids);
    // En asentamientos las mesetas son fondos visuales, no planos sólidos gigantes.
    if (!layout.settlement) addTerrainCollision(layout.terrain || [], solids);
  }

  const boss = makeBoss(region, sectorId, layout, visualScene);
  const enemySlots = visualScene?.enemyAnchors?.length ? visualScene.enemyAnchors : layout.enemySpawns;
  const chestSlots = visualScene?.chestAnchors?.length ? visualScene.chestAnchors : layout.chestSpawns;
  const enemies = fixedEnemies(region, sectorId, enemySlots, !!boss);
  const chests = chestPlan(region.id, sectorId, chestSlots);
  const storyPoints = filterReferencedStoryPoints(region.id, buildStoryPoints(region.id, sectorId, W, H));
  const spawn = visualScene?.spawn || layout.spawn;
  const safeCenter = visualScene?.safeCenter || layout.safeCenter;
  // Los objetivos visibles provienen únicamente de misiones activas.
  // Se elimina el marcador genérico que producía puntos de interés sin sentido.
  const objective = null;
  let shrines = fixedShrines(def, sectorId, region.id);

  if (visualScene?.sanctuary && shrines.length) {
    shrines = shrines.map(shrine => shrine.isSanctuary ? {
      ...shrine,
      x: visualScene.sanctuary.x,
      y: visualScene.sanctuary.y,
      spawnX: visualScene.sanctuary.spawnX,
      spawnY: visualScene.sanctuary.spawnY,
      interactionZone: visualScene.sanctuary.interactionZone || shrine.interactionZone,
    } : shrine);
  }

  const world = {
    W, H,
    decor,
    water: [],
    terrainShapes: visualScene ? [] : (layout.terrain || []),
    roads: visualScene ? [] : (layout.roads || []),
    solids,
    npcs,
    chests,
    enemies,
    boss,
    storyPoints,
    objective,
    portals: [],
    spawn,
    biome: region.id,
    blockIndex: col,
    villagers,
    smoke,
    spawnZones: [spawn],
    shrines,
    safeCenter,
    safeRadius: layout.settlement ? (layout.settlement === "ciudad" ? 270 : layout.settlement === "pueblo" ? 235 : 205) : 70,
    sectorName: def?.name || sectorId,
    sectorSubtitle: def?.subtitle || "",
    sectorId,
    sectorType: def?.type || "natural",
    signposts: visualScene ? [] : fixedSignposts(region.id, col, row),
    ambientNpcs: [],
    loreMarkers: [],
    fauna: fixedFauna(region.id, sectorId),
    visualSceneId: visualScene?.id || null,
    visualSceneRegionId: visualScene?.regionId || null,
    visualSceneSectorId: visualScene?.sectorId || null,
    layoutMode: visualScene ? "modular-assets-v2.7" : "manual-canon-v3.3",
  };

  const sanctuary = getSanctuaryForSector(region.id, sectorId);
  if (sanctuary) validateSanctuaryZone(world, sanctuary);

  const openedWorld = visualScene ? world : openTerrainAccess(world);
  const validatedWorld = validateAllStoryPoints(openedWorld);
  const transitions = getSectorTransitions(region.id, sectorId);
  const cleared = clearTransitionCorridors(validatedWorld, transitions);
  return validateWorldAccessibility(cleared);
}

export function buildCanonicalExploreMaps() {
  const blocks = [];
  const wilds = [];
  for (const region of REGIONS) {
    const regionBlocks = [];
    const regionWilds = {};
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const world = buildSectorWorld(region, col, row);
        if (row === 1) regionBlocks[col] = world;
        else regionWilds[`${col}_${row}`] = world;
      }
    }
    blocks.push(regionBlocks);
    wilds.push(regionWilds);
  }
  return { blocks, wilds };
}