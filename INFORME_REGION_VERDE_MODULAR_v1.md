# Proyecto Atlas — Región Verde Modular v1

## Alcance implementado

La Región Verde completa fue migrada a una arquitectura visual modular en A1, B1, C1, A2, B2, C2, A3, B3 y C3.

### Arquitectura

Cada escena registra:

- asset independiente;
- posición y tamaño;
- anclaje;
- capa de render;
- contorno;
- colisión independiente;
- puntos de aparición de NPC, enemigos, cofres, santuarios, objetivos y jefe.

### Capas

1. ground / base;
2. decal y decoración baja;
3. objetos sólidos;
4. entidades dinámicas;
5. foreground;
6. efectos.

Jugador, NPC, mobs y jefe usan una capa superior estable para impedir que desaparezcan detrás de estructuras.

### Colisiones

- árboles: solo tronco/base;
- carpas: solo base ocupada;
- edificios: huella física visible;
- props: colisión únicamente cuando corresponde;
- caminos, transiciones y zonas de misión permanecen libres.

### Sectores comprobados

- A1: 17 objetos, 16 colisiones.
- B1: 16 objetos, 16 colisiones.
- C1: 17 objetos, 18 colisiones.
- A2: 30 objetos, 25 colisiones.
- B2: 15 objetos, 17 colisiones.
- C2: 20 objetos, 19 colisiones.
- A3: 19 objetos, 18 colisiones.
- B3: 17 objetos, 18 colisiones.
- C3: 17 objetos, 18 colisiones.

## Verificación

```text
node scripts/validate-green-scenes.mjs  OK
npm run lint                           OK
npm run build                          OK
2269 módulos transformados
```

Vite mantiene una advertencia no bloqueante porque el bundle principal supera 500 kB.

`npm run typecheck` todavía informa deuda de tipado preexistente en Three.js y numerosos componentes antiguos. No bloquea el build, pero queda como trabajo técnico independiente.

## Pruebas manuales recomendadas

- comenzar y continuar una partida en A2;
- usar el santuario y reaparecer;
- caminar a las tres salidas de A2;
- hablar con Bren, Elia, Cedric y Roland;
- verificar objetivos de misión;
- recorrer los nueve sectores;
- comprobar mobs, cofres y jefe;
- probar vista móvil y escritorio;
- guardar, cerrar y volver a cargar.
