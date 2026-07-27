# Atlas Visual v2.4 — Región Verde

## Versión completa

Esta carpeta ya integra la cadena de cambios aprobada hasta Visual v2.4. No es necesario aplicar los parches v2.1, v2.2.1, v2.3 ni v2.3.1 por separado.

### Termux

```bash
npm install
node scripts/validate-green-scenes.mjs
node scripts/validate-consolidated-v2.mjs
node scripts/validate-visual-v2-4.mjs
npm run build
npm run dev -- --host 0.0.0.0
```

Abrir en Chrome:

```text
http://127.0.0.1:5173
```

En cualquier sector Verde, el panel desplegable del HUD debe mostrar:

```text
Visual 2.4 · Región Verde modular activa
```

## Contenido visual

- Humano Guerrero piloto activo.
- Bren activo.
- Pantera Sombría, Lobo Salvaje, Brujo Feral, Asesino Orco, Orco Bruto y Chamán Orco con rutas visuales diferenciadas.
- Guardián Verde con sprite propio.
- Nueve escenas verdes registradas con arquitectura modular.
- A2 usa Pantera Sombría, no Lobo, como enemigo ambiental de prueba.
