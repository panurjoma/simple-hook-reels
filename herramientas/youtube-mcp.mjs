#!/usr/bin/env node
// youtube-mcp.mjs — servidor MCP (stdio, sin dependencias) para el canal de YouTube del creador.
// Lo usan igual Claude Code (.mcp.json) y Codex (~/.codex/config.toml). Antes: node herramientas/youtube-auth.mjs.
// Regla de la carpeta: nada se publica solo. Las subidas salen en PRIVADO; «public» solo si el creador lo pide.
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { RAIZ } from "./_comun.mjs";
import { marcarPorArchivo } from "./estado.mjs";
import { yt } from "./_youtube.mjs";

const ruta = (p) => { const r = resolve(RAIZ, p); if (!existsSync(r)) throw new Error(`no existe ${r}`); return r; };
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm" };
const mime = (f) => MIME[extname(f).toLowerCase()] || "application/octet-stream";
const canal = async (partes) => { const j = await yt("GET", "channels", { query: { part: partes, mine: "true" } }); if (!j.items?.length) throw new Error("esta cuenta no tiene canal de YouTube"); return j.items[0]; };

const PRIV = { type: "string", enum: ["private", "unlisted", "public"], description: "Por defecto private. public solo si el creador lo ha pedido en esta conversación." };
const TOOLS = [
  { name: "youtube_canal", description: "Datos del canal conectado: nombre, descripción, palabras clave, banner, estadísticas.", inputSchema: { type: "object", properties: {} },
    run: async () => { const c = await canal("snippet,statistics,brandingSettings"); return { id: c.id, titulo: c.snippet.title, handle: c.snippet.customUrl, estadisticas: c.statistics, marca: c.brandingSettings }; } },
  { name: "youtube_videos", description: "Lista los vídeos recientes del canal con su estado (privacidad, título).", inputSchema: { type: "object", properties: { max: { type: "number" } } },
    run: async ({ max = 10 }) => {
      const c = await canal("contentDetails");
      const l = await yt("GET", "playlistItems", { query: { part: "snippet,status", playlistId: c.contentDetails.relatedPlaylists.uploads, maxResults: String(Math.min(max, 50)) } });
      return l.items.map((i) => ({ id: i.snippet.resourceId.videoId, titulo: i.snippet.title, privacidad: i.status.privacyStatus, fecha: i.snippet.publishedAt }));
    } },
  { name: "youtube_subir", description: "Sube un vídeo (ruta dentro del repo o absoluta). Sale en PRIVADO salvo que se indique otra cosa.",
    inputSchema: { type: "object", required: ["archivo", "titulo"], properties: { archivo: { type: "string" }, titulo: { type: "string" }, descripcion: { type: "string" }, etiquetas: { type: "array", items: { type: "string" } }, privacidad: PRIV, categoria: { type: "string", description: "ID de categoría; por defecto 27 (Educación)" }, paraNinos: { type: "boolean" } } },
    run: async (a) => {
      const f = ruta(a.archivo), bytes = readFileSync(f);
      const meta = { snippet: { title: a.titulo, description: a.descripcion || "", tags: a.etiquetas || [], categoryId: a.categoria || "27" }, status: { privacyStatus: a.privacidad || "private", selfDeclaredMadeForKids: !!a.paraNinos } };
      const tok = await (await import("./_youtube.mjs")).tokenAcceso();
      const ini = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?" + new URLSearchParams({ uploadType: "resumable", part: "snippet,status" }), {
        method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json", "x-upload-content-type": mime(f), "x-upload-content-length": String(bytes.length) }, body: JSON.stringify(meta) });
      if (!ini.ok) throw new Error(`YouTube ${ini.status}: ${(await ini.text()).slice(0, 300)}`);
      const put = await fetch(ini.headers.get("location"), { method: "PUT", headers: { "content-type": mime(f), "content-length": String(bytes.length) }, body: bytes });
      const j = await put.json();
      if (!put.ok) throw new Error(`YouTube ${put.status}: ${j.error?.message || JSON.stringify(j).slice(0, 300)}`);
      marcarPorArchivo(f, "youtube", { id: j.id, enlace: `https://youtu.be/${j.id}`, privacidad: j.status?.privacyStatus });
      return { id: j.id, privacidad: j.status?.privacyStatus, enlace: `https://youtu.be/${j.id}`, nota: "Sube en privado hasta que el creador diga lo contrario." };
    } },
  { name: "youtube_actualizar_video", description: "Cambia título, descripción, etiquetas o privacidad de un vídeo. Solo cambia lo que se pasa.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" }, titulo: { type: "string" }, descripcion: { type: "string" }, etiquetas: { type: "array", items: { type: "string" } }, privacidad: PRIV } },
    run: async (a) => {
      const v = (await yt("GET", "videos", { query: { part: "snippet,status", id: a.id } })).items?.[0];
      if (!v) throw new Error("no encuentro ese vídeo en tu canal");
      if (a.titulo) v.snippet.title = a.titulo;
      if (a.descripcion !== undefined) v.snippet.description = a.descripcion;
      if (a.etiquetas) v.snippet.tags = a.etiquetas;
      if (a.privacidad) v.status.privacyStatus = a.privacidad;
      const r = await yt("PUT", "videos", { query: { part: "snippet,status" }, json: { id: a.id, snippet: v.snippet, status: { privacyStatus: v.status.privacyStatus, selfDeclaredMadeForKids: v.status.selfDeclaredMadeForKids } } });
      return { id: r.id, titulo: r.snippet.title, privacidad: r.status.privacyStatus };
    } },
  { name: "youtube_miniatura", description: "Pone la miniatura de un vídeo (PNG/JPG, máx. 2 MB).", inputSchema: { type: "object", required: ["id", "imagen"], properties: { id: { type: "string" }, imagen: { type: "string" } } },
    run: async (a) => { const f = ruta(a.imagen); await yt("POST", "thumbnails/set", { subida: true, query: { videoId: a.id, uploadType: "media" }, bruto: readFileSync(f), tipo: mime(f) }); return { ok: true }; } },
  { name: "youtube_banner", description: "Sube un banner (2560x1440, máx. 6 MB) y lo pone como banner del canal.", inputSchema: { type: "object", required: ["imagen"], properties: { imagen: { type: "string" } } },
    run: async (a) => {
      const f = ruta(a.imagen);
      if (statSync(f).size > 6 * 1024 * 1024) throw new Error("el banner pesa más de 6 MB: expórtalo como JPG");
      const b = await yt("POST", "channelBanners/insert", { subida: true, query: { uploadType: "media" }, bruto: readFileSync(f), tipo: mime(f) });
      const c = await canal("id,brandingSettings");
      c.brandingSettings.image = { ...(c.brandingSettings.image || {}), bannerExternalUrl: b.url };
      await yt("PUT", "channels", { query: { part: "brandingSettings" }, json: { id: c.id, brandingSettings: c.brandingSettings } });
      return { ok: true, archivo: basename(f) };
    } },
  { name: "youtube_descripcion_canal", description: "Cambia la descripción y/o las palabras clave del canal.", inputSchema: { type: "object", properties: { descripcion: { type: "string" }, palabrasClave: { type: "string", description: "separadas por espacios; usa comillas para frases" } } },
    run: async (a) => {
      const c = await canal("id,brandingSettings");
      c.brandingSettings.channel = { ...(c.brandingSettings.channel || {}), ...(a.descripcion !== undefined && { description: a.descripcion }), ...(a.palabrasClave !== undefined && { keywords: a.palabrasClave }) };
      await yt("PUT", "channels", { query: { part: "brandingSettings" }, json: { id: c.id, brandingSettings: c.brandingSettings } });
      return { ok: true };
    } },
  { name: "youtube_marca_agua", description: "Pone la marca de agua del canal (PNG cuadrado, máx. 1 MB) en una esquina durante todo el vídeo.", inputSchema: { type: "object", required: ["imagen"], properties: { imagen: { type: "string" }, esquina: { type: "string", enum: ["topLeft", "topRight", "bottomLeft", "bottomRight"] } } },
    run: async (a) => {
      const f = ruta(a.imagen);
      if (statSync(f).size > 1024 * 1024) throw new Error("la marca de agua pesa más de 1 MB: reduce el PNG");
      const c = await canal("id");
      const lim = "fasecero" + Date.now();
      const meta = JSON.stringify({ timing: { type: "offsetFromStart", offsetMs: 0 }, position: { type: "corner", cornerPosition: a.esquina || "topRight" } });
      const cuerpo = Buffer.concat([Buffer.from(`--${lim}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${lim}\r\ncontent-type: ${mime(f)}\r\n\r\n`), readFileSync(f), Buffer.from(`\r\n--${lim}--`)]);
      await yt("POST", "watermarks/set", { subida: true, query: { channelId: c.id, uploadType: "multipart" }, bruto: cuerpo, tipo: `multipart/related; boundary=${lim}` });
      return { ok: true };
    } },
];

const salida = (o) => process.stdout.write(JSON.stringify(o) + "\n");
const rl = createInterface({ input: process.stdin });
rl.on("line", async (linea) => {
  let m; try { m = JSON.parse(linea); } catch { return; }
  const { id, method, params } = m;
  if (id === undefined) return; // notificaciones
  try {
    if (method === "initialize") return salida({ jsonrpc: "2.0", id, result: { protocolVersion: params?.protocolVersion || "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "fase-cero-youtube", version: "0.1.0" } } });
    if (method === "ping") return salida({ jsonrpc: "2.0", id, result: {} });
    if (method === "tools/list") return salida({ jsonrpc: "2.0", id, result: { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) } });
    if (method === "tools/call") {
      const t = TOOLS.find((x) => x.name === params.name);
      if (!t) return salida({ jsonrpc: "2.0", id, error: { code: -32602, message: `herramienta desconocida: ${params.name}` } });
      try { const r = await t.run(params.arguments || {}); return salida({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] } }); }
      catch (e) { return salida({ jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: String(e.message || e) }] } }); }
    }
    salida({ jsonrpc: "2.0", id, error: { code: -32601, message: `método no soportado: ${method}` } });
  } catch (e) { salida({ jsonrpc: "2.0", id, error: { code: -32603, message: String(e) } }); }
});
