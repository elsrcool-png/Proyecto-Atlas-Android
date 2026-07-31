// PROYECTO ATLAS — Motor de grafos regionales v1.
//
// La conectividad vive en datos. La posición visual no crea rutas implícitas.
// Las Regiones 1–3 se exponen mediante un adaptador compatible con A1–C3.
// Las Regiones 4–10 permanecerán sin composición hasta que el usuario la defina.

import { REGION_SECTOR_LAYOUTS, sectorKey } from "@/lib/atlasRegionSectors";
import { getAtlasRegion, isLegacyGridRegion, normalizeRegionId } from "@/lib/atlasRegionRegistry";

const freezeNode = (node) => Object.freeze({
  type: "principal",
  sceneId: null,
  position: null,
  legacyCoords: null,
  ...node,
  tags: Object.freeze([...(node.tags || [])]),
});

const freezeConnection = (connection) => Object.freeze({
  direction: "both",
  type: "normal",
  visible: true,
  unlockRuleId: null,
  ...connection,
  tags: Object.freeze([...(connection.tags || [])]),
});

export function createRegionGraph({ regionId, nodes = [], connections = [], startNodeId = null, metadata = {} }) {
  const canonicalRegionId = normalizeRegionId(regionId);
  if (!canonicalRegionId) throw new Error(`Región desconocida: ${regionId}`);

  const nodeList = Array.isArray(nodes) ? nodes : Object.values(nodes || {});
  const connectionList = Array.isArray(connections) ? connections : Object.values(connections || {});
  const nodeMap = Object.freeze(Object.fromEntries(nodeList.map((node) => [node.id, freezeNode({ ...node, regionId: canonicalRegionId })])));
  const connectionMap = Object.freeze(Object.fromEntries(connectionList.map((connection) => [connection.id, freezeConnection({ ...connection, regionId: canonicalRegionId })])));

  const graph = Object.freeze({
    schemaVersion: 1,
    regionId: canonicalRegionId,
    startNodeId,
    nodes: nodeMap,
    connections: connectionMap,
    metadata: Object.freeze({ ...metadata }),
  });

  const report = validateRegionGraph(graph);
  if (!report.valid) throw new Error(`Grafo regional inválido (${canonicalRegionId}): ${report.errors.join(" | ")}`);
  return graph;
}

export function validateRegionGraph(graph) {
  const errors = [];
  const warnings = [];
  if (!graph || typeof graph !== "object") return { valid: false, errors: ["graph ausente"], warnings };
  const regionId = normalizeRegionId(graph.regionId);
  if (!regionId) errors.push("regionId inválido");
  const nodes = graph.nodes || {};
  const connections = graph.connections || {};
  const nodeIds = new Set(Object.keys(nodes));
  if (!nodeIds.size) errors.push("sin nodos");
  if (graph.startNodeId && !nodeIds.has(graph.startNodeId)) errors.push(`startNodeId inexistente: ${graph.startNodeId}`);

  for (const [id, node] of Object.entries(nodes)) {
    if (node.id !== id) errors.push(`nodo ${id}: id interno inconsistente`);
    if (normalizeRegionId(node.regionId) !== regionId) errors.push(`nodo ${id}: regionId inconsistente`);
    if (node.position != null) {
      if (!Number.isFinite(node.position?.x) || !Number.isFinite(node.position?.y)) errors.push(`nodo ${id}: position inválida`);
    }
  }

  for (const [id, connection] of Object.entries(connections)) {
    if (connection.id !== id) errors.push(`conexión ${id}: id interno inconsistente`);
    if (!nodeIds.has(connection.from)) errors.push(`conexión ${id}: origen inexistente ${connection.from}`);
    if (!nodeIds.has(connection.to)) errors.push(`conexión ${id}: destino inexistente ${connection.to}`);
    if (connection.from === connection.to) errors.push(`conexión ${id}: bucle propio no permitido`);
    if (!["both", "forward"].includes(connection.direction)) errors.push(`conexión ${id}: dirección inválida`);
  }

  if (nodeIds.size && graph.startNodeId) {
    const visited = new Set([graph.startNodeId]);
    const queue = [graph.startNodeId];
    while (queue.length) {
      const current = queue.shift();
      for (const connection of Object.values(connections)) {
        if (connection.from === current && !visited.has(connection.to)) { visited.add(connection.to); queue.push(connection.to); }
        if (connection.direction === "both" && connection.to === current && !visited.has(connection.from)) { visited.add(connection.from); queue.push(connection.from); }
      }
    }
    const unreachable = [...nodeIds].filter((id) => !visited.has(id));
    if (unreachable.length) warnings.push(`nodos no alcanzables desde inicio: ${unreachable.join(", ")}`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

const connectionId = (regionId, a, b) => {
  const [first, second] = [a, b].sort();
  return `${regionId}:legacy:${first}:${second}`;
};

export function buildLegacyGridGraph(regionId) {
  const canonicalRegionId = normalizeRegionId(regionId);
  if (!canonicalRegionId || !isLegacyGridRegion(canonicalRegionId)) return null;
  const layout = REGION_SECTOR_LAYOUTS[canonicalRegionId];
  if (!layout) return null;

  const nodes = Object.values(layout.sectors).map((sector) => ({
    id: sector.id,
    name: sector.name,
    type: sector.type,
    sceneId: sectorKey(canonicalRegionId, sector.id),
    position: { x: sector.col / 2, y: sector.row / 2 },
    legacyCoords: { col: sector.col, row: sector.row },
    safe: Boolean(sector.safe),
    boss: Boolean(sector.boss),
    dungeon: sector.dungeon || null,
    tags: [...(sector.features || []), "legacy_grid"],
  }));

  const connections = [];
  const seen = new Set();
  for (const node of nodes) {
    for (const [dc, dr] of [[1, 0], [0, 1]]) {
      const neighbor = nodes.find((candidate) => candidate.legacyCoords.col === node.legacyCoords.col + dc && candidate.legacyCoords.row === node.legacyCoords.row + dr);
      if (!neighbor) continue;
      const id = connectionId(canonicalRegionId, node.id, neighbor.id);
      if (seen.has(id)) continue;
      seen.add(id);
      connections.push({ id, from: node.id, to: neighbor.id, direction: "both", type: "legacy_grid", tags: ["legacy_grid"] });
    }
  }

  return createRegionGraph({
    regionId: canonicalRegionId,
    nodes,
    connections,
    startNodeId: layout.startSector,
    metadata: {
      mode: "legacy_grid",
      referenceMap: layout.referenceMap,
      storyOrder: [...layout.storyOrder],
      compositionLocked: true,
    },
  });
}

const LEGACY_GRAPHS = Object.freeze(Object.fromEntries(
  Object.keys(REGION_SECTOR_LAYOUTS).map((regionId) => [regionId, buildLegacyGridGraph(regionId)]),
));

export function getRegionGraph(regionId) {
  const canonicalRegionId = normalizeRegionId(regionId);
  return canonicalRegionId ? LEGACY_GRAPHS[canonicalRegionId] || null : null;
}

export function hasRegionComposition(regionId) {
  return Boolean(getRegionGraph(regionId));
}

export function getConnectedNodeIds(graph, nodeId, { includeLocked = true } = {}) {
  if (!graph?.nodes?.[nodeId]) return [];
  const result = [];
  for (const connection of Object.values(graph.connections || {})) {
    if (!includeLocked && connection.unlockRuleId) continue;
    if (connection.from === nodeId) result.push(connection.to);
    if (connection.direction === "both" && connection.to === nodeId) result.push(connection.from);
  }
  return [...new Set(result)];
}

export function getGraphNode(regionId, nodeId) {
  return getRegionGraph(regionId)?.nodes?.[nodeId] || null;
}

export function getRegionCompositionStatus(regionId) {
  const def = getAtlasRegion(regionId);
  const graph = getRegionGraph(regionId);
  return Object.freeze({
    regionId: def?.id || null,
    mode: def?.mapMode || null,
    composed: Boolean(graph),
    nodeCount: graph ? Object.keys(graph.nodes).length : 0,
    connectionCount: graph ? Object.keys(graph.connections).length : 0,
  });
}
