import React from "react";
import { Star, Lock, Check, MapPin, Swords, MessageCircle, Package, Sparkles } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";
import { getCurrentObjectiveText, getMissionProgressLabel } from "@/lib/atlasMissionEngine";
import EntitySprite from "@/components/atlas/EntitySprite";

const TYPE_META = {
  combate: { label: "Combate", Icon: Swords, color: "text-rose-300" },
  exploracion: { label: "Exploración", Icon: MapPin, color: "text-sky-300" },
  investigacion: { label: "Investigación", Icon: MessageCircle, color: "text-violet-300" },
  supervivencia: { label: "Supervivencia", Icon: Package, color: "text-amber-300" },
  proteccion: { label: "Protección", Icon: Swords, color: "text-orange-300" },
  recuperacion: { label: "Recuperación", Icon: Package, color: "text-emerald-300" },
  evento: { label: "Evento especial", Icon: Sparkles, color: "text-fuchsia-300" },
  social: { label: "Social", Icon: MessageCircle, color: "text-teal-300" },
};

function rewardText(r) {
  const parts = [];
  if (r.gold) parts.push(`${r.gold} oro`);
  if (r.potion) parts.push("poción");
  if (r.item) parts.push("objeto raro");
  if (r.xp) parts.push("experiencia");
  return parts.join(" · ") || "—";
}

export default function NPCDialog({ npc, sectorMissions, threat, onActivate, onClaim, onClose, intro, lore, threatWarning }) {
  const list = sectorMissions || [];
  const done = list.filter(s => s.state?.status === "done").length;
  const total = list.length;

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4 py-6" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-20 shrink-0 rounded-xl bg-slate-950/55 border border-slate-700 flex items-end justify-center overflow-hidden">
            <EntitySprite type={npc.sprite?.type || "villager"} variant={npc.sprite?.variant || "civilian"} turn size={48} />
            <span className="absolute right-1 top-1 rounded-full bg-slate-900/90 border border-slate-600 p-1"><GIcon name={npc.icon} size={14} /></span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100">{npc.name}</h3>
            <p className="text-xs text-slate-400">{npc.roleLabel ? `${npc.roleLabel} · ` : ""}Misiones · {done}/{total} completadas</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        {npc.presentation && <p className="text-[11px] text-slate-200/90 bg-slate-800/40 rounded-lg px-3 py-2 mb-3 leading-snug">{npc.presentation}</p>}
        {intro && <p className="text-[11px] text-sky-200/90 bg-sky-950/30 rounded-lg px-3 py-2 mb-3 italic">{intro}</p>}
        {threatWarning && <p className="text-[11px] text-rose-200/90 bg-rose-950/30 border border-rose-800/40 rounded-lg px-3 py-2 mb-3 italic flex items-start gap-1.5"><span className="text-rose-400">⚠</span> {threatWarning}</p>}
        {lore && <p className="text-[11px] text-teal-200/90 bg-teal-950/30 rounded-lg px-3 py-2 mb-3 italic flex items-start gap-1.5"><span className="text-teal-400">✦</span> {lore}</p>}
        <div className="space-y-2">
          {list.map(({ def, state, lockReason }) => {
            const meta = TYPE_META[def.type] || TYPE_META.combate;
            const Icon = meta.Icon;
            const locked = !!lockReason || (def.threatMin || 0) > (threat || 0);
            return (
              <div key={def.id} className={`rounded-lg border px-3 py-2.5 ${state?.status === "done" ? "bg-emerald-950/30 border-emerald-800/50" : state?.active ? "bg-sky-950/30 border-sky-700/50" : "bg-slate-800/50 border-slate-700"}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-100 flex items-center gap-1.5"><Icon className={`w-3.5 h-3.5 ${meta.color}`} /> {def.name}</span>
                  <span className={`text-[10px] uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mb-1">{def.desc}</p>
                {def.storySummary && <p className="text-[10px] text-violet-200/90 bg-violet-950/25 border border-violet-900/30 rounded-md px-2 py-1 mb-1"><span className="text-violet-300">Contexto:</span> {def.storySummary}</p>}
                {!!def.worldChanges?.length && <p className="text-[10px] text-emerald-200/90 bg-emerald-950/20 border border-emerald-900/30 rounded-md px-2 py-1 mb-1"><span className="text-emerald-300">Consecuencia:</span> {def.worldChanges.join(" · ")}</p>}
                {state?.accepted && state?.status !== "done" && (
                  <p className="text-[10px] text-sky-200 bg-sky-950/30 border border-sky-900/40 rounded-md px-2 py-1 mb-1">
                    <span className="text-sky-400">Objetivo:</span> {getCurrentObjectiveText(def, state)}
                  </p>
                )}
                <p className="text-[10px] text-slate-500">{getMissionProgressLabel(def, state)} · Recompensa: {rewardText(def.reward)}{def.cost ? ` · Coste: ${def.cost} oro` : ""}</p>
                <div className="mt-2 flex items-center gap-2">
                  {state?.status === "done" && <span className="text-[11px] text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Completada</span>}
                  {state?.status === "ready" && <button onClick={() => onClaim(def.id)} className="text-xs rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 font-medium text-slate-900 flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Reclamar</button>}
                  {state?.status === "pending" && state?.active && <span className="text-[11px] text-sky-300">En curso…</span>}
                  {state?.status === "pending" && !state?.active && !state?.accepted && (locked
                    ? <span className="text-[11px] text-slate-500 flex items-start gap-1"><Lock className="w-3 h-3 mt-0.5 shrink-0" /> {lockReason || `Requiere amenaza ≥ ${def.threatMin}`}</span>
                    : <button onClick={() => onActivate(def.id)} className="text-xs rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-slate-100">{def.cost ? `Aceptar (${def.cost} oro)` : "Aceptar"}</button>)}
                  {state?.status === "pending" && state?.accepted && !state?.active && <span className="text-[11px] text-slate-400">Aceptada · actívala desde el Diario</span>}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-sm text-slate-300 transition">Cerrar</button>
      </div>
    </div>
  );
}