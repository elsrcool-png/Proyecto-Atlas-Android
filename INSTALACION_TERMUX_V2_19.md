# Instalación Atlas Visual v2.19 en Termux

## Opción recomendada: juego completo

Archivo:

```text
ProyectoAtlas_Visual_v2_19_Combate_Dinamico_Audio_Region_Verde_Completo.zip
```

```bash
termux-setup-storage
cd ~
rm -rf ~/atlas
mkdir -p ~/atlas
unzip -oq ~/storage/downloads/ProyectoAtlas_Visual_v2_19_Combate_Dinamico_Audio_Region_Verde_Completo.zip -d ~/atlas
cd ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-19
npm run build
npm run dev -- --host 0.0.0.0
```

Abre:

```text
http://127.0.0.1:5173
```

## Parche sobre v2.18 Combate Dinámico

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_19_sobre_v2_18_Combate_Dinamico.zip -d ~/atlas
npm install
npm run validate:v2-19
npm run build
```

## Parche consolidado sobre v2.17

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_19_sobre_v2_17_Consolidado.zip -d ~/atlas
npm install
npm run validate:v2-19
npm run build
```

No uses el parche «sobre v2.18 Combate Dinámico» encima de la rama v2.18 Audio. En caso de duda, instala el juego completo.
