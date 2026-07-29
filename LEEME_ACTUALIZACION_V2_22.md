# Proyecto Atlas v2.22 · Integraciones técnicas completas

Esta versión incorpora sobre Atlas v2.21:

- equipamiento regional progresivo y tiendas por campamento, pueblo y ciudad;
- loot regional independiente de las tiendas;
- espacios de casco y segundo accesorio con sus desbloqueos;
- UI v3 preparada y conectada a los contratos de v2.21;
- sistema modular de personajes con fallback a `maestro_v1`;
- Fase 6: 16 animaciones universales;
- Fase 7: 13 familias y 65 clips de arma;
- Fase 8: catálogo visual para 164 equipamientos;
- migración de guardados preparada;
- validaciones y auditorías históricas conservadas.

## Estado visual

Los recursos modulares definitivos todavía no están incluidos. Por seguridad, el renderer modular y las superficies visuales nuevas permanecen bajo feature flags. Mientras no haya arte válido, Atlas utiliza automáticamente los sprites actuales.

Esto significa que la arquitectura está integrada y lista para recibir los WebP sin rehacer código, pero no se muestran cuerpos modulares incompletos.

## Ejecutar

```cmd
npm ci
npm run validate:v2-22
npm run dev
```

## Compilar

```cmd
npm run build
```

No se incluye `node_modules`.

## Corrección v2.22.4

Esta copia revierte la activación visual de UI v3 y recupera la interfaz estable anterior. El Centro de Atlas usa un menú de secciones en pantallas separadas, la mochila muestra todo en una sola vista desplazable y el botón A responde a un toque breve. Consulta `CORRECCION_V2_22_4_INTERFAZ_CLASICA_TOQUE_A.md`.


## Corrección v2.22.5

El botón A se activa ahora en el primer contacto (`pointerdown`) y no al soltar. Esto corrige los toques rápidos perdidos en Android y mantiene el bloqueo contra ejecuciones dobles. Consulta `CORRECCION_V2_22_5_ACCION_A_INMEDIATA.md`.

## Corrección v2.22.7 — Fluidez Fase 0 + Fase 1

- Simulación de movimiento a paso fijo de 60 Hz e independiente de FPS.
- Cámara estabilizada mediante interpolación temporal.
- IA a 20 Hz, proximidad a 15 Hz y navegación a 6 Hz.
- RAF suspendido en pausa, combate y aplicación oculta.
- Joystick sin transición durante el arrastre y sin lectura de layout por cada movimiento.
- Imágenes del mundo con decodificación asíncrona y carga diferida no crítica.
- Optimización móvil de filtros y sombras conectada al selector real de Región Verde.
- Conserva la corrección del botón A de v2.22.6.

La reducción física de los assets maestros corresponde a la Fase 2 y no forma parte de esta versión.

## Corrección v2.22.8 — HUD táctil personalizable y menú principal

- Corregida la regla CSS horizontal que anulaba la posición guardada del joystick.
- Joystick, A, B y Correr se pueden mover, escalar y ajustar en opacidad.
- Perfiles separados para vertical y horizontal.
- Editor disponible desde Ajustes y desde Pausa.
- Pausa permite guardar y volver al menú principal sin borrar la ranura.

## Actualización v2.22.9 — HUD Maestro Adaptativo

- Composiciones independientes para vertical y horizontal.
- Cabecera compacta con zona, amenaza, misión y estado dinámico.
- Menú rápido lateral en lugar de seis botones permanentes.
- Acción A con etiqueta contextual.
- Perfiles Equilibrado, Limpio, Compacto y Accesible.
- Editor ampliado para controles y cabecera.
- Migración automática de ajustes anteriores.

Consulta `ACTUALIZACION_V2_22_9_HUD_MAESTRO_ADAPTATIVO.md` para el detalle técnico.
