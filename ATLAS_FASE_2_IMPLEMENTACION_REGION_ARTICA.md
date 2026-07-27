# Atlas · Fase 2 · Implementación Región Ártica Maestro v2.14

## Base usada

Atlas Visual v2.13.0, conservando:

- modo horizontal;
- HUD limpio;
- balance inicial de mobs;
- portales corregidos;
- Región Verde Maestro completa.

## Integración

- Nuevo catálogo: `public/assets/atlas/fria/maestro_v1/`.
- `atlasArcticVisualScenes.js` conectado exclusivamente al catálogo maestro.
- Nueve terrenos reemplazados sin deformación.
- Dieciocho objetos reemplazados.
- 114 coordenadas y distribuciones conservadas.
- Sprites renderizados en contenedores cuadrados para respetar el lienzo 1024×1024.
- Anclaje inferior configurado en `968/1024`.
- Y-sort global conservado: norte detrás, sur delante.
- Colisiones, NPC, mobs, cofres, santuarios, portales y objetivos conservados.
- Puente de C2 permanece bajo jugador y entidades para permitir cruce legible.

## Validaciones superadas

- Región Ártica Maestro v1.0.
- Horizontal, HUD y balance v2.13.
- Portales v2.12.1.
- Región Verde Maestro.
- Escenas y composición de Región Verde.

`npm run build` no pudo ejecutarse en el entorno de empaquetado porque no contiene `node_modules`; Termux realizará la compilación final después de `npm install`.
