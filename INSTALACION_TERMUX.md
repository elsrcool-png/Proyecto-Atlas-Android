# Instalación en Termux

```bash
cd ~
rm -rf ~/atlas
mkdir -p ~/atlas
unzip -q ~/storage/downloads/atlas/ProyectoAtlas_Consolidado_v2_Termux_Fix.zip -d ~/atlas
cd ~/atlas/ProyectoAtlas_Consolidado_v2_Termux
npm install
npm run build
npm run dev -- --host 0.0.0.0
```

Abrir: http://127.0.0.1:5173

Este paquete no incluye el parche PostGuardian v2.1.
