"""Genera el SVG del wordmark 'Cervantes':
   - un path de relleno (contorno real vectorizado del logo de la asesoria)
   - 15 paths de linea central, en orden de escritura, para animar con
     stroke-dasharray. Llevan pathLength="1" para que el dasharray no dependa
     de la escala a la que se pinte el SVG.
"""
import json, math

VB_W, VB_H = 1000.0, 282.0
trazos = [[(float(x), float(y)) for x, y in t] for t in json.load(open("trazos.json"))]

# ---- 1. orden de escritura: la palabra se construye de izquierda a derecha
#         (la C primero, el palo de la t antes que su travesano, y el travesano
#         al final, que es como se cruza una t a mano). La direccion de cada
#         trazo se elige por el extremo mas cercano a donde quedo la pluma. ---
def dist(a, b): return math.hypot(a[0]-b[0], a[1]-b[1])
CRUZ_T = 7                                   # travesano de la t: va el ultimo
sec = sorted((i for i in range(len(trazos)) if i != CRUZ_T),
             key=lambda i: min(p[0] for p in trazos[i]))
sec = [1, 0] + [i for i in sec if i not in (0, 1)] + [CRUZ_T]

orden, pluma = [], None
for i in sec:
    rev = False
    if pluma is not None:
        rev = dist(pluma, trazos[i][-1]) < dist(pluma, trazos[i][0])
    orden.append((i, rev))
    pluma = (trazos[i][::-1] if rev else trazos[i])[-1]
print("orden final:", [i for i, _ in orden])

# ---- 2. simplificacion RDP + suavizado Catmull-Rom -> Bezier cubica ---------
def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0]-a[0], b[1]-a[1]
    n = math.hypot(dx, dy)
    peor, k = -1, 0
    for i in range(1, len(pts)-1):
        p = pts[i]
        d = abs(dy*p[0] - dx*p[1] + b[0]*a[1] - b[1]*a[0]) / n if n else dist(p, a)
        if d > peor: peor, k = d, i
    if peor > eps:
        return rdp(pts[:k+1], eps)[:-1] + rdp(pts[k:], eps)
    return [a, b]

def a_bezier(pts, t=0.22):
    """Catmull-Rom a cubicas; t controla la tension del trazo"""
    if len(pts) < 2: return ""
    P = [pts[0]] + pts + [pts[-1]]
    d = ["M%.1f %.1f" % pts[0]]
    for i in range(1, len(P)-2):
        p0, p1, p2, p3 = P[i-1], P[i], P[i+1], P[i+2]
        c1 = (p1[0] + (p2[0]-p0[0])*t, p1[1] + (p2[1]-p0[1])*t)
        c2 = (p2[0] - (p3[0]-p1[0])*t, p2[1] - (p3[1]-p1[1])*t)
        d.append("C%.1f %.1f %.1f %.1f %.1f %.1f" % (c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]))
    return "".join(d)

EPS = 1.15
paths, total = [], 0
for i, rev in orden:
    pts = trazos[i][::-1] if rev else trazos[i]
    s = rdp(pts, EPS)
    d = a_bezier(s)
    total += len(d)
    paths.append({"i": i, "n": len(s), "d": d})
    print("  trazo %2d  %4d -> %3d puntos  %5d car." % (i, len(pts), len(s), len(d)))
print("total d:", total, "car.")

# longitud aproximada de cada trazo, para repartir la duracion de la escritura
for p, (i, rev) in zip(paths, orden):
    pts = trazos[i][::-1] if rev else trazos[i]
    p["len"] = round(sum(dist(pts[k], pts[k+1]) for k in range(len(pts)-1)), 1)
L = sum(p["len"] for p in paths)
print("longitud total del ductus:", round(L))

fill = open("tune-C.txt").read()
vb = "0 0 1000 282.05"

trazos_svg = "\n".join(
    '  <path class="wm-t" pathLength="1" d="%s"/>' % p["d"] for p in paths)
svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" role="img" aria-label="Cervantes">
 <title>Cervantes</title>
 <g class="wm-trazos" fill="none" stroke="#8CAA88" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
%s
 </g>
 <path class="wm-relleno" fill="#22332B" d="%s"/>
</svg>
""" % (vb, trazos_svg, fill)
open("../assets/img/brand/cervantes-wordmark.svg", "w").write(svg)
json.dump({"viewBox": vb, "fill": fill, "trazos": [{"d": p["d"], "len": p["len"]} for p in paths]},
          open("wordmark.json", "w"))
print("SVG escrito:", len(svg), "car.")
