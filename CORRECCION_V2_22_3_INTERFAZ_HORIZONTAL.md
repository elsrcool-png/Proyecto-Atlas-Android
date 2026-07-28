# Proyecto Atlas v2.22.3 · Interfaz horizontal y pestañas reales

Corrección directa sobre v2.22.2.

## Problemas corregidos

- El menú de inicio vuelve a responder en Android WebView.
- La UI v3 queda activa con entrada táctil compatible.
- El Centro de Atlas ya no apila resumen, pestañas y contenido en horizontal.
- En teléfonos horizontales usa navegación lateral y un único panel de contenido.
- Cambiar de sección reemplaza el panel actual, no añade otra sección debajo.
- La mochila se divide en Consumibles, Campaña y Accesorios.
- Cabeceras y pestañas permanecen visibles; solo se desplaza el contenido activo.
- Se eliminó el corte interno de `50vh` que ocultaba parte de la mochila.
- Los modales, selección de personaje y pausa respetan `100dvh`, áreas seguras y altura baja.

## Validación

```bash
npm ci
npm run validate:ui-v2-22-3
npm run validate:v2-22
npm run build
```
