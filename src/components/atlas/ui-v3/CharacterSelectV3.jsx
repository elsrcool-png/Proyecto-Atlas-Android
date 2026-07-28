import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { CHARACTERS } from "@/lib/atlasData";
import { OFFENSIVE_STAT, ENERGY } from "@/lib/atlasSkillDesign";
import { GIcon } from "@/lib/atlasIcons";
import { preloadHeroAssetVisuals } from "@/lib/atlasHeroSprites";
import ChibiSprite from "../ChibiSprite";
import { AtlasButton, AtlasPanel, AtlasStatusBar, AtlasUiProvider } from "@/components/atlas/ui";

const RACES = [
  { id: "Humano", icon: "user", desc: "Versátil y adaptable. Potencia la resistencia y el aguante." },
  { id: "Elfo", icon: "leaf", desc: "Ágil y mágico. Favorece la evasión, los sentidos y el control arcano." },
  { id: "Enano", icon: "hammer", desc: "Resistente y ancestral. Refuerza la defensa y la tradición guerrera." },
];

const CLASSES = [
  { id: "Guerrero", icon: "swords", desc: "Combate físico cuerpo a cuerpo. Alta vida y defensa física.", energy: "Adrenalina" },
  { id: "Mago", icon: "wand2", desc: "Combate mágico a distancia. Control arcano y defensa mágica.", energy: "Maná" },
  { id: "Pícaro", icon: "sword", desc: "Combate técnico y preciso. Movilidad y golpes oportunos.", energy: "Concentración" },
];

const CLASS_ALLOC = {
  Guerrero: { offLabel: "ATK", offIcon: "swords" },
  Mago: { offLabel: "Poder Arcano", offIcon: "sparkles" },
  "Pícaro": { offLabel: "Precisión", offIcon: "target" },
};

const POINTS = 3;
const charIdFor = (race, cls) => `${race.toLowerCase()}_${cls.toLowerCase().replace("í", "i")}`;

function ChoiceCard({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={active ? "true" : "false"}
      className="atlas-ui-panel atlas-ui-panel--soft p-4 text-left transition hover:border-sky-400 data-[selected=true]:border-sky-400"
    >
      {children}
    </button>
  );
}

function StepHeader({ step }) {
  const labels = ["Raza", "Clase", "Atributos"];
  return (
    <div className="mb-5 flex items-center justify-center gap-2" aria-label={`Paso ${step + 1} de 3`}>
      {labels.map((label, index) => (
        <React.Fragment key={label}>
          <span className={`atlas-ui-badge ${index === step ? "border-sky-400 text-sky-200" : index < step ? "border-emerald-500 text-emerald-200" : ""}`}>{index + 1}. {label}</span>
          {index < labels.length - 1 && <span className="h-px w-5 bg-slate-600" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function AllocationRow({ icon, label, hint, value, onAdd, onSub, disabledAdd }) {
  return (
    <div className="atlas-ui-list-row">
      <GIcon name={icon} size={17} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="atlas-ui-dim text-[10px]">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onSub} disabled={value <= 0} className="atlas-ui-icon-button !h-8 !w-8 !min-w-8"><Minus className="h-4 w-4" /></button>
        <span className="w-5 text-center font-mono text-sky-300">{value}</span>
        <button type="button" onClick={onAdd} disabled={disabledAdd} className="atlas-ui-icon-button !h-8 !w-8 !min-w-8"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export default function CharacterSelectV3({ onSelect }) {
  useEffect(() => { preloadHeroAssetVisuals(); }, []);
  const [step, setStep] = useState(0);
  const [race, setRace] = useState(null);
  const [cls, setCls] = useState(null);
  const [alloc, setAlloc] = useState({ hp: 0, off: 0, def: 0 });

  const spent = alloc.hp + alloc.off + alloc.def;
  const remaining = POINTS - spent;
  const base = race && cls ? CHARACTERS.find(c => c.id === charIdFor(race, cls)) : null;
  const finalStats = base ? {
    hp: base.hp + alloc.hp * 3,
    attack: base.attack + alloc.off,
    physicalDefense: base.physicalDefense + alloc.def,
    magicalDefense: base.magicalDefense + alloc.def,
  } : null;
  const offMeta = cls ? OFFENSIVE_STAT[cls] : null;
  const allocMeta = cls ? CLASS_ALLOC[cls] : null;
  const energyMeta = cls ? ENERGY[cls] : null;

  const pickRace = (id) => { setRace(id); setStep(1); };
  const pickClass = (id) => { setCls(id); setAlloc({ hp: 0, off: 0, def: 0 }); setStep(2); };
  const addPoint = (key) => { if (remaining > 0) setAlloc(current => ({ ...current, [key]: current[key] + 1 })); };
  const subPoint = (key) => { if (alloc[key] > 0) setAlloc(current => ({ ...current, [key]: current[key] - 1 })); };
  const begin = () => {
    if (!base || remaining > 0) return;
    onSelect({ ...base, ...finalStats, maxHp: finalStats.hp });
  };

  return (
    <AtlasUiProvider className="atlas-ui-screen min-h-screen px-4 py-7" mode="character-select">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 text-center">
          <p className="atlas-ui-muted text-xs uppercase tracking-[0.32em]">Proyecto Atlas</p>
          <h1 className="atlas-ui-title mt-2 text-2xl">Creación de personaje</h1>
        </header>
        <StepHeader step={step} />

        {step === 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {RACES.map(item => (
              <ChoiceCard key={item.id} active={race === item.id} onClick={() => pickRace(item.id)}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <ChibiSprite race={item.id} cls="Guerrero" size={64} />
                  <div className="flex items-center gap-2"><GIcon name={item.icon} size={15} /><h2 className="font-semibold">{item.id}</h2></div>
                  <p className="atlas-ui-muted text-xs leading-snug">{item.desc}</p>
                </div>
              </ChoiceCard>
            ))}
          </div>
        )}

        {step === 1 && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <AtlasButton variant="ghost" icon={ArrowLeft} onPress={() => setStep(0)}>Volver</AtlasButton>
              <p className="atlas-ui-muted text-sm">Raza: <span className="text-sky-300">{race}</span></p>
              <span className="w-24" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {CLASSES.map(item => (
                <ChoiceCard key={item.id} active={cls === item.id} onClick={() => pickClass(item.id)}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <ChibiSprite race={race} cls={item.id} size={64} />
                    <div className="flex items-center gap-2"><GIcon name={item.icon} size={15} /><h2 className="font-semibold">{item.id}</h2></div>
                    <p className="atlas-ui-muted text-xs leading-snug">{item.desc}</p>
                    <span className="atlas-ui-badge">{item.energy}</span>
                  </div>
                </ChoiceCard>
              ))}
            </div>
          </>
        )}

        {step === 2 && base && finalStats && (
          <AtlasPanel
            title={`${race} ${cls}`}
            subtitle={`Reparte los ${remaining} punto(s) restante(s). Recurso de clase: ${energyMeta?.name || "Energía"}.`}
            actions={<AtlasButton variant="ghost" icon={ArrowLeft} onPress={() => setStep(1)}>Volver</AtlasButton>}
            bodyClassName="p-4"
          >
            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
              <div className="atlas-ui-panel atlas-ui-panel--soft flex flex-col items-center p-4">
                <ChibiSprite race={race} cls={cls} size={96} />
                <p className="mt-2 font-semibold">{race} {cls}</p>
                <div className="mt-4 w-full space-y-2">
                  <AtlasStatusBar kind="hp" label="Vida inicial" value={finalStats.hp} max={Math.max(finalStats.hp, base.hp + 9)} />
                  <AtlasStatusBar kind="energy" label={energyMeta?.name || "Energía"} value={base.maxMp || 6} max={base.maxMp || 6} />
                </div>
              </div>
              <div>
                <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["heart", "HP", base.hp, finalStats.hp],
                    [offMeta?.icon, offMeta?.short || "ATK", base.attack, finalStats.attack],
                    ["shield", "Def. Física", base.physicalDefense, finalStats.physicalDefense],
                    ["shield", "Def. Mágica", base.magicalDefense, finalStats.magicalDefense],
                  ].map(([icon, label, initial, final]) => (
                    <div key={label} className="atlas-ui-hud-card px-3 py-2 text-center">
                      <GIcon name={icon} size={15} className="mx-auto" />
                      <p className="atlas-ui-dim mt-1 text-[10px] uppercase">{label}</p>
                      <p className="font-semibold">{initial !== final && <span className="atlas-ui-dim mr-1 text-xs line-through">{initial}</span>}{final}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <AllocationRow icon="heart" label="HP" hint="+3 vida por punto" value={alloc.hp} onAdd={() => addPoint("hp")} onSub={() => subPoint("hp")} disabledAdd={remaining <= 0} />
                  <AllocationRow icon={allocMeta?.offIcon} label={allocMeta?.offLabel} hint="+1 por punto" value={alloc.off} onAdd={() => addPoint("off")} onSub={() => subPoint("off")} disabledAdd={remaining <= 0} />
                  <AllocationRow icon="shield" label="Defensa" hint="+1 Física y +1 Mágica" value={alloc.def} onAdd={() => addPoint("def")} onSub={() => subPoint("def")} disabledAdd={remaining <= 0} />
                </div>
                <AtlasButton className="mt-4" variant="primary" iconAfter={ArrowRight} full onPress={begin} disabled={remaining > 0}>
                  {remaining > 0 ? `Faltan ${remaining} punto(s)` : "Comenzar la aventura"}
                </AtlasButton>
              </div>
            </div>
          </AtlasPanel>
        )}
      </div>
    </AtlasUiProvider>
  );
}
