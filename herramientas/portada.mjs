#!/usr/bin/env node
// Portada propia de un vídeo ya entregado: un fotograma con Pablo abajo a la izquierda + título hook grande.
// Uso: node herramientas/portada.mjs <proyecto> [id]   (lee <proyecto>/portada.json: {"lineas":[3 líneas, la 2.ª en dorado],"segundo":1})
import { existsSync, readFileSync, readdirSync, mkdirSync, rmSync } from "node:fs";
import { join, basename } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { RAIZ, ffmpeg } from "./_comun.mjs";

export function portada(dir, id = "h1") {
  const cfgP = join(dir, "portada.json");
  if (!existsSync(cfgP)) { console.log("aviso: falta portada.json; la portada no se hace"); return null; }
  const cfg = JSON.parse(readFileSync(cfgP, "utf8"));
  const salida = join(RAIZ, "trabajo", "salida", basename(dir));
  const mp4 = readdirSync(salida).find((f) => f.endsWith(`-${id}.mp4`));
  if (!mp4) { console.log(`aviso: no hay mp4 ${id} en ${salida}`); return null; }
  const tmp = join(tmpdir(), `portada-${Date.now()}.jpg`), out = join(salida, `portada-${id}.jpg`);
  const f = spawnSync(ffmpeg(), ["-y", "-v", "error", "-ss", String(cfg.segundo ?? 1), "-i", join(salida, mp4), "-frames:v", "1", "-q:v", "2", tmp]);
  if (f.status !== 0) throw new Error("ffmpeg no sacó el fotograma");
  const p = spawnSync("python", [join(RAIZ, "herramientas", "portada.py"), tmp, out, ...cfg.lineas], { encoding: "utf8" });
  rmSync(tmp, { force: true });
  if (p.status !== 0) throw new Error("portada.py falló: " + p.stderr);
  return out;
}
if (process.argv[1] && process.argv[1].endsWith("portada.mjs")) {
  const [p, id] = process.argv.slice(2);
  if (!p) { console.log("Uso: node herramientas/portada.mjs <proyecto> [id]"); process.exit(0); }
  const dir = existsSync(p) ? p : join(RAIZ, "trabajo", "proyectos", p);
  console.log(portada(dir, id));
}
