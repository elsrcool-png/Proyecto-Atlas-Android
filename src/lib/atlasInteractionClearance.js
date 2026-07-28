// PROYECTO ATLAS — Separación de NPC, objetivos de misión y portales.
// Se aplica al final de la construcción del mundo para garantizar interacción
// cómoda, no solo accesibilidad teórica.
import { hitSolid } from "@/lib/atlasWorld";
import { createWorldReachability } from "@/lib/atlasWorldAccessibility";

const W = 960;
const H = 720;
const PLAYER_RADIUS = 16;
const MIN = Object.freeze({
  npcNpc: 70,
  npcStory: 96,
  npcShrine: 108,
  storyStory: 76,
  storyShrine: 112,
  chestStory: 72,
  chestShrine: 88,
});

const dist = (a, b) => Math.hypot(Number(a?.x || 0) - Number(b?.x || 0), Number(a?.y || 0) - Number(b?.y || 0));

function walkable(world, point, reachability) {
  if (!point || point.x < 34 || point.y < 34 || point.x > (world.W || W) - 34 || point.y > (world.H || H) - 34) return false;
  if (hitSolid(point.x, point.y, world.solids || [], PLAYER_RADIUS)) return false;
  return reachability ? reachability.isReachable(point) : true;
}

function clearOf(point, groups, spacing) {
  return groups.every(group => group.items.every(item => dist(point, item) >= (group.min ?? spacing)));
}

function candidatePoints(origin, maxRadius = 230) {
  const out = [{ x: origin.x, y: origin.y }];
  for (let radius = 28; radius <= maxRadius; radius += 24) {
    // Orden determinista: primero laterales, luego diagonales y verticales.
    for (const angle of [0, 180, 45, 225, 315, 135, 90, 270]) {
      const radians = angle * Math.PI / 180;
      out.push({ x: Math.round(origin.x + Math.cos(radians) * radius), y: Math.round(origin.y + Math.sin(radians) * radius) });
    }
  }
  return out;
}

function relocate(world, anchor, groups, fallbackMin = 70, reachability = null) {
  if (!anchor) return anchor;
  const found = candidatePoints(anchor).find(point => walkable(world, point, reachability) && clearOf(point, groups, fallbackMin));
  return found ? { ...anchor, x: found.x, y: found.y, _atlasClearanceAdjusted: found.x !== anchor.x || found.y !== anchor.y } : anchor;
}

export function enforceInteractionClearance(world) {
  if (!world) return world;
  const next = { ...world };
  const reachability = createWorldReachability(world);
  const fixedShrines = (world.shrines || []).map(item => ({ ...item }));
  const sanctuary = fixedShrines.filter(item => item.isSanctuary);
  const placedStory = [];
  const storyPoints = (world.storyPoints || []).map(story => {
    const placed = relocate(world, story, [
      { items: sanctuary, min: MIN.storyShrine },
      { items: placedStory, min: MIN.storyStory },
    ], MIN.storyStory, reachability);
    placedStory.push(placed);
    return placed;
  });

  const placedNpcs = [];
  const npcs = (world.npcs || []).map(npc => {
    const placed = relocate(world, npc, [
      { items: sanctuary, min: MIN.npcShrine },
      { items: storyPoints, min: MIN.npcStory },
      { items: placedNpcs, min: MIN.npcNpc },
    ], MIN.npcNpc, reachability);
    placedNpcs.push(placed);
    return placed;
  });

  const chests = (world.chests || []).map(chest => relocate(world, chest, [
    { items: sanctuary, min: MIN.chestShrine },
    { items: storyPoints, min: MIN.chestStory },
    { items: npcs, min: 54 },
  ], 54, reachability));

  next.storyPoints = storyPoints;
  next.npcs = npcs;
  next.chests = chests;
  next.shrines = fixedShrines;
  return next;
}

export function auditInteractionClearance(world) {
  const issues = [];
  const npcs = world?.npcs || [];
  const stories = world?.storyPoints || [];
  const shrines = (world?.shrines || []).filter(item => item.isSanctuary);
  const pushPairs = (a, b, min, type) => {
    a.forEach((one, i) => b.forEach((two, j) => {
      if (a === b && j <= i) return;
      const d = dist(one, two);
      if (d < min) issues.push({ type, a: one.id || one.name, b: two.id || two.name, distance: Math.round(d), required: min });
    }));
  };
  pushPairs(npcs, npcs, MIN.npcNpc, "npc-npc");
  pushPairs(npcs, stories, MIN.npcStory, "npc-story");
  pushPairs(npcs, shrines, MIN.npcShrine, "npc-shrine");
  pushPairs(stories, shrines, MIN.storyShrine, "story-shrine");
  return { ok: issues.length === 0, issues };
}

export { MIN as ATLAS_INTERACTION_CLEARANCE };
