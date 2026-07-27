import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShrineNotify({ data, onDone }) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => doneRef.current?.(), 3400);
    return () => clearTimeout(t);
  }, [data]);
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none w-full max-w-sm px-4"
        >
          <div className="rounded-xl border border-teal-400/60 bg-slate-950/90 backdrop-blur px-4 py-2.5 text-center shadow-xl">
            <p className="text-[10px] uppercase tracking-widest text-teal-400/80 mb-0.5">Evento</p>
            <p className="text-sm text-teal-100 font-medium leading-snug">{data.message}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Santuario de Atlas descubierto</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}