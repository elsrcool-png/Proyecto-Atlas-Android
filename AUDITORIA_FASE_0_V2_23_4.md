# Proyecto Atlas — Auditoría Fase 0 v2.23.4

## Base auditada

- Archivo: `ProyectoAtlas_Visual_v2_23_3_Herreria_Reliquia_Balance.zip`
- Entradas ZIP: 1.557
- Integridad ZIP: correcta
- SHA-256 de entrada: `ccfbd76464b4fc3163e14e6ba0bf1569912974f418ad73d59f731fd992f49be9`
- Versión fuente: 2.23.3

## Hallazgo crítico confirmado

`resolveSkillHit` devolvía dos propiedades llamadas `crit` dentro del mismo objeto. La probabilidad numérica sobrescribía el resultado booleano. En los consumidores de Dungeon, cualquier probabilidad positiva podía interpretarse como impacto crítico aunque la tirada interna no lo fuera.

## Corrección aplicada

- `crit`: resultado booleano del golpe.
- `critChance`: probabilidad interna normalizada.
- Sin cambios en daño, precisión, balance, cámara, animaciones o guardado.
- Versión elevada a 2.23.4.

## Validación ejecutada

- 292 archivos JS/JSX/MJS sin errores sintácticos.
- 661 imports locales resueltos.
- 5 grupos nuevos de regresión v2.23.4 aprobados.
- Cadena acumulativa completa desde v2.23.3 hasta validaciones históricas aprobada.
- Escaneo AST de claves estáticas duplicadas: 0 hallazgos tras la corrección.

## Compilación

No certificada en este entorno. `npm install` y `npm ci` no pueden completar porque el registro npm disponible no contiene varias dependencias declaradas por el proyecto. Fallos confirmados:

- `zwitch@2.0.4`
- `@base44/sdk@^0.8.39`
- `@eslint/js@^9.19.0`
- `@hello-pangea/dnd@^17.0.0`

Este bloqueo pertenece al entorno de auditoría, no demuestra un fallo del repositorio. La Fase 0 queda en estado **fuente validada, bundle pendiente**. No debe iniciarse la Fase 1 hasta ejecutar `npm ci`, `npm run build` y una prueba de arranque en un entorno con acceso completo a npm/Base44.

## Puerta pendiente de Fase 0

1. `npm ci`
2. `npm run build`
3. `npm run validate:v2-23-4`
4. Arranque local o APK de prueba
5. Verificar golpe normal, crítico y fallo dentro de Dungeon

Solo después de aprobar estos cinco puntos se continúa con el registro genérico de regiones y la migración de guardado.
