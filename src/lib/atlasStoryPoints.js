import { hitSolid } from "@/lib/atlasWorld";
import { isWalkablePoint } from "@/lib/atlasAccessibility";
import { DESERT_CAMPAIGN_V2 } from "@/lib/atlasDesertCampaignV2";

// Puntos narrativos diseñados de la Región Verde.
// v3.3.1: Posiciones manuales corregidas, sin superposición con asentamientos.
// Las coordenadas son proporciones del mapa, por lo que se adaptan al tamaño del sector.

const point = (id, sectorId, label, icon, x, y, description = "", options = {}) => ({
  id, sectorId, label, icon, x, y, description,
  interactionRadius: options.interactionRadius || 42,
  highlightRadius: options.highlightRadius || 75,
  visualType: options.visualType || icon,
  proximityLabel: options.proximityLabel || `Examinar: ${label}`,
  fallbackPositions: options.fallbackPositions || [],
  sprite: options.sprite || null,
});

const GREEN_POINTS = {
  A2: [
    // Reubicado: fuera de la zona del asentamiento (centro 350,380 radio 205),
    // junto al camino inferior (sendero sur), separado de valla/NPCs/forja.
    point("verde_a2_rastros_carreta", "A2", "Rastros de la carreta", "footprints", 0.27, 0.85,
      "Huellas y marcas de arrastre junto al camino inferior del campamento.",
      {
        visualType: "footprints",
        proximityLabel: "Examinar rastros de la carreta",
        fallbackPositions: [
          { x: 0.31, y: 0.88 },
          { x: 0.22, y: 0.89 },
        ],
      }),
    point("verde_a2_carreta", "A2", "Carreta abandonada", "package", 0.18, 0.93,
      "Una carreta volcada junto al sendero sur, cerca de la salida del campamento.",
      {
        visualType: "cart",
        proximityLabel: "Examinar la carreta abandonada",
        fallbackPositions: [
          { x: 0.15, y: 0.95 },
          { x: 0.22, y: 0.96 },
        ],
      }),
    // Reubicado: antes estaba dentro del río (x=134, río termina en x=160).
    point("verde_a2_caja_herramientas", "A2", "Caja de Herramientas", "hammer", 0.35, 0.90,
      "La caja de herramientas de Bren, abandonada junto al camino.",
      {
        visualType: "toolbox",
        proximityLabel: "Recoger la caja de herramientas",
        fallbackPositions: [
          { x: 0.38, y: 0.92 },
          { x: 0.32, y: 0.94 },
        ],
      }),
  ],
  A1: [
    // Reubicados: los puntos de vigilantes estaban sobre la meseta (plateau 610-880, 45-215)
    // y sobre el deadtree sólido (630-670, 182-209). Movidos a zona caminable al pie de la meseta.
    point("verde_a1_huellas", "A1", "Huellas que huyen", "footprints", 0.25, 0.70,
      "", { fallbackPositions: [{ x: 0.28, y: 0.72 }, { x: 0.22, y: 0.68 }] }),
    point("verde_a1_arbol_marchito", "A1", "Árbol marchito", "trees", 0.64, 0.40,
      "", { fallbackPositions: [{ x: 0.62, y: 0.42 }, { x: 0.66, y: 0.38 }] }),
    point("verde_a1_altar_raices", "A1", "Altar cubierto por raíces", "landmark", 0.78, 0.68,
      "", { fallbackPositions: [{ x: 0.80, y: 0.70 }, { x: 0.76, y: 0.65 }] }),
    point("verde_a1_desvio_comercial", "A1", "Desvío comercial", "compass", 0.52, 0.52,
      "", { fallbackPositions: [{ x: 0.50, y: 0.50 }, { x: 0.54, y: 0.54 }] }),
    point("verde_a1_caravana", "A1", "Caravana atrapada", "package", 0.72, 0.78,
      "", { fallbackPositions: [{ x: 0.70, y: 0.80 }, { x: 0.74, y: 0.76 }] }),
    point("verde_a1_supervivientes", "A1", "Supervivientes", "user", 0.82, 0.76,
      "", { fallbackPositions: [{ x: 0.80, y: 0.78 }, { x: 0.84, y: 0.74 }] }),
    point("verde_a1_campamento_vigilantes", "A1", "Campamento de los Vigilantes", "tent", 0.59, 0.33,
      "El campamento improvisado de los tres aventureros, junto al sendero al pie de la meseta.",
      { fallbackPositions: [{ x: 0.57, y: 0.35 }, { x: 0.61, y: 0.31 }] }),
    point("verde_a1_dialogo_vigilantes", "A1", "Conversación de los Vigilantes", "message", 0.73, 0.39,
      "Los tres aventureros conversan junto al camino, al pie de la meseta.",
      { fallbackPositions: [{ x: 0.71, y: 0.41 }, { x: 0.75, y: 0.37 }] }),
    point("verde_a1_contrato_companero", "A1", "Contrato de compañero", "scroll", 0.83, 0.33,
      "El pergamino del contrato sobre un tronco caído, visible desde el sendero.",
      { fallbackPositions: [{ x: 0.81, y: 0.35 }, { x: 0.85, y: 0.31 }] }),
    point("verde_a1_estatua_guardian", "A1", "Estatua dañada", "landmark", 0.80, 0.49,
      "La estatua del Guardián, resquebrajada pero reconocible, junto al camino.",
      { fallbackPositions: [{ x: 0.78, y: 0.51 }, { x: 0.82, y: 0.47 }] }),
  ],
  B1: [
    point("verde_b1_mecanismo", "B1", "Mecanismo de las ruinas", "network", 0.28, 0.70),
    point("verde_b1_inscripcion", "B1", "Inscripción antigua", "scroll", 0.75, 0.34),
    point("verde_b1_copia_inscripcion", "B1", "Copia de la inscripción", "scroll", 0.74, 0.36),
    point("verde_b1_escudo_raices", "B1", "Escudo cubierto por raíces", "shield", 0.57, 0.60),
    point("verde_b1_carbon_ritual", "B1", "Carboneros sitiados", "flame", 0.17, 0.30),
  ],
  C1: [
    point("verde_c1_senda_cartografo", "C1", "Senda de la torre", "compass", 0.14, 0.78),
    point("verde_c1_mecanismo_luz", "C1", "Mecanismo de raíces y luz", "sparkles", 0.28, 0.68),
    point("verde_c1_santuario", "C1", "Santuario olvidado", "landmark", 0.76, 0.30),
    point("verde_c1_hoja_fracturada", "C1", "Hoja fracturada", "sword", 0.66, 0.66),
  ],
  C2: [],
  B2: [
    point("verde_b2_archivo_real", "B2", "Archivo Real", "scroll", 0.36, 0.33),
    point("verde_b2_vision_atlas", "B2", "Resonancia de Atlas", "eye", 0.52, 0.46),
    point("verde_b2_mesa_consejo", "B2", "Mesa del Consejo Verde", "shield", 0.58, 0.62),
    point("verde_b2_forja_reliquia", "B2", "Forja regional de la Reliquia", "hammer", 0.24, 0.66),
  ],
  A3: [
    point("verde_a3_campamento_destruido", "A3", "Campamento destruido", "tent", 0.67, 0.28),
    point("verde_a3_explorador_herido", "A3", "Explorador herido", "user", 0.74, 0.36),
    point("verde_a3_mineral_antiguo", "A3", "Mineral antiguo", "gem", 0.22, 0.72),
  ],
  B3: [
    point("verde_b3_nucleo_cristal", "B3", "Núcleo de cristal", "gem", 0.72, 0.62),
    point("verde_b3_nodo_raiz_1", "B3", "Primer nodo de raíces", "network", 0.22, 0.32),
    point("verde_b3_nodo_raiz_2", "B3", "Segundo nodo de raíces", "network", 0.50, 0.50),
    point("verde_b3_nodo_raiz_3", "B3", "Tercer nodo de raíces", "network", 0.78, 0.30),
  ],
  C3: [
    point("verde_c3_guardian_dormido", "C3", "Guardián dormido", "eye", 0.50, 0.28),
    point("verde_c3_espiritu_guardian", "C3", "Espíritu liberado", "sparkles", 0.50, 0.48),
  ],
};

// Puntos narrativos de la Región Ártica.
// Coordenadas en proporciones; el validador reubica si caen sobre sólidos/asentamiento.
const FRIA_POINTS = {
  A1: [
    point("fria_a1_naufragio", "A1", "Naufragio de la bahía", "ship", 0.20, 0.28,
      "Los restos del barco que te trajo al norte, varado entre la nieve.",
      { visualType: "wreck", proximityLabel: "Examinar el naufragio", fallbackPositions: [{ x: 0.24, y: 0.30 }, { x: 0.18, y: 0.34 }] }),
  ],
  B1: [
    point("fria_b1_einar", "B1", "Einar, el último explorador", "user", 0.30, 0.82,
      "Einar se recupera junto al fuego del campamento, listo para unirse a la expedición.",
      { proximityLabel: "Reunir a Einar", sprite: { type: "npc", variant: "fria_einar", dir: "down" }, fallbackPositions: [{ x: 0.34, y: 0.84 }, { x: 0.28, y: 0.78 }] }),
  ],
  C1: [
    point("fria_c1_estacion", "C1", "Estación de vigilancia", "tower", 0.74, 0.22,
      "La estación de vigilancia donde el mensajero dejó su último registro.",
      { proximityLabel: "Examinar la estación", fallbackPositions: [{ x: 0.76, y: 0.26 }, { x: 0.70, y: 0.20 }] }),
    point("fria_c1_mensaje_mensajero", "C1", "Mensaje del mensajero", "scroll", 0.66, 0.30,
      "El último mensaje del mensajero, semienterrado en la nieve.",
      { proximityLabel: "Recuperar el mensaje", fallbackPositions: [{ x: 0.68, y: 0.34 }, { x: 0.62, y: 0.28 }] }),
    point("fria_c1_cristal_bestia", "C1", "Muestra de cristal", "gem", 0.30, 0.66,
      "Un fragmento de cristal adherido a los restos de una bestia alterada.",
      { proximityLabel: "Recoger la muestra de cristal", fallbackPositions: [{ x: 0.34, y: 0.68 }, { x: 0.28, y: 0.62 }] }),
    point("fria_c1_sello_vida", "C1", "Sello de Vida", "sparkles", 0.20, 0.40,
      "El Sello de Vida, latente entre los árboles congelados.",
      { proximityLabel: "Activar el Sello de Vida", fallbackPositions: [{ x: 0.24, y: 0.42 }, { x: 0.18, y: 0.36 }] }),
    point("fria_c1_fragmento", "C1", "Fragmento del Bosque Congelado", "gem", 0.50, 0.72,
      "Un fragmento del Corazón del Cristal oculto en el bosque congelado.",
      { proximityLabel: "Recuperar el fragmento", fallbackPositions: [{ x: 0.52, y: 0.74 }, { x: 0.46, y: 0.70 }] }),
  ],
  C2: [
    point("fria_c2_mojon_1", "C2", "Primer mojón de la ruta", "landmark", 0.22, 0.62,
      "El primer mojón de la antigua ruta comercial, cubierto de escarcha.",
      { proximityLabel: "Examinar el primer mojón", fallbackPositions: [{ x: 0.26, y: 0.64 }, { x: 0.20, y: 0.58 }] }),
    point("fria_c2_mojon_2", "C2", "Segundo mojón (puente)", "landmark", 0.50, 0.50,
      "El segundo mojón junto al puente sobre la grieta.",
      { proximityLabel: "Recuperar la señal del mojón", fallbackPositions: [{ x: 0.52, y: 0.54 }, { x: 0.46, y: 0.48 }] }),
    point("fria_c2_hito_comercial", "C2", "Hito comercial antiguo", "scroll", 0.78, 0.34,
      "El antiguo hito comercial que confirma la ruta hacia el Pueblo Glacial.",
      { proximityLabel: "Confirmar la ruta", fallbackPositions: [{ x: 0.80, y: 0.38 }, { x: 0.74, y: 0.32 }] }),
    point("fria_c2_lago_acceso", "C2", "Mecanismos del lago", "network", 0.34, 0.40,
      "Los antiguos mecanismos que drenan el acceso al lago congelado.",
      { proximityLabel: "Activar los mecanismos del lago", fallbackPositions: [{ x: 0.38, y: 0.42 }, { x: 0.30, y: 0.38 }] }),
    point("fria_c2_lago_simbolos", "C2", "Símbolos del lago", "scroll", 0.64, 0.60,
      "Los símbolos de los Portadores recuperados bajo el lago.",
      { proximityLabel: "Recuperar los símbolos", fallbackPositions: [{ x: 0.66, y: 0.62 }, { x: 0.60, y: 0.58 }] }),
    point("fria_c2_cristal_negro", "C2", "Origen del Cristal Negro", "gem", 0.82, 0.26,
      "El origen del Cristal Negro, una cámara sellada que consume energía.",
      { proximityLabel: "Examinar el Cristal Negro", fallbackPositions: [{ x: 0.80, y: 0.30 }, { x: 0.84, y: 0.24 }] }),
    point("fria_c2_puerta", "C2", "Puerta Sellada", "shield", 0.30, 0.30,
      "La Puerta Sellada bajo la montaña, custodiada por antiguos guardianes.",
      { proximityLabel: "Llegar a la Puerta Sellada", fallbackPositions: [{ x: 0.34, y: 0.32 }, { x: 0.28, y: 0.26 }] }),
    point("fria_c2_sello_vacio", "C2", "Sello del Vacío", "eye", 0.58, 0.30,
      "El Sello del Vacío en las cavernas profundas de la grieta.",
      { proximityLabel: "Activar el Sello del Vacío", fallbackPositions: [{ x: 0.60, y: 0.34 }, { x: 0.56, y: 0.28 }] }),
    point("fria_c2_fragmento_corazon", "C2", "Fragmento del Lago Helado", "gem", 0.46, 0.70,
      "Un fragmento del Corazón del Cristal sumergido bajo el lago helado.",
      { proximityLabel: "Recuperar el fragmento del lago", fallbackPositions: [{ x: 0.48, y: 0.72 }, { x: 0.42, y: 0.68 }] }),
  ],
  B2: [
    point("fria_b2_puerta_montana", "B2", "Puerta bajo la montaña", "shield", 0.20, 0.30,
      "El acceso a la puerta bajo la montaña, dentro de la Ciudadela.",
      { proximityLabel: "Examinar la puerta bajo la montaña", fallbackPositions: [{ x: 0.24, y: 0.32 }, { x: 0.18, y: 0.28 }] }),
    point("fria_b2_defensa_puerta", "B2", "Puerta exterior", "shield", 0.50, 0.78,
      "La Puerta exterior de la Ciudadela, primer punto de defensa.",
      { proximityLabel: "Asegurar la Puerta exterior", fallbackPositions: [{ x: 0.52, y: 0.80 }, { x: 0.46, y: 0.76 }] }),
    point("fria_b2_defensa_cristales", "B2", "Zona de cristales", "gem", 0.30, 0.62,
      "La Zona de cristales de la Ciudadela, segundo punto de defensa.",
      { proximityLabel: "Proteger la Zona de cristales", fallbackPositions: [{ x: 0.32, y: 0.64 }, { x: 0.28, y: 0.60 }] }),
    point("fria_b2_defensa_nucleo", "B2", "Núcleo de la Ciudadela", "sparkles", 0.62, 0.62,
      "El Núcleo de la Ciudadela, último punto de defensa.",
      { proximityLabel: "Defender el Núcleo", fallbackPositions: [{ x: 0.64, y: 0.64 }, { x: 0.60, y: 0.60 }] }),
  ],
  A2: [
    point("fria_a2_campamento_expedicion", "A2", "Campamento abandonado", "tent", 0.30, 0.70,
      "El campamento abandonado de la expedición perdida.",
      { proximityLabel: "Examinar el campamento abandonado", fallbackPositions: [{ x: 0.32, y: 0.72 }, { x: 0.28, y: 0.68 }] }),
    point("fria_a2_einar", "A2", "Einar herido", "user", 0.66, 0.40,
      "Einar, el único superviviente de la expedición.",
      { proximityLabel: "Rescatar a Einar", sprite: { type: "npc", variant: "fria_einar", dir: "down" }, fallbackPositions: [{ x: 0.68, y: 0.42 }, { x: 0.64, y: 0.38 }] }),
    point("fria_a2_santuario_alba", "A2", "Santuario del Alba", "landmark", 0.20, 0.34,
      "El Santuario del Alba de los Portadores.",
      { proximityLabel: "Investigar el Santuario del Alba", fallbackPositions: [{ x: 0.22, y: 0.36 }, { x: 0.18, y: 0.32 }] }),
    point("fria_a2_santuario_guardian", "A2", "Santuario del Guardián", "landmark", 0.58, 0.66,
      "El Santuario del Guardián de los Portadores.",
      { proximityLabel: "Investigar el Santuario del Guardián", fallbackPositions: [{ x: 0.60, y: 0.68 }, { x: 0.56, y: 0.64 }] }),
    point("fria_a2_santuario_vacio", "A2", "Santuario del Vacío", "landmark", 0.82, 0.40,
      "El Santuario del Vacío de los Portadores.",
      { proximityLabel: "Investigar el Santuario del Vacío", fallbackPositions: [{ x: 0.80, y: 0.42 }, { x: 0.84, y: 0.38 }] }),
    point("fria_a2_memoria_portadores", "A2", "Memoria de los Portadores", "scroll", 0.50, 0.50,
      "La memoria colectiva de los Portadores, preservada en las ruinas.",
      { proximityLabel: "Recuperar la memoria de los Portadores", fallbackPositions: [{ x: 0.52, y: 0.52 }, { x: 0.48, y: 0.48 }] }),
  ],
  A3: [
    point("fria_a3_nivalis", "A3", "Ciudad de Nivalis", "landmark", 0.50, 0.40,
      "Los antiguos mecanismos de Nivalis, la ciudad bajo el hielo.",
      { proximityLabel: "Explorar la Ciudad de Nivalis", fallbackPositions: [{ x: 0.52, y: 0.42 }, { x: 0.48, y: 0.38 }] }),
    point("fria_a3_sello_tiempo", "A3", "Sello del Tiempo", "sparkles", 0.22, 0.30,
      "El Sello del Tiempo en Nivalis, latente bajo el hielo.",
      { proximityLabel: "Activar el Sello del Tiempo", fallbackPositions: [{ x: 0.24, y: 0.32 }, { x: 0.20, y: 0.28 }] }),
    point("fria_a3_fragmento", "A3", "Fragmento del Glaciar", "gem", 0.74, 0.66,
      "Un fragmento del Corazón del Cristal en lo profundo del glaciar.",
      { proximityLabel: "Recuperar el fragmento del glaciar", fallbackPositions: [{ x: 0.76, y: 0.68 }, { x: 0.72, y: 0.64 }] }),
  ],
  B3: [
    point("fria_b3_cristal_susurro", "B3", "Cristal que susurra", "gem", 0.40, 0.62,
      "El cristal extraño que el Chamán Hielo quiere investigar.",
      { proximityLabel: "Investigar el cristal que susurra", fallbackPositions: [{ x: 0.42, y: 0.64 }, { x: 0.38, y: 0.60 }] }),
  ],
  C3: [
    point("fria_c3_espiritu_aurel", "C3", "Espíritu de Aurel", "sparkles", 0.50, 0.44,
      "El espíritu de Aurel, liberado al fin de su sacrificio.",
      { proximityLabel: "Liberar el espíritu de Aurel", fallbackPositions: [{ x: 0.52, y: 0.46 }, { x: 0.48, y: 0.42 }] }),
  ],
};


// Puntos narrativos de la Región Árida. Se generan exclusivamente desde los
// objetivos interactivos de la campaña oficial. Así no puede existir un punto
// de interés sin misión vinculada ni un objetivo de misión sin marcador.
const DESERT_POINT_SLOTS = {
  A1: [[0.20,0.72],[0.36,0.58],[0.58,0.70],[0.72,0.42],[0.84,0.66]],
  A2: [[0.20,0.35],[0.36,0.64],[0.52,0.40],[0.67,0.68],[0.80,0.34],[0.48,0.78]],
  A3: [[0.22,0.66],[0.42,0.38],[0.68,0.66],[0.82,0.36]],
  B1: [[0.25,0.65],[0.50,0.42],[0.75,0.64]],
  B2: [[0.18,0.72],[0.30,0.40],[0.43,0.68],[0.56,0.40],[0.69,0.68],[0.81,0.42],[0.38,0.82],[0.64,0.82]],
  B3: [[0.20,0.70],[0.34,0.42],[0.50,0.72],[0.64,0.42],[0.78,0.70],[0.50,0.84]],
  C1: [[0.20,0.64],[0.40,0.36],[0.62,0.68],[0.80,0.38]],
  C2: [[0.16,0.66],[0.29,0.38],[0.42,0.70],[0.55,0.38],[0.68,0.70],[0.81,0.40],[0.50,0.82]],
  C3: [[0.40,0.58],[0.60,0.42]],
};

const desertIconFor = (objective) => {
  const text = `${objective.targetId || ""} ${objective.text || ""}`.toLowerCase();
  if (text.includes("pilar") || text.includes("sello")) return "landmark";
  if (text.includes("fragmento") || text.includes("memoria") || text.includes("núcleo") || text.includes("nucleo")) return "gem";
  if (text.includes("registro") || text.includes("biblioteca") || text.includes("inscripción") || text.includes("simbolo")) return "scroll";
  if (text.includes("guardián") || text.includes("guardian")) return "shield";
  if (text.includes("caravana") || text.includes("suministro")) return "package";
  if (text.includes("fuente") || text.includes("agua") || text.includes("oasis")) return "sparkles";
  if (text.includes("tormenta") || text.includes("corrupción") || text.includes("corrupcion")) return "eye";
  return "landmark";
};

const DESERT_POINTS = (() => {
  const result = {};
  const used = new Set();
  const counters = {};
  for (const mission of Object.values(DESERT_CAMPAIGN_V2).flat()) {
    for (const objective of mission.objectives || []) {
      if (objective.type !== "interact" || !objective.targetId || !objective.sectorId || used.has(objective.targetId)) continue;
      used.add(objective.targetId);
      const sectorId = objective.sectorId;
      const slots = DESERT_POINT_SLOTS[sectorId] || [[0.50,0.50]];
      const index = counters[sectorId] || 0;
      counters[sectorId] = index + 1;
      const [x, y] = slots[index % slots.length];
      const fallbackA = slots[(index + 1) % slots.length];
      const fallbackB = slots[(index + 2) % slots.length];
      const label = (objective.text || objective.targetId).replace(/[.!]$/, "");
      const item = point(objective.targetId, sectorId, label, desertIconFor(objective), x, y,
        objective.text || label,
        {
          proximityLabel: objective.text || `Examinar: ${label}`,
          fallbackPositions: [
            { x: fallbackA[0], y: fallbackA[1] },
            { x: fallbackB[0], y: fallbackB[1] },
          ],
        });
      if (!result[sectorId]) result[sectorId] = [];
      result[sectorId].push(item);
    }
  }
  return result;
})();

export function buildStoryPoints(regionId, sectorId, W, H) {
  if (regionId === "verde") {
    return (GREEN_POINTS[sectorId] || []).map(p => ({
      ...p,
      x: Math.round(p.x * W),
      y: Math.round(p.y * H),
      fallbackPositions: (p.fallbackPositions || []).map(fp => ({
        x: Math.round(fp.x * W),
        y: Math.round(fp.y * H),
      })),
    }));
  }
  if (regionId === "fria") {
    return (FRIA_POINTS[sectorId] || []).map(p => ({
      ...p,
      x: Math.round(p.x * W),
      y: Math.round(p.y * H),
      fallbackPositions: (p.fallbackPositions || []).map(fp => ({
        x: Math.round(fp.x * W),
        y: Math.round(fp.y * H),
      })),
    }));
  }
  if (regionId === "desierto") {
    return (DESERT_POINTS[sectorId] || []).map(p => ({
      ...p,
      x: Math.round(p.x * W),
      y: Math.round(p.y * H),
      fallbackPositions: (p.fallbackPositions || []).map(fp => ({
        x: Math.round(fp.x * W),
        y: Math.round(fp.y * H),
      })),
    }));
  }
  return [];
}

// ── Validación de colocación de objetivos narrativos ──
// Comprueba que un punto no esté dentro de sólidos, agua, NPCs, cofres,
// santuarios, otros puntos narrativos, ni dentro de la zona del asentamiento.
export function validateMissionTargetPlacement(world, target) {
  if (!world || !target) return { ok: true, issues: [] };
  const issues = [];
  const x = target.x, y = target.y;
  const W = world.W || 960, H = world.H || 720;

  // Límites del mapa
  if (x < 30 || x > W - 30 || y < 30 || y > H - 30) {
    issues.push({ type: "bounds", message: "Fuera de los límites del mapa" });
  }

  // Sólidos (edificios, decoración sólida)
  if (world.solids) {
    for (const s of world.solids) {
      if (x >= s.x - 8 && x <= s.x + (s.w || 0) + 8 &&
          y >= s.y - 8 && y <= s.y + (s.h || 0) + 8) {
        issues.push({ type: "solid", message: "Dentro de un objeto sólido" });
        break;
      }
    }
  }

  // Agua / ríos
  if (world.terrainShapes) {
    for (const w of world.terrainShapes) {
      if (w.type === "water" || w.type === "river") {
        if (x >= w.x && x <= w.x + (w.w || 0) && y >= w.y && y <= w.y + (w.h || 0)) {
          issues.push({ type: "water", message: "Dentro del agua" });
          break;
        }
      }
    }
  }

  // NPCs
  if (world.npcs) {
    for (const n of world.npcs) {
      if (Math.hypot(n.x - x, n.y - y) < 90) {
        issues.push({ type: "npc", message: `Demasiado cerca del NPC ${n.name || n.id}` });
        break;
      }
    }
  }

  // Cofres
  if (world.chests) {
    for (const c of world.chests) {
      if (Math.hypot(c.x - x, c.y - y) < 70) {
        issues.push({ type: "chest", message: "Demasiado cerca de un cofre" });
        break;
      }
    }
  }

  // Santuarios
  if (world.shrines) {
    for (const s of world.shrines) {
      if (Math.hypot(s.x - x, s.y - y) < 80) {
        issues.push({ type: "shrine", message: "Demasiado cerca de un santuario" });
        break;
      }
    }
  }

  // Otros puntos narrativos
  if (world.storyPoints) {
    for (const sp of world.storyPoints) {
      if (sp.id === target.id) continue;
      if (Math.hypot(sp.x - x, sp.y - y) < 60) {
        issues.push({ type: "storyPoint", message: `Demasiado cerca de: ${sp.id}` });
        break;
      }
    }
  }

  // Zona del asentamiento
  if (world.safeCenter && world.safeRadius) {
    if (Math.hypot(world.safeCenter.x - x, world.safeCenter.y - y) < world.safeRadius) {
      issues.push({ type: "settlement", message: "Dentro de la zona del asentamiento" });
    }
  }

  return { ok: issues.length === 0, issues };
}

// ── Validación de accesibilidad de objetivos narrativos ──
// Comprueba todo lo de validateMissionTargetPlacement y además:
// - que el objetivo no esté sobre terreno elevado (plateau, cliff);
// - que exista una ruta caminable desde el spawn hasta el objetivo.
export function validateMissionTargetAccessibility(world, target) {
  if (!world || !target) return { ok: true, issues: [] };
  const base = validateMissionTargetPlacement(world, target);
  const issues = [...base.issues];
  const x = target.x, y = target.y;

  // Terreno elevado (plateau, cliff): si la colisión fue abierta (brecha), el punto
  // ya no está dentro de un sólido y es alcanzable. Solo se marca como problema
  // si realmente sigue dentro de un sólido de terreno sin abrir.
  if (world.solids) {
    for (const s of world.solids) {
      if (!s.terrain) continue;
      if (x >= s.x - 6 && x <= s.x + (s.w || 0) + 6 && y >= s.y - 6 && y <= s.y + (s.h || 0) + 6) {
        issues.push({ type: "elevated_terrain", message: `Sobre ${s.shape?.type || "terreno"} sin acceso` });
        break;
      }
    }
  }

  // Ruta caminable desde el spawn hasta el objetivo
  const spawn = world.spawn;
  if (spawn) {
    const route = checkRoute(world, spawn.x, spawn.y, x, y);
    if (route.blocked) {
      issues.push({ type: "route_blocked", message: route.reason });
    }
  }

  return { ok: issues.length === 0, issues };
}

function pointInTerrain(world, x, y, types) {
  if (!world.terrainShapes) return false;
  for (const s of world.terrainShapes) {
    if (!types.includes(s.type)) continue;
    if (x >= s.x && x <= s.x + (s.w || 0) && y >= s.y && y <= s.y + (s.h || 0)) return true;
  }
  return false;
}

function checkSegment(world, x1, y1, x2, y2) {
  const solids = world.solids || [];
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.ceil(dist / 15));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    if (hitSolid(x, y, solids, 14)) return true;
    if (pointInTerrain(world, x, y, ["water", "river"])) return true;
  }
  return false;
}

function checkRoute(world, x1, y1, x2, y2) {
  if (!checkSegment(world, x1, y1, x2, y2)) return { blocked: false };

  const dist = Math.hypot(x2 - x1, y2 - y1) || 1;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const px = -(y2 - y1) / dist * 90;
  const py = (x2 - x1) / dist * 90;

  const leftOk = !checkSegment(world, x1, y1, mx + px, my + py) && !checkSegment(world, mx + px, my + py, x2, y2);
  const rightOk = !checkSegment(world, x1, y1, mx - px, my - py) && !checkSegment(world, mx - px, my - py, x2, y2);

  if (leftOk || rightOk) return { blocked: false };
  return { blocked: true, reason: "Sin ruta caminable desde el spawn" };
}

// Resuelve la posición válida de un punto narrativo usando fallbacks manuales.
// NO usa Math.random ni semillas. Si la posición primaria falla, prueba los
// fallbackPositions definidos manualmente. Si todos fallan, conserva la primaria.
export function resolveValidStoryPoint(world, point) {
  if (!world || !point) return point;
  const primaryCheck = validateMissionTargetAccessibility(world, point);
  if (primaryCheck.ok) return point;

  for (const fp of point.fallbackPositions || []) {
    const candidate = { ...point, x: fp.x, y: fp.y };
    const check = validateMissionTargetAccessibility(world, candidate);
    if (check.ok) return candidate;
  }

  // Red de seguridad: si el punto ya es caminable y alcanzable desde el spawn,
  // se conserva (objetivos legítimos dentro de la plaza/ciudad). Si está
  // bloqueado por un edificio/NPC/decoración, se reubica a la celda libre y
  // alcanzable más cercana (búsqueda espiral, sin aleatoriedad).
  if (world.spawn && isWalkablePoint(world, point.x, point.y)) {
    const route = checkRoute(world, world.spawn.x, world.spawn.y, point.x, point.y);
    if (!route.blocked) return point;
  }
  const relocated = spiralToAccessibleCell(world, point);
  if (relocated) return { ...point, x: relocated.x, y: relocated.y };

  console.warn(`[Atlas] Story point ${point.id} accessibility issues:`, primaryCheck.issues);
  return point;
}

// Reubica un punto narrativo bloqueado a la celda caminable y alcanzable
// más cercana (búsqueda espiral determinista).
function spiralToAccessibleCell(world, point) {
  if (!world.spawn) return null;
  for (let r = 20; r <= 240; r += 16) {
    for (let a = 0; a < 360; a += 24) {
      const x = point.x + Math.round(Math.cos(a * Math.PI / 180) * r);
      const y = point.y + Math.round(Math.sin(a * Math.PI / 180) * r);
      if (!isWalkablePoint(world, x, y)) continue;
      const route = checkRoute(world, world.spawn.x, world.spawn.y, x, y);
      if (!route.blocked) return { x, y };
    }
  }
  return null;
}

// Valida y resuelve todos los story points de un mundo.
export function validateAllStoryPoints(world) {
  if (!world || !world.storyPoints) return world;
  const resolved = world.storyPoints.map(sp => resolveValidStoryPoint(world, sp));
  return { ...world, storyPoints: resolved };
}