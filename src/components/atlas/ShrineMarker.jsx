import React from "react";
import { SHRINE_TYPES } from "@/lib/atlasShrines";
import { getWorldDepth } from "@/lib/atlasDepth";

export default function ShrineMarker({ shrine, near, compact = false }) {
  if (!shrine?.revealed) return null;

  // Santuario-portal. La etiqueta solo aparece al acercarse en HUD limpio.
  if (shrine.isSanctuary) {
    const activated = shrine.activated;
    return (
      <div className="absolute flex flex-col items-center atlas-world-entity" style={{ left: shrine.x - 22, top: shrine.y - 30, zIndex: getWorldDepth(shrine.y, 0) }}>
        <div className="relative">
          <div className="atlas-shadow" />
          <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
            <span className="absolute rounded-full animate-pulse" style={{
              width: 44, height: 44,
              background: activated
                ? "radial-gradient(circle, rgba(34,211,238,0.6), transparent 70%)"
                : "radial-gradient(circle, rgba(34,211,238,0.2), transparent 70%)",
            }} />
            <span className="absolute rounded-full border-2 border-cyan-400" style={{ width: 32, height: 32, opacity: activated ? 0.8 : 0.4 }} />
            <span className="absolute rounded-full border border-cyan-500/60" style={{ width: 20, height: 20 }} />
            <span className="relative font-display text-cyan-300" style={{ fontSize: 11 }}>◈</span>
          </div>
          {near && !activated && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-900 bg-cyan-300 rounded-full px-1.5 py-0.5 font-bold animate-bounce shadow">!</span>
          )}
        </div>
        {(!compact || near) && (
          <span className="text-[8px] mt-0.5 px-1 py-0.5 rounded whitespace-nowrap" style={{ color: "#22d3ee", background: "rgba(2,6,23,0.8)" }}>
            {activated ? "Portal" : "Portal inactivo"}
          </span>
        )}
      </div>
    );
  }

  const t = SHRINE_TYPES[shrine.type] || SHRINE_TYPES.normal;
  const dim = shrine.activated ? 0.4 : 1;
  return (
    <div className="absolute flex flex-col items-center atlas-world-entity" style={{ left: shrine.x - 20, top: shrine.y - 28, zIndex: getWorldDepth(shrine.y, 2) }}>
      <div className="relative">
        <div className="atlas-shadow" />
        <div className="relative flex items-center justify-center" style={{ width: 40, height: 40 }}>
          <span className="absolute rounded-full animate-pulse" style={{ width: 40, height: 40, background: `radial-gradient(circle, ${t.glow}, transparent 70%)`, opacity: dim }} />
          <span className="absolute rounded-full border-2" style={{ width: 28, height: 28, borderColor: t.color, opacity: shrine.activated ? 0.3 : 0.7 }} />
          <span className="absolute rounded-full border" style={{ width: 15, height: 15, borderColor: t.color, opacity: shrine.activated ? 0.25 : 0.95 }} />
          <span className="relative font-display" style={{ color: t.color, fontSize: 9, opacity: dim }}>✦</span>
        </div>
        {near && !shrine.activated && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-900 bg-teal-300 rounded-full px-1.5 py-0.5 font-bold animate-bounce shadow">!</span>
        )}
      </div>
      {(!compact || near) && (
        <span className="text-[8px] mt-0.5 px-1 py-0.5 rounded whitespace-nowrap" style={{ color: t.color, background: "rgba(2,6,23,0.7)" }}>
          {shrine.activated ? "Activado" : t.name}
        </span>
      )}
    </div>
  );
}
