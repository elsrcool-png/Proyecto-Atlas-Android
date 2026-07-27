# Instalación Atlas Visual v2.16 en Termux

## Instalación limpia de la versión completa

```bash
cd ~
rm -rf ~/atlas
mkdir -p ~/atlas
unzip -q ~/storage/downloads/ProyectoAtlas_Visual_v2_16_Mobs_Jefes_Hasta_Region_Artica_Completo.zip -d ~/atlas
cd ~/atlas
rm -rf node_modules
npm install
npm run validate:enemy-master
npm run validate:hero-master
npm run validate:arctic-master
npm run build
npm run dev -- --host 0.0.0.0 --force
```

Abrir en el navegador:

```text
http://127.0.0.1:5173
```

## Aplicar solo el parche sobre v2.15

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_16_Mobs_Jefes_Hasta_Region_Artica.zip -d ~/atlas
rm -rf node_modules/.vite
npm install
npm run validate:enemy-master
npm run build
npm run dev -- --host 0.0.0.0 --force
```
