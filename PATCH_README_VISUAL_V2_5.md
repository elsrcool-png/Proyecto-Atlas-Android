# Parche Atlas Visual v2.5 — NPC Región Verde

Aplicar sobre **ProyectoAtlas_Visual_v2_4_RegionVerde** o sobre una instalación equivalente donde Visual v2.4 ya funcione.

```bash
cd ~/atlas/ProyectoAtlas_Visual_v2_4_RegionVerde
unzip -o ~/storage/downloads/atlas/Atlas_Parche_Visual_v2_5_NPC_Region_Verde.zip -d .
node scripts/validate-visual-v2-5.mjs
npm run lint
npm run build
npm run dev -- --host 0.0.0.0
```

El ZIP no contiene una carpeta envolvente. `src/`, `scripts/` y `docs/` se aplican directamente en la raíz del proyecto.
