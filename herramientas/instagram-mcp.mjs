#!/usr/bin/env node
// instagram-mcp.mjs — servidor MCP (stdio, sin dependencias) para la cuenta de Instagram del creador.
// Antes: node herramientas/instagram-auth.mjs. Regla de la carpeta: nada se publica solo; instagram_publicar_reel
// solo se usa cuando el creador lo pide en esa conversación, tras enseñarle vídeo, texto y portada.
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { RAIZ, ffm } from "./_comun.mjs";
import { VER, credenciales, ig } from "./_instagram.mjs";

const ruta = (p) => { const r = resolve(RAIZ, p); if (!existsSync(r)) throw new Error(`no existe ${r}`); return r; };
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const uid = () => credenciales().INSTAGRAM_USER_ID;

// Primer comentario (los hashtags van aquí, no en el pie). Si falla, la publicación ya está hecha: se avisa, no se pierde.
async function comentar(idMedia, texto) {
  if (!texto) return {};
  try { const r = await ig("POST", `${idMedia}/comments`, { form: { message: texto } }); return { comentarioId: r.id }; }
  catch (e) { return { comentarioError: String(e.message || e) }; }
}

// Instagram solo coge fotos por URL pública y en JPG: se convierte a JPG, se sube al repo de assets y se devuelve la URL raw.
const REPO_ASSETS = process.env.INSTAGRAM_ASSETS_REPO || "panurjoma/fase-zero-assets";
function subirJpgAGithub(origen) {
  const dir = mkdtempSync(join(tmpdir(), "ig-foto-"));
  try {
    const jpg = join(dir, "foto.jpg");
    ffm(["-i", origen, "-q:v", "2", "-pix_fmt", "yuvj420p", jpg]);
    const nombre = `instagram/${basename(origen).replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-")}-${Date.now()}.jpg`;
    const cuerpo = JSON.stringify({ message: `foto para Instagram: ${nombre}`, content: readFileSync(jpg).toString("base64") });
    execFileSync("gh", ["api", "-X", "PUT", `repos/${REPO_ASSETS}/contents/${nombre}`, "--input", "-"], { input: cuerpo, stdio: ["pipe", "ignore", "pipe"] });
    return `https://raw.githubusercontent.com/${REPO_ASSETS}/main/${nombre}`;
  } catch (e) { throw new Error(`no pude subir la imagen a GitHub (${REPO_ASSETS}): ${String(e.stderr || e.message).slice(0, 300)}`); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}

const TOOLS = [
  { name: "instagram_cuenta", description: "Datos de la cuenta conectada (usuario, seguidores, publicaciones, biografía).", inputSchema: { type: "object", properties: {} },
    run: async () => ig("GET", uid(), { query: { fields: "id,username,name,followers_count,follows_count,media_count,biography" } }) },
  { name: "instagram_publicaciones", description: "Lista las publicaciones recientes con enlace y métricas básicas.", inputSchema: { type: "object", properties: { max: { type: "number" } } },
    run: async ({ max = 10 }) => (await ig("GET", `${uid()}/media`, { query: { fields: "id,caption,media_type,permalink,timestamp,like_count,comments_count", limit: String(Math.min(max, 50)) } })).data },
  { name: "instagram_publicar_reel", description: "Publica un reel YA (visible para todos). Úsalo solo si el creador lo ha pedido ahora mismo. Sube el archivo local o usa una URL pública.",
    inputSchema: { type: "object", required: ["texto"], properties: { archivo: { type: "string", description: "mp4 local (idealmente <300 MB, 9:16, ≤3 min, H.264/AAC)" }, url: { type: "string", description: "alternativa: URL pública del vídeo" }, texto: { type: "string" }, comentario: { type: "string", description: "primer comentario tras publicar (los hashtags de hashtags.txt)" }, portada: { type: "string", description: "imagen local para la portada (p. ej. portada-h1.jpg); se sube al repo de assets y se usa como cover_url" }, portadaUrl: { type: "string", description: "alternativa: URL pública de la portada" }, portadaMs: { type: "number", description: "si no hay portada: milisegundo del vídeo que hará de portada" }, compartirEnFeed: { type: "boolean" } } },
    run: async (a) => {
      if (!a.archivo && !a.url) throw new Error("falta archivo o url");
      const form = { media_type: "REELS", caption: a.texto, share_to_feed: String(a.compartirEnFeed !== false) };
      if (a.portada || a.portadaUrl) form.cover_url = a.portadaUrl || subirJpgAGithub(ruta(a.portada));
      else if (a.portadaMs !== undefined) form.thumb_offset = String(a.portadaMs);
      if (a.url) form.video_url = a.url; else form.upload_type = "resumable";
      const c = await ig("POST", `${uid()}/media`, { form });
      if (a.archivo) {
        const bytes = readFileSync(ruta(a.archivo));
        const r = await fetch(c.uri || `https://rupload.facebook.com/ig-api-upload/${VER}/${c.id}`, { method: "POST", headers: { authorization: `OAuth ${credenciales().INSTAGRAM_TOKEN}`, "content-type": "application/octet-stream", offset: "0", file_size: String(bytes.length) }, body: bytes });
        const t = await r.text(); if (!r.ok) throw new Error(`subida ${r.status}: ${t.slice(0, 300)}`);
      }
      let estado;
      for (let i = 0; i < 60; i++) {
        estado = await ig("GET", c.id, { query: { fields: "status_code,status" } });
        if (estado.status_code === "FINISHED") break;
        if (estado.status_code === "ERROR" || estado.status_code === "EXPIRED") throw new Error(`Instagram no procesó el vídeo: ${estado.status || estado.status_code}`);
        await espera(5000);
      }
      if (estado.status_code !== "FINISHED") throw new Error("Instagram sigue procesando; vuelve a probar publicar con id " + c.id);
      const p = await ig("POST", `${uid()}/media_publish`, { form: { creation_id: c.id } });
      const m = await ig("GET", p.id, { query: { fields: "permalink" } });
      return { id: p.id, enlace: m.permalink, ...(await comentar(p.id, a.comentario)) };
    } },
  { name: "instagram_publicar_foto", description: "Publica una foto YA (visible para todos). Úsalo solo si el creador lo ha pedido ahora mismo. Instagram solo acepta una URL pública de un JPG: con `archivo` (cualquier imagen local) la herramienta la convierte a JPG, la sube al repo público de assets de GitHub y publica desde esa URL.",
    inputSchema: { type: "object", required: ["texto"], properties: { comentario: { type: "string", description: "primer comentario tras publicar (hashtags)" }, archivo: { type: "string", description: "imagen local (PNG, JPG…; relación entre 4:5 y 1.91:1)" }, url: { type: "string", description: "alternativa: URL pública de un JPG" }, texto: { type: "string" } } },
    run: async (a) => {
      if (!a.archivo && !a.url) throw new Error("falta archivo o url");
      const url = a.url || subirJpgAGithub(ruta(a.archivo));
      const c = await ig("POST", `${uid()}/media`, { form: { image_url: url, caption: a.texto } });
      let estado;
      for (let i = 0; i < 24; i++) {
        estado = await ig("GET", c.id, { query: { fields: "status_code,status" } });
        if (estado.status_code === "FINISHED") break;
        if (estado.status_code === "ERROR" || estado.status_code === "EXPIRED") throw new Error(`Instagram no procesó la foto: ${estado.status || estado.status_code}`);
        await espera(5000);
      }
      if (estado.status_code !== "FINISHED") throw new Error("Instagram sigue procesando; vuelve a probar publicar con id " + c.id);
      const p = await ig("POST", `${uid()}/media_publish`, { form: { creation_id: c.id } });
      const m = await ig("GET", p.id, { query: { fields: "permalink" } });
      return { id: p.id, enlace: m.permalink, ...(await comentar(p.id, a.comentario)) };
    } },
  { name: "instagram_estadisticas", description: "Métricas de una publicación (alcance, vistas, me gusta, comentarios, guardados, compartidos).", inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
    run: async (a) => (await ig("GET", `${a.id}/insights`, { query: { metric: "reach,likes,comments,saved,shares,views" } })).data },
];

const salida = (o) => process.stdout.write(JSON.stringify(o) + "\n");
const rl = createInterface({ input: process.stdin });
rl.on("line", async (linea) => {
  let m; try { m = JSON.parse(linea); } catch { return; }
  const { id, method, params } = m;
  if (id === undefined) return;
  try {
    if (method === "initialize") return salida({ jsonrpc: "2.0", id, result: { protocolVersion: params?.protocolVersion || "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "fase-cero-instagram", version: "0.1.0" } } });
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
