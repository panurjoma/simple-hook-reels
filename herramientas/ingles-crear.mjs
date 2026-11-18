// ingles-crear.mjs <proyecto-es> <datos.json>: copia el proyecto a <proyecto>-en con guion, pie, portada y hashtags en inglés (datos: titulo, hook [texto,clave], reserva {id:[texto,clave]}, cuerpo [[texto,clave]...], pie, portada [3 líneas], hashtags, ritmo opcional)
import { readFileSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
const [es, datos] = process.argv.slice(2);
const D = JSON.parse(readFileSync(datos, "utf8"));
const en = es.replace(/\/$/, "") + "-en";
if (existsSync(en)) rmSync(en, { recursive: true });
cpSync(es, en, { recursive: true });
for (const x of ["build", "voz"]) rmSync(en + "/" + x, { recursive: true, force: true });
const g = JSON.parse(readFileSync(en + "/guion.json", "utf8"));
g.titulo = D.titulo; g.slug = g.slug + "-en"; g.idioma = "en";
g.voz.edge = { voz: "en-US-AndrewNeural", ritmo: D.ritmo || "-3%", tono: "+0Hz" }; g.voz.kokoro = "am_michael";
g.aperturas[0].frases[0] = { texto: D.hook[0], clave: D.hook[1] };
for (const r of g.reserva || []) { const x = D.reserva?.[r.id]; if (x) r.frases[0] = { texto: x[0], clave: x[1] }; }
if (g.cuerpo.length !== D.cuerpo.length) throw new Error(`cuerpo: ${g.cuerpo.length} frases, vienen ${D.cuerpo.length}`);
g.cuerpo.forEach((f, i) => { f.texto = D.cuerpo[i][0]; f.clave = D.cuerpo[i][1]; });
writeFileSync(en + "/guion.json", JSON.stringify(g, null, 2));
writeFileSync(en + "/pie.txt", D.pie + "\n");
const p = JSON.parse(readFileSync(en + "/portada.json", "utf8")); p.lineas = D.portada;
writeFileSync(en + "/portada.json", JSON.stringify(p));
writeFileSync(en + "/hashtags.txt", D.hashtags + "\n");
console.log("creado", en);
