// PROYECTO ATLAS — Construcción física de asentamientos por bloque.
export function buildSettlement(region, bi, W, H) {
  const decor = [], solids = [], villagers = [], smoke = [];
  const treeIcon = region.id === "desierto" ? "cactus" : "treepine";
  const cx = W / 2, cy = H / 2;

  const add = (icon, x, y, sz, opts = {}) => {
    decor.push({ x, y, icon, sz });
    if (opts.solid) {
      const bw = opts.w || sz * 0.6, bh = opts.h || sz * 0.5;
      solids.push({ x: x - bw / 2, y: y - bh / 2 + sz * 0.12, w: bw, h: bh });
    }
    if (opts.smoke) smoke.push({ x: x + (opts.smoke.dx || 0), y: y - sz * 0.45 });
  };
  const ring = (count, radius, fn, startAngle = 0) => {
    for (let i = 0; i < count; i++) {
      const a = startAngle + (i / count) * Math.PI * 2;
      fn(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, a, i);
    }
  };

  if (bi === 0) {
    // CAMPAMENTO: claro central con fogata, carpas en el perímetro
    // separadas, antorchas flanqueando la entrada sur. Caminos amplios.
    add("campfire", cx, cy, 40, { smoke: { dx: 0 } });
    add("tent", cx + 150, cy - 110, 56, { solid: true });
    add("tent", cx - 150, cy - 110, 56, { solid: true });
    add("tent", cx + 150, cy + 120, 56, { solid: true });
    add("tent", cx, cy - 175, 56, { solid: true });
    add("torch", cx - 80, cy + 165, 36, { solid: true });
    add("torch", cx + 80, cy + 165, 36, { solid: true });
    add("bedroll", cx + 110, cy - 60, 40);
    villagers.push(
      { id: "ca1", x: cx + 42, y: cy + 34, home: { x: cx + 42, y: cy + 34 }, icon: "user", color: "#f2c14e", kind: "explorador" },
      { id: "ca2", x: cx - 42, y: cy + 52, home: { x: cx - 42, y: cy + 52 }, icon: "user", color: "#86d06a", kind: "explorador" },
    );
  } else if (bi === 1) {
    // PUEBLO: plaza central libre (pozo decorativo no sólido), casas y
    // mercado en cuadrantes fuera de avenidas, caminos amplios N-S y E-O.
    add("well", cx, cy, 50);
    add("house", cx - 160, cy - 120, 90, { solid: true, smoke: { dx: -14 } });
    add("market", cx + 160, cy - 120, 84, { solid: true });
    add("house", cx - 160, cy + 140, 86, { solid: true });
    add("house", cx + 160, cy + 140, 86, { solid: true });
    add("lamppost", cx - 72, cy - 72, 44);
    add("lamppost", cx + 72, cy - 72, 44);
    add("lamppost", cx - 72, cy + 72, 44);
    add("lamppost", cx + 72, cy + 72, 44);
    add("bush", cx - 160, cy + 185, 24);
    add("bush", cx + 160, cy + 185, 24);
    villagers.push(
      { id: "pg1", x: cx - 45, y: cy + 138, home: { x: cx - 45, y: cy + 138 }, icon: "shield", color: "#7da6ff", kind: "guardia" },
      { id: "pg2", x: cx + 45, y: cy + 138, home: { x: cx + 45, y: cy + 138 }, icon: "shield", color: "#7da6ff", kind: "guardia" },
      { id: "pv1", x: cx - 40, y: cy + 42, home: { x: cx - 40, y: cy + 42 }, icon: "user", color: "#86d06a", kind: "aldeano" },
      { id: "pv2", x: cx + 40, y: cy + 42, home: { x: cx + 40, y: cy + 42 }, icon: "user", color: "#f2c14e", kind: "aldeano" },
      { id: "pv3", x: cx, y: cy + 118, home: { x: cx, y: cy + 118 }, icon: "user", color: "#e06a9a", kind: "aldeana" },
    );
  } else {
    // CIUDAD: plaza central despejada + avenidas amplias N-S y E-O.
    // Estructuras en cuadrantes (fuera de avenidas y plaza). Puerta sur transitable.
    // Prioridad: movilidad y perímetro libre alrededor de NPC/tienda/herrero/objetivo.
    // Puerta sur (arco no sólido) con pilares a los lados que enmarcan la entrada.
    add("gate", cx, cy + 210, 96);
    add("citywall", cx - 70, cy + 210, 76, { solid: true });
    add("citywall", cx + 70, cy + 210, 76, { solid: true });
    // Casas y mercado en cuadrantes, fuera del eje de avenidas y del radio de plaza.
    add("house2", cx - 180, cy - 80, 110, { solid: true, smoke: { dx: -18 } });
    add("market", cx - 180, cy + 130, 86, { solid: true });
    add("house", cx + 180, cy + 130, 88, { solid: true });
    // Herrero (no sólido) junto a la plaza, siempre accesible.
    add("anvil", cx + 90, cy + 170, 50);
    // Faroles decorativos en las esquinas de la plaza (no sólidos).
    add("lamppost", cx - 72, cy - 72, 44);
    add("lamppost", cx + 72, cy - 72, 44);
    add("lamppost", cx - 72, cy + 72, 44);
    add("lamppost", cx + 72, cy + 72, 44);
    add("banner", cx - 100, cy + 100, 46);
    villagers.push(
      { id: "cg1", x: cx - 44, y: cy + 184, home: { x: cx - 44, y: cy + 184 }, icon: "shield", color: "#7da6ff", kind: "guardia" },
      { id: "cg2", x: cx + 44, y: cy + 184, home: { x: cx + 44, y: cy + 184 }, icon: "shield", color: "#7da6ff", kind: "guardia" },
      { id: "cv1", x: cx, y: cy + 40, home: { x: cx, y: cy + 40 }, icon: "user", color: "#c8a0ff", kind: "ciudadano" },
      { id: "cv2", x: cx + 96, y: cy + 96, home: { x: cx + 96, y: cy + 96 }, icon: "user", color: "#f2c14e", kind: "mercader" },
      { id: "cv3", x: cx - 96, y: cy + 96, home: { x: cx - 96, y: cy + 96 }, icon: "user", color: "#86d06a", kind: "ciudadano" },
    );
  }

  return { decor, solids, villagers, smoke, center: { x: cx, y: cy } };
}

export function buildBossZone(region, W, H) {
  const decor = [];
  const bx = W * 0.8, by = H * 0.5;
  const icon = region.id === "verde" ? "castle" : region.id === "fria" ? "fortress" : "temple";
  decor.push({ x: bx, y: by - 30, icon, sz: 240 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, r = 200;
    decor.push({ x: bx + Math.cos(a) * r, y: by + Math.sin(a) * r + 30, icon: "ruins", sz: 70 });
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4, r = 140;
    decor.push({ x: bx + Math.cos(a) * r, y: by + Math.sin(a) * r + 20, icon: region.id === "desierto" ? "bone" : "deadtree", sz: 50 });
  }
  return { decor };
}