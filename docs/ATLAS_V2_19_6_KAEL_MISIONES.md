# Atlas v2.19.6 — Forjador Kael y navegación de misiones

## Causa

El objetivo `pide_forjador` era correcto: Región Ártica, Ciudadela Helada B2, rol `forger`.
El problema estaba en la composición visual de B2. La escena no tenía un anclaje específico para `forger`, por lo que Kael usaba el sexto punto de respaldo, junto al portal inferior. Su sprite y marcador podían quedar tapados por el portal y la casa cercana.

El Diario de Misiones agravaba la confusión al mostrar `NPC: Explorador Boreas`. Boreas es quien entrega la misión, no el objetivo actual.

## Corrección

- Kael: `(770, 585)`, frente a la zona de forja del sector B2.
- Investigadora Lyra: `(565, 520)`.
- Capitán Boreal: `(445, 430)`.
- Diario:
  - `Encargo: Explorador Boreas`.
  - `Destino: Forjador Kael · Ciudadela Helada (B2)`.

La brújula continúa guiando al sector B2 y, una vez dentro, apunta directamente a Kael.
