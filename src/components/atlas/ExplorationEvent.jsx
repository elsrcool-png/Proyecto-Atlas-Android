import React from "react";
import EntitySprite from "./EntitySprite";
import { GIcon } from "@/lib/atlasIcons";
import { getWorldDepth } from "@/lib/atlasDepth";

export default function ExplorationEvent({ event, near, inCombat }) {
  if (!event) return null;
  return (
    <div className="absolute flex flex-col items-center atlas-world-entity" style={{ left: event.x - 22, top: event.y - 34, zIndex: getWorldDepth(event.y, 1) }}>
      <div className="relative">
        <div className="atlas-shadow" />
        {event.kind === "merchant" && (
          <span className="atlas-sprite-idle block"><EntitySprite type="stranger" turn size={42} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" /></span>
        )}
        {event.kind === "adventurers" && (
          <div className="flex items-end gap-0.5">
            <span className="atlas-sprite-idle"><EntitySprite type="villager" variant="civilian" size={26} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" /></span>
            <span style={{ fontSize: 22, lineHeight: 1, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.6))" }}>🔥</span>
            <span className="atlas-sprite-idle"><EntitySprite type="villager" variant="guard" size={26} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" /></span>
          </div>
        )}
        {event.kind === "camp" && (
          <span className="block" style={{ fontSize: 28, lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>⛺</span>
        )}
        {event.kind === "creature" && (
          <span className="animate-pulse block"><GIcon name="sparkles" size={30} style={{ color: "#c4b5fd" }} /></span>
        )}
        {near && !inCombat && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-900 bg-amber-300 rounded-full px-1.5 py-0.5 font-bold animate-bounce shadow">!</span>}
      </div>
      {near && !inCombat && event.kind === "merchant" && <span className="text-[8px] text-amber-200 bg-slate-900/70 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">Comerciante ambulante</span>}
      {near && !inCombat && event.kind === "adventurers" && <span className="text-[8px] text-emerald-200 bg-slate-900/70 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">Aventureros</span>}
      {near && !inCombat && event.kind === "camp" && <span className="text-[8px] text-slate-300 bg-slate-900/70 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">Campamento abandonado</span>}
    </div>
  );
}