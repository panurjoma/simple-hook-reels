// render.mjs — saca icon.png, banner.png y watermark.png de los .html de esta carpeta con Chrome sin pantalla.
// Uso: node brand/render.mjs
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const aqui = dirname(fileURLToPath(import.meta.url));
const chrome = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
if (!chrome) { console.error("no encuentro Chrome ni Edge"); process.exit(1); }
const trabajos = [["icono.html", "icon.png", 1024, 1024, "ff060a12"], ["icono-z.html", "icon-z.png", 1024, 1024, "ff060a12"], ["banner.html", "banner.png", 2560, 1440, "ff060a12"], ["watermark.html", "watermark.png", 512, 512, "00000000"]];
for (const [src, out, w, h, fondo] of trabajos) {
  const r = spawnSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--default-background-color=${fondo}`, `--window-size=${w},${h}`, `--screenshot=${join(aqui, out)}`, "--virtual-time-budget=2000", pathToFileURL(join(aqui, src)).href], { encoding: "utf8" });
  console.log(out, r.status === 0 ? "ok" : "ERROR " + r.stderr.slice(-200));
}
