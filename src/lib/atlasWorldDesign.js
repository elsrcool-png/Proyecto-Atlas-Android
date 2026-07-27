// PROYECTO ATLAS — Diseño del mundo conectado (capa de ambientación).
import { rand, randInt } from "@/lib/atlasWorld";
import { getSectorName } from "@/lib/atlasSectors";
import { generateFauna } from "@/lib/atlasFauna";

const pt = (x, y) => ({ x, y });
const mid = (a, b) => pt((a.x + b.x) / 2, (a.y + b.y) / 2);
const pick = (arr) => arr[randInt(0, arr.length - 1)];

const AMBIENT_LINES = {
  traveler: {
    verde: ["«Voy al pueblo a vender pieles. Cuidado con el Bosque Cerrado.»", "«El claro del norte es seguro de día, pero la maleza profunda no.»", "«Un aventurero cayó cerca de las ruinas. Atlas se lo llevó.»"],
    fria: ["«El camino helado es traicionero. Lleva provisiones.»", "«Las Ruinas Heladas guardan algo antiguo y hambriento.»", "«El viento del sur trae malos presagios.»"],
    desierto: ["«El oasis es un milagro; las dunas no perdonan.»", "«Vi una caravana dirigirse a las Ruinas del Sur.»", "«La arena cubre los huesos de los antiguos héroes.»"],
  },
  hunter: {
    verde: ["«Acecho a la pantera sombría. Su pelaje vale oro.»", "«No caces de noche: la maleza profunda está viva.»"],
    fria: ["«Las manadas de la escarcha cazan en grupo. Llévalas una a una.»", "«El lobo blanco no se hace presa: acecha al cazador.»"],
    desierto: ["«Los escorpiones del canon son rápidos. Su veneno, oro para los boticarios.»", "«Sigue los huesos: marcan el camino antiguo.»"],
  },
  caravan: {
    verde: ["«Mercancía del bosque: hierbas y pieles. Buen precio en el pueblo.»", "«Acompáñanos si vas al este.»"],
    fria: ["«Suministros congelados, pero pagamos bien por escolta.»", "«El norte está cerrado por la ventisca.»"],
    desierto: ["«Especias del sur. Las ruinas custodian riquezas, dicen.»", "«Caminamos de noche; el sol del desierto mata.»"],
  },
  adventurers: {
    verde: ["«Descansamos junto al fuego. Oímos aullidos en el Bosque Cerrado.»", "«Perdimos a uno entre las ruinas. Atlas lo reclama.»"],
    fria: ["«El glaciar nos frenó. Volveremos con más gente.»", "«Una grieta corrompida nos cerró el paso. Cuidado.»"],
    desierto: ["«Buscamos el sello del faraón. La arena no perdona.»", "«Un héroe cayó aquí. Solo quedan sus restos y su corona rota.»"],
  },
};

const NPC_NAMES = ["Aldric", "Maren", "Sven", "Liora", "Tomas", "Ingrid", "Brom", "Yara", "Erek", "Nessa"];

const LORE_LINES = {
  ruins: { verde: "Vestigios de un poblado tragado por el bosque. La maleza crece sobre los huesos de quien vivió aquí.", fria: "Muros de piedra resquebrajados por el hielo. Algo susurra entre las ruinas heladas.", desierto: "Columnas medio enterradas. Una civilización que la arena sepultó." },
  altar: { verde: "Un altar de piedra cubierto de musgo. Los antiguos aventureros dejaron ofrendas aquí.", fria: "Un altar helado. La escarcha no se funde: la magia de Atlas lo impide.", desierto: "Un altar arenoso. Grabados desgastados hablan de Atlas y de quienes lo desafiaron." },
  remains: { verde: "Restos de un aventurero. Su espada oxidada aún apunta al Bosque Cerrado.", fria: "Un cuerpo congelado, intacto. Lleva un amuleto de Atlas sin marcar.", desierto: "Huesos bajo la arena. Una corona rota descansa junto al cráneo." },
  rift: { verde: "Una grieta purpúrea en el aire. La corrupción de Atlas rezuma de ella.", fria: "Una grieta de frío antinatural. El aire se quema al respirarla.", desierto: "Una grieta de arena suspendida. El yermo se pudre a su alrededor." },
  resource: { verde: "Un lecho de hierbas raras. Los boticarios pagarían bien por ellas.", fria: "Un manantial que no se hiela. Agua viva en el yermo helado.", desierto: "Vetas de mineral entre las rocas. Los herreros las precian." },
};

const ARROW = { up: "↑", down: "↓", left: "←", right: "→" };

function roadBetween(a, b) {
  const steps = 6;
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const pts = [a];
  const side = Math.random() < 0.5 ? 1 : -1;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const amp = Math.sin(t * Math.PI) * (20 + rand(0, 16)) * side;
    const jx = (Math.random() - 0.5) * 14, jy = (Math.random() - 0.5) * 14;
    pts.push(pt(a.x + dx * t + nx * amp + jx, a.y + dy * t + ny * amp + jy));
  }
  pts.push(b);
  return pts;
}

function distToRoads(x, y, roads) {
  let best = Infinity;
  for (const r of roads) {
    for (let i = 0; i < r.length - 1; i++) {
      const ax = r[i].x, ay = r[i].y, bx = r[i + 1].x, by = r[i + 1].y;
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy || 1;
      let t = ((x - ax) * dx + (y - ay) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const px = ax + dx * t, py = ay + dy * t;
      const d = Math.hypot(x - px, y - py);
      if (d < best) best = d;
    }
  }
  return best;
}

export function scatterClusters(pool, W, H, opts) {
  const { keepClear, count = 16, perCluster = 5 } = opts;
  const decor = [], solids = [], water = [];
  const grove = pool.filter(d => d.solid);
  const lake = pool.find(d => d.lake);
  if (!grove.length) return { decor, solids, water };
  for (let c = 0; c < count; c++) {
    let cx, cy, t = 0;
    do { cx = rand(46, W - 46); cy = rand(46, H - 46); t++; } while (keepClear(cx, cy) && t < 50);
    if (t >= 50) continue;
    if (lake && Math.random() < 0.06) { water.push({ x: cx, y: cy, sz: lake.sz }); continue; }
    const base = grove[randInt(0, grove.length - 1)];
    const n = randInt(3, perCluster);
    for (let k = 0; k < n; k++) {
      const ang = rand(0, Math.PI * 2), r = rand(8, 46);
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      if (keepClear(x, y)) continue;
      const d = Math.random() < 0.7 ? base : grove[randInt(0, grove.length - 1)];
      const w = d.sz * 0.6, h = d.sz * 0.6;
      decor.push({ x, y, icon: d.icon, sz: d.sz, scatter: true });
      solids.push({ x: x - w / 2, y: y - h / 2, w, h, scatter: true });
    }
  }
  return { decor, solids, water };
}

export function enrichWorld(world, ctx) {
  if (!world) return world;
  const { regionId, col, row } = ctx;
  const W = world.W, H = world.H;
  const spawn = world.spawn || pt(W / 2, H / 2);
  const center = world.safeCenter || pt(W / 2, H / 2);
  const borders = {
    n: pt(W / 2, 8),
    s: pt(W / 2, H - 8),
    e: pt(W - 8, H / 2),
    w: pt(8, H / 2),
  };

  const roads = [];
  roads.push(roadBetween(spawn, center));
  roads.push(roadBetween(center, borders.n));
  roads.push(roadBetween(center, borders.s));
  roads.push(roadBetween(center, borders.e));
  roads.push(roadBetween(center, borders.w));
  if (world.objective) roads.push(roadBetween(center, world.objective));
  (world.chests || []).slice(0, 2).forEach(c => roads.push(roadBetween(center, c)));

  const signposts = [];
  const nm = (c, r) => getSectorName(regionId, c, r);
  if (row > 0) signposts.push({ x: W / 2, y: 44, labels: [{ dir: "up", text: nm(col, row - 1) }] });
  if (row < 2) signposts.push({ x: W / 2, y: H - 44, labels: [{ dir: "down", text: nm(col, row + 1) }] });
  if (col > 0) signposts.push({ x: 44, y: H / 2, labels: [{ dir: "left", text: nm(col - 1, row) }] });
  if (col < 2) signposts.push({ x: W - 44, y: H / 2, labels: [{ dir: "right", text: nm(col + 1, row) }] });
  const centerLabels = [];
  if (world.objective) centerLabels.push({ dir: "right", text: "Punto de interés" });
  if (world.boss) centerLabels.push({ dir: "right", text: "Jefe regional" });
  if (row !== 1) centerLabels.push({ dir: row === 0 ? "down" : "up", text: nm(col, 1) });
  if (centerLabels.length) signposts.push({ x: center.x, y: center.y + (world.safeRadius ? -world.safeRadius * 0.5 : 60), labels: centerLabels });

  const ambientNpcs = [];
  const line = (type) => pick(AMBIENT_LINES[type]?.[regionId] || AMBIENT_LINES[type]?.verde || []);
  let ai = 0;
  const onRoad = (road) => { const seg = road[1] || mid(road[0], road[road.length - 1]); return pt(seg.x + rand(-14, 14), seg.y + rand(-14, 14)); };
  const ambientVariants = regionId === "verde"
    ? { traveler: "verde_ambient_traveler", hunter: "verde_ambient_hunter", caravan: "verde_ambient_caravan" }
    : { traveler: "civilian", hunter: "guard", caravan: "civilian" };
  ambientNpcs.push({ id: `a${ai++}`, type: "traveler", x: onRoad(roads[3]).x, y: onRoad(roads[3]).y, name: pick(NPC_NAMES), sprite: { type: "villager", variant: ambientVariants.traveler }, lines: [line("traveler")] });
  ambientNpcs.push({ id: `a${ai++}`, type: "hunter", x: rand(70, W - 70), y: rand(70, H - 70), name: pick(NPC_NAMES), sprite: { type: "villager", variant: ambientVariants.hunter }, lines: [line("hunter")] });
  ambientNpcs.push({ id: `a${ai++}`, type: "caravan", x: borders.w.x + 50, y: borders.w.y + rand(-20, 20), name: pick(NPC_NAMES), sprite: { type: "villager", variant: ambientVariants.caravan }, lines: [line("caravan")] });
  const ch = (world.chests || [])[0];
  if (ch) ambientNpcs.push({ id: `a${ai++}`, type: "adventurers", x: ch.x + 44, y: ch.y + 44, name: "Aventureros", sprite: { type: "stranger" }, lines: [line("adventurers")], camp: true });

  const loreMarkers = [];
  const loreOf = (kind) => LORE_LINES[kind]?.[regionId] || LORE_LINES[kind]?.verde || "";
  const corruption = pick(["rift", "remains"]);
  const identity = pick(["ruins", "altar", "resource"]);
  const spots = [pt(W * 0.24, H * 0.74), pt(W * 0.76, H * 0.26)];
  loreMarkers.push({ id: `l0`, kind: corruption, x: spots[0].x + rand(-20, 20), y: spots[0].y + rand(-20, 20), title: kindTitle(corruption), lore: loreOf(corruption) });
  loreMarkers.push({ id: `l1`, kind: identity, x: spots[1].x + rand(-20, 20), y: spots[1].y + rand(-20, 20), title: kindTitle(identity), lore: loreOf(identity) });

  world.roads = roads;
  const roadClear = 20;
  const grassClear = 8;
  world.solids = (world.solids || []).filter(s => {
    if (!s.scatter) return true;
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    if (Math.hypot(cx - spawn.x, cy - spawn.y) < 64) return false;
    return distToRoads(cx, cy, roads) > roadClear;
  });
  world.decor = (world.decor || []).filter(d => {
    if (!d.scatter) return true;
    if (Math.hypot(d.x - spawn.x, d.y - spawn.y) < 64) return false;
    return distToRoads(d.x, d.y, roads) > (d.visual ? grassClear : roadClear);
  });
  world.signposts = signposts;
  world.ambientNpcs = ambientNpcs;
  world.loreMarkers = loreMarkers;
  world.fauna = generateFauna(world, ctx);
  return world;
}

function kindTitle(kind) {
  return { ruins: "Ruinas antiguas", altar: "Altar olvidado", remains: "Restos de un héroe", rift: "Grieta corrupta", resource: "Recurso del yermo" }[kind] || "Punto de interés";
}