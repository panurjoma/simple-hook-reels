---
name: video
description: "Hace un reel explicativo animado, vertical, sin cara: una voz explica y en pantalla se ve, en movimiento y a tiempo con cada palabra, la cosa real de la que habla. De una idea sale el vídeo entero, con un hook que para, un guion que se ve hasta el final y una imagen que no se puede dejar de mirar: guion, voz, escenas, sonido, revisión y entrega. Úsalo cuando pidan un vídeo, un reel, «hazme un vídeo sobre...», ideas para vídeos, un guion o hooks para un reel, recrear o copiar un reel, o cambiar uno ya hecho."
---

# Video

Una idea entra; sale un reel listo para publicar, sin cara y sin grabar nada: una voz explica y la pantalla es la
explicación.

## Cómo sale bueno

1. **Lo que hace que cualquier vídeo se vea entero** está en `references/viral.md`: el hook que para, el guion que
   engancha hasta el final, cada frase que se ve, el movimiento con sentido, el sonido que acompaña. Se aplica siempre
   y manda sobre todo lo demás.
2. **Cada vídeo copia la forma de otro que ya funcionó.** Los buenos no se diseñan desde cero: salen de un reel que ya
   explotó, plano a plano, contando otro tema. Ese reel es el que pase el creador o, si no pasa ninguno, el de
   `estanteria/` que mejor encaje con cómo se explica el tema (`estanteria/LEEME.md`). De él salen los planos, el
   aspecto, el ritmo y cómo se mueve (`references/referencia.md`). Nunca se inventa el aspecto de un vídeo.

## Registro (antes de decidir y al terminar)

`trabajo/registro.md` es la memoria plana del ciclo: lo que ha fallado (no se repite) y lo que ha funcionado (se copia),
con el resultado real que cuente el creador. **Léelo al empezar cada vídeo** y antes de decidir el tema y la estructura,
el hook, las escenas, la entrega y cualquier publicación. **Actualízalo** al cerrar el guion, tras las revisiones, al
entregar y cada vez que el creador cuente un resultado. Una línea por hecho, con fecha y proyecto; solo hechos.

`trabajo/bitacora.md` es la memoria automática (hechos y errores de las herramientas) y cada vídeo entregado tiene
`estado.json` (subido o no en YouTube e Instagram; métricas más adelante). Antes de elegir tema, hook o público, lanza
`node herramientas/estado.mjs` y léelo junto al registro. Pablo cambia de camiseta (color vivo al azar) en cada vídeo.

## Antes del primer vídeo

1. `node herramientas/doctor.mjs`. Lo que falte, lo instalas tú. Nunca le pidas al creador que ejecute nada.
2. Si no hay clave de ElevenLabs, `node herramientas/clave.mjs` abre una página para pegarla. Nunca en el chat. Sin
   clave, la voz sale con Kokoro en local, peor; díselo una vez.
3. Si no existe `trabajo/preferencias.md`, pregunta en una sola pregunta: en qué idioma y para quién son sus vídeos,
   cómo quiere cerrarlos (por ejemplo «Envíaselo a ese amigo que...») y si quiere un aspecto fijo para todos
   (`references/referencia.md`, al final). Guárdalo en dos o tres frases con sus palabras. No vuelvas a preguntarlo.

## Las etapas

Hay dos modos. En el interactivo se para dos veces: al enseñar el guion y al enseñar el hook con un trozo del vídeo.
En el automatizado se sigue sin esperar esas aprobaciones, usando las preferencias disponibles y sin efectos de sonido
salvo que el creador los haya pedido. Usa el modo indicado por el creador o la aplicación; si no se indica, usa el
interactivo. Si el creador pide ver algo antes, se para ahí.

| # | Etapa | Qué sale | Cómo |
|---|---|---|---|
| 0 | Registro | lo aprendido, aplicado | lee `trabajo/registro.md` |
| 0b | Tema, si no lo hay | cinco propuestas de temas nunca tratados (hook, qué se ve, curiosidad) y el creador elige; `trabajo/temas.md` al día | `.claude/agents/catedratico-temas.md`, una sola vez |
| 1 | Proyecto | `trabajo/proyectos/<fecha>-<slug>/` | `node herramientas/nuevo.mjs "<tema>"` |
| 2 | Investigación | `investigacion.md`: cada dato con su fuente y la frase exacta, comprobado hoy | tú, en la web |
| 3 | Referencia, siempre | `referencia/`: el vídeo, sus medidas, sus hojas y `referencia.md`, plano a plano | `node herramientas/referencia.mjs <enlace o archivo> --proyecto <proyecto>`, o `--estanteria <nombre>`; `references/referencia.md` |
| 4 | Guion | `guion.json` y `pie.txt`, que pasan `node herramientas/guion.mjs <proyecto>` y las revisiones de `revisor-veracidad-guion` y `revisor-lenguaje`, en ese orden. **Interactivo: lo aprueba y dice si quiere efectos; automatizado: continúa** | `references/guion.md`; `.claude/agents/revisor-veracidad-guion.md`; `.claude/agents/revisor-lenguaje.md` |
| 5 | Plan | `plan.md`: cada frase, qué hace la referencia en ese momento y qué hacemos nosotros | `references/escenas.md` |
| 6 | Voz | `voz/h1.wav` con el segundo de cada palabra | `node herramientas/voz.mjs <proyecto>` |
| 7 | Hook y un pasaje | escenas revisadas técnicamente y una vez por `revisor-hook` y por `revisor-veracidad-imagen`, seguidas de una ronda de ajustes. **Interactivo: enseña el avance para aprobación; automatizado: continúa** | `references/escenas.md`; `node herramientas/revisar.mjs <proyecto> --parcial`; `.claude/agents/revisor-hook.md`; `.claude/agents/revisor-veracidad-imagen.md` |
| 8 | El resto | todas las escenas, igual de fieles a la referencia | `references/escenas.md` |
| 9 | Sonido, si lo quiso | `sonidos.json` y los efectos, como mucho cuatro, cada uno de algo que se ve | `node herramientas/sonido.mjs <proyecto>` |
| 10 | Revisión | nada fuera de la zona segura y sus hojas miradas al lado de la referencia, tres pasadas | `node herramientas/revisar.mjs <proyecto>` |
| 11 | Entrega | el vídeo en `trabajo/salida/<proyecto>/` (un solo mp4, medidas de Reels que valen para Shorts: 9:16 1080x1920 60 fps) con su portada (estilo GPS, de `portada.json`: título hook en 3 líneas, la 2.ª en dorado, Pablo abajo a la izquierda; nunca un frame suelto) y `caption.txt`; la ruta, en el chat | `node herramientas/entregar.mjs <proyecto>` |
| 12 | Versión en inglés, siempre | `<proyecto>-en`: mismas escenas, voz, subtítulos y rótulos en inglés (portada, `caption.txt` y hashtags también); se hace con el vídeo en español ya entregado y sin aprobaciones extra | `references/ingles.md` |

Cada herramienta dice cómo se usa con `--ayuda`; no leas su código. Si algo no funciona en esta máquina, arréglalo y
apúntalo en una línea en `trabajo/maquina.md`; léelo antes de cada vídeo.

Antes de dar el guion por bueno (y de enseñarlo, en interactivo), cuando `guion.mjs` ya no diga nada, lanza una sola vez
por vídeo y en este orden:
1. `revisor-veracidad-guion`: busca en fuentes fiables cada dato, cifra y causa del guion y los traduce a lenguaje
   simple. Dale la ruta del proyecto, de `guion.json` y de `investigacion.md`. Aplica una ronda de sus correcciones
   (corrige o quita lo no confirmado), pasa sus fuentes y frases exactas a `investigacion.md` y anota las razones en
   `notas.md`.
2. `revisor-lenguaje`: con el guion ya verificado. Dale la ruta del proyecto y de `guion.json`. Aplica una ronda de sus
   cambios de redacción, sin tocar datos de `investigacion.md`, anótalos en `notas.md` y vuelve a pasar `guion.mjs`,
   sin volver a llamar a ninguno de los dos.

Si no puedes lanzar `revisor-veracidad-guion`, lee su archivo en `.claude/agents/`, haz tú esa revisión una sola vez
buscando en la web y anota que fue sin agente independiente. Si no puedes lanzar ese agente, lee `.claude/agents/revisor-lenguaje.md`, haz tú esa revisión una
sola vez y anota que fue sin agente independiente. Si el texto lo trajo el creador, no lo reescribas: solo avísale de
lo que no se entiende.

Tras la primera revisión parcial, lanza `revisor-hook` una sola vez por vídeo y espera su informe. Dale la ruta del
proyecto actual, `avance.mp4`, las hojas de `build/<id>/`, la referencia y el guion. Aplica una ronda de sus ajustes
visuales concretos, anótalos en `notas.md` y vuelve a revisar técnicamente lo tocado, sin volver a llamar al agente.
En automático continúa después con el resto del vídeo; en interactivo enseña el avance para aprobación. Si no puedes
lanzar ese agente, lee `.claude/agents/revisor-hook.md`, haz tú esa revisión una sola vez y anota que fue sin agente
independiente. En interactivo, nunca cambies el texto aprobado sin volver a pedir aprobación.

En esa misma etapa, después de `revisor-hook` y en secuencia, lanza `revisor-veracidad-imagen` una sola vez por vídeo.
Dale la ruta del proyecto, `plan.md`, `guion.json`, `investigacion.md`, las escenas hechas, `recursos/` y las hojas de
`build/<id>/`. Aplica en la misma ronda sus correcciones de formas, proporciones, unidades y números en pantalla, y
anótalas en `notas.md`. Si algo obliga a cambiar lo que dice la voz, en automático corrígelo si el dato era falso y
repite `guion.mjs`; en interactivo, pide aprobación. Si no puedes lanzarlo, haz tú esa revisión una sola vez
siguiendo `.claude/agents/revisor-veracidad-imagen.md` y anótalo.

Si el creador trae su propio texto, ese es el guion: no lo reescribas ni le quites datos; solo avisa si algo parece
falso. Si trae un vídeo, esa es la referencia.

Cada vídeo se entrega en dos versiones, español e inglés (etapa 12, `references/ingles.md`); el inglés no lleva revisores nuevos.

Al entregar, apunta en `trabajo/registro.md` lo que falló y lo que funcionó en este vídeo y, en una línea: si quiere otra versión con uno de los hooks de reserva, que te lo diga; y que el siguiente
vídeo lo pida en una conversación nueva.

## Reglas de la casa

- El creador autoriza `revisor-veracidad-guion`, `revisor-lenguaje`, `revisor-hook`, `revisor-veracidad-imagen` y
  `catedratico-temas` (propone temas) para lo indicado, en secuencia; para otros subagentes o trabajo en paralelo,
  pregúntale antes.
- Nunca publiques ni envíes nada en su nombre.
- Corto y claro en todo lo que escribas al creador.
- Cada vídeo sale de su referencia y de esta carpeta. No abras ni copies otros proyectos de `trabajo/proyectos/`,
  salvo que el creador te pida cambiar uno de ellos.
- Lo que dice de este vídeo se arregla en este vídeo. Solo va a `trabajo/preferencias.md` lo que él quiere para todos
  los siguientes («a partir de ahora», «nunca quiero», o la misma corrección en dos vídeos), con sus palabras. Tus
  conclusiones sobre por qué funciona un vídeo nunca son una preferencia suya, y un fallo nuestro tampoco: se arregla y
  ya. No guardes nada de esto en tu memoria: la siguiente conversación no debe heredar tus conclusiones.
- Una medida nunca es una razón para mover la cámara, añadir polvo o agrandar algo. Si un plano no dice nada, cambia
  lo que se ve, no el número.
- Lee esta skill y cada `references/` una vez por vídeo, cuando su etapa lo diga. En la web, búsquedas normales y pocas
  páginas; lo encontrado va a `investigacion.md` y no se busca otra vez.
- Solo si el creador pide tocar el vídeo a mano: `npx hyperframes@0.8.167 preview` dentro de `build/<id>/`.
