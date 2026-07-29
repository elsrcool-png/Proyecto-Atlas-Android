import React, { useMemo, useState } from "react";
import { ChevronDown, Footprints, Menu, Navigation, Pause } from "lucide-react";
import { GIcon } from "@/lib/atlasIcons";
import { controlStyle } from "@/lib/atlasControlLayout";
import { hudElementStyle, normalizeHudElements } from "@/lib/atlasHudLayout";
import ThreatIndicator from "../ThreatIndicator";
import Joystick from "../Joystick";
import ExploreQuickMenuV3 from "./ExploreQuickMenuV3";
// OrientationToggleButton vive dentro del menú rápido para mantener limpia la cabecera.
import { AtlasActionButton, AtlasHudCard, AtlasIconButton, AtlasStatusBar } from "@/components/atlas/ui";

function resolveActionLabel(hint) {
  const value = String(hint || "").toLowerCase();
  if (value.includes("hablar") || value.includes("interactuar")) return "Hablar";
  if (value.includes("abrir")) return "Abrir";
  if (value.includes("comprar")) return "Comprar";
  if (value.includes("forjar")) return "Forjar";
  if (value.includes("descansar")) return "Descansar";
  if (value.includes("activar")) return "Activar";
  if (value.includes("usar portal")) return "Viajar";
  if (value.includes("entrar")) return "Entrar";
  if (value.includes("reclamar")) return "Reclamar";
  if (value.includes("continuar")) return "Continuar";
  if (value.includes("examinar")) return "Examinar";
  return "Acción";
}

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
  onOpenSheet,
  onOpenSettings,
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
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const profile = activeControlProfile || {
    joystick: { x: 0.16, y: 0.82, scale: 1, opacity: 0.9 },
    run: { x: 0.67, y: 0.86, scale: 1, opacity: 0.88 },
    b: { x: 0.8, y: 0.84, scale: 1, opacity: 0.9 },
    a: { x: 0.91, y: 0.76, scale: 1, opacity: 0.94 },
  };
  const elements = useMemo(() => normalizeHudElements(settings?.hudElements), [settings?.hudElements]);
  const density = settings?.hudDensity || "adaptive";
  const hpRatio = Math.max(0, Math.min(1, Number(player?.hp || 0) / Math.max(1, Number(player?.maxHp || 1))));
  const showVitals = elements.vitals.visible && (
    density === "full" || showHudDetails || (density === "adaptive" && (hpRatio < 0.76 || Number(threat || 0) >= 5))
  );
  const actionLabel = resolveActionLabel(proxHint);

  const actionButton = (
    <AtlasActionButton
      kind="a"
      label="A"
      sublabel={actionReady ? actionLabel : ""}
      disabled={!actionReady}
      onPress={onAction}
      className={actionReady ? "atlas-action-ready" : "atlas-action-idle"}
      aria-label={actionReady ? `${proxHint || "Interactuar"}. Pulsar A` : "Acción no disponible"}
    />
  );
  const hubButton = <AtlasActionButton kind="b" label="B" sublabel="Centro" onPress={onOpenHub} />;
  const runButton = <AtlasActionButton kind="run" icon={Footprints} label="Correr" active={runToggle} onPress={onToggleRun} />;

  return (
    <>
      <div className="atlas-adaptive-hud pointer-events-none absolute inset-x-0 z-20">
        <div className="atlas-adaptive-hud__grid">
          {elements.zone.visible && (
            <button
              type="button"
              className="atlas-hud-zone pointer-events-auto text-left"
              style={hudElementStyle(elements, "zone")}
              onClick={onToggleHudDetails}
              aria-expanded={showHudDetails}
            >
              <span className="atlas-hud-kicker">Zona</span>
              <span className="atlas-hud-zone-name">{sectorName}</span>
              <span className="atlas-hud-zone-meta"><span style={{ color: region?.theme?.accent }}>{region?.name}</span> · Nv {player?.level}</span>
              <ChevronDown className={`atlas-hud-zone-chevron ${showHudDetails ? "rotate-180" : ""}`} />
            </button>
          )}

          {elements.threat.visible && (
            <div className="atlas-hud-threat pointer-events-auto" style={hudElementStyle(elements, "threat")}>
              <ThreatIndicator threat={threat} compact />
            </div>
          )}

          {elements.mission.visible && (
            <div
              ref={navWrapRef}
              className="atlas-objective-compass atlas-hud-mission pointer-events-none"
              style={{ ...hudElementStyle(elements, "mission"), display: "none" }}
            >
              <div className="atlas-hud-mission-icon">
                <Navigation ref={navIconRef} className="h-4 w-4 text-amber-300 transition-transform duration-100" />
              </div>
              <p ref={navLabelRef} className="atlas-hud-mission-label" />
              <span ref={navDistRef} className="atlas-hud-mission-distance" />
            </div>
          )}

          {elements.menu.visible && (
            <div className="atlas-hud-menu pointer-events-auto" style={hudElementStyle(elements, "menu")}>
              <AtlasIconButton icon={Pause} label="Pausa" onPress={onPause} />
              <AtlasIconButton icon={Menu} label="Menú rápido" onPress={() => setQuickMenuOpen(true)} />
            </div>
          )}

          {showVitals && (
            <AtlasHudCard className="atlas-hud-vitals pointer-events-auto" style={hudElementStyle(elements, "vitals")}>
              <div className="atlas-hud-vitals-grid">
                <AtlasStatusBar value={player?.hp} max={player?.maxHp} kind="hp" label="Vida" compact />
                <AtlasStatusBar value={player?.mp} max={player?.maxMp} kind="mp" label="Energía" compact />
              </div>
              {showHudDetails && <p className="atlas-ui-muted mt-1.5 truncate text-[10px]">{player?.race} {player?.class}</p>}
            </AtlasHudCard>
          )}
        </div>
      </div>

      {proxHint && (
        <div className="atlas-proximity-hint pointer-events-none absolute left-1/2 z-20 -translate-x-1/2" style={{ bottom: separated ? 12 : "clamp(78px, 13dvh, 118px)" }}>
          <div className="atlas-ui-prompt atlas-toast-in w-full justify-center">
            <GIcon name="info" size={13} />
            <span className="text-center text-xs font-medium leading-tight">{proxHint}</span>
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

      <ExploreQuickMenuV3
        open={quickMenuOpen}
        onClose={() => setQuickMenuOpen(false)}
        onOpenExploreMap={onOpenExploreMap}
        onOpenSectorMap={onOpenSectorMap}
        onOpenJournal={onOpenJournal}
        onOpenHub={onOpenHub}
        onOpenSheet={onOpenSheet}
        onOpenSettings={onOpenSettings}
        onSwitchBoard={onSwitchBoard}
        onPause={onPause}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onRequestOrientation={onRequestOrientation}
      />
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
          <AtlasActionButton kind="a" label="A" sublabel={actionReady ? resolveActionLabel(proxHint) : ""} disabled={!actionReady} onPress={onAction} aria-label={actionReady ? `${proxHint || "Interactuar"}. Pulsar A` : "Acción no disponible"} />
        </div>
      </div>
    </div>
  );
}
