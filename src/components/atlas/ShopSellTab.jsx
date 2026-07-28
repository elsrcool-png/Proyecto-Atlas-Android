import React from "react";
import { RARITIES, ARMORS, HELMETS, MATERIALS, isSellable, sellValueOf } from "@/lib/atlasLoot";
import { ACCESSORIES, RARITY_SELLABLE, RARITY_VALUE } from "@/lib/atlasSkills";
import { weaponDisplayData } from "@/lib/atlasWeaponInstances";

function Row({ name, rarity, desc, value, onSell, canSell }) {
  const rcolor = RARITIES[rarity]?.color;
  return (<div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2"><div className="min-w-0 mr-2"><p className="text-sm truncate" style={{ color: rcolor }}>{name}</p>{desc && <p className="text-[11px] text-slate-400 truncate">{desc}</p>}</div>{canSell ? <button onClick={onSell} className="text-xs rounded px-3 py-1.5 font-medium whitespace-nowrap bg-amber-600 hover:bg-amber-500 text-white">Vender +{value}</button> : <span className="text-[11px] text-slate-500 whitespace-nowrap">No vendible</span>}</div>);
}

export default function ShopSellTab({ player, onSellWeapon, onSellArmor, onSellHelmet, onSellAccessory, onSellMaterial }) {
  const wInv = (player.weaponInventory || []).map(raw => { const uid = typeof raw === "string" ? raw : raw?.uid; const data = weaponDisplayData(player, uid); return data ? { uid, data } : null; }).filter(Boolean);
  const aInv = (player.armorInventory || []).filter(id => ARMORS[id]);
  const hInv = (player.helmetInventory || []).filter(id => HELMETS[id]);
  const accInv = (player.accessoryInventory || []).filter(id => ACCESSORIES[id]);
  const mats = Object.entries(player.materials || {}).filter(([, n]) => n > 0);
  const empty = wInv.length === 0 && aInv.length === 0 && hInv.length === 0 && accInv.length === 0 && mats.length === 0;

  return (
    <div className="space-y-3">
      {empty && <p className="text-sm text-slate-500 italic">No tienes objetos vendibles. Explora y derrota enemigos para encontrar botín.</p>}
      {wInv.length > 0 && (<div><h3 className="text-[11px] uppercase tracking-widest text-slate-400 mb-1.5">Armas</h3><div className="space-y-1.5">{wInv.map(w => { const def = w.data; const canSell = def.sellable !== false && isSellable(def.rarity); return <Row key={w.uid} name={def.name} rarity={def.rarity} desc={def.quality ? `${def.quality} · ${def.instance?.rollTotal || ""}` : undefined} value={sellValueOf(def.rarity)} canSell={canSell} onSell={() => onSellWeapon?.(w.uid)} />; })}</div></div>)}
      {aInv.length > 0 && (<div><h3 className="text-[11px] uppercase tracking-widest text-slate-400 mb-1.5">Armaduras</h3><div className="space-y-1.5">{aInv.map(id => { const a = ARMORS[id]; return <Row key={id} name={a.name} rarity={a.rarity} value={sellValueOf(a.rarity)} canSell={isSellable(a.rarity)} onSell={() => onSellArmor?.(id)} />; })}</div></div>)}
      {hInv.length > 0 && (<div><h3 className="text-[11px] uppercase tracking-widest text-slate-400 mb-1.5">Cascos</h3><div className="space-y-1.5">{hInv.map(id => { const h = HELMETS[id]; return <Row key={id} name={h.name} rarity={h.rarity} desc={h.desc} value={sellValueOf(h.rarity)} canSell={isSellable(h.rarity)} onSell={() => onSellHelmet?.(id)} />; })}</div></div>)}
      {accInv.length > 0 && (<div><h3 className="text-[11px] uppercase tracking-widest text-slate-400 mb-1.5">Accesorios</h3><div className="space-y-1.5">{accInv.map(id => { const a = ACCESSORIES[id]; return <Row key={id} name={a.name} rarity={a.rarity} desc={a.desc} value={RARITY_VALUE[a.rarity] || 0} canSell={RARITY_SELLABLE[a.rarity]} onSell={() => onSellAccessory?.(id)} />; })}</div></div>)}
      {mats.length > 0 && (<div><h3 className="text-[11px] uppercase tracking-widest text-slate-400 mb-1.5">Materiales</h3><div className="space-y-1.5">{mats.map(([id, n]) => { const m = MATERIALS[id]; if (!m) return null; return <Row key={id} name={`${m.name} ×${n}`} rarity={m.rarity} value={m.price} canSell onSell={() => onSellMaterial?.(id)} />; })}</div></div>)}
      <p className="text-[10px] text-slate-500 leading-snug">El mercader compra tu equipo y materiales no deseados. Los objetos legendarios no se pueden vender.</p>
    </div>
  );
}