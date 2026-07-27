import React from "react";
import { GIcon } from "@/lib/atlasIcons";

const STYLE = {
  levelup: { icon: "star", color: "text-amber-300", border: "border-amber-500/60", bg: "bg-amber-950/70" },
  mission: { icon: "scroll", color: "text-sky-300", border: "border-sky-500/60", bg: "bg-sky-950/70" },
  item: { icon: "gem", color: "text-fuchsia-300", border: "border-fuchsia-500/60", bg: "bg-fuchsia-950/70" },
  equip: { icon: "shield", color: "text-emerald-300", border: "border-emerald-500/60", bg: "bg-emerald-950/70" },
  gold: { icon: "coin", color: "text-yellow-300", border: "border-yellow-500/60", bg: "bg-yellow-950/70" },
  heal: { icon: "heart", color: "text-emerald-300", border: "border-emerald-500/60", bg: "bg-emerald-950/70" },
  trap: { icon: "triangle", color: "text-red-300", border: "border-red-500/60", bg: "bg-red-950/70" },
  kill: { icon: "swords", color: "text-rose-300", border: "border-rose-500/60", bg: "bg-rose-950/70" },
  boss: { icon: "crown", color: "text-amber-300", border: "border-amber-400/70", bg: "bg-amber-900/70" },
  cap: { icon: "lock", color: "text-slate-300", border: "border-slate-500/60", bg: "bg-slate-800/80" },
  info: { icon: "info", color: "text-slate-200", border: "border-slate-600/60", bg: "bg-slate-800/80" },
};

export default function FeedbackToasts({ toasts, compact = false }) {
  if (!toasts?.length) return null;
  const visible = compact ? toasts.slice(-1) : toasts.slice(-3);
  return (
    <div className={`atlas-feedback-toasts fixed top-3 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center pointer-events-none w-full px-3 ${compact ? "max-w-xs gap-1" : "max-w-sm gap-2"}`}>
      {visible.map(t => {
        const st = STYLE[t.kind] || STYLE.info;
        const rowCls = `w-full rounded-xl border ${st.border} ${st.bg} backdrop-blur flex items-center shadow-lg atlas-toast-in ${compact ? "px-2.5 py-1.5 gap-2" : "px-3.5 py-2.5 gap-2.5"}`;
        const textCls = `${compact ? "text-xs" : "text-sm"} font-medium ${st.color}`;
        return (
          <div key={t.id} className={rowCls}>
            <GIcon name={st.icon} size={compact ? 15 : 18} />
            <span className={textCls}>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}