# Atlas Visual v2.5 — NPC de Región Verde

## Objetivo
Cerrar la identidad visual de todos los NPC relevantes de la Región Verde antes de trasladar la misma arquitectura a las regiones Ártica y Árida.

## Cobertura

### Campamento del Umbral
- Capitán Roland
- Bren, herrero piloto aprobado
- Elia, herbolaria
- Cedric, explorador
- Mercader Bryn
- Guardián del refugio
- Aldeano Kael
- Darian, comerciante rescatado

### Pueblo de Robledal
- Alcalde Tomás
- Mercader Aldric
- Posadero Oleg
- Forjador Orin
- Cedric
- Aldeana Ira
- Viajero Inn
- El Cartógrafo

### Ciudad de Verdalia
- Capitán Real
- Mercader Real Senn
- Hostelera Senna
- Herrero Brun
- Guardia Rurik

### Entradas de dungeon
- Bren el Explorador
- Vera la Cazadora
- Roland el Vigilante

### Mundo ambiental
- Viajero verde
- Cazador verde
- Caravanero verde

## Cambios técnicos
- Nuevo renderer procedural `atlasGreenNpcSprites.js`.
- Perfiles individualizados por nombre y oficio.
- Paletas, siluetas, accesorios y equipamiento diferenciados.
- Conexión directa con `CAMPAIGN_NPCS.verde`.
- Guardianes de dungeon con variantes propias.
- NPC ambientales de Región Verde separados de los modelos genéricos.
- El diálogo de NPC muestra ahora su sprite real junto al icono de oficio.
- Bren conserva el sprite piloto previamente aprobado.
- Marcador visible en HUD: `Visual 2.5 · Región Verde completa · NPC propios activos`.

## Rendimiento
Los NPC se dibujan en canvas de 36×48 y no cargan archivos de imagen adicionales. El sistema reutiliza el mismo renderer para mundo libre y diálogos, evitando filtros o sprites pesados por personaje.

## Validación
Ejecutar:

```bash
node scripts/validate-green-scenes.mjs
node scripts/validate-visual-v2-4.mjs
node scripts/validate-visual-v2-5.mjs
npm run lint
npm run build
```
