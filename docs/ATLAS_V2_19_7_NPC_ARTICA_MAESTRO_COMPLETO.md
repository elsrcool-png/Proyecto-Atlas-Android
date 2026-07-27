# Atlas v2.19.7 — NPC Ártica Maestro Completo

## Objetivo

Cerrar la integración visual de la Región Ártica con los dos personajes que seguían usando respaldo procedural:

- Herrero Borin.
- Einar, último explorador.

## Integración ejecutada

- Borin y Einar fueron convertidos a sprites runtime WebP transparentes de 72×96.
- Ambos disponen de `down`, `up`, `left` y `right`.
- `fria_borin` y `fria_einar` quedaron conectados en `atlasNpcAssetSprites.js`.
- Borin utiliza el arte maestro dentro de la Ciudadela Helada.
- Einar utiliza el arte maestro en sus dos estados narrativos:
  - herido en A2;
  - recuperado en B1.
- `StoryPointMarker` admite ahora personajes narrativos reales, en vez de sustituirlos por un icono genérico.

## Corrección adicional

Los 16 NPC árticos anteriores habían sido recortados tomando cualquier alfa distinto de cero. Las láminas originales contenían ruido alfa alrededor de todo el cuadrante y el personaje terminaba ocupando una parte mínima del lienzo runtime.

Se reextrajeron los 16 sprites con un umbral de contenido real, respetando la transparencia, la sombra de contacto y el anclaje inferior. El resultado deja los 18 NPC con una escala uniforme.

## Normalización de Einar

La lámina de Einar contenía frente, espalda y dos laterales orientados visualmente hacia la derecha. Se utilizó la toma lateral más clara como `right` y se generó `left` mediante espejo horizontal. Así el personaje responde correctamente al facing del mapa.

## Estado final

| Métrica | Resultado |
|---|---:|
| NPC canónicos de Región Ártica | 18 |
| NPC con arte maestro | 18 |
| Direcciones runtime | 72 |
| Respaldos procedurales árticos | 0 |
| Tamaño runtime | 72×96 |

La única representación procedural que permanece en el catálogo global es Vera la Cazadora, de Región Verde, porque no formaba parte de esta entrega.
