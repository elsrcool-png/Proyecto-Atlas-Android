import React, { useMemo, useRef, useEffect } from "react";

const CELL = 16;
const BORDER = 2;

function shade(hex, amt) { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; const a = c => Math.max(0, Math.min(255, Math.round(c + amt * 255))); return `rgb(${a(r)},${a(g)},${a(b)})`; }
function hash(c, r) { let h = (c * 73856093) ^ (r * 19349663); h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }
function parseRgb(c) { if (c.startsWith("#")) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; } const m = c.match(/\d+/g) || []; return [+m[0] || 0, +m[1] || 0, +m[2] || 0]; }
function blend(a, b, t) { const pa = parseRgb(a), pb = parseRgb(b); return `rgb(${Math.round(pa[0] + (pb[0] - pa[0]) * t)},${Math.round(pa[1] + (pb[1] - pa[1]) * t)},${Math.round(pa[2] + (pb[2] - pa[2]) * t)})`; }

export default function TileGround({ world, ground }) {
  const canvasRef = useRef(null);
  const cols = Math.round(world.W / CELL);
  const rows = Math.round(world.H / CELL);

  const pathPts = useMemo(() => {
    const pts = [];
    if (world.spawn) pts.push(world.spawn);
    for (const n of world.npcs || []) pts.push({ x: n.x, y: n.y });
    if (world.objective) pts.push(world.objective);
    if (world.boss) pts.push({ x: world.boss.x, y: world.boss.y });
    return pts;
  }, [world]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    cv.width = world.W; cv.height = world.H;
    const ctx = cv.getContext("2d");
    const isBorder = (c, r) => c < BORDER || c >= cols - BORDER || r < BORDER || r >= rows - BORDER;
    const bg = ctx.createLinearGradient(0, 0, 0, world.H);
    bg.addColorStop(0, shade(ground.base, 0.06)); bg.addColorStop(0.5, ground.base); bg.addColorStop(1, shade(ground.base, -0.08));
    ctx.fillStyle = bg; ctx.fillRect(0, 0, world.W, world.H);
    const ag = ctx.createRadialGradient(world.W * 0.24, world.H * 0.18, 40, world.W * 0.72, world.H * 0.78, Math.max(world.W, world.H) * 0.85);
    ag.addColorStop(0, "rgba(255,250,220,0.16)"); ag.addColorStop(0.45, "rgba(0,0,0,0.04)"); ag.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.fillStyle = ag; ctx.fillRect(0, 0, world.W, world.H);
    for (let i = 0; i < 700; i++) { const x = hash(i, 3) * world.W, y = hash(i * 2, 7) * world.H; if (isBorder(Math.floor(x / CELL), Math.floor(y / CELL))) continue; const r = 10 + hash(i, 5) * 22, dark = hash(i, 11) > 0.5; ctx.fillStyle = dark ? `rgba(0,0,0,${0.04 + hash(i, 13) * 0.04})` : `rgba(255,255,255,${0.03 + hash(i, 17) * 0.04})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (!isBorder(c, r)) continue; const x = c * CELL, y = r * CELL; const d = Math.min(c, r, cols - 1 - c, rows - 1 - r); const t = d === 0 ? 0 : d === 1 ? 0.5 : 1; const col = blend(ground.rockDark, ground.rockHi, t); ctx.fillStyle = blend(col, ground.rockBase, 0.3); ctx.fillRect(x, y, CELL, CELL); }
    for (const w of world.water || []) { const edge = w.sz / 2; ctx.fillStyle = blend(ground.path, ground.water, 0.3); ctx.beginPath(); ctx.arc(w.x, w.y, edge + 6, 0, Math.PI * 2); ctx.fill(); const wg = ctx.createRadialGradient(w.x - edge * 0.3, w.y - edge * 0.3, 4, w.x, w.y, edge); wg.addColorStop(0, shade(ground.water, 0.12)); wg.addColorStop(1, shade(ground.water, -0.10)); ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(w.x, w.y, edge, 0, Math.PI * 2); ctx.fill(); }
    for (const d of world.decor || []) { const sx = d.x + d.sz * 0.12, sy = d.y + d.sz * 0.05; const g = ctx.createRadialGradient(sx, sy, 2, sx, sy, d.sz * 0.55); g.addColorStop(0, "rgba(0,0,0,0.4)"); g.addColorStop(0.6, "rgba(0,0,0,0.14)"); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(sx, sy, d.sz * 0.55, d.sz * 0.22, 0, 0, Math.PI * 2); ctx.fill(); }
    const vg = ctx.createRadialGradient(world.W / 2, world.H / 2, world.H * 0.3, world.W / 2, world.H / 2, world.H * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, world.W, world.H);
  }, [world, ground, cols, rows, pathPts]);

  return React.createElement("canvas", { ref: canvasRef, className: "absolute top-0 left-0", style: { width: world.W, height: world.H } });
}