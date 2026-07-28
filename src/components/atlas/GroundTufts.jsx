import React, { useMemo } from "react";

function h2(i, s) { let h = (i * 73856093) ^ (s * 19349663); h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }

export default function GroundTufts({ world, biome }) {
  const tufts = useMemo(() => {
    const n = 30;
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({ x: 60 + h2(i, 11) * (world.W - 120), y: 60 + h2(i, 23) * (world.H - 120), s: 0.7 + h2(i, 31) * 0.8, d: h2(i, 41) * 4, kind: h2(i, 53) });
    }
    return arr;
  }, [world]);

  const isIce = biome === "fria";
  const isDes = biome === "desierto";
  const blade = isDes ? "#c89a4a" : isIce ? "#cfe6f0" : "#6cba3f";
  const tip = isDes ? "#e0b870" : isIce ? "#eaf6ff" : "#8fd06a";
  const flowerColors = ["#e85a6a", "#f2d040", "#c8a0f0", "#ffffff"];

  return (
    <>
      {tufts.map((t, i) => (
        <span key={i} className="absolute atlas-sway-slow" style={{ left: t.x, top: t.y, transformOrigin: "bottom center", animationDelay: `${t.d}s` }}>
          <span style={{ display: "block", width: 3 * t.s, height: 10 * t.s, background: `linear-gradient(${tip},${blade})`, borderRadius: "40% 40% 0 0", opacity: 0.85, boxShadow: "1px 1px 1px rgba(0,0,0,0.18)" }} />
          {t.kind > 0.78 && !isDes && !isIce && (
            <span style={{ position: "absolute", left: -2, top: -3, width: 4, height: 4, borderRadius: "50%", background: flowerColors[i % 4], boxShadow: "0 0 2px rgba(0,0,0,0.3)" }} />
          )}
        </span>
      ))}
    </>
  );
}