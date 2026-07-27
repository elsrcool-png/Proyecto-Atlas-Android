// PROYECTO ATLAS — Renderizado de estructuras (edificios, murallas, mobiliario).
function ellipse(ctx, cx, cy, rx, ry) { ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); }
function rrect(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function tri(ctx, x1, y1, x2, y2, x3, y3) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); }
function lgrad(ctx, x0, y0, x1, y1, c0, c1) { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
function rgrad(ctx, cx, cy, r, c0, c1) { r = Math.max(1, r); const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.12, cx, cy, r); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
function fillStroke(ctx, fill, stroke, lw) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function snow(ctx, x, y, rx, ry) { ctx.fillStyle = "rgba(248,252,255,0.85)"; ellipse(ctx, x, y, rx, ry); ctx.fill(); }

function pal(biome) {
  if (biome === "fria") return { wall: "#c8d2dc", wallDk: "#8a98a8", roof: "#6a7a8a", roofDk: "#3a4a5a", stone: "#b8c4d0" };
  if (biome === "desierto") return { wall: "#dcb878", wallDk: "#a88a4a", roof: "#9a6a3a", roofDk: "#5a3a1a", stone: "#c4a878" };
  return { wall: "#cdb88a", wallDk: "#8a7450", roof: "#8a4a2a", roofDk: "#4a2a1a", stone: "#9aa08a" };
}

export const STRUCTURE_ICONS = new Set([
  "tent", "house", "house2", "citywall", "gate", "well", "fence", "lamppost",
  "statue", "banner", "market", "anvil", "crate", "barrel", "sack", "bedroll",
  "torch", "castle", "temple", "fortress", "bridge", "shrine", "tower", "ship",
]);

export function drawStructure(ctx, icon, S, biome) {
  const cx = S / 2;
  const ice = biome === "fria";
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  const p = pal(biome);

  switch (icon) {
    case "tent": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.92, S * 0.42, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, cx - S * 0.4, 0, cx + S * 0.4, 0, p.roof, p.roofDk);
      tri(ctx, cx - S * 0.4, S * 0.9, cx + S * 0.4, S * 0.9, cx, S * 0.18); fillStroke(ctx, ctx.fillStyle, "#2a1a12", 2);
      ctx.fillStyle = "#1a1a1a"; tri(ctx, cx - S * 0.12, S * 0.9, cx + S * 0.12, S * 0.9, cx, S * 0.5); ctx.fill();
      ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - S * 0.4, S * 0.9); ctx.lineTo(cx - S * 0.5, S * 0.95); ctx.moveTo(cx + S * 0.4, S * 0.9); ctx.lineTo(cx + S * 0.5, S * 0.95); ctx.stroke();
      break;
    }
    case "house": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.96, S * 0.5, S * 0.09); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.4, 0, S * 0.95, p.wall, p.wallDk);
      rrect(ctx, S * 0.16, S * 0.42, S * 0.68, S * 0.52, 4); fillStroke(ctx, ctx.fillStyle, "#2a1a12", 2);
      ctx.fillStyle = lgrad(ctx, 0, S * 0.1, 0, S * 0.5, p.roof, p.roofDk);
      tri(ctx, S * 0.08, S * 0.46, S * 0.92, S * 0.46, cx, S * 0.12); fillStroke(ctx, ctx.fillStyle, "#1a0a04", 2);
      ctx.fillStyle = "#3a2a1a"; rrect(ctx, cx - S * 0.08, S * 0.66, S * 0.16, S * 0.28, 2); ctx.fill();
      ctx.fillStyle = "#f0c060"; ctx.fillRect(cx + S * 0.02, S * 0.78, S * 0.02, S * 0.03);
      ctx.fillStyle = "#9adcff"; rrect(ctx, S * 0.26, S * 0.52, S * 0.14, S * 0.12, 2); fillStroke(ctx, ctx.fillStyle, "#2a2a3a", 1.5);
      rrect(ctx, S * 0.6, S * 0.52, S * 0.14, S * 0.12, 2); fillStroke(ctx, ctx.fillStyle, "#2a2a3a", 1.5);
      ctx.fillStyle = p.stone; rrect(ctx, S * 0.62, S * 0.16, S * 0.1, S * 0.22, 2); fillStroke(ctx, ctx.fillStyle, "#2a2a22", 1.5);
      if (ice) snow(ctx, cx, S * 0.2, S * 0.4, S * 0.06);
      break;
    }
    case "house2": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.96, S * 0.52, S * 0.09); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.3, 0, S * 0.95, p.wall, p.wallDk);
      rrect(ctx, S * 0.12, S * 0.32, S * 0.76, S * 0.62, 4); fillStroke(ctx, ctx.fillStyle, "#2a2422", 2);
      ctx.fillStyle = p.roof; rrect(ctx, S * 0.08, S * 0.28, S * 0.84, S * 0.1, 3); fillStroke(ctx, ctx.fillStyle, p.roofDk, 1.5);
      ctx.fillStyle = "#8acaff"; rrect(ctx, S * 0.2, S * 0.5, S * 0.12, S * 0.14, 2); fillStroke(ctx, ctx.fillStyle, "#1a2a3a", 1.5);
      rrect(ctx, S * 0.56, S * 0.5, S * 0.12, S * 0.14, 2); fillStroke(ctx, ctx.fillStyle, "#1a2a3a", 1.5);
      ctx.fillStyle = "#3a2a1a"; rrect(ctx, cx - S * 0.1, S * 0.62, S * 0.2, S * 0.32, 2); fillStroke(ctx, ctx.fillStyle, "#1a0a04", 1.5);
      ctx.fillStyle = "#f0c060"; ctx.fillRect(cx + S * 0.04, S * 0.78, S * 0.02, S * 0.03);
      ctx.fillStyle = p.stone; rrect(ctx, S * 0.7, S * 0.12, S * 0.1, S * 0.22, 2); fillStroke(ctx, ctx.fillStyle, "#2a2a22", 1.5);
      if (ice) snow(ctx, cx, S * 0.3, S * 0.42, S * 0.04);
      break;
    }
    case "citywall": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.97, S * 0.5, S * 0.07); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.3, 0, S * 0.95, p.stone, p.wallDk);
      rrect(ctx, S * 0.1, S * 0.35, S * 0.8, S * 0.6, 3); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 2);
      ctx.fillStyle = p.stone;
      for (let i = 0; i < 4; i++) { rrect(ctx, S * 0.12 + i * S * 0.2, S * 0.24, S * 0.12, S * 0.14, 2); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 1.5); }
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(S * 0.1, S * 0.7, S * 0.8, S * 0.04);
      if (ice) snow(ctx, cx, S * 0.3, S * 0.42, S * 0.04);
      break;
    }
    case "gate": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.97, S * 0.5, S * 0.07); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.2, 0, S * 0.95, p.stone, p.wallDk);
      rrect(ctx, S * 0.08, S * 0.25, S * 0.18, S * 0.7, 3); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 2);
      rrect(ctx, S * 0.74, S * 0.25, S * 0.18, S * 0.7, 3); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 2);
      ctx.fillStyle = "#3a2a1a"; ctx.beginPath(); ctx.moveTo(S * 0.26, S * 0.95); ctx.lineTo(S * 0.26, S * 0.5); ctx.arc(cx, S * 0.5, S * 0.24, Math.PI, 0); ctx.lineTo(S * 0.74, S * 0.95); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#5a3a2a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(S * 0.26, S * 0.95); ctx.lineTo(S * 0.26, S * 0.5); ctx.arc(cx, S * 0.5, S * 0.24, Math.PI, 0); ctx.lineTo(S * 0.74, S * 0.95); ctx.stroke();
      ctx.fillStyle = "#9a2a2a"; tri(ctx, S * 0.46, S * 0.18, S * 0.6, S * 0.22, S * 0.46, S * 0.26); ctx.fill();
      break;
    }
    case "well": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.95, S * 0.4, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.5, 0, S * 0.95, p.stone, p.wallDk);
      ellipse(ctx, cx, S * 0.8, S * 0.3, S * 0.22); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 2);
      ctx.fillStyle = "#1a2a3a"; ellipse(ctx, cx, S * 0.78, S * 0.2, S * 0.12); ctx.fill();
      ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = S * 0.04; ctx.beginPath(); ctx.moveTo(S * 0.3, S * 0.95); ctx.lineTo(S * 0.3, S * 0.3); ctx.moveTo(S * 0.7, S * 0.95); ctx.lineTo(S * 0.7, S * 0.3); ctx.stroke();
      ctx.fillStyle = p.roof; tri(ctx, S * 0.2, S * 0.34, S * 0.8, S * 0.34, cx, S * 0.12); fillStroke(ctx, ctx.fillStyle, "#1a0a04", 1.5);
      break;
    }
    case "fence": {
      ctx.fillStyle = "rgba(0,0,0,0.2)"; ellipse(ctx, cx, S * 0.95, S * 0.4, S * 0.06); ctx.fill();
      ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = S * 0.05;
      ctx.beginPath(); ctx.moveTo(S * 0.1, S * 0.6); ctx.lineTo(S * 0.9, S * 0.6); ctx.moveTo(S * 0.1, S * 0.8); ctx.lineTo(S * 0.9, S * 0.8); ctx.stroke();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.4, 0, S * 0.95, "#8a6a3a", "#5a3a1a");
      for (let i = 0; i < 4; i++) { rrect(ctx, S * 0.12 + i * S * 0.24, S * 0.4, S * 0.08, S * 0.55, 2); fillStroke(ctx, ctx.fillStyle, "#3a2a1a", 1.2); }
      break;
    }
    case "lamppost": {
      ctx.fillStyle = "rgba(0,0,0,0.2)"; ellipse(ctx, cx, S * 0.96, S * 0.18, S * 0.06); ctx.fill();
      ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = S * 0.05; ctx.beginPath(); ctx.moveTo(cx, S * 0.96); ctx.lineTo(cx, S * 0.3); ctx.stroke();
      ctx.fillStyle = "#3a3a3a"; rrect(ctx, cx - S * 0.1, S * 0.22, S * 0.2, S * 0.16, 3); fillStroke(ctx, ctx.fillStyle, "#1a1a1a", 1.5);
      ctx.fillStyle = rgrad(ctx, cx, S * 0.3, S * 0.16, "#fff6c0", "#ffba4a"); ellipse(ctx, cx, S * 0.3, S * 0.1, S * 0.08); ctx.fill();
      ctx.fillStyle = "rgba(255,220,120,0.25)"; ellipse(ctx, cx, S * 0.4, S * 0.3, S * 0.2); ctx.fill();
      break;
    }
    case "statue": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.97, S * 0.4, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.6, 0, S * 0.95, p.stone, p.wallDk);
      rrect(ctx, S * 0.28, S * 0.6, S * 0.44, S * 0.35, 3); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 1.5);
      ctx.fillStyle = lgrad(ctx, 0, S * 0.2, 0, S * 0.65, "#d8d8d0", "#8a8a82");
      ellipse(ctx, cx, S * 0.4, S * 0.14, S * 0.22); ctx.fill();
      rrect(ctx, cx - S * 0.1, S * 0.5, S * 0.2, S * 0.18, 3); fillStroke(ctx, ctx.fillStyle, "#3a3a32", 1.2);
      ellipse(ctx, cx, S * 0.3, S * 0.1, S * 0.1); ctx.fill();
      break;
    }
    case "banner": {
      ctx.fillStyle = "rgba(0,0,0,0.2)"; ellipse(ctx, cx, S * 0.96, S * 0.12, S * 0.05); ctx.fill();
      ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = S * 0.04; ctx.beginPath(); ctx.moveTo(cx, S * 0.96); ctx.lineTo(cx, S * 0.1); ctx.stroke();
      ctx.fillStyle = "#9a2a2a"; rrect(ctx, cx - S * 0.18, S * 0.14, S * 0.36, S * 0.4, 2); fillStroke(ctx, ctx.fillStyle, "#5a1a1a", 1.5);
      ctx.fillStyle = "#f0c060"; ellipse(ctx, cx, S * 0.34, S * 0.08, S * 0.08); ctx.fill();
      break;
    }
    case "market": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.95, S * 0.46, S * 0.08); ctx.fill();
      const cols = ["#c0392b", "#e8e8e8"];
      for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i % 2]; ctx.fillRect(S * 0.1 + i * S * 0.13, S * 0.2, S * 0.13, S * 0.28); }
      ctx.fillStyle = "#5a3a1a"; rrect(ctx, S * 0.12, S * 0.4, S * 0.06, S * 0.5, 2); ctx.fill(); rrect(ctx, S * 0.82, S * 0.4, S * 0.06, S * 0.5, 2); ctx.fill();
      ctx.fillStyle = "#8a6a3a"; rrect(ctx, S * 0.18, S * 0.62, S * 0.64, S * 0.2, 2); fillStroke(ctx, ctx.fillStyle, "#3a2a1a", 1.2);
      ctx.fillStyle = "#e74c3c"; ellipse(ctx, S * 0.3, S * 0.6, S * 0.05, S * 0.05); ctx.fill();
      ctx.fillStyle = "#f1c40f"; ellipse(ctx, S * 0.5, S * 0.6, S * 0.05, S * 0.05); ctx.fill();
      ctx.fillStyle = "#27ae60"; ellipse(ctx, S * 0.7, S * 0.6, S * 0.05, S * 0.05); ctx.fill();
      break;
    }
    case "anvil": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.95, S * 0.3, S * 0.07); ctx.fill();
      ctx.fillStyle = "#2a2a2a"; rrect(ctx, S * 0.2, S * 0.7, S * 0.6, S * 0.1, 2); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.4, 0, S * 0.8, "#5a5a5a", "#2a2a2a"); rrect(ctx, S * 0.34, S * 0.4, S * 0.32, S * 0.32, 3); fillStroke(ctx, ctx.fillStyle, "#1a1a1a", 1.5);
      ctx.fillStyle = "#3a3a3a"; rrect(ctx, S * 0.3, S * 0.74, S * 0.4, S * 0.12, 2); ctx.fill();
      ctx.fillStyle = "#ff8a3a"; ellipse(ctx, S * 0.5, S * 0.55, S * 0.08, S * 0.06); ctx.fill();
      ctx.fillStyle = "rgba(255,160,60,0.3)"; ellipse(ctx, S * 0.5, S * 0.55, S * 0.16, S * 0.12); ctx.fill();
      break;
    }
    case "crate": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.95, S * 0.34, S * 0.07); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.2, 0, S * 0.9, "#b08a5a", "#6a4a2a"); rrect(ctx, S * 0.2, S * 0.2, S * 0.6, S * 0.72, 3); fillStroke(ctx, ctx.fillStyle, "#3a2a1a", 2);
      ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = 2; ctx.strokeRect(S * 0.24, S * 0.24, S * 0.52, S * 0.64);
      ctx.beginPath(); ctx.moveTo(S * 0.24, S * 0.24); ctx.lineTo(S * 0.76, S * 0.88); ctx.moveTo(S * 0.76, S * 0.24); ctx.lineTo(S * 0.24, S * 0.88); ctx.stroke();
      break;
    }
    case "barrel": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.95, S * 0.3, S * 0.07); ctx.fill();
      ctx.fillStyle = lgrad(ctx, S * 0.2, 0, S * 0.8, 0, "#9a7a4a", "#5a3a1a"); rrect(ctx, S * 0.25, S * 0.2, S * 0.5, S * 0.72, 8); fillStroke(ctx, ctx.fillStyle, "#3a2a1a", 2);
      ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(S * 0.25, S * 0.35); ctx.lineTo(S * 0.75, S * 0.35); ctx.moveTo(S * 0.25, S * 0.7); ctx.lineTo(S * 0.75, S * 0.7); ctx.stroke();
      ctx.fillStyle = "#6a4a2a"; ellipse(ctx, cx, S * 0.2, S * 0.25, S * 0.07); ctx.fill();
      break;
    }
    case "sack": {
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ellipse(ctx, cx, S * 0.92, S * 0.32, S * 0.07); ctx.fill();
      ctx.fillStyle = lgrad(ctx, cx, S * 0.3, cx, S * 0.9, "#d8c890", "#9a8a5a");
      ellipse(ctx, cx, S * 0.6, S * 0.3, S * 0.34); fillStroke(ctx, ctx.fillStyle, "#5a4a2a", 1.5);
      ctx.fillStyle = "#b0a070"; ellipse(ctx, cx, S * 0.36, S * 0.18, S * 0.08); ctx.fill();
      ctx.strokeStyle = "#6a5a3a"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(S * 0.42, S * 0.36); ctx.lineTo(S * 0.58, S * 0.36); ctx.stroke();
      break;
    }
    case "bedroll": {
      ctx.fillStyle = "rgba(0,0,0,0.2)"; ellipse(ctx, cx, S * 0.9, S * 0.36, S * 0.07); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.4, 0, S * 0.85, "#7a4a3a", "#4a2a1a"); rrect(ctx, S * 0.2, S * 0.45, S * 0.6, S * 0.4, 8); fillStroke(ctx, ctx.fillStyle, "#2a1a12", 1.5);
      ctx.fillStyle = "#d8c890"; rrect(ctx, S * 0.2, S * 0.4, S * 0.6, S * 0.12, 6); fillStroke(ctx, ctx.fillStyle, "#6a5a3a", 1.2);
      break;
    }
    case "torch": {
      ctx.fillStyle = "rgba(0,0,0,0.2)"; ellipse(ctx, cx, S * 0.96, S * 0.14, S * 0.05); ctx.fill();
      ctx.fillStyle = "#3a2a1a"; rrect(ctx, cx - S * 0.05, S * 0.5, S * 0.1, S * 0.46, 3); fillStroke(ctx, ctx.fillStyle, "#1a0a04", 1.2);
      ctx.fillStyle = "#5a3a1a"; rrect(ctx, cx - S * 0.08, S * 0.42, S * 0.16, S * 0.12, 3); fillStroke(ctx, ctx.fillStyle, "#2a1a0a", 1.2);
      ctx.fillStyle = rgrad(ctx, cx, S * 0.32, S * 0.14, "#ffe080", "#ff5a1a"); ellipse(ctx, cx, S * 0.32, S * 0.1, S * 0.16); ctx.fill();
      ctx.fillStyle = "rgba(255,180,80,0.25)"; ellipse(ctx, cx, S * 0.4, S * 0.22, S * 0.18); ctx.fill();
      break;
    }

    case "bridge": {
      ctx.fillStyle = "rgba(0,0,0,0.28)"; ellipse(ctx, cx, S * 0.88, S * 0.48, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.34, 0, S * 0.82, "#a87943", "#5b351b");
      rrect(ctx, S * 0.08, S * 0.42, S * 0.84, S * 0.34, 8); fillStroke(ctx, ctx.fillStyle, "#2a160b", 2);
      ctx.strokeStyle = "#3c2412"; ctx.lineWidth = Math.max(1.5, S * 0.025);
      for (let i = 1; i < 7; i++) { const x = S * (0.08 + i * 0.12); ctx.beginPath(); ctx.moveTo(x, S * 0.43); ctx.lineTo(x, S * 0.75); ctx.stroke(); }
      ctx.strokeStyle = "#6d4a28"; ctx.lineWidth = Math.max(2, S * 0.028);
      ctx.beginPath(); ctx.moveTo(S * 0.08, S * 0.36); ctx.quadraticCurveTo(cx, S * 0.18, S * 0.92, S * 0.36); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(S * 0.08, S * 0.82); ctx.quadraticCurveTo(cx, S * 0.96, S * 0.92, S * 0.82); ctx.stroke();
      break;
    }
    case "shrine": {
      ctx.fillStyle = "rgba(0,0,0,0.28)"; ellipse(ctx, cx, S * 0.94, S * 0.42, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.45, 0, S * 0.94, p.stone, p.wallDk);
      rrect(ctx, S * 0.18, S * 0.58, S * 0.64, S * 0.3, 6); fillStroke(ctx, ctx.fillStyle, "#2a2a24", 2);
      ctx.fillStyle = lgrad(ctx, 0, S * 0.18, 0, S * 0.65, "#d9d3ae", "#7d765a");
      for (const x of [S * 0.28, S * 0.72]) { rrect(ctx, x - S * 0.05, S * 0.26, S * 0.1, S * 0.44, 3); fillStroke(ctx, ctx.fillStyle, "#343128", 1.4); }
      ctx.fillStyle = "#6f4a8d"; tri(ctx, S * 0.15, S * 0.3, S * 0.85, S * 0.3, cx, S * 0.08); fillStroke(ctx, ctx.fillStyle, "#34203f", 1.8);
      ctx.fillStyle = rgrad(ctx, cx, S * 0.5, S * 0.18, "#e9d8ff", "#7d49aa"); ellipse(ctx, cx, S * 0.5, S * 0.1, S * 0.13); ctx.fill();
      break;
    }
    case "tower": {
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ellipse(ctx, cx, S * 0.96, S * 0.38, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.22, 0, S * 0.95, p.stone, p.wallDk);
      rrect(ctx, S * 0.3, S * 0.2, S * 0.4, S * 0.74, 5); fillStroke(ctx, ctx.fillStyle, "#2a2924", 2);
      ctx.fillStyle = p.stone;
      for (let i = 0; i < 4; i++) { rrect(ctx, S * (0.28 + i * 0.13), S * 0.12, S * 0.09, S * 0.14, 2); fillStroke(ctx, ctx.fillStyle, "#2a2924", 1.3); }
      ctx.fillStyle = "#151515"; rrect(ctx, cx - S * 0.07, S * 0.67, S * 0.14, S * 0.27, 3); ctx.fill();
      ctx.fillStyle = "#87c6eb"; for (const y of [S * 0.36, S * 0.5]) { rrect(ctx, cx - S * 0.045, y, S * 0.09, S * 0.08, 1); ctx.fill(); }
      if (ice) snow(ctx, cx, S * 0.18, S * 0.28, S * 0.05);
      break;
    }
    case "ship": {
      ctx.fillStyle = "rgba(0,0,0,0.24)"; ellipse(ctx, cx, S * 0.84, S * 0.44, S * 0.1); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.48, 0, S * 0.86, "#8f5d31", "#4d2c14");
      ctx.beginPath(); ctx.moveTo(S * 0.08, S * 0.58); ctx.quadraticCurveTo(cx, S * 0.92, S * 0.92, S * 0.58); ctx.lineTo(S * 0.8, S * 0.78); ctx.quadraticCurveTo(cx, S * 0.96, S * 0.2, S * 0.78); ctx.closePath(); fillStroke(ctx, ctx.fillStyle, "#2b170b", 2);
      ctx.strokeStyle = "#4b2b16"; ctx.lineWidth = Math.max(2, S * 0.03); ctx.beginPath(); ctx.moveTo(cx, S * 0.58); ctx.lineTo(cx, S * 0.14); ctx.stroke();
      ctx.fillStyle = ice ? "#d8edf4" : "#e6d4ad"; tri(ctx, cx + S * 0.02, S * 0.18, cx + S * 0.02, S * 0.56, S * 0.82, S * 0.46); fillStroke(ctx, ctx.fillStyle, "#4d4030", 1.5);
      ctx.fillStyle = "#9a2a2a"; tri(ctx, cx - S * 0.02, S * 0.16, cx - S * 0.22, S * 0.22, cx - S * 0.02, S * 0.28); ctx.fill();
      break;
    }
    case "castle": {
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ellipse(ctx, cx, S * 0.97, S * 0.6, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.3, 0, S * 0.95, p.stone, p.wallDk); rrect(ctx, S * 0.2, S * 0.4, S * 0.6, S * 0.55, 4); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 2);
      for (const tx of [S * 0.1, S * 0.74]) {
        ctx.fillStyle = lgrad(ctx, tx, 0, tx + S * 0.16, 0, p.stone, p.wallDk);
        rrect(ctx, tx, S * 0.2, S * 0.16, S * 0.75, 3); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 2);
        ctx.fillStyle = p.roof; tri(ctx, tx - S * 0.02, S * 0.22, tx + S * 0.18, S * 0.22, tx + S * 0.08, S * 0.06); fillStroke(ctx, ctx.fillStyle, "#1a0a04", 1.5);
        for (let i = 0; i < 3; i++) { ctx.fillStyle = "#1a1a1a"; rrect(ctx, tx + S * 0.04, S * 0.4 + i * S * 0.16, S * 0.08, S * 0.1, 1); ctx.fill(); }
      }
      ctx.fillStyle = lgrad(ctx, cx - S * 0.1, 0, cx + S * 0.1, 0, p.stone, p.wallDk);
      rrect(ctx, cx - S * 0.12, S * 0.12, S * 0.24, S * 0.83, 3); fillStroke(ctx, ctx.fillStyle, "#2a2a26", 2);
      ctx.fillStyle = p.roof; tri(ctx, cx - S * 0.16, S * 0.16, cx + S * 0.16, S * 0.16, cx, S * 0.02); fillStroke(ctx, ctx.fillStyle, "#1a0a04", 1.5);
      ctx.fillStyle = "#1a1a1a"; ctx.beginPath(); ctx.moveTo(cx - S * 0.1, S * 0.95); ctx.lineTo(cx - S * 0.1, S * 0.7); ctx.arc(cx, S * 0.7, S * 0.1, Math.PI, 0); ctx.lineTo(cx + S * 0.1, S * 0.95); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#9a2a2a"; tri(ctx, cx + S * 0.02, S * 0.06, cx + S * 0.18, S * 0.1, cx + S * 0.02, S * 0.14); ctx.fill();
      if (ice) snow(ctx, cx, S * 0.1, S * 0.3, S * 0.04);
      break;
    }
    case "temple": {
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ellipse(ctx, cx, S * 0.97, S * 0.62, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.3, 0, S * 0.95, p.wall, p.wallDk);
      const steps = [[0.5, 0.95], [0.42, 0.8], [0.32, 0.64], [0.22, 0.48], [0.12, 0.34]];
      for (const [hw, by] of steps) { rrect(ctx, cx - S * hw, S * (by - 0.1), S * hw * 2, S * 0.14, 2); fillStroke(ctx, ctx.fillStyle, "#2a2418", 1.5); }
      ctx.fillStyle = "#1a1a1a"; rrect(ctx, cx - S * 0.08, S * 0.6, S * 0.16, S * 0.3, 2); ctx.fill();
      ctx.fillStyle = "#f0c060"; ellipse(ctx, cx, S * 0.3, S * 0.08, S * 0.08); ctx.fill();
      break;
    }
    case "fortress": {
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ellipse(ctx, cx, S * 0.97, S * 0.6, S * 0.08); ctx.fill();
      ctx.fillStyle = lgrad(ctx, 0, S * 0.3, 0, S * 0.95, p.stone, p.wallDk); rrect(ctx, S * 0.16, S * 0.34, S * 0.68, S * 0.6, 4); fillStroke(ctx, ctx.fillStyle, "#2a2a30", 2);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = p.stone; rrect(ctx, S * 0.18 + i * S * 0.13, S * 0.24, S * 0.08, S * 0.12, 2); fillStroke(ctx, ctx.fillStyle, "#1a1a22", 1.2); }
      for (const tx of [S * 0.06, S * 0.78]) {
        ctx.fillStyle = lgrad(ctx, tx, 0, tx + S * 0.16, 0, p.stone, p.wallDk);
        rrect(ctx, tx, S * 0.14, S * 0.16, S * 0.8, 3); fillStroke(ctx, ctx.fillStyle, "#2a2a30", 2);
        ctx.fillStyle = "#5a6a7a"; tri(ctx, tx - S * 0.02, S * 0.18, tx + S * 0.18, S * 0.18, tx + S * 0.08, S * 0.04); fillStroke(ctx, ctx.fillStyle, "#2a3a4a", 1.5);
      }
      ctx.fillStyle = "#1a1a22"; ctx.beginPath(); ctx.moveTo(cx - S * 0.1, S * 0.95); ctx.lineTo(cx - S * 0.1, S * 0.7); ctx.arc(cx, S * 0.7, S * 0.1, Math.PI, 0); ctx.lineTo(cx + S * 0.1, S * 0.95); ctx.closePath(); ctx.fill();
      snow(ctx, cx, S * 0.26, S * 0.34, S * 0.04);
      break;
    }
    default: {
      ctx.fillStyle = "#2a2a22"; ellipse(ctx, cx, S * 0.7, S * 0.4, S * 0.4); ctx.fill();
    }
  }
}