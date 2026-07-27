# Atlas Visual v2.10 — A2 Campamento del Umbral aprobado

Base requerida: **Proyecto Atlas Visual v2.9**.

## Incluido

- `terrain_a2.webp` conectado como suelo de A2.
- 25 assets reemplazados por los archivos aprobados:
  - 9 naturaleza (incluye una tercera orientación de pino derivada del pino aprobado 02).
  - puente, portal, torre y herrería.
  - 4 carpas.
  - hoguera, caja, barril, cerca y leña.
  - 3 señales.
- Portal compuesto antiguo sustituido por `sanctuary_portal_clean.webp`.
- Torre compuesta antigua sustituida por `watchtower_complete.webp`.
- Dos segmentos de cerca visibles añadidos al campamento.
- Colisiones, NPC, enemigos, misiones y salidas preservados.
- Registro oficial de los 39 objetos verdes en `docs/REGISTRO_39_OBJETOS_REGION_VERDE_V2_10.json`.

## Aplicación

Descomprimir directamente en la raíz de la v2.9 y aceptar reemplazos.

```bash
node scripts/validate-visual-v2-10-a2.mjs
npm run build
npm run dev -- --host 0.0.0.0 --force
```

## Alcance exacto

Este parche actualiza visualmente A2 y registra los 39 objetos de Región Verde.
Los 14 assets de ruinas, Verdalia y Robledal que no fueron reemplazados en este paquete
se conservan desde v2.9, donde ya existen bajo sus rutas actuales.
