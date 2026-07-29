import { useEffect, useRef } from "react";

export default function useKeyboardControls({ enabled, dir, run, onInteract, onCancel, onAttack, onSkill, onInventory, onJournal, onMap, onTogglePause, isCombat }) {
  const cb = useRef({});
  cb.current = { onInteract, onCancel, onAttack, onSkill, onInventory, onJournal, onMap, onTogglePause, isCombat };

  useEffect(() => {
    if (!enabled) return;
    const keys = new Set();
    const MOV = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
    const recompute = () => {
      let x = 0, y = 0;
      if (keys.has("a") || keys.has("arrowleft")) x -= 1;
      if (keys.has("d") || keys.has("arrowright")) x += 1;
      if (keys.has("w") || keys.has("arrowup")) y -= 1;
      if (keys.has("s") || keys.has("arrowdown")) y += 1;
      if (x && y) { const inv = 1 / Math.sqrt(2); x *= inv; y *= inv; }
      if (dir) dir.current = { x, y };
    };
    const onDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === "shift") { if (run) run.current = true; return; }
      if (MOV.has(k)) { keys.add(k); recompute(); e.preventDefault(); return; }
      if (e.repeat) return;
      const c = cb.current;
      switch (k) {
        case "e": case "enter": c.onInteract?.(); e.preventDefault(); break;
        case "q": c.onCancel?.(); break;
        case " ": if (c.isCombat) c.onAttack?.(); e.preventDefault(); break;
        case "1": c.onSkill?.("classAbility"); break;
        case "2": c.onSkill?.("hybrid"); break;
        case "3": c.onSkill?.("definitive"); break;
        case "4": c.onSkill?.("weapon"); break;
        case "i": c.onInventory?.(); break;
        case "j": c.onJournal?.(); break;
        case "m": c.onMap?.(); break;
        case "escape": c.onTogglePause?.(); break;
      }
    };
    const onUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === "shift") { if (run) run.current = false; return; }
      if (MOV.has(k)) { keys.delete(k); recompute(); }
    };
    const onBlur = () => {
      keys.clear();
      if (dir) dir.current = { x: 0, y: 0 };
      if (run) run.current = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [enabled, dir, run]);
}