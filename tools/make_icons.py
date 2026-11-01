"""Erzeugt die App-Icons als Pixel-Art (ein Beet mit ausgewachsener Pflanze). Aufruf: python3 tools/make_icons.py"""
from PIL import Image

PLANT = [
    "................",
    "......FFF.......",
    ".....FwFFf......",
    "....lFFFFfl.....",
    "...lGlFffGl.....",
    "....lGGGGl......",
    ".....lGGl.......",
    "......GG........",
    "......GG........",
    "..oooooooooooo..",
    "..oWWWWWWWWWWo..",
    "..oWssssssssWo..",
    "..oWsdsdsdssWo..",
    "..oWssssssssWo..",
    "..oooooooooooo..",
    "................",
]
PAL = {
    "F": (240, 138, 36), "f": (184, 86, 26), "w": (255, 246, 224), "l": (168, 242, 160), "G": (63, 163, 86),
    "o": (30, 42, 48), "W": (212, 162, 90), "s": (122, 82, 54), "d": (94, 62, 40),
}
BG, BG2 = (13, 23, 25), (22, 38, 42)


def icon(size, pad_ratio):
    grid = 16
    img = Image.new("RGB", (grid, grid), BG)
    for y in range(grid):
        for x in range(grid):
            if (x // 2 + y // 2) % 2:
                img.putpixel((x, y), BG2)
            ch = PLANT[y][x]
            if ch in PAL:
                img.putpixel((x, y), PAL[ch])
    inner = int(size * (1 - 2 * pad_ratio)) // grid * grid
    big = img.resize((inner, inner), Image.NEAREST)
    out = Image.new("RGB", (size, size), BG)
    off = (size - inner) // 2
    out.paste(big, (off, off))
    return out


icon(192, 0.04).save("icons/icon-192.png")
icon(512, 0.04).save("icons/icon-512.png")
icon(512, 0.14).save("icons/icon-maskable-512.png")
icon(180, 0.06).save("icons/apple-touch-icon.png")
print("Icons erstellt")
