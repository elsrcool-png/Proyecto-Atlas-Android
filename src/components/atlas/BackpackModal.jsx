import React from "react";
import { X, Gem, Coins, ScrollText, Sparkles } from "lucide-react";
import { ACCESSORIES, RARITY_COLOR, getBonuses } from "@/lib/atlasSkills";
import { OFFENSIVE_STAT } from "@/lib/atlasSkillDesign";
import { getPotion } from "@/lib/atlasShop";
import { NEW_CONSUMABLES } from "@/lib/atlasLoot";

export default function BackpackModal({ player, onEquip, onDiscard, onUseConsumable, onClose }) {
  const inventory = player.accessoryInventory || [];
  const questItems = Object.entries(player.questItems || {}).filter(([, count]) => count > 0);
  const relics = Object.values(player.relics || {}).filter(Boolean);
  const bonus = getBonuses(player);
  const potionRows = [
    { id: "hp_s", name: "Poción pequeña de vida", desc: "Restaura 6 de vida", count: player.potions || 0 },
    ...Object.entries(player.consumables || {}).filter(([, c]) => c > 0).map(([id, c]) => {
      if (NEW_CONSUMABLES[id]) return { id, name: NEW_CONSUMABLES[id].name, desc: NEW_CONSUMABLES[id].desc, count: c };
      const pot = getPotion(id);
      return { id, name: pot?.name || id, desc: pot?.heal ? `Restaura ${pot.heal} de vida` : `Restaura ${pot?.restore || "?"} de energía`, count: c };
    }),
  ];
  const questItemName = (id) => ({
    kit_viaje_basico: "Kit de viaje básico",
    amuleto_explorador: "Amuleto del explorador",
    suministros_caravana: "Suministros de la caravana",
    contrato_companero_verde: "Contrato de compañero verde",
    sello_piedra: "Sello de piedra",
    fragmento_mapa_antiguo_1: "Primer fragmento del mapa antiguo",
    reliquia_menor_verde: "Reliquia menor verde",
    reliquia_menor_defensiva: "Reliquia menor defensiva",
    restos_guardian_verde: "Restos del arma del Guardián",
    reliquia_antigua_verde: "Reliquia antigua verde",
    botiquin_explorador: "Botiquín del explorador",
    reliquia_verde_restaurada: "Reliquia Verde restaurada",
    sello_consejo_verde: "Sello del Consejo Verde",
    llave_santuario_verde: "Llave del Santuario Verde",
    reliquia_equilibrio_verde: "Reliquia de Equilibrio Verde",
  }[id] || id.replaceAll("_", " "));

  const renderBonus = (b) => {
    const off = OFFENSIVE_STAT[player.class] || OFFENSIVE_STAT.Guerrero;
    const parts = [];
    if (b.atk) parts.push(`+${b.atk} ${off.short}`);
    if (b.def) parts.push(`+${b.def} Def. Física`);
    if (b.magDef) parts.push(`+${b.magDef} Def. Mágica`);
    if (b.maxHp) parts.push(`+${b.maxHp} Vida`);
    return parts.join(" · ");
  };

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4 py-6" onClick={onClose}>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 max-w-md w-full p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3"><h2 className="flex items-center gap-2 text-base font-semibold text-slate-100"><Gem className="w-5 h-5 text-amber-300" /> Mochila</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button></div>
        <div className="flex items-center justify-between mb-3"><p className="text-[11px] text-slate-400">Bonificaciones activas: <span className="text-emerald-300">{renderBonus(bonus)}</span></p><span className="flex items-center gap-1 text-xs text-amber-200"><Coins className="w-3.5 h-3.5" /> {player.gold || 0}</span></div>
        {potionRows.some(p => p.count > 0) && (
          <div className="mb-3">
            <h3 className="text-[11px] uppercase tracking-widest text-rose-300 mb-2">Pociones</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {potionRows.filter(p => p.count > 0).map(p => (
                <div key={p.id} className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
                  <div className="flex items-center justify-between"><span className="text-sm text-slate-100">{p.name}</span><span className="text-[10px] text-slate-400">x{p.count}</span></div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                  <button onClick={() => onUseConsumable?.(p.id)} className="mt-2 text-[10px] rounded px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white transition">Usar</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {(questItems.length > 0 || relics.length > 0) && (
          <div className="mb-3 space-y-2">
            {questItems.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-widest text-sky-300 mb-2 flex items-center gap-1"><ScrollText className="w-3 h-3" /> Objetos de campaña</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {questItems.map(([id, count]) => (
                    <div key={id} className="rounded-lg border border-sky-900/60 bg-sky-950/20 px-3 py-2">
                      <div className="flex items-center justify-between"><span className="text-[11px] text-sky-100 capitalize">{questItemName(id)}</span><span className="text-[10px] text-slate-400">x{count}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {relics.length > 0 && (
              <div>
                <h3 className="text-[11px] uppercase tracking-widest text-emerald-300 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Reliquias</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {relics.map((relic, index) => (
                    <div key={`${relic.name || "reliquia"}-${index}`} className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 px-3 py-2">
                      <p className="text-[11px] text-emerald-100">{relic.name || "Reliquia desconocida"}</p>
                      <p className="text-[9px] uppercase tracking-wider text-emerald-400 mt-0.5">{relic.state || "obtenida"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {(player.accessory || player.accessory2) && (
          <div className="grid sm:grid-cols-2 gap-2 mb-3">
            {[{ id: player.accessory, slot: 1, label: "Accesorio I" }, { id: player.accessory2, slot: 2, label: "Accesorio II" }].map(e => e.id && ACCESSORIES[e.id] ? (<div key={e.slot} className={`rounded-lg border px-3 py-2 ${RARITY_COLOR[ACCESSORIES[e.id].rarity]} bg-slate-800/60`}><div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">{e.label}</span><button onClick={() => onEquip(e.id, e.slot)} className="text-[10px] text-slate-200 underline">Desequipar</button></div><p className="text-sm font-medium mt-1">{ACCESSORIES[e.id].name}</p></div>) : null)}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
          {inventory.length === 0 && <p className="text-xs text-slate-500 col-span-2">La mochila está vacía. Abre cofres y derrota jefes para obtener accesorios.</p>}
          {inventory.map(id => { const a = ACCESSORIES[id]; if (!a) return null; const equipped1 = player.accessory === id; const equipped2 = player.accessory2 === id; return (<div key={id} className={`rounded-lg border px-3 py-2 ${(equipped1 || equipped2) ? RARITY_COLOR[a.rarity] + " ring-1 ring-amber-400" : "border-slate-700 bg-slate-800/40"}`}><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-100">{a.name}</span><span className={`text-[9px] uppercase tracking-wider ${RARITY_COLOR[a.rarity].split(" ")[0]}`}>{a.rarity}</span></div><p className="text-[11px] text-slate-400 mt-0.5">{a.desc}</p><div className="flex flex-wrap gap-1.5 mt-2"><button onClick={() => onEquip(id, 1)} className={`text-[10px] rounded px-2 py-1 font-medium transition ${equipped1 ? "bg-slate-700 text-slate-300" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>{equipped1 ? "Quitar I" : "Equipar I"}</button><button onClick={() => onEquip(id, 2)} disabled={!player.equipmentUnlocks?.accessory2} className={`text-[10px] rounded px-2 py-1 font-medium transition ${!player.equipmentUnlocks?.accessory2 ? "bg-slate-700 text-slate-500" : equipped2 ? "bg-slate-700 text-slate-300" : "bg-violet-600 hover:bg-violet-500 text-white"}`}>{!player.equipmentUnlocks?.accessory2 ? "II bloqueado" : equipped2 ? "Quitar II" : "Equipar II"}</button><button onClick={() => onDiscard(id)} className="text-[10px] rounded px-2 py-1 bg-rose-700 hover:bg-rose-600 text-white transition">Descartar</button></div></div>); })}
        </div>
      </div>
    </div>
  );
}