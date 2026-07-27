# Atlas v2.19.5 — Orientación, caminata y anclaje al suelo

## Objetivo

Corregir las direcciones invertidas visibles en mundo libre y combate, eliminar el efecto de imágenes deslizándose y aprovechar mejor el espacio de la arena.

## Cambios ejecutados

### Orientación única

- Los 9 héroes y 11 enemigos/jefes tienen `left.webp` y `right.webp` físicamente normalizados.
- El Enano Guerrero mira a la derecha cuando avanza a la derecha y a la izquierda cuando avanza a la izquierda.
- Pantera Sombría, Guardián Verde, Necromante, Asesino Esquelético y los demás enemigos usan la misma verdad visual en libre y combate.
- Combate conserva la formación aprobada: enemigo a la izquierda y jugador a la derecha.
- En combate el enemigo mira a la derecha y el jugador mira a la izquierda.

### Movimiento en mundo libre

- El jugador usa un ciclo de cuatro apoyos con oscilación de torso y compresión leve.
- El punto inferior permanece fijo para evitar sensación de flotación.
- La sombra de contacto cambia de ancho y opacidad según el pie apoyado.
- Los mobs calculan `up/down/left/right` según su desplazamiento real.
- Los cuatro sprites direccionales se precargan y cambian sin rerenderizar todo el mapa.
- Los villagers ambulantes usan paso, orientación lateral y sombra reactiva.
- La respiración idle ya no sube y baja tres píxeles; ahora comprime sutilmente desde los pies.

### Movimiento en combate

- Acercamientos cuerpo a cuerpo usan varios pasos, no una traslación plana.
- Torso y equipo alternan inclinación y compresión durante el avance.
- Las sombras se contraen entre pasos y se expanden al plantar el pie.
- El idle permanece anclado al piso.
- Saltos deliberados, como ataques pesados, conservan elevación; el resto no flota.

### Escala de combate

| Actor | Antes vertical | Ahora vertical |
|---|---:|---:|
| Jugador | 72 | 104 |
| Enemigo común | 72 | 104 |
| Jefe | 92 | 132 |

En horizontal bajo: jugador y enemigo común pasan de 52 a 76; jefe de 68 a 98.

### NPC Árticos

Se derivaron 16 NPC maestros a runtime de cuatro direcciones, 72×96:

- Boreas, Lyra cartógrafa, Freya, mercader boreal, guardián del refugio y Dvalin.
- Chamán, mercader glacial, Helga y Astra.
- Reina, Lyra investigadora, capitán boreal, Kael forjador, mercader real y hostelera.

Borin y Einar mantienen el respaldo procedural porque no venían en el paquete maestro.

## Arquitectura

- `atlasCombatFacing.js` ya no aplica espejos especiales. Consume assets normalizados.
- `EntitySprite.jsx` puede mantener cuatro vistas de un mob precargadas y activar la dirección desde el bucle de mundo.
- `ExploreMode.jsx` calcula facing por vector real y controla las sombras de contacto.
- `CombatView.jsx` aplica ciclo de pasos y escala ampliada.

## Validación

- 175/175 controles nuevos aprobados.
- Batería histórica completa aprobada.
- 267 archivos de código revisados, cero errores sintácticos.
- 534 imports locales, ninguno ausente.
- Checksums de héroes y enemigos actualizados tras la normalización aprobada.
