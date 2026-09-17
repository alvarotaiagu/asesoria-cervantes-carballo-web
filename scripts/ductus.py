"""Reconstruye el orden de escritura sobre el esqueleto del wordmark.
- grado = numero de RAMAS (rachas circulares de vecinos), no vecinos sueltos
- los tramos se extraen consumiendo pixeles, prefiriendo el vecino ortogonal
- en cada cruce se sigue por la direccion que menos gira: asi se enlaza a mano
"""
import numpy as np, json, math
from PIL import Image, ImageDraw

S = np.load("skeleton.npy").astype(np.uint8)
H, W = S.shape
CIRC = [(-1,-1),(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1)]
P = set(zip(*np.where(S)))

def vec(p, pts):
    y, x = p
    v = [(y+dy, x+dx) for dy, dx in CIRC if (y+dy, x+dx) in pts]
    return sorted(v, key=lambda q: abs(q[0]-y) + abs(q[1]-x))   # ortogonal primero

def ramas(p, pts):
    y, x = p
    m = [((y+dy, x+dx) in pts) for dy, dx in CIRC]
    if all(m): return 1
    return sum(1 for i in range(8) if m[i] and not m[i-1])

nodos = {p for p in P if ramas(p, P) != 2}
print("pixeles", len(P), "| nodos", len(nodos))

# ---- tramos -----------------------------------------------------------------
usado, edges, nn = set(), [], set()
for n in sorted(nodos):
    for v in vec(n, P):
        if v in nodos:
            k = frozenset((n, v))
            if k not in nn: nn.add(k); edges.append([n, v])
            continue
        if v in usado: continue
        cam = [n, v]; usado.add(v); prev, act = n, v
        while True:
            sig = [q for q in vec(act, P) if q != prev and q not in usado]
            nd = [q for q in sig if q in nodos]
            if nd: cam.append(nd[0]); break
            sig = [q for q in sig if q not in nodos]
            if not sig: break
            q = sig[0]; usado.add(q); cam.append(q); prev, act = act, q
        edges.append(cam)

rest = {p for p in P if p not in nodos and p not in usado}
while rest:                                   # bucles cerrados sin ningun nodo
    p = min(rest); cam = [p]; usado.add(p); rest.discard(p); prev, act = None, p
    while True:
        sig = [q for q in vec(act, P) if q != prev and q not in usado]
        if not sig: break
        q = sig[0]; usado.add(q); rest.discard(q); cam.append(q); prev, act = act, q
    if len(cam) > 10: cam.append(cam[0]); edges.append(cam)

edges = [e for e in edges if len(e) >= 3]
print("tramos:", len(edges), "| longitudes:", sorted(len(e) for e in edges))

# ---- recorrido por giro minimo ---------------------------------------------
def ang(a, b): return math.atan2(b[0]-a[0], b[1]-a[1])
def d_sal(e, ini):
    q = e if ini else e[::-1]; k = min(9, len(q)-1); return ang(q[0], q[k])
def d_ent(e, ini):
    q = e if ini else e[::-1]; k = min(9, len(q)-1); return ang(q[-1-k], q[-1])

incid = {}
for i, e in enumerate(edges):
    incid.setdefault(e[0], []).append((i, True))
    incid.setdefault(e[-1], []).append((i, False))

libre = set(range(len(edges)))
def trazar(i, ini):
    out = []
    while True:
        libre.discard(i)
        e = edges[i] if ini else edges[i][::-1]
        out.extend(e if not out else e[1:])
        cand = []
        d_in = d_ent(edges[i], ini)
        for j, di in incid.get(e[-1], []):
            if j not in libre: continue
            g = abs((d_sal(edges[j], di) - d_in + math.pi) % (2*math.pi) - math.pi)
            cand.append((g, j, di))
        if not cand: break
        cand.sort()
        if cand[0][0] > 1.9: break            # giro casi en redondo: se levanta la pluma
        _, i, ini = cand[0]
    return out

arranques = []
for i, e in enumerate(edges):
    for p, ini in ((e[0], True), (e[-1], False)):
        if len(incid.get(p, [])) == 1: arranques.append((p[1], p[0], i, ini))
arranques.sort()
trazos = []
for _, _, i, ini in arranques:
    if i in libre: trazos.append(trazar(i, ini))
while libre:
    trazos.append(trazar(min(libre), True))
trazos = [t for t in trazos if len(t) > 20]
print("TRAZOS:", len(trazos), [len(t) for t in trazos])
json.dump([[[int(x), int(y)] for y, x in t] for t in trazos], open("trazos.json", "w"))

COL = [(200,30,30),(20,110,220),(20,150,60),(230,130,0),(150,40,200),(0,150,160),(230,60,140),(110,90,20),(70,70,70),(0,160,90)]
img = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(img)
for i, t in enumerate(trazos):
    c = COL[i % len(COL)]
    for y, x in t: d.point((x, y), fill=c)
    d.text((min(W-16, t[0][1]), max(0, t[0][0]-10)), str(i), fill=c)
img.resize((W*2, H*2), Image.LANCZOS).save("trazos.png")
