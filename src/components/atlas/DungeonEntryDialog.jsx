import React, { useState } from "react";
import { DoorOpen, MessageCircle, Users, X, Sparkles } from "lucide-react";
import EntitySprite from "./EntitySprite";
import { DUNGEON_TUTORIAL_LINES } from "@/lib/atlasDungeonEntry";

// Diálogo de entrada a dungeon: NPC guardián, explicación (primera vez),
// opciones Preguntar / Entrar / Contratar compañero / Cancelar.
export default function DungeonEntryDialog({ npc, dungeon, isFirstTime, hasCompanion, canHire, onAsk, onEnter, onHire, onClose }) {
  const [showExplain, setShowExplain] = useState(false);
  const [asked, setAsked] = useState(false);

  return (
    <div className="absolute inset-0 z-40 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur px-3 py-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-700/60 shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3 p-4 border-b border-slate-700/60 bg-gradient-to-b from-amber-950/40 to-transparent">
          <div className="shrink-0 rounded-lg bg-slate-950/70 border border-slate-600 p-1">
            <EntitySprite type={npc.sprite.type} variant={npc.sprite.variant} turn size={48} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-400">Guardián de la entrada</p>
            <h3 className="font-display text-sm text-amber-100">{npc.name}</h3>
            <p className="text-xs text-slate-300 italic mt-1 leading-snug">«{npc.line}»</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-lg bg-slate-800/80 border border-slate-600 p-1.5 text-slate-300 hover:bg-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-3">
          <div className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2">
            <p className="text-[11px] text-slate-300"><span className="text-amber-300 font-semibold">{dungeon.name}</span> · {dungeon.sectorId}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Mazmorra interior. Lleva pociones y, si puedes, un compañero.</p>
          </div>

          {showExplain ? (
            <div className="rounded-xl bg-slate-950/80 border border-amber-700/50 p-3 space-y-1.5 max-h-52 overflow-y-auto">
              {DUNGEON_TUTORIAL_LINES.map((l, i) => (
                <p key={i} className="text-[11px] text-amber-100 leading-snug">{l}</p>
              ))}
              <button onClick={() => setShowExplain(false)} className="mt-1 w-full rounded-lg bg-amber-700/80 hover:bg-amber-600 py-1.5 text-[11px] text-white font-medium">Entendido</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setShowExplain(true); onAsk?.(); setAsked(true); }} className="flex items-center gap-2 rounded-xl bg-sky-700/80 border border-sky-400 px-3 py-2.5 text-xs text-white hover:bg-sky-600">
                <MessageCircle className="w-4 h-4" /> Preguntar
              </button>
              <button onClick={onEnter} className="flex items-center gap-2 rounded-xl bg-emerald-600/85 border-2 border-emerald-300 px-3 py-2.5 text-xs text-white font-bold hover:bg-emerald-500">
                <DoorOpen className="w-4 h-4" /> Entrar
              </button>
              <button onClick={onHire} disabled={!canHire} className="flex items-center gap-2 rounded-xl bg-violet-700/80 border border-violet-400 px-3 py-2.5 text-xs text-white hover:bg-violet-600 disabled:opacity-40">
                <Users className="w-4 h-4" /> Contratar
              </button>
              <button onClick={onClose} className="flex items-center gap-2 rounded-xl bg-slate-700/80 border border-slate-500 px-3 py-2.5 text-xs text-slate-200 hover:bg-slate-600">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          )}

          {isFirstTime && !asked && !showExplain && (
            <p className="text-[10px] text-amber-300 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Es tu primera dungeon: pulsa «Preguntar» para que {npc.name} te explique cómo sobrevivir.</p>
          )}
          {hasCompanion && (
            <p className="text-[10px] text-teal-300 flex items-center gap-1.5"><Users className="w-3 h-3" /> Ya llevas un compañero: luchará a tu lado dentro.</p>
          )}
        </div>
      </div>
    </div>
  );
}