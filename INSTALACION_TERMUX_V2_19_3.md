# Instalación Atlas Visual v2.19.3 en Termux

## Opción recomendada: juego completo

Archivo:

```text
ProyectoAtlas_Visual_v2_19_3_NPC_Fondos_Combate_Completo.zip
```

```bash
termux-setup-storage
cd ~
rm -rf ~/atlas
mkdir -p ~/atlas
unzip -oq ~/storage/downloads/ProyectoAtlas_Visual_v2_19_3_NPC_Fondos_Combate_Completo.zip -d ~/atlas
cd ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-19-3
npm run build
npm run dev -- --host 0.0.0.0
```

Abre:

```text
http://127.0.0.1:5173
```

## Parche sobre Atlas v2.19.2

Archivo:

```text
Atlas_Parche_v2_19_3_sobre_v2_19_2.zip
```

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_v2_19_3_sobre_v2_19_2.zip -d ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-19-3
npm run build
npm run dev -- --host 0.0.0.0
```

No uses el parche sobre otra base. Cuando exista duda sobre la versión instalada, usa el paquete completo.
