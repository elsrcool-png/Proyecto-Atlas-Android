# Proyecto Atlas v2.22.9
## Auditoría previa a integración

**Fecha:** 2026-07-30  
**Paquete auditado:** `ProyectoAtlas_Visual_v2_22_9_HUD_Maestro_Adaptativo(1).zip`  
**Objetivo:** verificar los errores reportados y convertir todas las mejoras acordadas en un plan técnico integrable, sin modificar todavía el juego.

**Corrección de auditoría:** el indicador `2/10` de la captura ártica es el nivel de Amenaza, no el contador de enemigos de la misión. Se retiró el supuesto conflicto de guardado asociado.

---

## 1. Veredicto ejecutivo

La auditoría confirma que los problemas reportados no son percepciones aisladas. Existen causas concretas en el código:

1. La entrada de dungeon tiene prioridad real sobre el punto de misión, aunque el comentario del código afirma lo contrario.
2. La misión ártica `f13` puede mostrar enemigos sin iniciar combate porque la zona segura bloquea persecución y colisión de combate.
3. Los enemigos se marcan como derrotados antes de que el combate termine, lo que puede romper encuentros tras escapar o perder.
4. La campaña activa y encadena misiones automáticamente, pero no posee una capa de diálogo por fase. El resultado es una sucesión de marcadores.
5. Solo existe un encuentro de misión dedicado. La mayoría de objetivos de eliminación todavía dependen de mobs ambientales y del respawn diario.
6. El multiplicador regional explícito de Ártica y Árida se neutraliza durante la preparación normal del enemigo. Además, el balance toma principalmente estadísticas base del jugador, dejando que el equipo genere una ventaja excesiva.
7. El combate admite un solo enemigo. Un 2 contra 1 o 3 contra 1 real requiere cambiar el modelo de estado, la interfaz y la resolución de turnos.
8. El botón de combate está conectado a una poción pequeña fija, no al inventario general de consumibles.
9. Todos los herreros usan el mismo catálogo de armas de clase.
10. La interfaz y la lógica cobran precios distintos al mejorar armas.
11. La herrería solo mejora armas de clase. Las armas regionales y de botín quedan fuera.
12. Las reliquias están bloqueadas explícitamente para mejora común y las armaduras no tienen sistema de mejora.

**Conclusión:** la integración debe dividirse en corrección urgente, reconstrucción de misiones, balance/encuentros y herrería/equipamiento. Aplicarlo como un parche único produciría demasiadas interdependencias y riesgo de corrupción de guardados.

---

## 2. Estado de validación del paquete

### Validaciones superadas

Se ejecutó la cadena acumulativa:

```text
npm run validate:v2-22
```

Resultado:

- 290 archivos JS/JSX/MJS sin errores sintácticos.
- 648 imports locales resueltos.
- Validadores de HUD, interacción táctil, fluidez, combate, equipamiento, regiones, NPC y arte aprobados.
- La cadena existente considera correcto que el equipo del jugador conserve una ventaja amplia sobre mobs comunes. Esto explica parte de la facilidad en Región Ártica: no es un fallo detectado por los validadores actuales, sino una regla de balance que ya no coincide con el diseño buscado.

### Compilación completa no verificada

`npm run build` no pudo ejecutarse porque `node_modules` no está instalado. La instalación mediante `npm ci` fue bloqueada por el registro del entorno, que no encontró `zwitch@2.0.4`.

Esto no demuestra un fallo de compilación del proyecto. Significa que la auditoría pudo validar sintaxis, imports y scripts internos, pero no generar el bundle final de Vite en este entorno.

---

# 3. Errores reportados inicialmente

## BUG-01 · Misión verde difícil de examinar por superposición con dungeon

**Severidad:** P1 alta  
**Estado:** confirmado  
**Archivo principal:** `src/components/atlas/ExploreMode.jsx`

### Causa

`onA()` comprueba `nearDungeon` antes de `nearStoryPoint` y retorna inmediatamente. El comentario posterior declara prioridad de misión sobre NPC y otros objetos, pero la dungeon ya capturó la acción.

La proximidad de dungeon también se calcula de manera independiente, aunque exista un punto narrativo activo en el mismo radio. El texto contextual muestra primero “Hablar con el guardián de la dungeon”.

### Corrección requerida

Crear un único resolvedor de interacción, por ejemplo:

```text
misión activa / punto narrativo
> NPC de misión
> encuentro de misión
> NPC de servicio
> santuario / cofre
> dungeon
> interacción ambiental
```

La interfaz, el botón A y la acción ejecutada deben consumir la misma resolución. No deben calcular prioridades separadas.

### Criterio de aceptación

En el segundo nodo de raíces, el botón A debe mostrar y ejecutar `Examinar raíces` aunque la entrada de dungeon esté dentro del radio. La dungeon vuelve a estar disponible al abandonar el radio del nodo o completar la fase.

---

## BUG-02 · Mob de misión ártica visible pero sin activar combate

**Severidad:** P0 bloqueador  
**Estado:** confirmado  
**Archivos:**

- `src/components/atlas/ExploreMode.jsx`
- `src/lib/atlasMissionEncounters.js`
- `src/lib/atlasArcticCampaignV2.js`

### Causa

En `ExploreMode`, un enemigo:

- no persigue cuando el jugador está dentro de `safeRadius`;
- no inicia combate si `playerInSafe` es verdadero;
- tampoco puede caminar dentro de la zona segura.

La misión ártica `f13`, objetivo `repela_criaturas`, genera cinco enemigos alrededor de la Ciudadela B2. La zona segura de una ciudad usa un radio aproximado de 270. Uno de los enemigos se coloca directamente dentro de ese radio y los demás rodean el perímetro. Mientras el jugador permanezca dentro de la Ciudadela, el combate queda bloqueado.

### Corrección requerida

Los encuentros de misión necesitan una regla explícita independiente de la seguridad ambiental:

```text
combatAllowedInSafeZone: true
encounterArenaId: "fria_f13_ciudadela"
```

La alternativa preferida es una arena de evento delimitada dentro de la ciudad, en la que solo los enemigos de esa misión ignoren la prohibición de combate. Los mobs normales deben seguir bloqueados.

### Criterio de aceptación

Cada criatura de `f13` debe iniciar combate al entrar en contacto dentro del evento de defensa. No debe requerir salir de la ciudad ni dormir.

---

## BUG-03 · Enemigo marcado como derrotado antes de terminar el combate

**Severidad:** P0/P1  
**Estado:** confirmado  
**Archivo:** `src/components/atlas/ExploreMode.jsx`

### Causa

Al detectar colisión, el código ejecuta en este orden:

1. `e.defeated = true`;
2. oculta el sprite;
3. guarda el ID mediante `markEnemyDefeated`;
4. recién después inicia el combate.

La muerte real y el progreso de misión se procesan más tarde en `onEnemyDead`. Por tanto, el sistema mantiene dos conceptos incompatibles de “derrotado”.

### Riesgos

- Escapar puede eliminar al enemigo del mundo.
- Perder puede dejar el encuentro sin objetivo visible.
- Un cierre inesperado durante combate puede persistir el enemigo como derrotado sin otorgar progreso.
- La misión puede quedar en un estado imposible.

### Corrección requerida

Usar estados de encuentro:

```text
available -> engaged -> defeated
                 -> available, al escapar o perder
```

El ID permanente solo se guarda después de confirmar la muerte.

---

## ACLARACIÓN-01 · El indicador 2/10 corresponde a Amenaza

**Estado:** hallazgo descartado tras aclaración del usuario  
**Impacto:** se elimina la supuesta incompatibilidad de guardado de `f13`

### Corrección de la auditoría

El valor `2/10` visible junto al icono del ojo pertenece al **nivel de Amenaza de la zona**, no al progreso de la misión ártica. Por tanto, la captura no demuestra que el guardado conserve un objetivo antiguo de diez enemigos.

El código actual puede mantener cinco criaturas para `f13` sin requerir una migración basada en esa imagen. Las migraciones de esquema siguen siendo recomendables como protección general para futuras modificaciones de campañas, pero ya no forman parte de este bloqueador ni deben condicionar la integración de la misión.

---

# 4. Misiones, historia y encuentros

## MIS-01 · Activación automática sin presentación narrativa

**Severidad:** P1  
**Estado:** confirmado

### Evidencia funcional

- La primera misión regional se marca `accepted: true` y `active: true` al entrar por primera vez.
- Al reclamar una misión, la siguiente disponible se acepta automáticamente y puede activarse sin conversación.
- El NPC principal recibe un texto genérico basado en porcentaje regional y desbloqueo del jefe.

### Resultado

La campaña avanza antes de que un NPC presente el conflicto. El jugador recibe instrucciones, pero no contexto dramático.

### Corrección requerida

Ampliar estados:

```text
locked -> discovered -> available -> accepted -> active -> ready -> done
```

- La entrada a región puede descubrir la misión y mostrar una escena breve.
- El NPC debe ofrecerla antes de marcarla aceptada, salvo eventos deliberadamente automáticos.
- El encadenamiento debe volver disponible la siguiente misión, no aceptarla en silencio.

---

## MIS-02 · Existe resumen de historia, pero no diálogo por fase

**Severidad:** P1  
**Estado:** confirmado

Las campañas V2 poseen `desc`, `storySummary` y `worldChanges`, pero no incluyen un contrato de diálogo para:

- oferta;
- aceptación;
- avance de objetivo;
- descubrimiento;
- regreso;
- cierre;
- fallo o repetición de evento.

Al interactuar con un punto narrativo, el mensaje habitual es equivalente a “la campaña avanza”. Esto convierte la historia en telemetría con sombrero de fantasía.

### Esquema recomendado

```js
dialogue: {
  offer: [...],
  accepted: [...],
  objectiveComplete: {
    objective_id: [...]
  },
  ready: [...],
  claim: [...],
  failure: [...]
}
```

También se requiere un pequeño director de escenas para:

- enfocar NPC u objeto;
- mostrar una reacción;
- activar cambios del mundo;
- recién después actualizar el objetivo.

---

## MIS-03 · Enemigos de misión dependen de mobs normales

**Severidad:** P1  
**Estado:** confirmado

### Alcance actual

Campañas V2 detectadas:

- Región Verde: 15 misiones, 7 objetivos `kill`.
- Región Ártica: 15 misiones, 4 objetivos `kill`.
- Región Árida: 19 misiones, 7 objetivos `kill`.
- Total actual del código: 49 misiones y 18 objetivos de eliminación.

Solo existe una definición dedicada en `atlasMissionEncounters.js`: Ártica `f13`. Los otros 17 objetivos de eliminación no tienen encuentro propio en ese módulo.

El respawn general borra todos los IDs de enemigos derrotados al comenzar un nuevo día. Por eso matar mobs antes de aceptar una misión puede obligar a dormir.

### Corrección requerida

Crear encuentros de misión data-driven:

```js
{
  missionId,
  objectiveId,
  sectorId,
  trigger,
  spawnPolicy,
  enemies,
  formation,
  retryPolicy,
  completionPolicy
}
```

Reglas canónicas:

- no usar el pool ambiental como requisito narrativo;
- aparecer al activarse la fase o entrar al evento;
- reaparecer tras escape, derrota o interrupción;
- desaparecer al completar el objetivo;
- progresar exactamente una vez por enemigo confirmado;
- conservar mobs normales como contenido paralelo.

---

## MIS-04 · Evento de grupo y aproximación al jugador

**Estado:** no implementado

El sistema puede generar varios enemigos en el mapa, pero cada colisión abre un combate aislado. Para el diseño acordado, el evento puede:

1. activar el grupo completo;
2. hacer que todos se aproximen al jugador;
3. bloquear la salida del evento;
4. resolver una serie de combates o un combate múltiple;
5. liberar el área al derrotarlos.

Debe existir una política por encuentro, no una regla global.

---

# 5. Dificultad regional, habilidades y equipo enemigo

## BAL-01 · El multiplicador regional explícito se neutraliza

**Severidad:** P1  
**Estado:** confirmado

Regiones:

```text
Verde   1.0
Ártica  1.3
Árida   1.6
```

En `prepareEnemy()` se calcula:

```text
encounterMul = regionMul / baseRegionMul
```

Cuando la llamada normal entrega exactamente 1.3 para Ártica o 1.6 para Árida, el resultado es 1.0. El nivel regional todavía influye, pero el multiplicador explícito deja de endurecer estadísticas.

### Corrección requerida

Separar conceptos:

```text
estadística final =
base de especie
x crecimiento de nivel
x perfil regional
x variante
x composición del encuentro
x modificador excepcional
```

El multiplicador regional no debe dividirse por sí mismo.

---

## BAL-02 · El equipo supera el anclaje de balance

**Severidad:** P1  
**Estado:** confirmado

El balance mezcla 78% de un ancla basada en:

- vida base;
- ataque base;
- defensa física base;
- defensa mágica base;

El equipo actual del jugador no forma parte sustancial del ancla. Por diseño, los validadores existentes comprueban que el equipo conserve ventaja. Con bonificaciones grandes, un personaje nivel 11 puede dominar enemigos nivel 15.

### Corrección requerida

No conviene escalar 1:1 con el equipo, porque invalidaría la progresión. Se recomienda:

- mantener una base regional fija;
- añadir solo una fracción limitada del poder total del equipo;
- establecer techos y pisos por región;
- simular builds débiles, medias y optimizadas.

### Objetivo de balance propuesto

Para un personaje nivel 11 con equipo razonable en Ártica:

- enemigo normal 1v1: exige decisiones, pero sigue siendo vencible con consistencia;
- 2v1: encuentro peligroso que puede requerir habilidad o consumible;
- elite: riesgo real de derrota sin preparación.

La cifra final debe salir de simulaciones, no de inflar porcentajes a ojo.

---

## BAL-03 · Habilidades regionales existen, pero son aleatorias y pueden quedar bloqueadas

**Estado:** parcialmente implementado

Ártica y Árida ya tienen probabilidades de añadir habilidades regionales. Sin embargo:

- se agregan aleatoriamente al preparar cada enemigo;
- el desbloqueo depende de la posición de la habilidad en el arreglo;
- el tercer espacio suele exigir nivel 15;
- un mismo tipo de enemigo puede no expresar la identidad regional de forma consistente.

### Corrección requerida

Definir arquetipos regionales estables:

- cada enemigo ártico posee al menos una técnica de control, defensa o congelación coherente con su especie;
- cada enemigo árido posee al menos una técnica de presión, quemadura, veneno o ataque encadenado;
- elites reciben una habilidad adicional;
- la IA considera sinergias y no solo probabilidad plana.

---

## BAL-04 · Equipo enemigo

**Estado:** no implementado como sistema de combate

No existe un loadout de arma, armadura, escudo o accesorio que modifique estadísticas y comportamiento de mobs humanoides.

### Recomendación

Usar perfiles ligeros, no inventarios completos:

```js
loadout: {
  weapon: "boreal_spear",
  armor: "ice_mail",
  offhand: "glacial_shield"
}
```

El equipo debe ser visible en el sprite y justificar su efecto. Bestias y elementales usan rasgos naturales en lugar de inventario.

---

# 6. Combates 2 contra 1 y 3 contra 1

## COM-01 · El modelo actual solo admite un enemigo

**Severidad:** cambio estructural  
**Estado:** no implementado

La sesión mantiene `enemy` singular. La vista, la IA, las barras, los estados y las acciones operan sobre un solo objetivo. Los múltiples enemigos del mapa son combates separados.

### Integración por etapas

#### Etapa A · Encuentro encadenado

- Un grupo entra al mismo evento.
- Se combate uno por uno sin volver al mapa.
- El siguiente reemplaza al anterior.
- Requiere poco cambio en la interfaz y valida el flujo de grupos.

#### Etapa B · 2 contra 1 real en Ártica

- `enemies[]` en vez de `enemy`.
- selección de objetivo;
- orden de acciones;
- barras múltiples;
- efectos de área;
- reglas para evitar cadenas injustas de ataques.

#### Etapa C · 3 contra 1 en Árida

- se amplía el mismo sistema;
- composiciones con roles y sinergias;
- no todos los encuentros deben ser múltiples.

### Frecuencia inicial recomendada para pruebas

```text
Verde:   casi todo 1v1, grupos solo narrativos
Ártica:  mayoría 1v1, minoría 2v1
Árida:   mezcla de 1v1, 2v1 y encuentros 3v1 especiales
```

No fijar porcentajes definitivos hasta medir duración y tasa de derrota.

---

# 7. Consumibles en combate

## COM-02 · “Poción” está cableada a una poción pequeña fija

**Severidad:** P2 funcional  
**Estado:** confirmado

La vista:

- lee `player.potions`;
- muestra `Poción`;
- desactiva el botón si la vida está llena;
- ejecuta `usePotion()`.

`usePotion()` siempre cura 6 HP y reduce `player.potions`. El inventario general `player.consumables` existe, pero `useConsumable()` prohíbe su uso durante combate.

### Corrección requerida

Cambiar a:

```text
Consumible -> selector -> confirmar uso -> gastar turno
```

Cada definición necesita:

```js
usableInCombat
validTargets
actionCost
effects
statusRestrictions
```

El selector debe mostrar cantidad, efecto exacto y motivo de bloqueo. No debe consumir objeto ni turno si la acción es inválida.

### Migración

Unificar gradualmente `player.potions` y `player.consumables` o, como mínimo, presentar ambos desde una misma capa de inventario para no romper guardados.

---

# 8. Herreros, catálogos y mejoras

## FOR-01 · Todos los herreros muestran las mismas armas

**Severidad:** P1 de progresión  
**Estado:** confirmado

`BlacksmithModal` recibe el nivel de forja, pero no la región ni el asentamiento. Su catálogo se obtiene mediante `weaponsForClass(player.class)`, por lo que todos los herreros comparten la misma lista. Solo cambia qué categoría pueden fabricar y el límite de mejora.

### Corrección requerida

Pasar:

```text
regionId
sectorId
smithId
smithTier
```

Crear catálogos regionales y, cuando corresponda, catálogos personales por herrero. Los servicios básicos pueden repetirse, pero las armas, armaduras y recetas distintivas no.

---

## FOR-02 · La interfaz y la lógica cobran precios distintos

**Severidad:** P0/P1 económico  
**Estado:** confirmado

La interfaz calcula:

```text
20 + nivelDeMejora x 15
```

La acción real calcula:

```text
12 + nivelDeMejora x 12
```

El jugador ve un precio y el sistema descuenta otro.

### Corrección requerida

Crear una única función pura:

```js
getUpgradeQuote(item, upgradeLevel, smithContext, player)
```

La UI y la transacción deben usar exactamente el mismo resultado.

---

## FOR-03 · Solo se usa el primer material de la receta

**Severidad:** P1  
**Estado:** confirmado

Tanto la UI como la acción seleccionan `Object.keys(recipe.materials)[0]`. Una receta con varios materiales pierde todos salvo el primero durante la mejora.

### Corrección requerida

Cada nivel de mejora necesita una receta completa, con todos sus materiales y cantidades.

---

## FOR-04 · No se muestra una cotización completa de mejora

**Estado:** parcialmente implementado

La fabricación muestra materiales poseídos y requeridos. La mejora comprime oro y un solo material dentro del texto del botón. No muestra:

- estadísticas actuales;
- estadísticas posteriores;
- todos los materiales;
- procedencia del material;
- motivo exacto del bloqueo;
- hitos de mejora.

### Corrección requerida

Panel de cotización:

```text
Actual -> Siguiente
ATK 8  -> 10
Crítico 5% -> 6%

Material A 4/6
Material B 2/2
Oro 320/500
```

---

## FOR-05 · El arma regional verde no aparece para mejorar

**Severidad:** P1  
**Estado:** confirmado como problema de modelo, no solo de interfaz

Hay dos sistemas de armas separados:

1. `classWeaponInventory`, compatible con herrería y `weaponUpgrades`;
2. `weaponInventory`, usado por armas regionales, comerciales, botín e instancias.

La herrería solo lista el primero. Por eso las armas regionales o de botín pueden equiparse y venderse, pero no tienen ruta de mejora en la forja.

Además, las reliquias verdes están bloqueadas explícitamente con el mensaje de que no se mejoran como armas comunes.

### Corrección requerida

Crear un sistema genérico de mejora de instancias que admita:

- armas de clase;
- armas regionales;
- armas de botín;
- armas raras y legendarias;
- reliquias con ruta especial.

Las reliquias no deben usar la receta común, pero sí una ruta propia con materiales y costes especiales.

---

## FOR-06 · Las armaduras no pueden mejorarse

**Severidad:** P1  
**Estado:** confirmado

No existe:

- `armorUpgrades`;
- acción `upgradeArmor`;
- cotización de armadura;
- pestaña de armaduras en herrería;
- aplicación de bonificación por nivel de mejora.

### Corrección requerida

Generalizar el sistema:

```text
weapon
armor
helmet
```

Opcionalmente accesorios más adelante, con reglas propias.

La armadura completa puede mejorar defensa física, defensa mágica, vida y resistencia. El casco puede mejorar defensa, vida, energía, precisión o resistencias. Raras, legendarias y equipo de jefe deben tener rutas especiales, no exclusión absoluta.

---

# 9. Arquitectura recomendada para integración

## 9.1. Resolvedor único de interacción

```js
resolveInteractionContext({
  playerPosition,
  activeMission,
  storyPoints,
  missionNpcs,
  missionEncounters,
  services,
  dungeon,
  ambientObjects
})
```

Entrega un solo objeto:

```js
{
  type,
  targetId,
  priority,
  label,
  execute
}
```

El HUD y el botón A consumen el mismo resultado.

## 9.2. Estado de encuentro separado

```js
encounterStates: {
  [encounterId]: {
    status: "inactive|available|engaged|completed",
    defeatedEnemyIds: [],
    attempts: 0
  }
}
```

No mezclar con `defeatedEnemyIds` ambientales.

## 9.3. Director narrativo de misiones

- diálogo por fase;
- escenas de evento;
- información conocida por el jugador;
- cambio de objetivo después de la escena;
- reanudación segura desde guardado.

## 9.4. Perfil regional de combate

```js
regionCombatProfile: {
  hp,
  attack,
  physicalDefense,
  magicalDefense,
  statusResistance,
  guaranteedAbilities,
  groupRules
}
```

## 9.5. Combate con grupo

Primero:

```js
encounterQueue: Enemy[]
```

Después:

```js
enemies: Enemy[]
activeTargetId
turnOrder
```

## 9.6. Cotizador único de herrería

```js
getUpgradeQuote({ itemInstance, upgradeLevel, smithContext, player })
applyUpgradeQuote(quote)
```

La segunda función rechaza cotizaciones vencidas o manipuladas y recalcula antes de descontar.

---

# 10. Orden de integración propuesto

## Fase 0 · Corrección bloqueadora

1. Arreglar prioridad misión/dungeon.
2. Permitir combate de encuentro `f13` dentro de su arena.
3. Dejar de marcar enemigos como derrotados antes de la muerte.
4. Añadir migración para el objetivo 5/10.
5. Crear pruebas automáticas específicas para los cuatro errores.

## Fase 1 · Misiones narrativas y encuentros

1. Añadir estados `discovered` y `available`.
2. Detener aceptación automática silenciosa.
3. Incorporar diálogo por fases.
4. Crear director de eventos.
5. Convertir los 18 objetivos `kill` en encuentros independientes.
6. Añadir reintento tras escape, derrota y cierre inesperado.

## Fase 2 · Dificultad regional

1. Separar multiplicador regional del multiplicador excepcional.
2. Recalibrar anclaje al jugador.
3. Garantizar habilidades regionales por arquetipo.
4. Añadir loadouts ligeros a enemigos humanoides.
5. Crear simulador de balance por build y región.

## Fase 3 · Grupos de combate

1. Encuentros encadenados.
2. 2v1 real en Ártica.
3. Habilidades de área y selección de objetivo.
4. 3v1 especial en Árida.
5. Ajustar recompensas, duración y economía de consumibles.

## Fase 4 · Consumibles

1. Selector de consumibles en combate.
2. Definiciones de validez y coste de turno.
3. Migración de `potions`.
4. Soporte de curación, energía, antídotos y estados regionales.

## Fase 5 · Herrería y equipo

1. Cotizador único y corrección de precios.
2. Recetas de mejora con todos los materiales.
3. Catálogos regionales por herrero.
4. Mejora de armas regionales y de botín.
5. Ruta especial para reliquias.
6. Mejora de armaduras y cascos.
7. Migración de guardados y validadores de integridad.

---

# 11. Pruebas automáticas que faltan

Los validadores actuales son amplios, pero no cubren estos fallos. Deben agregarse:

1. `validate:interaction-priority`
2. `validate:mission-safezone-combat`
3. `validate:encounter-lifecycle`
4. `validate:mission-schema-migrations`
5. `validate:mission-dialogue-coverage`
6. `validate:mission-encounter-independence`
7. `validate:regional-combat-profiles`
8. `validate:multi-enemy-combat`
9. `validate:combat-consumables`
10. `validate:smith-regional-catalogs`
11. `validate:upgrade-quote-parity`
12. `validate:equipment-upgrade-coverage`

---

# 12. Criterios de cierre global

La integración se considera completa cuando:

- ninguna dungeon puede capturar una interacción de misión prioritaria;
- todos los enemigos de misión son independientes del respawn ambiental;
- escapar o perder no elimina enemigos ni bloquea objetivos;
- cada misión tiene presentación, avance y cierre narrativo visible;
- las misiones nuevas no se aceptan silenciosamente;
- Ártica y Árida poseen identidad estadística y de habilidades propia;
- los grupos de enemigos aparecen solo en encuentros diseñados para ello;
- `Consumible` permite elegir el objeto correcto;
- los herreros tienen catálogos regionales distintos;
- la cotización visible coincide exactamente con el coste aplicado;
- armas regionales, armaduras y cascos poseen rutas de mejora;
- reliquias, raras, legendarias y equipo de jefe usan rutas especiales;
- los guardados anteriores migran sin pérdida de equipo ni progreso;
- la cadena de validación y el build final pasan sin errores.

---

## 13. Decisiones de diseño que deben congelarse antes de programar

1. `f13` queda definitivamente en 5 o vuelve a 10 enemigos.
2. Frecuencia objetivo de 2v1 en Ártica y 3v1 en Árida.
3. Si la primera implementación usa encuentros encadenados antes del combate múltiple real.
4. Qué porcentaje del poder de equipo entra al balance adaptativo.
5. Niveles máximos de mejora por región y rareza.
6. Si accesorios serán mejorables en esta actualización o después.
7. Catálogo exacto de cada herrero.
8. Materiales y rutas de mejora de la Reliquia Verde y demás equipo de jefe.

Estas decisiones no bloquean la Fase 0. Sí deben resolverse antes de las fases estructurales correspondientes.

