import React from "react";
import { Compass, X, Lock, Skull, Footprints, ChevronRight } from "lucide-react";
import { REGIONS } from "@/lib/atlasData";
import RegionTopView from "./RegionTopView";
import { getRegionLayout, sectorKey } from "@/lib/atlasRegionSectors";

export default function ExplorationMap({ discovered, currentRegion, currentBlock, defeatedBosses, game, exploreBlocks, playerPos, playerDir, lastShrine, onClose }) {
  const [openRi, setOpenRi] = React.useState(null);
  const unlockedSectors = game.unlockedSectors || new Set();
  const visitedSectors = game.visitedSectors || new Set();

  return (
    <div className="atlas-landscape-dialog fixed inset-0 z-50 flex items-center justify-center bg-slate-950/88 backdrop-blur px-3 py-4" onClick={onClose}>
      <div className="rounded-2xl bg-slate-900 border border-slate-700 max-w-2xl w-full p-4 sm:p-5 max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-base font-heading text-slate-100"><Compass className="w-5 h-5 text-amber-300" /> Mapa de Exploración</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-[11px] text-slate-400 mb-4 leading-snug">Cada reino usa ahora su dibujo canónico de nueve sectores. Toca una región para verla completa, con rutas bloqueadas, sectores abiertos y tu posición.</p>

        <div className="space-y-3">
          {REGIONS.map((region, ri) => {
            const layout = getRegionLayout(region.id);
            const sectors = Object.values(layout.sectors);
            const unlockedCount = sectors.filter(s => unlockedSectors.has(sectorKey(region.id, s.id))).length;
            const visitedCount = sectors.filter(s => visitedSectors.has(`${ri}:${s.col}:${s.row}`)).length;
            const regionKnown = unlockedCount > 0 || visitedCount > 0 || ri === currentRegion;
            const regionBossDown = defeatedBosses?.has(region.boss.id);
            const here = ri === currentRegion;

            return (
              <div key={region.id}>
                <button
                  type="button"
                  onClick={() => setOpenRi(ri)}
                  className={`relative overflow-hidden w-full text-left rounded-2xl border transition active:scale-[0.995] ${here ? "border-amber-400/70 ring-1 ring-amber-400/35" : "border-slate-700 hover:border-slate-500"}`}
                >
                  <img src={layout.referenceMap} alt="" className="absolute inset-0 w-full h-full object-cover opacity-55" draggable={false} />
                  <span className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/72 to-slate-950/45" />
                  <div className="relative p-3 sm:p-4 grid sm:grid-cols-[1fr_180px] gap-3 items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: regionKnown ? region.theme.accent : "#64748b" }}>{regionKnown ? layout.regionName : "Región desconocida"}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        {here && <Footprints className="w-4 h-4 text-amber-300" />}
                        {regionBossDown && <Skull className="w-4 h-4 text-rose-400" />}
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1">{region.subtitle}</p>
                      <p className="text-[10px] text-slate-400 mt-2">{visitedCount}/9 explorados · {unlockedCount}/9 desbloqueados</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-950/55 border border-white/10 p-1.5" style={{ aspectRatio: "1536 / 1157" }}>
                      {sectors.map(sector => {
                        const unlocked = unlockedSectors.has(sectorKey(region.id, sector.id));
                        const visited = visitedSectors.has(`${ri}:${sector.col}:${sector.row}`);
                        const current = ri === currentRegion && sector.col === currentBlock && sector.row === (game.sectorRow ?? 1);
                        return (
                          <span key={sector.id} className={`relative rounded-sm border flex items-center justify-center text-[8px] font-semibold ${current ? "border-amber-300 bg-amber-300/25 text-amber-100" : visited ? "border-slate-400 bg-slate-700/55 text-white" : unlocked ? "border-slate-600 bg-slate-900/45 text-slate-300" : "border-slate-800 bg-slate-950/80 text-slate-600"}`}>
                            {sector.id}
                            {!unlocked && <Lock className="absolute w-2.5 h-2.5 opacity-70" />}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </button>

                {ri < REGIONS.length - 1 && (
                  <div className="flex items-center justify-center py-1 gap-1 text-[10px] text-slate-500">
                    {regionBossDown ? <><span className="text-emerald-400">▼</span> paso desbloqueado</> : <><Lock className="w-3 h-3" /> el jefe bloquea el siguiente reino</>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {openRi != null && (
        <RegionTopView
          region={REGIONS[openRi]}
          regionIndex={openRi}
          exploreBlocks={exploreBlocks}
          discovered={discovered}
          currentRegion={currentRegion}
          currentBlock={currentBlock}
          defeatedBosses={defeatedBosses}
          game={game}
          playerPos={playerPos}
          playerDir={playerDir}
          lastShrine={lastShrine}
          onClose={() => setOpenRi(null)}
        />
      )}
    </div>
  );
}
