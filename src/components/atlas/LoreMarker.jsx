import React from "react";
import { Landmark, Sparkles, Skull, Orbit, Gem } from "lucide-react";
import { getWorldDepth } from "@/lib/atlasDepth";

const ICONS = { ruins: Landmark, altar: Sparkles, remains: Skull, rift: Orbit, resource: Gem };
const COLORS = { ruins: "#a8a29e", altar: "#fcd34d", remains: "#e7e5e4", rift: "#c084fc", resource: "#5eead4" };

export default function LoreMarker({ m, onInspect }) {
  const Icon = ICONS[m.kind] || Landmark;
  const color = COLORS[m.kind] || "#a8a29e";
  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
      style={{ left: m.x - 14, top: m.y - 16, zIndex: getWorldDepth(m.y, 1) }}
      onClick={() => onInspect?.(m)}
    >
      <div className="relative">
        <div className="atlas-shadow" />
        <div className="flex items-center justify-center rounded-full border-2 animate-pulse" style={{ width: 28, height: 28, borderColor: color, background: "rgba(2,6,23,0.6)", boxShadow: `0 0 10px 2px ${color}55` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <span className="text-[7px] text-slate-200 bg-slate-900/70 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">{m.title}</span>
    </div>
  );
}