# Atlas · Región Verde · Paquete Visual Maestro Aprobado v1.0

Este paquete consolida el arte aprobado de la Región Verde para Atlas v2.9.

## Contenido

- 9 terrenos, uno por sector A1–C3.
- 39 recursos visuales heredados con los nombres usados por Atlas.
- 1 recurso nuevo: `ruin_arch_corrupted_01.webp`.
- 40 assets de objetos con transparencia real.
- Manifiestos por sector.
- Carpeta `REEMPLAZO_DIRECTO` con 49 imágenes listas para copiar.
- Vistas previas y checksums SHA-256.

## Estructura

- `01_TERRENOS`: fondos de cada sector.
- `02_OBJETOS_UNICOS`: objetos organizados por familia.
- `03_SECTORES`: manifiestos de uso por sector.
- `04_PREVIEWS`: vistas generales.
- `REEMPLAZO_DIRECTO`: todos los archivos reunidos por nombre técnico.

## Regla de profundidad

Todos los objetos, NPC, mobs y jugadores deben ordenarse por el eje Y de su
punto de contacto con el suelo:

- Norte: menor Y, se dibuja primero.
- Sur: mayor Y, se dibuja después y queda delante.
- La categoría del objeto no decide la profundidad.
- La prioridad secundaria solo resuelve empates.

## Alcance

Este ZIP consolida arte y nombres. No modifica código, posiciones, colisiones,
animaciones ni lógica de transformación. El arco corrompido es un asset nuevo
y debe añadirse al manifiesto de C3 si todavía no existe en el código.
