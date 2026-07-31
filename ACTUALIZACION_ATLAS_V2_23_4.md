# Proyecto Atlas Visual v2.23.4

## Estabilización crítica del combate Dungeon

Parche correctivo construido sobre Atlas v2.23.3. No modifica mapas, balance, habilidades, cámara ni presentación. Corrige exclusivamente la forma del resultado interno de precisión y crítico en Dungeon y añade una regresión automática.

## Causa confirmada

`resolveSkillHit` devolvía dos propiedades con el mismo nombre `crit`:

- el indicador booleano de si el golpe fue crítico;
- la probabilidad numérica de crítico usada internamente.

En JavaScript, la segunda propiedad sobrescribía a la primera. Como consecuencia, los consumidores recibían un número entre 0 y 0,6 donde esperaban `true` o `false`. Cualquier probabilidad positiva se interpretaba como verdadera y podía presentar impactos normales como críticos.

## Corrección

- `crit` queda reservado para el resultado booleano.
- `critChance` expone la probabilidad interna cuando se necesita depuración.
- Fallos, impactos normales y críticos conservan una estructura estable.
- Se añadieron pruebas deterministas para los tres resultados.
- La prueba comprueba también que no reaparezca la colisión de nombres.

## Compatibilidad

- No cambia el guardado.
- No cambia el cálculo de precisión, daño ni probabilidad.
- No cambia las animaciones o VFX.
- Los consumidores actuales recuperan el contrato que ya esperaban: `result.crit` booleano.
