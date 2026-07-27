// PROYECTO ATLAS — Utilidades compartidas para escenas modulares regionales.
export const WORLD_W = 960;
export const WORLD_H = 720;

export const makeVisualKit = ({ regionId, root, version = "2.7.0", theme = regionId }) => {
  const sprite = (id, file, x, y, width, height, options = {}) => ({
    id,
    asset: `${options.root || root}/${file}`,
    src: `${options.root || root}/${file}`,
    x, y, width, height,
    anchorX: options.anchorX ?? 0.5,
    anchorY: options.anchorY ?? 1,
    layer: options.layer || "solid",
    outline: options.outline !== false,
    opacity: options.opacity ?? 1,
    effect: options.effect,
    zOffset: options.zOffset || 0,
    rotate: options.rotate || 0,
    collision: options.collision || null,
    tags: options.tags || [],
    occlusion: options.occlusion || "none",
    eager: options.eager || false,
    positionMode: options.positionMode,
  });

  const base = (sectorId) => sprite(
    `${regionId}_${sectorId}_terrain`,
    `terrain_${sectorId.toLowerCase()}.webp`,
    0, 0, WORLD_W, WORLD_H,
    { anchorX: 0, anchorY: 0, positionMode: "top-left", layer: "ground", outline: false, eager: true },
  );

  const rect = (id, x, y, w, h, meta = {}) => ({ id, x, y, w, h, ...meta });

  const collOfObjects = (objects = []) => {
    const result = [];
    for (const item of objects) {
      const list = Array.isArray(item.collision) ? item.collision : item.collision ? [item.collision] : [];
      list.forEach((c, i) => result.push(rect(
        `${item.id}_collision_${i}`,
        item.x + c.x,
        item.y + c.y,
        c.w,
        c.h,
        { object: item.id, visibleObject: true },
      )));
    }
    return result;
  };

  const scene = (sectorId, data = {}) => {
    const objects = data.objects || [];
    const postBossObjects = data.postBossObjects || [];
    return {
      id: `${regionId}_${sectorId}_modular_v2_7`,
      version,
      architecture: "individual-assets",
      regionId,
      sectorId,
      width: WORLD_W,
      height: WORLD_H,
      spawn: data.spawn,
      sanctuary: data.sanctuary || null,
      safeCenter: data.safeCenter || { x: 480, y: 360 },
      baseLayers: [base(sectorId)],
      objects,
      collisions: [...(data.terrainCollisions || []), ...collOfObjects(objects)],
      postBossObjects,
      postBossCollisions: collOfObjects(postBossObjects),
      postBossRemoveIds: data.postBossRemoveIds || [],
      corridors: data.corridors || {},
      npcAnchors: data.npcAnchors || {},
      enemyAnchors: data.enemyAnchors || [],
      chestAnchors: data.chestAnchors || [],
      bossAnchor: data.bossAnchor || null,
      objectiveAnchor: data.objectiveAnchor || { x: 700, y: 180 },
      protectedZones: data.protectedZones || [],
      theme: data.theme || theme,
      performance: { outlinesBaked: true, shadowsBaked: true, runtimeFilters: false, terrainLayers: 1 },
    };
  };

  return { sprite, rect, scene, collOfObjects, root };
};
