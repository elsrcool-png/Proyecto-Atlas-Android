import React from "react";
import { X, Check, Lock } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";
import { RARITIES, ARMORS, HELMETS, MATERIALS, statsText, isSellable, sellValueOf } from "@/lib/atlasLoot";
import { ACCESSORIES, CLASS_OFF_TYPE } from "@/lib/atlasSkills";
import { CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { DICE_GROUPS } from "@/lib/atlasDiceSystem";
import { weaponDisplayData } from "@/lib/atlasWeaponInstances";

const STAT_LABELS = { attack: "ATK", defense: "DEF", maxHp: "Vida", maxMp: "Energía", crit: "Crít", speed: "Mov", physDef: "Def. Física", magDef: "Def. Mágica" };
function classWeaponStats(w) {
  if (!w?.stats) return "";
  const offLbl = w.offType === "arcane" ? "Poder Arcano" : w.offType === "precision" ? "Precisión" : "ATK";
  return Object.entries(w.stats).map(([k, v]) => {
    const lbl = k === "attack" ? offLbl : (STAT_LABELS[k] || k);
    return `+${k === "crit" ? Math.round(v * 100) + "%" : v} ${lbl}`;
  }).join(" · ");
}
function displayStats(ref) { return statsText({ ...ref, stats: ref?.stats || {} }); }
function equippedItem(ref) {
  if (!ref) return null;
  return { __name: ref.name, __color: RARITIES[ref.rarity]?.color, __ref: ref };
}

function Slot({ label, item, onUnequip, extra, statsLine, locked, lockedText }) {
  return (
    <div className={`rounded-xl border p-3 ${locked ? "border-slate-800 bg-slate-950/40" : "border-slate-700 bg-slate-800/50"}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      {locked ? (
        <div className="flex items-center gap-2 text-slate-500"><Lock className="w-4 h-4" /><p className="text-sm">{lockedText}</p></div>
      ) : item ? (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: item.__color }}>{item.__name}</p>
            <p className="text-[11px] text-slate-400">{statsLine ?? displayStats(item.__ref)}{item.__ref?.passive ? ` · ${item.__ref.passive.desc}` : ""}</p>
            {item.__quality && <p className="text-[10px] text-amber-300 mt-0.5">Calidad: {item.__quality}</p>}
            {extra && <p className="text-[11px] text-fuchsia-300 mt-0.5">{extra}</p>}
          </div>
          <button onClick={onUnequip} className="text-[11px] rounded-lg bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 text-slate-200 whitespace-nowrap">Quitar</button>
        </div>
      ) : <p className="text-sm text-slate-500 italic">Vacío</p>}
    </div>
  );
}

function StandardRow({ entry, equipped, onEquip, onSell, incompatible }) {
  const rcolor = RARITIES[entry.rarity]?.color;
  const canSell = entry.sellable !== false && isSellable(entry.rarity);
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: rcolor }}>{entry.name}</p>
        <p className="text-[11px] text-slate-400">{displayStats(entry.ref)}{entry.ref?.passive ? ` · ${entry.ref.passive.desc}` : ""}</p>
        {entry.quality && <p className="text-[10px] text-amber-300 mt-0.5">{entry.quality}</p>}
        {incompatible && <p className="text-[10px] text-rose-400 mt-0.5">Arma incompatible con la clase actual</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {equipped ? <span className="text-[11px] text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Equipado</span>
          : incompatible ? <span className="text-[11px] text-rose-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Incompatible</span>
            : <button onClick={onEquip} className="text-[11px] rounded-lg bg-sky-700 hover:bg-sky-600 px-2.5 py-1.5 text-white">Equipar</button>}
        {canSell ? <button onClick={onSell} className="text-[11px] rounded-lg bg-amber-700 hover:bg-amber-600 px-2.5 py-1.5 text-white">{sellValueOf(entry.rarity)} oro</button>
          : <span className="text-[11px] text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> No venta</span>}
      </div>
    </div>
  );
}

function AccessoryRow({ entry, slot1, slot2, secondUnlocked, onEquip, onSell }) {
  const rcolor = RARITIES[entry.rarity]?.color;
  const canSell = entry.sellable !== false && isSellable(entry.rarity);
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: rcolor }}>{entry.name}</p>
          <p className="text-[11px] text-slate-400">{displayStats(entry.ref)}{entry.ref?.passive ? ` · ${entry.ref.passive.desc}` : ""}</p>
        </div>
        {canSell ? <button onClick={onSell} className="text-[11px] rounded-lg bg-amber-700 hover:bg-amber-600 px-2.5 py-1.5 text-white shrink-0">{sellValueOf(entry.rarity)} oro</button>
          : <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0"><Lock className="w-3 h-3" /> No venta</span>}
      </div>
      <div className="flex gap-1.5 mt-2">
        <button onClick={() => onEquip(entry.id, 1)} className={`text-[11px] rounded-lg px-2.5 py-1.5 ${slot1 ? "bg-emerald-700 text-white" : "bg-sky-700 hover:bg-sky-600 text-white"}`}>{slot1 ? "Equipado I" : "Equipar I"}</button>
        <button onClick={() => onEquip(entry.id, 2)} disabled={!secondUnlocked} className={`text-[11px] rounded-lg px-2.5 py-1.5 ${!secondUnlocked ? "bg-slate-700 text-slate-500 cursor-not-allowed" : slot2 ? "bg-emerald-700 text-white" : "bg-violet-700 hover:bg-violet-600 text-white"}`}>{!secondUnlocked ? "II bloqueado" : slot2 ? "Equipado II" : "Equipar II"}</button>
      </div>
    </div>
  );
}

function ClassWeaponRow({ id, equipped, onEquip, onSell }) {
  const w = CLASS_WEAPONS[id]; if (!w) return null;
  const rcolor = RARITIES[w.rarity]?.color; const dg = DICE_GROUPS[w.ability.diceGroup];
  const sellable = !w.relic && (w.sell || 0) > 0;
  return (
    <div className={`rounded-lg border px-3 py-2 ${equipped ? "border-emerald-600/60 bg-emerald-950/20" : "border-slate-700 bg-slate-800/40"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: rcolor }}>{w.name} <span className="text-[10px] text-slate-400 font-normal">· {w.rarity}</span></p>
          <p className="text-[11px] text-slate-400">{classWeaponStats(w)} · {w.desc}</p>
          <p className="text-[11px] text-fuchsia-200 mt-0.5">⚔ {w.ability.name} <span className="text-slate-500">· {w.ability.cost} energía</span>{dg ? <span className="text-sky-400"> · 🎲 {dg.label}</span> : null}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{w.ability.desc}</p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {equipped ? <span className="text-[11px] text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Equipada</span> : <button onClick={() => onEquip(id)} className="text-[11px] rounded-lg bg-sky-700 hover:bg-sky-600 px-2.5 py-1.5 text-white">Equipar</button>}
          {sellable ? <button onClick={() => onSell(id)} className="text-[11px] rounded-lg bg-amber-700 hover:bg-amber-600 px-2.5 py-1.5 text-white">{w.sell} oro</button> : <span className="text-[11px] text-amber-300 flex items-center gap-1"><Lock className="w-3 h-3" /> Reliquia</span>}
        </div>
      </div>
    </div>
  );
}

function entryFor(kind, id) {
  const ref = kind === "armor" ? ARMORS[id] : kind === "helmet" ? HELMETS[id] : ACCESSORIES[id];
  if (!ref) return null;
  return { id, kind, name: ref.name, rarity: ref.rarity, ref, sellable: true };
}

export default function EquipmentModal({ player, onEquipWeapon, onEquipArmor, onEquipHelmet, onEquipAccessory, onEquipClassWeapon, onSellWeapon, onSellArmor, onSellHelmet, onSellAccessory, onSellMaterial, onSellClassWeapon, onClose }) {
  const cw = player.classWeapon ? CLASS_WEAPONS[player.classWeapon] : null;
  const lootEquipped = player.weapon ? weaponDisplayData(player, player.weapon) : null;
  const equippedWeapon = cw
    ? { __name: cw.name, __color: RARITIES[cw.rarity]?.color || "#fbbf24", __ref: cw, __kind: "class" }
    : lootEquipped ? { __name: lootEquipped.name, __color: RARITIES[lootEquipped.rarity]?.color, __ref: lootEquipped, __quality: lootEquipped.quality, __kind: "loot" } : null;
  const armor = equippedItem(ARMORS[player.armor]);
  const helmet = equippedItem(HELMETS[player.helmet]);
  const acc1 = equippedItem(ACCESSORIES[player.accessory]);
  const acc2 = equippedItem(ACCESSORIES[player.accessory2]);
  const helmetUnlocked = !!player.equipmentUnlocks?.helmet;
  const secondAccessoryUnlocked = !!player.equipmentUnlocks?.accessory2;
  const cwInv = player.classWeaponInventory || [];
  const wInv = (player.weaponInventory || []).map(raw => { const uid = typeof raw === "string" ? raw : raw?.uid; const d = weaponDisplayData(player, uid); return d ? { uid, name: d.name, rarity: d.rarity, quality: d.quality, sellable: d.sellable, ref: d } : null; }).filter(Boolean);
  const aInv = (player.armorInventory || []).map(id => entryFor("armor", id)).filter(Boolean);
  const hInv = (player.helmetInventory || []).map(id => entryFor("helmet", id)).filter(Boolean);
  const accInv = (player.accessoryInventory || []).map(id => entryFor("accessory", id)).filter(Boolean);
  const mats = Object.entries(player.materials || {}).filter(([, n]) => n > 0);
  const unequipWeapon = () => cw ? onEquipClassWeapon(player.classWeapon) : lootEquipped ? onEquipWeapon(player.weapon) : null;

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4 py-6" onClick={onClose}>
      <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5 max-w-lg w-full max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h2 className="flex items-center gap-2 text-base font-semibold text-slate-100"><GIcon name="sword" size={20} /> Equipo y Materiales</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button></div>
        <div className="grid grid-cols-1 gap-2 mb-4">
          <Slot label="Arma" item={equippedWeapon} statsLine={cw ? classWeaponStats(cw) : null} extra={cw ? `⚔ ${cw.ability.name} · ${cw.ability.cost} energía` : lootEquipped ? `⚔ Habilidad básica del arma · ${lootEquipped.offType}` : null} onUnequip={unequipWeapon} />
          <Slot label="Armadura" item={armor} onUnequip={() => onEquipArmor(player.armor)} />
          <Slot label="Casco" item={helmet} onUnequip={() => onEquipHelmet(player.helmet)} locked={!helmetUnlocked} lockedText="Se desbloquea al vencer al jefe de Región Verde" />
          <Slot label="Accesorio I" item={acc1} onUnequip={() => onEquipAccessory(player.accessory, 1)} />
          <Slot label="Accesorio II" item={acc2} onUnequip={() => onEquipAccessory(player.accessory2, 2)} locked={!secondAccessoryUnlocked} lockedText="Se desbloquea al vencer al jefe de Región Ártica" />
        </div>
        <div className="mb-3 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2"><p className="text-[11px] text-slate-400">Condición general del equipo</p><p className={`text-sm font-medium ${(player.equipmentCondition ?? 100) >= 50 ? "text-emerald-300" : "text-rose-300"}`}>{player.equipmentCondition ?? 100}%</p></div>
        {cwInv.length > 0 && (<div className="mb-3"><p className="text-[11px] uppercase tracking-wider text-amber-400 mb-1.5">Armas de clase</p><div className="space-y-1.5">{cwInv.map(id => <ClassWeaponRow key={id} id={id} equipped={player.classWeapon === id} onEquip={onEquipClassWeapon} onSell={onSellClassWeapon} />)}</div></div>)}
        {wInv.length > 0 && (<div className="mb-3"><p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Armas de botín</p><div className="space-y-1.5">{wInv.map(e => <StandardRow key={e.uid} entry={e} equipped={player.weapon === e.uid} incompatible={!!e.ref && e.ref.offType !== CLASS_OFF_TYPE[player.class]} onEquip={() => onEquipWeapon(e.uid)} onSell={() => onSellWeapon(e.uid)} />)}</div></div>)}
        {aInv.length > 0 && (<div className="mb-3"><p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Armaduras</p><div className="space-y-1.5">{aInv.map(e => <StandardRow key={e.id} entry={e} equipped={player.armor === e.id} onEquip={() => onEquipArmor(e.id)} onSell={() => onSellArmor(e.id)} />)}</div></div>)}
        {helmetUnlocked && hInv.length > 0 && (<div className="mb-3"><p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Cascos</p><div className="space-y-1.5">{hInv.map(e => <StandardRow key={e.id} entry={e} equipped={player.helmet === e.id} onEquip={() => onEquipHelmet(e.id)} onSell={() => onSellHelmet(e.id)} />)}</div></div>)}
        {accInv.length > 0 && (<div className="mb-3"><p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Accesorios</p><div className="space-y-1.5">{accInv.map(e => <AccessoryRow key={e.id} entry={e} slot1={player.accessory === e.id} slot2={player.accessory2 === e.id} secondUnlocked={secondAccessoryUnlocked} onEquip={onEquipAccessory} onSell={() => onSellAccessory(e.id)} />)}</div></div>)}
        <div className="mb-2"><p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Materiales</p>{mats.length === 0 ? <p className="text-sm text-slate-500 italic">Aún no tienes materiales.</p> : (<div className="grid grid-cols-2 gap-1.5">{mats.map(([id, n]) => { const m = MATERIALS[id]; if (!m) return null; return (<div key={id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/40 px-2.5 py-1.5"><div className="min-w-0"><p className="text-sm truncate" style={{ color: RARITIES[m.rarity]?.color }}>{m.name}</p><p className="text-[10px] text-slate-500">×{n}</p></div><button onClick={() => onSellMaterial(id)} className="text-[11px] rounded-lg bg-amber-700 hover:bg-amber-600 px-2 py-1 text-white">{m.price} oro</button></div>); })}</div>)}</div>
        <button onClick={onClose} className="mt-3 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-sm text-slate-300 transition">Cerrar</button>
      </div>
    </div>
  );
}
