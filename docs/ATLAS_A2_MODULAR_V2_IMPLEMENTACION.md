# Atlas — A2 Modular Real v2

## Estado

Implementación funcional del **Campamento del Umbral (Región Verde, A2)** mediante sprites individuales y una capa de terreno conectada.

Esta versión elimina del A2 activo los grandes recortes agrupados usados en `modular_v1`. El resto de la Región Verde permanece sin cambios hasta recibir su reconstrucción equivalente.

## Arquitectura visual

### Capa base única

`terrain_a2_modular_v2.webp` contiene exclusivamente:

- césped y variaciones de material;
- claros de tierra;
- senderos conectados;
- río y ribera;
- pequeñas marcas del suelo.

No contiene carpas, árboles, edificios, portal, puente, cajas, barriles ni NPC.

### Objetos individuales

El A2 usa 74 instancias visuales independientes y 47 archivos de asset distintos:

- 26 árboles individuales;
- 5 carpas independientes;
- portal dividido en base, arco y núcleo;
- puente independiente;
- torre y bandera independientes;
- herrería, yunque, herramientas y suministros independientes;
- fogata y brillo independientes;
- carteles, tablón, cajas, barriles, bancos, leña, rocas y vegetación baja independientes.

La biblioteca contiene 85 WebP RGBA. Los assets no usados por el plano actual quedan listos para refinamiento y expansión.

### Contorno y sombra

Los sprites principales llevan el contorno oscuro suave y su sombra horneados dentro del archivo. El renderer no aplica múltiples `drop-shadow` a cada objeto de A2, reduciendo carga gráfica en Android.

## Capas de render

1. `ground`: terreno conectado;
2. `decal`: flores, helechos y vegetación baja;
3. `low`: puente y objetos bajos;
4. `solid`: estructuras y objetos sólidos;
5. `overlay`: arco del portal y bandera;
6. `fx`: núcleo del portal, fuego y fragua;
7. entidades del juego;
8. interfaz.

## Colisiones

- 66 rectángulos de colisión comprobados;
- árboles bloquean únicamente por el tronco;
- carpas bloquean únicamente en su base;
- el puente tiene colisión solo en las barandas;
- el río deja un vano transitable en el cruce;
- portal, torre y herrería usan bases simplificadas y visibles;
- cajas, barriles, bancos, leña y rocas bloquean solo su volumen inferior.

## Jugabilidad validada

Desde el spawn principal se comprobó ruta hacia:

- santuario;
- salida oeste a A1;
- salida este a B2;
- salida sur a A3;
- NPC principal;
- Bren;
- mercader;
- posada;
- explorador;
- herbolaria;
- NPC de ambientación;
- superviviente.

## Rendimiento

- una sola imagen base de 960 × 720;
- 47 assets únicos cargados en A2;
- contornos y sombras horneados;
- sin filtros de contorno por objeto;
- biblioteca total aproximada: 1,4 MiB;
- terreno: aproximadamente 45 KiB;
- reutilización de sprites por instancia.

## Compatibilidad

El parche modifica `AssetWorldLayer.jsx` y `atlasCanonicalWorlds.js`, archivos que no son reemplazados por la corrección Post-Guardián v2.1. Por ello puede aplicarse antes o después de ese parche.

La build completa v2.2 incluye:

- Proyecto Atlas Consolidado v2;
- corrección Post-Guardián v2.1;
- A2 Modular Real v2.

## Verificación

Comandos ejecutados:

```bash
node scripts/validate-a2-modular-v2.mjs
npm run lint
npm run build
```

Resultados:

```text
A2 modular v2: 74 objetos, 66 colisiones
Assets únicos usados: 47
Rutas verificadas: 12
VALIDACIÓN A2 MODULAR V2: CORRECTA
ESLint: correcto
Vite build: correcto
Módulos transformados: 2274
```

Vite conserva la advertencia previa sobre el tamaño del chunk principal. No bloquea la compilación ni corresponde específicamente al A2.
