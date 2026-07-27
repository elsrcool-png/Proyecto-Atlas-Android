# Atlas Visual v2.15.0 · Personajes Jugables Maestro

Integra el paquete `Atlas_Personajes_Jugables_9_Clases_Maestro_v1.0` sobre Atlas Visual v2.14.0.

## Cambios

- 9 personajes jugables aprobados: Humano, Enano y Elfo × Guerrero, Mago y Pícaro.
- 4 direcciones por personaje: down, up, left y right.
- 36 sprites runtime WebP transparentes.
- 36 sprites maestros para conservación y futuras animaciones.
- Cargador común para selección, mundo libre y combate.
- Precarga al abrir la creación de personaje.
- Caminata de dos fases mediante desplazamiento sutil de un píxel.
- Anclaje inferior centrado conservado.
- Dibujo procedural anterior conservado como respaldo durante carga o error.
- No modifica estadísticas, habilidades, equipo, misiones, mapas, NPC ni mobs.

## Instalación sobre v2.14

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_15_Personajes_Jugables.zip -d ~/atlas
rm -rf node_modules/.vite
npm run validate:hero-master
npm run validate:arctic-master
npm run build
npm run dev -- --host 0.0.0.0 --force
```
