import React from "react";

export default function RoadLayer({ world }) {
  const { W, H, roads } = world;
  if (!roads || !roads.length) return null;
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg className="absolute top-0 left-0 pointer-events-none" width={W} height={H} style={{ opacity: 0.55 }}>
      {roads.map((r, i) => (
        <g key={i}>
          <path d={toPath(r)} fill="none" stroke="#5b4a32" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
          <path d={toPath(r)} fill="none" stroke="#9b8458" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
        </g>
      ))}
    </svg>
  );
}