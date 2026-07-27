import React, { useRef, useEffect } from "react";
import { drawStructure, STRUCTURE_ICONS } from "@/lib/atlasStructures";

function ellipse(ctx, cx, cy, rx, ry) { ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); }
function rrect(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function tri(ctx, x1, y1, x2, y2, x3, y3) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); }
function lgrad(ctx, x0, y0, x1, y1, c0, c1) { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
function rgrad(ctx, cx, cy, r, c0, c1) { r = Math.max(1, r); const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.12, cx, cy, r); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; }
function fillStroke(ctx, fill, stroke, lw) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
function snow(ctx, x, y, rx, ry) { ctx.fillStyle = "rgba(248,252,255,0.85)"; ellipse(ctx, x, y, rx, ry); ctx.fill(); }

function drawIcon(ctx, icon, S, biome) {
  const cx = S / 2;
  const ice = biome === "fria";
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (STRUCTURE_ICONS.has(icon)) { drawStructure(ctx, icon, S, biome); return; }

  switch (icon) {
    case "treepine": {
      ctx.fillStyle = lgrad(ctx, cx - S * 0.06, 0, cx + S * 0.06, 0, "#8a6a3a", "#4a3216");
      rrect(ctx, cx - S * 0.06, S * 0.72, S * 0.12, S * 0.22, 3); ctx.fill();
      const tiers = [[0.96, 0.44, 0.54], [0.72, 0.36, 0.34], [0.5, 0.27, 0.16]];
      for (const [by, hw, ay] of tiers) {
        ctx.fillStyle = "#16351a"; tri(ctx, cx - hw - 2, S * by, cx + hw + 2, S * by, cx, S * ay - 2); ctx.fill();
        ctx.fillStyle = rgrad(ctx, cx - hw * 0.3, S * (by + ay) / 2, hw * 1.25, "#62b04a", "#2f6a2a");
        tri(ctx, cx - hw, S * by, cx + hw, S * by, cx, S * ay); ctx.fill();
        ctx.fillStyle = "rgba(190,235,150,0.45)"; tri(ctx, cx - hw * 0.55, S * by - 2, cx - hw * 0.05, S * by - 2, cx - hw * 0.15, S * (by + ay) * 0.5); ctx.fill();
        if (ice) { ctx.fillStyle = "rgba(248,252,255,0.85)"; tri(ctx, cx - hw * 0.7, S * by, cx + hw * 0.7, S * by, cx, S * (ay + (by - ay) * 0.4)); ctx.fill(); }
      }
      break;
    }
    case "trees":
    case "tree2": {
      ctx.fillStyle = lgrad(ctx, 0, 0, S, 0, "#8a6a3a", "#4a3216");
      rrect(ctx, cx - S * 0.06, S * 0.6, S * 0.12, S * 0.32, 3); fillStroke(ctx, ctx.fillStyle, "#2a1a0a", 1.5);
      ctx.fillStyle = "#16351a"; ellipse(ctx, cx, S * 0.4, S * 0.46, S * 0.42); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.1, S * 0.28, S * 0.5, "#86d06a", "#2f6a2a");
      ellipse(ctx, cx, S * 0.4, S * 0.43, S * 0.39); ctx.fill();
      ctx.fillStyle = "rgba(200,240,160,0.6)"; ellipse(ctx, cx - S * 0.13, S * 0.28, S * 0.15, S * 0.12); ctx.fill();
      ctx.fillStyle = "rgba(200,240,160,0.4)"; ellipse(ctx, cx + S * 0.1, S * 0.36, S * 0.1, S * 0.08); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, S * 0.4, S * 0.43, S * 0.39, 0, 0, Math.PI * 2); ctx.clip();
      const csg = ctx.createRadialGradient(cx + S * 0.16, S * 0.5, 2, cx + S * 0.16, S * 0.5, S * 0.42); csg.addColorStop(0, "rgba(0,0,0,0)"); csg.addColorStop(1, "rgba(20,40,16,0.3)");
      ctx.fillStyle = csg; ctx.fillRect(0, 0, S, S); ctx.restore();
      if (ice) snow(ctx, cx, S * 0.24, S * 0.34, S * 0.13);
      break;
    }
    case "mountain": {
      ctx.fillStyle = "#2a2620"; ellipse(ctx, cx, S * 0.62, S * 0.46, S * 0.36); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.1, S * 0.48, S * 0.5, "#b4ac9c", "#5a5248");
      ellipse(ctx, cx, S * 0.62, S * 0.43, S * 0.33); ctx.fill();
      ctx.strokeStyle = "#3a342a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - S * 0.1, S * 0.5); ctx.lineTo(cx - S * 0.02, S * 0.62); ctx.lineTo(cx + S * 0.1, S * 0.55); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.22)"; ellipse(ctx, cx - S * 0.12, S * 0.5, S * 0.16, S * 0.1); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, S * 0.62, S * 0.43, S * 0.33, 0, 0, Math.PI * 2); ctx.clip();
      const rsg = ctx.createRadialGradient(cx + S * 0.14, S * 0.72, 2, cx + S * 0.14, S * 0.72, S * 0.4); rsg.addColorStop(0, "rgba(0,0,0,0)"); rsg.addColorStop(1, "rgba(0,0,0,0.32)");
      ctx.fillStyle = rsg; ctx.fillRect(0, 0, S, S); ctx.restore();
      if (ice) snow(ctx, cx, S * 0.48, S * 0.3, S * 0.11);
      break;
    }
    case "mountainsnow": {
      ctx.fillStyle = "#2a3240"; ellipse(ctx, cx, S * 0.62, S * 0.46, S * 0.36); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.1, S * 0.48, S * 0.5, "#d4dce6", "#6a7888");
      ellipse(ctx, cx, S * 0.62, S * 0.43, S * 0.33); ctx.fill();
      snow(ctx, cx, S * 0.48, S * 0.3, S * 0.12);
      ctx.strokeStyle = "#4a5460"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - S * 0.1, S * 0.55); ctx.lineTo(cx, S * 0.64); ctx.stroke();
      break;
    }
    case "smallrock": {
      ctx.fillStyle = "#2a2620"; ellipse(ctx, cx, S * 0.66, S * 0.32, S * 0.24); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.08, S * 0.56, S * 0.34, "#b4ac9c", "#5e564a");
      ellipse(ctx, cx, S * 0.66, S * 0.29, S * 0.21); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.25)"; ellipse(ctx, cx - S * 0.08, S * 0.6, S * 0.12, S * 0.07); ctx.fill();
      if (ice) snow(ctx, cx, S * 0.58, S * 0.2, S * 0.06);
      break;
    }
    case "bush": {
      const pts = [[cx, S * 0.55], [cx - S * 0.2, S * 0.65], [cx + S * 0.2, S * 0.65]];
      ctx.fillStyle = "#16351a"; for (const p of pts) { ellipse(ctx, p[0], p[1], S * 0.26, S * 0.24); ctx.fill(); }
      ctx.fillStyle = rgrad(ctx, cx, S * 0.5, S * 0.4, "#6cc050", "#2f7a2a");
      for (const p of pts) { ellipse(ctx, p[0], p[1] - 1, S * 0.23, S * 0.21); ctx.fill(); }
      ctx.fillStyle = "rgba(200,240,160,0.5)"; ellipse(ctx, cx - S * 0.05, S * 0.48, S * 0.12, S * 0.09); ctx.fill();
      if (ice) snow(ctx, cx, S * 0.5, S * 0.26, S * 0.08);
      break;
    }
    case "cactus": {
      ctx.fillStyle = "#9a7a4a"; ellipse(ctx, cx, S * 0.93, S * 0.2, S * 0.06); ctx.fill();
      ctx.fillStyle = "#1c3a1a"; rrect(ctx, cx - S * 0.1, S * 0.28, S * 0.2, S * 0.64, 9); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.08, S * 0.4, S * 0.22, "#5fb058", "#2f6a3a");
      rrect(ctx, cx - S * 0.08, S * 0.3, S * 0.16, S * 0.6, 8); ctx.fill();
      ctx.strokeStyle = "#234a24"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, S * 0.32); ctx.lineTo(cx, S * 0.88); ctx.stroke();
      ctx.fillStyle = "#1c3a1a"; rrect(ctx, cx + S * 0.06, S * 0.48, S * 0.14, S * 0.06, 4); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx + S * 0.1, S * 0.4, S * 0.16, "#5fb058", "#2f6a3a"); rrect(ctx, cx + S * 0.08, S * 0.36, S * 0.1, S * 0.16, 4); ctx.fill();
      ctx.fillStyle = "#1c3a1a"; rrect(ctx, cx - S * 0.2, S * 0.55, S * 0.14, S * 0.06, 4); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.12, S * 0.5, S * 0.16, "#5fb058", "#2f6a3a"); rrect(ctx, cx - S * 0.18, S * 0.42, S * 0.1, S * 0.16, 4); ctx.fill();
      break;
    }
    case "stump": {
      ctx.fillStyle = lgrad(ctx, 0, 0, S, 0, "#8a6a3a", "#4a3216"); rrect(ctx, cx - S * 0.18, S * 0.5, S * 0.36, S * 0.42, 6); fillStroke(ctx, ctx.fillStyle, "#2a1a0a", 1.5);
      ctx.fillStyle = "#b08a5a"; ellipse(ctx, cx, S * 0.5, S * 0.2, S * 0.08); ctx.fill();
      ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) { ellipse(ctx, cx, S * 0.5, S * (0.06 + i * 0.05), S * (0.025 + i * 0.02)); ctx.stroke(); }
      if (ice) snow(ctx, cx, S * 0.49, S * 0.2, S * 0.05);
      break;
    }
    case "log": {
      ctx.fillStyle = lgrad(ctx, 0, 0, 0, S, "#8a6a3a", "#4a3216"); rrect(ctx, S * 0.2, S * 0.45, S * 0.6, S * 0.3, 13); fillStroke(ctx, ctx.fillStyle, "#2a1a0a", 1.5);
      ctx.fillStyle = "#b08a5a"; ellipse(ctx, S * 0.78, S * 0.6, S * 0.12, S * 0.15); ctx.fill();
      ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ellipse(ctx, S * 0.78, S * 0.6, S * (0.04 + i * 0.04), S * (0.05 + i * 0.04)); ctx.stroke(); }
      if (ice) snow(ctx, cx, S * 0.43, S * 0.28, S * 0.05);
      break;
    }
    case "deadtree": {
      ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = S * 0.07;
      ctx.beginPath(); ctx.moveTo(cx, S * 0.95); ctx.lineTo(cx, S * 0.5); ctx.stroke();
      ctx.lineWidth = S * 0.04;
      ctx.beginPath(); ctx.moveTo(cx, S * 0.6); ctx.lineTo(cx - S * 0.18, S * 0.42); ctx.moveTo(cx, S * 0.5); ctx.lineTo(cx + S * 0.16, S * 0.32); ctx.moveTo(cx, S * 0.42); ctx.lineTo(cx - S * 0.05, S * 0.22); ctx.stroke();
      ctx.lineWidth = S * 0.025;
      ctx.beginPath(); ctx.moveTo(cx - S * 0.18, S * 0.42); ctx.lineTo(cx - S * 0.24, S * 0.34); ctx.moveTo(cx + S * 0.16, S * 0.32); ctx.lineTo(cx + S * 0.22, S * 0.24); ctx.stroke();
      break;
    }
    case "mushroom": {
      ctx.fillStyle = "#e8d0a0"; rrect(ctx, cx - S * 0.06, S * 0.52, S * 0.12, S * 0.32, 4); fillStroke(ctx, ctx.fillStyle, "#3a2a1a", 1.2);
      ctx.fillStyle = "#7a1a1a"; ellipse(ctx, cx, S * 0.48, S * 0.26, S * 0.2); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.06, S * 0.4, S * 0.26, "#f06a5a", "#a02828");
      ellipse(ctx, cx, S * 0.45, S * 0.24, S * 0.19); fillStroke(ctx, ctx.fillStyle, "#5a1a1a", 1.2);
      ctx.fillStyle = "#ffffff"; for (const p of [[cx - S * 0.08, S * 0.42], [cx + S * 0.06, S * 0.38], [cx + S * 0.02, S * 0.48]]) { ellipse(ctx, p[0], p[1], S * 0.03, S * 0.025); ctx.fill(); }
      break;
    }
    case "campfire": {
      ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = S * 0.07;
      ctx.beginPath(); ctx.moveTo(S * 0.3, S * 0.72); ctx.lineTo(S * 0.7, S * 0.6); ctx.moveTo(S * 0.3, S * 0.6); ctx.lineTo(S * 0.7, S * 0.72); ctx.stroke();
      ctx.fillStyle = "#7a1a1a"; ellipse(ctx, cx, S * 0.5, S * 0.16, S * 0.22); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx, S * 0.45, S * 0.2, "#ffd840", "#ff6a1a");
      ellipse(ctx, cx, S * 0.48, S * 0.13, S * 0.2); fillStroke(ctx, ctx.fillStyle, "#c04020", 1.2);
      ctx.fillStyle = "rgba(255,255,200,0.8)"; ellipse(ctx, cx, S * 0.52, S * 0.06, S * 0.1); ctx.fill();
      break;
    }
    case "cave": {
      ctx.fillStyle = "#3a2e22"; ellipse(ctx, cx, S * 0.6, S * 0.46, S * 0.4); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.1, S * 0.48, S * 0.5, "#8a7a6a", "#4a3a2a");
      ellipse(ctx, cx, S * 0.6, S * 0.43, S * 0.37); ctx.fill();
      ctx.fillStyle = "#0a0a0a"; ellipse(ctx, cx, S * 0.64, S * 0.2, S * 0.28); ctx.fill();
      ctx.strokeStyle = "#6a5a4a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, S * 0.64, S * 0.2, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
      if (ice) snow(ctx, cx, S * 0.32, S * 0.3, S * 0.08);
      break;
    }
    case "ruins": {
      ctx.fillStyle = lgrad(ctx, 0, 0, 0, S, "#a8a898", "#5a5a4a");
      rrect(ctx, S * 0.28, S * 0.54, S * 0.2, S * 0.32, 2); fillStroke(ctx, ctx.fillStyle, "#2a2a22", 1.3);
      rrect(ctx, S * 0.52, S * 0.48, S * 0.2, S * 0.38, 2); fillStroke(ctx, ctx.fillStyle, "#2a2a22", 1.3);
      ctx.strokeStyle = "#3a3a30"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(S * 0.3, S * 0.66); ctx.lineTo(S * 0.46, S * 0.66); ctx.moveTo(S * 0.56, S * 0.62); ctx.lineTo(S * 0.7, S * 0.62); ctx.stroke();
      ctx.fillStyle = "#3a6a2a"; ellipse(ctx, S * 0.32, S * 0.86, S * 0.08, S * 0.04); ellipse(ctx, S * 0.66, S * 0.86, S * 0.08, S * 0.04); ctx.fill();
      if (ice) snow(ctx, cx, S * 0.46, S * 0.26, S * 0.05);
      break;
    }
    case "bone": {
      ctx.fillStyle = "#e8e0c8";
      rrect(ctx, S * 0.36, S * 0.54, S * 0.28, S * 0.08, 4); fillStroke(ctx, ctx.fillStyle, "#3a3a2a", 1.2);
      ellipse(ctx, S * 0.34, S * 0.52, S * 0.08, S * 0.09); fillStroke(ctx, ctx.fillStyle, "#3a3a2a", 1.2);
      ellipse(ctx, S * 0.34, S * 0.62, S * 0.07, S * 0.06); fillStroke(ctx, ctx.fillStyle, "#3a3a2a", 1.2);
      ellipse(ctx, S * 0.66, S * 0.52, S * 0.08, S * 0.09); fillStroke(ctx, ctx.fillStyle, "#3a3a2a", 1.2);
      ellipse(ctx, S * 0.66, S * 0.62, S * 0.07, S * 0.06); fillStroke(ctx, ctx.fillStyle, "#3a3a2a", 1.2);
      break;
    }
    case "landmark": {
      ctx.fillStyle = "#7a4a2a"; tri(ctx, S * 0.2, S * 0.42, S * 0.8, S * 0.42, cx, S * 0.2); fillStroke(ctx, ctx.fillStyle, "#2a1a0a", 1.5);
      ctx.fillStyle = lgrad(ctx, 0, S * 0.42, 0, S, "#d4b488", "#8a6a4a"); rrect(ctx, S * 0.26, S * 0.42, S * 0.48, S * 0.48, 4); fillStroke(ctx, ctx.fillStyle, "#2a1a0a", 1.5);
      ctx.fillStyle = "#3a2a1a"; rrect(ctx, cx - S * 0.06, S * 0.62, S * 0.12, S * 0.28, 2); ctx.fill();
      ctx.fillStyle = "#f2d060"; rrect(ctx, S * 0.34, S * 0.54, S * 0.08, S * 0.08, 1); rrect(ctx, S * 0.58, S * 0.54, S * 0.08, S * 0.08, 1); ctx.fill();
      break;
    }
    case "gem": {
      ctx.fillStyle = "#4a2a6a"; tri(ctx, S * 0.4, S * 0.72, S * 0.6, S * 0.72, cx, S * 0.24); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.05, S * 0.4, S * 0.3, "#d8b0f0", "#6a3a98");
      tri(ctx, S * 0.42, S * 0.7, S * 0.58, S * 0.7, cx, S * 0.28); fillStroke(ctx, ctx.fillStyle, "#3a1a5a", 1.3);
      ctx.fillStyle = "rgba(255,255,255,0.5)"; tri(ctx, S * 0.46, S * 0.66, S * 0.5, S * 0.66, cx - S * 0.03, S * 0.34); ctx.fill();
      break;
    }
    case "snowflake": {
      ctx.strokeStyle = "#dfeefc"; ctx.lineWidth = S * 0.03;
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(cx, S * 0.5); ctx.rotate(i * Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, -S * 0.32); ctx.lineTo(0, S * 0.32); for (const s of [-S * 0.18, S * 0.18]) { ctx.moveTo(0, s); ctx.lineTo(S * 0.06, s - S * 0.06); ctx.moveTo(0, s); ctx.lineTo(-S * 0.06, s - S * 0.06); } ctx.stroke(); ctx.restore(); }
      ctx.fillStyle = "#eaf6ff"; ellipse(ctx, cx, S * 0.5, S * 0.04, S * 0.04); ctx.fill();
      break;
    }
    default: {
      ctx.fillStyle = "#2a2a22"; ellipse(ctx, cx, S * 0.62, S * 0.36, S * 0.3); ctx.fill();
      ctx.fillStyle = rgrad(ctx, cx - S * 0.08, S * 0.52, S * 0.4, "#9a9a8a", "#4a4a3a");
      ellipse(ctx, cx, S * 0.62, S * 0.33, S * 0.27); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.2)"; ellipse(ctx, cx - S * 0.1, S * 0.54, S * 0.12, S * 0.07); ctx.fill();
    }
  }
}

export default function WorldSprite({ icon, size = 48, biome, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr; cv.height = size * dpr;
    const ctx = cv.getContext("2d"); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.scale(dpr, dpr);
    drawIcon(ctx, icon, size, biome);
  }, [icon, size, biome]);
  return React.createElement("canvas", { ref, style: { width: size, height: size, ...style } });
}