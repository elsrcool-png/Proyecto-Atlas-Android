# AUDITORÍA LOTE 4 | PROYECTO ATLAS v2.27.0

## 1. Objetivo

Integrar las cuatro correcciones aprobadas para Dungeon junto con la siguiente fase de Región Árida, protegiendo la estabilidad de v2.26.0 y sin alterar la composición de mapas proporcionada o reservada por el usuario.

## 2. Fuentes auditadas

### Base de código

- Proyecto Atlas v2.26.0 Dungeon Cámara y Combate Compartido.
- ZIP íntegro, 1.593 entradas y sin corrupción.
- SHA-256 de la base: `6660d602ee6f0af7e35d4d391feeb4ea3f1cd4865bc37845d706cc85554588e1`.

### Lote artístico Árido

- Atlas Región Árida Lote Maestro Actual v1.0.
- ZIP íntegro, 344 entradas y sin corrupción.
- SHA-256 del lote: `369229d63e04d97460ece4216e5ae6a8160ae767bfc7d33a050ca6f4c7b00430`.

## 3. Resultado de la auditoría previa

### Dungeon

Se confirmaron cuatro diferencias respecto del comportamiento solicitado:

1. El indicador de dirección se superponía al personaje y reducía su lectura.
2. La mochila no estaba accesible desde el modo Dungeon.
3. La salida o escalera podía mostrarse antes de explorar su casilla.
4. El mini jefe había sido trasladado al combate interno de Dungeon, pero el diseño canónico exige que el encuentro final use el modo Combate clásico.

### Región Árida

El lote contiene:

- 9 terrenos base aprobados;
- 20 NPC con cuatro direcciones;
- 31 imágenes individuales de objetos;
- 10 objetos adicionales contenidos en láminas agrupadas.

Los terrenos y NPC estaban en condiciones de convertirse a activos de runtime. Los objetos no podían activarse con seguridad porque todavía requieren limpieza, separación, transparencia, escala, anclajes, sombras, colisiones y exportación final. Los enemigos, mini jefes, Amon y fondos de combate permanecen pendientes.

## 4. Integraciones aplicadas

### 4.1 Aro direccional

Se sustituyó la flecha central por un aro alrededor del personaje. La punta se desplaza sobre el perímetro conforme a la dirección actual, conservando ocho orientaciones y evitando cubrir el sprite.

### 4.2 Mochila dentro de Dungeon

Se añadió acceso desde el HUD de Dungeon y mediante `I`. El modal reutiliza la mochila general del juego. Al abrirla se bloquean movimiento, joystick, interacción y acciones de combate para impedir entradas simultáneas.

### 4.3 Exploración de escaleras

La salida se renderiza únicamente cuando `revealed` contiene la coordenada exacta de la casilla. La lógica de salida no se cambió; solo se corrigió su revelado visual.

### 4.4 Mini jefe en Combate clásico

El mini jefe final fue separado de la lista táctica de enemigos Dungeon. Al aproximarse se inicia el sistema Combate normal, con su interfaz y dados visibles. La Dungeon permanece montada debajo de la capa de combate para conservar posición y estado.

Al derrotarlo:

- se registra la derrota del mini jefe;
- se completa la Dungeon;
- se entregan experiencia, progreso y botín correspondientes;
- no se activan banderas, reliquias ni consecuencias del jefe regional.

Los enemigos comunes continúan dentro de Dungeon, con dados internos ocultos y animaciones compartidas.

### 4.5 Terrenos maestros de Región Árida

Los nueve terrenos maestros reemplazan los fondos activos A1 a C3. Los archivos anteriores se conservaron en `public/assets/atlas/desierto/legacy_v27/terrains` para retroceso.

Se añadió una copia maestra separada de los activos en `public/assets/atlas/desierto/maestro_v1/terrains`.

### 4.6 NPC maestros de Región Árida

Se empaquetaron 20 NPC, cada uno con cuatro direcciones, para un total de 80 archivos WebP de 72 x 96 con transparencia. Dieciséis variantes ya usadas por la campaña actual fueron conectadas al nuevo catálogo maestro.

No se modificó la posición de ningún NPC existente.

### 4.7 Catálogo de producción

Se creó `atlasAridAssetCatalog.js` para registrar:

- terrenos activos y maestros;
- NPC disponibles;
- activos que todavía no son aptos para runtime;
- propiedad de la composición cartográfica;
- pendientes de enemigos, mini jefes, Amon y fondos.

Este catálogo impide que materiales incompletos entren al juego solo por estar presentes en el ZIP.

## 5. Elementos deliberadamente no integrados

- Composición, rutas, conexiones y posiciones de mapas.
- Objetos sin preparación técnica.
- Enemigos no aprobados o sin sprites finales.
- Mini jefes de la región sin producción definitiva.
- Amon y sus fases.
- Fondos de combate pendientes.
- Cambios de balance regional no sustentados por contenido final.

## 6. Riesgos auditados y mitigaciones

| Riesgo | Nivel | Mitigación aplicada |
|---|---:|---|
| El mini jefe activa flags del jefe regional | Alto | Rama específica `dungeonMiniBoss` antes de la resolución regional |
| Doble inicio del combate final | Alto | Referencia de bloqueo y comprobación de combate activo |
| Abrir mochila y mover al mismo tiempo | Alto | Pausa unificada de entradas mientras el modal está abierto |
| Escalera visible bajo niebla | Medio | Render condicionado a la coordenada explorada |
| Aro cubre el personaje | Medio | Punta situada en el perímetro y centro transparente |
| Duplicar activos áridos sin trazabilidad | Medio | Raíces `maestro_v1`, `modular_v27` y respaldo `legacy_v27` |
| Activar objetos incompletos | Alto | Catálogo marca `runtimeReady: false` y no existen referencias activas |
| Alterar composición del usuario | Crítico | No se editaron escenas ni coordenadas de Región Árida |
| Regresión en combate Dungeon normal | Alto | Prueba específica que mantiene enemigos comunes en modo Dungeon |

## 7. Validación automática

### Validación focal v2.27.0

Nueve bloques aprobados:

1. aro direccional;
2. mochila en Dungeon;
3. escaleras por exploración;
4. mini jefe en Combate clásico;
5. enemigos normales en combate Dungeon;
6. nueve terrenos áridos activos;
7. veinte NPC y ochenta direcciones;
8. objetos incompletos fuera del runtime;
9. versión v2.27.0.

### Regresión acumulativa

- 306 archivos JS, JSX y MJS válidos.
- 690 imports locales resueltos.
- Validaciones v2.26.0, v2.25.0, v2.24.0 y cadena histórica aprobadas.
- Esquema de guardado v8 conservado.
- No se activaron Regiones 4 a 10.

## 8. Verificación de activos

- 80 sprites NPC encontrados.
- 80 sprites con dimensiones 72 x 96.
- 80 sprites con canal alfa.
- 9 terrenos maestros activos.
- 9 terrenos con dimensiones 1024 x 768.

## 9. Build

La ejecución de `npm run build` no pudo certificarse en el entorno de auditoría porque el proyecto no incluía `node_modules` y `vite` no estaba disponible.

Esto no se registra como error del código, pero mantiene abierta la puerta de compilación real:

```bash
npm ci
npm run build
npm run validate:v2-27-0
```

## 10. Pruebas manuales requeridas

1. Entrar a Dungeon y confirmar que el aro rodea al personaje sin cubrirlo.
2. Cambiar las ocho direcciones y verificar la punta del aro.
3. Abrir mochila desde el botón y con `I`.
4. Confirmar que el personaje no se mueve con la mochila abierta.
5. Entrar a una Dungeon sin explorar la salida y confirmar que la escalera no aparece.
6. Explorar su casilla y confirmar que aparece.
7. Combatir un enemigo común y confirmar que no abre Combate clásico.
8. Llegar al mini jefe y confirmar que abre Combate normal con dados visibles.
9. Derrotarlo y comprobar que completa la Dungeon sin marcar derrotado al jefe regional.
10. Revisar los nueve terrenos áridos y los NPC conectados sin cambios de posición.
11. Cargar un guardado v8 anterior y volver a guardar.

## 11. Conclusión

El Lote 4 queda estable por validación automática y listo para compilación real. Las correcciones solicitadas fueron aplicadas sin degradar el combate Dungeon normal. Región Árida recibió terrenos y NPC preparados, pero no se forzó contenido incompleto ni se alteró la composición reservada al usuario.
