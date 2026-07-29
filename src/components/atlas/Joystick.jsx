import React, { useEffect, useRef } from "react";

export default function Joystick({ onMove, scale = 1 }) {
  const baseRef = useRef(null);
  const knobRef = useRef(null);
  const activePointer = useRef(null);
  const geometryRef = useRef({ cx: 0, cy: 0 });
  const pendingPointRef = useRef(null);
  const moveRafRef = useRef(0);
  const R = 44 * scale;
  const size = 96 * scale;
  const knob = 40 * scale;

  const measure = () => {
    const base = baseRef.current?.getBoundingClientRect();
    if (!base) return false;
    geometryRef.current = {
      cx: base.left + base.width / 2,
      cy: base.top + base.height / 2,
    };
    return true;
  };

  const applyPoint = (clientX, clientY) => {
    const { cx, cy } = geometryRef.current;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist > R) {
      dx = dx / dist * R;
      dy = dy / dist * R;
    }
    if (knobRef.current) knobRef.current.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    onMove(dx / R, dy / R);
  };

  const flushPendingPoint = () => {
    moveRafRef.current = 0;
    const point = pendingPointRef.current;
    pendingPointRef.current = null;
    if (point) applyPoint(point.clientX, point.clientY);
  };

  const schedulePoint = (clientX, clientY) => {
    pendingPointRef.current = { clientX, clientY };
    if (!moveRafRef.current) moveRafRef.current = requestAnimationFrame(flushPendingPoint);
  };

  const start = (e) => {
    if (activePointer.current != null || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.preventDefault();
    if (!measure()) return;
    activePointer.current = e.pointerId;
    if (knobRef.current) knobRef.current.style.transition = "none";
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
    applyPoint(e.clientX, e.clientY);
  };

  const move = (e) => {
    if (activePointer.current !== e.pointerId) return;
    e.preventDefault();
    schedulePoint(e.clientX, e.clientY);
  };

  const end = (e) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    pendingPointRef.current = null;
    if (moveRafRef.current) cancelAnimationFrame(moveRafRef.current);
    moveRafRef.current = 0;
    if (knobRef.current) {
      knobRef.current.style.transition = "transform 120ms ease-out";
      knobRef.current.style.transform = "translate3d(0, 0, 0)";
    }
    onMove(0, 0);
  };

  useEffect(() => () => {
    if (moveRafRef.current) cancelAnimationFrame(moveRafRef.current);
  }, []);

  return (
    <div
      ref={baseRef}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      className="relative rounded-full bg-slate-800/70 border-2 border-slate-500/70 shadow-lg"
      style={{ width: size, height: size, touchAction: "none" }}
    >
      <div className="absolute inset-0 rounded-full border border-slate-600/40" />
      <div
        ref={knobRef}
        className="absolute rounded-full bg-sky-500/90 border-2 border-sky-200 shadow-md"
        style={{
          width: knob,
          height: knob,
          left: "50%",
          top: "50%",
          marginLeft: -knob / 2,
          marginTop: -knob / 2,
          willChange: "transform",
          transform: "translate3d(0, 0, 0)",
        }}
      />
    </div>
  );
}
