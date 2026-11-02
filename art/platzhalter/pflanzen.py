"""Platzhalter: 4 Pflanzensorten × 5 Wachstumsstufen + „gemeistert“ (16 × 16 px, Fußpunkt unten Mitte).
Früchte und Blüten in Standardfarben; die App kann sie später in der Fähigkeitsfarbe einfärben."""
import os
from pix import Sprite, export_sheet, check_palette

W = H = 16
B = 14            # Bodenlinie (Fuß der Pflanze)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pflanzen')
os.makedirs(OUT, exist_ok=True)
TAGS = ['keim', 'setzling', 'jungpflanze', 'bluete', 'ausgewachsen', 'gemeistert']

def sprout(s):
    s.vline(7, B - 2, 2, 'Laub', 2); s.px(8, B - 3, 'Laub', 3); s.px(6, B - 2, 'Laub', 2)

def seedling(s, h=5):
    s.vline(7, B - h, h, 'Laub', 1)
    s.poly([(4, B - h + 1), (7, B - h + 2), (6, B - h + 3), (3, B - h + 2)], 'Laub', 2)
    s.poly([(8, B - h), (11, B - h - 1), (12, B - h), (9, B - h + 2)], 'Laub', 3)

def beere(s, st):
    if st == 0: return sprout(s)
    if st == 1: return seedling(s)
    w, h = [(7, 5), (10, 8), (13, 11)][min(st, 4) - 2]
    s.ellipse(8 - w // 2, B - h, w, h, 'Laub', 2)
    s.px(8 - w // 2 + 2, B - h + 2, 'Laub', 4); s.px(8 + w // 2 - 3, B - 3, 'Laub', 0)
    if st == 3:
        for x, y in ((5, B - 6), (9, B - 7), (7, B - 4), (11, B - 4)): s.px(x, y, 'Putz & Stoff', 3)
    if st == 4:
        for x, y in ((4, B - 6), (6, B - 3), (8, B - 8), (10, B - 5), (12, B - 7), (9, B - 2)):
            s.px(x, y, 'Frucht rot', 2); s.px(x, y - 1, 'Frucht rot', 3)

def blume(s, st):
    if st == 0: return sprout(s)
    if st == 1: return seedling(s, 4)
    h = [7, 9, 8][st - 2]
    s.vline(7, B - h, h, 'Laub', 1)
    s.poly([(3, B - 3), (7, B - 5), (6, B - 2)], 'Laub', 2); s.poly([(11, B - 5), (7, B - 7), (8, B - 4)], 'Laub', 3)
    if st == 2: s.rect(6, B - h - 2, 3, 3, 'Laub', 3)
    if st == 3: s.rect(6, B - h - 3, 3, 4, 'Blüte rosa', 1); s.px(7, B - h - 3, 'Blüte rosa', 3)
    if st == 4:
        s.ellipse(4, B - h - 6, 7, 7, 'Blüte rosa', 2)
        s.rect(6, B - h - 4, 3, 3, 'Frucht gelb', 2); s.px(6, B - h - 4, 'Frucht gelb', 3)

def kuerbis(s, st):
    if st == 0: return sprout(s)
    if st == 1:
        s.ellipse(3, B - 4, 5, 4, 'Laub', 2); s.ellipse(8, B - 5, 5, 4, 'Laub', 3); s.vline(7, B - 2, 2, 'Laub', 1); return
    s.line([(1, B - 1), (14, B - 2)], 'Laub', 1)
    leaves = [(2, B - 5), (6, B - 6), (10, B - 5)] if st >= 2 else []
    if st >= 3: leaves.append((12, B - 7))
    for x, y in leaves: s.ellipse(x, y, 5, 4, 'Laub', 2)
    if st == 3: s.rect(8, B - 8, 3, 2, 'Frucht gelb', 2); s.px(9, B - 9, 'Frucht gelb', 3)
    if st == 4:
        s.ellipse(4, B - 7, 9, 7, 'Frucht gelb', 1)
        s.vline(8, B - 6, 5, 'Frucht gelb', 0); s.vline(6, B - 6, 5, 'Frucht gelb', 2); s.vline(10, B - 6, 5, 'Frucht gelb', 2)
        s.rect(8, B - 9, 1, 2, 'Holz', 1)

def baeumchen(s, st):
    if st == 0: return sprout(s)
    if st == 1:
        s.vline(7, B - 6, 6, 'Holz', 2); s.px(6, B - 6, 'Laub', 3); s.px(8, B - 7, 'Laub', 3); s.px(9, B - 6, 'Laub', 2); return
    trunk = [4, 5, 5][st - 2]
    s.rect(7, B - trunk, 2, trunk, 'Holz', 2)
    w, h = [(7, 6), (10, 8), (13, 9)][st - 2]
    s.ellipse(8 - w // 2, B - trunk - h + 1, w, h, 'Laub', 2)
    s.px(8 - w // 2 + 2, B - trunk - h + 3, 'Laub', 4)
    if st == 3:
        for x, y in ((5, B - 10), (9, B - 12), (11, B - 8), (7, B - 7)): s.px(x, y, 'Blüte rosa', 3)
    if st == 4:
        for x, y in ((4, B - 9), (7, B - 12), (10, B - 10), (12, B - 7), (8, B - 7)):
            s.px(x, y, 'Frucht rot', 2); s.px(x + 1, y, 'Frucht rot', 1)

PLANTS = [('pflanzen-beere', 'Beere', beere), ('pflanzen-blume', 'Blume', blume), ('pflanzen-kuerbis', 'Kürbis', kuerbis), ('pflanzen-baeumchen', 'Bäumchen', baeumchen)]

def build_all():
    out = {}
    for key, title, fn in PLANTS:
        frames = []
        for st in range(6):
            s = Sprite(W, H)
            stage = min(st, 4)
            s.drop_shadow(8, B + 1, [2, 3, 4, 5, 6, 6][st], 1)
            fn(s, stage)
            if st == 5:   # gemeistert: goldener Schimmer als Leucht-Ebene
                for x, y in ((2, 3), (13, 2), (1, 9), (14, 8), (8, 0)): s.glow_px(x, y, 0)
                for x, y in ((3, 3), (12, 2), (8, 1)): s.glow_px(x, y, 1)
                for x, y in ((2, 3), (13, 2), (14, 8)): s.px(x, y, 'Licht & Glut', 0)   # auch tagsüber sichtbar
            frames.append(s.render())
        export_sheet(key, frames, TAGS, (W, H), OUT)
        bad = set().union(*(check_palette(f['base']) for f in frames))
        out[key] = (title, frames, bad)
    return out

if __name__ == '__main__':
    for k, (t, fr, bad) in build_all().items():
        print(f'{k:22s} {t:10s}', 'Palette ok' if not bad else f'fremde Farben {bad}')
