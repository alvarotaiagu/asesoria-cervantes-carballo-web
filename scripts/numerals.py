"""Numerales de capitulo I II III IV, dibujados a trazo con la misma
caligrafia que el resto del sitio."""
import numpy as np, json
from PIL import Image, ImageFont, ImageDraw
import penlib

F = ImageFont.truetype("Allura-Regular.ttf", 400)
salida = {}
for n in ["I", "II", "III", "IV"]:
    bb = F.getbbox(n); M = 50
    im = Image.new("L", (bb[2]-bb[0]+M*2, bb[3]-bb[1]+M*2), 0)
    ImageDraw.Draw(im).text((M-bb[0], M-bb[1]), n, font=F, fill=255)
    a = np.array(im) > 110
    ys, xs = np.where(a); a = a[ys.min():ys.max()+1, xs.min():xs.max()+1]
    h0, w0 = a.shape
    H = 520; W = max(1, int(round(w0*H/h0)))
    a = np.array(Image.fromarray((a*255).astype(np.uint8)).resize((W, H), Image.LANCZOS)) > 128
    tr = penlib.trazos_de(penlib.adelgazar(a), podar_umbral=5, min_pts=8)
    tr.sort(key=lambda t: min(x for y, x in t))
    K = 200.0 / H                      # alto normalizado a 200
    paths = []
    for t in tr:
        pts = [(x*K, y*K) for y, x in t]
        s = penlib.rdp(pts, 0.9)
        if len(s) < 3: continue
        paths.append({"d": penlib.a_bezier(s), "len": round(penlib.largo(pts), 1)})
    salida[n] = {"viewBox": "0 0 %s 200" % round(W*K, 1), "trazos": paths}
    print("%-4s %2d trazos  ancho %.1f  %4d car." % (n, len(paths), W*K, sum(len(p["d"]) for p in paths)))
json.dump(salida, open("numerals.json", "w"))
open("numerals_preview.html", "w", encoding="utf-8").write(
    '<!doctype html><meta charset=utf-8><style>body{background:#F4F0E8;margin:30px;display:flex;gap:40px;align-items:flex-end}'
    'svg{height:150px}path{fill:none;stroke:#E8B469;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}</style>' +
    "".join('<svg viewBox="%s">%s</svg>' % (v["viewBox"], "".join('<path d="%s"/>' % p["d"] for p in v["trazos"]))
            for v in salida.values()))
