import React, { useMemo, useState } from "react";
import { Backpack, Coins, FlaskConical, Gem, ScrollText, Sparkles, X } from "lucide-react";
import { ACCESSORIES, RARITY_COLOR, getBonuses } from "@/lib/atlasSkills";
import { OFFENSIVE_STAT } from "@/lib/atlasSkillDesign";
import { getPotion } from "@/lib/atlasShop";
import { NEW_CONSUMABLES } from "@/lib/atlasLoot";
import { AtlasIconButton, AtlasPanel, AtlasTabs, AtlasUiProvider } from "@/components/atlas/ui";

const QUEST_ITEM_NAMES = {
  kit_viaje_basico: "Kit de viaje básico",
  amuleto_explorador: "Amuleto del explorador",
  suministros_caravana: "Suministros de la caravana",
  contrato_companero_verde: "Contrato de compañero verde",
  sello_piedra: "Sello de piedra",
  fragmento_mapa_antiguo_1: "Primer fragmento del mapa antiguo",
  reliquia_menor_verde: "Reliquia menor verde",
  reliquia_menor_defensiva: "Reliquia menor defensiva",
  restos_guardian_verde: "Restos del arma del Guardián",
  reliquia_antigua_verde: "Reliquia antigua verde",
  botiquin_explorador: "Botiquín del explorador",
  reliquia_verde_restaurada: "Reliquia Verde restaurada",
  sello_consejo_verde: "Sello del Consejo Verde",
  llave_santuario_verde: "Llave del Santuario Verde",
  reliquia_equilibrio_verde: "Reliquia de Equilibrio Verde",
};

function EmptyState({ children }) {
  return <div className="atlas-backpack-empty">{children}</div>;
}

export default function BackpackModal({ player, onEquip, onDiscard, onUseConsumable, onClose }) {
  const inventory = player.accessoryInventory || [];
  const questItems = Object.entries(player.questItems || {}).filter(([, count]) => count > 0);
  const relics = Object.values(player.relics || {}).filter(Boolean);
  const bonus = getBonuses(player);
  const [view, setView] = useState("consumables");

  const potionRows = useMemo(() => [
    { id: "hp_s", name: "Poción pequeña de vida", desc: "Restaura 6 de vida", count: player.potions || 0 },
    ...Object.entries(player.consumables || {}).filter(([, count]) => count > 0).map(([id, count]) => {
      if (NEW_CONSUMABLES[id]) return { id, name: NEW_CONSUMABLES[id].name, desc: NEW_CONSUMABLES[id].desc, count };
      const potion = getPotion(id);
      return {
        id,
        name: potion?.name || id,
        desc: potion?.heal ? `Restaura ${potion.heal} de vida` : `Restaura ${potion?.restore || "?"} de energía`,
        count,
      };
    }),
  ].filter(row => row.count > 0), [player.potions, player.consumables]);

  const tabs = useMemo(() => [
    { id: "consumables", label: "Consumibles", Icon: FlaskConical, badge: potionRows.length || null },
    { id: "campaign", label: "Campaña", Icon: ScrollText, badge: questItems.length + relics.length || null },
    { id: "accessories", label: "Accesorios", Icon: Gem, badge: inventory.length || null },
  ], [potionRows.length, questItems.length, relics.length, inventory.length]);

  const questItemName = id => QUEST_ITEM_NAMES[id] || id.replaceAll("_", " ");

  const renderBonus = currentBonus => {
    const offensive = OFFENSIVE_STAT[player.class] || OFFENSIVE_STAT.Guerrero;
    const parts = [];
    if (currentBonus.atk) parts.push(`+${currentBonus.atk} ${offensive.short}`);
    if (currentBonus.def) parts.push(`+${currentBonus.def} Def. Física`);
    if (currentBonus.magDef) parts.push(`+${currentBonus.magDef} Def. Mágica`);
    if (currentBonus.maxHp) parts.push(`+${currentBonus.maxHp} Vida`);
    return parts.join(" · ") || "Sin bonificaciones de accesorios";
  };

  const stopPropagation = event => event.stopPropagation();

  return (
    <AtlasUiProvider className="atlas-backpack-overlay" mode="backpack" onClick={onClose}>
      <div className="atlas-backpack-shell">
        <AtlasPanel className="atlas-backpack-panel" bodyClassName="atlas-backpack-panel-body" onClick={stopPropagation}>
          <header className="atlas-ui-panel-header atlas-backpack-header">
            <div className="flex min-w-0 items-center gap-3">
              <div className="atlas-backpack-icon"><Backpack className="h-5 w-5" /></div>
              <div className="min-w-0">
                <h2 className="atlas-ui-title truncate">Mochila</h2>
                <p className="atlas-ui-muted truncate text-xs">{renderBonus(bonus)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="atlas-ui-badge"><Coins className="h-3.5 w-3.5" /> {player.gold || 0}</span>
              <AtlasIconButton icon={X} label="Cerrar mochila" onPress={onClose} />
            </div>
          </header>

          <div className="atlas-backpack-tabs">
            <AtlasTabs items={tabs} value={view} onChange={setView} ariaLabel="Secciones de la mochila" panelIdPrefix="atlas-backpack-panel" />
          </div>

          <section key={view} id={`atlas-backpack-panel-${view}`} className="atlas-backpack-content" role="tabpanel" aria-label={tabs.find(tab => tab.id === view)?.label}>
            {view === "consumables" && (
              <div className="atlas-backpack-grid">
                {potionRows.length === 0 && <EmptyState>No tienes consumibles disponibles.</EmptyState>}
                {potionRows.map(potion => (
                  <article key={potion.id} className="atlas-backpack-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-100">{potion.name}</h3>
                        <p className="mt-1 text-[11px] leading-snug text-slate-400">{potion.desc}</p>
                      </div>
                      <span className="atlas-ui-badge shrink-0">x{potion.count}</span>
                    </div>
                    <button type="button" onClick={() => onUseConsumable?.(potion.id)} className="atlas-backpack-action atlas-backpack-action--use">Usar</button>
                  </article>
                ))}
              </div>
            )}

            {view === "campaign" && (
              <div className="atlas-backpack-campaign-layout">
                <section className="atlas-backpack-group">
                  <h3 className="atlas-backpack-group-title"><ScrollText className="h-4 w-4" /> Objetos de campaña</h3>
                  <div className="atlas-backpack-grid">
                    {questItems.length === 0 && <EmptyState>No llevas objetos de campaña.</EmptyState>}
                    {questItems.map(([id, count]) => (
                      <article key={id} className="atlas-backpack-card atlas-backpack-card--campaign">
                        <div className="flex items-center justify-between gap-3">
                          <p className="min-w-0 flex-1 capitalize text-sm text-sky-100">{questItemName(id)}</p>
                          <span className="atlas-ui-badge shrink-0">x{count}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="atlas-backpack-group">
                  <h3 className="atlas-backpack-group-title atlas-backpack-group-title--relic"><Sparkles className="h-4 w-4" /> Reliquias</h3>
                  <div className="atlas-backpack-grid">
                    {relics.length === 0 && <EmptyState>No has obtenido reliquias.</EmptyState>}
                    {relics.map((relic, index) => (
                      <article key={`${relic.name || "reliquia"}-${index}`} className="atlas-backpack-card atlas-backpack-card--relic">
                        <p className="text-sm text-emerald-100">{relic.name || "Reliquia desconocida"}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-emerald-400">{relic.state || "obtenida"}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {view === "accessories" && (
              <div className="atlas-backpack-accessories-layout">
                <section className="atlas-backpack-group atlas-backpack-equipped">
                  <h3 className="atlas-backpack-group-title"><Gem className="h-4 w-4" /> Equipados</h3>
                  <div className="atlas-backpack-grid">
                    {[{ id: player.accessory, slot: 1, label: "Accesorio I" }, { id: player.accessory2, slot: 2, label: "Accesorio II" }].map(entry => {
                      const accessory = entry.id ? ACCESSORIES[entry.id] : null;
                      return (
                        <article key={entry.slot} className={`atlas-backpack-card ${accessory ? `${RARITY_COLOR[accessory.rarity]} bg-slate-800/60` : "opacity-75"}`}>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">{entry.label}</p>
                          {accessory ? (
                            <>
                              <p className="mt-1 text-sm font-medium">{accessory.name}</p>
                              <button type="button" onClick={() => onEquip(entry.id, entry.slot)} className="atlas-backpack-action">Desequipar</button>
                            </>
                          ) : <p className="mt-2 text-sm italic text-slate-500">Vacío</p>}
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="atlas-backpack-group atlas-backpack-inventory">
                  <h3 className="atlas-backpack-group-title"><Backpack className="h-4 w-4" /> Inventario</h3>
                  <div className="atlas-backpack-grid">
                    {inventory.length === 0 && <EmptyState>La mochila está vacía. Abre cofres y derrota jefes para obtener accesorios.</EmptyState>}
                    {inventory.map(id => {
                      const accessory = ACCESSORIES[id];
                      if (!accessory) return null;
                      const equipped1 = player.accessory === id;
                      const equipped2 = player.accessory2 === id;
                      return (
                        <article key={id} className={`atlas-backpack-card ${(equipped1 || equipped2) ? `${RARITY_COLOR[accessory.rarity]} ring-1 ring-amber-400` : ""}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-100">{accessory.name}</p>
                              <p className="mt-1 text-[11px] leading-snug text-slate-400">{accessory.desc}</p>
                            </div>
                            <span className={`shrink-0 text-[9px] uppercase tracking-wider ${RARITY_COLOR[accessory.rarity].split(" ")[0]}`}>{accessory.rarity}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" onClick={() => onEquip(id, 1)} className={`atlas-backpack-action ${equipped1 ? "" : "atlas-backpack-action--equip"}`}>{equipped1 ? "Quitar I" : "Equipar I"}</button>
                            <button type="button" onClick={() => onEquip(id, 2)} disabled={!player.equipmentUnlocks?.accessory2} className={`atlas-backpack-action ${!player.equipmentUnlocks?.accessory2 ? "atlas-backpack-action--disabled" : equipped2 ? "" : "atlas-backpack-action--equip-secondary"}`}>{!player.equipmentUnlocks?.accessory2 ? "II bloqueado" : equipped2 ? "Quitar II" : "Equipar II"}</button>
                            <button type="button" onClick={() => onDiscard(id)} className="atlas-backpack-action atlas-backpack-action--discard">Descartar</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}
          </section>
        </AtlasPanel>
      </div>
    </AtlasUiProvider>
  );
}
