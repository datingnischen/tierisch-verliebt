# Bildgenerierung und Artikelumbau – 3. November 2026

Christians Auftrag: unnatürlich wirkendes Community-Titelbild ersetzen; zusätzlich Tierärztin mit Kind und Wellensittich. Anschließend ausdrücklich Text umbauen oder löschen; Entscheidung: URL erhalten und auf Kennenlernen über Tierliebe ausrichten. Original-Logo oben nur auf der Infografik, ohne Claim. Das Community-Titelbild bleibt auf ausdrückliche Korrektur ohne Logo. Keine konkrete Trello-Karte zugeordnet.

Werkzeug: integrierte Bildgenerierung. Bildreferenz für das Logo: `public/brand/tierisch-verliebt-logo-de.svg`, als PNG gerendert. Dateien: `public/magazin/wp-content/uploads/2026/11/community-dating-hundespaziergang.webp`, `community-dating-kennenlernen-schaubild.webp` und `voegel-tierarzt-kind-wellensittich.webp`.

Die Infografik zeigt redaktionelle Handlungsvorschläge, keine belegte Erfolgsabfolge. Die lokalen Beispiele zum Ehrenamt sind durch die im Artikel verlinkten Tierheimseiten belegt. Der alte Audioplayer wurde entfernt, weil die Audiodatei den überholten Text zusammenfasst. Alte Dateien bleiben erhalten.

## Prompt der Infografik

Create a professional German editorial infographic landscape 3:2 on warm off-white background for tierisch-verliebt magazine. Hand drawn clean friendly vector-like illustrations with natural dog colors, muted green #429a45 and red #c02e2e accents and dark gray text. Title exact: 'Vom gemeinsamen Interesse zum Kennenlernen'. Three spacious illustrated scenes in a clear left-to-right sequence with subtle connecting arrows: 1 two adults each with a dog standing at respectful distance on a park path, label 'Gemeinsam teilnehmen'; 2 the same adults having a relaxed conversation while dogs sniff ground, label 'Ins Gespräch kommen'; 3 the two adults sitting at an outdoor café with one relaxed dog at their feet, label 'Unverbindlich verabreden'. Bottom short sentence exact: 'Tierwohl und gegenseitiges Interesse gehen vor.' Do not add numbers, statistics, percentages, checkmarks, promises of romantic success or logos. Humans ordinary and diverse, no romantic hearts. Generous whitespace, large beautifully legible German typography, restrained polished illustration, each scene distinct. Conceptual suggestions, not a scientific proven process.

## Finale Logo-Bearbeitung

Community-Foto: Originalgeneration ohne Logo verwendet; die zwischenzeitliche Logo-Variante wurde auf Christians Korrektur verworfen. Infografik: replace invented top-left branding with authentic logo reference, omit slogan and Magazin subtitle, preserve all other text and illustrations.

Die vollständigen Ausgangsprompts der beiden Fotos stehen in `bildwechsel-community-vogeltierarzt-2026-11-03.json`.

Für das finale Schaubild wurde die originale SVG-Wortmarke zusätzlich unverändert gerastert und über die generierte Logo-Referenz gesetzt (Sharp, ohne Claim). Das Logo ist damit das Projektoriginal und keine KI-Nachzeichnung. Beide Fotos bleiben ohne Logo.

Prüfung vor Veröffentlichung: 209/209 Tests im isolierten Quellstand; anschließend 211/211 Tests im gemeinsamen aktuellen Stand, regulärer Next.js-Produktionsbuild erfolgreich. ESLint 0 Fehler (47 bestehende Warnungen im isolierten Stand). Medien geprüft: alle drei WebPs 1536 × 1024, maximal 311.210 Bytes. Artikel-/Medienverweise geprüft; alte Audioeinbindung und Meta-Forum-Aufhänger entfernt.
