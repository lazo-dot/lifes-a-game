"""Platzhalter: 9 Gebäude je Fähigkeit × 4 Ausbaustufen (Stil B).
Stufe 1 Fundament/Baustelle · 2 Grundbau · 3 ausgebaut · 4 prächtig (Fahne, Licht, Deko).
Rahmen 48 × 48 px, Fußpunkt unten Mitte (24, 47)."""
import os
from pix import Sprite, export_sheet, check_palette

W = H = 48
GROUND = 45
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gebaeude')
os.makedirs(OUT, exist_ok=True)

# ---------- gemeinsame Bauteile ----------
def foundation(s, x, w):
    s.rect(x, GROUND - 2, w, 3, 'Stein', 2)

def baustelle(s, x, w, skill):
    """Stufe 1: Fundament, Gerüst, Bretterstapel, kleines Schild in Fähigkeitsfarbe."""
    foundation(s, x, w)
    for px in (x + 1, x + w - 2):
        s.vline(px, GROUND - 14, 12, 'Holz', 1)
    s.hline(x + 1, GROUND - 14, w - 2, 'Holz', 2)
    s.line([(x + 2, GROUND - 3), (x + w - 3, GROUND - 13)], 'Holz', 1)
    s.rect(x + w + 1, GROUND - 3, 7, 2, 'Holz', 2); s.rect(x + w + 2, GROUND - 5, 6, 2, 'Holz', 3)
    s.vline(x - 3, GROUND - 8, 8, 'Holz', 1); s.rect(x - 5, GROUND - 9, 5, 3, 'skill:' + skill, 2)

def window(s, x, y, w, h, lit=True, frame='Holz'):
    s.rect(x - 1, y - 1, w + 2, h + 2, frame, 1, False)
    s.rect(x, y, w, h, 'Glas', 2, False)
    if w > 2: s.px(x, y, 'Glas', 3)
    if lit: s.light(x, y, w, h, 1)

def door(s, x, y, w, h):
    s.rect(x, y, w, h, 'Holz', 1)
    if h > 4: s.px(x + w - 2, y + h // 2, 'Licht & Glut', 2)

def flag(s, x, y, skill, wave=1):
    s.vline(x, y, 10, 'Holz', 1)
    s.rect(x + 1, y, 5, 3, 'skill:' + skill, 2); s.rect(x + 1 + wave, y + 3, 4, 1, 'skill:' + skill, 1)

def flowers(s, x, y, n=3):
    for i in range(n):
        s.px(x + i * 2, y + 1, 'Laub', 2); s.px(x + i * 2, y, 'Blüte rosa', 2 if i % 2 else 3)

def lantern(s, x, y):
    s.vline(x, y, 7, 'Holz', 1); s.rect(x - 1, y - 2, 3, 3, 'Licht & Glut', 1, False); s.light(x - 1, y - 2, 3, 3, 0)

def smoke(s, x, y):
    for i, (dx, dy) in enumerate([(0, 0), (1, -2), (0, -4), (2, -6)]):
        s.px(x + dx, y + dy, 'Stein', 4 - (i > 1)); s.px(x + dx + 1, y + dy, 'Stein', 3)


# ---------- Gebäude ----------
def muehle(s, st):
    sk = 'Körper'
    if st == 1: return baustelle(s, 16, 16, sk)
    foundation(s, 16, 16)
    top = 30 if st == 2 else 20
    s.poly([(17, GROUND - 2), (30, GROUND - 2), (28, top), (19, top)], 'Stein', 2)
    for yy in range(top + 3, GROUND - 3, 4): s.hline(20 + (yy % 3), yy, 3, 'Stein', 1); s.hline(25 - (yy % 2), yy + 2, 2, 'Stein', 1)
    door(s, 22, GROUND - 9, 4, 7)
    if st == 2:
        for x in (19, 28): s.vline(x, top - 6, 6, 'Holz', 1)
        s.hline(19, top - 6, 10, 'Holz', 2); return
    s.poly([(17, 20), (30, 20), (27, 14), (20, 14)], 'Dach rot', 2)
    window(s, 23, 26, 2, 3, lit=st >= 3)
    hub = (23, 16)
    for dx, dy in ((1, 1), (-1, -1), (1, -1), (-1, 1)):
        end = (hub[0] + dx * 13, hub[1] + dy * 13)
        s.line([hub, end], 'Holz', 1)
        for i in range(5, 13, 2):
            sx, sy = hub[0] + dx * i, hub[1] + dy * i
            s.px(sx + dy, sy - dx, 'Putz & Stoff', 2); s.px(sx + 2 * dy, sy - 2 * dx, 'Putz & Stoff', 1)
    s.rect(hub[0] - 1, hub[1] - 1, 3, 3, 'Holz', 1, False)
    if st == 4:
        flag(s, 26, 4, sk)
        s.rect(31, GROUND - 4, 4, 3, 'Putz & Stoff', 2); s.rect(35, GROUND - 3, 3, 2, 'Putz & Stoff', 1)  # Mehlsäcke
        flowers(s, 11, GROUND - 2); window(s, 21, 33, 2, 2)

def archiv(s, st):
    """Archiv (Geist): breiter Steinbau mit Säulenvorhalle, Bogenfenstern und Schriftrollen; Stufe 4 mit Kuppel-Lesesaal."""
    sk = 'Geist'
    if st == 1: return baustelle(s, 8, 32, sk)
    foundation(s, 7, 34)
    s.rect(8, 28, 32, GROUND - 30, 'Stein', 2)
    for yy in range(31, GROUND - 3, 4):
        for xx in range(9 + (yy % 8 == 3) * 3, 39, 6): s.hline(xx, yy, 3, 'Stein', 1)
    if st == 2:
        for x in (8, 39): s.vline(x, 21, 7, 'Holz', 1)
        s.hline(8, 21, 32, 'Holz', 2); s.rect(41, GROUND - 4, 4, 3, 'Stein', 3); return
    # Dach und Giebel
    s.poly([(5, 29), (43, 29), (38, 20), (10, 20)], 'Dach schiefer', 2)
    s.poly([(17, 29), (31, 29), (24, 23)], 'Putz & Stoff', 2)
    s.px(24, 26, 'skill:' + sk, 2)
    # Säulenvorhalle
    s.rect(14, 30, 20, 2, 'Putz & Stoff', 3)
    for x in (15, 19, 28, 32): s.vline(x, 32, GROUND - 34, 'Putz & Stoff', 3); s.vline(x + 1, 32, GROUND - 34, 'Putz & Stoff', 1)
    s.rect(22, 34, 4, GROUND - 36, 'Holz', 0); s.px(22, 34, 'Holz', 1); s.px(25, 34, 'Holz', 1)
    # Bogenfenster mit Regalen dahinter
    for wx in (9, 36):
        s.rect(wx, 33, 3, 6, 'Holz', 0, False); s.px(wx + 1, 32, 'Holz', 0)
        for i, c in enumerate(['skill:Geist', 'Frucht gelb', 'Putz & Stoff']): s.px(wx + i, 35, c, 2)
        s.light(wx, 33, 3, 2, 1)
    if st == 4:
        s.ellipse(17, 10, 14, 12, 'Dach schiefer', 2); s.rect(17, 16, 14, 4, 'Stein', 2)
        for x in (19, 23, 27): window(s, x, 16, 2, 2)
        s.rect(23, 7, 2, 3, 'Licht & Glut', 1, False); s.light(23, 7, 2, 2, 0)
        s.rect(1, GROUND - 5, 5, 4, 'Holz', 2); s.hline(2, GROUND - 6, 3, 'Putz & Stoff', 3)          # Schriftrollen-Kiste
        s.rect(42, GROUND - 5, 5, 4, 'Holz', 2); s.hline(43, GROUND - 6, 3, 'Putz & Stoff', 3)
        for x, y in ((8, 29), (9, 31), (39, 30), (40, 33), (8, 36)): s.px(x, y, 'Laub', 2 + (x % 2))   # Efeu
        flag(s, 24, 1, sk)

def gewaechshaus(s, st):
    sk = 'Kreativität'
    if st == 1: return baustelle(s, 9, 30, sk)
    foundation(s, 9, 30)
    body = (9, 29, 30, GROUND - 2 - 29)
    if st >= 3:
        s.rect(*body, 'Glas', 2)
        s.poly([(9, 29), (38, 29), (34, 20), (13, 20)], 'Glas', 3)
    # Rahmen
    for x in range(9, 39, 6): s.vline(x, 29, GROUND - 31, 'Putz & Stoff', 3)
    s.vline(38, 29, GROUND - 31, 'Putz & Stoff', 3)
    s.hline(9, 29, 30, 'Putz & Stoff', 3); s.hline(13, 20, 22, 'Putz & Stoff', 3)
    s.line([(9, 29), (13, 20)], 'Putz & Stoff', 3); s.line([(38, 29), (34, 20)], 'Putz & Stoff', 3)
    for x in range(15, 34, 6): s.line([(x, 29), (x + 1, 21)], 'Putz & Stoff', 2)
    if st == 2:
        s.rect(10, 30, 5, 6, 'Glas', 2, False); s.rect(22, 21, 5, 4, 'Glas', 3, False); return
    for i, x in enumerate(range(11, 37, 5)):
        s.rect(x, 37, 3, 5, 'Laub', 2); s.px(x + 1, 36, 'Laub', 3)
        if i % 2 == 0: s.px(x + 1, 37, 'Blüte rosa', 3)
    s.px(12, 30, 'Glas', 3); s.px(13, 31, 'Glas', 3); s.px(20, 22, 'Glas', 3)
    if st == 4:
        for x in range(11, 37, 5): s.glow_px(x + 1, 33, 1)
        s.rect(40, GROUND - 4, 3, 3, 'Erde & Beet', 3); s.px(41, GROUND - 5, 'Blüte rosa', 2)
        s.rect(4, GROUND - 4, 3, 3, 'Erde & Beet', 3); s.px(5, GROUND - 5, 'Laub', 3)
        flag(s, 24, 9, sk)

def schmiede(s, st):
    """Offene Schmiede (Alltag): Esse mit Feuer, Amboss, offenes Pultdach auf Pfosten, Wassertrog, Werkzeug."""
    sk = 'Alltag'
    if st == 1: return baustelle(s, 9, 30, sk)
    s.rect(7, GROUND - 3, 34, 3, 'Stein', 1)                              # Steinboden
    s.rect(10, 31, 11, GROUND - 34, 'Stein', 2)                            # Esse
    for x in (8, 39): s.vline(x, 24, GROUND - 27, 'Holz', 1)
    s.vline(29, 24, GROUND - 27, 'Holz', 1)
    if st == 2:
        s.hline(8, 24, 32, 'Holz', 2); s.rect(41, GROUND - 3, 5, 2, 'Stein', 3); return
    s.poly([(5, 25), (43, 25), (40, 18), (8, 18)], 'Dach schiefer', 2)       # offenes Pultdach
    s.hline(6, 25, 37, 'Holz', 2)
    s.rect(12, 8, 6, 17, 'Stein', 2); s.rect(11, 7, 8, 2, 'Stein', 1)       # Kamin über der Esse
    s.rect(13, 34, 5, 4, 'Umriss & Nacht', 1); s.rect(14, 35, 3, 3, 'Licht & Glut', 1); s.light(13, 34, 5, 4, 1)
    s.rect(25, 37, 8, 2, 'Stein', 1); s.rect(27, 39, 4, 2, 'Stein', 0); s.rect(26, 41, 6, 2, 'Holz', 1)   # Amboss auf Klotz
    s.px(31, 36, 'Stein', 3)
    s.rect(34, 39, 6, 4, 'Holz', 2); s.hline(35, 39, 4, 'Wasser', 3)        # Wassertrog
    for x in (22, 24, 26): s.vline(x, 27, 4, 'Holz', 1); s.px(x, 27, 'Stein', 2)   # Werkzeug an der Rückwand
    if st == 4:
        smoke(s, 14, 4)
        for x, y, c in ((27, 34, 0), (30, 33, 1), (25, 32, 0), (32, 35, 1)): s.px(x, y, 'Licht & Glut', c); s.glow_px(x, y, c)   # Funken
        s.rect(4, 33, 6, 4, 'Holz', 2); s.rect(5, 31, 4, 2, 'Putz & Stoff', 1)   # Blasebalg
        s.hline(42, 30, 5, 'Holz', 1); s.rect(43, 31, 3, 3, 'Stein', 3)          # Schild mit Hufeisen
        lantern(s, 2, 38); flag(s, 34, 8, sk)

def gemeinschaftshaus(s, st):
    sk = 'Soziales'
    if st == 1: return baustelle(s, 8, 30, sk)
    s.rect(7, GROUND - 4, 34, 4, 'Holz', 2)
    for x in (8, 23, 39): s.vline(x, 27, GROUND - 31, 'Holz', 1)
    if st == 2: s.hline(8, 27, 32, 'Holz', 3); return
    s.poly([(4, 28), (44, 28), (37, 17), (11, 17)], 'Dach rot', 2)
    for x in range(8, 41, 5): s.vline(x, 18, 9, 'Dach rot', 1)
    s.rect(11, 36, 9, 2, 'Holz', 3); s.vline(12, 38, 2, 'Holz', 1); s.vline(18, 38, 2, 'Holz', 1)
    s.rect(27, 36, 9, 2, 'Holz', 3); s.vline(28, 38, 2, 'Holz', 1); s.vline(34, 38, 2, 'Holz', 1)
    s.rect(21, 34, 4, 3, 'Putz & Stoff', 2)   # Tisch
    if st == 4:
        for i, x in enumerate(range(6, 43, 3)):
            y = 29 + (1 if i % 2 else 0)
            s.px(x, y, 'Licht & Glut', 1 if i % 3 else 0); s.glow_px(x, y, 0 if i % 2 else 1)
        flag(s, 23, 6, sk); flowers(s, 2, GROUND - 2, 2); flowers(s, 42, GROUND - 2, 2)

def musikpavillon(s, st):
    sk = 'Musik'
    if st == 1: return baustelle(s, 11, 26, sk)
    s.ellipse(9, GROUND - 7, 30, 8, 'Stein', 2)
    for x in (12, 20, 28, 35): s.vline(x, 26, GROUND - 30, 'Putz & Stoff', 3)
    if st == 2: s.hline(11, 26, 26, 'Putz & Stoff', 2); return
    s.poly([(8, 27), (40, 27), (35, 19), (24, 13), (13, 19)], 'Dach schiefer', 2)
    s.rect(23, 10, 3, 4, 'skill:' + sk, 2)
    s.vline(24, 33, 7, 'Holz', 1); s.rect(22, 32, 5, 2, 'Holz', 2)   # Notenständer
    s.rect(15, 35, 4, 3, 'Holz', 1); s.rect(30, 35, 3, 4, 'Holz', 2)   # Hocker, Laute
    if st == 4:
        lantern(s, 6, 30); lantern(s, 42, 30)
        s.px(17, 22, 'skill:' + sk, 3); s.px(18, 21, 'skill:' + sk, 3); s.px(31, 21, 'skill:' + sk, 3)
        flag(s, 26, 1, sk); flowers(s, 15, GROUND - 1, 3)

def backhaus(s, st):
    sk = 'Kochen'
    if st == 1: return baustelle(s, 12, 24, sk)
    foundation(s, 12, 24)
    if st == 2:
        s.ellipse(13, 32, 22, 22, 'Weg & Sand', 1); s.rect(13, GROUND - 3, 22, 1, 'Stein', 2); return
    s.ellipse(12, 22, 24, 28, 'Weg & Sand', 1)
    s.rect(12, GROUND - 3, 24, 1, 'Stein', 2)
    s.rect(20, 34, 8, 8, 'Umriss & Nacht', 1); s.rect(21, 37, 6, 5, 'Licht & Glut', 2); s.light(21, 37, 6, 5, 1)
    s.rect(28, 17, 4, 8, 'Stein', 2); smoke(s, 29, 14)
    s.rect(37, GROUND - 5, 6, 4, 'Holz', 2); s.rect(38, GROUND - 7, 4, 2, 'Holz', 3)   # Holzstapel
    if st == 4:
        s.poly([(8, 24), (40, 24), (36, 18), (12, 18)], 'Dach rot', 2)
        for x in (9, 38): s.vline(x, 24, GROUND - 26, 'Holz', 1)
        s.rect(2, 36, 6, 2, 'Holz', 3); s.px(3, 35, 'Weg & Sand', 3); s.px(5, 35, 'Weg & Sand', 2)   # Brotregal
        flag(s, 14, 8, sk)

def kontor(s, st):
    sk = 'Finanzen'
    if st == 1: return baustelle(s, 12, 24, sk)
    foundation(s, 12, 24)
    s.rect(13, 27, 22, GROUND - 29, 'Putz & Stoff', 2)
    for x in (13, 23, 34): s.vline(x, 27, GROUND - 29, 'Holz', 1)
    s.hline(13, 33, 22, 'Holz', 1); s.hline(13, 27, 22, 'Holz', 1)
    if st == 2: s.line([(14, 28), (22, 33)], 'Holz', 1); return
    s.line([(14, 28), (22, 33)], 'Holz', 1); s.line([(24, 33), (33, 28)], 'Holz', 1)
    s.poly([(10, 28), (38, 28), (24, 14)], 'Dach rot', 2)
    window(s, 17, 35, 3, 3); window(s, 28, 35, 3, 3)
    door(s, 23, 37, 4, GROUND - 39)
    s.hline(36, 30, 6, 'Holz', 1); s.rect(38, 31, 4, 4, 'Holz', 3)   # Schild
    s.px(40, 32, 'Stein', 1); s.hline(39, 33, 3, 'Stein', 1)
    if st == 4:
        s.px(40, 32, 'Frucht gelb', 2); s.hline(39, 33, 3, 'Frucht gelb', 2)
        window(s, 23, 20, 2, 3); flag(s, 24, 4, sk)
        s.rect(16, 39, 5, 1, 'Holz', 2); flowers(s, 16, 37, 3)

def scheune(s, st):
    sk = None
    if st == 1:
        foundation(s, 9, 30)
        for px in (10, 37): s.vline(px, GROUND - 14, 12, 'Holz', 1)
        s.hline(10, GROUND - 14, 28, 'Holz', 2); s.rect(40, GROUND - 3, 6, 2, 'Holz', 2); return
    foundation(s, 9, 30)
    s.rect(9, 28, 30, GROUND - 30, 'Dach rot', 2)
    for x in range(12, 38, 4): s.vline(x, 29, GROUND - 31, 'Dach rot', 1)
    if st == 2: s.vline(9, 20, 8, 'Holz', 1); s.vline(38, 20, 8, 'Holz', 1); s.hline(9, 20, 30, 'Holz', 2); return
    s.poly([(6, 29), (41, 29), (37, 21), (29, 15), (18, 15), (10, 21)], 'Holz', 1)
    s.rect(17, 34, 14, GROUND - 36, 'Putz & Stoff', 3)
    s.rect(18, 35, 12, GROUND - 37, 'Dach rot', 1, False)
    s.line([(18, 35), (29, GROUND - 3)], 'Putz & Stoff', 3); s.line([(29, 35), (18, GROUND - 3)], 'Putz & Stoff', 3)
    s.rect(22, 22, 4, 4, 'Putz & Stoff', 3); s.rect(23, 23, 2, 3, 'Holz', 0, False)
    if st == 4:
        s.light(23, 23, 2, 3, 1)
        s.rect(41, GROUND - 5, 6, 4, 'Frucht gelb', 2); s.rect(2, GROUND - 5, 6, 4, 'Frucht gelb', 2)   # Heuballen
        s.vline(24, 7, 9, 'Holz', 1); s.rect(25, 7, 5, 3, 'Putz & Stoff', 3)

BUILDINGS = [('gebaeude-muehle', 'Mühle', 'Körper', muehle), ('gebaeude-archiv', 'Archiv', 'Geist', archiv),
             ('gebaeude-gewaechshaus', 'Gewächshaus', 'Kreativität', gewaechshaus), ('gebaeude-schmiede', 'Schmiede', 'Alltag', schmiede),
             ('gebaeude-gemeinschaftshaus', 'Gemeinschaftshaus', 'Soziales', gemeinschaftshaus), ('gebaeude-musikpavillon', 'Musikpavillon', 'Musik', musikpavillon),
             ('gebaeude-backhaus', 'Backhaus', 'Kochen', backhaus), ('gebaeude-kontor', 'Kontor', 'Finanzen', kontor),
             ('gebaeude-scheune', 'Scheune', '–', scheune)]
SHADOW_RX = {'gebaeude-muehle': 9, 'gebaeude-archiv': 18, 'gebaeude-gewaechshaus': 16, 'gebaeude-schmiede': 17, 'gebaeude-gemeinschaftshaus': 18,
             'gebaeude-musikpavillon': 16, 'gebaeude-backhaus': 14, 'gebaeude-kontor': 14, 'gebaeude-scheune': 17}

def build_all():
    sheets = {}
    for key, title, skill, fn in BUILDINGS:
        frames = []
        for st in range(1, 5):
            s = Sprite(W, H)
            s.drop_shadow(24, GROUND, SHADOW_RX[key] if st > 1 else SHADOW_RX[key] - 3)
            fn(s, st)
            frames.append(s.render())
        sheet = export_sheet(key, frames, ['stufe-1', 'stufe-2', 'stufe-3', 'stufe-4'], (W, H), OUT)
        bad = set().union(*(check_palette(f['base']) for f in frames))
        sheets[key] = (title, skill, frames, bad)
    return sheets

if __name__ == '__main__':
    for k, (t, sk, fr, bad) in build_all().items():
        print(f'{k:28s} {t:18s} {sk:12s} Palette ok' if not bad else f'{k}: fremde Farben {bad}')
