# Codex-Auftrag: Titelfoto mit Logo und Infografik für den Gastartikel auf petnews.de

Stand: 2026-11-11 (Claude Code). Trello-Karte: Board „Christian Aufgaben“, Liste „in Bearbeitung“, Karte „Codex: Titelfoto mit Logo + Infografik Gastartikel petnews.de (tierisch-verliebt)“.

## Ziel

Christian bucht bei Patric Herweh (Seonetz, tekweb.de) einen Gastartikel auf petnews.de (80 € laut Seonetz-Liste). Der Artikel stellt tierisch-verliebt als Singlebörse für Tierfreunde vor und verlinkt auf tierisch-verliebt.de, .at und .ch. Text und HTML liegen fertig vor:

- `docs/gastartikel-petnews/petnews-tierisch-verliebt.md`
- `docs/gastartikel-petnews/petnews-tierisch-verliebt.html` (Leseansicht, bindet beide Bilder relativ ein)

Es fehlen das Titelfoto und die Infografik. Beide Bilder gehen zusammen mit dem HTML an Herweh. Sie werden **nicht** auf tierisch-verliebt.de eingebaut.

## Datei 1: Titelfoto mit Logo

- Zielpfad: `docs/gastartikel-petnews/petnews-tierisch-verliebt-titel.jpg`
- Format: JPG, sRGB, **1600 × 900 px** (16:9), höchstens 350 KB
- Motiv: **echtes Foto**, kein KI-generiertes Tierfoto (Regel vom 04.11.2026 in `agent-skills/rules/common.md`). Eine frei nutzbare Aufnahme, etwa von Unsplash oder Pexels mit Lizenz für kommerzielle Nutzung, zeigt ein Paar oder zwei Menschen um 30 bis 50 mit einem Hund draußen. Mögliche Szenen sind eine Wiese, ein Parkweg oder eine Bank. Die Stimmung ist warm und natürlich, der Tierkontakt freiwillig, der Hund angeleint oder ruhig. Bitte keine gestellte Werbeoptik, keine erkennbaren Prominenten und keine fremden Logos oder Schriftzüge.
- **Logo:** Christian möchte das Logo ausdrücklich im Foto haben. Das ist eine Ausnahme vom Bildstandard, weil das Foto auf einer fremden Seite erscheint. Verwende `public/brand/tierisch-verliebt-logo-de.svg` oder bei dunklem Hintergrund `tierisch-verliebt-logo-light-de.svg`. Es kommt unten rechts hin, etwa 22 bis 26 % der Bildbreite, mit mindestens 40 px Rand. Auf unruhigem Hintergrund bekommt es ein dezentes, halbtransparentes weißes Feld mit abgerundeten Ecken. Die Originalkomposition mit dem Herz bzw. der Pfote bleibt erhalten, der Claim „Hier verlieben sich tierliebe Singles“ fehlt. Das Logo darf weder Gesichter noch den Hund verdecken.
- Alt-Text, schon im HTML: „Ein Paar sitzt lachend mit seinem Hund auf einer Wiese, unten rechts das Logo von tierisch-verliebt.de.“ Weicht das Motiv ab, passe ihn in `.md` und `.html` an.
- Bildnachweis mit Fotograf, Plattform, Lizenz und URL in `docs/gastartikel-petnews/bildnachweis.md` festhalten.

## Datei 2: Infografik

- Zielpfad: `docs/gastartikel-petnews/petnews-tierisch-verliebt-infografik.webp`
- Format: WebP, **1200 px breit** (Höhe frei, etwa 1200 × 1350), mobil lesbar, deutsche Beschriftung, höchstens 300 KB
- Stelle im Artikel: nach dem Abschnitt „Was hinter tierisch-verliebt steckt“, vor „So läuft das Kennenlernen ab“. Die Einbindung ist im Markdown und HTML schon gesetzt.
- Inhalt in zwei Teilen, visuell erklärt und nicht als Textkasten-Sammlung (`docs/bildstandard.md`):
  1. **Drei Länder, eine Idee:** eine stilisierte Karte von Deutschland, Österreich und der Schweiz mit je einem Pin und der Domain tierisch-verliebt.de, tierisch-verliebt.at und tierisch-verliebt.ch. Weitere Zahlen kommen nicht hinein.
  2. **Vom Profil zum Spaziergang:** ein Ablauf in vier Schritten mit kleinen Illustrationen.
     1. Kostenlos anmelden
     2. Profil mit Tier, also Foto oder Satz über Hund, Katze oder Pferd
     3. Umkreissuche, Singles in der Nähe
     4. Erstes Treffen, zum Beispiel beim Gassigehen
  - Optional ist eine kleine Zeitleiste mit „um 2008: erste Singlebörse unter diesem Namen“ und „2018: Neustart mit Icony“. Diese Angaben stammen aus `content/magazin/ueber-uns.md`, die Zeitleiste ist aber nicht nötig.
- **Keine Mitgliederzahlen, Erfolgsquoten, Sterne oder Prozentangaben.** Sie sind nicht belegt.
- Die Markenfarben Rot `#c02e2e` und Grün `#429a45`, Dunkelgrau `#333333` und die Flächen `#faeaea` und `#e5f0e5` sollen erkennbar sein. Tiere behalten ihre natürlichen Farben.
- Das Logo kommt dezent in die Fußzeile, ohne Claim und mit Abstand zum übrigen Inhalt.
- Alt-Text, schon gesetzt: „Die drei Länderseiten von tierisch-verliebt auf einen Blick und der Weg von der Anmeldung bis zum ersten gemeinsamen Spaziergang mit Tier.“

## Abschluss

- Beide Bilder visuell prüfen: Hundeanatomie, Leine, Hände, Logo-Darstellung und Lesbarkeit bei 390 px Breite.
- `petnews-tierisch-verliebt.html` im Browser öffnen und kontrollieren, dass beide Bilder erscheinen.
- Ein ZIP `docs/gastartikel-petnews/petnews-gastartikel.zip` mit HTML, Markdown, beiden Bildern und dem Bildnachweis bauen.
- Commit als `Christian M. Haas <christian@datingnischen.de>`. Vorher `git var GIT_AUTHOR_IDENT` und `git var GIT_COMMITTER_IDENT` prüfen. Nur `docs/gastartikel-petnews/` und diesen Auftrag stagen, weil parallele Sessions im Repo arbeiten. Danach auf `main` pushen.
- Ergebnis als Kommentar in die Trello-Karte schreiben. **Nicht an Herweh senden.** Den Versand gibt Christian frei.
