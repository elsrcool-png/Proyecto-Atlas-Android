import React from "react";
import { Check, Circle, Clock } from "lucide-react";

const SECTOR_LABEL = { campamento: "Campamento", pueblo: "Pueblo", ciudad: "Ciudad" };

function rewardText(r) { if (!r) return ""; const parts = []; if (r.gold) parts.push(`${r.gold} oro`); if (r.potion) parts.push("poción"); if (r.item) parts.push("objeto"); if (r.xp) parts.push("experiencia"); return parts.join(" · "); }
function statusBadge(state) { if (state?.status === "done") return <span className="text-[10px] text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Completada</span>; if (state?.status === "ready") return <span className="text-[10px] text-amber-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Lista para reclamar</span>; if (state?.active) return <span className="text-[10px] text-sky-300 flex items-center gap-1"><Circle className="w-3 h-3 fill-current" /> Activa</span>; return <span className="text-[10px] text-slate-500">Disponible</span>; }

function MissionRow({ def, state }) { const prog = state?.progress || 0; const pct = def.target ? Math.min(100, Math.round((prog / def.target) * 100)) : 0; return (<div className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2.5"><div className="flex items-center justify-between gap-2"><span className="text-sm text-slate-100">{def.name}</span>{statusBadge(state)}</div><p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{def.desc}</p><div className="flex items-center justify-between mt-1.5"><div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden mr-2"><div className="h-full bg-sky-400 transition-all" style={{ width: `${pct}%` }} /></div><span className="text-[10px] text-slate-400 whitespace-nowrap">{prog}/{def.target}</span></div><p className="text-[10px] text-amber-200/80 mt-1">Recompensa: {rewardText(def.reward)}</p></div>); }

export default function HubMissions({ missions, missionDefs, region }) {
  if (!missionDefs) return <p className="p-4 text-sm text-slate-500">No hay misiones disponibles.</p>;
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <p className="text-[11px] text-slate-500 -mb-1">Región actual: <span className="text-slate-300">{region?.name}</span></p>
      {["campamento", "pueblo", "ciudad"].map(sector => { const defs = missionDefs[sector] || []; if (!defs.length) return null; return (<div key={sector}><h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">{SECTOR_LABEL[sector]}</h3><div className="space-y-1.5">{defs.map(def => <MissionRow key={def.id} def={def} state={missions?.[def.id]} />)}</div></div>); })}
    </div>
  );
}