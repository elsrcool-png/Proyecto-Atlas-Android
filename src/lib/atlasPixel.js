import React, { useRef, useEffect } from "react";
import { drawHeroSprite } from "@/lib/atlasHeroSprites";

export const PLAYER_PALETTES = {
  Guerrero: { o: "#1c1c28", h: "#5a3a1a", s: "#e8b796", p: "#8a8a9a", a: "#b33a3a", b: "#3a2a1a" },
  Mago:     { o: "#1c1c28", h: "#3a2a4a", s: "#e8b796", p: "#3a5a9a", a: "#9a7ac8", b: "#2a2a3a" },
  "Pícaro": { o: "#1c1c28", h: "#4a3a1a", s: "#e8b796", p: "#3a7a4a", a: "#6a5a3a", b: "#3a2a1a" },
};

const DECOR_PALETTES = {
  pine:     { o: "#16240f", t: "#2d6a27", t2: "#3a7d33", w: "#6a4a2a" },
  tree:     { o: "#16240f", t: "#3a8a3a", t2: "#4aa04a", w: "#6a4a2a" },
  rock:     { o: "#262626", g: "#6a6a6a", g2: "#7a7a7a", w: "#c8c8c8" },
  rockSnow: { o: "#2a3a4a", g: "#6a7a8a", g2: "#8a9aaa", w: "#e8eef4" },
  rockBone: { o: "#3a2a1a", g: "#b0a890", g2: "#c8c0a8", w: "#e8e8d8" },
  cactus:   { o: "#16321a", c: "#3a8a4a", c2: "#4aa05a", w: "#6a4a2a" },
  building: { o: "#241c10", w: "#a08a5a", r: "#7a5a3a", d: "#3a2a1a", k: "#caa040" },
  crystalC: { o: "#1c3a4a", c: "#7ad0e8", c2: "#a8e4f0" },
  crystalP: { o: "#3a1c4a", c: "#b07ad8", c2: "#d0a8f0" },
  bush: { o: "#0d2410", b: "#2d7a3a", b2: "#3a9a4a" },
  log: { w: "#6a4a2a", b: "#8a6a3a", o: "#3a2a1a" },
  stump: { w: "#6a4a2a", b: "#8a6a3a", o: "#3a2a1a" },
  tree2: { o: "#162c12", c: "#2f6a2a", C: "#45a040", l: "#7fce70", t: "#5a3a1a", T: "#7a5a3a" },
  mushroom: { o: "#1a1a1a", r: "#d23a3a", w: "#ffffff", t: "#e8d0a0" },
  deadtree: { b: "#5a3a1a", o: "#2a1a0a", t: "#3a2a1a" },
  campfire: { f: "#ff7a1a", F: "#ffd040", l: "#5a3a1a", o: "#2a1a0a" },
  cave: { g: "#6a5a4a", d: "#1a1a1a", o: "#2a1a0a" },
  ruins: { s: "#9a9a8a", o: "#3a3a3a" },
};
export const CHEST_PALETTE = { o: "#2a1a0a", w: "#8a5a2a", b: "#5a3a1a", l: "#c8b070", k: "#e8c040", g: "#f2d040" };

const PLAYER_FRAMES = {
  down: [
    [
      "....hhhh....", "....hsssh...", "...osssssso.", "...osssssso.", "...osssssso.",
      "...osssssso.", "....osssso..", "..opppppppo.", ".opppppppppo.", ".opppppppppo.",
      ".opppppppppo.", "..opppppo..", "..opp..ppo..", "..obb..bbo..", "...oo..oo...", "............",
    ],
    [
      "....hhhh....", "....hsssh...", "...osssssso.", "...osssssso.", "...osssssso.",
      "...osssssso.", "....osssso..", "..opppppppo.", ".opppppppppo.", ".opppppppppo.",
      ".opppppppppo.", "..opppppo..", "..op...pp...", "..ob...bb...", "...o....oo..", "............",
    ],
  ],
  up: [
    [
      "....hhhh....", "...hhhhhh...", "..ohhhhhho..", "..ohhhhhho..", "..ohhhhhho..",
      "..ohhhhhho..", "...ohhhho...", "..opppppppo.", ".opppppppppo.", ".opppppppppo.",
      ".opppppppppo.", "..opppppo..", "..opp..ppo..", "..obb..bbo..", "...oo..oo...", "............",
    ],
    [
      "....hhhh....", "...hhhhhh...", "..ohhhhhho..", "..ohhhhhho..", "..ohhhhhho..",
      "..ohhhhhho..", "...ohhhho...", "..opppppppo.", ".opppppppppo.", ".opppppppppo.",
      ".opppppppppo.", "..opppppo..", "..op...pp...", "..ob...bb...", "...o....oo..", "............",
    ],
  ],
  left: [
    [
      "...hhhh.....", "..ohhsh.....", "..ohssso....", "..ohsseo....", "..ohsso.....",
      "..ohhso.....", "...ohso.....", "..opppppo...", ".opppppppo..", ".opppppppo..",
      ".opppappo...", "..oppppo....", "..opp.ppo...", "..ob.bbo....", "...o.oo.....", "............",
    ],
    [
      "...hhhh.....", "..ohhsh.....", "..ohssso....", "..ohsseo....", "..ohsso.....",
      "..ohhso.....", "...ohso.....", "..opppppo...", ".opppppppo..", ".opppppppo..",
      ".opppappo...", "..oppppo....", "..op..ppo...", "..ob..bbo...", "...oo..o....", "............",
    ],
  ],
};

function mirror(grid) { return grid.map(row => row.split("").reverse().join("")); }

export function getPlayerFrame(dir, frame) {
  if (dir === "right") return mirror(PLAYER_FRAMES.left[frame]);
  return (PLAYER_FRAMES[dir] && PLAYER_FRAMES[dir][frame]) || PLAYER_FRAMES.down[frame];
}

const PINE = [
  ".....tt.....", "....tttt....", "...otttto...", "...tttttt...", "..ottttttto..",
  "..tttttttt..", ".otttttttto.", ".otttttttto.", "..otttttto..", "...ottto....",
  "....oooo....", "....wwww....", "....wwww....", "....wwww....",
];
const TREE = [
  "...ttt2t....", "..ottttto...", ".ottttttto..", ".ottttttto..", ".ott2tttto..",
  ".ottttttto..", "..ottttto...", "...ottto....", "....ooo.....", "....www.....",
  "....www.....", "....www.....",
];
const ROCK = [
  "....gg......", "..ogggggo...", ".ogggggggo..", "ogggggggggo.", "ogggwggggo.",
  ".oggggggo..", "..oggggo...", "...oooo.....",
];
const ROCKSNOW = [
  "....ww......", "..owwwwwo...", ".owwwggggo..", "ogggggggggo.", "ogggggggggo.",
  ".oggggggo..", "..oggggo...", "...oooo.....",
];
const CACTUS = [
  "....cc......", "....cc......", "....cc......", ".c..cc......", ".co.cc......",
  ".coocco.....", "..occo......", "..occo......", "..occo..c...", "..occo.coo..",
  "..occko.....", "..obbo......", "..obbo......", "....oo......",
];
const BUILDING = [
  "...rrrrrr...", "..rrrrrrrr..", ".rrrrrrrrrr.", ".wwwwwwwwww.", ".wkwwwwwwkw.",
  ".wwwwwwwwww.", ".wwwwwwwwww.", ".wkwwwwwwkw.", ".wwwwwdwwww.", ".wwwwwdwwww.",
  "...ddddd....", "...ooooo....",
];
const CRYSTAL = [
  "....cc......", "...occo.....", "..occco.....", ".occcco....", "occccco....",
  ".occcco....", "..occo.....", "...oo......",
];
const BONE = [
  "....gg......", "..ogggggo...", ".ogggggggo..", "ogggggggggo.", "ogggggggggo.",
  ".oggggggo..", "..oggggo...", "...oooo.....",
];
const BUSH = [
  "...bbbb...", "..obbbbo..", ".obbbbbo..", "obbbbbbbo.",
  "obbb2bbbo.", ".obbbbbbo.", "..oooo....",
];
const LOG = [
  "..wwwwww..", ".wbbbbbbo.", "wbbbbbbbo.", "wbbbbbbbo.",
  ".wbbbbbo..", "..oooo....",
];
const STUMP = [
  "...ww...", "..www...", ".wbbbw..", "wbbbbbw.",
  "wbbbbbw.", ".obbo...", "..oo....",
];
const SMALLROCK = [
  "....gg..", "..oggggo", ".oggwgo.", "oggggggo",
  ".oggggo.", "..ooo...",
];
const TREE2 = [
  "....cccc....", "..ccCCllcc..", ".cCCCCCCCCc.", ".cCClCCCCCc.",
  "cCCCCCCCCCCc", "cCClCCCCClcc", "cCCCCCCCCCCc", ".cCCCCCCCCc.",
  "..cCCCCCCc..", "...cCCCCc...", "....tTTt....", "....tTTt....",
  "....tttt....", "....oooo....",
];
const MUSHROOM = [
  "..rrr...", ".rrwrr..", "rrwwwrr.", "rrrrrrr.",
  "..ooo...", "..ttt...", "..ttt...", "..ttt...", "..ooo...",
];
const DEADTREE = [
  "...b..b...", "..bb.bb...", ".bbbbbbb..", ".bb.bb.b..",
  "bbbbbbbbbb", ".bbbbbbb..", "..b.b.b...", "...bbb....",
  "....t.....", "....t.....", "....t.....", "....o.....",
];
const CAMPFIRE = [
  "....f.....", "...fff....", "..fFfFf...", ".fFfffFf..",
  ".lllllll..", "..ll.ll...", ".lllllll..", "...oooo...",
];
const CAVE = [
  "....gggg....", "..gggggggg..", ".gggdddddgg.", "gggdddddddgg",
  "ggdddddddddg", "gdddddddddgg", "gddddddddgg.", ".gddddddgg..",
  "..ggggggg...", "....oooo....",
];
const RUINS = [
  "..ssss..", ".sssss..", "sssssss.", "s.s.s.s.", "sssssss.",
  "ss.s.ss.", "sssssss.", ".sssss..", "..sss...", "..ooo...",
];

export const DECOR_SPRITES = {
  treepine:   { grid: PINE, palette: DECOR_PALETTES.pine },
  trees:      { grid: TREE, palette: DECOR_PALETTES.tree },
  mountain:   { grid: ROCK, palette: DECOR_PALETTES.rock },
  mountainsnow: { grid: ROCKSNOW, palette: DECOR_PALETTES.rockSnow },
  snowflake:  { grid: CRYSTAL, palette: DECOR_PALETTES.crystalC },
  gem:        { grid: CRYSTAL, palette: DECOR_PALETTES.crystalP },
  cactus:     { grid: CACTUS, palette: DECOR_PALETTES.cactus },
  landmark:   { grid: BUILDING, palette: DECOR_PALETTES.building },
  bone:       { grid: BONE, palette: DECOR_PALETTES.rockBone },
  bush:       { grid: BUSH, palette: DECOR_PALETTES.bush },
  log:        { grid: LOG, palette: DECOR_PALETTES.log },
  stump:      { grid: STUMP, palette: DECOR_PALETTES.stump },
  smallrock:  { grid: SMALLROCK, palette: DECOR_PALETTES.rock },
  tree2:      { grid: TREE2, palette: DECOR_PALETTES.tree2 },
  mushroom:   { grid: MUSHROOM, palette: DECOR_PALETTES.mushroom },
  deadtree:   { grid: DEADTREE, palette: DECOR_PALETTES.deadtree },
  campfire:   { grid: CAMPFIRE, palette: DECOR_PALETTES.campfire },
  cave:       { grid: CAVE, palette: DECOR_PALETTES.cave },
  ruins:      { grid: RUINS, palette: DECOR_PALETTES.ruins },
};
export const getDecorSprite = (icon) => DECOR_SPRITES[icon] || null;

const CHEST_CLOSED = [
  "..............", ".wwwwwwwwwwww.", ".wlkkkkkkkklw.", ".wwwwwwwwwwww.",
  ".bbbbbbbbbbbb.", ".bbbbbbbbbbbb.", ".bbbbbbbbbbbb.", "..............",
];
const CHEST_OPEN = [
  "..............", ".w..wwwwwwww..", ".wlkkkkkkkw...", "..............",
  ".bbbbbbbbbbbb.", ".bggggggggbb.", ".bggggggggbb.", "..............",
];
export const CHEST_SPRITES = { closed: CHEST_CLOSED, open: CHEST_OPEN };
export const getChestPixel = (state) => CHEST_SPRITES[state] || CHEST_CLOSED;

export function drawGrid(ctx, grid, palette, x, y, scale) {
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === "." || ch === " ") continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
    }
  }
}

const CHIBI_PAL = {
  Guerrero: { skin:"#ecc098", skinS:"#cf9572", hair:"#7a4a22", hairS:"#4a2c14", cloth:"#9aa0b0", clothS:"#5a6070", accent:"#c04848", accentS:"#7a2020", boots:"#3a2a1a", eye:"#241a18", ol:"#2a2230", metal:"#e0e2f0", metalS:"#8a8e9e", wood:"#6a4a2a", glow:"#e8c040" },
  Mago:     { skin:"#ecc098", skinS:"#cf9572", hair:"#2c2c46", hairS:"#1a1a30", cloth:"#3a62a8", clothS:"#22406e", accent:"#9a7ac8", accentS:"#5a3a98", boots:"#26243a", eye:"#241a18", ol:"#1a1828", metal:"#caa040", wood:"#6a4a2a", glow:"#c8a0f0" },
  "Pícaro": { skin:"#ecc098", skinS:"#cf9572", hair:"#3a2a1a", hairS:"#1a1208", cloth:"#3a8a52", clothS:"#246038", accent:"#6a5230", accentS:"#42301c", boots:"#241808", eye:"#241a18", ol:"#1a2a1a", metal:"#e0e2f0", wood:"#5a3a1a", glow:"#7ad060" },
};
function shPx(hex, amt) { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; const a = c => Math.max(0, Math.min(255, Math.round(c + amt * 255))); return `rgb(${a(r)},${a(g)},${a(b)})`; }
function rrPath(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fillRR(ctx, x, y, w, h, r, fill) { ctx.fillStyle = fill; rrPath(ctx, x, y, w, h, r); ctx.fill(); }
function strokeRR(ctx, x, y, w, h, r, stroke, lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; rrPath(ctx, x, y, w, h, r); ctx.stroke(); }
function fillCir(ctx, cx, cy, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
function strokeCir(ctx, cx, cy, r, stroke, lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }

function drawFig(ctx, p, dir, frame, race = "Humano") {
  const bob = frame === 1 ? -1 : 0;
  ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.beginPath(); ctx.ellipse(18, 46, 11, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  const bootD = shPx(p.boots, -0.18);
  if (dir === "down" || dir === "up") {
    const lY = frame === 0 ? 37 : 39, rY = frame === 0 ? 39 : 37;
    fillRR(ctx, 12, lY + bob, 5, 8, 2, p.boots); fillRR(ctx, 19, rY + bob, 5, 8, 2, p.boots);
    ctx.fillStyle = bootD; ctx.fillRect(12, 43 + bob, 5, 2); ctx.fillRect(19, 43 + bob, 5, 2);
  } else {
    const lo = frame === 0 ? -1 : 1;
    fillRR(ctx, 14, 37 - lo + bob, 5, 9, 2, shPx(p.boots, -0.14)); fillRR(ctx, 17, 37 + lo + bob, 5, 9, 2, p.boots);
    ctx.fillStyle = bootD; ctx.fillRect(14, 44 + bob, 5, 2); ctx.fillRect(17, 44 + bob, 5, 2);
  }
  const bg = ctx.createLinearGradient(0, 22, 0, 40); bg.addColorStop(0, p.cloth); bg.addColorStop(1, p.clothS);
  const slim = race === "Elfo" ? 2 : 0, stocky = race === "Enano" ? 2 : 0;
  const bw = (dir === "left" ? 14 : 18) - slim + stocky, bx = dir === "left" ? 11 : 9;
  fillRR(ctx, bx, 22 + bob, bw, 16, 6, bg); strokeRR(ctx, bx, 22 + bob, bw, 16, 6, p.ol, 1.3);
  ctx.fillStyle = p.accent; ctx.fillRect(bx, 32 + bob, bw, 3); ctx.fillStyle = shPx(p.accent, -0.18); ctx.fillRect(bx, 35 + bob, bw, 1);
  ctx.fillStyle = bg;
  if (dir === "left") fillRR(ctx, 8, 25 + bob, 5, 10, 2);
  else { fillRR(ctx, 5, 25 + bob, 5, 11, 2); fillRR(ctx, 26, 25 + bob, 5, 11, 2); }
  ctx.fillStyle = p.skin;
  if (dir === "left") fillCir(ctx, 10, 35 + bob, 2.4);
  else { fillCir(ctx, 7.5, 36 + bob, 2.4); fillCir(ctx, 28.5, 36 + bob, 2.4); }
  const hg = ctx.createRadialGradient(16, 12 + bob, 2, 18, 15 + bob, 9); hg.addColorStop(0, p.skin); hg.addColorStop(1, p.skinS);
  fillCir(ctx, 18, 15 + bob, 9, hg); strokeCir(ctx, 18, 15 + bob, 9, p.ol, 1.3);
  if (race === "Elfo" && dir !== "up") {
    ctx.fillStyle = p.skinS;
    ctx.beginPath(); ctx.moveTo(9, 13 + bob); ctx.lineTo(3, 10 + bob); ctx.lineTo(9, 17 + bob); ctx.closePath(); ctx.fill();
    if (dir === "down") { ctx.beginPath(); ctx.moveTo(27, 13 + bob); ctx.lineTo(33, 10 + bob); ctx.lineTo(27, 17 + bob); ctx.closePath(); ctx.fill(); }
  }
  if (p === CHIBI_PAL.Guerrero) {
    ctx.fillStyle = p.hair; fillRR(ctx, 9, 7 + bob, 18, 6, 3); fillCir(ctx, 18, 11 + bob, 7, p.hair);
    ctx.fillStyle = p.hairS; fillRR(ctx, 9, 12 + bob, 18, 2, 1);
    if (dir !== "up") { ctx.fillStyle = p.hair; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(10 + i * 5, 8 + bob); ctx.lineTo(12 + i * 5, 4 + bob); ctx.lineTo(14 + i * 5, 8 + bob); ctx.closePath(); ctx.fill(); } }
  } else if (p === CHIBI_PAL.Mago) {
    ctx.fillStyle = p.hair; fillRR(ctx, 9, 9 + bob, 4, 16, 2); fillRR(ctx, 23, 9 + bob, 4, 16, 2); fillCir(ctx, 18, 12 + bob, 8, p.hair);
    ctx.fillStyle = p.clothS; ctx.beginPath(); ctx.moveTo(8, 12 + bob); ctx.lineTo(28, 12 + bob); ctx.lineTo(18, 1 + bob); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = p.ol; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = p.accent; fillCir(ctx, 18, 2 + bob, 2.2);
  } else {
    ctx.fillStyle = p.accent; fillCir(ctx, 18, 12 + bob, 8.5); fillRR(ctx, 9, 8 + bob, 18, 7, 3);
    ctx.fillStyle = p.accentS; fillRR(ctx, 9, 13 + bob, 18, 2, 1);
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.moveTo(15, 8 + bob); ctx.lineTo(18, 3 + bob); ctx.lineTo(21, 8 + bob); ctx.closePath(); ctx.fill();
  }
  if (dir === "down") {
    ctx.fillStyle = p.eye; ctx.fillRect(15, 15 + bob, 1.8, 2.2); ctx.fillRect(20, 15 + bob, 1.8, 2.2);
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(15.3, 15.3 + bob, 0.7, 0.7); ctx.fillRect(20.3, 15.3 + bob, 0.7, 0.7);
  } else if (dir === "left") { ctx.fillStyle = p.eye; ctx.fillRect(14, 15 + bob, 1.8, 2.2); }
  if (race === "Enano") {
    ctx.fillStyle = p.hair; ctx.beginPath(); ctx.ellipse(18, 20 + bob, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.hairS; ctx.beginPath(); ctx.ellipse(18, 22 + bob, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.hair; ctx.beginPath(); ctx.ellipse(18, 17 + bob, 6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  }
  const cls = p === CHIBI_PAL.Guerrero ? "G" : p === CHIBI_PAL.Mago ? "M" : "P";
  ctx.lineCap = "round";
  if (cls === "G") {
    if (dir === "left") {
      ctx.strokeStyle = p.metal; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, 32 + bob); ctx.lineTo(4, 18); ctx.stroke();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(9, 31 + bob); ctx.lineTo(4.5, 19); ctx.stroke();
      ctx.strokeStyle = p.metalS; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(8, 33 + bob); ctx.lineTo(12, 31 + bob); ctx.stroke();
    } else {
      ctx.strokeStyle = p.metal; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(28, 32 + bob); ctx.lineTo(34, 18); ctx.stroke();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(29, 31 + bob); ctx.lineTo(33.5, 19); ctx.stroke();
      ctx.strokeStyle = p.metalS; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(26, 33 + bob); ctx.lineTo(30, 31 + bob); ctx.stroke();
      fillCir(ctx, 8, 30 + bob, 4, p.metalS); strokeCir(ctx, 8, 30 + bob, 4, p.ol, 1); fillCir(ctx, 8, 30 + bob, 1.6, p.accent);
    }
  } else if (cls === "M") {
    const sx = dir === "left" ? 11 : 29;
    ctx.strokeStyle = p.wood; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, 45); ctx.lineTo(sx, 10); ctx.stroke();
    const og = ctx.createRadialGradient(sx, 8, 1, sx, 8, 5); og.addColorStop(0, p.glow); og.addColorStop(1, shPx(p.glow, -0.35));
    fillCir(ctx, sx, 8, 4.5, og); strokeCir(ctx, sx, 8, 4.5, p.ol, 1);
  } else {
    if (dir === "left") {
      ctx.strokeStyle = p.metal; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(10, 33 + bob); ctx.lineTo(5, 27); ctx.stroke();
      ctx.strokeStyle = p.wood; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(11, 34 + bob); ctx.lineTo(12, 37 + bob); ctx.stroke();
    } else {
      ctx.strokeStyle = p.metal; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(28, 33 + bob); ctx.lineTo(33, 27); ctx.stroke();
      ctx.strokeStyle = p.wood; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(27, 34 + bob); ctx.lineTo(26, 37 + bob); ctx.stroke();
    }
  }
}

export function drawPlayerSprite(canvas, cls, dir, frame, scale = 3, race = "Humano", pose = "idle") {
  if (!canvas) return;
  drawHeroSprite(canvas, race, cls, dir, frame, false, pose);
}

export function PixelSprite({ grid, palette, scale = 4, className = "", style }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const W = Math.max(...grid.map(r => r.length));
    cv.width = W * scale; cv.height = grid.length * scale;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = true;
    drawGrid(ctx, grid, palette, 0, 0, scale);
    const W2 = cv.width, H2 = cv.height;
    const hl = ctx.createRadialGradient(W2 * 0.4, H2 * 0.18, 2, W2 * 0.5, H2 * 0.4, W2 * 0.6);
    hl.addColorStop(0, "rgba(255,255,255,0.18)"); hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl; ctx.fillRect(0, 0, W2, H2);
  }, [grid, palette, scale]);
  return React.createElement("canvas", { ref, className, style: { imageRendering: "auto", ...style } });
}