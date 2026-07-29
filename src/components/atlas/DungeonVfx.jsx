import React from "react";
import { getElementColor } from "@/lib/atlasAbilityAnimations";

// Capa de animaciones efímeras sobre el mapa de dungeon.
// Tipos: slash, lunge (embestida con línea), projectile (viaja), magic,
// impact (ráfago en el objetivo), heal, crit, miss, status, hurt,
// area (resalta casillas), defeat (poof).
const T = 40;

const STYLE = {
  slash: { color: "#fca5a5", icon: "⚔" },
  projectile: { color: "#38bdf8", icon: "➤" },
  magic: { color: "#c4b5fd", icon: "✦" },
  impact: { color: "#fde68a", icon: "✸" },
  heal: { color: "#86efac", icon: "✚" },
  crit: { color: "#fbbf24", icon: "✸" },
  miss: { color: "#94a3b8", icon: "✕" },
  status: { color: "#f0abfc", icon: "≋" },
  hurt: { color: "#f87171", icon: "✸" },
};

function DmgText({ x, y, text, crit, color }) {
  if (!text) return null;
  return (
    <div className="absolute" style={{ left: x * T + T / 2, top: y * T + T / 2, transform: "translate(-50%,-50%)", zIndex: 5 }}>
      <div className={crit ? "atlas-dg-vfx-crit" : "atlas-dg-vfx-dmg"} style={{ color: crit ? "#fbbf24" : color, textShadow: "0 1px 3px #000, 0 0 6px rgba(0,0,0,0.6)" }}>
        {crit ? "★" : ""}{text}
      </div>
    </div>
  );
}

export default function DungeonVfx({ effects }) {
  if (!effects || !effects.length) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {effects.map((e) => {
        const s = STYLE[e.type] || STYLE.slash;
        const cx = e.x * T + T / 2;
        const cy = e.y * T + T / 2;

        // Área resaltada (AOE)
        if (e.type === "area" && e.tiles) {
          return e.tiles.map((t, i) => (
            <div key={`${e.id}_${i}`} className="absolute atlas-dg-vfx-area rounded-sm" style={{ left: t.x * T, top: t.y * T, width: T, height: T, background: "rgba(251,191,36,0.30)", border: "2px solid rgba(251,191,36,0.85)" }} />
          ));
        }

        // Derrota: poof expansivo
        if (e.type === "defeat") {
          return (
            <div key={e.id} className="absolute" style={{ left: cx, top: cy }}>
              <div className="atlas-dg-vfx-defeat rounded-full" style={{ width: T, height: T, background: "radial-gradient(circle, rgba(248,113,113,0.8), transparent 70%)" }} />
              <div className="absolute atlas-dg-vfx-burst text-xl" style={{ left: 0, top: 0, transform: "translate(-50%,-50%)", color: "#fca5a5" }}>✖</div>
            </div>
          );
        }

        // Impacto: ráfago en el objetivo
        if (e.type === "impact") {
          const icolor = e.element ? getElementColor(e.element) : null;
          return (
            <div key={e.id} className="absolute" style={{ left: cx, top: cy }}>
              <div className="atlas-dg-vfx-impact rounded-full" style={{ width: T * 0.9, height: T * 0.9, background: e.crit ? "rgba(251,191,36,0.85)" : icolor ? `${icolor}cc` : "rgba(255,255,255,0.6)", boxShadow: icolor ? `0 0 10px ${icolor}` : undefined }} />
            </div>
          );
        }

        // Proyectil: viaja de origen a destino + impacto
        if (e.type === "projectile" && e.from) {
          const fx = e.from.x * T + T / 2, fy = e.from.y * T + T / 2;
          const dx = cx - fx, dy = cy - fy;
          const pcolor = e.element ? getElementColor(e.element) : s.color;
          if (e.projectileType === "fireball") {
            return (
              <div key={e.id}>
                <div className="absolute atlas-dg-vfx-proj rounded-full" style={{ left: fx - 10, top: fy - 10, width: 20, height: 20, background: "radial-gradient(circle, #fff3b0, #ff6a1a 60%, #b02000)", boxShadow: "0 0 14px #ff6a1a", "--dx": `${dx}px`, "--dy": `${dy}px` }} />
                {!e.miss && <DmgText x={e.x} y={e.y} text={e.text} crit={e.crit} color="#ff6a1a" />}
              </div>
            );
          }
          return (
            <div key={e.id}>
              <div className="absolute atlas-dg-vfx-proj rounded-full" style={{ left: fx - 8, top: fy - 8, width: 16, height: 16, background: pcolor, boxShadow: `0 0 10px ${pcolor}, 0 0 4px #fff`, "--dx": `${dx}px`, "--dy": `${dy}px` }} />
              {!e.miss && <DmgText x={e.x} y={e.y} text={e.text} crit={e.crit} color={pcolor} />}
            </div>
          );
        }

        // Embestida (lunge): línea de corte de origen a destino
        if (e.type === "lunge" && e.from) {
          const fx = e.from.x * T + T / 2, fy = e.from.y * T + T / 2;
          const dx = cx - fx, dy = cy - fy;
          const len = Math.max(8, Math.hypot(dx, dy));
          const ang = Math.atan2(dy, dx) * 180 / Math.PI;
          const lcolor = e.element ? getElementColor(e.element) : s.color;
          return (
            <div key={e.id}>
              <div className="absolute atlas-dg-vfx-lunge" style={{ left: fx, top: fy - 2.5, width: len, height: 5, transformOrigin: "0 50%", transform: `rotate(${ang}deg)`, background: `linear-gradient(90deg, transparent, ${e.crit ? "#fbbf24" : lcolor}, transparent)`, borderRadius: 3 }} />
              {!e.miss && <DmgText x={e.x} y={e.y} text={e.text} crit={e.crit} color={lcolor} />}
            </div>
          );
        }

        // Caso general (slash, magic, heal, status, hurt, crit, miss)
        const gcolor = e.element ? getElementColor(e.element) : s.color;
        return (
          <div key={e.id} className="absolute" style={{ left: cx, top: cy, transform: "translate(-50%,-50%)" }}>
            {e.type === "miss" ? (
              <div className="atlas-dg-vfx-miss text-[11px] font-bold" style={{ color: gcolor, textShadow: "0 1px 2px #000" }}>Fallo</div>
            ) : e.text ? (
              <div className={e.crit ? "atlas-dg-vfx-crit" : "atlas-dg-vfx-dmg"} style={{ color: e.crit ? "#fbbf24" : gcolor, textShadow: "0 1px 3px #000" }}>
                {e.crit ? "★" : ""}{e.text}
              </div>
            ) : (
              <div className="atlas-dg-vfx-burst text-2xl" style={{ color: gcolor, textShadow: `0 0 10px ${gcolor}` }}>{s.icon}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}