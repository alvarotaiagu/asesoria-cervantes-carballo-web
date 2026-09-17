import json, os, urllib.request, concurrent.futures as cf
from PIL import Image, ImageDraw

d = json.load(open("photos_found.json"))
os.makedirs("thumbs", exist_ok=True)
os.makedirs("contact_sheets", exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36"}

def baja(i):
    f = "thumbs/%s.jpg" % i
    if os.path.exists(f) and os.path.getsize(f) > 2000: return f
    url = "https://images.pexels.com/photos/%s/pexels-photo-%s.jpeg?auto=compress&cs=tinysrgb&w=400" % (i, i)
    try:
        r = urllib.request.Request(url, headers=UA)
        open(f, "wb").write(urllib.request.urlopen(r, timeout=25).read())
        return f
    except Exception as e:
        return None

ids = sorted({o["id"] for v in d.values() for o in v})
with cf.ThreadPoolExecutor(12) as ex:
    list(ex.map(baja, ids))
print("descargadas", len([i for i in ids if os.path.exists("thumbs/%s.jpg" % i)]), "de", len(ids))

CW, CH, COLS = 300, 230, 6
for q, items in d.items():
    fotos = [o for o in items if os.path.exists("thumbs/%s.jpg" % o["id"])]
    if not fotos: continue
    filas = (len(fotos) + COLS - 1) // COLS
    hoja = Image.new("RGB", (COLS*CW, filas*CH), (245, 242, 235))
    dr = ImageDraw.Draw(hoja)
    for k, o in enumerate(fotos):
        try: im = Image.open("thumbs/%s.jpg" % o["id"]).convert("RGB")
        except Exception: continue
        im.thumbnail((CW-8, CH-30))
        x, y = (k % COLS)*CW, (k // COLS)*CH
        hoja.paste(im, (x+4, y+4))
        dr.text((x+6, y+CH-22), o["id"], fill=(20, 40, 30))
    nom = "contact_sheets/%s.jpg" % q.replace(" ", "_")
    hoja.save(nom, quality=88)
    print(nom, hoja.size, len(fotos))
