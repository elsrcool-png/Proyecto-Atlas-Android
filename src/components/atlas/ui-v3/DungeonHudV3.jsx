import { Backpack, Bug, Key, LogOut, RotateCw } from "lucide-react";
import Joystick from "../Joystick";
import OrientationToggleButton from "../OrientationToggleButton";
import { AtlasActionButton, AtlasButton, AtlasHudCard, AtlasStatusBar } from "@/components/atlas/ui";

export default function DungeonHudV3({
  dungeon,
  player,
  keys = 0,
  settings,
  onUpdateSettings,
  onRequestOrientation,
  showDebug,
  onToggleDebug,
  onExit,
  onOpenBackpack,
  backpackDisabled = false,
  onMove,
  onRotate,
  onAction,
  tactical = false,
  miniMap = null,
}) {
  return (
    <>
      <div className="atlas-dungeon-hud absolute inset-x-0 top-0 z-40 p-2 pointer-events-none">
        <div className="atlas-dungeon-hud__layout flex items-start justify-between gap-2">
          <AtlasHudCard className="atlas-dungeon-hud__identity pointer-events-auto min-w-0 max-w-[52%]">
            <p className="truncate text-xs font-semibold text-amber-200">{dungeon?.name}</p>
            <p className="atlas-ui-muted truncate text-[10px]">
              {dungeon?.floorCount > 1 ? `Piso ${dungeon.floor}/${dungeon.floorCount}${dungeon.isBossFloor ? " ★" : ""} · ` : ""}
              Nv {player?.level} · {player?.race} {player?.class}
            </p>
          </AtlasHudCard>

          <div className="atlas-dungeon-hud__right pointer-events-auto flex min-w-0 flex-col items-end gap-1.5">
            <div className="atlas-dungeon-hud__status-row flex items-start gap-1.5">
              {keys > 0 && <span className="atlas-ui-badge border-amber-500 text-amber-200"><Key className="h-3 w-3" /> {keys}</span>}
              <AtlasHudCard className="atlas-dungeon-hud__vitals w-36">
                <AtlasStatusBar compact kind="hp" label="HP" value={player?.hp} max={player?.maxHp} />
                <AtlasStatusBar compact kind="energy" label="EN" value={player?.mp || 0} max={player?.maxMp || 0} className="mt-1" />
              </AtlasHudCard>
              {settings && <OrientationToggleButton settings={settings} onChange={onUpdateSettings} onRequestOrientation={onRequestOrientation} className="atlas-ui-icon-button" />}
            </div>

            <div className="atlas-dungeon-hud__actions flex items-center justify-end gap-1.5">
              <AtlasButton
                variant="primary"
                icon={Backpack}
                className="atlas-dungeon-backpack-button !min-h-10 !px-3 text-[10px] shadow-lg"
                onPress={onOpenBackpack}
                disabled={backpackDisabled}
                data-testid="dungeon-backpack-button"
              >
                Mochila
              </AtlasButton>
              <AtlasButton variant="ghost" icon={Bug} className="!min-h-10 !px-2 text-[9px]" onPress={onToggleDebug} aria-label="Alternar depuración">
                {showDebug ? "DBG ✓" : "DBG"}
              </AtlasButton>
              <AtlasButton variant="ghost" icon={LogOut} className="!min-h-10 !px-2 text-[10px]" onPress={onExit}>Salir</AtlasButton>
            </div>

            {miniMap}
          </div>
        </div>
      </div>

      <div className="atlas-dungeon-joystick absolute bottom-6 left-6 z-30"><Joystick onMove={onMove} /></div>
      <div className="atlas-dungeon-actions absolute bottom-6 right-6 z-30 flex items-end gap-3">
        <AtlasActionButton kind="rotate" icon={RotateCw} label="Girar" onPress={onRotate} />
        <AtlasActionButton kind="a" label={tactical ? "⚔" : "A"} sublabel={tactical ? "Atacar" : "Acción"} onPress={onAction} />
      </div>
    </>
  );
}
