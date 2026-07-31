import React from "react";
import { Shield, ScrollText, AlertTriangle, Lock, CheckCircle2, Play, Gift, Crown, Dna } from "lucide-react";

const STATUS_LABEL = {
  LOCKED: "Bloqueado",
  AVAILABLE: "Disponible",
  ACTIVE: "En curso",
  READY: "Listo",
  COMPLETED: "Completado",
  OPEN: "Abierto",
};

function ProgressBar({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round(((value || 0) / Math.max(1, max || 1)) * 100)));
  return <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} /></div>;
}

function ContractCard({ entry, onAccept, onClaim }) {
  const { def, state } = entry;
  const count = def.objective?.count || 1;
  const locked = state.status === "LOCKED";
  return (
    <article className={`rounded-xl border p-3 ${state.status === "READY" ? "border-emerald-500/60 bg-emerald-950/20" : "border-slate-700 bg-slate-900/60"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-100">{def.title}</h4>
          <p className="mt-1 text-[11px] leading-snug text-slate-400">{def.description}</p>
        </div>
        <span className="shrink-0 rounded-full border border-slate-700 bg-slate-950/70 px-2 py-1 text-[9px] uppercase tracking-wide text-slate-300">{STATUS_LABEL[state.status] || state.status}</span>
      </div>
      {!locked && state.status !== "COMPLETED" && (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[10px] text-slate-400"><span>{def.objective?.text}</span><span>{state.progress || 0}/{count}</span></div>
          <ProgressBar value={state.progress} max={count} />
        </div>
      )}
      <p className="mt-2 text-[10px] italic text-amber-200/80">{def.rewardHint}</p>
      <div className="mt-3">
        {state.status === "AVAILABLE" && <button type="button" onClick={() => onAccept?.(def.id)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-2 text-xs font-medium text-white active:bg-sky-500"><Play className="h-3.5 w-3.5" /> Aceptar contrato</button>}
        {state.status === "READY" && <button type="button" onClick={() => onClaim?.(def.id)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-xs font-medium text-white active:bg-emerald-500"><Gift className="h-3.5 w-3.5" /> Reclamar resultado</button>}
        {state.status === "COMPLETED" && <p className="flex items-center gap-1.5 text-[11px] text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Registrado en el historial del Gremio</p>}
        {locked && <p className="flex items-center gap-1.5 text-[11px] text-slate-500"><Lock className="h-3.5 w-3.5" /> Completa la Región 3 para acceder.</p>}
      </div>
    </article>
  );
}

function SpecialQuestCard({ entry, onAccept, onClaim }) {
  const { def, state } = entry;
  if (state.status === "LOCKED") return null;
  return (
    <article className="rounded-xl border border-fuchsia-700/45 bg-fuchsia-950/15 p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-300" />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-fuchsia-100">{def.title}</h4>
          <p className="mt-1 text-[11px] italic leading-snug text-fuchsia-200/70">{def.rumorText}</p>
          <p className="mt-2 text-[10px] text-slate-400">Recompensa: desconocida · {def.persistenceType === "persistent" ? "Persistente" : "Condicional"}</p>
          {state.status !== "COMPLETED" && <p className="mt-1 text-[10px] text-slate-300">{def.objective?.text}: {state.progress || 0}/{def.objective?.count || 1}</p>}
          <div className="mt-2">
            {state.status === "AVAILABLE" && <button type="button" onClick={() => onAccept?.(def.id)} className="rounded-lg bg-fuchsia-700 px-3 py-2 text-xs text-white">Investigar</button>}
            {state.status === "READY" && <button type="button" onClick={() => onClaim?.(def.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white">Completar misión</button>}
            {state.status === "ACTIVE" && <span className="text-[10px] text-fuchsia-200">Misión registrada y activa</span>}
            {state.status === "COMPLETED" && <span className="text-[10px] text-emerald-300">Misión completada</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HubGuild({ progressionState, progressionDisplay, onAcceptContract, onClaimContract, onAcceptSpecialQuest, onClaimSpecialQuest }) {
  const guildOpen = progressionDisplay?.guildOpen;
  const guild = progressionState?.guild || {};
  const specials = (progressionDisplay?.specialQuests || []).filter((entry) => entry.state.status !== "LOCKED");
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4">
      <section className={`rounded-2xl border p-4 ${guildOpen ? "border-amber-600/45 bg-amber-950/15" : "border-slate-700 bg-slate-900/60"}`}>
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-600/40 bg-slate-950/70"><Shield className="h-5 w-5 text-amber-300" /></div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-100">Gremio de Aventureros</h3>
            {guildOpen ? <p className="text-xs text-slate-400">Rango {guild.rank || 1} · Reputación {guild.reputation || 0}</p> : <p className="text-xs text-slate-400">Se desbloquea al completar la Región 3.</p>}
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">El Gremio organiza contratos, rumores, entrenadores y pruebas. El nivel habilita oportunidades, pero el mundo entrega el poder.</p>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-300"><ScrollText className="h-4 w-4" /> Contratos</h3>
        <div className="space-y-2">{(progressionDisplay?.contracts || []).map((entry) => <ContractCard key={entry.def.id} entry={entry} onAccept={onAcceptContract} onClaim={onClaimContract} />)}</div>
      </section>

      {specials.length > 0 && <section>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-fuchsia-300"><AlertTriangle className="h-4 w-4" /> Especiales / Amenaza</h3>
        <div className="space-y-2">{specials.map((entry) => <SpecialQuestCard key={entry.def.id} entry={entry} onAccept={onAcceptSpecialQuest} onClaim={onClaimSpecialQuest} />)}</div>
      </section>}

      <section className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-orange-300"><Crown className="h-4 w-4" /> Ascenso de clase</div><p className="mt-1 text-[10px] text-slate-400">Estado: {progressionState?.classAscension?.status || "LOCKED"}. Se habilita después de Región 5.</p></div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-violet-300"><Dna className="h-4 w-4" /> Evolución racial</div><p className="mt-1 text-[10px] text-slate-400">Preparación en Región 7 y despertar al final de Región 8.</p></div>
      </section>
    </div>
  );
}
