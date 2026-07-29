import React, { useRef, useEffect, useState } from "react";
import ModularHeroSprite from "./ModularHeroSprite";
import { isHeroModularSurfaceEnabled } from "@/lib/atlasHeroIntegrationFlags";
import { drawEntity } from "@/lib/atlasEntitySprites";
import { npcTurnProfile } from "@/lib/atlasNpcMotion";
import {
  getEnemyAssetDisplayMetrics,
  getEnemyAssetPath,
  hasEnemyAssetVisual,
  preloadEnemyAssetVisuals,
} from "@/lib/atlasEnemyAssetSprites";
import {
  getHeroAssetPath,
  hasHeroAssetVisual,
  preloadHeroAssetVisuals,
} from "@/lib/atlasHeroAssetSprites";
import {
  getNpcAssetDisplayMetrics,
  getNpcAssetPath,
  hasNpcAssetVisual,
  preloadNpcAssetVisuals,
} from "@/lib/atlasNpcAssetSprites";
import {
  getEnemyCombatAssetDescriptor,
  getHeroCombatAssetDescriptor,
} from "@/lib/atlasCombatFacing";

// Poses de combate clásico: transformaciones/filtros sobre el sprite
// sin deformar ni cambiar la orientación aprobada.
function poseStyle(pose, dir) {
  const s = dir === "left" ? -1 : 1;
  switch (pose) {
    case "attack": case "slash": return { transform: `rotate(${s * 12}deg)` };
    case "dual": return { transform: `translateX(${s * 3}px) rotate(${s * 8}deg)` };
    case "thrust": return { transform: `translateX(${s * 7}px) rotate(${s * 3}deg)` };
    case "heavy": return { transform: `translateY(-3px) rotate(${s * 18}deg)` };
    case "shoot": return { transform: `translateX(${-s * 2}px) rotate(${-s * 4}deg)` };
    case "miss": return { transform: `translateX(${-s * 7}px) rotate(${-s * 12}deg)`, opacity: 0.82 };
    case "cast": return { transform: "translateY(-2px)", filter: "brightness(1.18) drop-shadow(0 0 5px rgba(192,132,252,0.85))" };
    case "hurt": return { transform: `translateX(${-s * 5}px)` };
    case "defeat": return { transform: `rotate(${-s * 18}deg) translateY(6px)`, opacity: 0.55 };
    case "victory": return { transform: "translateY(-3px)" };
    default: return {};
  }
}

const CARDINAL_DIRECTIONS = ["down", "up", "left", "right"];

function mergeFilters(...filters) {
  const value = filters.filter(Boolean).join(" ").trim();
  return value || undefined;
}

export default function EntitySprite({ type, variant, race, cls, player, dir, moving = false, running = false, hurt = false, turn = false, animationKey, animation = null, animationSequence = null, animationQuality = "medio", animationLanded = true, animationKind = "basic", pose = "idle", size = 44, className, style, combatMode = false, surface }) {
  const ref = useRef(null);
  const frameRef = useRef(0);
  const turnProfile = npcTurnProfile(animationKey || variant || type || "entity");
  const [face, setFace] = useState(dir || turnProfile.initialFace || "down");
  const [assetFailed, setAssetFailed] = useState(false);

  useEffect(() => {
    if (type === "monster" || type === "boss") preloadEnemyAssetVisuals();
    if (type === "player") preloadHeroAssetVisuals();
    if (type === "npc" || type === "villager") preloadNpcAssetVisuals();
  }, [type]);

  useEffect(() => {
    if (!turn) { setFace(dir || "down"); return undefined; }
    const profile = npcTurnProfile(animationKey || variant || type || "entity");
    const dirs = ["down", "left", "up", "right"];
    setFace(dir || profile.initialFace);
    let timeoutId;
    const rotateFace = () => {
      if (!document.hidden) {
        setFace((current) => {
          const idx = Math.max(0, dirs.indexOf(current));
          return dirs[(idx + profile.step + dirs.length) % dirs.length];
        });
      }
      timeoutId = window.setTimeout(rotateFace, profile.interval);
    };
    timeoutId = window.setTimeout(rotateFace, profile.initialDelay);
    return () => window.clearTimeout(timeoutId);
  }, [turn, dir, animationKey, variant, type]);

  const modularSurface = surface || (combatMode ? "combat" : "world");
  if (type === "player" && player && isHeroModularSurfaceEnabled(modularSurface)) {
    return (
      <ModularHeroSprite
        player={player}
        race={race}
        cls={cls}
        direction={face}
        moving={moving}
        running={running}
        pose={pose}
        animation={animation}
        sequence={animationSequence}
        qualityId={animationQuality}
        landed={animationLanded}
        animationKind={animationKind}
        animationToken={animationKey}
        size={size}
        surface={modularSurface}
        className={className}
        style={style}
      />
    );
  }

  const combatDescriptor = combatMode
    ? (type === "player"
      ? getHeroCombatAssetDescriptor(race, cls, face)
      : getEnemyCombatAssetDescriptor(type, variant, face))
    : null;
  const heroAssetPath = type === "player" && hasHeroAssetVisual(race, cls)
    ? (combatDescriptor?.path || getHeroAssetPath(race, cls, face))
    : null;
  const enemyAssetPath = (type === "monster" || type === "boss") && hasEnemyAssetVisual(type, variant)
    ? (combatDescriptor?.path || getEnemyAssetPath(type, variant, face))
    : null;
  const npcAssetPath = hasNpcAssetVisual(type, variant)
    ? getNpcAssetPath(variant, face)
    : null;
  const directAssetPath = heroAssetPath || enemyAssetPath || npcAssetPath;

  useEffect(() => {
    setAssetFailed(false);
  }, [directAssetPath]);

  useEffect(() => {
    if (directAssetPath && !assetFailed) return;
    drawEntity(ref.current, { type, variant, race, cls, dir: face, frame: frameRef.current, hurt, pose });
  }, [type, variant, race, cls, face, hurt, pose, directAssetPath, assetFailed]);

  useEffect(() => {
    if (directAssetPath && !assetFailed) return undefined;
    if (!moving) {
      frameRef.current = 0;
      drawEntity(ref.current, { type, variant, race, cls, dir: face, frame: 0, hurt, pose });
      return undefined;
    }
    let rafId = 0;
    let last = 0;
    const tick = (now) => {
      if (!document.hidden && now - last >= 170) {
        last = now;
        frameRef.current = frameRef.current === 0 ? 1 : 0;
        drawEntity(ref.current, { type, variant, race, cls, dir: face, frame: frameRef.current, hurt, pose });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [type, variant, race, cls, face, moving, hurt, pose, directAssetPath, assetFailed]);

  const assetMetrics = npcAssetPath
    ? getNpcAssetDisplayMetrics(size)
    : getEnemyAssetDisplayMetrics(type, variant, size);
  const w = assetMetrics?.width || size;
  const h = assetMetrics?.height || Math.round(size * (48 / 36));
  const ps = poseStyle(pose, combatDescriptor?.sourceFacing || face);
  const hurtFilter = hurt ? "sepia(0.75) saturate(5) hue-rotate(320deg) brightness(1.12)" : undefined;
  const combinedFilter = mergeFilters(ps.filter, hurtFilter, style?.filter);
  const mergedStyle = {
    width: w,
    height: h,
    imageRendering: "auto",
    objectFit: "contain",
    objectPosition: "center bottom",
    transformOrigin: "bottom center",
    transition: "transform 180ms ease-out, filter 200ms ease-out, opacity 200ms ease-out",
    ...ps,
    ...style,
    filter: combinedFilter,
  };

  // Los assets maestros se renderizan como imágenes directas. Esto evita que
  // el respaldo procedural permanezca visible por una carrera de carga del
  // canvas, especialmente en Android y al entrar inmediatamente en combate.
  if (directAssetPath && !assetFailed) {
    const imageClassName = [
      combatMode ? "" : className,
      !combatMode && moving ? "atlas-actor-walk-cycle" : "",
    ].filter(Boolean).join(" ");
    const image = (
      <img
        src={directAssetPath}
        alt=""
        draggable={false}
        decoding="async"
        loading="eager"
        data-atlas-entity-image="true"
        data-atlas-direction={face}
        className={imageClassName || undefined}
        style={mergedStyle}
        onError={() => setAssetFailed(true)}
      />
    );
    if (!combatMode) {
      // Los mobs del mundo libre cambian facing desde el bucle de movimiento
      // sin provocar un render React por cada frame. Las cuatro vistas quedan
      // precargadas y el contenedor activa solo la dirección real.
      if (moving && (type === "monster" || type === "boss")) {
        return (
          <span
            className={[className, "atlas-directional-actor"].filter(Boolean).join(" ")}
            data-atlas-directional-sprite="true"
            data-facing={face}
            style={{ width: w, height: h }}
          >
            {CARDINAL_DIRECTIONS.map(direction => (
              <img
                key={direction}
                src={getEnemyAssetPath(type, variant, direction)}
                alt=""
                draggable={false}
                decoding="async"
                loading="eager"
                data-atlas-direction={direction}
                className="atlas-directional-frame"
                style={mergedStyle}
                onError={() => setAssetFailed(true)}
              />
            ))}
          </span>
        );
      }
      return image;
    }
    return (
      <span
        className={className}
        data-atlas-combat-facing={combatDescriptor?.desiredFacing || face}
        style={{
          width: w,
          height: h,
          display: "inline-flex",
          alignItems: "flex-end",
          justifyContent: "center",
          transform: combatDescriptor?.mirrorX ? "scaleX(-1)" : undefined,
          transformOrigin: "bottom center",
        }}
      >
        {image}
      </span>
    );
  }

  return React.createElement("canvas", {
    ref,
    width: assetMetrics?.nativeWidth || 36,
    height: assetMetrics?.nativeHeight || 48,
    className,
    style: mergedStyle,
  });
}
