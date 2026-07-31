import { Backpack, Key, LogOut, RotateCw } from "lucide-react";
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
}) {
  return (
    <>
      <div className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-2 p-2">
        <AtlasHudCard className="max-w-[52%]">
          <p className="truncate text-xs font-semibold text-amber-200">{dungeon?.name}</p>
          <p className="atlas-ui-muted truncate text-[10px]">
            {dungeon?.floorCount > 1 ? `Piso ${dungeon.floor}/${dungeon.floorCount}${dungeon.isBossFloor ? " ★" : ""} · ` : ""}
            Nv {player?.level} · {player?.race} {player?.class}
          </p>
        </AtlasHudCard>
        <div className="flex items-center gap-1.5">
          {keys > 0 && <span className="atlas-ui-badge border-amber-500 text-amber-200"><Key className="h-3 w-3" /> {keys}</span>}
          <AtlasHudCard className="w-36">
            <AtlasStatusBar compact kind="hp" label="HP" value={player?.hp} max={player?.maxHp} />
            <AtlasStatusBar compact kind="energy" label="EN" value={player?.mp || 0} max={player?.maxMp || 0} className="mt-1" />
          </AtlasHudCard>
          {settings && <OrientationToggleButton settings={settings} onChange={onUpdateSettings} onRequestOrientation={onRequestOrientation} className="atlas-ui-icon-button" />}
          <AtlasButton variant="ghost" icon={Backpack} className="!min-h-10 !px-2 text-[10px]" onPress={onOpenBackpack} disabled={backpackDisabled}>Mochila</AtlasButton>
          <AtlasButton variant="ghost" className="!min-h-10 !px-2 text-[10px]" onPress={onToggleDebug}>{showDebug ? "DBG ✓" : "DBG"}</AtlasButton>
          <AtlasButton variant="ghost" icon={LogOut} className="!min-h-10 !px-3 text-xs" onPress={onExit}>Salir</AtlasButton>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-20"><Joystick onMove={onMove} /></div>
      <div className="absolute bottom-6 right-6 z-20 flex items-end gap-3">
        <AtlasActionButton kind="rotate" icon={RotateCw} label="Girar" onPress={onRotate} />
        <AtlasActionButton kind="a" label={tactical ? "⚔" : "A"} sublabel={tactical ? "Atacar" : "Acción"} onPress={onAction} />
      </div>
    </>
  );
}
