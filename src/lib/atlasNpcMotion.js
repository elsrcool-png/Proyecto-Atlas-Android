// Movimiento y animación independiente para NPC.
// Usa perfiles deterministas por id para evitar que todos giren, caminen o
// respiren exactamente al mismo tiempo.

export function stableEntityHash(value = "npc") {
  const text = String(value || "npc");
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function npcIdleAnimationStyle(id) {
  const h = stableEntityHash(id);
  const duration = 2.05 + ((h >>> 5) % 95) / 100;
  const delay = -(((h >>> 13) % 240) / 100);
  return {
    animationDuration: `${duration.toFixed(2)}s`,
    animationDelay: `${delay.toFixed(2)}s`,
  };
}

export function npcTurnProfile(id) {
  const h = stableEntityHash(id);
  const directions = ["down", "left", "up", "right"];
  return {
    initialFace: directions[h % directions.length],
    initialDelay: 900 + ((h >>> 4) % 3300),
    interval: 3400 + ((h >>> 12) % 2600),
    step: (h & 1) === 0 ? 1 : -1,
  };
}

export function createVillagerMotion(villager, index = 0) {
  const h = stableEntityHash(villager?.id || `villager_${index}`);
  const angle = ((h % 360) * Math.PI) / 180;
  const startsWalking = ((h >>> 8) % 3) !== 0;
  return {
    ...villager,
    home: villager.home || { x: villager.x, y: villager.y },
    angle,
    motionMode: startsWalking ? "walk" : "rest",
    timer: startsWalking ? 45 + ((h >>> 9) % 130) : 70 + ((h >>> 11) % 210),
    walkSpeed: 0.22 + ((h >>> 15) % 34) / 100,
    roamRadius: 34 + ((h >>> 20) % 47),
    facing: Math.cos(angle) < 0 ? "left" : "right",
  };
}
