import React from "react";
import { Plus, FolderOpen, Settings, Skull, Swords, Map } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";

export default function MainMenu({ onNewGame, onLoadGame, onOpenSettings, hasAnySave }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-emerald-500 rounded-full blur-3xl" />
      </div>
      <div className="text-center max-w-md relative z-10">
        <div className="mb-6 flex justify-center"><GIcon name="swords" size={64} /></div>
        <p className="text-sm tracking-[0.3em] uppercase text-sky-400 mb-2 font-heading">Juego de mesa digital</p>
        <h1 className="text-2xl md:text-4xl font-display tracking-tight text-slate-100 leading-relaxed">
          PROYECTO<br /><span className="text-sky-400">ATLAS</span>
        </h1>
        <p className="text-slate-400 mt-4 mb-8 leading-relaxed">
          Tu aventura se guarda en uno de tres espacios independientes. Cada uno mantiene su propio personaje, progreso, regiones y santuarios.
        </p>
        <div className="space-y-3">
          <button onClick={onNewGame}
            className="w-full max-w-xs flex items-center gap-3 justify-center rounded-xl bg-sky-600 hover:bg-sky-500 py-4 px-8 font-semibold text-lg text-white transition shadow-lg shadow-sky-600/20 mx-auto">
            <Plus className="w-6 h-6" /> Nueva partida
          </button>
          <button onClick={onLoadGame}
            className={`w-full max-w-xs flex items-center gap-3 justify-center rounded-xl py-4 px-8 font-semibold text-lg transition mx-auto ${hasAnySave ? "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30 ring-2 ring-teal-300/40" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
            disabled={!hasAnySave}>
            <FolderOpen className="w-6 h-6" /> Cargar partida
          </button>
          <button onClick={onOpenSettings}
            className="w-full max-w-xs flex items-center gap-3 justify-center rounded-xl bg-slate-800 hover:bg-slate-700 py-3 px-8 font-medium text-slate-200 transition mx-auto">
            <Settings className="w-5 h-5" /> Ajustes
          </button>
        </div>
        <div className="flex justify-center gap-8 mt-10 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5"><Map className="w-4 h-4" /> 3 Regiones</span>
          <span className="flex items-center gap-1.5"><Skull className="w-4 h-4" /> 3 Jefes</span>
          <span className="flex items-center gap-1.5"><Swords className="w-4 h-4" /> 9 Héroes</span>
        </div>
      </div>
    </div>
  );
}