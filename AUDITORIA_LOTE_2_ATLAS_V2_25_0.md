# Proyecto Atlas v2.25.0
## Auditoría del Lote 2: progresión posterior a Región 3

**Base:** v2.24.0 Arquitectura Regional Fundamental, aprobada por el usuario  
**Fecha:** 31 de julio de 2026  
**Estado:** integración y regresión de código aprobadas; bundle pendiente de ejecución en un entorno con dependencias instaladas.

## 1. Auditoría previa

La base v2.24.0 ya contaba con IDs regionales estables, guardado v7 y motor nodal, pero todavía presentaba estos límites:

- no existía un estado persistente para Gremio, contratos, Maestrías o eventos especiales;
- las habilidades posteriores al prólogo no podían aprenderse, sustituirse ni evolucionar;
- Amenaza no funcionaba como disparador de contenido persistente;
- el jugador no disponía de una interfaz para contratos ni configuración de Maestrías;
- integrar todo dentro de `useAtlasSession.js` habría devuelto el núcleo a una arquitectura monolítica;
- el guardado v7 no incluía la nueva progresión.

Durante la primera integración se detectó un riesgo crítico: una llamada inicial podía forzar la apertura del Gremio incluso sin completar Región 3. La condición fue corregida antes de cerrar el lote. El Gremio ahora solo se abre mediante estados reales de la Región Árida o la derrota registrada de Amon.

## 2. Decisiones aplicadas

1. Las Regiones 1–3 permanecen funcionalmente intactas.
2. El Gremio se desbloquea al completar Región 3, no por nivel.
3. Aprender una Maestría es permanente; equipar o sustituir solo cambia la configuración activa.
4. Evolucionar requiere acciones verificables dentro del mundo.
5. Las misiones especiales por Amenaza se anuncian y registran automáticamente.
6. La recompensa exacta permanece oculta hasta completar la misión.
7. Regiones 4–10 pueden contener definiciones preparadas, pero nada se activa sin región jugable, ID correcto y umbral de Amenaza.
8. La nueva lógica se separa del hook principal para proteger mantenimiento y regresión.

## 3. Arquitectura implementada

### Motor de progresión

Archivo: `src/lib/atlasPostRegion3Progression.js`

Responsabilidades:

- estado inicial y normalización;
- condición de apertura del Gremio;
- contratos y objetivos;
- Maestrías aprendidas y equipadas;
- progreso individual por rango y usos;
- evolución de Rango I a Rango II;
- activación y resolución de misiones especiales;
- sincronización con el personaje y el combate;
- datos seguros para interfaz.

### Hook de progresión

Archivo: `src/hooks/useAtlasPostRegion3Progression.js`

Centraliza acciones, avisos, persistencia, sincronización del personaje y resolución de habilidades equipadas. No duplica el catálogo de combate.

### Seguimiento de Amenaza

Archivo: `src/hooks/useAtlasCombatThreatTracker.js`

La lógica de contadores y variación de Amenaza se extrajo del hook principal para evitar mezclar progresión, combate y persistencia en un único bloque.

### Interfaz

Archivos principales:

- `src/components/atlas/hub/HubGuild.jsx`
- `src/components/atlas/hub/HubMasteries.jsx`
- `src/components/atlas/MissionJournal.jsx`
- `src/components/atlas/PlayerHub.jsx`

La interfaz incluye contratos, rumores, progreso, reclamación, espacios activos, espacios pasivos, rango, usos, requisitos de evolución y misiones especiales de Amenaza.

### Integración de combate

Archivos:

- `src/lib/createAtlasCombatActions.js`
- `src/lib/atlasSkillStatusHints.js`
- `src/lib/atlasSkills.js`

Las Maestrías activas usan el sistema de combate existente. Su uso se registra únicamente cuando la acción puede ejecutarse. Las pasivas registran dominio mediante victorias mientras están equipadas. Los estados asociados se resuelven con el mismo sistema vigente:

- Golpe Quebrador y Marca del Cazador: Vulnerable.
- Canal Concentrado: Debilitado.
- Pulso de Sobrecarga: Parálisis.

### Guardado v8

Archivo: `src/lib/atlasSave.js`

Se conserva todo el esquema v7 y se añade:

- `progressionState`;
- estado del Gremio y reputación;
- contratos;
- Maestrías aprendidas y equipadas;
- `skillProgress` con rango, usos y fecha de evolución;
- misiones especiales y notificaciones;
- preparación de ascenso de clase y evolución racial.

La migración v7 → v8 es automática e idempotente. El personaje se resincroniza con sus Maestrías al cargar.

## 4. Contenido inicial implementado

### Contratos

- **Prueba de ingreso:** vencer tres enemigos; entrega una técnica activa y una pasiva adaptadas a la clase.
- **Registro de mazmorra:** completar una Dungeon; habilita la primera evolución de dominio.

### Maestrías de clase

- Guerrero: Golpe Quebrador y Postura Protegida.
- Mago: Canal Concentrado y Reserva Arcana.
- Pícaro: Marca del Cazador y Enfoque Afilado.

### Evolución a Rango II

Requiere cinco usos válidos y completar «Registro de mazmorra».

- técnicas activas: coste 4 → 3;
- Postura Protegida: +1 → +2 Defensa física;
- Reserva Arcana: +2 → +4 Energía máxima;
- Enfoque Afilado: +3 % → +5 % crítico.

### Misiones de Amenaza preparadas

- Región 4 Tempestuosa: «El pulso bajo la tormenta».
- Región 5 Ígnea: «La forja que escucha».

Estas definiciones permanecen inactivas mientras las regiones no formen parte del runtime jugable. En Regiones 1–3 existe un bloqueo explícito.

## 5. Protección de composición y canon

Validado:

- ningún archivo de composición regional fue modificado;
- Verde, Ártica y Árida conservan sus mapas y sectores actuales;
- no se añadieron nodos ni rutas a Regiones 4–10;
- el Gremio no altera habilidades ni misiones del prólogo;
- el ascenso de clase y la evolución racial solo quedaron preparados como estados, no entregados prematuramente.

## 6. Validaciones aprobadas

- 299 archivos JS/JSX/MJS sin errores sintácticos.
- 684 imports locales resueltos.
- 14 bloques focales de v2.25.0.
- apertura correcta del Gremio y protección previa a Región 3.
- contratos, progreso, reclamación y no duplicación.
- aprendizaje, sustitución y conservación permanente.
- evolución por uso y contrato.
- aplicación de rangos activos y pasivos al combate/personaje.
- bloqueo de eventos de Amenaza en Regiones 1–3.
- activación única y persistente desde Región 4.
- migración v7 → v8 e idempotencia.
- escritura, respaldo y restauración de ranuras.
- cadena acumulativa completa desde v2.24.0 hasta todas las validaciones históricas de combate, Dungeon, herrería, reliquias, mapas, portales, UI, arte, audio y balance.
- `useAtlasSession.js` permanece por debajo del límite histórico de 2.350 líneas: 2.347 líneas.
- 0 fallos en `npm run validate:v2-25-0`.

Registro completo: `VALIDACION_ATLAS_V2_25_0.txt`.

## 7. Archivos cambiados

Antes de añadir los documentos de entrega:

- 15 archivos existentes modificados;
- 6 archivos funcionales nuevos;
- 0 archivos eliminados.

Los validadores históricos solo se ajustaron para aceptar versiones de guardado posteriores y localizar la memoización extraída. No se eliminaron controles funcionales.

## 8. Puertas no certificadas en este entorno

El ZIP no contiene `node_modules`, por lo que:

- `npm run build` no puede ejecutarse: `vite: not found`;
- `npm run lint` no puede ejecutarse: `eslint: not found`;
- `npm run typecheck` encuentra dependencias/tipos ausentes y errores históricos ya presentes en la base.

Esto no se presenta como compilación aprobada. La compilación real debe ejecutarse en el entorno habitual del proyecto.

## 9. Verificación requerida

```bash
npm ci
npm run build
npm run validate:v2-25-0
```

Prueba manual recomendada:

1. cargar una partida v2.24.0 y volver a guardar;
2. confirmar que el Gremio permanece bloqueado antes de finalizar Región 3;
3. completar o cargar una partida con Región 3 liberada;
4. aceptar «Prueba de ingreso», vencer tres enemigos y reclamar;
5. equipar la técnica y la pasiva recibidas;
6. aceptar y completar «Registro de mazmorra»;
7. usar la técnica cinco veces y ganar cinco combates con la pasiva equipada;
8. evolucionar ambas a Rango II;
9. guardar, cerrar y recargar, verificando rangos, usos y equipamiento;
10. comprobar que los tres mapas visibles siguen idénticos.

Después de esta aprobación corresponde el Lote 3: cámara, visibilidad y combate visual de Dungeon con animaciones compartidas.
