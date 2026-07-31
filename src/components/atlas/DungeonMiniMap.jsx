import React, { useMemo } from "react";

function tileColor({ ch, x, y, pos, enemies, allies, revealed, exit, exitKnown, tactical }) {
  if (!revealed?.has(`${x},${y}`)) return "#080808";
  const enemy = enemies.find((entry) => entry.hp > 0 && entry.x === x && entry.y === y);
  const ally = allies.find((entry) => entry.hp > 0 && entry.x === x && entry.y === y);

  if (x === pos.x && y === pos.y) return "#5eead4";
  if (ally) return "#2dd4bf";
  if (enemy) return enemy.alerted && tactical ? "#fb7185" : "#f97316";
  if (exitKnown && exit && exit.x === x && exit.y === y) return "#60a5fa";
  if (ch === "S") return "#22c55e";
  if (ch === "P") return "#22d3ee";
  if (ch === "C" || ch === "O") return "#fbbf24";
  if (ch === "L") return "#7a4a1a";
  if (ch === "D") return "#9a6a2a";
  if (ch === "#" || ch === " ") return "#5b3820";
  return "#d8ca82";
}

export default function DungeonMiniMap({ liveTiles = [], pos, enemies = [], allies = [], revealed, exit, exitKnown = false, tactical = false }) {
  const dimensions = useMemo(() => {
    const rows = liveTiles.length || 1;
    const cols = Math.max(1, ...liveTiles.map((row) => row.length));
    const cell = Math.max(2, Math.min(4, Math.floor(Math.min(144 / cols, 102 / rows))));
    return { rows, cols, cell };
  }, [liveTiles]);

  return (
    <div
      className="atlas-dungeon-minimap pointer-events-none rounded-lg border border-slate-500/80 bg-slate-950/92 p-1.5 shadow-xl"
      aria-label="Minimapa de la mazmorra"
      style={{ width: dimensions.cols * dimensions.cell + 12, maxWidth: 156 }}
    >
      <div className="mb-1 flex items-center justify-between px-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-300" style={{ lineHeight: 1 }}>
        <span>Mapa</span>
        <span className={tactical ? "text-rose-300" : "text-emerald-300"}>{tactical ? "Alerta" : "Exploración"}</span>
      </div>
      <div style={{ lineHeight: 0 }}>
        {liveTiles.map((row, y) => (
          <div key={y} className="flex" style={{ height: dimensions.cell }}>
            {Array.from(row).map((ch, x) => (
              <div
                key={x}
                style={{
                  width: dimensions.cell,
                  height: dimensions.cell,
                  background: tileColor({ ch, x, y, pos, enemies, allies, revealed, exit, exitKnown, tactical }),
                  boxShadow: x === pos.x && y === pos.y ? "0 0 3px #5eead4" : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
