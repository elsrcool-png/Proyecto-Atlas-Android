# Atlas v2.19.2 — Orientación y anclaje de combate

## Problemas corregidos

### 1. Personajes y enemigos mirando fuera del combate

Los sprites maestros no usan una convención horizontal uniforme. Algunos archivos llamados `left.webp` miran realmente a la derecha y viceversa. En otros casos, ambas tomas presentan casi la misma orientación.

Esto era especialmente visible en:

- Enano Guerrero, Enano Mago y Enano Pícaro;
- Guardián Verde;
- Asesino Esquelético;
- Necromante;
- algunos enemigos de lectura casi frontal.

Se creó `src/lib/atlasCombatFacing.js`, que define una toma canónica por entidad y aplica reflejo horizontal cuando la orientación solicitada no coincide con la orientación real del dibujo.

En combate la regla queda fija:

- jugador a la izquierda mirando a la derecha;
- enemigo a la derecha mirando a la izquierda.

La corrección se limita al modo de combate y no altera las cuatro direcciones usadas durante exploración.

### 2. Ataques y hechizos separados del personaje

`CombatVfx.jsx` usaba posiciones fijas equivalentes a 16 % y 70 % de una caja. Además, el componente estaba montado dentro del contenedor del enemigo. Por eso algunos proyectiles parecían nacer en el aire, detrás del objetivo o dentro del propio monstruo.

Ahora `CombatView.jsx` mide mediante `getBoundingClientRect()`:

- el campo de actores;
- la posición real del jugador;
- la posición real del enemigo;
- el punto de salida del atacante;
- el centro de impacto del objetivo.

Cada acción captura esos puntos antes de comenzar. `CombatVfx.jsx` recibe `origin`, `target` y `arenaSize`, y construye una trayectoria real entre ambos.

### 3. Ataques cuerpo a cuerpo que cruzaban al enemigo

Los desplazamientos anteriores eran constantes: 64, 78 u 88 píxeles. En pantallas pequeñas podían atravesar al objetivo y en pantallas grandes quedaban demasiado lejos.

La distancia de avance ahora se calcula con el espacio real entre las cajas de ambos actores. El atacante se detiene entre 8 y 14 píxeles antes del objetivo y después regresa a su posición.

### 4. Reacciones en dirección incorrecta

El enemigo antes podía moverse hacia el jugador al recibir daño. Ahora:

- el jugador avanza hacia la derecha;
- el enemigo avanza hacia la izquierda;
- el enemigo golpeado retrocede hacia la derecha;
- el jugador golpeado retrocede hacia la izquierda.

### 5. Números de daño flotando fuera del objetivo

Los números ya no usan porcentajes fijos. Se anclan al centro real del personaje que recibe daño, curación o absorción de escudo.

## VFX actualizados

- cortes y multigolpes aparecen sobre el objetivo;
- proyectiles viajan desde el atacante;
- Bola de Fuego carga en el mago, viaja e impacta;
- viento recorre el vector atacante–objetivo;
- ondas sísmicas nacen en el atacante y terminan bajo el objetivo;
- Bomba de Humo comienza en el pícaro y remata sobre el enemigo;
- clones de sombra ocupan puntos intermedios de la trayectoria;
- auras se generan sobre quien ejecuta la habilidad;
- rayos, hielo, tornado y ruptura de escudo se centran en el objetivo.

## Archivos principales

- `src/lib/atlasCombatFacing.js`
- `src/components/atlas/EntitySprite.jsx`
- `src/components/atlas/CombatView.jsx`
- `src/components/atlas/CombatVfx.jsx`
- `scripts/validate-combat-facing-v2-19-2.mjs`

## Compatibilidad

La actualización conserva:

- transacciones `actionId` de v2.19.1;
- daño y escudo sincronizados;
- audio de Región Verde;
- múltiples impactos;
- sprites maestros en exploración;
- Región Verde y Región Ártica;
- portales y desbloqueo de sectores;
- modo horizontal.
