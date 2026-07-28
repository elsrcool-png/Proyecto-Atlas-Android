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

## Corrección v2.22.3

Esta copia incorpora la reparación de entrada táctil y la reorganización completa de la interfaz horizontal. El Centro de Atlas y la mochila usan pestañas reales: solo existe un panel activo y el desplazamiento ocurre dentro de ese panel. Consulta `CORRECCION_V2_22_3_INTERFAZ_HORIZONTAL.md`.
