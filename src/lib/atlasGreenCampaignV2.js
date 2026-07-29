// PROYECTO ATLAS — Región Verde, campaña jugable v2.
// 15 misiones principales, ordenadas y vinculadas a sectores, NPC y puntos narrativos concretos.

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

export const GREEN_CAMPAIGN_V2 = {
  campamento: [
    mission(
      "v1", 1, "campamento", "main", "Un rostro desconocido",
      "Roland necesita comprobar que conoces a las personas que mantienen vivo el Campamento del Umbral.",
      [
        objective("talk_bren", "talk", "Habla con Bren, el herrero.", { npcSector: "campamento", npcRole: "smith", sectorId: "A2" }),
        objective("talk_elia", "talk", "Habla con Elia, la herbolaria.", { npcSector: "campamento", npcRole: "herbalist", sectorId: "A2" }),
        objective("talk_cedric", "talk", "Habla con Cedric, el explorador.", { npcSector: "campamento", npcRole: "explorer", sectorId: "A2" }),
      ],
      {
        type: "investigacion",
        reward: { gold: 20, xp: 1, questItem: "kit_viaje_basico" },
        onClaim: { flags: ["verde:camp_services_active", "verde:known_by_camp"] },
        worldChanges: ["Los habitantes comienzan a reconocer al jugador", "La herrería, la herbolaria y la mesa de exploración cobran actividad"],
        storySummary: "Presenta el campamento y sus tres servicios fundamentales sin usar un tutorial aislado.",
      },
    ),
    mission(
      "v2", 1, "campamento", "smith", "Primer Encargo",
      "La caja de herramientas de Bren quedó junto a una carreta atacada en el perímetro sur.",
      [
        objective("inspect_tracks", "interact", "Examina los rastros junto al camino inferior.", { targetId: "verde_a2_rastros_carreta", sectorId: "A2" }),
        objective("find_wagon", "interact", "Encuentra la carreta abandonada.", { targetId: "verde_a2_carreta", sectorId: "A2" }),
        objective("clear_wagon", "kill", "Derrota a las criaturas que rodean la carreta.", { sectorId: "A2", count: 2 }),
        objective("recover_tools", "interact", "Recupera la Caja de Herramientas.", { targetId: "verde_a2_caja_herramientas", sectorId: "A2" }),
      ],
      {
        type: "combate",
        prerequisites: ["v1"],
        reward: { gold: 25, xp: 1, material: "madera_dura" },
        onClaim: { flags: ["verde:basic_forge_repaired", "verde:camp_basic_stock"] },
        worldChanges: ["La forja vuelve a emitir humo", "El campamento ofrece equipo básico limitado"],
        storySummary: "Establece que la seguridad del campamento depende de rutas cada vez más peligrosas.",
      },
    ),
    mission(
      "v3", 1, "campamento", "explorer", "El bosque guarda silencio",
      "Cedric abre la barricada norte para que investigues el deterioro de la laguna.",
      [
        objective("enter_a1", "enter_sector", "Entra en la Laguna de los Susurros.", { sectorId: "A1" }),
        objective("inspect_tracks_a1", "interact", "Examina las huellas de animales que huyen.", { targetId: "verde_a1_huellas", sectorId: "A1" }),
        objective("inspect_tree", "interact", "Examina el árbol marchito.", { targetId: "verde_a1_arbol_marchito", sectorId: "A1" }),
        objective("inspect_altar", "interact", "Observa el altar cubierto por raíces sin dañarlo.", { targetId: "verde_a1_altar_raices", sectorId: "A1" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["v2"],
        reward: { gold: 30, xp: 1, questItem: "amuleto_explorador" },
        onAccept: { unlockSectors: ["A1"], flags: ["verde:north_barricade_open"] },
        onClaim: { flags: ["verde:act2_open", "verde:lagoon_herbs_available"] },
        worldChanges: ["Disminuye la fauna cerca del campamento", "Elia modifica su inventario por la escasez"],
        storySummary: "Confirma que la amenaza no proviene solamente de monstruos.",
      },
    ),
    mission(
      "v4", 2, "campamento", "main", "La Caravana Perdida",
      "Un despacho del alcalde Tomás informa que una caravana de alimentos desapareció cerca de la laguna.",
      [
        objective("find_trade_detour", "interact", "Encuentra el desvío comercial oculto junto a la laguna.", { targetId: "verde_a1_desvio_comercial", sectorId: "A1" }),
        objective("find_caravan", "interact", "Localiza la caravana atrapada por árboles caídos.", { targetId: "verde_a1_caravana", sectorId: "A1" }),
        objective("defend_caravan", "kill", "Defiende a los supervivientes en dos encuentros.", { sectorId: "A1", count: 2 }),
        objective("secure_survivors", "interact", "Habla con los supervivientes y asegura el cargamento.", { targetId: "verde_a1_supervivientes", sectorId: "A1" }),
      ],
      {
        type: "proteccion",
        prerequisites: ["v3"],
        reward: { gold: 40, xp: 2, questItem: "suministros_caravana" },
        onClaim: { unlockSectors: ["B1"], flags: ["verde:caravan_rescued", "verde:trade_route_partial"] },
        worldChanges: ["La caravana aparece reparándose en el campamento", "Se descubre el sendero hacia las Ruinas del Vigía"],
        storySummary: "Conecta la crisis del bosque con la supervivencia civil del pueblo.",
      },
    ),
    mission(
      "v5", 2, "campamento", "survivor", "Los Vigilantes del Sendero",
      "Uno de los comerciantes rescatados recuerda a tres aventureros que vigilaban el acceso a las ruinas.",
      [
        objective("find_watchers", "interact", "Sigue las señales hasta el campamento de los Vigilantes.", { targetId: "verde_a1_campamento_vigilantes", sectorId: "A1" }),
        objective("hear_watchers", "interact", "Escucha la conversación completa de los tres aventureros.", { targetId: "verde_a1_dialogo_vigilantes", sectorId: "A1" }),
        objective("defend_watchers", "kill", "Ayuda a defender el campamento improvisado.", { sectorId: "A1", count: 2 }),
        objective("choose_contract", "interact", "Acepta el primer contrato de compañero para la expedición.", { targetId: "verde_a1_contrato_companero", sectorId: "A1" }),
      ],
      {
        type: "proteccion",
        prerequisites: ["v4"],
        reward: { gold: 25, xp: 1, questItem: "contrato_companero_verde" },
        onClaim: { flags: ["verde:companion_system_unlocked", "verde:watchers_camp_persistent"] },
        worldChanges: ["Los Vigilantes permanecen en A1", "Un aventurero puede ser contratado en el campamento"],
        storySummary: "Presenta narrativamente el futuro sistema de compañeros autónomos.",
      },
    ),
    mission(
      "v6", 2, "campamento", "explorer", "El Eco de las Ruinas",
      "Cedric pide explorar las Ruinas del Vigía con el apoyo de los Vigilantes.",
      [
        objective("enter_b1", "enter_sector", "Entra en las Ruinas del Vigía.", { sectorId: "B1" }),
        objective("activate_ruins", "interact", "Activa los mecanismos de entrada.", { targetId: "verde_b1_mecanismo", sectorId: "B1" }),
        objective("clear_ruins", "kill", "Supera a los guardianes de las ruinas y al Guardián de Piedra.", { sectorId: "B1", count: 3 }),
        objective("read_inscription", "interact", "Lee la inscripción del corazón del mundo.", { targetId: "verde_b1_inscripcion", sectorId: "B1" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["v5"],
        reward: { gold: 45, xp: 2, questItem: "sello_piedra" },
        onClaim: { unlockSectors: ["C1"], flags: ["verde:ruins_open", "verde:ancient_chests_open"] },
        worldChanges: ["Las ruinas quedan abiertas y rejugables", "El comercio incorpora una antorcha especial"],
        mode: "tactico_preparado",
        storySummary: "Primera dungeon de la campaña y primera referencia clara al corazón del mundo.",
      },
    ),
    mission(
      "v7", 3, "campamento", "explorer", "El Viejo Cartógrafo",
      "Cedric cree que un cartógrafo aislado puede reconocer los símbolos de las ruinas.",
      [
        objective("copy_inscription", "interact", "Obtén una copia legible de la inscripción.", { targetId: "verde_b1_copia_inscripcion", sectorId: "B1" }),
        objective("find_tower_clue", "interact", "Sigue las referencias del paisaje hasta la senda de la torre.", {
          targetId: "verde_c1_senda_cartografo", sectorId: "C1",
          onComplete: { unlockSectors: ["C2"], flags: ["verde:cartographer_route_open"] },
        }),
        objective("enter_c2", "enter_sector", "Llega al Pueblo de Robledal.", { sectorId: "C2" }),
        objective("talk_cartographer", "talk", "Muestra la inscripción al Cartógrafo.", { npcSector: "pueblo", npcRole: "cartographer", sectorId: "C2" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["v6"],
        onAccept: { unlockSectors: ["C2"], flags: ["verde:cartographer_route_open"] },
        reward: { gold: 50, xp: 2, questItem: "fragmento_mapa_antiguo_1" },
        onClaim: { flags: ["verde:cartographer_permanent", "verde:guardians_revealed"] },
        worldChanges: ["La torre queda habitada", "El mapa regional obtiene nuevas anotaciones"],
        storySummary: "Introduce a los Guardianes y establece al Cartógrafo como hilo conductor de la saga.",
      },
    ),
    mission(
      "v11", 4, "campamento", "main", "La Patrulla Perdida",
      "Roland autoriza una incursión al Bosque de las Raíces para encontrar a una patrulla desaparecida.",
      [
        objective("enter_a3", "enter_sector", "Entra en el Bosque de las Raíces.", { sectorId: "A3" }),
        objective("inspect_destroyed_camp", "interact", "Examina el campamento destruido.", { targetId: "verde_a3_campamento_destruido", sectorId: "A3" }),
        objective("survive_ambushes", "kill", "Supera las emboscadas organizadas.", { sectorId: "A3", count: 3 }),
        objective("rescue_scout", "interact", "Rescata al explorador herido.", { targetId: "verde_a3_explorador_herido", sectorId: "A3" }),
      ],
      {
        type: "proteccion",
        prerequisites: ["v10"],
        reward: { gold: 55, xp: 2, questItem: "receta_botiquin" },
        onAccept: { unlockSectors: ["A3"], flags: ["verde:expedition_permit_used"] },
        onClaim: { flags: ["verde:scout_rescued", "verde:a3_active_front"] },
        worldChanges: ["Aparecen patrullas adicionales", "El superviviente se recupera en A2"],
        storySummary: "Demuestra que las criaturas ya actúan con coordinación.",
      },
    ),
    mission(
      "v12", 4, "ciudad", "smith", "La Forja de Verdalia y la Reliquia Verde",
      "El Herrero Real puede restaurar la hoja del Guardián, pero la forja regional exige tres componentes recuperados durante la expedición.",
      [
        objective("recover_ancient_ore", "interact", "Libera a los mineros y recupera mineral antiguo.", { targetId: "verde_a3_mineral_antiguo", sectorId: "A3", onComplete: { questItems: ["mineral_antiguo_guardian"] } }),
        objective("recover_ritual_charcoal", "interact", "Ayuda a los carboneros y recupera carbón ritual.", {
          targetId: "verde_b1_carbon_ritual", sectorId: "B1",
          onComplete: { unlockSectors: ["B3"], flags: ["verde:river_pass_open"], questItems: ["carbon_ritual_verde"] },
        }),
        objective("enter_b3", "enter_sector", "Entra en el Paso del Río Antiguo.", { sectorId: "B3" }),
        objective("clear_crystal_route", "kill", "Asegura el corredor del núcleo de cristal.", { sectorId: "B3", count: 3 }),
        objective("recover_crystal_core", "interact", "Recupera el núcleo de cristal.", { targetId: "verde_b3_nucleo_cristal", sectorId: "B3", onComplete: { questItems: ["nucleo_cristal_verde"] } }),
        objective("return_to_verdalia_forge", "enter_sector", "Regresa a la forja regional de Verdalia.", { sectorId: "B2" }),
        objective("restore_relic", "interact", "Entrega los tres componentes y restaura la Reliquia Verde.", { targetId: "verde_b2_forja_reliquia", sectorId: "B2" }),
      ],
      {
        type: "recuperacion",
        prerequisites: ["v11"],
        onAccept: { unlockSectors: ["B3"], flags: ["verde:river_pass_open"] },
        reward: { gold: 65, xp: 3, questItem: "vinculo_reliquia_verde" },
        requiredFlags: ["verde:broken_relic_found", "verde:city_services_open"],
        onClaim: { flags: ["verde:advanced_forge_active", "verde:corruption_break_ready"] },
        worldChanges: ["La forja regional cambia visualmente", "La forma restaurada de la reliquia queda vinculada al jugador"],
        mode: "tactico_preparado",
        storySummary: "Convierte la reparación de la forja en la restauración del arma del antiguo héroe.",
      },
    ),
  ],

  pueblo: [
    mission(
      "v8", 3, "pueblo", "cartographer", "El Santuario Olvidado",
      "El fragmento del mapa revela un santuario oculto en la Guarida del Cazador Marchito.",
      [
        objective("enter_c1", "enter_sector", "Entra en la Guarida del Cazador Marchito.", { sectorId: "C1" }),
        objective("solve_root_light", "interact", "Resuelve el mecanismo de raíces y luz.", { targetId: "verde_c1_mecanismo_luz", sectorId: "C1" }),
        objective("defeat_sanctuary_keeper", "kill", "Derrota al Custodio del Santuario.", { targetId: "custodio_santuario", sectorId: "C1", count: 1 }),
        objective("inspect_sanctuary", "interact", "Investiga el santuario sin destruir sus estructuras.", { targetId: "verde_c1_santuario", sectorId: "C1" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["v7"],
        onAccept: { respawnSectors: ["C1"] },
        reward: { gold: 55, xp: 2, questItem: "reliquia_menor_defensiva" },
        onClaim: { flags: ["verde:sanctuary_active", "verde:hostile_safe_rest"] },
        worldChanges: ["La fauna corrupta evita el santuario", "Aparece vegetación sana alrededor de la entrada"],
        mode: "tactico_preparado",
        storySummary: "Prueba que existe una energía capaz de repeler la corrupción.",
      },
    ),
    mission(
      "v9", 3, "pueblo", "cartographer", "Los Restos del Guardián",
      "Tres evidencias repartidas por la región reconstruyen la historia del Guardián y de su arma.",
      [
        objective("inspect_guardian_statue", "interact", "Examina la estatua dañada junto a la laguna.", { targetId: "verde_a1_estatua_guardian", sectorId: "A1" }),
        objective("recover_root_shield", "interact", "Recupera el escudo cubierto por raíces.", { targetId: "verde_b1_escudo_raices", sectorId: "B1" }),
        objective("recover_broken_blade", "interact", "Encuentra la hoja fracturada del Guardián.", { targetId: "verde_c1_hoja_fracturada", sectorId: "C1" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["v8"],
        reward: { gold: 60, xp: 3, questItem: "hoja_fracturada_guardian" },
        onClaim: { unlockSectors: ["B2"], flags: ["verde:broken_relic_found", "verde:city_pass_granted"] },
        worldChanges: ["La hoja rota aparece en la herrería", "El Cartógrafo prepara un salvoconducto hacia Verdalia"],
        storySummary: "Presenta la reliquia regional antes del combate final.",
      },
    ),
    mission(
      "v10", 3, "pueblo", "cartographer", "La Primera Verdad",
      "La autoridad de Verdalia debe revisar los mapas y las evidencias reunidas.",
      [
        objective("enter_b2", "enter_sector", "Entra en la Ciudad de Verdalia.", { sectorId: "B2" }),
        objective("present_evidence", "talk", "Presenta las evidencias al Capitán Real.", { npcSector: "ciudad", npcRole: "main", sectorId: "B2" }),
        objective("inspect_archive", "interact", "Reconstruye la sección perdida del mapa en el Archivo Real.", { targetId: "verde_b2_archivo_real", sectorId: "B2" }),
        objective("witness_atlas", "interact", "Presencia el mensaje de Atlas.", { targetId: "verde_b2_vision_atlas", sectorId: "B2" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["v9"],
        reward: { gold: 65, xp: 3, questItem: "permiso_expedicion" },
        onClaim: { flags: ["verde:act4_open", "verde:atlas_events_active", "verde:city_services_open"] },
        worldChanges: ["Los guardias reconocen al jugador", "El archivo y los comercios de Verdalia se abren"],
        storySummary: "Atlas se comunica por primera vez y la ciudad reconoce la gravedad del conflicto.",
      },
    ),
    mission(
      "v13", 4, "pueblo", "main", "El Consejo Verde",
      "Tomás intenta unir al campamento, el pueblo y la ciudad antes del avance final.",
      [
        objective("convince_roland", "talk", "Obtén el compromiso de Roland.", { npcSector: "campamento", npcRole: "main", sectorId: "A2" }),
        objective("present_relic_city", "talk", "Presenta la Reliquia Verde al Capitán Real.", { npcSector: "ciudad", npcRole: "main", sectorId: "B2" }),
        objective("hold_green_council", "interact", "Celebra el Consejo Verde en Verdalia.", { targetId: "verde_b2_mesa_consejo", sectorId: "B2" }),
      ],
      {
        type: "investigacion",
        prerequisites: ["v12"],
        reward: { gold: 70, xp: 3, questItem: "reputacion_consejo_verde" },
        requiredFlags: ["verde:relic_restored"],
        onClaim: { flags: ["verde:council_formed", "verde:regional_discount", "verde:safe_settlement_route"] },
        worldChanges: ["Aparecen refuerzos y suministros", "Los tres dirigentes actualizan sus diálogos"],
        storySummary: "La región deja de reaccionar por separado y comienza a actuar como una unidad.",
      },
    ),
    mission(
      "v14", 4, "pueblo", "cartographer", "El Corazón del Bosque",
      "El Cartógrafo ha identificado el último corredor hacia el Santuario del Corazón Verde.",
      [
        objective("enter_b3_final", "enter_sector", "Regresa al Paso del Río Antiguo con la Reliquia Verde.", { sectorId: "B3" }),
        objective("purify_root_one", "interact", "Purifica el primer nodo de raíces.", { targetId: "verde_b3_nodo_raiz_1", sectorId: "B3" }),
        objective("purify_root_two", "interact", "Purifica el segundo nodo de raíces.", { targetId: "verde_b3_nodo_raiz_2", sectorId: "B3" }),
        objective("purify_root_three", "interact", "Purifica el tercer nodo de raíces.", {
          targetId: "verde_b3_nodo_raiz_3", sectorId: "B3",
          onComplete: { unlockSectors: ["C3"], flags: ["verde:boss_sanctuary_revealed"] },
        }),
        objective("enter_c3_threshold", "enter_sector", "Cruza el umbral del Santuario del Corazón Verde.", { sectorId: "C3" }),
        objective("inspect_sleeping_guardian", "interact", "Observa al Guardián dormido y la corrupción que lo cubre.", { targetId: "verde_c3_guardian_dormido", sectorId: "C3" }),
      ],
      {
        type: "exploracion",
        prerequisites: ["v13"],
        onAccept: { unlockSectors: ["C3"], flags: ["verde:boss_sanctuary_revealed"] },
        reward: { gold: 80, xp: 4, questItem: "llave_santuario_verde" },
        requiredFlags: ["verde:relic_restored", "verde:council_formed"],
        onClaim: { flags: ["verde:boss_preparation_ready", "verde:region_silenced"] },
        worldChanges: ["El bosque pierde casi todo sonido", "Los diálogos regionales cambian antes de la batalla final"],
        mode: "tactico_preparado",
        storySummary: "Abre el santuario final y revela que el jefe fue un protector, no un monstruo nacido así.",
      },
    ),
  ],

  ciudad: [
    mission(
      "v15", 5, "ciudad", "main", "El Último Guardián",
      "Verdalia confía al jugador la expedición final para liberar al antiguo protector de la región.",
      [
        objective("enter_c3_final", "enter_sector", "Entra en el Santuario del Corazón Verde cuando estés preparado.", { sectorId: "C3" }),
        objective("defeat_green_guardian", "boss", "Derrota la capa corrupta del Guardián Verde.", { targetId: "guardian_verde", sectorId: "C3" }),
        objective("free_green_spirit", "interact", "Libera el espíritu del antiguo héroe.", { targetId: "verde_c3_espiritu_guardian", sectorId: "C3" }),
      ],
      {
        type: "combate",
        prerequisites: ["v14"],
        reward: { gold: 120, xp: 5, questItem: "reliquia_equilibrio_verde" },
        requiredFlags: ["verde:boss_preparation_ready", "verde:relic_restored"],
        onClaim: { flags: ["verde:restored", "verde:postgame_open", "verde:guild_seed", "fria:region_ready"] },
        worldChanges: ["La vegetación recupera color", "La fauna regresa", "Se abre el viaje al norte"],
        storySummary: "Culmina la campaña con la liberación del primero de los tres antiguos héroes.",
      },
    ),
  ],
};

export const GREEN_STORY_POINT_IDS = new Set(
  Object.values(GREEN_CAMPAIGN_V2)
    .flat()
    .flatMap(m => m.objectives)
    .filter(o => o.type === "interact")
    .map(o => o.targetId),
);
