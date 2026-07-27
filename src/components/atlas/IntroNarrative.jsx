import React, { useState, useEffect } from "react";
import { INTRO_LINES } from "@/lib/atlasLore";

export default function IntroNarrative({ onDone }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const line = INTRO_LINES[idx];
  const isLast = idx === INTRO_LINES.length - 1;

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [idx]);

  const next = () => {
    if (isLast) { setLeaving(true); setTimeout(onDone, 480); }
    else setIdx(i => i + 1);
  };
  const skip = () => { setLeaving(true); setTimeout(onDone, 480); };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-slate-950 transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(94,234,212,0.06), transparent 60%), radial-gradient(circle at 70% 30%, rgba(167,139,250,0.05), transparent 55%)" }} />
      <button onClick={skip} className="absolute top-5 right-6 text-xs text-slate-600 hover:text-slate-400 transition z-10">Saltar intro ✕</button>
      <div className="relative max-w-xl w-full px-8 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
            <span className="absolute rounded-full animate-pulse" style={{ width: 72, height: 72, background: "radial-gradient(circle, rgba(94,234,212,0.35), transparent 70%)" }} />
            <span className="absolute rounded-full border border-teal-400/40" style={{ width: 52, height: 52 }} />
            <span className="relative font-display text-xl text-teal-300">✦</span>
          </div>
        </div>
        <p className={`text-[10px] tracking-[0.5em] uppercase text-teal-500/70 mb-6 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>Proyecto Atlas</p>
        <p className={`font-display text-lg md:text-2xl leading-relaxed text-slate-100 min-h-[4.5em] transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
          {line}
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="flex gap-1.5">
            {INTRO_LINES.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-teal-400" : i < idx ? "w-1.5 bg-teal-700" : "w-1.5 bg-slate-700"}`} />
            ))}
          </div>
        </div>
        <button onClick={next} className="mt-8 rounded-xl bg-teal-600/90 hover:bg-teal-500 px-8 py-2.5 text-sm font-medium text-slate-900 transition">
          {isLast ? "Comenzar" : "Continuar"}
        </button>
      </div>
    </div>
  );
}