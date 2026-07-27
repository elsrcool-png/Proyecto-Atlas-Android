import React from "react";
import { X, Lock, Star, Gem, Sparkles, Sword } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";
import { ACCESSORIES, RARITY_COLOR, getBonuses } from "@/lib/atlasSkills";
import { getSkillSet, ENERGY, OFFENSIVE_STAT } from "@/lib/atlasSkillDesign";
import { getWeaponAbility, CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { ARMORS, RARITIES, statsText } from "@/lib/atlasLoot";
import { DICE_GROUPS } from "@/lib/atlasDiceSystem";
import ChibiSprite from "./ChibiSprite";

const SLOT_DICE = { basic: "basico", classAbility: "tecnica", hybrid: "fuerza", weapon: "versatil", definitive: "versatil" };
const STAT_MAP = { attack: "ATK", atk: "ATK", arcane: "Poder Arcano", precision: "Precisión", physDef: "Def. Física", magDef: "Def. Mágica", defense: "DEF", def: "DEF", maxHp: "Vida", maxMp: "Energía", crit: "Crít", speed: "Mov", hit: "Prec" };

function formatStats(stats) { if (!stats) return ""; return Object.entries(stats).map(([k, v]) => { const lbl = STAT_MAP[k] || k; const val = (k === "crit" || k === "hit") ? Math.round(v * 100) + "%" : v; return `+${val} ${lbl}`; }).join(" · "); }
function StatBlock({ label, base, bonus, icon }) { return (<div className="rounded-lg bg-slate-800/60 py-2 px-2"><div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div><div className="text-lg font-semibold text-slate-100"><GIcon name={icon} size={16} className="inline align-text-bottom" /> {base + bonus}{bonus > 0 && <span className="text-xs text-emerald-400 ml-1">(+{bonus})</span>}</div></div>); }
function EquipRow({ label, icon, name, rarity, stats, ability, empty }) { const color = rarity ? RARITIES[rarity]?.color : "#fbbf24"; return (<div className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2"><p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>{empty ? <p className="text-sm text-slate-500 italic">Vacío</p> : (<div><p className="text-sm font-medium truncate" style={{ color }}>{name}</p>{stats && <p className="text-[11px] text-slate-400">{stats}</p>}{ability && <p className="text-[11px] text-fuchsia-300 mt-0.5">⚔ {ability}</p>}</div>)}</div>); }
function effectText(effect) { if (!effect) return null; const parts = []; if (effect.hits === "roll") parts.push("Nº de golpes según el dado"); else if (typeof effect.hits === "number" && effect.hits > 1) parts.push(`${effect.hits} golpes`); if (effect.ignoreDef === "highroll") parts.push("Ignora defensa si el dado es alto"); else if (typeof effect.ignoreDef === "number" && effect.ignoreDef > 0) parts.push(`Ignora ${Math.round(effect.ignoreDef * 100)}% defensa`); if (effect.crit === "always") parts.push("Siempre crítico"); else if (effect.crit === "highroll") parts.push("Crítico si el dado es alto"); if (effect.power && effect.power !== 1) parts.push(`Potencia ×${effect.power}`); if (effect.stun) parts.push("Puede aturdir"); if (effect.debuff) parts.push("Reduce poder mágico enemigo"); if (effect.element === "random") parts.push("Elemento aleatorio"); if (effect.summon) parts.push("Invoca familiar"); return parts.length ? parts.join(" · ") : null; }
function SkillRow({ skill, level, energy, slotKey }) { if (!skill) return null; const locked = level < skill.unlock; const dgKey = skill.diceGroup || SLOT_DICE[slotKey]; const dg = dgKey ? DICE_GROUPS[dgKey] : null; const eff = effectText(skill.effect); return (<div className={`rounded-lg border px-3 py-2.5 ${locked ? "bg-slate-900/40 border-slate-800 opacity-60" : "bg-slate-800/60 border-slate-700"}`}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-slate-100">{skill.name}</span>{locked ? (<span className="flex items-center gap-1 text-[10px] text-slate-500"><Lock className="w-3 h-3" /> Nv {skill.unlock}</span>) : (<span className="text-[10px] text-emerald-400 font-medium">Desbloqueada</span>)}</div><p className="text-[11px] text-slate-400 leading-snug">{skill.desc}</p><div className="flex flex-wrap items-center gap-2 mt-1.5"><p className="text-[9px] uppercase tracking-wider text-slate-500">{skill.kind}</p>{skill.cost != null && !locked && <span className="text-[9px] text-amber-300 font-mono">{skill.cost} {energy?.short || ""}</span>}{dg && <span className="text-[9px] text-sky-300 font-mono">🎲 {dg.label}</span>}</div>{eff && <p className="text-[10px] text-fuchsia-200 mt-1 leading-snug">⚔ {eff}</p>}</div>); }

export default function CharacterSheet({ player, missionsDone, onEquip, onClose }) {
  const skills = getSkillSet(player);
  const energy = ENERGY[player.class];
  const offStat = OFFENSIVE_STAT[player.class] || OFFENSIVE_STAT.Guerrero;
  const bonus = getBonuses(player);
  const inventory = player.accessoryInventory || [];
  const weaponAbility = getWeaponAbility(player);
  const cw = player.classWeapon ? CLASS_WEAPONS[player.classWeapon] : null;
  const ar = player.armor ? ARMORS[player.armor] : null;
  const ac = player.accessory ? ACCESSORIES[player.accessory] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4 py-6 overflow-y-auto" onClick={onClose}>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 max-w-lg w-full p-6 my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3"><ChibiSprite race={player.race} cls={player.class} size={56} /><div><h2 className="text-lg font-semibold text-slate-100">{player.race} {player.class}</h2><p className="text-xs text-slate-400 flex items-center gap-1"><GIcon name={player.raceIcon} size={12} /> Nivel {player.level} · Experiencia {player.xp || 0}</p></div></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          <StatBlock label={offStat.name} base={player.baseAttack ?? player.attack} bonus={bonus.atk} icon={offStat.icon} />
          <StatBlock label="Vida" base={player.baseMaxHp ?? player.maxHp} bonus={bonus.maxHp} icon="heart" />
          <StatBlock label="Def. Física" base={player.baseDefense ?? player.defense} bonus={bonus.def} icon="shield" />
          <StatBlock label="Def. Mágica" base={player.baseMagicalDefense ?? player.baseDefense ?? player.defense} bonus={bonus.magDef || 0} icon="shield" />
          <StatBlock label="Energía" base={player.baseMaxMp ?? player.maxMp} bonus={bonus.maxMp} icon="zap" />
        </div>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-300 mb-2"><Sword className="w-3.5 h-3.5" /> Equipamiento</h3>
          <div className="grid grid-cols-1 gap-1.5">
            <EquipRow label="Arma" name={cw?.name} stats={cw ? statsText(cw) : null} ability={cw ? `${cw.ability.name} · ${cw.ability.cost} ${energy?.short || "energía"}` : null} empty={!cw} />
            <EquipRow label="Armadura" name={ar?.name} rarity={ar?.rarity} stats={ar ? statsText(ar) : null} empty={!ar} />
            <EquipRow label="Accesorio" name={ac?.name} rarity={ac?.rarity} stats={ac ? statsText(ac) : null} empty={!ac} />
          </div>
        </div>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-sky-300 mb-2"><Sparkles className="w-3.5 h-3.5" /> Habilidades</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <SkillRow skill={skills.basic} level={player.level} energy={energy} slotKey="basic" />
            <SkillRow skill={weaponAbility} level={player.level} energy={energy} slotKey="weapon" />
            <SkillRow skill={skills.classAbility} level={player.level} energy={energy} slotKey="classAbility" />
            <SkillRow skill={skills.hybrid} level={player.level} energy={energy} slotKey="hybrid" />
            <SkillRow skill={skills.definitive} level={player.level} energy={energy} slotKey="definitive" />
          </div>
        </div>
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-violet-300 mb-2"><Star className="w-3.5 h-3.5" /> Pasivas</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <SkillRow skill={skills.racePassive} level={player.level} energy={energy} slotKey="" />
            <SkillRow skill={skills.classPassive} level={player.level} energy={energy} slotKey="" />
          </div>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-300 mb-2"><Gem className="w-3.5 h-3.5" /> Accesorios</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {inventory.length === 0 && <p className="text-xs text-slate-500 col-span-2">Sin accesorios. Derrota jefes para obtener botín legendario.</p>}
            {inventory.map(id => { const a = ACCESSORIES[id]; const equipped = player.accessory === id; return (<button key={id} onClick={() => onEquip(id)} className={`text-left rounded-lg border px-3 py-2 transition ${equipped ? RARITY_COLOR[a.rarity] + " ring-1 ring-amber-400" : "border-slate-700 bg-slate-800/40 hover:bg-slate-800/70"}`}><div className="flex items-center justify-between"><span className="text-sm font-medium">{a.name}</span><span className="text-[9px] uppercase tracking-wider">{a.rarity}</span></div><p className="text-[11px] text-slate-400 mt-0.5">{a.desc}</p><p className="text-[10px] text-emerald-400 mt-1">{formatStats(a.bonus)}</p></button>); })}
          </div>
        </div>
      </div>
    </div>
  );
}