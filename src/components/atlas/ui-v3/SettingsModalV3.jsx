import { useMemo, useState } from "react";
import { Bell, Bug, Gamepad2, Keyboard, Move, Music, RotateCcw, Smartphone, Vibrate, Volume2, Waves } from "lucide-react";
import AtlasControlEditor from "../AtlasControlEditor";
import { applyControlPreset } from "@/lib/atlasControlLayout";
import { AtlasButton, AtlasModal, AtlasPanel, AtlasTabs } from "@/components/atlas/ui";

function ChoiceGroup({ label, hint, options, value, onChange, columns }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns || options.length}, minmax(0, 1fr))` }}>
        {options.map(option => (
          <button key={String(option.value)} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`atlas-ui-tab ${value === option.value ? "!border-sky-400 !bg-sky-900/70" : ""}`}>
            {option.label}
          </button>
        ))}
      </div>
      {hint && <p className="atlas-ui-dim mt-1.5 text-[11px] leading-snug">{hint}</p>}
    </div>
  );
}

function VolumeSlider({ label, value, onChange, Icon }) {
  const pct = Math.round((Number(value) || 0) * 100);
  return (
    <label className="atlas-ui-panel atlas-ui-panel--soft block p-3">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">{Icon && <Icon className="h-4 w-4 text-sky-300" />}{label}</span>
        <span className="atlas-ui-muted font-mono text-xs">{pct}%</span>
      </span>
      <input type="range" min="0" max="1" step="0.05" value={Number(value) || 0} onChange={event => onChange(Number(event.target.value))} className="w-full" />
    </label>
  );
}

export default function SettingsModalV3({ settings, onChange, onClose, onReset, onRequestOrientation }) {
  const [tab, setTab] = useState("interface");
  const [orientationNote, setOrientationNote] = useState(null);
  const [showControlEditor, setShowControlEditor] = useState(false);
  const set = (key, value) => onChange({ ...settings, [key]: value });
  const tabs = useMemo(() => [
    { id: "interface", label: "Interfaz", Icon: Smartphone },
    { id: "controls", label: "Controles", Icon: Gamepad2 },
    { id: "audio", label: "Audio", Icon: Volume2 },
    { id: "accessibility", label: "Accesibilidad", Icon: Bell },
    { id: "debug", label: "Otros", Icon: Bug },
  ], []);

  const setOrientation = async (value) => {
    onChange({ ...settings, orientation: value });
    if (!onRequestOrientation) return;
    const result = await onRequestOrientation(value);
    if (value === "auto") setOrientationNote("Orientación automática restaurada.");
    else if (result?.ok) setOrientationNote(value === "horizontal" ? "Modo horizontal activado." : "Modo vertical activado.");
    else setOrientationNote("El sistema no permitió girar automáticamente. La interfaz seguirá adaptándose cuando gires el dispositivo.");
  };

  return (
    <>
      <AtlasModal title="Ajustes" subtitle="Las opciones se guardan automáticamente." onClose={onClose} className="max-w-5xl" bodyClassName="p-3 sm:p-4">
        <AtlasTabs items={tabs} value={tab} onChange={setTab} className="mb-4" ariaLabel="Categorías de ajustes" />

        {tab === "interface" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <AtlasPanel title="Pantalla" bodyClassName="space-y-4 p-4">
              <ChoiceGroup label="Orientación" value={settings.orientation} onChange={setOrientation} options={[{ label: "Automática", value: "auto" }, { label: "Vertical", value: "vertical" }, { label: "Horizontal", value: "horizontal" }]} />
              {orientationNote && <p className="atlas-ui-hud-card px-3 py-2 text-xs text-sky-100">{orientationNote}</p>}
              <ChoiceGroup label="Densidad del HUD" value={settings.hudDensity || "clean"} onChange={value => set("hudDensity", value)} options={[{ label: "Limpio", value: "clean" }, { label: "Completo", value: "full" }]} hint="Limpio mantiene nombres y avisos ocultos hasta que son útiles." />
            </AtlasPanel>
            <AtlasPanel title="Distribución" bodyClassName="space-y-4 p-4">
              <ChoiceGroup label="Distribución de controles" value={settings.controlLayout} onChange={value => set("controlLayout", value)} options={[{ label: "Integrados", value: "integrated" }, { label: "Separados", value: "separated" }]} hint="En horizontal, Integrados conserva más altura útil para el mapa." />
              <ChoiceGroup label="Tamaño de controles" value={settings.controlSize} onChange={value => set("controlSize", value)} options={[{ label: "Pequeño", value: "small" }, { label: "Normal", value: "normal" }, { label: "Grande", value: "large" }]} />
            </AtlasPanel>
          </div>
        )}

        {tab === "controls" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <AtlasPanel title="Entrada" bodyClassName="space-y-4 p-4">
              <ChoiceGroup label="Modo de control" value={settings.controls} onChange={value => set("controls", value)} options={[{ label: "Automático", value: "auto" }, { label: "Móvil", value: "mobile" }, { label: "PC", value: "pc" }]} />
              <ChoiceGroup label="Mano dominante" value={settings.handedness} onChange={value => onChange(applyControlPreset(settings, value))} options={[{ label: "Diestro", value: "right" }, { label: "Zurdo", value: "left" }]} />
            </AtlasPanel>
            <AtlasPanel title="Editor" bodyClassName="p-4">
              <p className="atlas-ui-muted text-sm leading-relaxed">Mueve, escala y ajusta la opacidad del joystick, botón A, botón B y Correr. La posición se guarda por separado para vertical y horizontal.</p>
              <AtlasButton className="mt-4" variant="primary" icon={Move} full onPress={() => setShowControlEditor(true)}>Personalizar HUD táctil</AtlasButton>
              <div className="atlas-ui-list-row mt-3"><Keyboard className="h-4 w-4" /><span className="text-sm">Los atajos de teclado actuales se mantienen.</span></div>
            </AtlasPanel>
          </div>
        )}

        {tab === "audio" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceGroup label="Sistema de audio" value={settings.audioEnabled !== false} onChange={value => set("audioEnabled", value)} options={[{ label: "Activado", value: true }, { label: "Silenciado", value: false }]} />
            <VolumeSlider label="Volumen maestro" value={settings.masterVolume ?? 0.8} onChange={value => set("masterVolume", value)} Icon={Volume2} />
            <VolumeSlider label="Música" value={settings.musicVolume ?? 0.55} onChange={value => set("musicVolume", value)} Icon={Music} />
            <VolumeSlider label="Ambiente" value={settings.ambienceVolume ?? 0.45} onChange={value => set("ambienceVolume", value)} Icon={Waves} />
            <VolumeSlider label="Efectos" value={settings.sfxVolume ?? 0.8} onChange={value => set("sfxVolume", value)} Icon={Bell} />
          </div>
        )}

        {tab === "accessibility" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <AtlasPanel title="Vibración" bodyClassName="space-y-4 p-4">
              <ChoiceGroup label="Respuesta háptica" value={settings.hapticsEnabled !== false} onChange={value => set("hapticsEnabled", value)} options={[{ label: "Activada", value: true }, { label: "Desactivada", value: false }]} />
              <VolumeSlider label="Intensidad" value={settings.hapticIntensity ?? 0.75} onChange={value => set("hapticIntensity", Math.max(0.35, value))} Icon={Vibrate} />
            </AtlasPanel>
            <AtlasPanel title="Lectura" bodyClassName="p-4">
              <p className="atlas-ui-muted text-sm leading-relaxed">El rediseño usa controles de al menos 44 px, jerarquía visible y estados diferenciados por forma, borde y texto, no solo por color.</p>
            </AtlasPanel>
          </div>
        )}

        {tab === "debug" && (
          <div className="space-y-4">
            <ChoiceGroup label="Mostrar objetivos técnicos" value={Boolean(settings.debugTargets)} onChange={value => set("debugTargets", value)} options={[{ label: "Desactivado", value: false }, { label: "Activado", value: true }]} hint="Muestra radios, coordenadas e identificadores. Debe estar desactivado durante una partida normal." />
            {onReset && <AtlasButton variant="warning" icon={RotateCcw} full onPress={onReset}>Restaurar configuración predeterminada</AtlasButton>}
          </div>
        )}
      </AtlasModal>
      {showControlEditor && <AtlasControlEditor settings={settings} onChange={onChange} onClose={() => setShowControlEditor(false)} />}
    </>
  );
}
