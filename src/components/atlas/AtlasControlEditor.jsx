import React, { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Move, RotateCcw, Save, X } from "lucide-react";
import { CONTROL_LABELS, applyControlPreset, normalizeControlProfiles } from "@/lib/atlasControlLayout";
import { HUD_ELEMENT_LABELS, applyHudPreset, normalizeHudElements } from "@/lib/atlasHudLayout";

const CONTROL_IDS = ["joystick", "run", "b", "a"];
const HUD_IDS = ["zone", "threat", "mission", "vitals", "menu"];

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

function HeaderPreview({ elements, orientation }) {
  return (
    <div className={`absolute inset-x-2 top-2 grid gap-1 ${orientation === "landscape" ? "grid-cols-[1.1fr_.65fr_2fr_auto]" : "grid-cols-[1.3fr_.8fr_auto]"}`}>
      {elements.zone.visible && <div className="rounded border border-amber-500/50 bg-slate-900/90 p-1 text-[7px]" style={{ opacity: elements.zone.opacity, transform: `scale(${elements.zone.scale})`, transformOrigin: "top left" }}>ZONA<br /><b>Campamento</b></div>}
      {elements.threat.visible && <div className="rounded border border-emerald-500/50 bg-slate-900/90 p-1 text-[7px]" style={{ opacity: elements.threat.opacity, transform: `scale(${elements.threat.scale})`, transformOrigin: "top left" }}>👁 I · 1/10</div>}
      {orientation === "landscape" && elements.mission.visible && <div className="rounded border border-amber-500/50 bg-slate-900/90 p-1 text-[7px] truncate" style={{ opacity: elements.mission.opacity, transform: `scale(${elements.mission.scale})`, transformOrigin: "top center" }}>➤ Entrega: misión activa · 706 m</div>}
      {elements.menu.visible && <div className="justify-self-end rounded border border-slate-500 bg-slate-900/90 p-1 text-[8px]" style={{ opacity: elements.menu.opacity, transform: `scale(${elements.menu.scale})`, transformOrigin: "top right" }}>⏸ ⋮</div>}
      {orientation === "portrait" && elements.mission.visible && <div className="col-span-3 rounded border border-amber-500/50 bg-slate-900/90 p-1 text-[7px] truncate" style={{ opacity: elements.mission.opacity, transform: `scale(${elements.mission.scale})`, transformOrigin: "top center" }}>➤ Entrega: misión activa · 706 m</div>}
      {elements.vitals.visible && <div className={`${orientation === "landscape" ? "col-span-2" : "col-span-3"} rounded border border-slate-500/60 bg-slate-900/85 p-1 text-[6px]`} style={{ opacity: elements.vitals.opacity, transform: `scale(${elements.vitals.scale})`, transformOrigin: "top left" }}>VIDA ━━━━━　ENERGÍA ━━━━━</div>}
    </div>
  );
}

export default function AtlasControlEditor({ settings, onChange, onClose }) {
  const [orientation, setOrientation] = useState(() => (typeof window !== "undefined" && window.matchMedia?.("(orientation: landscape)").matches ? "landscape" : "portrait"));
  const [selected, setSelected] = useState("joystick");
  const [draft, setDraft] = useState(() => ({
    ...settings,
    controlProfiles: normalizeControlProfiles(settings.controlProfiles, settings.handedness),
    hudElements: normalizeHudElements(settings.hudElements),
  }));
  const previewRef = useRef(null);
  const dragRef = useRef(null);
  const profiles = useMemo(() => normalizeControlProfiles(draft.controlProfiles, draft.handedness), [draft.controlProfiles, draft.handedness]);
  const elements = useMemo(() => normalizeHudElements(draft.hudElements), [draft.hudElements]);
  const current = profiles[orientation];

  const updateControl = (id, patch) => {
    setDraft(currentDraft => {
      const nextProfiles = normalizeControlProfiles(currentDraft.controlProfiles, currentDraft.handedness);
      nextProfiles[orientation][id] = { ...nextProfiles[orientation][id], ...patch };
      return { ...currentDraft, controlProfiles: nextProfiles, controlLayout: "integrated" };
    });
  };

  const updateHudElement = (id, patch) => {
    setDraft(currentDraft => {
      const nextElements = normalizeHudElements(currentDraft.hudElements);
      nextElements[id] = { ...nextElements[id], ...patch };
      return { ...currentDraft, hudElements: nextElements, hudPreset: "custom" };
    });
  };

  const moveToPointer = (event, id) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0.05, Math.min(0.95, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0.08, Math.min(0.94, (event.clientY - rect.top) / rect.height));
    updateControl(id, { x, y });
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
  const applyDraftPreset = (preset) => setDraft(current => applyHudPreset(current, preset));
  const applyHandPreset = (preset) => setDraft(current => applyControlPreset(current, preset));
  const save = () => { onChange?.({ ...draft, controlProfiles: normalizeControlProfiles(draft.controlProfiles, draft.handedness), hudElements: normalizeHudElements(draft.hudElements) }); onClose?.(); };

  return (
    <div className="fixed inset-0 z-[75] bg-slate-950/92 flex items-center justify-center px-3 py-3" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
      <div className="w-full max-w-2xl max-h-[96dvh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div><h2 className="text-base font-semibold text-white">Personalizar HUD táctil · HUD Maestro</h2><p className="text-[11px] text-slate-400">Arrastra los controles. La cabecera conserva su diseño adaptativo para no cortarse al girar el teléfono.</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800" aria-label="Cerrar"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button type="button" onClick={() => setOrientation("portrait")} className={`rounded-lg py-2 text-sm ${orientation === "portrait" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300"}`}>Vista vertical</button>
          <button type="button" onClick={() => setOrientation("landscape")} className={`rounded-lg py-2 text-sm ${orientation === "landscape" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300"}`}>Vista horizontal</button>
        </div>

        <div
          ref={previewRef}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`relative w-full overflow-hidden rounded-xl border border-slate-600 bg-slate-950 ${orientation === "landscape" ? "aspect-video" : "aspect-[9/16] max-h-[48dvh] mx-auto max-w-[280px]"}`}
          style={{ touchAction: "none", backgroundImage: "radial-gradient(circle at center, rgba(56,189,248,.12), transparent 58%)" }}
        >
          <HeaderPreview elements={elements} orientation={orientation} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700"><Move className="w-10 h-10" /></div>
          {CONTROL_IDS.map(id => <ControlChip key={id} id={id} item={current[id]} selected={selected === id} onPointerDown={event => startDrag(event, id)} />)}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-700 bg-slate-950/40 p-3 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-cyan-300">Controles táctiles</h3>
            <label className="block text-sm text-slate-200">Elemento
              <select value={selected} onChange={event => setSelected(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm">
                {CONTROL_IDS.map(id => <option key={id} value={id}>{CONTROL_LABELS[id]}</option>)}
              </select>
            </label>
            <label className="block text-sm text-slate-200">Tamaño: {Math.round(item.scale * 100)}%
              <input type="range" min="0.6" max="1.7" step="0.05" value={item.scale} onChange={event => updateControl(selected, { scale: Number(event.target.value) })} className="mt-1 w-full accent-cyan-500" />
            </label>
            <label className="block text-sm text-slate-200">Opacidad: {Math.round(item.opacity * 100)}%
              <input type="range" min="0.35" max="1" step="0.05" value={item.opacity} onChange={event => updateControl(selected, { opacity: Number(event.target.value) })} className="mt-1 w-full accent-cyan-500" />
            </label>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-950/40 p-3 space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-amber-300">Cabecera adaptativa</h3>
            {HUD_IDS.map(id => {
              const hudItem = elements[id];
              return (
                <div key={id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-200">{HUD_ELEMENT_LABELS[id]}</span>
                    <button type="button" onClick={() => updateHudElement(id, { visible: !hudItem.visible })} className="rounded p-1 text-slate-300 hover:bg-slate-700" aria-label={hudItem.visible ? "Ocultar" : "Mostrar"}>{hudItem.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <label>Tamaño {Math.round(hudItem.scale * 100)}%<input type="range" min="0.72" max="1.35" step="0.05" value={hudItem.scale} onChange={event => updateHudElement(id, { scale: Number(event.target.value) })} className="w-full accent-amber-400" /></label>
                    <label>Opacidad {Math.round(hudItem.opacity * 100)}%<input type="range" min="0.4" max="1" step="0.05" value={hudItem.opacity} onChange={event => updateHudElement(id, { opacity: Number(event.target.value) })} className="w-full accent-amber-400" /></label>
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button type="button" onClick={() => applyDraftPreset("balanced")} className="rounded-lg bg-slate-800 py-2 text-xs">Equilibrado</button>
          <button type="button" onClick={() => applyDraftPreset("clean")} className="rounded-lg bg-slate-800 py-2 text-xs">Limpio</button>
          <button type="button" onClick={() => applyDraftPreset("compact")} className="rounded-lg bg-slate-800 py-2 text-xs">Compacto</button>
          <button type="button" onClick={() => applyDraftPreset("accessible")} className="rounded-lg bg-slate-800 py-2 text-xs">Accesible</button>
          <button type="button" onClick={() => applyHandPreset("right")} className="rounded-lg bg-slate-800 py-2 text-xs">Diestro</button>
          <button type="button" onClick={() => applyHandPreset("left")} className="rounded-lg bg-slate-800 py-2 text-xs">Zurdo</button>
          <button type="button" onClick={() => applyHandPreset("tablet")} className="rounded-lg bg-slate-800 py-2 text-xs">Tablet</button>
          <button type="button" onClick={() => setDraft(current => applyControlPreset(applyHudPreset(current, "balanced"), current.handedness || "right"))} className="rounded-lg bg-slate-800 py-2 text-xs flex items-center justify-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Restaurar</button>
          <button type="button" onClick={save} className="rounded-lg bg-emerald-600 py-2 text-xs text-white flex items-center justify-center gap-1"><Save className="w-3.5 h-3.5" /> Guardar</button>
        </div>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm">Cancelar cambios</button>
      </div>
    </div>
  );
}
