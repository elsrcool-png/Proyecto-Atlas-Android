import { useState } from "react";
import { Compass, Home, Map, Move, Pause, Play, Settings, User } from "lucide-react";
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
  onCustomizeHud,
  onReturnMainMenu,
}) {
  const [confirmReturn, setConfirmReturn] = useState(false);

  return (
    <AtlasUiProvider className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" mode="pause">
      <AtlasPanel title="Pausa" className="w-full max-w-sm" bodyClassName="space-y-2 p-4" actions={<Pause className="h-5 w-5" />}>
        {!confirmReturn ? (
          <>
            <AtlasButton variant="success" icon={Play} full onPress={onResume}>Continuar</AtlasButton>
            <AtlasButton icon={Compass} full onPress={onOpenExploreMap}>Mapa de exploración</AtlasButton>
            <AtlasButton icon={Map} full onPress={onSwitchBoard}>Modo tablero</AtlasButton>
            <AtlasButton icon={User} full onPress={onOpenSheet}>Hoja de personaje</AtlasButton>
            <AtlasButton icon={Move} full onPress={onCustomizeHud}>Personalizar HUD táctil</AtlasButton>
            <OrientationToggleButton settings={settings} onChange={onUpdateSettings} onRequestOrientation={onRequestOrientation} label className="atlas-ui-button w-full" />
            <AtlasButton icon={Settings} full onPress={onOpenSettings}>Ajustes</AtlasButton>
            <AtlasButton variant="warning" icon={Home} full onPress={() => setConfirmReturn(true)}>Volver al menú principal</AtlasButton>
          </>
        ) : (
          <div className="space-y-3">
            <div className="atlas-ui-panel atlas-ui-panel--soft p-3 text-sm leading-relaxed">
              La partida se guardará antes de volver al menú principal. No se eliminará la ranura ni el progreso.
            </div>
            <AtlasButton variant="warning" icon={Home} full onPress={onReturnMainMenu}>Guardar y volver</AtlasButton>
            <AtlasButton variant="ghost" full onPress={() => setConfirmReturn(false)}>Cancelar</AtlasButton>
          </div>
        )}
      </AtlasPanel>
    </AtlasUiProvider>
  );
}
