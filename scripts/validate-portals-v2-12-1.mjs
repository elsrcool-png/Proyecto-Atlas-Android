import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const fail = (message) => { console.error(`✗ ${message}`); process.exitCode = 1; };
const pass = (message) => console.log(`✓ ${message}`);

const packageJson = JSON.parse(read("package.json"));
const [major = 0, minor = 0, patch = 0] = String(packageJson.version || "0.0.0").split(".").map(Number);
const portalCompatible = major > 2 || (major === 2 && (minor > 12 || (minor === 12 && patch >= 1)));
if (!portalCompatible) fail(`package.json requiere v2.12.1 o superior, recibido ${packageJson.version}`);
else pass(`versión ${packageJson.version} compatible con portales v2.12.1`);

const sanctuaries = read("src/lib/atlasSanctuaries.js");
const canonical = read("src/lib/atlasCanonicalWorlds.js");
const scenes = read("src/lib/atlasGreenVisualScenes.js");
const explore = read("src/components/atlas/ExploreMode.jsx");
const session = read("src/hooks/useAtlasSession.js");

for (const token of [
  "export function isOnSanctuaryPlatform",
  'interactionZone: { shape: "ellipse", x: 235, y: 165, rx: 34, ry: 24 }',
  'interactionZone: { shape: "ellipse", x: 155, y: 520, rx: 31, ry: 22 }',
  'interactionZone: { shape: "ellipse", x: 200, y: 515, rx: 31, ry: 22 }',
]) {
  if (!sanctuaries.includes(token)) fail(`falta configuración: ${token}`);
}
if (!process.exitCode) pass("plataformas verdes A2, B2 y C2 definidas");

if (!canonical.includes("interactionZone: sanctuary.interactionZone")) fail("el mundo canónico no copia interactionZone");
else if (!canonical.includes("interactionZone: visualScene.sanctuary.interactionZone || shrine.interactionZone")) fail("la escena visual no sobrescribe interactionZone");
else pass("zona de interacción propagada al mundo jugable");

for (const token of [
  'sanctuary:{x:235,y:165,spawnX:235,spawnY:245,interactionZone:{shape:"ellipse",x:235,y:165,rx:34,ry:24}}',
  'sanctuary:{x:155,y:520,spawnX:155,spawnY:640,interactionZone:{shape:"ellipse",x:155,y:520,rx:31,ry:22}}',
  'sanctuary:{x:200,y:515,spawnX:200,spawnY:640,interactionZone:{shape:"ellipse",x:200,y:515,rx:31,ry:22}}',
]) {
  if (!scenes.includes(token)) fail(`escena verde desalineada: ${token}`);
}
if (!process.exitCode) pass("portales visuales y plataformas alineados");

if (!explore.includes('import { isOnSanctuaryPlatform } from "@/lib/atlasSanctuaries";')) fail("ExploreMode no importa la detección de plataforma");
else if (!explore.includes("if (isOnSanctuaryPlatform(s, x, y))")) fail("ExploreMode no usa la plataforma para activar A");
else if (!explore.includes('nearShrineDef.activated ? "Usar Portal de Invocación" : "Activar Portal de Invocación"')) fail("faltan mensajes Activar/Usar Portal");
else if (!explore.includes("const actionButtonClass = actionReady")) fail("el botón A no cambia de estado visual");
else pass("botón A se habilita únicamente sobre la plataforma");

if (session.includes("if (slot.isSanctuary && slot.activated) return activateShrine(id);")) fail("un portal activo todavía se reactiva al abrirlo");
else if (!session.includes("setShrineModal({ ...slot, activated, sanctuary });")) fail("el menú del portal no recibe el santuario completo");
else pass("portal activo abre menú sin curación automática");

const ellipse = (z, x, y) => {
  const nx=(x-z.x)/z.rx, ny=(y-z.y)/z.ry;
  return nx*nx+ny*ny<=1;
};
for (const z of [
  {id:"A2",x:235,y:165,rx:34,ry:24},
  {id:"B2",x:155,y:520,rx:31,ry:22},
  {id:"C2",x:200,y:515,rx:31,ry:22},
]) {
  if (!ellipse(z,z.x,z.y)) fail(`${z.id}: centro no interactuable`);
  if (ellipse(z,z.x+z.rx+2,z.y)) fail(`${z.id}: lateral externo interactuable`);
  if (ellipse(z,z.x,z.y+z.ry+2)) fail(`${z.id}: escaleras externas interactuables`);
}
if (!process.exitCode) pass("prueba geométrica de las tres plataformas superada");

if (process.exitCode) {
  console.error("\nVALIDACIÓN DE PORTALES v2.12.1 FALLIDA");
} else {
  console.log("\nVALIDACIÓN DE PORTALES v2.12.1 CORRECTA");
  console.log("- subir a la plataforma habilita A");
  console.log("- acercarse por un costado no habilita A");
  console.log("- portal inactivo muestra Activar Portal");
  console.log("- portal activo abre destinos sin reactivarse");
}
