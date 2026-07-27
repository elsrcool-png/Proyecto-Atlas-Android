# Atlas v2.18 — Combate dinámico, Fase 1

## Implementado

- Director temporal central en `src/lib/atlasCombatDirector.js`.
- Calidad visual enlazada a `fallo_critico`, `bajo`, `medio`, `alto` y `critico`.
- Daño total repartido visualmente entre impactos sin alterar el total calculado.
- Perfiles específicos para Corte Múltiple, Estocada Sombría y cadenas reutilizables.
- Corte Múltiple muestra 2, 3 o 4 impactos según la calidad del dado.
- Estocada Sombría muestra 2 o 3 impactos y remate crítico en calidad alta.
- Bola de Fuego separa preparación, viaje, impacto y aplicación del estado.
- Barras y cifras de vida se actualizan al producirse el impacto, no al pulsar el botón.
- Bloqueo de controles durante la secuencia completa y mientras llega el turno enemigo.
- Temporizadores de turno y derrota cancelables para impedir eventos tardíos al salir del combate.
- Golpe final visible antes de iniciar la derrota del enemigo.
- VFX ajustables por cantidad de impactos y calidad.
- Bastonazo corregido como proyectil arcano.
- Movimiento Sísmico usa bastón y canalización mágica.
- Empujón de Viento usa postura mágica estacionaria.

## Compatibilidad

- `atlasSkillDesign.js` continúa como catálogo activo de combate.
- `atlasSkills.js` se conserva porque también contiene equipo, accesorios, estadísticas y constantes de desbloqueo.
- El catálogo antiguo que permanece allí no se conecta a los botones activos.
- No se alteraron mapas, mobs, misiones, portales, progresión ni formato de guardado.
- Los validadores de personajes, mobs, Región Ártica, Región Verde, portales, orientación horizontal y balance permanecen compatibles con v2.18.

## Alcance real de esta fase

Las invocaciones, clones, tormentas persistentes, tornado por turnos y Venganza acumulativa continúan usando su resolución mecánica simplificada. Ya poseen secuencia visual compatible, pero su lógica completa corresponde a la Fase 2.

## Archivos principales

- `src/lib/atlasCombatDirector.js`
- `src/lib/atlasAbilityAnimations.js`
- `src/components/atlas/CombatView.jsx`
- `src/components/atlas/CombatVfx.jsx`
- `src/hooks/useAtlasSession.js`
- `scripts/validate-combat-dynamic-v2-18.mjs`
