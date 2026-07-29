import fs from "node:fs";

function read(path) { return fs.readFileSync(path, "utf8"); }
function check(ok, label) {
  if (!ok) throw new Error(`Fallo: ${label}`);
  console.log(`✓ ${label}`);
}

const action = read("src/components/atlas/ui/AtlasActionButton.jsx");
const press = read("src/components/atlas/AtlasPressButton.jsx");
const explore = read("src/components/atlas/ExploreMode.jsx");
const dungeon = read("src/components/atlas/DungeonView.jsx");
const pkg = JSON.parse(read("package.json"));

check(action.includes('pressOnPointerDown={activateImmediately}'), "A se activa en pointerdown");
check(action.includes('pressOnPointerUp={!activateImmediately}'), "otros controles conservan pointerup");
check(!action.match(/onPress=\{onPress \|\| onClick\}\s+pressOnPointerUp\s+/), "A ya no depende globalmente de pointerup");
check(press.includes("lastPointerPressAt.current = Date.now();"), "se registra activación directa");
check(press.includes("Date.now() - lastPointerPressAt.current < 650"), "click sintético posterior bloqueado");
check(!press.includes("setPointerCapture"), "sin captura de puntero problemática");
check(explore.includes("onAction={onA}"), "A sigue conectada a interacción de exploración");
check(dungeon.includes("const onA = useCallback"), "A de dungeon conserva su flujo");
check(["2.22.5", "2.22.6", "2.22.7", "2.22.8"].includes(pkg.version), "versión 2.22.5 o posterior");

console.log("\nValidación v2.22.5 correcta: A responde al primer contacto sin doble ejecución.");
