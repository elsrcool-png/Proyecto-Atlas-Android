import React, { useState } from "react";
import { X, Tent, Home, Castle, Trees, Footprints, Skull, Compass, LockKeyhole, MapPinned, Image } from "lucide-react";
import { getRegionLayout, getSectorDef, sectorIdFromCoords, sectorKey, SECTOR_TYPE_LABELS } from "@/lib/atlasRegionSectors";

const TYPE_ICON = {
  camp: Tent,
  town: Home,
  city: Castle,
  boss: Skull,
};

export default function SectorMapModal({ region, regionIndex, col, row, visitedSectors, unlockedSectors, bossDefeated, onClose }) {
  const visited = visitedSectors || new Set();
  const unlocked = unlockedSectors || new Set();
  const layout = getRegionLayout(region.id);
  const [showReference, setShowReference] = useState(false);
  const rows = [0, 1, 2];
  const cols = [0, 1, 2];

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur px-4 py-6" onClick={onClose}>
      <div className="rounded-2xl bg-slate-900 border border-slate-700 max-w-md w-full p-5 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="flex items-center gap-2 text-base font-heading text-slate-100"><Compass className="w-5 h-5 text-amber-300" /> Sectores de {layout.regionName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-[11px] text-slate-400 mb-3 leading-snug">Mapa canónico 3×3. Los sectores se abren mediante la campaña y conservan su estado en el guardado.</p>

        <div className="grid grid-cols-3 gap-1.5">
          {rows.flatMap(r => cols.map(c => {
            const id = sectorIdFromCoords(c, r);
            const def = getSectorDef(region.id, id);
            const visitKey = `${regionIndex}:${c}:${r}`;
            const vis = visited.has(visitKey);
            const open = unlocked.has(sectorKey(region.id, id));
            const here = c === col && r === row;
            const Icon = TYPE_ICON[def?.type] || Trees;
            const bossDown = def?.boss && bossDefeated;
            return (
              <div key={id} className={`relative rounded-lg border p-2 min-h-[88px] text-center ${here ? "border-amber-400 bg-amber-400/10" : open ? "border-slate-600 bg-slate-800/55" : "border-slate-800 bg-slate-950/65"}`}>
                <div className="absolute top-1 left-1 text-[9px] font-mono text-slate-500">{id}</div>
                {open ? (
                  <>
                    <Icon className="w-4 h-4 mx-auto mt-2 mb-1" style={{ color: region.theme.accent }} />
                    <div className="text-[9px] text-slate-100 leading-tight">{def?.name}</div>
                    <div className="text-[8px] text-slate-500 leading-tight mt-1">{SECTOR_TYPE_LABELS[def?.type] || def?.type}</div>
                    {!vis && <MapPinned className="absolute bottom-1 right-1 w-3 h-3 text-sky-400" />}
                    {bossDown && <Skull className="absolute top-1 right-1 w-3.5 h-3.5 text-rose-400" />}
                    {here && <Footprints className="absolute bottom-1 left-1 w-3.5 h-3.5 text-amber-300" />}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 pt-3">
                    <LockKeyhole className="w-4 h-4 mb-1" />
                    <span className="text-[9px]">Bloqueado</span>
                  </div>
                )}
              </div>
            );
          }))}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Footprints className="w-3 h-3 text-amber-300" /> Actual</span>
          <span className="flex items-center gap-1"><MapPinned className="w-3 h-3 text-sky-400" /> Abierto sin visitar</span>
          <span className="flex items-center gap-1"><LockKeyhole className="w-3 h-3" /> Bloqueado</span>
        </div>

        <button onClick={() => setShowReference(v => !v)} className="mt-4 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-sm text-slate-300 transition flex items-center justify-center gap-2">
          <Image className="w-4 h-4" /> {showReference ? "Ocultar boceto canónico" : "Ver boceto canónico"}
        </button>
        {showReference && (
          <div className="mt-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
            <img src={layout.referenceMap} alt={`Boceto canónico de ${layout.regionName}`} className="w-full h-auto block" />
          </div>
        )}
        <button onClick={onClose} className="mt-3 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-sm text-slate-300 transition">Cerrar</button>
      </div>
    </div>
  );
}
