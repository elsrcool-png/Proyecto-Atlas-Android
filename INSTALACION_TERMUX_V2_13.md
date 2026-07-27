# Instalar Atlas Visual v2.13 en Termux

## Parche sobre v2.12.1

Detener el servidor con `Ctrl + C` y ejecutar:

```bash
cd ~/atlas

unzip -oq \
~/storage/downloads/Atlas_Parche_Horizontal_UI_Balance_v2_13.zip \
-d ~/atlas

rm -rf node_modules/.vite
npm install
npm run validate:horizontal-balance
npm run validate:portals
npm run validate:green-master
npm run validate:green-scenes
npm run validate:green-composition
npm run build
npm run dev -- --host 0.0.0.0 --force
```

Abrir en Chrome:

```text
http://127.0.0.1:5173
```

Al pulsar **Nueva partida**, **Cargar partida** o seleccionar horizontal en Ajustes, Chrome puede solicitar pantalla completa para bloquear la orientación. Es normal.

## Proyecto completo limpio

```bash
rm -rf ~/atlas
mkdir -p ~/atlas

unzip -oq \
~/storage/downloads/ProyectoAtlas_Visual_v2_13_Horizontal_UI_Balance_Completo.zip \
-d ~/atlas

cd ~/atlas
npm install
npm run validate:horizontal-balance
npm run build
npm run dev -- --host 0.0.0.0 --force
```
