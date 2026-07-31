# PROYECTO ATLAS — Auditoría Lote 5 / v2.28.0

## Alcance

Corrección y estabilización del modo Dungeon sobre la base v2.27.0 aprobada por el usuario. No se modificó la composición de mapas ni se activó contenido nuevo de Regiones 4–10.

## Evidencia de prueba aportada

Las capturas móviles mostraron: mochila ausente del HUD, cámara demasiado abierta y desplazada al aproximarse a límites, minimapa superpuesto con HP/EN, enemigos que reaparecían inmediatamente, transición del mini jefe con doble pantalla y avisos textuales intrusivos.

## Causas encontradas

1. **Mochila/HUD:** identidad, estado, orientación, mochila, depuración y salida competían en una única fila. En pantallas estrechas los controles se desplazaban fuera del área visible.
2. **Cámara:** usaba un ancla desplazada según la entrada y aplicaba clamp a los bordes del mapa. Al llegar a paredes o extremos dejaba de centrar al jugador.
3. **Respawn:** el efecto de inicialización dependía de callbacks recreados por cambios del jugador. Ganar experiencia, gastar energía o actualizar al compañero podía reconstruir todos los enemigos.
4. **Indicador enemigo:** los enemigos fuera de pantalla usaban tarjetas con flecha y la palabra “ENEMIGO”.
5. **Mini jefe:** `CombatView` se dibujaba como una capa absoluta dentro de DungeonView; la escena de mazmorra seguía renderizándose debajo.
6. **Animaciones:** todos los tipos de acción compartían el mismo desplazamiento de embestida, incluso magia y proyectiles.
7. **Escaleras:** revelar una habitación completa también revelaba la salida, aunque el jugador todavía no estuviera cerca de ella.

## Correcciones aplicadas

- Cámara v2 con zoom aumentado, orientación fija y jugador centrado en todo momento.
- Eliminación del clamp que desplazaba al jugador al acercarse a los límites.
- HUD reorganizado en identidad, vitales, acciones y minimapa integrado.
- Botón de mochila visible, táctil y con acceso `I`; el movimiento queda pausado con la mochila abierta.
- Minimapa responsivo con tamaño calculado, jerarquía clara y salida oculta hasta descubrirla.
- Inicialización de enemigos limitada al cambio real de Dungeon/piso.
- Aro direccional alrededor del jugador para enemigos alertados fuera de pantalla, sin tarjetas ni texto.
- Destello breve de encuentro conservado; eliminado el mensaje “¡Enemigo detectado! Modo táctico activado.”
- Mini jefe clásico en una vista exclusiva `fixed`, sin HUD, minimapa ni mapa Dungeon detrás.
- Animaciones diferenciadas para embestida, acción estacionaria/mágica y proyectiles.
- Salida revelada solo a distancia 2 o menor y con línea de visión.

## Validaciones

- 307 archivos JS/JSX/MJS válidos.
- 691 imports locales resueltos.
- 8 pruebas focales nuevas aprobadas.
- Regresión acumulativa v2.28.0 → v2.13 aprobada.
- La integración de Región Árida v2.27.0 permanece intacta.
- No se modificaron rutas, nodos ni posiciones de mapas.

## Compilación

El bundle de Vite no se ejecutó en este entorno porque el paquete no contiene `node_modules`; `vite` no está instalado. El intento está registrado en `BUILD_ATLAS_V2_28_0.txt`.

## Puerta de aceptación móvil

1. La mochila debe verse y abrirse en Dungeon.
2. El personaje debe permanecer en el centro al caminar por extremos y esquinas.
3. Los enemigos derrotados no deben reaparecer durante el mismo piso.
4. El minimapa no debe cubrir HP/EN ni botones.
5. Los avisos enemigos deben ser puntos direccionales sobre un aro, sin textos.
6. El mini jefe debe mostrar exclusivamente el combate clásico completo.
7. Magia/proyectiles no deben desplazarse como un ataque cuerpo a cuerpo.
