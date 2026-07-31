# Proyecto Atlas v2.24.0
## Auditoría del Lote 1: arquitectura regional fundamental

**Base:** v2.23.4 Estabilización Dungeon  
**Fecha:** 30 de julio de 2026  
**Estado:** integración terminada; regresión acumulativa aprobada; bundle pendiente de compilación en entorno con dependencias instaladas.

## 1. Auditoría previa

La base operativa dependía de tres identificadores regionales y de coordenadas legacy:

- `regionIndex` para identificar región.
- `blockIndex + sectorRow` para identificar sector.
- sectores A1–C3 como única topología admitida.
- guardado `saveVersion: 6`.

Esto era compatible con las Regiones 1–3, pero inseguro para regiones irregulares, cambios de orden, aliases narrativos y expansión a diez regiones.

## 2. Decisiones aplicadas

1. La identidad regional deja de depender del índice del array.
2. El guardado registra `currentRegionId` y `currentNodeId` estables.
3. El mapa regional se modela como nodos y conexiones explícitas.
4. Las Regiones 1–3 se adaptan al motor nuevo sin cambiar su composición 3×3.
5. Las Regiones 4–10 se registran, pero permanecen sin composición hasta recibir la definición del usuario.
6. Se preservan todos los campos legacy para compatibilidad y retroceso.

## 3. Implementaciones

### Registro regional

Archivo: `src/lib/atlasRegionRegistry.js`

- Diez regiones numeradas.
- IDs canónicos estables.
- aliases históricos y narrativos.
- mano, dedo, anillo y Amenaza mínima.
- modo de mapa `legacy_grid` o `nodal`.
- estado de producción separado de la disponibilidad jugable.

### Motor nodal

Archivo: `src/lib/atlasWorldGraph.js`

- creación y validación de grafos;
- conexiones independientes de la posición visual;
- direcciones bidireccionales o unidireccionales;
- nodos con escena, tipo, etiquetas y posición opcional;
- detección de nodos inalcanzables;
- adaptador automático para los 27 sectores actuales.

### Guardado v7

Archivo: `src/lib/atlasSave.js`

- migración v6 → v7;
- migración idempotente;
- `worldState`, `regionStates` y `dailyState`;
- región y nodo actuales por ID;
- estados regionales preparados para diez regiones;
- respaldo de ranura conservado;
- campos legacy preservados.

### Carga y sesión

Archivos principales:

- `src/hooks/useAtlasSession.js`
- `src/lib/atlasSanctuaries.js`
- `src/pages/Game.jsx`

La carga resuelve primero el ID estable y solo usa índices como compatibilidad. Los viajes actualizan el estado estable antes de guardar.

### Interfaz

Las ranuras consultan el registro regional y el mapa de exploración calcula cantidades desde el grafo compatible. No se alteraron posiciones, rutas, escenas ni objetos de los mapas actuales.

## 4. Protección de composición

Validado:

- Verde: 9 sectores, inicio A2.
- Ártica: 9 sectores, inicio A1.
- Árida: 9 sectores, inicio A1.
- Cada grafo legacy: 9 nodos y 12 conexiones ortogonales.
- Regiones 4–10: 0 nodos y 0 conexiones definidos.

La composición futura permanece reservada para los datos que entregue el usuario.

## 5. Validaciones aprobadas

- 294 archivos JS/JSX/MJS sin errores sintácticos.
- 670 imports locales resueltos.
- 11 bloques focales de arquitectura v2.24.0.
- migración v6 → v7.
- idempotencia de migración.
- escritura, carga y respaldo de ranuras.
- integridad del registro de diez regiones.
- integridad de los tres grafos legacy.
- cadena acumulativa completa desde v2.23.4 hasta validaciones históricas de UI, combate, mapas, portales, personajes, mobs, audio y balance.
- 0 fallos en la ejecución final de `npm run validate:v2-24-0`.

Registro completo: `VALIDACION_ATLAS_V2_24_0.txt`.

## 6. Archivos modificados

16 archivos existentes modificados y 8 archivos nuevos añadidos. No se eliminó ningún archivo.

Nuevos componentes principales:

- `src/lib/atlasRegionRegistry.js`
- `src/lib/atlasWorldGraph.js`
- `scripts/validate-v2-24-0.mjs`
- `ACTUALIZACION_ATLAS_V2_24_0.md`
- `PATCH_MANIFEST_ATLAS_V2_24_0.json`
- `AUDITORIA_LOTE_1_ATLAS_V2_24_0.md`
- `VALIDACION_ATLAS_V2_24_0.txt`
- `ARCHIVOS_CAMBIADOS_ATLAS_V2_24_0.txt`

## 7. Riesgos controlados

- Guardados antiguos: migración automática y campos legacy.
- Reordenamiento regional: carga por ID estable.
- Regiones incompletas visibles: no se agregaron al runtime jugable.
- Composición inventada: futuras regiones no tienen grafo.
- Regresión en mapas actuales: validadores de Verde, Ártica y portales aprobados.
- Regresión en Dungeon: pruebas v2.23.4 conservadas.

## 8. Puerta antes del Lote 2

En un entorno con dependencias instaladas ejecutar:

```bash
npm ci
npm run build
npm run validate:v2-24-0
```

Después comprobar:

1. cargar una partida v2.23.4 de cada región disponible;
2. guardar y volver a cargar;
3. viajar por portal entre regiones;
4. verificar que mapa, sector y misión mostrados sean correctos;
5. crear una partida nueva y confirmar que inicia en Verde A2;
6. comprobar que los mapas visibles siguen idénticos.

Solo después de esa verificación corresponde iniciar el Lote 2: Gremio, Maestrías, habilidades posteriores a Región 3 y misiones especiales de Amenaza.
