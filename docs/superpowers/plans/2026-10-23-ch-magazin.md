# Schweizer Magazinstart

**Ziel:** Die am 23.10.2026 im Chat freigegebenen drei Schweizer Ratgeber unter tierisch-verliebt.ch/magazin/ veröffentlichen.

**Architektur:** Eigene HTML-Inhalte mit Frontmatter in content/ch/magazin, analog zur bestehenden NL-Dateiquelle. Eine interne Catch-all-Route rendert Übersicht und Artikel. Eine kleine öffentliche Slug-Liste begrenzt das Routing; unbekannte Artikel liefern 404. Keine deutschen Artikel im Schweizer Store.

**Vorgaben:** Schweizer Schreibweise, eigenständige Alltagsszenarien, geprüfte Primärquellen, .ch-Canonicals, de-CH, AID=magazin, ICONY-Rechtstexte und Plattformseiten bleiben extern. Vorhandene fremde Änderungen an japanische-hunde.md und magazin-article.css nicht anfassen oder committen.

- [x] Routingtests zuerst: CH-Übersicht/Artikel und Vorschau, keine DE-Inhalte, unbekannte Slugs und interne Routen geschützt.
- [x] Dateiquelle, drei Artikel, eigene Illustrationen und zugängliche responsive Übersicht/Artikel umsetzen.
- [x] Schweizer Sitemap, Menü/Footer und ICONY-REST-Teaser auf echte Artikel umstellen; AT behält Städte-Teaser. REST-Test prüft Artikelziele und echte Bilddateien.
- [x] Tests, ESLint (0 Fehler, bestehende Bild-Warnungen), Produktionsbuild, Browserprüfung bei 1440 und 390 px und unabhängiges Review durchgeführt. Integration prüft auch beide REST-Schreibweisen im laufenden Produktionsserver und die Trennung von CH/DE.
- [ ] Nur eigene Dateien committen, Git-Autor/Committer prüfen, main pushen und Vercel sowie öffentliche Schweizer Routen prüfen. Ergebnis und verbleibende Integrationsprobleme korrekt berichten.
