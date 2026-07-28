import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Swords, Crown } from "lucide-react";

export default function CombatAudioIntro({ intro }) {
  return (
    <AnimatePresence>
      {intro && (
        <motion.div
          key={intro.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[58] pointer-events-none flex items-center justify-center bg-slate-950/45 backdrop-blur-[1px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, y: -8 }}
            transition={{ duration: intro.boss ? 0.55 : 0.3, ease: "easeOut" }}
            className={`mx-4 w-full max-w-lg rounded-2xl border px-5 py-4 text-center shadow-2xl ${intro.boss ? "bg-emerald-950/90 border-emerald-500/60" : intro.elite ? "bg-amber-950/90 border-amber-500/60" : "bg-slate-950/88 border-slate-600/70"}`}
          >
            <div className="flex items-center justify-center gap-2 text-[10px] tracking-[0.32em] uppercase font-semibold mb-2 text-slate-300">
              {intro.boss ? <Crown className="w-4 h-4 text-emerald-300" /> : intro.elite ? <Skull className="w-4 h-4 text-amber-300" /> : <Swords className="w-4 h-4 text-red-300" />}
              {intro.label}
            </div>
            <h2 className={`font-heading tracking-wide ${intro.boss ? "text-3xl text-emerald-100" : "text-2xl text-white"}`}>{intro.name}</h2>
            {intro.title && <p className="mt-2 text-xs text-slate-300">{intro.title}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
