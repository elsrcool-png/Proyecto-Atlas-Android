# Proyecto Atlas, versión 3
## Economía regional, Reliquia Verde y cofres 3d20

Esta versión continúa directamente desde `ProyectoAtlas_Base44_CampanaVerde_v2`.

## 1. Economía dirigida por asentamiento

Cada asentamiento posee un inventario breve y deliberado:

- Campamento: 3 armas, 3 armaduras y 3 accesorios básicos.
- Pueblo: 3 armas, 3 armaduras y 3 accesorios intermedios.
- Ciudad: 3 armas, 3 armaduras y 3 accesorios avanzados.

El inventario ya no se construye mostrando todos los objetos de una rareza. Cada región y asentamiento tiene una lista propia. En la Región Verde, las existencias se habilitan mediante el progreso de campaña.

## 2. Tres categorías de herrería

### Campamento
- Reparación.
- Mejoras sencillas hasta +1.
- Solo puede forjar la primera categoría de arma.

### Pueblo
- Reparación.
- Forja limitada.
- Mejoras hasta +3.
- Puede forjar las dos primeras categorías.

### Ciudad
- Reparación.
- Forja avanzada.
- Mejoras hasta +5.
- Único lugar capaz de restaurar la reliquia regional.

## 3. Condición del equipo

Se añadió una condición general de equipo de 0 a 100%.

- Al caer y regresar a un Santuario, la condición disminuye 15 puntos.
- Bajo 50%, se reduce en 1 el ataque y las defensas.
- Bajo 25%, la penalización aumenta a 2.
- Cualquier herrero puede reparar el equipo, con precios distintos según el asentamiento.

Los guardados anteriores reciben automáticamente 100% de condición.

## 4. Reliquia Verde restaurable

La reliquia ya no aparece como una recompensa automática del jefe.

Flujo implementado:

1. Encontrar los restos del arma del Guardián.
2. Obtener el Mineral antiguo del Guardián.
3. Obtener Carbón ritual.
4. Obtener el Núcleo de cristal verde.
5. Abrir los servicios de la Ciudad de Verdalia.
6. Entregar los componentes en la forja regional de B2.
7. Restaurar una forma adaptada a la clase del jugador.

Formas:

- Guerrero: Espada-Raíz del Guardián.
- Mago: Bastón de Savia Ancestral.
- Pícaro: Hojas Gemelas del Brote.

La reliquia queda equipada, no puede venderse y posee una habilidad de arma moderada con propiedad purificadora contra el Guardián.

## 5. Misión 12 reformulada

`La Forja del Campamento` evolucionó a:

`La Forja de Verdalia y la Reliquia Verde`

Ahora la misión:

- entrega componentes narrativos reales;
- abre B3 durante la búsqueda;
- obliga a regresar a B2;
- utiliza al herrero de la ciudad;
- restaura la reliquia mediante una interacción jugable;
- no concede la reliquia como recompensa abstracta.

## 6. Cofres por categoría

### Cofre común
- No lanza dados.
- Entrega oro, material regional y, ocasionalmente, una poción pequeña.

### Cofre antiguo
- Lanza 1d20.
- Entrega recursos según el resultado.
- Concede uno de los tres sellos regionales.

En cada región, los tres cofres antiguos están ubicados en A1, B1 y C1.

### Cofre legendario
- Está ubicado en B3.
- Requiere los tres sellos regionales.
- Lanza 3d20.
- Genera una instancia única de arma compatible con la clase.
- El total determina calidad, rareza y bonificaciones.
- Posee protección contra frustración: la calidad mínima es Rara.
- El arma generada no se puede vender.

## 7. Armas únicas de botín

Las armas generadas pueden guardar:

- nombre propio;
- calidad;
- rareza;
- bonificaciones adicionales;
- resultados de los tres dados;
- origen del objeto;
- condición de venta.

La mochila, el panel de equipo y la tienda muestran correctamente esos datos.

## 8. Guardado versión 4

Nuevo almacenamiento:

`atlas_adventure_save_v4`

Conserva:

- objetos narrativos;
- estado de reliquias;
- armas únicas;
- condición del equipo;
- sellos de cofres;
- sectores desbloqueados;
- estados del mundo.

La carga busca primero v4 y migra automáticamente desde v3, v2 o v1.

## 9. Verificación técnica

- `npm run lint`: correcto.
- `npm run build`: correcto.
- Vite conserva una advertencia no bloqueante por el tamaño del paquete JavaScript.
