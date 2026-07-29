# Proyecto Atlas v2.22.6 · Acción A sin cierre fantasma

## Diagnóstico confirmado con el video del teléfono

La v2.22.5 sí abría el diálogo con un toque corto, pero Android generaba después un
`click` de compatibilidad en la misma coordenada. Como el diálogo acababa de
montarse, ese segundo evento caía sobre su fondo y lo cerraba casi de inmediato.

Visualmente parecía que A no respondía. Mantener pulsado funcionaba porque alteraba
o retrasaba ese segundo evento.

## Corrección

- A continúa ejecutándose en `pointerdown`.
- El toque se detiene con `preventDefault` y `stopPropagation`.
- Se instala un bloqueo temporal, por coordenada y tiempo, para el `click`
  de compatibilidad generado por Android.
- El bloqueo solo afecta el mismo punto del toque durante 520 ms.
- Los fondos de los diálogos abiertos desde A cierran mediante `pointerdown`
  real sobre el fondo, no mediante `click`.
- Se corrigieron NPC, menú contextual, diálogo ambiental, reclutamiento,
  cofres, recompensas, tienda y eventos de destino.
- Joystick + A conserva multitáctil.
- Los botones internos de los diálogos siguen funcionando normalmente.

## Resultado esperado

Un toque corto sobre A abre el diálogo y lo mantiene abierto. No requiere mantener
el dedo y no se produce una segunda apertura ni un cierre inmediato.
