import React from "react";
import { motion } from "framer-motion";
import { GIcon } from "@/lib/atlasIcons";

const CLASS_SPRITE = { Guerrero: "swords", Mago: "wand2", Pícaro: "sword" };

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }

function FObj({ x, y, size, name, color }) {
  return (
    <foreignObject x={x - size / 2} y={y - size / 2} width={size} height={size} style={{ pointerEvents: "none" }}>
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <GIcon name={name} size={size} style={color ? { color } : undefined} />
      </div>
    </foreignObject>
  );
}

export default function RhombusMap({ region, map, current, onNodeClick, disabled, defeatedBosses, player }) {
  const { terrains, theme } = region;
  const neighbors = disabled ? [] : (map.topology[current] || []);
  const node = map.nodes[current];
  const prevNodeId = React.useRef(current);
  const prevNeighbors = (map.topology[prevNodeId.current] || []);
  const shouldAnimate = current !== prevNodeId.current && prevNeighbors.includes(current);
  React.useEffect(() => { prevNodeId.current = current; }, [current]);
  const sprite = player ? (CLASS_SPRITE[player.class] || player.classIcon) : "user";

  return (
    <div className="rounded-2xl bg-slate-950/40 border p-2 w-full backdrop-blur-sm" style={{ borderColor: theme.accent + "33" }}>
      <svg viewBox={map.viewBox} className="w-full h-auto select-none">
        <defs>
          <linearGradient id="mapBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.mapBg1} stopOpacity="0.55" />
            <stop offset="100%" stopColor={theme.mapBg2} stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="nodeGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x={map.viewBox.split(" ")[0]} y={map.viewBox.split(" ")[1]} width={map.viewBox.split(" ")[2]} height={map.viewBox.split(" ")[3]} fill="url(#mapBg)" rx="6" />
        {map.edges.map(([a, b], i) => {
          const A = map.nodes[a], B = map.nodes[b];
          const active = a === current || b === current;
          const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
          const dx = B.x - A.x, dy = B.y - A.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len, ny = dx / len;
          const c = (hashStr(a + b) % 7 - 3) * 1.1;
          const cx = mx + nx * c, cy = my + ny * c;
          const dPath = `M ${A.x} ${A.y} Q ${cx} ${cy} ${B.x} ${B.y}`;
          return (
            <g key={i}>
              <path d={dPath} fill="none" stroke="#1c1410" strokeWidth={3.2} opacity={0.5} strokeLinecap="round" />
              <path d={dPath} fill="none" stroke={active ? theme.accent : "#7a5a3a"} strokeWidth={1.6} strokeLinecap="round" opacity={active ? 1 : 0.65} strokeDasharray="1.4 2.2" />
            </g>
          );
        })}
        {Object.values(map.nodes).map(n => {
          const isCurrent = n.id === current;
          const isReachable = neighbors.includes(n.id);
          const hasBoss = n.boss && !defeatedBosses?.has(n.boss.id);
          const isGateway = !!n.gatewayTo;
          const t = terrains[n.terrain] || {};
          const bg = t.color || "#555";
          if (isCurrent) return null;
          return (
            <g key={n.id} onClick={() => isReachable && onNodeClick(n.id)} className={isReachable ? "cursor-pointer" : ""}>
              {isReachable && (<circle cx={n.x} cy={n.y} r={10} fill="none" stroke="#44ff88" strokeWidth={1} className="animate-pulse" />)}
              {isGateway && (<circle cx={n.x} cy={n.y} r={10.5} fill="none" stroke="#c4b5fd" strokeWidth={1.1} className="animate-pulse" />)}
              {n.objective && !hasBoss && (<circle cx={n.x} cy={n.y} r={10.5} fill="none" stroke="#5eead4" strokeWidth={1.1} className="animate-pulse" />)}
              <circle cx={n.x} cy={n.y} r={7} fill={bg} opacity={0.92} stroke="#1a0f08" strokeWidth={0.9} />
              <circle cx={n.x} cy={n.y} r={7} fill="url(#nodeGlow)" />
              <FObj x={n.x} y={n.y} size={11} name={hasBoss ? n.boss.icon : (n.objective ? "gem" : (isGateway ? "globe" : t.icon))} />
            </g>
          );
        })}
        <motion.g initial={false} animate={{ x: node.x, y: node.y }} transition={{ duration: shouldAnimate ? 0.45 : 0, ease: "easeInOut" }}>
          <ellipse cx={0} cy={5} rx={6.5} ry={1.8} fill="#000" opacity={0.4} />
          <circle cx={0} cy={0} r={8.5} fill={theme.accent} opacity={0.18} />
          <FObj x={0} y={0} size={14} name={sprite} color={theme.accent} />
        </motion.g>
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 text-[10px] text-slate-400 items-center">
        <span className="flex items-center gap-1"><GIcon name="gem" size={12} /> Objetivo</span>
        <span className="flex items-center gap-1"><GIcon name="globe" size={12} /> Portal de bloque</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Jefe</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Alcanzable</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} /> Tú</span>
      </div>
    </div>
  );
}