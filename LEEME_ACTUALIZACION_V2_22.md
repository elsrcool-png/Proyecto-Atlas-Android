# Proyecto Atlas v2.22 · Integraciones técnicas completas

Esta versión incorpora sobre Atlas v2.21:

- equipamiento regional progresivo y tiendas por campamento, pueblo y ciudad;
- loot regional independiente de las tiendas;
- espacios de casco y segundo accesorio con sus desbloqueos;
- UI v3 preparada y conectada a los contratos de v2.21;
- sistema modular de personajes con fallback a `maestro_v1`;
- Fase 6: 16 animaciones universales;
- Fase 7: 13 familias y 65 clips de arma;
- Fase 8: catálogo visual para 164 equipamientos;
- migración de guardados preparada;
- validaciones y auditorías históricas conservadas.

## Estado visual

Los recursos modulares definitivos todavía no están incluidos. Por seguridad, el renderer modular y las superficies visuales nuevas permanecen bajo feature flags. Mientras no haya arte válido, Atlas utiliza automáticamente los sprites actuales.

Esto significa que la arquitectura está integrada y lista para recibir los WebP sin rehacer código, pero no se muestran cuerpos modulares incompletos.

## Ejecutar

```cmd
npm ci
npm run validate:v2-22
npm run dev
```

## Compilar

```cmd
npm run build
```

No se incluye `node_modules`.

## Corrección v2.22.4

Esta copia revierte la activación visual de UI v3 y recupera la interfaz estable anterior. El Centro de Atlas usa un menú de secciones en pantallas separadas, la mochila muestra todo en una sola vista desplazable y el botón A responde a un toque breve. Consulta `CORRECCION_V2_22_4_INTERFAZ_CLASICA_TOQUE_A.md`.


## Corrección v2.22.5

El botón A se activa ahora en el primer contacto (`pointerdown`) y no al soltar. Esto corrige los toques rápidos perdidos en Android y mantiene el bloqueo contra ejecuciones dobles. Consulta `CORRECCION_V2_22_5_ACCION_A_INMEDIATA.md`.
