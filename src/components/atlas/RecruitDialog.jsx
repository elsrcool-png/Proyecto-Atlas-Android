import React, { useState } from "react";
import { Users, Heart, Zap, Swords, Shield, Coins, MessageCircle, BarChart3, UserPlus, X } from "lucide-react";

const RACE_COLOR = { Humano: "text-amber-200", Elfo: "text-emerald-200", Enano: "text-orange-200" };
const CLASS_COLOR = { Guerrero: "text-rose-300", Mago: "text-sky-300", "Pícaro": "text-violet-300", Explorador: "text-teal-300", Erudito: "text-indigo-300" };

export default function RecruitDialog({ recruits, companion, playerGold, onHire, onDismiss, onClose }) {
  const [selected, setSelected] = useState(recruits[0]?.id || null);
  const [view, setView] = useState("hablar"); // hablar | stats
  const rec = recruits.find((r) => r.id === selected) || recruits[0];
  if (!rec) return null;
  const isHired = companion?.id === rec.id;
  const canAfford = (playerGold || 0) >= rec.cost;
  const hasCompanion = !!companion;

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur px-3 py-4" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-2xl bg-slate-900 border border-amber-700/60 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-3 bg-slate-900/95 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-300" />
            <h2 className="text-sm font-display text-amber-200">Campamento de aventureros</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex gap-1 p-2 overflow-x-auto border-b border-slate-800">
          {recruits.map((r) => {
            const active = r.id === selected;
            const hired = companion?.id === r.id;
            return (
              <button key={r.id} onClick={() => { setSelected(r.id); setView("hablar"); }} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium border transition ${active ? "bg-amber-700/30 border-amber-400 text-amber-100" : "bg-slate-800/60 border-slate-700 text-slate-300"}`}>
                <span className={RACE_COLOR[r.race]}>{r.race}</span> <span className={CLASS_COLOR[r.class]}>{r.class}</span>
                {hired && <span className="ml-1 text-emerald-300">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{rec.name}</h3>
              <p className="text-xs text-slate-400">{rec.race} {rec.class} · Nivel {rec.level}</p>
            </div>
            {isHired && <span className="rounded-full bg-emerald-600/20 border border-emerald-400 px-2 py-0.5 text-[10px] text-emerald-200">Contratado</span>}
          </div>

          {view === "hablar" ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-200 italic leading-snug">«{rec.desc}»</p>
              <p className="text-xs text-amber-200/90 leading-snug"><span className="font-semibold">{rec.ability}:</span> {rec.abilityDesc}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1 text-sm text-amber-300 font-medium"><Coins className="w-4 h-4" /> {rec.cost} oro</span>
                <span className="text-[10px] text-slate-500">Coste de contratación</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Stat icon={<Heart className="w-3.5 h-3.5 text-emerald-300" />} label="Vida" value={`${rec.hp}`} />
              <Stat icon={<Zap className="w-3.5 h-3.5 text-sky-300" />} label="Energía" value={`${rec.energy}`} />
              <Stat icon={<Swords className="w-3.5 h-3.5 text-rose-300" />} label="Ataque" value={`${rec.attack}`} />
              <Stat icon={<Shield className="w-3.5 h-3.5 text-slate-300" />} label="Defensa" value={`${rec.defense}`} />
              <div className="col-span-2 rounded-lg bg-slate-800/60 border border-slate-700 p-2">
                <p className="text-[10px] uppercase tracking-wider text-amber-300 mb-0.5">Habilidad principal</p>
                <p className="text-sm font-medium text-slate-100">{rec.ability}</p>
                <p className="text-[11px] text-slate-400 leading-snug">{rec.abilityDesc}</p>
              </div>
            </div>
          )}

          {hasCompanion && !isHired && (
            <p className="mt-3 text-[11px] text-amber-300/80 bg-amber-950/30 border border-amber-700/40 rounded-lg px-2 py-1.5">
              Ya tienes un compañero: <span className="font-medium">{companion.name}</span>. Contratar a {rec.name} lo reemplazará.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => setView("hablar")} className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${view === "hablar" ? "bg-slate-700 text-white" : "bg-slate-800/60 text-slate-300 hover:bg-slate-700"}`}><MessageCircle className="w-3.5 h-3.5" /> Hablar</button>
            <button onClick={() => setView("stats")} className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${view === "stats" ? "bg-slate-700 text-white" : "bg-slate-800/60 text-slate-300 hover:bg-slate-700"}`}><BarChart3 className="w-3.5 h-3.5" /> Estadísticas</button>
            {isHired ? (
              <button onClick={onDismiss} className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-rose-700/80 hover:bg-rose-600 px-3 py-2 text-xs font-medium text-white"><X className="w-3.5 h-3.5" /> Despedir compañero</button>
            ) : (
              <button onClick={() => onHire(rec)} disabled={!canAfford} className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 text-xs font-medium text-white"><UserPlus className="w-3.5 h-3.5" /> {canAfford ? `Contratar (${rec.cost} oro)` : "Oro insuficiente"}</button>
            )}
            <button onClick={onClose} className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200"><X className="w-3.5 h-3.5" /> Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-800/60 border border-slate-700 px-2.5 py-1.5">
      {icon}
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="ml-auto text-sm font-semibold text-slate-100">{value}</span>
    </div>
  );
}