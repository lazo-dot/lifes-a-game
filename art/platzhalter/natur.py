"""Platzhalter: Flora und Kleinteile für die Bereiche zwischen den Arealen (Stil B).
Kleinteile 16 × 16 (Fußpunkt unten Mitte, Boden y = 14), Bäume 32 × 32 (Boden y = 30).
Jedes Kleinteil ist ein Frame im Sheet natur-klein, jeder Baum ein Frame im Sheet natur-baeume."""
import os
from pix import Sprite, export_sheet, check_palette

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'natur')
os.makedirs(OUT, exist_ok=True)
B = 14

def busch_rund(s):
    s.drop_shadow(8, B + 1, 6, 1); s.ellipse(2, 5, 12, 10, 'Laub', 2); s.ellipse(4, 3, 7, 6, 'Laub', 3); s.px(5, 5, 'Laub', 4)

def busch_blueten(s):
    busch_rund(s)
    for x, y in ((4, 7), (8, 5), (11, 8), (6, 11), (10, 11)): s.px(x, y, 'Putz & Stoff', 3); s.px(x + 1, y, 'Blüte rosa', 3)

def farn(s):
    s.drop_shadow(8, B + 1, 5, 1)
    for (x1, y1, x2, y2) in ((8, B, 2, 6), (8, B, 14, 6), (8, B, 5, 3), (8, B, 11, 3), (8, B, 8, 2)):
        s.line([(x1, y1), (x2, y2)], 'Laub', 2)
        mx, my = (x1 + x2) // 2, (y1 + y2) // 2
        s.px(mx - 1, my, 'Laub', 3); s.px(mx + 1, my - 1, 'Laub', 1)

def gras_hoch(s):
    for i, (x, h) in enumerate(((4, 6), (6, 9), (7, 7), (9, 10), (11, 6), (12, 8))):
        s.vline(x, B - h, h, 'Gras', 3 if i % 2 else 1); s.px(x, B - h, 'Gras', 4)

def wildblumen(color, idx):
    def f(s):
        for x, h in ((3, 5), (6, 8), (9, 6), (12, 7)):
            s.vline(x, B - h, h, 'Gras', 1)
            s.px(x, B - h - 1, color, idx); s.px(x - 1, B - h, color, idx - 1); s.px(x + 1, B - h, color, idx - 1)
            s.px(x, B - h, 'Frucht gelb', 3)
    return f

def lavendel(s):
    for x, h in ((4, 7), (6, 9), (8, 10), (10, 8), (12, 6)):
        s.vline(x, B - h + 3, h - 3, 'Gras', 1)
        for yy in range(B - h, B - h + 4): s.px(x, yy, 'skill:Musik', 2 if yy % 2 else 3)

def pilze(s):
    s.drop_shadow(8, B + 1, 4, 1)
    for x, y, w in ((3, 8, 6), (9, 10, 4)):
        s.vline(x + w // 2, y + 2, B - y - 2, 'Putz & Stoff', 2)
        s.ellipse(x, y, w, 4, 'Frucht rot', 2); s.px(x + 1, y + 1, 'Putz & Stoff', 3); s.px(x + w - 2, y + 1, 'Putz & Stoff', 3)

def schilf(s):
    for x, h in ((3, 10), (5, 13), (8, 11), (11, 12), (13, 9)):
        s.vline(x, B - h, h, 'Gras', 2 if x % 2 else 1)
    for x, h in ((5, 13), (11, 12)): s.rect(x, B - h + 1, 1, 3, 'Holz', 1); s.px(x, B - h, 'Gras', 4)

def seerose(s):
    s.ellipse(2, 8, 12, 6, 'Laub', 2); s.px(7, 9, 'Wasser', 2); s.px(8, 10, 'Wasser', 2)
    s.ellipse(6, 6, 5, 4, 'Blüte rosa', 2); s.px(8, 7, 'Frucht gelb', 3)

def stein_klein(s):
    s.drop_shadow(8, B + 1, 5, 1); s.ellipse(3, 8, 10, 7, 'Stein', 2); s.ellipse(9, 10, 5, 4, 'Stein', 1)

def stein_moos(s):
    s.drop_shadow(8, B + 1, 7, 2); s.ellipse(1, 4, 14, 11, 'Stein', 2)
    s.ellipse(3, 4, 9, 4, 'Laub', 2); s.px(4, 5, 'Laub', 4); s.px(11, 9, 'Laub', 2)

def baumstumpf(s):
    s.drop_shadow(8, B + 1, 6, 1); s.rect(3, 7, 10, 8, 'Holz', 2); s.ellipse(3, 5, 10, 5, 'Holz', 3)
    s.ellipse(5, 6, 6, 3, 'Holz', 4); s.px(8, 7, 'Holz', 2); s.px(2, B, 'Holz', 1); s.px(13, B, 'Holz', 1)

def holzstamm(s):
    s.drop_shadow(8, B + 1, 7, 1); s.rect(1, 9, 13, 5, 'Holz', 2); s.ellipse(11, 8, 4, 7, 'Holz', 3)
    s.px(12, 11, 'Holz', 1); s.px(4, 9, 'Laub', 3); s.px(6, 9, 'Laub', 2)

def trittstein(s):
    s.ellipse(2, 9, 12, 6, 'Stein', 3, False); s.ellipse(3, 10, 10, 4, 'Stein', 2, False); s.px(5, 10, 'Stein', 4)

def kleefleck(s):
    for x, y in ((3, 11), (6, 9), (9, 12), (12, 10), (5, 13), (11, 13)):
        s.px(x, y, 'Gras', 3); s.px(x + 1, y, 'Gras', 4); s.px(x, y + 1, 'Gras', 3)
    s.px(7, 10, 'Putz & Stoff', 3); s.px(10, 11, 'Blüte rosa', 3)

KLEIN = [('busch-rund', busch_rund), ('busch-blueten', busch_blueten), ('farn', farn), ('gras-hoch', gras_hoch),
         ('wildblumen-gelb', wildblumen('Frucht gelb', 2)), ('wildblumen-weiss', wildblumen('Putz & Stoff', 3)),
         ('wildblumen-rosa', wildblumen('Blüte rosa', 2)), ('lavendel', lavendel), ('pilze', pilze), ('schilf', schilf),
         ('seerose', seerose), ('stein-klein', stein_klein), ('stein-moos', stein_moos), ('baumstumpf', baumstumpf),
         ('holzstamm', holzstamm), ('trittstein', trittstein), ('kleefleck', kleefleck)]

# ---------- Bäume 32 × 32 ----------
TB = 30
def eiche(s):
    s.drop_shadow(16, TB + 1, 11, 3); s.rect(14, 18, 4, 12, 'Holz', 2); s.px(13, TB - 1, 'Holz', 1); s.px(18, TB - 1, 'Holz', 1)
    s.ellipse(3, 2, 26, 20, 'Laub', 2); s.ellipse(6, 3, 12, 9, 'Laub', 3); s.ellipse(17, 12, 10, 8, 'Laub', 1)
    s.px(9, 5, 'Laub', 4); s.px(10, 6, 'Laub', 4)

def tanne(s):
    s.drop_shadow(16, TB + 1, 8, 2); s.rect(15, 25, 3, 5, 'Holz', 1)
    for i, (y, w) in enumerate(((2, 6), (7, 12), (12, 18), (17, 24))):
        s.poly([(16 - w // 2, y + 8), (16 + w // 2, y + 8), (16, y)], 'Laub', 1 if i % 2 else 2)
    s.px(15, 4, 'Laub', 4)

def birke(s):
    s.drop_shadow(16, TB + 1, 8, 2); s.rect(15, 10, 3, 20, 'Putz & Stoff', 3)
    for y in (13, 18, 22, 26): s.hline(15 + (y % 2), y, 2, 'Umriss & Nacht', 2)
    s.ellipse(7, 1, 18, 14, 'Gras', 3); s.ellipse(9, 2, 8, 6, 'Gras', 4); s.ellipse(17, 8, 8, 6, 'Gras', 2)

def weide(s):
    s.drop_shadow(16, TB + 1, 11, 3); s.rect(14, 14, 4, 16, 'Holz', 2)
    s.ellipse(4, 1, 24, 14, 'Laub', 2)
    for x in range(5, 28, 2): s.vline(x, 9, 8 + (x * 7) % 9, 'Laub', 3 if x % 4 else 1)

BAEUME = [('eiche', eiche), ('tanne', tanne), ('birke', birke), ('weide', weide)]

def build_all():
    res = {}
    for sheet, items, size in (('natur-klein', KLEIN, (16, 16)), ('natur-baeume', BAEUME, (32, 32))):
        frames = []
        for name, fn in items:
            s = Sprite(*size); fn(s); frames.append(s.render())
        export_sheet(sheet, frames, [n for n, _ in items], size, OUT)
        bad = set().union(*(check_palette(f['base']) for f in frames))
        res[sheet] = ([n for n, _ in items], frames, bad)
    return res

if __name__ == '__main__':
    for k, (names, fr, bad) in build_all().items():
        print(k, len(names), 'Palette ok' if not bad else bad)
