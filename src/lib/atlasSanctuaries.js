// PROYECTO ATLAS — Portales de Invocación y Santuarios Fijos v3.3
// 9 santuarios fijos, uno por asentamiento (Campamento, Pueblo, Ciudad) en cada reino.
// Sin generación aleatoria, sin semillas, posiciones manuales estables.

import { coordsFromSectorId } from "@/lib/atlasRegionSectors";
import { PLAYABLE_REGION_IDS, normalizeRegionId } from "@/lib/atlasRegionRegistry";

const SANCTUARY_RADIUS = 100;

export const SANCTUARIES = [
  // ── REINO VERDE ──
  {
    id: "verde_A2_santuario",
    regionId: "verde",
    sectorId: "A2",
    settlementType: "campamento",
    destinationName: "Campamento del Umbral",
    x: 235, y: 165,
    spawnX: 235, spawnY: 245,
    interactionZone: { shape: "ellipse", x: 235, y: 165, rx: 34, ry: 24 },
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 235, y: 245 },
      { x: 285, y: 250 },
      { x: 190, y: 250 },
    ],
  },
  {
    id: "verde_C2_santuario",
    regionId: "verde",
    sectorId: "C2",
    settlementType: "pueblo",
    destinationName: "Pueblo de Robledal",
    x: 200, y: 515,
    spawnX: 200, spawnY: 640,
    interactionZone: { shape: "ellipse", x: 200, y: 515, rx: 31, ry: 22 },
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 230, y: 640 },
      { x: 285, y: 625 },
      { x: 180, y: 620 },
    ],
  },
  {
    id: "verde_B2_santuario",
    regionId: "verde",
    sectorId: "B2",
    settlementType: "ciudad",
    destinationName: "Ciudad de Verdalia",
    x: 155, y: 520,
    spawnX: 155, spawnY: 640,
    interactionZone: { shape: "ellipse", x: 155, y: 520, rx: 31, ry: 22 },
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 170, y: 640 },
      { x: 220, y: 625 },
      { x: 125, y: 620 },
    ],
  },
  // ── REINO ÁRTICO ──
  {
    id: "fria_B1_santuario",
    regionId: "fria",
    sectorId: "B1",
    settlementType: "campamento",
    destinationName: "Campamento Provisorio Boreal",
    x: 165, y: 125,
    spawnX: 165, spawnY: 210,
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 165, y: 210 },
      { x: 210, y: 230 },
      { x: 125, y: 190 },
    ],
  },
  {
    id: "fria_B3_santuario",
    regionId: "fria",
    sectorId: "B3",
    settlementType: "pueblo",
    destinationName: "Pueblo Pesquero Glacial",
    x: 300, y: 560,
    spawnX: 300, spawnY: 490,
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 300, y: 490 },
      { x: 255, y: 470 },
      { x: 345, y: 510 },
    ],
  },
  {
    id: "fria_B2_santuario",
    regionId: "fria",
    sectorId: "B2",
    settlementType: "ciudad",
    destinationName: "Ciudadela Helada",
    x: 390, y: 590,
    spawnX: 390, spawnY: 500,
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 390, y: 500 },
      { x: 345, y: 475 },
      { x: 435, y: 525 },
    ],
  },
  // ── REINO ÁRIDO ──
  {
    id: "desierto_B1_santuario",
    regionId: "desierto",
    sectorId: "B1",
    settlementType: "campamento",
    destinationName: "Campamento Subterráneo Nómada",
    x: 160, y: 125,
    spawnX: 160, spawnY: 210,
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 160, y: 210 },
      { x: 205, y: 230 },
      { x: 120, y: 190 },
    ],
  },
  {
    id: "desierto_B3_santuario",
    regionId: "desierto",
    sectorId: "B3",
    settlementType: "pueblo",
    destinationName: "Pueblo del Oasis",
    x: 300, y: 560,
    spawnX: 300, spawnY: 490,
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 300, y: 490 },
      { x: 255, y: 470 },
      { x: 345, y: 510 },
    ],
  },
  {
    id: "desierto_B2_santuario",
    regionId: "desierto",
    sectorId: "B2",
    settlementType: "ciudad",
    destinationName: "Ciudadela del Mercado",
    x: 390, y: 590,
    spawnX: 390, spawnY: 500,
    safeRadius: SANCTUARY_RADIUS,
    spawnCandidates: [
      { x: 390, y: 500 },
      { x: 345, y: 475 },
      { x: 435, y: 525 },
    ],
  },
];

const SANCTUARY_MAP = Object.fromEntries(SANCTUARIES.map(s => [s.id, s]));

// El portal se vuelve interactuable únicamente cuando los pies del jugador
// están sobre la plataforma central. La elipse evita activaciones laterales
// desde fuera de las escaleras o detrás de la estructura.
export function isOnSanctuaryPlatform(sanctuary, playerX, playerY) {
  if (!sanctuary) return false;
  const zone = sanctuary.interactionZone || {
    shape: "ellipse",
    x: sanctuary.x,
    y: sanctuary.y,
    rx: 34,
    ry: 24,
  };
  const cx = zone.x ?? sanctuary.x;
  const cy = zone.y ?? sanctuary.y;
  if (zone.shape === "rect") {
    const halfW = (zone.w ?? 68) / 2;
    const halfH = (zone.h ?? 48) / 2;
    return Math.abs(playerX - cx) <= halfW && Math.abs(playerY - cy) <= halfH;
  }
  const rx = Math.max(1, zone.rx ?? 34);
  const ry = Math.max(1, zone.ry ?? 24);
  const nx = (playerX - cx) / rx;
  const ny = (playerY - cy) / ry;
  return nx * nx + ny * ny <= 1;
}

export function getSanctuaryById(id) {
  return SANCTUARY_MAP[id] || null;
}

export function getSanctuaryForSector(regionId, sectorId) {
  return SANCTUARIES.find(s => s.regionId === regionId && s.sectorId === sectorId) || null;
}

export function getSanctuariesForRegion(regionId) {
  return SANCTUARIES.filter(s => s.regionId === regionId);
}

export function getInitialSanctuary() {
  return SANCTUARY_MAP["verde_A2_santuario"];
}

export function getRegionIndex(regionId) {
  const normalized = normalizeRegionId(regionId, "verde");
  const index = PLAYABLE_REGION_IDS.indexOf(normalized);
  return index >= 0 ? index : 0;
}

// Devuelve la posición de aparición segura frente al portal del santuario.
// Comprueba colisiones contra los sólidos del mundo; si el spawn principal
// colisiona, prueba los candidatos manuales. Nunca usa Math.random.
export function getSafeSanctuarySpawn(regionId, sectorId, sanctuaryId, world) {
  const sanctuary = sanctuaryId
    ? getSanctuaryById(sanctuaryId)
    : getSanctuaryForSector(regionId, sectorId);
  if (!sanctuary) return null;

  const solids = world?.solids || [];
  const W = world?.W || 960;
  const H = world?.H || 720;
  const water = world?.terrainShapes || world?.water || [];

  const isBlocked = (x, y) => {
    if (x < 40 || y < 40 || x > W - 40 || y > H - 40) return true;
    for (const s of solids) {
      if (x >= s.x - 8 && x <= s.x + (s.w || 0) + 8 &&
          y >= s.y - 8 && y <= s.y + (s.h || 0) + 8) return true;
    }
    return false;
  };

  // Probar el spawn principal
  if (!isBlocked(sanctuary.spawnX, sanctuary.spawnY)) {
    return { x: sanctuary.spawnX, y: sanctuary.spawnY, sanctuary };
  }
  // Probar candidatos manuales (sin aleatoriedad)
  for (const c of sanctuary.spawnCandidates || []) {
    if (!isBlocked(c.x, c.y)) {
      return { x: c.x, y: c.y, sanctuary };
    }
  }
  // Último recurso: un punto fijo en el sendero del asentamiento
  const fallback = { x: sanctuary.x, y: Math.min(H - 60, sanctuary.y + 90) };
  return { x: fallback.x, y: fallback.y, sanctuary };
}

// Valida que la zona del santuario esté libre de objetos incompatibles.
// Elimina sólidos no esenciales dentro del radio seguro del santuario.
export function validateSanctuaryZone(world, sanctuary) {
  if (!world || !sanctuary) return { ok: true, removed: 0 };
  const removed = [];
  const r = sanctuary.safeRadius || SANCTUARY_RADIUS;

  // Limpiar sólidos dentro del radio seguro (excepto los del propio santuario)
  if (world.solids) {
    world.solids = world.solids.filter(s => {
      if (s._sanctuary) return true;
      const cx = s.x + (s.w || 0) / 2;
      const cy = s.y + (s.h || 0) / 2;
      const dist = Math.hypot(cx - sanctuary.x, cy - sanctuary.y);
      if (dist < r) { removed.push(s); return false; }
      return true;
    });
  }

  // NPC, cofres y objetivos narrativos NO se eliminan. La pasada global de
  // accesibilidad y separación los reubica fuera del portal. Borrarlos podía
  // dejar una misión aceptada sin su objetivo físico.

  // Limpiar enemigos dentro del radio seguro
  if (world.enemies) {
    world.enemies = world.enemies.filter(e => Math.hypot(e.x - sanctuary.x, e.y - sanctuary.y) >= r);
  }

  // Limpiar decoración sólida dentro del radio seguro
  if (world.decor) {
    world.decor = world.decor.filter(d => {
      if (!d.solid) return true;
      const cx = d.x + (d.w || d.sz || 0) / 2;
      const cy = d.y + (d.h || d.sz || 0) / 2;
      const dist = Math.hypot(cx - sanctuary.x, cy - sanctuary.y);
      if (dist < r && d.icon !== "shrine" && d.icon !== "sanctuary_portal") {
        removed.push(d);
        return false;
      }
      return true;
    });
  }

  return { ok: true, removed: removed.length };
}

// Migra un guardado antiguo al formato de santuarios.
// Si no tiene activatedSanctuaries, activa el santuario inicial apropiado.
export function migrateSaveSanctuaries(save, currentRegionId) {
  if (!save) return save;
  const regionId = normalizeRegionId(
    save.worldState?.currentRegionId || save.lastRegionId || save.regionId || currentRegionId,
    "verde",
  );
  const regionIdx = getRegionIndex(regionId);
  const actualRegionId = PLAYABLE_REGION_IDS[regionIdx] || regionId;

  const activated = save.activatedSanctuaries?.length
    ? new Set(save.activatedSanctuaries)
    : new Set();

  let lastId = save.lastActivatedSanctuaryId;

  // Si no hay último santuario, usar el del campamento de la región actual
  if (!lastId) {
    const sectorId = save.worldState?.currentNodeId || save.lastSectorId || save.sectorId || ["A2", "B1", "A1"][regionIdx] || "A2";
    let fallback = getSanctuaryForSector(actualRegionId, sectorId);
    if (!fallback) fallback = getSanctuariesForRegion(actualRegionId)[0];
    if (fallback) {
      lastId = fallback.id;
      activated.add(fallback.id);
    }
  } else {
    activated.add(lastId);
  }

  // El santuario inicial de Verde siempre está activado
  const initial = getInitialSanctuary();
  if (initial) activated.add(initial.id);

  return {
    ...save,
    activatedSanctuaries: [...activated],
    unlockedSanctuaries: save.unlockedSanctuaries?.length ? save.unlockedSanctuaries : [...activated],
    lastActivatedSanctuaryId: lastId,
  };
}

// Resuelve el santuario y posición de spawn para continuar partida.
export function resolveContinueSpawn(save, currentRegionId, world) {
  const migrated = migrateSaveSanctuaries(save, currentRegionId);
  const lastId = migrated.lastActivatedSanctuaryId;
  const sanctuary = lastId ? getSanctuaryById(lastId) : null;

  if (sanctuary) {
    const spawn = getSafeSanctuarySpawn(sanctuary.regionId, sanctuary.sectorId, sanctuary.id, world);
    if (spawn) {
      return {
        sanctuary,
        spawnPos: { x: spawn.x, y: spawn.y },
        regionIndex: getRegionIndex(sanctuary.regionId),
        sectorId: sanctuary.sectorId,
        activatedSanctuaries: migrated.activatedSanctuaries,
        lastActivatedSanctuaryId: lastId,
        unlockedSanctuaries: migrated.unlockedSanctuaries,
      };
    }
  }

  // Fallback: santuario inicial
  const initial = getInitialSanctuary();
  return {
    sanctuary: initial,
    spawnPos: { x: initial.spawnX, y: initial.spawnY },
    regionIndex: 0,
    sectorId: "A2",
    activatedSanctuaries: [initial.id],
    lastActivatedSanctuaryId: initial.id,
    unlockedSanctuaries: [initial.id],
  };
}

// Comprueba si se puede viajar (no en combate, no en diálogo, etc.)
export function canTravelToSanctuary(gameState) {
  if (gameState.inCombat) return { ok: false, reason: "No puedes viajar durante el combate." };
  if (gameState.diceAnim) return { ok: false, reason: "No puedes viajar durante una tirada de dados." };
  if (gameState.npcDialog) return { ok: false, reason: "No puedes viajar durante un diálogo." };
  if (gameState.showIntro) return { ok: false, reason: "No puedes viajar durante la secuencia narrativa." };
  if (gameState.enemy) return { ok: false, reason: "No puedes viajar con un enemigo activo." };
  if (gameState.bossActive) return { ok: false, reason: "No puedes viajar durante un encuentro de jefe." };
  return { ok: true };
}