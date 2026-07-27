import { GREEN_VISUAL_SCENES } from "../src/lib/atlasGreenVisualScenes.js";

const EXPECTED = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];
const errors = [];
const notes = [];
const NPC_RADIUS = 16;
const MIN_NPC_DISTANCE = 55;
const PATH_SENSITIVE_TAGS = new Set([
  "tree", "fire", "prop", "fence", "tent",
  "village-building", "city-building", "forge", "tower",
]);
const PATH_EXEMPT_TAGS = new Set(["portal", "bridge", "fortress", "arch", "ruin", "cave"]);

const intersects = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const pointDistanceToRect = (point, rect) => {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.w));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.h));
  return Math.hypot(dx, dy);
};

const collisionsFor = (item) => {
  const list = Array.isArray(item.collision) ? item.collision : item.collision ? [item.collision] : [];
  return list.map((collision) => ({
    x: item.x + collision.x,
    y: item.y + collision.y,
    w: collision.w,
    h: collision.h,
  }));
};

const hasAnyTag = (tags, set) => tags.some((tag) => set.has(tag));

const ids = Object.keys(GREEN_VISUAL_SCENES).sort();
if (ids.join(",") !== EXPECTED.sort().join(",")) {
  errors.push(`sectores inesperados: ${ids.join(", ")}`);
}

for (const [sectorId, scene] of Object.entries(GREEN_VISUAL_SCENES)) {
  if (scene.version !== "2.12.0") errors.push(`${sectorId}: versión ${scene.version}, esperada 2.12.0`);
  if (scene.depthMode !== "feet-y") errors.push(`${sectorId}: depthMode no es feet-y`);
  if (!scene.navigationLanes?.length) errors.push(`${sectorId}: no define navigationLanes`);

  for (const item of scene.objects || []) {
    // Los objetos del catálogo maestro tienen lienzo cuadrado. Esto evita que
    // object-fit: contain altere la escala efectiva y el anclaje inferior.
    if (item.width !== item.height) {
      errors.push(`${sectorId}/${item.id}: contenedor no cuadrado ${item.width}x${item.height}`);
    }
    const isPortal = (item.tags || []).includes("portal");
    if (item.depthSort !== false && !isPortal && item.depthY !== item.y) {
      errors.push(`${sectorId}/${item.id}: depthY ${item.depthY} no coincide con feet-y ${item.y}`);
    }
    if (isPortal && !(item.depthY < item.y && item.depthY > item.y - item.height * 0.4)) {
      errors.push(`${sectorId}/${item.id}: profundidad interactiva del portal inválida`);
    }

    const tags = item.tags || [];
    if (!hasAnyTag(tags, PATH_SENSITIVE_TAGS) || hasAnyTag(tags, PATH_EXEMPT_TAGS)) continue;
    for (const collision of collisionsFor(item)) {
      for (const lane of scene.navigationLanes || []) {
        if (intersects(collision, lane)) {
          errors.push(`${sectorId}/${item.id}: invade ruta ${lane.id}`);
        }
      }
    }
  }

  const npcEntries = Object.entries(scene.npcAnchors || {});
  for (const [role, point] of npcEntries) {
    for (const collision of scene.collisions || []) {
      if (pointDistanceToRect(point, collision) < NPC_RADIUS) {
        errors.push(`${sectorId}/npc:${role}: demasiado cerca de ${collision.id}`);
      }
    }

    // Ningún NPC de servicio debe quedar dentro de la silueta proyectada de
    // una estructura situada al sur. En juego esa estructura lo ocultaría.
    for (const item of scene.objects || []) {
      if (!(item.tags || []).includes("structure")) continue;
      if (point.y >= item.y) continue;
      const anchorX = item.anchorX ?? 0.5;
      const anchorY = item.anchorY ?? 1;
      const left = item.x - item.width * anchorX;
      const top = item.y - item.height * anchorY;
      const right = left + item.width;
      const insideProjectedSilhouette =
        point.x > left + 8 && point.x < right - 8 &&
        point.y > top + 8 && point.y < item.y - 2;
      if (insideProjectedSilhouette) {
        errors.push(`${sectorId}/npc:${role}: quedaría oculto detrás de ${item.id}`);
      }
    }
  }

  for (let i = 0; i < npcEntries.length; i += 1) {
    for (let j = i + 1; j < npcEntries.length; j += 1) {
      const [roleA, a] = npcEntries[i];
      const [roleB, b] = npcEntries[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < MIN_NPC_DISTANCE) {
        errors.push(`${sectorId}: NPC ${roleA} y ${roleB} demasiado juntos (${distance.toFixed(1)} px)`);
      }
    }
  }

  for (const tree of (scene.objects || []).filter((item) => (item.tags || []).includes("tree"))) {
    for (const water of scene.waterZones || []) {
      const trunkInside = tree.x >= water.x && tree.x <= water.x + water.w && tree.y >= water.y && tree.y <= water.y + water.h;
      if (trunkInside) errors.push(`${sectorId}/${tree.id}: tronco anclado dentro del agua`);
    }
  }

  notes.push(`${sectorId}: ${scene.objects.length} objetos, ${npcEntries.length} NPC anclados, ${scene.navigationLanes.length} rutas protegidas`);
}

if (errors.length) {
  console.error("VALIDACIÓN COMPOSICIÓN REGIÓN VERDE v2.12 FALLIDA");
  for (const error of errors) console.error(" -", error);
  process.exit(1);
}

console.log("VALIDACIÓN COMPOSICIÓN REGIÓN VERDE v2.12 CORRECTA");
console.log(" - escalas maestras conservan proporción 1:1");
console.log(" - orden de profundidad por feet-y activo");
console.log(" - NPC fuera de colisiones y siluetas de edificios");
console.log(" - rutas principales libres de árboles, fogatas, props y edificios sensibles");
console.log(" - árboles fuera de zonas de agua declaradas");
for (const note of notes) console.log(` - ${note}`);
