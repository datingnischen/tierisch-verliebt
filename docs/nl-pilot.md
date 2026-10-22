# tierisch-verliebt.nl: niederländischer Pilot

Die Vorschau liegt unter `/nl/` auf dem bestehenden Vercel-Projekt. Öffentliche URLs, Canonicals, Open Graph und JSON-LD sind für `https://tierisch-verliebt.nl` vorbereitet. Die Domain wurde mit dieser Änderung weder registriert noch aufgeschaltet.

## Umfang

- Start und Partnersuche mit Niederlande-Karte, 15 Stadtpins, Stadt-/Provinzfilter und Nachbarentfernungen.
- Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven, Groningen, Tilburg, Almere, Breda, Nijmegen, Arnhem, Haarlem, Maastricht, Leiden und Zwolle.
- Magazin, Hunde- und Katzenrassenübersicht sowie zehn vollständige übersetzte Rasseporträts.
- 266 Originalabsätze, sämtliche Bilder, Bildvarianten, Videos, Überschriften, Tabellen und ursprüngliche Autor-/Datumsfelder der Rasseporträts erhalten.
- Stadttexte nennen niederländische Orte und verlinken amtliche Informationen zu aktuellen Hunderegeln. Die 15 eigenen Stadtmotive liegen unter `public/nl/steden/` und werden auf den Stadtseiten als KI-generierte Stadtimpressionen gekennzeichnet. Prompts und Motive sind in `docs/nl-city-images-prompts.json` dokumentiert.

## Plattform und Indexierung

Stand 22.10.2026 (Trello-Karte oakoqYXw „Niederländer Projekt – Pilot Livegang“): Die Domain tierisch-verliebt.nl ist noch nicht registriert (Kauf macht Christian), eine NL-ICONY-Plattform gibt es nicht. Es werden deshalb keine Aktivitäten oder Profile unter einer erfundenen ID angefragt.

- **Aanmelden/Inloggen** führen auf die deutschsprachige Plattform tierisch-verliebt.de (`NL_PLATFORM`, `nlRegistrationUrl()` in `lib/nl-routes.ts`). Ein schmaler Hinweis unter der Kopfzeile, Footer, Stadtseiten und Over ons sagen das offen. `/registration/`, `/login/` und `/suche/` unter `/nl/` bzw. auf der .nl-Domain leiten dorthin. Sobald ICONY eine niederländische Oberfläche liefert: `NL_PLATFORM` umstellen und `NL_PLATFORM_DUTCH = true` (blendet den Hinweis aus). Offen: ob die deutsche Plattform niederländische Postcodes annimmt, bei ICONY klären.
- **Eigene Seiten**: `/over-ons/` (Redaktion, Arbeitsweise, Autor Christian M. Haas, Kontakt, FAQ; AboutPage/Person/FAQPage-JSON-LD), `/privacy/` (Vercel-Hosting, Vercel Web Analytics, YouTube im erweiterten Datenschutzmodus, Rechte) und `/colofon/` in `components/nl/info-pages.tsx`. Betreibername nur in Privacy und Colofon (immer noindex), wie bei single-cristiani.ch. YouTube-Einbettungen der Rasseporträts laufen über youtube-nocookie.com mit `loading="lazy"` (`lib/nl-magazine.ts`).
- **Indexierung**: seit 22.10.2026 `NL_PILOT_INDEXABLE = true` (Domain gekauft, bei Internex, DNS auf Vercel). Vorher galt: Solange bleiben alle Seiten `noindex, follow`, robots sperrt, die NL-Sitemap ist leer und der DE/AT/CH-Footer zeigt keinen NL-Link. `/partnersuche/` hat die Startseite als Canonical (gleiche Stadtübersicht).

Für den Livegang nach dem Domainkauf:

1. tierisch-verliebt.nl (+ www) im Vercel-Projekt tierisch-verliebt anlegen, DNS beim Registrar auf Vercel. Die .nl-Domain läuft direkt auf Vercel (kein ICONY-nginx davor), robots und Sitemap liefert die App.
2. `NL_PILOT_INDEXABLE = true`: Seiten indexierbar (außer Privacy/Colofon), Sitemap mit allen Seiten, robots erlaubt, NL-Link im DE/AT/CH-Footer nur über den eigenen Schalter `NL_IN_LIVE_FOOTERS` (nur nach Christians Freigabe).
3. GSC-Property für https://tierisch-verliebt.nl/ anlegen, Sitemap einreichen, Indexierung von / und den Stadtseiten beantragen.
4. Controlling: Teilprojekt in `vercel-project-splits.json` mit Filter `startswith(requestPath,'/nl')` und own-sites.json. Auf der .nl-Domain setzt `components/site-analytics.tsx` (`nlAnalyticsUrl`) das /nl-Präfix vor die Analytics-Pfade, sonst mischten sie sich mit AT/CH.

## Bewusst erhaltene Quellprobleme

Christian hat vollständige Übersetzungen ohne inhaltliche Neufassung beauftragt. Daher bleiben diese Angaben wie in den deutschen Quellen:

- Labrador: Lebensdauer 10–12 und 10–14 Jahre.
- Golden Retriever: voneinander abweichende Kaufpreise.
- Französische Bulldogge: unterschiedliche Größen-/Lebensdauerangaben und widersprüchliche Bewegungsempfehlungen.
- Pudel: unterschiedliche Kaufpreise im Steckbrief und in den FAQ.
- Bengal: Einleitung vermischt die wilde Leopardenkatze mit der domestizierten Rasse.
- Manche Ernährungsaussagen und Kaufpreise sind veraltet oder sollten fachlich geprüft werden.

Empfehlung: diese Sachangaben in einem getrennten Redaktionsdurchgang mit Quellen prüfen und anschließend deutsche und niederländische Fassungen gemeinsam korrigieren.

## Prüfung

144 Node-Tests und vier Python-Importtests erfolgreich; Produktionsbuild erfolgreich. ESLint meldet keine Fehler und 38 Hinweise, vor allem zu den im Projekt verwendeten normalen img-Elementen.

Lokale Browserprüfung: alle 30 NL-Routen HTTP 200, NL-Sprache, Landescanonical und noindex; unbekannte und interne Routen HTTP 404; 15 Pins und zehn Rassenkarten; Stadt-/Provinzfilter; keine Browserfehler. Desktop 1440 px und Mobilansichten 390/320 px visuell geprüft, Kopfzeile und lange niederländische Überschriften ohne Überlauf. Weitere Kopfzeilenprüfungen bei 360/768 px. Originalbilder im Browser geladen.
