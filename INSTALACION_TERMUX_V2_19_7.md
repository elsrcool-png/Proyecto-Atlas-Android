# Instalación Atlas v2.19.7 en Termux

## Juego completo

```bash
rm -rf ~/atlas
mkdir -p ~/atlas
unzip ProyectoAtlas_Visual_v2_19_7_NPC_Artica_Maestro_Completo.zip -d ~/atlas
cd ~/atlas
npm install
npm run validate:v2-19-7
npm run build
npm run dev -- --host 0.0.0.0
```

## Parche sobre v2.19.6

```bash
cd ~/atlas
unzip -o Atlas_Parche_v2_19_7_sobre_v2_19_6.zip -d .
npm run validate:v2-19-7
npm run build
npm run dev -- --host 0.0.0.0
```
