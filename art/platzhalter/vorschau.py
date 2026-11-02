"""Kontaktbogen: Sprites auf Gras zusammengesetzt (Schatten 30 %, Leuchten addiert), Tag und Abend."""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageChops
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pix import PAL

FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
GRASS = PAL['Gras']

def grass_tile(w, h, seed=3):
    import random
    r = random.Random(seed); img = Image.new('RGB', (w, h), GRASS[2]); p = img.load()
    for _ in range(w * h // 9):
        x, y = r.randrange(w), r.randrange(h); p[x, y] = tuple(int(GRASS[1][i:i + 2], 16) for i in (1, 3, 5))
        if r.random() < .5 and y > 0: p[x, y - 1] = tuple(int(GRASS[3][i:i + 2], 16) for i in (1, 3, 5))
    return img

def compose(layers, bg, evening=False):
    img = bg.copy().convert('RGBA')
    sh = layers['shadow'].copy(); a = sh.split()[3].point(lambda v: 77 if v else 0); sh.putalpha(a)
    img = Image.alpha_composite(img, sh)
    img = Image.alpha_composite(img, layers['base'])
    if evening:
        tint = Image.new('RGBA', img.size, (120, 90, 170, 255))
        img = Image.blend(img, ImageChops.multiply(img, tint), 0.55)
        glow = layers['glow']
        if glow.getbbox():
            halo = glow.resize((glow.width // 2 or 1, glow.height // 2 or 1)).resize(glow.size, Image.NEAREST)
            img = ImageChops.add(img, Image.blend(Image.new('RGBA', img.size, (0, 0, 0, 0)), halo, 0.35))
            img = ImageChops.add(img, glow)
    return img

def soil_tile(w, h):
    img = Image.new('RGB', (w, h), PAL['Erde & Beet'][2]); d = ImageDraw.Draw(img)
    for y in range(2, h, 3): d.line([(0, y), (w, y)], fill=PAL['Erde & Beet'][1])
    return img

def contact(rows, frame, labels_left, col_labels, scale, out, evening=False, title='', ground='gras'):
    cols = max(len(r) for r in rows)
    fw, fh = frame[0] * scale, frame[1] * scale
    lw = 190; top = 36
    sheet = Image.new('RGB', (lw + cols * (fw + 8) + 8, top + len(rows) * (fh + 8) + 8), '#121c1f')
    d = ImageDraw.Draw(sheet)
    d.text((8, 8), title, fill='#f3d58f', font=FONT)
    for ci, cl in enumerate(col_labels): d.text((lw + ci * (fw + 8) + 4, 22), cl, fill='#a9bdb6', font=FONT)
    bg = soil_tile(*frame) if ground == 'erde' else grass_tile(*frame)
    for ri, row in enumerate(rows):
        y = top + ri * (fh + 8)
        d.text((8, y + fh // 2 - 6), labels_left[ri], fill='#ece4cf', font=FONT)
        for ci, layers in enumerate(row):
            img = compose(layers, bg, evening).resize((fw, fh), Image.NEAREST)
            sheet.paste(img.convert('RGB'), (lw + ci * (fw + 8), y))
    sheet.save(out)
    return out
