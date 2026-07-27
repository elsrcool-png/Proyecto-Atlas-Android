# Atlas Visual v2.10.1 — Profundidad y navegación de A2

Base requerida: **Proyecto Atlas Visual v2.10 A2 Aprobado**.

## Correcciones aplicadas

- Orden de render compartido por eje Y para jugador, NPC, aldeanos, mobs, fauna, cofres, santuarios, puntos narrativos y objetos del mapa.
- Regla oficial: norte detrás, sur delante, usando el punto inferior o `depthY`.
- Eliminado el `z-index: 5000 !important` que obligaba a todas las entidades a aparecer sobre las carpas y árboles.
- Eliminado el aislamiento de la escena que impedía intercalar objetos y entidades.
- Colisiones de carpas, árboles, portal, torre y edificios mantenidas únicamente en su base.
- Cinco pinos que nacían dentro del río fueron retirados.
- Tres pinos de ribera fueron recolocados en tierra firme.
- Puente mantenido como capa baja transitable, con colisión solo en barandas.
- Soporte reutilizable mediante `src/lib/atlasDepth.js` para aplicar la misma lógica al resto de Región Verde.
- `AssetWorldLayer` acepta `depthY`, `depthSort`, capas `base/front/shadow/fx` y offsets de profundidad.

## Validación

```bash
node scripts/validate-visual-v2-10-a2.mjs
node scripts/validate-a2-depth-v2-10-1.mjs
npm run build
```

Resultado esperado:

```text
VALIDACIÓN A2 PROFUNDIDAD v2.10.1 CORRECTA
```

## Nota sobre las capas gráficas

Los sprites aprobados actuales conservan sus sombras horneadas y se ordenan como una unidad por el punto inferior. El renderer ya admite capas independientes `base`, `front` y `shadow/fx` cuando existan archivos separados, sin exigir redibujar los assets aprobados para corregir la navegación actual.
