# Atlas Visual v2.19.1

## Estabilización del combate y primera modularización

Fecha: 2026-07-27
Base: Atlas Visual v2.19.0

## Objetivo

Corregir las regresiones introducidas al sincronizar animación, daño y audio, y reducir de forma segura la concentración de responsabilidades en `useAtlasSession.js`.

## Fallos corregidos

### 1. Reinicio de animaciones por render

La secuencia visual dependía de valores mutables como HP, enemigo y `skills`. Durante un mismo ataque esos valores cambiaban y React limpiaba/reiniciaba los temporizadores.

Corrección:

- cada acción recibe un `actionId` monotónico;
- `CombatView` reproduce únicamente cuando cambia ese identificador;
- las dependencias de HP, enemigo y catálogo dejaron de reiniciar la secuencia;
- el audio también deduplica por `actionId`.

### 2. Vida, escudo y números desincronizados

Antes la vista reconstruía estados anteriores a partir de la vida actual. Eso fallaba con escudos, estados y golpes múltiples.

Corrección:

- cada acción guarda snapshots `before` y `after`;
- daño bruto, absorción de escudo y daño real a HP se almacenan por separado;
- barra, cifra flotante, VFX y sonido utilizan el mismo evento temporal.

### 3. Estados sobrescritos por instantáneas antiguas

El daño de Quemadura o Veneno y algunas ganancias de energía podían ser reemplazados por una actualización posterior calculada con datos viejos.

Corrección:

- `playerRef` y `enemyRef` se actualizan inmediatamente;
- el ataque enemigo parte del jugador posterior a las pasivas;
- los estados de inicio de turno generan una instantánea nueva antes de continuar;
- las recuperaciones de energía por pasivas y Canalización se conservan.

### 4. Golpe letal cortado

La derrota podía abrirse antes de terminar la animación del impacto.

Corrección:

- derrota de jugador y enemigo usan temporizadores cancelables;
- el modal y la limpieza ocurren después del cierre visual;
- `clearCombatTimers` cancela turnos y derrotas pendientes al salir o reiniciar.

### 5. Bloqueos incompletos

El teclado podía saltarse el bloqueo global aunque los botones estuvieran desactivados.

Corrección:

- ataque, habilidad y escape por teclado consultan `game.busy`;
- desactivar audio elimina la intro y su bloqueo;
- la intro sonora se suma al bloqueo de combate sin reemplazarlo.

## Primera modularización

`useAtlasSession.js` pasó de aproximadamente 2.684 a 2.308 líneas, una reducción cercana al 14 %.

Se extrajeron:

| Módulo | Responsabilidad |
|---|---|
| `useAtlasCombatRuntime.js` | actionId, temporizadores, resultados y derrotas diferidas |
| `useAtlasCombatPassives.js` | pasivas, estados, defensas, perforación y energía |
| `atlasCombatTransactions.js` | snapshots y resolución de escudo/HP |
| `createAtlasCombatActions.js` | ataque básico, armas, definitivas, habilidades, pociones y cambio de turno |

Esta es una separación funcional. No se movió código solamente para reducir el contador de líneas.

## Arquitectura resultante

```text
useAtlasSession
├── useAtlasCombatRuntime
├── useAtlasCombatPassives
├── createAtlasCombatActions
├── atlasCombatTransactions
├── atlasCombatDirector
├── CombatView
└── useAtlasAudio
```

El motor conserva una única fuente activa de habilidades: `atlasSkillDesign.js`.

## Validación

Se ejecutaron correctamente:

- 35 controles nuevos de estabilidad del combate;
- 22 controles de combate dinámico;
- 32 recursos de audio OGG;
- personajes jugables;
- mobs y jefes;
- Región Verde;
- Región Ártica;
- portales;
- horizontal, HUD y balance;
- análisis sintáctico de 258 archivos JS, JSX y MJS;
- resolución de 113 imports locales, sin rutas faltantes.

## Compilación en este entorno

No se pudo completar `npm ci` porque el servidor de paquetes devolvió HTTP 503 al solicitar `zwitch`. Por esa razón no se afirma que `npm run build` haya sido ejecutado aquí.

La compilación final debe hacerse en Termux o en un equipo con acceso funcional al registro:

```bash
npm install
npm run validate:v2-19-1
npm run build
```

## Deuda técnica restante

`useAtlasSession.js` sigue siendo grande. La siguiente división segura debería seguir este orden:

1. guardado y migración;
2. inventario, tienda y herrería;
3. encuentros y botín;
4. campaña, misiones y desbloqueos;
5. viajes y portales;
6. progresión y recompensas.

No conviene extraer todos esos sistemas en un solo parche. La v2.19.1 estabiliza primero el órgano que estaba sangrando: combate.
