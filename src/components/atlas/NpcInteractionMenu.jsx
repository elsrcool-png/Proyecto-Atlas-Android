import React from "react";
import { X } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";

const ACTION_ICONS = {
  claim: "star",
  continue: "message",
  view_missions: "scroll",
  restore_relic: "sparkles",
  shop: "package",
  smith: "hammer",
  rest: "moon",
  dialogue: "user",
};

/**
 * Menú contextual compacto para NPCs multifunción.
 * Muestra las acciones disponibles y permite elegir una.
 */
export default function NpcInteractionMenu({ npc, actions, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 pb-4" onClick={onClose}>
      <div
        className="rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl w-full max-w-[320px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60 bg-slate-800/40">
          <div className="shrink-0 w-9 h-9 rounded-full bg-slate-700/60 flex items-center justify-center">
            <GIcon name={npc.icon || "user"} size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">{npc.name}</p>
            {npc.roleLabel && <p className="text-[10px] text-slate-400 truncate">{npc.roleLabel}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Acciones */}
        <div className="p-2 space-y-1.5">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => onSelect(action)}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                action.priority <= 2
                  ? "bg-amber-600/90 hover:bg-amber-500 text-white"
                  : action.priority <= 4
                  ? "bg-violet-600/80 hover:bg-violet-500 text-white"
                  : "bg-slate-700/80 hover:bg-slate-600 text-slate-100"
              }`}
            >
              <GIcon name={ACTION_ICONS[action.type] || "info"} size={15} />
              <span className="flex-1 text-left truncate">{action.label}</span>
            </button>
          ))}
          <button
            onClick={onClose}
            className="w-full rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}