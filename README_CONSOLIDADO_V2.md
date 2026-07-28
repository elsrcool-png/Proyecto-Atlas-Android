# Instalación · Proyecto Atlas Consolidado v2

## Proyecto completo

1. Descomprime `ProyectoAtlas_Consolidado_v2.zip` en una carpeta nueva.
2. Abre una terminal en la raíz.
3. Ejecuta:

```bash
npm install
node scripts/validate-green-scenes.mjs
node scripts/validate-consolidated-v2.mjs
npm run lint
npm run build
npm run dev
```

## Parche

El parche `Atlas_Parche_Consolidado_v2.zip` debe aplicarse sobre `ProyectoAtlas_RegionVerde_Modular_v1`.

1. Haz un respaldo.
2. Descomprime el parche en la raíz del proyecto.
3. Acepta reemplazar los archivos.
4. Ejecuta las mismas validaciones anteriores.

No copies `node_modules` ni combines este parche con versiones visuales experimentales anteriores.
