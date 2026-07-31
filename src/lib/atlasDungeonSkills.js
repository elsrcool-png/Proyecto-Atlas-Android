// PROYECTO ATLAS — Habilidades de dungeon sin dados (v2).
// Cada habilidad define daño (derivado de stats), alcance, coste, CD, AOE,
// golpes, estado, y parámetros internos de precisión/crítico.
// No se muestran tiradas de dados al jugador: el cálculo es interno.

import { isWalkable } from "@/lib/atlasDungeons";
import { UNLOCK } from "@/lib/atlasSkills";

// 8 direcciones (incluye diagonales)
export const DIR8 = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
  up_left: [-1, -1], up_right: [1, -1], down_left: [-1, 1], down_right: [1, 1],
};
export const DIR8_KEYS = ["up", "down", "left", "right", "up_left", "up_right", "down_left", "down_right"];

// Plantilla base de precisión/crítico
const BASE_ACC = 0.90;
const BASE_CRIT = 0.10;
const BASE_CRIT_MULT = 1.5;

const sk = (id, name, type, opts) => ({
  id, name, type,
  range: opts.range || 1,
  energyCost: opts.energyCost || 0,
  cooldown: opts.cooldown || 0,
  damage: opts.damage || ((p) => p.attack || 0),
  hits: opts.hits || 1,
  aoe: !!opts.aoe,
  status: opts.status || null,
  element: opts.element || null,
  vfx: opts.vfx || "slash",
  // Desbloqueo: nivel mínimo o condición especial
  unlock: opts.unlock != null ? opts.unlock : 1,
  unlockGate: opts.unlockGate || null, // "weapon" | null
  accuracy: opts.accuracy != null ? opts.accuracy : BASE_ACC,
  critChance: opts.critChance != null ? opts.critChance : BASE_CRIT,
  critMult: opts.critMult != null ? opts.critMult : BASE_CRIT_MULT,
});

export const DUNGEON_SKILLS = {
  Guerrero: [
    sk("dg_basic", "Ataque básico", "basic", { vfx: "slash", damage: (p) => p.attack }),
    sk("dg_weapon", "Tajo pesado", "weapon", { energyCost: 3, vfx: "slash", damage: (p) => p.attack + 4, unlockGate: "weapon" }),
    sk("dg_class", "Corte Múltiple", "class", { energyCost: 4, cooldown: 2, hits: 2, vfx: "slash", damage: (p) => p.attack + 2, unlock: UNLOCK.classAbility }),
    sk("dg_hybrid", "Estocada Salvaje", "hybrid", { energyCost: 6, cooldown: 3, hits: 3, vfx: "slash", damage: (p) => Math.round(p.attack * 1.4), unlock: UNLOCK.hybrid }),
    sk("dg_def", "Danza Final", "definitive", { energyCost: 10, cooldown: 5, hits: 4, vfx: "crit", damage: (p) => Math.round(p.attack * 2.0), unlock: UNLOCK.definitive }),
  ],
  Mago: [
    sk("dg_basic", "Ataque básico", "basic", { vfx: "slash", damage: (p) => p.attack }),
    sk("dg_weapon", "Golpe arcano", "weapon", { range: 2, energyCost: 3, element: "arcano", vfx: "projectile", damage: (p) => p.attack + 3, unlockGate: "weapon" }),
    sk("dg_class", "Bola de Fuego", "class", { range: 3, energyCost: 5, cooldown: 3, aoe: true, element: "fuego", vfx: "magic", damage: (p) => p.attack + 4, status: { type: "burn", duration: 2 }, unlock: UNLOCK.classAbility }),
    sk("dg_hybrid", "Tormenta Eléctrica", "hybrid", { range: 3, energyCost: 6, cooldown: 3, element: "rayo", vfx: "magic", damage: (p) => Math.round(p.attack * 1.6), status: { type: "shock", duration: 1 }, unlock: UNLOCK.hybrid }),
    sk("dg_def", "Cataclismo Arcano", "definitive", { range: 3, energyCost: 9, cooldown: 5, aoe: true, element: "arcano", vfx: "magic", damage: (p) => Math.round(p.attack * 2.2), unlock: UNLOCK.definitive }),
  ],
  "Pícaro": [
    sk("dg_basic", "Ataque básico", "basic", { vfx: "slash", damage: (p) => p.attack }),
    sk("dg_weapon", "Estocada rápida", "weapon", { energyCost: 2, vfx: "slash", damage: (p) => p.attack + 5, unlockGate: "weapon" }),
    sk("dg_class", "Estocada Sombría", "class", { energyCost: 4, cooldown: 2, hits: 2, vfx: "slash", damage: (p) => p.attack + 1, status: { type: "poison", duration: 3 }, unlock: UNLOCK.classAbility, critChance: 0.15 }),
    sk("dg_hybrid", "Castigo Nocturno", "hybrid", { range: 2, energyCost: 6, cooldown: 3, hits: 3, vfx: "slash", damage: (p) => Math.round(p.attack * 1.5), unlock: UNLOCK.hybrid, critChance: 0.15 }),
    sk("dg_def", "Mil Cortes", "definitive", { energyCost: 9, cooldown: 5, hits: 5, vfx: "crit", damage: (p) => Math.round(p.attack * 1.8), unlock: UNLOCK.definitive }),
  ],
};

export function getDungeonSkills(playerClass) {
  return DUNGEON_SKILLS[playerClass] || DUNGEON_SKILLS.Guerrero;
}

// Devuelve SOLO las habilidades realmente desbloqueadas por el personaje.
// - básica: siempre
// - arma: solo si lleva arma equipada (arma de clase o arma de botín)
// - clase / híbrida / definitiva: si cumple el nivel de desbloqueo
export function getUnlockedDungeonSkills(player) {
  if (!player) return [];
  const all = getDungeonSkills(player.class);
  const hasWeapon = !!(player.weapon || player.classWeapon);
  return all.filter((s) => {
    if (s.unlockGate === "weapon") return hasWeapon;
    return (player.level || 1) >= (s.unlock || 1);
  });
}

// ── Resolución interna de precisión y crítico (sin dados) ──
// Modificadores: estadísticas, clase, raza, arma, estados, distancia, cobertura.
export function resolveSkillHit(skill, player, target, opts = {}) {
  const dist = opts.distance != null ? opts.distance : 1;
  let acc = skill.accuracy != null ? skill.accuracy : BASE_ACC;
  let crit = skill.critChance != null ? skill.critChance : BASE_CRIT;
  const critMult = skill.critMult != null ? skill.critMult : BASE_CRIT_MULT;

  // Clase
  if (player?.class === "Pícaro") crit += 0.05;
  if (player?.class === "Mago") acc += 0.02;
  if (player?.class === "Guerrero") acc += 0.03;

  // Raza
  if (player?.race === "Elfo") { acc += 0.03; crit += 0.02; }
  if (player?.race === "Enano") acc += 0.02;
  if (player?.race === "Humano") crit += 0.01;

  // Estadísticas / equipo
  if (player?.crit) crit += player.crit * 0.01;
  if (player?.precision) acc += player.precision * 0.01;

  // Distancia: penalización leve por casillas de distancia (>1)
  if (dist > 1) acc -= 0.05 * (dist - 1);

  // Cobertura: si el objetivo está adyacente a un muro, -8% precisión
  if (opts.cover) acc -= 0.08;

  // Estados del jugador
  const pst = opts.playerStatuses || {};
  if (pst.shock) acc -= 0.15;
  if (pst.def_up) acc += 0.0;

  // Estados del objetivo
  const tst = opts.targetStatuses || {};
  if (tst.poison || tst.burn) crit += 0.03;

  acc = Math.max(0.25, Math.min(0.99, acc));
  crit = Math.max(0, Math.min(0.6, crit));

  const hitRoll = Math.random();
  const hit = hitRoll < acc;
  if (!hit) return { hit: false, crit: false, dmg: 0, acc, critChance: crit };

  const critRoll = Math.random();
  const isCrit = critRoll < crit;

  let dmg = Math.max(1, Math.round(skill.damage(player)) - (target?.defense || 0));
  if (isCrit) dmg = Math.round(dmg * critMult);
  return { hit: true, crit: isCrit, dmg, acc, critChance: crit };
}

// Manhattan (4-dir) y Chebyshev (8-dir)
export function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
export function chebyshev(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

// Línea de visión por Bresenham
export function lineOfSight(dungeon, ax, ay, bx, by) {
  let dx = Math.abs(bx - ax), dy = Math.abs(by - ay);
  let sx = ax < bx ? 1 : -1, sy = ay < by ? 1 : -1;
  let err = dx - dy, x = ax, y = ay;
  while (true) {
    if (!(x === ax && y === ay) && !(x === bx && y === by) && !isWalkable(dungeon, x, y)) return false;
    if (x === bx && y === by) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return true;
}

// Movimiento diagonal permitido solo si no se "corta" una esquina sólida.
export function isWalkableDiag(dungeon, fromX, fromY, nx, ny) {
  if (!isWalkable(dungeon, nx, ny)) return false;
  if (nx !== fromX && ny !== fromY) {
    if (!isWalkable(dungeon, fromX, ny) && !isWalkable(dungeon, nx, fromY)) return false;
  }
  return true;
}

// Mejor casilla adyacente (8 dir) para acercarse al objetivo.
export function stepToward(dungeon, from, to, occupied) {
  const dirs = [
    [0, -1], [0, 1], [-1, 0], [1, 0],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];
  let best = null;
  let bestDist = chebyshev(from, to);
  for (const [dx, dy] of dirs) {
    const nx = from.x + dx, ny = from.y + dy;
    if (!isWalkableDiag(dungeon, from.x, from.y, nx, ny)) continue;
    if (occupied.has(`${nx},${ny}`)) continue;
    if (nx === to.x && ny === to.y) continue;
    const d = chebyshev({ x: nx, y: ny }, to);
    if (d < bestDist) { bestDist = d; best = { x: nx, y: ny }; }
  }
  return best;
}

// Orientación 8-dir desde un vector (dx, dy). Devuelve clave DIR8.
export function facingFromVector(dx, dy) {
  if (dx === 0 && dy === 0) return null;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI; // 0 = +x (right)
  // mapear a 8 sectores
  const dirs = [
    { key: "right", a: 0 }, { key: "down_right", a: 45 },
    { key: "down", a: 90 }, { key: "down_left", a: 135 },
    { key: "left", a: 180 }, { key: "up_left", a: -135 },
    { key: "up", a: -90 }, { key: "up_right", a: -45 },
  ];
  let best = dirs[0], bestD = 360;
  for (const d of dirs) {
    let diff = Math.abs(((ang - d.a + 540) % 360) - 180);
    if (diff < bestD) { bestD = diff; best = d; }
  }
  return best.key;
}

// Casilla objetivo según orientación (8-dir).
export function tileInFacing(pos, facing) {
  const d = DIR8[facing];
  if (!d) return null;
  return { x: pos.x + d[0], y: pos.y + d[1] };
}

// ¿El objetivo tiene cobertura? (adyacente a muro)
export function hasCover(dungeon, target) {
  if (!target) return false;
  for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    const nx = target.x + dx, ny = target.y + dy;
    if (!isWalkable(dungeon, nx, ny)) return true;
  }
  return false;
}