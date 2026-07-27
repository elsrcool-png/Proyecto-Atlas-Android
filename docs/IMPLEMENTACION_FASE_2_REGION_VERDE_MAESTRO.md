# Fase 2 · Integración completa de Región Verde

## Implementado

1. Se creó la raíz única:
   `public/assets/atlas/verde/maestro_v1/`
2. Se copiaron los 49 recursos aprobados sin recomprimirlos.
3. Los nueve sectores A1–C3 usan sus terrenos maestros.
4. Todos los props de Región Verde apuntan al catálogo maestro.
5. A2 dejó de usar la escena visual paralela y ahora forma parte del mismo registro que los otros ocho sectores.
6. Se activó profundidad global por anclaje inferior para jugador, NPC, mobs, aldeanos, fauna y props.
7. Las colisiones continúan limitadas a troncos, bases y soportes.
8. Se conectó el estado previo y posterior al jefe de C3.

## Capas

El motor conserva soporte para `ground`, `shadow`, `decal`, `low`, `world`, `front`, `overlay` y `fx`.

El paquete maestro contiene sprites completos individuales, no archivos físicos separados `base/front/shadow`. Por eso la integración actual usa Y-sort del sprite completo. El renderer queda preparado para añadir capas front independientes cuando existan esos recortes.

## Archivos principales modificados

- `src/lib/atlasGreenVisualScenes.js`
- `src/lib/atlasVisualScenes.js`
- `src/components/atlas/AssetWorldLayer.jsx`
- `src/lib/atlasDepth.js` se conserva como núcleo de profundidad compartida.
