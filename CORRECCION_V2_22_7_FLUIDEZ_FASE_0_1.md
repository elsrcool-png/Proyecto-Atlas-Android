# Proyecto Atlas v2.22.7 · Fluidez Fase 0 + Fase 1

Esta versión aplica las dos primeras fases de la auditoría de rendimiento sobre la v2.22.6.

## Fase 0 — correcciones inmediatas

- Se conecta el selector CSS real de Región Verde (`atlas-world-scene--verde`).
- En Android/táctil se eliminan cadenas de filtros y sombras borrosas por objeto.
- Las imágenes del mundo pasan de `decoding="sync"` a `decoding="async"`.
- Solo terreno y recursos críticos usan carga inmediata.
- La caché explícita de precarga queda limitada a 48 imágenes.
- El joystick mide su geometría al comenzar el gesto, no en cada movimiento.
- Los eventos `pointermove` del joystick se agrupan a una actualización por fotograma.
- El RAF se detiene durante pausa, combate y cuando la aplicación queda oculta.

## Fase 1 — núcleo de simulación

- Movimiento del jugador expresado en píxeles por segundo.
- Simulación con paso fijo de 60 Hz.
- Límite de recuperación para evitar espiral de actualizaciones tras una pausa.
- Cámara con interpolación independiente de FPS.
- IA de enemigos, aldeanos y fauna a 20 Hz.
- Comprobaciones de proximidad e interacción a 15 Hz.
- Navegador de misión a 6 Hz.
- Referencias direccionales de enemigos cacheadas, sin `querySelector` por actualización.
- Escrituras de transformaciones evitadas cuando el valor no cambia.
- Actores de baja frecuencia interpolados visualmente mediante CSS.

## Compatibilidad

- Conserva la corrección táctil A de v2.22.6.
- Conserva guardados y estructura acumulativa desde v2.20.
- No redimensiona todavía los assets maestros. Eso corresponde a la Fase 2.
