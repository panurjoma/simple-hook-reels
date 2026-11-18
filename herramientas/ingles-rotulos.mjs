// ingles-rotulos.mjs <carpeta escenas-en> [mapa.json]: sin mapa, lista los textos que se dibujan en pantalla; con mapa {"TEXTO ES":"TEXT EN"} los cambia y dice los que no usó
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const [dir, mapa] = process.argv.slice(2);
if (!mapa) {
const out = new Map();
const CODIGO = new Set(["UTF-8", "module", "root", "three", "none", "auto", "block", "hidden", "visible", "absolute", "relative", "center", "flex", "normal", "bold", "sans-serif", "Figtree", "round", "butt", "miter", "cover", "contain", "inherit", "string", "number", "object", "function", "undefined"]);
const nuevo = (s, f) => (out.get(s) || out.set(s, new Set()).get(s)).add(f.replace(".html", ""));
for (const f of readdirSync(dir).filter((f) => f.endsWith(".html") && !f.startsWith("_"))) {
  let t = readFileSync(dir + "/" + f, "utf8");
  t = t.replace(/\bt\(\s*"[^"]*"/g, "t(").replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/<style[\s\S]*?<\/style>/g, "");
  const re = /(["'`])((?:(?!\1)[^\n\\]){3,70})\1/g;
  for (const m of t.matchAll(re)) {
    const s = m[2];
    if (CODIGO.has(s)) continue;
    if (!/[A-Za-zÁÉÍÓÚÑáéíóúñ]{3}/.test(s)) continue;
    if (/^[#.\-\/@:]|\.(js|css|png|jpg|svg|glb|json)$|\$\{|[{};=<>]|^__|^(rgba?|hsl)\(|^https?:/.test(s)) continue;
    if (!/\s/.test(s) && /^[a-z]+[A-Z0-9_-]/.test(s)) continue; // camelCase o con guion: código
    nuevo(s, f);
  }
  for (const m of t.matchAll(/>([^<>{}\n]*[A-Za-zÁÉÍÓÚÑ]{3}[^<>{}\n]*)</g)) nuevo(m[1].trim(), f);
}
for (const [s, fs] of out) console.log(`${JSON.stringify(s)}  [${[...fs].join(",")}]`);
  process.exit(0);
}
const M = JSON.parse(readFileSync(mapa, "utf8"));
const usados = new Set();
// primero los más largos, para que «MÁS CALIENTE QUE EL METAL» no lo pise «MÁS CALIENTE»
const claves = Object.keys(M).sort((a, b) => b.length - a.length);
for (const f of readdirSync(dir).filter((f) => f.endsWith(".html") && !f.startsWith("_"))) {
  let t = readFileSync(dir + "/" + f, "utf8");
  for (const k of claves) {
    for (const [a, b] of [[`"${k}"`, `"${M[k]}"`], [`'${k}'`, `'${M[k]}'`], [`>${k}<`, `>${M[k]}<`], [`\`${k}\``, `\`${M[k]}\``]]) {
      if (t.includes(a)) { t = t.split(a).join(b); usados.add(k); }
    }
  }
  writeFileSync(dir + "/" + f, t);
}
const sin = claves.filter((k) => !usados.has(k));
console.log("sin usar:", sin.length ? sin : "ninguno");
