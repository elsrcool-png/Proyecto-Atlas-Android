// PROYECTO ATLAS — Cargador visual maestro de los 9 personajes jugables.
// Usa sprites WebP transparentes de cuatro direcciones y conserva el dibujo
// procedural anterior como respaldo mientras cargan o si un archivo falla.

export const HERO_MASTER_ROOT = "/assets/atlas/heroes/maestro_v1/runtime";

const HERO_IDS = Object.freeze({
  "Humano:Guerrero": "humano_guerrero",
  "Humano:Mago": "humano_mago",
  "Humano:Pícaro": "humano_picaro",
  "Enano:Guerrero": "enano_guerrero",
  "Enano:Mago": "enano_mago",
  "Enano:Pícaro": "enano_picaro",
  "Elfo:Guerrero": "elfo_guerrero",
  "Elfo:Mago": "elfo_mago",
  "Elfo:Pícaro": "elfo_picaro",
});

const VALID_DIRECTIONS = new Set(["down", "up", "left", "right"]);
const imageCache = new Map();

export const HERO_MASTER_IDS = Object.freeze(Object.values(HERO_IDS));
export const HERO_MASTER_KEYS = Object.freeze(Object.keys(HERO_IDS));

export function getHeroMasterId(race, cls) {
  return HERO_IDS[`${race}:${cls}`] || null;
}

export function hasHeroAssetVisual(race, cls) {
  return !!getHeroMasterId(race, cls);
}

export function getHeroAssetPath(race, cls, dir = "down") {
  const id = getHeroMasterId(race, cls);
  if (!id) return null;
  const direction = VALID_DIRECTIONS.has(dir) ? dir : "down";
  return `${HERO_MASTER_ROOT}/${id}/${direction}.webp`;
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

function applyHurtOverlay(ctx) {
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = "rgba(220,40,40,0.42)";
  ctx.fillRect(0, 0, 36, 48);
  ctx.globalCompositeOperation = "source-over";
}

function paintAsset(canvas, image, dir, frame, hurt) {
  canvas.width = 36;
  canvas.height = 48;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 36, 48);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Ciclo de cuatro apoyos. El punto inferior queda fijo para evitar el efecto
  // de “imagen flotando”; el torso oscila y comprime levemente al plantar pie.
  const phase = ((Number(frame) || 0) % 4 + 4) % 4;
  const side = dir === "left" ? -1 : dir === "right" ? 1 : 0;
  const sway = [-0.55, 0, 0.55, 0][phase] * (side || 0.55);
  const lift = [0, -0.8, 0, -0.8][phase];
  const angle = [-0.018, 0, 0.018, 0][phase] * (side || 0.7);
  const scaleX = [1.012, 0.995, 1.012, 0.995][phase];
  const scaleY = [0.988, 1.007, 0.988, 1.007][phase];
  ctx.save();
  ctx.translate(18 + sway, 48 + lift);
  ctx.rotate(angle);
  ctx.scale(scaleX, scaleY);
  ctx.drawImage(image, -18, -48, 36, 48);
  ctx.restore();
  if (hurt) applyHurtOverlay(ctx);
}

// Retorna true cuando el asset maestro ya fue dibujado. Cuando todavía carga,
// retorna false para que atlasHeroSprites dibuje el respaldo procedural y lo
// reemplaza automáticamente al terminar la carga.
export function drawHeroAssetSprite(canvas, race, cls, dir = "down", frame = 0, hurt = false) {
  if (!canvas) return false;
  const path = getHeroAssetPath(race, cls, dir);
  if (!path) return false;

  const requestKey = `${path}|${frame}|${hurt ? 1 : 0}`;
  canvas.__atlasHeroAssetRequest = requestKey;
  const entry = getCachedImage(path);
  if (!entry) return false;

  if (entry.status === "ready") {
    paintAsset(canvas, entry.image, dir, frame, hurt);
    return true;
  }
  if (entry.status === "loading") {
    const repaint = () => {
      if (canvas.__atlasHeroAssetRequest !== requestKey) return;
      paintAsset(canvas, entry.image, dir, frame, hurt);
    };
    entry.listeners.add(repaint);
  }
  return false;
}

export function preloadHeroAssetVisuals() {
  if (typeof Image === "undefined") return;
  for (const [key] of Object.entries(HERO_IDS)) {
    const [race, cls] = key.split(":");
    for (const dir of VALID_DIRECTIONS) getCachedImage(getHeroAssetPath(race, cls, dir));
  }
}
