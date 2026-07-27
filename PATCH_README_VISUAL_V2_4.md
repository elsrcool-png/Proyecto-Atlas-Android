# Parche Atlas Visual v2.4 — Región Verde

Aplicar únicamente sobre una instalación donde **Atlas Visual v2.3.1 REAL FIX** ya funcione y se vea el Humano Guerrero y Bren renovados.

El ZIP del parche debe descomprimirse directamente en la raíz que contiene `package.json`:

```bash
unzip -o ~/storage/downloads/atlas/Atlas_Parche_Visual_v2_4_Region_Verde.zip -d .
node scripts/validate-visual-v2-4.mjs
npm run build
npm run dev -- --host 0.0.0.0
```

El parche tiene `src/`, `scripts/`, `docs/` y archivos de versión directamente en su raíz. No contiene una carpeta envolvente.
