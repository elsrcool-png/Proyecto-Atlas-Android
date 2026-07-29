import React, { useState, useEffect, useRef } from "react";
import MetalDie from "./MetalDie";

export default function DiceRoll({ diceResult, label, onComplete, isEnemy = false }) {
  const [display, setDisplay] = useState(() => diceResult.rolls.map(() => 1));
  const [settled, setSettled] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    completedRef.current = false;
    setSettled(false);
    setDisplay(diceResult.rolls.map(d => Math.floor(Math.random() * d.sides) + 1));
    let count = 0;
    const interval = setInterval(() => {
      setDisplay(diceResult.rolls.map(d => Math.floor(Math.random() * d.sides) + 1));
      count++;
      if (count >= 15) { clearInterval(interval); setDisplay(diceResult.rolls.map(d => d.result)); setSettled(true); }
    }, 70);
    return () => clearInterval(interval);
  }, [diceResult]);

  useEffect(() => {
    if (!settled) return;
    const t = setTimeout(() => { if (!completedRef.current) { completedRef.current = true; onCompleteRef.current(); } }, 1300);
    return () => clearTimeout(t);
  }, [settled]);

  const handleClick = () => { if (settled && !completedRef.current) { completedRef.current = true; onCompleteRef.current(); } };

  const range = diceResult.max - diceResult.min;
  const pct = range > 0 ? (diceResult.total - diceResult.min) / range : 0.5;
  const ring = pct <= 0.33 ? "#ef4444" : pct <= 0.66 ? "#f59e0b" : "#10b981";
  const accent = isEnemy ? "#dc2626" : ring;
  const borderColor = isEnemy ? "border-red-800" : "border-slate-700";
  const labelText = isEnemy ? `⚔ ${label}` : label;
  const labelColor = isEnemy ? "text-red-300" : "text-slate-400";
  const posClass = isEnemy ? "right-2" : "left-2";
  const numDice = diceResult.rolls.length;
  const dieSize = numDice <= 1 ? 64 : numDice <= 2 ? 52 : numDice <= 3 ? 44 : 38;

  return (
    <div className={`fixed ${posClass} top-1/2 -translate-y-1/2 z-[65] pointer-events-auto`} onClick={handleClick}>
      <div className={`flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900/80 backdrop-blur border ${borderColor} px-2.5 py-3 shadow-xl`} style={isEnemy ? { boxShadow: `0 0 16px ${accent}33` } : undefined}>
        <p className={`text-[9px] uppercase tracking-widest ${labelColor} font-medium leading-none max-w-[130px] text-center truncate`}>{labelText}</p>
        <p className="text-[9px] text-sky-300 font-mono leading-none">{diceResult.label}</p>
        <div className="relative flex items-center justify-center gap-1" style={{ minHeight: dieSize }}>
          {diceResult.rolls.map((d, i) => (
            <MetalDie key={i} value={display[i] || 1} rolling={!settled} sides={d.sides} size={dieSize} />
          ))}
          {settled && <span className="absolute -inset-1 rounded-xl pointer-events-none" style={{ border: `2px solid ${accent}`, boxShadow: `0 0 10px ${accent}55` }} />}
        </div>
        <p className={`text-[10px] ${isEnemy ? "text-red-200" : "text-slate-300"} leading-none`}>{settled ? `→ ${diceResult.total}` : "Girando..."}</p>
        {settled && <p className="text-[9px] text-slate-500 leading-none animate-pulse">toca para cerrar</p>}
      </div>
    </div>
  );
}