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
  ("kviz.html", "Najít plán · Apothelix", "Tři otázky, které vám pomohou vybrat plán Apothelix podle denního rytmu."),
  ("404.html", "Stránka nenalezena · Apothelix", "Tato stránka neexistuje."),
]
SITE = "https://apothelix.vercel.app"  # po připojení domény změnit na https://apothelix.cz
STATIC = SRC / "static"  # favicon, sdílecí obrázek, robots.txt; kopíruje se beze změny
JSONLD = ('<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization",'
          '"name":"Apothelix","url":"%s","logo":"%s/icon-512.png","description":"Bylinná apotéka: plány doplňků stravy podle denního rytmu."}</script>')
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Young+Serif&display=swap">'
header = (SRC / "_header.html").read_text(encoding="utf-8")
footer = (SRC / "_footer.html").read_text(encoding="utf-8")
css = (SRC / "style.css").read_text(encoding="utf-8")
js = (SRC / "script.js").read_text(encoding="utf-8")

def clean(name):
  return "/" if name == "index.html" else "/" + name.removesuffix(".html")

def meta(name, title, desc):
  url = SITE + clean(name)
  tags = [
    '<meta name="theme-color" content="#EEF2EE" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#0E1613" media="(prefers-color-scheme: dark)">',
    '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
    f'<meta property="og:type" content="website">',
    f'<meta property="og:locale" content="cs_CZ">',
    f'<meta property="og:site_name" content="Apothelix">',
    f'<meta property="og:title" content="{title}">',
    f'<meta property="og:description" content="{desc}">',
    f'<meta property="og:image" content="{SITE}/og.png">',
    '<meta name="twitter:card" content="summary_large_image">',
  ]
  if name == "404.html":
    tags.insert(0, '<base href="/">')
    tags.append('<meta name="robots" content="noindex">')
  else:
    tags.append(f'<link rel="canonical" href="{url}">')
  if name == "index.html":
    tags.append(JSONLD % (SITE, SITE))
  return "\n".join(tags)

def head(title, desc, inline, name="index.html"):
  style = f"<style>\n{css}</style>" if inline else '<link rel="stylesheet" href="style.css">'
  return f'<title>{title}</title>\n<meta name="description" content="{desc}">\n{meta(name, title, desc)}\n{FONTS}\n{style}'

def body(name):
  main = (SRC / "pages" / name).read_text(encoding="utf-8")
  return f"{header}\n{main}\n{footer}"

for out in ("dist", "preview"):
  (ROOT / out).mkdir(exist_ok=True)
for name, title, desc in PAGES:
  # Vercel: plné dokumenty se sdíleným style.css a script.js
  doc = ('<!doctype html>\n<html lang="cs">\n<head>\n<meta charset="utf-8">\n'
         '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
         f'{head(title, desc, False, name)}\n</head>\n<body>\n{body(name)}\n<script src="script.js"></script>\n</body>\n</html>\n')
  (ROOT / "dist" / name).write_text(doc, encoding="utf-8")
  if name == "404.html":  # jen pro Vercel, v náhledu nedává smysl
    continue
  # Náhled: index bez kostry (Artifact ji doplní), ostatní stránky plné
  if name == "index.html":
    (ROOT / "preview" / name).write_text(f"{head(title, desc, True, name)}\n{body(name)}\n<script>\n{js}</script>\n", encoding="utf-8")
  else:
    (ROOT / "preview" / name).write_text(doc, encoding="utf-8")
for out in ("dist", "preview"):
  (ROOT / out / "style.css").write_text(css, encoding="utf-8")
  (ROOT / out / "script.js").write_text(js, encoding="utf-8")
  for f in STATIC.iterdir():
    (ROOT / out / f.name).write_bytes(f.read_bytes())
urls = "".join(f"  <url><loc>{SITE}{clean(n)}</loc></url>\n" for n, _, _ in PAGES if n != "404.html")
(ROOT / "dist" / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n', encoding="utf-8")
(ROOT / "dist" / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
print("ok")
