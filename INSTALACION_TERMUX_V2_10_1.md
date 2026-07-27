# Aplicar Atlas Visual v2.10.1 en Termux

Este parche requiere que **Atlas Visual v2.10** ya esté descomprimido en:

```text
~/atlas
```

## 1. Detener el servidor

En Termux pulsa:

```text
Ctrl + C
```

## 2. Aplicar el ZIP sin preguntas de reemplazo

```bash
cd ~/atlas
unzip -oq ~/storage/downloads/Atlas_Parche_Visual_v2_10_1_Profundidad_A2.zip -d ~/atlas
```

La opción `-o` reemplaza los archivos automáticamente y evita el mensaje `replace ...?`.

## 3. Limpiar caché y validar

```bash
cd ~/atlas
rm -rf node_modules/.vite
node scripts/validate-visual-v2-10-a2.mjs
node scripts/validate-a2-depth-v2-10-1.mjs
```

## 4. Ejecutar

```bash
npm run dev -- --host 0.0.0.0 --force
```

Abre:

```text
http://127.0.0.1:5173
```

## Proyecto completo

Para una instalación limpia, descomprime el ZIP completo en una carpeta vacía y ejecuta:

```bash
cd ~/atlas
npm install
npm run dev -- --host 0.0.0.0 --force
```
