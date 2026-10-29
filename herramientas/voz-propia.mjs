#!/usr/bin/env node
// voz-propia.mjs <proyecto> <grabacion> [--apertura h1]
//
// Usa la voz grabada por el creador (una toma seguida del texto del guion) en vez de la voz sintética.
// Transcribe la grabación, casa cada palabra con el guion y escribe voz/<id>.wav y voz/<id>.json con el mismo
// formato que voz.mjs, para que montar, revisar y entregar funcionen igual. Los silencios largos se acortan.
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { aperturas, arg, clave, duracion, escribirJson, fallo, ffm, firmaVoz, hyperframes, palabras, r3 } from "./_comun.mjs";
import { proyecto } from "./_comun.mjs";

const [, , nombre, grabacion] = process.argv;
const { dir, guion } = proyecto(nombre);
if (!grabacion || !existsSync(grabacion)) fallo("falta la grabación: node herramientas/voz-propia.mjs <proyecto> <archivo>");
const PAUSA = guion.pausa ?? 0.18, COLA = guion.cola ?? 0.8, MAXGAP = 0.45;

const tmp = join(dir, "voz", "tr-propia");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const wav16 = join(tmp, "toma16.wav");
ffm(["-i", grabacion, "-ar", "16000", "-ac", "1", wav16]);
const r = hyperframes(["transcribe", wav16, "--language", guion.idioma || "es", "--dir", tmp, "--json"], { cwd: dir });
const tf = join(tmp, "transcript.json");
if (!existsSync(tf)) fallo("no se pudo transcribir la grabación");
const oidas = JSON.parse(readFileSync(tf, "utf8")).map((w) => ({ texto: w.text, k: clave(w.text), inicio: w.start, fin: w.end })).filter((w) => w.k);

for (const ap of aperturas(guion)) {
  const lista = [
    ...ap.frases.map((f) => ({ ...f, escena: f.escena || ap.escena, parte: "hook" })),
    ...(guion.cuerpo || []).map((f) => ({ ...f, parte: "cuerpo" })),
  ];
  const guiadas = [];
  lista.forEach((f, i) => palabras(f.dicho || f.texto).forEach((w) => guiadas.push({ k: clave(w), frase: i })));

  // Alineación global (Needleman-Wunsch) palabra a palabra, tolerante a erratas de la transcripción.
  const sim = (a, b) => (a === b ? 2 : a && b && (a.startsWith(b) || b.startsWith(a) || lev(a, b) <= Math.max(1, Math.floor(Math.min(a.length, b.length) / 4))) ? 1 : -1);
  const n = guiadas.length, m = oidas.length, G = -1;
  const S = Array.from({ length: n + 1 }, () => new Float32Array(m + 1));
  for (let i = 1; i <= n; i++) S[i][0] = i * G;
  for (let j = 1; j <= m; j++) S[0][j] = j * G;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    S[i][j] = Math.max(S[i - 1][j - 1] + sim(guiadas[i - 1].k, oidas[j - 1].k), S[i - 1][j] + G, S[i][j - 1] + G);
  let i = n, j = m;
  while (i > 0 && j > 0) {
    if (S[i][j] === S[i - 1][j - 1] + sim(guiadas[i - 1].k, oidas[j - 1].k)) { if (sim(guiadas[i - 1].k, oidas[j - 1].k) > 0) guiadas[i - 1].o = oidas[j - 1]; i--; j--; }
    else if (S[i][j] === S[i - 1][j] + G) i--; else j--;
  }
  const casadas = guiadas.filter((g) => g.o).length;
  console.log(`${ap.id}: ${casadas}/${n} palabras casadas con lo que dijiste (${m} oídas)`);
  // Palabras sin pareja: se reparten entre las vecinas.
  for (let a = 0; a < n; a++) {
    if (guiadas[a].o) continue;
    let b = a; while (b < n && !guiadas[b].o) b++;
    const t0 = a > 0 ? guiadas[a - 1].o.fin : (guiadas[b]?.o?.inicio ?? 0) - 0.3 * (b - a);
    const t1 = b < n ? guiadas[b].o.inicio : t0 + 0.3 * (b - a);
    for (let k = a; k < b; k++) { const d = (t1 - t0) / (b - a); guiadas[k].o = { inicio: t0 + d * (k - a), fin: t0 + d * (k - a + 1), sintetica: true }; }
    a = b - 1;
  }

  // Tramos que se quitan: silencio inicial y lo que pasa de MAXGAP entre palabras.
  const quitar = [];
  const w0 = guiadas[0].o.inicio;
  if (w0 > 0.08) quitar.push([0, w0 - 0.05]);
  for (let k = 1; k < n; k++) {
    const a = guiadas[k - 1].o.fin, b = guiadas[k].o.inicio;
    if (b - a > MAXGAP) quitar.push([a + 0.15, b - 0.15 + (MAXGAP - 0.3 > 0 ? 0 : 0)]);
  }
  const corr = (t) => quitar.reduce((s, [a, b]) => s + (t >= b ? b - a : t > a ? t - a : 0), 0);
  const fin = guiadas[n - 1].o.fin + 0.1;
  const quedan = []; let t0 = 0;
  for (const [a, b] of quitar) { if (a > t0) quedan.push([t0, a]); t0 = b; }
  quedan.push([t0, fin]);
  const limpio = join(dir, "voz", `${ap.id}-propia.wav`);
  const sel = quedan.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join("+");
  ffm(["-i", grabacion, "-af", `aselect='${sel}',asetpts=N/SR/TB`, "-ar", "44100", "-ac", "1", limpio]);

  const frases = [], pal = [];
  lista.forEach((f, fi) => {
    const ws = guiadas.map((g, idx) => ({ g, idx })).filter((x) => x.g.frase === fi).map((x) => ({ inicio: r3(x.g.o.inicio - corr(x.g.o.inicio)), fin: r3(x.g.o.fin - corr(x.g.o.fin)) }));
    const textoPal = palabras(f.dicho || f.texto);
    const sh = palabras(f.texto);
    const ini = ws[0].inicio, fn = ws[ws.length - 1].fin;
    frases.push({ n: fi + 1, parte: f.parte, texto: f.texto, escena: f.escena, clave: f.clave || null, inicio: ini, fin: fn, ritmo: 1 });
    sh.forEach((w, k) => { const t = ws[Math.min(k, ws.length - 1)]; pal.push({ texto: w, inicio: t.inicio, fin: t.fin, frase: fi + 1, clave: f.clave ? clave(w) === clave(f.clave) : false }); });
  });
  const total = r3(frases[frases.length - 1].fin + COLA);
  const salida = join(dir, "voz", `${ap.id}.wav`);
  ffm(["-i", limpio, "-af", `apad,atrim=0:${total}`, "-ar", "44100", "-ac", "1", salida]);
  escribirJson(join(dir, "voz", `${ap.id}.json`), { proveedor: "propia", toma: "seguida", firma: firmaVoz(guion, ap), duracion: total, frases, palabras: pal });
  console.log(`${ap.id}: ${salida} (${total} s, ${frases.length} frases, ${pal.length} palabras, tu voz)`);
  frases.forEach((f) => console.log(`  ${f.n}. ${f.escena} ${f.inicio}-${f.fin}`));
}
rmSync(tmp, { recursive: true, force: true });

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, x) => [x, ...Array(b.length).fill(0)]);
  for (let y = 1; y <= b.length; y++) d[0][y] = y;
  for (let x = 1; x <= a.length; x++) for (let y = 1; y <= b.length; y++)
    d[x][y] = Math.min(d[x - 1][y] + 1, d[x][y - 1] + 1, d[x - 1][y - 1] + (a[x - 1] === b[y - 1] ? 0 : 1));
  return d[a.length][b.length];
}
