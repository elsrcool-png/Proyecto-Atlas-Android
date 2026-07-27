# Atlas Visual v2.15.0 · Integración de personajes jugables

## Base

`ProyectoAtlas_Visual_v2_14_RegionArtica_Maestro_Completo(2).zip`

## Integrado

- 9 combinaciones de raza y clase.
- 4 direcciones por personaje.
- 36 sprites runtime de 72×96 px.
- 36 sprites maestros de 288×384 px.
- Transparencia real y anclaje inferior centrado.
- Uso común en selección, mundo libre y combate.
- Precarga desde la creación de personaje.
- Caminata de dos fases por desplazamiento de 1 px.
- Respaldo procedural conservado durante carga o fallo.

## Personajes

- Humano Guerrero, Mago y Pícaro.
- Enano Guerrero, Mago y Pícaro.
- Elfo Guerrero, Mago y Pícaro.

## Sistemas no modificados

- Estadísticas y progresión.
- Habilidades y equipo.
- Mapas Verde y Ártico.
- NPC, mobs y jefes.
- Misiones, portales, guardado y dungeons.

## Validación

- 72/72 checksums correctos.
- 9/9 IDs conectados.
- 36/36 runtime presentes.
- 36/36 maestros presentes.
- Cargador probado con canvas simulado.
- Sintaxis de módulos JavaScript/MJS correcta.
- Importaciones locales resueltas.
- Validadores de Región Ártica, Región Verde, portales, horizontal y balance superados.

La compilación Vite final no pudo ejecutarse en el entorno de empaquetado porque el registro interno de npm respondió HTTP 503 y no fue posible instalar `node_modules`. Debe completarse en Termux con `npm install` y `npm run build`.
