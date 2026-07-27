# Parche Atlas Visual v2.19.2

## Base requerida

Atlas Visual **v2.19.1 Estabilización de Combate**.

No aplicar directamente sobre v2.19.0, v2.18 o v2.17. En esas bases utiliza el paquete completo v2.19.2.

## Contenido

- orientación normalizada por sprite en combate;
- corrección de los tres personajes enanos;
- corrección de enemigos con direcciones invertidas o ambiguas;
- jugador y enemigo siempre se miran;
- avance cuerpo a cuerpo calculado por distancia real;
- proyectiles y hechizos nacen en el atacante;
- impactos y números de daño se anclan al objetivo;
- VFX trasladados desde la caja del enemigo al campo completo de actores.

## Validación

```bash
npm run validate:v2-19-2
npm run build
```
