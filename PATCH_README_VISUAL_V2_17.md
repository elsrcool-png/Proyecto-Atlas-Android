# Atlas Visual v2.17 · Correcciones de combate, mobs, misiones y portales

Este parche se aplica sobre:

```text
ProyectoAtlas_Visual_v2_16_Mobs_Jefes_Hasta_Region_Artica_Completo.zip
```

## Correcciones

- Elfo Mago: se reconstruye `right.webp` a partir de la orientación izquierda reflejada correctamente.
- Combate: los nueve jugadores usan orientación derecha y los once enemigos orientación izquierda.
- Mobs: los recursos maestros se renderizan como imágenes directas, evitando que el respaldo procedural antiguo quede visible por una carrera de carga.
- Sectores: se elimina el desbloqueo de prueba de toda la Región Verde.
- Progresión: los sectores se reconstruyen desde misión aceptada, objetivo actual, objetivos completados y misión reclamada.
- Guardados antiguos: se reparan al cargar, descartando aperturas masivas provenientes de versiones de prueba.
- Viaje regional: conserva y reconstruye los accesos de la campaña destino.
- Portales verdes: la profundidad se ordena por la plataforma interactiva y el personaje aparece delante cuando activa la opción.

## Instalación rápida

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_17_Correcciones_Combate_Mobs_Misiones_Portales.zip -d ~/atlas
rm -rf node_modules/.vite
npm install
npm run validate:v2-17-fixes
npm run validate:hero-master
npm run validate:enemy-master
npm run build
npm run dev -- --host 0.0.0.0 --force
```
