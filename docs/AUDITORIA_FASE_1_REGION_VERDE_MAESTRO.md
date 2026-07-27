# Fase 1 · Auditoría del paquete visual maestro de Región Verde

## Resultado

**Aprobado para integración.**

- 49 archivos de reemplazo directo.
- 9 terrenos, uno para cada sector A1–C3.
- 40 objetos visuales, incluidos los 39 heredados y el arco corrompido nuevo de C3.
- 9 manifiestos de sector.
- 49/49 checksums SHA-256 coincidentes.
- 40/40 objetos en WebP RGBA con transparencia real.
- Ningún archivo duplicado por hash.

## Dimensiones detectadas

- Objetos: 1024×1024 px, RGBA.
- Terrenos 4:3: 1448×1086 px.
- Terrenos cuadrados: 1254×1254 px.

El renderer usa `object-fit: cover` exclusivamente para el terreno, evitando bandas vacías en los cuatro fondos cuadrados sin deformar sus proporciones. Los objetos usan `contain`.

## Regla técnica adoptada

- Anclaje de objetos: punto inferior visible, `968/1024` del lienzo maestro.
- Profundidad: `feet-y`.
- Norte se dibuja primero.
- Sur se dibuja después.
- Terreno, sombras y calcomanías permanecen debajo.
- Puentes permanecen en capa baja para que el jugador camine sobre el tablero.

## Hallazgos corregidos durante la integración

- A1 tenía tres troncos anclados dentro de la laguna declarada.
- A2 tenía dos troncos anclados dentro del río declarado.
- Los cinco anclajes se trasladaron a tierra firme, conservando el número de árboles de cada manifiesto.
- C3 usaba el arco normal; ahora usa `ruin_arch_corrupted_01.webp` antes del jefe.
