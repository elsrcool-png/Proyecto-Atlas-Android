import React from "react";
import { Lock, Star, Sparkles } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";
import { getBonuses } from "@/lib/atlasSkills";
import { getSkillSet, ENERGY, OFFENSIVE_STAT } from "@/lib/atlasSkillDesign";
import { getWeaponAbility } from "@/lib/atlasWeapons";
import { DICE_GROUPS } from "@/lib/atlasDiceSystem";
import ChibiSprite from "../ChibiSprite";

function Stat({ label, base, bonus, icon }) { return (<div className="rounded-lg bg-slate-800/60 py-2 px-2 text-center"><div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div><div className="text-lg font-semibold text-slate-100"><GIcon name={icon} size={16} className="inline align-text-bottom" /> {base + bonus}{bonus > 0 && <span className="text-xs text-emerald-400 ml-1">(+{bonus})</span>}</div></div>); }
function SkillRow({ skill, level, energy, diceLabel }) { if (!skill) return null; const locked = level < skill.unlock; return (<div className={`rounded-lg border px-3 py-2.5 ${locked ? "bg-slate-900/40 border-slate-800 opacity-60" : "bg-slate-800/60 border-slate-700"}`}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-slate-100">{skill.name}</span>{locked ? <span className="flex items-center gap-1 text-[10px] text-slate-500"><Lock className="w-3 h-3" /> Nv {skill.unlock}</span> : <span className="text-[10px] text-emerald-400 font-medium">Desbloqueada</span>}</div><p className="text-[11px] text-slate-400 leading-snug">{skill.desc}</p><div className="flex items-center justify-between mt-1"><p className="text-[9px] uppercase tracking-wider text-slate-500">{skill.kind}</p><div className="flex items-center gap-2">{diceLabel && !locked && <span className="text-[9px] text-sky-400 font-mono">{diceLabel}</span>}{skill.cost != null && !locked && <span className="text-[9px] text-amber-300 font-mono">{skill.cost} {energy?.short || ""}</span>}</div></div></div>); }

export default function HubSheet({ player }) {
  const skills = getSkillSet(player);
  const weaponAbility = getWeaponAbility(player);
  const energy = ENERGY[player.class];
  const bonus = getBonuses(player);
  const offStat = OFFENSIVE_STAT[player.class] || OFFENSIVE_STAT.Guerrero;
  const activeEffects = player.passives || [];
  const weaponDice = weaponAbility ? DICE_GROUPS[weaponAbility.diceGroup]?.label : null;
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/40 p-3"><ChibiSprite race={player.race} cls={player.class} size={56} /><div><h2 className="text-base font-semibold text-slate-100">{player.race} {player.class}</h2><p className="text-xs text-slate-400 flex items-center gap-1"><GIcon name={player.raceIcon} size={12} /> Nivel {player.level} · {energy.name}</p></div></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Stat label={offStat.name} base={player.baseAttack ?? player.attack} bonus={bonus.atk} icon={offStat.icon} />
        <Stat label="Vida" base={player.baseMaxHp ?? player.maxHp} bonus={bonus.maxHp} icon="heart" />
        <Stat label="Def. Física" base={player.baseDefense ?? player.defense} bonus={bonus.def} icon="shield" />
        <Stat label="Def. Mágica" base={player.baseMagicalDefense ?? player.baseDefense ?? player.defense} bonus={bonus.magDef || 0} icon="shield" />
        <Stat label="Energía máx." base={player.baseMaxMp ?? player.maxMp} bonus={bonus.maxMp} icon="zap" />
        <Stat label="Crítico" base={0} bonus={Math.round((bonus.crit || 0) * 100)} icon="sparkles" />
      </div>
      <div><h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-sky-300 mb-2"><Sparkles className="w-3.5 h-3.5" /> Habilidades</h3><div className="grid sm:grid-cols-2 gap-2"><SkillRow skill={skills.basic} level={player.level} energy={energy} /><SkillRow skill={weaponAbility} level={player.level} energy={energy} diceLabel={weaponDice} /><SkillRow skill={skills.classAbility} level={player.level} energy={energy} /><SkillRow skill={skills.hybrid} level={player.level} energy={energy} /><SkillRow skill={skills.definitive} level={player.level} energy={energy} /></div></div>
      <div><h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-violet-300 mb-2"><Star className="w-3.5 h-3.5" /> Pasivas</h3><div className="grid sm:grid-cols-2 gap-2"><SkillRow skill={skills.racePassive} level={player.level} energy={energy} /><SkillRow skill={skills.classPassive} level={player.level} energy={energy} /></div></div>
      <div><h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-300 mb-2"><Sparkles className="w-3.5 h-3.5" /> Efectos activos</h3>{activeEffects.length === 0 ? <p className="text-sm text-slate-500 italic">Ningún efecto de equipo activo.</p> : (<div className="space-y-1.5">{activeEffects.map((p, i) => (<div key={i} className="rounded-lg border border-amber-700/40 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-100">{p.desc || p.type || "Efecto"}</div>))}</div>)}</div>
    </div>
  );
}