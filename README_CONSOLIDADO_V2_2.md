# Proyecto Atlas Consolidado v2.2

Esta build integra:

1. Proyecto Atlas Consolidado v2.
2. Corrección Post-Guardián v2.1:
   - A2, B2 y C2 quedan sin enemigos después del Guardián Verde.
   - C3 instala la futura zona de aventureros.
3. A2 Modular Real v2:
   - terreno conectado;
   - 74 objetos individuales;
   - 66 colisiones precisas;
   - contornos y sombras horneados;
   - renderer optimizado para móvil.

## Termux

```bash
npm install
node scripts/validate-a2-modular-v2.mjs
npm run build
npm run dev -- --host 0.0.0.0
```

Abrir `http://127.0.0.1:5173`.
