# Proyecto Atlas Visual v2.16

## Integración de mobs y jefes hasta Región Ártica

Base utilizada: `ProyectoAtlas_Visual_v2_15_Personajes_Jugables_Completo.zip`.

Fuente visual: `Atlas_Mobs_Jefes_Por_Zona_Maestro_v1.0(1).zip`.

## Entidades integradas

### Región Verde

- Orco Bruto
- Chamán Orco
- Asesino Orco
- Lobo Salvaje
- Brujo Feral
- Pantera Sombría
- Guardián Verde

### Región Ártica

- Guerrero Esquelético
- Necromante
- Asesino Esquelético
- Aurel, Último Portador

Región Árida permanece reservada y no fue modificada.

## Integración técnica

- 11 entidades visuales conectadas.
- 4 direcciones por entidad: abajo, arriba, izquierda y derecha.
- 44 sprites runtime WebP RGBA.
- 44 sprites maestros WebP RGBA.
- Anclaje inferior centrado.
- Proporción original conservada por arquetipo, incluidos cuadrúpedos y jefes.
- Precarga y caché de imágenes.
- Respaldo procedural mientras un archivo carga o si falla.
- Uso común en mundo libre, dungeons y combate.

## Compatibilidad de IDs

El juego conserva el ID canónico:

```text
aurel_portador
```

El paquete visual usa:

```text
aurel_ultimo_portador
```

El cargador resuelve este alias sin modificar misiones, combates, guardados ni referencias internas.

## Archivos principales añadidos o modificados

- `public/assets/atlas/enemies/maestro_v1/`
- `src/lib/atlasEnemyAssetSprites.js`
- `src/lib/atlasEntitySprites.js`
- `src/components/atlas/EntitySprite.jsx`
- `src/lib/atlasSprites.js`
- `scripts/validate-enemy-visuals-v2-16.mjs`
- `package.json`

## Sistemas no modificados

- Estadísticas y balance.
- IA enemiga.
- Spawns y distribución regional.
- Misiones y campaña.
- Botín y progresión.
- Mapas, objetos, NPC y portales.
- Los 9 personajes jugables de v2.15.

## Resultado de validación

- 11/11 entidades conectadas.
- 44/44 sprites runtime presentes.
- 44/44 sprites maestros presentes.
- 88/88 checksums SHA-256 correctos.
- Región Verde Maestro correcta.
- Región Ártica Maestro correcta.
- Personajes jugables v2.15 conservados.
- Portales, horizontal, HUD y balance conservados.

La compilación Vite no pudo completarse en el entorno de construcción porque el proxy interno del registro npm respondió con error 503 al descargar dependencias. Los validadores locales, sintaxis de módulos y estructura de assets sí fueron comprobados.
