#!/usr/bin/env node
// revisar.mjs <proyecto> [--apertura h1] [--kokoro] [--escenas motor,bateria] [--en 0,0.5,1] [--parcial]
//
// --parcial: solo están hechas algunas escenas (el hook y un pasaje). Las que faltan salen como fondo con el
// subtítulo, y deja build/<id>/avance.mp4 con solo las hechas, para enseñárselo al creador antes de hacer el resto.
//
// Todo lo de revisar en un comando, con un resumen corto, por apertura:
//   1. la voz, si falta o si el guion cambió desde la última (sale de la caché si la frase ya se dijo)
//   2. monta la apertura y pasa `hyperframes check`; si falla, enseña el error y sigue con la siguiente
//   3. un borrador (build/<id>/borrador.mp4)
//   4. la zona segura: avisa de cada texto que cae donde Instagram tapa (arriba, abajo o bajo los botones), con su
//      segundo. Eso no pasa: se arregla.
//   5. sus datos al lado de los de la referencia (cuánto está quieto, cuánto llena): solo para comparar, nunca para
//      aprobar. Cada corte entre escenas se mira fotograma a fotograma (fogonazo, apagón, fotograma vacío) y se buscan
//      tirones de cámara: son avisos con su segundo
//   6. las hojas, para mirarlas en una sola pasada (en lo nuestro, en rojo, lo que tapa Instagram):
//        build/<id>/frases.jpg      cada frase en su palabra clave: lo que se dice, ¿se ve?
//        build/<id>/comparacion.jpg el nuestro y su referencia en los mismos segundos
//        build/<id>/hoja.jpg        el hook (0, 0,5, 1 y 2 s) y el centro de cada escena
//        build/<id>/cortes.jpg      cada cambio de escena: justo antes, en mitad del cambio y justo después
//        build/<id>/tirones.jpg     cada tirón medido, fotograma a fotograma
// Con --escenas, las hojas traen solo esas escenas y sus cortes (para mirar lo que se acaba de arreglar). Con --en,
// solo esos segundos. Tarda unos minutos: espera a que acabe, no lo mires a cada rato. Sale con error si algo no pasa.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cortes, datos, referenciaDe, tirones } from "./medir.mjs";
import { RAIZ, SEGURA, aperturas, arg, fallo, ffm, firmaVoz, hyperframes, leerJson, posicional, proyecto, r3, resumen, tiene } from "./_comun.mjs";
import { ENCADENADO, montar } from "./montar.mjs";
import { hoja, rejilla } from "./comparar.mjs";

// Las franjas que tapa Instagram, en fracciones del vídeo, para `hyperframes check --caption-zone`.
const BANDAS = [
  ["arriba", `x0=0;y0=0;x1=1;y1=${r3(SEGURA.arriba / 1920)}`],
  ["abajo", `x0=0;y0=${r3(SEGURA.abajo / 1920)};x1=1;y1=1`],
  ["botones", `x0=${r3(SEGURA.botones.x / 1080)};y0=${r3(SEGURA.botones.y / 1920)};x1=1;y1=1`],
];
function zonaSegura(out) {
  const choques = [];
  for (const [donde, banda] of BANDAS) {
    const r = hyperframes(["check", "--json", "--no-contrast", "--samples", "30", "--caption-zone", `${banda};severity=error`], { cwd: out });
    let j = null;
    try { j = JSON.parse(r.salida); } catch { continue; }
    for (const f of j?.layout?.findings || []) {
      if (f.code !== "caption_zone_collision") continue;
      const texto = f.text || (/"([^"]*)"/.exec(f.message || "") || [])[1] || f.selector;
      const fuente = String(f.sourceFile || "");
      const escena = /subtitulos/.test(fuente) ? "el subtítulo" : `la escena ${(/e-(.+?)\.html$/.exec(fuente) || [])[1] || (/#h-e-([^ >]+)/.exec(f.selector || "") || [])[1] || "?"}`;
      const cuando = f.firstSeen != null && f.lastSeen != null && f.lastSeen > f.firstSeen ? `de ${r3(f.firstSeen)} a ${r3(f.lastSeen)} s` : `${r3(f.time)} s`;
      choques.push(`${donde}: «${texto}» en ${escena}, ${cuando}`);
    }
  }
  return [...new Set(choques)];
}

const { dir, guion } = proyecto(posicional());
const hojas = [];
let mal = 0;
for (const ap of aperturas(guion)) {
  const vj = leerJson(join(dir, "voz", `${ap.id}.json`));
  if (!vj || vj.firma !== firmaVoz(guion, ap) || !existsSync(join(dir, "voz", `${ap.id}.wav`))) {
    const v = spawnSync(process.execPath, [join(RAIZ, "herramientas", "voz.mjs"), dir, "--apertura", ap.id, ...(tiene("kokoro") ? ["--kokoro"] : [])], { stdio: "inherit" });
    if (v.status !== 0) { mal++; console.log(`${ap.id}: la voz no salió`); continue; }
  }
  const { out, tramos, voz } = montar(dir, guion, ap);
  const chk = hyperframes(["check"], { cwd: out });
  if (!chk.ok) { mal++; console.log(`${ap.id}: el check falla. Arréglalo en escenas/ y vuelve a revisar:\n${resumen(chk)}`); continue; }
  const borrador = join(out, "borrador.mp4");
  const r = hyperframes(["render", "--quality", "draft", "--output", borrador, "--quiet"], { cwd: out });
  if (!r.ok || !existsSync(borrador)) { mal++; console.log(`${ap.id}: el borrador no salió:\n${resumen(r)}`); continue; }

  const escenas = [...new Set(tramos.map((s) => s.escena))].length;
  const cambios = tramos.slice(1).map((s, i) => ({ t: s.inicio, de: tramos[i].escena, a: s.escena }));
  console.log(`${ap.id}: ${voz.duracion} s, ${escenas} escenas, ${cambios.length} cortes.`);

  const choques = zonaSegura(out);
  if (choques.length) { mal++; console.log(`  Texto donde Instagram lo tapa (súbelo, bájalo o apártalo de los botones):\n${choques.map((c) => "   - " + c).join("\n")}`); }

  const j = datos(borrador, JSON.parse(readFileSync(join(out, "tramos.json"), "utf8")), referenciaDe(dir, guion));
  j.cortes = cortes(borrador, cambios.map((c) => c.t));
  j.tirones = tirones(borrador, cambios.map((c) => c.t));
  j.zona_segura = choques;
  writeFileSync(join(out, "medidas.json"), JSON.stringify(j, null, 2) + "\n");
  console.log(`  Datos, solo para comparar: ${j.linea}.`);
  if (j.cortes.length) console.log(`  En los cortes (míralos con --en <segundo>):\n${j.cortes.map((f) => "   - " + f).join("\n")}`);
  if (j.tirones.length) console.log(`  Tirones en ${j.tirones.join(", ")} s: míralos en tirones.jpg y arregla los que no sean un choque buscado.`);

  const fin = (t) => r3(Math.min(Math.max(0, t), voz.duracion - 0.05));
  const pedidas = arg("escenas")?.split(",").map((s) => s.trim());
  const tiempos = arg("en") ? arg("en").split(",").map(Number)
    : pedidas ? tramos.filter((s) => pedidas.includes(s.escena)).map((s) => r3((s.inicio + s.fin) / 2))
    : [0, 0.5, 1, 2, ...tramos.map((s) => r3((s.inicio + s.fin) / 2))];
  if (!tiempos.length) fallo(`no hay escenas con esos nombres: ${pedidas.join(", ")}`);
  const unicos = [...new Set(tiempos.map(fin))].sort((a, b) => a - b);

  // Cada frase en su palabra clave (un poco después, cuando ya ha pasado lo que dice) o, sin clave, en su mitad.
  if (!arg("en")) {
    const hecha = (e) => !tiene("parcial") || existsSync(join(dir, "escenas", `${e}.html`));
    const frases = voz.frases.filter((f) => (!pedidas || pedidas.includes(f.escena)) && hecha(f.escena)).map((f) => {
      const k = voz.palabras.find((w) => w.frase === f.n && w.clave);
      return { video: borrador, t: fin(k ? k.inicio + 0.3 : (f.inicio + f.fin) / 2), texto: `${f.n}. ${f.clave || ""}`.trim(), guias: true };
    });
    if (frases.length) hojas.push(rejilla(frases.map((c) => [c]), join(out, "frases.jpg")));
  }
  const ref = guion.referencia || guion.estilo ? resolve(dir, guion.referencia || guion.estilo) : null;
  if (ref && existsSync(ref)) hojas.push(hoja([borrador, ref], unicos, join(out, "comparacion.jpg")));
  else if (ref) { mal++; console.log(`  no encuentro la referencia ${ref}`); }
  hojas.push(hoja([borrador], unicos, join(out, "hoja.jpg")));
  // Cada corte: 0,1 s antes, en mitad del cambio (dura lo que ENCADENADO) y 0,15 s después de acabar.
  const susCortes = arg("en") ? [] : cambios.filter((c) => !pedidas || pedidas.includes(c.de) || pedidas.includes(c.a));
  const corto = (s) => (s.length > 13 ? s.slice(0, 12) + "." : s);
  if (susCortes.length) hojas.push(rejilla(susCortes.map((c) => [
    { video: borrador, t: fin(c.t - 0.1), texto: corto(c.de) },
    { video: borrador, t: fin(c.t + ENCADENADO / 2), texto: `corte ${c.t.toFixed(1)} s` },
    { video: borrador, t: fin(c.t + ENCADENADO + 0.15), texto: corto(c.a) },
  ]), join(out, "cortes.jpg")));
  if (j.tirones.length && !arg("en")) hojas.push(rejilla(j.tirones.slice(0, 8).map((t) => [-0.1, -0.033, 0, 0.033, 0.1].map((d) => (
    { video: borrador, t: fin(t + d), texto: d === 0 ? `tirón ${t.toFixed(2)} s` : "" }))), join(out, "tirones.jpg")));

  // Con --parcial (el hook y un pasaje, antes de hacer el resto): un avance solo con las escenas hechas, para el creador.
  if (tiene("parcial")) {
    const hechas = tramos.filter((s) => existsSync(join(dir, "escenas", `${s.escena}.html`)));
    const tramosHechos = [];
    for (const s of hechas) {
      const u = tramosHechos[tramosHechos.length - 1];
      if (u && Math.abs(u[1] - s.inicio) < 0.01) u[1] = s.fin; else tramosHechos.push([s.inicio, s.fin]);
    }
    const partes = tramosHechos.map(([a, b], i) => {
      const p = join(out, `.avance-${i}.mp4`);
      ffm(["-ss", String(a), "-to", String(b), "-i", borrador, "-c:v", "libx264", "-crf", "20", "-c:a", "aac", p]);
      return p;
    });
    if (partes.length) {
      const lista = join(out, ".avance.txt");
      writeFileSync(lista, partes.map((p) => `file '${p.replaceAll("\\", "/")}'`).join("\n"));
      ffm(["-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", join(out, "avance.mp4")]);
      for (const p of [...partes, lista]) rmSync(p, { force: true });
      console.log(`  Avance para el creador: ${join(out, "avance.mp4")} (${tramosHechos.map(([a, b]) => `${a}–${b} s`).join(", ")}).`);
    }
  }
}
if (mal) fallo(`${mal} cosa(s) sin pasar. Arregla lo de arriba y vuelve a revisar.`);
console.log(`\nMira en una sola pasada, a tamaño completo: ${hojas.join(" y ")}.
Lo que manda es frases.jpg al lado de la referencia: en cada frase, ¿se ve lo que se dice, tan claro y tan bien hecho
como en ella? Si arreglas algo, vuelve a revisar con --escenas <las arregladas>.`);
