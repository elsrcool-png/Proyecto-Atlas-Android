# Instalación limpia · Atlas Visual v2.11.0 en Termux

```bash
pkg update -y
pkg install nodejs-lts unzip -y
termux-setup-storage
mkdir -p ~/atlas-v211
unzip -oq ~/storage/downloads/ProyectoAtlas_Visual_v2_11_RegionVerde_Maestro_Completo.zip -d ~/atlas-v211
cd ~/atlas-v211
npm install
npm run validate:green-master
npm run validate:green-scenes
npm run build
npm run dev -- --host 0.0.0.0 --force
```

Abrir `http://127.0.0.1:5173` en Chrome y mantener Termux abierto.
