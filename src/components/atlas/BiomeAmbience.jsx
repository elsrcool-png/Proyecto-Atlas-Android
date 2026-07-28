import React, { useMemo } from "react";

const BIOME_CONF = {
  verde: { color: "rgba(190,235,150,0.7)", shape: "leaf", count: 12 },
  fria: { color: "rgba(248,252,255,0.9)", shape: "snow", count: 16 },
  desierto: { color: "rgba(230,200,140,0.55)", shape: "dust", count: 12 },
};

function rng(i, s) { let h = (i * 73856093) ^ (s * 19349663); h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }

export default function BiomeAmbience({ biome }) {
  const conf = BIOME_CONF[biome] || BIOME_CONF.verde;
  const parts = useMemo(() => {
    const arr = [];
    for (let i = 0; i < conf.count; i++) {
      arr.push({ left: rng(i, 7) * 100, top: rng(i, 13) * 100, sz: 3 + rng(i, 21) * 4, dur: 7 + rng(i, 31) * 9, delay: rng(i, 41) * 9, drift: (rng(i, 51) - 0.5) * 50 });
    }
    return arr;
  }, [conf]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {parts.map((p, i) => (
        <span key={i} className="absolute atlas-ambience" style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.sz, height: p.sz, background: conf.color, borderRadius: conf.shape === "snow" ? "50%" : "40% 40% 0 80%", animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, "--drift": `${p.drift}px`, opacity: 0.6 }} />
      ))}
    </div>
  );
}