import React, { useMemo, useState } from "react";
import { Hammer, Coins, X, Wrench, Sparkles, Lock, CheckCircle2, Shield, Sword, HardHat, ArrowUpCircle } from "lucide-react";
import { weaponsForClass, CLASS_WEAPONS } from "@/lib/atlasWeapons";
import { WEAPONS, ARMORS, HELMETS, MATERIALS } from "@/lib/atlasLoot";
import { resolveWeaponDefId } from "@/lib/atlasWeaponInstances";
import { getSmithTierById, getSettlementStock, isStockUnlocked } from "@/lib/atlasEconomyV3";
import { getEquipmentForgeQuote, getEquipmentUpgradeQuote, equipmentKindLabel } from "@/lib/atlasEquipmentUpgrades";
import { CLASS_OFF_TYPE } from "@/lib/atlasSkills";
import { GREEN_RELIC_COMPONENTS, getGreenRelicForm, getMissingGreenRelicComponents } from "@/lib/atlasRelics";

const SLOT_REGION = { 0: "verde", 1: "fria", 2: "desierto" };
const REGION_LABEL = { verde: "Región Verde", fria: "Región Ártica", desierto: "Región Árida" };
const KIND_ICON = { classWeapon: Sword, weapon: Sword, armor: Shield, helmet: HardHat };

const statName = (key) => ({
  attack: "ATK", atk: "ATK", defense: "DEF", physDef: "DEF física", magDef: "DEF mágica",
  maxHp: "Vida", maxMp: "Energía", crit: "Crítico", speed: "Velocidad", hit: "Precisión",
}[key] || key);

function statValue(key, value) {
  if (["crit", "hit"].includes(key)) return `${Math.round(value * 100)}%`;
  return value;
}

function Requirements({ player, gold, materials, reason = "" }) {
  const owned = player.materials || {};
  return (
    <div className="mt-2 rounded-lg border border-slate-700 bg-slate-950/45 p-2">
      <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-1.5">Requisitos</p>
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${(player.gold || 0) >= gold ? "bg-emerald-950/50 text-emerald-300" : "bg-rose-950/50 text-rose-300"}`}>
          <Coins className="w-3 h-3" /> {player.gold || 0}/{gold}
        </span>
        {Object.entries(materials || {}).map(([id, need]) => {
          const have = owned[id] || 0;
          return (
            <span key={id} className={`rounded px-1.5 py-0.5 ${have >= need ? "bg-emerald-950/50 text-emerald-300" : "bg-rose-950/50 text-rose-300"}`}>
              {MATERIALS[id]?.name || id} {have}/{need}
            </span>
          );
        })}
      </div>
      {reason && <p className="mt-1.5 text-[10px] text-rose-300">{reason}</p>}
    </div>
  );
}

function Stats({ def }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
      {Object.entries(def?.stats || {}).map(([key, value]) => (
        <span key={key} className="rounded bg-slate-700/50 px-1.5 py-0.5 text-slate-300">
          {statName(key)} {Number(value) > 0 ? "+" : ""}{statValue(key, value)}
        </span>
      ))}
    </div>
  );
}

function CatalogCard({ item, player, regionId, tier, onForge }) {
  const { kind, id, def, classDesign = false } = item;
  const Icon = KIND_ICON[kind] || Hammer;
  const compatible = kind !== "weapon" || def.offType === CLASS_OFF_TYPE[player.class];
  const helmetUnlocked = kind !== "helmet" || !!player.equipmentUnlocks?.helmet;
  const owned = kind === "classWeapon"
    ? (player.classWeaponInventory || []).includes(id)
    : kind === "weapon"
      ? (player.weaponInventory || []).some(entry => resolveWeaponDefId(player, typeof entry === "string" ? entry : entry?.uid) === id)
      : kind === "armor"
        ? (player.armorInventory || []).includes(id)
        : (player.helmetInventory || []).includes(id);

  const classRecipe = classDesign ? (def.recipe || { gold: 0, materials: {} }) : null;
  const forgeQuote = classDesign ? null : getEquipmentForgeQuote({ player, kind, def, regionId });
  const gold = classRecipe?.gold ?? forgeQuote.gold;
  const materials = classRecipe?.materials ?? forgeQuote.materials;
  const missingClass = classDesign && Object.entries(materials || {}).some(([mid, need]) => (player.materials?.[mid] || 0) < need);
  const canAffordClass = classDesign && (player.gold || 0) >= gold && !missingClass;
  const canForge = !owned && compatible && helmetUnlocked && (classDesign ? canAffordClass : forgeQuote.canForge);
  const reason = owned ? "Ya posees esta pieza."
    : !compatible ? "Incompatible con tu clase."
      : !helmetUnlocked ? "El espacio de Casco aún está bloqueado."
        : classDesign && !tier.canCraftSlots.includes(def.slot) ? `Esta forja todavía no trabaja diseños de categoría ${def.slot + 1}.`
          : classDesign && !canAffordClass ? "Faltan recursos para completar el diseño."
            : forgeQuote?.reason || "";
  const tierAllows = !classDesign || tier.canCraftSlots.includes(def.slot);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-100"><Icon className="w-3.5 h-3.5" /> {def.name}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{equipmentKindLabel(kind)} · {def.rarity || "Común"}{def.recommendedClass ? ` · ${def.recommendedClass}` : ""}</p>
          <p className="mt-1 text-[11px] text-slate-400">{def.desc}</p>
        </div>
        {owned && <span className="whitespace-nowrap rounded-full bg-emerald-950/50 px-2 py-0.5 text-[10px] text-emerald-300">Poseído</span>}
      </div>
      <Stats def={def} />
      {def.ability && <p className="mt-1.5 text-[10px] text-fuchsia-200">⚔ {def.ability.name}: <span className="text-slate-400">{def.ability.desc}</span></p>}
      <Requirements player={player} gold={gold} materials={materials} reason={!tierAllows ? reason : (!canForge && !owned ? reason : "")} />
      <button
        type="button"
        onClick={() => onForge(kind, id)}
        disabled={!canForge || !tierAllows}
        className={`mt-2 w-full rounded-lg py-2 text-xs font-medium ${canForge && tierAllows ? "bg-amber-600 text-slate-950 hover:bg-amber-500" : "cursor-not-allowed bg-slate-700/50 text-slate-500"}`}
      >
        {owned ? "Ya poseído" : classDesign ? "Forjar diseño de clase" : "Forjar equipo regional"}
      </button>
    </div>
  );
}

function UpgradeCard({ item, player, regionId, tier, onUpgrade, onEquip }) {
  const { kind, ref, def, equipped } = item;
  const Icon = KIND_ICON[kind] || ArrowUpCircle;
  const quote = getEquipmentUpgradeQuote({ player, kind, ref, def, regionId, maxUpgrade: tier.maxUpgrade });
  return (
    <div className={`rounded-xl border p-3 ${equipped ? "border-emerald-600/60 bg-emerald-950/20" : "border-slate-700 bg-slate-800/40"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-100"><Icon className="w-3.5 h-3.5" /> {def.name}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{equipmentKindLabel(kind)} · {def.rarity || "Común"} · Mejora +{quote.level}</p>
          <p className="mt-1 text-[11px] text-slate-400">{def.desc}</p>
        </div>
        {equipped && <span className="whitespace-nowrap rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] text-emerald-300">Equipado</span>}
      </div>
      <Stats def={def} />
      <div className="mt-2 rounded-lg border border-sky-900/60 bg-sky-950/20 px-2 py-1.5 text-[10px]">
        <p className="text-slate-400">Actual: <span className="text-sky-200">{quote.statPreview.current}</span></p>
        {!quote.maxed && <p className="text-slate-400">Siguiente: <span className="text-sky-200">{quote.statPreview.next}</span></p>}
      </div>
      <Requirements player={player} gold={quote.gold} materials={quote.materials} reason={!quote.canUpgrade ? quote.reason : ""} />
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => onEquip(kind, ref)} className={`flex-1 rounded-lg py-2 text-xs font-medium ${equipped ? "bg-slate-700/50 text-slate-400" : "bg-emerald-700 text-white hover:bg-emerald-600"}`}>
          {equipped ? "Desequipar" : "Equipar"}
        </button>
        <button type="button" onClick={() => onUpgrade(kind, ref)} disabled={!quote.canUpgrade} className={`flex-1 rounded-lg py-2 text-xs font-medium ${quote.canUpgrade ? "bg-sky-600 text-white hover:bg-sky-500" : "cursor-not-allowed bg-slate-700/50 text-slate-500"}`}>
          {quote.maxed ? `Máximo +${quote.level}` : quote.localMaxed ? `Límite local +${quote.localMax}` : `Mejorar +${quote.level} → +${quote.nextLevel}`}
        </button>
      </div>
    </div>
  );
}

export default function BlacksmithModal({
  player, regionId = "verde", tier: tierId = "camp", worldFlags = {},
  onForgeEquipment, onUpgradeEquipment, onEquipEquipment,
  onRepair, onRestoreRelic, onClose,
}) {
  const [tab, setTab] = useState("catalog");
  const tier = getSmithTierById(tierId);
  const stock = getSettlementStock(regionId, tierId);
  const stockUnlocked = isStockUnlocked(regionId, tierId, worldFlags);
  const condition = player.equipmentCondition ?? 100;
  const weaponDurability = player.weaponDurability ?? 100;
  const fullyRepaired = condition >= 100 && weaponDurability >= 100;
  const missingRelic = getMissingGreenRelicComponents(player);
  const relicForm = getGreenRelicForm(player.class);
  const relicRestored = player.relics?.verde?.state === "restored";
  const foundBrokenRelic = !!worldFlags["verde:broken_relic_found"];
  const cityServices = !!worldFlags["verde:city_services_open"];
  const canAttemptRelic = regionId === "verde" && tier.services.includes("relic_restore");
  const smithConnected = typeof onForgeEquipment === "function" && typeof onUpgradeEquipment === "function" && typeof onEquipEquipment === "function";

  const catalog = useMemo(() => {
    if (!stockUnlocked) return [];
    const out = [];
    for (const id of stock.weapons || []) if (WEAPONS[id]) out.push({ kind: "weapon", id, def: WEAPONS[id] });
    for (const id of stock.armors || []) if (ARMORS[id]) out.push({ kind: "armor", id, def: ARMORS[id] });
    for (const id of stock.helmets || []) if (HELMETS[id]) out.push({ kind: "helmet", id, def: HELMETS[id] });
    const classDesigns = weaponsForClass(player.class).filter(w => SLOT_REGION[w.slot] === regionId);
    for (const def of classDesigns) out.unshift({ kind: "classWeapon", id: def.id, def, classDesign: true });
    return out;
  }, [player.class, regionId, stock, stockUnlocked]);

  const ownedItems = useMemo(() => {
    const out = [];
    for (const id of player.classWeaponInventory || []) {
      const def = CLASS_WEAPONS[id];
      if (def) out.push({ kind: "classWeapon", ref: id, def, equipped: player.classWeapon === id });
    }
    for (const entry of player.weaponInventory || []) {
      const ref = typeof entry === "string" ? entry : entry?.uid;
      const defId = resolveWeaponDefId(player, ref);
      const def = defId ? WEAPONS[defId] : null;
      if (ref && def) out.push({ kind: "weapon", ref, def, equipped: player.weapon === ref });
    }
    for (const id of player.armorInventory || []) {
      const def = ARMORS[id];
      if (def) out.push({ kind: "armor", ref: id, def, equipped: player.armor === id });
    }
    if (player.equipmentUnlocks?.helmet) {
      for (const id of player.helmetInventory || []) {
        const def = HELMETS[id];
        if (def) out.push({ kind: "helmet", ref: id, def, equipped: player.helmet === id });
      }
    }
    return out;
  }, [player]);

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-[60] flex items-center justify-center overflow-auto bg-slate-950/85 px-3 py-4 backdrop-blur" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-amber-700/60 bg-slate-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-amber-950/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-300" />
            <div><h2 className="font-heading text-base tracking-wide text-amber-100">{stock?.label || tier.label}</h2><p className="text-[10px] text-slate-400">{REGION_LABEL[regionId]} · mejoras hasta +{tier.maxUpgrade}</p></div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>

        <div className="min-h-0 space-y-3 overflow-y-auto p-3">
          <p className="text-[11px] text-slate-400">{tier.description} El catálogo depende de esta región y este asentamiento.</p>
          {!smithConnected && <div className="rounded-xl border border-rose-700/60 bg-rose-950/35 p-3 text-xs text-rose-200">La herrería perdió conexión con el estado de la partida. Cierra y vuelve a abrir el menú.</div>}

          <section className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-xs text-slate-200"><Wrench className="w-3.5 h-3.5 text-sky-300" /> Reparación</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1.5"><p className="text-[9px] uppercase tracking-wider text-slate-500">Arma</p><p className="text-base font-medium text-emerald-300">{weaponDurability}%</p></div>
                  <div className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1.5"><p className="text-[9px] uppercase tracking-wider text-slate-500">Protección</p><p className="text-base font-medium text-emerald-300">{condition}%</p></div>
                </div>
              </div>
              <button type="button" onClick={onRepair} disabled={fullyRepaired} className={`rounded-lg px-3 py-2 text-xs font-medium ${fullyRepaired ? "cursor-not-allowed bg-slate-700/50 text-slate-500" : "bg-sky-700 text-white hover:bg-sky-600"}`}>{fullyRepaired ? "Sin daños" : "Reparar todo"}</button>
            </div>
          </section>

          {canAttemptRelic && (
            <section className="rounded-xl border border-emerald-700/60 bg-emerald-950/20 p-3">
              <div className="flex items-start gap-2"><Sparkles className="mt-0.5 w-4 h-4 text-emerald-300" /><div className="flex-1"><p className="text-sm font-medium text-emerald-100">Restauración de la Reliquia Verde</p><p className="text-[11px] text-slate-400">Forma compatible: <span className="text-emerald-300">{relicForm.name}</span>.</p></div></div>
              <div className="mt-2 space-y-1 text-[10px]">
                <p className={foundBrokenRelic ? "text-emerald-300" : "text-rose-300"}>{foundBrokenRelic ? "✓" : "✗"} Restos del arma del Guardián</p>
                <p className={cityServices ? "text-emerald-300" : "text-rose-300"}>{cityServices ? "✓" : "✗"} Forja regional habilitada</p>
                {GREEN_RELIC_COMPONENTS.map(component => { const has = !missingRelic.some(m => m.id === component.id); return <p key={component.id} className={has ? "text-emerald-300" : "text-rose-300"}>{has ? "✓" : "✗"} {component.name}</p>; })}
              </div>
              <button type="button" onClick={onRestoreRelic} disabled={relicRestored} className={`mt-3 w-full rounded-lg py-2 text-xs font-medium ${relicRestored ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-600 text-white hover:bg-emerald-500"}`}>
                {relicRestored ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Reliquia restaurada</span> : "Restaurar reliquia"}
              </button>
            </section>
          )}

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-700 bg-slate-950/40 p-1">
            <button type="button" onClick={() => setTab("catalog")} className={`rounded-lg py-2 text-xs font-medium ${tab === "catalog" ? "bg-amber-700 text-amber-50" : "text-slate-400"}`}>Catálogo local</button>
            <button type="button" onClick={() => setTab("upgrade")} className={`rounded-lg py-2 text-xs font-medium ${tab === "upgrade" ? "bg-sky-700 text-sky-50" : "text-slate-400"}`}>Mejorar equipo</button>
          </div>

          {tab === "catalog" && (
            <section className="space-y-2">
              {!stockUnlocked && <div className="rounded-xl border border-rose-800/60 bg-rose-950/30 p-3 text-xs text-rose-200"><Lock className="mr-1 inline w-3.5 h-3.5" /> El catálogo se habilita al recuperar los servicios de este asentamiento.</div>}
              {catalog.map(item => <CatalogCard key={`${item.kind}:${item.id}`} item={item} player={player} regionId={regionId} tier={tier} onForge={smithConnected ? onForgeEquipment : () => {}} />)}
              {stockUnlocked && !catalog.length && <p className="py-5 text-center text-xs text-slate-500">Este herrero no tiene diseños disponibles.</p>}
            </section>
          )}

          {tab === "upgrade" && (
            <section className="space-y-2">
              {ownedItems.map(item => <UpgradeCard key={`${item.kind}:${item.ref}`} item={item} player={player} regionId={regionId} tier={tier} onUpgrade={smithConnected ? onUpgradeEquipment : () => {}} onEquip={smithConnected ? onEquipEquipment : () => {}} />)}
              {!ownedItems.length && <p className="py-5 text-center text-xs text-slate-500">No tienes equipo mejorable.</p>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
