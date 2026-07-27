# Atlas v2.19.4 — Guardián Verde y audio portátil

## 1. Problema recibido

La validación mostraba seis mensajes del tipo:

```text
ffprobe no pudo leer public/assets/audio/...
```

Esto sugería corrupción de los OGG, pero el diagnóstico era incorrecto.

## 2. Diagnóstico del audio

Los seis archivos poseen:

- contenedor Ogg válido;
- códec Vorbis;
- estéreo;
- frecuencia de 44.100 Hz;
- duración exacta de 24 segundos.

El fallo ocurría porque el script ejecutaba el programa externo `ffprobe`. Si Termux no tenía `ffprobe` instalado, `execFileSync` lanzaba un error `ENOENT`. El bloque `catch` convertía cualquier error, incluido “programa inexistente”, en “archivo ilegible”.

Por tanto, el audio no estaba dañado. El diagnóstico era un falso positivo del validador.

## 3. Solución aplicada

Se creó:

```text
scripts/lib/ogg-vorbis-duration.mjs
```

El lector procesa directamente:

1. páginas `OggS`;
2. cabecera de identificación Vorbis;
3. frecuencia de muestreo;
4. posición granular final;
5. duración total por cantidad de muestras.

`validate-audio-green-v2-19.mjs` ya no llama a `ffprobe`. La validación funciona con Node puro en Windows, Linux y Termux.

## 4. Arena del Guardián Verde

La lámina recibida define una arena exclusiva de jefe con:

- ruinas verdes corrompidas;
- raíces invasivas;
- energía esmeralda;
- carril central despejado;
- enemigo a la izquierda;
- jugador a la derecha;
- anclaje inferior compatible con los combatientes.

La lámina anotada se conserva en:

```text
docs/combate-fondos-maestro-v1/referencias/region_verde_guardian_anotada.png
```

El runtime utiliza una derivación limpia 1280×720:

```text
public/assets/atlas/combat/backgrounds/v1/region_verde_guardian.webp
```

La derivación combina la arquitectura y atmósfera del diseño maestro con un suelo limpio de combate, evitando que textos, flechas y recuadros entren al juego.

## 5. Selección de escena

`resolveCombatScene` aplica este orden:

```text
Región Verde + guardian_verde → verde_guardian
Región Verde + otro enemigo  → verde_bosque
Región Ártica + Aurel         → fria_aurel
Región Ártica + otro enemigo  → fria_tundra
```

La condición del jefe se evalúa antes del fondo genérico para impedir que el Guardián reciba el bosque normal.

## 6. Compatibilidad

No se modificaron:

- reglas de daño;
- estadísticas del Guardián;
- IA enemiga;
- orientación de actores;
- anclajes de proyectiles;
- catálogo de música;
- archivos OGG originales.

La actualización es visual y de validación técnica.
