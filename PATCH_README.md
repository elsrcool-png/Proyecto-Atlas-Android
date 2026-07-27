# Proyecto Atlas — Corrección Post-Guardián Verde v2.1

Aplicar **únicamente sobre `ProyectoAtlas_Consolidado_v2`**.

## Correcciones

### Zonas seguras liberadas
Después de vencer al Guardián Verde, los enemigos ambientales desaparecen de forma persistente en:

- `A2` — Campamento del Umbral
- `B2` — Ciudad de Verdalia
- `C2` — Pueblo de Robledal

`C3` deja de tratarse como zona segura liberada, porque queda reservado como sector de dungeon y actividad aventurera futura.

### Base de aventureros en C3
Después de completar la misión final de la Región Verde y activar `verde:guild_seed`, `verde:postgame_open` o `verde:restored`, el sector `C3` cambia visualmente:

- se retiran el arco corrupto, una ruina y una roca del flanco occidental;
- aparecen dos carpas de aventureros;
- se instala una fogata;
- aparecen cajas, barriles, leña, tablón y estandarte;
- cada objeto mantiene sprite, contorno y colisión modular independiente;
- la entrada de la dungeon, las salidas y la zona del antiguo jefe siguen transitables.

La zona usa los assets ya incluidos en `ProyectoAtlas_Consolidado_v2`; este parche no añade imágenes nuevas.

## Archivos reemplazados

```text
src/components/atlas/ExploreMode.jsx
src/lib/atlasGreenVisualScenes.js
src/lib/atlasRegionSectors.js
src/lib/atlasVisualScenes.js
src/lib/atlasWorldProgression.js
scripts/validate-consolidated-v2.mjs
```

## Instalación

1. Haz una copia de seguridad.
2. Descomprime este ZIP sobre la raíz de `ProyectoAtlas_Consolidado_v2`.
3. Acepta reemplazar los archivos.
4. Ejecuta:

```bat
node scripts\validate-green-scenes.mjs
node scripts\validate-consolidated-v2.mjs
npm run lint
npm run build
npm run dev
```

## Resultado esperado

- Antes del jefe: A2, B2 y C2 mantienen sus enemigos normales.
- Después del jefe: A2, B2 y C2 quedan sin enemigos ambientales.
- C3 no se limpia como asentamiento normal.
- Al completar la misión final, C3 muestra la base modular de aventureros.
- La dungeon y las salidas siguen accesibles.
