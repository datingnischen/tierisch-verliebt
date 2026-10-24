# Österreich Magazin – Produktion, 24. Oktober 2026

## Inhalte

Drei eigenständige Beiträge: Gassi-Date, neuer Partner und Katze, erster gemeinsamer Ausflug mit Hund. Österreichische Beispiele und amtliche Quellen der Städte Wien, Graz, Salzburg sowie ÖBB. Originalstudien: Wood et al. 2015, Humphrey et al. 2020 und Westgarth et al. 2019. Zahlen, Einschränkungen, Originalquellen und CC-BY-Links stehen direkt in den Studienboxen.

## Bilder und Grafiken

Eigene neue redaktionelle Symbolbilder, erzeugt mit OpenAI Imagegen, auf 1200 × 800 JPEG komprimiert. Gassi-Date: zwei Erwachsene mit einem angeleinten Hund im ruhigen Herbstpark. Katze: erhöhter Fensterplatz, Paar im Hintergrund; Fenster mit sichtbarer Schutzgitter-Sicherung nachbearbeitet. Ausflug: flacher Spazierweg, Paar mit einem Hund, Bank, Wasser und Tagesrucksack. Keine realen Teilnehmer oder konkreten Routen dargestellt.

Ablaufgrafik und korrigierte Blinzelgrafik aus dem eigenen CH-Assetbestand übernommen. Neue eigene SVG-Planungsskizze zum Ausflug, ausdrücklich keine Navigationskarte.

## Audio

Sprechtexte: docs/at-magazin-audio.json. Erzeugung: scripts/at-magazine-audio.mjs mit lokalem ElevenLabs-Key aus dem bestehenden, nicht eingecheckten Zugang. Bisherige Stimme und Modell eleven_v4, MP3 44,1 kHz/128 kbit. Vorhandene Dateien werden nicht erneut erzeugt. Keine Technik- oder Anbieternennung in Hörtexten und Playern.

## Prüfungen

Tests für AT-/CH-Trennung, DE-Host mit internen Länderpfaden, Canonicals/Schema, echte Bildmaße, FAQ und ländereigene REST-Teaser. Produktionsbuild und Lint. Browserprüfung der Übersicht und aller drei Artikel bei 390 und 1440 Pixeln: keine defekten Bilder, kein horizontaler Überlauf; Audiometadaten geladen, Quellen zugeklappt. MP3-Dateien mit ffprobe und vollständiger ffmpeg-Dekodierung geprüft. Reviewbefunde (interner Routing-Sonderfall, missverständliche Jahreszahl im Gassi-Hörtext) korrigiert; Gassi-Audio neu erzeugt.
