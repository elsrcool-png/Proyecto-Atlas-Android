# Atlas Visual v2.9 — Limpieza, NPC y campañas

Actualización sobre Atlas Visual v2.8.

- Sustituye los últimos recursos recortados conectados en Región Verde por construcciones modulares transparentes.
- Desincroniza giro, pausa, velocidad y recorrido de los NPC ambientales.
- Elimina el marcador genérico de punto de interés.
- Solo muestra puntos narrativos vinculados a una misión activa.
- Integra una campaña jugable completa para Región Árida.
- Corrige los desbloqueos narrativos de Región Verde y Región Ártica.
- Valida 45 misiones principales, sus NPC, objetivos y acceso a los 27 sectores.

Validación:

```bash
node scripts/validate-green-scenes.mjs
node scripts/validate-visual-v2-8.mjs
node scripts/validate-visual-v2-9.mjs
npm run lint
npm run build
```
