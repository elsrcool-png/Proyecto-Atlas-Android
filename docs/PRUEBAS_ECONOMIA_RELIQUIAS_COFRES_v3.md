# Plan de pruebas, versión 3

Usar una partida nueva para validar el flujo completo. También comprobar una partida v2 para verificar la migración.

## A. Tiendas

1. Completar la Misión 2 de la Región Verde.
2. Abrir el mercader del Campamento.
3. Confirmar que aparecen exactamente:
   - 3 armas;
   - 3 armaduras;
   - 3 accesorios.
4. Antes de recuperar la caravana, comprobar que el inventario del Pueblo permanece bloqueado.
5. Después de la Misión 4, comprobar el inventario del Pueblo.
6. Después de abrir los servicios de Verdalia, comprobar el inventario de la Ciudad.

## B. Herrerías

### Campamento
1. Hablar con Bren.
2. Abrir la herrería.
3. Confirmar límite de mejora +1.
4. Confirmar que las armas de categoría 2 y 3 están bloqueadas.

### Pueblo
1. Hablar con el herrero del Pueblo.
2. Confirmar límite +3.
3. Confirmar acceso a las dos primeras categorías.

### Ciudad
1. Hablar con el herrero de Verdalia.
2. Confirmar límite +5.
3. Confirmar que aparece el panel de restauración de la Reliquia Verde.

## C. Condición del equipo

1. Activar un Santuario.
2. Dejar que el jugador caiga en combate.
3. Regresar al Santuario.
4. Verificar que la condición desciende de 100% a 85%.
5. Repetir hasta bajar de 50% y confirmar la reducción de estadísticas.
6. Abrir una herrería.
7. Reparar el equipo.
8. Confirmar condición 100% y descuento de oro.

## D. Reliquia Verde

1. Avanzar hasta la Misión 12.
2. Confirmar que la forja de B2 muestra los restos del arma.
3. Obtener:
   - Mineral antiguo del Guardián;
   - Carbón ritual;
   - Núcleo de cristal verde.
4. Regresar a B2.
5. Abrir la herrería de la Ciudad.
6. Pulsar `Restaurar reliquia`.
7. Confirmar que desaparecen los tres componentes.
8. Confirmar que la forma coincide con la clase.
9. Confirmar que queda equipada.
10. Confirmar que no aparece un botón para venderla.
11. Usar su habilidad contra el Guardián y revisar el mensaje purificador.

## E. Cofres comunes

1. Abrir un cofre común.
2. Confirmar que no aparece ningún dado.
3. Confirmar oro y material.
4. Verificar la posibilidad de una poción pequeña.

## F. Cofres antiguos

1. Abrir el cofre antiguo de A1.
2. Confirmar tirada 1d20.
3. Confirmar obtención del Sello de la Hoja.
4. Repetir en B1 para el Sello de la Raíz.
5. Repetir en C1 para el Sello de la Savia.
6. Guardar y continuar.
7. Confirmar que los sellos siguen presentes.

## G. Cofre legendario

1. Llegar a B3 sin los tres sellos.
2. Intentar abrir el cofre.
3. Confirmar que informa qué sellos faltan y no queda marcado como abierto.
4. Reunir los tres sellos.
5. Abrir el cofre.
6. Confirmar tirada 3d20.
7. Confirmar que se consumen los tres sellos.
8. Confirmar creación de un arma con:
   - nombre regional;
   - calidad;
   - rareza;
   - bonificaciones;
   - compatibilidad de clase.
9. Confirmar que no puede venderse.
10. Equiparla y verificar que sus estadísticas se aplican.

## H. Migración de guardado

1. Iniciar el proyecto v2 y activar un Santuario.
2. Abrir v3 con el mismo almacenamiento local.
3. Pulsar Continuar.
4. Confirmar:
   - personaje presente;
   - misiones conservadas;
   - equipo conservado;
   - condición inicial 100%;
   - sectores y estados del mundo conservados.
5. Volver a guardar y comprobar creación de `atlas_adventure_save_v4`.
