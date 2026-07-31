import React from "react";

function screenPoint(actor, camera, tileSize) {
  return {
    x: camera.x + (actor.x * tileSize + tileSize / 2) * camera.zoom,
    y: camera.y + (actor.y * tileSize + tileSize / 2) * camera.zoom,
  };
}

function sectorForAngle(angle) {
  const normalized = ((angle + 360) % 360 + 22.5) % 360;
  return Math.floor(normalized / 45);
}

/**
 * Los enemigos alertados fuera de pantalla se indican mediante un aro
 * direccional alrededor del personaje. No usa tarjetas ni textos intrusivos.
 */
export default function DungeonOffscreenIndicators({ enemies = [], camera, viewport, tileSize, tactical }) {
  if (!tactical || !camera || !viewport?.w || !viewport?.h) return null;
  const margin = 46;
  const center = {
    x: Number(camera.focusScreenX ?? viewport.w / 2),
    y: Number(camera.focusScreenY ?? viewport.h / 2),
  };
  const sectors = new Map();

  for (const enemy of enemies) {
    if (enemy.hp <= 0 || !enemy.alerted) continue;
    const point = screenPoint(enemy, camera, tileSize);
    const inside = point.x >= margin && point.x <= viewport.w - margin && point.y >= margin && point.y <= viewport.h - margin;
    if (inside) continue;
    const angle = Math.atan2(point.y - center.y, point.x - center.x) * 180 / Math.PI;
    const sector = sectorForAngle(angle);
    const current = sectors.get(sector) || { count: 0, boss: false, angle: sector * 45 };
    current.count += 1;
    current.boss = current.boss || !!enemy.boss;
    sectors.set(sector, current);
  }

  if (!sectors.size) return null;
  const ringSize = 82;
  const radius = ringSize / 2;

  return (
    <div
      className="absolute z-35 pointer-events-none rounded-full border border-rose-400/45"
      data-dungeon-enemy-direction-ring="true"
      style={{
        left: center.x,
        top: center.y,
        width: ringSize,
        height: ringSize,
        transform: "translate(-50%,-50%)",
        boxShadow: "0 0 12px rgba(244,63,94,.18), inset 0 0 9px rgba(244,63,94,.12)",
      }}
      aria-hidden
    >
      {[...sectors.entries()].map(([sector, item]) => {
        const angle = sector * 45;
        return (
          <span
            key={sector}
            className={`absolute flex items-center justify-center rounded-full border ${item.boss ? "border-amber-300 bg-rose-700" : "border-rose-200 bg-rose-500"}`}
            style={{
              left: "50%",
              top: "50%",
              width: item.count > 1 ? 17 : 13,
              height: item.count > 1 ? 17 : 13,
              transform: `translate(-50%,-50%) rotate(${angle}deg) translateX(${radius}px) rotate(${-angle}deg)`,
              boxShadow: item.boss ? "0 0 8px rgba(251,191,36,.9)" : "0 0 7px rgba(244,63,94,.85)",
              color: "white",
              fontSize: 8,
              fontWeight: 800,
            }}
          >
            {item.count > 1 ? item.count : ""}
          </span>
        );
      })}
    </div>
  );
}
