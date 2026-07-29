import React from "react";
import { Check, Lock } from "lucide-react";
import { RARITIES, ARMORS, HELMETS, statsText } from "@/lib/atlasLoot";
import { ACCESSORIES, getBonuses } from "@/lib/atlasSkills";
import { OFFENSIVE_STAT } from "@/lib/atlasSkillDesign";
import { CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { DICE_GROUPS } from "@/lib/atlasDiceSystem";
import { weaponDisplayData } from "@/lib/atlasWeaponInstances";

const STAT_LABELS = { attack: "ATK", defense: "DEF", maxHp: "Vida", maxMp: "Energía", crit: "Crít", speed: "Mov", physDef: "Def. Física", magDef: "Def. Mágica" };
function classWeaponStats(w) { if (!w?.stats) return ""; const offLbl = w.offType === "arcane" ? "Poder Arcano" : w.offType === "precision" ? "Precisión" : "ATK"; return Object.entries(w.stats).map(([k, v]) => { const lbl = k === "attack" ? offLbl : (STAT_LABELS[k] || k); return `+${k === "crit" ? Math.round(v * 100) + "%" : v} ${lbl}`; }).join(" · "); }
function statSum(item) { const s = item?.stats || item?.bonus || {}; return { atk: s.attack || s.atk || 0, physDef: s.physDef || s.def || 0, magDef: s.magDef || 0, maxHp: s.maxHp || 0, maxMp: (s.maxMp || 0) + (item?.maxMp || 0) }; }
function deltaStr(candidate, current) { const a = statSum(candidate), b = statSum(current); const d = { atk: a.atk - b.atk, physDef: a.physDef - b.physDef, magDef: a.magDef - b.magDef, maxHp: a.maxHp - b.maxHp, maxMp: a.maxMp - b.maxMp }; const parts = []; if (d.atk) parts.push(`${d.atk > 0 ? "+" : ""}${d.atk} ofensiva`); if (d.physDef) parts.push(`${d.physDef > 0 ? "+" : ""}${d.physDef} Def. Física`); if (d.magDef) parts.push(`${d.magDef > 0 ? "+" : ""}${d.magDef} Def. Mágica`); if (d.maxHp) parts.push(`${d.maxHp > 0 ? "+" : ""}${d.maxHp} Vida`); if (d.maxMp) parts.push(`${d.maxMp > 0 ? "+" : ""}${d.maxMp} Energía`); return parts.length ? parts.join(" · ") + " vs actual" : "Sin cambios vs actual"; }

function Slot({ label, name, rarity, refItem, onUnequip, extra, statsLine, locked, lockedText }) {
  const rcolor = RARITIES[rarity]?.color;
  return (
    <div className={`rounded-xl border p-3 ${locked ? "border-slate-800 bg-slate-950/40" : "border-slate-700 bg-slate-800/50"}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      {locked ? <div className="flex items-center gap-2 text-slate-500"><Lock className="w-4 h-4" /><p className="text-sm">{lockedText}</p></div>
        : name ? (<div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-sm font-medium truncate" style={{ color: rcolor }}>{name}</p><p className="text-[11px] text-slate-400">{statsLine ?? statsText(refItem)}{refItem?.passive ? ` · ${refItem.passive.desc}` : ""}</p>{extra && <p className="text-[11px] text-fuchsia-300 mt-0.5">{extra}</p>}</div><button onClick={onUnequip} className="text-[11px] rounded-lg bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 text-slate-200 whitespace-nowrap">Quitar</button></div>)
          : <p className="text-sm text-slate-500 italic">Vacío</p>}
    </div>
  );
}

function InvRow({ entry, equipped, currentRef, onEquip }) {
  const rcolor = RARITIES[entry.rarity]?.color;
  return (<div className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-sm font-medium truncate" style={{ color: rcolor }}>{entry.name}</p><p className="text-[11px] text-slate-400">{statsText(entry.ref)}{entry.ref?.passive ? ` · ${entry.ref.passive.desc}` : ""}</p>{!equipped && currentRef && <p className="text-[10px] text-sky-300 mt-0.5">{deltaStr(entry.ref, currentRef)}</p>}</div><div className="flex items-center gap-1.5 shrink-0">{equipped ? <span className="text-[11px] text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Equipado</span> : <button onClick={onEquip} className="text-[11px] rounded-lg bg-sky-700 hover:bg-sky-600 px-2.5 py-1.5 text-white">Equipar</button>}</div></div></div>);
}

function AccessoryRow({ entry, slot1, slot2, secondUnlocked, onEquip }) {
  const rcolor = RARITIES[entry.rarity]?.color;
  return (<div className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2"><p className="text-sm font-medium truncate" style={{ color: rcolor }}>{entry.name}</p><p className="text-[11px] text-slate-400">{statsText(entry.ref)}{entry.ref?.passive ? ` · ${entry.ref.passive.desc}` : ""}</p><div className="flex gap-1.5 mt-2"><button onClick={() => onEquip(entry.id, 1)} className={`text-[11px] rounded-lg px-2.5 py-1.5 ${slot1 ? "bg-emerald-700 text-white" : "bg-sky-700 hover:bg-sky-600 text-white"}`}>{slot1 ? "Equipado I" : "Equipar I"}</button><button onClick={() => onEquip(entry.id, 2)} disabled={!secondUnlocked} className={`text-[11px] rounded-lg px-2.5 py-1.5 ${!secondUnlocked ? "bg-slate-700 text-slate-500 cursor-not-allowed" : slot2 ? "bg-emerald-700 text-white" : "bg-violet-700 hover:bg-violet-600 text-white"}`}>{!secondUnlocked ? "II bloqueado" : slot2 ? "Equipado II" : "Equipar II"}</button></div></div>);
}

function ClassWeaponRow({ id, equipped, onEquip, onSell }) { const w = CLASS_WEAPONS[id]; if (!w) return null; const rcolor = RARITIES[w.rarity]?.color; const dg = DICE_GROUPS[w.ability.diceGroup]; return (<div className={`rounded-lg border px-3 py-2 ${equipped ? "border-emerald-600/60 bg-emerald-950/20" : "border-slate-700 bg-slate-800/40"}`}><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-sm font-medium truncate" style={{ color: rcolor }}>{w.name} <span className="text-[10px] text-slate-400 font-normal">· {w.rarity}</span></p><p className="text-[11px] text-slate-400">{classWeaponStats(w)} · {w.desc}</p><p className="text-[11px] text-fuchsia-200 mt-0.5">⚔ {w.ability.name} <span className="text-slate-500">· {w.ability.cost} energía</span>{dg ? <span className="text-sky-400"> · 🎲 {dg.label}</span> : null}</p></div><div className="flex flex-col gap-1 shrink-0">{equipped ? <span className="text-[11px] text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Equipada</span> : <button onClick={() => onEquip(id)} className="text-[11px] rounded-lg bg-sky-700 hover:bg-sky-600 px-2.5 py-1.5 text-white">Equipar</button>}{!w.relic && w.sell > 0 ? <button onClick={() => onSell(id)} className="text-[11px] rounded-lg bg-amber-700 hover:bg-amber-600 px-2.5 py-1.5 text-white">{w.sell} oro</button> : <span className="text-[10px] text-amber-300">Reliquia</span>}</div></div></div>); }
function entryFor(kind, id) { const ref = kind === "armor" ? ARMORS[id] : kind === "helmet" ? HELMETS[id] : ACCESSORIES[id]; if (!ref) return null; return { id, kind, name: ref.name, rarity: ref.rarity, ref }; }

export default function HubEquipment({ player, onEquipWeapon, onEquipArmor, onEquipHelmet, onEquipAccessory, onEquipClassWeapon, onSellClassWeapon }) {
  const bonus = getBonuses(player);
  const offStat = OFFENSIVE_STAT[player.class] || OFFENSIVE_STAT.Guerrero;
  const cw = player.classWeapon ? CLASS_WEAPONS[player.classWeapon] : null;
  const lootEquipped = player.weapon ? weaponDisplayData(player, player.weapon) : null;
  const aRef = player.armor ? ARMORS[player.armor] : null;
  const hRef = player.helmet ? HELMETS[player.helmet] : null;
  const acc1Ref = player.accessory ? ACCESSORIES[player.accessory] : null;
  const acc2Ref = player.accessory2 ? ACCESSORIES[player.accessory2] : null;
  const helmetUnlocked = !!player.equipmentUnlocks?.helmet;
  const secondUnlocked = !!player.equipmentUnlocks?.accessory2;
  const cwInv = player.classWeaponInventory || [];
  const wInv = (player.weaponInventory || []).map(raw => { const uid = typeof raw === "string" ? raw : raw?.uid; const d = weaponDisplayData(player, uid); return d ? { id: d.defId, kind: "weapon", name: d.name, rarity: d.rarity, ref: d, uid } : null; }).filter(Boolean);
  const aInv = (player.armorInventory || []).map(id => entryFor("armor", id)).filter(Boolean);
  const hInv = (player.helmetInventory || []).map(id => entryFor("helmet", id)).filter(Boolean);
  const accInv = (player.accessoryInventory || []).map(id => entryFor("accessory", id)).filter(Boolean);
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div><h3 className="text-xs uppercase tracking-widest text-slate-400 mb-2">Equipado</h3><div className="space-y-2">
        <Slot label="Arma" name={cw?.name || lootEquipped?.name} rarity={cw?.rarity || lootEquipped?.rarity} refItem={cw || lootEquipped} statsLine={cw ? classWeaponStats(cw) : null} extra={cw ? `⚔ ${cw.ability.name} · ${cw.ability.cost} energía` : lootEquipped?.quality ? `✦ ${lootEquipped.quality}` : null} onUnequip={() => cw ? onEquipClassWeapon(player.classWeapon) : onEquipWeapon(player.weapon)} />
        <Slot label="Armadura" name={aRef?.name} rarity={aRef?.rarity} refItem={aRef} onUnequip={() => onEquipArmor(player.armor)} />
        <Slot label="Casco" name={hRef?.name} rarity={hRef?.rarity} refItem={hRef} onUnequip={() => onEquipHelmet(player.helmet)} locked={!helmetUnlocked} lockedText="Vence al jefe de Región Verde" />
        <Slot label="Accesorio I" name={acc1Ref?.name} rarity={acc1Ref?.rarity} refItem={acc1Ref} onUnequip={() => onEquipAccessory(player.accessory, 1)} />
        <Slot label="Accesorio II" name={acc2Ref?.name} rarity={acc2Ref?.rarity} refItem={acc2Ref} onUnequip={() => onEquipAccessory(player.accessory2, 2)} locked={!secondUnlocked} lockedText="Vence al jefe de Región Ártica" />
      </div></div>
      <div className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-[11px] text-slate-300">Bonificaciones de equipo: <span className="text-emerald-300">{[bonus.atk && `+${bonus.atk} ${offStat.short}`, bonus.def && `+${bonus.def} Def. Física`, bonus.magDef && `+${bonus.magDef} Def. Mágica`, bonus.maxHp && `+${bonus.maxHp} Vida`, bonus.maxMp && `+${bonus.maxMp} Energía`, bonus.crit && `+${Math.round(bonus.crit * 100)}% crít`, bonus.speed && `+${bonus.speed} mov`].filter(Boolean).join(" · ") || "Ninguna"}</span></div>
      {cwInv.length > 0 && (<div><h3 className="text-xs uppercase tracking-widest text-amber-400 mb-1.5">Armas de clase</h3><div className="space-y-1.5">{cwInv.map(id => <ClassWeaponRow key={id} id={id} equipped={player.classWeapon === id} onEquip={onEquipClassWeapon} onSell={onSellClassWeapon} />)}</div></div>)}
      {wInv.length > 0 && (<div><h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">Armas de botín</h3><div className="space-y-1.5">{wInv.map(e => <InvRow key={e.uid} entry={e} equipped={player.weapon === e.uid} currentRef={null} onEquip={() => onEquipWeapon(e.uid)} />)}</div></div>)}
      {aInv.length > 0 && (<div><h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">Armaduras</h3><div className="space-y-1.5">{aInv.map(e => <InvRow key={e.id} entry={e} equipped={player.armor === e.id} currentRef={aRef} onEquip={() => onEquipArmor(e.id)} />)}</div></div>)}
      {helmetUnlocked && hInv.length > 0 && (<div><h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">Cascos</h3><div className="space-y-1.5">{hInv.map(e => <InvRow key={e.id} entry={e} equipped={player.helmet === e.id} currentRef={hRef} onEquip={() => onEquipHelmet(e.id)} />)}</div></div>)}
      {accInv.length > 0 && (<div><h3 className="text-xs uppercase tracking-widest text-slate-400 mb-1.5">Accesorios</h3><div className="space-y-1.5">{accInv.map(e => <AccessoryRow key={e.id} entry={e} slot1={player.accessory === e.id} slot2={player.accessory2 === e.id} secondUnlocked={secondUnlocked} onEquip={onEquipAccessory} />)}</div></div>)}
      {cwInv.length === 0 && wInv.length === 0 && aInv.length === 0 && hInv.length === 0 && accInv.length === 0 && (<p className="text-sm text-slate-500 italic">Sin equipo en reserva. Explora y derrota enemigos para encontrar botín.</p>)}
      <p className="text-[11px] text-slate-500 leading-snug">Equipa tu mejor combinación aquí. Para vender objetos, acude a un comerciante.</p>
    </div>
  );
}
