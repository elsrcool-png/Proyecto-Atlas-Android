import React from "react";

function screenPoint(actor, camera, tileSize) {
  return {
    x: camera.x + (actor.x * tileSize + tileSize / 2) * camera.zoom,
    y: camera.y + (actor.y * tileSize + tileSize / 2) * camera.zoom,
  };
}

export default function DungeonOffscreenIndicators({ enemies = [], camera, viewport, tileSize, tactical }) {
  if (!tactical || !camera || !viewport?.w || !viewport?.h) return null;
  const margin = 58;
  const center = { x: viewport.w / 2, y: viewport.h / 2 };
  const indicators = [];
  for (const enemy of enemies) {
    if (enemy.hp <= 0 || !enemy.alerted) continue;
    const p = screenPoint(enemy, camera, tileSize);
    const inside = p.x >= margin && p.x <= viewport.w - margin && p.y >= margin && p.y <= viewport.h - margin;
    if (inside) continue;
    const dx = p.x - center.x, dy = p.y - center.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = dx / len, ny = dy / len;
    const x = Math.max(margin, Math.min(viewport.w - margin, center.x + nx * (Math.min(viewport.w, viewport.h) * 0.38)));
    const y = Math.max(margin + 22, Math.min(viewport.h - margin, center.y + ny * (Math.min(viewport.w, viewport.h) * 0.38)));
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    indicators.push(
      <div key={enemy.id} className="absolute z-30 pointer-events-none" style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}>
        <div className="flex items-center gap-1 rounded-full border border-rose-400/80 bg-rose-950/88 px-1.5 py-1 shadow-lg">
          <span className="block text-rose-200 text-xs" style={{ transform: `rotate(${angle}deg)` }}>➤</span>
          <span className="text-[9px] font-bold text-rose-100">{enemy.boss ? "JEFE" : "ENEMIGO"}</span>
        </div>
      </div>,
    );
  }
  return <>{indicators}</>;
}
