# Umsetzung des Bildaudits – 3. November 2026

## Freigabe und Ergebnis

Christian hat am 3. November 2026 den illustrierten Stil, tierisch-verliebt-Farben und das Logo ohne Claim freigegeben und ausdrücklich die Überarbeitung aller 99 Audit-Kandidaten beauftragt.

99 eigenständige Ersatzdateien: **82 Fotos und 17 Infografiken**, eingebunden in **90 deutschen Artikelseiten**. Fünf niederländische Übersetzungen verwenden betroffene Motive mit und wurden ebenfalls tatsächlich auf die neuen Bilder umgestellt. Alte Originaldateien bleiben erhalten; alle alten Größenvarianten der 99 Familien sind aus den zugeordneten Artikelverweisen entfernt.

Infografiken: erklärende Tier-/Objektillustrationen, kurze Labels, Rot/Grün, Logo ohne Claim. Fotos: wechselnde natürliche Alltagssituationen; keine Darstellung als echte Mitglieder. Neue Bilder sind KI-generierte Symbolmotive bzw. schematische Illustrationen. Die Herkunft bleibt in geschlossenen Quellen-/Bildnachweisblöcken transparent.

## Inhalte und technische Integration

- Ara- und Graupapagei-Ernährung: unbelegte pauschale Gemüse-/Obstprozente entfernt; Futterbasis/Ergänzung und fachlich begleitete Umstellung abgestimmt.
- Vogelvergleich: starre unbelegte Stunden-/Platzrangliste durch zugängliche Beschreibung der vier Bedürfnisse ersetzt; irreführende Alleinhaltungs-/Pflegeleicht-Aussagen korrigiert.
- Papageiengesundheit: nicht auf mehrere Symptome warten; eindeutige Notfallzeichen und keine eigenmächtige Behandlung.
- Neue Schaubilder verlinken auf die volle Grafik; kurze Textfassungen bleiben im Artikel. Vorhandene Quellen und Bildnachweise erhalten.
- Neue Dateien unter `public/magazin/wp-content/uploads/2026/11/`, identische bestehende Asset-Host-Logik. Keine neuen relativen Assetpfade außerhalb dieses Musters.
- Neue Titelbilder mit korrekten Pixelmaßen in `data/magazin/bildmasse.json`, einschließlich Rassenseiten.
- NL: fünf Bildwechsel und niederländische Nachweise; bestehende Quellenfunktion auch im NL-Renderer verwenden und gemeinsames 13-px-Quellen-CSS laden. Regressionstest zunächst fehlgeschlagen, nach Integration bestanden. Bestehender Test auf Medien-/Strukturgleichheit blieb erhalten.

## Qualitätssicherung vor Veröffentlichung

- 99/99 Audit-IDs exakt abgedeckt; 99 unterschiedliche Datei-Hashes; jedes neue WebP **1536 × 1024 px**, maximal **336.386 Bytes**.
- Alle alten Originaldateien vorhanden; keine alten Referenzfamilien in zugeordneten DE-/NL-Artikeln.
- Alle generierten Motive visuell kontrolliert; unabhängige Kontaktbogen-/Detailprüfung der fremden Foto-Pakete und Grafiken.
- Reviewkorrekturen: Transportbox feinmaschig statt breiter Katzenbox-Gitter; Volierenvergleiche mit Maßstabshinweis und ohne suggerierende Freigabehaken; Rückzug als Sichtschutz statt Nisthöhle; präziserer Egyptian-Mau-Alt-Text.
- Idempotenz der Integration geprüft: erneuter Lauf ändert **0 Artikel**.
- **209/209 Tests bestanden**; Lint **0 Fehler, 47 Warnungen** an vorhandenen Stellen; Produktionsbuild erfolgreich, 403 statisch erzeugte Seiten.
- Browser-/HTTP-Prüfung der ausgelieferten Vercel-Seiten erfolgt nach Push; Ergebnis und Commit werden im Vault ergänzt.

## Nachweise und Wiederaufnahme

- `2026-11-03-applied.json`: vollständige ID-/Alt-/Artikel-/Dateizuordnung.
- `2026-11-03-initial-four.json`, `2026-11-03-graphics.json`, `2026-11-03-food-a.json`, `2026-11-03-food-b.json`, `2026-11-03-other-photos.json`: Prompts, Generatorquellen und Prüfnotizen.
- `apply-assets.py`: idempotente Integration; `align-article-facts.py`: gezielter Faktenabgleich; `prepare-image.mjs`: reine WebP-Konvertierung, keine Retusche.
- Projektstandard: `docs/bildstandard.md`. Christians ausdrückliche Gestaltungsregel zusätzlich in `agent-skills/rules/common.md`.
- Keine konkrete Trello-Karte zugeordnet. Keine fremden Änderungen gestagt.

