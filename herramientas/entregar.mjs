#!/usr/bin/env node
// entregar.mjs <proyecto> [--apertura h1]
//
// El final: monta cada apertura, pasa el check, la renderiza a calidad final y la deja en
// trabajo/salida/<proyecto>/ como <slug>-<id>.mp4, con portada-<id>.jpg y caption.txt (el texto del post, de
// <proyecto>/pie.txt). Comprueba que cada vídeo dura lo que la voz, que no está vacío y que pasa las medidas: no hace
// falta volver a mirarlo después. Tarda unos minutos por apertura. Imprime las rutas.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { DURACION_MAX, RAIZ, aperturas, bitacora, camisetaDe, duracion, fallo, ffm, ffprobe, hyperframes, posicional, proyecto, r3, resumen, tiene } from "./_comun.mjs";
import { montar } from "./montar.mjs";
import { portada } from "./portada.mjs";
import { datos, referenciaDe } from "./medir.mjs";
import { iniciarEstado } from "./estado.mjs";

process.env.PROYECTO_ACTUAL = process.argv.slice(2).find((a) => !a.startsWith("--")) ? basename(process.argv.slice(2).find((a) => !a.startsWith("--"))) : "";

const { dir, guion } = proyecto(posicional());
const nombre = basename(dir);
const slug = guion.slug || nombre.replace(/^\d{4}-\d{2}-\d{2}-/, "");
const salida = join(RAIZ, "trabajo", "salida", nombre);
mkdirSync(salida, { recursive: true });
const hechos = [];
for (const ap of aperturas(guion)) {
  const { out, voz } = montar(dir, guion, ap);
  const chk = hyperframes(["check"], { cwd: out });
  if (!chk.ok) fallo(`${ap.id}: el check falla; revisa antes de entregar:\n${resumen(chk)}`);
  const mp4 = join(salida, `${slug}-${ap.id}.mp4`);
  const r = hyperframes(["render", "--quality", "high", "--fps", "60", "--output", mp4, "--quiet"], { cwd: out });
  if (!r.ok || !existsSync(mp4) || statSync(mp4).size < 10000) fallo(`${ap.id}: el render no salió:\n${resumen(r)}`);
  const d = duracion(mp4);
  if (d >= DURACION_MAX) fallo(`${ap.id}: el vídeo dura ${r3(d)} s y el máximo es ${DURACION_MAX} s (minuto y medio; Instagram no admite reels de más)`);
  if (Math.abs(d - voz.duracion) > 0.5) fallo(`${ap.id}: el vídeo dura ${r3(d)} s y la voz ${voz.duracion} s`);
  const j = { fallos: [], ...datos(mp4, JSON.parse(readFileSync(join(out, "tramos.json"), "utf8")), referenciaDe(dir, guion)) };
  if (j.fallos.length && !tiene("forzar")) {
    rmSync(mp4, { force: true });
    fallo(`${ap.id} no pasa las medidas, no se entrega:\n${j.fallos.map((f) => " - " + f).join("\n")}\nArregla las escenas y vuelve a revisar.`);
  }
  // Un solo archivo, con las medidas de Instagram Reels (valen también para YouTube Shorts): 9:16, 1080x1920, H.264/AAC 48 kHz,
  // 60 fps, GOP cerrado, moov al principio, ≤300 MB.
  const bruto = mp4.replace(/.mp4$/, "-bruto.mp4");
  renameSync(mp4, bruto);
  ffm(["-i", bruto, "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "60", "-vf", "scale=1080:1920,setsar=1,setdar=9/16",
    "-crf", "18", "-maxrate", "20M", "-bufsize", "40M", "-x264-params", "open-gop=0:keyint=120", "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "128k",
    "-movflags", "+faststart", mp4]);
  rmSync(bruto, { force: true });
  const s = execFileSync(ffprobe(), ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate,pix_fmt,codec_name", "-of", "csv=p=0", mp4]).toString().trim();
  if (!s.startsWith("h264,1080,1920,yuv420p,60/1")) fallo(`${basename(mp4)}: medidas no válidas para Reels/Shorts (9:16, 1080x1920, h264, 60 fps): ${s}`);
  if (statSync(mp4).size > 300 * 1024 * 1024) fallo(`${basename(mp4)} pesa más de 300 MB (límite de Instagram)`);
  const pj = portada(dir, ap.id);
  if (!pj) fallo(`${ap.id}: falta portada.json (3 líneas de título hook, la 2.ª en dorado); la portada no es un frame suelto`);
  hechos.push(mp4, pj);
  // Ficha local del vídeo: dónde está subido (por ahora solo sí/no) y, más adelante, sus métricas. Nunca pisa lo ya subido.
  iniciarEstado(nombre, { [`video_${ap.id}`]: basename(mp4), duracion: r3(d), hook: (ap.frases || []).map((f) => f.texto).join(" ") || null, camiseta: camisetaDe(dir, guion).nombre, entregado: new Date().toISOString() });
  bitacora("ENTREGADO", nombre, `${basename(mp4)} · ${r3(d)} s · camiseta ${camisetaDe(dir, guion).nombre}`);
}
if (existsSync(join(dir, "pie.txt"))) { copyFileSync(join(dir, "pie.txt"), join(salida, "caption.txt")); hechos.push(join(salida, "caption.txt")); }
else console.log("aviso: no hay pie.txt; el texto del post falta");
if (existsSync(join(dir, "hashtags.txt"))) { copyFileSync(join(dir, "hashtags.txt"), join(salida, "hashtags.txt")); hechos.push(join(salida, "hashtags.txt")); }
else console.log("aviso: no hay hashtags.txt; el primer comentario de Instagram falta");
console.log(hechos.join("\n"));
