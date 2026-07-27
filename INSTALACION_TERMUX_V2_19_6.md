# Instalación Atlas v2.19.6 en Termux

## Juego completo

```bash
cd ~/storage/downloads
rm -rf ~/atlas
mkdir -p ~/atlas
unzip ProyectoAtlas_Visual_v2_19_6_Kael_Misiones_Completo.zip -d ~/atlas
cd ~/atlas
npm install
npm run validate:v2-19-6
npm run build
npm run dev -- --host 0.0.0.0
```

## Parche sobre Atlas v2.19.5

```bash
cd ~/atlas
unzip -o ~/storage/downloads/Atlas_Parche_v2_19_6_sobre_v2_19_5.zip
npm run validate:v2-19-6
npm run build
npm run dev -- --host 0.0.0.0
```
