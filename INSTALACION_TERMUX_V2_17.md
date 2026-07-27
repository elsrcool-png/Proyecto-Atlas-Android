# Instalación Atlas Visual v2.17 en Termux

## Instalación limpia

```bash
cd ~
rm -rf ~/atlas
mkdir -p ~/atlas
unzip -q ~/storage/downloads/ProyectoAtlas_Visual_v2_17_Correcciones_Combate_Mobs_Misiones_Portales_Completo.zip -d ~/atlas
cd ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-17-fixes
npm run validate:hero-master
npm run validate:enemy-master
npm run validate:green-master
npm run validate:arctic-master
npm run build
npm run dev -- --host 0.0.0.0 --force
```

Abrir:

```text
http://127.0.0.1:5173
```

## Parche sobre v2.16

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_17_Correcciones_Combate_Mobs_Misiones_Portales.zip -d ~/atlas
rm -rf node_modules/.vite
npm install
npm run validate:v2-17-fixes
npm run build
npm run dev -- --host 0.0.0.0 --force
```
