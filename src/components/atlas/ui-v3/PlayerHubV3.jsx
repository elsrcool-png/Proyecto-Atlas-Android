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
import { AtlasButton, AtlasIconButton, AtlasPanel, AtlasStatusBar, AtlasTabs, AtlasUiProvider } from "@/components/atlas/ui";

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

  return (
    <AtlasUiProvider className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" regionId={region?.id} mode="hub">
      <div className="h-full p-2 sm:p-4">
        <AtlasPanel className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden" bodyClassName="min-h-0 flex-1">
          <header className="atlas-ui-panel-header">
            <div className="flex min-w-0 items-center gap-3">
              <ChibiSprite player={player} race={player.race} cls={player.class} size={54} />
              <div className="min-w-0">
                <h1 className="atlas-ui-title truncate">Centro de Atlas</h1>
                <p className="atlas-ui-muted truncate text-sm">{player.race} {player.class} · Nivel {player.level} · {region?.name || "Región"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="atlas-ui-badge"><Coins className="h-3.5 w-3.5" /> {player.gold || 0}</span>
              <AtlasIconButton icon={X} label="Cerrar Centro de Atlas" onPress={onClose} />
            </div>
          </header>

          <div className="grid h-full min-h-0 lg:grid-cols-[250px_1fr]">
            <aside className="border-b p-3 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--atlas-ui-border-soft)" }}>
              <div className="atlas-ui-panel atlas-ui-panel--soft p-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{player.race} {player.class}</p>
                    <p className="atlas-ui-dim text-[11px]">{energy?.name || "Energía"}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <AtlasStatusBar compact kind="hp" label="Vida" value={player.hp} max={player.maxHp} />
                  <AtlasStatusBar compact kind="energy" label={energy?.name || "Energía"} value={player.mp || 0} max={player.maxMp || 0} />
                  <AtlasStatusBar compact kind="energy" label="Experiencia" value={xp} max={xpNext} />
                </div>
              </div>

              <div className="mt-3 hidden space-y-1 lg:block">
                {SECTIONS.map(({ id, label, Icon }) => (
                  <button key={id} type="button" onClick={() => setView(id)} data-selected={view === id ? "true" : "false"} className="atlas-ui-list-row w-full text-left">
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </aside>

            <main className="flex min-h-0 flex-col">
              <div className="border-b p-2 lg:hidden" style={{ borderColor: "var(--atlas-ui-border-soft)" }}>
                <AtlasTabs items={tabItems} value={view} onChange={setView} ariaLabel="Centro de Atlas" />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {content}
              </div>
              <div className="border-t p-3" style={{ borderColor: "var(--atlas-ui-border-soft)" }}>
                <AtlasButton variant="ghost" full onPress={onClose}>Cerrar menú</AtlasButton>
              </div>
            </main>
          </div>
        </AtlasPanel>
      </div>
    </AtlasUiProvider>
  );
}
