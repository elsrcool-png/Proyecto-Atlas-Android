import React from "react";
import { getPotion } from "@/lib/atlasShop";
import { NEW_CONSUMABLES } from "@/lib/atlasLoot";
import { ENERGY } from "@/lib/atlasSkillDesign";

function ConsumableCard({ id, name, desc, count, onUse, accent }) { if (count <= 0) return null; return (<div className={`rounded-lg border px-3 py-2.5 ${accent || "border-slate-700 bg-slate-800/40"}`}><div className="flex items-center justify-between"><span className="text-sm text-slate-100">{name}</span><span className="text-[10px] text-slate-400">×{count}</span></div><p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{desc}</p><button onClick={() => onUse(id)} className="mt-2 text-[11px] rounded-lg px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition w-full">Usar</button></div>); }

export default function HubConsumables({ player, onUseConsumable }) {
  const energy = ENERGY[player.class];
  const cons = player.consumables || {};
  const energyEntries = Object.entries(cons).filter(([id, c]) => c > 0 && id.startsWith("en_"));
  const hpEntries = Object.entries(cons).filter(([id, c]) => c > 0 && id.startsWith("hp_") && id !== "hp_s");
  const specialEntries = Object.entries(cons).filter(([id, c]) => c > 0 && NEW_CONSUMABLES[id]);
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div><h3 className="text-xs uppercase tracking-widest text-rose-300 mb-1.5">Pociones de vida</h3><div className="grid sm:grid-cols-2 gap-2"><ConsumableCard id="hp_s" name="Poción pequeña de vida" desc="Restaura 6 de vida (recurso de combate)." count={player.potions || 0} onUse={onUseConsumable} />{hpEntries.map(([id, c]) => { const p = getPotion(id); return <ConsumableCard key={id} id={id} name={p?.name || id} desc={`Restaura ${p?.heal || "?"} de vida`} count={c} onUse={onUseConsumable} />; })}</div></div>
      <div><h3 className="text-xs uppercase tracking-widest text-amber-300 mb-1.5">{energy?.name || "Energía"}</h3><div className="grid sm:grid-cols-2 gap-2">{energyEntries.length === 0 && <p className="text-sm text-slate-500 italic col-span-2">Sin pociones de {energy?.name?.toLowerCase() || "energía"}.</p>}{energyEntries.map(([id, c]) => { const p = getPotion(id); return <ConsumableCard key={id} id={id} name={p?.name || id} desc={`Restaura ${p?.restore || "?"} de ${energy?.name?.toLowerCase() || "energía"}`} count={c} onUse={onUseConsumable} accent="border-amber-700/60 bg-amber-950/20" />; })}</div></div>
      <div><h3 className="text-xs uppercase tracking-widest text-violet-300 mb-1.5">Objetos especiales</h3><div className="grid sm:grid-cols-2 gap-2">{specialEntries.length === 0 && <p className="text-sm text-slate-500 italic col-span-2">Sin objetos especiales.</p>}{specialEntries.map(([id, c]) => (<ConsumableCard key={id} id={id} name={NEW_CONSUMABLES[id].name} desc={NEW_CONSUMABLES[id].desc} count={c} onUse={onUseConsumable} accent="border-violet-700/60 bg-violet-950/20" />))}</div></div>
      <p className="text-[11px] text-slate-500 leading-snug">Los consumibles solo pueden usarse fuera de combate. La poción pequeña de vida también está disponible como acción rápida durante el combate.</p>
    </div>
  );
}