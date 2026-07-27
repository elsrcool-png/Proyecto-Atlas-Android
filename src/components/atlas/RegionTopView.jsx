import React from "react";
import { motion } from "framer-motion";
import { X, Lock, Skull, Footprints, MapPin, Eye, EyeOff } from "lucide-react";
import {
  getRegionLayout,
  sectorKey,
  SECTOR_TYPE_LABELS,
} from "@/lib/atlasRegionSectors";

function statusForSector({ regionId, regionIndex, sector, unlockedSectors, visitedSectors, currentRegion, currentBlock, currentRow }) {
  const unlocked = unlockedSectors?.has(sectorKey(regionId, sector.id)) || false;
  const visited = visitedSectors?.has(`${regionIndex}:${sector.col}:${sector.row}`) || false;
  const current = regionIndex === currentRegion && sector.col === currentBlock && sector.row === currentRow;
  return { unlocked, visited, current };
}

export default function RegionTopView({
  region,
  regionIndex,
  currentRegion,
  currentBlock,
  defeatedBosses,
  game,
  onClose,
}) {
  const layout = getRegionLayout(region.id);
  const [selectedId, setSelectedId] = React.useState(() => {
    if (regionIndex === currentRegion) {
      return `${String.fromCharCode(65 + currentBlock)}${(game.sectorRow ?? 1) + 1}`;
    }
    return layout.startSector;
  });
  const [showLabels, setShowLabels] = React.useState(true);
  const selected = layout.sectors[selectedId] || layout.sectors[layout.startSector];
  const currentRow = game.sectorRow ?? 1;
  const unlockedSectors = game.unlockedSectors || new Set();
  const visitedSectors = game.visitedSectors || new Set();
  const bossDown = defeatedBosses?.has(region.boss.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur flex flex-col"
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Mapa canónico 3×3</p>
          <h2 className="text-base font-heading truncate" style={{ color: region.theme.accent }}>{layout.regionName}</h2>
          <p className="text-[11px] text-slate-400 truncate">{region.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowLabels(v => !v)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-slate-300 hover:text-white"
            title={showLabels ? "Ocultar nombres" : "Mostrar nombres"}
          >
            {showLabels ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-slate-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-[minmax(0,1fr)_280px] gap-4 items-start">
          <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900" style={{ aspectRatio: "1536 / 1157" }}>
            <img
              src={layout.referenceMap}
              alt={`Mapa ilustrado de ${layout.regionName}`}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />

            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Object.values(layout.sectors).map(sector => {
                const st = statusForSector({
                  regionId: region.id,
                  regionIndex,
                  sector,
                  unlockedSectors,
                  visitedSectors,
                  currentRegion,
                  currentBlock,
                  currentRow,
                });
                const selectedNow = selectedId === sector.id;
                return (
                  <button
                    type="button"
                    key={sector.id}
                    onClick={() => setSelectedId(sector.id)}
                    className={`relative min-w-0 border border-white/15 transition focus:outline-none focus:ring-2 focus:ring-amber-300/80 focus:ring-inset ${selectedNow ? "ring-2 ring-amber-300 ring-inset" : ""}`}
                    aria-label={`${sector.id}, ${sector.name}, ${st.unlocked ? "desbloqueado" : "bloqueado"}`}
                  >
                    {!st.unlocked && <span className="absolute inset-0 bg-slate-950/72 backdrop-blur-[1px]" />}
                    {st.unlocked && !st.visited && !st.current && <span className="absolute inset-0 bg-slate-900/35" />}
                    {st.current && <span className="absolute inset-0 bg-amber-300/10" />}

                    <span className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-slate-950/78 border border-white/15 px-1.5 py-1 text-[10px] font-semibold text-white">
                      {sector.id}
                      {!st.unlocked && <Lock className="w-3 h-3 text-slate-300" />}
                      {st.current && <Footprints className="w-3 h-3 text-amber-300" />}
                      {sector.boss && bossDown && <Skull className="w-3 h-3 text-rose-300" />}
                    </span>

                    {showLabels && (
                      <span className="absolute left-2 right-2 bottom-2 rounded-lg bg-slate-950/78 border border-white/15 px-2 py-1.5 text-left">
                        <span className="block text-[10px] sm:text-xs text-white font-medium leading-tight line-clamp-2">{sector.name}</span>
                        <span className="hidden sm:block text-[9px] text-slate-300 mt-0.5 truncate">
                          {!st.unlocked ? "Bloqueado por campaña" : st.current ? "Ubicación actual" : st.visited ? "Explorado" : "Disponible, sin explorar"}
                        </span>
                      </span>
                    )}

                    {!st.unlocked && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="rounded-full bg-slate-950/75 border border-slate-600 p-2"><Lock className="w-4 h-4 text-slate-300" /></span>
                      </span>
                    )}
                    {st.current && (
                      <span className="absolute right-2 top-2 rounded-full bg-amber-300 text-slate-950 p-1 shadow-lg">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Sector {selected.id}</p>
                <h3 className="text-sm font-heading text-slate-100 mt-1">{selected.name}</h3>
              </div>
              {selected.boss && <Skull className="w-5 h-5 text-rose-400 shrink-0" />}
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selected.subtitle}</p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-3"><span className="text-slate-500">Tipo</span><span className="text-slate-200 text-right">{SECTOR_TYPE_LABELS[selected.type] || selected.type}</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-500">Estado</span><span className="text-slate-200 text-right">{(() => { const st = statusForSector({ regionId: region.id, regionIndex, sector: selected, unlockedSectors, visitedSectors, currentRegion, currentBlock, currentRow }); return !st.unlocked ? "Bloqueado" : st.current ? "Ubicación actual" : st.visited ? "Explorado" : "Desbloqueado"; })()}</span></div>
              {selected.dungeon && <div className="flex justify-between gap-3"><span className="text-slate-500">Dungeon</span><span className="text-slate-200">{selected.dungeon === "long" ? "Larga" : "Corta"}</span></div>}
            </div>
            {selected.features?.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Elementos</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.features.map(feature => <span key={feature} className="rounded-full bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] text-slate-300">{feature.replaceAll("_", " ")}</span>)}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 border-t border-slate-800 text-[10px] text-slate-400 shrink-0">
        <span className="flex items-center gap-1"><Footprints className="w-3 h-3 text-amber-300" /> Actual</span>
        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Bloqueado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-900/40 border border-slate-500 inline-block" /> Sin explorar</span>
        <span className="ml-auto text-slate-500">El dibujo original es ahora el mapa regional del juego.</span>
      </footer>
    </motion.div>
  );
}
