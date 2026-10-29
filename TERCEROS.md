# Piezas de terceros

El pack no incluye código de terceros. Lo que sigue se descarga durante la configuración, desde sus
fuentes oficiales, y cada pieza conserva su propia licencia.

| pieza | para qué | licencia | de dónde |
|-------|----------|----------|----------|
| HyperFrames (`npx hyperframes`) | renderizar las escenas HTML en vídeo, comprobar y transcribir | Apache-2.0 | npm |
| GSAP 3 | las animaciones de las escenas | licencia estándar de GSAP (gratis, también para uso comercial) | jsDelivr |
| Figtree y JetBrains Mono | las letras de la casa | SIL Open Font License 1.1 | Google Fonts |
| three.js 0.181 | las escenas en 3D (`plantilla/kit3d.js` lo usa) | MIT | jsDelivr |
| Kokoro (kokoro-onnx) | la voz local, sin clave | Apache-2.0 (modelo y paquete) | PyPI / GitHub |
| Parakeet | el segundo exacto de cada palabra | CC-BY-4.0 (modelo de NVIDIA) | lo instala HyperFrames |
| yt-dlp | bajar un reel de un enlace para estudiar su forma | Unlicense | PyPI |
| ffmpeg | cortar, mezclar y comprimir | LGPL/GPL según la compilación | winget / brew / apt |
| Node.js, Python | los entornos donde corre todo | MIT / PSF | nodejs.org / python.org |
| ElevenLabs (opcional) | la voz buena, con la clave del propio usuario | sus condiciones de uso | elevenlabs.io |

## Los vídeos de la estantería

- `andes`, `bombas` y `humanidad` (`estanteria/<nombre>/ejemplo.mp4`), con sus guiones y sus escenas, están hechos
  por el autor del pack.
- `tactil`, `teclado`, `metro` y `virologa` incluyen el reel original (`reel.mp4`) de otras cuentas solo como
  referencia de estudio: para mirar su forma (ritmo, planos, dónde va el texto) y que la IA la lleve a otro tema. Ni
  sus imágenes, ni su texto, ni su voz entran en tus vídeos. Siguen siendo de sus autores: no los republiques, no los
  vendas y no los uses como tuyos.
- `paloma` y `cachalote` no incluyen el vídeo: `enlace.txt` dice dónde está y se baja solo al usarlo, con el mismo
  uso de estudio.
- Su `referencia.md` describe con palabras propias la forma de cada vídeo.

Si estudias otro reel ajeno con `herramientas/referencia.mjs`, úsalo igual: solo para aprender su forma. Sus imágenes,
su texto y su voz pertenecen a quien lo hizo.
