# Proyecto Atlas Visual v2.21.0

## Equipamiento regional progresivo, Cascos y Accesorio II

Base actualizada desde `ProyectoAtlas_Visual_v2_20_Controles_Estados_Accesibilidad_Completo`.

### Cambios principales

1. Todo el equipamiento existente se revisó y se integró en un catálogo maestro de 164 piezas.
2. Las tiendas ahora dependen de Región y asentamiento: Campamento, Pueblo y Ciudad.
3. Región Verde conserva su identidad de inicio y no ofrece cascos.
4. Región Ártica usa inventario propio para niveles 9–16.
5. Región Árida usa inventario propio para niveles 17–25.
6. El loot regional es independiente del inventario comercial.
7. El jefe Verde desbloquea Casco.
8. El jefe Ártico desbloquea Accesorio II.
9. Las partidas antiguas migran los nuevos espacios según los jefes ya derrotados.
10. La interfaz de equipo, mochila, ficha, Hub, compra y venta reconoce los cinco espacios finales.
11. Se impide equipar el mismo accesorio dos veces.
12. Se impide comprar armas incompatibles con la clase.

### Catálogo

- 99 objetos comerciales únicos.
- 39 objetos exclusivos del loot de mobs.
- 24 cascos.
- 41 armas.
- 41 armaduras.
- 43 accesorios.
- 15 armas de clase.

### Validación

- 248 archivos JavaScript/JSX/MJS sin errores sintácticos.
- 535 imports locales resueltos.
- Auditoría completa de v2.13 a v2.20 aprobada.
- 17 grupos de controles v2.20 aprobados.
- Auditoría de equipamiento v2.21 aprobada.

### Compilación local

La instalación automática de dependencias no pudo completarse en el entorno de generación porque el registro npm respondió `503 Service Temporarily Unavailable` al descargar `zwitch`. No se detectó un error del código fuente y las auditorías estáticas completas finalizaron correctamente.

En un equipo con acceso normal al registro npm:

```bash
npm ci
npm run validate:v2-21
npm run build
```
