// PROYECTO ATLAS — NPCs nombrados de la Región Verde v2.5.
// Sprites procedurales 36×48 con identidad por personaje y accesorios legibles.

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
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function poly(ctx, pts, fill, stroke = null, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function line(ctx, x1, y1, x2, y2, color, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.stroke();
}

function shadow(ctx, wide = 11) {
  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath();
  ctx.ellipse(18, 45, wide, 3.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

const COMMON = Object.freeze({
  skin: "#dfaa7f",
  skinDark: "#b77455",
  outline: "#171714",
  boot: "#2a2119",
  metal: "#aab3ba",
  metalDark: "#5f6870",
  leather: "#69452b",
  leatherDark: "#3d2a1d",
  gold: "#d0a54d",
  white: "#e6dec8",
});

function profile(name, role, options) {
  return Object.freeze({ name, role, ...options });
}

export const GREEN_NPC_PROFILES = Object.freeze({
  verde_roland: profile("Capitán Roland", "capitán", { body: "broad", coat: "#345b49", coatDark: "#203d32", accent: "#b7463f", hair: "#473022", beard: "trim", hat: "captain", accessory: "spearShield", cape: true }),
  verde_elia: profile("Elia", "herbolaria", { body: "slim", coat: "#496a42", coatDark: "#2c4630", accent: "#c99b45", hair: "#7a4d2c", hairStyle: "braid", hat: "hood", accessory: "herbBasket", female: true }),
  verde_cedric: profile("Cedric", "explorador", { body: "slim", coat: "#355c46", coatDark: "#213d30", accent: "#9b6c36", hair: "#553723", hat: "hood", accessory: "bowCompass", backpack: true }),
  verde_bryn: profile("Mercader Bryn", "mercader", { body: "round", coat: "#8b6738", coatDark: "#5b4327", accent: "#d3aa4f", hair: "#4a3020", hat: "merchant", accessory: "ledgerBag", backpack: true }),
  verde_refuge_keeper: profile("Guardián del refugio", "custodio", { body: "old", coat: "#5b4938", coatDark: "#392d23", accent: "#d39d52", hair: "#b9aa91", beard: "long", hat: "cap", accessory: "lantern" }),
  verde_kael_villager: profile("Aldeano Kael", "aldeano", { coat: "#5c7047", coatDark: "#3d4b31", accent: "#8d6b3d", hair: "#3e2a1f", accessory: "woodAxe" }),
  verde_darian: profile("Darian", "superviviente", { body: "slim", coat: "#52616b", coatDark: "#323e46", accent: "#9b7140", hair: "#473426", hat: "tornHood", accessory: "bandagePack", backpack: true }),

  verde_tomas: profile("Alcalde Tomás", "alcalde", { body: "round", coat: "#6d4f3f", coatDark: "#463329", accent: "#d0a54d", hair: "#70462b", beard: "mustache", hat: "mayor", accessory: "bookMedallion" }),
  verde_aldric: profile("Mercader Aldric", "mercader", { coat: "#4e6670", coatDark: "#30444d", accent: "#d0a54d", hair: "#2f281f", hat: "merchant", accessory: "ledgerBag", backpack: true }),
  verde_oleg: profile("Posadero Oleg", "posadero", { body: "round", coat: "#7b4936", coatDark: "#4b2f25", accent: "#d4a754", hair: "#5a3522", beard: "full", accessory: "mugApron", apron: true }),
  verde_orin: profile("Forjador Orin", "forjador", { body: "broad", coat: "#4d4b46", coatDark: "#2f2e2b", accent: "#a85432", hair: "#817160", beard: "full", accessory: "tongsHammer", apron: true }),
  verde_ira: profile("Aldeana Ira", "aldeana", { body: "slim", coat: "#7c4a42", coatDark: "#50312d", accent: "#829f5b", hair: "#38261d", hairStyle: "long", accessory: "flowerBasket", female: true }),
  verde_inn_traveler: profile("Viajero Inn", "viajero", { body: "slim", coat: "#465b74", coatDark: "#2d3a4a", accent: "#a17b42", hair: "#4b3425", hat: "hood", accessory: "walkingStaff", backpack: true }),
  verde_cartographer: profile("El Cartógrafo", "cartógrafo", { body: "old", coat: "#4e5d4a", coatDark: "#303b2e", accent: "#d1a84f", hair: "#d6c7a8", beard: "long", hat: "scholar", accessory: "scrollStaff" }),

  verde_royal_captain: profile("Capitán Real", "comandante", { body: "broad", coat: "#41596b", coatDark: "#293b48", accent: "#2f734c", hair: "#48301f", hat: "royalHelm", accessory: "swordShield", cape: true }),
  verde_senn: profile("Mercader Real Senn", "mercader real", { body: "round", coat: "#65507c", coatDark: "#413452", accent: "#d2aa51", hair: "#3f2c24", hat: "noble", accessory: "ledgerBag" }),
  verde_senna: profile("Hostelera Senna", "hostelera", { body: "slim", coat: "#5f5c72", coatDark: "#3d3a4b", accent: "#d0a55a", hair: "#663c2c", hairStyle: "bun", accessory: "keysApron", apron: true, female: true }),
  verde_brun: profile("Herrero Brun", "herrero real", { body: "broad", coat: "#3e4b50", coatDark: "#273135", accent: "#b15f36", hair: "#4b3328", beard: "full", accessory: "royalHammer", apron: true }),
  verde_rurik: profile("Guardia Rurik", "guardia", { body: "broad", coat: "#405b51", coatDark: "#263a33", accent: "#98a9a4", hair: "#432e21", hat: "guardHelm", accessory: "spearShield" }),

  verde_dungeon_bren: profile("Bren el Explorador", "guardián de dungeon", { body: "slim", coat: "#415c48", coatDark: "#293b31", accent: "#9a6e3c", hair: "#3a2b22", hat: "hood", accessory: "torchSpear", backpack: true }),
  verde_vera_hunter: profile("Vera la Cazadora", "cazadora", { body: "slim", coat: "#384f3b", coatDark: "#243426", accent: "#a96e3e", hair: "#6d4029", hairStyle: "braid", hat: "hood", accessory: "bowKnife", female: true }),
  verde_roland_vigilante: profile("Roland el Vigilante", "vigilante", { body: "broad", coat: "#354c40", coatDark: "#24352c", accent: "#b04d40", hair: "#4a3122", beard: "trim", hat: "guardHelm", accessory: "spearShield", cape: true }),

  verde_ambient_traveler: profile("Viajero verde", "viajero", { coat: "#4f6470", coatDark: "#34434b", accent: "#9c7542", hair: "#4c3425", hat: "hood", accessory: "walkingStaff", backpack: true }),
  verde_ambient_hunter: profile("Cazador verde", "cazador", { coat: "#3f5d43", coatDark: "#2a3e2e", accent: "#99663b", hair: "#4a3020", hat: "hood", accessory: "bowKnife", backpack: true }),
  verde_ambient_caravan: profile("Caravanero verde", "caravanero", { body: "round", coat: "#7a5c37", coatDark: "#4d3d27", accent: "#d0a54d", hair: "#563724", hat: "merchant", accessory: "ledgerBag", backpack: true }),
});

export const GREEN_NPC_VARIANTS = Object.freeze(new Set(Object.keys(GREEN_NPC_PROFILES)));

function drawHat(ctx, p, dir, bob) {
  const OL = COMMON.outline;
  const side = dir === "left";
  switch (p.hat) {
    case "hood":
    case "tornHood":
      // Capucha abierta: marco oscuro alrededor del rostro, no una máscara plana.
      rr(ctx, 9, 5.5 + bob, 18, 7, 3.5, p.coatDark, OL, 1.2);
      poly(ctx, [[9,10+bob],[12,9+bob],[12,20+bob],[9.5,18+bob]], p.coatDark, OL, .8);
      poly(ctx, [[27,10+bob],[24,9+bob],[24,20+bob],[26.5,18+bob]], p.coatDark, OL, .8);
      if (p.hat === "tornHood") line(ctx, 23, 7 + bob, 27, 5 + bob, p.accent, 1.2);
      break;
    case "captain":
      rr(ctx, 9.5, 6 + bob, 17, 6, 3, p.coatDark, OL, 1.2);
      rr(ctx, 11, 4.5 + bob, 14, 3.5, 1.5, p.accent, OL, .8);
      line(ctx, 18, 4.5 + bob, 18, 1 + bob, COMMON.gold, 1.5);
      break;
    case "merchant":
      rr(ctx, 9.5, 6 + bob, 17, 6.5, 3.5, p.coatDark, OL, 1.2);
      line(ctx, 10, 11 + bob, 27, 11 + bob, p.accent, 1.2);
      break;
    case "cap":
      rr(ctx, 9.5, 6.5 + bob, 17, 5.5, 3, p.coatDark, OL, 1.1);
      rr(ctx, side ? 8 : 11, 10 + bob, 12, 2, 1, p.accent, null);
      break;
    case "mayor":
      rr(ctx, 9.5, 6 + bob, 17, 6, 3, p.coatDark, OL, 1.1);
      poly(ctx, [[13,6+bob],[18,2+bob],[23,6+bob]], p.accent, OL, .8);
      break;
    case "scholar":
      rr(ctx, 9, 5.5 + bob, 18, 6, 3, "#5c4d37", OL, 1.1);
      rr(ctx, 7, 10 + bob, 22, 2.5, 1.2, COMMON.gold, OL, .7);
      break;
    case "royalHelm":
    case "guardHelm":
      rr(ctx, 9.5, 5.5 + bob, 17, 9, 4, COMMON.metalDark, OL, 1.3);
      rr(ctx, 11, 6 + bob, 14, 5, 2.5, COMMON.metal, null);
      line(ctx, 18, 5 + bob, 18, 1 + bob, p.hat === "royalHelm" ? p.accent : "#6c7f78", 2);
      break;
    case "noble":
      rr(ctx, 10, 6 + bob, 16, 6, 3, p.coatDark, OL, 1.1);
      circle(ctx, 18, 5.5 + bob, 2.2, COMMON.gold, OL, .6);
      break;
    default:
      break;
  }
}

function drawHair(ctx, p, dir, bob) {
  if (p.hat === "hood" || p.hat === "tornHood" || p.hat === "royalHelm" || p.hat === "guardHelm") return;
  const OL = COMMON.outline;
  const hair = p.hair || "#4c3323";
  if (dir === "up") {
    circle(ctx, 18, 12 + bob, 8.2, hair, OL, 1);
    return;
  }
  if (p.hairStyle === "long") {
    rr(ctx, 9.5, 6 + bob, 17, 15, 5, hair, OL, 1.1);
  } else if (p.hairStyle === "braid") {
    rr(ctx, 9.5, 6 + bob, 17, 7, 3.5, hair, OL, 1.1);
    circle(ctx, 24.5, 20 + bob, 2, hair, OL, .7);
    circle(ctx, 25, 23 + bob, 1.6, hair, OL, .7);
  } else if (p.hairStyle === "bun") {
    rr(ctx, 9.5, 6 + bob, 17, 7, 3.5, hair, OL, 1.1);
    circle(ctx, 25, 7 + bob, 3.1, hair, OL, 1);
  } else {
    rr(ctx, 9.5, 6 + bob, 17, 7, 3.5, hair, OL, 1.1);
  }
}

function drawFace(ctx, p, dir, bob) {
  if (dir === "up") return;
  const side = dir === "left";
  const eye = "#211916";
  if (side) {
    rr(ctx, 13.5, 14 + bob, 2, 2.5, .7, eye);
    rr(ctx, 13.9, 14.2 + bob, .7, .7, .3, "#fff");
  } else {
    rr(ctx, 13.4, 14 + bob, 2, 2.5, .7, eye);
    rr(ctx, 20.6, 14 + bob, 2, 2.5, .7, eye);
    rr(ctx, 13.8, 14.2 + bob, .7, .7, .3, "#fff");
    rr(ctx, 21, 14.2 + bob, .7, .7, .3, "#fff");
  }
  if (p.beard === "mustache") {
    line(ctx, 15, 19 + bob, 18, 18 + bob, p.hair || "#4b3020", 1.4);
    line(ctx, 18, 18 + bob, 21, 19 + bob, p.hair || "#4b3020", 1.4);
  } else if (p.beard === "trim") {
    rr(ctx, 12, 18 + bob, 12, 4, 2, p.hair || "#4b3020", null);
  } else if (p.beard === "full") {
    rr(ctx, 10.8, 17 + bob, 14.4, 7, 3.5, p.hair || "#4b3020", COMMON.outline, .8);
  } else if (p.beard === "long") {
    rr(ctx, 10.5, 17 + bob, 15, 7, 3.5, p.hair || "#b9aa91", COMMON.outline, .8);
    poly(ctx, [[12,22+bob],[18,28+bob],[24,22+bob]], p.hair || "#b9aa91", COMMON.outline, .7);
  }
}

function drawAccessory(ctx, p, dir, bob) {
  const side = dir === "left";
  const handX = side ? 8 : 29;
  const outerX = side ? 2 : 34;
  const OL = COMMON.outline;
  const a = p.accessory;

  if (a === "spearShield" || a === "swordShield") {
    circle(ctx, side ? 28 : 7, 30 + bob, 5.2, p.coatDark, OL, 1.3);
    circle(ctx, side ? 28 : 7, 30 + bob, 3.5, p.accent, COMMON.gold, .8);
  }
  if (a === "spearShield" || a === "torchSpear") {
    line(ctx, handX, 40 + bob, outerX, 11 + bob, OL, 4.3);
    line(ctx, handX, 40 + bob, outerX, 11 + bob, "#76502c", 2.4);
    poly(ctx, [[outerX,7+bob],[outerX-2.4,13+bob],[outerX+2.4,13+bob]], COMMON.metal, OL, .8);
    if (a === "torchSpear") {
      circle(ctx, side ? 30 : 6, 13 + bob, 3.2, "#ef9b35", OL, .8);
      circle(ctx, side ? 30 : 6, 12 + bob, 1.6, "#ffd06b");
    }
  } else if (a === "swordShield") {
    line(ctx, handX, 36 + bob, outerX, 18 + bob, OL, 4);
    line(ctx, handX, 36 + bob, outerX, 18 + bob, COMMON.metal, 2.3);
    line(ctx, handX - (side ? -2 : 2), 34 + bob, handX + (side ? 3 : -3), 31 + bob, COMMON.gold, 1.6);
  } else if (a === "herbBasket" || a === "flowerBasket") {
    rr(ctx, side ? 23 : 3, 30 + bob, 9, 8, 2, "#76502d", OL, 1);
    line(ctx, side ? 24 : 4, 30 + bob, side ? 30 : 10, 26 + bob, "#a47943", 1.2);
    const colors = a === "herbBasket" ? ["#6fa455", "#8fc46e", "#d1c456"] : ["#d86a78", "#e3bd59", "#7fb360"];
    colors.forEach((color, i) => circle(ctx, (side ? 25 : 5) + i * 2.3, 29 + bob - (i % 2), 1.5, color, OL, .4));
  } else if (a === "bowCompass" || a === "bowKnife") {
    ctx.strokeStyle = "#7b512c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(outerX, 28 + bob, 8, -1.2, 1.2);
    ctx.stroke();
    if (a === "bowCompass") circle(ctx, side ? 27 : 9, 33 + bob, 2.3, COMMON.gold, OL, .7);
    else line(ctx, handX, 36 + bob, outerX, 28 + bob, COMMON.metal, 1.8);
  } else if (a === "ledgerBag") {
    rr(ctx, side ? 23 : 4, 30 + bob, 8, 9, 2, COMMON.leather, OL, 1);
    line(ctx, side ? 24 : 5, 30 + bob, side ? 18 : 18, 23 + bob, COMMON.gold, 1);
    rr(ctx, side ? 4 : 24, 25 + bob, 7, 8, 1.5, "#d8c78f", OL, .8);
    line(ctx, side ? 5 : 25, 28 + bob, side ? 10 : 30, 28 + bob, "#6a5937", .7);
  } else if (a === "lantern") {
    rr(ctx, outerX - (side ? 1 : 5), 28 + bob, 6, 10, 1.5, "#d19a43", OL, 1);
    rr(ctx, outerX - (side ? 0 : 4), 30 + bob, 4, 5, 1, "#f5d06b", null);
    line(ctx, handX, 31 + bob, outerX, 28 + bob, COMMON.leather, 1.5);
  } else if (a === "woodAxe") {
    line(ctx, handX, 38 + bob, outerX, 22 + bob, COMMON.leather, 2.5);
    poly(ctx, [[outerX,19+bob],[outerX+(side?-6:6),21+bob],[outerX+(side?-4:4),27+bob],[outerX,25+bob]], COMMON.metalDark, OL, .8);
  } else if (a === "bandagePack") {
    rr(ctx, side ? 22 : 5, 29 + bob, 9, 9, 2, "#8a6841", OL, 1);
    rr(ctx, side ? 25 : 8, 31 + bob, 3, 5, .8, COMMON.white, null);
    line(ctx, 12, 26 + bob, 24, 33 + bob, COMMON.white, 2.2);
  } else if (a === "bookMedallion") {
    rr(ctx, side ? 23 : 4, 28 + bob, 8, 9, 1.5, "#70402f", OL, 1);
    line(ctx, side ? 27 : 8, 29 + bob, side ? 27 : 8, 36 + bob, COMMON.gold, .8);
    circle(ctx, 18, 29 + bob, 1.6, COMMON.gold, OL, .5);
  } else if (a === "mugApron") {
    rr(ctx, outerX - (side ? 0 : 6), 29 + bob, 6, 7, 1.5, "#c69c5a", OL, 1);
    circle(ctx, side ? outerX + 1 : outerX - 1, 32.5 + bob, 2.5, null, COMMON.gold, 1);
  } else if (a === "tongsHammer" || a === "royalHammer") {
    line(ctx, handX, 39 + bob, outerX, 25 + bob, COMMON.leather, 2.6);
    rr(ctx, outerX - (side ? 1 : 6), 21 + bob, 7, 6, 1, COMMON.metal, OL, 1);
    if (a === "tongsHammer") {
      line(ctx, side ? 28 : 8, 38 + bob, side ? 33 : 3, 26 + bob, COMMON.metalDark, 1.5);
      line(ctx, side ? 31 : 5, 38 + bob, side ? 33 : 3, 26 + bob, COMMON.metalDark, 1.5);
    }
  } else if (a === "walkingStaff" || a === "scrollStaff") {
    line(ctx, handX, 44, outerX, 10 + bob, OL, 4);
    line(ctx, handX, 44, outerX, 10 + bob, "#72502f", 2.2);
    if (a === "scrollStaff") {
      rr(ctx, side ? 23 : 4, 25 + bob, 8, 9, 1.4, "#dfd0a1", OL, .8);
      line(ctx, side ? 24 : 5, 28 + bob, side ? 30 : 11, 28 + bob, "#755f39", .7);
    }
  } else if (a === "keysApron") {
    circle(ctx, side ? 26 : 10, 34 + bob, 2.2, null, COMMON.gold, 1.2);
    line(ctx, side ? 27 : 11, 35 + bob, side ? 30 : 14, 38 + bob, COMMON.gold, 1.1);
    line(ctx, side ? 25 : 9, 35 + bob, side ? 23 : 7, 39 + bob, COMMON.gold, 1.1);
  }
}

function drawNpcCore(ctx, p, dir, frame) {
  const side = dir === "left";
  const up = dir === "up";
  const bob = frame ? -1 : 0;
  const step = frame ? 1 : -1;
  const OL = COMMON.outline;
  const bodyScale = p.body === "broad" ? 1.07 : p.body === "slim" ? .96 : p.body === "old" ? .95 : 1;
  const bodyWidth = p.body === "broad" ? 21 : p.body === "round" ? 21 : 18;
  const bodyX = 18 - bodyWidth / 2;

  shadow(ctx, p.body === "broad" || p.body === "round" ? 12 : 10.5);
  ctx.save();
  ctx.translate(18, 45);
  ctx.scale(bodyScale, bodyScale);
  ctx.translate(-18, -45);

  rr(ctx, side ? 12 : 10.5, 36 + step + bob, 6, 9, 2, COMMON.boot, OL, 1.2);
  rr(ctx, side ? 18 : 19.5, 36 - step + bob, 6, 9, 2, "#3a2c22", OL, 1.2);

  rr(ctx, bodyX, 21 + bob, bodyWidth, 18, 5.5, p.coatDark, OL, 1.7);
  rr(ctx, bodyX + 1, 21 + bob, bodyWidth - 2, 10, 4.5, p.coat, null);
  rr(ctx, bodyX + 2, 31 + bob, bodyWidth - 4, 4, 1.5, p.accent, OL, .7);
  if (p.apron) rr(ctx, bodyX + 3, 24 + bob, bodyWidth - 6, 14, 2.5, "#70472d", OL, 1);
  if (p.cape) poly(ctx, [[bodyX+1,22+bob],[bodyX+bodyWidth-1,22+bob],[bodyX+bodyWidth-3,40+bob],[bodyX+3,40+bob]], p.coatDark, null);

  if (!side) {
    rr(ctx, bodyX - 4.2, 24 + bob, 5.5, 11, 2.5, p.coatDark, OL, 1.1);
    rr(ctx, bodyX + bodyWidth - 1.3, 24 + bob, 5.5, 11, 2.5, p.coatDark, OL, 1.1);
    circle(ctx, bodyX - 1.5, 35 + bob, 2.2, COMMON.skin, OL, .8);
    circle(ctx, bodyX + bodyWidth + 1.5, 35 + bob, 2.2, COMMON.skin, OL, .8);
  } else {
    rr(ctx, bodyX - 3, 24 + bob, 5.5, 11, 2.5, p.coatDark, OL, 1.1);
    circle(ctx, bodyX - .5, 35 + bob, 2.2, COMMON.skin, OL, .8);
  }

  circle(ctx, 18, 14 + bob, p.body === "round" ? 8.8 : 8.2, COMMON.skin, OL, 1.6);
  if (up) circle(ctx, 18, 13 + bob, 7.6, p.hair || "#4c3323", OL, .9);
  drawHair(ctx, p, dir, bob);
  drawHat(ctx, p, dir, bob);
  drawFace(ctx, p, dir, bob);

  if (p.backpack && dir !== "down") rr(ctx, side ? 20 : 12, 23 + bob, 10, 13, 3, COMMON.leather, OL, 1);
  drawAccessory(ctx, p, dir, bob);

  ctx.restore();
}

function prepare(canvas, draw, dir, frame, hurt) {
  if (!canvas) return;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  if (dir === "right") {
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    draw(ctx, "left", frame);
    ctx.restore();
  } else draw(ctx, dir || "down", frame);
  if (hurt) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(230,45,45,.46)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }
}

export function isGreenNpcVariant(variant) {
  return GREEN_NPC_VARIANTS.has(variant);
}

export function drawGreenNpc(canvas, variant, dir = "down", frame = 0, hurt = false) {
  const p = GREEN_NPC_PROFILES[variant];
  if (!p || !canvas) return false;
  prepare(canvas, (ctx, face, walk) => drawNpcCore(ctx, p, face, walk), dir, frame, hurt);
  return true;
}
