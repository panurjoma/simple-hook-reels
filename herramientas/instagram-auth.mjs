#!/usr/bin/env node
// instagram-auth.mjs — conecta la cuenta de Instagram (API con inicio de sesión unificado). Abre una página local: pega el
// token de sistema que da el panel de Meta («Generar tokens de acceso», app en desarrollo) o, si tienes URL HTTPS de
// redirección, el ID y secreto de la app para canjear un código. Se comprueba y se guarda en .env.local.
// Nada pasa por el chat ni sale del ordenador, salvo hacia Meta.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { WIN, arg } from "./_comun.mjs";
import { canjear, cuentas, guardarEnv } from "./_instagram.mjs";

const abrir = (u) => spawn(WIN ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open", WIN ? ["/c", "start", "", u.replace(/&/g, "^&")] : [u], { stdio: "ignore", detached: true }).unref();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pagina = (m = "", ok = false) => `<!doctype html><html lang="es"><meta charset="utf-8"><title>Conectar Instagram</title><style>body{font:18px/1.5 system-ui;max-width:660px;margin:48px auto;padding:0 16px}
input{width:100%;box-sizing:border-box;font:15px monospace;padding:10px;margin:6px 0 14px;border:1px solid #bbb;border-radius:8px}button{font:600 16px system-ui;padding:12px 20px;border:0;border-radius:8px;background:#111;color:#fff;cursor:pointer}.mal{color:#b3261e}.bien{color:#1a7f37}small{color:#666}</style>
<h1>Conectar Instagram</h1><p>API con <b>inicio de sesión unificado</b> (la app debe pertenecer a un portfolio empresarial).</p><ol>
<li>En <a href="https://developers.facebook.com/apps/" target="_blank">Meta for Developers</a>: tu app → Casos de uso → Administrar mensajes y contenido en Instagram → Personalizar → <b>API setup with Unified login</b>.</li>
<li>En <b>Generate access tokens</b>, añade tu cuenta como <i>Instagram Tester</i>, acéptala en Instagram (Ajustes → Permisos del sitio web → Invitaciones de probador) y genera el token. <small>Se muestra una sola vez.</small></li>
<li>Pega aquí el token.</li></ol>
<form method="post"><input name="t" placeholder="Token de sistema (EAA…)" autocomplete="off"><button>Conectar</button></form>
<p class="${ok ? "bien" : "mal"}">${m}</p></html>`;
const enviar = (res, h) => { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(h); };

const srv = createServer((req, res) => {
  if (req.method !== "POST") return enviar(res, pagina());
  let b = ""; req.on("data", (c) => (b += c));
  req.on("end", async () => {
    try {
      const token = new URLSearchParams(b).get("t")?.trim();
      if (!token) return enviar(res, pagina("Falta el token."));
      const { negocio, cuentas: cs } = await cuentas(token);
      if (!cs.length) return enviar(res, pagina("El token vale, pero no tiene ninguna cuenta de Instagram asignada. Comprueba que la cuenta es Business o Creator y que la has compartido con la app."));
      guardarEnv({ INSTAGRAM_TOKEN: token, INSTAGRAM_USER_ID: cs[0].id, ...(negocio && { INSTAGRAM_NEGOCIO_ID: negocio }) });
      enviar(res, pagina(`Listo: conectado como @${esc(cs[0].username)}${cs.length > 1 ? ` (+${cs.length - 1} cuentas más; se usa la primera)` : ""}. Ya puedes cerrar esta pestaña.`, true));
      console.log(`Instagram conectado como @${cs[0].username}. Guardado en .env.local.`);
      setTimeout(() => process.exit(0), 400);
    } catch (x) { enviar(res, pagina(esc(x.message || x))); }
  });
});
srv.listen(Number(arg("puerto", 0)), "127.0.0.1", () => { const u = `http://127.0.0.1:${srv.address().port}/`; console.log(`Abriendo ${u}`); abrir(u); });
setTimeout(() => { console.error("Se acabó el tiempo (10 min)."); process.exit(1); }, 600000).unref();
