// PROYECTO ATLAS — Registro visual modular del mundo v2.11.
// Las tres regiones usan escenas manuales por sector con objetos transparentes individuales.

import { GREEN_VISUAL_SCENES } from "@/lib/atlasGreenVisualScenes";
import { ARCTIC_VISUAL_SCENES } from "@/lib/atlasArcticVisualScenes";
import { DESERT_VISUAL_SCENES } from "@/lib/atlasDesertVisualScenes";

const REGION_SCENES = {
  verde: GREEN_VISUAL_SCENES,
  fria: ARCTIC_VISUAL_SCENES,
  desierto: DESERT_VISUAL_SCENES,
};

export const VISUAL_SCENES = Object.fromEntries(
  Object.entries(REGION_SCENES).flatMap(([regionId, scenes]) =>
    Object.entries(scenes).flatMap(([sectorId, scene]) => [
      [`${regionId}:${sectorId}`, scene],
      [`${regionId}_${sectorId}`, scene],
      [scene.id, scene],
    ]),
  ),
);

function normalizeSectorId(value) {
  const m = String(value || "").toUpperCase().match(/[A-C][1-3]/);
  return m ? m[0] : null;
}

export function resolveVisualScene(sceneOrRegionId, sectorId) {
  if (!sceneOrRegionId) return null;

  if (typeof sceneOrRegionId === "object") {
    if (sceneOrRegionId.visualSceneId && VISUAL_SCENES[sceneOrRegionId.visualSceneId]) {
      return VISUAL_SCENES[sceneOrRegionId.visualSceneId];
    }
    if (sceneOrRegionId.regionId && sceneOrRegionId.sectorId) {
      return VISUAL_SCENES[`${sceneOrRegionId.regionId}:${normalizeSectorId(sceneOrRegionId.sectorId)}`]
        || VISUAL_SCENES[sceneOrRegionId.id]
        || null;
    }
    if (sceneOrRegionId.id && VISUAL_SCENES[sceneOrRegionId.id]) return VISUAL_SCENES[sceneOrRegionId.id];
    return null;
  }

  if (sectorId) {
    const sid = normalizeSectorId(sectorId);
    return sid ? VISUAL_SCENES[`${sceneOrRegionId}:${sid}`] || null : null;
  }

  const key = String(sceneOrRegionId);
  if (VISUAL_SCENES[key]) return VISUAL_SCENES[key];

  const sid = normalizeSectorId(key);
  if (sid) {
    const regionId = key.split(/[:_]/)[0];
    if (REGION_SCENES[regionId]) return VISUAL_SCENES[`${regionId}:${sid}`] || null;
  }
  return Object.values(VISUAL_SCENES).find(scene => scene.id === key) || null;
}

function shouldUsePostBossVariant(scene, context = {}) {
  if (!scene?.postBossObjects?.length) return false;
  const flags = context.worldFlags || {};
  if (scene.regionId === "verde" && scene.sectorId === "C3") {
    return !!flags["verde:guild_seed"] || !!flags["verde:postgame_open"] || !!flags["verde:restored"];
  }
  return !!context.bossDefeated || !!flags[`${scene.regionId}:boss_defeated`] || !!flags[`${scene.regionId}:restored`];
}

export function getVisualSceneVariant(sceneOrRegionId, sectorId, context = {}) {
  const scene = resolveVisualScene(sceneOrRegionId, sectorId);
  if (!scene || !shouldUsePostBossVariant(scene, context)) return scene;

  const removeIds = new Set(scene.postBossRemoveIds || []);
  const baseObjects = (scene.objects || []).filter(item => !removeIds.has(item.id));
  const baseCollisions = (scene.collisions || []).filter(collision => !removeIds.has(collision.object));
  const addedCollisions = scene.postBossCollisions || [];

  return {
    ...scene,
    id: `${scene.id}_postboss`,
    objects: [...baseObjects, ...(scene.postBossObjects || [])],
    collisions: [...baseCollisions, ...addedCollisions],
    runtimeVariant: {
      type: "postboss",
      removeCollisionObjectIds: [...removeIds],
      addCollisions: addedCollisions,
    },
  };
}

export function getVisualScene(regionId, sectorId) { return resolveVisualScene(regionId, sectorId); }
export function getVisualSceneById(sceneId) { return resolveVisualScene(sceneId); }
export const getAtlasVisualScene = getVisualScene;
export const hasVisualScene = (regionId, sectorId) => !!resolveVisualScene(regionId, sectorId);
export const getVisualSceneCollisions = (sceneOrRegionId, sectorId) => resolveVisualScene(sceneOrRegionId, sectorId)?.collisions || [];
export const getVisualSceneSpawn = (sceneOrRegionId, sectorId) => resolveVisualScene(sceneOrRegionId, sectorId)?.spawn || null;
export const getVisualSceneNpcAnchors = (sceneOrRegionId, sectorId) => resolveVisualScene(sceneOrRegionId, sectorId)?.npcAnchors || null;
export const getVisualSceneEnemyAnchors = (sceneOrRegionId, sectorId) => resolveVisualScene(sceneOrRegionId, sectorId)?.enemyAnchors || [];
export const getVisualSceneChestAnchors = (sceneOrRegionId, sectorId) => resolveVisualScene(sceneOrRegionId, sectorId)?.chestAnchors || [];

export default VISUAL_SCENES;
