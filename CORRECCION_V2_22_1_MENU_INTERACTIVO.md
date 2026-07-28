# Proyecto Atlas v2.22.1 · Corrección del menú interactivo

## Problema encontrado

La v2.22 conectó directamente las superficies UI v3 desde `Game.jsx`, aunque el contrato de integración las declaraba desactivadas por defecto. Además, `AtlasPressButton` cancelaba el gesto nativo en `pointerdown` para todos los botones. Esa combinación podía dejar sin click final a los botones del menú en Android/WebView.

## Correcciones

- El menú, las ranuras, selección de personaje, ajustes y combate vuelven a respetar `uiV3.enabled`.
- Con el interruptor desactivado se usan los componentes estables anteriores.
- Los botones comunes usan click nativo compatible.
- Solo los controles de acción que necesitan multitáctil ejecutan en `pointerdown`.
- Las capas decorativas del menú UI v3 ya no pueden interceptar pulsaciones.
- Se añadió `npm run validate:menu-v2-22-1`.

## Activación futura de UI v3

Cuando se quiera probar deliberadamente:

```js
globalThis.__ATLAS_INTEGRATION_FLAGS__ = {
  uiV3: { enabled: true }
};
```

Sin esa activación, Atlas utiliza el flujo estable.
