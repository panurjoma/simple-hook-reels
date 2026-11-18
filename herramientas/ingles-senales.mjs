// ingles-senales.mjs <proyecto-es> <proyecto-en> [mapa.json]: sin mapa, lista por escena la frase ES/EN y sus señales t("..."); con mapa {escena:{es:en}} las cambia por palabras de la frase en inglés y valida (#2 = segunda vez que aparece la palabra)
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { clave, palabras } from "./_comun.mjs";
const [es, en, mapa] = process.argv.slice(2);
const G = (d) => JSON.parse(readFileSync(d + "/guion.json", "utf8"));
const ges = G(es), gen = G(en);
const frases = (g) => [{ ...g.aperturas[0].frases[0], escena: g.aperturas[0].escena }, ...g.cuerpo];
const fes = frases(ges), fen = frases(gen);
const porEscena = (f) => { const m = {}; f.forEach((x) => (m[x.escena] ||= []).push(x.texto)); return m; };
const pes = porEscena(fes), pen = porEscena(fen);
const cuentaClaves = (txts) => { const c = {}, out = []; for (const t of txts) for (const w of palabras(t)) { const k = clave(w); if (!k) continue; c[k] = (c[k] || 0) + 1; out.push(c[k] === 1 ? k : `${k}#${c[k]}`); } return out; };
const M = mapa ? JSON.parse(readFileSync(mapa, "utf8")) : null;
let mal = 0;
for (const f of readdirSync(en + "/escenas").filter((f) => f.endsWith(".html") && !f.startsWith("_"))) {
  const esc = f.replace(".html", "");
  let t = readFileSync(en + "/escenas/" + f, "utf8");
  const usados = [...new Set([...t.matchAll(/\bt\("([^"]+)"/g)].map((m) => m[1]))];
  if (!M) {
    console.log(`\n### ${esc}\nES: ${(pes[esc] || ["(sin frase: escena de hook reserva o repetida)"]).join(" | ")}\nEN: ${(pen[esc] || []).join(" | ")}\nCUES: ${usados.join(", ") || "—"}`);
    continue;
  }
  if (!pen[esc]) { console.log(`(${esc}: sin frases, no se toca)`); continue; }
  const m = M[esc] || {};
  const validas = new Set(cuentaClaves(pen[esc] || []));
  const vistas = new Set();
  for (const u of usados) {
    const nuevo = m[u];
    if (nuevo === null) continue;
    if (!nuevo) { console.log(`SIN MAPA ${esc}: ${u}`); mal++; continue; }
    if (!validas.has(nuevo)) { console.log(`NO ESTÁ EN LA FRASE EN ${esc}: ${u} -> ${nuevo}  (válidas: ${[...validas].join(" ")})`); mal++; }
  }
  // cambia en un solo paso para que dos cambios no se pisen
  t = t.replace(/\bt\("([^"]+)"/g, (a, u) => (m[u] ? `t("${m[u]}"` : a));
  writeFileSync(en + "/escenas/" + f, t);
  // residuos: palabras españolas de la frase que aún quedan entre comillas en la escena (señales escondidas en otras listas)
  const esK = new Set(cuentaClaves(pes[esc] || [])), enK = new Set(cuentaClaves(pen[esc] || []));
  const res = [...new Set([...t.matchAll(/["']([a-zñ0-9#]{3,})["']/g)].map((m) => m[1]))].filter((w) => esK.has(w) && !enK.has(w));
  if (res.length) console.log(`RESIDUO en ${esc}: ${res.join(", ")}`);
}
if (M) console.log(mal ? `${mal} problemas` : "todo en su sitio");
