import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "atlas_clock";
const CYCLE_MINUTES = 24;

function loadPhase() {
  try {
    const v = parseFloat(localStorage.getItem(STORAGE_KEY));
    if (!isNaN(v) && v >= 0 && v < 1) return v;
  } catch {}
  return 0.32;
}

export default function useDayNight() {
  const [phase, setPhase] = useState(loadPhase);
  const [dayCount, setDayCount] = useState(() => {
    try { return parseInt(localStorage.getItem("atlas_day_count")) || 1; } catch { return 1; }
  });
  const ref = useRef(phase);
  const dayRef = useRef(dayCount);
  ref.current = phase;
  dayRef.current = dayCount;

  useEffect(() => {
    const step = 2 / (CYCLE_MINUTES * 60);
    const tick = setInterval(() => setPhase(p => {
      const np = (p + step) % 1;
      if (p >= 0.5 && np < 0.5) {
        const nd = dayRef.current + 1;
        setDayCount(nd);
        try { localStorage.setItem("atlas_day_count", String(nd)); } catch {}
      }
      ref.current = np;
      return np;
    }), 2000);
    const save = () => { try { localStorage.setItem(STORAGE_KEY, String(ref.current)); } catch {} };
    const persist = setInterval(save, 4000);
    const onHide = () => save();
    window.addEventListener("pagehide", onHide);
    window.addEventListener("beforeunload", onHide);
    return () => {
      clearInterval(tick);
      clearInterval(persist);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("beforeunload", onHide);
      save();
    };
  }, []);

  const advance = (delta = 0.5) => setPhase(p => {
    const np = (p + delta) % 1;
    if (p >= 0.5 && np < 0.5) {
      const nd = dayRef.current + 1;
      setDayCount(nd);
      try { localStorage.setItem("atlas_day_count", String(nd)); } catch {}
    }
    ref.current = np;
    try { localStorage.setItem(STORAGE_KEY, String(np)); } catch {}
    return np;
  });

  return { phase, advance, dayCount };
}