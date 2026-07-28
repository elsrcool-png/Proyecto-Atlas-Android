// PROYECTO ATLAS — Reino Árido, campaña jugable v2.
// Reordena la progresión para que cada misión sea alcanzable con el mapa 3x3
// actual y vincula todos los objetivos a NPC, sectores y puntos narrativos reales.

const objective = (id, type, text, options = {}) => ({
  id,
  type,
  text,
  count: 1,
  ...options,
});

const mission = (id, act, sector, role, name, desc, objectives, options = {}) => ({
  id,
  act,
  sector,
  role,
  name,
  desc,
  type: options.type || "exploracion",
  reward: options.reward || {},
  prerequisites: options.prerequisites || [],
  objectives,
  target: objectives.length,
  tracker: objectives[0]?.type || "interact",
  threatMin: options.threatMin || 0,
  cost: options.cost || 0,
  worldChanges: options.worldChanges || [],
  onAccept: options.onAccept || null,
  onReady: options.onReady || null,
  onClaim: options.onClaim || null,
  requiredFlags: options.requiredFlags || [],
  mode: options.mode || "clasico",
  storySummary: options.storySummary || "",
});

export const DESERT_CAMPAIGN_V2 = {
  campamento: [
    mission(
      "d1", 1, "campamento", "main", "La Caravana Perdida",
      "Sahara necesita saber qué ocurrió con la caravana que desapareció junto al oasis de entrada.",
      [
        objective("sigue_ruta_caravana", "interact", "Examina la ruta comercial cubierta por arena.", { targetId: "desierto_a1_ruta_caravana", sectorId: "A1" }),
        objective("encuentra_caravana", "interact", "Encuentra la caravana semienterrada.", { targetId: "desierto_a1_caravana_perdida", sectorId: "A1" }),
        objective("derrota_merodeadores", "kill", "Derrota a los merodeadores que rodean el cargamento.", { sectorId: "A1", count: 2 }),
        objective("recupera_suministros", "interact", "Recupera agua y suministros útiles.", { targetId: "desierto_a1_suministros", sectorId: "A1" }),
      ],
      {
        type: "investigacion",
        reward: { gold: 25, xp: 2, questItem: "suministros_caravana_arida" },
        onClaim: { unlockSectors: ["C1"], flags: ["desierto:trade_route_found"] },
        worldChanges: ["La ruta inicial vuelve a utilizarse", "Los viajeros reaparecen cerca del campamento"],
      },
    ),
    mission(
      "d5", 2, "campamento", "explorer", "La Tormenta que Recuerda",
      "Kael detectó una tormenta inmóvil sobre el Santuario de los Roquedales.",
      [
        objective("entra_c1", "enter_sector", "Entra en el Santuario de los Roquedales.", { sectorId: "C1" }),
        objective("observa_tormenta", "interact", "Investiga el centro inmóvil de la tormenta.", { targetId: "desierto_c1_tormenta_memoria", sectorId: "C1" }),
        objective("vence_guardias_tormenta", "kill", "Derrota a los guardianes despertados por la tormenta.", { sectorId: "C1", count: 3 }),
        objective("recupera_memoria", "interact", "Recupera la memoria mineral expuesta por el viento.", { targetId: "desierto_c1_memoria_antigua", sectorId: "C1" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["d1"],
        reward: { gold: 45, xp: 2, questItem: "memoria_tormenta" },
        onClaim: { unlockSectors: ["C2"], flags: ["desierto:storm_memory_found"] },
        worldChanges: ["Las tormentas revelan rutas y cofres especiales", "El Arco de las Dunas queda accesible"],
      },
    ),
    mission(
      "d7", 3, "campamento", "explorer", "La Ciudad Bajo la Arena",
      "La memoria hallada describe una entrada a la antigua capital bajo el Arco de las Dunas.",
      [
        objective("entra_c2", "enter_sector", "Llega al Arco de las Dunas.", { sectorId: "C2" }),
        objective("encuentra_entrada_ciudad", "interact", "Encuentra la entrada enterrada de la antigua capital.", { targetId: "desierto_c2_entrada_ciudad", sectorId: "C2" }),
        objective("abre_sello_entrada", "interact", "Activa el sello de acceso con la memoria mineral.", { targetId: "desierto_c2_sello_entrada", sectorId: "C2" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["d5"],
        reward: { gold: 60, xp: 3, questItem: "llave_ciudad_antigua" },
        requiredFlags: ["desierto:storm_memory_found"],
        onClaim: { unlockSectors: ["B2"], flags: ["desierto:ancient_city_open"] },
        worldChanges: ["La Ciudadela del Mercado queda abierta", "Aparecen investigadores y comerciantes antiguos"],
      },
    ),
    mission(
      "d_paid1", 1, "campamento", "flavor", "Ataque del siroco",
      "Una ráfaga hostil cruza la ruta inicial y arrastra criaturas hacia el campamento.",
      [objective("rechaza_siroco", "kill", "Rechaza cuatro enemigos durante el siroco.", { sectorId: "A1", count: 4 })],
      { type: "evento", threatMin: 7, cost: 10, reward: { gold: 30, potion: "hp_m" } },
    ),
  ],

  pueblo: [
    mission(
      "d2", 3, "pueblo", "main", "El Oasis que Muere",
      "La Guardiana del Oasis necesita reparar el sistema de agua construido bajo el pueblo.",
      [
        objective("habla_guardiana_oasis", "talk", "Habla con la Guardiana del Oasis.", { npcSector: "pueblo", npcRole: "main", sectorId: "B3" }),
        objective("examina_conducto", "interact", "Examina el conducto principal bajo el pueblo.", { targetId: "desierto_b3_conducto_oasis", sectorId: "B3" }),
        objective("limpia_toma_agua", "interact", "Retira la corrupción de la toma de agua.", { targetId: "desierto_b3_toma_agua", sectorId: "B3" }),
        objective("reactiva_fuente", "interact", "Reactiva la Fuente Central.", { targetId: "desierto_b3_fuente_central", sectorId: "B3" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["d10"],
        reward: { gold: 35, xp: 2, questItem: "sello_agua_antiguo" },
        onClaim: { flags: ["desierto:oasis_stable"] },
        worldChanges: ["El oasis recupera su caudal", "El Pueblo Oasis desbloquea fabricación avanzada"],
      },
    ),
    mission(
      "d3", 3, "pueblo", "historian", "Las Ruinas Enterradas",
      "Aran relaciona los símbolos del sistema de agua con ruinas reveladas por la tormenta.",
      [
        objective("habla_aran_ruinas", "talk", "Habla con el Historiador Aran.", { npcSector: "pueblo", npcRole: "historian", sectorId: "B3" }),
        objective("entra_ruinas_dunas", "enter_sector", "Regresa al Arco de las Dunas.", { sectorId: "C2" }),
        objective("examina_ruinas_enterradas", "interact", "Examina las ruinas recién expuestas.", { targetId: "desierto_c2_ruinas_enterradas", sectorId: "C2" }),
        objective("copia_simbolos", "interact", "Copia los símbolos de los Antiguos.", { targetId: "desierto_c2_simbolos_antiguos", sectorId: "C2" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["d2"],
        reward: { gold: 40, xp: 2, questItem: "calco_simbolos_antiguos" },
        onClaim: { flags: ["desierto:buried_ruins_read"] },
        worldChanges: ["Las ruinas quedan abiertas", "Aran identifica una ruta hacia el Cañón Rojo"],
      },
    ),
    mission(
      "d4", 3, "pueblo", "historian", "El Templo sin Nombre",
      "Los símbolos conducen a una estructura más antigua que la civilización solar.",
      [
        objective("entra_a2", "enter_sector", "Entra en el Cañón Rojo.", { sectorId: "A2" }),
        objective("encuentra_templo_sin_nombre", "interact", "Encuentra el Templo sin Nombre.", { targetId: "desierto_a2_templo_sin_nombre", sectorId: "A2" }),
        objective("lee_inscripcion_atlas", "interact", "Lee la inscripción anterior a los Antiguos.", { targetId: "desierto_a2_inscripcion_atlas", sectorId: "A2" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["d3"],
        reward: { gold: 50, xp: 3, questItem: "inscripcion_atlas_arida" },
        requiredFlags: ["desierto:buried_ruins_read"],
        onClaim: { flags: ["desierto:nameless_temple_open"] },
        worldChanges: ["El Templo sin Nombre queda accesible", "Se confirma que Atlas precede a la civilización solar"],
      },
    ),
    mission(
      "d6", 3, "pueblo", "main", "Los Guardianes de Arena",
      "La Guardiana pide comprender a tres guardianes antes de atacar la ciudad antigua.",
      [
        objective("guardian_roquedales", "interact", "Escucha al Guardián de los Roquedales.", { targetId: "desierto_c1_guardian_roquedales", sectorId: "C1" }),
        objective("guardian_dunas", "interact", "Escucha al Guardián de las Dunas.", { targetId: "desierto_c2_guardian_dunas", sectorId: "C2" }),
        objective("guardian_sol", "interact", "Escucha al Guardián del Sol en el Cañón Rojo.", { targetId: "desierto_a2_guardian_sol", sectorId: "A2" }),
      ],
      {
        type: "social",
        prerequisites: ["d4"],
        reward: { gold: 55, xp: 3, questItem: "llave_guardian_sol" },
        onClaim: { flags: ["desierto:guardian_key"] },
        worldChanges: ["Los guardianes dejan de atacar al jugador", "La llave del Guardián del Sol queda disponible"],
      },
    ),
    mission(
      "d12", 4, "pueblo", "main", "La Arena Corrompida",
      "La energía liberada por las ruinas contamina tres zonas del Reino Árido.",
      [
        objective("corrupcion_oasis", "interact", "Examina la corrupción junto al oasis de entrada.", { targetId: "desierto_a1_corrupcion_oasis", sectorId: "A1" }),
        objective("corrupcion_canon", "interact", "Examina la corrupción del Cañón Rojo.", { targetId: "desierto_a2_corrupcion_canon", sectorId: "A2" }),
        objective("corrupcion_dunas", "interact", "Examina la corrupción del Mar de Dunas.", { targetId: "desierto_c2_corrupcion_dunas", sectorId: "C2" }),
        objective("purga_corruptos", "kill", "Derrota a las criaturas corrompidas.", { sectorId: "C2", count: 3 }),
      ],
      {
        type: "combate",
        prerequisites: ["d11"],
        reward: { gold: 70, xp: 3, questItem: "muestra_arena_corrupta" },
        onClaim: { flags: ["desierto:corruption_mapped"] },
        worldChanges: ["La región entra en estado avanzado", "Aumentan los eventos y recompensas especiales"],
      },
    ),
    mission(
      "d13", 4, "pueblo", "main", "La Defensa del Oasis",
      "Criaturas de las profundidades atacan el Pueblo Oasis.",
      [
        objective("protege_fuente", "interact", "Asegura la Fuente Central.", { targetId: "desierto_b3_defensa_fuente", sectorId: "B3" }),
        objective("defiende_pueblo", "kill", "Derrota a cinco atacantes dentro del perímetro.", { sectorId: "B3", count: 5 }),
        objective("protege_muralla", "interact", "Refuerza la muralla cortaviento.", { targetId: "desierto_b3_defensa_muralla", sectorId: "B3" }),
        objective("evacua_habitantes", "interact", "Evacua a los habitantes vulnerables.", { targetId: "desierto_b3_defensa_habitantes", sectorId: "B3" }),
      ],
      {
        type: "proteccion",
        prerequisites: ["d12"],
        reward: { gold: 75, xp: 3, questItem: "estandarte_oasis" },
        onClaim: { flags: ["desierto:oasis_defended"] },
        worldChanges: ["El pueblo refuerza sus paneles cortaviento", "Aparecen guardias adicionales"],
      },
    ),
    mission(
      "d_paid2", 3, "pueblo", "flavor", "Emboscada del arenal",
      "Una banda de asaltantes aprovecha la tormenta para atacar las rutas del pueblo.",
      [objective("vence_asaltantes_arenal", "kill", "Derrota a cinco asaltantes del arenal.", { sectorId: "C2", count: 5 })],
      { type: "evento", threatMin: 7, cost: 15, reward: { gold: 35, potion: "hp_l" } },
    ),
  ],

  ciudad: [
    mission(
      "d8", 3, "ciudad", "main", "El Reino que Quiso Ascender",
      "El Faraón Eterno permite investigar los tres laboratorios superiores de la Ciudad Antigua.",
      [
        objective("camara_vida", "interact", "Investiga la Cámara de la Vida.", { targetId: "desierto_b2_camara_vida", sectorId: "B2" }),
        objective("camara_energia", "interact", "Investiga la Cámara de la Energía.", { targetId: "desierto_b2_camara_energia", sectorId: "B2" }),
        objective("camara_ascension", "interact", "Investiga la Cámara de Ascensión.", { targetId: "desierto_b2_camara_ascension", sectorId: "B2" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["d7"],
        reward: { gold: 65, xp: 3, questItem: "registro_proyecto_ascenso" },
        onClaim: { unlockSectors: ["A2"], flags: ["desierto:ascension_project_known"] },
        worldChanges: ["Los laboratorios quedan abiertos", "Aparecen guardianes experimentales"],
      },
    ),
    mission(
      "d9", 3, "ciudad", "priest", "El Fragmento del Sol",
      "El Sacerdote Solar necesita tres fragmentos para reactivar el núcleo de la ciudad.",
      [
        objective("fragmento_amanecer", "interact", "Recupera el Fragmento del Amanecer.", { targetId: "desierto_c1_fragmento_amanecer", sectorId: "C1" }),
        objective("fragmento_mediodia", "interact", "Recupera el Fragmento del Mediodía en la torre antigua.", { targetId: "desierto_a3_fragmento_mediodia", sectorId: "A3" }),
        objective("fragmento_eclipse", "interact", "Recupera el Fragmento del Eclipse bajo la ciudad.", { targetId: "desierto_b2_fragmento_eclipse", sectorId: "B2" }),
      ],
      {
        type: "recuperacion",
        prerequisites: ["d8"],
        reward: { gold: 70, xp: 3, questItem: "nucleo_solar_recompuesto" },
        onAccept: { unlockSectors: ["A3"] },
        onClaim: { flags: ["desierto:solar_core_active"] },
        worldChanges: ["El Núcleo Solar se reactiva", "La última biblioteca recibe energía"],
      },
    ),
    mission(
      "d10", 3, "ciudad", "priest", "La Última Biblioteca",
      "Con el núcleo activo, la última biblioteca de la ciudad puede abrirse.",
      [
        objective("activa_nucleo", "interact", "Activa el Núcleo Solar recompuesto.", { targetId: "desierto_b2_nucleo_solar", sectorId: "B2" }),
        objective("abre_biblioteca", "interact", "Abre la cámara protegida de la biblioteca.", { targetId: "desierto_b2_biblioteca_final", sectorId: "B2" }),
        objective("lee_registro_atlas", "interact", "Lee el registro completo sobre Atlas.", { targetId: "desierto_b2_registro_atlas", sectorId: "B2" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["d9"],
        reward: { gold: 75, xp: 4, questItem: "registro_final_atlas" },
        requiredFlags: ["desierto:solar_core_active"],
        onClaim: { unlockSectors: ["B3"], flags: ["desierto:last_library_read"] },
        worldChanges: ["El Pueblo Oasis queda conectado con la ciudad", "Se desbloquea el Acto IV"],
      },
    ),
    mission(
      "d11", 4, "ciudad", "main", "La Caída de los Antiguos",
      "El Faraón pide recuperar tres registros que explican las decisiones finales de la ciudad.",
      [
        objective("registro_advertencia", "interact", "Recupera La Advertencia.", { targetId: "desierto_b2_registro_advertencia", sectorId: "B2" }),
        objective("registro_experimento", "interact", "Recupera El Experimento en el Cañón Rojo.", { targetId: "desierto_a2_registro_experimento", sectorId: "A2" }),
        objective("registro_ultimo_dia", "interact", "Recupera El Último Día en la torre antigua.", { targetId: "desierto_a3_registro_ultimo_dia", sectorId: "A3" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["d6"],
        reward: { gold: 80, xp: 4, questItem: "tres_registros_antiguos" },
        requiredFlags: ["desierto:last_library_read", "desierto:guardian_key"],
        onClaim: { flags: ["desierto:ancient_fall_known"] },
        worldChanges: ["La Ciudad Antigua cambia de estado", "Aparecen restauradores y nuevos comerciantes"],
      },
    ),
    mission(
      "d14", 4, "ciudad", "priest", "El Camino al Templo Solar",
      "Cuatro pilares mantienen enterrado el Templo Solar.",
      [
        objective("pilar_agua", "interact", "Activa el Pilar del Agua.", { targetId: "desierto_a1_pilar_agua", sectorId: "A1" }),
        objective("pilar_arena", "interact", "Activa el Pilar de Arena.", { targetId: "desierto_c2_pilar_arena", sectorId: "C2" }),
        objective("pilar_sol", "interact", "Activa el Pilar del Sol.", { targetId: "desierto_a3_pilar_sol", sectorId: "A3" }),
        objective("pilar_vacio", "interact", "Activa el Pilar del Vacío.", { targetId: "desierto_a2_pilar_vacio", sectorId: "A2" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["d13"],
        reward: { gold: 85, xp: 4, questItem: "sello_templo_solar" },
        requiredFlags: ["desierto:oasis_defended", "desierto:ancient_fall_known"],
        onClaim: { unlockSectors: ["C3"], flags: ["desierto:boss_gateway_ready"] },
        worldChanges: ["El Templo Solar emerge", "La región entra en estado final"],
      },
    ),
    mission(
      "d15", 5, "ciudad", "priest", "El Último Rey de la Arena",
      "Entra al Templo Solar y enfrenta a Amon, Portador del Sol Eterno.",
      [
        objective("entra_c3", "enter_sector", "Entra en el Templo Solar.", { sectorId: "C3" }),
        objective("activa_nucleo_templo", "interact", "Activa el núcleo del templo.", { targetId: "desierto_c3_nucleo_templo", sectorId: "C3" }),
        objective("derrota_amon", "boss", "Derrota a Amon, Portador del Sol Eterno.", { targetId: "amon_solar", sectorId: "C3" }),
        objective("libera_amon", "interact", "Libera el espíritu de Amon.", { targetId: "desierto_c3_espiritu_amon", sectorId: "C3" }),
      ],
      {
        type: "combate",
        prerequisites: ["d14"],
        reward: { gold: 150, xp: 5, item: "escudo_portatil" },
        requiredFlags: ["desierto:boss_gateway_ready"],
        onClaim: { flags: ["desierto:completed", "desierto:amon_freed"] },
        worldChanges: ["El Templo Solar queda abierto como archivo", "Se desbloquean eventos cruzados entre regiones"],
      },
    ),
    mission(
      "d_paid3", 4, "ciudad", "main", "Despertar del Lich",
      "Guardianes muertos despiertan bajo la ciudad durante una subida de amenaza.",
      [objective("vence_elite_lich", "kill", "Derrota seis élites del despertar.", { sectorId: "B2", count: 6 })],
      { type: "evento", threatMin: 8, cost: 20, reward: { gold: 40, potion: "hp_l", item: "escudo_portatil" } },
    ),
    mission(
      "d_wild1", 4, "ciudad", "main", "Ruinas del Sur",
      "El Faraón pide confirmar una estructura aislada al sur de la torre antigua.",
      [objective("examina_ruinas_sur", "interact", "Examina las Ruinas del Sur.", { targetId: "desierto_a3_ruinas_sur", sectorId: "A3" })],
      { type: "exploracion", prerequisites: ["d10"], reward: { gold: 30, xp: 1 } },
    ),
  ],
};

export const DESERT_STORY_POINT_IDS = new Set(
  Object.values(DESERT_CAMPAIGN_V2)
    .flat()
    .flatMap(m => m.objectives)
    .filter(o => o.type === "interact" && o.targetId)
    .map(o => o.targetId),
);

export default DESERT_CAMPAIGN_V2;
