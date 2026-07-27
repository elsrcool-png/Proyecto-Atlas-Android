// PROYECTO ATLAS — Entidades visuales de la Región Verde v2.4.
// Sprites procedurales 36×48 con siluetas propias para mundo libre y combate.

const W = 36;
const H = 48;

function rr(ctx, x, y, w, h, r, fill, stroke = null, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function circle(ctx, x, y, r, fill, stroke = null, lw = 1) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function poly(ctx, pts, fill, stroke = null, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function line(ctx, x1, y1, x2, y2, color, lw = 1) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.stroke();
}

function shadow(ctx, rx = 11, ry = 3) {
  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath(); ctx.ellipse(18, 45, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}

function prepare(canvas, draw, dir, frame, hurt) {
  if (!canvas) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  if (dir === "right") {
    ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1); draw(ctx, "left", frame); ctx.restore();
  } else draw(ctx, dir || "down", frame);
  if (hurt) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(230,45,45,.48)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawPanther(ctx, dir, frame) {
  const side = dir === "left";
  const up = dir === "up";
  const bob = frame ? -1 : 0;
  const step = frame ? 1.4 : -1.4;
  const OL = "#0a0b0f";
  const FUR = "#25232f";
  const FUR_D = "#15141d";
  const FUR_H = "#484158";
  const EYE = "#b8f35a";
  shadow(ctx, 12.5, 3);

  if (side) {
    rr(ctx, 8, 23 + bob, 20, 12, 6, FUR_D, OL, 1.8);
    rr(ctx, 10, 22 + bob, 16, 7, 4, FUR, null);
    poly(ctx, [[12,24+bob],[18,20+bob],[25,22+bob],[28,27+bob],[21,29+bob],[13,28+bob]], FUR_H, null);
    circle(ctx, 8, 20 + bob, 6.3, FUR, OL, 1.6);
    poly(ctx, [[4,17+bob],[4.5,10+bob],[9,16+bob]], FUR_D, OL, 1);
    poly(ctx, [[9,16+bob],[13,10+bob],[13,19+bob]], FUR_D, OL, 1);
    rr(ctx, 2.2, 20.5 + bob, 7.5, 4.8, 2.4, "#45404e", OL, 1);
    circle(ctx, 2.1, 23 + bob, 1.4, "#08080a");
    circle(ctx, 7.3, 18.7 + bob, 1.15, EYE, OL, .6);
    rr(ctx, 10, 34 + step + bob, 4, 8, 2, FUR_D, OL, 1);
    rr(ctx, 16, 34 - step + bob, 4, 8, 2, FUR_D, OL, 1);
    rr(ctx, 23, 33 - step + bob, 4, 9, 2, FUR_D, OL, 1);
    line(ctx, 27, 27 + bob, 34, 21 + bob, OL, 5);
    line(ctx, 27, 27 + bob, 34, 21 + bob, FUR_D, 2.8);
  } else {
    rr(ctx, 9.5, 23 + bob, 17, 13, 6, FUR_D, OL, 1.7);
    rr(ctx, 11, 22 + bob, 14, 8, 4, FUR, null);
    circle(ctx, 18, (up ? 16 : 18) + bob, 7, FUR, OL, 1.6);
    poly(ctx, [[12.2,14+bob],[11,7+bob],[16,13+bob]], FUR_D, OL, 1);
    poly(ctx, [[23.8,14+bob],[25,7+bob],[20,13+bob]], FUR_D, OL, 1);
    if (!up) {
      rr(ctx, 13, 18 + bob, 10, 5.5, 2.5, "#45404e", OL, 1);
      circle(ctx, 18, 22 + bob, 1.4, "#08080a");
      circle(ctx, 15.2, 16 + bob, 1.15, EYE, OL, .6);
      circle(ctx, 20.8, 16 + bob, 1.15, EYE, OL, .6);
    } else rr(ctx, 12, 13 + bob, 12, 5, 2, FUR_H, null);
    rr(ctx, 10.5, 34 + step + bob, 4.5, 8, 2, FUR_D, OL, 1);
    rr(ctx, 21, 34 - step + bob, 4.5, 8, 2, FUR_D, OL, 1);
    rr(ctx, 15.8, 35 - step + bob, 4.4, 7, 2, "#35313e", OL, 1);
    line(ctx, 24, 29 + bob, 31, 25 + bob, OL, 5);
    line(ctx, 24, 29 + bob, 31, 25 + bob, FUR_D, 2.8);
  }
}

function drawOrcBase(ctx, dir, frame, kind) {
  const side = dir === "left";
  const up = dir === "up";
  const bob = frame ? -1 : 0;
  const leg = frame ? 1 : -1;
  const OL = "#172014";
  const SKIN = kind === "shaman" ? "#71945a" : "#66884d";
  const SKIN_D = "#3d5b31";
  const LEATHER = kind === "assassin" ? "#29272d" : "#5d3d28";
  const LEATHER_D = kind === "assassin" ? "#17171b" : "#37251a";
  const BONE = "#d7c99d";
  const METAL = "#a8afb4";
  const EYE = kind === "shaman" ? "#b8ff72" : "#f1cb64";
  shadow(ctx, kind === "brute" ? 13 : 11, 3.2);

  const scale = kind === "brute" ? 1.08 : 1;
  ctx.save(); ctx.translate(18, 45); ctx.scale(scale, scale); ctx.translate(-18, -45);

  rr(ctx, side ? 12 : 10, 35 + leg + bob, 6, 10, 2, LEATHER_D, OL, 1.2);
  rr(ctx, side ? 18 : 20, 35 - leg + bob, 6, 10, 2, LEATHER, OL, 1.2);
  const bx = side ? 9 : 8;
  const bw = side ? 18 : 20;
  rr(ctx, bx, 21 + bob, bw, 17, 5, LEATHER_D, OL, 1.7);
  rr(ctx, bx + 1, 21 + bob, bw - 2, 9, 4, LEATHER, null);
  if (kind === "shaman") {
    rr(ctx, bx + 3, 23 + bob, bw - 6, 15, 3, "#334b31", OL, 1);
    poly(ctx, [[bx+4,27+bob],[18,31+bob],[bx+bw-4,27+bob],[24,38+bob],[12,38+bob]], "#466b3d", null);
  } else if (kind === "assassin") {
    line(ctx, bx + 2, 29 + bob, bx + bw - 2, 24 + bob, "#705c35", 2);
    rr(ctx, bx + 4, 31 + bob, bw - 8, 4, 1.5, "#403642", null);
  } else {
    rr(ctx, bx + 2, 24 + bob, bw - 4, 6, 2.5, "#7a5633", null);
    circle(ctx, 18, 27 + bob, 2, METAL, OL, .7);
  }

  circle(ctx, 18, 14 + bob, kind === "brute" ? 9 : 8.2, SKIN, OL, 1.7);
  if (up) {
    rr(ctx, 11, 8 + bob, 14, 8, 4, SKIN_D, null);
  } else {
    if (kind === "assassin") {
      poly(ctx, [[9,13+bob],[12,6+bob],[24,6+bob],[27,13+bob],[24,18+bob],[12,18+bob]], "#242127", OL, 1.2);
      rr(ctx, 12.5, 13 + bob, 11, 5, 2, SKIN_D, null);
    } else if (kind === "shaman") {
      poly(ctx, [[10,10+bob],[13,5+bob],[17,7+bob],[20,3+bob],[23,8+bob],[26,10+bob]], "#4a3824", OL, 1);
      line(ctx, 18, 6 + bob, 18, 1 + bob, BONE, 2);
    } else {
      rr(ctx, 10, 7 + bob, 16, 6, 3, "#33261c", OL, 1);
    }
    circle(ctx, side ? 14.5 : 15, 14 + bob, 1.2, EYE, OL, .5);
    if (!side) circle(ctx, 21, 14 + bob, 1.2, EYE, OL, .5);
    poly(ctx, [[12,18+bob],[15,17+bob],[14,21+bob]], BONE, OL, .5);
    poly(ctx, [[24,18+bob],[21,17+bob],[22,21+bob]], BONE, OL, .5);
  }

  if (kind === "brute") {
    const hx = side ? 7 : 29;
    line(ctx, hx, 38 + bob, side ? 3 : 33, 18 + bob, OL, 6);
    line(ctx, hx, 38 + bob, side ? 3 : 33, 18 + bob, "#6a482b", 3.5);
    circle(ctx, side ? 3 : 33, 17 + bob, 4.5, "#77705c", OL, 1.2);
  } else if (kind === "assassin") {
    for (const [sx, tx] of side ? [[9,2],[14,7]] : [[27,34],[22,29]]) {
      line(ctx, sx, 36 + bob, tx, 25 + bob, OL, 3.5);
      line(ctx, sx, 36 + bob, tx, 25 + bob, METAL, 1.8);
    }
  } else {
    const sx = side ? 8 : 29;
    line(ctx, sx, 44, sx, 9, "#4b321d", 3);
    circle(ctx, sx, 8, 4.6, "#73d35e", OL, 1);
    circle(ctx, sx, 8, 2.2, "#c8ff85");
  }
  ctx.restore();
}

function drawFeral(ctx, dir, frame) {
  const side = dir === "left";
  const up = dir === "up";
  const bob = frame ? -1 : 0;
  const leg = frame ? 1 : -1;
  const OL = "#120d1a";
  const ROBE = "#2c1b38";
  const ROBE_H = "#513264";
  const SKIN = "#6b536e";
  const GLOW = "#c879ff";
  shadow(ctx, 11, 3);
  rr(ctx, 11, 36 + leg + bob, 5, 9, 2, "#18101f", OL, 1);
  rr(ctx, 20, 36 - leg + bob, 5, 9, 2, "#211329", OL, 1);
  poly(ctx, [[9,22+bob],[27,22+bob],[29,40+bob],[7,40+bob]], ROBE, OL, 1.7);
  poly(ctx, [[11,24+bob],[18,29+bob],[25,24+bob],[23,38+bob],[13,38+bob]], ROBE_H, null);
  circle(ctx, 18, 14 + bob, 8, SKIN, OL, 1.6);
  poly(ctx, [[9,14+bob],[12,6+bob],[18,3+bob],[24,6+bob],[27,14+bob],[24,20+bob],[12,20+bob]], ROBE, OL, 1.3);
  if (!up) {
    circle(ctx, side ? 14.5 : 15, 14 + bob, 1.2, GLOW, OL, .5);
    if (!side) circle(ctx, 21, 14 + bob, 1.2, GLOW, OL, .5);
    rr(ctx, 14, 18 + bob, 8, 2, 1, "#2a1831", null);
  }
  const sx = side ? 8 : 29;
  line(ctx, sx, 44, sx, 9, "#4b321d", 2.8);
  circle(ctx, sx, 8, 4.3, GLOW, OL, 1);
  circle(ctx, sx, 8, 2, "#f0c5ff");
  const clawX = side ? 27 : 7;
  for (let i = 0; i < 3; i++) line(ctx, clawX, 33 + bob, clawX + (side ? 5 : -5), 28 + i * 2 + bob, "#d0b4d6", 1.1);
}

function drawGuardian(ctx, dir, frame) {
  const side = dir === "left";
  const up = dir === "up";
  const bob = frame ? -1 : 0;
  const OL = "#10180f";
  const BARK = "#4c3a25";
  const BARK_H = "#765536";
  const MOSS = "#3f743d";
  const LEAF = "#71a85a";
  const GLOW = "#b8ff72";
  shadow(ctx, 14, 3.5);
  rr(ctx, 9, 35 + bob, 7, 10, 2, BARK, OL, 1.5);
  rr(ctx, 20, 35 + bob, 7, 10, 2, BARK_H, OL, 1.5);
  rr(ctx, 6, 19 + bob, 24, 21, 7, BARK, OL, 2);
  rr(ctx, 8, 20 + bob, 20, 10, 5, BARK_H, null);
  poly(ctx, [[8,25+bob],[14,21+bob],[18,26+bob],[23,20+bob],[28,27+bob],[25,38+bob],[11,38+bob]], MOSS, null);
  circle(ctx, 18, 13 + bob, 9, BARK_H, OL, 1.8);
  poly(ctx, [[12,9+bob],[8,2+bob],[14,6+bob],[16,0+bob],[18,7+bob]], BARK, OL, 1.2);
  poly(ctx, [[24,9+bob],[28,2+bob],[22,6+bob],[20,0+bob],[18,7+bob]], BARK, OL, 1.2);
  circle(ctx, 13, 8 + bob, 3.3, LEAF, OL, .8);
  circle(ctx, 23, 7 + bob, 3.6, LEAF, OL, .8);
  if (!up) {
    circle(ctx, side ? 14.5 : 15, 13 + bob, 1.5, GLOW, OL, .5);
    if (!side) circle(ctx, 21, 13 + bob, 1.5, GLOW, OL, .5);
  }
  line(ctx, 7, 25 + bob, 2, 38 + bob, BARK, 5);
  line(ctx, 29, 25 + bob, 34, 38 + bob, BARK_H, 5);
  for (const x of [2,34]) {
    line(ctx, x, 38 + bob, x + (x < 18 ? -1 : 1), 44 + bob, OL, 2.5);
    line(ctx, x, 38 + bob, x + (x < 18 ? 3 : -3), 44 + bob, OL, 2.5);
  }
}

export function drawGreenPanther(canvas, dir = "down", frame = 0, hurt = false) { prepare(canvas, drawPanther, dir, frame, hurt); }
export function drawGreenFeralWarlock(canvas, dir = "down", frame = 0, hurt = false) { prepare(canvas, drawFeral, dir, frame, hurt); }
export function drawGreenOrcAssassin(canvas, dir = "down", frame = 0, hurt = false) { prepare(canvas, (ctx,d,f) => drawOrcBase(ctx,d,f,"assassin"), dir, frame, hurt); }
export function drawGreenOrcBrute(canvas, dir = "down", frame = 0, hurt = false) { prepare(canvas, (ctx,d,f) => drawOrcBase(ctx,d,f,"brute"), dir, frame, hurt); }
export function drawGreenOrcShaman(canvas, dir = "down", frame = 0, hurt = false) { prepare(canvas, (ctx,d,f) => drawOrcBase(ctx,d,f,"shaman"), dir, frame, hurt); }
export function drawGreenGuardian(canvas, dir = "down", frame = 0, hurt = false) { prepare(canvas, drawGuardian, dir, frame, hurt); }
