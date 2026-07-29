import React from "react";
import ThreatBar from "./ThreatBar";
import { ACCESSORIES, RARITY_COLOR } from "@/lib/atlasSkills";
import { ENERGY, OFFENSIVE_STAT } from "@/lib/atlasSkillDesign";
import { CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { xpToNext, REGION_META } from "@/lib/atlasProgression";
import { Gem, Star, Coins, Sword } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";
import { HELMETS } from "@/lib/atlasLoot";
import ChibiSprite from "./ChibiSprite";

const ENERGY_BAR = { Guerrero: "from-red-500 to-rose-400", Mago: "from-blue-500 to-sky-400", "Pícaro": "from-amber-500 to-yellow-400" };

function Stat({ label, value }) {
  return (<div className="flex flex-col items-center rounded-lg bg-slate-800/60 py-2"><span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span><span className="text-lg font-semibold text-slate-100">{value}</span></div>);
}

export default function CharacterPanel({ player, threat, onOpenSheet, bossAlive, regionIndex }) {
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  const meta = REGION_META[regionIndex] || REGION_META[0];
  const need = xpToNext(player.level);
  const xpPct = Math.min(100, Math.max(0, ((player.xp || 0) / need) * 100));
  const capped = bossAlive && player.level >= meta.cap;
  const energy = ENERGY[player.class];
  const offStat = OFFENSIVE_STAT[player.class] || OFFENSIVE_STAT.Guerrero;
  const enPct = player.maxMp ? Math.max(0, Math.min(100, ((player.mp || 0) / player.maxMp) * 100)) : 0;
  const energyBar = ENERGY_BAR[player.class] || ENERGY_BAR["Pícaro"];

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 backdrop-blur">
      <div className="flex items-center gap-3 mb-4">
        <ChibiSprite player={player} race={player.race} cls={player.class} size={48} surface="characterPanel" />
        <div className="min-w-0 flex-1">
          <h3 className="text-slate-100 font-semibold leading-tight">{player.race} {player.class}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1"><GIcon name={player.raceIcon} size={12} /> Nivel {player.level ?? 1}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-1">
          <Coins className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-xs font-semibold text-amber-200">{player.gold || 0}</span>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5"><span className="text-[11px] font-medium tracking-widest uppercase text-slate-400">Vida</span><span className="text-xs font-mono text-slate-200">{player.hp}/{player.maxHp}</span></div>
        <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-500 to-red-400 transition-all duration-500" style={{ width: `${hpPct}%` }} /></div>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5"><span className="text-[11px] font-medium tracking-widest uppercase text-slate-400">{energy?.name || "Energía"}</span><span className="text-xs font-mono text-slate-200">{player.mp || 0}/{player.maxMp || 0}</span></div>
        <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full bg-gradient-to-r ${energyBar} transition-all duration-500`} style={{ width: `${enPct}%` }} /></div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5"><span className="text-[11px] font-medium tracking-widest uppercase text-slate-400">Experiencia</span><span className="text-xs font-mono text-slate-300">{player.xp || 0}/{need}</span></div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 transition-all duration-500" style={{ width: `${xpPct}%` }} /></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label={offStat.name} value={player.attack} />
        <Stat label="Def. Física" value={player.physicalDefense ?? player.defense} />
        <Stat label="Def. Mágica" value={player.magicalDefense ?? player.defense} />
      </div>
      {capped && (<div className="mb-3 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 flex items-center gap-2"><GIcon name="lock" size={14} /><span className="text-[11px] text-rose-200">Nivel máximo de la región ({meta.cap}). Derrota al jefe para seguir avanzando.</span></div>)}
      <p className="text-[11px] text-sky-300/80 bg-sky-950/30 rounded-lg px-3 py-2 mb-4 italic">{player.skill}</p>
      {player.statPoints > 0 && (<div className="mb-4 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-2 text-center"><span className="text-xs text-amber-300 font-medium flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5" /> {player.statPoints} punto(s) de estadística</span></div>)}
      {player.classWeapon && CLASS_WEAPONS[player.classWeapon] && (
        <div className="mb-3 rounded-lg border border-amber-600/40 px-3 py-2 bg-amber-950/20">
          <div className="flex items-center gap-2"><Sword className="w-3.5 h-3.5 text-amber-300" /><span className="text-[11px] font-medium text-amber-100">{CLASS_WEAPONS[player.classWeapon].name}</span><span className="text-[9px] uppercase tracking-wider ml-auto text-slate-400">{CLASS_WEAPONS[player.classWeapon].rarity}</span></div>
          <p className="text-[10px] text-fuchsia-200/80 mt-0.5">⚔ {CLASS_WEAPONS[player.classWeapon].ability.name}</p>
        </div>
      )}
      {player.helmet && HELMETS[player.helmet] && (
        <div className="mb-2 rounded-lg border border-slate-700 px-3 py-2 bg-slate-800/40">
          <div className="flex items-center gap-2"><GIcon name="shield" size={14} /><span className="text-[11px] font-medium text-slate-200">{HELMETS[player.helmet].name}</span><span className="text-[9px] uppercase tracking-wider ml-auto text-slate-400">Casco</span></div>
        </div>
      )}
      {[player.accessory, player.accessory2].filter(Boolean).map((id, index) => ACCESSORIES[id] ? (
        <div key={`${id}-${index}`} className={`mb-2 rounded-lg border px-3 py-2 bg-slate-800/40 ${RARITY_COLOR[ACCESSORIES[id].rarity]}`}>
          <div className="flex items-center gap-2"><Gem className="w-3.5 h-3.5" /><span className="text-[11px] font-medium">{ACCESSORIES[id].name}</span><span className="text-[9px] uppercase tracking-wider ml-auto">Acc. {index + 1}</span></div>
        </div>
      ) : null)}
      <button onClick={onOpenSheet} className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2.5 text-xs font-medium text-slate-200 transition mb-4">Hoja de personaje</button>
      <ThreatBar threat={threat} />
    </div>
  );
}