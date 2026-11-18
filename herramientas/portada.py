# Portada propia: un fotograma del vídeo (con Pablo abajo a la izquierda) + título hook grande arriba.
# Uso: python portada.py <fotograma.jpg> <salida.jpg> "línea 1" "línea 2" "línea 3"   (la 2.ª va en dorado)
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, out, *lineas = sys.argv[1:]
W, H = 1080, 1920
im = Image.open(src).convert("RGB").resize((W, H))
# degradado oscuro arriba: tapa los subtítulos del fotograma y da fondo al título
g = Image.new("L", (1, H), 0)
for y in range(H):
    g.putpixel((0, y), 255 if y < 470 else max(0, int(255 * (1 - (y - 470) / 330))) if y < 800 else 0)
g = g.resize((W, H))
im = Image.composite(Image.new("RGB", (W, H), (5, 9, 18)), im, g.point(lambda v: int(v * 1.0)))
FUENTE = "C:/Windows/Fonts/ariblk.ttf"
def ajusta(t, ancho=960, tam=130):
    while tam > 40:
        f = ImageFont.truetype(FUENTE, tam)
        if f.getlength(t) <= ancho: return f
        tam -= 4
    return f
d = ImageDraw.Draw(im)
medidas = [ajusta(t) for t in lineas]
tam_comun = min(f.size for f in medidas)
y = 300
sombra = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sombra)
pos = []
for i, t in enumerate(lineas):
    f = ImageFont.truetype(FUENTE, tam_comun if i != 1 else min(medidas[1].size + 18, 150))
    f = ajusta(t, 960, f.size) if f.getlength(t) > 960 else f
    x = (W - f.getlength(t)) / 2
    pos.append((x, y, t, f, (236, 177, 69) if i == 1 else (246, 248, 252)))
    y += int(f.size * 1.28)
for x, yy, t, f, c in pos:
    ds.text((x + 4, yy + 6), t, font=f, fill=(0, 0, 0, 230))
sombra = sombra.filter(ImageFilter.GaussianBlur(5))
im = Image.alpha_composite(im.convert("RGBA"), sombra).convert("RGB")
d = ImageDraw.Draw(im)
for x, yy, t, f, c in pos:
    d.text((x, yy), t, font=f, fill=c)
im.save(out, quality=93)
