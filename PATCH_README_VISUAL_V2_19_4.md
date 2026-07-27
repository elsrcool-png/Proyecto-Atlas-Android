# Parche Atlas Visual v2.19.4

## Base obligatoria

Este parche debe aplicarse solamente sobre **Atlas Visual v2.19.3**.

Para una base anterior utiliza el paquete completo v2.19.4. No apiles este parche sobre v2.19.2, v2.19.1 o ramas v2.18.

## Contenido

- Arena exclusiva del Guardián Verde.
- Selección automática del fondo cuando `enemy.id === "guardian_verde"`.
- Lámina anotada archivada como referencia y fondo runtime limpio 1280×720.
- Validador Ogg/Vorbis escrito en Node, sin dependencia de `ffprobe`.
- Mensajes de error de audio precisos.
- Seis loops musicales verificados directamente por muestras Vorbis.

## Validación

```bash
npm run validate:v2-19-4
npm run build
```
