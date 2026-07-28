import React from "react";
import { RARITIES, MATERIALS, COMMON_MATERIALS, RARE_MATERIALS } from "@/lib/atlasLoot";

function MatRow({ id, count }) { const m = MATERIALS[id]; if (!m) return null; return (<div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2"><div className="min-w-0"><p className="text-sm truncate" style={{ color: RARITIES[m.rarity]?.color }}>{m.name}</p><p className="text-[10px] text-slate-500">×{count}</p></div></div>); }

export default function HubItems({ player }) {
  const mats = Object.entries(player.materials || {}).filter(([, n]) => n > 0);
  const commons = mats.filter(([id]) => COMMON_MATERIALS.includes(id));
  const rares = mats.filter(([id]) => RARE_MATERIALS.includes(id));
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div><h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">Materiales comunes</h3>{commons.length === 0 ? <p className="text-sm text-slate-500 italic">Sin materiales comunes.</p> : (<div className="grid sm:grid-cols-2 gap-1.5">{commons.map(([id, n]) => <MatRow key={id} id={id} count={n} />)}</div>)}</div>
      <div><h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">Materiales raros y recursos</h3>{rares.length === 0 ? <p className="text-sm text-slate-500 italic">Sin materiales raros. Sigue explorando regiones avanzadas.</p> : (<div className="grid sm:grid-cols-2 gap-1.5">{rares.map(([id, n]) => <MatRow key={id} id={id} count={n} />)}</div>)}</div>
      <p className="text-[11px] text-slate-500 leading-snug">Los materiales se obtienen al derrotar enemigos y abrir cofres. Véndelos por oro a través de los comerciantes en sus tiendas.</p>
    </div>
  );
}