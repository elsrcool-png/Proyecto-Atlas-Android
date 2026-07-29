import { Backpack, Compass, LayoutGrid, Map, Pause, ScrollText, Settings, User, X } from "lucide-react";
import { AtlasButton, AtlasIconButton, AtlasPanel, AtlasUiProvider } from "@/components/atlas/ui";
import OrientationToggleButton from "../OrientationToggleButton";

export default function ExploreQuickMenuV3({
  open,
  onClose,
  onOpenExploreMap,
  onOpenSectorMap,
  onOpenJournal,
  onOpenHub,
  onOpenSheet,
  onOpenSettings,
  onSwitchBoard,
  onPause,
  settings,
  onUpdateSettings,
  onRequestOrientation,
}) {
  if (!open) return null;

  const run = (callback) => {
    onClose?.();
    callback?.();
  };

  return (
    <AtlasUiProvider className="atlas-quick-menu-backdrop absolute inset-0 z-[34]" mode="quick-menu" onPointerDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <AtlasPanel
        title="Menú rápido"
        subtitle="Accesos de exploración"
        className="atlas-quick-menu-panel"
        bodyClassName="atlas-quick-menu-body"
        actions={<AtlasIconButton icon={X} label="Cerrar menú rápido" onPress={onClose} />}
      >
        <OrientationToggleButton settings={settings} onChange={onUpdateSettings} onRequestOrientation={onRequestOrientation} label className="atlas-ui-button w-full" />
        <AtlasButton icon={Compass} full onPress={() => run(onOpenExploreMap)}>Mapa de exploración</AtlasButton>
        <AtlasButton icon={LayoutGrid} full onPress={() => run(onOpenSectorMap)}>Mapa de sectores</AtlasButton>
        <AtlasButton icon={ScrollText} full onPress={() => run(onOpenJournal)}>Misiones</AtlasButton>
        <AtlasButton icon={Backpack} full onPress={() => run(onOpenHub)}>Centro de Atlas</AtlasButton>
        <AtlasButton icon={User} full onPress={() => run(onOpenSheet)}>Hoja de personaje</AtlasButton>
        <AtlasButton icon={Settings} full onPress={() => run(onOpenSettings)}>Ajustes</AtlasButton>
        <AtlasButton icon={Map} full onPress={() => run(onSwitchBoard)}>Modo tablero</AtlasButton>
        <AtlasButton variant="warning" icon={Pause} full onPress={() => run(onPause)}>Pausa y salida</AtlasButton>
      </AtlasPanel>
    </AtlasUiProvider>
  );
}
