"""Vectoriza el wordmark 'Cervantes' (PNG blanco sobre transparente) a un path SVG.
El PNG de origen es el logo real de la asesoria; se traza el canal alfa."""
import numpy as np, potrace
from PIL import Image

SRC = "src/cervantes1-2.png"
SCALE = 4  # sobremuestreo: bordes mas limpios en la caligrafia fina

im = Image.open(SRC).convert("RGBA")
a = im.split()[3]
a = a.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
arr = np.array(a) > 128

# recorte a la tinta real
ys, xs = np.where(arr)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
arr = arr[y0:y1, x0:x1]
h, w = arr.shape
print("tinta:", w, "x", h, "ratio", round(w / h, 4))

bmp = potrace.Bitmap(arr)
path = bmp.trace(turdsize=4, alphamax=1.0, opticurve=True, opttolerance=0.2)

# viewBox normalizado a 1000 de ancho
K = 1000.0 / w
VH = round(h * K, 2)

def f(v):
    return round(v * K, 2)

d = []
for curve in path:
    s = curve.start_point
    d.append("M%s %s" % (f(s.x), f(s.y)))
    for seg in curve:
        if seg.is_corner:
            d.append("L%s %s" % (f(seg.c.x), f(seg.c.y)))
            d.append("L%s %s" % (f(seg.end_point.x), f(seg.end_point.y)))
        else:
            d.append("C%s %s %s %s %s %s" % (
                f(seg.c1.x), f(seg.c1.y), f(seg.c2.x), f(seg.c2.y),
                f(seg.end_point.x), f(seg.end_point.y)))
    d.append("Z")
d = "".join(d)
print("subtrazos:", len(list(path)), "| longitud del path:", len(d), "car.")
print("viewBox: 0 0 1000", VH)
open("wordmark-fill-path.txt", "w").write(d)
open("wordmark-viewbox.txt", "w").write("0 0 1000 %s" % VH)

svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 %s">'
       '<path fill="#22332B" d="%s"/></svg>' % (VH, d))
open("wordmark-fill.svg", "w").write(svg)
