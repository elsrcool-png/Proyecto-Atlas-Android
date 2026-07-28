import React from "react";
import { GIcon } from "@/lib/atlasIcons";

const OPTIONS = [
  { stat: "hp", icon: "heart", label: "Vida", bonus: "+3 HP máximo", cls: "bg-rose-600 hover:bg-rose-500" },
  { stat: "attack", icon: "swords", label: "Ataque", bonus: "+1 ATK", cls: "bg-red-600 hover:bg-red-500" },
  { stat: "defense", icon: "shield", label: "Defensa", bonus: "+1 Física y +1 Mágica", cls: "bg-blue-600 hover:bg-blue-500" },
];

export default function LevelUpModal({ onChoose, onClose }) {
  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4">
      <div className="rounded-2xl bg-slate-900 border border-amber-500/40 p-6 max-w-md w-full text-center">
        <div className="mb-3 flex justify-center"><GIcon name="star" size={48} /></div>
        <h3 className="text-xl font-semibold text-slate-100 mb-1">¡Subiste de nivel!</h3>
        <p className="text-sm text-slate-400 mb-5">Elige una estadística para mejorar:</p>
        <div className="grid grid-cols-1 gap-2.5">
          {OPTIONS.map(o => (
            <button key={o.stat} onClick={() => onChoose(o.stat)} className={`flex items-center justify-between rounded-xl ${o.cls} px-5 py-3 font-medium transition`}>
              <span className="flex items-center gap-2"><GIcon name={o.icon} size={18} /> {o.label}</span>
              <span className="text-sm opacity-90">{o.bonus}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition">Decidir más tarde</button>
      </div>
    </div>
  );
}