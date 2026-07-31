# PROYECTO ATLAS VISUAL v2.26.0

## Lote 3 — Cámara y combate de Dungeon

Base acumulativa: **v2.25.0**  
Esquema de guardado: **v8, sin cambios**  
Composición de mapas: **sin modificaciones**

### Resultado visible

- Al entrar a una Dungeon se activa una cámara más cercana.
- La orientación de cámara se fija al entrar y no gira con el personaje.
- La misma cámara se mantiene en exploración, combate y mini jefe.
- Las paredes ganan altura visual mediante capas 2.5D.
- Solo los segmentos que bloquean al jugador o al objetivo activo se transparentan.
- Los enemigos alertados fuera de pantalla muestran indicadores de borde.
- Los dados siguen resolviéndose internamente, pero no aparecen.
- Ataques, habilidades, fallos, impactos, críticos y reacciones usan el mismo director temporal del modo Combate.
- El mini jefe ya no abre la pantalla de combate clásico: se enfrenta dentro de la Dungeon.

### Arquitectura

- `DungeonCameraController` funcional mediante perfil y transformaciones limitadas.
- `DungeonWallLayer` para paredes altas y profundidad por Y.
- `atlasDungeonOcclusion` para oclusión selectiva.
- `atlasDungeonCombatAdapter` conectado a `buildCombatSequence`.
- `DungeonCombatActor` para jugador, aliados, enemigos y mini jefe.
- `DungeonOffscreenIndicators` para lectura táctica con campo reducido.
- La ruta heredada `startDungeonBossCombat` fue retirada para impedir dos sistemas paralelos.

### Validación

```bash
npm run validate:v2-26-0
```

El build requiere dependencias instaladas:

```bash
npm ci
npm run build
```
