import fs from "node:fs";

function read(path) { return fs.readFileSync(path, "utf8"); }
function check(ok, label) {
  if (!ok) throw new Error(`Fallo: ${label}`);
  console.log(`✓ ${label}`);
}

const press = read("src/components/atlas/AtlasPressButton.jsx");
const action = read("src/components/atlas/ui/AtlasActionButton.jsx");
const pkg = JSON.parse(read("package.json"));

check(action.includes('const activateImmediately = kind === "a"'), "A conserva activación inmediata");
check(action.includes('pressOnPointerDown={activateImmediately}'), "A usa pointerdown");

check(press.includes("armGhostClickBlock"), "existe bloqueo de click fantasma");
check(press.includes('document.addEventListener("click", blockCompatibilityClick, true)'), "bloqueo opera en captura global");
check(press.includes("maxAgeMs = 520"), "bloqueo temporal acotado");
check(press.includes("maxDistancePx = 48"), "bloqueo limitado a la coordenada del toque");
check(press.includes("clickEvent.stopImmediatePropagation?.()"), "click de compatibilidad no atraviesa al modal");
check(press.includes("event.preventDefault();"), "toque directo cancela compatibilidad nativa");
check(press.includes("event.stopPropagation();"), "toque directo no burbujea");
check(!press.includes("setPointerCapture"), "sin captura de puntero problemática");

const guardedModals = [
  "src/components/atlas/NPCDialog.jsx",
  "src/components/atlas/NpcInteractionMenu.jsx",
  "src/components/atlas/FlavorDialog.jsx",
  "src/components/atlas/RecruitDialog.jsx",
  "src/components/atlas/ChestRewardModal.jsx",
  "src/components/atlas/LootRewardModal.jsx",
  "src/components/atlas/ShopModal.jsx",
  "src/components/atlas/DestinyEventModal.jsx",
];

for (const path of guardedModals) {
  const source = read(path);
  check(
    source.includes("onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}"),
    `${path} cierra solo con un pointerdown real sobre el fondo`
  );
}

check(pkg.version === "2.22.6", "versión 2.22.6");
check(
  pkg.scripts["validate:v2-22"].includes("validate:action-a-v2-22-6"),
  "validación acumulativa usa la corrección nueva"
);

console.log("\nValidación v2.22.6 correcta: el toque A no puede abrir y cerrar el diálogo con el mismo gesto.");
