import React, { useState } from "react";
import { RotateCcw, Smartphone, Keyboard, Bug, Bell, Volume2, Music, Waves, Move, Vibrate } from "lucide-react";
import AtlasControlEditor from "./AtlasControlEditor";
import { applyControlPreset } from "@/lib/atlasControlLayout";

function Option({ label, value, current, onPick }) {
  return (
    <button
      onClick={() => onPick(value)}
      className={`flex-1 min-w-0 rounded-lg px-2.5 py-2 text-sm transition ${current === value ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
    >
      {label}
    </button>
  );
}

function VolumeSlider({ label, value, onChange, icon: Icon }) {
  const pct = Math.round((Number(value) || 0) * 100);
  return (
    <div className="rounded-xl bg-slate-950/45 border border-slate-800 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="flex items-center gap-2 text-sm text-slate-300">{Icon && <Icon className="w-4 h-4 text-cyan-300" />}{label}</span>
        <span className="text-xs font-mono text-slate-400">{pct}%</span>
      </div>
      <input aria-label={label} type="range" min="0" max="1" step="0.05" value={Number(value) || 0} onChange={e => onChange(Number(e.target.value))} className="w-full accent-cyan-500" />
    </div>
  );
}

export default function SettingsModal({ settings, onChange, onClose, onReset, onRequestOrientation }) {
  const [orientationNote, setOrientationNote] = useState(null);
  const [showControlEditor, setShowControlEditor] = useState(false);
  const set = (k, v) => onChange({ ...settings, [k]: v });
  const setOrientation = async (value) => {
    const next = { ...settings, orientation: value };
    onChange(next);
    if (!onRequestOrientation) return;
    const result = await onRequestOrientation(value);
    if (value === "auto") setOrientationNote("Orientación automática restaurada.");
    else if (result?.ok) setOrientationNote(value === "horizontal" ? "Modo horizontal activado." : "Modo vertical activado.");
    else setOrientationNote("El navegador no permitió girar automáticamente. Gira el teléfono; la interfaz se adaptará sin perder legibilidad.");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur px-3 py-2" onClick={onClose}>
      <div className="atlas-modal-panel rounded-2xl bg-slate-900 border border-slate-700 p-4 sm:p-5 max-w-md w-full max-h-[94dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-slate-100">Ajustes</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button></div>
        <div className="flex items-center gap-2 text-sky-400 mb-3"><Smartphone className="w-4 h-4" /><h3 className="text-xs uppercase tracking-widest">Interfaz móvil</h3></div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-300 mb-2">Orientación de pantalla</p>
            <div className="grid grid-cols-3 gap-2"><Option label="Automática" value="auto" current={settings.orientation} onPick={setOrientation} /><Option label="Vertical" value="vertical" current={settings.orientation} onPick={setOrientation} /><Option label="Horizontal" value="horizontal" current={settings.orientation} onPick={setOrientation} /></div>
            {orientationNote && <p className="mt-2 text-[11px] leading-snug text-sky-200 bg-sky-950/45 border border-sky-800/60 rounded-lg px-2.5 py-2">{orientationNote}</p>}
          </div>
          <div>
            <p className="text-sm text-slate-300 mb-2">Distribución de controles</p>
            <div className="flex gap-2"><Option label="Integrados" value="integrated" current={settings.controlLayout} onPick={v => set("controlLayout", v)} /><Option label="Separados" value="separated" current={settings.controlLayout} onPick={v => set("controlLayout", v)} /></div>
            <p className="text-[10px] text-slate-500 mt-1">En horizontal, los controles se integran a los costados para no quitar altura al mapa.</p>
          </div>
          <div>
            <p className="text-sm text-slate-300 mb-2">Mano dominante</p>
            <div className="flex gap-2"><Option label="Diestro" value="right" current={settings.handedness} onPick={v => onChange(applyControlPreset(settings, v))} /><Option label="Zurdo" value="left" current={settings.handedness} onPick={v => onChange(applyControlPreset(settings, v))} /></div>
          </div>
          <div>
            <p className="text-sm text-slate-300 mb-2">Tamaño de controles</p>
            <div className="grid grid-cols-3 gap-2"><Option label="Pequeño" value="small" current={settings.controlSize} onPick={v => set("controlSize", v)} /><Option label="Normal" value="normal" current={settings.controlSize} onPick={v => set("controlSize", v)} /><Option label="Grande" value="large" current={settings.controlSize} onPick={v => set("controlSize", v)} /></div>
          </div>
          <button type="button" onClick={() => setShowControlEditor(true)} className="w-full rounded-xl border border-cyan-700/70 bg-cyan-950/45 hover:bg-cyan-900/50 py-2.5 text-sm text-cyan-100 flex items-center justify-center gap-2"><Move className="w-4 h-4" /> Personalizar HUD táctil</button>
        </div>

        <div className="flex items-center gap-2 text-violet-400 mt-4 mb-3"><Bell className="w-4 h-4" /><h3 className="text-xs uppercase tracking-widest">Avisos en pantalla</h3></div>
        <div>
          <p className="text-sm text-slate-300 mb-2">Densidad del HUD</p>
          <div className="flex gap-2"><Option label="Limpio" value="clean" current={settings.hudDensity || "clean"} onPick={v => set("hudDensity", v)} /><Option label="Completo" value="full" current={settings.hudDensity || "clean"} onPick={v => set("hudDensity", v)} /></div>
          <p className="text-[10px] text-slate-500 mt-1">Limpio muestra nombres, señales y avisos solo cuando son útiles o estás cerca.</p>
        </div>

        <div className="flex items-center gap-2 text-cyan-300 mt-4 mb-3"><Volume2 className="w-4 h-4" /><h3 className="text-xs uppercase tracking-widest">Audio</h3></div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-300 mb-2">Sistema de audio</p>
            <div className="flex gap-2"><Option label="Activado" value={true} current={settings.audioEnabled !== false} onPick={v => set("audioEnabled", v)} /><Option label="Silenciado" value={false} current={settings.audioEnabled !== false} onPick={v => set("audioEnabled", v)} /></div>
            <p className="text-[10px] text-slate-500 mt-1">La música comienza después del primer toque o tecla, por las reglas de audio del navegador.</p>
          </div>
          <VolumeSlider label="Volumen maestro" value={settings.masterVolume ?? 0.8} onChange={v => set("masterVolume", v)} icon={Volume2} />
          <VolumeSlider label="Música" value={settings.musicVolume ?? 0.55} onChange={v => set("musicVolume", v)} icon={Music} />
          <VolumeSlider label="Ambiente" value={settings.ambienceVolume ?? 0.45} onChange={v => set("ambienceVolume", v)} icon={Waves} />
          <VolumeSlider label="Efectos" value={settings.sfxVolume ?? 0.8} onChange={v => set("sfxVolume", v)} icon={Bell} />
          <p className="text-[10px] leading-snug text-cyan-200/70">Audio prototipo v1.0 disponible en Región Verde: exploración, campamentos, corrupción, combate, Guardián e introducciones de enemigos.</p>
        </div>


        <div className="flex items-center gap-2 text-fuchsia-300 mt-4 mb-3"><Vibrate className="w-4 h-4" /><h3 className="text-xs uppercase tracking-widest">Vibración</h3></div>
        <div className="space-y-3">
          <div><p className="text-sm text-slate-300 mb-2">Respuesta háptica</p><div className="flex gap-2"><Option label="Activada" value={true} current={settings.hapticsEnabled !== false} onPick={v => set("hapticsEnabled", v)} /><Option label="Desactivada" value={false} current={settings.hapticsEnabled !== false} onPick={v => set("hapticsEnabled", v)} /></div></div>
          <VolumeSlider label="Intensidad háptica" value={settings.hapticIntensity ?? 0.75} onChange={v => set("hapticIntensity", Math.max(0.35, v))} icon={Vibrate} />
          <p className="text-[10px] text-slate-500">La vibración depende del soporte del dispositivo y del navegador.</p>
        </div>

        <div className="flex items-center gap-2 text-emerald-400 mt-4 mb-3"><Keyboard className="w-4 h-4" /><h3 className="text-xs uppercase tracking-widest">Controles</h3></div>
        <div>
          <p className="text-sm text-slate-300 mb-2">Modo de control</p>
          <div className="grid grid-cols-3 gap-2"><Option label="Automático" value="auto" current={settings.controls} onPick={v => set("controls", v)} /><Option label="Móvil" value="mobile" current={settings.controls} onPick={v => set("controls", v)} /><Option label="PC" value="pc" current={settings.controls} onPick={v => set("controls", v)} /></div>
        </div>

        <div className="flex items-center gap-2 text-amber-400 mt-4 mb-3"><Bug className="w-4 h-4" /><h3 className="text-xs uppercase tracking-widest">Depuración</h3></div>
        <div>
          <p className="text-sm text-slate-300 mb-2">Mostrar objetivos de misión</p>
          <div className="flex gap-2"><Option label="Desactivado" value={false} current={settings.debugTargets} onPick={v => set("debugTargets", v)} /><Option label="Activado" value={true} current={settings.debugTargets} onPick={v => set("debugTargets", v)} /></div>
          <p className="text-[10px] text-slate-500 mt-1">Muestra radios, coordenadas e identificadores técnicos. Debe permanecer desactivado al jugar.</p>
        </div>
        {onReset && (<button onClick={onReset} className="mt-4 w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2.5 text-sm font-medium text-slate-100 flex items-center justify-center gap-2 transition"><RotateCcw className="w-4 h-4" /> Restaurar configuración predeterminada</button>)}
        <p className="text-[11px] text-slate-500 mt-3">Las opciones se guardan automáticamente.</p>
      </div>
      {showControlEditor && <AtlasControlEditor settings={settings} onChange={onChange} onClose={() => setShowControlEditor(false)} />}
    </div>
  );
}
