# Proyecto Atlas v2.21 · Equipamiento regional progresivo

## Objetivo

La versión 2.21 reemplaza el inventario regional compartido por una progresión completa de equipamiento. Cada región y cada asentamiento tiene catálogo propio, mientras que el botín de enemigos se mantiene como una ruta independiente.

## Progresión por región

| Región | Rango de nivel | Campamento | Pueblo | Ciudad |
|---|---:|---:|---:|---:|
| Verde | 1–8 | 1 | 4 | 7 |
| Ártica | 9–16 | 9 | 12 | 15 |
| Árida | 17–25 | 17 | 20 | 23 |

El equipo final de una región queda cercano al equipo de entrada de la siguiente, pero las piezas posteriores incorporan identidad regional, mejores combinaciones y nuevos efectos.

## Espacios de equipamiento

| Momento | Espacios disponibles |
|---|---|
| Inicio | Arma, Armadura y Accesorio I |
| Jefe de Región Verde derrotado | Se desbloquea Casco |
| Jefe de Región Ártica derrotado | Se desbloquea Accesorio II |

Los cascos no aparecen en tiendas ni botín de Región Verde. El segundo accesorio no permite duplicar el mismo objeto en ambos espacios.

## Tiendas dinámicas

Cada región contiene inventarios separados para Campamento, Pueblo y Ciudad.

- Cada asentamiento ofrece tres armas, tres armaduras y tres accesorios.
- Desde Región Ártica, cada asentamiento agrega tres cascos.
- Armas, armaduras y cascos comerciales cubren Guerrero, Mago y Pícaro.
- Los niveles y precios aumentan dentro de la región.
- Las armas incompatibles siguen visibles, pero la tienda impide comprarlas para evitar gastos inútiles.
- Las tiendas verdes mantienen sus desbloqueos narrativos existentes.

## Loot de mobs

El loot no reutiliza objetos de las tiendas.

- Mobs comunes: equipo deteriorado y materiales básicos.
- Mobs intermedios y élites: piezas regionales, variantes raras y materiales superiores.
- Tramos de ciudad y jefes: objetos épicos o especiales.
- Los cascos solo entran en el pool después de desbloquear el espacio.
- El tramo de loot se deriva del sector actual: Campamento, Pueblo o Ciudad.

## Catálogo maestro

| Categoría | Cantidad |
|---|---:|
| Armas | 41 |
| Armaduras | 41 |
| Cascos | 24 |
| Accesorios | 43 |
| Armas de clase | 15 |
| **Total** | **164** |

De ese total:

- 99 objetos forman inventarios comerciales únicos.
- 39 objetos pertenecen exclusivamente al loot regional.
- 26 corresponden a equipo inicial, armas de clase, reliquias y piezas heredadas.

## Compatibilidad con partidas guardadas

Al cargar una partida antigua:

- Se crean los nuevos campos de Casco y Accesorio II.
- Los jefes derrotados determinan automáticamente los espacios desbloqueados.
- Se conserva el inventario, oro, estadísticas, misiones y avance regional.
- No se permite mantener el mismo accesorio en ambos espacios.

## Archivos principales

- `src/lib/atlasRegionalEquipment.js`: catálogo regional, tiendas, loot y desbloqueos.
- `src/lib/createAtlasEquipmentActions.js`: equipar, vender y descartar cascos y accesorios.
- `src/lib/atlasLootEngine.js`: resolución de loot regional por tramo.
- `src/lib/atlasEconomyV3.js`: inventarios comerciales por asentamiento.
- `src/hooks/useAtlasSession.js`: integración, migración y recompensas de jefes.
- `docs/ATLAS_EQUIPAMIENTO_MAESTRO_V2_21.csv`: catálogo completo tabular.
- `docs/ATLAS_EQUIPAMIENTO_MAESTRO_V2_21.md`: catálogo completo legible.

## Comandos

```bash
npm run generate:equipment-master
npm run validate:equipment-v2-21
npm run validate:v2-21
```
