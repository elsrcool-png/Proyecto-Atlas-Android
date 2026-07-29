import React from "react";
import { motion } from "framer-motion";
import { GIcon } from "@/lib/atlasIcons";
import { RARITIES, statsText, WEAPONS, ARMORS } from "@/lib/atlasLoot";
import { ACCESSORIES } from "@/lib/atlasSkills";

export default function LootRewardModal({ data, onClose }) {
  if (!data) return null;
  const rcolor = data.rarity ? RARITIES[data.rarity]?.color : null;
  const icon = () => {
    switch (data.type) {
      case "none": return "wind"; case "hp": return "heart"; case "energy": return "zap";
      case "gold": return "coin"; case "material": return "gem"; case "consumable": return "package";
      case "equipment": return "sword"; default: return "sparkles";
    }
  };
  const rewardLine = () => {
    switch (data.type) {
      case "none": return "Sin recompensa"; case "hp": return `+${data.amount} de vida`; case "energy": return `+${data.amount} de energía`;
      case "gold": return `+${data.amount} de oro`; case "material": return `${data.name} ×${data.amount || 1}`;
      case "consumable": return data.name; case "equipment": return data.name; default: return "—";
    }
  };
  const itemObj = data.type === "equipment" ? (data.kind === "weapon" ? WEAPONS[data.id] : data.kind === "armor" ? ARMORS[data.id] : ACCESSORIES[data.id]) : null;
  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 backdrop-blur px-4" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className="rounded-2xl bg-slate-900 border border-slate-700 p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 mb-1">Recompensa de combate</p>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Dado del Destino · D10</h3>
        <motion.div initial={{ rotate: [-8, 8, -4, 0], scale: [0.8, 1.1, 1] }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 0.5 }}
          className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 border-2 border-amber-300 flex items-center justify-center shadow-lg">
          <span className="font-display text-3xl text-white drop-shadow">{data.roll}</span>
        </motion.div>
        <p className="text-sm text-slate-300 mb-3">{data.text}</p>
        <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 mb-3">
          <div className="flex items-center justify-center gap-2">
            <GIcon name={icon()} size={22} style={data.type === "gold" ? { color: "#fbbf24" } : data.type === "hp" ? { color: "#34d399" } : data.type === "energy" ? { color: "#f59e0b" } : rcolor ? { color: rcolor } : undefined} />
            <span className="text-base font-semibold" style={{ color: rcolor || "#e2e8f0" }}>{rewardLine()}</span>
          </div>
          {data.rarity && (<p className="mt-1 text-[11px] font-medium uppercase tracking-wider" style={{ color: rcolor }}>{RARITIES[data.rarity]?.name}</p>)}
          {itemObj && (<p className="mt-1 text-[11px] text-slate-400">{statsText(itemObj)}{itemObj.passive ? ` · ${itemObj.passive.desc}` : ""}</p>)}
        </div>
        <button onClick={onClose} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-sm font-medium text-white transition">Continuar</button>
      </motion.div>
    </div>
  );
}