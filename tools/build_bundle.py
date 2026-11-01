"""Baut aus den Modulen eine einzelne HTML-Datei für die Vorschau im Browser-Artifact.
Die echte App (PWA) nutzt weiterhin die getrennten Dateien. Aufruf: python3 tools/build_bundle.py"""
import re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
body = re.search(r"<body>(.*?)<script", html, re.S).group(1)
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
js = "\n".join((root / s).read_text(encoding="utf-8") for s in scripts)
fonts = re.search(r'<link rel="stylesheet" href="(https://fonts[^"]+)">', html).group(1)
out = f"""<title>Life's a Game</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<style>
{css}
</style>
{body}<script>
{js}
</script>
"""
dist = root / "dist"; dist.mkdir(exist_ok=True)
(dist / "lifes-a-game-v4.html").write_text(out, encoding="utf-8")
print("dist/lifes-a-game-v4.html", len(out) // 1024, "KB")
