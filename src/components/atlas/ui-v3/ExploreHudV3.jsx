import React from "react";
import { ChevronDown, Compass, Footprints, LayoutGrid, Map, Navigation, Pause, ScrollText } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";
import { controlStyle } from "@/lib/atlasControlLayout";
import ThreatIndicator from "../ThreatIndicator";
import OrientationToggleButton from "../OrientationToggleButton";
import Joystick from "../Joystick";
import { AtlasActionButton, AtlasHudCard, AtlasIconButton } from "@/components/atlas/ui";

export default function ExploreHudV3({
  navWrapRef,
  navIconRef,
  navLabelRef,
  navDistRef,
  sectorName,
  region,
  player,
  threat,
  settings,
  onUpdateSettings,
  onRequestOrientation,
  showHudDetails,
  onToggleHudDetails,
  onPause,
  onOpenExploreMap,
  onOpenSectorMap,
  onOpenJournal,
  onSwitchBoard,
  proxHint,
  separated = false,
  activeControlProfile,
  controlScale = 1,
  joystickKey,
  onMove,
  runToggle,
  onToggleRun,
  onOpenHub,
  onAction,
  actionReady,
  leftHanded = false,
  renderSeparatedControls = true,
}) {
  const profile = activeControlProfile || {
    joystick: { x: 12, y: 12, anchor: "bottom-left", scale: 1 },
    run: { x: 150, y: 20, anchor: "bottom-left", scale: 1 },
    b: { x: 88, y: 24, anchor: "bottom-right", scale: 1 },
    a: { x: 18, y: 18, anchor: "bottom-right", scale: 1 },
  };

  const actionButton = (
    <AtlasActionButton
      kind="a"
      label="A"
      sublabel={actionReady ? "Acción" : "No disponible"}
      disabled={!actionReady}
      onPress={onAction}
      aria-label={actionReady ? `${proxHint || "Interactuar"}. Pulsar A` : "Acción no disponible"}
    />
  );

  const hubButton = <AtlasActionButton kind="b" label="B" sublabel="Centro" onPress={onOpenHub} />;
  const runButton = <AtlasActionButton kind="run" icon={Footprints} label="Correr" active={runToggle} onPress={onToggleRun} />;

  return (
    <>
      <div ref={navWrapRef} className="atlas-objective-compass absolute left-1/2 top-1.5 z-20 max-w-[260px] -translate-x-1/2 pointer-events-none" style={{ display: "none" }}>
        <div className="atlas-ui-prompt !rounded-full !py-1">
          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/70 bg-slate-900">
            <Navigation ref={navIconRef} className="h-3.5 w-3.5 text-amber-300 transition-transform duration-100" />
          </div>
          <p ref={navLabelRef} className="min-w-0 flex-1 truncate text-[11px] font-medium" />
          <span ref={navDistRef} className="whitespace-nowrap text-[10px] text-amber-300" />
        </div>
      </div>

      <div className="atlas-top-hud pointer-events-none absolute left-0 right-0 top-9 z-20 flex items-start justify-between gap-2 p-2">
        <div className="pointer-events-auto flex items-start gap-1.5">
          <AtlasHudCard title="Zona" className="atlas-zone-card max-w-[215px]">
            <p className="truncate text-sm font-semibold">{sectorName}</p>
            <p className="atlas-ui-muted truncate text-[10px]"><span style={{ color: region?.theme?.accent }}>{region?.name}</span> · Nv {player?.level}</p>
          </AtlasHudCard>
          <div className="flex flex-col gap-1">
            <ThreatIndicator threat={threat} />
            <button type="button" onClick={onToggleHudDetails} className="atlas-ui-icon-button !h-7 !w-7 !min-w-7" aria-label="Mostrar detalles del personaje">
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHudDetails ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        <div className="atlas-top-actions pointer-events-auto flex items-center gap-1">
          <OrientationToggleButton settings={settings} onChange={onUpdateSettings} onRequestOrientation={onRequestOrientation} className="atlas-ui-icon-button !h-9 !w-9 !min-w-9" />
          <AtlasIconButton icon={Pause} label="Pausa" onPress={onPause} className="!h-9 !w-9 !min-w-9" />
          <AtlasIconButton icon={Compass} label="Mapa de exploración" onPress={onOpenExploreMap} className="!h-9 !w-9 !min-w-9" />
          <AtlasIconButton icon={LayoutGrid} label="Mapa de sectores" onPress={onOpenSectorMap} className="!h-9 !w-9 !min-w-9" />
          <AtlasIconButton icon={ScrollText} label="Diario de misiones" onPress={onOpenJournal} className="!h-9 !w-9 !min-w-9" />
          <AtlasIconButton icon={Map} label="Cambiar a modo tablero" onPress={onSwitchBoard} className="!h-9 !w-9 !min-w-9" />
        </div>
      </div>

      {showHudDetails && (
        <AtlasHudCard className="atlas-hud-details atlas-toast-in pointer-events-auto absolute left-2 top-[108px] z-30 text-[10px] leading-tight">
          <p>{player?.race} {player?.class}</p>
          <p className="atlas-ui-muted">HP {player?.hp}/{player?.maxHp} · Energía {player?.mp}/{player?.maxMp}</p>
        </AtlasHudCard>
      )}

      {proxHint && (
        <div className="atlas-proximity-hint pointer-events-none absolute left-1/2 z-20 w-[62%] max-w-[340px] -translate-x-1/2" style={{ bottom: separated ? 12 : 112 }}>
          <div className="atlas-ui-prompt atlas-toast-in w-full justify-center">
            <GIcon name="info" size={13} />
            <span className="text-center text-xs font-medium leading-tight">{proxHint} · pulsa A</span>
          </div>
        </div>
      )}

      {!separated && (
        <div className="atlas-mobile-controls pointer-events-none absolute inset-0 z-20">
          <div className="atlas-joystick-wrap pointer-events-auto" style={controlStyle(profile.joystick, controlScale)}>
            <Joystick key={joystickKey} scale={Number(profile.joystick.scale || 1) * controlScale} onMove={onMove} />
          </div>
          <div className="pointer-events-auto" style={controlStyle(profile.run, controlScale)}>{React.cloneElement(runButton, { style: { width: 50 * Number(profile.run.scale || 1) * controlScale, height: 50 * Number(profile.run.scale || 1) * controlScale } })}</div>
          <div className="pointer-events-auto" style={controlStyle(profile.b, controlScale)}>{React.cloneElement(hubButton, { style: { width: 58 * Number(profile.b.scale || 1) * controlScale, height: 58 * Number(profile.b.scale || 1) * controlScale } })}</div>
          <div className="pointer-events-auto" style={controlStyle(profile.a, controlScale)}>{React.cloneElement(actionButton, { style: { width: 66 * Number(profile.a.scale || 1) * controlScale, height: 66 * Number(profile.a.scale || 1) * controlScale } })}</div>
        </div>
      )}

      {separated && renderSeparatedControls && (
        <ExploreSeparatedControlsV3
          leftHanded={leftHanded}
          joystickKey={joystickKey}
          controlScale={controlScale}
          onMove={onMove}
          runToggle={runToggle}
          onToggleRun={onToggleRun}
          onOpenHub={onOpenHub}
          onAction={onAction}
          actionReady={actionReady}
          proxHint={proxHint}
        />
      )}
    </>
  );
}


export function ExploreSeparatedControlsV3({
  leftHanded = false,
  joystickKey,
  controlScale = 1,
  onMove,
  runToggle,
  onToggleRun,
  onOpenHub,
  onAction,
  actionReady,
  proxHint,
}) {
  return (
    <div className="atlas-ui-v3 shrink-0 w-full border-t bg-slate-950/95 px-4 sm:px-6" style={{ height: 92, borderColor: "var(--atlas-ui-border-soft)" }}>
      <div className="flex h-full items-center justify-between">
        <div className={leftHanded ? "order-2" : "order-1"}><Joystick key={joystickKey} scale={controlScale} onMove={onMove} /></div>
        <div className={`flex items-center gap-2 ${leftHanded ? "order-1" : "order-2"}`}>
          <AtlasActionButton kind="run" icon={Footprints} label="Correr" active={runToggle} onPress={onToggleRun} />
          <AtlasActionButton kind="b" label="B" sublabel="Centro" onPress={onOpenHub} />
          <AtlasActionButton kind="a" label="A" sublabel={actionReady ? "Acción" : "No disponible"} disabled={!actionReady} onPress={onAction} aria-label={actionReady ? `${proxHint || "Interactuar"}. Pulsar A` : "Acción no disponible"} />
        </div>
      </div>
    </div>
  );
}
