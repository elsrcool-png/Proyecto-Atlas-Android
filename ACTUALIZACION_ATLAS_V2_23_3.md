# Proyecto Atlas Visual v2.23.3

## Herrería, reliquias y balance regional

Versión correctiva construida sobre Atlas v2.23.2. Conserva la tabla universal de combate y la regla canónica de fallo crítico para dados compuestos.

## 1. Herrería conectada

### Causa confirmada

`BlacksmithModal` esperaba tres acciones, pero `Game.jsx` no las incluía en el objeto enviado a `ExploreMode`:

- `forgeEquipment`
- `upgradeEquipment`
- `equipSmithEquipment`

Los botones se renderizaban correctamente, pero sus callbacks llegaban como `undefined`, por eso pulsarlos no alteraba la partida.

### Corrección

- Las tres acciones se transmiten desde la sesión hasta el modal.
- Se validó una forja real de arma regional.
- Se validó una mejora real del arma forjada.
- Se validó una forja y mejora real de armadura.
- Oro y todos los materiales de la receta se descuentan mediante la misma cotización mostrada en pantalla.
- El modal avisa si alguna futura regresión vuelve a romper la conexión.

## 2. Reliquia de la Región Ártica

- Al derrotar a Aurel se registra `Fragmento del Núcleo Ártico` en `player.relics.fria`.
- La mochila muestra nombre, estado, forma, descripción y origen.
- Las partidas anteriores se reparan al cargar si Aurel ya figura derrotado.
- La migración también reconoce el indicador `fria:boss_defeated` aunque el guardado antiguo no conserve correctamente la lista de jefes.
- Se preparó la misma ruta para la reliquia de la Región Árida.

## 3. Balance regional de enemigos

El nivel ya no es la única fuente de dificultad. El enemigo final se construye con:

1. Estadísticas propias de la criatura.
2. Escalado de nivel y sector.
3. Perfil base de la región.
4. Rol normal, élite o jefe.
5. Estadísticas efectivas del jugador, incluido su equipo.
6. Habilidades y equipamiento regional del enemigo.

El anclaje al jugador nunca reduce las estadísticas regionales ya alcanzadas.

### Identidad por región

- **Región Verde:** introducción y progresión moderada.
- **Región Ártica:** mayor vida, ataque y defensa; al menos una habilidad de hielo; enemigos humanoides pueden portar equipo boreal.
- **Región Árida:** presión superior de vida, ataque y defensa; al menos dos habilidades regionales; equipamiento de obsidiana o foco solar.

### Muestra de control

Con un personaje nivel 11 de 20 HP, 17 ATK, 13 DEF física y 10 DEF mágica:

| Encuentro de referencia | HP | ATK | DEF física |
|---|---:|---:|---:|
| Enemigo tardío Verde | 14 | 12 | 7 |
| Enemigo inicial Ártico | 25 | 16 | 12 |
| Enemigo inicial Árido | 35 | 18 | 13 |
| Aurel, jefe Ártico | 113 | 21 | 14 |

Los valores concretos pueden variar según criatura, rol, sector y equipo del jugador.

## 4. Habilidades enemigas

- Los ataques físicos consultan la defensa física.
- Los ataques mágicos consultan la defensa mágica.
- La perforación de defensa se aplica según la habilidad.
- Ártica garantiza habilidades regionales de hielo.
- Árida garantiza combinaciones regionales ofensivas y de estado.
- Los jefes poseen repertorios propios.

La potencia de una habilidad ya no multiplica de forma explosiva el ATK regional. Los factores superiores a 1 añaden una bonificación plana controlada. Esto aumenta el reto sin producir daño absurdo por apilar escalado regional y multiplicador.

También se corrigió un defecto heredado: habilidades defensivas con `damage: 0`, como Escudo de Hielo, ya no producen accidentalmente el daño mínimo de un ataque.

## 5. Interfaz de combate

- El equipamiento regional del enemigo se identifica bajo sus estadísticas.
- La descripción de habilidad enemiga se oculta mientras está abierto el selector de consumibles, evitando la superposición observada en pantalla.

## Validación

- 292 archivos JS, JSX y MJS sin errores sintácticos.
- 661 imports locales resueltos.
- 11 grupos específicos de v2.23.3 aprobados.
- Cadena acumulativa completa desde las validaciones visuales, mapas, HUD, audio, equipamiento, misiones y combate aprobada.
- Forja y mejora ejecutadas mediante pruebas funcionales con estado real simulado.
- Migración de reliquia y balance regional comprobados automáticamente.

## Build

El bundle de Vite no pudo generarse en el entorno de entrega porque no está instalado `node_modules/.bin/vite`. El proyecto fuente sí pasó la validación sintáctica, de imports, funcional específica y acumulativa completa.
