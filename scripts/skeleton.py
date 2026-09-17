"""Adelgaza (Zhang-Suen) el wordmark para ver el ductus real de la caligrafia.
Salida: skeleton-overlay.png (esqueleto rojo sobre la letra gris) con rejilla
en coordenadas del viewBox 0 0 1000 282 para poder situar puntos a ojo."""
import numpy as np
from PIL import Image, ImageDraw

W = 1000
im = Image.open("src/cervantes1-2.png").convert("RGBA")
a = im.split()[3]
arr0 = np.array(a) > 128
ys, xs = np.where(arr0)
arr0 = arr0[ys.min():ys.max()+1, xs.min():xs.max()+1]
h0, w0 = arr0.shape
H = int(round(h0 * W / w0))
img = Image.fromarray((arr0 * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
I = (np.array(img) > 128).astype(np.uint8)
print("bitmap", I.shape, "tinta", I.sum())

def vecinos(P):
    return [np.roll(np.roll(P, dy, 0), dx, 1) for dy, dx in
            [(1,0),(1,-1),(0,-1),(-1,-1),(-1,0),(-1,1),(0,1),(1,1)]]
    # P2 arriba, P3 arr-der, ... orden Zhang-Suen (P2..P9) con roll invertido

def zhang_suen(I):
    I = I.copy()
    cambio = True
    it = 0
    while cambio and it < 200:
        cambio = False
        for paso in (0, 1):
            P = I
            n = vecinos(P)
            P2, P3, P4, P5, P6, P7, P8, P9 = n
            B = P2+P3+P4+P5+P6+P7+P8+P9
            seq = [P2,P3,P4,P5,P6,P7,P8,P9,P2]
            A = sum(((seq[i] == 0) & (seq[i+1] == 1)).astype(np.uint8) for i in range(8))
            if paso == 0:
                c1 = P2*P4*P6; c2 = P4*P6*P8
            else:
                c1 = P2*P4*P8; c2 = P2*P6*P8
            m = (P == 1) & (B >= 2) & (B <= 6) & (A == 1) & (c1 == 0) & (c2 == 0)
            if m.any():
                I[m] = 0
                cambio = True
        it += 1
    print("iteraciones", it)
    return I

S = zhang_suen(I)
print("puntos de esqueleto", int(S.sum()))
np.save("skeleton.npy", S)

# overlay con rejilla
base = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(base)
letra = Image.fromarray(((1 - I) * 255).astype(np.uint8)).convert("RGB")
base.paste(Image.blend(Image.new("RGB",(W,H),"white"), letra, 1.0))
px = base.load()
for y in range(H):
    for x in range(W):
        if S[y, x]:
            for dx in (-1,0,1):
                for dy in (-1,0,1):
                    if 0 <= x+dx < W and 0 <= y+dy < H:
                        px[x+dx, y+dy] = (220, 30, 30)
for x in range(0, W+1, 50):
    d.line([(x,0),(x,H)], fill=(120,170,220) if x % 100 else (40,110,190))
for y in range(0, H+1, 50):
    d.line([(0,y),(W,y)], fill=(120,170,220) if y % 100 else (40,110,190))
for x in range(0, W+1, 100):
    d.text((x+3, 3), str(x), fill=(20,80,160))
for y in range(0, H+1, 100):
    d.text((3, y+3), str(y), fill=(20,80,160))
base.resize((W*2, H*2), Image.LANCZOS).save("skeleton-overlay.png")
print("H =", H)
