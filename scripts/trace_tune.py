import numpy as np, potrace
from PIL import Image
im = Image.open("src/cervantes1-2.png").convert("RGBA")
alpha = im.split()[3]

def build(scale, turd, amax, otol):
    a = alpha.resize((im.width*scale, im.height*scale), Image.LANCZOS)
    arr = np.array(a) > 128
    ys, xs = np.where(arr)
    arr = arr[ys.min():ys.max()+1, xs.min():xs.max()+1]
    h, w = arr.shape
    path = potrace.Bitmap(~arr).trace(turdsize=turd, alphamax=amax, opticurve=True, opttolerance=otol)
    K = 1000.0/w; VH = round(h*K, 2)
    f = lambda v: round(v*K, 2)
    d = []
    for c in path:
        s = c.start_point; d.append("M%s %s" % (f(s.x), f(s.y)))
        for seg in c:
            if seg.is_corner:
                d.append("L%s %sL%s %s" % (f(seg.c.x), f(seg.c.y), f(seg.end_point.x), f(seg.end_point.y)))
            else:
                d.append("C%s %s %s %s %s %s" % (f(seg.c1.x), f(seg.c1.y), f(seg.c2.x), f(seg.c2.y), f(seg.end_point.x), f(seg.end_point.y)))
        d.append("Z")
    return "".join(d), VH

for name, args in [("A", (4,4,1.0,0.2)), ("B", (3,6,1.2,0.6)), ("C", (2,4,1.3,1.0)), ("D", (2,4,1.334,2.0))]:
    d, vh = build(*args)
    print(name, args, len(d), "car. vh=", vh)
    open("tune-%s.svg" % name, "w").write(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 %s" width="1000"><rect width="1000" height="%s" fill="#fff"/><path fill="#111" d="%s"/></svg>' % (vh, vh, d))
    open("tune-%s.txt" % name, "w").write(d)
