# Atlas Visual v2.11.0 · Región Verde Maestro

Este parche se aplica sobre Atlas Visual v2.10.1.

## Incluye

- Reemplazo visual completo de los nueve sectores de Región Verde.
- 9 terrenos aprobados.
- 40 objetos aprobados.
- Y-sort global por pies.
- Corrección de árboles en agua en A1 y A2.
- Arco corrompido de C3 conectado.
- Validadores de integridad, navegación y profundidad.

## Instalación en Termux

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_RegionVerde_Maestro_v2_11.zip -d ~/atlas
rm -rf node_modules/.vite
npm install
npm run validate:green-master
npm run validate:green-scenes
npm run build
npm run dev -- --host 0.0.0.0 --force
```

Abrir en Chrome:

```text
http://127.0.0.1:5173
```
