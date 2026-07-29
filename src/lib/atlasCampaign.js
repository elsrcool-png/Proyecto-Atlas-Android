// PROYECTO ATLAS — Campaña Oficial del Documento Maestro
// 3 regiones × 5 actos × 15 misiones = 45 misiones narrativas encadenadas
// Cada NPC tiene nombre, ubicación, diálogo y función narrativa propia.

// ═══════════════════════════════════════════════════════════════
//  NPCS NOMBRADOS POR REGIÓN (del Documento Maestro)
// ═══════════════════════════════════════════════════════════════

export const CAMPAIGN_NPCS = {
  verde: {
    campamento: {
      main: { name: "Capitán Roland", icon: "shield", roleLabel: "Capitán del Campamento", sprite: { type: "npc", variant: "verde_roland" },
        dialogues: {
          intro: "Últimamente cualquiera puede empuñar una espada... pero pocos regresan del bosque. Antes de confiarte una tarea importante, necesito que conozcas a quienes mantienen este campamento en pie.",
          post_m1: "Ya te conocen. Bren, Elia y Cedric hablan bien de ti.Quizás no seas un desconocido después de todo.",
          act4: "No quiero recuperar sus cuerpos. Quiero encontrarlos con vida.",
          boss_unlock: "El bosque te espera. Lo que encontrarás allí no es un monstruo cualquiera. Fue nuestro protector.",
        } },
      smith: { name: "Bren", icon: "hammer", roleLabel: "Herrero", sprite: { type: "villager", variant: "bren_smith" },
        dialogues: {
          intro: "No necesito un héroe. Solo alguien que encuentre una caja de herramientas antes de que las criaturas la destruyan.",
          post_m2: "La forja vuelve a respirar. Pronto tendré acero nuevo para ti.",
          act4: "Sin la forja principal, no puedo fabricar nada que resista la corrupción. Necesito mineral antiguo, carbón y un núcleo de cristal.",
        } },
      herbalist: { name: "Elia", icon: "leaf", roleLabel: "Herbolaria", sprite: { type: "villager", variant: "verde_elia" },
        dialogues: {
          intro: "Cada vez encuentro menos plantas útiles. El bosque está cambiando, y no para bien.",
          post_m3: "Varias plantas comenzaron a marchitarse. No es la estación. Es algo más profundo.",
        } },
      explorer: { name: "Cedric", icon: "compass", roleLabel: "Explorador", sprite: { type: "villager", variant: "verde_cedric" },
        dialogues: {
          intro: "He recorrido estos bosques toda mi vida. Cuando los pájaros dejan de cantar... es porque algo mucho peor ya llegó.",
          post_m3: "Las criaturas no son el problema. Hay una fuerza actuando sobre el bosque. Algo que no podemos ver.",
          post_m6: "Las ruinas... la inscripción decía algo sobre el corazón del mundo. No comprendo qué significa.",
          act3: "Si alguien puede reconocer esos símbolos... es el Cartógrafo. Vive en una torre al norte.",
        } },
      merchant: { name: "Mercader Bryn", icon: "coin", roleLabel: "Mercader", sprite: { type: "villager", variant: "verde_bryn" }, shop: "camp" },
      inn: { name: "Guardián del refugio", icon: "moon", roleLabel: "Refugio", sprite: { type: "villager", variant: "verde_refuge_keeper" } },
      flavor: { name: "Aldeano Kael", icon: "message", roleLabel: "Aldeano", sprite: { type: "villager", variant: "verde_kael_villager" } },
      survivor: { name: "Darian", icon: "package", roleLabel: "Comerciante rescatado", sprite: { type: "villager", variant: "verde_darian" },
        dialogues: {
          intro: "Antes de quedar atrapados, tres aventureros protegieron nuestra ruta. Sus señales aún deberían seguir cerca de la laguna.",
          post_m5: "Los Vigilantes aceptaron ayudarte. No desperdicies esa confianza entrando solo a las ruinas.",
        } },
    },
    pueblo: {
      main: { name: "Alcalde Tomás", icon: "shield", roleLabel: "Alcalde", sprite: { type: "npc", variant: "verde_tomas" },
        dialogues: {
          intro: "La comida mantiene unido a un reino mucho más que las espadas.",
          post_m4: "Los comerciantes que rescataste cuentan algo extraño. Las criaturas no intentaban comérselos. Solo parecían alejarlos del bosque.",
          act4: "Campamento, pueblo y ciudad nunca trabajaron juntos. Ahora deberán hacerlo.",
        } },
      merchant: { name: "Mercader Aldric", icon: "coin", roleLabel: "Mercader", sprite: { type: "villager", variant: "verde_aldric" }, shop: "town" },
      inn: { name: "Posadero Oleg", icon: "moon", roleLabel: "Posada", sprite: { type: "villager", variant: "verde_oleg" } },
      smith: { name: "Forjador Orin", icon: "hammer", roleLabel: "Forjador del Pueblo", sprite: { type: "villager", variant: "verde_orin" },
        dialogues: {
          intro: "Puedo reparar y forjar equipo de viaje, pero las reliquias antiguas requieren la forja regional de Verdalia.",
        } },
      explorer: { name: "Cedric", icon: "compass", roleLabel: "Explorador", sprite: { type: "villager", variant: "verde_cedric" },
        dialogues: {
          intro: "Las ruinas que mencionaste... he visto los símbolos antes. En alguna parte del bosque hay más.",
          post_m6: "La inscripción habla del corazón del mundo. No comprendo qué significa, pero sé quién podría: el Cartógrafo.",
        } },
      flavor1: { name: "Aldeana Ira", icon: "message", roleLabel: "Aldeana", sprite: { type: "villager", variant: "verde_ira" } },
      flavor2: { name: "Viajero Inn", icon: "message", roleLabel: "Viajero", sprite: { type: "villager", variant: "verde_inn_traveler" } },
      cartographer: { name: "El Cartógrafo", icon: "scroll", roleLabel: "Cartógrafo Anciano", sprite: { type: "npc", variant: "verde_cartographer" },
        dialogues: {
          intro: "Antes de existir los reyes... ya existían los Guardianes.",
          post_m8: "El santuario no repele la vida. Repele aquello que intenta deformarla.",
          post_m9: "La hoja fracturada perteneció al protector que ahora duerme bajo el bosque.",
          act4: "El mapa está completo. Solo la reliquia restaurada puede abrir el último corredor.",
        } },
    },
    ciudad: {
      main: { name: "Capitán Real", icon: "shield", roleLabel: "Comandante", sprite: { type: "npc", variant: "verde_royal_captain" },
        dialogues: {
          intro: "El reino envía órdenes que tardan semanas en llegar. Para entonces, los problemas ya crecieron.",
          act5: "Durante generaciones pensamos que el bosque nos protegía. Ahora debemos aceptar una verdad difícil. Nosotros también debemos protegerlo a él.",
          post_boss: "El reino reconoce oficialmente tu hazaña. Pero esto es solo el comienzo.",
        } },
      merchant: { name: "Mercader Real Senn", icon: "coin", roleLabel: "Mercader Real", sprite: { type: "villager", variant: "verde_senn" }, shop: "city" },
      inn: { name: "Hostelera Senna", icon: "moon", roleLabel: "Alojamiento", sprite: { type: "villager", variant: "verde_senna" } },
      smith: { name: "Herrero Brun", icon: "hammer", roleLabel: "Herrero Real", sprite: { type: "villager", variant: "verde_brun" } },
      flavor: { name: "Guardia Rurik", icon: "shield", roleLabel: "Guardia", sprite: { type: "villager", variant: "verde_rurik" } },
    },
    wild: {
      cartographer: { name: "El Cartógrafo", icon: "scroll", roleLabel: "Cartógrafo Anciano", sprite: { type: "npc", variant: "verde_cartographer" },
        dialogues: {
          intro: "Si alguien puede reconocer esos símbolos... soy yo. Pero necesito verlos con mis propios ojos.",
          post_m7: "Antes de existir los reyes... ya existían los Guardianes.",
          post_m9: "El bosque no enfermó solo. Algo despertó.",
          act4: "Con toda la información reunida, puedo reconstruir el mapa antiguo. Existe una zona prohibida que jamás aparece en los mapas modernos.",
          post_m14: "Ese no es el enemigo. Alguna vez fue quien protegía este bosque.",
        } },
    },
  },

  fria: {
    campamento: {
      main: { name: "Explorador Boreas", icon: "shield", roleLabel: "Líder del Campamento Boreal", sprite: { type: "npc", variant: "fria_boreas" },
        dialogues: {
          intro: "No sabemos qué ocurre más allá del bosque congelado. Pero sabemos algo: cuando alguien desaparece aquí... rara vez vuelve.",
          post_m1: "Los cristales están despertando... eso decía el mensaje.",
          post_m6: "Einar volvió. Dice que los Portadores no murieron. Quedaron esperando.",
        } },
      cartographer: { name: "Cartógrafa Lyra", icon: "scroll", roleLabel: "Cartógrafa", sprite: { type: "villager", variant: "fria_lyra_cartographer" },
        dialogues: {
          intro: "La ruta comercial entre el Campamento y el Pueblo Glacial desapareció. Los mapas antiguos indican que debería existir un camino seguro.",
          post_m2: "Los símbolos que encontraste son idénticos a los de la Región Verde. Los Guardianes y los Portadores estaban conectados.",
        } },
      hunter: { name: "Cazadora Freya", icon: "target", roleLabel: "Cazadora", sprite: { type: "villager", variant: "fria_freya" },
        dialogues: {
          intro: "El hambre vuelve agresivas a las bestias. Pero esto no es hambre. Algo las está guiando.",
        } },
      merchant: { name: "Mercader Boreal", icon: "coin", roleLabel: "Mercader", sprite: { type: "villager", variant: "fria_merchant_camp" }, shop: "camp" },
      inn: { name: "Guardián del refugio boreal", icon: "moon", roleLabel: "Refugio", sprite: { type: "villager", variant: "fria_refuge_keeper" } },
      flavor: { name: "Montañista Dvalin", icon: "message", roleLabel: "Montañista", sprite: { type: "villager", variant: "fria_dvalin" } },
    },
    pueblo: {
      main: { name: "Chamán Hielo", icon: "sparkles", roleLabel: "Chamán del Pueblo Glacial", sprite: { type: "npc", variant: "fria_shaman" },
        dialogues: {
          intro: "Durante generaciones pensamos que eran historias. Pero las historias no dejan huellas bajo kilómetros de hielo.",
          post_m3: "Los Portadores del Cristal. Ahora sabemos su nombre.",
          act3: "Busca los antiguos santuarios de los Portadores. Allí encontrarás sus memorias.",
        } },
      merchant: { name: "Mercader Glacial", icon: "coin", roleLabel: "Mercader", sprite: { type: "villager", variant: "fria_merchant_glacial" }, shop: "town" },
      inn: { name: "Posadera Helga", icon: "moon", roleLabel: "Posada", sprite: { type: "villager", variant: "fria_helga" } },
      flavor: { name: "Pescadora Astra", icon: "message", roleLabel: "Pescadora", sprite: { type: "villager", variant: "fria_astra" } },
    },
    ciudad: {
      main: { name: "Reina de Hielo", icon: "crown", roleLabel: "Reina de la Ciudadela", sprite: { type: "npc", variant: "fria_queen" },
        dialogues: {
          intro: "Los Portadores no dejaron armas. Dejaron conocimiento. Y nosotros olvidamos cómo utilizarlo.",
          act3: "Toda la información lleva a un mismo punto. Una puerta gigantesca bajo la montaña.",
          act4: "Para enfrentar lo que existe bajo la montaña, necesitan recuperar información perdida.",
          act5: "Cuando comprendieron que no podían destruirlo... cuando entendieron que tampoco podían controlarlo... tomaron una última decisión. Se convirtieron en la prisión.",
        } },
      researcher: { name: "Investigadora Lyra", icon: "flask-conical", roleLabel: "Investigadora", sprite: { type: "villager", variant: "fria_lyra_researcher" },
        dialogues: {
          act3: "Existe un cristal diferente. No genera energía. La consume.",
          act4: "El cristal original está fragmentado. Debemos recolectar las piezas del Corazón del Cristal.",
        } },
      captain: { name: "Capitán Boreal", icon: "shield", roleLabel: "Capitán de la Guardia", sprite: { type: "villager", variant: "fria_captain" },
        dialogues: {
          act4: "La Ciudadela Helada será el primer gran evento defensivo de Atlas. Debemos proteger tres zonas.",
        } },
      forger: { name: "Forjador Kael", icon: "hammer", roleLabel: "Forjador", sprite: { type: "villager", variant: "fria_kael_forger" } },
      merchant: { name: "Mercader Real Boreal", icon: "coin", roleLabel: "Mercader Real", sprite: { type: "villager", variant: "fria_merchant_royal" }, shop: "city" },
      inn: { name: "Hostelera Boreal", icon: "moon", roleLabel: "Alojamiento", sprite: { type: "villager", variant: "fria_hostelera" } },
      smith: { name: "Herrero Borin", icon: "hammer", roleLabel: "Herrero de la Ciudadela", sprite: { type: "villager", variant: "fria_borin" } },
    },
    wild: {
      einar: { name: "Einar", icon: "user", roleLabel: "Último Explorador", sprite: { type: "npc", variant: "fria_einar" },
        dialogues: {
          intro: "Ellos no murieron. Ellos quedaron esperando.",
          act3: "No era una instalación. Era una ciudad. Nosotros construimos ciudades para vivir. Ellos construyeron una ciudad para vigilar.",
          act4: "Necesito recuperar mi antiguo equipo perdido antes de unirme a la expedición.",
        } },
    },
  },

  desierto: {
    campamento: {
      main: { name: "Nómada Sahara", icon: "shield", roleLabel: "Líder del Campamento Nómada", sprite: { type: "npc", variant: "desierto_sahara_nomad" },
        dialogues: {
          intro: "El desierto siempre toma algo. Pero esta vez tomó demasiado.",
          post_m1: "La arena se abrió bajo la caravana. No fue un ataque. Estaban esperando.",
        } },
      explorer: { name: "Explorador Kael", icon: "compass", roleLabel: "Explorador", sprite: { type: "villager", variant: "desierto_kael_explorer" },
        dialogues: {
          act2: "Cuando el sol desaparece detrás de las montañas, las piedras muestran el camino.",
          act3: "Todos pensaron que la arena destruyó esta ciudad. Pero quizás la ciudad eligió esconderse.",
          act2_storm: "Una tormenta de arena gigantesca aparece en una zona donde normalmente no ocurren fenómenos así.",
        } },
      merchant: { name: "Mercader Nómada", icon: "coin", roleLabel: "Mercader", sprite: { type: "villager", variant: "desierto_merchant_camp" }, shop: "camp" },
      inn: { name: "Guardián del oasis", icon: "moon", roleLabel: "Refugio", sprite: { type: "villager", variant: "desierto_oasis_keeper" } },
      flavor: { name: "Beduino Dara", icon: "message", roleLabel: "Beduino", sprite: { type: "villager", variant: "desierto_dara_bedouin" } },
    },
    pueblo: {
      main: { name: "Guardiana del Oasis", icon: "shield", roleLabel: "Guardiana del Pueblo Oasis", sprite: { type: "npc", variant: "desierto_oasis_guardian" },
        dialogues: {
          intro: "El agua siempre encontró un camino. Hasta ahora.",
          post_m2: "El oasis no era natural. Fue construido. Los antiguos crearon una red para mantener vida en el desierto.",
          act4: "La energía liberada por las ruinas comienza a afectar la región. El agua vuelve a cambiar, pero esta vez es contaminación.",
        } },
      historian: { name: "Historiador Aran", icon: "scroll", roleLabel: "Historiador", sprite: { type: "villager", variant: "desierto_aran" },
        dialogues: {
          intro: "Todos creen que el desierto destruyó esta civilización. Pero quizá fue al revés.",
          act2: "Las civilizaciones escriben su historia. Pero algunas historias son borradas.",
          act3: "Los Antiguos no querían solamente controlar la energía. Querían evolucionar.",
          act4: "Las grandes civilizaciones no desaparecen en un día. Primero desaparecen sus decisiones.",
        } },
      artisan: { name: "Artesana del Cristal", icon: "gem", roleLabel: "Artesana", sprite: { type: "villager", variant: "desierto_crystal_artisan" } },
      merchant: { name: "Mercader del Oasis", icon: "coin", roleLabel: "Mercader", sprite: { type: "villager", variant: "desierto_merchant_oasis" }, shop: "town" },
      inn: { name: "Posadera Sahara", icon: "moon", roleLabel: "Posada", sprite: { type: "villager", variant: "desierto_posadera" } },
      flavor: { name: "Comerciante Dara", icon: "message", roleLabel: "Comerciante del Oasis", sprite: { type: "villager", variant: "desierto_dara_trader" } },
    },
    ciudad: {
      main: { name: "Faraón Eterno", icon: "crown", roleLabel: "Gobernante de la Ciudad Antigua", sprite: { type: "npc", variant: "desierto_pharaoh" },
        dialogues: {
          intro: "El conocimiento debe sobrevivir aunque nosotros no lo hagamos.",
          act5: "Los Antiguos tuvieron una última oportunidad. Podían destruir el núcleo. Podían abandonarlo. Pero eligieron una tercera opción. Uno de ellos decidió quedarse.",
        } },
      priest: { name: "Sacerdote Solar", icon: "sun", roleLabel: "Sacerdote del Sol", sprite: { type: "villager", variant: "desierto_solar_priest" },
        dialogues: {
          act3: "Para acceder a la última biblioteca se necesita activar el núcleo solar. Pero el cristal principal fue dividido.",
          act4: "La corrupción está conectada con el antiguo núcleo solar. Para detenerla, debes llegar al Templo Solar. Pero la ruta está sellada.",
          act5: "El guardián del templo no fue creado para proteger un tesoro. Fue creado para proteger una decisión.",
        } },
      merchant: { name: "Mercader de la Ciudad Antigua", icon: "coin", roleLabel: "Mercader Antiguo", sprite: { type: "villager", variant: "desierto_merchant_ancient" }, shop: "city" },
      inn: { name: "Hostelera Eterna", icon: "moon", roleLabel: "Alojamiento", sprite: { type: "villager", variant: "desierto_hostelera" } },
      smith: { name: "Forjador Solar", icon: "hammer", roleLabel: "Forjador", sprite: { type: "villager", variant: "desierto_solar_forger" } },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
//  CANON DE JEFES (del Documento Maestro)
// ═══════════════════════════════════════════════════════════════

export const CAMPAIGN_BOSSES = {
  verde: {
    name: "Guardián Verde",
    title: "Antiguo Protector del Bosque",
    race: "Espíritu Ancestral",
    class: "Guardián",
    history: "Antes de la llegada del reino moderno existían seres encargados de mantener el equilibrio del mundo. Los Guardianes no gobernaban. Protegían. El Guardián Verde fue responsable de mantener la vida en la región durante siglos. Pero algo comenzó a alterar su esencia. Intentó resistir. Durante años contuvo la corrupción dentro de sí mismo. Hasta que finalmente perdió el control.",
    motive: "No busca destruir. La corrupción que lo consume lo obliga a atacar todo lo que alguna vez protegió. En el fondo, espera que alguien lo libere.",
    personality: "No pelea con odio. Pelea porque la corrupción lo controla. Durante el combate aparecen momentos donde su voluntad original intenta comunicarse.",
    preLines: [
      "El bosque... recuerda tu nombre.",
      "No soy tu enemigo. Fui quien protegía este bosque.",
      "Líbrame... de este sufrimiento.",
    ],
    abilities: [
      { name: "Raíces Corruptas", desc: "El Guardián altera el terreno. Bloquea caminos, reduce movilidad e invoca criaturas corruptas." },
      { name: "Lamento del Bosque", desc: "Libera energía acumulada que afecta a todos los combatientes. Representa el dolor de años de corrupción." },
    ],
    finalDialogue: "El bosque... recuerda tu nombre.",
    aftermath: "La Región Verde comienza a recuperarse. Los árboles vuelven a florecer. Los animales regresan. Los caminos vuelven a utilizarse.",
  },
  fria: {
    name: "Aurel",
    title: "Último Portador del Equilibrio",
    race: "Portador Antiguo",
    class: "Guerrero Mágico",
    history: "Aurel fue uno de los primeros Portadores. Su misión era mantener estable la energía del mundo. Durante siglos sostuvo el sello. Pero con el tiempo ocurrió algo. La energía comenzó a consumirlo. No fue derrotado. No fue corrompido inmediatamente. Fue desgastado. Cada año perdió una parte de sí mismo. Hasta que dejó de recordar por qué luchaba.",
    motive: "No pelea con odio. Pelea porque cree que el jugador representa un peligro para el sello que protege.",
    personality: "Sereno, melancólico, habla como quien ya conoció el final de su historia. En su última fase, recupera la conciencia y busca comprobar si el jugador es digno.",
    preLines: [
      "¿Cuánto tiempo ha pasado?",
      "Otro viajero... otro que cree poder cambiar el destino.",
      "Entonces finalmente alguien llegó... no para conquistar, no para usar el poder, sino para comprender.",
    ],
    abilities: [
      { name: "Golpe del Cristal", desc: "Ataque físico aumentado." },
      { name: "Escudo del Portador", desc: "Reduce daño recibido durante un turno." },
      { name: "Fragmento Helado", desc: "Invoca cristales en la arena que modifican la zona de combate." },
      { name: "Tormenta del Vacío", desc: "Ataque mágico que ignora parte de defensa. (Fase 2)" },
      { name: "Juicio del Portador", desc: "Un ataque final donde utiliza toda la energía restante. (Fase 3)" },
    ],
    finalDialogue: "Atlas no es solamente quien sostiene este mundo. También observa a quienes intentan cambiarlo.",
    aftermath: "La Región Ártica cambia. El hielo comienza a ceder en algunas zonas. Aparecen zonas antiguas que estaban congeladas. Nuevas rutas se abren.",
  },
  desierto: {
    name: "Amon",
    title: "Portador del Sol Eterno",
    race: "Rey Antiguo",
    class: "Guerrero Solar",
    history: "Amon fue el gobernante de la antigua civilización. No era un tirano. Era un líder brillante. Él fue quien impulsó la investigación sobre Atlas. Creía que el mundo sufría porque dependía demasiado del azar. Su objetivo era crear una civilización perfecta. Pero cuando comprendió el verdadero funcionamiento del equilibrio, ya era demasiado tarde. La energía había cambiado. La ciudad estaba condenada. Amon tomó la decisión final: usaría el núcleo para sellar la ciudad, pero él quedaría unido a él para siempre.",
    motive: "Lucha por demostrar que su decisión fue correcta. No busca destruir al jugador. Busca comprobar si alguien puede encontrar el equilibrio sin dominarlo.",
    personality: "Orgulloso pero sabio. Acepta la derrota cuando comprende que el jugador no busca utilizar el poder. Sus últimas palabras son de aceptación y liberación.",
    preLines: [
      "Has visto las ruinas. Has leído nuestros errores. Pero todavía no entiendes nuestra intención.",
      "Nosotros no queríamos destruir el mundo. Queríamos salvarlo.",
      "Entonces era posible... un mundo donde alguien pudiera encontrar el equilibrio sin dominarlo.",
    ],
    abilities: [
      { name: "Espada del Amanecer", desc: "Ataque físico de gran poder. Representa la fuerza del reino." },
      { name: "Escudo Solar", desc: "Reduce daño recibido." },
      { name: "Llama Antigua", desc: "Ataque mágico que ignora parte de defensa mágica." },
      { name: "Invocación Solar", desc: "Crea guardianes temporales." },
      { name: "Eclipse Solar", desc: "Reduce la visión y precisión. (Fase 2)" },
      { name: "Juicio de Atlas", desc: "Un ataque final donde utiliza toda la energía restante. (Fase 3)" },
    ],
    finalDialogue: "El mundo recuerda lo que los hombres olvidan. Aún queda una parte de la historia sin descubrir.",
    aftermath: "La Región Árida se transforma. El Templo Solar permanece abierto como lugar de conocimiento. La Ciudad Antigua se convierte en archivo del mundo antiguo.",
  },
};

// ═══════════════════════════════════════════════════════════════
//  45 MISIONES DE CAMPAÑA (15 por región, 5 actos)
// ═══════════════════════════════════════════════════════════════

function m(id, act, sector, role, npcName, type, tracker, target, name, desc, reward, worldChanges = [], prerequisites = []) {
  return { id, act, sector, role, npcName, type, tracker, target, name, desc, reward, worldChanges, prerequisites,
    threatMin: 0, cost: 0, wildSector: null };
}

function paid(id, act, sector, role, npcName, type, tracker, target, name, desc, reward, cost, threatMin, worldChanges = [], prerequisites = []) {
  return { id, act, sector, role, npcName, type, tracker, target, name, desc, reward, worldChanges, prerequisites,
    threatMin, cost, wildSector: null };
}

function wild(id, act, sector, role, npcName, type, tracker, target, name, desc, reward, wildSector, worldChanges = [], prerequisites = []) {
  return { id, act, sector, role, npcName, type, tracker, target, name, desc, reward, worldChanges, prerequisites,
    threatMin: 0, cost: 0, wildSector };
}

export const CAMPAIGN_MISSIONS = {
  // ─── REGIÓN VERDE ───────────────────────────────────────────
  verde: {
    campamento: [
      // Acto I
      m("v1", 1, "campamento", "main", "Capitán Roland", "social", "talk", 3, "Un rostro desconocido",
        "Habla con Bren (Herrero), Elia (Herbolaria) y Cedric (Explorador) para que conozcan a quien mantiene el campamento en pie.",
        { gold: 20, xp: 1 }, ["Todos los habitantes comienzan a saludar al jugador", "Se desbloquea la Misión 2"]),
      m("v2", 1, "campamento", "smith", "Bren", "combate", "chest", 1, "Primer Encargo",
        "Las patrullas perdieron un cargamento de herramientas. Encuentra la carreta abandonada en el bosque, recupera la Caja de Herramientas y derrota las criaturas que la rodean.",
        { gold: 25, xp: 1 }, ["Bren vuelve a trabajar", "El sonido de la herrería aparece", "Nuevos objetos en venta"]),
      m("v3", 1, "campamento", "explorer", "Cedric", "exploracion", "reach", 1, "El bosque guarda silencio",
        "Investiga el bosque y encuentra el pequeño altar antiguo cubierto por raíces. No lo destruyas. Solo obsérvalo.",
        { gold: 30, xp: 1 }, ["Cedric modifica todos sus diálogos", "Elia comenta que las plantas se marchitan", "Se desbloquea el Acto II"]),
      // Acto IV
      m("v11", 4, "campamento", "main", "Capitán Roland", "combate", "kill", 3, "La Patrulla Perdida",
        "Una patrulla de los mejores exploradores nunca regresó. Sigue los rastros, encuentra el campamento abandonado y escolta al explorador herido de vuelta.",
        { gold: 50, xp: 2, potion: "hp_m" }, ["El explorador permanece recuperándose en el Campamento", "Nueva receta de botiquín"]),
      m("v12", 4, "campamento", "smith", "Bren", "recuperacion", "chest", 3, "La Forja del Campamento",
        "Bren necesita reparar la vieja forja principal. Consigue mineral antiguo, carbón vegetal y un núcleo de cristal de tres zonas diferentes.",
        { gold: 60, xp: 2 }, ["La forja vuelve a funcionar", "Aparecen nuevas armas y armaduras", "Mejoras disponibles"]),
      // Acto I extra
      paid("v_paid1", 1, "campamento", "flavor", "Aldeano Kael", "evento", "kill", 4, "Emboscada nocturna",
        "Repela 4 enemigos en una emboscada nocturna mientras la amenaza es alta.",
        { gold: 35, potion: "hp_m" }, 10, 7),
    ],
    pueblo: [
      // Acto II
      m("v4", 2, "pueblo", "main", "Alcalde Tomás", "investigacion", "reach", 1, "La Caravana Perdida",
        "Una caravana de alimentos nunca llegó al Pueblo. Investiga el camino comercial, encuentra la caravana atrapada y escolta a los supervivientes.",
        { gold: 40, xp: 2 }, ["Los comerciantes aparecen en el Pueblo", "Nuevo comerciante itinerante desbloqueado"]),
      m("v5", 2, "pueblo", "flavor1", "Comerciante Rescatado", "social", "talk", 1, "Los Vigilantes del Sendero",
        "Antes de quedar atrapados, los comerciantes fueron ayudados por aventureros. Encuentra su campamento improvisado y escucha su historia completa.",
        { gold: 20, xp: 1 }, ["El grupo de aventureros permanece en el mapa", "Cambia sus diálogos periódicamente"]),
      m("v6", 2, "pueblo", "explorer", "Cedric", "exploracion", "reach", 1, "El Eco de las Ruinas",
        "Los aventureros mencionaron unas antiguas ruinas. Llega a ellas, explóralas y encuentra la inscripción antigua. No combatas, solo investiga.",
        { gold: 45, xp: 2 }, ["Las ruinas quedan desbloqueadas", "Pueden aparecer eventos aleatorios dentro", "El comerciante vende una antorcha especial"]),
      // Acto IV
      m("v13", 4, "pueblo", "main", "Alcalde Tomás", "social", "talk", 3, "El Consejo Verde",
        "Campamento, Pueblo y Ciudad nunca trabajaron juntos. Viaja entre los tres asentamientos y convence a sus líderes de reunirse en el primer Consejo Verde.",
        { gold: 55, xp: 2 }, ["Todos los asentamientos mejoran su seguridad", "Guardias adicionales", "Descuento general en tiendas"]),
      // Acto I extra
      paid("v_paid2", 1, "pueblo", "flavor1", "Aldeana Ira", "evento", "kill", 5, "Asalto al pueblo",
        "Defiende el pueblo de 5 asaltantes mientras la amenaza es alta.",
        { gold: 35, potion: "hp_l" }, 15, 7),
    ],
    ciudad: [
      // Acto III
      m("v7", 3, "ciudad", "main", "Capitán Real", "investigacion", "reach", 1, "El Viejo Cartógrafo",
        "La inscripción de las ruinas no puede ser interpretada por nadie del Campamento. Viaja a la Torre del Cartógrafo y muéstrale los símbolos.",
        { gold: 50, xp: 2 }, ["El Cartógrafo permanece disponible", "Aparece en futuras regiones"]),
      m("v8", 3, "ciudad", "main", "Capitán Real", "exploracion", "reach", 1, "El Santuario Olvidado",
        "El fragmento del mapa señala un antiguo santuario. Encuéntralo e investígalo. No destruyas nada: la energía que contiene es diferente a la corrupción.",
        { gold: 55, xp: 2 }, ["Se desbloquean los Santuarios como lugares de la historia", "Tienen significado narrativo"]),
      m("v9", 3, "ciudad", "main", "Capitán Real", "exploracion", "chest", 3, "Los Restos del Guardián",
        "Investiga tres zonas distintas que contienen restos antiguos del Guardián: una espada partida, un escudo cubierto por raíces y una estatua destruida.",
        { gold: 60, xp: 3 }, ["Nuevos diálogos disponibles", "Las ruinas adquieren sentido narrativo"]),
      m("v10", 3, "ciudad", "main", "Capitán Real", "social", "talk", 1, "La Primera Verdad",
        "Con ambos fragmentos reconstruidos, el Cartógrafo reconoce el lugar señalado. Escucha la verdad sobre Atlas.",
        { gold: 65, xp: 3 }, ["Comienzan a aparecer eventos de Atlas durante la exploración", "Se desbloquea el Acto IV"]),
      // Acto IV
      wild("v14", 4, "ciudad", "main", "Capitán Real", "exploracion", "reach", 1, "El Corazón del Bosque",
        "El Cartógrafo reconstruyó el mapa antiguo. Llega al Corazón del Bosque, la zona prohibida donde nace la corrupción.",
        { gold: 70, xp: 3 }, ["Se desbloquea el acceso al combate final", "Todas las conversaciones del mundo cambian"], { col: 2, row: 0 }),
      // Acto V
      m("v15", 5, "ciudad", "main", "Capitán Real", "combate", "kill", 1, "El Último Guardián",
        "El Corazón del Bosque continúa expandiendo la corrupción. Viaja al altar del Guardián Verde y libéralo de su sufrimiento.",
        { gold: 100, xp: 5, item: "corazon_leon" }, ["La Región Verde comienza a recuperarse", "Se desbloquea la Región Ártica", "Nuevas misiones disponibles"]),
      // Extra
      paid("v_paid3", 3, "ciudad", "main", "Capitán Real", "evento", "kill", 6, "Invasión a la ciudadela",
        "Rechaza 6 élite en la invasión mientras la amenaza es alta.",
        { gold: 40, potion: "hp_l", item: "corazon_leon" }, 20, 8),
      wild("v_wild1", 3, "ciudad", "main", "Capitán Real", "exploracion", "reach", 1, "Bosque Cerrado",
        "Adéntrate en el Bosque Cerrado del norte y descubre el punto de interés oculto entre la maleza.",
        { gold: 30, xp: 1 }, [], { col: 2, row: 0 }),
    ],
  },

  // ─── REGIÓN ÁRTICA ──────────────────────────────────────────
  fria: {
    campamento: [
      // Acto I
      m("f1", 1, "campamento", "main", "Explorador Boreas", "combate", "kill", 2, "El Último Mensajero",
        "Un mensajero fue enviado a una estación de vigilancia y nunca regresó. Sigue sus huellas en la nieve y recupera cualquier información útil.",
        { gold: 25, xp: 2 }, ["El Campamento Boreal comienza a confiar en el jugador", "Boreas desbloquea nuevos diálogos"]),
      m("f2", 1, "campamento", "cartographer", "Cartógrafa Lyra", "exploracion", "reach", 1, "La Ruta Perdida",
        "La ruta comercial entre el Campamento y el Pueblo Glacial desapareció. Reconstruye la antigua ruta explorando tres puntos clave.",
        { gold: 35, xp: 2 }, ["La ruta queda restaurada", "Aparecen comerciantes y viajeros", "Se confirman símbolos idénticos a la Región Verde"]),
      m("f3", 1, "campamento", "hunter", "Cazadora Freya", "combate", "kill", 3, "La Cacería Blanca",
        "Los animales ya no actúan normalmente. Investiga tres zonas de caza, derrota criaturas alteradas y recupera muestras de cristal adheridas a ellas.",
        { gold: 40, xp: 2 }, ["Los cazadores comienzan a vender materiales de criaturas y recursos raros"]),
      // Acto II
      m("f6", 2, "campamento", "main", "Explorador Boreas", "combate", "kill", 3, "La Expedición Perdida",
        "Una expedición completa intentó investigar las ruinas y nunca volvió. Sigue la última ruta conocida y encuentra al único superviviente: Einar.",
        { gold: 55, xp: 3 }, ["Einar vuelve al Campamento Boreal", "Nuevo NPC disponible que entrega información durante toda la campaña"]),
      // Acto IV
      m("f11", 4, "campamento", "main", "Explorador Boreas", "social", "talk", 3, "La Última Expedición",
        "Reúne al equipo de expedición: Einar (Campamento), Chamán Hielo (Pueblo) y Forjador Kael (Ciudadela). Cada uno requiere ayuda antes de unirse.",
        { gold: 65, xp: 3 }, ["El Campamento Boreal se transforma en centro de expedición", "Los habitantes se convierten en aliados de la campaña"]),
      // Extra
      paid("f_paid1", 1, "campamento", "flavor", "Montañista Dvalin", "evento", "kill", 4, "Tormenta de bestias",
        "Sobrevive a 4 bestias durante la tormenta mientras la amenaza es alta.",
        { gold: 30, potion: "hp_m" }, 10, 7),
    ],
    pueblo: [
      // Acto I
      m("f3b", 1, "pueblo", "main", "Chamán Hielo", "exploracion", "reach", 1, "El Cristal que Susurra",
        "Los habitantes del pueblo encontraron un cristal extraño que no pertenece a ninguna mina conocida. Investiga su origen junto al Chamán.",
        { gold: 40, xp: 2 }, ["El Pueblo Glacial desbloquea fabricación avanzada", "Investigación de cristales disponible"]),
      // Acto II
      m("f5", 2, "pueblo", "main", "Chamán Hielo", "exploracion", "reach", 1, "Bajo el Lago Congelado",
        "El cristal pertenece a una estructura bajo un lago congelado. Encuentra la forma de acceder activando antiguos mecanismos y recuperando símbolos.",
        { gold: 50, xp: 3 }, ["Se desbloquea la zona de Ruinas Sumergidas", "Descubres que los cristales eran una prisión"]),
      // Acto III
      m("f8", 3, "pueblo", "main", "Chamán Hielo", "exploracion", "chest", 3, "Los Portadores Perdidos",
        "Busca los tres santuarios antiguos de los Portadores: Santuario del Alba, del Guardián y del Vacío. Cada uno contiene una memoria del pasado.",
        { gold: 65, xp: 3 }, ["Los habitantes entienden que los Portadores se sacrificaron", "Se revela que la corrupción fue liberada, no creada"]),
      // Acto IV
      m("f12", 4, "pueblo", "main", "Chamán Hielo", "recuperacion", "chest", 3, "El Corazón del Cristal",
        "El cristal original está fragmentado. Recolecta los tres fragmentos del Corazón del Cristal repartidos por la región: Bosque Congelado, Lago Helado y Glaciar.",
        { gold: 70, xp: 3 }, ["Se revela un mapa antiguo del mundo completo", "Los Portadores conocían la existencia de todas las regiones"]),
      // Extra
      paid("f_paid2", 2, "pueblo", "flavor", "Pescadora Astra", "evento", "kill", 5, "Asedio de la tormenta",
        "Resiste 5 atacantes durante el asedio mientras la amenaza es alta.",
        { gold: 35, potion: "hp_l" }, 15, 7),
    ],
    ciudad: [
      // Acto III
      m("f7", 3, "ciudad", "main", "Reina de Hielo", "exploracion", "reach", 1, "La Ciudad Bajo el Hielo",
        "Las ruinas bajo el hielo no eran una instalación. Era una ciudad. Atraviesa los glaciares profundos, activa tres antiguos mecanismos y explora la Ciudad de Nivalis.",
        { gold: 60, xp: 3 }, ["Nueva zona disponible: Ciudad de Nivalis", "Aparecen cofres antiguos, materiales especiales y enemigos antiguos"]),
      m("f9", 3, "ciudad", "researcher", "Investigadora Lyra", "combate", "kill", 2, "El Cristal Negro",
        "Existe un cristal diferente que consume energía en lugar de generarla. Entra en la zona prohibida, una antigua cámara sellada, y encuentra su origen.",
        { gold: 65, xp: 3 }, ["La Ciudadela Helada comienza a preparar una expedición final", "Se revela que Atlas sostiene aquello que otros no pudieron sostener"]),
      m("f10", 3, "ciudad", "main", "Reina de Hielo", "combate", "kill", 4, "La Puerta Sellada",
        "Toda la información lleva a una puerta gigantesca bajo la montaña. Los Portadores la estaban protegiendo. Llega hasta ella enfrentando antiguos guardianes.",
        { gold: 70, xp: 3 }, ["Se desbloquea el acceso al Acto IV", "Los habitantes comienzan los preparativos finales"]),
      // Acto IV
      m("f13", 4, "ciudad", "captain", "Capitán Boreal", "proteccion", "kill", 5, "La Ciudadela en Guerra",
        "Las criaturas comenzaron a atacar los asentamientos. Defiende la Ciudadela Helada protegiendo tres zonas: Puerta exterior, Zona de cristales y Núcleo.",
        { gold: 75, xp: 3 }, ["Dependiendo del desempeño, los NPC cambian diálogos y servicios pueden verse afectados"]),
      m("f14", 4, "ciudad", "main", "Reina de Hielo", "exploracion", "reach", 3, "Los Tres Sellos",
        "La puerta no puede abrirse sin activar tres sellos: Sello del Tiempo (Nivalis), Sello de Vida (Bosque Congelado) y Sello del Vacío (Cavernas profundas).",
        { gold: 80, xp: 4 }, ["Toda la región entra en estado final", "Tormentas más intensas, enemigos más fuertes", "Acceso al jefe desbloqueado"]),
      // Acto V
      m("f15", 5, "ciudad", "main", "Reina de Hielo", "combate", "kill", 1, "El Último Portador",
        "Entra en el Núcleo Glacial bajo la montaña y enfrenta a Aurel, el último Portador del Equilibrio, que lleva siglos sosteniendo el sello.",
        { gold: 120, xp: 5, item: "brazal_arcano" }, ["La Región Ártica cambia", "Se desbloquean nuevas misiones en regiones anteriores", "Aparece el evento 'La llamada del sur'"]),
      // Extra
      paid("f_paid3", 3, "ciudad", "main", "Reina de Hielo", "evento", "kill", 6, "Despertar del glaciar",
        "Rechaza 6 élite del despertar del glaciar mientras la amenaza es alta.",
        { gold: 40, potion: "hp_l", item: "brazal_arcano" }, 20, 8),
      wild("f_wild1", 3, "ciudad", "main", "Reina de Hielo", "exploracion", "reach", 1, "Ruinas Heladas",
        "Explora las Ruinas Heladas del sur y revela el secreto olvidado bajo la escarcha.",
        { gold: 30, xp: 1 }, [], { col: 0, row: 2 }),
    ],
  },

  // ─── REGIÓN ÁRIDA ──────────────────────────────────────────
  desierto: {
    campamento: [
      // Acto I
      m("d1", 1, "campamento", "main", "Nómada Sahara", "investigacion", "reach", 1, "La Caravana Perdida",
        "Una caravana importante desapareció mientras viajaba hacia el Pueblo Oasis. Sigue la ruta comercial, investiga qué ocurrió y recupera los suministros.",
        { gold: 25, xp: 2 }, ["La ruta comercial vuelve a estar activa", "Aparecen comerciantes y viajeros"]),
      m("d5", 2, "campamento", "explorer", "Explorador Kael", "combate", "kill", 3, "La Tormenta que Recuerda",
        "Una tormenta de arena gigantesca aparece en una zona donde normalmente no ocurren. Investígala: dentro encontrarás caminos ocultos y una memoria antigua.",
        { gold: 45, xp: 2 }, ["Aparecen nuevos eventos de tormenta", "Algunas revelan cofres, rutas y enemigos especiales"]),
      // Acto III
      m("d7", 3, "campamento", "explorer", "Explorador Kael", "exploracion", "reach", 1, "La Ciudad Bajo la Arena",
        "La llave del Guardián del Sol permite abrir la entrada de la antigua capital. Atraviesa la entrada principal y explora los sectores de la Ciudad Antigua.",
        { gold: 60, xp: 3 }, ["La Ciudad Antigua queda desbloqueada", "Aparecen investigadores, vendedores especiales y nuevas misiones"]),
      // Extra
      paid("d_paid1", 1, "campamento", "flavor", "Beduino Dara", "evento", "kill", 4, "Ataque del siroco",
        "Repela 4 enemigos durante el siroco mientras la amenaza es alta.",
        { gold: 30, potion: "hp_m" }, 10, 7),
    ],
    pueblo: [
      // Acto I
      m("d2", 1, "pueblo", "main", "Guardiana del Oasis", "exploracion", "reach", 1, "El Oasis que Muere",
        "El oasis que mantiene vivo al pueblo está desapareciendo. Sigue el sistema subterráneo de agua y descubre que fue construido por los antiguos.",
        { gold: 35, xp: 2 }, ["El Pueblo Oasis recupera estabilidad", "Se desbloquea fabricación avanzada"]),
      m("d3", 1, "pueblo", "historian", "Historiador Aran", "exploracion", "reach", 1, "Las Ruinas Enterradas",
        "Después de reparar el oasis, aparecen símbolos antiguos. Explora las ruinas reveladas por una tormenta y descubre la obsesión de los Antiguos.",
        { gold: 40, xp: 2 }, ["Las ruinas quedan abiertas", "Aparecen cofres antiguos, enemigos guardianes y nuevos caminos"]),
      // Acto II
      m("d4", 2, "pueblo", "historian", "Historiador Aran", "exploracion", "reach", 1, "El Templo sin Nombre",
        "Los registros mencionan un templo anterior incluso a la antigua civilización. Sigue las pistas de los NPC para encontrar este lugar que no aparece en ningún mapa.",
        { gold: 50, xp: 3 }, ["El Templo sin Nombre queda como zona permanente", "Se revela que Atlas siempre existió"]),
      m("d6", 2, "pueblo", "main", "Guardiana del Oasis", "social", "talk", 3, "Los Guardianes de Arena",
        "Antiguos guardianes comenzaron a aparecer. Investígalos sin atacar: descubre que protegen información, no tesoros. El Guardián del Sol te entregará una llave.",
        { gold: 55, xp: 3 }, ["Se abre el camino hacia la Ciudad Antigua", "Aparecen comerciantes especializados y exploradores"]),
      // Acto IV
      m("d12", 4, "pueblo", "main", "Guardiana del Oasis", "combate", "kill", 3, "La Arena Corrompida",
        "La energía liberada por las ruinas corrompe la región. Investiga la corrupción en Oasis, Cañón Rojo y Mar de Dunas.",
        { gold: 70, xp: 3 }, ["La región entra en estado avanzado", "Aumentan enemigos, eventos especiales y recompensas"]),
      m("d13", 4, "pueblo", "main", "Guardiana del Oasis", "proteccion", "kill", 5, "La Defensa del Oasis",
        "La grieta creada por la corrupción atrae criaturas desde las profundidades. Defiende el Pueblo Oasis protegiendo la Fuente Central, la Muralla y los Habitantes.",
        { gold: 75, xp: 3 }, ["Dependiendo del desempeño, el pueblo mejora o sufre daños"]),
      // Extra
      paid("d_paid2", 2, "pueblo", "flavor", "Pescadora Astra", "evento", "kill", 5, "Emboscada del arenal",
        "Resiste 5 asaltantes en la emboscada del arenal mientras la amenaza es alta.",
        { gold: 35, potion: "hp_l" }, 15, 7),
    ],
    ciudad: [
      // Acto III
      m("d8", 3, "ciudad", "historian", "Historiador Aran", "exploracion", "chest", 3, "El Reino que Quiso Ascender",
        "Investiga los laboratorios superiores de la Ciudad Antigua: Cámara de la Vida, Cámara de la Energía y Cámara de Ascensión. Descubre el Proyecto Ascenso.",
        { gold: 65, xp: 3 }, ["Aparecen nuevos enemigos: híbridos antiguos y guardianes experimentales"]),
      m("d9", 3, "ciudad", "priest", "Sacerdote Solar", "recuperacion", "chest", 3, "El Fragmento del Sol",
        "Para activar el núcleo solar necesitas recuperar tres fragmentos: del Amanecer (desierto exterior), del Mediodía (torre antigua) y del Eclipse (bajo la ciudad).",
        { gold: 70, xp: 3 }, ["Se activa el Núcleo Solar", "Acceso a la biblioteca final"]),
      m("d10", 3, "ciudad", "priest", "Sacerdote Solar", "social", "talk", 1, "La Última Biblioteca",
        "Entra en la cámara protegida de la última biblioteca y recupera el registro final: la historia completa de Atlas.",
        { gold: 75, xp: 4 }, ["La historia principal avanza", "Se desbloquea el Acto IV"]),
      // Acto IV
      m("d11", 4, "ciudad", "historian", "Historiador Aran", "exploracion", "chest", 3, "La Caída de los Antiguos",
        "Encuentra los tres registros finales: La Advertencia (Laboratorio de Energía), El Experimento (Cámara de Ascensión) y El Último Día (Palacio Solar).",
        { gold: 80, xp: 4 }, ["La Ciudad Antigua cambia de estado", "Aparecen investigadores, restauradores y nuevos comerciantes"]),
      m("d14", 4, "ciudad", "priest", "Sacerdote Solar", "exploracion", "reach", 4, "El Camino al Templo Solar",
        "Activa los cuatro pilares antiguos para abrir el camino final: Pilar del Agua (Oasis), Pilar de Arena (Dunas), Pilar del Sol (Torre) y Pilar del Vacío (Ruinas).",
        { gold: 85, xp: 4 }, ["La Región Árida entra en estado final", "El Templo Solar emerge de la arena", "Acceso al jefe desbloqueado"]),
      // Acto V
      m("d15", 5, "ciudad", "priest", "Sacerdote Solar", "combate", "kill", 1, "El Último Rey de la Arena",
        "Entra al Templo Solar, encuentra el núcleo y enfrenta a Amon, Portador del Sol Eterno, que decidió quedarse para sellar la ciudad.",
        { gold: 150, xp: 5, item: "escudo_portatil" }, ["La Región Árida se transforma", "Se desbloquean eventos cruzados entre regiones", "Nuevas misiones en regiones anteriores"]),
      // Extra
      paid("d_paid3", 3, "ciudad", "main", "Faraón Eterno", "evento", "kill", 6, "Despertar del Lich",
        "Rechaza 6 élite del despertar del Lich mientras la amenaza es alta.",
        { gold: 40, potion: "hp_l", item: "escudo_portatil" }, 20, 8),
      wild("d_wild1", 3, "ciudad", "main", "Faraón Eterno", "exploracion", "reach", 1, "Ruinas del Sur",
        "Llega a las Ruinas del Sur del yermo y confirma lo que yace bajo la arena.",
        { gold: 30, xp: 1 }, [], { col: 0, row: 2 }),
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
//  EVOLUCIÓN DEL MUNDO DESPUÉS DE CADA JEFE
// ═══════════════════════════════════════════════════════════════

export const WORLD_EVOLUTION = {
  verde: {
    postBoss: {
      enemyTier: "corrupto",
      newEnemies: ["lobo_corrupto", "orco_corrupto", "bestia_ancestral"],
      npcChanges: {
        "Capitán Roland": "Sabía que volverías. Algo extraño está ocurriendo otra vez.",
        "Alcalde Tomás": "El bosque respira de nuevo. Pero los caminos aún no son seguros.",
        "Bren": "El acero vuelve a tener filo. La corrupción retrocedió, pero no desapareció.",
      },
      regionDesc: "La Región Verde comienza a recuperarse, pero quedan restos de corrupción.",
    },
    postArcticBoss: {
      enemyTier: "avanzado",
      newEnemies: ["guardian_antiguo", "cazador_cristal"],
      npcChanges: {
        "El Cartógrafo": "Los símbolos del norte coinciden con los del bosque. Todo está conectado.",
      },
    },
  },
  fria: {
    postBoss: {
      enemyTier: "despertado",
      newEnemies: ["guardian_congelado", "cazador_cristal", "soldado_hielo"],
      npcChanges: {
        "Reina de Hielo": "Aurel descansó. Pero la puerta sigue ahí, y algo detrás de ella observa.",
        "Boreas": "El viento cambió. Ya no trae solo frío. Trae recuerdos.",
      },
      regionDesc: "El hielo comienza a ceder en algunas zonas. Aparecen zonas antiguas que estaban congeladas.",
    },
  },
  desierto: {
    postBoss: {
      enemyTier: "ancestral",
      newEnemies: ["guardian_solar", "hibrido_antiguo", "cazador_cristal"],
      npcChanges: {
        "Faraón Eterno": "Amon descansó. La ciudad recuerda, y ahora comparte sus secretos.",
        "Sacerdote Solar": "El Templo permanece abierto. Es un lugar de conocimiento, no de poder.",
      },
      regionDesc: "La Región Árida se transforma. El Templo Solar es ahora un lugar de conocimiento.",
    },
  },
};

// ═══════════════════════════════════════════════════════════════
//  ESCALADO GLOBAL DE ENEMIGOS
// ═══════════════════════════════════════════════════════════════

export const GLOBAL_SCALING = {
  // Nivel del jugador → multiplicador de dificultad al volver a regiones anteriores
  // Un jugador nivel alto que vuelve a Región Verde encuentra enemigos escalados
  getEnemyLevel: (regionBaseLevel, playerLevel, bossesDefeated) => {
    const baseLevels = [2, 12, 25]; // Verde, Ártica, Árida
    const baseLevel = baseLevels[0]; // Siempre escala desde verde
    const bossBonus = bossesDefeated * 3;
    return Math.max(regionBaseLevel, baseLevel + bossBonus + Math.floor(playerLevel * 0.5));
  },
  getEnemyVariant: (bossesDefeated) => {
    if (bossesDefeated >= 3) return "ancestral";
    if (bossesDefeated >= 2) return "corrupto_avanzado";
    if (bossesDefeated >= 1) return "corrupto";
    return "normal";
  },
};

// ═══════════════════════════════════════════════════════════════
//  EVENTOS MUNDIALES DINÁMICOS
// ═══════════════════════════════════════════════════════════════

export const WORLD_EVENTS = [
  { id: "invasion", name: "Invasión", trigger: "threat_high", desc: "Un pueblo está siendo atacado. ¡Defiéndelo!" },
  { id: "caravana_perdida", name: "Caravana Perdida", trigger: "random", desc: "Una caravana de comerciantes necesita ayuda entre regiones." },
  { id: "aventureros", name: "Aventureros Descansando", trigger: "random", desc: "Un grupo de aventureros descansa. Puedes hablar, recibir información o ignorarlos." },
  { id: "mazmorra_temporal", name: "Entrada Antigua", trigger: "random", desc: "Una entrada antigua apareció. Desaparecerá pronto." },
  { id: "mensajero_norte", name: "Un mensajero ha llegado al Campamento", trigger: "post_boss_verde", desc: "Las señales del norte dejaron de responder. Solicitan ayuda de alguien que ya enfrentó a un Guardián." },
  { id: "llamada_sur", name: "La llamada del sur", trigger: "post_boss_fria", desc: "La arena está cambiando. Las antiguas ruinas comenzaron a despertar. La Región Árida necesita ayuda." },
  { id: "criaturas_huyen", name: "Criaturas huyendo", trigger: "post_boss_desierto", desc: "Las criaturas están cambiando nuevamente. Pero esta vez no parecen estar atacando. Están huyendo." },
];

// ═══════════════════════════════════════════════════════════════
//  UTILIDADES
// ═══════════════════════════════════════════════════════════════

export function getCampaignNpc(regionId, sector, role) {
  const regionNpcs = CAMPAIGN_NPCS[regionId];
  if (!regionNpcs) return null;
  const sectorNpcs = regionNpcs[sector] || regionNpcs.wild;
  if (!sectorNpcs) return null;
  return sectorNpcs[role] || null;
}

export function getCampaignBoss(regionId) {
  return CAMPAIGN_BOSSES[regionId] || CAMPAIGN_BOSSES.verde;
}

export function getCampaignMissions(regionId) {
  return CAMPAIGN_MISSIONS[regionId] || CAMPAIGN_MISSIONS.verde;
}

export function getWorldEvolution(regionId, phase) {
  return WORLD_EVOLUTION[regionId]?.[phase] || null;
}
