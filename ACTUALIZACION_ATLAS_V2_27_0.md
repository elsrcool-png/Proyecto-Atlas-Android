# ACTUALIZACIÓN PROYECTO ATLAS v2.27.0

## Lote 4: correcciones de Dungeon e integración segura de Región Árida

Base acumulativa: v2.26.0  
Esquema de guardado: v8, sin cambios  
Composición de mapas: sin modificaciones

## Correcciones de Dungeon

1. El indicador de orientación dejó de ser una flecha superpuesta. Ahora es un aro direccional alrededor del personaje, con una punta ubicada en su perímetro.
2. La mochila puede abrirse dentro de Dungeon mediante el botón del HUD y la tecla `I`. Mientras está abierta se pausa el control de movimiento y acciones.
3. Las escaleras o salida final solo se muestran cuando su casilla ha sido explorada.
4. Los enemigos normales mantienen el combate en vivo por turnos dentro de Dungeon. Solo el mini jefe final abre el modo Combate clásico con su interfaz y dados visibles.

## Región Árida

Se integraron únicamente activos que ya estaban preparados para ejecución:

- 9 terrenos maestros, uno por sector A1 a C3.
- 20 NPC maestros.
- 4 direcciones por NPC, 80 sprites WebP en total.
- 16 variantes actuales del juego conectadas al catálogo maestro.
- Respaldo de los 9 terrenos anteriores en `legacy_v27`.
- Catálogo técnico de producción con estado explícito de cada familia de activos.

No se modificaron posiciones, conexiones, rutas, NPC anclados ni composición visual de sectores. Esa composición queda reservada al usuario.

## Activos conservados fuera del runtime

Los siguientes materiales no se activaron porque aún requieren producción o aprobación:

- 31 fuentes individuales de objetos.
- 10 objetos contenidos en láminas agrupadas.
- enemigos regionales definitivos;
- mini jefes de Región Árida;
- modelo y fases de Amon;
- fondos de combate definitivos.

Los objetos requieren separación, transparencia real, escala, anclaje inferior, sombra, colisión y exportación WebP antes de entrar al juego.

## Validación

- 306 archivos JS, JSX y MJS sin errores sintácticos.
- 690 imports locales resueltos.
- 9 bloques focales v2.27.0 aprobados.
- Regresión acumulativa completa aprobada desde las versiones anteriores.
- 80 sprites de NPC con dimensiones 72 x 96 y canal alfa.
- 9 terrenos activos con dimensiones 1024 x 768.

## Compilación

El código fue validado, pero el bundle de Vite no pudo generarse en el entorno de auditoría porque `node_modules` no estaba instalado y el ejecutable `vite` no estaba disponible.

Ejecutar en el entorno habitual:

```bash
npm ci
npm run build
npm run validate:v2-27-0
```
