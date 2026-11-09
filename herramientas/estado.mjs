#!/usr/bin/env node
// Estado local de cada vídeo entregado: trabajo/salida/<proyecto>/estado.json
//   { youtube: {subido, enlace, id, fecha, metricas}, instagram: {subido, enlace, id, fecha, metricas}, camiseta, hook, duracion }
// `metricas` queda vacío a propósito: más adelante se rellena con lo que den YouTube e Instagram para saber qué hooks y temas funcionan.
// Uso:
//   node herramientas/estado.mjs                       lista todos los vídeos y dónde están subidos
//   node herramientas/estado.mjs <proyecto>            enseña el estado de uno
//   node herramientas/estado.mjs <proyecto> youtube|instagram subido [enlace] [id]   márcalo a mano
//   node herramientas/estado.mjs <proyecto> youtube|instagram no-subido
import { existsSync, readdirSync } from "node:fs";
import { basename, join, resolve, sep } from "node:path";
import { RAIZ, bitacora, escribirJson, leerJson } from "./_comun.mjs";

const SALIDA = join(RAIZ, "trabajo", "salida");
const PLATAFORMAS = ["youtube", "instagram"];
const vacio = () => ({ subido: false, enlace: null, id: null, fecha: null, metricas: {} });

export function leerEstado(proyecto) {
  const e = leerJson(join(SALIDA, proyecto, "estado.json"), {}) || {};
  for (const p of PLATAFORMAS) e[p] = { ...vacio(), ...(e[p] || {}) };
  return e;
}
export function guardarEstado(proyecto, e) { escribirJson(join(SALIDA, proyecto, "estado.json"), e); }

// Crea estado.json si no existe y mezcla los datos del vídeo (hook, duración, camiseta…). Nunca borra lo subido.
export function iniciarEstado(proyecto, datos = {}) {
  const e = leerEstado(proyecto);
  Object.assign(e, datos);
  guardarEstado(proyecto, e);
  return e;
}
export function marcar(proyecto, plataforma, subido, extra = {}) {
  const e = leerEstado(proyecto);
  e[plataforma] = subido
    ? { ...e[plataforma], subido: true, fecha: new Date().toISOString(), ...extra }
    : { ...vacio(), metricas: e[plataforma].metricas };
  guardarEstado(proyecto, e);
  bitacora(subido ? "SUBIDO" : "NO-SUBIDO", proyecto, `${plataforma}${extra.enlace ? " " + extra.enlace : ""}`);
  return e;
}
// De una ruta de archivo dentro de trabajo/salida/<proyecto>/… saca el proyecto (para marcar desde los conectores).
export function proyectoDeRuta(archivo) {
  const rel = resolve(archivo).slice(SALIDA.length + 1).split(sep);
  return resolve(archivo).startsWith(SALIDA + sep) && rel.length > 1 ? rel[0] : null;
}
export function marcarPorArchivo(archivo, plataforma, extra) {
  const p = proyectoDeRuta(archivo);
  if (p && existsSync(join(SALIDA, p))) marcar(p, plataforma, true, extra);
}
const linea = (p, e) => `${p.padEnd(58)} YouTube: ${e.youtube.subido ? "subido " : "no subido"}   Instagram: ${e.instagram.subido ? "subido" : "no subido"}`;

if (process.argv[1] && process.argv[1].endsWith("estado.mjs")) {
  const [proy, plat, accion, enlace, id] = process.argv.slice(2);
  if (!proy) {
    if (!existsSync(SALIDA)) { console.log("(sin vídeos entregados)"); process.exit(0); }
    for (const p of readdirSync(SALIDA).sort()) if (existsSync(join(SALIDA, p, "estado.json"))) console.log(linea(p, leerEstado(p)));
    else console.log(p.padEnd(58) + " (sin estado.json: se crea al volver a entregar o al marcarlo)");
  } else if (!plat) console.log(JSON.stringify(leerEstado(basename(proy)), null, 2));
  else if (PLATAFORMAS.includes(plat) && (accion === "subido" || accion === "no-subido")) {
    console.log(JSON.stringify(marcar(basename(proy), plat, accion === "subido", accion === "subido" ? { enlace: enlace || null, id: id || null } : {}), null, 2));
  } else { console.error("Uso: node herramientas/estado.mjs [<proyecto> [youtube|instagram subido|no-subido [enlace] [id]]]"); process.exit(1); }
}
