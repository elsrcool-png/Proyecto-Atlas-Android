# Instalación Atlas Visual v2.19.1 en Termux

## Opción recomendada: juego completo

Archivo:

```text
ProyectoAtlas_Visual_v2_19_1_Estabilizacion_Combate_Completo.zip
```

```bash
termux-setup-storage
cd ~
rm -rf ~/atlas
mkdir -p ~/atlas
unzip -oq ~/storage/downloads/ProyectoAtlas_Visual_v2_19_1_Estabilizacion_Combate_Completo.zip -d ~/atlas
cd ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-19-1
npm run build
npm run dev -- --host 0.0.0.0
```

Abre:

```text
http://127.0.0.1:5173
```

## Parche sobre Atlas v2.19.0

Archivo:

```text
Atlas_Parche_v2_19_1_sobre_v2_19.zip
```

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_19_1_sobre_v2_19.zip -d ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-19-1
npm run build
npm run dev -- --host 0.0.0.0
```

No apliques este parche sobre v2.17 o sobre una de las ramas v2.18. En esos casos instala el paquete completo.
