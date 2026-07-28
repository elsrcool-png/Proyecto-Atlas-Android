const RARITY_ALIASES = {
  comun: "common",
  común: "common",
  common: "common",
  poco_comun: "uncommon",
  "poco común": "uncommon",
  uncommon: "uncommon",
  raro: "rare",
  rare: "rare",
  epico: "epic",
  épico: "epic",
  epic: "epic",
  legendario: "legendary",
  legendary: "legendary",
  reliquia: "relic",
  relic: "relic",
};

export const ATLAS_UI_RARITY = {
  common: { label: "Común", color: "#b7c0ca", border: "rgba(183,192,202,.48)" },
  uncommon: { label: "Poco común", color: "#64c77a", border: "rgba(100,199,122,.58)" },
  rare: { label: "Raro", color: "#55a7e8", border: "rgba(85,167,232,.62)" },
  epic: { label: "Épico", color: "#b47ae6", border: "rgba(180,122,230,.62)" },
  legendary: { label: "Legendario", color: "#efb84a", border: "rgba(239,184,74,.72)" },
  relic: { label: "Reliquia", color: "#48d4c7", border: "rgba(72,212,199,.72)" },
};

export function normalizeAtlasUiRarity(value) {
  if (!value) return "common";
  return RARITY_ALIASES[String(value).trim().toLowerCase()] || "common";
}

export function getAtlasUiRarity(value) {
  return ATLAS_UI_RARITY[normalizeAtlasUiRarity(value)];
}
