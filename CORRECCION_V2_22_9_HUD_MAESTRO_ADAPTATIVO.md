# Proyecto Atlas v2.22.9 — HUD Maestro Adaptativo

## Objetivo

Reemplazar la barra superior saturada por una interfaz móvil capaz de reorganizarse de forma real en vertical y horizontal.

## Integración

- Cabecera adaptativa con zona, amenaza, misión, vida/energía y dos accesos permanentes.
- Vertical: zona, amenaza y menú en la primera fila; misión y estado en filas propias.
- Horizontal: zona, amenaza, misión y accesos distribuidos en una sola franja compacta.
- Menú rápido lateral con mapas, misiones, Centro de Atlas, personaje, ajustes, tablero y pausa.
- Botón A muestra la acción concreta: Hablar, Abrir, Comprar, Forjar, Viajar, etc.
- Cuando A no está disponible se reduce visualmente y deja de ocupar atención con texto innecesario.
- Perfiles Equilibrado, Limpio, Compacto y Accesible.
- Densidad Adaptativa: vida y energía aparecen al recibir daño, aumentar la amenaza o desplegar detalles.
- Editor del HUD ampliado con visibilidad, escala y opacidad de la cabecera.
- Joystick, A, B y Correr conservan posiciones independientes por orientación.
- Acceso a perfiles desde Ajustes clásicos, Ajustes v3 y Centro de Atlas.
- Migración automática desde ajustes anteriores mediante `layoutVersion: 21`.

## Compatibilidad

- Conserva guardados y ranuras anteriores.
- Conserva fluidez v2.22.7.
- Conserva corrección táctil A v2.22.6.
- Conserva retorno seguro al menú principal v2.22.8.
