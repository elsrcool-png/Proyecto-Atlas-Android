// PROYECTO ATLAS — Aventureros reclutables (Fase 3). Grupo visible junto a cada entrada
// de dungeon. Distintas razas/clases, con stats, habilidad, descripción y coste.
// Selección determinista por dungeon (hash) para no repetir siempre los mismos.
import { hitSolid } from "@/lib/atlasWorld";

export const RECRUIT_ROSTER = [
  { id: "rec_kael", name: "Kael", race: "Humano", class: "Guerrero", level: 3, hp: 18, maxHp: 18, energy: 6, maxEnergy: 6, attack: 5, defense: 4, ability: "Guardia Real", abilityDesc: "Postura defensiva que protege y contraataca.", desc: "Soldado imperial endurecido en la frontera norte.", cost: 60 },
  { id: "rec_lyra", name: "Lyra", race: "Elfo", class: "Mago", level: 3, hp: 11, maxHp: 11, energy: 14, maxEnergy: 14, attack: 5, defense: 2, ability: "Flecha Solar", abilityDesc: "Dispara una flecha de luz que abrasa.", desc: "Estudiosa élfica del Núcleo Solar; busca reliquias olvidadas.", cost: 75 },
  { id: "rec_dunrik", name: "Dunrik", race: "Enano", class: "Pícaro", level: 3, hp: 14, maxHp: 14, energy: 9, maxEnergy: 9, attack: 5, defense: 3, ability: "Trampa de Acero", abilityDesc: "Coloca una trampa oculta de acero.", desc: "Desactivador de trampas veterano de las minas de hierro.", cost: 65 },
  { id: "rec_mira", name: "Mira", race: "Humano", class: "Mago", level: 4, hp: 12, maxHp: 12, energy: 16, maxEnergy: 16, attack: 6, defense: 2, ability: "Escudo Rúnico", abilityDesc: "Invoca un escudo de runas que absorbe daño.", desc: "Archivista real de Verdalia; experta en runas antiguas.", cost: 90 },
  { id: "rec_soren", name: "Sören", race: "Elfo", class: "Guerrero", level: 4, hp: 16, maxHp: 16, energy: 7, maxEnergy: 7, attack: 6, defense: 3, ability: "Danza de Espadas", abilityDesc: "Movimiento que combina ataque y defensa.", desc: "Guardabosques élfico patrullando las ruinas del Vigía.", cost: 80 },
  { id: "rec_brun", name: "Brun", race: "Enano", class: "Guerrero", level: 4, hp: 20, maxHp: 20, energy: 6, maxEnergy: 6, attack: 6, defense: 5, ability: "Muro de Piedra", abilityDesc: "Se convierte en un muro inamovible.", desc: "Rompepuertas enano; ha asediado tres fortalezas corruptas.", cost: 85 },
  { id: "rec_vael", name: "Vael", race: "Elfo", class: "Pícaro", level: 3, hp: 12, maxHp: 12, energy: 9, maxEnergy: 9, attack: 5, defense: 2, ability: "Paso Sombrío", abilityDesc: "Se desliza entre sombras sin ser visto.", desc: "Explorador silencioso del bosque de las Raíces.", cost: 70 },
  { id: "rec_orn", name: "Orn", race: "Enano", class: "Mago", level: 3, hp: 13, maxHp: 13, energy: 13, maxEnergy: 13, attack: 5, defense: 3, ability: "Runa Explosiva", abilityDesc: "Activa una runa que estalla bajo el enemigo.", desc: "Forjador de runas enano de la Ciudadela Helada.", cost: 80 },
  { id: "rec_tal", name: "Tal", race: "Humano", class: "Pícaro", level: 4, hp: 13, maxHp: 13, energy: 10, maxEnergy: 10, attack: 6, defense: 3, ability: "Emboscada Urbana", abilityDesc: "Aprovecha el entorno para emboscar.", desc: "Cazarrecompensas del pueblo de Robledal.", cost: 75 },
  { id: "rec_fen", name: "Fen", race: "Humano", class: "Explorador", level: 3, hp: 14, maxHp: 14, energy: 8, maxEnergy: 8, attack: 4, defense: 3, ability: "Disparo Certero", abilityDesc: "Tiro a distancia con gran precisión.", desc: "Vigía del campamento; conoce cada sendero verde.", cost: 55 },
  { id: "rec_isil", name: "Isil", race: "Elfo", class: "Erudito", level: 4, hp: 11, maxHp: 11, energy: 15, maxEnergy: 15, attack: 5, defense: 2, ability: "Lectura Arcana", abilityDesc: "Descifra runas y debilita a los no-muertos.", desc: "Erudita élfica que estudia las dungeon antiguas.", cost: 70 },
  { id: "rec_gar", name: "Gar", race: "Enano", class: "Guerrero", level: 5, hp: 22, maxHp: 22, energy: 7, maxEnergy: 7, attack: 7, defense: 5, ability: "Martillo Sísmico", abilityDesc: "Golpe sísmico que sacude el suelo.", desc: "Guardián enano que custodia las tumbas del desierto.", cost: 110 },
];

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }

// Devuelve 3-4 aventureros deterministas para una dungeon, variados en raza/clase.
export function getRecruitsForDungeon(dungeonId, hiredId = null) {
  if (!dungeonId) return [];
  const h = hashStr(dungeonId);
  const pool = [...RECRUIT_ROSTER];
  // Mezcla determinista
  for (let i = pool.length - 1; i > 0; i--) {
    const j = (hashStr(dungeonId + ":" + i) % (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = [];
  const usedRaces = new Set(), usedClasses = new Set();
  for (const r of pool) {
    if (picked.length >= 4) break;
    // Priorizar variedad, pero no exigir estrictamente
    if (picked.length < 3 && usedRaces.has(r.race) && usedClasses.has(r.class)) continue;
    picked.push({ ...r, hired: r.id === hiredId });
    usedRaces.add(r.race); usedClasses.add(r.class);
  }
  while (picked.length < 3 && pool.length) {
    const r = pool[picked.length % pool.length];
    if (!picked.find(p => p.id === r.id)) picked.push({ ...r, hired: r.id === hiredId });
    else break;
  }
  return picked;
}

function inWater(world, x, y) {
  if (!world?.terrainShapes) return false;
  for (const w of world.terrainShapes) {
    if (w.type !== "water" && w.type !== "river") continue;
    if (x >= w.x && x <= w.x + (w.w || 0) && y >= w.y && y <= w.y + (w.h || 0)) return true;
  }
  return false;
}

function walkableAt(world, x, y) {
  if (!world) return false;
  if (x < 24 || y < 24 || x > world.W - 24 || y > world.H - 24) return false;
  if (hitSolid(x, y, world.solids)) return false;
  if (inWater(world, x, y)) return false;
  return true;
}

// Posición del campamento de aventureros: una casilla caminable cerca de la entrada.
export function getRecruitCampPos(world, dungeon) {
  if (!world || !dungeon) return null;
  const e = dungeon.entrancePos;
  if (walkableAt(world, e.x, e.y - 60)) return { x: e.x, y: e.y - 60 };
  const offsets = [[0, -60], [60, 0], [0, 60], [-60, 0], [44, -44], [-44, -44], [44, 44], [-44, 44], [0, -90], [90, 0]];
  for (const [dx, dy] of offsets) {
    const x = e.x + dx, y = e.y + dy;
    if (walkableAt(world, x, y)) return { x, y };
  }
  // Espiral amplia
  for (let r = 30; r <= 160; r += 20) {
    for (let a = 0; a < 360; a += 45) {
      const x = e.x + Math.round(Math.cos(a * Math.PI / 180) * r);
      const y = e.y + Math.round(Math.sin(a * Math.PI / 180) * r);
      if (walkableAt(world, x, y)) return { x, y };
    }
  }
  return null;
}