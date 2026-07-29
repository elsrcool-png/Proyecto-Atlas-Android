import React, { useEffect, useState } from "react";
import { CHARACTERS } from "@/lib/atlasData";
import { OFFENSIVE_STAT, ENERGY } from "@/lib/atlasSkillDesign";
import { GIcon } from "@/lib/atlasIcons";
import ChibiSprite from "./ChibiSprite";
import { preloadHeroAssetVisuals } from "@/lib/atlasHeroSprites";

const RACES = [
  { id: "Humano", icon: "user", desc: "Versátil y adaptable. Sus bonificaciones raciales potencian la resistencia y el aguante en cualquier clase." },
  { id: "Elfo", icon: "leaf", desc: "Ágil y mágico. Sus bonificaciones raciales favorecen la evasión, los sentidos y el control arcano." },
  { id: "Enano", icon: "hammer", desc: "Resistente y ancestral. Sus bonificaciones raciales refuerzan la defensa y la tradición guerrera." },
];
const CLASSES = [
  { id: "Guerrero", icon: "swords", desc: "Combate físico cuerpo a cuerpo. Alta vida y defensa física. Usa Adrenalina.", energy: "Adrenalina" },
  { id: "Mago", icon: "wand2", desc: "Combate mágico a distancia. Alta defensa mágica y habilidades arcanas. Usa Maná.", energy: "Maná" },
  { id: "Pícaro", icon: "sword", desc: "Combate técnico y preciso. Equilibrado, golpea donde duele. Usa Concentración.", energy: "Concentración" },
];

const charIdFor = (race, cls) => `${race.toLowerCase()}_${cls.toLowerCase().replace("í", "i")}`;
const CLASS_ALLOC = { Guerrero: { offLabel: "ATK", offIcon: "swords" }, Mago: { offLabel: "Poder Arcano", offIcon: "sparkles" }, "Pícaro": { offLabel: "Precisión", offIcon: "target" } };
const POINTS = 3;

const IDENTITY = {
  humano_guerrero: "Combatiente adaptable especializado en supervivencia, resistencia y daño físico constante.",
  humano_mago: "Conjurador adaptable que combina conocimiento y magia para controlar diferentes situaciones.",
  humano_picaro: "Especialista versátil en infiltración y precisión. Movilidad y ataques oportunos.",
  enano_guerrero: "Guerrero resistente especializado en romper defensas y aguantar grandes cantidades de daño.",
  enano_mago: "Mago de tradición antigua enfocado en invocaciones resistentes y energía ancestral.",
  enano_picaro: "Especialista en combate técnico y precisión. Resistencia y astucia.",
  elfo_guerrero: "Guerrero veloz que combina técnica y agilidad para ataques precisos y presión constante.",
  elfo_mago: "Especialista en magia elemental y control del campo. Domina mediante distancia y estrategia.",
  elfo_picaro: "Especialista en velocidad extrema, múltiples golpes y ataques de precisión.",
};

function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {["Raza", "Clase", "Atributos"].map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full transition ${i <= step ? "bg-sky-400" : "bg-slate-700"}`} />
          <span className={`text-[10px] uppercase tracking-widest ${i === step ? "text-sky-300" : "text-slate-500"}`}>{label}</span>
          {i < 2 && <div className="w-6 h-px bg-slate-700" />}
        </div>
      ))}
    </div>
  );
}

function CardButton({ active, onClick, children }) {
  return (<button onClick={onClick} className={`text-left rounded-2xl border p-5 transition group ${active ? "bg-slate-800/80 border-sky-500 ring-1 ring-sky-500/50" : "bg-slate-900/70 border-slate-800 hover:border-sky-500/60 hover:bg-slate-900"}`}>{children}</button>);
}

function StatPreview({ icon, label, base, final }) {
  const changed = final !== base;
  return (<div className="rounded-lg bg-slate-800/60 py-2 flex flex-col items-center gap-0.5"><GIcon name={icon} size={14} /><div className="text-[9px] uppercase text-slate-500">{label}</div><div className="text-sm font-semibold">{changed ? <><span className="text-slate-500 line-through text-xs">{base}</span> {final}</> : final}</div></div>);
}

function AllocRow({ icon, label, hint, value, onAdd, onSub, disabledAdd }) {
  return (<div className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2"><GIcon name={icon} size={16} /><div className="flex-1 min-w-0"><div className="text-sm font-medium">{label}</div><div className="text-[10px] text-slate-500">{hint}</div></div><div className="flex items-center gap-2"><button onClick={onSub} disabled={value <= 0} className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-lg leading-none transition">−</button><span className="w-6 text-center font-mono font-semibold text-sky-300">{value}</span><button onClick={onAdd} disabled={disabledAdd} className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-lg leading-none transition">+</button></div></div>);
}

export default function CharacterSelect({ onSelect }) {
  useEffect(() => { preloadHeroAssetVisuals(); }, []);
  const [step, setStep] = useState(0);
  const [race, setRace] = useState(null);
  const [cls, setCls] = useState(null);
  const [alloc, setAlloc] = useState({ hp: 0, off: 0, def: 0 });

  const spent = alloc.hp + alloc.off + alloc.def;
  const remaining = POINTS - spent;
  const base = race && cls ? CHARACTERS.find(c => c.id === charIdFor(race, cls)) : null;

  const pickRace = (r) => { setRace(r); setStep(1); };
  const pickClass = (c) => { setCls(c); setAlloc({ hp: 0, off: 0, def: 0 }); setStep(2); };
  const back = () => setStep(s => Math.max(0, s - 1));
  const addPoint = (key) => { if (remaining > 0) setAlloc(a => ({ ...a, [key]: a[key] + 1 })); };
  const subPoint = (key) => { if (alloc[key] > 0) setAlloc(a => ({ ...a, [key]: a[key] - 1 })); };

  const finalStats = base ? { hp: base.hp + alloc.hp * 3, attack: base.attack + alloc.off, physicalDefense: base.physicalDefense + alloc.def, magicalDefense: base.magicalDefense + alloc.def } : null;
  const begin = () => { if (!base || remaining > 0) return; onSelect({ ...base, ...finalStats, maxHp: finalStats.hp }); };

  const offMeta = cls ? OFFENSIVE_STAT[cls] : null;
  const allocMeta = cls ? CLASS_ALLOC[cls] : null;
  const energyMeta = cls ? ENERGY[cls] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.4em] uppercase text-sky-400 mb-2">Proyecto Atlas</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Creación de personaje</h1>
        </div>
        <StepDots step={step} />
        {step === 0 && (
          <div>
            <h2 className="text-center text-sm text-slate-400 mb-5">Elige tu raza</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RACES.map(r => (
                <CardButton key={r.id} active={race === r.id} onClick={() => pickRace(r.id)}>
                  <div className="flex flex-col items-center text-center gap-2"><ChibiSprite player={{ race: r.id, class: "Guerrero", equipmentUnlocks: { helmet: false, accessory2: false } }} race={r.id} cls="Guerrero" size={56} surface="characterSelect" /><div className="flex items-center gap-1.5"><GIcon name={r.icon} size={14} /><h3 className="font-semibold">{r.id}</h3></div><p className="text-[11px] text-slate-400 leading-snug">{r.desc}</p></div>
                </CardButton>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="flex items-center justify-between mb-4"><button onClick={back} className="text-xs text-slate-400 hover:text-slate-200">‹ Volver</button><h2 className="text-center text-sm text-slate-400">Raza: <span className="text-sky-300">{race}</span> · Elige tu clase</h2><span className="w-12" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CLASSES.map(c => (
                <CardButton key={c.id} active={cls === c.id} onClick={() => pickClass(c.id)}>
                  <div className="flex flex-col items-center text-center gap-2"><ChibiSprite player={{ race, class: c.id, equipmentUnlocks: { helmet: false, accessory2: false } }} race={race} cls={c.id} size={56} surface="characterSelect" /><div className="flex items-center gap-1.5"><GIcon name={c.icon} size={14} /><h3 className="font-semibold">{c.id}</h3></div><p className="text-[11px] text-slate-400 leading-snug">{c.desc}</p><span className="text-[10px] text-amber-300/80">{c.energy}</span></div>
                </CardButton>
              ))}
            </div>
          </div>
        )}
        {step === 2 && base && (
          <div>
            <div className="flex items-center justify-between mb-4"><button onClick={back} className="text-xs text-slate-400 hover:text-slate-200">‹ Volver</button><h2 className="text-center text-sm text-slate-400">Reparte <span className="text-sky-300">{remaining}</span> punto(s) restante(s)</h2><span className="w-12" /></div>
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 mb-4">
              <div className="flex items-center gap-3 mb-3"><ChibiSprite player={{ race, class: cls, equipmentUnlocks: { helmet: false, accessory2: false } }} race={race} cls={cls} size={56} surface="characterSelect" /><div><h3 className="font-semibold">{race} {cls}</h3><p className="text-[11px] text-slate-400 leading-snug">{IDENTITY[base.id]}</p></div></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                <StatPreview icon="heart" label="HP" base={base.hp} final={finalStats.hp} />
                <StatPreview icon={offMeta?.icon} label={offMeta?.short} base={base.attack} final={finalStats.attack} />
                <StatPreview icon="shield" label="Def. Física" base={base.physicalDefense} final={finalStats.physicalDefense} />
                <StatPreview icon="shield" label="Def. Mágica" base={base.magicalDefense} final={finalStats.magicalDefense} />
              </div>
              <p className="text-[11px] text-slate-500 mb-2">Solo puedes mejorar los atributos de tu clase. Cada punto en Defensa sube Física y Mágica a la vez.</p>
              <div className="space-y-2.5">
                <AllocRow icon="heart" label="HP" hint="+3 vida por punto" value={alloc.hp} onAdd={() => addPoint("hp")} onSub={() => subPoint("hp")} disabledAdd={remaining <= 0} />
                <AllocRow icon={allocMeta?.offIcon} label={allocMeta?.offLabel} hint="+1 por punto" value={alloc.off} onAdd={() => addPoint("off")} onSub={() => subPoint("off")} disabledAdd={remaining <= 0} />
                <AllocRow icon="shield" label="Defensa" hint="+1 Física y +1 Mágica" value={alloc.def} onAdd={() => addPoint("def")} onSub={() => subPoint("def")} disabledAdd={remaining <= 0} />
              </div>
            </div>
            <button onClick={begin} disabled={remaining > 0} className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed py-3.5 font-medium transition">{remaining > 0 ? `Reparte los ${remaining} punto(s) restante(s)` : "Comenzar la aventura"}</button>
          </div>
        )}
      </div>
    </div>
  );
}