# Proyecto Atlas v2.23.0 — Plan de implementación y corrección

## Alcance aprobado
Integrar las correcciones de exploración y misiones reportadas, separar los encuentros narrativos de los mobs ambientales, mejorar consumibles y herrería, y aplicar únicamente el nuevo cuadro de daño 1d20 como ajuste global del equilibrio de combate.

## Fase 1 — Bloqueadores de exploración
1. Priorizar el objetivo activo de misión sobre la entrada de dungeon y otras interacciones cercanas.
2. Permitir combate dentro de zona segura solo a enemigos de misión autorizados.
3. Registrar un enemigo del mundo como derrotado únicamente después de ganar.
4. Liberar y rearmar el encuentro al escapar, perder o cerrar un combate sin victoria.

## Fase 2 — Misiones con contexto y progresión visible
1. Las misiones principales se descubren, pero no se aceptan automáticamente.
2. El NPC presenta contexto, objetivo y consecuencias antes de aceptar.
3. Cada avance muestra el nuevo objetivo y actualiza el diario.
4. La siguiente misión queda disponible en su NPC después de cobrar la anterior, sin encadenarse sola.
5. Los puntos narrativos devuelven una descripción y no solo una marca de coordenadas.

## Fase 3 — Enemigos de misión y eventos fijos
1. Todo objetivo de eliminación usa enemigos con identificadores propios de misión.
2. Los enemigos narrativos no dependen del respawn diario ni de haber dormido.
3. Los grupos aparecen juntos, persiguen al jugador y se resuelven uno por uno mediante el combate actual.
4. Ártica y Árida conservan habilidades regionales ya existentes. No se añade un escalado global adicional porque el ajuste de equilibrio elegido es el nuevo cuadro 1d20.
5. El combate simultáneo 2 contra 1 o 3 contra 1 queda fuera de esta versión para no introducir una segunda reforma de equilibrio sobre la misma entrega.

## Fase 4 — Cuadro de daño 1d20
Los ataques básicos del jugador y de los enemigos usan estas bandas exactas:

| D20 | Daño bruto antes de reducción |
|---|---|
| 1 | Fallo y contraataque |
| 2–3 | ATK − DEF − 3 |
| 4–5 | ATK − DEF − 2 |
| 6–8 | ATK − DEF − 1 |
| 9–12 | ATK − DEF |
| 13–15 | ATK − DEF + 1 |
| 16–17 | ATK − DEF + 2 |
| 18–19 | ATK − DEF + 3 |
| 20 | Crítico: ATK, ignora DEF |

Reglas conservadas:
- Un impacto exitoso mantiene el mínimo canónico de 1 punto de daño.
- Después del daño bruto se aplica el sistema existente de reducción por diferencia de ATK, con máximo de 40 %.
- El contraataque del resultado 1 también usa esa reducción.
- Las habilidades de dados compuestos mantienen su resolución previa. No se reequilibran en esta versión.

## Fase 5 — Consumibles en combate
1. Cambiar «Poción» por «Consumible».
2. Abrir selector con nombre, cantidad, efecto y disponibilidad contextual.
3. Permitir pociones de vida, energía y antídoto.
4. Consumir el turno y ejecutar la respuesta enemiga.
5. Bloquear usos inútiles, como curar vida completa o usar antídoto sin veneno.

## Fase 6 — Herrería y mejoras
1. Cada herrero muestra el catálogo de su región y asentamiento.
2. Los diseños de clase se vinculan a su región de progresión.
3. Mostrar oro y todos los materiales requeridos con cantidades poseídas/necesarias.
4. Centralizar cotización y cobro para impedir diferencias entre lo mostrado y lo descontado.
5. Permitir mejorar armas de clase, armas regionales y de botín, armaduras y cascos hasta +5, limitado por la categoría de la forja.
6. Incluir armas de Región Verde que antes quedaban fuera por usar inventario de instancias.
7. Permitir mejoras de rarezas altas y reliquias restauradas con costes superiores.
8. Migrar guardados antiguos añadiendo mapas de mejora para armadura y casco.

## Fase 7 — Validación y entrega
1. Validar sintaxis e imports del proyecto completo.
2. Ejecutar pruebas específicas de las 20 caras del cuadro de daño y su reducción.
3. Validar eventos de misión estables y recetas de mejora.
4. Ejecutar la batería heredada v2.22 para detectar regresiones.
5. Generar notas, manifiesto, suma SHA-256 y ZIP de Atlas v2.23.0.
