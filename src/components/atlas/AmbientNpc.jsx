import React from "react";
import EntitySprite from "./EntitySprite";
import { npcIdleAnimationStyle } from "@/lib/atlasNpcMotion";
import { getWorldDepth } from "@/lib/atlasDepth";

export default function AmbientNpc({ npc, onTalk, compact = false }) {
  return (
    <div
      className="!absolute flex flex-col items-center cursor-pointer hover:scale-105 transition-transform atlas-world-entity"
      style={{ left: npc.x - 16, top: npc.y - 34, zIndex: getWorldDepth(npc.y, 1) }}
      onClick={() => onTalk?.(npc)}
    >
      <div className="relative">
        <div className="atlas-shadow" />
        {npc.camp && (
          <div className="absolute -left-5 bottom-1 w-4 h-4 rounded-full" style={{ background: "radial-gradient(circle, #f97316, #7c2d12 70%)", boxShadow: "0 0 8px 2px rgba(249,115,22,0.5)" }} />
        )}
        <span className="atlas-sprite-idle block" style={npcIdleAnimationStyle(npc.id)}>
          <EntitySprite type={npc.sprite.type} variant={npc.sprite.variant} turn animationKey={npc.id} size={34} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
        </span>
      </div>
      {!compact && <span className="text-[8px] text-amber-100 bg-slate-900/70 px-1 py-0.5 rounded mt-0.5 whitespace-nowrap">{npc.name}</span>}
    </div>
  );
}
