# Proyecto Atlas
## Correcciones v3.1

Esta versión corrige dos problemas detectados durante la prueba de la campaña verde.

## 1. Misión de Cedric: El bosque guarda silencio

### Problema
El primer paso de la misión exige entrar en A1, Laguna de los Susurros. En ciertas partidas, especialmente guardados reanudados o cambios de sector rápidos, la entrada no quedaba registrada. Por eso los puntos de interés no podían avanzar el objetivo siguiente.

### Corrección
- La entrada de sector ahora se registra después de que React confirma el cambio de mapa.
- Si la misión se acepta estando ya en el sector solicitado, el paso se completa automáticamente.
- Al examinar un punto narrativo, el sistema reconcilia primero la entrada al sector.
- Los puntos equivocados ahora indican claramente que no corresponden al objetivo actual.

### Resultado esperado
Al entrar en A1, el diario cambia de:

`Entra en la Laguna de los Susurros.`

a:

`Examina las huellas de animales que huyen.`

Después aparecen, en orden:

1. Huellas que huyen.
2. Árbol marchito.
3. Altar cubierto por raíces.

## 2. Mapas ilustrados de las regiones

### Problema
El sistema mostraba bloqueos de sectores, pero la vista regional seguía utilizando el mapa técnico generado por el juego. Los tres dibujos entregados por el usuario no estaban incluidos realmente en el proyecto.

### Corrección
Se incorporaron como mapas canónicos:

- Reino Verde.
- Reino Ártico.
- Reino Árido.

La vista de mapa ahora:

- utiliza el dibujo original como fondo;
- superpone la cuadrícula A1-C3;
- oscurece los sectores bloqueados sin ocultar el dibujo completo;
- distingue sectores desbloqueados, explorados y actuales;
- marca la posición del jugador;
- muestra el nombre y la función de cada sector;
- permite seleccionar una celda para leer sus detalles.

## Alcance visual
El dibujo se utiliza como mapa regional oficial. Los escenarios caminables continúan usando el motor actual de exploración, colisiones y decoración. Convertir cada panel del dibujo en una copia exacta del escenario jugable requiere una fase adicional de diseño manual de los 27 sectores.

## Verificaciones

- `npm run lint`: correcto.
- `npm run build`: correcto.
- Simulación del avance de la misión v3: correcta.
- Recursos de los tres mapas incluidos en `dist`: correcto.
