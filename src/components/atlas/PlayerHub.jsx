import React, { useState } from "react";
import { X, ChevronLeft, Coins, Backpack, Sword, FlaskConical, ScrollText, User, Settings as SettingsIcon } from "lucide-react";
import { ENERGY } from "@/lib/atlasSkillDesign";
import { xpToNext } from "@/lib/atlasProgression";
import ChibiSprite from "@/components/atlas/ChibiSprite";
import HubEquipment from "@/components/atlas/hub/HubEquipment";
import HubItems from "@/components/atlas/hub/HubItems";
import HubConsumables from "@/components/atlas/hub/HubConsumables";
import HubMissions from "@/components/atlas/hub/HubMissions";
import HubSheet from "@/components/atlas/hub/HubSheet";
import HubSettings from "@/components/atlas/hub/HubSettings";
import { defaultSettings } from "@/lib/atlasSettings";

const CARDS = [
  { id: "items", label: "Objetos", desc: "Materiales y recursos", Icon: Backpack, color: "text-amber-300", ring: "hover:border-amber-500/60" },
  { id: "equipment", label: "Equipamiento", desc: "Arma, armadura y accesorio", Icon: Sword, color: "text-sky-300", ring: "hover:border-sky-500/60" },
  { id: "consumables", label: "Consumibles", desc: "Pociones y objetos de uso", Icon: FlaskConical, color: "text-rose-300", ring: "hover:border-rose-500/60" },
  { id: "missions", label: "Misiones", desc: "Encargos activos y progreso", Icon: ScrollText, color: "text-violet-300", ring: "hover:border-violet-500/60" },
  { id: "sheet", label: "Hoja de personaje", desc: "Atributos, habilidades y pasivas", Icon: User, color: "text-emerald-300", ring: "hover:border-emerald-500/60" },
  { id: "settings", label: "Configuración", desc: "Pantalla y controles", Icon: SettingsIcon, color: "text-slate-300", ring: "hover:border-slate-500/60" },
];

export default function PlayerHub({ player, region, missions, missionDefs, settings, onUpdateSettings, onUseConsumable, onEquipWeapon, onEquipArmor, onEquipAccessory, onSellWeapon, onSellArmor, onSellAccessory, onSellMaterial, onEquipClassWeapon, onSellClassWeapon, onClose }) {
  const [view, setView] = useState("home");
  const energy = ENERGY[player.class];
  const xpNext = xpToNext(player.level);
  const xpPct = Math.min(100, Math.round(((player.xp || 0) / xpNext) * 100));

  const sectionProps = {
    items: { player, onSellMaterial },
    equipment: { player, onEquipWeapon, onEquipArmor, onEquipAccessory, onSellWeapon, onSellArmor, onSellAccessory, onEquipClassWeapon, onSellClassWeapon },
    consumables: { player, onUseConsumable },
    missions: { missions, missionDefs, region },
    sheet: { player },
    settings: { settings, onChange: onUpdateSettings, onReset: () => onUpdateSettings(defaultSettings()) },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col">
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/90 px-4 py-3 flex items-center justify-between">
        {view !== "home" ? (<button onClick={() => setView("home")} className="flex items-center gap-1.5 text-sm text-slate-200 hover:text-white transition"><ChevronLeft className="w-5 h-5" /> Volver</button>) : (<span className="text-sm font-heading tracking-wide text-slate-100">Centro de Atlas</span>)}
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1.5 -m-1.5" aria-label="Cerrar"><X className="w-5 h-5" /></button>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {view === "home" ? (
          <div className="p-4 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 mb-4">
              <div className="flex items-center gap-3">
                <ChibiSprite race={player.race} cls={player.class} size={64} />
                <div className="min-w-0 flex-1"><h2 className="text-base font-semibold text-slate-100 truncate">{player.race} {player.class}</h2><p className="text-xs text-slate-400">Nivel {player.level} · {energy.name}</p><div className="mt-1.5"><div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5"><span>Experiencia</span><span>{player.xp || 0}/{xpNext}</span></div><div className="h-1.5 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-sky-400 transition-all" style={{ width: `${xpPct}%` }} /></div></div></div>
                <div className="flex flex-col items-end gap-1 shrink-0"><span className="flex items-center gap-1 text-sm text-amber-200 font-medium"><Coins className="w-4 h-4" /> {player.gold || 0}</span><span className="flex items-center gap-1 text-[11px] text-slate-300">{player.hp}/{player.maxHp} <span className="text-rose-400">HP</span></span><span className="flex items-center gap-1 text-[11px] text-slate-300">{player.mp || 0}/{player.maxMp || 0} <span className="text-amber-400">{energy.short}</span></span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CARDS.map(c => (<button key={c.id} onClick={() => setView(c.id)} className={`flex flex-col items-start gap-1 rounded-xl border border-slate-700 bg-slate-800/50 p-3.5 transition ${c.ring}`}><c.Icon className={`w-6 h-6 ${c.color}`} /><span className="text-sm font-medium text-slate-100 leading-tight">{c.label}</span><span className="text-[11px] text-slate-400 leading-snug">{c.desc}</span></button>))}
            </div>
            <button onClick={onClose} className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 text-sm font-medium text-slate-100 flex items-center justify-center gap-2 transition"><X className="w-4 h-4" /> Cerrar menú</button>
          </div>
        ) : (
          <div className="pb-2"><div className="px-4 pt-3 max-w-2xl mx-auto"><h2 className="text-base font-semibold text-slate-100">{CARDS.find(c => c.id === view)?.label}</h2></div>{view === "items" && <HubItems {...sectionProps.items} />}{view === "equipment" && <HubEquipment {...sectionProps.equipment} />}{view === "consumables" && <HubConsumables {...sectionProps.consumables} />}{view === "missions" && <HubMissions {...sectionProps.missions} />}{view === "sheet" && <HubSheet {...sectionProps.sheet} />}{view === "settings" && <HubSettings {...sectionProps.settings} />}<div className="px-4 pt-4 pb-6 max-w-2xl mx-auto"><button onClick={() => setView("home")} className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 text-sm font-medium text-slate-100 flex items-center justify-center gap-2 transition"><ChevronLeft className="w-4 h-4" /> Volver al menú</button></div></div>
        )}
      </div>
    </div>
  );
}