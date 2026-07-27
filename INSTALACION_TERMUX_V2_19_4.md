# Instalación Atlas Visual v2.19.4 en Termux

## Instalación completa

```bash
termux-setup-storage
pkg update
pkg install nodejs unzip
rm -rf ~/atlas
mkdir -p ~/atlas
unzip -o ~/storage/downloads/ProyectoAtlas_Visual_v2_19_4_Guardian_Audio_Portable_Completo.zip -d ~/atlas
cd ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-19-4
npm run build
npm run dev -- --host 0.0.0.0
```

## Aplicar parche sobre v2.19.3

```bash
cd ~/atlas
unzip -o ~/storage/downloads/Atlas_Parche_v2_19_4_sobre_v2_19_3.zip -d ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-19-4
npm run build
npm run dev -- --host 0.0.0.0
```

## Audio

La validación ya no requiere `ffprobe` ni instalar `ffmpeg`. Los OGG se comprueban directamente desde Node.
