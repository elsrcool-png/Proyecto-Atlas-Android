// PROYECTO ATLAS — Mapa de tablero determinista.
// v3.3 elimina el antiguo constructor por semilla y cualquier aleatoriedad estructural.
import { REGIONS } from "@/lib/atlasData";

export const BLOCK_DEFS = {
  verde: [
    { name: "Campamento", subtitle: "Zona segura inicial", cols: 5, rows: 4, enemies: 3, chests: 2 },
    { name: "Pueblo", subtitle: "Bosque y comercio", cols: 5, rows: 4, enemies: 5, chests: 2 },
    { name: "Ciudad", subtitle: "Acceso al jefe", cols: 5, rows: 4, enemies: 5, chests: 2 },
  ],
  fria: [
    { name: "Campamento", subtitle: "Refugio del hielo", cols: 5, rows: 4, enemies: 3, chests: 2 },
    { name: "Pueblo", subtitle: "Comercio helado", cols: 5, rows: 4, enemies: 5, chests: 2 },
    { name: "Ciudadela", subtitle: "Acceso al dragón", cols: 5, rows: 4, enemies: 5, chests: 2 },
  ],
  desierto: [
    { name: "Campamento", subtitle: "Zona segura inicial", cols: 5, rows: 4, enemies: 3, chests: 2 },
    { name: "Pueblo", subtitle: "Oasis y comercio", cols: 5, rows: 4, enemies: 5, chests: 2 },
    { name: "Ciudad", subtitle: "Acceso al jefe", cols: 5, rows: 4, enemies: 5, chests: 2 },
  ],
};

const NODE_POSITIONS = [
  { id: "0_0", gx: 0, gy: 0, x: 0, y: 0 },
  { id: "2_0", gx: 2, gy: 0, x: 52, y: 0 },
  { id: "4_0", gx: 4, gy: 0, x: 104, y: 0 },
  { id: "1_1", gx: 1, gy: 1, x: 26, y: 34 },
  { id: "3_1", gx: 3, gy: 1, x: 78, y: 34 },
  { id: "5_1", gx: 5, gy: 1, x: 130, y: 34 },
  { id: "0_2", gx: 0, gy: 2, x: 0, y: 68 },
  { id: "2_2", gx: 2, gy: 2, x: 52, y: 68 },
  { id: "4_2", gx: 4, gy: 2, x: 104, y: 68 },
  { id: "6_2", gx: 6, gy: 2, x: 156, y: 68 },
  { id: "1_3", gx: 1, gy: 3, x: 26, y: 102 },
  { id: "3_3", gx: 3, gy: 3, x: 78, y: 102 },
  { id: "5_3", gx: 5, gy: 3, x: 130, y: 102 },
];

const EDGE_LIST = [
  ["0_0", "1_1"], ["2_0", "1_1"], ["2_0", "3_1"], ["4_0", "3_1"], ["4_0", "5_1"],
  ["1_1", "0_2"], ["1_1", "2_2"], ["3_1", "2_2"], ["3_1", "4_2"], ["5_1", "4_2"], ["5_1", "6_2"],
  ["0_2", "1_3"], ["2_2", "1_3"], ["2_2", "3_3"], ["4_2", "3_3"], ["4_2", "5_3"], ["6_2", "5_3"],
  ["2_0", "4_0"], ["0_2", "2_2"], ["2_2", "4_2"], ["4_2", "6_2"], ["1_3", "3_3"], ["3_3", "5_3"],
];

function makeTopology() {
  const topology = Object.fromEntries(NODE_POSITIONS.map(n => [n.id, []]));
  for (const [a, b] of EDGE_LIST) {
    topology[a].push(b);
    topology[b].push(a);
  }
  return topology;
}

function makeBlock(region, blockIndex) {
  const nodes = Object.fromEntries(NODE_POSITIONS.map(n => [n.id, {
    ...n,
    safe: false,
    boss: null,
    objective: false,
    gatewayTo: null,
    terrain: region.wildTerrains[(n.gx + n.gy + blockIndex) % region.wildTerrains.length],
  }]));

  const west = "0_0";
  const east = "6_2";
  let objectiveId = null;
  let eastGatewayId = null;
  let westGatewayId = null;

  if (blockIndex === 0) {
    nodes[west].safe = true;
    nodes[west].terrain = "campamento";
    nodes[east].safe = true;
    eastGatewayId = east;
  } else if (blockIndex === 1) {
    nodes[west].safe = true;
    westGatewayId = west;
    nodes["3_1"].safe = true;
    nodes["3_1"].terrain = "pueblo";
    nodes["4_2"].objective = true;
    objectiveId = "4_2";
    nodes[east].safe = true;
    eastGatewayId = east;
  } else {
    nodes[west].safe = true;
    westGatewayId = west;
    nodes["3_1"].safe = true;
    nodes["3_1"].terrain = "ciudad";
    nodes[east].boss = region.boss;
  }

  return {
    nodes,
    topology: makeTopology(),
    edges: EDGE_LIST.map(e => [...e]),
    objectiveId,
    eastGatewayId,
    westGatewayId,
    spawnId: west,
    viewBox: "-24 -24 220 160",
  };
}

export function buildValidatedBlockMaps() {
  return REGIONS.map(region => {
    const blocks = [0, 1, 2].map(index => makeBlock(region, index));
    const link = (left, right) => {
      const a = blocks[left];
      const b = blocks[right];
      if (!a?.eastGatewayId || !b?.westGatewayId) return;
      a.nodes[a.eastGatewayId].gatewayTo = { block: right, node: b.westGatewayId };
      b.nodes[b.westGatewayId].gatewayTo = { block: left, node: a.eastGatewayId };
    };
    link(0, 1);
    link(1, 2);
    return blocks;
  });
}
