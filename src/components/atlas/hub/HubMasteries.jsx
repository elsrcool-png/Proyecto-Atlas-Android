import React from "react";
import { Sparkles, Lock, Sword, ShieldCheck, RotateCcw, ArrowUpCircle } from "lucide-react";

const ACTIVE_SLOT_LABEL = { classAbility: "Técnica", hybrid: "Fuerza / Híbrida", definitive: "Culminante" };
const PASSIVE_SLOT_LABEL = { passive1: "Pasiva I", passive2: "Pasiva II" };

export default function HubMasteries({ progressionState, progressionDisplay, onEquipActive, onEquipPassive, onUpgradeSkill }) {
  const guildOpen = progressionDisplay?.guildOpen;
  const learned = progressionDisplay?.learnedSkills || [];
  const activeSkills = learned.filter((skill) => skill.category === "active");
  const passiveSkills = learned.filter((skill) => skill.category === "passive");
  const equippedActive = progressionState?.masteries?.equippedActive || {};
  const equippedPassive = progressionState?.masteries?.equippedPassive || {};

  if (!guildOpen) return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 text-center">
      <Lock className="mx-auto h-10 w-10 text-slate-600" />
      <h3 className="mt-3 text-base font-semibold text-slate-200">Maestrías bloqueadas</h3>
      <p className="mt-2 text-xs text-slate-400">Completa la Región 3 y abre el Gremio. Las Regiones 1–3 conservan su progresión actual sin cambios.</p>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4">
      <section className="rounded-2xl border border-violet-700/40 bg-violet-950/15 p-4">
        <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-300" /><h3 className="text-base font-semibold text-slate-100">Registro de Maestrías</h3></div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">Aprender registra una técnica permanentemente. Equipar cambia la configuración. Evolucionar exige uso demostrado y contratos del mundo.</p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-300"><Sword className="h-4 w-4" /> Espacios activos</h3>
        <div className="space-y-2">
          {Object.entries(ACTIVE_SLOT_LABEL).map(([slot, label]) => {
            const current = equippedActive[slot];
            const candidates = activeSkills.filter((skill) => skill.slot === slot);
            return <div key={slot} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-200">{label}</span><span className="text-[10px] text-slate-500">{current ? learned.find((skill) => skill.id === current)?.name : "Técnica original"}</span></div>
              <div className="mt-2 flex flex-wrap gap-2">
                {current && <button type="button" onClick={() => onEquipActive?.(slot, current)} className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-[10px] text-slate-200"><RotateCcw className="h-3 w-3" /> Restaurar original</button>}
                {candidates.map((skill) => <button key={skill.id} type="button" onClick={() => onEquipActive?.(slot, skill.id)} className={`rounded-lg border px-2.5 py-1.5 text-[10px] ${current === skill.id ? "border-violet-400 bg-violet-700 text-white" : "border-slate-600 bg-slate-800 text-slate-200"}`}>{skill.name} · R{skill.rank || 1}</button>)}
                {!candidates.length && <span className="text-[10px] text-slate-500">Aún no conoces técnicas alternativas para este espacio.</span>}
              </div>
            </div>;
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-300"><ShieldCheck className="h-4 w-4" /> Espacios pasivos</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(PASSIVE_SLOT_LABEL).map(([slot, label]) => <div key={slot} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <div className="text-xs font-semibold text-slate-200">{label}</div>
            <div className="mt-2 space-y-1.5">
              {passiveSkills.map((skill) => <button key={skill.id} type="button" onClick={() => onEquipPassive?.(slot, skill.id)} className={`w-full rounded-lg border px-2.5 py-2 text-left text-[10px] ${equippedPassive[slot] === skill.id ? "border-emerald-400 bg-emerald-800/70 text-white" : "border-slate-600 bg-slate-800 text-slate-200"}`}><span className="block font-medium">{skill.name} · R{skill.rank || 1}</span><span className="block text-slate-400">{skill.desc}</span></button>)}
              {equippedPassive[slot] && <button type="button" onClick={() => onEquipPassive?.(slot, equippedPassive[slot])} className="w-full rounded-lg border border-slate-700 bg-slate-950/60 py-1.5 text-[10px] text-slate-400">Retirar pasiva</button>}
              {!passiveSkills.length && <p className="text-[10px] text-slate-500">Supera contratos para aprender pasivas.</p>}
            </div>
          </div>)}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-300">Conocimientos registrados</h3>
        <div className="space-y-2">
          {learned.map((skill) => {
            const progress = skill.progress || { rank: 1, uses: 0 };
            const requirement = skill.upgradeRequirement;
            const atMax = progress.rank >= (skill.maxRank || 1);
            return <article key={skill.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-slate-100">{skill.name}</span><span className="text-[9px] uppercase text-violet-300">Rango {progress.rank}/{skill.maxRank || 1}</span></div>
              <p className="mt-1 text-[10px] text-slate-400">{skill.desc}</p>
              {requirement && !atMax && <div className="mt-2 rounded-lg bg-slate-950/60 px-2.5 py-2 text-[9px] text-slate-400"><div>Dominio: {progress.uses}/{requirement.uses || 0} usos</div><div>Prueba: completar «Registro de mazmorra»</div></div>}
              <div className="mt-2 flex items-center justify-between gap-2"><p className="text-[9px] text-slate-500">Fuente: {skill.source}</p>{!atMax && <button type="button" onClick={() => onUpgradeSkill?.(skill.id)} disabled={!skill.canUpgrade} title={skill.upgradeReason || "Evolucionar"} className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[9px] ${skill.canUpgrade ? "border-violet-400 bg-violet-700 text-white" : "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"}`}><ArrowUpCircle className="h-3 w-3" /> Evolucionar</button>}</div>
            </article>;
          })}
          {!learned.length && <p className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-xs text-slate-500">El registro está vacío. La prueba de ingreso del Gremio es el primer paso.</p>}
        </div>
      </section>
    </div>
  );
}
