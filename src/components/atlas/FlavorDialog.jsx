import React from "react";
import { GIcon } from "@/lib/atlasIcons";

export default function FlavorDialog({ data, onClose }) {
  if (!data) return null;
  const npc = data.npc;
  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4" onClick={onClose}>
      <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <GIcon name={npc.icon} size={32} />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-100 truncate">{npc.name}</h3>
            <p className="text-[11px] text-slate-400">{npc.roleLabel}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        {npc.presentation && (
          <p className="text-[12px] text-slate-300 bg-slate-800/50 rounded-lg px-3 py-2 mb-3 leading-snug">
            {npc.presentation}
          </p>
        )}
        <p className="text-sm text-slate-300 italic mb-4 leading-relaxed">«{data.line}»</p>
        <button onClick={onClose} className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-sm text-slate-300 transition">Cerrar</button>
      </div>
    </div>
  );
}