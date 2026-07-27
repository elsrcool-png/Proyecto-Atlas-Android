// PROYECTO ATLAS — Lore base y narrativa de ambientación
export const INTRO_LINES = [
  "Antes de que existieran caminos, reinos o fronteras, existía Atlas.",
  "Un mundo sostenido por una fuerza antigua que observa cada nacimiento, cada batalla y cada decisión.",
  "Pero algo cambió.",
  "Una nueva presencia ha llegado a este mundo.",
  "Tú.",
  "Atlas sabe que estás aquí.",
  "Ahora observará tu camino.",
];

export const MAIN_NPC_LORE = [
  "Todos vivimos bajo la mirada de Atlas.",
  "Dicen que Atlas observa nuestras decisiones.",
  "Algunos creen que los santuarios son lugares donde Atlas nos recuerda que sigue presente.",
  "Pero nadie sabe qué busca realmente.",
  "Atlas no es un lugar. Es lo que sostiene el mundo.",
  "Las regiones no son azar: son partes de algo más grande que solo Atlas comprende.",
  "Cuando el mundo se vuelve peligroso, dicen que Atlas lo percibe antes que nadie.",
];

export const MECHANIC_LORE = {
  threat: "El nivel de amenaza refleja cómo Atlas percibe los cambios y peligros del mundo.",
  shrines: "Los santuarios son lugares donde la presencia de Atlas se siente más fuerte.",
  events: "Los eventos son momentos en que Atlas responde o altera el mundo.",
  exploration: "Descubres un mundo que ya tenía historia antes de tu llegada.",
};

export function pickLoreLine() {
  return MAIN_NPC_LORE[Math.floor(Math.random() * MAIN_NPC_LORE.length)];
}

export const CORRUPTION_LORE = {
  atlas: "Atlas es la conciencia que sostiene el mundo. No actúa por maldad: cree que solo un mundo controlado puede sobrevivir.",
  corruption: "La Corrupción es cómo Atlas ejerce su influencia. Las criaturas no nacieron siendo monstruos: fueron corrompidas.",
  threat: "Mientras mayor es la Amenaza, más le cuesta a Atlas distinguir proteger de controlar. Por eso el mundo cambia con ella.",
  adventurers: "Muchos aventureros recorrieron Atlas antes que tú. Los más poderosos terminaron cayendo bajo la Corrupción.",
};

// Integrado con el Documento Maestro — los jefes ahora usan CAMPAIGN_BOSSES
import { CAMPAIGN_BOSSES } from "@/lib/atlasCampaign";

export const BOSS_CANON = CAMPAIGN_BOSSES;

export function getBossCanon(regionId) {
  return BOSS_CANON[regionId] || BOSS_CANON.verde;
}