# La referencia

Siempre hay una: el reel que pase el creador («hazlo como este», un enlace o un archivo) o, si no pasa ninguno, uno de
`estanteria/`. Los vídeos buenos salen de copiar, plano a plano, la forma de uno que ya funcionó, contando otro tema.
Inventar el aspecto de un vídeo desde cero sale peor.

`viral.md` manda en el hook y el guion. La referencia decide lo demás: cómo se ve y cómo se mueve este vídeo. Cuántos
planos y cuánto dura cada uno, qué llena la pantalla, el estilo de dibujo, el ritmo, dónde va el texto, qué suena. Su
hook se adapta solo si pasa las pruebas de `viral.md`. Si el vídeo del creador es grabado y no animado, se copian su
hook (si pasa) y su ritmo, y la imagen sale del vídeo de la estantería que mejor encaje.

## 1. Elegirla de la estantería (si el creador no pasó una)

Lee `estanteria/LEEME.md`. Se elige por cómo se explica el tema, no por el tema: qué hay que enseñar para que se
entienda (un mecanismo por dentro, una capa escondida bajo una pantalla, un objeto puesto a prueba, una historia con
una persona, un comportamiento demostrado con un experimento, una cifra extrema por partes). Al enseñar el guion, di en
una línea cuál vas a seguir y por qué. Si ninguno encaja, díselo al creador y pídele un reel que le guste; si no tiene,
usa el más cercano.

## 2. Medirla

1. `node herramientas/referencia.mjs <enlace o archivo> --proyecto <proyecto>`, o
   `node herramientas/referencia.mjs --estanteria <nombre> --proyecto <proyecto>`: deja en `referencia/` el vídeo, sus
   medidas (cortes, frases con su segundo, paleta, palabras por segundo, sonido) y sus hojas de fotogramas. Si un
   enlace no se puede bajar, pide el archivo al creador. Pon `"referencia": "referencia/reel.mp4"` en `guion.json`.
2. Mira `referencia/hoja-hook.jpg` y `hoja.jpg` a tamaño completo. Una cámara que sigue a algo parece un corte y no lo
   es: compruébalo en los fotogramas. Para ver cómo se mueve un momento, saca sus fotogramas seguidos:
   `node herramientas/comparar.mjs referencia/reel.mp4 --en 3,3.1,3.2,3.3,3.4 --salida referencia/momento.jpg`.
3. Si es de la estantería, `referencia/referencia.md` ya está escrito: léelo entero. Si la pasó el creador, escríbelo:
   - **Una fila por plano:** sus segundos, qué llena el plano y cuánto, qué se mueve (las cosas y la cámara: hacia
     dónde y a qué velocidad), el texto en pantalla (dónde y de qué tamaño), qué se dice y qué suena.
   - **El hook:** qué hay en el fotograma 0, qué pasa en el primer segundo, la forma de su frase y si pasa las pruebas
     de `viral.md`.
   - **El estilo:** el fondo y los sitios, los colores y su papel (lo que importa, lo invisible que se explica, lo que
     está mal), el tipo de dibujo y su nivel de detalle, cómo es el texto, cómo cambia de escena, cuándo se mueve la
     cámara, el ritmo de la voz y el sonido.

## 3. Qué se copia

- Sus planos: cuántos, cuánto dura cada uno, qué llena la pantalla y a qué tamaño, desde dónde, qué se mueve y en qué
  palabra, cómo cambia de uno a otro.
- Su manera de explicar: qué demuestra cada plano (un experimento, una capa escondida, un número que cambia, un antes y
  un después) y con qué.
- Dónde va su texto y de qué tamaño (si no lleva subtítulo, el nuestro tampoco: `"subtitulos": "no"`).
- Su estilo y su nivel de acabado: fondo, colores, tipo de dibujo, detalle, ritmo. Pasa sus colores y su letra a
  `estilo.css` del proyecto.
- Cuándo se mueve su cámara, y cuándo no.
- Cuándo suena cada cosa y cuánto.
- Su hook, solo si pasa las pruebas de `viral.md`, y más o menos cuánto dura (`guion.md`).

## 4. Qué nunca se copia

Sus palabras, sus dibujos tal cual y su voz: todo se escribe y se dibuja de nuevo, para este tema. Tampoco nada que
rompa `viral.md`, aunque la referencia lo haga. Su música no va dentro del vídeo: si la tiene, dile al creador cuál es,
por si puede ponerla desde la biblioteca de la red social. Sus datos no son datos: se comprueban o se quitan.

## 5. Qué puede cambiar

Solo lo que obliga el tema, `viral.md` y el cierre del creador. Cada cambio, con su razón en `notas.md` («el nuestro es
un planeta, no un coche»). «Queda mejor» no es una razón. Si el tema no cabe en su forma, díselo al creador en una
línea y copia solo lo que encaje.

## 6. Es la vara

`revisar.mjs` saca `comparacion.jpg`, el nuestro y el suyo en los mismos segundos, y `frases.jpg`, cada frase nuestra
en su palabra. La pregunta es siempre la misma: ¿se entiende lo que se dice igual de bien, y está igual de bien hecho?
Un plano que se separa del suyo sin una razón escrita se arregla. Las medidas (cuánto está quieto, cuánto llena) son
datos para comparar con los suyos, nunca una nota que aprobar.

## Un estilo para siempre

Si el creador quiere el aspecto de un vídeo en todos los suyos (colores, dibujo, letra), guárdalo en
`trabajo/estilo/` (el vídeo, su estilo en `estilo.md` y su `estilo.css` en `trabajo/estilo.css`, que copia cada
proyecto nuevo). Ese aspecto manda sobre el de la casa y sobre el de cualquier referencia; los planos y el ritmo
siguen saliendo de la referencia.
