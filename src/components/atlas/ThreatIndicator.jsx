import React from "react";
import { Eye } from "lucide-react";
import { tierOf } from "@/lib/atlasThreat";

export default function ThreatIndicator({ threat }) {
  const t = Math.max(0, Math.min(10, threat || 0));
  const tier = tierOf(t);
  return (
    <div className={`flex items-center gap-2 rounded-lg bg-slate-900/70 border ${tier.ring} px-2.5 py-1.5`}>
      <Eye className={`w-3.5 h-3.5 ${tier.color}`} />
      <span className="text-[10px] uppercase tracking-widest text-slate-400">Amenaza</span>
      <span className={`text-xs font-bold ${tier.color}`}>{tier.roman}</span>
      <span className="text-[10px] text-slate-500">· {t}/10</span>
    </div>
  );
}