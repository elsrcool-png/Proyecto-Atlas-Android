# Parche Atlas Visual v2.8

Aplicar sobre `ProyectoAtlas_Visual_v2_7_MundoModular`.

Copiar el contenido del ZIP sobre la raíz del proyecto y aceptar reemplazos.

Archivos principales:

- `src/lib/atlasCampaign.js`
- `src/lib/atlasDungeonEntry.js`
- `src/lib/atlasHeroSprites.js`
- `src/lib/atlasPilotSprites.js`
- `src/lib/atlasPixel.js`
- `src/lib/atlasEntitySprites.js`
- `src/components/atlas/EntitySprite.jsx`
- `src/components/atlas/CombatView.jsx`
- `src/components/atlas/ExploreMode.jsx`
- `scripts/validate-visual-v2-6.mjs`
- `scripts/validate-visual-v2-8.mjs`

Después:

```bash
node scripts/validate-visual-v2-8.mjs
npm run build
npm run dev -- --host 0.0.0.0
```
