// Proyecto Atlas UI v3 — datos visuales. No contiene lógica jugable.

export const ATLAS_UI_VERSION = "3.0-integration-kit-v1";
export const ATLAS_UI_BASE_VERSION = "2.20.0";

export const ATLAS_UI_REGIONS = {
  verde: { id: "verde", label: "Región Verde", className: "atlas-region-verde", accent: "#4e9a55" },
  fria: { id: "fria", label: "Región Ártica", className: "atlas-region-fria", accent: "#58b7d8" },
  desierto: { id: "desierto", label: "Región Árida", className: "atlas-region-desierto", accent: "#d89a43" },
};

export const ATLAS_UI_BUTTON_VARIANTS = ["primary", "secondary", "success", "warning", "danger", "ghost"];
export const ATLAS_UI_DENSITIES = ["clean", "full"];
export const ATLAS_UI_MODES = ["menu", "character-select", "exploration", "board", "dungeon", "combat", "hub", "modal", "pause"];

export function getAtlasUiRegion(regionId) {
  return ATLAS_UI_REGIONS[regionId] || null;
}

export function getAtlasUiRootClass({ regionId, mode, className = "" } = {}) {
  const regionClass = getAtlasUiRegion(regionId)?.className || "";
  return ["atlas-ui-v3", regionClass, mode ? `atlas-ui-mode-${mode}` : "", className].filter(Boolean).join(" ");
}
