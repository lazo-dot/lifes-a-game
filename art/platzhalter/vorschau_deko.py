"""Vorschauen für deko.py: vorschau-deko-tag/abend.png, vorschau-tiere.png."""
from PIL import Image, ImageDraw
from deko import build_all
from vorschau import compose, grass_tile, FONT

def sheet(frames, names, size, scale, cols, out, title, ev=False):
    fw, fh = size[0] * scale, size[1] * scale; cw = max(fw, 126); rows = (len(frames) + cols - 1) // cols
    S = Image.new('RGB', (cols * (cw + 10) + 10, rows * (fh + 30) + 30), '#121c1f'); d = ImageDraw.Draw(S)
    d.text((10, 8), title, fill='#f3d58f', font=FONT); bg = grass_tile(*size)
    for i, (f, n) in enumerate(zip(frames, names)):
        x = 10 + (i % cols) * (cw + 10); y = 30 + (i // cols) * (fh + 30)
        S.paste(compose(f, bg, ev).resize((fw, fh), Image.NEAREST).convert('RGB'), (x + (cw - fw) // 2, y))
        d.text((x, y + fh + 3), n, fill='#ece4cf', font=FONT)
    S.save(out)

if __name__ == '__main__':
    D, fr, T, tf, bad = build_all()
    SZ = {'fruehling': 'Frühling', 'sommer': 'Sommer', 'herbst': 'Herbst', 'winter': 'Winter'}
    names = [f"{d[2]}{' ★' if d[4] else ''}" + (f" · {SZ[d[5]]}" if d[5] else '') for d in D]
    sheet(fr, names, (16, 24), 4, 8, 'vorschau-deko-tag.png', 'Truhengegenstände · Platzhalter Stil B · ★ = selten')
    sheet(fr, [d[2] for d in D], (16, 24), 4, 8, 'vorschau-deko-abend.png', 'Truhengegenstände · Abend', True)
    sheet(tf, [f'{t[2]} {i % 2 + 1}' for t in T for i in range(2)], (16, 16), 5, 10, 'vorschau-tiere.png', 'Tiere · 2 Frames Leerlauf · alle selten')
    print('ok')
