// PROYECTO ATLAS — Entrada controlada de dungeons.
// NPC guardián junto a la entrada, explicación inicial y misión tutorial.

const ENTRY_NPCS = {
  verde_b1: { name: "Bren el Explorador", role: "explorer", sprite: { type: "villager", variant: "verde_dungeon_bren" }, line: "Estas ruinas huelen a sangre vieja. ¿Bajas a echar un vistazo?" },
  verde_c1: { name: "Vera la Cazadora", role: "hunter", sprite: { type: "villager", variant: "verde_vera_hunter" }, line: "El Cazador Marchito duerme ahí dentro. Cuidado con sus sombras." },
  verde_b3: { name: "Roland el Vigilante", role: "captain", sprite: { type: "villager", variant: "verde_roland_vigilante" }, line: "El Paso del Río Antiguo está infestado. Si entras, vuelve con vida." },
  fria_c1: { name: "Sven el Mensajero", role: "explorer", sprite: { type: "villager", variant: "fria_dvalin" }, line: "La Estación del Mensajero es fría y traicionera. ¿Entramos?" },
  desierto_c1: { name: "Kael el Erudito", role: "researcher", sprite: { type: "villager", variant: "desierto_aran" }, line: "La Tumba del Sol Primero guarda secretos peligrosos." },
};

const DEFAULT_NPC = { name: "Guardián de la entrada", role: "explorer", sprite: { type: "villager", variant: "guard" }, line: "Esta dungeon es peligrosa. ¿Quieres entrar?" };

export function getDungeonEntranceNpc(dungeon) {
  if (!dungeon) return null;
  const n = ENTRY_NPCS[dungeon.id] || DEFAULT_NPC;
  return {
    id: `dg_gate_${dungeon.id}`,
    name: n.name,
    role: n.role,
    sprite: n.sprite,
    line: n.line,
    dungeonId: dungeon.id,
    dungeonName: dungeon.name,
  };
}

// Explicación inicial de la dungeon (primera vez).
export const DUNGEON_TUTORIAL_LINES = [
  "«Antes de bajar, escucha: el subsuelo se mueve por casillas.»",
  "Te desplazas una casilla por paso, en 8 direcciones. Mover el joystick sin superar el umbral solo gira tu orientación.",
  "Los enemigos patrullan. Si te ven, el combate se vuelve por turnos: tú actúas, luego tu compañero, luego ellos.",
  "Cada habilidad tiene alcance, coste y enfriamiento. El ataque básico golpea la casilla que miras; si la casilla está vacía, atacas al aire y los enemigos avanzan.",
  "No verás dados: la precisión y el crítico se calculan internamente según tu clase, raza, arma, estados y distancia.",
  "Derrota al jefe o cumple el objetivo. La salida final te devuelve al exterior; la entrada sirve como salida de emergencia.",
  "Si caes, Atlas te devuelve al santuario. Vuelve con vida y el botín será tuyo.",
];

// Misión secundaria tutorial (ligera, vía worldFlags).
export const TUTORIAL_FLAG = "atlas:dungeon_tutorial";
export const TUTORIAL_DONE_FLAG = "atlas:dungeon_tutorial_done";

export function isTutorialDone(worldFlags) {
  return !!(worldFlags && worldFlags[TUTORIAL_DONE_FLAG]);
}