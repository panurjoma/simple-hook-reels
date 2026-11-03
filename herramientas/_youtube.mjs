// _youtube.mjs — lo común de youtube-auth.mjs y youtube-mcp.mjs: leer/guardar claves en .env.local y hablar con YouTube.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "./_comun.mjs";

export const ENV = join(RAIZ, ".env.local");
export const SCOPES = ["https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/youtube.upload"];

export function leerEnv() {
  const o = {};
  if (existsSync(ENV)) for (const l of readFileSync(ENV, "utf8").split(/\r?\n/)) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
  return o;
}
export function guardarEnv(pares) {
  let t = existsSync(ENV) ? readFileSync(ENV, "utf8") : "";
  for (const [k, v] of Object.entries(pares)) {
    const re = new RegExp(`^${k}=.*$`, "m");
    t = re.test(t) ? t.replace(re, `${k}=${v}`) : t.replace(/\s*$/, "\n") + `${k}=${v}\n`;
  }
  writeFileSync(ENV, t.replace(/^\n+/, ""));
}

let cache = { token: null, hasta: 0 };
export async function tokenAcceso() {
  if (cache.token && Date.now() < cache.hasta - 60000) return cache.token;
  const e = leerEnv();
  if (!e.YOUTUBE_CLIENT_ID || !e.YOUTUBE_CLIENT_SECRET || !e.YOUTUBE_REFRESH_TOKEN) throw new Error("YouTube no está conectado: ejecuta node herramientas/youtube-auth.mjs");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: e.YOUTUBE_CLIENT_ID, client_secret: e.YOUTUBE_CLIENT_SECRET, refresh_token: e.YOUTUBE_REFRESH_TOKEN, grant_type: "refresh_token" }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`Google rechaza el permiso (${j.error_description || j.error}). Repite node herramientas/youtube-auth.mjs`);
  cache = { token: j.access_token, hasta: Date.now() + j.expires_in * 1000 };
  return cache.token;
}

// Llama a la API. `json` para cuerpo JSON; `bruto` + `tipo` para bytes (imágenes, vídeo).
export async function yt(metodo, ruta, { query = {}, json, bruto, tipo, subida = false, cabeceras = {} } = {}) {
  const base = subida ? "https://www.googleapis.com/upload/youtube/v3" : "https://www.googleapis.com/youtube/v3";
  const url = `${base}/${ruta}?${new URLSearchParams(query)}`;
  const h = { authorization: `Bearer ${await tokenAcceso()}`, ...cabeceras };
  let body;
  if (json !== undefined) { h["content-type"] = "application/json"; body = JSON.stringify(json); }
  else if (bruto) { h["content-type"] = tipo; body = bruto; }
  const r = await fetch(url, { method: metodo, headers: h, body });
  const t = await r.text();
  let j; try { j = t ? JSON.parse(t) : {}; } catch { j = { texto: t }; }
  if (!r.ok) throw new Error(`YouTube ${r.status}: ${j.error?.message || t.slice(0, 300)}`);
  return j;
}
