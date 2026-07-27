# Instalación Atlas v2.19.5 en Termux

## Opción recomendada: paquete completo

```bash
termux-setup-storage
cd ~/storage/downloads
rm -rf ~/atlas
unzip ProyectoAtlas_Visual_v2_19_5_Orientacion_Movimiento_Completo.zip -d ~/atlas
cd ~/atlas
rm -rf node_modules
npm install
npm run validate:v2-19-5
npm run build
npm run dev -- --host 0.0.0.0
```

## Parche sobre v2.19.4

Solo usar cuando la carpeta `~/atlas` contiene exactamente Atlas v2.19.4.

```bash
cd ~/atlas
unzip -o ~/storage/downloads/Atlas_Parche_v2_19_5_sobre_v2_19_4.zip
rm -rf node_modules
npm install
npm run validate:v2-19-5
npm run build
npm run dev -- --host 0.0.0.0
```

## Prueba visual mínima

1. Entrar con Enano Guerrero.
2. Caminar a izquierda y derecha en A2.
3. Confirmar que el rostro y el arma siguen la dirección.
4. Entrar en combate con Pantera Sombría.
5. Confirmar enemigo a la izquierda mirando a la derecha y jugador a la derecha mirando a la izquierda.
6. Ejecutar Golpe Martillo y observar pasos, sombra y contacto frontal.
7. Probar un mago para verificar proyectil sin avance cuerpo a cuerpo.
