# La estantería

Vídeos que ya funcionaron. Cada vídeo nuevo copia la forma de uno: el que pase el creador o, si no pasa ninguno, uno de
estos. Se elige por cómo se explica el tema, no por el tema: un vídeo sobre un satélite puede salir del teclado si lo
que hay que enseñar es lo que pasa por debajo de una pantalla.

| Nombre | Sirve cuando el tema es… | Dura | Está |
|---|---|---|---|
| `tactil` | cómo funciona por dentro algo que usas cada día y no ves funcionar (una pantalla, un sensor, una tarjeta, un imán, el wifi) | 87 s | dentro |
| `teclado` | lo que hace en secreto una app, un algoritmo o una pantalla (el autocorrector, el GPS, las recomendaciones, la cámara del móvil) | 84 s | dentro |
| `metro` | un objeto de todos los días con un detalle que parece un fallo y es a propósito; vídeo corto, con pruebas físicas | 31 s | dentro |
| `virologa` | una historia real con una persona con nombre, de ciencia, salud o naturaleza, con fechas y cifras | 63 s | dentro |
| `paloma` | un comportamiento raro de un animal o del cuerpo que se demuestra con un experimento y una medida; vídeo corto | 36 s | enlace |
| `cachalote` | una cifra extrema de la naturaleza o la física (profundidad, presión, velocidad, frío) explicada en varios pasos | 109 s | enlace |
| `andes` | una historia real de supervivencia o de hazaña, larga, con fechas, cifras, nombres y una cadena de decisiones | 125 s | dentro |
| `bombas` | una escalera de tamaños, de lo pequeño a lo enorme, medida siempre en el mismo sitio (explosiones, terremotos, velocidades) | 90 s | dentro |
| `humanidad` | una pregunta «¿y si…?» que se responde echando cuentas paso a paso, con casos reales que lo prueban | 109 s | dentro |

- Cada carpeta tiene `referencia.md`: para qué temas sirve, cómo se lleva a otro tema y el vídeo plano a plano.
- «Dentro»: el vídeo está en la carpeta (`reel.mp4`, o `ejemplo.mp4` en los del autor del pack, con sus hojas y sus medidas). «Enlace»: `enlace.txt` dice dónde
  está y se baja al usarlo.
- Para usar uno: `node herramientas/referencia.mjs --estanteria <nombre> --proyecto <proyecto>`. Deja el vídeo, sus
  medidas, sus hojas y su `referencia.md` en `referencia/` del proyecto.
- Si ninguno encaja con cómo se explica el tema, díselo al creador en una línea, pídele un reel que le guste y, si no
  tiene, usa el más cercano.
- Candidatas aeroespaciales sin medir (motor a reacción, GPS, onda de choque, álgebra visual): `candidatas.md`.
