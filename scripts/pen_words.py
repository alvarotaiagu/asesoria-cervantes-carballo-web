"""Dibuja con la tuberia de penlib la primera palabra de cada titular:
cada seccion se anuncia con un trazo fino de pluma que la escribe y luego
cede el sitio a la tipografia serif."""
import numpy as np, json
from PIL import Image, ImageFont, ImageDraw
import penlib

PALABRAS = ["Prologo_Prólogo", "Cuatro", "Acceso", "Noticias", "Resenas_Reseñas", "Contacto", "Hablamos"]
FUENTE = ImageFont.truetype("Allura-Regular.ttf", 340)
SUP = 2          # se dibuja al doble y se reduce: bordes mas limpios

salida = {}
for item in PALABRAS:
    clave, texto = (item.split("_") + [None])[:2]
    texto = texto or clave
    bb = FUENTE.getbbox(texto)
    M = 40
    im = Image.new("L", (bb[2]-bb[0] + M*2, bb[3]-bb[1] + M*2), 0)
    ImageDraw.Draw(im).text((M - bb[0], M - bb[1]), texto, font=FUENTE, fill=255)
    a = np.array(im) > 110
    ys, xs = np.where(a)
    a = a[ys.min():ys.max()+1, xs.min():xs.max()+1]
    h0, w0 = a.shape
    # escala de trabajo: ~700 px de ancho da un esqueleto estable
    W = 700; H = max(1, int(round(h0 * W / w0)))
    a = np.array(Image.fromarray((a*255).astype(np.uint8)).resize((W, H), Image.LANCZOS)) > 128

    S = penlib.adelgazar(a)
    trazos = penlib.trazos_de(S, podar_umbral=4, min_pts=7)
    trazos.sort(key=lambda t: min(x for y, x in t))          # de izquierda a derecha
    K = 1000.0 / W
    VH = round(H * K, 1)
    paths = []
    for t in trazos:
        pts = [(x*K, y*K) for y, x in t]
        s = penlib.rdp(pts, 1.6)
        if len(s) < 3: continue
        paths.append({"d": penlib.a_bezier(s), "len": round(penlib.largo(pts), 1)})
    salida[clave] = {"texto": texto, "viewBox": "0 0 1000 %s" % VH, "trazos": paths}
    print("%-10s %2d trazos  %5d car.  viewBox alto %s" %
          (texto, len(paths), sum(len(p["d"]) for p in paths), VH))

json.dump(salida, open("pen_words.json", "w", encoding="utf-8"), ensure_ascii=False)

# vista previa para comprobarlas de un vistazo
filas = "".join(
    '<div class="f"><svg viewBox="%s">%s</svg><b>%s</b></div>' %
    (v["viewBox"], "".join('<path d="%s"/>' % p["d"] for p in v["trazos"]), v["texto"])
    for v in salida.values())
open("pen_words_preview.html", "w", encoding="utf-8").write(
    '<!doctype html><meta charset=utf-8><style>body{background:#F4F0E8;font:14px sans-serif;margin:24px}'
    '.f{margin:18px 0}svg{width:520px;display:block}path{fill:none;stroke:#8CAA88;stroke-width:4;'
    'stroke-linecap:round;stroke-linejoin:round}b{color:#22332B}</style>' + filas)
print("vista previa: pen_words_preview.html")
