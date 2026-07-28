import fs from "node:fs";

function read(path) { return fs.readFileSync(path, "utf8"); }
function requireText(text, token, label) {
  if (!text.includes(token)) throw new Error(`Falta ${label}: ${token}`);
}

const game = read("src/pages/Game.jsx");
const press = read("src/components/atlas/AtlasPressButton.jsx");
const action = read("src/components/atlas/ui/AtlasActionButton.jsx");
const menu = read("src/components/atlas/ui-v3/MainMenuV3.jsx");

requireText(game, "MainMenuLegacy", "fallback de menú");
requireText(game, "getAtlasIntegrationFlags().uiV3.enabled", "interruptor UI v3");
requireText(game, "uiV3Enabled ? MainMenuV3 : MainMenuLegacy", "selección segura de menú");
requireText(game, "uiV3Enabled ? SaveSlotsModalV3 : SaveSlotsModalLegacy", "fallback de ranuras");
requireText(press, "pressOnPointerDown = false", "click compatible por defecto");
requireText(press, "if (!pressOnPointerDown) return", "pointerdown no invasivo");
requireText(press, 'touchAction: pressOnPointerDown ? "none" : "manipulation"', "touch-action compatible");
requireText(action, "pressOnPointerDown", "modo inmediato de controles de acción");
requireText(menu, "object-cover pointer-events-none", "fondo no interactivo");

console.log("OK v2.22.1: menú estable por defecto, UI v3 protegida y entrada táctil compatible.");
