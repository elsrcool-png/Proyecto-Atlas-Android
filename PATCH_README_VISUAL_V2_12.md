# Proyecto Atlas Visual v2.12.0

## Región Verde Maestro v1.1

Parche de composición, escala, profundidad y navegación construido sobre Atlas Visual v2.11.0.

### Cambios principales

- Normalización de todos los objetos maestros a contenedores cuadrados, respetando el lienzo original 1024×1024.
- Escala corregida por familia: árboles, puentes, torres, cuevas, ruinas, viviendas, edificios urbanos y puertas fortificadas.
- Orden de render conservado por `feet-y`: norte detrás, sur delante.
- Reubicación de NPC de A2, B2 y C2 para evitar que queden ocultos por carpas, casas o edificios.
- Fogatas, cajas, leña, árboles y construcciones retirados de rutas principales.
- Ajuste de árboles que ocupaban caminos en B1, C1, C2 y A3.
- Reubicación del tablón de B2 fuera del camino central.
- Rutas principales declaradas en `navigationLanes` para validación automática.
- Nuevo validador `validate-green-composition-v2-12.mjs`.

### Archivos principales modificados

- `src/lib/atlasGreenVisualScenes.js`
- `src/components/atlas/ExploreMode.jsx`
- `scripts/validate-region-verde-maestro-v1.mjs`
- `scripts/validate-green-composition-v2-12.mjs`
- `package.json`
- `VERSION_ATLAS_VISUAL.txt`

### Validar en Termux

```bash
cd ~/atlas
rm -rf node_modules/.vite
npm run validate:green-master
npm run validate:green-scenes
npm run validate:green-composition
npm run build
npm run dev -- --host 0.0.0.0 --force
```

### Resultado esperado

```text
VALIDACIÓN REGIÓN VERDE MAESTRO v1 CORRECTA
All Green Region scenes are asset-complete and reachable.
VALIDACIÓN COMPOSICIÓN REGIÓN VERDE v2.12 CORRECTA
```
