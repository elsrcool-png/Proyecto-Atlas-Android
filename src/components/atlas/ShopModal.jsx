import React, { useState } from "react";
import { X, Coins, Heart, Zap } from "lucide-react";
import { HP_POTIONS, energyPotionsFor } from "@/lib/atlasShop";
import { ENERGY } from "@/lib/atlasSkillDesign";
import { shopEquipmentForTier, RARITIES, statsText, WEAPONS, ARMORS, HELMETS } from "@/lib/atlasLoot";
import { ACCESSORIES, CLASS_OFF_TYPE } from "@/lib/atlasSkills";
import { GIcon } from "@/lib/atlasIcons";
import ShopSellTab from "@/components/atlas/ShopSellTab";

const SIZES_BY_TIER = { camp: ["Pequeña"], town: ["Pequeña", "Mediana"], city: ["Pequeña", "Mediana", "Grande"] };
const TITLE_BY_TIER = { camp: "Mercader del campamento", town: "Mercader del pueblo", city: "Mercader de la ciudad" };

export default function ShopModal({ player, onBuy, onBuyEquipment, onSellWeapon, onSellArmor, onSellHelmet, onSellAccessory, onSellMaterial, onClose, tier = "city", regionId = "verde", worldFlags = {} }) {
  const [tab, setTab] = useState("buy");
  const allowed = SIZES_BY_TIER[tier] || SIZES_BY_TIER.city;
  const enPots = energyPotionsFor(player.class).filter(p => allowed.includes(p.size));
  const energy = ENERGY[player.class];
  const gold = player.gold || 0;
  const equipList = shopEquipmentForTier(tier, ACCESSORIES, regionId, worldFlags).filter(e => e.kind !== "helmet" || player.equipmentUnlocks?.helmet);

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4 py-6" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 max-w-md w-full p-5 max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3"><h2 className="flex items-center gap-2 text-base font-semibold text-slate-100"><Coins className="w-5 h-5 text-amber-300" /> {TITLE_BY_TIER[tier] || "Tienda del mercader"}</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button></div>
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex gap-2"><button onClick={() => setTab("buy")} className={`rounded-lg px-3 py-1.5 font-medium ${tab === "buy" ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>Comprar</button><button onClick={() => setTab("sell")} className={`rounded-lg px-3 py-1.5 font-medium ${tab === "sell" ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>Vender</button></div>
          <span className="flex items-center gap-1 text-amber-200"><Coins className="w-3.5 h-3.5" /> {gold}</span>
        </div>
        {tab === "buy" ? (
          <>
            <h3 className="text-[11px] uppercase tracking-widest text-rose-300 mb-2 flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> Pociones de vida</h3>
            <div className="space-y-2 mb-4">
              {HP_POTIONS.filter(p => allowed.includes(p.size)).map(p => { const owned = p.id === "hp_s" ? (player.potions || 0) : (player.consumables?.[p.id] || 0); const aff = gold >= p.price; return (<div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2"><div className="min-w-0"><p className="text-sm text-slate-100">{p.name}</p><p className="text-[11px] text-slate-400">Restaura {p.heal} de vida · tienes {owned}</p></div><button onClick={() => onBuy(p.id)} disabled={!aff} className={`text-xs rounded px-3 py-1.5 font-medium whitespace-nowrap ${aff ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}>{p.price} oro</button></div>); })}
            </div>
            <h3 className="text-[11px] uppercase tracking-widest text-amber-300 mb-2 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Pociones de {energy?.name || "energía"}</h3>
            <div className="space-y-2">
              {enPots.map(p => { const owned = player.consumables?.[p.id] || 0; const aff = gold >= p.price; return (<div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2"><div className="min-w-0"><p className="text-sm text-slate-100">{p.name}</p><p className="text-[11px] text-slate-400">Restaura {p.restore} de {energy?.name || "energía"} · tienes {owned}</p></div><button onClick={() => onBuy(p.id)} disabled={!aff} className={`text-xs rounded px-3 py-1.5 font-medium whitespace-nowrap ${aff ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}>{p.price} oro</button></div>); })}
            </div>
            <h3 className="text-[11px] uppercase tracking-widest text-violet-300 mb-2 flex items-center gap-1 mt-4"><GIcon name="sword" size={14} /> Equipamiento {tier === "camp" ? "básico" : tier === "town" ? "común" : "raro y épico"}</h3>
            <div className="space-y-2 mb-3">
              {equipList.map(e => {
                const levelOk = (player.level || 1) >= (e.requiredLevel || 1);
                const rc = RARITIES[e.rarity]?.color;
                const ref = e.kind === "weapon" ? WEAPONS[e.id] : e.kind === "armor" ? ARMORS[e.id] : e.kind === "helmet" ? HELMETS[e.id] : ACCESSORIES[e.id];
                const classOk = e.kind !== "weapon" || ref?.offType === CLASS_OFF_TYPE[player.class];
                const affordable = gold >= e.price && levelOk && classOk;
                const kindLabel = e.kind === "helmet" ? "Casco" : e.kind === "weapon" ? "Arma" : e.kind === "armor" ? "Armadura" : "Accesorio";
                const buttonLabel = !classOk ? "Otra clase" : !levelOk ? `Nv. ${e.requiredLevel}` : `${e.price} oro`;
                return (<div key={`${e.kind}-${e.id}`} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2"><div className="min-w-0 mr-2"><p className="text-sm truncate" style={{ color: rc }}>{e.name}</p><p className="text-[11px] text-slate-400 truncate">{statsText(ref)}{ref?.passive ? ` · ${ref.passive.desc}` : ""}</p><p className={`text-[10px] ${levelOk && classOk ? "text-slate-500" : "text-rose-400"}`}>Nivel {e.requiredLevel || 1} · {kindLabel}{e.recommendedClass ? ` · ${e.recommendedClass}` : ""}</p></div><button onClick={() => onBuyEquipment?.(e)} disabled={!affordable} className={`text-xs rounded px-3 py-1.5 font-medium whitespace-nowrap ${affordable ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}>{buttonLabel}</button></div>);
              })}
              {equipList.length === 0 && <p className="text-[11px] text-slate-500 italic">El inventario de este asentamiento aún no está disponible. Completa su cadena narrativa.</p>}
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">Las pociones de vida pequeñas se usan en combate; las medianas/grandes y las de energía se usan desde la mochila en zona segura. Los legendarios nunca se venden en tiendas.</p>
          </>
        ) : (<ShopSellTab player={player} onSellWeapon={onSellWeapon} onSellArmor={onSellArmor} onSellHelmet={onSellHelmet} onSellAccessory={onSellAccessory} onSellMaterial={onSellMaterial} />)}
      </div>
    </div>
  );
}