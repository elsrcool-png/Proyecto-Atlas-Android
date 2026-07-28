import { Compass, Map, Pause, Play, Settings, User } from "lucide-react";
import OrientationToggleButton from "../OrientationToggleButton";
import { AtlasButton, AtlasPanel, AtlasUiProvider } from "@/components/atlas/ui";

export default function PauseMenuV3({
  settings,
  onUpdateSettings,
  onRequestOrientation,
  onResume,
  onOpenExploreMap,
  onSwitchBoard,
  onOpenSheet,
  onOpenSettings,
  onAbandon,
}) {
  return (
    <AtlasUiProvider className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" mode="pause">
      <AtlasPanel title="Pausa" className="w-full max-w-sm" bodyClassName="space-y-2 p-4" actions={<Pause className="h-5 w-5" />}>
        <AtlasButton variant="success" icon={Play} full onPress={onResume}>Continuar</AtlasButton>
        <AtlasButton icon={Compass} full onPress={onOpenExploreMap}>Mapa de exploración</AtlasButton>
        <AtlasButton icon={Map} full onPress={onSwitchBoard}>Modo tablero</AtlasButton>
        <AtlasButton icon={User} full onPress={onOpenSheet}>Hoja de personaje</AtlasButton>
        <OrientationToggleButton settings={settings} onChange={onUpdateSettings} onRequestOrientation={onRequestOrientation} label className="atlas-ui-button w-full" />
        <AtlasButton icon={Settings} full onPress={onOpenSettings}>Ajustes</AtlasButton>
        <AtlasButton variant="danger" full onPress={onAbandon}>Abandonar partida</AtlasButton>
      </AtlasPanel>
    </AtlasUiProvider>
  );
}
