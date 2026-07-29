# Plan de pruebas
## Campaña Verde, versión 2

## Preparación

1. Ejecutar `npm install`.
2. Ejecutar `npm run dev` o `base44 dev`.
3. Crear una partida nueva para probar toda la cadena.
4. Mantener una copia del guardado anterior para probar la migración.

## Prueba mínima de humo

- El juego abre sin pantalla en blanco.
- Es posible crear personaje.
- El Reino Verde comienza en A2.
- El Diario muestra “Un rostro desconocido”.
- Roland ofrece solamente la Misión 1 al inicio.
- Las misiones futuras aparecen bloqueadas con una explicación.

## Ruta principal esperada

### Misión 1
Hablar con Bren, Elia y Cedric en A2. Volver con Roland y reclamar.

### Misión 2
Examinar rastros, carreta y caja de herramientas en A2. Derrotar dos criaturas. Reclamar con Bren.

### Misión 3
Aceptar con Cedric. Confirmar que A1 se abre. Entrar en A1 e inspeccionar huellas, árbol y altar.

### Misión 4
Localizar la caravana en A1, defenderla y asegurar a los supervivientes. Confirmar apertura de B1.

### Misión 5
Hablar con Darian. Encontrar a los Vigilantes, escuchar su conversación, defenderlos y aceptar el contrato.

### Misión 6
Entrar en B1, activar el mecanismo, derrotar tres guardianes y leer la inscripción. Confirmar apertura de C1.

### Misión 7
Copiar la inscripción, seguir la senda de C1, confirmar apertura de C2, entrar al pueblo y hablar con el Cartógrafo.

### Misión 8
Regresar a C1. Resolver el mecanismo, derrotar al Custodio del Santuario e inspeccionar el santuario.

### Misión 9
Inspeccionar estatua en A1, escudo en B1 y hoja fracturada en C1. Confirmar apertura de B2.

### Misión 10
Entrar en B2, presentar pruebas al Capitán Real, examinar el archivo y presenciar la resonancia de Atlas.

### Misión 11
Aceptar con Roland. Confirmar apertura de A3. Explorar el campamento destruido, sobrevivir tres combates y rescatar al explorador.

### Misión 12
Recuperar mineral en A3, carbón en B1, confirmar apertura de B3, derrotar tres criaturas, recuperar el núcleo y restaurar la reliquia en A2.

### Misión 13
Hablar con Roland en A2, con el Capitán Real en B2 y celebrar el Consejo Verde.

### Misión 14
Entrar en B3, purificar tres nodos, confirmar apertura de C3, entrar al santuario e inspeccionar al Guardián dormido.

### Misión 15
Aceptar en B2, entrar en C3, derrotar al Guardián, interactuar con su espíritu y reclamar la misión. Confirmar que se habilita el viaje al norte.

## Pruebas de persistencia

- Guardar en medio de una misión con varios pasos.
- Recargar y comprobar que se conserva el paso actual.
- Guardar después de abrir A1, B1, C1 y comprobar que siguen abiertos.
- Confirmar que objetos de campaña y reliquias aparecen en la mochila.
- Cargar un guardado versión 2 y comprobar que no produce error.

## Resultado de comprobaciones automáticas de esta entrega

- `npm run lint`: aprobado.
- `npm run build`: aprobado.
- Simulación de las 15 misiones: aprobada.
- Validación de los puntos narrativos: aprobada.

`npm run typecheck` mantiene errores históricos del proyecto relacionados con definiciones de propiedades en componentes antiguos y tipos de Three.js. No son introducidos por esta campaña y no impiden el build de producción.
