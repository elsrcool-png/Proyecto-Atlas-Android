# Atlas Visual v2.12.1 — Portales de Invocación

Base requerida: **Atlas Visual v2.12.0**.

## Corrección

Los Portales de Invocación ya no se activan desde un radio circular genérico. El jugador debe subir por las escaleras y colocar sus pies sobre la plataforma central. En ese punto:

- el botón **A** se ilumina y pulsa visualmente;
- un portal inactivo muestra **Activar Portal de Invocación — pulsa A**;
- un portal activo muestra **Usar Portal de Invocación — pulsa A**;
- pulsar A abre el menú correspondiente;
- abrir un portal ya activo no vuelve a activarlo ni cura automáticamente;
- el descanso solo ocurre al elegir **Descansar en el santuario**.

## Portales verdes alineados

- A2: Campamento del Umbral
- B2: Ciudad de Verdalia
- C2: Pueblo de Robledal

Cada portal utiliza una elipse pequeña situada sobre su plataforma. Acercarse desde un lateral, desde atrás o quedarse en la base de las escaleras no habilita la acción.

## Instalación en Termux

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_Portales_v2_12_1.zip -d ~/atlas
rm -rf node_modules/.vite
npm run validate:portals
npm run build
npm run dev -- --host 0.0.0.0 --force
```
