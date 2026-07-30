# Proyecto Atlas v2.23.2 — Fallo crítico de dados compuestos

## Corrección crítica

La versión v2.23.1 interpretaba erróneamente que las habilidades de dados compuestos no podían fallar críticamente porque su suma mínima era superior a 1.

La regla canónica queda implementada así:

- Una tirada es **fallo crítico** cuando **la mitad o más de sus dados individuales muestran 1**.
- El umbral se calcula como `ceil(cantidad_de_dados / 2)`.
- El fallo crítico se evalúa **antes** de bonificaciones de crítico, mejoras de banda, perforación o críticos forzados.
- El fallo crítico inflige 0 daño, activa el contraataque y conserva el sistema de reducción de daño establecido.
- Si no hay fallo crítico, la **suma total** continúa entrando en la tabla universal de daño 1–20.

## Umbrales activos

| Grupo | Dados | Umbral de fallo crítico |
|---|---|---:|
| Básico | 1d20 | 1 dado en 1 |
| Técnica | 3d4 + 1d8, 4 dados | 2 dados en 1 |
| Fuerza | 1d12 + 2d4, 3 dados | 2 dados en 1 |
| Versátil | 2d8 + 1d4, 3 dados | 2 dados en 1 |

Ejemplos:

- Técnica `[1, 1, 4, 8]`: fallo crítico, aunque la suma sea 14.
- Técnica `[1, 2, 2, 2]`: no es fallo crítico; la suma 7 usa `ATK − DEF − 1`.
- Fuerza `[1, 1, 12]`: fallo crítico.
- Versátil `[1, 2, 4]`: no es fallo crítico.

## Integración

La regla se aplica a:

- Ataque básico.
- Habilidad racial ofensiva.
- Habilidad de clase Técnica.
- Habilidad híbrida Fuerza.
- Habilidad de arma.
- Habilidad definitiva.

Cada resultado de combate conserva metadatos de auditoría: caras individuales, cantidad de unos, cantidad total de dados y umbral requerido.

## Validación

- 292 archivos JS/JSX/MJS sin errores sintácticos.
- 661 imports locales resueltos.
- 8 grupos específicos de validación v2.23.2 aprobados.
- Cadena completa de regresiones v2.23.1 → v2.13 aprobada.
- No se generó el bundle Vite porque el entorno no dispone del ejecutable `vite`; la entrega es el proyecto fuente actualizado.
