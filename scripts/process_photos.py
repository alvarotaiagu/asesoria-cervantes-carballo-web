"""Descarga las fotos elegidas de Pexels y las iguala a la paleta 'Pluma':
cremas calidos, verdes apagados, sombras templadas. Sin ellas cada foto trae
su propio blanco y la pagina parece un collage."""
import os, urllib.request
from PIL import Image, ImageEnhance, ImageOps

FUERA = "../assets/img/photos"
os.makedirs(FUERA, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36"}

# id de Pexels -> (nombre, anchos a generar, recorte objetivo)
ELEGIDAS = [
    ("114107",   "caligrafia",  [1600, 900], (3, 2)),
    ("9786294",  "pluma-sobres",[1400, 900], (3, 2)),
    ("8376141",  "manos",       [1400, 900], (4, 3)),
    ("36887756", "despacho",    [1600, 900], (3, 2)),
    ("8250969",  "escritorio",  [1400, 900], (4, 3)),
    ("11176866", "archivo",     [1200, 900], (3, 2)),
    ("18886987", "luz",         [1600, 900], (3, 1)),
]

def descarga(i):
    f = "photos_src/%s.jpg" % i
    os.makedirs("photos_src", exist_ok=True)
    if os.path.exists(f) and os.path.getsize(f) > 50000: return f
    url = "https://images.pexels.com/photos/%s/pexels-photo-%s.jpeg?auto=compress&cs=tinysrgb&w=2200" % (i, i)
    open(f, "wb").write(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())
    return f

def curva(c, puntos):
    """interpolacion lineal de una curva de tono definida por puntos (0-255)"""
    xs, ys = zip(*puntos)
    tabla = []
    for v in range(256):
        for k in range(len(xs)-1):
            if xs[k] <= v <= xs[k+1]:
                t = (v - xs[k]) / (xs[k+1] - xs[k]) if xs[k+1] != xs[k] else 0
                tabla.append(int(round(ys[k] + t*(ys[k+1]-ys[k])))); break
        else:
            tabla.append(min(255, max(0, v)))
    return c.point(tabla)

def graduar(im):
    im = im.convert("RGB")
    im = ImageEnhance.Color(im).enhance(0.72)          # verdes y madera, apagados
    r, g, b = im.split()
    # sombras calidas, altas luces hacia el hueso (#F4F0E8)
    r = curva(r, [(0, 16), (60, 74), (128, 140), (200, 214), (255, 250)])
    g = curva(g, [(0, 15), (60, 70), (128, 134), (200, 208), (255, 243)])
    b = curva(b, [(0, 14), (60, 62), (128, 120), (200, 190), (255, 233)])
    im = Image.merge("RGB", (r, g, b))
    im = ImageEnhance.Contrast(im).enhance(1.04)
    im = ImageEnhance.Brightness(im).enhance(1.02)
    return im

def recorta(im, prop):
    pw, ph = prop
    w, h = im.size
    objetivo = pw / ph
    if w / h > objetivo:
        nw = int(h * objetivo); x = (w - nw) // 2
        im = im.crop((x, 0, x + nw, h))
    else:
        nh = int(w / objetivo); y = int((h - nh) * 0.42)   # un poco por encima del centro
        im = im.crop((0, y, w, y + nh))
    return im

log = []
for pid, nombre, anchos, prop in ELEGIDAS:
    f = descarga(pid)
    im = ImageOps.exif_transpose(Image.open(f))
    im = graduar(recorta(im, prop))
    for w in anchos:
        h = int(round(w * prop[1] / prop[0]))
        out = "%s/%s-%d.jpg" % (FUERA, nombre, w)
        im.resize((w, h), Image.LANCZOS).save(out, quality=82, optimize=True, progressive=True)
        log.append("%-22s %5d KB  pexels:%s" % (os.path.basename(out), os.path.getsize(out)//1024, pid))
print("\n".join(log))
open("photos_log.txt", "w").write("\n".join(log) + "\n")
