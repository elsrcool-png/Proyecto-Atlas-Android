import React from "react";
import { X, Lock, Dices } from "lucide-react";
import { ACCESSORIES, RARITY_COLOR } from "@/lib/atlasSkills";
import { GIcon } from "@/lib/atlasIcons";

function BonusLine({ bonus = {} }) {
  const parts = [];
  if (bonus.atk || bonus.attack) parts.push(`+${bonus.atk || bonus.attack} ATK`);
  if (bonus.def) parts.push(`+${bonus.def} DEF`);
  if (bonus.maxHp) parts.push(`+${bonus.maxHp} HP`);
  if (bonus.maxMp) parts.push(`+${bonus.maxMp} Energía`);
  if (bonus.crit) parts.push(`+${Math.round(bonus.crit * 100)}% crítico`);
  return <span className="text-[11px] text-emerald-300">{parts.join(" · ") || "Sin bonificación"}</span>;
}

function BundleLines({ reward }) {
  return (
    <div className="space-y-1.5 text-sm text-slate-200">
      {!!reward.gold && <p>🪙 <span className="text-amber-300">+{reward.gold} oro</span></p>}
      {(reward.materials || []).map(mat => <p key={mat.id}>◆ <span className="text-violet-300">{mat.name} ×{mat.amount}</span></p>)}
      {reward.consumable && <p>🧪 <span className="text-emerald-300">Poción pequeña de vida</span></p>}
      {reward.seal && <p>✦ <span className="text-sky-300">{reward.seal.name}</span></p>}
    </div>
  );
}

export default function ChestRewardModal({ reward, onClose }) {
  if (!reward) return null;
  let title = "Cofre abierto";
  let body = null;
  let icon = "packageopen";
  let accent = "border-amber-500";

  if (reward.kind === "common_bundle") {
    title = "Cofre común";
    body = <><p className="text-xs text-slate-400 mb-3">Suministros básicos, sin tirada de dados.</p><BundleLines reward={reward} /></>;
  } else if (reward.kind === "ancient_bundle") {
    title = "Cofre antiguo";
    icon = "landmark";
    accent = "border-violet-500";
    body = (
      <div className="space-y-3">
        <div className="rounded-lg bg-violet-950/35 border border-violet-700/40 px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-violet-200 flex items-center gap-1.5"><Dices className="w-4 h-4" /> Tirada d20</span>
          <span className="font-heading text-lg text-violet-100">{reward.d20}</span>
        </div>
        <BundleLines reward={reward} />
        <p className="text-[11px] text-slate-400">Los tres sellos regionales permiten abrir el cofre legendario.</p>
      </div>
    );
  } else if (reward.kind === "legendary_locked") {
    title = "Cofre legendario sellado";
    icon = "lock";
    accent = "border-slate-500";
    body = (
      <div className="space-y-3">
        <p className="text-sm text-slate-300 flex items-start gap-2"><Lock className="w-4 h-4 mt-0.5 shrink-0" /> El cofre no responde hasta reunir los tres sellos de la región.</p>
        <div className="space-y-1.5">
          {(reward.required || []).map(seal => {
            const missing = (reward.missing || []).some(x => x.id === seal.id);
            return <div key={seal.id} className={`rounded-lg border px-3 py-2 text-xs ${missing ? "border-red-800/60 bg-red-950/25 text-red-300" : "border-emerald-800/60 bg-emerald-950/25 text-emerald-300"}`}>{missing ? "✗" : "✓"} {seal.name}</div>;
          })}
        </div>
      </div>
    );
  } else if (reward.kind === "legendary_weapon") {
    title = "Ceremonia 3d20 completada";
    icon = "sparkles";
    accent = "border-amber-400";
    body = (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(reward.diceResult?.rolls || []).map((roll, index) => <div key={index} className="rounded-xl border border-amber-700/50 bg-amber-950/25 py-2 text-center"><p className="text-[10px] text-amber-400">d20</p><p className="font-heading text-xl text-amber-100">{roll.result}</p></div>)}
        </div>
        <div className="rounded-lg bg-slate-800/70 px-3 py-2 flex items-center justify-between"><span className="text-xs text-slate-400">Total</span><span className="font-heading text-xl text-amber-300">{reward.diceResult?.total}</span></div>
        <div className="rounded-xl border border-amber-600/50 bg-amber-950/20 p-3">
          <p className="text-[10px] uppercase tracking-widest text-amber-400">{reward.tier?.name}</p>
          <p className="text-base font-medium text-amber-100 mt-1">{reward.name}</p>
          <div className="mt-2"><BonusLine bonus={reward.bonus} /></div>
          <p className="text-[11px] text-slate-400 mt-2">Pieza única generada por los tres resultados. No puede venderse.</p>
        </div>
      </div>
    );
  } else if (reward.kind === "item") {
    const a = ACCESSORIES[reward.accessoryId];
    title = "¡Accesorio encontrado!";
    accent = RARITY_COLOR[a.rarity];
    body = (
      <div className="space-y-2">
        <div className="flex items-center gap-2"><GIcon name="gem" size={22} /><span className="text-lg font-semibold">{a.name}</span><span className={`text-[10px] uppercase tracking-wider ml-auto px-2 py-0.5 rounded-full border ${RARITY_COLOR[a.rarity]}`}>{a.rarity}</span></div>
        <p className="text-xs text-slate-300">{a.desc}</p>
        <div className="rounded-lg bg-slate-800/60 px-3 py-2 flex items-center justify-between"><span className="text-[11px] text-slate-400">Estadísticas</span><BonusLine bonus={a.bonus} /></div>
      </div>
    );
  } else if (reward.kind === "gold") {
    title = "Oro del cofre"; icon = "coin";
    body = <p className="text-sm text-slate-200">Encuentras <span className="text-amber-300 font-semibold">+{reward.amount}</span> de oro.</p>;
  } else if (reward.kind === "material") {
    title = "Material del cofre"; icon = "gem"; accent = "border-violet-500";
    body = <p className="text-sm text-slate-200">Obtienes <span className="text-violet-300 font-semibold">{reward.name}</span>.</p>;
  } else if (reward.kind === "consumable") {
    title = "Consumible del cofre"; icon = "droplet"; accent = "border-emerald-500";
    body = <p className="text-sm text-slate-200">Obtienes <span className="text-emerald-300 font-semibold">{reward.name}</span>.</p>;
  } else if (reward.kind === "heal") {
    title = "Cofre de curación"; icon = "heart"; accent = "border-emerald-500";
    body = <p className="text-sm text-slate-200">Recuperas <span className="text-emerald-300 font-semibold">+{reward.amount}</span> de vida.</p>;
  } else {
    title = "¡Trampa!"; icon = "triangle"; accent = "border-red-500";
    body = <p className="text-sm text-slate-200">Recibes <span className="text-red-300 font-semibold">-{reward.amount}</span> de daño.</p>;
  }

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur px-4" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`rounded-2xl bg-slate-900 border-2 ${accent} max-w-sm w-full p-5 shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2"><GIcon name={icon} size={16} /> {title}</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button></div>
        {body}
        <button onClick={onClose} className="w-full mt-4 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-sm font-medium transition">Continuar</button>
      </div>
    </div>
  );
}
