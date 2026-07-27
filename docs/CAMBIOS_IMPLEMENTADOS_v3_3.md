# PROYECTO ATLAS — Mundo manual v3.3

Esta versión rehace la base v3.2 para corregir el flujo de campaña y sustituir la generación estructural de mapas por un mundo diseñado de forma determinista.

## 1. Misión siguiente activada correctamente

La misión introductoria del Campamento del Umbral ahora se completa automáticamente cuando el jugador termina de hablar con Bren, Elia y Cedric.

Después de esa última conversación:

1. La misión `v1` pasa a completada.
2. Se aplican sus recompensas y cambios de mundo.
3. `Primer Encargo` (`v2`) se acepta automáticamente.
4. `v2` se convierte en la misión prioritaria.
5. El objetivo aparece en la brújula y en el mundo.

También se añadió una red de seguridad que inicia la siguiente misión principal disponible cuando no existe otra misión activa.

## 2. Brújula de misión

El modo libre incorpora una brújula visible que muestra:

- dirección del objetivo;
- distancia aproximada;
- descripción del paso actual;
- salida correcta cuando el objetivo está en otro sector;
- NPC de entrega cuando la misión está lista.

La brújula funciona con objetivos de conversación, interacción, entrada de sector, combate, jefe y entrega.

## 3. Objetivos resaltados

El objetivo prioritario se distingue del resto:

- NPC objetivo: aro dorado, icono de navegación y nombre resaltado;
- punto narrativo: haz vertical, pulso y etiqueta dorada;
- enemigo objetivo: aro dorado;
- jefe: señal especial dorada;
- objetivo en otro mapa: la brújula apunta a la salida correspondiente.

## 4. Los 27 mapas dejan de generarse por semilla

Se eliminó del sistema de tablero el antiguo constructor `buildBlockGrid(def, seed)` y la combinación de hash, semilla y aleatoriedad estructural.

El archivo `atlasBlocks.js` ahora usa:

- nodos fijos;
- conexiones fijas;
- posiciones fijas;
- portales fijos;
- asentamientos y jefes asignados explícitamente.

El motor de movimiento, combate, colisiones, interacción y guardado no fue reemplazado.

## 5. Mundo libre reconstruido con objetos reales

`atlasCanonicalWorlds.js` fue reescrito. Cada uno de los 27 sectores posee una composición manual con:

- caminos colocados a mano;
- ríos, lagos, oasis y bahías;
- puentes;
- mesetas, dunas, nieve elevada y acantilados;
- campamentos, pueblos, ciudades, fortalezas y templos;
- ruinas, santuarios, cuevas, torres y barcos;
- bordes de bosque, roca, nieve o cactus;
- posiciones fijas de enemigos, cofres, NPC y fauna;
- colisiones asociadas a objetos y elevaciones.

Los dibujos regionales ya no se usan como una textura gigante debajo del personaje. Sirven como plano de composición para reconstruir el escenario mediante objetos del juego.

## 6. Altura y profundidad

Se añadió `TerrainHeightLayer.jsx`, que representa:

- mesetas elevadas;
- acantilados con cara lateral;
- bancos de nieve;
- dunas;
- ríos y lagos con profundidad visual;
- sombras de altura.

También se añadieron sprites dibujados por canvas para:

- puentes;
- santuarios;
- torres;
- barcos.

## Archivos principales modificados

- `src/hooks/useAtlasSession.js`
- `src/components/atlas/ExploreMode.jsx`
- `src/components/atlas/TerrainHeightLayer.jsx`
- `src/lib/atlasCanonicalWorlds.js`
- `src/lib/atlasBlocks.js`
- `src/lib/atlasStructures.js`

## Comprobaciones

- `npm run lint` ✅
- `npm run build` ✅
- constructor por semilla eliminado de `atlasBlocks.js` ✅
- 27 sectores definidos manualmente ✅
