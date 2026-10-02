# WordPress-kompatibler Magazin-Endpunkt (für ICONY)

ICONY (Heiko Grossmann) braucht auf der Startseite der Plattform immer drei Magazin-Teaser und liest sie im
WordPress-Format. Das WordPress ist abgelöst; die App erzeugt dieselbe Antwort aus den Magazin-Dateien
(`lib/wp-rest-compat.ts`, Pfadlogik `lib/wp-rest-paths.ts`, Routen unter `app/magazin/`).

## Adressen (Live-Domain)

    https://tierisch-verliebt.de/magazin/wp-json/wp/v2/posts?per_page=3&_embed
    https://tierisch-verliebt.de/magazin/wp-json/wp/v2/posts/<id>
    https://tierisch-verliebt.de/magazin/wp-json/wp/v2/categories
    https://tierisch-verliebt.de/magazin/wp-json/wp/v2/tags            (leer, es gibt keine Schlagwörter)
    https://tierisch-verliebt.de/magazin/wp-json/wp/v2/media/<id>      (nur Beitragsbilder)
    https://tierisch-verliebt.de/magazin/index.php?rest_route=/wp/v2/posts
    https://tierisch-verliebt.de/magazin/?rest_route=/wp/v2/posts

Alle Adressen gehen auch mit `/de` davor (`/de/magazin/wp-json/…`, so ruft nginx Vercel auf) und mit/ohne Schrägstrich
am Ende. Die App antwortet direkt mit JSON 200 (keine 308-Umleitung); `proxy.ts` nimmt den Pfad von der Slash-Umleitung
aus. Nur die deutsche Seite hat den Endpunkt; tierisch-verliebt.at/.ch haben kein Magazin.

## Was nginx (ICONY) durchreichen muss

Nur Seitenrouten gehen an Vercel. Zusätzlich muss durchgereicht werden:

- `/magazin/wp-json/` (alles darunter)
- `/magazin/index.php` (nur wegen `?rest_route=`)
- `/magazin/` mit Query `rest_route` (läuft als Seitenroute des Magazins; proxy.ts leitet sie intern auf `/magazin/index.php`)

Reicht nginx `/magazin/…` ohne Präfix an Vercel, passt es; reicht es `/de/magazin/…` weiter, passt es ebenso.
Query-String muss unverändert mitgehen. Bilder in den Antworten sind absolute URLs auf den Asset-Host
(`https://tierisch-verliebt.vercel.app/app-assets/magazin/wp-content/uploads/…`), dafür ist nichts durchzureichen.

## Inhalt und Grenzen

- Nur Magazin-Beiträge (`post`). Keine Seiten, Stadt-, Lexikon- oder Studio-Inhalte.
- `/wp/v2/users` und alles Unbekannte antworten mit 404 (`rest_no_route`). `author` ist nur eine ID, es gibt kein
  `_embedded.author` (Autorennamen-Enumeration war ein Prüfbefund bei elFlirt).
- `link` ist die kanonische Live-URL (`https://tierisch-verliebt.de/magazin/<slug>/`), `date` = veröffentlicht,
  `modified` = aktualisiert (Europe/Berlin, `*_gmt` in UTC).
- `_embed` liefert `wp:featuredmedia` (`source_url`, `alt_text`, `media_details`) und `wp:term`. Der Alt-Text ist nie leer
  (Bildbeschreibung aus dem Beitrag, sonst der Titel).
- Der frühere Redirect `/magazin/wp-json/…` nach `/magazin/` in `next.config.ts` ist entfernt.
- Parameter: `per_page` (max. 100), `page`, `offset`, `_embed`, `_fields`, `orderby`, `order`, `categories`, `slug`,
  `search`, `include`, `exclude`, `author`, `after`, `before`, `modified_after`, `modified_before`.
- Header: CORS `*`, `X-WP-Total`, `X-WP-TotalPages`, `Link`, `Cache-Control` (5 Min Browser, 1 Std CDN), `X-Robots-Tag: noindex`;
  `OPTIONS` und `HEAD` sind unterstützt.

## Pflege

- Neuer oder geänderter Beitrag (`type: post`) = Markdown unter `content/magazin/`; Seiten (`type: page`, Rassenporträts) erscheinen nie im Endpunkt. Der Endpunkt folgt automatisch.
- Neues Beitragsbild: danach `node scripts/magazin-bildmasse.mjs` laufen lassen (schreibt `data/magazin/bildmasse.json`,
  die Pixelmaße für `media_details`); der Test `tests/wp-rest-compat.test.mjs` schlägt sonst an.
- Prüfung vor Livegang: `https://tierisch-verliebt.vercel.app/magazin/wp-json/wp/v2/posts?per_page=3&_embed`.
