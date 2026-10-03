# tierisch-verliebt.nl: niederländischer Pilot

Die Vorschau liegt unter `/nl/` auf dem bestehenden Vercel-Projekt. Öffentliche URLs, Canonicals, Open Graph und JSON-LD sind für `https://tierisch-verliebt.nl` vorbereitet. Die Domain wurde mit dieser Änderung weder registriert noch aufgeschaltet.

## Umfang

- Start und Partnersuche mit Niederlande-Karte, 15 Stadtpins, Stadt-/Provinzfilter und Nachbarentfernungen.
- Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven, Groningen, Tilburg, Almere, Breda, Nijmegen, Arnhem, Haarlem, Maastricht, Leiden und Zwolle.
- Magazin, Hunde- und Katzenrassenübersicht sowie zehn vollständige übersetzte Rasseporträts.
- 266 Originalabsätze, sämtliche Bilder, Bildvarianten, Videos, Überschriften, Tabellen und ursprüngliche Autor-/Datumsfelder der Rasseporträts erhalten.
- Stadttexte nennen niederländische Orte und verlinken amtliche Informationen zu aktuellen Hunderegeln. Gemeindeseiten sind keine Fotobildnachweise; die verwendete Aufnahme stammt aus den bestehenden Markenassets.

## Plattform und Indexierung

Eine NL-ICONY-Plattform-ID ist im Projekt nicht bekannt. Es werden deshalb keine Aktivitäten oder Profile unter einer erfundenen ID angefragt. Der entsprechende Stadtbereich erklärt, dass Mitgliederprofile bei der Lancierung folgen. Registrierung, Login und Rechtliches verlinken absolut auf die künftige Landesdomain; sie sind noch keine nutzbare niederländische Plattform.

Alle Pilotseiten haben `noindex, follow`. Die NL-robots sperrt die Indexierung; die NL-Sitemap enthält vor der Freischaltung keine indexierbaren URLs. DE/AT/CH behalten ihre bisherige Indexierung. Der Pilot wird nicht in die deutsche Seitensuche aufgenommen.

Für den späteren Start: Domain und ICONY-Landesplattform einrichten, echte Plattform-ID und Suchparameter prüfen, die Plattformaktionen testen und dann die Pilotkennzeichnung samt Indexierung/Sitemap bewusst umstellen.

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
