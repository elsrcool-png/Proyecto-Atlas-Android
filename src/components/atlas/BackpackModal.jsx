import React from "react";
import { Backpack, Coins, Gem, ScrollText, Sparkles, X } from "lucide-react";
import { ACCESSORIES, RARITY_COLOR, getBonuses } from "@/lib/atlasSkills";
import { OFFENSIVE_STAT } from "@/lib/atlasSkillDesign";
import { getPotion } from "@/lib/atlasShop";
import { NEW_CONSUMABLES } from "@/lib/atlasLoot";

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
  fragmento_nucleo_artico: "Fragmento del Núcleo Ártico",
  nucleo_solar_antiguo: "Núcleo Solar Antiguo",
  mensaje_ultimo_mensajero: "Mensaje del último mensajero",
  mapa_ruta_boreal: "Mapa de la ruta boreal",
  muestra_cristal_bestia: "Muestra de cristal de bestia",
  diario_einar: "Diario de Einar",
  orden_expedicion_final: "Orden de expedición final",
  cristal_susurro: "Cristal del Susurro",
  simbolos_lago_congelado: "Símbolos del lago congelado",
  memoria_portadores: "Memoria de los Portadores",
  corazon_cristal_recompuesto: "Corazón de cristal recompuesto",
  sello_nivalis: "Sello de Nivalis",
  nucleo_cristal_negro: "Núcleo de cristal negro",
  runa_puerta_sellada: "Runa de la puerta sellada",
  medalla_defensa_ciudadela: "Medalla de la defensa de la Ciudadela",
  llave_nucleo_glacial: "Llave del Núcleo Glacial",
};

function SectionTitle({ icon: Icon, children, className = "text-slate-300" }) {
  return <h3 className={`mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest ${className}`}><Icon className="h-3.5 w-3.5" /> {children}</h3>;
}

export default function BackpackModal({ player, onEquip, onDiscard, onUseConsumable, onClose }) {
  const inventory = player.accessoryInventory || [];
  const questItems = Object.entries(player.questItems || {}).filter(([, count]) => count > 0);
  const relics = Object.values(player.relics || {}).filter(Boolean);
  const bonus = getBonuses(player);
  const potionRows = [
    { id: "hp_s", name: "Poción pequeña de vida", desc: "Restaura 6 de vida", count: player.potions || 0 },
    ...Object.entries(player.consumables || {}).filter(([, count]) => count > 0).map(([id, count]) => {
      if (NEW_CONSUMABLES[id]) return { id, name: NEW_CONSUMABLES[id].name, desc: NEW_CONSUMABLES[id].desc, count };
      const potion = getPotion(id);
      return { id, name: potion?.name || id, desc: potion?.heal ? `Restaura ${potion.heal} de vida` : `Restaura ${potion?.restore || "?"} de energía`, count };
    }),
  ].filter(row => row.count > 0);

  const renderBonus = currentBonus => {
    const offensive = OFFENSIVE_STAT[player.class] || OFFENSIVE_STAT.Guerrero;
    const parts = [];
    if (currentBonus.atk) parts.push(`+${currentBonus.atk} ${offensive.short}`);
    if (currentBonus.def) parts.push(`+${currentBonus.def} Def. Física`);
    if (currentBonus.magDef) parts.push(`+${currentBonus.magDef} Def. Mágica`);
    if (currentBonus.maxHp) parts.push(`+${currentBonus.maxHp} Vida`);
    return parts.join(" · ") || "Sin bonificaciones activas";
  };

  return (
    <div className="atlas-backpack-classic fixed inset-0 z-[80] flex h-[100dvh] min-h-0 items-center justify-center overflow-hidden bg-slate-950/90 backdrop-blur-sm" onClick={onClose}>
      <div className="atlas-backpack-classic__panel flex h-full min-h-0 w-full max-w-4xl flex-col overflow-hidden border-slate-700 bg-slate-900 sm:h-[calc(100dvh-24px)] sm:rounded-2xl sm:border" onClick={event => event.stopPropagation()}>
        <header className="atlas-backpack-classic__header shrink-0 border-b border-slate-700 bg-slate-900/95 px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-950/60 text-amber-300"><Backpack className="h-5 w-5" /></div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-100">Mochila</h2>
                <p className="truncate text-[10px] text-emerald-300">{renderBonus(bonus)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-1 rounded-full border border-amber-700/50 bg-amber-950/30 px-2.5 py-1 text-xs text-amber-200"><Coins className="h-3.5 w-3.5" /> {player.gold || 0}</span>
              <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 active:bg-slate-700" aria-label="Cerrar mochila"><X className="h-5 w-5" /></button>
            </div>
          </div>
        </header>

        <div className="atlas-backpack-classic__body min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
          <div className="mx-auto grid w-full max-w-4xl gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <section className="rounded-xl border border-slate-700 bg-slate-950/25 p-3">
                <SectionTitle icon={Gem} className="text-rose-300">Consumibles</SectionTitle>
                {potionRows.length === 0 ? (
                  <p className="text-xs italic text-slate-500">No tienes consumibles disponibles.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {potionRows.map(potion => (
                      <article key={potion.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                        <div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-slate-100">{potion.name}</p><span className="shrink-0 text-[10px] text-slate-400">x{potion.count}</span></div>
                        <p className="mt-1 text-[11px] leading-snug text-slate-400">{potion.desc}</p>
                        <button type="button" onClick={() => onUseConsumable?.(potion.id)} className="mt-2 min-h-9 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white active:bg-emerald-500">Usar</button>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-700 bg-slate-950/25 p-3">
                <SectionTitle icon={ScrollText} className="text-sky-300">Objetos de campaña</SectionTitle>
                {questItems.length === 0 ? (
                  <p className="text-xs italic text-slate-500">No llevas objetos de campaña.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {questItems.map(([id, count]) => (
                      <div key={id} className="rounded-lg border border-sky-900/60 bg-sky-950/20 px-3 py-2">
                        <div className="flex items-center justify-between gap-2"><span className="text-[11px] capitalize text-sky-100">{QUEST_ITEM_NAMES[id] || id.replaceAll("_", " ")}</span><span className="text-[10px] text-slate-400">x{count}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-700 bg-slate-950/25 p-3">
                <SectionTitle icon={Sparkles} className="text-emerald-300">Reliquias</SectionTitle>
                {relics.length === 0 ? (
                  <p className="text-xs italic text-slate-500">No has obtenido reliquias.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {relics.map((relic, index) => (
                      <div key={`${relic.name || "reliquia"}-${index}`} className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 px-3 py-2">
                        <div className="flex items-start justify-between gap-2"><p className="text-[11px] font-medium text-emerald-100">{relic.name || "Reliquia desconocida"}</p><span className="shrink-0 rounded-full border border-emerald-700/50 bg-emerald-950/40 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-emerald-300">Reliquia</span></div>
                        <p className="mt-0.5 text-[9px] uppercase tracking-wider text-emerald-400">{relic.state || "obtenida"}{relic.form ? ` · ${relic.form}` : ""}</p>
                        {relic.desc && <p className="mt-1 text-[10px] leading-snug text-slate-400">{relic.desc}</p>}
                        {relic.source && <p className="mt-1 text-[9px] text-emerald-500/80">Origen: {relic.source}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-xl border border-slate-700 bg-slate-950/25 p-3">
                <SectionTitle icon={Gem} className="text-amber-300">Accesorios equipados</SectionTitle>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[{ id: player.accessory, slot: 1, label: "Accesorio I" }, { id: player.accessory2, slot: 2, label: "Accesorio II" }].map(entry => {
                    const accessory = entry.id ? ACCESSORIES[entry.id] : null;
                    return (
                      <article key={entry.slot} className={`rounded-lg border px-3 py-2 ${accessory ? `${RARITY_COLOR[accessory.rarity]} bg-slate-800/60` : "border-slate-700 bg-slate-800/30"}`}>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">{entry.label}</p>
                        {accessory ? (
                          <><p className="mt-1 text-sm font-medium text-slate-100">{accessory.name}</p><button type="button" onClick={() => onEquip(entry.id, entry.slot)} className="mt-2 min-h-9 w-full rounded-lg bg-slate-700 px-3 py-2 text-xs text-slate-100 active:bg-slate-600">Desequipar</button></>
                        ) : <p className="mt-2 text-xs italic text-slate-500">Vacío</p>}
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-slate-700 bg-slate-950/25 p-3">
                <SectionTitle icon={Backpack} className="text-violet-300">Inventario de accesorios</SectionTitle>
                {inventory.length === 0 ? (
                  <p className="text-xs leading-relaxed text-slate-500">La mochila está vacía. Abre cofres y derrota jefes para obtener accesorios.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {inventory.map(id => {
                      const accessory = ACCESSORIES[id];
                      if (!accessory) return null;
                      const equipped1 = player.accessory === id;
                      const equipped2 = player.accessory2 === id;
                      return (
                        <article key={id} className={`rounded-lg border px-3 py-2 ${(equipped1 || equipped2) ? `${RARITY_COLOR[accessory.rarity]} ring-1 ring-amber-400` : "border-slate-700 bg-slate-800/40"}`}>
                          <div className="flex items-start justify-between gap-2"><span className="text-sm font-medium text-slate-100">{accessory.name}</span><span className={`text-[9px] uppercase tracking-wider ${RARITY_COLOR[accessory.rarity].split(" ")[0]}`}>{accessory.rarity}</span></div>
                          <p className="mt-1 text-[11px] leading-snug text-slate-400">{accessory.desc}</p>
                          <div className="mt-2 grid grid-cols-2 gap-1.5">
                            <button type="button" onClick={() => onEquip(id, 1)} className={`min-h-9 rounded-lg px-2 py-2 text-[10px] font-medium ${equipped1 ? "bg-slate-700 text-slate-300" : "bg-emerald-600 text-white active:bg-emerald-500"}`}>{equipped1 ? "Quitar I" : "Equipar I"}</button>
                            <button type="button" onClick={() => onEquip(id, 2)} disabled={!player.equipmentUnlocks?.accessory2} className={`min-h-9 rounded-lg px-2 py-2 text-[10px] font-medium ${!player.equipmentUnlocks?.accessory2 ? "bg-slate-700 text-slate-500" : equipped2 ? "bg-slate-700 text-slate-300" : "bg-violet-600 text-white active:bg-violet-500"}`}>{!player.equipmentUnlocks?.accessory2 ? "II bloqueado" : equipped2 ? "Quitar II" : "Equipar II"}</button>
                            <button type="button" onClick={() => onDiscard(id)} className="col-span-2 min-h-9 rounded-lg bg-rose-700 px-2 py-2 text-[10px] font-medium text-white active:bg-rose-600">Descartar</button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
