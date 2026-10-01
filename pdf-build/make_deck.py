# Makes pdf-build/deck.html: a copy of ../index.html that loads the fonts locally (for offline rendering).
import re, pathlib
here = pathlib.Path(__file__).parent
h = (here.parent / "index.html").read_text()
ff = []
for fam, key, ws in [("Outfit", "outfit", [300, 500, 600, 700, 800]), ("Figtree", "figtree", [400, 500, 600]), ("DM Mono", "dm-mono", [400, 500])]:
    for w in ws:
        ff.append(f'@font-face{{font-family:"{fam}";font-weight:{w};font-style:normal;src:url(node_modules/@fontsource/{key}/files/{key}-latin-{w}-normal.woff2) format("woff2")}}')
h = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>', "<style>" + "".join(ff) + "</style>", h)
(here / "deck.html").write_text(h)
print("wrote deck.html")
