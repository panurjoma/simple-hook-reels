#!/usr/bin/env node
// youtube-auth.mjs — conecta la cuenta de YouTube del creador. Abre una página en este ordenador: pega el ID y el secreto
// de cliente OAuth (tipo «Aplicación de escritorio» de Google Cloud), entras con Google y se guarda un permiso de
// larga duración en .env.local. Nada pasa por el chat ni sale del ordenador, salvo hacia Google.
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { WIN, arg } from "./_comun.mjs";
import { SCOPES, guardarEnv, leerEnv } from "./_youtube.mjs";

const abrir = (u) => spawn(WIN ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open", WIN ? ["/c", "start", "", u.replace(/&/g, "^&")] : [u], { stdio: "ignore", detached: true }).unref();
const pagina = (m = "") => `<!doctype html><html lang="es"><meta charset="utf-8"><title>Conectar YouTube</title><style>body{font:18px/1.5 system-ui;max-width:600px;margin:48px auto;padding:0 16px}
input{width:100%;box-sizing:border-box;font:15px monospace;padding:10px;margin:6px 0 14px;border:1px solid #bbb;border-radius:8px}button{font:600 16px system-ui;padding:12px 20px;border:0;border-radius:8px;background:#111;color:#fff;cursor:pointer}.mal{color:#b3261e}</style>
<h1>Conectar YouTube</h1><ol><li>En <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank">Google Cloud</a> activa <b>YouTube Data API v3</b>.</li>
<li>En <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Credenciales</a> crea un <b>ID de cliente OAuth</b> de tipo <b>Aplicación de escritorio</b> (si lo pide, configura la pantalla de consentimiento «Externa» y añade tu correo como usuario de prueba).</li>
<li>Pega aquí el ID y el secreto.</li></ol><form method="post"><input name="id" placeholder="ID de cliente (…apps.googleusercontent.com)" autocomplete="off"><input name="s" placeholder="Secreto de cliente (GOCSPX-…)" autocomplete="off"><button>Continuar con Google</button></form><p class="mal">${m}</p></html>`;

const e = leerEnv();
const verif = randomBytes(32).toString("base64url");
const reto = createHash("sha256").update(verif).digest("base64url");
const estado = randomBytes(8).toString("hex");
let puerto, id = e.YOUTUBE_CLIENT_ID, secreto = e.YOUTUBE_CLIENT_SECRET;
const redir = () => `http://127.0.0.1:${puerto}/cb`;
const urlGoogle = () => "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({ client_id: id, redirect_uri: redir(), response_type: "code", scope: SCOPES.join(" "), access_type: "offline", prompt: "consent", code_challenge: reto, code_challenge_method: "S256", state: estado });
const msg = (res, t, c = 200) => { res.writeHead(c, { "content-type": "text/html; charset=utf-8" }); res.end(`<!doctype html><meta charset="utf-8"><body style="font:18px system-ui;max-width:560px;margin:48px auto">${t}`); };

const srv = createServer((req, res) => {
  const u = new URL(req.url, "http://127.0.0.1");
  if (u.pathname === "/cb") {
    if (u.searchParams.get("state") !== estado) return msg(res, "Estado no válido.", 400);
    const code = u.searchParams.get("code");
    if (!code) return msg(res, `Google no dio permiso: ${u.searchParams.get("error") || "cancelado"}.`, 400);
    (async () => {
      const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ code, client_id: id, client_secret: secreto, redirect_uri: redir(), grant_type: "authorization_code", code_verifier: verif }) });
      const j = await r.json();
      if (!r.ok || !j.refresh_token) return msg(res, `No salió el permiso: ${j.error_description || j.error || "Google no devolvió refresh_token"}.`, 400);
      guardarEnv({ YOUTUBE_CLIENT_ID: id, YOUTUBE_CLIENT_SECRET: secreto, YOUTUBE_REFRESH_TOKEN: j.refresh_token });
      msg(res, "<h2>Listo, YouTube conectado.</h2>Ya puedes cerrar esta pestaña.");
      console.log("YouTube conectado. Permiso guardado en .env.local.");
      setTimeout(() => process.exit(0), 300);
    })().catch((x) => msg(res, String(x), 500));
    return;
  }
  if (req.method === "POST") {
    let b = ""; req.on("data", (c) => (b += c));
    req.on("end", () => {
      const f = new URLSearchParams(b); id = f.get("id")?.trim(); secreto = f.get("s")?.trim();
      if (!/\.apps\.googleusercontent\.com$/.test(id || "") || !(secreto || "").length) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(pagina("Faltan datos o el ID no acaba en .apps.googleusercontent.com")); }
      res.writeHead(302, { location: urlGoogle() }); res.end();
    });
    return;
  }
  if (id && secreto) { res.writeHead(302, { location: urlGoogle() }); return res.end(); }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(pagina());
});
srv.listen(Number(arg("puerto", 0)), "127.0.0.1", () => { puerto = srv.address().port; const u = `http://127.0.0.1:${puerto}/`; console.log(`Abriendo ${u}`); abrir(u); });
setTimeout(() => { console.error("Se acabó el tiempo (10 min)."); process.exit(1); }, 600000).unref();
