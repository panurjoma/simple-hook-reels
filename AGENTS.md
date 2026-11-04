# Reels explicativos

Esta carpeta hace reels explicativos animados en el ordenador de quien la abre, con la IA en la que la está leyendo.
Le das una idea y sale el vídeo, listo para publicar; si quieres, más versiones con otros hooks. Nada se publica
solo.

## Al abrir la carpeta

- Si te dicen «Configuración», «configúrame», «set me up» o es la primera vez: `node herramientas/doctor.mjs`, instala
  tú lo que falte, abre la página de la clave de voz (`node herramientas/clave.mjs`) para que pegue la suya, aunque
  ya haya una, y pregunta lo de las preferencias (skill
  `video`, «Antes del primer vídeo»). Luego di en una línea que ya puede pedir un vídeo, por ejemplo «Hazme un vídeo
  sobre por qué el cielo es azul».
- Cualquier petición de vídeo, reel, guion, hooks, ideas para vídeos o recrear un reel: sigue la skill `video`
  (`.claude/skills/video/SKILL.md`; la misma en `.agents/skills/video/`). Léela entera una vez antes de empezar, con
  sus `references/` cuando la etapa lo diga.
- Hay dos modos: `automatizado` e `interactivo`. Usa el indicado por el creador o por la aplicación; si no se indica,
  usa el interactivo. En el automatizado no esperes aprobaciones del guion ni del avance: toma las decisiones necesarias
  con las preferencias disponibles y continúa. Los efectos de sonido van cuando encajen, pero solo los aprobados de `sonidos/`; si no hay, sin ellos y anotado en `notas.md`. En el interactivo conserva las
  dos paradas de aprobación de la skill.
- En cada vídeo, tras generar y revisar técnicamente el primer hook visual, llama una sola vez al revisor
  `revisor-hook` de `.claude/agents/revisor-hook.md`: dale el avance y sus hojas, espera su informe y aplica una ronda
  de ajustes concretos. Comprueba el resultado sin volver a llamar al revisor. En automático continúa con el resto del
  vídeo; en interactivo enseña el avance para su aprobación. Si no se puede lanzar el agente, haz tú esa revisión una
  sola vez y anótalo en `notas.md`. No necesita acceso a otros proyectos.
- Sigue `trabajo/estilo/estilo.md`: alterna vistas de conjunto con acercamientos detallados de partes del objeto,
  aunque el objeto quede parcialmente fuera del encuadre. No mantengas siempre una perspectiva lejana ni exijas ver el
  objeto entero; conserva la información importante en la zona segura. Registra en el plan los acercamientos que
  explican una pieza o mecanismo, también cuando la referencia use un plano más abierto.
- Si te dicen «doctor» o algo se rompe: `node herramientas/doctor.mjs` y arregla lo que diga.

## Pablo, el profesor (en todos los vídeos)

Cada vídeo lleva a Pablo: un muñeco pequeño de cuerpo entero, chico de unos 30 años, moreno (piel de chocolate con leche),
pelo castaño corto, gorra gris y gafas de sol de espejo azul (basado en la cara del creador), camiseta burdeos y pantalón
negro, abajo a la izquierda pero no pegado al borde (`K.PERSONAJE`: x 65 a 285, y 1090 a 1440), moviendo todo el cuerpo
como un profesor. Es la voz del vídeo: voz masculina de España, no demasiado grave (`voz.edge` en `guion.json`, edge-tts, una sola toma).
Lo monta `montar.mjs` solo (`plantilla/profesor.html`); su boca sigue la voz. Todas las escenas son en 3D (`kit3d.js`,
`recursos/mundo3d.js`). Estructura del guion: 1) el hook, **una pregunta corta** que ponga la duda («¿Cómo sabe tu móvil dónde estás
en mitad del océano?»); 2) directo a explicar, como un profesor, sin presentarse
(nunca «soy ingeniero…» ni frases de autoridad: el creador lo ha prohibido en todos los vídeos). Nada importante de
las escenas va bajo Pablo. Su portada también lo lleva. `"personaje": false` en `guion.json` lo
quita, solo si el creador lo pide.

**Curiosidades y contexto:** además de explicar, cada vídeo da detalles técnicos curiosos y pone el tema en contexto (otras
opciones, quién las controla, límites), en lenguaje natural y con fuente (`references/guion.md`).

**Duración:** menos de 90 s (minuto y medio) por reel, el límite para compartirlo como reel o short (`montar.mjs` y `entregar.mjs` fallan a partir de 90 s). Dentro de ese tiempo, elige lo
más interesante del tema y cuéntalo **cerrado**: con principio, desarrollo y final, nunca a medias ni dejando algo para
«otro vídeo». Si no cabe entero, recorta detalles, no el final (`references/guion.md`).

## Portadas (todos los vídeos, estilo de la portada del GPS)

Toda portada se hace a propósito para llamar la atención, no es un frame suelto del vídeo: título hook en tres líneas
grandes (la 2.ª en dorado) arriba, un frame 3D debajo y Pablo abajo a la izquierda. El título es una definición clave que
engancha. Cada proyecto lleva `portada.json` (`{"lineas":[3 líneas],"segundo":1}`); `entregar.mjs` la genera con
`herramientas/portada.mjs` y falla si falta. Modelo: `trabajo/salida/2026-11-02-gps-sin-cobertura-pablo/portada-h1.jpg`.

## Publicar (dos pipelines aparte, solo si el creador lo pide)

Publicar es un paso aparte, posterior al vídeo: o **Instagram** o **YouTube**, cada uno con su conector. Parte siempre
del vídeo de salida identificado en `trabajo/salida/<proyecto>/` (`<nombre>-h1.mp4`, `caption.txt`, `portada-h1.jpg`).
Se genera un solo vídeo por proyecto, con las medidas de Instagram Reels, que valen también para YouTube Shorts (9:16, 1080x1920, H.264/AAC 48 kHz, 60 fps, ≤300 MB, moov al principio, GOP cerrado); `entregar.mjs` lo reencoda y las comprueba.

- **Instagram:** conector `fase-cero-instagram` (`instagram_publicar_reel`): `archivo` = el mp4 de salida, `texto` =
  `caption.txt`, `portada` = `portada-h1.jpg` (la misma portada del proyecto, nunca un frame: se pasa a JPG, se sube
  a `fase-zero-assets` y va como `cover_url`) y `comentario` = `hashtags.txt` (los hashtags van en el primer comentario).
  Público al momento. Cuenta: `instagram_cuenta`. Fotos: `instagram_publicar_foto` con `archivo` local (se convierte a
  JPG y se sube a `fase-zero-assets`; Instagram la lee desde esa URL) y `comentario` para hashtags.
- **API de Facebook/Instagram:** cada vez que haya que consultar cómo usarla, parte de
  https://developers.facebook.com/documentation/development/
- **YouTube:** conector `fase-cero-youtube` (`youtube_subir`, `youtube_miniatura`): el mp4, título y descripción de
  `caption.txt`, la portada como miniatura; en privado salvo que diga otra cosa.
- Solo en el momento en que lo pida, y diciendo en cuál. Si no dice en cuál, pregunta. Antes de elegir hook o subir,
  lee `trabajo/registro.md`.

## La carpeta

```
herramientas/   los pasos fijos: nuevo, referencia, guion, voz, sonido, montar, revisar, portada, entregar, doctor, clave
                (cada una dice cómo se usa con --ayuda)
estanteria/     vídeos que ya funcionaron, plano a plano: cada vídeo nuevo copia la forma de uno (LEEME.md)
plantilla/      el esqueleto de una escena, el kit de movimiento y el aspecto de la casa (estilo.css)
sonidos/        los efectos de sonido aprobados de oído (LEEME.md)
trabajo/
  registro.md       lo que ha fallado y funcionado, para no repetir errores (se lee antes de decidir)
  preferencias.md   lo que vale para todos sus vídeos (idioma, público, cierre, estilo), con sus palabras
  proyectos/        un vídeo por carpeta, con su guion, su voz, sus escenas y sus notas
  salida/           los vídeos terminados, con sus portadas y el texto del post
.env.local      sus claves; las escribe la página de claves; nunca se enseñan ni se comparten
```

## Reglas

- Nunca pidas una clave en el chat: `node herramientas/clave.mjs`.
- Nunca le pidas al creador que ejecute un comando: tienes una terminal en su ordenador. Instalar Node, ffmpeg o
  Python es trabajo tuyo. Lo único suyo es escribir una contraseña o dar un permiso que el sistema no deja dar a nadie
  más. Si algo falla por la máquina (Windows, Mac, una ruta), arréglalo sin bajar la calidad y apúntalo en
  `trabajo/maquina.md`.
- Antes de dar el guion por bueno, llama una sola vez al revisor `revisor-veracidad-guion`
  (`.claude/agents/revisor-veracidad-guion.md`): busca en fuentes fiables cada dato, cifra y causa del guion y los
  traduce a lenguaje simple y cualitativo (sin abusar de cifras exactas: «una velocidad muy alta», no «500 km/h»).
  Corrige o quita lo no confirmado, pasa sus fuentes a `investigacion.md` y anótalo en
  `notas.md`. Después de que el hook y un pasaje estén hechos, llama una sola vez a `revisor-veracidad-imagen`
  (`.claude/agents/revisor-veracidad-imagen.md`), que comprueba que formas, proporciones, unidades y números en
  pantalla sean ciertos; aplica sus correcciones en la misma ronda que las de `revisor-hook`. Si no se puede lanzar
  alguno, haz tú esa revisión una sola vez, con búsquedas en la web, y anótalo.
- Después, y antes de enseñar el guion en interactivo, llama una sola vez al revisor `revisor-lenguaje`
  de `.claude/agents/revisor-lenguaje.md`: lee el guion como una mujer de 45 años, con dos hijos y toda la vida
  cuidando de su casa, y dice si se imagina y entiende lo que se explica o qué palabras y frases simplificar. Aplica una
  ronda de sus cambios sin tocar datos ni cifras, anótalo en `notas.md` y no vuelvas a llamarlo. Si no se puede lanzar
  el agente, haz tú esa revisión una sola vez y anótalo.
- El creador autoriza los subagentes `revisor-veracidad-guion`, `revisor-lenguaje`, `revisor-hook` y
  `revisor-veracidad-imagen` para las revisiones indicadas; se ejecutan en secuencia. Para otros
  subagentes o trabajo en paralelo, pregúntale antes.
- Nunca publiques ni envíes nada en su nombre. Los conectores `fase-cero-youtube` y `fase-cero-instagram` (`node herramientas/youtube-auth.mjs` / `instagram-auth.mjs`)
  solo publican si el creador lo pide en ese momento, tras enseñarle vídeo, texto y portada; YouTube siempre en privado salvo que diga otra cosa.
- Cada vídeo sale de su referencia y de esta carpeta: no abras ni copies otros proyectos de `trabajo/proyectos/`,
  salvo que el creador te pida cambiar uno de ellos.
- Memoria del ciclo: `trabajo/registro.md` (texto plano) guarda lo que ha fallado y lo que ha funcionado. Léelo **antes
  de decidir** (tema, estructura, hook, escenas, entrega y publicar): lo que ya falló no se repite y lo que funcionó se
  copia. Actualízalo al terminar cada etapa importante y cuando el creador cuente un resultado. Es el único sitio para
  eso: no uses tu memoria personal. Lo que el creador quiere para siempre va a `trabajo/preferencias.md`, con sus
  palabras; tus conclusiones no son preferencias suyas.
- Corto y claro en todo lo que le escribas. Una frase donde iban dos.
