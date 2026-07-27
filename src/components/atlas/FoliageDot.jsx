import React from "react";
import { getWorldDepth } from "@/lib/atlasDepth";

function biomeBlade(biome) {
  if (biome === "desierto") return { blade: "#c89a4a", tip: "#e0b870" };
  if (biome === "fria") return { blade: "#cfe6f0", tip: "#eaf6ff" };
  return { blade: "#5fa838", tip: "#8fd06a" };
}

const FLOWER_COLORS = ["#e85a6a", "#f2d040", "#c8a0f0", "#ffffff", "#ff9a4a"];

const STYLES = {
  bush: (biome) => ({ bg: biome === "desierto" ? "radial-gradient(circle at 40% 35%, #9ab06a, #5a6a3a)" : biome === "fria" ? "radial-gradient(circle at 40% 35%, #8aa07a, #4a5a3a)" : "radial-gradient(circle at 40% 35%, #7ec050, #2f6a2a)", br: "50% 50% 45% 55%", w: 1, h: 0.7, sway: "atlas-sway-slow" }),
  mushroom: () => ({ bg: "radial-gradient(circle at 40% 30%, #f06a5a, #a02828)", br: "50% 50% 50% 50%", w: 1, h: 0.7, sway: "atlas-sway-slow" }),
  smallrock: () => ({ bg: "radial-gradient(circle at 38% 32%, #b4ac9c, #5e564a)", br: "50%", w: 1, h: 0.6, sway: "" }),
  bone: () => ({ bg: "linear-gradient(#e8e0c8,#b8b0a0)", br: "40%", w: 1, h: 0.5, sway: "" }),
  tallgrass: (biome) => { const { blade, tip } = biomeBlade(biome); return { bg: `linear-gradient(${tip},${blade})`, br: "40% 40% 0 0", w: 0.4, h: 1.7, sway: "atlas-sway" }; },
  flower: (biome) => ({ bg: FLOWER_COLORS[biome === "desierto" ? 1 : (biome === "fria" ? 3 : 0)], br: "50%", w: 0.5, h: 0.5, sway: "atlas-sway-slow", glow: "0 0 4px rgba(255,240,180,0.55)" }),
  fern: (biome) => ({ bg: biome === "fria" ? "radial-gradient(circle at 40% 80%, #8aa07a, #4a5a3a)" : "radial-gradient(circle at 40% 80%, #6ca050, #2f5a2a)", br: "50% 50% 30% 70%", w: 0.7, h: 1.0, sway: "atlas-sway" }),
};

export default function FoliageDot({ d, biome }) {
  const s = d.sz;
  const st = (STYLES[d.icon] || STYLES.smallrock)(biome);
  const w = s * (st.w ?? 1), h = s * st.h;
  return (
    <span
      className={`absolute ${st.sway || "atlas-sway-slow"}`}
      style={{ left: d.x - w / 2, top: d.y - h, width: w, height: h, background: st.bg, borderRadius: st.br, boxShadow: st.glow || "1px 2px 2px rgba(0,0,0,0.25)", transformOrigin: "bottom center", animationDelay: `${(d.x % 5) * 0.4}s`, opacity: 0.9, pointerEvents: "none", zIndex: getWorldDepth(d.y) }}
    />
  );
}