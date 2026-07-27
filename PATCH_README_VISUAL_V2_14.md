# Atlas Visual v2.14.0 · Región Ártica Maestro

Integra el paquete `Atlas_Region_Artica_Visual_Maestro_Aprobado_v1.0` sobre Atlas Visual v2.13.0.

## Cambios

- 9 terrenos aprobados, A1 a C3.
- 18 objetos árticos únicos aprobados.
- 114 colocaciones activas conservadas.
- Nuevo catálogo: `public/assets/atlas/fria/maestro_v1/`.
- Objetos normalizados a lienzo cuadrado 1024×1024 sin deformación.
- Anclaje inferior en `968/1024`, correspondiente al contacto visible con el suelo.
- Orden global por eje Y preservado: norte detrás, sur delante.
- Coordenadas, NPC, mobs, cofres, portales, colisiones y objetivos conservados.
- Modo horizontal, HUD limpio y balance v2.13 preservados.

## Instalación sobre v2.13

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_RegionArtica_Maestro_v2_14.zip -d ~/atlas
rm -rf node_modules/.vite
npm run validate:arctic-master
npm run validate:horizontal-balance
npm run build
npm run dev -- --host 0.0.0.0 --force
```
