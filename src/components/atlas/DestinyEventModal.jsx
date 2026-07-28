import React from "react";
import { motion } from "framer-motion";
import { GIcon } from "@/lib/atlasIcons";

export default function DestinyEventModal({ data, onClose }) {
  if (!data || !data.event) return null;
  const { event, rewards = [] } = data;
  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur px-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="rounded-2xl bg-gradient-to-b from-fuchsia-950/80 to-slate-900 border border-fuchsia-600/60 p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-3"><GIcon name="sparkles" size={44} style={{ color: "#e9d5ff" }} /></div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-300 mb-1">Destino de Atlas</p>
        <h3 className="text-xl font-semibold text-fuchsia-100 mb-2">{event.name}</h3>
        <p className="text-sm text-fuchsia-200/90 italic mb-4 leading-relaxed">{event.desc}</p>
        <div className="rounded-xl border border-fuchsia-700/50 bg-slate-900/60 px-4 py-3 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-fuchsia-300 mb-1.5">Recompensas</p>
          <ul className="space-y-1">
            {rewards.length === 0 && <li className="text-sm text-slate-400">—</li>}
            {rewards.map((r, i) => <li key={i} className="text-sm text-slate-100">{r.text}</li>)}
          </ul>
        </div>
        <button onClick={onClose} className="w-full rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 py-2.5 text-sm font-medium text-white transition">Aceptar el destino</button>
      </motion.div>
    </div>
  );
}