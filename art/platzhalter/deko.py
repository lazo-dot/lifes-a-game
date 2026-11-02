"""Platzhalter Paket 3: Truhengegenstände (Deko) und Tiere (Stil B).
Deko: ein Sheet `deko`, Rahmen 16 × 24 (Boden y = 22, Fußpunkt unten Mitte), ein Frame je Gegenstand,
Frame-Tag = Gegenstands-ID (wie ITEMS in src/logic.js; die 12 bisherigen IDs bleiben gleich).
Tiere: ein Sheet `tiere`, Rahmen 16 × 16 (Boden y = 14), je Tier 2 Frames Leerlauf (Tag = Tier-ID, from–to).
Gruppen, Seltenheit und Jahreszeit stehen in deko-katalog.json."""
import os, json
from pix import Sprite, export_sheet, check_palette

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'deko')
os.makedirs(OUT, exist_ok=True)
G = 22   # Boden im 16 × 24-Rahmen

def sh(s, rx=5, ry=1): s.drop_shadow(8, G + 1, rx, ry)

# ---------- Garten ----------
def flowers(s):
    sh(s, 7); s.rect(1, G - 4, 14, 5, 'Erde & Beet', 2)
    for i, x in enumerate((3, 6, 9, 12)):
        s.vline(x, G - 8, 4, 'Laub', 2); s.px(x, G - 9, ('Blüte rosa', 'Frucht gelb', 'Putz & Stoff', 'Frucht rot')[i], 2 + (i == 2))
        s.px(x - 1, G - 8, 'Laub', 3)

def pot(s):
    sh(s, 4); s.poly([(4, G - 6), (12, G - 6), (11, G), (5, G)], 'Dach rot', 1); s.rect(3, G - 7, 10, 2, 'Dach rot', 2)
    s.ellipse(4, G - 13, 8, 7, 'Laub', 2); s.px(6, G - 12, 'Laub', 4); s.px(9, G - 11, 'Blüte rosa', 3)

def watering_can(s):
    sh(s, 5); s.rect(4, G - 7, 8, 7, 'Stein', 3); s.line([(12, G - 5), (15, G - 9)], 'Stein', 2)
    s.rect(14, G - 10, 2, 1, 'Stein', 2); s.line([(5, G - 8), (8, G - 11), (11, G - 8)], 'Stein', 1); s.px(6, G - 5, 'Stein', 4)

def arch(s):
    sh(s, 7)
    for x in (2, 13): s.vline(x, G - 16, 16, 'Holz', 2)
    s.line([(2, G - 16), (5, G - 20), (10, G - 20), (13, G - 16)], 'Holz', 2)
    for x, y in ((2, 4), (3, 8), (13, 6), (12, 12), (5, 3), (9, 2), (2, 14), (13, 15)):
        s.px(x + 1, G - 20 + y, 'Laub', 2 + (x % 2)); s.px(x, G - 19 + y, 'Laub', 3)
    for x, y in ((4, 2), (11, 4), (1, 10)): s.px(x, G - 20 + y, 'Blüte rosa', 3)

def herb_box(s):
    sh(s, 6); s.rect(1, G - 5, 14, 5, 'Holz', 2); s.hline(1, G - 3, 14, 'Holz', 1)
    for x, c in ((3, 'Laub'), (6, 'Gras'), (9, 'Laub'), (12, 'Gras')):
        for dy in range(3): s.px(x + (dy % 2), G - 6 - dy, c, 3 - (dy == 2))

def sunflower(s):
    sh(s, 3); s.vline(8, G - 14, 14, 'Laub', 2); s.rect(9, G - 8, 3, 2, 'Laub', 3); s.rect(4, G - 6, 3, 2, 'Laub', 2)
    s.ellipse(4, G - 20, 9, 8, 'Frucht gelb', 2); s.ellipse(6, G - 18, 5, 4, 'Holz', 1); s.px(7, G - 17, 'Holz', 3)

def birdbath(s):
    sh(s, 5); s.rect(6, G - 8, 4, 8, 'Stein', 2); s.rect(4, G - 1, 8, 1, 'Stein', 1)
    s.ellipse(1, G - 12, 14, 5, 'Stein', 3); s.ellipse(3, G - 11, 10, 3, 'Wasser', 2); s.px(5, G - 11, 'Wasser', 4)

# ---------- Hof und Wege ----------
def bench(s):
    sh(s, 7); s.rect(1, G - 7, 14, 2, 'Holz', 3); s.rect(1, G - 11, 14, 2, 'Holz', 2)
    for x in (2, 13): s.vline(x, G - 11, 11, 'Holz', 1)

def lantern(s):
    sh(s, 3); s.vline(8, G - 13, 13, 'Holz', 1); s.rect(6, G - 1, 5, 1, 'Holz', 1)
    s.rect(5, G - 19, 7, 6, 'Umriss & Nacht', 2); s.rect(6, G - 18, 5, 4, 'Licht & Glut', 1, False); s.light(6, G - 18, 5, 4, 0)
    s.poly([(4, G - 19), (13, G - 19), (8, G - 22)], 'Dach schiefer', 2)

def sign(s):
    sh(s, 3); s.vline(8, G - 18, 18, 'Holz', 1)
    s.poly([(2, G - 17), (12, G - 17), (14, G - 15), (12, G - 13), (2, G - 13)], 'Holz', 3)
    s.poly([(3, G - 11), (13, G - 11), (13, G - 7), (3, G - 7), (1, G - 9)], 'Holz', 2)
    s.hline(4, G - 15, 6, 'Holz', 1); s.hline(5, G - 9, 6, 'Holz', 1)

def barrel(s):
    sh(s, 5); s.ellipse(3, G - 12, 10, 13, 'Holz', 2); s.rect(3, G - 9, 10, 1, 'Stein', 1); s.rect(3, G - 3, 10, 1, 'Stein', 1)
    s.ellipse(4, G - 13, 8, 3, 'Holz', 3)

def hay(s):
    sh(s, 7); s.rect(1, G - 8, 14, 8, 'Frucht gelb', 2)
    for x in range(2, 15, 3): s.vline(x, G - 7, 6, 'Frucht gelb', 1)
    s.hline(1, G - 5, 14, 'Holz', 1); s.px(4, G - 9, 'Frucht gelb', 3); s.px(10, G - 9, 'Frucht gelb', 3)

def fence(s):
    sh(s, 7)
    for x in (1, 7, 13): s.rect(x, G - 10, 2, 10, 'Holz', 3); s.px(x, G - 11, 'Holz', 3)
    s.hline(1, G - 8, 14, 'Holz', 2); s.hline(1, G - 4, 14, 'Holz', 2)

def wheelbarrow(s):
    sh(s, 7); s.poly([(2, G - 9), (12, G - 9), (11, G - 4), (3, G - 4)], 'Holz', 2)
    s.ellipse(9, G - 5, 5, 5, 'Stein', 1); s.line([(2, G - 9), (0, G - 12)], 'Holz', 1); s.vline(3, G - 4, 4, 'Holz', 1)
    for x in (4, 7, 10): s.px(x, G - 10, 'Erde & Beet', 3)

def woodpile(s):
    sh(s, 7)
    for row, (y, xs) in enumerate(((G - 4, (1, 5, 9, 13)), (G - 8, (3, 7, 11)), (G - 12, (5, 9)))):
        for x in xs: s.ellipse(x - 1, y, 4, 4, 'Holz', 3); s.px(x, y + 1, 'Holz', 2)

def mailbox(s):
    sh(s, 3); s.vline(8, G - 10, 10, 'Holz', 1)
    s.rect(4, G - 16, 9, 6, 'skill:Geist', 2); s.ellipse(4, G - 18, 9, 4, 'skill:Geist', 2)
    s.hline(5, G - 13, 5, 'Umriss & Nacht', 2); s.vline(13, G - 19, 4, 'Frucht rot', 2); s.px(14, G - 19, 'Frucht rot', 2)

# ---------- Selten ----------
def scarecrow(s):
    sh(s, 4); s.vline(8, G - 16, 16, 'Holz', 1); s.hline(2, G - 14, 13, 'Holz', 1)
    s.rect(5, G - 14, 7, 7, 'skill:Körper', 1); s.hline(5, G - 11, 7, 'Holz', 1)
    s.ellipse(5, G - 20, 7, 6, 'Putz & Stoff', 2); s.px(7, G - 18, 'Umriss & Nacht', 2); s.px(9, G - 18, 'Umriss & Nacht', 2)
    s.poly([(3, G - 19), (14, G - 19), (8, G - 23)], 'Frucht gelb', 1)
    for x in (2, 14): s.px(x, G - 13, 'Frucht gelb', 3)

def beehive(s):
    sh(s, 5); s.rect(4, G - 4, 8, 4, 'Holz', 1)
    for i, (y, w) in enumerate(((G - 7, 10), (G - 10, 9), (G - 13, 7), (G - 15, 4))):
        s.ellipse(8 - w // 2, y, w, 4, 'Frucht gelb', 2 if i % 2 else 1)
    s.rect(7, G - 7, 2, 2, 'Umriss & Nacht', 1)
    for x, y in ((2, G - 15), (13, G - 12), (12, G - 17)): s.px(x, y, 'Frucht gelb', 3); s.px(x + 1, y, 'Umriss & Nacht', 2)

def well(s):
    sh(s, 7); s.ellipse(1, G - 7, 14, 8, 'Stein', 2); s.ellipse(3, G - 7, 10, 4, 'Wasser', 1)
    for x in (2, 13): s.vline(x, G - 18, 12, 'Holz', 1)
    s.poly([(0, G - 17), (16, G - 17), (8, G - 23)], 'Dach rot', 2); s.hline(3, G - 14, 10, 'Holz', 2)
    s.vline(8, G - 14, 5, 'Putz & Stoff', 2); s.rect(7, G - 10, 3, 3, 'Holz', 2)

def sundial(s):
    sh(s, 5); s.rect(5, G - 7, 6, 7, 'Stein', 2); s.rect(3, G - 1, 10, 1, 'Stein', 1)
    s.ellipse(1, G - 10, 14, 5, 'Stein', 3); s.poly([(8, G - 9), (8, G - 14), (11, G - 9)], 'Stein', 1)
    for x in (3, 6, 10, 13): s.px(x, G - 8, 'Frucht gelb', 2)

def telescope(s):
    sh(s, 5)
    for a, b in (((8, G - 8), (3, G)), ((8, G - 8), (13, G)), ((8, G - 8), (8, G))): s.line([a, b], 'Holz', 1)
    s.line([(3, G - 7), (13, G - 15)], 'skill:Geist', 1); s.line([(3, G - 8), (13, G - 16)], 'skill:Geist', 2)
    s.rect(12, G - 17, 3, 3, 'Frucht gelb', 2); s.px(2, G - 7, 'Glas', 3)

# ---------- Saisonal ----------
def birdhouse(s):   # Frühling
    sh(s, 3); s.vline(8, G - 10, 10, 'Holz', 1)
    s.rect(4, G - 16, 9, 7, 'Holz', 3); s.poly([(3, G - 16), (14, G - 16), (8, G - 21)], 'Dach rot', 2)
    s.ellipse(7, G - 14, 3, 3, 'Umriss & Nacht', 1); s.hline(7, G - 11, 3, 'Holz', 1)
    s.px(13, G - 9, 'Blüte rosa', 3); s.px(3, G - 6, 'Blüte rosa', 2)

def tulip_basket(s):   # Frühling
    sh(s, 6); s.poly([(2, G - 6), (14, G - 6), (12, G), (4, G)], 'Holz', 2)
    for x in range(3, 14, 3): s.vline(x, G - 6, 6, 'Holz', 3)
    for i, x in enumerate((4, 7, 10, 12)):
        s.vline(x, G - 10, 4, 'Laub', 2); s.rect(x - 1, G - 12, 3, 2, ('Frucht rot', 'Blüte rosa', 'Frucht gelb', 'Putz & Stoff')[i], 2)

def parasol(s):   # Sommer
    sh(s, 6); s.vline(8, G - 16, 16, 'Holz', 1)
    s.poly([(0, G - 16), (16, G - 16), (8, G - 22)], 'skill:Geist', 2)
    for a, b in (((3, G - 16), (8, G - 22)), ((13, G - 16), (8, G - 22))): s.line([a, b], 'Putz & Stoff', 3)
    s.poly([(6, G - 16), (10, G - 16), (8, G - 21)], 'Putz & Stoff', 3, False)
    for x in (1, 5, 9, 13): s.px(x, G - 15, 'skill:Geist', 1); s.px(x + 1, G - 15, 'skill:Geist', 1)
    s.rect(4, G - 1, 9, 1, 'Holz', 1)

def hammock(s):   # Sommer, selten
    sh(s, 8)
    for x in (0, 15): s.vline(x, G - 14, 14, 'Holz', 1)
    s.line([(0, G - 12), (4, G - 7), (11, G - 7), (15, G - 12)], 'Putz & Stoff', 3)
    s.line([(1, G - 11), (5, G - 6), (10, G - 6), (14, G - 11)], 'skill:Soziales', 2)
    s.hline(5, G - 5, 6, 'skill:Soziales', 1)

def pumpkin_lantern(s):   # Herbst
    sh(s, 6); s.ellipse(2, G - 9, 12, 9, 'Frucht gelb', 1); s.ellipse(5, G - 9, 6, 9, 'Frucht gelb', 2)
    s.rect(7, G - 11, 2, 3, 'Laub', 1)
    for x, y in ((5, G - 6), (10, G - 6)): s.px(x, y, 'Licht & Glut', 0); s.glow_px(x, y, 0)
    s.hline(6, G - 3, 5, 'Licht & Glut', 0); s.glow_px(8, G - 3, 1)

def leaf_pile(s):   # Herbst
    sh(s, 7); s.ellipse(1, G - 7, 14, 8, 'Frucht gelb', 1)
    for x, y, c in ((3, G - 5, 'Frucht rot'), (6, G - 7, 'Frucht gelb'), (9, G - 4, 'Holz'), (11, G - 6, 'Frucht rot'),
                    (5, G - 2, 'Holz'), (13, G - 3, 'Frucht gelb'), (8, G - 8, 'Frucht rot')):
        s.px(x, y, c, 2); s.px(x + 1, y, c, 3)

def snowman(s):   # Winter, selten
    sh(s, 5); s.ellipse(2, G - 9, 12, 10, 'Putz & Stoff', 3); s.ellipse(4, G - 16, 8, 8, 'Putz & Stoff', 3)
    s.rect(5, G - 20, 6, 3, 'Umriss & Nacht', 2); s.hline(4, G - 17, 8, 'Umriss & Nacht', 2)
    s.px(6, G - 13, 'Umriss & Nacht', 1); s.px(9, G - 13, 'Umriss & Nacht', 1); s.px(8, G - 12, 'Frucht gelb', 1)
    s.hline(4, G - 10, 8, 'skill:Körper', 2); s.px(8, G - 6, 'Umriss & Nacht', 1); s.px(8, G - 4, 'Umriss & Nacht', 1)

def feeder(s):   # Winter
    sh(s, 3); s.vline(8, G - 10, 10, 'Holz', 1)
    s.rect(3, G - 12, 11, 2, 'Holz', 3); s.vline(4, G - 16, 4, 'Holz', 1); s.vline(12, G - 16, 4, 'Holz', 1)
    s.poly([(2, G - 16), (15, G - 16), (8, G - 21)], 'Putz & Stoff', 3)
    for x in (5, 7, 10): s.px(x, G - 13, 'Frucht gelb', 2)
    s.px(11, G - 14, 'Frucht rot', 2); s.px(12, G - 14, 'Frucht rot', 1)

# ---------- Rustikal (Ideen von Lars, 02.11.2026) ----------
def wagon_wheel(s):
    sh(s, 6); s.ellipse(1, G - 15, 14, 15, 'Holz', 1); s.ellipse(3, G - 13, 10, 11, 'Laub', 2, False)
    s.ellipse(3, G - 13, 10, 11, 'Holz', 1, False)
    for a, b in (((8, G - 14), (8, G - 1)), ((2, G - 8), (14, G - 8)), ((4, G - 12), (12, G - 3)), ((12, G - 12), (4, G - 3))): s.line([a, b], 'Holz', 2)
    s.rect(7, G - 9, 3, 3, 'Holz', 3)
    for x, y in ((2, G - 2), (13, G - 3), (1, G - 6)): s.px(x, y, 'Blüte rosa', 3); s.px(x, y + 1, 'Laub', 2)

def milk_can(s):
    sh(s, 4); s.rect(4, G - 10, 8, 10, 'Stein', 3); s.rect(5, G - 13, 6, 3, 'Stein', 3); s.rect(4, G - 14, 8, 1, 'Stein', 2)
    s.hline(4, G - 6, 8, 'Stein', 1); s.px(5, G - 8, 'Stein', 4)
    for x, h in ((6, 6), (8, 8), (10, 5)): s.vline(x, G - 14 - h, h, 'Frucht gelb', 2); s.px(x, G - 15 - h, 'Frucht gelb', 3)

def crate_planter(s):
    sh(s, 7); s.rect(1, G - 6, 14, 6, 'Holz', 3); s.rect(3, G - 12, 11, 6, 'Holz', 2)
    s.hline(1, G - 3, 14, 'Holz', 1); s.hline(3, G - 9, 11, 'Holz', 1)
    for x, c in ((4, 'Blüte rosa'), (7, 'Putz & Stoff'), (10, 'Frucht gelb'), (12, 'skill:Musik')):
        s.vline(x, G - 14, 2, 'Laub', 2); s.px(x, G - 15, c, 2 + (c == 'Putz & Stoff'))

def farm_bell(s):
    sh(s, 4); s.vline(3, G - 20, 20, 'Holz', 1); s.hline(3, G - 19, 9, 'Holz', 2)
    s.vline(10, G - 18, 2, 'Stein', 1); s.poly([(7, G - 10), (14, G - 10), (12, G - 16), (9, G - 16)], 'Stein', 1)
    s.px(10, G - 9, 'Stein', 0); s.px(9, G - 15, 'Stein', 3); s.line([(10, G - 9), (12, G - 5)], 'Putz & Stoff', 2)

def ladder(s):
    sh(s, 4); s.line([(4, G), (7, G - 21)], 'Holz', 2); s.line([(11, G), (13, G - 21)], 'Holz', 2)
    for i in range(5): y = G - 3 - i * 4; s.hline(5 + i // 2, y, 7, 'Holz', 3)
    s.rect(8, G - 14, 4, 3, 'Dach rot', 1); s.px(9, G - 15, 'Laub', 3); s.px(10, G - 16, 'Laub', 2)

def weathervane(s):
    sh(s, 3); s.vline(8, G - 15, 15, 'Stein', 1); s.hline(3, G - 12, 11, 'Stein', 1)
    s.px(2, G - 12, 'Stein', 1); s.px(14, G - 12, 'Stein', 1)
    s.poly([(5, G - 17), (11, G - 17), (12, G - 20), (10, G - 22), (8, G - 19), (5, G - 20)], 'Umriss & Nacht', 2)   # Hahn-Silhouette
    s.px(12, G - 22, 'Umriss & Nacht', 2); s.px(4, G - 21, 'Umriss & Nacht', 2); s.px(11, G - 21, 'Frucht rot', 2)

def rust_rooster(s):
    s.vline(8, G - 5, 5, 'Holz', 0)
    s.poly([(3, G - 8), (11, G - 8), (12, G - 13), (10, G - 15), (8, G - 11), (3, G - 13)], 'Holz', 1)
    s.px(11, G - 16, 'Holz', 0); s.px(12, G - 14, 'Holz', 2); s.px(2, G - 14, 'Holz', 0); s.px(5, G - 11, 'Holz', 3)
    for x in (2, 13): s.px(x, G - 1, 'Laub', 2); s.px(x, G - 2, 'Gras', 3)

def egg_basket(s):
    sh(s, 5); s.ellipse(2, G - 7, 12, 7, 'Stein', 1, False); s.ellipse(3, G - 6, 10, 5, 'Stein', 0, False)
    s.line([(3, G - 4), (5, G - 13), (11, G - 13), (13, G - 4)], 'Stein', 1)
    for x, c in ((4, 'Putz & Stoff'), (7, 'Weg & Sand'), (10, 'Putz & Stoff')): s.ellipse(x, G - 8, 3, 4, c, 3)
    s.hline(3, G - 3, 10, 'Stein', 1)

# id, Funktion, Name, Gruppe, selten, Jahreszeit (None = ganzjährig)
DEKO = [
    ('flowers', flowers, 'Blumenbeet', 'garten', False, None), ('pot', pot, 'Blumentopf', 'garten', False, None),
    ('watering_can', watering_can, 'Gießkanne', 'garten', False, None), ('arch', arch, 'Rosenbogen', 'garten', False, None),
    ('herb_box', herb_box, 'Kräuterkiste', 'garten', False, None), ('sunflower', sunflower, 'Sonnenblume', 'garten', False, None),
    ('birdbath', birdbath, 'Vogeltränke', 'garten', False, None),
    ('bench', bench, 'Holzbank', 'hof', False, None), ('lantern', lantern, 'Laterne', 'hof', False, None),
    ('sign', sign, 'Wegweiser', 'hof', False, None), ('barrel', barrel, 'Fass', 'hof', False, None),
    ('hay', hay, 'Heuballen', 'hof', False, None), ('fence', fence, 'Zaun', 'hof', False, None),
    ('wheelbarrow', wheelbarrow, 'Schubkarre', 'hof', False, None), ('woodpile', woodpile, 'Holzstapel', 'hof', False, None),
    ('mailbox', mailbox, 'Briefkasten', 'hof', False, None),
    ('wagon_wheel', wagon_wheel, 'Wagenrad', 'hof', False, None), ('milk_can', milk_can, 'Milchkanne', 'hof', False, None),
    ('crate_planter', crate_planter, 'Blumenkisten', 'garten', False, None), ('farm_bell', farm_bell, 'Hofglocke', 'hof', False, None),
    ('ladder', ladder, 'Holzleiter', 'hof', False, None), ('rust_rooster', rust_rooster, 'Rost-Hahn', 'garten', False, None),
    ('egg_basket', egg_basket, 'Eierkorb', 'hof', False, None),
    ('scarecrow', scarecrow, 'Vogelscheuche', 'selten', True, None), ('beehive', beehive, 'Bienenstock', 'selten', True, None),
    ('well', well, 'Brunnen', 'selten', True, None), ('sundial', sundial, 'Sonnenuhr', 'selten', True, None),
    ('telescope', telescope, 'Fernrohr', 'selten', True, None), ('weathervane', weathervane, 'Wetterhahn', 'selten', True, None),
    ('birdhouse', birdhouse, 'Vogelhaus', 'saison', False, 'fruehling'), ('tulip_basket', tulip_basket, 'Tulpenkorb', 'saison', False, 'fruehling'),
    ('parasol', parasol, 'Sonnenschirm', 'saison', False, 'sommer'), ('hammock', hammock, 'Hängematte', 'saison', True, 'sommer'),
    ('pumpkin_lantern', pumpkin_lantern, 'Kürbislaterne', 'saison', False, 'herbst'), ('leaf_pile', leaf_pile, 'Laubhaufen', 'saison', False, 'herbst'),
    ('snowman', snowman, 'Schneemann', 'saison', True, 'winter'), ('feeder', feeder, 'Futterhaus', 'saison', False, 'winter'),
]

# ---------- Tiere 16 × 16, 2 Frames ----------
T = 14
def chicken(s, f):
    s.drop_shadow(8, T + 1, 4, 1); s.ellipse(3, 6, 9, 7, 'Putz & Stoff', 3); s.ellipse(9, 3 + f, 5, 5, 'Putz & Stoff', 3)
    s.px(11, 4 + f, 'Umriss & Nacht', 1); s.px(14, 5 + f, 'Frucht gelb', 2); s.px(10, 2 + f, 'Frucht rot', 2); s.px(11, 2 + f, 'Frucht rot', 2)
    s.vline(6, 12, 2, 'Frucht gelb', 1); s.vline(9, 12, 2, 'Frucht gelb', 1); s.px(3, 6, 'Putz & Stoff', 2)

def duck(s, f):
    s.drop_shadow(8, T + 1, 5, 1); s.ellipse(2, 7, 11, 6, 'Putz & Stoff', 3); s.ellipse(9, 2 + f, 5, 6, 'Laub', 2)
    s.hline(9, 7 + f, 5, 'Putz & Stoff', 3); s.px(11, 4 + f, 'Umriss & Nacht', 1); s.rect(14, 5 + f, 2, 1, 'Frucht gelb', 2)
    s.vline(6, 13, 1, 'Frucht gelb', 2); s.vline(9, 13, 1, 'Frucht gelb', 2)

def cat(s, f):
    s.drop_shadow(8, T + 1, 5, 1); s.ellipse(2, 7, 10, 7, 'Holz', 3); s.ellipse(8, 3, 6, 6, 'Holz', 3)
    s.px(9, 2, 'Holz', 3); s.px(13, 2, 'Holz', 3)
    if f == 0: s.px(10, 5, 'Laub', 3); s.px(12, 5, 'Laub', 3)
    else: s.hline(10, 5, 1, 'Umriss & Nacht', 1); s.hline(12, 5, 1, 'Umriss & Nacht', 1)
    s.line([(2, 10), (0, 6 - f)], 'Holz', 2); s.px(11, 7, 'Blüte rosa', 2)

def rabbit(s, f):
    s.drop_shadow(8, T + 1, 4, 1); s.ellipse(3, 7, 9, 7, 'Stein', 3); s.ellipse(8, 4, 6, 6, 'Stein', 3)
    s.vline(9, 0 + f, 4 - f, 'Stein', 3); s.vline(12, 0 + f, 4 - f, 'Stein', 3); s.px(9, 1 + f, 'Blüte rosa', 2)
    s.px(11, 6, 'Umriss & Nacht', 1); s.px(13, 7, 'Blüte rosa', 2); s.ellipse(2, 9, 3, 3, 'Putz & Stoff', 3)

def hedgehog(s, f):
    s.drop_shadow(8, T + 1, 5, 1); s.ellipse(2, 7 - f, 11, 7 + f, 'Holz', 1)
    for x in range(3, 12, 2): s.px(x, 7 - f, 'Holz', 3); s.px(x + 1, 6 - f, 'Holz', 0)
    s.ellipse(10, 9, 5, 4, 'Weg & Sand', 3); s.px(14, 10, 'Umriss & Nacht', 1); s.px(12, 10, 'Umriss & Nacht', 1)

TIERE = [('chicken', chicken, 'Huhn'), ('duck', duck, 'Ente'), ('cat', cat, 'Katze'), ('rabbit', rabbit, 'Hase'), ('hedgehog', hedgehog, 'Igel')]

def _retag(path, tags):
    j = json.load(open(path)); j['meta']['frameTags'] = tags; json.dump(j, open(path, 'w'), ensure_ascii=False, indent=1)

def build_all():
    frames = []
    for key, fn, *_ in DEKO:
        s = Sprite(16, 24); fn(s); frames.append(s.render())
    export_sheet('deko', frames, [d[0] for d in DEKO], (16, 24), OUT)
    tf, names, tags = [], [], []
    for key, fn, _ in TIERE:
        tags.append({'name': key, 'from': len(tf), 'to': len(tf) + 1, 'direction': 'pingpong'})
        for f in (0, 1):
            s = Sprite(16, 16); fn(s, f); tf.append(s.render()); names.append(f'{key}-{f + 1}')
    export_sheet('tiere', tf, names, (16, 16), OUT)
    _retag(os.path.join(OUT, 'tiere.json'), tags)
    j = json.load(open(os.path.join(OUT, 'tiere.json')))
    for fr in j['frames']: fr['duration'] = 500
    json.dump(j, open(os.path.join(OUT, 'tiere.json'), 'w'), ensure_ascii=False, indent=1)
    katalog = {'hinweis': 'Platzhalter-Katalog für ITEMS in src/logic.js. Seltene Funde: Anteil 20 % bleibt, Jahreszeit: nur in dieser Jahreszeit findbar, danach behalten.',
               'deko': [{'id': k, 'name': n, 'gruppe': g, 'selten': r, 'jahreszeit': j_, 'sheet': 'deko'} for k, _, n, g, r, j_ in DEKO],
               'tiere': [{'id': k, 'name': n, 'gruppe': 'tiere', 'selten': True, 'jahreszeit': None, 'sheet': 'tiere', 'animal': True} for k, _, n in TIERE]}
    json.dump(katalog, open(os.path.join(OUT, 'deko-katalog.json'), 'w'), ensure_ascii=False, indent=1)
    bad = set().union(*(check_palette(f['base']) for f in frames + tf))
    return DEKO, frames, TIERE, tf, bad

if __name__ == '__main__':
    D, fr, T_, tf, bad = build_all()
    print(len(D), 'Deko,', len(T_), 'Tiere,', 'Palette ok' if not bad else bad)
