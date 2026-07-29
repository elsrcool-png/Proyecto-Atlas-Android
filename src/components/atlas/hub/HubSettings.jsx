import React from "react";
import { applyControlPreset } from "@/lib/atlasControlLayout";
import { applyHudPreset } from "@/lib/atlasHudLayout";
import { RotateCcw, Smartphone, Volume2, Music, Waves, Bell } from "lucide-react";

function Option({ label, value, current, onPick }) { return (<button onClick={() => onPick(value)} className={`flex-1 rounded-lg px-3 py-2.5 text-sm transition ${current === value ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{label}</button>); }
function Section({ title, hint, children }) { return (<div><p className="text-sm text-slate-200 mb-2">{title}</p><div className="flex gap-2">{children}</div>{hint && <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">{hint}</p>}</div>); }

function VolumeSlider({ label, value, onChange, Icon }) { const pct = Math.round((Number(value) || 0) * 100); return (<div className="rounded-xl bg-slate-950/45 border border-slate-800 px-3 py-2.5"><div className="flex items-center justify-between mb-2"><span className="flex items-center gap-2 text-sm text-slate-300"><Icon className="w-4 h-4 text-cyan-300" />{label}</span><span className="text-xs font-mono text-slate-400">{pct}%</span></div><input aria-label={label} type="range" min="0" max="1" step="0.05" value={Number(value) || 0} onChange={e => onChange(Number(e.target.value))} className="w-full accent-cyan-500" /></div>); }

export default function HubSettings({ settings, onChange, onReset }) {
  const set = (k, v) => onChange({ ...settings, [k]: v });
  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sky-300"><Smartphone className="w-4 h-4" /><h3 className="text-xs uppercase tracking-widest">Interfaz móvil</h3></div>
      <Section title="Orientación de pantalla" hint="Automática detecta el giro del dispositivo. Vertical y Horizontal fuerzan esa distribución y reorganizan el HUD, paneles y controles."><Option label="Automática" value="auto" current={settings.orientation} onPick={v => set("orientation", v)} /><Option label="Vertical" value="vertical" current={settings.orientation} onPick={v => set("orientation", v)} /><Option label="Horizontal" value="horizontal" current={settings.orientation} onPick={v => set("orientation", v)} /></Section>
      <Section title="Distribución de controles" hint="Integrados: el joystick y los botones flotan sobre la zona de juego. Separados: los controles se ubican en una barra reservada inferior para no tapar personajes, enemigos ni el mapa."><Option label="Integrados" value="integrated" current={settings.controlLayout} onPick={v => set("controlLayout", v)} /><Option label="Separados" value="separated" current={settings.controlLayout} onPick={v => set("controlLayout", v)} /></Section>
      <Section title="Mano dominante" hint="Diestro: joystick a la izquierda, acciones a la derecha. Zurdo: invertido."><Option label="Diestro" value="right" current={settings.handedness} onPick={v => onChange(applyControlPreset(settings, v))} /><Option label="Zurdo" value="left" current={settings.handedness} onPick={v => onChange(applyControlPreset(settings, v))} /></Section>
      <Section title="Tamaño de controles"><Option label="Pequeño" value="small" current={settings.controlSize} onPick={v => set("controlSize", v)} /><Option label="Normal" value="normal" current={settings.controlSize} onPick={v => set("controlSize", v)} /><Option label="Grande" value="large" current={settings.controlSize} onPick={v => set("controlSize", v)} /></Section>
      <div><p className="text-sm text-slate-200 mb-2">Perfil del HUD Maestro</p><div className="grid grid-cols-2 gap-2"><Option label="Equilibrado" value="balanced" current={settings.hudPreset || "balanced"} onPick={v => onChange(applyHudPreset(settings, v))} /><Option label="Limpio" value="clean" current={settings.hudPreset || "balanced"} onPick={v => onChange(applyHudPreset(settings, v))} /><Option label="Compacto" value="compact" current={settings.hudPreset || "balanced"} onPick={v => onChange(applyHudPreset(settings, v))} /><Option label="Accesible" value="accessible" current={settings.hudPreset || "balanced"} onPick={v => onChange(applyHudPreset(settings, v))} /></div><p className="text-[11px] text-slate-500 mt-1.5">El editor completo está disponible en Pausa → Personalizar HUD táctil.</p></div>
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-cyan-300"><Volume2 className="w-4 h-4" /><h3 className="text-xs uppercase tracking-widest">Audio</h3></div>
        <Section title="Sistema de audio" hint="El navegador habilita la reproducción tras el primer toque o tecla."><Option label="Activado" value={true} current={settings.audioEnabled !== false} onPick={v => set("audioEnabled", v)} /><Option label="Silenciado" value={false} current={settings.audioEnabled !== false} onPick={v => set("audioEnabled", v)} /></Section>
        <VolumeSlider label="Volumen maestro" value={settings.masterVolume ?? 0.8} onChange={v => set("masterVolume", v)} Icon={Volume2} />
        <VolumeSlider label="Música" value={settings.musicVolume ?? 0.55} onChange={v => set("musicVolume", v)} Icon={Music} />
        <VolumeSlider label="Ambiente" value={settings.ambienceVolume ?? 0.45} onChange={v => set("ambienceVolume", v)} Icon={Waves} />
        <VolumeSlider label="Efectos" value={settings.sfxVolume ?? 0.8} onChange={v => set("sfxVolume", v)} Icon={Bell} />
      </div>
      <div className="pt-2 border-t border-slate-800"><button onClick={onReset} className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3 text-sm font-medium text-slate-100 flex items-center justify-center gap-2 transition"><RotateCcw className="w-4 h-4" /> Restaurar configuración predeterminada</button><p className="text-[11px] text-slate-500 mt-2 leading-snug">Las opciones se guardan automáticamente y se mantienen entre sesiones. Restaurar devuelve orientación, distribución y tamaño a sus valores iniciales.</p></div>
    </div>
  );
}