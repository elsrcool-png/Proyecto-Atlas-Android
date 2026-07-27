import React from "react";
import { Moon } from "lucide-react";

export default function RestSequence({ label, onComplete }) {
  const [stage, setStage] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 550);
    const t2 = setTimeout(() => setStage(2), 2100);
    const t3 = setTimeout(() => onComplete?.(), 2950);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const opacity = stage === 0 ? 0.94 : stage === 1 ? 1 : stage === 2 ? 0.94 : 0;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: "#04050a", opacity, transition: "opacity 0.55s ease" }}>
      <div className="text-center text-slate-200">
        {stage < 2 ? (
          <>
            <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-slate-800 border border-indigo-400/50 flex items-center justify-center animate-pulse" style={{ boxShadow: "0 0 22px 6px rgba(129,140,248,0.35)" }}>
              <Moon className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="font-heading text-sm tracking-[0.3em]">DESCANSANDO</p>
            <p className="text-[11px] text-slate-400 mt-1.5">El tiempo avanza en Atlas…</p>
            <p className="mt-3 text-2xl text-indigo-200/80 animate-pulse tracking-widest">z z z</p>
            <button onClick={() => onComplete?.()} className="mt-6 px-4 py-2 rounded-lg bg-indigo-600 text-white pointer-events-auto">Omitir descanso</button>
          </>
        ) : (
          <>
            <p className="font-heading text-lg text-amber-200" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>12 horas después</p>
            <p className="text-xs text-slate-200 mt-1">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}