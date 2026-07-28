import React from "react";
import { motion } from "framer-motion";
import { SHRINE_TYPES } from "@/lib/atlasShrines";
import { SANCTUARIES } from "@/lib/atlasSanctuaries";

const REGION_LABELS = { verde: "Reino Verde", fria: "Reino Ártico", desierto: "Reino Árido" };

export default function ShrineModal({ data, onActivate, onClose, onTravel, onRest, activatedSanctuaries, unlockedSanctuaries, unlockedRegions, lastActivatedSanctuaryId }) {
  if (!data) return null;

  // ── SANTUARIO-PORTAL: menú de viaje rápido ──
  if (data.isSanctuary) {
    const sanctuary = data.sanctuary;
    const isActivated = activatedSanctuaries?.has(sanctuary?.id) || data.activated;
    const regionUnlocked = (rid) => !rid || rid === "verde" || unlockedRegions?.has(rid);
    const travelDestinations = SANCTUARIES.filter(s =>
      (unlockedSanctuaries?.has(s.id)) && s.id !== sanctuary?.id && regionUnlocked(s.regionId)
    ).sort((a, b) => {
      const ord = { verde: 0, fria: 1, desierto: 2 };
      return (ord[a.regionId] ?? 9) - (ord[b.regionId] ?? 9);
    });
    const byRegion = {};
    for (const d of travelDestinations) (byRegion[d.regionId] ||= []).push(d);

    return (
      <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 14 }}
          className="rounded-2xl bg-slate-900 border border-cyan-600 p-6 max-w-md w-full"
          style={{ boxShadow: "0 0 32px -8px rgba(34,211,238,0.4)" }}
        >
          <div className="flex justify-center mb-3">
            <div className="relative flex items-center justify-center" style={{ width: 56, height: 56 }}>
              <span className="absolute rounded-full animate-pulse" style={{ width: 56, height: 56, background: "radial-gradient(circle, rgba(34,211,238,0.5), transparent 70%)" }} />
              <span className="absolute rounded-full border-2 border-cyan-400" style={{ width: 42, height: 42 }} />
              <span className="absolute rounded-full border border-cyan-500/50" style={{ width: 30, height: 30 }} />
              <span className="relative font-display text-lg text-cyan-300">◈</span>
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-1 text-cyan-300 text-center">Portal de Invocación</h2>
          <p className="text-xs text-slate-300 mb-1 text-center">{sanctuary?.destinationName || "Santuario"}</p>
          <p className="text-[11px] text-slate-500 mb-4 text-center">{REGION_LABELS[sanctuary?.regionId] || ""}</p>

          {!isActivated ? (
            <div className="text-center">
              <p className="text-sm text-slate-300 mb-4">El portal responde con un brillo tenue. Actívalo para anclar tu vínculo y habilitar el viaje rápido.</p>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-sm text-slate-200">Alejarse</button>
                <button onClick={onActivate} className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-sm font-medium text-slate-900">Activar Portal</button>
              </div>
            </div>
          ) : (
            <div>
              {lastActivatedSanctuaryId === sanctuary?.id && (
                <p className="text-[11px] text-cyan-400/70 mb-2 text-center">★ Punto de reaparición actual</p>
              )}
              <p className="text-xs text-slate-400 mb-2 text-center">Viaja rápidamente a otro portal activado:</p>
              {travelDestinations.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center mb-4">No hay otros portales activados todavía.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {Object.keys(byRegion).map(rid => (
                    <div key={rid}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 mb-1.5 px-1">{REGION_LABELS[rid] || rid}</p>
                      <div className="space-y-1.5">
                        {byRegion[rid].map(dest => (
                          <button
                            key={dest.id}
                            onClick={() => onTravel?.(dest.id)}
                            className="w-full flex items-center justify-between rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-600 px-3 py-2 text-left transition"
                          >
                            <div>
                              <p className="text-sm text-slate-200">{dest.destinationName}</p>
                              <p className="text-[10px] text-slate-500">{dest.settlementType === "campamento" ? "Campamento" : dest.settlementType === "pueblo" ? "Pueblo" : "Ciudad"}</p>
                            </div>
                            <span className="text-cyan-400 text-xs">Viajar →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => onRest?.()} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-sm font-medium text-white mb-2">Descansar en el santuario</button>
              <button onClick={onClose} className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-sm text-slate-200">Cerrar</button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ── SANTUARIO MENOR (normal/antiguo/corrupto) ──
  const t = SHRINE_TYPES[data.type] || SHRINE_TYPES.normal;
  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur px-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 14 }}
        className="rounded-2xl bg-slate-900 border p-6 max-w-sm w-full text-center"
        style={{ borderColor: t.color, boxShadow: `0 0 32px -8px ${t.glow}` }}
      >
        <div className="flex justify-center mb-3">
          <div className="relative flex items-center justify-center" style={{ width: 56, height: 56 }}>
            <span className="absolute rounded-full animate-pulse" style={{ width: 56, height: 56, background: `radial-gradient(circle, ${t.glow}, transparent 70%)` }} />
            <span className="absolute rounded-full border-2" style={{ width: 42, height: 42, borderColor: t.color }} />
            <span className="relative font-display text-lg" style={{ color: t.color }}>✦</span>
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: t.color }}>{t.name}</h2>
        <p className="text-xs text-slate-300 mb-4">{t.desc}</p>
        {data.lore && (
          <p className="text-sm italic mb-4 px-2" style={{ color: t.color }}>«{data.lore}»</p>
        )}
        {data.activated && !data.lore && (
          <p className="text-[11px] text-slate-500 mb-4">Ya has registrado tu paso aquí. El mundo conserva tu historia.</p>
        )}
        <div className="flex gap-2">
          {!data.activated && !data.lore && (
            <>
              <button onClick={onClose} className="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-sm text-slate-200">Alejarse</button>
              <button onClick={onActivate} className="flex-1 rounded-xl py-2.5 text-sm font-medium text-slate-900" style={{ background: t.color }}>
                {data.type === "corrupted" ? "Acercarse" : "Registrar tu paso"}
              </button>
            </>
          )}
          {data.lore && (
            <button onClick={onClose} className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-sm text-slate-200">Continuar</button>
          )}
          {data.activated && !data.lore && (
            <button onClick={onClose} className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-sm text-slate-200">Cerrar</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}