# Instalar Atlas v2.20 en Termux

## Opción recomendada: paquete completo

1. Extrae `ProyectoAtlas_Visual_v2_20_Controles_Estados_Accesibilidad_Completo.zip` en una carpeta nueva.
2. En Termux:

```bash
cd /ruta/de/Atlas_v2_20
rm -rf node_modules
npm install
npm run validate:v2-20
npm run build
npm run dev -- --host 0.0.0.0
```

## Parche sobre v2.19.7

El parche solo debe aplicarse sobre `ProyectoAtlas_Visual_v2_19_7_NPC_Artica_Maestro_Completo` sin modificaciones posteriores.

```bash
cd /ruta/de/Atlas_v2_19_7
unzip -o /ruta/Atlas_Parche_v2_20_sobre_v2_19_7.zip
rm -rf node_modules
npm install
npm run validate:v2-20
npm run build
npm run dev -- --host 0.0.0.0
```

## Controles nuevos

En el juego:

```text
Ajustes → Interfaz móvil → Mover, escalar y ajustar opacidad
```

La vibración se configura en:

```text
Ajustes → Vibración
```

El botón de giro aparece en el HUD, pausa, combate y dungeon.
