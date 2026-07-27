# Instalación Atlas Visual v2.18 en Termux

## Opción A — Juego completo

Archivo:

```text
ProyectoAtlas_Visual_v2_18_Combate_Dinamico_Fase1_Completo.zip
```

Comandos:

```bash
termux-setup-storage
cd ~
rm -rf atlas
mkdir atlas
unzip -o ~/storage/downloads/ProyectoAtlas_Visual_v2_18_Combate_Dinamico_Fase1_Completo.zip -d ~/atlas
cd ~/atlas
npm install
npm run validate:combat-dynamic
npm run validate:v2-17-fixes
npm run build
npm run dev -- --host 0.0.0.0
```

## Opción B — Parche sobre v2.17

Archivo:

```text
Atlas_Parche_v2_18_Combate_Dinamico_Fase1.zip
```

Con Atlas v2.17 ya instalado en `~/atlas`:

```bash
cd ~/atlas
unzip -o ~/storage/downloads/Atlas_Parche_v2_18_Combate_Dinamico_Fase1.zip -d ~/atlas
npm install
npm run validate:combat-dynamic
npm run validate:v2-17-fixes
npm run build
npm run dev -- --host 0.0.0.0
```

## Abrir en el navegador

Vite mostrará una dirección similar a:

```text
http://127.0.0.1:5173
```

En el mismo teléfono también puedes usar:

```text
http://localhost:5173
```
