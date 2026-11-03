# Visueller KI-Audit: tierisch-verliebt.de/magazin/

Stand: 3. November 2026. Auftrag: künstlich wirkende Bilder, schlechte Infografiken und emotionale Glaubwürdigkeit prüfen. Ergebnis ist ein Audit und eine Austauschliste; keine Bilder oder Website-Inhalte wurden geändert.

## Ergebnis

Das Problem ist systematisch: Ein Teil der Bildwelt verbindet glatte Mensch-Tier-Porträts mit wiederkehrenden Küchen-, Napf- und Wohnzimmermotiven. Gleichzeitig stehen natürliche Tieraufnahmen im Bestand. Ein pauschaler Austausch aller Bilder wäre unnötig. Am dringendsten sind Grafiken, deren Beschriftungen und Symbole Informationen beschädigen.

Die Wirkung eines Bildes beweist keine KI-Herkunft. Die Bewertungen beschreiben sichtbare Qualität und redaktionelle Eignung, keine technische KI-Erkennung. Auch natürlich wirkende Bilder benötigen belastbare Bildrechte.

## Umfang und Nachweis

- 263 Markdown-Dateien unter `content/magazin` inventarisiert (enthält unterschiedliche Inhaltstypen, nicht gleichbedeutend mit 263 veröffentlichten Artikeln).
- 791 referenzierte Bildpfad-Familien nach Zusammenführung von Dateinamen mit Größen-Suffix; darunter auch Icons und Statistiken. Keine Aussage über 791 verschiedene Fotomotive oder binäre Duplikate.
- Gesamter Bestand in 20 Kontaktbögen gesichtet. Detailprüfung in voller Auflösung: Bengalkatze2, Vogel-Alltagsvergleich, Ara-Futter, Papageien-Gesundheit und Vögel/Kinder.
- CSV `2026-11-03-bildinventar.csv`: Asset, zugehörige Artikel, Priorität, Grund und URL. 99 Bildfamilien für Austausch/Neuaufbau markiert: 3 P0, 43 P1, 53 P2. Weitere 692 bleiben vorläufig bestehen; das ist keine Detailfreigabe.
- Öffentliche Magazinübersicht und Vogelartikel über Webabruf geprüft. Direkter Abruf der Hauptdomain lokal scheitert an der Zertifikatskette; Webabruf zeigt teils älteren WordPress-Stand. Daher keine vollständige Gleichheit von Live-Domain und Repository behauptet.
- Vercel-Magazinübersicht direkt HTTP 200. Vier Referenzassets (Bengalkatze2, Vogelvergleich, Ara-Futter, Papageien-Gesundheit) direkt HTTP 200 und bytegleich mit lokalen Dateien geprüft.
- Keine vollständige Text-, Fakten-, Rechte- oder mobile Browserprüfung. Die Kontaktbögen sind eine breite Sichtung, keine Detailprüfung jedes Bildes. CSV-Prioritäten sind redaktionelle Triage.

## P0: Informationsfehler zuerst beheben

### /magazin/voegel-als-haustiere/

`2026/01/infografik-welcher-vogel-fuer-deinen-alltag-1024x683.png`

Vogelarten fehlen in mehreren Tabellenzeilen. „Nymphensittich“ steht in der Zeitaufwand-Spalte. Es gibt sechs Datenzeilen statt der fünf Arten der Artikeltabelle. Rechts stehen „80 %“ und „2 von 3“ ohne sichtbaren Quellenbeleg; ihre sachliche Richtigkeit ist damit nicht belegt. Auch die im Artikel stehenden Zeit-/Platzkategorien brauchen vor einer Neuauflage eine Quellenprüfung. Unklare Kennzahlen nicht übernehmen.

Ersatz: fünf klar benannte Arten, konsistente Spalten, pro Mobilansicht lesbare Artenkarten. Haltung mit Artgenossen, Raum und tägliche Versorgung sichtbar behandeln. Nur belegte Aussagen verwenden. Die Grafik darf keine vermeintlich pflegeleichte Anschaffung versprechen.

### /magazin/ara-futter/

`2026/09/ara-futter-infografik-1024x683.png`

Rote Kreuze direkt neben Gemüse und Nüssen widersprechen den positiven Überschriften. Obst und Nüsse erscheinen mehrfach. Beschriftungen wie „Ruh“ und beschädigte Satzfragmente zeigen fehlende Endkontrolle. Prozentwerte haben im Bild keinen Quellenbeleg. Keine Aussage zur medizinischen Richtigkeit dieser Zahlen aus der Gestaltung ableiten.

Ersatz: klar getrennte Bereiche für geeignete Bestandteile und tatsächlich zu vermeidende Lebensmittel; Symbole nur mit eindeutiger Bedeutung. Mengen erst nach fachlicher Quellenprüfung setzen.

### /magazin/papageien-gesundheit/

`2026/09/papageien-gesundheit-warnzeichen-infografik-1024x683.png`

Beschädigte Wörter („Übermäßiges Trinken“ ist fehlerhaft wiedergegeben), doppelte Handlungsabschnitte, extrem viel kleine Schrift und konkurrierende Kreuze/Häkchen. Für ein Thema, bei dem Leser schnell handeln müssen, ungeeignet.

Ersatz: wenige gut lesbare Warnzeichen und eine klare Handlungsebene, fachlich gegen vogelkundige Quellen prüfen. Keine dekorative Mini-Enzyklopädie.

## P1: Vertrauen und Nutzbarkeit

- **Bengalkatze**, `/magazin/bengal-katze/`: `Bengalkatze2-1024x683.png` wirkt durch gleichmäßig warme Farbgebung, glatte Haut, perfekte Pose und sehr inszenierte Nähe künstlich. Ersatzmotiv: Katze beschäftigt sich freiwillig neben ihrer Bezugsperson, gewöhnliche Wohnung, natürliches Tageslicht, glaubwürdige Hände und Kontaktstellen. Kein erzwungenes Hochheben für ein Kuschelbild.
- **Mensch-Tier-Porträts**: 17 Kandidaten im CSV, u. a. Chihuahua, Dobermann, Deutscher Schäferhund, Perser und Sphynx. Ähnliche Studiowirkung bzw. stark stilisierte Gesichter. Menschen sollen etwas mit ihrem Tier erleben; nicht bloß zusammen in die Kamera lächeln.
- **Wohnzimmer-Serie**: zehn auffällig ähnliche Titelbilder, u. a. American Wirehair, Chausie, Egyptian Mau, German Rex, Japanese Bobtail, LaPerm, Snowshoe, Sokoke, Somali. Gleiches bodentiefes Fenster, Pflanzen und Einrichtung machen verschiedene Rassenporträts austauschbar. Rassenmerkmale vor Austausch anhand seriöser Referenzen prüfen.
- **16 weitere Vogelgrafiken/-motive** zum Neuaufbau bzw. Detailcheck priorisiert. Beispiele: Graupapagei-Futter, Käfig oder Voliere, Giftliste, Lautstärke, Tierarzt, Kinder, Wohnung und Käfiggefahren. Kontaktbögen zeigen kleinteilige, überladene Tafeln. Nicht jede davon ist bereits auf konkrete Textfehler geprüft.
- **Vögel und Kinder**, Detailprüfung: beschädigter Satz „Vögel und keine Kuscheltiere“; sehr kleine Schrift und dekorative Käfigszenen. Neue Grafik auf wenige Regeln reduzieren, die Illustration muss zu diesen Regeln passen.

## P2: Futterbilder als Serie überarbeiten

53 über Dateinamen und Sichtung markierte WebP-Futterbilder. Wiederkehrend: mittiger Hund, glänzender Napf, perfekte Küche, dramatisches Licht, teilweise dekoratives Obst/Gemüse, künstliche Napfbeschriftung. Beispiele: Akita, Beagle, Boxer, Corgi, Dalmatiner, Husky und Golden Retriever. Diese Motive erklären wenig und können eine konkrete vollständige Ration suggerieren.

Ersatz: abwechslungsreiche, einfache Alltagsszenen – Futter abmessen, Napf vorbereiten, entspanntes Tier nach dem Spaziergang. Keine frei erfundene Futterzusammensetzung als Ernährungsempfehlung inszenieren. Ein reines Zutatenbild braucht eine redaktionelle Begründung.

## Was als Vorbild bleiben kann

Die Cocker-Spaniel-Aufnahmen `IMG_8653`, `IMG_5729`, `IMG_2715` zeigen unterschiedliche Situationen und gewöhnliche Umgebung. Sie wirken individuell und weniger inszeniert; Herkunft daraus nicht ableiten. Viele vorhandene Tierporträts, Bewegungsaufnahmen und Begegnungen funktionieren ebenfalls. Maßstab: erkennbare Persönlichkeit und konkrete Situation statt maximaler Perfektion.

Für die Marke bedeutet emotionale Ansprache: „Dieser Mensch versteht meinen Alltag mit Tier.“ Kleine Gesten, gemeinsame Routinen, ein schmutziger Spazierweg, entspanntes Nebeneinander und unterschiedliche Altersgruppen können das besser erzählen als uniforme Kuschelporträts. Nicht jeder Rassenartikel benötigt zusätzlich ein Paarbild; die Verbindung zur Partnersuche muss zum Thema passen.

## Produktionsstandard für den Austausch

1. Pro Artikel eine konkrete Geschichte und ein eigenständiges Motiv festlegen; vorhandene gute Motive bewahren.
2. Codex erstellt die Ersatzbilder. Natürliches Licht, echte Oberflächenwirkung, gewöhnliche Räume, glaubwürdige Körper und Verhalten. Kein Beautyfilter-Look, kein erzwungenes Lächeln, keine Serienkulisse, keine erfundenen Logos. Generierte Szenen bleiben Symbolbilder und dürfen nicht als Mitglieder- oder Erfahrungsfotos ausgegeben werden.
3. Infografiken mit deterministisch gesetzter Typografie erstellen (z. B. SVG/HTML und geprüfter Export als WebP). Bildgenerierung kann Illustrationen liefern; Texte, Werte und Quellen werden separat kontrolliert gesetzt. Keine bestehenden fehlerhaften Grafiken nur hochskalieren.
4. Pro Grafik eine Hauptaussage, wenige Elemente, hohe Kontraste. Bei 360 px Ansichtsbreite testen; eine 1024-px-Grafik verkleinert Schrift auf rund ein Drittel. Lange Inhalte aufteilen. Keine starren Desktoptafeln als mobile Leselösung.
5. Daten aus belastbaren Quellen übernehmen, Quellen direkt zuordnen, zugängliche Text-/Tabellenversion im Artikel behalten. Fachliche Aussagen vor dem Zeichnen prüfen.
6. Detailkontrolle: Hände, Pfoten, Augen, Fell, Leinen, Größenverhältnisse, Tierverhalten, Schrift, Symbolik, Rassenmerkmale und Bildausschnitt. Danach Artikel und Karten mobil sowie am Desktop prüfen.
7. Neue Dateinamen statt Überschreiben aller WP-Varianten. Frontmatter, Inline-Bilder, srcset, Vorschau/OG und REST-Teaser berücksichtigen. Assets über bestehendes staticAsset-Muster. Nachweise zu generierten Symbolbildern wie vorgeschrieben im zugeklappten Quellenblock.

## Umsetzung in sinnvollen Paketen

- Paket 1: drei P0-Grafiken fachlich prüfen und ersetzen; Bengalkatzenmotiv als Stilpilot austauschen.
- Paket 2: übrige Vogelgrafiken und priorisierte Mensch-Tier-Porträts.
- Paket 3: Wohnzimmer-Serie und Futterserie artikelweise, beginnend mit den laut Analytics meistgesehenen Seiten. Traffic-Rangfolge ist hier noch nicht erhoben.
- Erfolg zunächst über Fehlerfreiheit, mobile Lesbarkeit und redaktionelle Bildqualität prüfen. Einen Conversiongewinn ohne Messung nicht versprechen.

Quellen: eigene Sichtprüfung der referenzierten Dateien; öffentliche Seiten https://tierisch-verliebt.de/magazin/ und https://tierisch-verliebt.de/magazin/voegel-als-haustiere/; Vercel-Prüfhost https://tierisch-verliebt.vercel.app/magazin/. CSV verlinkt alle geprüften Asset-Kandidaten und ihre Artikelzuordnung.
