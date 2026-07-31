import React from "react";
import EntitySprite from "./EntitySprite";

function cardinal(direction = "down") {
  if (direction.startsWith("up")) return "up";
  if (direction.startsWith("down")) return "down";
  if (direction.startsWith("left")) return "left";
  if (direction.startsWith("right")) return "right";
  return "down";
}

export default function DungeonCombatActor({
  id,
  actor,
  tileSize,
  player,
  type = "monster",
  variant,
  direction = "down",
  hurt = false,
  down = false,
  animationState = null,
  className = "",
  children,
  size,
}) {
  if (!actor) return null;
  const target = animationState?.target;
  const active = !!animationState?.sequence;
  const sequence = animationState?.sequence;
  const movementType = sequence?.animation?.movementType || sequence?.animation?.dungeonType;
  const displacementFactor = movementType === "stationary" || movementType === "magic" || movementType === "projectile" ? 0.08 : 0.68;
  const dx = target ? (target.x - actor.x) * tileSize * displacementFactor : 0;
  const dy = target ? (target.y - actor.y) * tileSize * displacementFactor : 0;
  const animation = sequence?.animation ? {
    source: "phase7",
    sequence,
    family: sequence.animation.weaponType,
    id: sequence.animation.animationType,
  } : null;
  const pose = down ? "defeat" : hurt ? "hurt" : active ? (sequence?.visualQuality === "miss" ? "miss" : sequence?.animation?.dungeonType === "magic" ? "cast" : "attack") : "idle";
  const actorSize = size || (type === "boss" ? tileSize + 8 : type === "player" ? tileSize + 4 : tileSize - 2);

  return (
    <div
      className={`absolute flex flex-col items-center justify-end atlas-dungeon-actor ${active ? "atlas-dungeon-actor-active" : ""} ${hurt ? "atlas-dg-hurt" : ""} ${className}`}
      data-actor-id={id}
      data-animation-context={active ? "shared-combat-sequence" : "idle"}
      key={`${id}:${animationState?.token || "idle"}`}
      style={{
        left: actor.x * tileSize,
        top: actor.y * tileSize,
        width: tileSize,
        height: tileSize,
        zIndex: 300 + actor.y * 10,
        opacity: down ? 0.48 : 1,
        transition: active ? undefined : "left 160ms ease-out, top 160ms ease-out, opacity 180ms ease-out",
        "--dg-attack-x": `${dx}px`,
        "--dg-attack-y": `${dy}px`,
        "--dg-attack-duration": `${Math.max(360, Number(sequence?.totalDuration || 620))}ms`,
      }}
    >
      <div className="atlas-shadow" />
      <EntitySprite
        type={type}
        variant={variant}
        player={player}
        cls={player?.class || actor.class}
        race={player?.race || actor.race}
        dir={cardinal(direction)}
        size={actorSize}
        combatMode
        surface="dungeon"
        pose={pose}
        hurt={hurt}
        animation={animation}
        animationSequence={sequence}
        animationQuality={animationState?.qualityId || "medio"}
        animationLanded={animationState?.landed !== false}
        animationKind={animationState?.kind || "basic"}
        animationKey={animationState?.token || id}
        className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.7)] relative z-10"
      />
      {children}
    </div>
  );
}
