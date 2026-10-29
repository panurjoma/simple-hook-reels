#!/usr/bin/env node
// clave.mjs — abre la página de claves de ElevenLabs y otra en este ordenador para pegar la clave. La comprueba con
// ElevenLabs, la guarda en .env.local y se cierra. La clave nunca pasa por el chat ni sale del ordenador, salvo a
// ElevenLabs para comprobarla.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { RAIZ, WIN } from "./_comun.mjs";

const ENV = join(RAIZ, ".env.local");
const CLAVES = "https://elevenlabs.io/app/settings/api-keys";
const pagina = (msg = "") => `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Tu clave de voz</title><style>body{font:18px/1.5 system-ui;max-width:560px;margin:48px auto;padding:0 16px;color:#111;background:#fff}
input{width:100%;box-sizing:border-box;font:16px monospace;padding:12px;border:1px solid #bbb;border-radius:8px}button{margin-top:14px;font:600 16px system-ui;padding:12px 20px;border:0;border-radius:8px;background:#111;color:#fff;cursor:pointer}
ol{padding-left:22px}li{margin:6px 0}.ok{color:#127a3a}.mal{color:#b3261e}.aviso{color:#8a5a00}a{color:#0a6fa8}</style><h1>Tu clave de ElevenLabs</h1>
<ol><li>En la otra pestaña, <a href="${CLAVES}" target="_blank" rel="noopener">ElevenLabs → API Keys</a> (entra o crea la cuenta gratis).</li>
<li>Pulsa <b>Create API Key</b> y dale permiso de <b>Text to Speech</b>, <b>Sound Effects</b> y <b>Voices</b> (lectura).</li>
<li>Copia la clave (empieza por <code>sk_</code>) y pégala aquí. No en el chat. Se guarda solo en este ordenador.</li></ol>
<form method="post"><input name="k" placeholder="sk_..." autocomplete="off" spellcheck="false" autofocus><button>Guardar</button></form><p>${msg}</p></html>`;

// Lo que dice ElevenLabs de la clave: "mala" si no la conoce; si no, se guarda (un permiso de menos solo avisa).
async function comprobar(k) {
  try {
    const r = await fetch("https://api.elevenlabs.io/v1/user", { headers: { "xi-api-key": k }, signal: AbortSignal.timeout(10000) });
    if (r.ok) return "buena";
    const t = await r.text();
    if (/invalid_api_key|api_key_not_found|invalid api key/i.test(t)) return "mala";
    return "sin-permiso";
  } catch { return "sin-red"; }
}

const srv = createServer((req, res) => {
  const html = (m) => { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(pagina(m)); };
  if (req.method !== "POST") return html();
  let b = "";
  req.on("data", (c) => (b += c));
  req.on("end", async () => {
    const k = new URLSearchParams(b).get("k")?.trim() || "";
    if (!/^sk_[A-Za-z0-9]{20,}$/.test(k)) return html('<span class="mal">Esa no parece la clave: empieza por sk_ y es larga. El ID corto de la lista no sirve; copia la clave entera al crearla.</span>');
    const estado = await comprobar(k);
    if (estado === "mala") return html('<span class="mal">ElevenLabs no reconoce esa clave. Crea una nueva y pégala entera.</span>');
    const antes = existsSync(ENV) ? readFileSync(ENV, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("ELEVENLABS_API_KEY=")) : [];
    writeFileSync(ENV, [...antes, `ELEVENLABS_API_KEY=${k}`].join("\n") + "\n");
    const nota = estado === "buena" ? "" : estado === "sin-permiso"
      ? ' <span class="aviso">(Si al hacer la voz falla, revisa que la clave tenga los permisos de arriba.)</span>'
      : ' <span class="aviso">(No pude comprobarla ahora; se probará al hacer la voz.)</span>';
    html(`<span class="ok">Guardada. Ya puedes cerrar esta pestaña y volver al chat.</span>${nota}`);
    console.log(`clave guardada en .env.local (${estado})`);
    setTimeout(() => process.exit(0), 300);
  });
});
const abrir = (url) => {
  const a = WIN ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  spawn(a[0], a[1], { detached: true, stdio: "ignore" }).unref();
};
srv.listen(0, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${srv.address().port}/`;
  console.log(`página de la clave: ${url} (y ${CLAVES})`);
  if (!process.argv.includes("--sin-abrir")) {
    abrir(CLAVES);
    setTimeout(() => abrir(url), 800);
  }
});
setTimeout(() => { console.log("la página se cerró sin clave (10 min)"); process.exit(1); }, 10 * 60 * 1000);
