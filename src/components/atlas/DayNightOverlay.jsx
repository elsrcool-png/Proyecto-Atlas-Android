import React from "react";

function tint(phase) {
  const sun = Math.cos(phase * 2 * Math.PI);
  const night = Math.max(0, -sun);
  const dusk =
    Math.max(0, 1 - Math.abs(phase - 0.25) / 0.12) +
    Math.max(0, 1 - Math.abs(phase - 0.75) / 0.12);
  return {
    nightOp: Math.min(0.5, night * 0.5),
    duskOp: Math.min(0.3, dusk * 0.3),
  };
}

export default function DayNightOverlay({ phase }) {
  const t = tint(phase || 0);
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{ background: `rgba(8,12,34,${t.nightOp})`, transition: "background 2s linear" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 88%, rgba(255,140,70,${t.duskOp}), transparent 62%)`,
          transition: "background 2s linear",
        }}
      />
    </div>
  );
}