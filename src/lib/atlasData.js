// PROYECTO ATLAS — Datos del mundo (3 regiones, mapa procedural)

export const CHARACTERS = [
  { id: "humano_guerrero", race: "Humano", class: "Guerrero", raceIcon: "user", classIcon: "swords", hp: 16, attack: 4, physicalDefense: 3, magicalDefense: 2, skill: "Una vez por turno, puedes realizar un ataque adicional." },
  { id: "elfo_guerrero", race: "Elfo", class: "Guerrero", raceIcon: "leaf", classIcon: "swords", hp: 14, attack: 4, physicalDefense: 2, magicalDefense: 2, skill: "+1 defensa cuando estás en un bosque." },
  { id: "enano_guerrero", race: "Enano", class: "Guerrero", raceIcon: "hammer", classIcon: "swords", hp: 18, attack: 4, physicalDefense: 4, magicalDefense: 2, skill: "Puedes ignorar 1 punto de daño una vez por turno." },
  { id: "humano_mago", race: "Humano", class: "Mago", raceIcon: "user", classIcon: "wand2", hp: 10, attack: 4, physicalDefense: 1, magicalDefense: 3, skill: "Puedes repetir 1 dado de magia una vez por turno." },
  { id: "elfo_mago", race: "Elfo", class: "Mago", raceIcon: "leaf", classIcon: "wand2", hp: 9, attack: 4, physicalDefense: 1, magicalDefense: 3, skill: "Tus hechizos de control cuestan 1 punto menos." },
  { id: "enano_mago", race: "Enano", class: "Mago", raceIcon: "hammer", classIcon: "wand2", hp: 11, attack: 4, physicalDefense: 2, magicalDefense: 3, skill: "Tus hechizos de daño hacen +1 de daño." },
  { id: "humano_picaro", race: "Humano", class: "Pícaro", raceIcon: "user", classIcon: "sword", hp: 12, attack: 4, physicalDefense: 2, magicalDefense: 2, skill: "Puedes moverte 1 zona adicional después de atacar." },
  { id: "elfo_picaro", race: "Elfo", class: "Pícaro", raceIcon: "leaf", classIcon: "sword", hp: 11, attack: 4, physicalDefense: 2, magicalDefense: 2, skill: "Los enemigos tienen -1 al atacarte." },
  { id: "enano_picaro", race: "Enano", class: "Pícaro", raceIcon: "hammer", classIcon: "sword", hp: 13, attack: 4, physicalDefense: 2, magicalDefense: 2, skill: "Puedes desactivar trampas en 1 acción." },
];

export const MONSTERS = [
  { id: "orco_bruto", name: "Orco Bruto", type: "Humanoide", icon: "skull", hp: 12, attack: 4, defense: 2, skill: "Golpe poderoso: si sacas 5+, haces 1 daño adicional." },
  { id: "chaman_orco", name: "Chamán Orco", type: "Humanoide", icon: "sparkles", hp: 8, attack: 2, defense: 1, skill: "Invoca: coloca 1 Orco en un área adyacente." },
  { id: "asesino_orco", name: "Asesino Orco", type: "Humanoide", icon: "moon", hp: 9, attack: 3, defense: 1, skill: "Ataque sorpresa: primer ataque +1 daño." },
  { id: "lobo_salvaje", name: "Lobo Salvaje", type: "Bestia", icon: "footprints", hp: 10, attack: 3, defense: 0, skill: "Embestida: se mueve 1 zona extra antes de atacar." },
  { id: "brujo_feral", name: "Brujo Feral", type: "Bestia", icon: "bat", hp: 8, attack: 2, defense: 1, skill: "Aullido: el jugador tiene -1 al ataque este turno." },
  { id: "pantera_sombria", name: "Pantera Sombría", type: "Bestia", icon: "cat", hp: 9, attack: 3, defense: 1, skill: "Sigilo: obtiene +1 ataque si el jugador está solo." },
  { id: "guerrero_esqueletico", name: "Guerrero Esquelético", type: "No Muerto", icon: "skull", hp: 11, attack: 3, defense: 3, skill: "Imparable: ignora 1 punto de defensa." },
  { id: "necromante", name: "Necromante", type: "No Muerto", icon: "ghost", hp: 7, attack: 1, defense: 1, skill: "Resurrección: al morir, invoca 1 Esqueleto." },
  { id: "asesino_esqueletico", name: "Asesino Esquelético", type: "No Muerto", icon: "bone", hp: 9, attack: 3, defense: 1, skill: "Golpe letal: con 6 al atacar, +2 daño adicional." },
];

export const TRAPS = [
  { id: "picos", name: "Picos Retráctiles", type: "Física", icon: "triangle", damage: 3, desc: "El jugador recibe 3 de daño." },
  { id: "descarga", name: "Descarga Eléctrica", type: "Elemental", icon: "zap", damage: 1, desc: "El jugador recibe 1 de daño." },
  { id: "ilusion", name: "Ilusión Dañina", type: "Mental", icon: "eye", damage: 1, desc: "El jugador recibe 1 de daño." },
  { id: "red", name: "Trampa de Red", type: "Física", icon: "network", damage: 0, desc: "El jugador pierde su próximo turno." },
  { id: "veneno", name: "Nube de Veneno", type: "Elemental", icon: "cloud", damage: 2, desc: "El jugador queda Envenenado. Recibe 2 de daño." },
  { id: "terror", name: "Terror", type: "Mental", icon: "frown", damage: 0, desc: "El jugador queda Asustado hasta curarse." },
  { id: "foso", name: "Foso Escondido", type: "Física", icon: "arrowdown", damage: 2, desc: "El jugador cae y recibe 2 de daño." },
  { id: "geiser", name: "Géiser de Vapor", type: "Elemental", icon: "wind", damage: 1, desc: "El jugador recibe 1 de daño por quemadura." },
  { id: "memoria", name: "Pérdida de Memoria", type: "Mental", icon: "brain", damage: 0, desc: "El jugador pierde orientación momentáneamente." },
];

export const BOSSES = [
  { id: "guardian_verde", name: "Guardián Verde", icon: "leaf", hp: 28, attack: 6, defense: 5, boss: true, skill: "Raíces Corruptas: bloquea caminos e invoca criaturas corruptas. Lamento del Bosque: daño a todos los combatientes.", reward: "Reliquia del Guardián Verde" },
  { id: "aurel_portador", name: "Aurel, Último Portador", icon: "gem", hp: 35, attack: 7, defense: 5, boss: true, skill: "Golpe del Cristal: ataque físico aumentado. Escudo del Portador: reduce daño. Tormenta del Vacío: ignora defensa. Juicio del Portador: ataque final.", reward: "Fragmento del Núcleo Ártico" },
  { id: "amon_solar", name: "Amon, Portador del Sol Eterno", icon: "sun", hp: 32, attack: 7, defense: 6, boss: true, skill: "Espada del Amanecer: gran poder físico. Escudo Solar: reduce daño. Eclipse Solar: reduce precisón. Juicio de Atlas: ataque devastador final.", reward: "Núcleo Solar Antiguo" },
];

const REGION_TERRAINS = {
  verde: {
    campamento: { name: "Campamento", icon: "tent", color: "#3a7d3a" },
    pueblo: { name: "Pueblo", icon: "home", color: "#8b7355" },
    ciudad: { name: "Ciudad", icon: "castle", color: "#6a6a7a" },
    bosque: { name: "Bosque", icon: "treepine", color: "#2d6a27" },
    pradera: { name: "Pradera", icon: "leaf", color: "#5a7a2a" },
    colina: { name: "Colina", icon: "mountain", color: "#6a6a5a" },
    lago: { name: "Lago", icon: "waves", color: "#2a6a7a" },
  },
  fria: {
    campamento: { name: "Campamento", icon: "tent", color: "#3a6a8a" },
    pueblo: { name: "Pueblo", icon: "home", color: "#8a9aaa" },
    ciudad: { name: "Ciudadela", icon: "castle", color: "#9aaabb" },
    tundra: { name: "Tundra", icon: "snowflake", color: "#a0c4d4" },
    glaciar: { name: "Glaciar", icon: "mountainsnow", color: "#6ab0d4" },
    lago_congelado: { name: "Lago Congelado", icon: "droplet", color: "#4a90b8" },
    caverna_helada: { name: "Caverna Helada", icon: "mountain", color: "#5a6a7a" },
  },
  desierto: {
    campamento: { name: "Campamento", icon: "tent", color: "#c4884a" },
    pueblo: { name: "Pueblo", icon: "home", color: "#b08a5a" },
    ciudad: { name: "Ciudad", icon: "landmark", color: "#c0a070" },
    dunas: { name: "Dunas", icon: "sun", color: "#c4a04a" },
    oasis: { name: "Oasis", icon: "palmtree", color: "#5a8a3a" },
    canon: { name: "Cañón", icon: "mountain", color: "#a06a3a" },
    ruinas_antiguas: { name: "Ruinas Antiguas", icon: "bone", color: "#b09070" },
  },
};

const REGION_DECOR = {
  verde: ["treepine", "trees", "leaf", "mountain", "wind", "gem", "sun"],
  fria: ["treepine", "snowflake", "mountain", "mountainsnow", "bone", "gem", "wind"],
  desierto: ["cactus", "mountain", "sun", "bone", "skull", "landmark", "leaf"],
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

class UnionFind {
  constructor() { this.p = {}; }
  find(x) { if (!(x in this.p)) this.p[x] = x; if (this.p[x] !== x) this.p[x] = this.find(this.p[x]); return this.p[x]; }
  union(a, b) { this.p[this.find(a)] = this.find(b); }
}

const SX = 25;
const SY = 30;

function generateDecor(region, nodes, maxX, maxY) {
  const pool = REGION_DECOR[region.id];
  const arr = [];
  const positions = Object.values(nodes);
  let attempts = 0;
  while (arr.length < 18 && attempts < 300) {
    attempts++;
    const x = Math.random() * (maxX + 20) - 10;
    const y = Math.random() * (maxY + 20) - 10;
    let ok = true;
    for (const n of positions) { if (Math.hypot(n.x - x, n.y - y) < 10) { ok = false; break; } }
    if (!ok) continue;
    arr.push({
      x, y,
      icon: pool[Math.floor(Math.random() * pool.length)],
      size: 7 + Math.random() * 7,
      opacity: 0.45 + Math.random() * 0.3,
      rot: Math.random() * 24 - 12,
    });
  }
  return arr;
}

export function generateRegionMap(region) {
  const { cols, rows, spawn, safeNodes, bossNode, objectiveNode, boss, wildTerrains } = region;
  const nodes = {};
  const gridEdges = [];

  for (let r = 0; r < rows; r++) {
    const odd = r % 2 === 1;
    const count = odd ? cols - 1 : cols;
    for (let c = 0; c < count; c++) {
      const gx = odd ? c * 2 + 1 : c * 2;
      const id = `${gx}_${r}`;
      const jx = (hashStr(region.id + id + "x") % 7 - 3) + (Math.random() * 4 - 2);
      const jy = (hashStr(region.id + id + "y") % 5 - 2) + (Math.random() * 3 - 1.5);
      nodes[id] = { id, gx, gy: r, x: gx * SX + jx, y: r * SY + jy, safe: false, boss: null, objective: false, terrain: null };
      for (const nid of [`${gx - 1}_${r - 1}`, `${gx + 1}_${r - 1}`]) {
        if (nodes[nid]) gridEdges.push([nid, id]);
      }
    }
  }

  if (nodes[spawn]) { nodes[spawn].safe = true; nodes[spawn].terrain = "campamento"; }
  for (const [nid, terrain] of Object.entries(safeNodes)) {
    if (nodes[nid]) { nodes[nid].safe = true; nodes[nid].terrain = terrain; }
  }
  if (nodes[bossNode]) nodes[bossNode].boss = boss;
  let objectiveId = null;
  const configured = nodes[objectiveNode];
  if (configured && !configured.boss && !configured.safe) {
    objectiveId = objectiveNode;
  } else {
    const wild = Object.values(nodes).filter(n => !n.boss && !n.safe)
      .sort((a, b) => (a.gx - b.gx) || (a.gy - b.gy));
    if (wild.length) objectiveId = wild[0].id;
  }
  if (objectiveId) nodes[objectiveId].objective = true;
  for (const id of Object.keys(nodes)) {
    const n = nodes[id];
    if (!n.terrain) n.terrain = wildTerrains[hashStr(region.id + id) % wildTerrains.length];
  }

  const shuffled = [...gridEdges].sort(() => Math.random() - 0.5);
  const uf = new UnionFind();
  const edges = [];
  for (const [a, b] of shuffled) {
    if (Math.random() < 0.22 && uf.find(a) === uf.find(b)) continue;
    uf.union(a, b);
    edges.push([a, b]);
  }

  const topology = {};
  for (const id of Object.keys(nodes)) topology[id] = [];
  for (const [a, b] of edges) { topology[a].push(b); topology[b].push(a); }

  const maxX = Math.max(...Object.values(nodes).map(n => n.x));
  const maxY = Math.max(...Object.values(nodes).map(n => n.y));
  const decor = generateDecor(region, nodes, maxX, maxY);

  return { nodes, topology, edges, decor, objectiveId, viewBox: `${-20} ${-20} ${maxX + 40} ${maxY + 40}` };
}

export const REGIONS = [
  {
    id: "verde",
    name: "Región Verde",
    subtitle: "El último territorio donde la vida mantiene su equilibrio",
    theme: {
      bgGradient: "from-emerald-950 via-green-950 to-slate-950",
      accent: "#5fd96a",
      particle: "leaf", particleCount: 14,
      mapBg1: "#1a3d1a", mapBg2: "#0d1f0d",
    },
    cols: 8, rows: 5,
    spawn: "6_4",
    safeNodes: { "0_0": "pueblo", "14_4": "ciudad" },
    bossNode: "8_0",
    objectiveNode: "2_2",
    boss: BOSSES[0],
    terrains: REGION_TERRAINS.verde,
    wildTerrains: ["bosque", "pradera", "colina", "lago"],
    difficultyMul: 1,
    npcs: {
      campamento: { name: "Capitán Roland", icon: "shield", mission: { id: "verde_kill", type: "kill_monsters", target: 3, desc: "Derrota 3 monstruos en zona salvaje para ganar mi confianza." } },
      pueblo: { name: "Alcalde Tomás", icon: "user", mission: { id: "verde_reach", type: "reach_node", target: "2_2", desc: "Explora el bosque profundo y vuelve. Hay un punto de interés al oeste." } },
      ciudad: { name: "Capitán Real", icon: "shield", mission: { id: "verde_boss", type: "kill_boss", desc: "Derrota al Guardián Verde que acecha el Corazón del Bosque." } },
    },
  },
  {
    id: "fria",
    name: "Región Ártica",
    subtitle: "Hielo, glaciares y antiguas investigaciones congeladas",
    theme: {
      bgGradient: "from-cyan-950 via-blue-950 to-slate-950",
      accent: "#7dd3fc", particle: "snowflake", particleCount: 18,
      mapBg1: "#16314a", mapBg2: "#0a1a2a",
    },
    cols: 8, rows: 5,
    spawn: "8_4",
    safeNodes: { "14_0": "pueblo", "0_4": "ciudad" },
    bossNode: "6_0",
    objectiveNode: "12_2",
    boss: BOSSES[1],
    terrains: REGION_TERRAINS.fria,
    wildTerrains: ["tundra", "glaciar", "lago_congelado", "caverna_helada"],
    difficultyMul: 1.3,
    npcs: {
      campamento: { name: "Explorador Boreas", icon: "compass", mission: { id: "fria_kill", type: "kill_monsters", target: 5, desc: "Derrota 5 monstruos de la escarcha que amenazan el campamento." } },
      pueblo: { name: "Chamán Hielo", icon: "sparkles", mission: { id: "fria_reach", type: "reach_node", target: "12_2", desc: "Llega al lago congelado al este y confirma lo que ves." } },
      ciudad: { name: "Reina de Hielo", icon: "crown", mission: { id: "fria_boss", type: "kill_boss", desc: "Derrota a Aurel, el Último Portador, bajo la montaña congelada." } },
    },
  },
  {
    id: "desierto",
    name: "Región Árida",
    subtitle: "Dunas, templos perdidos y civilización enterrada",
    theme: {
      bgGradient: "from-amber-950 via-orange-950 to-slate-950",
      accent: "#fbbf24", particle: "sun", particleCount: 12,
      mapBg1: "#3d2a10", mapBg2: "#1f1505",
    },
    cols: 8, rows: 5,
    spawn: "6_4",
    safeNodes: { "0_4": "pueblo", "14_0": "ciudad" },
    bossNode: "8_0",
    objectiveNode: "10_2",
    boss: BOSSES[2],
    terrains: REGION_TERRAINS.desierto,
    wildTerrains: ["dunas", "oasis", "canon", "ruinas_antiguas"],
    difficultyMul: 1.6,
    npcs: {
      campamento: { name: "Nómada Sahara", icon: "footprints", mission: { id: "desierto_kill", type: "kill_monsters", target: 7, desc: "Derrota 7 monstruos del desierto para asegurar las rutas." } },
      pueblo: { name: "Guardiana del Oasis", icon: "shield", mission: { id: "desierto_reach", type: "reach_node", target: "10_2", desc: "Descubre las ruinas antiguas al centro del desierto." } },
      ciudad: { name: "Faraón Eterno", icon: "crown", mission: { id: "desierto_boss", type: "kill_boss", desc: "Derrota a Amon, Portador del Sol Eterno, en el Templo Solar." } },
    },
  },
];

export function buildValidatedMaps() {
  const KEYS = ["campamento", "pueblo", "ciudad"];
  return REGIONS.map((region) => {
    const map = generateRegionMap(region);
    for (const key of KEYS) {
      const def = region.npcs[key]?.mission;
      if (def?.type === "reach_node") {
        const ok = map.objectiveId && map.nodes[map.objectiveId]?.objective;
        if (!ok) {
          for (const id of Object.keys(map.nodes)) map.nodes[id].objective = false;
          const wild = Object.values(map.nodes).filter(n => !n.safe && !n.boss)
            .sort((a, b) => (a.gx - b.gx) || (a.gy - b.gy));
          if (wild.length) { map.nodes[wild[0].id].objective = true; map.objectiveId = wild[0].id; }
        }
      }
    }
    return map;
  });
}