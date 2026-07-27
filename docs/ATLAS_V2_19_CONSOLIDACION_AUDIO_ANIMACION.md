# Proyecto Atlas Visual v2.19

## Combate Dinámico Fase 1 + Audio Región Verde

Atlas v2.19 consolida las dos ramas v2.18 que fueron desarrolladas por separado sobre v2.17:

- v2.18 Combate Dinámico Fase 1.
- v2.18 Audio prototipo Región Verde.

## Integración realizada

- Se conserva `atlasCombatDirector.js` como reloj maestro de la acción.
- El audio escucha `animationSequence` y sus impactos temporizados.
- Los ataques múltiples reproducen corte e impacto por cada golpe visible.
- Los críticos se reproducen sobre el impacto crítico real.
- Bola de Fuego reproduce lanzamiento y explosión en momentos separados.
- Los fallos y contraataques usan los eventos `MISS_REACTION` y `COUNTER_HIT`.
- La introducción sonora del enemigo bloquea los controles sin sustituir `combatBusy`.
- El turno enemigo sigue esperando el cierre de la animación.
- La música, ambiente, intros, muerte, victoria y portales de Región Verde se mantienen.
- Se incorporan controles de audio maestro, música, ambiente y efectos.

## Compatibilidad

La versión completa v2.19 reemplaza cualquier instalación anterior.

También se entregan dos parches:

1. Parche sobre v2.18 Combate Dinámico.
2. Parche consolidado sobre v2.17, que incluye animación y audio.

No se debe aplicar el parche sobre v2.18 Audio como si fuera la base final, porque esa rama no contiene las modificaciones profundas del director de combate.

## Validaciones

- 22 controles del combate dinámico.
- 32 recursos OGG verificados.
- 258 archivos JavaScript/JSX revisados sintácticamente.
- Personajes, mobs, Región Verde, Región Ártica, portales y modo horizontal validados.
