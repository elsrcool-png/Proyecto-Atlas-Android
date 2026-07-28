# Proyecto Atlas v2.22.4 · Interfaz clásica y toque A

Corrección realizada después de probar v2.22.3 en un teléfono Android real.

## Cambios

- La UI v3 deja de activarse por defecto.
- Menú inicial, ranuras, ajustes, selección y combate vuelven a las vistas estables anteriores.
- El Centro de Atlas ya no usa una fila horizontal de pestañas.
- El Centro abre un menú de seis secciones; cada sección ocupa su propia pantalla y tiene botón de regreso.
- La mochila deja de usar pestañas y vuelve a mostrar todo en una única pantalla desplazable.
- Se eliminó el corte interno `max-h-[50vh]` de los accesorios.
- Centro y mochila usan `100dvh`, áreas seguras y adaptación para teléfonos horizontales de poca altura.
- El botón A se activa al soltar un toque breve. Ya no utiliza `preventDefault` ni `setPointerCapture` sobre el botón circular.
- Se conserva la compatibilidad multitáctil mediante `pointerId` independiente.

## Validación

```cmd
npm run validate:v2-22
```

La validación completa de Atlas v2.22 se ejecutó correctamente.
