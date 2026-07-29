# Proyecto Atlas
## Campaña Verde integrada, versión 2

Esta entrega conecta las 15 misiones principales del Reino Verde con los nueve sectores canónicos A1–C3. La historia original se conserva, pero cada misión ahora se ejecuta como una cadena ordenada de objetivos concretos.

## Sistemas añadidos

1. Motor de misiones por pasos en `src/lib/atlasMissionEngine.js`.
2. Campaña Verde reformulada en `src/lib/atlasGreenCampaignV2.js`.
3. Puntos narrativos físicos dentro de los mapas en `src/lib/atlasStoryPoints.js`.
4. Objetivos específicos de conversación, inspección, combate, entrada a sector y jefe.
5. Prerrequisitos narrativos entre las 15 misiones.
6. Desbloqueos de sectores aplicados al aceptar, avanzar o reclamar misiones.
7. Banderas persistentes del mundo para registrar consecuencias.
8. Objetos de campaña y reliquias visibles en la mochila.
9. Diario actualizado con objetivo actual y paso de progreso.
10. NPC actualizados con razones claras cuando una misión todavía está bloqueada.
11. Guardado versión 3 con migración desde versiones 1 y 2.
12. Enemigos identificados por sector para evitar colisiones de guardado entre mapas.
13. Reubicación automática de puntos narrativos si una decoración o cuerpo de agua bloquea su posición.
14. El Guardián Verde ya no entrega el accesorio legendario antiguo al caer. La recompensa narrativa se obtiene al liberar el espíritu y reclamar la Misión 15.
15. El viaje a la Región Árctica exige derrotar al Guardián y completar la liberación espiritual.

## Secuencia de desbloqueo del Reino Verde

- Inicio: A2, Campamento del Umbral.
- Misión 3 aceptada: A1, Laguna de los Susurros.
- Misión 4 completada: B1, Ruinas del Vigía.
- Misión 6 completada: C1, Guarida del Cazador Marchito.
- Misión 7, pista de la torre: C2, Pueblo de Robledal.
- Misión 9 completada: B2, Ciudad de Verdalia.
- Misión 11 aceptada: A3, Bosque de las Raíces.
- Misión 12, carbón recuperado: B3, Paso del Río Antiguo.
- Misión 14, tercer nodo purificado: C3, Santuario del Corazón Verde.

## Alcance real de esta versión

La campaña, sus pasos, objetos narrativos, bloqueos y consecuencias lógicas están integrados.

Todavía no están terminados:

- compañero autónomo real;
- combate táctico dentro del mapa;
- escenas cinematográficas completas;
- transformación visual total del Reino Verde tras el jefe;
- economía avanzada y forja visual de reliquias;
- campañas reformuladas de las regiones Árctica y Árida.

Las Misiones 5, 6 y 14 ya dejan las banderas y puntos de integración necesarios para esas capas posteriores, pero no fingen que dichos sistemas estén completos.
