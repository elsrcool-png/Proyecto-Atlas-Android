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
requireText(press, "pressOnPointerUp = false", "toque breve al soltar");
requireText(press, "const directPointerMode = pressOnPointerDown || pressOnPointerUp", "modo directo centralizado");
requireText(press, 'touchAction: directPointerMode ? "none" : "manipulation"', "touch-action compatible");
requireText(action, "pressOnPointerUp", "acción A por toque breve");
requireText(menu, "object-cover pointer-events-none", "fondo no interactivo");

console.log("OK v2.22.4: menú clásico estable y acción táctil por pulsación breve.");
