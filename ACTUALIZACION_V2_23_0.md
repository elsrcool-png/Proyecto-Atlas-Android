# Proyecto Atlas Visual v2.23.0

## Objetivo de la actualización

Esta versión corrige los bloqueadores de exploración y misión reportados, da contexto visible a la progresión narrativa, independiza los enemigos de misión del respawn ambiental, amplía el uso de consumibles en combate y reconstruye la herrería para trabajar con catálogos regionales y mejoras de equipo completas.

El único reajuste global de equilibrio aplicado al combate es el nuevo cuadro exacto de daño 1d20 solicitado. No se añadieron multiplicadores globales nuevos a los mobs ni combate simultáneo múltiple.

## Combate 1d20

| Resultado | Daño bruto |
|---|---|
| 1 | Fallo y contraataque |
| 2–3 | ATK − DEF − 3 |
| 4–5 | ATK − DEF − 2 |
| 6–8 | ATK − DEF − 1 |
| 9–12 | ATK − DEF |
| 13–15 | ATK − DEF +1 |
| 16–17 | ATK − DEF +2 |
| 18–19 | ATK − DEF +3 |
| 20 | Crítico: ATK, ignora DEF |

Después del daño bruto se conserva la reducción existente por diferencia de ATK, con tope de 40 %. El resultado 1 también aplica esa reducción al contraataque. Los impactos exitosos mantienen un mínimo de 1 de daño.

## Correcciones de exploración y misiones

- El objetivo activo de misión tiene prioridad frente a entradas de dungeon cercanas.
- Los enemigos de misión pueden iniciar combate dentro de una zona segura cuando el evento lo autoriza.
- Un enemigo solo queda marcado como derrotado tras una victoria confirmada.
- Escapar o perder rearma el encuentro en lugar de borrarlo.
- Las misiones se descubren sin aceptarse automáticamente.
- Los NPC muestran contexto, consecuencias y objetivo actual antes de la aceptación.
- Al avanzar, el diario informa el nuevo objetivo.
- La siguiente misión se descubre y exige volver a hablar con su NPC.
- Los objetivos de eliminación generan enemigos narrativos propios, con identificadores estables y sin depender de dormir para reaparecer.
- Los grupos narrativos aparecen juntos y persiguen al jugador, pero se combaten uno por uno con el sistema actual.

## Consumibles en combate

- El botón «Poción» pasa a «Consumible».
- Se abre un selector con cantidad, efecto y disponibilidad.
- Se integran pociones de vida, pociones de energía y antídoto.
- Usar un consumible consume la acción del turno.
- Se bloquean usos inútiles, como curar vida completa o usar antídoto sin veneno.

## Herrería y equipo

- Cada herrero usa un catálogo propio según región y asentamiento.
- La interfaz muestra oro, materiales requeridos y cantidades poseídas.
- La cotización visible y el cobro real usan una única fuente de datos.
- Se pueden mejorar armas de clase, armas regionales y de botín, armaduras y cascos.
- El arma de Región Verde almacenada como instancia entra correctamente a la lista de mejora.
- Las rarezas altas y reliquias restauradas conservan una ruta de mejora con costes superiores.
- Las mejoras llegan hasta +5, limitadas por la capacidad de la forja.
- Los guardados antiguos migran a la versión 6 y reciben mapas de mejora para armas, armaduras y cascos.

## Límites deliberados de esta entrega

- No hay combate simultáneo real 2 contra 1 o 3 contra 1.
- No se agregó un nuevo escalado global de estadísticas de enemigos.
- No se reequilibraron las habilidades de dados compuestos.
- El proyecto se entrega como fuente actualizada. El build de Vite no pudo ejecutarse en el entorno de integración porque el registro de paquetes disponible no contiene `zwitch@2.0.4`.
