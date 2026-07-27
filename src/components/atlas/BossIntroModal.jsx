import React from "react";
import { Skull, Swords } from "lucide-react";

export default function BossIntroModal({ canon, onClose }) {
  if (!canon) return null;
  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur px-4 py-6" onClick={onClose}>
      <div className="rounded-2xl bg-slate-900 border border-rose-800/60 p-5 max-w-lg w-full max-h-[88vh] overflow-y-auto atlas-toast-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <Skull className="w-8 h-8 text-rose-400 shrink-0" />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-rose-200 truncate">{canon.name}</h3>
            <p className="text-xs text-slate-400">{canon.title} · {canon.race} {canon.class} caído</p>
          </div>
        </div>
        <p className="text-[12px] text-slate-300 leading-snug mb-2">{canon.history}</p>
        <p className="text-[12px] text-amber-200/90 leading-snug mb-1"><span className="text-amber-400 font-medium">Motivo de su caída: </span>{canon.motive}</p>
        <p className="text-[11px] text-slate-400 italic mb-3">{canon.personality}</p>
        <div className="space-y-1.5 mb-4">
          {canon.preLines.map((l, i) => (
            <p key={i} className="text-[12px] text-slate-200 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5 italic">“{l}”</p>
          ))}
        </div>
        <button onClick={onClose} className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-700 hover:bg-rose-600 py-2.5 text-sm font-medium text-white transition">
          <Swords className="w-4 h-4" /> Enfrentar
        </button>
      </div>
    </div>
  );
}