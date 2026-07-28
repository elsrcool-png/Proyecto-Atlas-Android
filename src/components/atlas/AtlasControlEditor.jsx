import React, { useMemo, useRef, useState } from "react";
import { Move, RotateCcw } from "lucide-react";
import { CONTROL_LABELS, applyControlPreset, normalizeControlProfiles } from "@/lib/atlasControlLayout";

const IDS = ["joystick", "run", "b", "a"];

function ControlChip({ id, item, selected, onPointerDown }) {
  const label = id === "joystick" ? "◉" : id === "run" ? "👣" : id.toUpperCase();
  const base = id === "joystick" ? 58 : id === "a" ? 44 : 38;
  return (
    <button
      type="button"
      data-atlas-no-haptic="true"
      onPointerDown={onPointerDown}
      className={`absolute rounded-full border-2 flex items-center justify-center font-bold select-none ${selected ? "border-amber-300 bg-amber-500/80 text-slate-950" : "border-slate-400 bg-slate-800/90 text-white"}`}
      style={{
        left: `${item.x * 100}%`, top: `${item.y * 100}%`, transform: "translate(-50%, -50%)",
        width: base * item.scale, height: base * item.scale, opacity: item.opacity,
        touchAction: "none",
      }}
      aria-label={`Mover ${CONTROL_LABELS[id]}`}
    >{label}</button>
  );
}

export default function AtlasControlEditor({ settings, onChange, onClose }) {
  const [orientation, setOrientation] = useState("landscape");
  const [selected, setSelected] = useState("joystick");
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const profiles = useMemo(() => normalizeControlProfiles(settings.controlProfiles, settings.handedness), [settings.controlProfiles, settings.handedness]);
  const current = profiles[orientation];

  const updateItem = (id, patch) => {
    const nextProfiles = normalizeControlProfiles(profiles, settings.handedness);
    nextProfiles[orientation][id] = { ...nextProfiles[orientation][id], ...patch };
    onChange({ ...settings, controlProfiles: nextProfiles, controlLayout: "integrated" });
  };

  const moveToPointer = (event, id) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0.05, Math.min(0.95, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0.08, Math.min(0.94, (event.clientY - rect.top) / rect.height));
    updateItem(id, { x, y });
  };

  const startDrag = (event, id) => {
    event.preventDefault();
    setSelected(id);
    dragRef.current = { pointerId: event.pointerId, id };
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch {}
    moveToPointer(event, id);
  };

  const onMove = (event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    event.preventDefault();
    moveToPointer(event, dragRef.current.id);
  };
  const endDrag = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const item = current[selected];
  return (
    <div className="fixed inset-0 z-[75] bg-slate-950/90 backdrop-blur flex items-center justify-center px-3 py-3" onClick={onClose}>
      <div className="w-full max-w-xl max-h-[96dvh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div><h2 className="text-base font-semibold text-white">Personalizar controles</h2><p className="text-[11px] text-slate-400">Arrastra cada control. Se guarda por orientación.</p></div>
          <button type="button" onClick={onClose} className="text-xl text-slate-300">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button type="button" onClick={() => setOrientation("portrait")} className={`rounded-lg py-2 text-sm ${orientation === "portrait" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300"}`}>Vertical</button>
          <button type="button" onClick={() => setOrientation("landscape")} className={`rounded-lg py-2 text-sm ${orientation === "landscape" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300"}`}>Horizontal</button>
        </div>
        <div
          ref={previewRef}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`relative w-full overflow-hidden rounded-xl border border-slate-600 bg-slate-950 ${orientation === "landscape" ? "aspect-video" : "aspect-[9/16] max-h-[48dvh] mx-auto max-w-[260px]"}`}
          style={{ touchAction: "none", backgroundImage: "radial-gradient(circle at center, rgba(56,189,248,.12), transparent 58%)" }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700"><Move className="w-10 h-10" /></div>
          {IDS.map(id => <ControlChip key={id} id={id} item={current[id]} selected={selected === id} onPointerDown={e => startDrag(e, id)} />)}
        </div>
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/40 p-3 space-y-3">
          <label className="block text-sm text-slate-200">Control seleccionado
            <select value={selected} onChange={e => setSelected(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm">
              {IDS.map(id => <option key={id} value={id}>{CONTROL_LABELS[id]}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-200">Tamaño: {Math.round(item.scale * 100)}%
            <input type="range" min="0.6" max="1.7" step="0.05" value={item.scale} onChange={e => updateItem(selected, { scale: Number(e.target.value) })} className="mt-1 w-full accent-cyan-500" />
          </label>
          <label className="block text-sm text-slate-200">Opacidad: {Math.round(item.opacity * 100)}%
            <input type="range" min="0.35" max="1" step="0.05" value={item.opacity} onChange={e => updateItem(selected, { opacity: Number(e.target.value) })} className="mt-1 w-full accent-cyan-500" />
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <button type="button" onClick={() => onChange(applyControlPreset(settings, "right"))} className="rounded-lg bg-slate-800 py-2 text-xs">Diestro</button>
          <button type="button" onClick={() => onChange(applyControlPreset(settings, "left"))} className="rounded-lg bg-slate-800 py-2 text-xs">Zurdo</button>
          <button type="button" onClick={() => onChange(applyControlPreset(settings, "compact"))} className="rounded-lg bg-slate-800 py-2 text-xs">Compacto</button>
          <button type="button" onClick={() => onChange(applyControlPreset(settings, "tablet"))} className="rounded-lg bg-slate-800 py-2 text-xs">Tablet</button>
        </div>
        <button type="button" onClick={() => onChange(applyControlPreset(settings, settings.handedness || "right"))} className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Restablecer posiciones</button>
      </div>
    </div>
  );
}
