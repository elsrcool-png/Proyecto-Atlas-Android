# PROYECTO ATLAS — Correcciones v3.2

## Objetivo
Rehacer la base v3.1 para corregir tres problemas concretos detectados en prueba real:

1. La siguiente misión no se activaba al terminar la primera misión del campamento.
2. El menú del herrero ocupaba demasiado espacio y era incómodo de cerrar.
3. El modo libre no reflejaba visualmente los mapas dibujados por el usuario.

---

## Cambios implementados

### 1) Encadenamiento de campaña corregido
- Al reclamar una misión puente de campaña, el sistema ahora acepta automáticamente el siguiente encargo disponible de la línea principal.
- Se asigna como misión prioritaria para evitar que el jugador quede sin guía narrativa.
- Si la misión encadenada comienza con `enter_sector` y el jugador ya está dentro del sector, el paso se registra automáticamente.

Archivo modificado:
- `src/hooks/useAtlasSession.js`

### 2) Herrería rediseñada
- El modal ahora se abre con un ancho más contenido.
- Tiene altura máxima controlada.
- El contenido interno usa scroll vertical.
- Se puede cerrar tocando fuera del panel o con el botón de cierre.

Archivo modificado:
- `src/components/atlas/BlacksmithModal.jsx`

### 3) Terreno del modo libre alineado a los mapas canónicos
- Cada sector del modo libre ahora usa como fondo la porción correspondiente del mapa regional 3x3.
- Se aplica recorte por celda según la posición del sector.
- El terreno procedural sigue existiendo, pero con mucha menos presencia visual, para que no tape el arte base.
- Esto hace que el sector jugable se parezca mucho más al dibujo original enviado.

Archivos modificados:
- `src/lib/atlasCanonicalWorlds.js`
- `src/components/atlas/ExploreMode.jsx`

---

## Resultado esperado
- Tras completar y reclamar la primera misión, la siguiente debe encadenarse sin dejar el flujo muerto.
- El herrero ya no tapa casi toda la pantalla.
- El terreno del modo libre debe verse basado directamente en el mapa dibujado del reino correspondiente.

---

## Build
- `npm run build` ✅
