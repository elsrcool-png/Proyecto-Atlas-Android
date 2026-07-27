# Iniciar Atlas Visual v2.17 desde CMD

## Instalación limpia

```bat
cd /d "%USERPROFILE%\Downloads"
mkdir Atlas_v2_17
powershell -NoProfile -Command "Expand-Archive -LiteralPath 'ProyectoAtlas_Visual_v2_17_Correcciones_Combate_Mobs_Misiones_Portales_Completo.zip' -DestinationPath 'Atlas_v2_17' -Force"
cd /d "%USERPROFILE%\Downloads\Atlas_v2_17"
npm install
npm run validate:v2-17-fixes
npm run build
npm run dev -- --host 0.0.0.0
```

Abrir:

```text
http://localhost:5173
```

Para detener el servidor, presiona `Ctrl + C`.
