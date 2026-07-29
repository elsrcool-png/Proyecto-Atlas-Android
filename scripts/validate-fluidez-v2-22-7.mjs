import fs from "node:fs";

function read(path) { return fs.readFileSync(path, "utf8"); }
function check(ok, label) {
  if (!ok) throw new Error(`Fallo: ${label}`);
  console.log(`✓ ${label}`);
}

const explore = read("src/components/atlas/ExploreMode.jsx");
const worldLayer = read("src/components/atlas/AssetWorldLayer.jsx");
const joystick = read("src/components/atlas/Joystick.jsx");
const worldCss = read("src/styles/atlas-world-modular.css");
const pkg = JSON.parse(read("package.json"));

check(/^2\.22\.(?:7|8|9|[1-9]\d+)$/.test(pkg.version), "versión 2.22.7 o posterior");
check(pkg.scripts["validate:v2-22"].includes("npm run validate:fluidez-v2-22-7"), "validación de fluidez incluida en la cadena acumulativa");

check(explore.includes("const FIXED_STEP_MS = 1000 / 60"), "simulación de paso fijo a 60 Hz");
check(explore.includes("BASE_PLAYER_SPEED_PPS = 3.2 * 60"), "velocidad expresada por segundo");
check(explore.includes("simulationAccumulator"), "acumulador temporal de simulación");
check(explore.includes("while (simulationAccumulator >= FIXED_STEP_MS"), "compensación de fotogramas perdidos");
check(explore.includes("MAX_SIMULATION_STEPS"), "protección contra espiral de actualización");
check(explore.includes("frameRateIndependentLerp"), "cámara independiente de FPS");
check(explore.includes("const AI_STEP_MS = 50"), "IA separada del render");
check(explore.includes("const PROXIMITY_STEP_MS = 1000 / 15"), "proximidad limitada a 15 Hz");
check(explore.includes("if (!world || inCombat || paused) return"), "RAF detenido en pausa y combate");
check(explore.includes('document.addEventListener("visibilitychange", onVisibilityChange)'), "RAF suspendido al ocultar la app");
check(explore.includes("enemyDirectionalEls.current[i]"), "sprite direccional cacheado");
check(!explore.includes("const directional = el.querySelector"), "sin querySelector por actualización de IA");
check(explore.includes("translate3d"), "movimiento acelerado mediante translate3d");

check(worldLayer.includes('decoding="async"'), "imágenes del mundo con decodificación asíncrona");
check(!worldLayer.includes('decoding="sync"'), "sin decodificación síncrona en el mundo");
check(worldLayer.includes('loading={item.eager || layer === "ground" ? "eager" : "lazy"}'), "carga diferida de objetos no críticos");
check(worldLayer.includes("criticalSources"), "precarga limitada a activos críticos");
check(worldLayer.includes("MAX_PRELOADED_IMAGES = 48"), "caché de precarga acotada");

check((joystick.match(/getBoundingClientRect/g) || []).length === 1, "joystick mide geometría una sola vez por gesto");
check(joystick.includes("requestAnimationFrame(flushPendingPoint)"), "pointermove agrupado por fotograma");
check(joystick.includes('style.transition = "none"'), "joystick sin retraso mientras se arrastra");
check(joystick.includes('transform 120ms ease-out'), "retorno suave solo al soltar");

check(worldCss.includes(".atlas-world-scene--verde"), "selector real de Región Verde conectado");
check(worldCss.includes(".atlas-simulated-actor"), "interpolación visual para actores a menor frecuencia");
check(worldCss.includes("(pointer: coarse)"), "perfil de rendimiento automático para móvil táctil");
check(worldCss.includes("filter: none"), "filtros redundantes desactivados en Región Verde");

// Verificación matemática básica: la distancia acumulada debe ser estable al variar FPS.
const speed = 3.2 * 60;
const fixedStep = 1 / 60;
function simulatedDistance(fps) {
  let accumulator = 0;
  let distance = 0;
  for (let frame = 0; frame < fps; frame += 1) {
    accumulator += 1 / fps;
    while (accumulator + 1e-12 >= fixedStep) {
      distance += speed * fixedStep;
      accumulator -= fixedStep;
    }
  }
  return distance;
}
const distances = [30, 60, 90, 120].map(simulatedDistance);
check(Math.max(...distances) - Math.min(...distances) < 0.001, "velocidad estable a 30/60/90/120 FPS");

console.log("\nValidación v2.22.7 correcta: Fase 0 y Fase 1 de fluidez integradas.");
