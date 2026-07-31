import React from "react";
import { isDungeonOccluderTile } from "@/lib/atlasDungeonOcclusion";

function wallPalette(regionId) {
  if (regionId === "fria") return { top: "#d9f2ff", face: "#7da4bd", edge: "#eaf8ff", shadow: "rgba(3,20,35,.45)" };
  if (regionId === "desierto") return { top: "#e2b56f", face: "#9b6032", edge: "#f4d49a", shadow: "rgba(50,22,4,.48)" };
  return { top: "#789456", face: "#5c3b22", edge: "#a5bf72", shadow: "rgba(20,12,5,.5)" };
}

export default function DungeonWallLayer({ dungeon, liveTiles, revealed, tileSize, wallHeight, occludedKeys, regionId, minOpacity = 0.34 }) {
  if (!dungeon || !liveTiles) return null;
  const palette = wallPalette(regionId);
  const t = tileSize;
  const h = Math.max(18, wallHeight || 28);
  const rows = [];

  liveTiles.forEach((row, y) => {
    Array.from(row).forEach((ch, x) => {
      if (!isDungeonOccluderTile(ch)) return;
      if (revealed && !revealed.has(`${x},${y}`)) return;
      const key = `${x},${y}`;
      const faded = occludedKeys?.has(key);
      rows.push(
        <div
          key={`wall_${key}`}
          className="absolute pointer-events-none atlas-dungeon-wall-segment"
          data-occluded={faded ? "true" : "false"}
          style={{
            left: x * t,
            top: y * t - h,
            width: t,
            height: t + h,
            zIndex: 304 + y * 10,
            opacity: faded ? minOpacity : 1,
            transition: "opacity 180ms ease-out, filter 180ms ease-out",
            filter: faded ? "saturate(.72) brightness(1.08)" : "none",
          }}
        >
          <div
            className="absolute left-0 right-0 top-0"
            style={{
              height: Math.max(8, Math.round(h * 0.28)),
              background: `linear-gradient(180deg, ${palette.edge}, ${palette.top})`,
              clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)",
              boxShadow: `0 -2px 5px ${palette.shadow}`,
            }}
          />
          <div
            className="absolute left-0 right-0"
            style={{
              top: Math.max(7, Math.round(h * 0.24)),
              height: h,
              background: `linear-gradient(90deg, rgba(255,255,255,.12), transparent 16%, transparent 82%, rgba(0,0,0,.22)), linear-gradient(180deg, ${palette.face}, #3d281b)`,
              borderLeft: "1px solid rgba(255,255,255,.08)",
              borderRight: "1px solid rgba(0,0,0,.28)",
              boxShadow: `0 ${Math.round(h * 0.4)}px ${Math.round(h * 0.65)}px ${palette.shadow}`,
            }}
          >
            <span className="absolute inset-x-1 top-1 h-px bg-white/10" />
            <span className="absolute left-[28%] top-[24%] h-[65%] w-px bg-black/20" />
            <span className="absolute right-[24%] top-[12%] h-[72%] w-px bg-white/5" />
          </div>
        </div>,
      );
    });
  });
  return <>{rows}</>;
}
