# Proyecto Atlas Visual v2.5 — Región Verde completa

Esta versión integra:

- mapas modulares de los nueve sectores verdes;
- bestiario regional propio;
- Humano Guerrero piloto;
- Bren piloto;
- 25 perfiles NPC verdes adicionales;
- NPC nombrados de campamento, pueblo y ciudad;
- guardianes de entrada de dungeon;
- NPC ambientales verdes;
- retrato del sprite real en el diálogo;
- correcciones Post-Guardián y zona de aventureros de C3.

## Termux

```bash
cd ~/atlas/ProyectoAtlas_Visual_v2_5_RegionVerde
rm -rf node_modules
npm install
node scripts/validate-green-scenes.mjs
node scripts/validate-visual-v2-4.mjs
node scripts/validate-visual-v2-5.mjs
npm run lint
npm run build
npm run dev -- --host 0.0.0.0
```

Abrir en Chrome:

```text
http://127.0.0.1:5173
```

En el panel desplegable del HUD debe aparecer:

```text
Visual 2.5 · Región Verde completa · NPC propios activos
```
