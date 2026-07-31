import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { X, ScrollText, Star, Circle, Trophy, MapPin, Coins, CheckCircle2, AlertTriangle } from "lucide-react";
import { getNpcNameByRole } from "@/lib/atlasSettlementNpcs";
import { getRegionLayout } from "@/lib/atlasRegionSectors";
import { getCurrentObjective, getCurrentObjectiveText, getMissionProgressLabel } from "@/lib/atlasMissionEngine";

export default function MissionJournal({ missions, missionDefs, region, priorityMissionId, onSetActive, onSetPriority, specialQuests = [], onAcceptSpecialQuest, onClaimSpecialQuest, onClose }) {
  const flat = useMemo(() => {
    const m = {};
    for (const sec of Object.keys(missionDefs || {})) for (const d of missionDefs[sec]) m[d.id] = d;
    return m;
  }, [missionDefs]);

  const all = Object.entries(missions || {}).map(([id, m]) => ({ id, m, def: flat[id] })).filter(x => x.def);
  const active = all.filter(x => x.m.active && x.m.status !== "done");
  const available = all.filter(x => x.m.accepted && !x.m.active && x.m.status !== "done");
  const completed = all.filter(x => x.m.status === "done");
  const visibleSpecialQuests = (specialQuests || []).filter((entry) => entry?.state?.status && entry.state.status !== "LOCKED");

  const rewardText = (r) => {
    if (!r) return "—";
    const parts = [];
    if (r.gold) parts.push(`${r.gold} oro`);
    if (r.xp) parts.push("XP");
    if (r.potion) parts.push("poción");
    if (r.item) parts.push("objeto");
    return parts.join(" · ") || "—";
  };
  const progressText = (x) => getMissionProgressLabel(x.def, x.m);

  const missionLocation = (x) => {
    const giver = getNpcNameByRole(x.def.sector, x.def.role, region);
    if (x.m.status === "ready") return { giver, target: `Entrega: ${giver}` };
    const objective = getCurrentObjective(x.def, x.m);
    if (!objective) return { giver, target: null };
    const layout = getRegionLayout(region?.id || "verde");
    const sector = objective.sectorId ? layout?.sectors?.[objective.sectorId] : null;
    const place = sector?.name || objective.sectorId || null;
    if (objective.type === "talk") {
      const targetNpc = getNpcNameByRole(objective.npcSector, objective.npcRole, region);
      return { giver, target: `Destino: ${targetNpc}${place ? ` · ${place}${objective.sectorId ? ` (${objective.sectorId})` : ""}` : ""}` };
    }
    return { giver, target: place ? `Destino: ${place}${objective.sectorId ? ` (${objective.sectorId})` : ""}` : null };
  };

  const Row = ({ x }) => {
    const isPrio = priorityMissionId === x.id;
    const location = missionLocation(x);
    return (
      <div className={`rounded-lg border p-2.5 ${isPrio ? "border-amber-400 bg-amber-400/5" : x.m.status === "done" ? "border-slate-800 bg-slate-900/40" : "border-slate-700 bg-slate-800/50"}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-100 truncate">{x.def.name}</span>
          {isPrio && <Star className="w-3 h-3 text-amber-300 shrink-0" />}
          {x.m.status === "done" && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
        </div>
        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{x.def.desc}</p>
        {x.m.status !== "done" && (
          <p className="text-[10px] text-sky-200 leading-snug mt-1 rounded-md bg-sky-950/30 border border-sky-900/50 px-2 py-1">
            <span className="text-sky-400">Objetivo actual:</span> {getCurrentObjectiveText(x.def, x.m)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[9px] text-slate-400">
          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {region?.name || "—"}</span>
          <span>{progressText(x)}</span>
          <span className="flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" /> {rewardText(x.def.reward)}</span>
          <span>Encargo: {location.giver}</span>
          {location.target && <span className="text-cyan-300">{location.target}</span>}
        </div>
        {x.m.status !== "done" && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {x.m.accepted && x.m.active && !isPrio && <button onClick={() => onSetPriority(x.id)} className="text-[10px] rounded bg-amber-600 hover:bg-amber-500 px-2 py-1 text-white">Prioridad</button>}
            {x.m.accepted && x.m.active && <button onClick={() => onSetActive(x.id, false)} className="text-[10px] rounded bg-slate-700 hover:bg-slate-600 px-2 py-1 text-slate-200">Desactivar</button>}
            {x.m.accepted && !x.m.active && <button onClick={() => onSetActive(x.id, true)} className="text-[10px] rounded bg-emerald-600 hover:bg-emerald-500 px-2 py-1 text-white">Activar</button>}
            {x.m.status === "ready" && <span className="text-[10px] text-emerald-300 self-center">Reclamar con el NPC</span>}
          </div>
        )}
      </div>
    );
  };

  const SpecialRow = ({ entry }) => {
    const { def, state } = entry;
    return (
      <div className="rounded-lg border border-fuchsia-700/50 bg-fuchsia-950/15 p-2.5">
        <div className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-fuchsia-300" /><span className="text-xs font-semibold text-fuchsia-100">{def.title}</span></div>
        <p className="mt-1 text-[10px] italic leading-snug text-fuchsia-200/70">{def.rumorText}</p>
        <div className="mt-1 flex flex-wrap gap-2 text-[9px] text-slate-400"><span>{def.objective?.text}: {state.progress || 0}/{def.objective?.count || 1}</span><span>Recompensa: desconocida</span><span>{def.persistenceType === "persistent" ? "Persistente" : "Condicional"}</span></div>
        <div className="mt-2">
          {state.status === "AVAILABLE" && <button onClick={() => onAcceptSpecialQuest?.(def.id)} className="rounded bg-fuchsia-700 px-2 py-1 text-[10px] text-white">Investigar</button>}
          {state.status === "ACTIVE" && <span className="text-[10px] text-fuchsia-200">Activa</span>}
          {state.status === "READY" && <button onClick={() => onClaimSpecialQuest?.(def.id)} className="rounded bg-emerald-600 px-2 py-1 text-[10px] text-white">Completar</button>}
          {state.status === "COMPLETED" && <span className="flex items-center gap-1 text-[10px] text-emerald-300"><CheckCircle2 className="h-3 w-3" /> Completada</span>}
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-950/92 backdrop-blur flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
        <h2 className="flex items-center gap-2 text-sm font-heading text-slate-100"><ScrollText className="w-5 h-5 text-amber-300" /> Diario de Misiones</h2>
        <button onClick={onClose} className="text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4 max-w-lg w-full mx-auto">
        <section>
          <h3 className="text-[11px] font-semibold text-amber-300 mb-1.5 flex items-center gap-1"><Star className="w-3 h-3" /> Activas ({active.length}/3)</h3>
          <div className="space-y-1.5">{active.length ? active.map(x => <Row key={x.id} x={x} />) : <p className="text-[10px] text-slate-500">Ninguna misión activa. Activa una desde «Disponibles».</p>}</div>
        </section>
        <section>
          <h3 className="text-[11px] font-semibold text-sky-300 mb-1.5 flex items-center gap-1"><Circle className="w-3 h-3" /> Disponibles</h3>
          <div className="space-y-1.5">{available.length ? available.map(x => <Row key={x.id} x={x} />) : <p className="text-[10px] text-slate-500">Acepta misiones hablando con los NPCs de los asentamientos.</p>}</div>
        </section>
        {visibleSpecialQuests.length > 0 && <section>
          <h3 className="text-[11px] font-semibold text-fuchsia-300 mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Especiales / Amenaza</h3>
          <div className="space-y-1.5">{visibleSpecialQuests.map((entry) => <SpecialRow key={entry.def.id} entry={entry} />)}</div>
        </section>}
        <section>
          <h3 className="text-[11px] font-semibold text-emerald-300 mb-1.5 flex items-center gap-1"><Trophy className="w-3 h-3" /> Completadas ({completed.length})</h3>
          <div className="space-y-1.5">{completed.map(x => <Row key={x.id} x={x} />)}</div>
        </section>
      </div>
      <p className="text-[9px] text-slate-500 text-center py-2 border-t border-slate-800 shrink-0">La brújula sigue la misión marcada como prioridad. Máximo 3 activas.</p>
    </motion.div>
  );
}