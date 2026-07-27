# Atlas Visual v2.19.1

Parche de estabilización para Atlas Visual v2.19.0.

## Corrige

- reinicios y duplicados de animación;
- daño, escudo y barras fuera de tiempo;
- estados o energía sobrescritos por snapshots viejos;
- golpes letales cortados;
- entradas de teclado durante bloqueos;
- audio desincronizado en acciones múltiples.

## Modulariza

- runtime y temporizadores;
- pasivas y estados;
- transacciones de combate;
- acciones del jugador.

`useAtlasSession.js` baja de unas 2.684 a unas 2.308 líneas.

## Base requerida

Atlas Visual v2.19.0 consolidado.

## Validar

```bash
npm run validate:v2-19-1
npm run build
```
