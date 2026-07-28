# Proyecto Atlas v2.22.5 · Acción A inmediata

Corrección específica para Android después de comprobar que la v2.22.4 todavía podía perder toques breves.

## Causa real

El botón A ejecutaba la interacción en `pointerup`. Algunas WebView Android cancelan ese evento cuando el toque es muy corto, se mueve unos píxeles o coincide con otro dedo sobre el joystick. Por eso una pulsación mantenida funcionaba y un toque normal podía no hacerlo.

## Cambios

- A se ejecuta en `pointerdown`, al primer contacto.
- Ya no depende de soltar el dedo.
- B, correr y otros controles conservan activación en `pointerup`.
- El `click` sintético posterior queda bloqueado durante 650 ms para evitar dos diálogos o dos cofres.
- No se usa `setPointerCapture`.
- Se mantiene compatibilidad multitáctil con joystick + A.

## Validación

```bash
npm run validate:action-a-v2-22-5
npm run validate:v2-22
```
