"""Convierte el esqueleto en un grafo: nodos (extremos y cruces) y tramos.
Dibuja cada tramo con su numero para poder ordenar el ductus a mano."""
import numpy as np, json
from PIL import Image, ImageDraw

S = np.load("skeleton.npy").astype(np.uint8)
H, W = S.shape
P = set(zip(*np.where(S)))          # (y, x)
N8 = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
def vec(p):
    y, x = p
    return [(y+dy, x+dx) for dy, dx in N8 if (y+dy, x+dx) in P]

deg = {p: len(vec(p)) for p in P}
nodos = {p for p in P if deg[p] != 2}
print("pixeles", len(P), "| nodos", len(nodos))

# tramos: caminos entre nodos pasando solo por pixeles de grado 2
usados = set()
tramos = []
def caminar(n, primero):
    cam = [n, primero]
    usados.add(frozenset((n, primero)))
    act, prev = primero, n
    while act not in nodos:
        sig = [q for q in vec(act) if q != prev and q not in cam[-3:-1]]
        sig = [q for q in vec(act) if q != prev]
        if not sig:
            break
        q = sig[0]
        usados.add(frozenset((act, q)))
        cam.append(q); prev, act = act, q
    return cam

for n in sorted(nodos):
    for v in vec(n):
        if frozenset((n, v)) in usados:
            continue
        tramos.append(caminar(n, v))

# ciclos sueltos (sin ningun nodo): p.ej. un bucle cerrado perfecto
vistos = set()
for t in tramos:
    vistos.update(t)
for p in sorted(P - vistos):
    if any(frozenset((p, q)) in usados for q in vec(p)):
        continue
    cam = [p]; prev = None; act = p
    while True:
        sig = [q for q in vec(act) if q != prev]
        if not sig or sig[0] == p:
            break
        prev, act = act, sig[0]; cam.append(act)
    if len(cam) > 8:
        tramos.append(cam)

tramos = [t for t in tramos if len(t) > 4]
# quitar duplicados (mismo tramo recorrido en los dos sentidos)
unicos, firmas = [], set()
for t in tramos:
    fz = frozenset(t)
    key = (t[0], t[-1], len(t))
    key2 = (t[-1], t[0], len(t))
    if key in firmas or key2 in firmas:
        continue
    firmas.add(key); unicos.append(t)
tramos = sorted(unicos, key=lambda t: min(x for y, x in t))
print("tramos:", len(tramos))

json.dump([[[int(x), int(y)] for y, x in t] for t in tramos], open("tramos.json", "w"))

COL = [(200,30,30),(20,120,220),(20,150,60),(220,130,0),(150,40,200),(0,150,160),(230,60,140),(120,90,20)]
img = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(img)
for i, t in enumerate(tramos):
    c = COL[i % len(COL)]
    for y, x in t:
        d.point((x, y), fill=c)
    my, mx = t[len(t)//2]
    d.text((mx-3, my-5), str(i), fill=c)
    print(i, "len", len(t), "de", (t[0][1], t[0][0]), "a", (t[-1][1], t[-1][0]))
img.resize((W*2, H*2), Image.LANCZOS).save("tramos.png")
