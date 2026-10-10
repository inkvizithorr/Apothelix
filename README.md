# Apothelix web

Statický web bez frameworku. Upravuje se `src/`, výsledek vytvoří `python3 src/build.py`.

- `src/pages/*.html` – obsah jednotlivých stránek (úvod, GenioLoci, Jatroděj, Očistelix, Geniolok)
- `src/_header.html`, `src/_footer.html` – sdílená hlavička a patička s povinnými větami
- `src/style.css`, `src/script.js` – sdílené styly a skripty
- `dist/` – hotový web pro Vercel (Framework: Other, Root Directory: `dist`)
- `preview/` – varianta pro náhled v Claude Artifactu

Formulář „Mám zájem“ zatím nikam neodesílá. Fotky Genioloku jsou zatím zástupné rámečky.

## Statické soubory a SEO
- `src/static/` se kopíruje beze změny (favicon, ikony, sdílecí obrázek `og.png`).
- `build.py` generuje `sitemap.xml` a `robots.txt`. Adresa webu je v konstantě `SITE`; po připojení domény ji změňte na `https://apothelix.cz`.
- `404.html` obsluhuje neexistující adresy na Vercelu.

## Angličtina, PDF a nastavení obchodu
- Anglická verze: zdroje v `src/en/` (stejné názvy souborů), výstup v `dist/en/`. Texty ve skriptu se překládají přes `tr('česky','english')`.
- Adresy jsou skutečné soubory (`/jatrodej.html`, `/en/jatrodej.html`), proto `vercel.json` nemá `cleanUrls`.
- PDF průvodce: zdroj `src/guide/*.html`, hotové PDF v `src/static/` (denni-rytmus.pdf, daily-rhythm.pdf).
- Ceny, poštovné, IBAN, sleva předplatného a recenze se vyplňují v objektu `APX` na začátku `src/script.js`.
- Měření návštěvnosti: zapnout Analytics v projektu na Vercelu; skript `/_vercel/insights/script.js` už stránky načítají.
