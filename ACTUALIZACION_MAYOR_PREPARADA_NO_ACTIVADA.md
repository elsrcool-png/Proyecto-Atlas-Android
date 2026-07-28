# Proyecto Atlas v2.21 · actualización mayor preparada · no activada

Esta copia contiene la infraestructura ensamblada para:

- sistema modular de personajes;
- UI v3;
- 16 animaciones universales;
- 13 familias y 65 clips de arma;
- catálogo visual de 164 equipamientos;
- migración segura de guardado v5;
- fallback completo a `maestro_v1`.

## Estado de activación

Todos los feature flags visuales están apagados. El juego debe conservar su presentación heredada hasta que los WebP modulares estén producidos, calibrados y validados.

## Validación

```cmd
npm run validate:prepared-v2-21
```

## Build

Instalar dependencias antes de compilar:

```cmd
npm ci
npm run build
```

Esta copia no incluye `node_modules`.
