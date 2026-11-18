// _instagram.mjs — lo común de instagram-auth.mjs e instagram-mcp.mjs: Instagram API con inicio de sesión unificado.
// El token es un «Business Integration System User Access Token» (pertenece al portfolio, no a la persona; host graph.facebook.com).
import { guardarEnv, leerEnv } from "./_youtube.mjs";
export { guardarEnv, leerEnv };

export const VER = "v26.0";
const G = `https://graph.facebook.com/${VER}`;

export function credenciales() {
  const e = leerEnv();
  if (!e.INSTAGRAM_TOKEN) throw new Error("Instagram no está conectado: ejecuta node herramientas/instagram-auth.mjs");
  return e;
}

async function leer(r) {
  const t = await r.text(); let j; try { j = t ? JSON.parse(t) : {}; } catch { j = { texto: t }; }
  if (!r.ok || j.error) throw new Error(`Instagram ${r.status}: ${j.error?.message || t.slice(0, 300)}`);
  return j;
}

// Llama a graph.facebook.com. Ruta relativa ("me", "<id>/media"...).
export async function ig(metodo, ruta, { query = {}, form = {}, token } = {}) {
  const tk = token || credenciales().INSTAGRAM_TOKEN;
  const url = `${G}/${ruta}?${new URLSearchParams({ ...query, ...(metodo === "GET" ? { access_token: tk } : {}) })}`;
  const init = { method: metodo, headers: {} };
  if (metodo !== "GET") { init.headers["content-type"] = "application/x-www-form-urlencoded"; init.body = new URLSearchParams({ ...form, access_token: tk }); }
  return leer(await fetch(url, init));
}

// Con este token, /me es el usuario de sistema; la cuenta de Instagram sale de /me/assigned_instagram_accounts.
export async function cuentas(token) {
  const [yo, c] = await Promise.all([
    ig("GET", "me", { query: { fields: "client_business_id" }, token }).catch(() => ({})),
    ig("GET", "me/assigned_instagram_accounts", { query: { fields: "id,username" }, token }),
  ]);
  return { negocio: yo.client_business_id, cuentas: c.data || [] };
}

// Canjea el código del inicio de sesión (desde el servidor) por el token de sistema.
export async function canjear(code, id, secreto, redirect) {
  return leer(await fetch(`${G}/oauth/access_token?` + new URLSearchParams({ client_id: id, client_secret: secreto, code, ...(redirect && { redirect_uri: redirect }) })));
}
