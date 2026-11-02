"""Hof-Vorschau 256 × 160 (Szenengröße der App) mit gestalteten Zwischenbereichen, plus Silhouetten-Test.
Zonen: Waldrand oben, Gebäudereihe, Beete, Wege mit Säumen, Wiese mit Wildblumen, Teich mit Ufer, Ruheecke."""
import random
from PIL import Image, ImageDraw, ImageChops
from gebaeude import build_all as G
from pflanzen import build_all as P
from natur import build_all as N
from vorschau import PAL

W, H = 256, 160
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

def ground(r):
    gr, path, water, soil = PAL['Gras'], PAL['Weg & Sand'], PAL['Wasser'], PAL['Erde & Beet']
    img = Image.new('RGB', (W, H), gr[2]); d = ImageDraw.Draw(img); p = img.load()
    # große, weiche Grasflächen in anderen Tönen (gegen die Eintönigkeit)
    for cx, cy, rx, ry, idx in ((40, 140, 46, 22, 3), (200, 30, 40, 16, 1), (130, 150, 30, 12, 1), (20, 40, 22, 14, 3), (180, 92, 26, 10, 3)):
        for y in range(max(0, cy - ry), min(H, cy + ry)):
            for x in range(max(0, cx - rx), min(W, cx + rx)):
                v = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
                if v < .75 or (v < 1 and (x + y) % 2 == 0): p[x, y] = rgb(gr[idx])
    for _ in range(W * H // 10):
        x, y = r.randrange(W), r.randrange(H); p[x, y] = rgb(gr[max(0, min(4, (1 if p[x, y] == rgb(gr[2]) else 2) + r.choice((-1, 1))))])
    # Wege mit unregelmäßigem Rand
    def road(x0, y0, x1, y1):
        d.rectangle([x0, y0, x1, y1], fill=path[2])
        for x in range(x0, x1 + 1):
            if r.random() < .4: p[x, y0 - 1] = rgb(path[2])
            if r.random() < .35: p[x, y1 + 1] = rgb(path[1])
        for _ in range((x1 - x0) * (y1 - y0) // 14): p[r.randint(x0, x1), r.randint(y0, y1)] = rgb(path[r.choice((1, 3))])
    road(0, 104, 255, 112); road(123, 56, 132, 103); road(134, 113, 140, 128)
    d.line([(0, 104), (255, 104)], fill=path[3]); d.line([(0, 113), (255, 113)], fill=path[1])
    # Teich mit Ufer
    d.ellipse([186, 118, 252, 158], fill=soil[2]); d.ellipse([189, 120, 249, 156], fill=water[2])
    d.ellipse([196, 124, 240, 150], fill=water[1]); d.line([(205, 130), (222, 130)], fill=water[3]); d.line([(214, 144), (226, 144)], fill=water[3])
    for y in range(120, 157):
        for x in range(189, 250):
            if p[x, y] == rgb(water[2]) and r.random() < .02: p[x, y] = rgb(water[4])
    # kleine Erdstellen
    for cx, cy in ((100, 132), (166, 84)):
        d.ellipse([cx - 4, cy - 2, cx + 4, cy + 2], fill=soil[3])
    return img

def hof(evening=False, seed=5):
    r = random.Random(seed)
    g, p, n = G(), P(), N()
    klein = dict(zip(n['natur-klein'][0], n['natur-klein'][1])); baum = dict(zip(n['natur-baeume'][0], n['natur-baeume'][1]))
    img = ground(r).convert('RGBA'); d = ImageDraw.Draw(img)
    items = []   # (y_fuss, frame, x, y)
    def put(fr, x, y): items.append((y + fr['base'].height, fr, x, y))
    blocked = []
    def block(x, y, w, h): blocked.append((x, y, x + w, y + h))
    def free(x, y, w, h): return all(x + w <= a or x >= c or y + h <= b or y >= e for a, b, c, e in blocked) and 0 <= x and x + w <= W and 0 <= y and y + h <= H

    # Gebäude (Stufe als Index 0–3)
    for key, st, x, y in (('gebaeude-muehle', 3, -4, 10), ('gebaeude-archiv', 3, 32, 10), ('gebaeude-scheune', 2, 140, 8),
                          ('gebaeude-gewaechshaus', 2, 182, 14), ('gebaeude-schmiede', 3, 80, 8)):
        put(g[key][2][st], x, y); block(x + 4, y + 16, 40, 32)
    block(0, 100, 256, 16); block(121, 54, 14, 52); block(132, 111, 12, 20); block(186, 116, 68, 44)
    # Beete: Holzrahmen, dunkle gefurchte Erde, Eckpfosten, Schild in Fähigkeitsfarbe, heller Trampelrand
    soil, wood, gr, skill = PAL['Erde & Beet'], PAL['Holz'], PAL['Gras'], PAL['Fähigkeiten']
    BW = 48
    beds = [(8, 66, 'pflanzen-beere', [3, 4, 5], 0), (62, 66, 'pflanzen-blume', [2, 3, 4], 1),
            (142, 68, 'pflanzen-kuerbis', [1, 2, 4], 2), (196, 68, 'pflanzen-baeumchen', [1, 2, 3], 3)]
    for x, y, kind, sts, sc in beds:
        # heller, festgetretener Rand um das Beet (gerastert auslaufend)
        for yy in range(y - 1, y + 25):
            for xx in range(x - 5, x + BW + 5):
                edge = xx < x - 3 or xx > x + BW + 2 or yy < y + 1 or yy > y + 22
                if 0 <= xx < W and (not edge or (xx + yy) % 2 == 0): d.point((xx, yy), fill=gr[3])
        d.rectangle([x - 2, y + 21, x + BW + 1, y + 22], fill=gr[0])                 # Schlagschatten unten
        d.rectangle([x - 2, y + 2, x + BW + 1, y + 20], fill=wood[0])                # Umriss
        d.rectangle([x - 1, y + 3, x + BW, y + 19], fill=wood[2])                    # Bretter
        d.line([(x - 1, y + 3), (x + BW, y + 3)], fill=wood[4])                      # Lichtkante oben
        d.line([(x - 1, y + 19), (x + BW, y + 19)], fill=wood[1])
        for bx in (x + 15, x + 32): d.point((bx, y + 3), fill=wood[1]); d.point((bx, y + 19), fill=wood[0])  # Brettfugen
        d.rectangle([x + 1, y + 5, x + BW - 2, y + 17], fill=soil[0])               # Innenkante
        d.rectangle([x + 2, y + 6, x + BW - 2, y + 17], fill=soil[1])               # dunkle Erde
        for yy in range(y + 8, y + 17, 3):
            d.line([(x + 2, yy), (x + BW - 2, yy)], fill=soil[2]); d.line([(x + 2, yy + 1), (x + BW - 2, yy + 1)], fill=soil[0])
        for px, py in ((x - 2, y + 1), (x + BW, y + 1), (x - 2, y + 19), (x + BW, y + 19)):
            d.rectangle([px, py, px + 1, py + 2], fill=wood[3]); d.point((px, py), fill=wood[4])  # Eckpfosten
        # Schild in der Fähigkeitsfarbe
        d.line([(x + BW - 4, y - 3), (x + BW - 4, y + 3)], fill=wood[1])
        d.rectangle([x + BW - 8, y - 6, x + BW, y - 2], fill=wood[0]); d.rectangle([x + BW - 7, y - 5, x + BW - 1, y - 3], fill=skill[sc])
        for i, st in enumerate(sts): put(p[kind][1][st], x + 1 + i * 15, y + 1)
        block(x - 6, y - 7, BW + 12, 33)
    # Waldrand oben rechts und links unten, Bäume als Rahmen
    for name, x, y in (('tanne', 226, -6), ('eiche', 236, 6), ('birke', 120, -10), ('tanne', 102, -14), ('weide', 96, 108), ('eiche', -10, 120), ('birke', 58, 122)):
        put(baum[name], x, y); block(x + 8, y + 22, 16, 10)
    # Wegsäume: Gras und Blumen entlang der Wege
    for x in range(2, 254, 7):
        if r.random() < .55:
            k = r.choice(['gras-hoch', 'kleefleck', 'wildblumen-gelb', 'wildblumen-weiss', 'gras-hoch'])
            y = r.choice((88, 113)) + r.randint(-1, 2)
            if free(x, y + 6, 12, 8): put(klein[k], x, y); block(x + 2, y + 8, 10, 6)
    # Wiese unten links: dicht mit Wildblumen, Lavendel, Klee
    for _ in range(40):
        x, y = r.randint(4, 110), r.randint(116, 146)
        k = r.choice(['wildblumen-rosa', 'wildblumen-gelb', 'wildblumen-weiss', 'lavendel', 'kleefleck', 'gras-hoch'])
        if free(x, y + 6, 12, 8): put(klein[k], x, y); block(x + 3, y + 9, 9, 5)
    # Teichufer: Schilf, Seerosen, Steine, Trittsteine vom Weg zum Teich
    for x, y in ((186, 118), (240, 122), (190, 142), (244, 140)): put(klein['schilf'], x, y)
    for x, y in ((206, 128), (222, 138)): put(klein['seerose'], x, y)
    for x, y in ((136, 124), (148, 132), (162, 136), (176, 136)): put(klein['trittstein'], x, y)
    put(klein['stein-moos'], 180, 112); put(klein['stein-klein'], 246, 108)
    # Ruheecke zwischen Beet und Weg: Stumpf, Pilze, Farn
    for k, x, y in (('baumstumpf', 106, 86), ('pilze', 96, 90), ('farn', 112, 82)): put(klein[k], x, y); block(x, y + 4, 16, 12)
    # Büsche und Steine in Zwischenbereichen
    for _ in range(28):
        x, y = r.randint(0, 240), r.randint(30, 100)
        k = r.choice(['busch-rund', 'busch-blueten', 'farn', 'stein-klein', 'gras-hoch', 'pilze', 'holzstamm', 'kleefleck'])
        if free(x, y + 6, 14, 9): put(klein[k], x, y); block(x, y + 4, 16, 12)

    # Zeichnen: nach Fußpunkt sortiert
    items.sort(key=lambda t: t[0])
    sh, base, glow = (Image.new('RGBA', (W, H), (0, 0, 0, 0)) for _ in range(3))
    for _, fr, x, y in items:
        for layer, tgt in (('shadow', sh), ('base', base), ('glow', glow)):
            im = fr[layer]; box = (x, y)
            tgt.alpha_composite(im, (max(0, x), max(0, y)), (max(0, -x), max(0, -y)))
    shl = sh.copy(); shl.putalpha(shl.split()[3].point(lambda v: 77 if v else 0))
    out = Image.alpha_composite(img, shl); out = Image.alpha_composite(out, base)
    if evening:
        out = Image.blend(out, ImageChops.multiply(out, Image.new('RGBA', out.size, (120, 90, 170, 255))), .55)
        out = ImageChops.add(out, glow)
    return out, base

if __name__ == '__main__':
    for ev, name in ((False, 'tag'), (True, 'abend')):
        img, base = hof(ev)
        img.resize((W * 3, H * 3), Image.NEAREST).save(f'vorschau-hof-{name}.png')
        if not ev:
            img.save('vorschau-hof-1zu1.png')
            sil = Image.new('RGB', base.size, '#e6dfd1'); sil.paste((27, 22, 48), mask=base.split()[3])
            sil.resize((W * 3, H * 3), Image.NEAREST).save('vorschau-silhouetten.png')
    print('ok')
