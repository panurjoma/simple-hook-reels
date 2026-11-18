# El guion

El guion es el vídeo. Se escribe con `viral.md`, que manda siempre. La referencia (la del creador o la de la
estantería, `referencia.md`) solo ayuda en dos cosas:
- **Su hook,** si pasa las pruebas de `viral.md`: es el mejor punto de partida. Se coge su forma y se llena con la cosa
  y las palabras de este tema. Si no las pasa (empieza por una fecha, suena a documental), no se usa.
- **Cuánto dura:** más o menos lo que ella, si la historia cabe. Nunca se alarga para llegar.

Su manera de contar nunca pasa por encima de `viral.md`.

## Primero, cuatro líneas

1. **Quién lo ve:** el público de `trabajo/preferencias.md`. Qué usa, ve o cree que este tema toca.
2. **El tirón:** lo que hace que este tema sea casi increíble para esa persona. Uno, no tres.
3. **La pregunta:** la que deja el hook en la cabeza. Se contesta del todo solo al final.
4. **La prueba:** los datos de `investigacion.md` que la contestan, cada uno con un número o una cosa con nombre.

## El hook

- Escribe cuatro, cada uno con otra de las formas de `viral.md` (el de la referencia, si sirve, es uno). Cada uno con
  su imagen: qué llena el fotograma 0 y qué se mueve.
- Los cuatro pasan las cinco pruebas de `viral.md`.
- Elige comparándolos de dos en dos: ¿con cuál se pararía más gente que no te sigue? Nunca con nota. Si dudas, el más
  simple. Los otros tres quedan de reserva.

## El cuerpo

- **Detalles curiosos y contexto (pedido del creador):** además de explicar cómo funciona, cada vídeo suelta detalles técnicos
  curiosos que no son imprescindibles pero enganchan («hay unos treinta dando vueltas a la Tierra») y pone el tema en su
  contexto: qué otras opciones hay, quién las controla o fabrica, de dónde vienen, qué límites tienen. Se cuentan en lenguaje
  natural, con fuente fiable y cifras en forma cualitativa si no están claras; van donde encajan en el hilo, sin cortarlo,
  y el vídeo crece lo que haga falta (ver Duración) para que nunca se quede estático.
- **Duración (pedido del creador):** menos de 90 s (minuto y medio; Instagram no admite reels de más; `montar.mjs` y `entregar.mjs` fallan a partir de 90 s). Busca la
  información más interesante que quepa en ese tiempo y **cuenta la historia cerrada**: lo que abre el hook se contesta
  y se remata dentro del mismo vídeo, nunca a medias ni «en el próximo». Si no cabe, recorta detalles curiosos o contexto,
  nunca el final. Con fuentes fiables y en el mismo tono sencillo. Cada frase añadida se ve y avanza; no se rellena.

- Escribe el final justo después del hook: la frase que contesta su pregunta y le da la vuelta. El cuerpo es el camino
  de uno a otro.
- La primera frase descarta lo que el espectador ya está pensando, o dice la pregunta en voz alta.
- Cada frase contesta lo que dejó la anterior y abre lo siguiente. Una idea por frase, con su porqué dentro («...,
  así que...», «..., porque...»); lo que pasa primero y el nombre después.
- Cada frase se tiene que poder ver: si no se puede enseñar de forma llamativa, se reescribe o se quita.
- Las palabras son nuevas: nunca las de la referencia ni las de otro vídeo. Las comparaciones, del tema y de la vida
  diaria del público.
- La voz se graba de una toma, como habla una persona: no se estira para encajar en segundos fijos.
- **Cierre:** el de `trabajo/preferencias.md`, tal cual.

## Pablo habla

La voz es la de Pablo, un profesor joven de unos 30 años. El guion lleva, en orden:
1. **El hook:** una pregunta corta (`aperturas`), con las cinco pruebas de `viral.md`.
2. **La explicación**, directa, sin presentarse ni decir su profesión (prohibido en todos los vídeos).
3. **El cierre** de `trabajo/preferencias.md`.

## Los datos

En lo que dice la voz y se ve en pantalla, lenguaje común y cualitativo, sin abusar de datos exactos: no «tres
nanosegundos» ni «500 km/h» sino «un tiempo muy pequeño» o «una velocidad muy alta». El número exacto vive en
`investigacion.md`; en el guion solo entra el que la idea necesita para entenderse, redondeado y con algo que se sienta.

Cada cifra, nombre y fecha está en `investigacion.md` con su fuente y la frase exacta, comprobada hoy. Nunca inventes
una cifra; si dudas, quítala y dilo. Redondea solo hacia lo honesto («unos», «más de» solo si es verdad) y conserva el
alcance («en EE. UU.», «según la propia empresa»). Lo que dice un vídeo de referencia no es un dato.

## guion.json

```json
{
  "titulo": "...", "slug": "...", "idioma": "es",
  "subtitulos": "arriba",
  "aperturas": [
    { "id": "h1", "escena": "hook", "frases": [ { "texto": "El hook, dicho.", "clave": "palabra" } ] }
  ],
  "reserva": [
    { "id": "h2", "escena": "hook-2", "frases": [ { "texto": "...", "clave": "..." } ], "imagen": "qué llena la pantalla y qué se mueve" }
  ],
  "cuerpo": [
    { "texto": "Una frase.", "escena": "nombre-de-escena", "clave": "palabra" }
  ],
  "escenas": { "nombre-de-escena": { "entrada": "corte" } }
}
```

- `referencia`: solo si el creador pasó un vídeo (`referencia.md`).
- `texto` es lo que dice la voz y lo que sale en el subtítulo. `dicho` (opcional) es cómo debe sonar si es distinto
  (números en letra, siglas: «IA» como «i a»).
- `clave`: la palabra de la frase que va en su recuadro. Una por frase como mucho. Leídas de arriba abajo, las claves
  deberían contar el vídeo.
- `escena`: en qué escena va cada frase. Una escena es un plano (un sitio y su cámara): varias frases seguidas van en
  la misma escena mientras se sigan viendo en el mismo plano.
- `escenas.<nombre>.entrada`: cómo se entra en esa escena: `corte` (lo de siempre si no dices nada), `fundido`,
  `zoom`, `barrido` o `lateral`.
- `subtitulos`: `arriba` (lo de siempre), `abajo` o `no`, como la referencia si la hay.
- El cuerpo es el mismo para todas las aperturas: su primera frase tiene que seguir bien a cada hook.
- `pie.txt`: el texto del post. La primera línea engancha; sin hashtags ni rayas largas; el valor va en el texto.
- `hashtags.txt`: una sola línea con 18 a 24 hashtags (Instagram admite 30), mitad en español y mitad en inglés para
  llegar a más gente: unos 10 a 12 en español y 8 a 10 en inglés (los mismos temas, no traducciones forzadas), de lo más
  amplio a lo más concreto (tres o cuatro grandes por idioma, como #ciencia #curiosidades / #science #didyouknow, y el
  resto del tema, p. ej. #aviacion / #aviation). Sin repetir, sin espacios ni tildes dentro. Van en el primer comentario
  de Instagram, no en el pie.
  `entregar.mjs` lo copia a `trabajo/salida/<proyecto>/`.

## Antes de enseñarlo

1. `node herramientas/guion.mjs <proyecto>` comprueba lo que se puede comprobar solo: cómo empieza cada hook y si
   suena a noticia o a anuncio. Lo que diga se reescribe, y se vuelve a pasar hasta que no diga nada. Si el texto lo
   trajo el creador, no se reescribe: solo se le avisa.
2. Una pasada entera como alguien que pasa de largo (`viral.md`, «Antes de enseñar nada»): la frase en la que te irías
   o que un niño no entendería se reescribe en esa misma pasada.
3. Una vez por vídeo, llama a `revisor-veracidad-guion` (`.claude/agents/revisor-veracidad-guion.md`): busca en
   fuentes fiables cada cifra, nombre, fecha y causa del guion y los traduce a lenguaje simple. Corrige o quita lo que
   no confirme, pasa sus fuentes y frases exactas a `investigacion.md` y apunta las razones en `notas.md`. No lo
   vuelvas a llamar. Si el texto lo trajo el creador, no se reescribe: solo se le avisa de lo que parece falso.
4. Una vez por vídeo, y ya con los datos verificados, llama a `revisor-lenguaje` (`.claude/agents/revisor-lenguaje.md`): lee el guion como una madre de
   45 años, versátil y sin formación técnica, y dice si se imagina y entiende lo que se explica o qué frases cambiar.
   Aplica una ronda de sus cambios, sin tocar datos ni cifras de `investigacion.md`, apunta las razones en `notas.md` y
   vuelve a pasar `guion.mjs`, sin volver a llamarlo. Si el texto lo trajo el creador, no se reescribe: solo se le
   avisa de lo que no se entiende.
5. En modo interactivo, enséñalo en el chat: el hook con lo que se verá en su primer segundo, el cuerpo y, debajo, los tres de reserva en
   una línea cada uno. Si la referencia es de la estantería, di en una línea cuál y por qué. En el mismo mensaje, dos
   preguntas cortas: si lo aprueba, y si quiere efectos de sonido (el creador los quiere cuando encajen: propón los que ayudarían y dónde; si `sonidos/`
   está vacío, dilo). Apunta la respuesta en `guion.json` como `"sonido": true` o `false`.
   En modo automatizado, no esperes aprobación: continúa con el guion y apunta `"sonido": true` solo si hay sonidos aprobados en `sonidos/` que encajen, y `false` si no. Si el creador aportó el texto, consérvalo sin reescribir.
