# AUDITORÍA LOTE 3 — ATLAS v2.26.0

## 1. Objetivo

Implementar la especificación canónica del modo Dungeon sin alterar la composición de mapas ni crear una segunda biblioteca de animaciones.

## 2. Auditoría previa

La base v2.25.0 presentaba los siguientes puntos:

1. Cámara cenital abierta con escala reducida en móvil.
2. Destello de pantalla completa al activar combate táctico.
3. Paredes planas, sin altura ni tratamiento de oclusión.
4. Animaciones tácticas resueltas por un flujo propio, separado del director temporal del modo Combate.
5. Mini jefe enviado a `CombatView`, lo que reemplazaba cámara y escena.
6. Dados ocultos correctamente en Dungeon, pero sin una garantía arquitectónica explícita.

## 3. Decisiones aplicadas

### 3.1 Cámara única

- Perfil `fixed_close_follow` activo desde la entrada hasta la salida.
- Zoom superior a 1 y seguimiento posicional interpolado.
- Orientación inferida desde la entrada y congelada durante toda la estancia.
- El personaje puede explorar y atacar en cualquier dirección sin rotar la cámara.
- Transformación limitada para no mostrar vacío fuera de la cuadrícula.

### 3.2 Paredes y transparencia

- Se añadió una capa de pared vertical sobre los tiles bloqueantes.
- Profundidad ordenada por coordenada Y.
- Raycast conceptual desde el lado fijo de cámara hacia jugador y objetivo crítico.
- Solo los segmentos intersectados reducen opacidad.
- Transición reversible, sin volver translúcida la sala completa.

### 3.3 Combate compartido

- `atlasDungeonCombatAdapter` invoca directamente `buildCombatSequence`.
- Se conservan catálogo, cantidad de impactos, tiempos, hitstop, calidad, eventos y duración del modo Combate.
- Dungeon adapta únicamente coordenadas, dirección, VFX y oclusión.
- `diceVisible=false`, `diceGroup="hidden"` y `rollTotal=null` quedan forzados en el adaptador.
- Jugador, compañero, mobs y mini jefe consumen la misma secuencia compartida.

### 3.4 Mini jefe

- El mini jefe se integra a la lista táctica de la Dungeon.
- Mantiene estadísticas superiores, etiqueta de jefe y llave cuando corresponde.
- Su derrota entrega recompensa, completa la Dungeon y libera la salida sin abrir `CombatView`.
- Se eliminó la función heredada `startDungeonBossCombat` y sus props asociados.

### 3.5 Accesibilidad y lectura

- Indicadores de borde para enemigos alertados fuera de pantalla.
- Respeto de `prefers-reduced-motion` para cámara, actores y paredes.
- Depuración expone zoom, perfil, objetivo activo y cantidad de oclusores.

## 4. Riesgos auditados

| Riesgo | Mitigación aplicada | Estado |
|---|---|---|
| Cámara cercana muestra vacío | límites de transform por dimensiones del mapa | mitigado |
| Pared oculta al jugador | oclusión selectiva y opacidad configurable | mitigado |
| Toda la sala se transparenta | raycast por segmentos y objetivos críticos | mitigado |
| Doble catálogo de animaciones | adaptador al director compartido | eliminado |
| Mini jefe cambia de escena | combate táctico interno | eliminado |
| Dados se filtran en UI | metadatos forzados a ocultos y sin panel clásico | mitigado |
| Enemigos quedan fuera de lectura | indicadores de borde | mitigado |
| Reaparición de mobs al marcar jefe vencido | estado del jefe aislado mediante ref sin reinicializar el piso | mitigado |
| Mareo o exceso de movimiento | orientación fija y reducción de movimiento | mitigado |

## 5. Validación automática

- 305 archivos JS/JSX/MJS sin errores sintácticos.
- 690 imports locales resueltos.
- 9 bloques focales v2.26.0 aprobados.
- Regresión acumulativa completa desde v2.13 hasta v2.25.0 aprobada.
- Corrección v2.23.4 de críticos preservada.
- Arquitectura regional v2.24.0 preservada.
- Progresión posterior a Región 3 v2.25.0 preservada.
- Composición Verde y Ártica preservada por sus validadores maestros.

## 6. Build

No se certificó el bundle en este entorno porque `node_modules` no está incluido y `vite` no está disponible. La fuente y regresión están validadas. La puerta externa es:

```bash
npm ci
npm run build
npm run validate:v2-26-0
```

## 7. Prueba manual requerida

1. Entrar a una Dungeon y confirmar acercamiento inmediato.
2. Doblar y desplazarse en ocho direcciones: la cámara sigue posición, pero no gira.
3. Caminar junto a paredes frontales: solo las piezas bloqueantes deben transparentarse.
4. Iniciar combate: no debe cambiar cámara ni aparecer un destello de pantalla completa.
5. Ejecutar ataque, habilidad, fallo y crítico: deben reproducirse secuencias completas.
6. Combatir al mini jefe: no debe aparecer `CombatView` ni dados.
7. Vencerlo, recoger llave si existe y comprobar salida liberada.
8. Probar bordes del mapa y confirmar que no se ve vacío.
9. Probar Android horizontal y ajustar zoom/opacidad solo si la lectura del dispositivo lo exige.

## 8. Conclusión

El Lote 3 queda técnicamente integrado y estable por validación automática. La composición de las Dungeons no fue modificada. Los parámetros visuales se mantienen configurables para afinación tras la prueba en dispositivo real.
