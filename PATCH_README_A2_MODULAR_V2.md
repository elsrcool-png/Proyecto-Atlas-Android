# Parche Atlas — A2 Modular Real v2

## Base compatible

- `ProyectoAtlas_Consolidado_v2`
- `ProyectoAtlas_Consolidado_v2_Termux_Fix`
- Consolidado v2 con `Atlas_Parche_Correccion_PostGuardian_v2_1`

El parche puede aplicarse antes o después de la corrección Post-Guardián.

## Instalación en Termux

Desde la raíz del proyecto, donde aparece `package.json`:

```bash
unzip -o ~/storage/downloads/atlas/Atlas_Parche_A2_Modular_Real_v2.zip -d .
node scripts/validate-a2-modular-v2.mjs
npm run build
npm run dev -- --host 0.0.0.0
```

Abrir:

```text
http://127.0.0.1:5173
```

## Archivos funcionales

- `src/lib/atlasA2ModularV2.js`
- `src/components/atlas/AssetWorldLayer.jsx`
- `src/lib/atlasCanonicalWorlds.js`
- `public/assets/atlas/verde/a2/modular_v2/`
- `scripts/validate-a2-modular-v2.mjs`

## Nota

Solo reemplaza la arquitectura visual y de colisiones de A2. No altera misiones, combate, dungeons, balance ni la zona de aventureros de C3.
