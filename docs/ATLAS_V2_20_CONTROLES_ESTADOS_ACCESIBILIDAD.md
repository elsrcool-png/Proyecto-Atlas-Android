# Proyecto Atlas v2.20 — Controles, estados y accesibilidad

## Objetivo

La versión 2.20 consolida cuatro frentes que antes funcionaban de forma separada:

1. controles táctiles multitáctiles y personalizables;
2. orientación solicitada desde el propio juego;
3. comunicación y resolución real de estados de combate;
4. accesibilidad física de NPC, pistas, portales y objetivos de misión.

## Controles multitáctiles

- Los botones críticos usan Pointer Events y reaccionan en `pointerdown`.
- El joystick conserva su propio `pointerId`, por lo que otro dedo no puede robarle el gesto.
- Se permite mantener dirección y pulsar A, B, correr, ataque, habilidad, objeto o escape.
- Se gestionan `pointerup` y `pointercancel`.
- Se desactiva la selección accidental, el menú contextual táctil y el resaltado azul dentro de las superficies jugables.
- Diarios, diálogos y paneles de texto mantienen selección y desplazamiento normales.

## Personalización de controles

En Ajustes → Interfaz móvil → Personalizar controles se pueden editar por separado los perfiles vertical y horizontal.

Controles editables:

- joystick;
- correr;
- botón B;
- botón A.

Cada control guarda:

- posición normalizada X/Y;
- escala entre 60 % y 170 %;
- opacidad entre 35 % y 100 %.

Presets disponibles:

- diestro;
- zurdo;
- compacto;
- tablet.

Las posiciones se guardan como proporciones de pantalla para sobrevivir a cambios de resolución y orientación.

## Orientación desde el juego

Se añadió un botón de giro en:

- HUD de exploración;
- menú de pausa;
- combate;
- dungeon.

El botón alterna entre horizontal y vertical y utiliza la Screen Orientation API cuando el navegador la permite. Si Android o el navegador rechazan el bloqueo, la interfaz conserva el modo adaptable sin reiniciar mapa, combate o sesión.

## Estados visibles en habilidades

Los botones de habilidades muestran iconos para los estados que pueden aplicar:

- Sangrado 🩸
- Veneno ☠️
- Quemadura 🔥
- Aturdimiento 😵
- Parálisis ⚡
- Congelación ❄️
- Vulnerable 💀
- Debilitado ⛓️
- Lento 🐌
- Inmovilizado 🪤
- Purificación ✨
- Invocaciones y clones

Un dado pequeño indica que el estado depende de la calidad de la tirada. Los iconos aparecen tanto en el combate normal como en el combate táctico de dungeon.

## Corrección de parálisis y congelación

El bloqueo se evalúa antes de reducir la duración del estado.

Una parálisis de un turno ahora:

1. consume exactamente una acción;
2. no lanza dados;
3. no causa daño;
4. no consume energía;
5. no desgasta arma;
6. no consume poción;
7. muestra `PARALIZADO` y reproduce descarga visual;
8. entrega el turno al enemigo.

La congelación sigue la misma regla. Las pruebas cubren duraciones de uno y dos turnos.

## Vibración

Se añadió una capa háptica central con intensidad configurable.

Patrones:

- pulsación ligera de interfaz;
- pulsación marcada para acciones;
- impacto normal;
- impacto pesado;
- crítico;
- aplicación de estado;
- parálisis/congelación;
- portal.

La vibración utiliza `navigator.vibrate` cuando está disponible y falla en silencio en dispositivos sin soporte. Puede desactivarse completamente desde Ajustes.

## Introducción de combate

Se eliminó la barra de carga. Se conserva:

- título de entrada;
- nombre del enemigo;
- subtítulo o rango;
- sonido característico del monstruo.

La entrada sigue bloqueando acciones durante su duración, pero ya no simula una carga inexistente.

## Auditoría de misiones y superposiciones

Se construyó una auditoría dinámica sobre los 27 sectores.

Elementos revisados:

- 54 NPC;
- 106 objetivos interactivos oficiales;
- 12 santuarios/portales;
- 54 cofres;
- 75 enemigos;
- todos los encargos y objetivos de diálogo de las tres campañas.

Reglas mínimas:

- NPC–NPC: 70 px;
- NPC–pista: 96 px;
- NPC–portal: 108 px;
- pista–pista: 76 px;
- pista–portal: 112 px;
- cofre–portal: 88 px.

La reubicación exige simultáneamente:

- estar fuera de sólidos;
- estar dentro del mapa;
- ser alcanzable mediante el mismo BFS de recorrido usado para auditar al jugador;
- conservar separación con otras interacciones.

Los NPC, cofres y pistas próximos a un portal ya no se eliminan. Se reubican. Esto corrigió tres objetivos que podían desaparecer:

- Forja regional de la Reliquia Verde;
- Puerta exterior de la Ciudadela Helada;
- Registro completo sobre Atlas.

## Corrección específica en Pueblo Verde C2

El objeto `c2_notice` estaba casi encima del altar de teletransporte. Fue trasladado desde la zona del portal a `(690, 430)`, con distancia suficiente respecto del santuario.

## Marcadores de misión

- Los NPC objetivo usan prioridad visual 9998.
- Las pistas objetivo usan prioridad visual 9999.
- La navegación y los resaltados quedan por encima de actores y utilería.
- La auditoría confirma que cada misión de diálogo conserva el NPC requerido y cada objetivo interactivo conserva su marcador físico.

## Archivos principales

- `src/components/atlas/AtlasPressButton.jsx`
- `src/components/atlas/AtlasControlEditor.jsx`
- `src/components/atlas/OrientationToggleButton.jsx`
- `src/hooks/useAtlasHaptics.js`
- `src/lib/atlasHaptics.js`
- `src/lib/atlasControlLayout.js`
- `src/lib/atlasSkillStatusHints.js`
- `src/lib/atlasInteractionClearance.js`
- `src/lib/atlasWorldAccessibility.js`
- `scripts/validate-v2-20.mjs`

## Resultado

Atlas v2.20 pasa la validación nueva y la batería histórica. El único control no completado dentro del entorno fue la compilación Vite, porque `npm ci` no terminó dentro del límite de red disponible. Esto no se confunde con una validación de código aprobada: la compilación final debe ejecutarse en Termux o Android Studio.
