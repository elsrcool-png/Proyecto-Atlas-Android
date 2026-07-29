import React from "react";

const TIERS = [
  { min: 10, label: "CRÍTICA", color: "bg-fuchsia-500", text: "text-fuchsia-300", pulse: true },
  { min: 7, label: "ALTA", color: "bg-red-500", text: "text-red-300", pulse: true },
  { min: 4, label: "MEDIA", color: "bg-amber-400", text: "text-amber-300", pulse: false },
  { min: 0, label: "BAJA", color: "bg-emerald-500", text: "text-emerald-300", pulse: false },
];

export default function ThreatBar({ threat }) {
  const t = Math.max(0, Math.min(10, threat || 0));
  const tier = TIERS.find((x) => t >= x.min);
  const pct = (t / 10) * 100;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium tracking-widest uppercase text-slate-400">Amenaza Global</span>
        <span className={`text-[11px] font-bold tracking-wider ${tier.text}`}>{tier.label} · {t}/10</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${tier.color} transition-all duration-500 ${tier.pulse ? "animate-pulse" : ""}`}
          style={{ width: `${Math.max(6, pct)}%` }}
        />
      </div>
    </div>
  );
}