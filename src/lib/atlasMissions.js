// PROYECTO ATLAS — Misiones de campaña del Documento Maestro.
// Reemplaza las misiones repetitivas por 45 misiones narrativas encadenadas.
import { CAMPAIGN_MISSIONS } from "@/lib/atlasCampaign";
import { GREEN_CAMPAIGN_V2 } from "@/lib/atlasGreenCampaignV2";
import { ARCTIC_CAMPAIGN_V2 } from "@/lib/atlasArcticCampaignV2";
import { DESERT_CAMPAIGN_V2 } from "@/lib/atlasDesertCampaignV2";

export const SECTOR_NEED = { campamento: 3, pueblo: 3, ciudad: 4 };

// REGION_POOLS se mantiene como fallback para compatibilidad con atlasMissionValidation
const REGION_POOLS = {
  verde: {
    campamento: [
      { type: "combate", tracker: "kill", target: 2, name: "Amenaza del bosque", desc: "Elimina 2 amenazas que rondan el campamento forestal.", reward: { gold: 15, xp: 1 }, role: "main" },
      { type: "supervivencia", tracker: "chest", target: 1, name: "Provisiones del guardabosques", desc: "Abre 1 cofre y reúne provisiones del bosque.", reward: { gold: 10 }, role: "quest" },
      { type: "exploracion", tracker: "reach", target: 1, name: "Sendero olvidado", desc: "Llega al punto de interés marcado en el bosque.", reward: { gold: 12, xp: 1 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 3, name: "Bandidos del claro", desc: "Derrota 3 bandidos que asaltan el claro.", reward: { gold: 20, potion: "hp_s" }, role: "quest" },
      { type: "evento", tracker: "kill", target: 4, name: "Emboscada nocturna", desc: "Repela 4 enemigos en una emboscada nocturna (amenaza alta).", threatMin: 7, reward: { gold: 30, potion: "hp_m" }, role: "paid", cost: 10 },
    ],
    pueblo: [
      { type: "investigacion", tracker: "talk", target: 2, name: "Desapariciones en el bosque", desc: "Habla con 2 NPC para investigar las desapariciones.", reward: { gold: 15, xp: 1 }, role: "main" },
      { type: "recuperacion", tracker: "reach", target: 1, name: "Mercancía escondida", desc: "Llega al claro donde escondieron la mercancía robada.", reward: { gold: 18 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 3, name: "Zona infestada", desc: "Limpia 3 enemigos de la zona infestada.", reward: { gold: 22, potion: "hp_s" }, role: "quest" },
      { type: "supervivencia", tracker: "chest", target: 2, name: "Hierbas raras", desc: "Recoge hierbas raras abriendo 2 cofres.", reward: { gold: 24 }, role: "quest" },
      { type: "evento", tracker: "kill", target: 5, name: "Asalto al pueblo", desc: "Defiende el pueblo de 5 asaltantes (amenaza alta).", threatMin: 7, reward: { gold: 35, potion: "hp_l" }, role: "paid", cost: 15 },
    ],
    ciudad: [
      { type: "investigacion", tracker: "talk", target: 2, name: "Descubrir al traidor", desc: "Habla con 2 NPC para descubrir al traidor.", reward: { gold: 20, xp: 1 }, role: "main" },
      { type: "recuperacion", tracker: "reach", target: 1, name: "Artefacto robado", desc: "Recupera el artefacto llegando al punto señalado.", reward: { gold: 25, xp: 1 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 4, name: "Infiltración", desc: "Derrota 4 guardias durante la infiltración.", reward: { gold: 28, potion: "hp_m" }, role: "quest" },
      { type: "proteccion", tracker: "kill", target: 5, name: "Proteger la caravana", desc: "Mantén viva la caravana: derrota 5 enemigos.", reward: { gold: 32, potion: "hp_m", xp: 1 }, role: "quest" },
      { type: "evento", tracker: "kill", target: 6, name: "Invasión a la ciudadela", desc: "Rechaza 6 élite en la invasión (amenaza alta).", threatMin: 8, reward: { gold: 40, potion: "hp_l", item: "corazon_leon" }, role: "paid", cost: 20 },
      { type: "exploracion", tracker: "reach", target: 1, name: "Bosque Cerrado", wildSector: { col: 2, row: 0 }, desc: "Adéntrate en el Bosque Cerrado del norte y descubre el punto de interés oculto entre la maleza.", reward: { gold: 30, xp: 1 }, role: "quest" },
    ],
  },
  fria: {
    campamento: [
      { type: "combate", tracker: "kill", target: 2, name: "Acecho en la nieve", desc: "Elimina 2 amenazas que acechan en la nieve.", reward: { gold: 15, xp: 1 }, role: "main" },
      { type: "supervivencia", tracker: "chest", target: 1, name: "Suministros congelados", desc: "Abre 1 cofre y recupera suministros congelados.", reward: { gold: 10 }, role: "quest" },
      { type: "exploracion", tracker: "reach", target: 1, name: "Paso del glaciar", desc: "Llega al punto de interés en el paso del glaciar.", reward: { gold: 12, xp: 1 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 3, name: "Manada de la escarcha", desc: "Derrota 3 bestias de la manada de la escarcha.", reward: { gold: 20, potion: "hp_s" }, role: "quest" },
      { type: "evento", tracker: "kill", target: 4, name: "Tormenta de bestias", desc: "Sobrevive a 4 bestias durante la tormenta (amenaza alta).", threatMin: 7, reward: { gold: 30, potion: "hp_m" }, role: "paid", cost: 10 },
    ],
    pueblo: [
      { type: "investigacion", tracker: "talk", target: 2, name: "Exploradores perdidos", desc: "Habla con 2 NPC sobre los exploradores perdidos en el glaciar.", reward: { gold: 15, xp: 1 }, role: "main" },
      { type: "recuperacion", tracker: "reach", target: 1, name: "Caverna del hielo", desc: "Llega a la caverna helada señalada en el mapa.", reward: { gold: 18 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 3, name: "Necrópolis helada", desc: "Limpia 3 no-muertos de la necrópolis helada.", reward: { gold: 22, potion: "hp_s" }, role: "quest" },
      { type: "supervivencia", tracker: "chest", target: 2, name: "Reliquias del hielo", desc: "Recupera reliquias abriendo 2 cofres helados.", reward: { gold: 24 }, role: "quest" },
      { type: "evento", tracker: "kill", target: 5, name: "Asedio de la tormenta", desc: "Resiste 5 atacantes durante el asedio (amenaza alta).", threatMin: 7, reward: { gold: 35, potion: "hp_l" }, role: "paid", cost: 15 },
    ],
    ciudad: [
      { type: "investigacion", tracker: "talk", target: 2, name: "Conspiración del hielo", desc: "Habla con 2 NPC para desentrañar la conspiración del hielo.", reward: { gold: 20, xp: 1 }, role: "main" },
      { type: "recuperacion", tracker: "reach", target: 1, name: "Núcleo arcánico", desc: "Llega al punto donde yace el núcleo arcánico.", reward: { gold: 25, xp: 1 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 4, name: "Guardianes de hielo", desc: "Derrota 4 guardianes de hielo que custodian la ciudadela.", reward: { gold: 28, potion: "hp_m" }, role: "quest" },
      { type: "proteccion", tracker: "kill", target: 5, name: "Escolta al erudito", desc: "Escolta al erudito: derrota 5 enemigos en el camino.", reward: { gold: 32, potion: "hp_m", xp: 1 }, role: "quest" },
      { type: "evento", tracker: "kill", target: 6, name: "Despertar del glaciar", desc: "Rechaza 6 élite del despertar del glaciar (amenaza alta).", threatMin: 8, reward: { gold: 40, potion: "hp_l", item: "brazal_arcano" }, role: "paid", cost: 20 },
      { type: "exploracion", tracker: "reach", target: 1, name: "Ruinas Heladas", wildSector: { col: 0, row: 2 }, desc: "Explora las Ruinas Heladas del sur y revela el secreto olvidado bajo la escarcha.", reward: { gold: 30, xp: 1 }, role: "quest" },
    ],
  },
  desierto: {
    campamento: [
      { type: "combate", tracker: "kill", target: 2, name: "Merodeadores del dunar", desc: "Elimina 2 merodeadores del dunar.", reward: { gold: 15, xp: 1 }, role: "main" },
      { type: "supervivencia", tracker: "chest", target: 1, name: "Agua y provisiones", desc: "Abre 1 cofre y reúne agua y provisiones del oasis.", reward: { gold: 10 }, role: "quest" },
      { type: "exploracion", tracker: "reach", target: 1, name: "Oasis escondido", desc: "Llega al punto de interés del oasis escondido.", reward: { gold: 12, xp: 1 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 3, name: "Saqueadores de caravana", desc: "Derrota 3 saqueadores de caravana.", reward: { gold: 20, potion: "hp_s" }, role: "quest" },
      { type: "evento", tracker: "kill", target: 4, name: "Ataque del siroco", desc: "Repela 4 enemigos durante el siroco (amenaza alta).", threatMin: 7, reward: { gold: 30, potion: "hp_m" }, role: "paid", cost: 10 },
    ],
    pueblo: [
      { type: "investigacion", tracker: "talk", target: 2, name: "Mercaderes desaparecidos", desc: "Habla con 2 NPC sobre los mercaderes desaparecidos en las dunas.", reward: { gold: 15, xp: 1 }, role: "main" },
      { type: "recuperacion", tracker: "reach", target: 1, name: "Tumba del desierto", desc: "Llega a la tumba señalada en el desierto.", reward: { gold: 18 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 3, name: "Escorpiones del canon", desc: "Limpia 3 escorpiones del canon.", reward: { gold: 22, potion: "hp_s" }, role: "quest" },
      { type: "supervivencia", tracker: "chest", target: 2, name: "Reliquias del faraón", desc: "Recupera reliquias abriendo 2 cofres arenosos.", reward: { gold: 24 }, role: "quest" },
      { type: "evento", tracker: "kill", target: 5, name: "Emboscada del arenal", desc: "Resiste 5 asaltantes en la emboscada del arenal (amenaza alta).", threatMin: 7, reward: { gold: 35, potion: "hp_l" }, role: "paid", cost: 15 },
    ],
    ciudad: [
      { type: "investigacion", tracker: "talk", target: 2, name: "Traición en la corte", desc: "Habla con 2 NPC para descubrir la traición en la corte.", reward: { gold: 20, xp: 1 }, role: "main" },
      { type: "recuperacion", tracker: "reach", target: 1, name: "Sello del faraón", desc: "Recupera el sello llegando al punto señalado bajo las pirámides.", reward: { gold: 25, xp: 1 }, role: "quest" },
      { type: "combate", tracker: "kill", target: 4, name: "Guardianes de las pirámides", desc: "Derrota 4 guardianes de las pirámides.", reward: { gold: 28, potion: "hp_m" }, role: "quest" },
      { type: "proteccion", tracker: "kill", target: 5, name: "Escolta la caravana real", desc: "Escolta la caravana real: derrota 5 enemigos.", reward: { gold: 32, potion: "hp_m", xp: 1 }, role: "quest" },
      { type: "evento", tracker: "kill", target: 6, name: "Despertar del Lich", desc: "Rechaza 6 élite del despertar del Lich (amenaza alta).", threatMin: 8, reward: { gold: 40, potion: "hp_l", item: "escudo_portatil" }, role: "paid", cost: 20 },
      { type: "exploracion", tracker: "reach", target: 1, name: "Ruinas del Sur", wildSector: { col: 0, row: 2 }, desc: "Llega a las Ruinas del Sur del yermo y confirma lo que yace bajo la arena.", reward: { gold: 30, xp: 1 }, role: "quest" },
    ],
  },
};

export function generateMissions(region) {
  // Usar misiones de campaña del Documento Maestro
  const campaign = region.id === "verde" ? GREEN_CAMPAIGN_V2
    : region.id === "fria" ? ARCTIC_CAMPAIGN_V2
    : region.id === "desierto" ? DESERT_CAMPAIGN_V2
    : (CAMPAIGN_MISSIONS[region.id] || CAMPAIGN_MISSIONS.verde);
  const pools = REGION_POOLS[region.id] || REGION_POOLS.verde;
  const out = {};
  for (const sector of ["campamento", "pueblo", "ciudad"]) {
    // Misiones de campaña con IDs propios
    const campaignMissions = (campaign[sector] || []).map(m => ({
      id: m.id,
      sector,
      type: m.type,
      tracker: m.tracker,
      target: m.target,
      objectives: m.objectives || [],
      name: m.name,
      desc: m.desc,
      threatMin: m.threatMin || 0,
      reward: m.reward,
      role: m.role || "quest",
      cost: m.cost || 0,
      wildSector: m.wildSector || null,
      act: m.act || 1,
      npcName: m.npcName || "",
      worldChanges: m.worldChanges || [],
      prerequisites: m.prerequisites || [],
      requiredFlags: m.requiredFlags || [],
      onAccept: m.onAccept || null,
      onReady: m.onReady || null,
      onClaim: m.onClaim || null,
      mode: m.mode || "clasico",
      storySummary: m.storySummary || "",
    }));
    out[sector] = campaignMissions;
  }
  return out;
}