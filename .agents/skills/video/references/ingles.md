# Versión en inglés (siempre, tras entregar la española)

Todo vídeo sale en español **y** en inglés: mismas escenas y planos, voz y subtítulos en inglés. Es un proyecto aparte,
`<proyecto>-en`, con salida en `trabajo/salida/<proyecto>-en/`. No hay aprobaciones extra ni revisores nuevos: el
contenido ya está verificado; solo se traduce.

**Parte siempre del mismo vídeo:** `<proyecto>-en` es una copia del proyecto español (escenas, planos, cámara, frames, referencia y plan). Solo cambian la voz, los subtítulos, los rótulos y los textos de la entrega; las escenas se reajustan al tiempo de la voz inglesa, sin rediseñarlas ni inventar planos nuevos. Si hay que cambiar algo visual, se cambia en el español y se vuelve a copiar.

1. **Datos.** Escribe un `datos.json` (fuera del proyecto) con el guion en inglés: `titulo`, `hook` `[texto, clave]`,
   `reserva` `{h2:[texto,clave]...}`, `cuerpo` `[[texto, clave]...]` (misma cantidad de frases, mismo orden), `pie`,
   `portada` (3 líneas) y `hashtags` (en inglés). Natural y casual, no literal; cada `clave` es una palabra que está
   en su frase. Mismos datos y cifras que el español.
2. `node herramientas/ingles-crear.mjs trabajo/proyectos/<proyecto> datos.json`: copia el proyecto a `<proyecto>-en`
   (voz `en-US-AndrewNeural`, edge-tts, idioma `en`).
3. **Señales de las escenas.** `node herramientas/ingles-senales.mjs <proyecto> <proyecto>-en` lista, por escena, la frase
   y sus `t("palabra", …)`. Escribe `mapa.json` `{escena:{palabra_es:palabra_en}}` con palabras que estén en la frase
   inglesa (`#2` = segunda vez que sale) y aplícalo con el mismo comando y el mapa como tercer argumento; debe decir
   «todo en su sitio». Ignora los avisos `SIN MAPA`/`RESIDUO` de escenas ya traducidas o de nombres de funciones.
4. **Rótulos.** `node herramientas/ingles-rotulos.mjs <proyecto>-en/escenas` lista los textos de pantalla; escribe
   `{"TEXTO ES":"TEXT EN"}` y aplícalo con el mapa como segundo argumento. Repite la lista hasta que no quede español.
   Ignora el código (`tLu - 0.2 && s`, fuentes).
5. `node herramientas/voz.mjs <proyecto>-en` y `node herramientas/entregar.mjs <proyecto>-en`. Debe durar **menos de
   90 s**: el inglés ocupa más; si no cabe, acorta frases del inglés (nunca el final). `entregar.mjs` tarda más de
   10 min: lánzalo en segundo plano y **de uno en uno** (en paralelo se agota la memoria).
6. Anota en `trabajo/registro.md` lo que falló y funcionó. Publicar sigue siendo aparte y solo si lo pide.
