"""Sestaví web Apothelix: dist/ pro Vercel (plné HTML) a preview/ pro náhled v Artifactu.

Česká verze je v kořeni, anglická v /en/ (zdroje v src/en/)."""
import pathlib
SRC = pathlib.Path(__file__).parent
ROOT = SRC.parent
PAGES = {  # jazyk: [(soubor, titulek, popis)]
  "cs": [
    ("index.html", "Apothelix", "Tradiční bylinná apotéka a moderní buněčná optimalizace. Ucelené plány doplňků stravy rozdělené podle denního rytmu."),
    ("genioloci.html", "GenioLoci · Apothelix", "Komplexní 30denní plán GenioLoci pro ráno, odpoledne i večer."),
    ("jatrodej.html", "Jatroděj · Apothelix", "Plán Jatroděj s důrazem na ranní fázi a játra."),
    ("ocistelix.html", "Očistelix · Apothelix", "Program Očistelix s důrazem na večerní zklidnění."),
    ("pribeh.html", "Můj příběh · Apothelix", "Příběh zakladatele: proč Apothelix vznikl."),
    ("objednavka.html", "Objednávka · Apothelix", "Objednávka plánu Apothelix: doručení a platba."),
    ("geniolok.html", "Geniolok · Apothelix", "Geniolok: hliníkový dávkovač se systémem Slide & Snap pro tři denní fáze."),
    ("kviz.html", "Najít plán · Apothelix", "Tři otázky, které vám pomohou vybrat plán Apothelix podle denního rytmu."),
    ("404.html", "Stránka nenalezena · Apothelix", "Tato stránka neexistuje."),
  ],
  "en": [
    ("index.html", "Apothelix", "A traditional herbal apothecary meets modern cellular nutrition. Food supplement plans arranged around your daily rhythm."),
    ("genioloci.html", "GenioLoci · Apothelix", "GenioLoci: a complete 30-day plan for morning, afternoon and evening."),
    ("jatrodej.html", "Jatroděj · Apothelix", "Jatroděj: a 30-day plan with the focus on the morning."),
    ("ocistelix.html", "Očistelix · Apothelix", "Očistelix: a 30-day plan with the focus on the evening."),
    ("pribeh.html", "My story · Apothelix", "The founder's story: why Apothelix exists."),
    ("objednavka.html", "Order · Apothelix", "Order an Apothelix plan: delivery and payment."),
    ("geniolok.html", "Geniolok · Apothelix", "Geniolok: an aluminium pill case with Slide & Snap for the three parts of the day."),
    ("kviz.html", "Find your plan · Apothelix", "Three questions to help you choose an Apothelix plan by your daily rhythm."),
  ],
}
SITE = "https://apothelix.vercel.app"  # po připojení domény změnit na https://apothelix.cz
STATIC = SRC / "static"  # favicon, ikony, sdílecí obrázek, PDF průvodce; kopíruje se beze změny
JSONLD = ('<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization",'
          '"name":"Apothelix","url":"%s","logo":"%s/icon-512.png","description":"Bylinná apotéka: plány doplňků stravy podle denního rytmu."}</script>')
# Vercel Web Analytics (bez cookies); funguje po zapnutí Analytics v projektu na Vercelu
ANALYTICS = '<script defer src="/_vercel/insights/script.js"></script>\n'
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Young+Serif&display=swap">'
css = (SRC / "style.css").read_text(encoding="utf-8")
js = (SRC / "script.js").read_text(encoding="utf-8")
LANGDIR = {"cs": SRC, "en": SRC / "en"}
PREFIX = {"cs": "", "en": "../"}  # cesta ke sdíleným souborům
OUTDIR = {"cs": "", "en": "en/"}
EN_NAMES = {n for n, _, _ in PAGES["en"]}

def clean(name, lang="cs"):
  # Bez cleanUrls: adresy jsou skutečné soubory, takže relativní odkazy fungují i v /en/
  base = "/en/" if lang == "en" else "/"
  return base if name == "index.html" else base + name

def meta(name, title, desc, lang):
  pre = PREFIX[lang]
  tags = [
    '<meta name="theme-color" content="#EEF2EE" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#0E1613" media="(prefers-color-scheme: dark)">',
    f'<link rel="icon" href="{pre}favicon.svg" type="image/svg+xml">',
    f'<link rel="apple-touch-icon" href="{pre}apple-touch-icon.png">',
    '<meta property="og:type" content="website">',
    f'<meta property="og:locale" content="{"en_GB" if lang == "en" else "cs_CZ"}">',
    '<meta property="og:site_name" content="Apothelix">',
    f'<meta property="og:title" content="{title}">',
    f'<meta property="og:description" content="{desc}">',
    f'<meta property="og:image" content="{SITE}/og.png">',
    '<meta name="twitter:card" content="summary_large_image">',
  ]
  if name == "404.html":
    tags.insert(0, '<base href="/">')
    tags.append('<meta name="robots" content="noindex">')
  else:
    tags.append(f'<link rel="canonical" href="{SITE}{clean(name, lang)}">')
    if name in EN_NAMES:
      tags.append(f'<link rel="alternate" hreflang="cs" href="{SITE}{clean(name, "cs")}">')
      tags.append(f'<link rel="alternate" hreflang="en" href="{SITE}{clean(name, "en")}">')
  if name == "index.html" and lang == "cs":
    tags.append(JSONLD % (SITE, SITE))
  return "\n".join(tags)

def head(name, title, desc, lang, inline):
  style = f"<style>\n{css}</style>" if inline else f'<link rel="stylesheet" href="{PREFIX[lang]}style.css">'
  return f'<title>{title}</title>\n<meta name="description" content="{desc}">\n{meta(name, title, desc, lang)}\n{FONTS}\n{style}'

def body(name, lang):
  d = LANGDIR[lang]
  # přepínač jazyka vede na stejnou stránku v druhém jazyce (404 jen česky, odkaz na úvod)
  alt = ("en/" + (name if name in EN_NAMES else "index.html")) if lang == "cs" else "../" + name
  header = (d / "_header.html").read_text(encoding="utf-8").replace("{{ALT}}", alt)
  footer = (d / "_footer.html").read_text(encoding="utf-8")
  main = (d / "pages" / name).read_text(encoding="utf-8")
  return f"{header}\n{main}\n{footer}"

for out in ("dist", "preview"):
  for lang in PAGES:
    (ROOT / out / OUTDIR[lang]).mkdir(parents=True, exist_ok=True)
for lang, pages in PAGES.items():
  for name, title, desc in pages:
    # Vercel: plné dokumenty se sdíleným style.css a script.js
    doc = (f'<!doctype html>\n<html lang="{lang}">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
           f'{head(name, title, desc, lang, False)}\n</head>\n<body>\n{body(name, lang)}\n'
           f'<script src="{PREFIX[lang]}script.js"></script>\n{ANALYTICS}</body>\n</html>\n')
    (ROOT / "dist" / OUTDIR[lang] / name).write_text(doc, encoding="utf-8")
    if name == "404.html":  # jen pro Vercel, v náhledu nedává smysl
      continue
    # Náhled: český index bez kostry (Artifact ji doplní), ostatní stránky plné
    if name == "index.html" and lang == "cs":
      (ROOT / "preview" / name).write_text(f"{head(name, title, desc, lang, True)}\n{body(name, lang)}\n<script>\n{js}</script>\n", encoding="utf-8")
    else:
      (ROOT / "preview" / OUTDIR[lang] / name).write_text(doc, encoding="utf-8")
for out in ("dist", "preview"):
  (ROOT / out / "style.css").write_text(css, encoding="utf-8")
  (ROOT / out / "script.js").write_text(js, encoding="utf-8")
  for f in STATIC.iterdir():
    (ROOT / out / f.name).write_bytes(f.read_bytes())
urls = "".join(f"  <url><loc>{SITE}{clean(n, lang)}</loc></url>\n" for lang, pages in PAGES.items() for n, _, _ in pages if n != "404.html")
(ROOT / "dist" / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n', encoding="utf-8")
(ROOT / "dist" / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n", encoding="utf-8")
print("ok")
