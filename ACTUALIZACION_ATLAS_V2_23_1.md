> **Documento histórico corregido por v2.23.2:** la suma mínima no define el fallo crítico de dados compuestos. El fallo ocurre cuando la mitad o más de los dados individuales muestran 1.

# Proyecto Atlas v2.23.1 — Combate universal por suma de dados

## Objetivo

Aplicar la tabla de daño aprobada a todas las acciones ofensivas del combate clásico cuyos dados suman un máximo de 20.

## Tabla canónica

| Total | Daño bruto |
|---:|---|
| 1 | Fallo, 0 daño y contraataque |
| 2–3 | ATK − DEF − 3 |
| 4–5 | ATK − DEF − 2 |
| 6–8 | ATK − DEF − 1 |
| 9–12 | ATK − DEF |
| 13–15 | ATK − DEF + 1 |
| 16–17 | ATK − DEF + 2 |
| 18–19 | ATK − DEF + 3 |
| 20 | Crítico: ATK, ignora DEF |

Después del daño bruto se aplica el sistema de reducción de daño ya establecido. Los impactos válidos conservan un mínimo de 1 de daño.

## Acciones integradas

- Ataque básico: `1d20`.
- Habilidad racial ofensiva: `1d20`.
- Habilidad de clase: Técnica `3d4 + 1d8`.
- Habilidad híbrida: Fuerza `1d12 + 2d4`.
- Habilidad de arma: grupo definido por el arma, normalmente Versátil `2d8 + 1d4`.
- Habilidad definitiva: Versátil `2d8 + 1d4`.
- Ataques y habilidades enemigas, que ya usaban la tabla, se mantienen sin regresiones.

Los grupos Básico, Técnica, Fuerza y Versátil poseen un máximo exacto de 20.

## Modificadores de crítico existentes

Los efectos de habilidades y equipo que antes subían la calidad no fueron eliminados. Ahora desplazan el resultado dentro de la misma tabla universal:

- Bajo pasa a total efectivo 9.
- Medio pasa a total efectivo 16.
- Alto pasa a total efectivo 20.
- Los efectos que fuerzan crítico usan total efectivo 20.

El registro de combate muestra la tirada real y, cuando corresponde, el total efectivo después del modificador.

## Consecuencia matemática de los dados compuestos

La tabla se aplica directamente al total real. Por ello:

- Técnica tiene mínimo 4.
- Fuerza tiene mínimo 3.
- Versátil tiene mínimo 3.

Estas habilidades no pueden obtener naturalmente un total 1. El fallo con contraataque sigue siendo posible en acciones `1d20`, pero no en grupos compuestos salvo que en el futuro se introduzca una regla adicional de fallo.

## Fuera de alcance

El combate táctico de dungeons continúa con su sistema interno sin dados visibles. No fue alterado porque no utiliza los cuatro grupos de dados de máximo 20.
