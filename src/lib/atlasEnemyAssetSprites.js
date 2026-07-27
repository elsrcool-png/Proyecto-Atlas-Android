// PROYECTO ATLAS — Cargador visual maestro de mobs y jefes hasta Región Ártica.
// Usa WebP transparentes de cuatro direcciones y conserva el renderer procedural
// anterior como respaldo mientras una imagen carga o cuando un asset no existe.

export const ENEMY_MASTER_ROOT = "/assets/atlas/enemies/maestro_v1/runtime";

const ENEMY_ASSETS = Object.freeze({
  orco_bruto: { assetId: "orco_bruto", zone: "region_verde", kind: "mob", archetype: "humanoid_heavy", canvas: [96, 112] },
  chaman_orco: { assetId: "chaman_orco", zone: "region_verde", kind: "mob", archetype: "humanoid_caster", canvas: [96, 112] },
  asesino_orco: { assetId: "asesino_orco", zone: "region_verde", kind: "mob", archetype: "humanoid_agile", canvas: [96, 112] },
  lobo_salvaje: { assetId: "lobo_salvaje", zone: "region_verde", kind: "mob", archetype: "quadruped", canvas: [112, 80], displayWidthFactor: 1.12 },
  brujo_feral: { assetId: "brujo_feral", zone: "region_verde", kind: "mob", archetype: "humanoid_large_caster", canvas: [104, 120] },
  pantera_sombria: { assetId: "pantera_sombria", zone: "region_verde", kind: "mob", archetype: "quadruped_shadow", canvas: [112, 80], displayWidthFactor: 1.12 },
  guardian_verde: { assetId: "guardian_verde", zone: "region_verde", kind: "boss", archetype: "boss_humanoid", canvas: [144, 160] },
  guerrero_esqueletico: { assetId: "guerrero_esqueletico", zone: "region_artica", kind: "mob", archetype: "undead_heavy", canvas: [88, 104] },
  necromante: { assetId: "necromante", zone: "region_artica", kind: "mob", archetype: "undead_caster", canvas: [88, 104] },
  asesino_esqueletico: { assetId: "asesino_esqueletico", zone: "region_artica", kind: "mob", archetype: "undead_agile", canvas: [88, 104] },
  // El juego usa aurel_portador; el paquete visual usa aurel_ultimo_portador.
  aurel_portador: { assetId: "aurel_ultimo_portador", zone: "region_artica", kind: "boss", archetype: "boss_humanoid", canvas: [144, 160] },
  aurel_ultimo_portador: { assetId: "aurel_ultimo_portador", zone: "region_artica", kind: "boss", archetype: "boss_humanoid", canvas: [144, 160] },
});

const VALID_DIRECTIONS = new Set(["down", "up", "left", "right"]);
const imageCache = new Map();
let preloadStarted = false;

export const ENEMY_MASTER_IDS = Object.freeze([
  "orco_bruto", "chaman_orco", "asesino_orco", "lobo_salvaje", "brujo_feral", "pantera_sombria",
  "guardian_verde", "guerrero_esqueletico", "necromante", "asesino_esqueletico", "aurel_ultimo_portador",
]);

export function getEnemyAssetProfile(type, variant) {
  if (type !== "monster" && type !== "boss") return null;
  return ENEMY_ASSETS[variant] || null;
}

export function hasEnemyAssetVisual(type, variant) {
  return !!getEnemyAssetProfile(type, variant);
}

export function getEnemyAssetPath(type, variant, dir = "down") {
  const profile = getEnemyAssetProfile(type, variant);
  if (!profile) return null;
  const direction = VALID_DIRECTIONS.has(dir) ? dir : "down";
  return `${ENEMY_MASTER_ROOT}/${profile.assetId}/${direction}.webp`;
}

export function getEnemyAssetDisplayMetrics(type, variant, size = 44) {
  const profile = getEnemyAssetProfile(type, variant);
  if (!profile) return null;
  const [nativeWidth, nativeHeight] = profile.canvas;
  const width = Math.round(size * (profile.displayWidthFactor || 1));
  const height = Math.max(1, Math.round(width * nativeHeight / nativeWidth));
  return { width, height, nativeWidth, nativeHeight, anchor: "bottom_center", profile };
}

function getCachedImage(path) {
  if (!path || typeof Image === "undefined") return null;
  const current = imageCache.get(path);
  if (current) return current;

  const entry = { status: "loading", image: new Image(), listeners: new Set() };
  entry.image.decoding = "async";
  entry.image.onload = () => {
    entry.status = "ready";
    for (const listener of entry.listeners) listener();
    entry.listeners.clear();
  };
  entry.image.onerror = () => {
    entry.status = "error";
    entry.listeners.clear();
  };
  entry.image.src = path;
  imageCache.set(path, entry);
  return entry;
}

function paintAsset(canvas, image, profile, dir, frame, hurt) {
  const [width, height] = profile.canvas;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const walking = Number(frame) % 2 === 1;
  const dx = walking ? (dir === "left" ? -1 : dir === "right" ? 1 : 0.6) : 0;
  const dy = walking ? -1.5 : 0;
  ctx.drawImage(image, dx, dy, width, height);

  if (hurt) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(220,40,40,0.42)";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }
}

// Retorna true cuando el arte maestro ya fue pintado. Si aún carga, retorna
// false para que el renderer procedural funcione como respaldo temporal.
export function drawEnemyAssetSprite(canvas, type, variant, dir = "down", frame = 0, hurt = false) {
  if (!canvas) return false;
  const profile = getEnemyAssetProfile(type, variant);
  const path = getEnemyAssetPath(type, variant, dir);
  if (!profile || !path) return false;

  const requestKey = `${path}|${frame}|${hurt ? 1 : 0}`;
  canvas.__atlasEnemyAssetRequest = requestKey;
  const entry = getCachedImage(path);
  if (!entry) return false;

  if (entry.status === "ready") {
    paintAsset(canvas, entry.image, profile, dir, frame, hurt);
    return true;
  }
  if (entry.status === "loading") {
    const repaint = () => {
      if (canvas.__atlasEnemyAssetRequest !== requestKey) return;
      paintAsset(canvas, entry.image, profile, dir, frame, hurt);
    };
    entry.listeners.add(repaint);
  }
  return false;
}

export function preloadEnemyAssetVisuals() {
  if (preloadStarted || typeof Image === "undefined") return;
  preloadStarted = true;
  for (const id of ENEMY_MASTER_IDS) {
    const type = id === "guardian_verde" || id === "aurel_ultimo_portador" ? "boss" : "monster";
    const codeId = id === "aurel_ultimo_portador" ? "aurel_portador" : id;
    for (const dir of VALID_DIRECTIONS) getCachedImage(getEnemyAssetPath(type, codeId, dir));
  }
}
