import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, ScrollText } from "lucide-react";

export default function ActionLog({ entries }) {
  const [collapsed, setCollapsed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-slate-800/50 transition"
      >
        <span className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase">
          <ScrollText className="w-4 h-4" /> Historial
        </span>
        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
      {!collapsed && (
        <div ref={ref} style={{ maxHeight: 180 }} className="overflow-y-auto px-4 pb-4 space-y-1.5">
          {entries.length === 0 && <p className="text-xs text-slate-500 py-2">Sin acciones todavía. Explora la red de rombos.</p>}
          {entries.map((e, i) => (
            <p key={i} className="text-[13px] leading-snug text-slate-300 border-l-2 border-slate-700 pl-2">{e}</p>
          ))}
        </div>
      )}
    </div>
  );
}