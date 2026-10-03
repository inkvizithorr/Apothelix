"""Sestaví web Apothelix: dist/ pro Vercel (plné HTML) a preview/ pro náhled v Artifactu."""
import pathlib, re
SRC = pathlib.Path(__file__).parent
ROOT = SRC.parent
PAGES = [  # soubor, titulek, popis
  ("index.html", "Apothelix", "Tradiční bylinná apotéka a moderní buněčná optimalizace. Ucelené plány doplňků stravy rozdělené podle denního rytmu."),
  ("genioloci.html", "GenioLoci · Apothelix", "Komplexní 30denní plán GenioLoci pro ráno, odpoledne i večer."),
  ("jatrodej.html", "Jatroděj · Apothelix", "Plán Jatroděj s důrazem na ranní fázi a játra."),
  ("ocistelix.html", "Očistelix · Apothelix", "Program Očistelix s důrazem na večerní zklidnění."),
  ("pribeh.html", "Můj příběh · Apothelix", "Příběh zakladatele: proč Apothelix vznikl."),
  ("objednavka.html", "Objednávka · Apothelix", "Objednávka plánu Apothelix: doručení a platba."),
  ("geniolok.html", "Geniolok · Apothelix", "Geniolok: hliníkový dávkovač se systémem Slide & Snap pro tři denní fáze."),
]
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Young+Serif&display=swap">'
header = (SRC / "_header.html").read_text(encoding="utf-8")
footer = (SRC / "_footer.html").read_text(encoding="utf-8")
css = (SRC / "style.css").read_text(encoding="utf-8")
js = (SRC / "script.js").read_text(encoding="utf-8")

def head(title, desc, inline):
  style = f"<style>\n{css}</style>" if inline else '<link rel="stylesheet" href="style.css">'
  return f'<title>{title}</title>\n<meta name="description" content="{desc}">\n{FONTS}\n{style}'

def body(name):
  main = (SRC / "pages" / name).read_text(encoding="utf-8")
  return f"{header}\n{main}\n{footer}"

for out in ("dist", "preview"):
  (ROOT / out).mkdir(exist_ok=True)
for name, title, desc in PAGES:
  # Vercel: plné dokumenty se sdíleným style.css a script.js
  doc = ('<!doctype html>\n<html lang="cs">\n<head>\n<meta charset="utf-8">\n'
         '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
         f'{head(title, desc, False)}\n</head>\n<body>\n{body(name)}\n<script src="script.js"></script>\n</body>\n</html>\n')
  (ROOT / "dist" / name).write_text(doc, encoding="utf-8")
  # Náhled: index bez kostry (Artifact ji doplní), ostatní stránky plné
  if name == "index.html":
    (ROOT / "preview" / name).write_text(f"{head(title, desc, True)}\n{body(name)}\n<script>\n{js}</script>\n", encoding="utf-8")
  else:
    (ROOT / "preview" / name).write_text(doc, encoding="utf-8")
for out in ("dist", "preview"):
  (ROOT / out / "style.css").write_text(css, encoding="utf-8")
  (ROOT / out / "script.js").write_text(js, encoding="utf-8")
print("ok")
