import React, { useState } from "react";
import { X, ChevronLeft, Coins, Backpack, Sword, FlaskConical, ScrollText, User, Settings as SettingsIcon, Shield, Sparkles } from "lucide-react";
import { ENERGY } from "@/lib/atlasSkillDesign";
import { xpToNext } from "@/lib/atlasProgression";
import ChibiSprite from "@/components/atlas/ChibiSprite";
import HubEquipment from "@/components/atlas/hub/HubEquipment";
import HubItems from "@/components/atlas/hub/HubItems";
import HubConsumables from "@/components/atlas/hub/HubConsumables";
import HubMissions from "@/components/atlas/hub/HubMissions";
import HubSheet from "@/components/atlas/hub/HubSheet";
import HubSettings from "@/components/atlas/hub/HubSettings";
import HubGuild from "@/components/atlas/hub/HubGuild";
import HubMasteries from "@/components/atlas/hub/HubMasteries";
import { defaultSettings } from "@/lib/atlasSettings";

const CARDS = [
  { id: "items", label: "Objetos", desc: "Materiales y recursos", Icon: Backpack, color: "text-amber-300", ring: "hover:border-amber-500/60" },
  { id: "equipment", label: "Equipamiento", desc: "Arma, armadura, casco y accesorios", Icon: Sword, color: "text-sky-300", ring: "hover:border-sky-500/60" },
  { id: "consumables", label: "Consumibles", desc: "Pociones y objetos de uso", Icon: FlaskConical, color: "text-rose-300", ring: "hover:border-rose-500/60" },
  { id: "missions", label: "Misiones", desc: "Encargos activos y progreso", Icon: ScrollText, color: "text-violet-300", ring: "hover:border-violet-500/60" },
  { id: "sheet", label: "Hoja de personaje", desc: "Atributos, habilidades y pasivas", Icon: User, color: "text-emerald-300", ring: "hover:border-emerald-500/60" },
  { id: "guild", label: "Gremio", desc: "Contratos, rumores y ascensos", Icon: Shield, color: "text-amber-300", ring: "hover:border-amber-500/60" },
  { id: "masteries", label: "Maestrías", desc: "Aprender, equipar y evolucionar", Icon: Sparkles, color: "text-violet-300", ring: "hover:border-violet-500/60" },
  { id: "settings", label: "Configuración", desc: "Pantalla, sonido y controles", Icon: SettingsIcon, color: "text-slate-300", ring: "hover:border-slate-500/60" },
];

export default function PlayerHub({
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
  progressionState,
  progressionDisplay,
  onAcceptGuildContract,
  onClaimGuildContract,
  onEquipMasterySkill,
  onEquipMasteryPassive,
  onUpgradeMasterySkill,
  onAcceptSpecialQuest,
  onClaimSpecialQuest,
  onClose,
}) {
  const [view, setView] = useState("home");
  const energy = ENERGY[player.class];
  const xpNext = xpToNext(player.level);
  const xpPct = Math.min(100, Math.round(((player.xp || 0) / xpNext) * 100));
  const selected = CARDS.find(card => card.id === view);

  const goHome = () => setView("home");

  return (
    <div className="atlas-player-hub fixed inset-0 z-[70] flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-950/95 backdrop-blur-sm">
      <header className="atlas-player-hub__header shrink-0 border-b border-slate-800 bg-slate-900/95 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {view === "home" ? (
              <div className="min-w-0">
                <h1 className="truncate text-base font-heading tracking-wide text-slate-100">Centro de Atlas</h1>
                <p className="truncate text-[11px] text-slate-400">{player.race} {player.class} · Nv. {player.level} · {region?.name || "Región"}</p>
              </div>
            ) : (
              <button type="button" onClick={goHome} className="flex min-w-0 items-center gap-1.5 rounded-lg px-1 py-1 text-left text-slate-100 active:bg-slate-800">
                <ChevronLeft className="h-5 w-5 shrink-0" />
                <span className="truncate text-sm font-semibold">{selected?.label || "Volver"}</span>
              </button>
            )}
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 active:bg-slate-700" aria-label="Cerrar Centro de Atlas">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="atlas-player-hub__body min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {view === "home" ? (
          <div className="atlas-player-hub__home mx-auto w-full max-w-4xl p-3 sm:p-4">
            <section className="atlas-player-hub__summary rounded-2xl border border-slate-700 bg-slate-900/70 p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-[66px] w-[66px] shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950/60">
                  <ChibiSprite player={player} race={player.race} cls={player.class} size={64} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold text-slate-100">{player.race} {player.class}</h2>
                  <p className="text-xs text-slate-400">Nivel {player.level} · {energy.name}</p>
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                      <span>Experiencia</span><span>{player.xp || 0}/{xpNext}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-700"><div className="h-full bg-sky-400 transition-all" style={{ width: `${xpPct}%` }} /></div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="flex items-center gap-1 text-sm font-medium text-amber-200"><Coins className="h-4 w-4" /> {player.gold || 0}</span>
                  <span className="text-[11px] text-slate-300">{player.hp}/{player.maxHp} <span className="text-rose-400">HP</span></span>
                  <span className="text-[11px] text-slate-300">{player.mp || 0}/{player.maxMp || 0} <span className="text-amber-400">{energy.short}</span></span>
                </div>
              </div>
            </section>

            <section className="atlas-player-hub__menu grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {CARDS.map(card => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setView(card.id)}
                  className={`flex min-h-[104px] flex-col items-start justify-center gap-1 rounded-xl border border-slate-700 bg-slate-800/60 p-3.5 text-left transition active:scale-[0.99] active:bg-slate-700/80 ${card.ring}`}
                >
                  <card.Icon className={`h-6 w-6 ${card.color}`} />
                  <span className="text-sm font-medium leading-tight text-slate-100">{card.label}</span>
                  <span className="text-[11px] leading-snug text-slate-400">{card.desc}</span>
                </button>
              ))}
            </section>

            <button type="button" onClick={onClose} className="atlas-player-hub__close w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-medium text-slate-100 active:bg-slate-700">
              Cerrar menú
            </button>
          </div>
        ) : (
          <div className="atlas-player-hub__section min-h-full pb-5">
            {view === "items" && <HubItems player={player} onSellMaterial={onSellMaterial} />}
            {view === "equipment" && <HubEquipment player={player} onEquipWeapon={onEquipWeapon} onEquipArmor={onEquipArmor} onEquipHelmet={onEquipHelmet} onEquipAccessory={onEquipAccessory} onSellWeapon={onSellWeapon} onSellArmor={onSellArmor} onSellHelmet={onSellHelmet} onSellAccessory={onSellAccessory} onEquipClassWeapon={onEquipClassWeapon} onSellClassWeapon={onSellClassWeapon} />}
            {view === "consumables" && <HubConsumables player={player} onUseConsumable={onUseConsumable} />}
            {view === "missions" && <HubMissions missions={missions} missionDefs={missionDefs} region={region} />}
            {view === "sheet" && <HubSheet player={player} />}
            {view === "guild" && <HubGuild progressionState={progressionState} progressionDisplay={progressionDisplay} onAcceptContract={onAcceptGuildContract} onClaimContract={onClaimGuildContract} onAcceptSpecialQuest={onAcceptSpecialQuest} onClaimSpecialQuest={onClaimSpecialQuest} />}
            {view === "masteries" && <HubMasteries progressionState={progressionState} progressionDisplay={progressionDisplay} onEquipActive={onEquipMasterySkill} onEquipPassive={onEquipMasteryPassive} onUpgradeSkill={onUpgradeMasterySkill} />}
            {view === "settings" && <HubSettings settings={settings} onChange={onUpdateSettings} onReset={() => onUpdateSettings(defaultSettings())} />}
            <div className="mx-auto w-full max-w-2xl px-4 pt-4">
              <button type="button" onClick={goHome} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-medium text-slate-100 active:bg-slate-700">
                <ChevronLeft className="h-4 w-4" /> Volver al menú del Centro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
