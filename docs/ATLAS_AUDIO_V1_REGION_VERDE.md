# Proyecto Atlas · Audio v1.0 · Región Verde

## Base

Construido sobre **Atlas Visual v2.17.0**.

## Alcance implementado

- Música de menú: **El peso de Atlas**, prototipo instrumental.
- Campamento, Pueblo y Ciudad de Región Verde.
- Exploración de bosques y zonas naturales.
- Ruinas, dungeons, mini jefe y corrupción.
- Combate regional verde.
- Tema del Guardián Verde.
- Ambiente de bosque y campamento.
- Entrada sonora individual para:
  - Orco Bruto.
  - Chamán Orco.
  - Asesino Orco.
  - Lobo Salvaje.
  - Brujo Feral.
  - Pantera Sombría.
  - Guardián Verde.
- Variante de introducción para enemigos élite.
- Dados, golpes, magia, fallos, críticos, muerte, victoria y portal.
- Crossfade entre exploración y combate.
- Regreso suave a la música ambiental tras terminar el encuentro.
- Bloqueo temporal de acciones mientras se reproduce la presentación del enemigo.
- Controles de volumen independientes.

## Flujo implementado

```text
Exploración
→ la música ambiental baja
→ transición de combate
→ presentación sonora del enemigo
→ música de combate regional
→ acciones sincronizadas con sonidos
→ derrota del enemigo
→ señal de victoria
→ retorno a la música de la zona
```

## Duración de introducciones

| Tipo | Duración aproximada |
|---|---:|
| Mob común | 1,3 a 1,9 s |
| Enemigo élite | mínimo 2,2 s |
| Guardián Verde | 5,1 s |

## Producción de audio

El paquete prototipo fue generado mediante síntesis procedural original, sin muestras de terceros. Los archivos runtime están en OGG y pueden sustituirse por masters finales manteniendo exactamente las mismas rutas e identificadores.

Generador reproducible:

```bash
python scripts/generate-atlas-audio-prototype.py
```

Requiere Python, NumPy, SciPy y ffmpeg.

## Ajustes disponibles

- Audio activado o silenciado.
- Volumen maestro.
- Música.
- Ambiente.
- Efectos.

Los navegadores móviles solo permiten iniciar audio después del primer toque o tecla. El motor guarda la música deseada y la activa automáticamente cuando recibe ese gesto.

## Próxima fase

Audio v1.1 debería aplicar la misma arquitectura a Región Ártica:

- Campamento Boreal.
- Exploración y ruinas congeladas.
- Combate ártico.
- Guerrero Esquelético, Necromante y Asesino Esquelético.
- Aurel, Último Portador.
