# Katzenrassen: FAQ-Pilot am 3. November 2026

Auftrag: https://trello.com/c/7Mm4qtKF/941-katzenrassen-faq. Christian hat den vorgeschlagenen Pilot für Maine Coon, Britisch Kurzhaar und Bengal freigegeben. Ziel sind zusätzliche Entscheidungshilfen statt einer Wiederholung des Steckbriefs oder Haupttexts.

## Umsetzung

Je drei individuelle Fragen in den bestehenden DE-Porträts, mit direkten Antworten, Handlungsschritten und unmittelbar zugeordneten Quellen:

- Maine Coon: nutzbare Größe/Stabilität der Ausstattung, Grenzen von HCM-Gentests und Herzultraschall, Vorgehen bei verschluckten Wollfäden.
- Britisch Kurzhaar: freiwilliger Körperkontakt statt erzwungenem Hochheben, Körperzustand statt Rasse-Gewichtsspanne, neu auftretender Rückzug statt Zuschreibung zum Charakter.
- Bengal: Beschäftigungsqualität statt fester Stundenvorgabe, Futtersuchspiele aus der Tagesration, Grenzen des Versprechens „hypoallergen“.

Alte FAQ einschließlich unbelegter Flächen-, Zeit- und Preisangaben ersetzt. Gezielt problematische Haupttextstellen korrigiert: Bengal/Wildkatzenart, Freigang als vermeintliche Pflicht, Rohfleisch als angeblich beste Ernährung; Maine-Coon-Fütterung und Spielzeugrisiken; BKH-Farbcharakter und pauschale Verträglichkeitsversprechen. Keine vollständige fachliche Revision sämtlicher historischer Haupttextaussagen. Bilder und URLs erhalten. Keine neuen Artikel und keine grundlegende visuelle Neugestaltung.

Die bestehenden niederländischen Fassungen `maine-coon`, `brits-korthaar` und `bengaal` haben dieselben Änderungen erhalten. Der bestehende NL-Vertrag prüft die Übereinstimmung von Aktualisierungsdatum, HTML-Struktur und Medien mit der DE-Vorlage. FAQ-Akkordeon und FAQPage werden aus demselben Inhalt erzeugt; Quellen am Ende bleiben geschlossen und 13 px groß.

## Quellen

Direkte Links stehen an den Aussagen und gesammelt im Quellenblock. Fachliche Grundlagen: AAFP/ISFM Environmental Needs Guidelines; Langford Vets HCM-Gentest und Veterinary Cardiovascular Society Herzscreening; VCA Fremdkörper; Cats Protection Umgang, Schmerzzeichen und Spielen; PDSA Body Condition Score; TICA Bengal; Cornell Katzenfütterung; ACAAI Tierallergien. Allgemeine Katzenempfehlungen werden nicht als exklusive Rassemerkmale dargestellt.

## Indexierung und Grenzen

Alle drei DE-Frontmatter enthalten bereits vor dem Pilot `noindex: true` aus dem AIOSEO-Import (siehe README und `lib/magazine.ts`). Der Pilot hebt diese Sperre nicht stillschweigend auf. Google-KI-Suchfunktionen setzen eine indexierte, für Snippets geeignete Seite voraus: https://developers.google.com/search/docs/appearance/ai-features. Die FAQ sind damit inhaltlich als Quelle besser nutzbar, aber derzeit kein abgeschlossener Google-Sichtbarkeitsauftrag. Für eine Freigabe der Indexierung zuerst die gesamten Porträts fachlich prüfen, einschließlich verbleibender historischer Zahlen, Gesundheits-, Ernährungs- und Kaufangaben sowie der Themenüberschneidungen mit eigenen Ratgeberseiten und katzenrassen.com.

## Prüfung

- DE: Browser bei 1440 und 390 px, jeweils HTTP 200, drei FAQ, Akkordeon öffnet, kein horizontaler Überlauf, geschlossener Quellenblock mit 13 px, drei Fragen im FAQPage-JSON-LD.
- Produktionsbuild und ESLint geprüft; bestehende Warnungen separat im Abschlussstatus nennen.
- NL: zusätzlich alle drei Fassungen bei 390 px geprüft, drei übersetzte FAQ, geschlossene niederländische Quellenbeschriftung und kein horizontaler Überlauf.
- Vollständiger isolierter Testlauf nach Synchronisierung der NL-Fassungen: 209/209 erfolgreich. Dafür HEAD `1d57212` als temporären Prüfstand exportiert und ausschließlich die sechs geänderten Textdateien darübergelegt. Im gemeinsamen Checkout waren parallel fremde Änderungen an Community-Dating, Audio und Vogelbildern aktiv; dessen zwischenzeitliche Testfehler gehören nicht zu diesem Pilot.
- Lokale Produktionsprüfung lädt die zum Build gehörenden CSS-/JS-Dateien über Playwright-Routing vom lokalen Server, da die App im Produktionsmodus den festen Vercel-Assethost verwendet. Keine Änderung dieses Assetmusters.
