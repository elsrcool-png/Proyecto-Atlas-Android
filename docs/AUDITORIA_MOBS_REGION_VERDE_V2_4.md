# Atlas Visual v2.4 — Auditoría de mobs de la Región Verde

Fecha de consolidación: 21 de julio de 2026

## Resultado de la revisión del código

La fuente principal `src/lib/atlasData.js` registra seis enemigos normales vinculados al bestiario de la Región Verde y un jefe regional:

| ID técnico | Nombre | Tipo | Función visual v2.4 |
|---|---|---|---|
| `pantera_sombria` | Pantera Sombría | Bestia | Felino cuadrúpedo, oscuro y ágil |
| `lobo_salvaje` | Lobo Salvaje | Bestia | Canino cuadrúpedo de manada |
| `brujo_feral` | Brujo Feral | Bestia / humanoide | Hechicero encorvado con energía violeta |
| `asesino_orco` | Asesino Orco | Humanoide | Orco ligero con capucha y dos dagas |
| `orco_bruto` | Orco Bruto | Humanoide | Orco pesado con maza |
| `chaman_orco` | Chamán Orco | Humanoide | Orco mágico con bastón y tótem |
| `guardian_verde` | Guardián Verde | Jefe regional | Guardián de raíces y piedra |

## Inconsistencia encontrada

`src/lib/atlasEnemyAI.js` mantenía una lista Verde diferente a las listas del mundo y los sectores. Incluía `guerrero_esqueletico`, que pertenece al grupo de no muertos, y omitía a `pantera_sombria` y `chaman_orco` en esa selección regional.

La versión v2.4 elimina esa divergencia mediante `src/lib/atlasGreenBestiary.js`, que funciona como fuente canónica compartida por:

- mundo libre;
- generación de sectores;
- encuentros de IA;
- dungeons verdes;
- validadores;
- rutas visuales de sprites.

## Distribución por sector

La distribución busca que cada mapa tenga identidad y evita elegir cualquier criatura de la región sin contexto.

| Sector | Enemigos ambientales |
|---|---|
| A1 | Pantera Sombría, Brujo Feral |
| B1 | Lobo Salvaje, Brujo Feral, Asesino Orco |
| C1 | Pantera Sombría, Asesino Orco, Brujo Feral |
| A2 | Pantera Sombría |
| B2 | Asesino Orco |
| C2 | Orco Bruto, Chamán Orco, Asesino Orco |
| A3 | Pantera Sombría, Lobo Salvaje, Brujo Feral |
| B3 | Orco Bruto, Chamán Orco, Brujo Feral |
| C3 | Sin mobs ambientales; reservado para dungeon, jefe y zona de aventureros |

## Dungeons de Región Verde

| Dungeon | Pool |
|---|---|
| `verde_b1` | Lobo Salvaje, Brujo Feral, Asesino Orco |
| `verde_c1` | Pantera Sombría, Asesino Orco |
| `verde_b3` | Orco Bruto, Chamán Orco, Brujo Feral |
| `verde_c3` | Brujo Feral, Pantera Sombría, Orco Bruto |

## Cambios visuales

Todos los enemigos verdes tienen ahora rutas visuales diferenciadas en `atlasEntitySprites.js`:

- la Pantera y el Lobo usan siluetas cuadrúpedas diferentes;
- el Brujo Feral ya no comparte una apariencia humana genérica;
- los tres orcos se distinguen por cuerpo, equipo y función;
- el Guardián Verde tiene una silueta propia de jefe natural;
- las mismas rutas se usan en el mundo libre y en el combate que consume el renderer de entidades.

## Regla para A2

El Campamento del Umbral usa a `pantera_sombria` como amenaza ambiental de prueba. El Lobo Salvaje continúa existiendo, pero aparece únicamente en los sectores y dungeons donde su pool lo permite.
