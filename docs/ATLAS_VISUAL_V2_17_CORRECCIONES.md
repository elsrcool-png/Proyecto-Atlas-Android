# Proyecto Atlas Visual v2.17

## Auditoría solicitada

Se revisaron cinco puntos reportados en Atlas v2.16:

1. posición y orientación del Elfo Mago en combate;
2. orientación de los nueve personajes y once enemigos;
3. reemplazo efectivo de las skins de mobs;
4. desbloqueo de sectores mediante progreso de misiones;
5. profundidad del personaje al entrar en un portal.

## Hallazgos

### Elfo Mago

Los archivos `left.webp` y `right.webp` eran idénticos. El combate colocaba correctamente al jugador a la izquierda mirando hacia el enemigo, pero el asset derecho del Elfo Mago seguía mirando a la izquierda.

### Mobs

Los 44 sprites runtime existían y sus IDs coincidían con el código. El problema estaba en el flujo de render: el canvas dibujaba primero el respaldo procedural y, bajo determinadas cargas rápidas en Android o al entrar en combate, ese respaldo podía permanecer visible.

### Sectores

La constante de prueba `GREEN_TEST_UNLOCKS` abría A1–C3 al iniciar y también contaminaba guardados reanudados. Además, viajar entre regiones reiniciaba el acceso al conjunto inicial aunque ya existiera progreso narrativo.

### Portales

El objeto visual se ordenaba por la base inferior del sprite, pero la interacción sucede en la plataforma central. Por ello, el jugador quedaba detrás del arco justo al aparecer la opción.

## Correcciones implementadas

- Nuevo asset derecho del Elfo Mago en runtime y maestro.
- Dirección canónica de combate: jugador `right`, enemigo `left`.
- `EntitySprite` prioriza `<img>` para héroes, mobs y jefes maestros, con fallback procedural únicamente ante error real.
- Eliminación del desbloqueo masivo de prueba.
- Nuevo `atlasMissionUnlocks.js` para reconstruir accesos desde el estado real de la campaña.
- Las misiones inactivas no abren automáticamente el sector de su objetivo actual.
- Reanudación y viaje regional recalculan sectores sin perder el avance legítimo.
- Portales verdes ordenados por la plataforma interactiva.
- Marcador del santuario queda debajo del jugador cuando ambos comparten la misma coordenada Y.

## Estado de validación

- 9/9 personajes presentes.
- 11/11 mobs y jefes presentes.
- 44/44 sprites enemigos runtime presentes.
- 72/72 checksums de personajes correctos.
- 88/88 checksums de enemigos correctos.
- Región Verde inicia únicamente con A2.
- Región Ártica inicia con A1 y B1, y f1 abre C1.
- Campañas completas reconstruyen correctamente los nueve sectores de cada región.
- Los validadores de mapas Verde y Ártico, portales, HUD horizontal y balance permanecen correctos.

La instalación de dependencias no pudo finalizar en el entorno de construcción por falta de respuesta del registro npm. Por ello, `npm run build` debe ejecutarse en CMD o Termux. La sintaxis de los 225 archivos JS/JSX y todos los validadores locales fueron comprobados.
