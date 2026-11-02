"""Platzhalter: Wohnhaus (48 × 48, ein Frame, Fenster leuchten abends) und Bauer (16 × 24, 4 Richtungen × 4 Frames Gehen).
Bauer: Frame-Tags unten / oben / links / rechts (je from–to über 4 Frames), Boden y = 22."""
import os, json
from pix import Sprite, export_sheet, check_palette

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'figuren')
os.makedirs(OUT, exist_ok=True)

def wohnhaus(s):
    g = 45
    s.drop_shadow(24, g, 20, 3)
    s.rect(5, g - 3, 38, 3, 'Stein', 2)                                         # Sockel
    s.rect(6, 24, 36, g - 27, 'Putz & Stoff', 2)                                # Wand
    for x in (6, 17, 30, 41): s.vline(x, 24, g - 27, 'Holz', 1)                 # Fachwerk
    s.hline(6, 24, 36, 'Holz', 1); s.hline(6, 33, 36, 'Holz', 1)
    s.line([(7, 25), (16, 32)], 'Holz', 1); s.line([(31, 32), (40, 25)], 'Holz', 1)
    s.poly([(2, 25), (46, 25), (40, 11), (8, 11)], 'Dach schiefer', 2)          # Dach
    for y in (15, 19, 23): s.hline(5 + (25 - y) // 3, y, 38 - 2 * ((25 - y) // 3), 'Dach schiefer', 1)
    s.rect(33, 5, 5, 9, 'Stein', 1); s.rect(32, 4, 7, 2, 'Stein', 2)              # Schornstein
    for i, (dx, dy) in enumerate(((0, 0), (1, -2), (0, -4))): s.px(35 + dx, 2 + dy if 2 + dy >= 0 else 0, 'Stein', 4 - i)
    s.rect(20, 16, 8, 6, 'Putz & Stoff', 2); s.poly([(18, 17), (30, 17), (24, 12)], 'Dach rot', 2)   # Dachgaube
    s.rect(22, 18, 4, 3, 'Glas', 2, False); s.px(22, 18, 'Glas', 3); s.light(22, 18, 4, 3, 1)
    for wx, wy in ((9, 27), (34, 27), (9, 36), (34, 36)):                        # Fenster mit Läden
        s.rect(wx - 1, wy - 1, 6, 5, 'Holz', 1, False); s.rect(wx, wy, 4, 3, 'Glas', 2, False); s.px(wx, wy, 'Glas', 3)
        s.light(wx, wy, 4, 3, 1); s.vline(wx - 2, wy - 1, 5, 'Laub', 1); s.vline(wx + 5, wy - 1, 5, 'Laub', 1)
    s.rect(21, 35, 6, g - 38, 'Holz', 1); s.px(25, 39, 'Licht & Glut', 2)          # Tür
    s.rect(19, 33, 10, 2, 'Dach rot', 2)                                         # Vordach
    s.rect(20, g - 3, 8, 2, 'Stein', 3)                                          # Stufe
    for x in (8, 12, 35, 39): s.px(x, g - 4, 'Blüte rosa', 3 if x % 2 else 2); s.px(x, g - 3, 'Laub', 2)

G = 22
def bauer(s, d, f):
    """d: unten/oben/links/rechts, f: 0–3 (Schrittphase)."""
    s.drop_shadow(8, G + 1, 4, 1)
    step = (0, 1, 0, -1)[f]; bob = 1 if f % 2 else 0
    y0 = 4 + bob
    # Beine
    if d in ('unten', 'oben'):
        s.rect(5, 16, 2, 6 - max(0, step), 'skill:Geist', 1); s.rect(9, 16, 2, 6 - max(0, -step), 'skill:Geist', 1)
        s.rect(5, 21 - max(0, step), 2, 1, 'Holz', 0); s.rect(9, 21 - max(0, -step), 2, 1, 'Holz', 0)
    else:
        s.rect(6 + step, 16, 2, 6, 'skill:Geist', 1); s.rect(8 - step, 16, 2, 6, 'skill:Geist', 0)
        s.px(6 + step + (1 if d == 'rechts' else -1), 21, 'Holz', 0); s.px(8 - step, 21, 'Holz', 0)
    # Körper (Hemd + Latzhose); seitlich schmaler
    if d in ('unten', 'oben'):
        s.rect(4, 9 + bob, 8, 8, 'Putz & Stoff', 3); s.rect(5, 12 + bob, 6, 5, 'skill:Geist', 2)
        if d == 'unten': s.vline(6, 9 + bob, 3, 'skill:Geist', 2); s.vline(9, 9 + bob, 3, 'skill:Geist', 2)
    else:
        s.rect(5, 9 + bob, 6, 8, 'Putz & Stoff', 3); s.rect(5, 12 + bob, 6, 5, 'skill:Geist', 2)
        s.vline(7 if d == 'links' else 8, 9 + bob, 3, 'skill:Geist', 2)
    # Arme
    if d in ('unten', 'oben'):
        s.rect(3, 10 + bob + max(0, step), 1, 5, 'Weg & Sand', 3); s.rect(12, 10 + bob + max(0, -step), 1, 5, 'Weg & Sand', 3)
    else:
        s.rect(7 - step, 10 + bob, 2, 5, 'Weg & Sand', 3)
    # Kopf
    s.rect(5, y0 + 1, 6, 5, 'Weg & Sand', 3)
    if d == 'unten':
        s.px(6, y0 + 3, 'Umriss & Nacht', 1); s.px(9, y0 + 3, 'Umriss & Nacht', 1); s.px(7, y0 + 5, 'Blüte rosa', 2)
    elif d == 'links': s.px(5, y0 + 3, 'Umriss & Nacht', 1)
    elif d == 'rechts': s.px(10, y0 + 3, 'Umriss & Nacht', 1)
    else: s.rect(5, y0 + 2, 6, 3, 'Holz', 2)                                    # Haare hinten
    # Strohhut
    bx = {'links': -1, 'rechts': 1}.get(d, 0)
    s.rect(3 + bx, y0, 10, 2, 'Frucht gelb', 2); s.rect(5, y0 - 2, 6, 2, 'Frucht gelb', 3); s.hline(5, y0, 6, 'Frucht rot', 1)

DIRS = ['unten', 'oben', 'links', 'rechts']

def build_all():
    s = Sprite(48, 48); wohnhaus(s); wf = s.render()
    export_sheet('wohnhaus', [wf], ['wohnhaus'], (48, 48), OUT)
    frames, names, tags = [], [], []
    for d in DIRS:
        tags.append({'name': d, 'from': len(frames), 'to': len(frames) + 3, 'direction': 'forward'})
        for f in range(4):
            s = Sprite(16, 24); bauer(s, d, f); frames.append(s.render()); names.append(f'{d}-{f + 1}')
    export_sheet('bauer', frames, names, (16, 24), OUT)
    p = os.path.join(OUT, 'bauer.json'); j = json.load(open(p)); j['meta']['frameTags'] = tags
    for fr in j['frames']: fr['duration'] = 150
    json.dump(j, open(p, 'w'), ensure_ascii=False, indent=1)
    bad = check_palette(wf['base']).union(*(check_palette(f['base']) for f in frames))
    return wf, frames, bad

if __name__ == '__main__':
    wf, fr, bad = build_all()
    print('Wohnhaus + Bauer (16 Frames),', 'Palette ok' if not bad else bad)
    from PIL import Image, ImageDraw
    from vorschau import compose, grass_tile, FONT
    S = Image.new('RGB', (48 * 4 * 2 + 30 + 16 * 5 * 4 + 40, 48 * 4 + 140), '#121c1f'); d = ImageDraw.Draw(S)
    d.text((10, 8), 'Wohnhaus (Tag / Abend) · Bauer: 4 Richtungen × 4 Frames', fill='#f3d58f', font=FONT)
    for i, ev in enumerate((False, True)):
        S.paste(compose(wf, grass_tile(48, 48), ev).resize((192, 192), Image.NEAREST).convert('RGB'), (10 + i * 200, 30))
    for di, dname in enumerate(DIRS):
        d.text((420, 30 + di * 76), dname, fill='#ece4cf', font=FONT)
        for f in range(4):
            S.paste(compose(fr[di * 4 + f], grass_tile(16, 24), False).resize((48, 72), Image.NEAREST).convert('RGB'), (470 + f * 54, 30 + di * 76))
    S.save('vorschau-figuren.png')
