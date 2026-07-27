# Atlas v2.19.3 — Auditoría e integración de NPC y fondos de combate

## 1. Alcance revisado

Se auditó e integró sobre **Atlas v2.19.2**:

- `Atlas_NPC_Region_Verde_Maestro_v1.0`;
- fondo de combate de Región Verde;
- fondo de combate general de Región Ártica;
- arena especial de Aurel, Último Portador;
- nueva formación visual del nodo de combate.

La integración no sustituye reglas, daño, audio ni transacciones `actionId`. Cambia la capa visual y la conexión de assets.

---

## 2. Auditoría del paquete de NPC

### Contenido comprobado

| Elemento | Resultado |
|---|---:|
| NPC canónicos | 20 |
| Direcciones por NPC | 4 |
| Sprites runtime | 80 |
| Tamaño runtime | 72×96 px |
| Anclaje declarado | `bottom_center` |
| Integración previa | Assets compilados, no conectados al código |

Distribución:

- Campamento Umbral: 8 NPC;
- Pueblo Robledal: 7 NPC;
- Ciudad Verdalia: 5 NPC.

Los 80 archivos runtime fueron contrastados con el inventario SHA-256 del paquete original y coinciden byte por byte.

### Problema encontrado

Atlas utilizaba perfiles procedurales definidos en `atlasGreenNpcSprites.js`. El arte maestro existía, pero ninguna ruta de renderizado resolvía esos archivos.

### Solución aplicada

Se creó:

```text
src/lib/atlasNpcAssetSprites.js
```

Este módulo traduce las variantes narrativas del juego a los identificadores del paquete maestro. `EntitySprite.jsx` ahora:

1. detecta si el NPC tiene arte maestro;
2. elige `down`, `up`, `left` o `right`;
3. conserva la proporción 72:96;
4. usa el sprite procedural solo cuando no existe un asset o falla la carga.

### Alias narrativos

Dos variantes representan NPC ya existentes:

- `verde_dungeon_bren` reutiliza `bren`;
- `verde_roland_vigilante` reutiliza `capitan_roland`.

`verde_vera_hunter` no existe en el paquete entregado. Se mantuvo su diseño procedural para no reemplazarla por otra persona visualmente incorrecta.

Los aldeanos ambientales genéricos también continúan siendo procedurales. El paquete entregado corresponde a los NPC nombrados, no a la población genérica.

### Optimización

Solo se instalaron en `public/` los sprites runtime. Los masters 512×512 no se duplicaron dentro del juego.

Peso añadido al runtime:

- NPC: aproximadamente 0,64 MB;
- fondos de combate: aproximadamente 0,76 MB.

Los manifiestos, inventario y referencias originales se conservaron en `docs/` para trazabilidad.

---

## 3. Auditoría de los fondos de combate

### Hallazgo principal

Las imágenes entregadas son **láminas de dirección artística anotadas**, no fondos runtime. Contienen títulos, flechas, zonas punteadas, textos y paletas.

Usarlas directamente habría mostrado toda esa documentación durante el combate.

### Solución aplicada

Se archivaron las láminas originales y se generaron derivados limpios en 1280×720:

```text
public/assets/atlas/combat/backgrounds/v1/
├── region_verde_bosque.webp
├── region_artica_tundra.webp
└── region_artica_aurel.webp
```

Referencias originales:

```text
docs/combate-fondos-maestro-v1/referencias/
```

La arena de Aurel combina el horizonte y arquitectura aprobados con el terreno limpio de `terrain_c3`, evitando que las guías punteadas de la lámina entren al juego.

### Selección de escena

Se creó:

```text
src/lib/atlasCombatScenes.js
```

Reglas:

- Región Verde: bosque maestro;
- Región Ártica, combate común: tundra glacial;
- Aurel (`aurel_portador` o `aurel_ultimo_portador`): arena de jefe;
- regiones aún sin fondo maestro: conservan el escenario procedural anterior.

No se entregó un fondo separado para el Guardián Verde. Por eso el jefe verde usa el fondo general de bosque, sin inventar una arena no aprobada.

---

## 4. Cambio de formación del combate

### Conflicto detectado

Atlas v2.19.2 tenía:

```text
Jugador izquierda → mira derecha
Enemigo derecha → mira izquierda
```

Las nuevas láminas definen:

```text
Enemigo izquierda → mira derecha
Jugador derecha → mira izquierda
```

Cambiar únicamente el fondo habría dejado personajes de espaldas, avances invertidos y hechizos viajando al revés.

### Integración ejecutada

Se actualizaron de forma coordinada:

- orden visual de fichas y barras;
- orientación canónica de ambos bandos;
- medición de distancia cuerpo a cuerpo;
- dirección de avance;
- dirección de retroceso;
- origen y objetivo de los VFX;
- posiciones de respaldo de números flotantes;
- posición de información de habilidad enemiga.

La regla actual queda fija:

- enemigo a la izquierda, mirando a la derecha;
- jugador a la derecha, mirando a la izquierda.

`atlasCombatFacing.js` sigue corrigiendo los archivos `left/right` mal exportados. Solo cambió la dirección deseada de cada bando.

---

## 5. Capas visuales del nodo de combate

Orden final de renderizado:

1. fondo maestro 1280×720;
2. gradiente de contraste para legibilidad;
3. barras y estados;
4. sombras de contacto;
5. enemigo y jugador;
6. trayectorias y VFX;
7. números de daño;
8. banners y acciones.

Los props procedurales anteriores se desactivan cuando existe un fondo maestro. Así no aparecen árboles, cristales o rocas aleatorios encima de la composición aprobada.

Los ataques siguen usando los anclajes reales implementados en v2.19.2. La inversión de lados no devuelve el problema de proyectiles flotantes.

---

## 6. Archivos principales

### Nuevos

- `src/lib/atlasNpcAssetSprites.js`
- `src/lib/atlasCombatScenes.js`
- `scripts/validate-visual-integration-v2-19-3.mjs`
- `public/assets/atlas/npcs/region_verde/maestro_v1/runtime/`
- `public/assets/atlas/combat/backgrounds/v1/`

### Modificados

- `src/components/atlas/EntitySprite.jsx`
- `src/components/atlas/CombatView.jsx`
- `scripts/validate-gameplay-fixes-v2-17.mjs`
- `package.json`
- `package-lock.json`

---

## 7. Validación realizada

La validación específica v2.19.3 comprueba:

- 20 NPC canónicos;
- 80 sprites y cuatro direcciones;
- tamaño 72×96;
- hashes contra el inventario original;
- mapeos y alias;
- fallback explícito de Vera;
- tres fondos 1280×720;
- referencias anotadas archivadas;
- escena especial de Aurel;
- formación enemigo izquierda / jugador derecha;
- avance, VFX y flotantes compatibles con la nueva formación;
- ausencia de respaldos temporales dentro del paquete.

También pasó toda la batería histórica desde v2.10.1 hasta v2.19.2.

---

## 8. Limitaciones y siguiente mejora razonable

1. Los fondos runtime son derivados de láminas anotadas. Son utilizables y limpios, pero una futura exportación artística sin anotaciones permitiría conservar todavía más detalle original.
2. Vera la Cazadora necesita un sprite maestro propio para eliminar su fallback procedural.
3. La Región Verde aún no tiene una arena exclusiva para el Guardián.
4. Región Árida conserva el fondo procedural hasta recibir su diseño maestro.
5. Los NPC tienen cuatro poses quietas, no ciclos completos de caminar. Su desplazamiento conserva la animación de balanceo utilizada por Atlas.

Estas limitaciones no bloquean la versión v2.19.3.
