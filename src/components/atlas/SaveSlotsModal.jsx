import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Play, Plus, AlertTriangle, X, Clock } from "lucide-react";

const REGION_LABELS = { verde: "Reino Verde", fria: "Reino Ártico", desierto: "Reino Árido" };

function fmtDate(ms) {
  if (!ms) return "—";
  try {
    const d = new Date(ms);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "2-digit" }) + " " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch (e) { return "—"; }
}

function fmtTime(ms) {
  if (!ms || ms < 0) return "0 min";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min`;
  return `${total} s`;
}

function SlotCard({ index, slot, mode, onPick, onDelete }) {
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const occupied = !!slot;
  const p = slot?.player;
  const region = slot ? REGION_LABELS[slot.lastRegionId] || slot.regionLabel || "—" : null;
  const sector = slot?.lastSectorName || (slot ? `${String.fromCharCode(65 + (slot.blockIndex || 0))}${(slot.sectorRow || 0) + 1}` : null);
  const mission = slot?.priorityMissionName || "—";

  const handlePick = () => {
    if (mode === "new" && occupied) { setConfirmOverwrite(true); return; }
    onPick(index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 w-full ${occupied ? "bg-slate-900/80 border-slate-700" : "bg-slate-900/40 border-dashed border-slate-700"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-xs text-sky-400">ESPACIO {index}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${occupied ? "bg-emerald-600/30 text-emerald-300" : "bg-slate-700/50 text-slate-400"}`}>
            {occupied ? "Ocupado" : "Vacío"}
          </span>
        </div>
        {occupied && mode !== "new" && (
          <button onClick={() => setConfirmDelete(true)} className="text-slate-500 hover:text-rose-400 transition" title="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {occupied ? (
        <div className="space-y-1.5 mb-3">
          <p className="text-sm font-semibold text-slate-100">{p?.race || "?"} {p?.class || "?"}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <span>Nivel: <span className="text-slate-200">{p?.level ?? 1}</span></span>
            <span>Región: <span className="text-slate-200">{region}</span></span>
            <span>Sector: <span className="text-slate-200">{sector}</span></span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtTime(slot.playTimeMs)}</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Misión: <span className="text-sky-300">{mission}</span></p>
          <p className="text-[10px] text-slate-500">Último guardado: {fmtDate(slot.savedAt)}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 mb-3 text-slate-500">
          <p className="text-xs">Sin partida guardada</p>
        </div>
      )}

      <div className="flex gap-2">
        {mode === "load" && !occupied ? (
          <button disabled className="flex-1 rounded-lg bg-slate-800 text-slate-600 py-2 text-xs cursor-not-allowed">No disponible</button>
        ) : mode === "load" ? (
          <>
            {confirmDelete ? (
              <>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg bg-slate-700 hover:bg-slate-600 py-2 text-xs text-slate-200">Cancelar</button>
                <button onClick={() => { onDelete(index); setConfirmDelete(false); }} className="flex-1 rounded-lg bg-rose-600 hover:bg-rose-500 py-2 text-xs text-white">Confirmar borrado</button>
              </>
            ) : (
              <button onClick={() => onPick(index)} className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-medium text-white flex items-center justify-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Continuar
              </button>
            )}
          </>
        ) : (
          <>
            {confirmOverwrite ? (
              <>
                <button onClick={() => setConfirmOverwrite(false)} className="flex-1 rounded-lg bg-slate-700 hover:bg-slate-600 py-2 text-xs text-slate-200">Cancelar</button>
                <button onClick={() => onPick(index)} className="flex-1 rounded-lg bg-amber-600 hover:bg-amber-500 py-2 text-xs font-medium text-white flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Sobrescribir
                </button>
              </>
            ) : (
              <button onClick={handlePick} className={`flex-1 rounded-lg py-2 text-xs font-medium flex items-center justify-center gap-1.5 ${occupied ? "bg-sky-600 hover:bg-sky-500 text-white" : "bg-sky-600 hover:bg-sky-500 text-white"}`}>
                <Plus className="w-3.5 h-3.5" /> {occupied ? "Sobrescribir" : "Nueva partida"}
              </button>
            )}
            {occupied && confirmDelete && (
              <button onClick={() => { onDelete(index); setConfirmDelete(false); }} className="rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-2 text-xs text-white"><Trash2 className="w-3.5 h-3.5" /></button>
            )}
            {occupied && !confirmDelete && (
              <button onClick={() => setConfirmDelete(true)} className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2 text-xs text-slate-200"><Trash2 className="w-3.5 h-3.5" /></button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function SaveSlotsModal({ mode, slots, onPick, onDelete, onClose }) {
  const title = mode === "new" ? "Nueva partida" : "Cargar partida";
  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-slate-900 border border-sky-700/60 p-6 max-w-2xl w-full"
        style={{ boxShadow: "0 0 40px -10px rgba(56,189,248,0.35)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-sky-300">{title}</h2>
            <p className="text-[11px] text-slate-400">Elige un espacio de guardado. Cada ranura es independiente.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((n, i) => (
            <SlotCard key={n} index={n} slot={slots[i]} mode={mode} onPick={onPick} onDelete={onDelete} />
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-sm text-slate-200">Volver</button>
      </motion.div>
    </div>
  );
}