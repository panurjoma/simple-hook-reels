#!/usr/bin/env node
// comparar.mjs <video> [<otro video>] --en 0,0.5,1 --salida hoja.jpg
//
// Una hoja de fotogramas en los segundos pedidos, en una rejilla casi cuadrada, con el segundo escrito en cada uno.
// Con dos vídeos, cada segundo lleva el nuestro y el otro lado a lado, para copiar un reel midiendo, no a ojo.
// Las celdas se encogen cuando hay muchas (de 1/4 a 1/8 del tamaño real): una imagen grande cuesta tokens cada vez
// que la IA relee la conversación, y más allá de un tamaño tampoco se ve mejor.
// En lo nuestro van pintadas en rojo las franjas que tapa Instagram (SEGURA en _comun.mjs): nada importante ahí.
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { SEGURA, arg, ffm, posicional, rotulo } from "./_comun.mjs";

// Las guías de la zona segura sobre una celda de w × h.
function guias(w, h) {
  const s = w / 1080, px = (v) => Math.round(v * s), z = SEGURA;
  return [
    `drawbox=x=0:y=0:w=${w}:h=${px(z.arriba)}:color=red@0.18:t=fill`,
    `drawbox=x=0:y=${px(z.abajo)}:w=${w}:h=${h - px(z.abajo)}:color=red@0.18:t=fill`,
    `drawbox=x=${px(z.botones.x)}:y=${px(z.botones.y)}:w=${w - px(z.botones.x)}:h=${px(z.abajo) - px(z.botones.y)}:color=red@0.18:t=fill`,
    `drawbox=x=${px(z.izq)}:y=${px(z.arriba)}:w=${px(z.der - z.izq)}:h=${px(z.abajo - z.arriba)}:color=red@0.6:t=1`,
  ].join(",");
}

// La rejilla: cada grupo es una fila corta de celdas { video, t, texto, guias } que van juntas (un segundo en dos
// vídeos, o un corte antes, durante y después), y los grupos se colocan en una rejilla casi cuadrada de unos 2
// megapíxeles.
export function rejilla(grupos, salida) {
  const k = Math.max(...grupos.map((g) => g.length)), n = grupos.length;
  const escala = [4, 5, 6, 8].find((e) => n * k * (1080 / e) * (1920 / e) <= 2.0e6) || 8;
  const w = 1080 / escala, h = 1920 / escala;
  // Columnas: la rejilla más cuadrada con menos huecos.
  let cols = 1, mejor = Infinity;
  for (let c = 1; c <= n; c++) {
    const filas = Math.ceil(n / c), nota = Math.abs(Math.log((c * k * w) / (filas * h))) + (c * filas - n) * 0.08;
    if (nota < mejor) { mejor = nota; cols = c; }
  }
  const filas = Math.ceil(n / cols);
  const tmp = join(dirname(salida), `.hoja-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  const nombre = (i) => join(tmp, `g${String(i).padStart(3, "0")}.png`);
  const negro = (f) => ffm(["-f", "lavfi", "-i", `color=c=black:s=${w}x${h}`, "-frames:v", "1", f]);
  grupos.forEach((g, i) => {
    const celdas = [];
    for (let j = 0; j < k; j++) {
      const f = join(tmp, `c${i}-${j}.png`), c = g[j];
      if (!c) { negro(f); celdas.push(f); continue; }
      const r = rotulo(c.texto, 6, 5, 16);
      try {
        ffm(["-ss", String(c.t), "-i", c.video, "-frames:v", "1", "-vf",
          `scale=${w}:${h}${c.guias ? "," + guias(w, h) : ""},drawbox=x=0:y=0:w=${w}:h=26:color=black@0.7:t=fill${r ? "," + r : ""}`, f]);
      } catch { negro(f); }
      if (!existsSync(f)) negro(f); // un vídeo más corto que el otro: esa celda va en negro
      celdas.push(f);
    }
    if (k === 1) renameSync(celdas[0], nombre(i));
    else ffm([...celdas.flatMap((c) => ["-i", c]), "-filter_complex", `hstack=inputs=${k}`, nombre(i)]);
  });
  for (let i = n; i < cols * filas; i++) ffm(["-f", "lavfi", "-i", `color=c=black:s=${w * k}x${h}`, "-frames:v", "1", nombre(i)]);
  ffm(["-framerate", "1", "-i", join(tmp, "g%03d.png"), "-vf", `tile=${cols}x${filas}:padding=4:color=gray`, "-frames:v", "1", "-q:v", "3", salida]);
  rmSync(tmp, { recursive: true, force: true });
  return salida;
}

// El primer vídeo es el nuestro (lleva las guías); el segundo, si lo hay, la referencia.
export function hoja(videos, tiempos, salida) {
  const otro = (j) => (videos.length > 1 ? (j === 0 ? "  nuestro" : "  el otro") : "");
  return rejilla(tiempos.map((t) => videos.map((v, j) => ({ video: v, t, texto: `${t.toFixed(2)} s${otro(j)}`, guias: j === 0 }))), salida);
}

if (process.argv[1] && process.argv[1].endsWith("comparar.mjs")) {
  const videos = [posicional(0), posicional(1)].filter(Boolean);
  const en = (arg("en", "0,0.5,1,2,3") || "").split(",").map(Number);
  console.log(hoja(videos, en, arg("salida", "comparacion.jpg")));
}
