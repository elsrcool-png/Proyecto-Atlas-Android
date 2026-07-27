import React from "react";
import { Hammer, Coins, X, Wrench, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { WEAPON_MAX_UPGRADE, weaponsForClass, CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { MATERIALS } from "@/lib/atlasLoot";
import { getSmithTierById } from "@/lib/atlasEconomyV3";
import { GREEN_RELIC_COMPONENTS, getGreenRelicForm, getMissingGreenRelicComponents } from "@/lib/atlasRelics";

const statName = (key) => key === "attack" ? "ATK" : key === "defense" ? "DEF" : key === "maxMp" ? "Energía" : key === "crit" ? "Crít" : key;

function WeaponCard({ w, player, owned, equipped, tier, onCraft, onUpgrade, onEquip }) {
  const mats = player.materials || {};
  const lvl = player.weaponUpgrades?.[w.id] || 0;
  const localMax = Math.min(WEAPON_MAX_UPGRADE, tier.maxUpgrade);
  const maxedHere = lvl >= localMax;
  const globallyMaxed = lvl >= WEAPON_MAX_UPGRADE;
  const recipe = w.recipe || { gold: 0, materials: {} };
  const canForgeThisTier = tier.canCraftSlots.includes(w.slot);
  const canAfford = (player.gold || 0) >= (recipe.gold || 0);
  const haveMats = Object.entries(recipe.materials || {}).every(([mid, n]) => (mats[mid] || 0) >= n);
  const canCraft = !owned && canForgeThisTier && canAfford && haveMats;
  const upGold = 20 + lvl * 15;
  const recipeMat = Object.keys(recipe.materials || {})[0] || null;
  const upNeed = recipeMat ? 1 + lvl : 0;
  const haveUpgradeMaterial = !recipeMat || (mats[recipeMat] || 0) >= upNeed;
  const canUpgrade = owned && !maxedHere && !w.relic && (player.gold || 0) >= upGold && haveUpgradeMaterial;

  return (
    <div className={`rounded-xl border p-3 ${equipped ? "border-emerald-500/60 bg-emerald-950/20" : "border-slate-700 bg-slate-800/40"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-amber-100">{w.name} <span className="text-[10px] text-slate-400 font-normal">· {w.style}</span></p>
          <p className="text-[11px] text-slate-400 mt-0.5">{w.desc}</p>
        </div>
        {equipped && <span className="text-[10px] text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full whitespace-nowrap">Equipada +{lvl}</span>}
        {owned && !equipped && <span className="text-[10px] text-slate-400">+{lvl}</span>}
      </div>
      <div className="mt-1.5">
        <p className="text-[11px] text-fuchsia-200">⚔ {w.ability.name} <span className="text-slate-500">· {w.ability.cost} energía</span></p>
        <p className="text-[10px] text-slate-400 italic">{w.ability.desc}</p>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
        {Object.entries(w.stats || {}).map(([k, v]) => (
          <span key={k} className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">
            {statName(k)} {v > 0 ? "+" : ""}{k === "crit" ? `${Math.round(v * 100)}%` : v}
          </span>
        ))}
      </div>

      {!owned ? (
        <div className="mt-2">
          {!canForgeThisTier && (
            <p className="mb-1.5 text-[10px] text-rose-300 flex items-center gap-1"><Lock className="w-3 h-3" /> Requiere una forja de categoría superior.</p>
          )}
          <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300 mb-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700/50"><Coins className="w-3 h-3" /> {recipe.gold || 0} {canAfford ? "" : "(✗)"}</span>
            {Object.entries(recipe.materials || {}).map(([mid, n]) => (
              <span key={mid} className={`px-1.5 py-0.5 rounded ${(mats[mid] || 0) >= n ? "bg-slate-700/50" : "bg-red-900/40 text-red-300"}`}>
                {MATERIALS[mid]?.name || mid} {mats[mid] || 0}/{n}
              </span>
            ))}
          </div>
          <button onClick={() => onCraft(w.id)} disabled={!canCraft} className={`w-full rounded-lg py-2 text-xs font-medium ${canCraft ? "bg-amber-600 hover:bg-amber-500 text-slate-900" : "bg-slate-700/50 text-slate-500 cursor-not-allowed"}`}>Forjar arma</button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <button onClick={() => onEquip(w.id)} className={`flex-1 rounded-lg py-2 text-xs font-medium ${equipped ? "bg-slate-700/50 text-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`} disabled={equipped}>{equipped ? "Equipada" : "Equipar"}</button>
          <button onClick={() => onUpgrade(w.id)} disabled={!canUpgrade} className={`flex-1 rounded-lg py-2 text-xs font-medium ${globallyMaxed ? "bg-slate-700/50 text-amber-300" : canUpgrade ? "bg-sky-600 hover:bg-sky-500 text-white" : "bg-slate-700/50 text-slate-500 cursor-not-allowed"}`}>
            {globallyMaxed ? `Máx +${lvl}` : maxedHere ? `Límite local +${localMax}` : `Mejorar +${lvl}→+${lvl + 1} (${upGold}g${recipeMat ? ` · ${MATERIALS[recipeMat]?.name || recipeMat} ${mats[recipeMat] || 0}/${upNeed}` : ""})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlacksmithModal({ player, tier: tierId = "camp", worldFlags = {}, onCraft, onUpgrade, onEquip, onRepair, onRestoreRelic, onClose }) {
  const tier = getSmithTierById(tierId);
  const forgeWeapons = weaponsForClass(player.class);
  const ownedIds = player.classWeaponInventory || [];
  const ownedSpecial = ownedIds.map(id => CLASS_WEAPONS[id]).filter(w => w && (w.starter || w.relic));
  const weapons = [...forgeWeapons, ...ownedSpecial].filter((w, index, arr) => arr.findIndex(x => x.id === w.id) === index);
  const condition = player.equipmentCondition ?? 100;
  const weaponDurability = player.weaponDurability ?? 100;
  const fullyRepaired = condition >= 100 && weaponDurability >= 100;
  const missingRelic = getMissingGreenRelicComponents(player);
  const relicForm = getGreenRelicForm(player.class);
  const relicRestored = player.relics?.verde?.state === "restored";
  const foundBrokenRelic = !!worldFlags["verde:broken_relic_found"];
  const cityServices = !!worldFlags["verde:city_services_open"];
  const canAttemptRelic = tier.services.includes("relic_restore");

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 backdrop-blur px-3 py-4 overflow-auto" onClick={onClose}>
      <div className="w-full max-w-md max-h-[84vh] overflow-hidden rounded-2xl bg-slate-900 border border-amber-700/60 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-amber-950/30 shrink-0">
          <div className="flex items-center gap-2"><Hammer className="w-5 h-5 text-amber-300" /><div><h2 className="font-heading text-base text-amber-100 tracking-wide">{tier.label}</h2><p className="text-[10px] text-slate-400">Mejoras hasta +{tier.maxUpgrade}</p></div></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-3 space-y-3 overflow-y-auto min-h-0">
          <p className="text-[11px] text-slate-400">{tier.description}</p>

          <section className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-slate-200 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-sky-300" /> Reparación</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="rounded-lg bg-slate-950/45 border border-slate-700 px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">Arma</p>
                    <p className={`text-base font-medium ${weaponDurability >= 75 ? "text-emerald-300" : weaponDurability >= 40 ? "text-amber-300" : "text-rose-300"}`}>{weaponDurability}%</p>
                  </div>
                  <div className="rounded-lg bg-slate-950/45 border border-slate-700 px-2 py-1.5">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">Protección</p>
                    <p className={`text-base font-medium ${condition >= 75 ? "text-emerald-300" : condition >= 40 ? "text-amber-300" : "text-rose-300"}`}>{condition}%</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">El desgaste del arma reduce ATK; el daño del equipo reduce DEF.</p>
              </div>
              <button onClick={onRepair} disabled={fullyRepaired} className={`rounded-lg px-3 py-2 text-xs font-medium ${!fullyRepaired ? "bg-sky-700 hover:bg-sky-600 text-white" : "bg-slate-700/50 text-slate-500 cursor-not-allowed"}`}>{fullyRepaired ? "Sin daños" : "Reparar todo"}</button>
            </div>
          </section>

          {canAttemptRelic && (
            <section className="rounded-xl border border-emerald-700/60 bg-emerald-950/20 p-3">
              <div className="flex items-start gap-2"><Sparkles className="w-4 h-4 text-emerald-300 mt-0.5" /><div className="flex-1"><p className="text-sm font-medium text-emerald-100">Restauración de la Reliquia Verde</p><p className="text-[11px] text-slate-400">La reliquia adoptará una forma compatible con tu clase: <span className="text-emerald-300">{relicForm.name}</span>.</p></div></div>
              <div className="mt-2 space-y-1 text-[10px]">
                <p className={foundBrokenRelic ? "text-emerald-300" : "text-rose-300"}>{foundBrokenRelic ? "✓" : "✗"} Restos del arma del Guardián</p>
                <p className={cityServices ? "text-emerald-300" : "text-rose-300"}>{cityServices ? "✓" : "✗"} Forja regional habilitada</p>
                {GREEN_RELIC_COMPONENTS.map(component => {
                  const has = !missingRelic.some(m => m.id === component.id);
                  return <p key={component.id} className={has ? "text-emerald-300" : "text-rose-300"}>{has ? "✓" : "✗"} {component.name}</p>;
                })}
              </div>
              <button onClick={onRestoreRelic} disabled={relicRestored} className={`mt-3 w-full rounded-lg py-2 text-xs font-medium ${relicRestored ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
                {relicRestored ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Reliquia restaurada</span> : "Restaurar reliquia"}
              </button>
            </section>
          )}

          <p className="text-[11px] uppercase tracking-wider text-slate-500 sticky top-0 z-10 bg-slate-900/95 py-1">Armas de clase</p>
          {weapons.map(w => (
            <WeaponCard key={w.id} w={w} player={player} owned={ownedIds.includes(w.id)} equipped={player.classWeapon === w.id} tier={tier} onCraft={onCraft} onUpgrade={onUpgrade} onEquip={onEquip} />
          ))}
        </div>
      </div>
    </div>
  );
}
