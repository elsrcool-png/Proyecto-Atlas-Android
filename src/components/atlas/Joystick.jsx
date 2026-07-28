import React, { useRef } from "react";

export default function Joystick({ onMove, scale = 1 }) {
  const baseRef = useRef(null);
  const knobRef = useRef(null);
  const activePointer = useRef(null);
  const R = 44 * scale;
  const size = 96 * scale;
  const knob = 40 * scale;

  const handle = (e) => {
    const base = baseRef.current.getBoundingClientRect();
    const cx = base.left + base.width / 2, cy = base.top + base.height / 2;
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist > R) { dx = dx / dist * R; dy = dy / dist * R; }
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    onMove(dx / R, dy / R);
  };
  const start = (e) => {
    if (activePointer.current != null || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.preventDefault();
    activePointer.current = e.pointerId;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
    handle(e);
  };
  const move = (e) => {
    if (activePointer.current !== e.pointerId) return;
    e.preventDefault();
    handle(e);
  };
  const end = (e) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    if (knobRef.current) knobRef.current.style.transform = "translate(0,0)";
    onMove(0, 0);
  };

  return (
    <div ref={baseRef}
      onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
      className="relative rounded-full bg-slate-800/70 border-2 border-slate-500/70 shadow-lg"
      style={{ width: size, height: size, touchAction: "none" }}>
      <div className="absolute inset-0 rounded-full border border-slate-600/40" />
      <div ref={knobRef} className="absolute rounded-full bg-sky-500/90 border-2 border-sky-200 shadow-md transition-transform"
        style={{ width: knob, height: knob, left: "50%", top: "50%", marginLeft: -knob / 2, marginTop: -knob / 2 }} />
    </div>
  );
}