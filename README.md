# tierisch-verliebt – Next.js-Frontend

Öffentliches Frontend für **tierisch-verliebt.de / .at / .ch** (Next.js 16, App Router), deployt von `main` auf Vercel.
ICONY bleibt Betreiber der Dating-Plattform; Next.js rendert nur die redaktionellen, SEO-relevanten Seiten.

- GitHub: `datingnischen/tierisch-verliebt`
- Vercel-Prüf-URL: https://tierisch-verliebt.vercel.app (Märkte dort unter `/de`, `/at`, `/ch`)

## Was Next.js rendert

`proxy.ts` löst jede Anfrage über `resolveMarketRequest()` (`lib/markets.ts`) auf – per Host (`tierisch-verliebt.at` …) oder per Pfad-Präfix (`/at/…` auf Vercel):

| Markt | Routen |
| --- | --- |
| de | Startseite `/`, `/partnersuche/` + 20 Stadtseiten, Magazin `/magazin/…` (Artikel, Themen, Tierwelten, Autoren, Inhaltsverzeichnis), `/ueber-uns/` + Unterseiten (u. a. `/ueber-uns/bewertungen/`, `/ueber-uns/social-media/`) |
| at, ch | Startseite, `/partnersuche/` + je 15 Stadtseiten, `robots.txt`, `sitemap.xml` (intern `app/market-*`); alle anderen Pfade zeigen einen Platzhalter mit `noindex` |

Datenquellen:

- **Stadtseiten:** `data/partnersuche-markets.json` (Import aus ICONY, siehe unten), gelesen von `lib/market-partnersuche.ts`. Die Übersichtstexte je Markt stehen dort in `HUB_COPY`.
- **Magazin:** Dateien im Repo, kein WordPress und kein Netzwerkzugriff zur Laufzeit/Build (`lib/magazine-store.ts`, `lib/magazine.ts`):
  - `content/magazin/<slug>.md` – 262 Beiträge (`type: post`) und Seiten (`type: page`); Frontmatter mit `title`, `slug`, `published`, `updated` (Anzeige „Aktualisiert am …“, nur bei Artikeln), `author`, `categories`, `image`/`imageAlt`, `seoTitle` und `description` (aus AIOSEO), `noindex`, `excerpt`; der Inhalt darunter ist HTML wie in WordPress.
  - `data/magazin/kategorien.json`, `autoren.json` (Redaktion/Tierliebe sind Christian M. Haas), `slugs.json` (Slug-Inventar der WordPress-Instanz).
  - Bilder/Audio unter `public/magazin/wp-content/uploads/` (gleiche Pfade wie in WordPress, im Inhalt relativ gespeichert und zur Laufzeit auf den Asset-Host gesetzt).
  - Neuer Artikel = Datei anlegen (Frontmatter von einem bestehenden kopieren), committen, pushen.
  - Einmal-Import aus WordPress: `scripts/import_wordpress.py` (nicht erneut laufen lassen, sonst werden redaktionelle Änderungen überschrieben).
- **Bewertungen / Social Media:** zur Laufzeit von der ICONY-Seite übernommen (`lib/icony-static-pages.ts`).
- Assets kommen in Produktion vom Vercel-Host (`assetPrefix` in `next.config.ts`, `NEXT_PUBLIC_ASSET_HOST`).

## Was bei ICONY bleibt

Login, Registrierung, Suche, Profile und alle Plattform- und Rechtsseiten (Impressum, Datenschutz, AGB, Sicherheit, Redaktion, Basis-Mitgliedschaft, Erfolgsgeschichten …) bleiben auf ICONY. Links dorthin sind **immer absolut auf die Live-Domain** des Markts (`publicUrl()` in `lib/markets.ts`), nie auf Vercel. Auf der Prüf-URL leitet der Proxy `/at/login` & Co. an die Live-Domain weiter.

## AID-Konvention

Links zur Registrierung/Suche tragen genau einen von zwei Werten:

- `AID=location` – von Stadtseiten (`/partnersuche/…`)
- `AID=magazin` – von allen übrigen Seiten (Magazin, Startseite, Über uns …)

## Befehle

```bash
npm install
npm run dev                  # http://localhost:3000 (Märkte unter /de, /at, /ch)
npm test                     # Node-Tests (tests/*.test.mjs)
npm run lint
npm run build
npm run import:partnersuche  # Stadtseiten neu von ICONY importieren (Python 3, nur Standardbibliothek)
npm run test:import          # Offline-Tests für den Importer
python scripts/build_country_maps.py  # Landesumrisse für die Karte auf /partnersuche (Natural Earth)
```

## Stadtseiten neu importieren

`scripts/import_partnersuche.py` liest je Markt die Übersicht `https://tierisch-verliebt.<tld>/partnersuche/` (Städteliste und Reihenfolge) und danach jede Stadtseite; Texte bleiben unverändert, nur das HTML wird normalisiert.

```bash
python scripts/import_partnersuche.py --out /tmp/partnersuche.json   # erst vergleichen
git diff --no-index data/partnersuche-markets.json /tmp/partnersuche.json
python scripts/import_partnersuche.py                                # dann übernehmen
python scripts/import_partnersuche.py --market at                    # nur einen Markt
```

Solange sich upstream nichts ändert, ist der Re-Import byte-gleich mit der committeten Datei.

## Historie

Der ursprüngliche Migrationsplan liegt unter `docs/archive/MIGRATION_KICKOFF-2026-07-24.md`.
