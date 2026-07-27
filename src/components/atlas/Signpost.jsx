import React from "react";
import { getWorldDepth } from "@/lib/atlasDepth";

const ARROW = { up: "↑", down: "↓", left: "←", right: "→" };

export default function Signpost({ s }) {
  return (
    <div className="absolute pointer-events-none flex flex-col items-center" style={{ left: s.x - 4, top: s.y - 30, zIndex: getWorldDepth(s.y, 1) }}>
      <div className="relative flex flex-col items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 rounded-b bg-amber-950/80" style={{ height: 34, boxShadow: "1px 1px 0 rgba(0,0,0,0.4)" }} />
        <div className="absolute" style={{ top: 2, left: "50%", transform: "translateX(-50%)" }}>
          {s.labels.map((l, i) => (
            <div key={i} className="flex items-center gap-1 rounded-sm bg-amber-700/90 border border-amber-900 px-1.5 py-0.5 mb-0.5 whitespace-nowrap shadow" style={{ transform: `translateX(${l.dir === "left" ? -6 : l.dir === "right" ? 6 : 0}px) rotate(${l.dir === "left" ? -3 : l.dir === "right" ? 3 : 0}deg)` }}>
              <span className="text-[9px] text-amber-100 leading-none">{ARROW[l.dir]}</span>
              <span className="text-[8px] text-amber-50 leading-none font-medium">{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}