# Atlas · 9 personajes jugables · Maestro v1.0

Paquete visual de las nueve combinaciones raza/clase aprobadas.

## Estructura

- `masters`: archivos 288×384 para conservación y futuras animaciones.
- `runtime`: archivos 72×96 optimizados para dibujarse en el canvas lógico 36×48 de Atlas.
- Cuatro direcciones: `down`, `up`, `left`, `right`.
- Anclaje común: centro inferior.
- Fondo transparente real.

## Integración

La versión completa v2.15 incluye el cargador en `src/lib/atlasHeroSprites.js`.
Mientras una imagen carga o falla, Atlas conserva el dibujo procedural anterior como respaldo.
La caminata mantiene dos fases mediante un desplazamiento sutil de un píxel.
