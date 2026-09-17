"""Marca: la 'C' caligrafica del favicon de la asesoria, vectorizada, mas los
iconos PNG en verde salvia sobre papel."""
import numpy as np, potrace, os
from PIL import Image, ImageDraw

os.makedirs("../assets/img/brand", exist_ok=True)
im = Image.open("src/cropped-favicon-512px.png").convert("RGBA")
a = im.split()[3]
a = a.resize((a.width*3, a.height*3), Image.LANCZOS)
arr = np.array(a) > 128
ys, xs = np.where(arr)
arr = arr[ys.min():ys.max()+1, xs.min():xs.max()+1]
h, w = arr.shape
path = potrace.Bitmap(~arr).trace(turdsize=4, alphamax=1.3, opttolerance=0.9)
L = float(max(w, h)); K = 100.0 / L
ox = (100 - w*K) / 2; oy = (100 - h*K) / 2
f = lambda v, o: round(v*K + o, 2)
d = []
for c in path:
    s = c.start_point
    d.append("M%s %s" % (f(s.x, ox), f(s.y, oy)))
    for seg in c:
        if seg.is_corner:
            d.append("L%s %sL%s %s" % (f(seg.c.x, ox), f(seg.c.y, oy), f(seg.end_point.x, ox), f(seg.end_point.y, oy)))
        else:
            d.append("C%s %s %s %s %s %s" % (f(seg.c1.x, ox), f(seg.c1.y, oy), f(seg.c2.x, ox), f(seg.c2.y, oy), f(seg.end_point.x, ox), f(seg.end_point.y, oy)))
    d.append("Z")
d = "".join(d)
print("C vectorizada:", len(d), "car.")
open("c-path.txt", "w").write(d)

marca = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Cervantes">'
         '<path fill="#8CAA88" d="%s"/></svg>' % d)
open("../assets/img/brand/cervantes-c.svg", "w").write(marca)

icono = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
         '<rect width="100" height="100" rx="22" fill="#22332B"/>'
         '<g transform="translate(50 50) scale(.74) translate(-50 -50)">'
         '<path fill="#8CAA88" d="%s"/></g></svg>' % d)
open("../assets/img/brand/icon.svg", "w").write(icono)
print("SVG de marca escritos")
