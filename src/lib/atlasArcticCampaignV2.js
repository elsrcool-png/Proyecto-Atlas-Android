// PROYECTO ATLAS — Región Ártica, campaña jugable v2.
// 15 misiones principales encadenadas, vinculadas a sectores, NPC y puntos narrativos.
// Mismo formato que GREEN_CAMPAIGN_V2: objetivos con targetId/sectorId/npcSector/npcRole.

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
  threatMin: 0,
  cost: 0,
  worldChanges: options.worldChanges || [],
  onAccept: options.onAccept || null,
  onReady: options.onReady || null,
  onClaim: options.onClaim || null,
  requiredFlags: options.requiredFlags || [],
  mode: options.mode || "clasico",
  storySummary: options.storySummary || "",
});

export const ARCTIC_CAMPAIGN_V2 = {
  campamento: [
    // ─── Acto I ───
    mission(
      "f1", 1, "campamento", "main", "El Último Mensajero",
      "Un mensajero fue enviado a la estación de vigilancia y nunca regresó. Boreas necesita que sigas sus huellas.",
      [
        objective("examina_naufragio", "interact", "Examina el naufragio en la Bahía Helada.", { targetId: "fria_a1_naufragio", sectorId: "A1" }),
        objective("llega_campamento", "enter_sector", "Atraviesa el sendero hasta el Campamento Provisorio Boreal.", { sectorId: "B1" }),
        objective("informa_boreas", "talk", "Informa al Explorador Boreas de tu llegada.", { npcSector: "campamento", npcRole: "main", sectorId: "B1" }),
        objective("entra_estacion", "enter_sector", "Sigue las huellas hacia el Bosque de la Estación Perdida.", { sectorId: "C1" }),
        objective("recupera_mensaje", "interact", "Recupera el mensaje del mensajero en la estación.", { targetId: "fria_c1_mensaje_mensajero", sectorId: "C1" }),
      ],
      {
        type: "investigacion",
        onAccept: { unlockSectors: ["C1"] },
        reward: { gold: 25, xp: 2, questItem: "mensaje_ultimo_mensajero" },
        onClaim: { flags: ["fria:boreas_trust"] },
        worldChanges: ["El Campamento Boreal comienza a confiar en el jugador", "Boreas desbloquea nuevos diálogos"],
        storySummary: "Establece la llegada al norte y la primera pista sobre los cristales.",
      },
    ),
    mission(
      "f2", 1, "campamento", "cartographer", "La Ruta Perdida",
      "La Cartógrafa Lyra te pide reconstruir la antigua ruta comercial hacia el Pueblo Glacial.",
      [
        objective("habla_lyra", "talk", "Habla con la Cartógrafa Lyra.", { npcSector: "campamento", npcRole: "cartographer", sectorId: "B1" }),
        objective("entra_grieta", "enter_sector", "Explora la Grieta de los Cristales.", { sectorId: "C2" }),
        objective("mojon_1", "interact", "Examina los símbolos del primer mojón de la ruta.", { targetId: "fria_c2_mojon_1", sectorId: "C2" }),
        objective("mojon_2", "interact", "Recupera la señal del segundo mojón, junto al puente.", { targetId: "fria_c2_mojon_2", sectorId: "C2" }),
        objective("hito_comercial", "interact", "Confirma la ruta en el antiguo hito comercial.", { targetId: "fria_c2_hito_comercial", sectorId: "C2" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["f1"],
        onAccept: { unlockSectors: ["C2"] },
        reward: { gold: 35, xp: 2, questItem: "mapa_ruta_boreal" },
        onClaim: { flags: ["fria:route_restored"] },
        worldChanges: ["La ruta comercial queda restaurada", "Se confirman símbolos idénticos a la Región Verde"],
        storySummary: "Conecta el campamento con el sur y revela el vínculo con los Guardianes.",
      },
    ),
    mission(
      "f3", 1, "campamento", "hunter", "La Cacería Blanca",
      "La Cazadora Freya reporta criaturas alteradas por los cristales. Investiga y recupera muestras.",
      [
        objective("habla_freya", "talk", "Habla con la Cazadora Freya.", { npcSector: "campamento", npcRole: "hunter", sectorId: "B1" }),
        objective("entra_bosque_caza", "enter_sector", "Investiga las zonas de caza del Bosque de la Estación Perdida.", { sectorId: "C1" }),
        objective("derrota_alteradas", "kill", "Derrota criaturas alteradas por el cristal.", { sectorId: "C1", count: 3 }),
        objective("muestra_cristal", "interact", "Recupera una muestra de cristal adherida a una bestia.", { targetId: "fria_c1_cristal_bestia", sectorId: "C1" }),
        objective("lleva_ciudadela", "enter_sector", "Lleva las muestras a la Ciudadela Helada.", { sectorId: "B2" }),
        objective("entrega_investigadora", "talk", "Entrega las muestras a la Investigadora Lyra.", { npcSector: "ciudad", npcRole: "researcher", sectorId: "B2" }),
      ],
      {
        type: "combate",
        prerequisites: ["f2"],
        onAccept: { unlockSectors: ["B2"] },
        reward: { gold: 40, xp: 2, questItem: "muestra_cristal_bestia" },
        onClaim: { unlockSectors: ["B3"], flags: ["fria:crystal_samples", "fria:city_access"] },
        worldChanges: ["Los cazadores comienzan a vender materiales raros", "La Investigadora inicia su línea de estudio"],
        storySummary: "Presenta la corrupción de la fauna y abre la Ciudadela al jugador.",
      },
    ),
    // ─── Acto II ───
    mission(
      "f6", 2, "campamento", "main", "La Expedición Perdida",
      "Una expedición completa intentó investigar las ruinas y nunca volvió. Boreas pide que encuentres al único superviviente.",
      [
        objective("habla_boreas_f6", "talk", "Habla con el Explorador Boreas sobre la expedición.", { npcSector: "campamento", npcRole: "main", sectorId: "B1" }),
        objective("entra_ruinas_portadores", "enter_sector", "Entra en las Ruinas de los Portadores.", { sectorId: "A2" }),
        objective("campamento_expedicion", "interact", "Encuentra el campamento abandonado de la expedición.", { targetId: "fria_a2_campamento_expedicion", sectorId: "A2" }),
        objective("rescata_einar", "interact", "Rescata a Einar, el único superviviente.", { targetId: "fria_a2_einar", sectorId: "A2" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["f5"],
        onAccept: { unlockSectors: ["A2"] },
        reward: { gold: 55, xp: 3, questItem: "diario_einar" },
        onClaim: { flags: ["fria:einar_returned"] },
        worldChanges: ["Einar vuelve al Campamento Boreal", "Nuevo aliado para la campaña"],
        storySummary: "Recupera al último testigo de la expedición y prepara el Acto III.",
      },
    ),
    // ─── Acto IV ───
    mission(
      "f11", 4, "campamento", "main", "La Última Expedición",
      "Boreas coordina el equipo final: Einar, el Chamán Hielo y el Forjador Kael.",
      [
        objective("reune_einar", "interact", "Reúne a Einar en el Campamento Boreal.", { targetId: "fria_b1_einar", sectorId: "B1" }),
        objective("pide_chaman", "talk", "Pide al Chamán Hielo que se una a la expedición.", { npcSector: "pueblo", npcRole: "main", sectorId: "B3" }),
        objective("pide_forjador", "talk", "Pide al Forjador Kael que aporte su arte.", { npcSector: "ciudad", npcRole: "forger", sectorId: "B2" }),
      ],
      {
        type: "social",
        prerequisites: ["f10"],
        reward: { gold: 65, xp: 3, questItem: "orden_expedicion_final" },
        requiredFlags: ["fria:einar_returned"],
        onClaim: { flags: ["fria:expedition_ready"] },
        worldChanges: ["El Campamento Boreal se transforma en centro de expedición", "Los habitantes se convierten en aliados"],
        storySummary: "Reúne a los tres aliados clave antes del asalto final.",
      },
    ),
  ],

  pueblo: [
    // ─── Acto I ───
    mission(
      "f3b", 1, "pueblo", "main", "El Cristal que Susurra",
      "El Chamán Hielo te pide investigar un cristal extraño que no pertenece a ninguna mina conocida.",
      [
        objective("habla_chaman_cristal", "talk", "Habla con el Chamán Hielo sobre el cristal.", { npcSector: "pueblo", npcRole: "main", sectorId: "B3" }),
        objective("investiga_origen", "interact", "Investiga el origen del cristal junto al Chamán.", { targetId: "fria_b3_cristal_susurro", sectorId: "B3" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["f3"],
        reward: { gold: 40, xp: 2, questItem: "cristal_susurro" },
        onClaim: { flags: ["fria:crystal_whisper"] },
        worldChanges: ["El Pueblo Glacial desbloquea fabricación avanzada", "Investigación de cristales disponible"],
        storySummary: "Introduce al Chamán y al cristal como hilo conductor del Pueblo.",
      },
    ),
    // ─── Acto II ───
    mission(
      "f5", 2, "pueblo", "main", "Bajo el Lago Congelado",
      "El cristal pertenece a una estructura bajo un lago congelado. Activa los mecanismos y recupera los símbolos.",
      [
        objective("habla_chaman_lago", "talk", "Habla con el Chamán Hielo del lago congelado.", { npcSector: "pueblo", npcRole: "main", sectorId: "B3" }),
        objective("entra_grieta_lago", "enter_sector", "Llega a la Grieta de los Cristales y al lago congelado.", { sectorId: "C2" }),
        objective("activa_mecanismos_lago", "interact", "Activa los antiguos mecanismos del lago.", { targetId: "fria_c2_lago_acceso", sectorId: "C2" }),
        objective("recupera_simbolos_lago", "interact", "Recupera los símbolos bajo el lago congelado.", { targetId: "fria_c2_lago_simbolos", sectorId: "C2" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["f3b"],
        reward: { gold: 50, xp: 3, questItem: "simbolos_lago_congelado" },
        onClaim: { flags: ["fria:lake_explored"] },
        worldChanges: ["Se desbloquea la zona de Ruinas Sumergidas", "Los cristales eran una prisión"],
        storySummary: "Descubre que los cristales sellaban algo bajo el hielo.",
      },
    ),
    // ─── Acto III ───
    mission(
      "f8", 3, "pueblo", "main", "Los Portadores Perdidos",
      "Busca los tres santuarios antiguos de los Portadores en las Ruinas de los Portadores.",
      [
        objective("habla_chaman_portadores", "talk", "Habla con el Chamán Hielo sobre los Portadores.", { npcSector: "pueblo", npcRole: "main", sectorId: "B3" }),
        objective("entra_ruinas_portadores_f8", "enter_sector", "Entra en las Ruinas de los Portadores.", { sectorId: "A2" }),
        objective("santuario_alba", "interact", "Investiga el Santuario del Alba.", { targetId: "fria_a2_santuario_alba", sectorId: "A2" }),
        objective("santuario_guardian", "interact", "Investiga el Santuario del Guardián.", { targetId: "fria_a2_santuario_guardian", sectorId: "A2" }),
        objective("santuario_vacio", "interact", "Investiga el Santuario del Vacío.", { targetId: "fria_a2_santuario_vacio", sectorId: "A2" }),
        objective("memoria_portadores", "interact", "Recupera la memoria de los Portadores.", { targetId: "fria_a2_memoria_portadores", sectorId: "A2" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["f7"],
        reward: { gold: 65, xp: 3, questItem: "memoria_portadores" },
        onClaim: { flags: ["fria:bearers_revealed"] },
        worldChanges: ["Los habitantes entienden que los Portadores se sacrificaron", "La corrupción fue liberada, no creada"],
        storySummary: "Revela el sacrificio de los Portadores y el origen de la corrupción.",
      },
    ),
    // ─── Acto IV ───
    mission(
      "f12", 4, "pueblo", "main", "El Corazón del Cristal",
      "El cristal original está fragmentado. Recolecta los tres fragmentos del Corazón del Cristal.",
      [
        objective("habla_chaman_corazon", "talk", "Habla con el Chamán Hielo del Corazón del Cristal.", { npcSector: "pueblo", npcRole: "main", sectorId: "B3" }),
        objective("fragmento_bosque", "interact", "Recupera el fragmento del Bosque Congelado.", { targetId: "fria_c1_fragmento", sectorId: "C1" }),
        objective("fragmento_lago", "interact", "Recupera el fragmento del Lago Helado.", { targetId: "fria_c2_fragmento_corazon", sectorId: "C2" }),
        objective("fragmento_glaciar", "interact", "Recupera el fragmento del Glaciar.", { targetId: "fria_a3_fragmento", sectorId: "A3" }),
      ],
      {
        type: "recuperacion",
        prerequisites: ["f11"],
        reward: { gold: 70, xp: 3, questItem: "corazon_cristal_recompuesto" },
        onClaim: { flags: ["fria:crystal_heart_complete"] },
        worldChanges: ["Se revela un mapa antiguo del mundo completo", "Los Portadores conocían todas las regiones"],
        storySummary: "Recompone el cristal original como preparación para el sello final.",
      },
    ),
  ],

  ciudad: [
    // ─── Acto III ───
    mission(
      "f7", 3, "ciudad", "main", "La Ciudad Bajo el Hielo",
      "La Reina de Hielo te encomienda atravesar los glaciares profundos y explorar la Ciudad de Nivalis.",
      [
        objective("habla_reina_nivalis", "talk", "Habla con la Reina de Hielo.", { npcSector: "ciudad", npcRole: "main", sectorId: "B2" }),
        objective("entra_puesto_avanzado", "enter_sector", "Atraviesa los glaciares hacia el Puesto Avanzado Boreal.", { sectorId: "A3" }),
        objective("explora_nivalis", "interact", "Activa los antiguos mecanismos y explora la Ciudad de Nivalis.", { targetId: "fria_a3_nivalis", sectorId: "A3" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["f6"],
        onAccept: { unlockSectors: ["A3"] },
        reward: { gold: 60, xp: 3, questItem: "sello_nivalis" },
        onClaim: { flags: ["fria:nivalis_explored"] },
        worldChanges: ["Nueva zona disponible: Ciudad de Nivalis", "Aparecen cofres antiguos y materiales especiales"],
        storySummary: "Descubre que bajo el hielo existía una ciudad de los Portadores.",
      },
    ),
    mission(
      "f9", 3, "ciudad", "researcher", "El Cristal Negro",
      "La Investigadora Lyra cree que existe un cristal que consume energía en lugar de generarla.",
      [
        objective("habla_investigadora", "talk", "Habla con la Investigadora Lyra.", { npcSector: "ciudad", npcRole: "researcher", sectorId: "B2" }),
        objective("entra_zona_prohibida", "enter_sector", "Entra en la zona prohibida, la antigua cámara sellada.", { sectorId: "C2" }),
        objective("derrota_guardianes_camara", "kill", "Derrota a los guardianes de la cámara.", { sectorId: "C2", count: 2 }),
        objective("origen_cristal_negro", "interact", "Encuentra el origen del Cristal Negro.", { targetId: "fria_c2_cristal_negro", sectorId: "C2" }),
      ],
      {
        type: "combate",
        prerequisites: ["f8"],
        reward: { gold: 65, xp: 3, questItem: "nucleo_cristal_negro" },
        onClaim: { flags: ["fria:black_crystal_found"] },
        worldChanges: ["La Ciudadela Helada prepara una expedición final", "Atlas sostiene aquello que otros no pudieron sostener"],
        storySummary: "Revela la contraparte oscura del cristal y el verdadero papel de Atlas.",
      },
    ),
    mission(
      "f10", 3, "ciudad", "main", "La Puerta Sellada",
      "Toda la información lleva a una puerta gigantesca bajo la montaña. Enfréntate a sus guardianes.",
      [
        objective("habla_reina_puerta", "talk", "Habla con la Reina de Hielo sobre la puerta.", { npcSector: "ciudad", npcRole: "main", sectorId: "B2" }),
        objective("derrota_guardianes_puerta", "kill", "Enfrenta a los antiguos guardianes bajo la montaña.", { sectorId: "C2", count: 4 }),
        objective("llega_puerta_sellada", "interact", "Llega a la Puerta Sellada bajo la montaña.", { targetId: "fria_c2_puerta", sectorId: "C2" }),
      ],
      {
        type: "combate",
        prerequisites: ["f9"],
        reward: { gold: 70, xp: 3, questItem: "runa_puerta_sellada" },
        onClaim: { flags: ["fria:door_found", "fria:act4_open"] },
        worldChanges: ["Se desbloquea el acceso al Acto IV", "Los habitantes comienzan los preparativos finales"],
        storySummary: "Abre el Acto IV y confirma el lugar del enfrentamiento final.",
      },
    ),
    // ─── Acto IV ───
    mission(
      "f13", 4, "ciudad", "captain", "La Ciudadela en Guerra",
      "El Capitán Boreal coordina la defensa de la Ciudadela frente a las criaturas del hielo.",
      [
        objective("habla_capitan", "talk", "Habla con el Capitán Boreal.", { npcSector: "ciudad", npcRole: "captain", sectorId: "B2" }),
        objective("repela_criaturas", "kill", "Repela a las criaturas que asaltan la Ciudadela.", { sectorId: "B2", targetId: "fria_f13_defensa_ciudadela", count: 5 }),
        objective("asegura_puerta", "interact", "Asegura la Puerta exterior de la Ciudadela.", { targetId: "fria_b2_defensa_puerta", sectorId: "B2" }),
        objective("protege_cristales", "interact", "Protege la Zona de cristales.", { targetId: "fria_b2_defensa_cristales", sectorId: "B2" }),
        objective("defiende_nucleo", "interact", "Defiende el Núcleo de la Ciudadela.", { targetId: "fria_b2_defensa_nucleo", sectorId: "B2" }),
      ],
      {
        type: "proteccion",
        prerequisites: ["f12"],
        reward: { gold: 75, xp: 3, questItem: "medalla_defensa_ciudadela" },
        onClaim: { flags: ["fria:citadel_defended"] },
        worldChanges: ["Dependiendo del desempeño, los NPC cambian diálogos y servicios"],
        storySummary: "Defiende la Ciudadela antes de activar los sellos finales.",
      },
    ),
    mission(
      "f14", 4, "ciudad", "main", "Los Tres Sellos",
      "La puerta no puede abrirse sin activar tres sellos: del Tiempo, de Vida y del Vacío.",
      [
        objective("habla_reina_sellos", "talk", "Habla con la Reina de Hielo sobre los sellos.", { npcSector: "ciudad", npcRole: "main", sectorId: "B2" }),
        objective("sello_tiempo", "interact", "Activa el Sello del Tiempo en Nivalis.", { targetId: "fria_a3_sello_tiempo", sectorId: "A3" }),
        objective("sello_vida", "interact", "Activa el Sello de Vida en el Bosque Congelado.", { targetId: "fria_c1_sello_vida", sectorId: "C1" }),
        objective("sello_vacio", "interact", "Activa el Sello del Vacío en las Cavernas Profundas.", {
          targetId: "fria_c2_sello_vacio", sectorId: "C2",
          onComplete: { unlockSectors: ["C3"], flags: ["fria:boss_gate_ready"] },
        }),
      ],
      {
        type: "exploracion",
        prerequisites: ["f13"],
        reward: { gold: 80, xp: 4, questItem: "llave_nucleo_glacial" },
        requiredFlags: ["fria:crystal_heart_complete"],
        onClaim: { unlockSectors: ["C3"], flags: ["fria:boss_preparation_ready"] },
        worldChanges: ["Toda la región entra en estado final", "Tormentas más intensas, enemigos más fuertes", "Acceso al jefe desbloqueado"],
        storySummary: "Activa los tres sellos y abre el Núcleo Glacial.",
      },
    ),
    // ─── Acto V ───
    mission(
      "f15", 5, "ciudad", "main", "El Último Portador",
      "Entra en el Núcleo Glacial bajo la montaña y enfrenta a Aurel, el último Portador del Equilibrio.",
      [
        objective("entra_nucleo_glacial", "enter_sector", "Entra en el Núcleo Glacial cuando estés preparado.", { sectorId: "C3" }),
        objective("derrota_aurel", "boss", "Derrota a Aurel, el Último Portador del Equilibrio.", { targetId: "aurel_portador", sectorId: "C3" }),
        objective("libera_espiritu_aurel", "interact", "Libera el espíritu de Aurel.", { targetId: "fria_c3_espiritu_aurel", sectorId: "C3" }),
      ],
      {
        type: "combate",
        prerequisites: ["f14"],
        reward: { gold: 120, xp: 5, item: "brazal_arcano" },
        requiredFlags: ["fria:boss_preparation_ready"],
        onClaim: { flags: ["fria:restored", "fria:postgame_open", "desierto:region_ready"] },
        worldChanges: ["La Región Ártica cambia", "El hielo comienza a ceder", "Se desbloquean nuevos eventos en regiones anteriores"],
        storySummary: "Culmina la campaña con la liberación del segundo de los antiguos héroes.",
      },
    ),
  ],
};

export const FRIA_STORY_POINT_IDS = new Set(
  Object.values(ARCTIC_CAMPAIGN_V2)
    .flat()
    .flatMap(m => m.objectives)
    .filter(o => o.type === "interact")
    .map(o => o.targetId),
);