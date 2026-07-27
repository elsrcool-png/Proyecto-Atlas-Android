import React, { useEffect, useMemo } from "react";
import { getObjectDepth } from "@/lib/atlasDepth";
import "@/styles/atlas-world-modular.css";

const BASE_LAYERS = new Set(["ground", "base", "decal", "shadow", "low", "solid", "world", "back"]);
const FRONT_LAYERS = new Set(["foreground", "front", "overlay", "fx"]);
const DEPTH_LAYERS = new Set(["back", "low", "solid", "world", "foreground", "front", "overlay", "fx"]);
const PRELOADED = new Set();

function normalizePhase(phase) {
  if (["front", "foreground", "overlay", "fx"].includes(phase)) return "front";
  if (["base", "ground", "world", "back"].includes(phase)) return "base";
  return "all";
}

function renderPosition(item) {
  if (item.positionMode === "top-left") return { left: item.x, top: item.y };
  const ax = item.anchorX ?? 0.5;
  const ay = item.anchorY ?? 1;
  return { left: item.x - item.width * ax, top: item.y - item.height * ay };
}

function getStaticLayerDepth(layer, zOffset = 0) {
  const base = {
    ground: 0,
    base: 0,
    decal: 100,
    shadow: 200,
    low: 300,
  }[layer] ?? 300;
  return base + Math.round(zOffset || 0);
}

function ObjectImage({ item }) {
  const src = item.src || item.asset;
  if (!src) return null;
  const rawPos = renderPosition(item);
  const left = Math.round(rawPos.left);
  const top = Math.round(rawPos.top);
  const layer = item.layer || "solid";
  const solid = !!item.collision || item.tags?.includes("structure") || item.tags?.includes("tree");
  const classes = [
    "atlas-world-object",
    `atlas-world-layer--${FRONT_LAYERS.has(layer) ? layer === "front" ? "foreground" : layer : BASE_LAYERS.has(layer) ? layer === "world" || layer === "back" ? "solid" : layer : "solid"}`,
    item.outline === false ? "" : "atlas-world-object--outlined",
    solid && item.shadow !== false ? "atlas-world-object--solid" : "",
    item.className || "",
  ].filter(Boolean).join(" ");

  const shouldDepthSort = item.depthSort ?? DEPTH_LAYERS.has(layer);
  const zIndex = item.zIndex
    ?? (shouldDepthSort ? getObjectDepth(item) : getStaticLayerDepth(layer, item.zOffset));

  return (
    <div
      className={classes}
      style={{
        left,
        top,
        width: Math.round(item.width),
        height: Math.round(item.height),
        opacity: item.opacity ?? 1,
        zIndex,
        transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined,
      }}
      data-atlas-object={item.id}
      data-atlas-depth-y={item.depthY ?? item.y ?? 0}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        draggable={false}
        decoding="sync"
        loading="eager"
        fetchPriority={item.eager || layer === "ground" ? "high" : "auto"}
        style={{ objectFit: item.objectFit || (layer === "ground" ? "cover" : "contain") }}
        onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
      />
      {item.effect === "portal" && <span className="atlas-world-portal-glow" />}
      {item.effect === "forge" && <span className="atlas-world-forge-glow" />}
      {item.effect === "fire" && <span className="atlas-world-fire-glow" />}
    </div>
  );
}

export default function AssetWorldLayer({ scene, visualScene, config, phase = "all", debugCollisions = false }) {
  const activeScene = scene || visualScene || config;

  const sceneSources = useMemo(() => {
    if (!activeScene) return [];
    return [...(activeScene.baseLayers || []), ...(activeScene.objects || [])]
      .map((item) => item.src || item.asset)
      .filter(Boolean);
  }, [activeScene]);

  // Calienta la caché sin ocultar ni volver a montar la escena. En Android,
  // el antiguo fade de dos capas completas provocaba destellos al desplazar cámara.
  useEffect(() => {
    for (const src of new Set(sceneSources)) {
      if (PRELOADED.has(src)) continue;
      PRELOADED.add(src);
      const image = new Image();
      image.decoding = "sync";
      image.src = src;
    }
  }, [sceneSources]);

  if (!activeScene) return null;
  const normalized = normalizePhase(phase);
  const baseLayers = activeScene.baseLayers || activeScene.layers?.base || [];
  const objects = activeScene.objects || [];
  const visibleObjects = objects.filter((item) => {
    const layer = item.layer || "solid";
    if (normalized === "base") return BASE_LAYERS.has(layer);
    if (normalized === "front") return FRONT_LAYERS.has(layer);
    return true;
  });

  return (
    <div
      className={`atlas-world-scene atlas-world-scene--modular-v27 atlas-world-scene--${activeScene.regionId || "unknown"}`}
      data-atlas-sector={activeScene.sectorId}
      data-atlas-visual-version={activeScene.version || "2.7.0"}
      style={{ width: activeScene.width, height: activeScene.height }}
      aria-hidden="true"
    >
      {(normalized === "base" || normalized === "all") && baseLayers.map((item, index) => (
        <ObjectImage key={item.id || `base-${index}`} item={{ ...item, layer: item.layer || "ground", zIndex: item.zIndex ?? 0 }} />
      ))}
      {visibleObjects.map((item, index) => <ObjectImage key={item.id || `object-${index}`} item={item} />)}
      {debugCollisions && normalized !== "front" && (activeScene.collisions || []).map((c) => (
        <span key={c.id} className="atlas-world-collision-debug" style={{ left: c.x, top: c.y, width: c.w, height: c.h }} />
      ))}
    </div>
  );
}
