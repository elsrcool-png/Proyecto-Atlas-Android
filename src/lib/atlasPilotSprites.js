// Atlas Visual v2.3.1 — sprites piloto visibles y diferenciados.
// Se dibujan en canvas para conservar animación ligera y evitar hojas pesadas.

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
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function poly(ctx, pts, fill, stroke = null, lw = 1) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function line(ctx, x1, y1, x2, y2, stroke, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.stroke();
}

function mirrorDraw(canvas, draw, dir, frame, hurt, pose = "idle") {
  const ctx = canvas.getContext("2d");
  canvas.width = 36;
  canvas.height = 48;
  ctx.clearRect(0, 0, 36, 48);
  ctx.imageSmoothingEnabled = true;
  if (dir === "right") {
    ctx.save();
    ctx.translate(36, 0);
    ctx.scale(-1, 1);
    draw(ctx, "left", frame, pose);
    ctx.restore();
  } else {
    draw(ctx, dir, frame, pose);
  }
  if (hurt) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(232,54,54,.52)";
    ctx.fillRect(0, 0, 36, 48);
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawWarrior(ctx, dir, frame, pose = "idle") {
  const bob = frame ? -1 : 0;
  const OL = "#15181b";
  const SKIN = "#e8b48d";
  const SKIN_S = "#bd7d5f";
  const HAIR = "#4b2d1d";
  const HAIR_H = "#765039";
  const STEEL = "#aab5c5";
  const STEEL_D = "#596474";
  const TUNIC = "#315d5a";
  const TUNIC_D = "#1d3938";
  const RED = "#a9403a";
  const LEATHER = "#6b4327";
  const BOOT = "#2d2119";

  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath(); ctx.ellipse(18, 45.5, 11.5, 3.3, 0, 0, Math.PI * 2); ctx.fill();

  const side = dir === "left";
  const up = dir === "up";
  const legShift = frame ? 1 : -1;
  if (!side) {
    rr(ctx, 11, 35 + legShift + bob, 6, 10, 2, BOOT, OL, 1.2);
    rr(ctx, 19, 35 - legShift + bob, 6, 10, 2, BOOT, OL, 1.2);
    rr(ctx, 11.5, 35 + legShift + bob, 5, 5, 1.5, STEEL_D, OL, .8);
    rr(ctx, 19.5, 35 - legShift + bob, 5, 5, 1.5, STEEL_D, OL, .8);
  } else {
    rr(ctx, 13, 36 - legShift + bob, 6, 9, 2, BOOT, OL, 1.2);
    rr(ctx, 17, 36 + legShift + bob, 6, 9, 2, "#3a2a20", OL, 1.2);
  }

  const bodyX = side ? 10 : 8.5;
  const bodyW = side ? 16 : 19;
  rr(ctx, bodyX, 21 + bob, bodyW, 17, 5, TUNIC_D, OL, 1.7);
  rr(ctx, bodyX + 1, 21 + bob, bodyW - 2, 10, 4, TUNIC, null);
  rr(ctx, bodyX + 2, 23 + bob, bodyW - 4, 8, 3, STEEL_D, OL, 1.1);
  rr(ctx, bodyX + 3, 23.5 + bob, bodyW - 6, 5.5, 2.5, STEEL, null);
  ctx.fillStyle = "rgba(255,255,255,.23)";
  rr(ctx, bodyX + 4, 24 + bob, 3, 3, 1.5, "rgba(255,255,255,.25)");
  rr(ctx, bodyX, 31.5 + bob, bodyW, 3.5, 1.5, RED, OL, .8);
  rr(ctx, bodyX + bodyW / 2 - 1.5, 31 + bob, 3, 5, 1, "#d8b45d", OL, .7);

  if (side) {
    rr(ctx, 7.5, 24 + bob, 5, 11, 2.5, STEEL_D, OL, 1.2);
    circle(ctx, 9.5, 34.5 + bob, 2.2, SKIN, OL, .8);
  } else {
    rr(ctx, 4.5, 24 + bob, 5.5, 11, 2.5, STEEL_D, OL, 1.2);
    rr(ctx, 26, 24 + bob, 5.5, 11, 2.5, STEEL_D, OL, 1.2);
    circle(ctx, 7.3, 35 + bob, 2.2, SKIN, OL, .8);
    circle(ctx, 28.7, 35 + bob, 2.2, SKIN, OL, .8);
  }

  circle(ctx, 18, 14 + bob, 8.7, SKIN, OL, 1.7);
  if (up) {
    circle(ctx, 18, 12.5 + bob, 8.2, HAIR, OL, 1.2);
    rr(ctx, 10.5, 14 + bob, 15, 5, 2.5, HAIR, null);
  } else {
    rr(ctx, 9.5, 6.5 + bob, 17, 7, 3.5, HAIR, OL, 1.2);
    poly(ctx, [[10,10+bob],[12,5+bob],[15,9+bob],[18,4+bob],[20,9+bob],[24,5+bob],[26,11+bob]], HAIR_H, OL, .8);
    ctx.fillStyle = "#251b18";
    if (side) {
      rr(ctx, 13.2, 13.8 + bob, 2, 2.6, .7, "#251b18");
      rr(ctx, 13.6, 14.1 + bob, .7, .7, .3, "#fff");
    } else {
      rr(ctx, 14, 13.7 + bob, 2, 2.6, .7, "#251b18");
      rr(ctx, 20, 13.7 + bob, 2, 2.6, .7, "#251b18");
      rr(ctx, 14.4, 14 + bob, .7, .7, .3, "#fff");
      rr(ctx, 20.4, 14 + bob, .7, .7, .3, "#fff");
      line(ctx, 16, 19 + bob, 20, 19 + bob, SKIN_S, 1);
    }
  }

  // Escudo separado, grande y claramente legible.
  if (!side) {
    circle(ctx, 7.1, 29.5 + bob, 5.1, STEEL_D, OL, 1.4);
    circle(ctx, 7.1, 29.5 + bob, 3.5, "#823d34", "#d4a552", .9);
    poly(ctx, [[7.1,26.2+bob],[8.2,28.6+bob],[10.7,29.5+bob],[8.2,30.4+bob],[7.1,32.8+bob],[6,30.4+bob],[3.5,29.5+bob],[6,28.6+bob]], "#d4a552", null);
  }

  // Espada visible, no un destello genérico.
  const handX = side ? 9 : 29;
  let tipX = side ? 2.5 : 34;
  let tipY = 17 + bob;
  if (pose === "heavy") { tipX = side ? 7 : 29; tipY = 7 + bob; }
  else if (pose === "thrust") { tipX = side ? -2 : 38; tipY = 29 + bob; }
  else if (pose === "miss") { tipX = side ? 5 : 31; tipY = 8 + bob; }
  else if (["attack","slash","dual"].includes(pose)) { tipX = side ? 0 : 36; tipY = 23 + bob; }
  line(ctx, handX, 33 + bob, tipX, tipY, OL, 4.4);
  line(ctx, handX, 33 + bob, tipX, tipY, STEEL, 2.5);
  line(ctx, side ? 6.7 : 26.5, 31.2 + bob, side ? 11.5 : 31.3, 33.4 + bob, "#d6ad5b", 2);
  rr(ctx, side ? 8 : 27, 32 + bob, 2.8, 6.5, 1, LEATHER, OL, .8);
}

function drawBrenCore(ctx, dir, frame) {
  const bob = frame ? -1 : 0;
  const OL = "#18130f";
  const SKIN = "#d69a6c";
  const SKIN_S = "#a76548";
  const BEARD = "#4a2517";
  const BEARD_H = "#7c4328";
  const SHIRT = "#2f4b46";
  const APRON = "#7b482b";
  const APRON_H = "#b26e3d";
  const BOOT = "#2b1d16";
  const METAL = "#929ca5";
  const side = dir === "left";
  const up = dir === "up";
  const leg = frame ? 1 : -1;

  ctx.fillStyle = "rgba(0,0,0,.34)";
  ctx.beginPath(); ctx.ellipse(18, 45.5, 12, 3.4, 0, 0, Math.PI * 2); ctx.fill();

  if (!side) {
    rr(ctx, 10, 36 + leg + bob, 7, 9, 2, BOOT, OL, 1.3);
    rr(ctx, 19, 36 - leg + bob, 7, 9, 2, BOOT, OL, 1.3);
  } else {
    rr(ctx, 12, 36 - leg + bob, 7, 9, 2, BOOT, OL, 1.3);
    rr(ctx, 18, 36 + leg + bob, 7, 9, 2, "#38261c", OL, 1.3);
  }

  const bx = side ? 8.5 : 7.5;
  const bw = side ? 19 : 21;
  rr(ctx, bx, 21 + bob, bw, 18, 6, SHIRT, OL, 1.8);
  rr(ctx, bx + 3, 22 + bob, bw - 6, 17, 4, APRON, OL, 1.1);
  rr(ctx, bx + 4, 23 + bob, bw - 8, 3, 1.5, APRON_H, null);
  line(ctx, bx + 3, 29 + bob, bx + bw - 3, 29 + bob, "#d39a58", 1.2);
  rr(ctx, bx + bw / 2 - 3.8, 31 + bob, 7.6, 5.5, 1.5, "#53301f", OL, .8);
  circle(ctx, bx + bw / 2 - 2.2, 33 + bob, .8, "#d1a552");
  circle(ctx, bx + bw / 2 + 2.2, 33 + bob, .8, "#d1a552");

  if (!side) {
    rr(ctx, 3.5, 24 + bob, 6.5, 12, 3, "#4a5c52", OL, 1.2);
    rr(ctx, 26, 24 + bob, 6.5, 12, 3, "#4a5c52", OL, 1.2);
    circle(ctx, 6.5, 35 + bob, 2.7, "#4d2d20", OL, .8);
    circle(ctx, 29.5, 35 + bob, 2.7, "#4d2d20", OL, .8);
  } else {
    rr(ctx, 5.5, 24 + bob, 6.5, 12, 3, "#4a5c52", OL, 1.2);
    circle(ctx, 8.5, 35 + bob, 2.7, "#4d2d20", OL, .8);
  }

  circle(ctx, 18, 14 + bob, 9, SKIN, OL, 1.8);
  if (up) {
    circle(ctx, 18, 12.5 + bob, 8, BEARD, OL, 1);
    rr(ctx, 10, 13 + bob, 16, 5, 2.5, BEARD, null);
  } else {
    // Bren tiene coronilla despejada, cejas gruesas y barba amplia.
    poly(ctx, [[10,11+bob],[12,7+bob],[16,5.5+bob],[20,5.5+bob],[24,7+bob],[26,11+bob],[24,10+bob],[20,9+bob],[16,9+bob],[12,10+bob]], BEARD_H, OL, 1);
    rr(ctx, 10.2, 15 + bob, 15.6, 8, 4, BEARD, OL, 1.1);
    poly(ctx, [[12,20+bob],[18,25+bob],[24,20+bob]], BEARD, OL, .8);
    if (side) {
      rr(ctx, 13, 13.5 + bob, 2.2, 2.6, .7, "#2a1b14");
      line(ctx, 12.5, 12.2 + bob, 16, 11.5 + bob, BEARD, 1.3);
    } else {
      rr(ctx, 13.5, 13.5 + bob, 2.2, 2.6, .7, "#2a1b14");
      rr(ctx, 20.3, 13.5 + bob, 2.2, 2.6, .7, "#2a1b14");
      line(ctx, 12.7, 12.2 + bob, 16.5, 11.4 + bob, BEARD, 1.3);
      line(ctx, 19.5, 11.4 + bob, 23.3, 12.2 + bob, BEARD, 1.3);
    }
  }

  // Martillo grande para que el oficio se entienda sin leer el nombre.
  const hx = side ? 8 : 30;
  line(ctx, hx, 38 + bob, side ? 4 : 34, 25 + bob, OL, 4.6);
  line(ctx, hx, 38 + bob, side ? 4 : 34, 25 + bob, "#6c3f23", 2.6);
  rr(ctx, side ? 0.5 : 30, 21 + bob, 7, 6.5, 1.2, METAL, OL, 1.3);
  rr(ctx, side ? 1.5 : 31, 22 + bob, 5, 2, .7, "#c0c7cc", null);
}

function drawWolfCore(ctx, dir, frame) {
  const bob = frame ? -1 : 0;
  const OL = "#111712";
  const FUR = "#596b58";
  const FUR_D = "#344438";
  const FUR_H = "#87977a";
  const MUZZLE = "#a8aa93";
  const EYE = "#f2c760";
  const side = dir === "left";
  const up = dir === "up";
  const step = frame ? 1.5 : -1.5;

  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath(); ctx.ellipse(18, 42.5, 12, 3.1, 0, 0, Math.PI * 2); ctx.fill();

  if (side) {
    // Cuerpo realmente cuadrúpedo, no humanoide con orejas.
    rr(ctx, 9, 24 + bob, 18, 12, 6, FUR_D, OL, 1.7);
    rr(ctx, 10, 23 + bob, 16, 8, 4, FUR, null);
    poly(ctx, [[11,25+bob],[16,20+bob],[23,22+bob],[27,26+bob],[22,29+bob],[15,29+bob]], FUR_H, null);
    circle(ctx, 8.5, 21 + bob, 6.5, FUR, OL, 1.6);
    poly(ctx, [[4,18+bob],[4.5,10+bob],[9,16+bob]], FUR_D, OL, 1);
    poly(ctx, [[9,16+bob],[13,10+bob],[13,19+bob]], FUR_D, OL, 1);
    rr(ctx, 2.2, 21 + bob, 8, 5.5, 2.5, MUZZLE, OL, 1);
    circle(ctx, 2.2, 23.5 + bob, 1.6, "#171512");
    circle(ctx, 7.5, 19.5 + bob, 1.2, EYE, OL, .6);
    rr(ctx, 11, 34 + step + bob, 4.2, 8, 2, FUR_D, OL, 1);
    rr(ctx, 17, 34 - step + bob, 4.2, 8, 2, FUR_D, OL, 1);
    rr(ctx, 23, 33 - step + bob, 4.2, 9, 2, FUR_D, OL, 1);
    line(ctx, 26, 27 + bob, 33, 20 + bob, OL, 5);
    line(ctx, 26, 27 + bob, 33, 20 + bob, FUR_D, 3);
  } else {
    const headY = up ? 17 : 18;
    rr(ctx, 10, 23 + bob, 16, 13, 6, FUR_D, OL, 1.7);
    rr(ctx, 11, 22 + bob, 14, 8, 4, FUR, null);
    circle(ctx, 18, headY + bob, 7, FUR, OL, 1.6);
    poly(ctx, [[12.5,14+bob],[11,7+bob],[16,13+bob]], FUR_D, OL, 1);
    poly(ctx, [[23.5,14+bob],[25,7+bob],[20,13+bob]], FUR_D, OL, 1);
    if (!up) {
      rr(ctx, 13, 18 + bob, 10, 6, 2.5, MUZZLE, OL, 1);
      circle(ctx, 18, 22 + bob, 1.6, "#171512");
      circle(ctx, 15.2, 16.3 + bob, 1.15, EYE, OL, .6);
      circle(ctx, 20.8, 16.3 + bob, 1.15, EYE, OL, .6);
    } else {
      rr(ctx, 12, 13 + bob, 12, 5, 2, FUR_H, null);
    }
    rr(ctx, 10.5, 34 + step + bob, 4.5, 8, 2, FUR_D, OL, 1);
    rr(ctx, 21, 34 - step + bob, 4.5, 8, 2, FUR_D, OL, 1);
    rr(ctx, 15.8, 35 - step + bob, 4.4, 7, 2, "#435347", OL, 1);
    line(ctx, 23, 29 + bob, 30, 25 + bob, OL, 5);
    line(ctx, 23, 29 + bob, 30, 25 + bob, FUR_D, 3);
  }
}

export function drawPilotHumanWarrior(canvas, dir = "down", frame = 0, hurt = false, pose = "idle") {
  if (!canvas) return;
  mirrorDraw(canvas, drawWarrior, dir, frame, hurt, pose);
}

export function drawPilotBren(canvas, dir = "down", frame = 0, hurt = false) {
  if (!canvas) return;
  mirrorDraw(canvas, drawBrenCore, dir, frame, hurt);
}

export function drawPilotWolf(canvas, dir = "down", frame = 0, hurt = false) {
  if (!canvas) return;
  mirrorDraw(canvas, drawWolfCore, dir, frame, hurt);
}
