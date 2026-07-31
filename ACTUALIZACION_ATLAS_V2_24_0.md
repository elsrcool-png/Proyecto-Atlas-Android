# Proyecto Atlas v2.24.0 — Arquitectura regional fundamental

## Alcance

Este lote prepara el proyecto para las expansiones regionales sin modificar la composición visual de los mapas actuales.

## Integraciones

- Registro estable de las diez regiones, sus números, anillos, manos, Amenaza mínima y aliases históricos.
- Motor genérico de grafos regionales basado en nodos y conexiones explícitas.
- Adaptador de compatibilidad para las Regiones Verde, Ártica y Árida en su cuadrícula canónica 3×3.
- Guardado v7 con IDs estables de región y nodo.
- Separación preparada de `worldState`, `regionStates` y `dailyState`.
- Migración automática, idempotente y retrocompatible desde guardados v6.
- Resolución de carga por ID regional en vez de depender únicamente de `regionIndex`.
- Ranuras de guardado conectadas al registro regional.

## Protección de composición

Las Regiones 4–10 se registran, pero no reciben nodos, rutas, posiciones ni escenas. Su composición queda pendiente de la definición aportada por el usuario.

Las Regiones 1–3 conservan exactamente nueve sectores, sus sectores iniciales y su presentación actual.

## Fuera de alcance

- Gremio y Maestrías.
- Misiones especiales por Amenaza.
- Cámara y transparencia de Dungeon.
- Composición de Regiones 4–10.
- Integración artística final de Región Árida.
