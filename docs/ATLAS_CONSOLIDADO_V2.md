# Proyecto Atlas · Versión Consolidada v2

Fecha: 20 de julio de 2026

Esta versión parte del proyecto completo reconstruido desde el último `atlas.txt` y de la Región Verde modular v1. Consolida las correcciones funcionales que habían quedado repartidas entre distintos parches.

## Sistemas consolidados

### Viaje, santuarios y guardado
- Validación del mundo destino antes de cambiar región.
- Spawn seguro en santuario y rechazo del viaje si el mapa destino no existe.
- Guardado posterior a una carga regional válida.
- Tres ranuras de partida existentes preservadas.
- Los santuarios restauran HP, energía y Amenaza.

### Dungeons
- Dungeons opcionales bloqueadas hasta derrotar al jefe regional.
- Ruta de campaña `verde:C3` añadida como dungeon obligatoria hacia el Guardián Verde.
- Santuario del Umbral en el piso final: restaura, guarda y abre el combate clásico del jefe.
- Mini-jefes de dungeon resueltos mediante combate clásico.
- Movimiento continuo con joystick fuera del combate táctico.
- El personaje se orienta automáticamente según el movimiento/objetivo.
- Minimapa fijo arriba a la derecha.

### Misiones
- Oleada propia para F13, defensa de la Ciudadela Ártica.
- Cinco enemigos con IDs y etiqueta de misión exclusivos.
- La oleada no depende del respawn ambiental.

### Progresión y balance
- Verde: mobs nivel 1–9 y jefe nivel 10.
- Ártica: mobs nivel 11–19 y jefe nivel 20.
- Árida: mobs nivel 21–29 y jefe nivel 30.
- Ajuste progresivo cada tres niveles del jugador, sin aumentar la experiencia.
- Enemigos normales fortalecidos sin copiar exactamente las estadísticas del jugador.
- A2, B2 y C3 quedan sin mobs después de liberar la Región Verde.

### Habilidades y estados
- Habilidades de arma normalizadas alrededor del daño del ataque básico.
- La utilidad proviene de Sangrado, Quemadura, Vulnerable, Debilitado, Lento o Aturdido.
- Habilidades de clase, híbridas y definitivas aplican estados según su identidad.
- Los estados del enemigo modifican ATK/DEF, hacen daño periódico o cancelan acciones.
- Los estados activos aparecen en la interfaz del combate clásico.

### Equipamiento
- Durabilidad de arma independiente de la condición de armadura.
- Ataque básico: -1 durabilidad.
- Habilidad de arma y definitiva: -2 durabilidad.
- Habilidad de clase/híbrida: -1 durabilidad.
- Penalización progresiva de ATK al deteriorarse el arma.
- El herrero repara arma y protección en una sola operación con coste proporcional.
- Migración de partidas antiguas a 100% o a la condición previa disponible.

### Controles e interfaz
- B abre el menú; ya no se mantiene pulsado para correr.
- Botón de huellas independiente activa/desactiva correr.
- Nombre del sector fijo en la esquina superior izquierda.
- HUD superior reducido y reorganizado.

### Región Verde modular
- Se preservan los nueve sectores modulares, sus colisiones y accesibilidad.
- Los escenarios Ártico y Árido mantienen el renderer anterior como fallback.

## Validaciones realizadas

```text
node scripts/validate-green-scenes.mjs
node scripts/validate-consolidated-v2.mjs
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4179
```

Resultados:
- 9/9 escenas Verdes accesibles y con assets completos.
- Dungeon opcional bloqueada antes del jefe y disponible después.
- Santuario final generado en la ruta al Guardián.
- F13 genera exactamente cinco enemigos exclusivos.
- Jefes regionales 10/20/30.
- 18 habilidades de arma verificadas con potencia táctica máxima 1.05 y estado asociado.
- ESLint correcto.
- Build Vite correcto, 2273 módulos.
- Servidor de preview respondió HTTP 200.

## Advertencias no bloqueantes

- Vite advierte que el bundle principal supera 500 kB.
- `npm run typecheck` conserva errores preexistentes al analizar el JavaScript interno de Three.js. No afectan a `lint`, `build` ni al servidor de producción.
