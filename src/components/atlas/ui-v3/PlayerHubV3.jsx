import { useMemo, useState } from "react";
import { Backpack, Coins, FlaskConical, ScrollText, Settings, Shield, Sword, User, X } from "lucide-react";
import { ENERGY } from "@/lib/atlasSkillDesign";
import { xpToNext } from "@/lib/atlasProgression";
import { defaultSettings } from "@/lib/atlasSettings";
import ChibiSprite from "../ChibiSprite";
import HubEquipment from "../hub/HubEquipment";
import HubItems from "../hub/HubItems";
import HubConsumables from "../hub/HubConsumables";
import HubMissions from "../hub/HubMissions";
import HubSheet from "../hub/HubSheet";
import HubSettings from "../hub/HubSettings";
import { AtlasIconButton, AtlasPanel, AtlasStatusBar, AtlasTabs, AtlasUiProvider } from "@/components/atlas/ui";

const SECTIONS = [
  { id: "items", label: "Objetos", Icon: Backpack },
  { id: "equipment", label: "Equipamiento", Icon: Sword },
  { id: "consumables", label: "Consumibles", Icon: FlaskConical },
  { id: "missions", label: "Misiones", Icon: ScrollText },
  { id: "sheet", label: "Hoja", Icon: User },
  { id: "settings", label: "Configuración", Icon: Settings },
];

export default function PlayerHubV3({
  player,
  region,
  missions,
  missionDefs,
  settings,
  onUpdateSettings,
  onUseConsumable,
  onEquipWeapon,
  onEquipArmor,
  onEquipHelmet,
  onEquipAccessory,
  onSellWeapon,
  onSellArmor,
  onSellHelmet,
  onSellAccessory,
  onSellMaterial,
  onEquipClassWeapon,
  onSellClassWeapon,
  onClose,
}) {
  const [view, setView] = useState("items");
  const energy = ENERGY[player.class];
  const xpNext = xpToNext(player.level);
  const xp = player.xp || 0;
  const tabItems = useMemo(() => SECTIONS, []);

  const content = {
    items: <HubItems player={player} onSellMaterial={onSellMaterial} />,
    equipment: <HubEquipment player={player} onEquipWeapon={onEquipWeapon} onEquipArmor={onEquipArmor} onEquipHelmet={onEquipHelmet} onEquipAccessory={onEquipAccessory} onSellWeapon={onSellWeapon} onSellArmor={onSellArmor} onSellHelmet={onSellHelmet} onSellAccessory={onSellAccessory} onEquipClassWeapon={onEquipClassWeapon} onSellClassWeapon={onSellClassWeapon} />,
    consumables: <HubConsumables player={player} onUseConsumable={onUseConsumable} />,
    missions: <HubMissions missions={missions} missionDefs={missionDefs} region={region} />,
    sheet: <HubSheet player={player} />,
    settings: <HubSettings settings={settings} onChange={onUpdateSettings} onReset={() => onUpdateSettings(defaultSettings())} />,
  }[view];

  const selectedLabel = SECTIONS.find(section => section.id === view)?.label || "Centro de Atlas";

  return (
    <AtlasUiProvider className="atlas-hub-overlay" regionId={region?.id} mode="hub">
      <div className="atlas-hub-shell">
        <AtlasPanel className="atlas-hub-panel" bodyClassName="atlas-hub-panel-body">
          <header className="atlas-ui-panel-header atlas-hub-header">
            <div className="flex min-w-0 items-center gap-3">
              <div className="atlas-hub-avatar">
                <ChibiSprite player={player} race={player.race} cls={player.class} size={50} />
              </div>
              <div className="min-w-0">
                <h1 className="atlas-ui-title truncate">Centro de Atlas</h1>
                <p className="atlas-ui-muted truncate text-sm">{player.race} {player.class} · Nv. {player.level} · {region?.name || "Región"}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="atlas-ui-badge"><Coins className="h-3.5 w-3.5" /> {player.gold || 0}</span>
              <AtlasIconButton icon={X} label="Cerrar Centro de Atlas" onPress={onClose} />
            </div>
          </header>

          <div className="atlas-hub-layout">
            <aside className="atlas-hub-sidebar" aria-label="Secciones del Centro de Atlas">
              <div className="atlas-ui-panel atlas-ui-panel--soft atlas-hub-summary">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-sky-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{player.race} {player.class}</p>
                    <p className="atlas-ui-dim text-[11px]">{energy?.name || "Energía"}</p>
                  </div>
                </div>
                <div className="atlas-hub-bars">
                  <AtlasStatusBar compact kind="hp" label="Vida" value={player.hp} max={player.maxHp} />
                  <AtlasStatusBar compact kind="energy" label={energy?.name || "Energía"} value={player.mp || 0} max={player.maxMp || 0} />
                  <AtlasStatusBar compact kind="energy" label="Experiencia" value={xp} max={xpNext} />
                </div>
              </div>

              <nav className="atlas-hub-nav">
                {SECTIONS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setView(id)}
                    aria-current={view === id ? "page" : undefined}
                    data-selected={view === id ? "true" : "false"}
                    className="atlas-ui-list-row atlas-hub-nav-button"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <main className="atlas-hub-main">
              <div className="atlas-hub-mobile-tabs">
                <AtlasTabs items={tabItems} value={view} onChange={setView} ariaLabel="Centro de Atlas" panelIdPrefix="atlas-hub-panel" />
              </div>
              <div className="atlas-hub-section-title" aria-hidden="true">{selectedLabel}</div>
              <section
                key={view}
                id={`atlas-hub-panel-${view}`}
                className="atlas-hub-content"
                role="tabpanel"
                aria-label={selectedLabel}
              >
                {content}
              </section>
            </main>
          </div>
        </AtlasPanel>
      </div>
    </AtlasUiProvider>
  );
}
