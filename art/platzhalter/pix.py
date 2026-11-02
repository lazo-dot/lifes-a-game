"""Kleiner Pixel-Zeichenkern für die Platzhalter-Grafiken (Stil B).

Jede Form bekommt ein Material (Rampe aus palette-stil-b.json) und einen Grundton-Index.
Beim Rendern entstehen automatisch:
  * Lichtkante oben links (+1 Stufe), Eigenschatten unten rechts (-1 Stufe) je Form
  * Umriss außen in der dunkelsten Stufe der angrenzenden Rampe (kein Schwarz)
Ebenen: base, glow (nur leuchtende Pixel), shadow (Schlagschatten, eine Farbe, volle Deckkraft –
die App zeichnet ihn mit ~30 %).
"""
import json, os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
PAL = json.load(open(os.path.join(HERE, '..', 'palette-stil-b.json')))

def _rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def _mix(a, b, t): return '#' + ''.join('%02x' % round(x + (y - x) * t) for x, y in zip(_rgb(a), _rgb(b)))

SKILL = dict(zip(['Körper', 'Geist', 'Kreativität', 'Alltag', 'Soziales', 'Musik', 'Kochen', 'Finanzen'], PAL['Fähigkeiten']))
RAMPS = {k: v for k, v in PAL.items() if k != 'Fähigkeiten'}
# Fähigkeitsfarben als kleine Rampen (nur für Fahnen und Akzente)
for name, c in SKILL.items():
    RAMPS['skill:' + name] = [_mix(c, '#1b1630', .55), _mix(c, '#1b1630', .25), c, _mix(c, '#fff3c4', .35)]
SHADOW = PAL['Umriss & Nacht'][0]
ALLOWED = {c.lower() for v in RAMPS.values() for c in v}


class Sprite:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.mat = [[None] * w for _ in range(h)]   # (ramp, idx, shape_id, bevel)
        self.glow = [[None] * w for _ in range(h)]  # Farbe oder None
        self.shadow = [[False] * w for _ in range(h)]
        self._sid = 0

    # ---------- Formen ----------
    def _mask(self, draw_fn):
        m = Image.new('1', (self.w, self.h), 0)
        draw_fn(ImageDraw.Draw(m))
        return m

    def _fill(self, mask, ramp, idx, bevel=True):
        self._sid += 1
        px = mask.load()
        for y in range(self.h):
            for x in range(self.w):
                if px[x, y]:
                    self.mat[y][x] = (ramp, idx, self._sid, bevel)
        return self._sid

    def rect(self, x, y, w, h, ramp, idx=2, bevel=True):
        if w <= 0 or h <= 0: return
        return self._fill(self._mask(lambda d: d.rectangle([x, y, x + w - 1, y + h - 1], fill=1)), ramp, idx, bevel)

    def poly(self, pts, ramp, idx=2, bevel=True):
        return self._fill(self._mask(lambda d: d.polygon(pts, fill=1, outline=1)), ramp, idx, bevel)

    def ellipse(self, x, y, w, h, ramp, idx=2, bevel=True):
        return self._fill(self._mask(lambda d: d.ellipse([x, y, x + w - 1, y + h - 1], fill=1)), ramp, idx, bevel)

    def line(self, pts, ramp, idx=2, width=1):
        return self._fill(self._mask(lambda d: d.line(pts, fill=1, width=width)), ramp, idx, False)

    def px(self, x, y, ramp, idx=2):
        if 0 <= x < self.w and 0 <= y < self.h:
            self._sid += 1
            self.mat[y][x] = (ramp, idx, self._sid, False)

    def hline(self, x, y, w, ramp, idx=2): self.rect(x, y, w, 1, ramp, idx, False)
    def vline(self, x, y, h, ramp, idx=2): self.rect(x, y, 1, h, ramp, idx, False)

    # ---------- Ebenen ----------
    def light(self, x, y, w, h, col_idx=1):
        """Leuchtende Fläche (Fenster): base bekommt Glas/Glut, glow bekommt Licht."""
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if 0 <= xx < self.w and 0 <= yy < self.h:
                    self.glow[yy][xx] = RAMPS['Licht & Glut'][col_idx]

    def glow_px(self, x, y, col_idx=0):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.glow[y][x] = RAMPS['Licht & Glut'][col_idx]

    def drop_shadow(self, cx, cy, rx, ry=None):
        ry = ry or max(2, rx // 3)
        m = self._mask(lambda d: d.ellipse([cx - rx + 2, cy - ry + 1, cx + rx + 1, cy + ry], fill=1)).load()
        for y in range(self.h):
            for x in range(self.w):
                if m[x, y]: self.shadow[y][x] = True

    # ---------- Rendern ----------
    def render(self, outline=True):
        W, H = self.w, self.h
        base = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        b = base.load()
        same = lambda x, y, sid: 0 <= x < W and 0 <= y < H and self.mat[y][x] and self.mat[y][x][2] == sid
        for y in range(H):
            for x in range(W):
                m = self.mat[y][x]
                if not m: continue
                ramp, idx, sid, bevel = m
                r = RAMPS[ramp]
                i = idx
                if bevel:
                    if not same(x, y - 1, sid) or not same(x - 1, y, sid): i = idx + 1
                    elif not same(x, y + 1, sid) or not same(x + 1, y, sid): i = idx - 1
                i = max(0, min(len(r) - 1, i))
                b[x, y] = _rgb(r[i]) + (255,)
        if outline:
            out = base.copy(); o = out.load()
            for y in range(H):
                for x in range(W):
                    if b[x, y][3]: continue
                    for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < W and 0 <= ny < H and self.mat[ny][nx]:
                            ramp = self.mat[ny][nx][0]
                            o[x, y] = _rgb(RAMPS[ramp][0]) + (255,)
                            break
            base = out
        glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); g = glow.load()
        for y in range(H):
            for x in range(W):
                if self.glow[y][x]: g[x, y] = _rgb(self.glow[y][x]) + (255,)
        shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s = shadow.load()
        for y in range(H):
            for x in range(W):
                if self.shadow[y][x]: s[x, y] = _rgb(SHADOW) + (255,)
        return {'base': base, 'glow': glow, 'shadow': shadow}


def export_sheet(name, frames, tags, size, outdir):
    """frames: Liste von Layer-Dicts (eine pro Stufe). Layout: Zeilen = Ebenen, Spalten = Stufen.
    JSON im Format von Aseprite „Export Sprite Sheet“ (Array, Layers getrennt)."""
    layers = ['base', 'glow', 'shadow']
    w, h = size
    sheet = Image.new('RGBA', (w * len(frames), h * len(layers)), (0, 0, 0, 0))
    out = []
    for li, layer in enumerate(layers):
        for fi, fr in enumerate(frames):
            sheet.paste(fr[layer], (fi * w, li * h))
            out.append({'filename': f'{name} ({layer}) {tags[fi]}', 'frame': {'x': fi * w, 'y': li * h, 'w': w, 'h': h},
                        'rotated': False, 'trimmed': False, 'spriteSourceSize': {'x': 0, 'y': 0, 'w': w, 'h': h},
                        'sourceSize': {'w': w, 'h': h}, 'duration': 100})
    sheet.save(os.path.join(outdir, name + '.png'))
    meta = {'app': 'lifes-a-game art/platzhalter/pix.py (Aseprite-kompatibel)', 'version': '1.0', 'image': name + '.png',
            'format': 'RGBA8888', 'size': {'w': sheet.width, 'h': sheet.height}, 'scale': '1',
            'frameTags': [{'name': t, 'from': i, 'to': i, 'direction': 'forward'} for i, t in enumerate(tags)],
            'layers': [{'name': l, 'opacity': 255 if l != 'shadow' else 77, 'blendMode': 'normal' if l != 'glow' else 'addition'} for l in layers],
            'anchor': {'x': w // 2, 'y': h - 1, 'note': 'Fußpunkt unten Mitte'}, 'platzhalter': True}
    json.dump({'frames': out, 'meta': meta}, open(os.path.join(outdir, name + '.json'), 'w'), ensure_ascii=False, indent=1)
    return sheet


def check_palette(img):
    bad = set()
    for p in img.getdata():
        if p[3] and ('#%02x%02x%02x' % p[:3]) not in ALLOWED and ('#%02x%02x%02x' % p[:3]) != SHADOW: bad.add('#%02x%02x%02x' % p[:3])
    return bad
