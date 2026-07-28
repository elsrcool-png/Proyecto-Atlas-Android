import { FolderOpen, Map, Plus, Settings, Skull, Swords } from "lucide-react";
import { AtlasButton, AtlasPanel, AtlasUiProvider } from "@/components/atlas/ui";

export default function MainMenuV3({ onNewGame, onLoadGame, onOpenSettings, hasAnySave }) {
  return (
    <AtlasUiProvider className="atlas-ui-screen atlas-main-menu-root relative" mode="menu">
      <img
        src="/assets/atlas/ui/v3/menu_region_verde.jpg"
        alt="Campamento de la Región Verde"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,8,14,.9)_0%,rgba(3,8,14,.7)_48%,rgba(3,8,14,.4)_100%)]" />

      <div className="atlas-main-menu-layout pointer-events-auto">
        <div className="atlas-main-menu-grid">
          <div className="min-w-0">
            <p className="atlas-ui-muted text-xs uppercase tracking-[0.32em]">Proyecto</p>
            <h1 className="atlas-ui-title mt-2 text-3xl sm:text-4xl">ATLAS</h1>
            <p className="atlas-ui-muted mt-3 max-w-lg text-sm leading-relaxed">
              El mundo responde a tus decisiones. Tres regiones, nueve héroes y una campaña guardada en ranuras independientes.
            </p>
          </div>

          <div className="min-w-0">
            <AtlasPanel variant="glass" bodyClassName="p-4 sm:p-5">
              <div className="space-y-3">
                <AtlasButton variant="primary" icon={Plus} full onPress={onNewGame}>Nueva partida</AtlasButton>
                <AtlasButton icon={FolderOpen} full onPress={onLoadGame} disabled={!hasAnySave}>
                  {hasAnySave ? "Cargar partida" : "Sin partidas guardadas"}
                </AtlasButton>
                <AtlasButton variant="ghost" icon={Settings} full onPress={onOpenSettings}>Ajustes</AtlasButton>
              </div>
            </AtlasPanel>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="atlas-ui-hud-card px-2 py-2"><Map className="mx-auto h-4 w-4" /><p className="mt-1 text-[11px]">3 regiones</p></div>
              <div className="atlas-ui-hud-card px-2 py-2"><Skull className="mx-auto h-4 w-4" /><p className="mt-1 text-[11px]">3 jefes</p></div>
              <div className="atlas-ui-hud-card px-2 py-2"><Swords className="mx-auto h-4 w-4" /><p className="mt-1 text-[11px]">9 héroes</p></div>
            </div>
          </div>
        </div>
      </div>
    </AtlasUiProvider>
  );
}
