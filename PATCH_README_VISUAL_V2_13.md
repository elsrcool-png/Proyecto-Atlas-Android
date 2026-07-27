# Atlas Visual v2.13.0

## Horizontal, legibilidad, HUD limpio y balance inicial

Este parche se instala sobre **Atlas Visual v2.12.1**.

### 1. Modo horizontal

- Horizontal pasa a ser la orientación predeterminada.
- Las instalaciones antiguas migran una sola vez al modo horizontal limpio.
- Al iniciar o cargar una partida, Atlas solicita el bloqueo horizontal desde el gesto del jugador.
- Si Chrome Android no permite bloquear la orientación, el juego conserva un modo vertical legible.
- El manifiesto PWA declara `landscape`.
- Se respetan áreas seguras, cámaras perforadas y barras del sistema.

### 2. Interfaz legible

- HUD superior más compacto en pantallas horizontales de poca altura.
- Controles integrados a los costados.
- Escala del mapa ajustada para mostrar más campo sin volver ilegibles los elementos.
- Combate reorganizado para horizontal.
- Diálogos, inventario, tiendas, mapas y recompensas permiten desplazamiento vertical cuando la pantalla es baja.
- Ajustes conserva opción vertical y automática.

### 3. Menos avisos sobre el mapa

El modo **HUD limpio** queda activado de forma predeterminada:

- nombres ambientales ocultos hasta acercarse;
- etiquetas de cofres, portales, santuarios y servicios aparecen cuando son útiles;
- anillos técnicos y marcadores de invocación quedan ocultos fuera del modo depuración;
- solo se muestra un aviso visual a la vez;
- avisos repetidos se descartan durante 3,5 segundos;
- la cola interna queda limitada a dos avisos;
- el registro conserva la información completa de misiones.

El jugador puede volver al HUD completo desde Ajustes.

### 4. Balance inicial de mobs

Los enemigos comunes ahora parten desde las estadísticas **innatas** del jugador:

- vida base;
- ataque base;
- defensa física base;
- defensa mágica base.

El equipo no se incluye en el anclaje. Por tanto, armas, armaduras y accesorios siguen entregando una ventaja real.

Cada mob conserva:

- personalidad ofensiva, defensiva, mágica o táctica;
- afinidad de defensa física o mágica;
- progresión moderada entre sectores;
- habilidades y pasivas;
- experiencia original.

Los jefes conservan su escalado canónico y no utilizan este anclaje de enemigos comunes.

### 5. Validación

Ejecutar:

```bash
npm run validate:horizontal-balance
npm run validate:portals
npm run validate:green-master
npm run validate:green-scenes
npm run validate:green-composition
npm run build
```

El validador v2.13 comprueba orientación, HUD, diálogos, cola de avisos y muestras de balance para Guerrero y Erudito.
