# Atlas Visual v2.16 · Mobs y jefes hasta Región Ártica

Este parche se aplica sobre:

```text
ProyectoAtlas_Visual_v2_15_Personajes_Jugables_Completo.zip
```

## Contenido

- 6 mobs y Guardián Verde.
- 3 mobs árticos y Aurel.
- Cuatro direcciones por entidad.
- Runtime y maestros transparentes.
- Integración en mundo libre, dungeons y combate.
- Alias visual `aurel_portador` → `aurel_ultimo_portador`.
- Respaldo procedural conservado.

## Instalación Termux

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_16_Mobs_Jefes_Hasta_Region_Artica.zip -d ~/atlas
rm -rf node_modules package-lock.json
npm install
npm run validate:enemy-master
npm run validate:hero-master
npm run validate:arctic-master
npm run build
npm run dev -- --host 0.0.0.0 --force
```
