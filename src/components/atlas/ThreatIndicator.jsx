import React from "react";
import { Eye } from "lucide-react";
import { tierOf } from "@/lib/atlasThreat";

export default function ThreatIndicator({ threat, compact = false }) {
  const t = Math.max(0, Math.min(10, threat || 0));
  const tier = tierOf(t);
  return (
    <div className={`atlas-threat-indicator flex items-center border ${tier.ring} ${compact ? "atlas-threat-indicator--compact" : ""}`}>
      <Eye className={`w-3.5 h-3.5 ${tier.color}`} />
      {!compact && <span className="atlas-threat-label text-[10px] uppercase tracking-widest text-slate-400">Amenaza</span>}
      <span className={`text-xs font-bold ${tier.color}`}>{tier.roman}</span>
      <span className="atlas-threat-value text-[10px] text-slate-500">{t}/10</span>
    </div>
  );
}
