# Proyecto Atlas — Visual v2.4 Región Verde

## Alcance

Esta versión consolida en una sola base limpia:

- Proyecto Atlas Consolidado v2;
- corrección Post-Guardián v2.1;
- A2 modular real;
- hotfix de activación y rendimiento v2.2.1;
- Humano Guerrero y Bren de Visual v2.3.1;
- eliminación del parpadeo principal de A2;
- arquitectura modular aplicada a los nueve mapas verdes;
- bestiario verde auditado y unificado;
- rutas visuales propias para los seis mobs y el Guardián Verde.

## Mapas incluidos

A1, B1, C1, A2, B2, C2, A3, B3 y C3 usan escenas registradas bajo el estándar `individual-assets`.

A2 conserva el nivel de detalle aprobado. Los otros ocho sectores ya usan la arquitectura modular, los assets individuales y la estabilización de render como base. Sus composiciones quedan preparadas para refinamientos artísticos posteriores sin volver a cambiar el motor del mundo.

## Estabilización y rendimiento

- una sola escena visual activa por sector;
- claves estables para los objetos;
- posiciones normalizadas;
- contornos horneados en los assets, sin múltiples filtros costosos;
- niebla y scanlines móviles reducidos en la Región Verde;
- menos partículas simultáneas en móvil;
- árboles y arbustos individuales en lugar de clusters rectangulares;
- HUD visible con `Visual 2.4 · Región Verde modular activa`.

## Bestiario auditado

Enemigos normales:

1. Pantera Sombría
2. Lobo Salvaje
3. Brujo Feral
4. Asesino Orco
5. Orco Bruto
6. Chamán Orco

Jefe:

- Guardián Verde

La selección regional de IA fue corregida para retirar al Guerrero Esquelético de la lista Verde y recuperar Pantera y Chamán.

## Verificación

La entrega se considera correcta solamente cuando pasan:

```bash
node scripts/validate-green-scenes.mjs
node scripts/validate-consolidated-v2.mjs
node scripts/validate-visual-v2-4.mjs
npm run lint
npm run build
```

La prueba en navegador comprueba además que el servidor responde y que la página inicial no queda en blanco.
