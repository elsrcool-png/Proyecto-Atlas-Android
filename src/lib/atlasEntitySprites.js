// PROYECTO ATLAS — Motor único de sprites animados (chibi procedural, pixel art RPG).
import { drawPlayerSprite } from "@/lib/atlasPixel";
import { drawPilotBren, drawPilotWolf } from "@/lib/atlasPilotSprites";
import { drawGreenPanther, drawGreenFeralWarlock, drawGreenOrcAssassin, drawGreenOrcBrute, drawGreenOrcShaman, drawGreenGuardian } from "@/lib/atlasGreenEntitySprites";
import { drawGreenNpc, isGreenNpcVariant } from "@/lib/atlasGreenNpcSprites";
import { drawRegionalNpc, isRegionalNpcVariant } from "@/lib/atlasRegionalNpcSprites";
import { drawEnemyAssetSprite, hasEnemyAssetVisual } from "@/lib/atlasEnemyAssetSprites";

function shPx(hex, amt) {
  if (!hex || hex[0] !== "#") return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const a = c => Math.max(0, Math.min(255, Math.round(c + amt * 255)));
  return `rgb(${a(r)},${a(g)},${a(b)})`;
}
function rrPath(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function fillRR(ctx, x, y, w, h, r, fill) { ctx.fillStyle = fill; rrPath(ctx, x, y, w, h, r); ctx.fill(); }
function strokeRR(ctx, x, y, w, h, r, stroke, lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; rrPath(ctx, x, y, w, h, r); ctx.stroke(); }
function fillCir(ctx, cx, cy, r, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
function strokeCir(ctx, cx, cy, r, stroke, lw) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }

const orcoP = { skin: "#6a8a4a", skinS: "#4a6a2a", cloth: "#5a3a2a", clothS: "#3a2a1a", accent: "#8a5a2a", accentS: "#5a3a1a", boots: "#3a2a1a", eye: "#2a1a0a", ol: "#1a2a1a", hair: "#2a3a1a", hairS: "#1a2a0a" };
const skeleP = { skin: "#e8e4d8", skinS: "#c0bca8", cloth: "#3a3a4a", clothS: "#2a2a3a", accent: "#6a6a7a", accentS: "#4a4a5a", boots: "#2a2a2a", eye: "#000000", ol: "#1a1a1a", hair: "", hairS: "" };
const beastP = (fur) => ({ skin: fur, skinS: shPx(fur, -0.18), cloth: "#2a2a2a", clothS: "#1a1a1a", accent: "#3a2a1a", accentS: "#2a1a0a", boots: "#1a1a1a", eye: "#ffd040", ol: "#0a0a0a", hair: fur, hairS: shPx(fur, -0.2) });

export const MONSTER_DESIGNS = {
  orco_bruto: { P: orcoP, F: { tusks: true, big: true, weapon: "club" } },
  chaman_orco: { P: orcoP, F: { robe: true, weapon: "staff", glow: "#7ad060" } },
  asesino_orco: { P: orcoP, F: { hood: true, weapon: "dagger" } },
  lobo_salvaje: { P: { ...beastP("#59634d"), accent: "#8f9c78", accentS: "#3b4633", eye: "#f5d76e", ol: "#151a14" }, F: { ears: "wolf", fur: true, weapon: "none", tail: true, claws: true, muzzle: true, beastBody: true } },
  brujo_feral: { P: { skin: "#3a2a4a", skinS: "#2a1a3a", cloth: "#2a1a3a", clothS: "#1a0a2a", accent: "#6a3a8a", accentS: "#4a2a6a", boots: "#1a0a2a", eye: "#c084fc", ol: "#1a0a2a", hair: "", hairS: "" }, F: { robe: true, hood: true, weapon: "staff", glow: "#c084fc" } },
  pantera_sombria: { P: beastP("#2a2a2e"), F: { ears: "cat", fur: true, weapon: "none", tail: true, claws: true } },
  guerrero_esqueletico: { P: skeleP, F: { skeleton: true, weapon: "sword" } },
  necromante: { P: skeleP, F: { skeleton: true, robe: true, weapon: "staff", glow: "#60e0a0" } },
  asesino_esqueletico: { P: skeleP, F: { skeleton: true, hood: true, weapon: "dagger" } },
  _default: { P: orcoP, F: { tusks: true, weapon: "club" } },
};

export const BOSS_DESIGNS = {
  aurel_portador: { P: { skin: "#dbeaf0", skinS: "#9bb7c4", cloth: "#486b88", clothS: "#284b68", accent: "#8be7ff", accentS: "#3c8ba8", boots: "#263744", eye: "#d9fbff", ol: "#172833", hair: "#d9edf5", hairS: "#8faab6", glow: "#79e6ff" }, F: { big: true, crown: true, weapon: "sword", glow: "#79e6ff" } },
  amon_solar: { P: { skin: "#d9a365", skinS: "#a66a3d", cloth: "#9b512e", clothS: "#64301f", accent: "#ffd35a", accentS: "#b77822", boots: "#4a2c1d", eye: "#fff2b0", ol: "#382214", hair: "#5b2d1d", hairS: "#34170f", glow: "#ffb52e" }, F: { big: true, crown: true, weapon: "sword", glow: "#ffb52e" } },
  rey_orco: { P: { ...orcoP, accent: "#caa040", accentS: "#8a7a20" }, F: { tusks: true, big: true, crown: true, beard: true, weapon: "axe" } },
  dragon: { P: { skin: "#4a6a3a", skinS: "#2a4a1a", cloth: "#3a5a2a", clothS: "#2a3a1a", accent: "#6a8a4a", accentS: "#3a5a2a", boots: "#2a3a1a", eye: "#ff8a3a", ol: "#0a1a0a", hair: "", hairS: "" }, F: { horns: true, wings: true, tail: true, big: true, claws: true, glow: "#ff8a3a", weapon: "none" } },
  lich: { P: skeleP, F: { skeleton: true, robe: true, crown: true, weapon: "staff", glow: "#a060e0", big: true } },
  _default: { P: { ...orcoP, accent: "#caa040" }, F: { tusks: true, big: true, crown: true, weapon: "axe" } },
};

const civP = { skin: "#ecc098", skinS: "#cf9572", cloth: "#7a7a8a", clothS: "#5a5a6a", accent: "#9a6a3a", accentS: "#6a4a2a", boots: "#3a2a1a", eye: "#241a18", ol: "#2a2a30", hair: "#5a3a22", hairS: "#3a2212" };
export const VILLAGER_DESIGNS = {
  civilian: { P: civP, F: {} },
  guard: { P: { ...civP, cloth: "#4a5a7a", clothS: "#2a3a5a", accent: "#8a9aaa", accentS: "#5a6a7a" }, F: { hat: "helm", weapon: "sword" } },
  merchant: { P: { ...civP, cloth: "#8a6a3a", clothS: "#5a4a2a", accent: "#caa040", accentS: "#8a7a20" }, F: { hat: "cap" } },
  innkeeper: { P: { ...civP, cloth: "#7a4a3a", clothS: "#5a3a2a", accent: "#caa040", accentS: "#8a7a20" }, F: { beard: true, hat: "cap" } },
  traveler: { P: { ...civP, cloth: "#5a6a7a", clothS: "#3a4a5a", accent: "#8a9aaa", accentS: "#5a6a7a" }, F: { hat: "cap", weapon: "bow" } },
  explorer: { P: { ...civP, cloth: "#4a7a5a", clothS: "#2a5a3a", accent: "#8a6a3a", accentS: "#5a4a2a" }, F: { hat: "cap", weapon: "bow" } },
  artisan: { P: { ...civP, cloth: "#55483f", clothS: "#302823", accent: "#b56b38", accentS: "#713b22", hair: "#5b2f22", hairS: "#321914", ol: "#171412" }, F: { beard: true, weapon: "hammer", apron: true, smith: true } },
  child: { P: { ...civP, cloth: "#c08a4a", clothS: "#8a6a3a", accent: "#6a9a4a", accentS: "#4a7a2a" }, F: { small: true } },
};

export const STRANGER_DESIGN = { P: { skin: "#cf9572", skinS: "#a87556", cloth: "#2a2a3a", clothS: "#1a1a2a", accent: "#6a3a8a", accentS: "#4a2a6a", boots: "#1a1a2a", eye: "#e9d5ff", ol: "#1a1a2a", hair: "", hairS: "" }, F: { hood: true, robe: true, weapon: "none", glow: "#e9d5ff" } };

function buildNpc(regionId, key) {
  const rc = { verde: { cloth: "#5a7a3a", clothS: "#3a5a2a", accent: "#8a5a2a", accentS: "#5a3a1a" }, fria: { cloth: "#4a6a8a", clothS: "#2a4a6a", accent: "#6a8aaa", accentS: "#3a5a7a" }, desierto: { cloth: "#b08a4a", clothS: "#8a6a3a", accent: "#caa040", accentS: "#8a6a2a" } }[regionId] || { cloth: "#5a7a3a", clothS: "#3a5a2a", accent: "#8a5a2a", accentS: "#5a3a1a" };
  const P = { skin: "#ecc098", skinS: "#cf9572", ...rc, boots: "#3a2a1a", eye: "#241a18", ol: "#2a2230", hair: "#5a3a22", hairS: "#3a2212" };
  const role = { campamento: { hat: "cap", weapon: "bow" }, pueblo: { beard: true, hat: "cap", weapon: "none" }, ciudad: { hat: "noble", weapon: "sword" } }[key] || {};
  return { P, F: role };
}

export function getDesign(type, variant) {
  if (type === "monster") return MONSTER_DESIGNS[variant] || MONSTER_DESIGNS._default;
  if (type === "boss") return BOSS_DESIGNS[variant] || BOSS_DESIGNS._default;
  if (type === "npc") { const [r, k] = (variant || "_").split("_"); return buildNpc(r, k); }
  if (type === "villager") return VILLAGER_DESIGNS[variant] || VILLAGER_DESIGNS.civilian;
  if (type === "stranger") return STRANGER_DESIGN;
  return MONSTER_DESIGNS._default;
}

function drawWeapon(ctx, w, dir, bob, P) {
  if (!w || w === "none") return;
  ctx.lineCap = "round";
  const left = dir === "left";
  const sx = left ? 10 : 28;
  if (w === "sword") {
    ctx.strokeStyle = "#e0e2f0"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, 33 + bob); ctx.lineTo(left ? 4 : 34, 20); ctx.stroke();
    ctx.strokeStyle = "#8a8e9e"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(left ? 9 : 27, 34 + bob); ctx.lineTo(left ? 13 : 31, 34 + bob); ctx.stroke();
  } else if (w === "dagger") {
    ctx.strokeStyle = "#e0e2f0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, 34 + bob); ctx.lineTo(left ? 6 : 32, 26); ctx.stroke();
  } else if (w === "club") {
    ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, 36 + bob); ctx.lineTo(left ? 5 : 33, 22); ctx.stroke();
    fillCir(ctx, left ? 5 : 33, 21, 3.5, "#8a6a4a");
  } else if (w === "staff") {
    ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, 45); ctx.lineTo(sx, 10); ctx.stroke();
    const g = P.glow || "#caa040";
    const og = ctx.createRadialGradient(sx, 8, 1, sx, 8, 5); og.addColorStop(0, g); og.addColorStop(1, shPx(g, -0.35));
    fillCir(ctx, sx, 8, 4, og); strokeCir(ctx, sx, 8, 4, P.ol, 1);
  } else if (w === "axe") {
    ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, 45); ctx.lineTo(sx, 12); ctx.stroke();
    ctx.fillStyle = "#c0c4d0"; ctx.beginPath(); ctx.moveTo(sx, 12); ctx.lineTo(left ? sx - 8 : sx + 8, 10); ctx.lineTo(left ? sx - 6 : sx + 6, 20); ctx.lineTo(sx, 18); ctx.closePath(); ctx.fill();
  } else if (w === "bow") {
    ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(left ? 6 : 30, 30 + bob, 9, -1.2, 1.2); ctx.stroke();
  } else if (w === "hammer") {
    ctx.strokeStyle = "#6a4a2a"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, 40 + bob); ctx.lineTo(left ? 6 : 32, 30); ctx.stroke();
    ctx.fillStyle = "#8a8e9e"; rrPath(ctx, left ? 2 : 30, 26, 8, 6, 1); ctx.fill();
  }
}

function drawChibi(ctx, P, F, dir, frame, hurt) {
  const bob = frame === 1 ? -1 : 0;
  ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.beginPath(); ctx.ellipse(18, 46, 11, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  const S = F.big ? 1.12 : F.small ? 0.82 : 1, oy = F.big ? -2 : F.small ? 4 : 0;
  ctx.save(); ctx.translate(0, oy); ctx.scale(S, S);

  const bootD = shPx(P.boots, -0.18);
  if (dir === "down" || dir === "up") {
    const lY = frame === 0 ? 37 : 39, rY = frame === 0 ? 39 : 37;
    fillRR(ctx, 12, lY + bob, 5, 8, 2, P.boots); fillRR(ctx, 19, rY + bob, 5, 8, 2, P.boots);
    ctx.fillStyle = bootD; ctx.fillRect(12, 43 + bob, 5, 2); ctx.fillRect(19, 43 + bob, 5, 2);
  } else {
    const lo = frame === 0 ? -1 : 1;
    fillRR(ctx, 14, 37 - lo + bob, 5, 9, 2, shPx(P.boots, -0.14)); fillRR(ctx, 17, 37 + lo + bob, 5, 9, 2, P.boots);
    ctx.fillStyle = bootD; ctx.fillRect(14, 44 + bob, 5, 2); ctx.fillRect(17, 44 + bob, 5, 2);
  }
  if (F.claws) { ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 0.8; for (const fx of [13, 21]) { ctx.beginPath(); ctx.moveTo(fx, 45 + bob); ctx.lineTo(fx, 47 + bob); ctx.moveTo(fx + 2, 45 + bob); ctx.lineTo(fx + 2, 47 + bob); ctx.stroke(); } }

  const bw = dir === "left" ? 14 : 18, bx = dir === "left" ? 11 : 9;
  if (F.robe) {
    const rg = ctx.createLinearGradient(0, 22, 0, 44); rg.addColorStop(0, P.cloth); rg.addColorStop(1, P.clothS);
    ctx.beginPath(); ctx.moveTo(bx, 24 + bob); ctx.lineTo(bx + bw, 24 + bob); ctx.lineTo(bx + bw + 3, 44 + bob); ctx.lineTo(bx - 3, 44 + bob); ctx.closePath();
    ctx.fillStyle = rg; ctx.fill(); strokeRR(ctx, bx, 22 + bob, bw, 16, 6, P.ol, 1.3);
  } else {
    const bg = ctx.createLinearGradient(0, 22, 0, 40); bg.addColorStop(0, P.cloth); bg.addColorStop(1, P.clothS);
    fillRR(ctx, bx, 22 + bob, bw, 16, 6, bg); strokeRR(ctx, bx, 22 + bob, bw, 16, 6, P.ol, 1.3);
    ctx.fillStyle = P.accent; ctx.fillRect(bx, 32 + bob, bw, 3); ctx.fillStyle = shPx(P.accent, -0.18); ctx.fillRect(bx, 35 + bob, bw, 1);
    if (F.apron) {
      ctx.fillStyle = "#7d4b2f";
      fillRR(ctx, bx + 3, 25 + bob, Math.max(7, bw - 6), 13, 2, "#7d4b2f");
      ctx.fillStyle = "#c78a52"; ctx.fillRect(bx + 4, 27 + bob, Math.max(5, bw - 8), 1);
      ctx.fillStyle = "#3d2b22"; ctx.fillRect(bx + 5, 34 + bob, Math.max(3, bw - 10), 2);
    }
  }
  if (F.skeleton) { ctx.strokeStyle = P.ol; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx + 2, 24 + bob); ctx.lineTo(bx + bw - 2, 24 + bob); ctx.moveTo(bx + bw / 2, 24 + bob); ctx.lineTo(bx + bw / 2, 36 + bob); ctx.stroke(); }

  ctx.fillStyle = F.robe ? P.clothS : P.cloth;
  if (dir === "left") fillRR(ctx, 8, 25 + bob, 5, 10, 2);
  else { fillRR(ctx, 5, 25 + bob, 5, 11, 2); fillRR(ctx, 26, 25 + bob, 5, 11, 2); }
  ctx.fillStyle = P.skin;
  if (dir === "left") fillCir(ctx, 10, 35 + bob, 2.4);
  else { fillCir(ctx, 7.5, 36 + bob, 2.4); fillCir(ctx, 28.5, 36 + bob, 2.4); }

  const hg = ctx.createRadialGradient(16, 12 + bob, 2, 18, 15 + bob, 9); hg.addColorStop(0, P.skin); hg.addColorStop(1, P.skinS);
  fillCir(ctx, 18, 15 + bob, 9, hg); strokeCir(ctx, 18, 15 + bob, 9, P.ol, 1.3);

  if (F.ears === "wolf" || F.ears === "cat") {
    ctx.fillStyle = P.skinS;
    ctx.beginPath(); ctx.moveTo(10, 9 + bob); ctx.lineTo(7, 3 + bob); ctx.lineTo(13, 8 + bob); ctx.closePath(); ctx.fill();
    if (dir !== "left") { ctx.beginPath(); ctx.moveTo(26, 9 + bob); ctx.lineTo(29, 3 + bob); ctx.lineTo(23, 8 + bob); ctx.closePath(); ctx.fill(); }
  } else if (F.ears === "elf" && dir !== "up") {
    ctx.fillStyle = P.skinS;
    ctx.beginPath(); ctx.moveTo(9, 13 + bob); ctx.lineTo(3, 10 + bob); ctx.lineTo(9, 17 + bob); ctx.closePath(); ctx.fill();
    if (dir === "down") { ctx.beginPath(); ctx.moveTo(27, 13 + bob); ctx.lineTo(33, 10 + bob); ctx.lineTo(27, 17 + bob); ctx.closePath(); ctx.fill(); }
  }
  if (F.horns) {
    ctx.fillStyle = "#d8d0c0";
    ctx.beginPath(); ctx.moveTo(12, 8 + bob); ctx.lineTo(8, 1 + bob); ctx.lineTo(14, 7 + bob); ctx.closePath(); ctx.fill();
    if (dir !== "left") { ctx.beginPath(); ctx.moveTo(24, 8 + bob); ctx.lineTo(28, 1 + bob); ctx.lineTo(22, 7 + bob); ctx.closePath(); ctx.fill(); }
  }

  if (F.hood) {
    fillCir(ctx, 18, 14 + bob, 10, P.clothS); strokeCir(ctx, 18, 14 + bob, 10, P.ol, 1.3);
    ctx.fillStyle = P.skin; fillRR(ctx, 14, 14 + bob, 8, 5, 2);
  } else if (F.hat === "cap") {
    ctx.fillStyle = P.cloth; fillRR(ctx, 9, 8 + bob, 18, 5, 3); fillCir(ctx, 18, 11 + bob, 7, P.cloth);
    ctx.fillStyle = shPx(P.cloth, -0.2); fillRR(ctx, 9, 12 + bob, 18, 2, 1);
  } else if (F.hat === "noble") {
    ctx.fillStyle = P.accent; fillRR(ctx, 10, 8 + bob, 16, 4, 2); fillCir(ctx, 18, 11 + bob, 6, P.accent);
    ctx.fillStyle = P.accentS; fillRR(ctx, 10, 11 + bob, 16, 2, 1);
  } else if (F.hat === "helm") {
    fillCir(ctx, 18, 12 + bob, 8, "#b0b4c0"); strokeCir(ctx, 18, 12 + bob, 8, P.ol, 1.3);
    ctx.fillStyle = "#8a8e9e"; fillRR(ctx, 16, 12 + bob, 4, 6, 1);
  } else if (F.crown) {
    ctx.fillStyle = "#f0c040"; ctx.beginPath();
    ctx.moveTo(11, 8 + bob); ctx.lineTo(11, 5 + bob); ctx.lineTo(14, 7 + bob); ctx.lineTo(18, 3 + bob); ctx.lineTo(22, 7 + bob); ctx.lineTo(25, 5 + bob); ctx.lineTo(25, 8 + bob); ctx.closePath(); ctx.fill();
  } else if (P.hair) {
    ctx.fillStyle = P.hair; fillRR(ctx, 10, 8 + bob, 16, 5, 3); fillCir(ctx, 18, 11 + bob, 7, P.hair);
    ctx.fillStyle = P.hairS; fillRR(ctx, 10, 12 + bob, 16, 2, 1);
  }

  if (F.glow) {
    ctx.fillStyle = F.glow; ctx.shadowColor = F.glow; ctx.shadowBlur = 4;
    if (dir === "left") ctx.fillRect(13, 15 + bob, 2, 2);
    else { ctx.fillRect(15, 15 + bob, 2, 2); ctx.fillRect(20, 15 + bob, 2, 2); }
    ctx.shadowBlur = 0;
  } else if (F.skeleton) {
    fillCir(ctx, 16, 15 + bob, 1.8, "#000"); fillCir(ctx, 20, 15 + bob, 1.8, "#000");
  } else if (dir === "down") {
    ctx.fillStyle = P.eye; ctx.fillRect(15, 15 + bob, 1.8, 2.2); ctx.fillRect(20, 15 + bob, 1.8, 2.2);
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(15.3, 15.3 + bob, 0.7, 0.7); ctx.fillRect(20.3, 15.3 + bob, 0.7, 0.7);
  } else if (dir === "left") { ctx.fillStyle = P.eye; ctx.fillRect(14, 15 + bob, 1.8, 2.2); }

  if (F.muzzle && dir !== "up") {
    ctx.fillStyle = shPx(P.skin, 0.12); fillRR(ctx, dir === "left" ? 10 : 13, 18 + bob, dir === "left" ? 8 : 10, 5, 2);
    ctx.fillStyle = "#171412"; fillCir(ctx, dir === "left" ? 10 : 18, 20 + bob, 1.4);
  }
  if (F.beastBody) {
    ctx.strokeStyle = P.accentS; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(12, 27 + bob); ctx.lineTo(24, 27 + bob); ctx.stroke();
  }
  if (F.tusks) { ctx.fillStyle = "#ffffff"; ctx.fillRect(16, 18 + bob, 1.4, 3); ctx.fillRect(19, 18 + bob, 1.4, 3); }
  if (F.beard) { ctx.fillStyle = P.hair || "#6a4a2a"; ctx.beginPath(); ctx.ellipse(18, 20 + bob, 7, 5, 0, 0, Math.PI * 2); ctx.fill(); }

  if (F.wings) {
    ctx.fillStyle = P.skinS;
    ctx.beginPath(); ctx.moveTo(9, 24 + bob); ctx.lineTo(2, 18 + bob); ctx.lineTo(4, 30 + bob); ctx.closePath(); ctx.fill();
    if (dir !== "left") { ctx.beginPath(); ctx.moveTo(27, 24 + bob); ctx.lineTo(34, 18 + bob); ctx.lineTo(32, 30 + bob); ctx.closePath(); ctx.fill(); }
  }
  if (F.tail) { ctx.strokeStyle = P.skinS; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, 42 + bob); ctx.quadraticCurveTo(26, 46 + bob, 28, 40 + bob); ctx.stroke(); }

  drawWeapon(ctx, F.weapon, dir, bob, P);

  ctx.restore();

  if (hurt) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(220,40,40,0.45)";
    ctx.fillRect(0, 0, 36, 48);
    ctx.globalCompositeOperation = "source-over";
  }
}

export function drawEntity(canvas, opts) {
  if (!canvas) return;
  const { type, variant, race, cls, dir = "down", frame = 0, hurt = false, pose = "idle" } = opts;
  if (type === "player") {
    drawPlayerSprite(canvas, cls, dir, frame, 3, race, pose);
    if (hurt) {
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "rgba(220,40,40,0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
    }
    return;
  }
  if ((type === "monster" || type === "boss") && hasEnemyAssetVisual(type, variant)) {
    const painted = drawEnemyAssetSprite(canvas, type, variant, dir, frame, hurt);
    if (painted) return;
  }
  if (isGreenNpcVariant(variant)) {
    drawGreenNpc(canvas, variant, dir, frame, hurt);
    return;
  }
  if (isRegionalNpcVariant(variant)) {
    drawRegionalNpc(canvas, variant, dir, frame, hurt);
    return;
  }
  if (type === "villager" && variant === "bren_smith") {
    drawPilotBren(canvas, dir, frame, hurt);
    return;
  }
  if (type === "monster" && variant === "lobo_salvaje") {
    drawPilotWolf(canvas, dir, frame, hurt);
    return;
  }
  if (type === "monster" && variant === "pantera_sombria") {
    drawGreenPanther(canvas, dir, frame, hurt);
    return;
  }
  if (type === "monster" && variant === "brujo_feral") {
    drawGreenFeralWarlock(canvas, dir, frame, hurt);
    return;
  }
  if (type === "monster" && variant === "asesino_orco") {
    drawGreenOrcAssassin(canvas, dir, frame, hurt);
    return;
  }
  if (type === "monster" && variant === "orco_bruto") {
    drawGreenOrcBrute(canvas, dir, frame, hurt);
    return;
  }
  if (type === "monster" && variant === "chaman_orco") {
    drawGreenOrcShaman(canvas, dir, frame, hurt);
    return;
  }
  if (type === "boss" && variant === "guardian_verde") {
    drawGreenGuardian(canvas, dir, frame, hurt);
    return;
  }
  canvas.width = 36; canvas.height = 48;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 36, 48);
  const { P, F } = getDesign(type, variant);
  if (dir === "right") { ctx.save(); ctx.translate(36, 0); ctx.scale(-1, 1); drawChibi(ctx, P, F, "left", frame, hurt); ctx.restore(); return; }
  drawChibi(ctx, P, F, dir, frame, hurt);
}