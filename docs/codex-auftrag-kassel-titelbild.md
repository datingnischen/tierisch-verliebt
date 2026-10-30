# Codex-Auftrag: Titelbild Stadtseite Kassel

Stand: 2026-10-30 (Claude Code). Trello-Karte: siehe Board „Christian Aufgaben“, Liste „in Bearbeitung“, Karte „Codex: Titelbild Kassel für tierisch-verliebt.de“.

## Ziel
Die neue Stadtseite https://tierisch-verliebt.de/partnersuche/kassel/ (Commit `c52bf0e`) hat noch kein Titelbild. Es erscheint im Seitenkopf, auf der Städteübersicht `/partnersuche/` und als Vorschaubild bei den Nachbarstädten.

## Datei
- Repo `datingnischen/tierisch-verliebt`, Branch `main`
- Zielpfad: `public/cities/de/kassel.jpg`
- Format: JPG, sRGB, **1000 × 563 px** (wie die übrigen Stadtbilder, z. B. `public/cities/de/bielefeld.jpg`), höchstens 200 KB

## Motiv
- Fotorealistisch, warmes Tageslicht, Herbst oder Frühsommer.
- Eine Person mit **angeleintem** Hund auf einem breiten Parkweg in Kassel, im Hintergrund erkennbar Kassel: die Orangerie in der Karlsaue oder der Bergpark Wilhelmshöhe mit dem Herkules.
- Hund an der Leine ist Pflicht: In Fuldaaue, Bergpark und Karlsaue gilt Leinenpflicht; Hunde nicht im Wasser oder am Ufer zeigen (Fuldaauen-Ordnung).
- Keine Logos, Markenzeichen, Schriftzüge oder Vereinswappen (auch kein Huskies-Logo), keine erkennbaren realen Personen.
- Farbstimmung passend zur Seite (Rot `#c02e2e`, Creme `#fbf6ef`), aber natürliches Foto, kein Farbfilter.

## Einbau
In `data/partnersuche-eigene-staedte.json` beim Kassel-Eintrag `"imageUrl": null` durch `"imageUrl": "/cities/de/kassel.jpg"` ersetzen. Den Alt-Text (`imageAlt`) an das tatsächliche Motiv anpassen, falls es nicht „Hund und Mensch beim Spaziergang …“ zeigt.

## Prüfen
- `npm test` (prüft u. a., dass die Datei existiert, sobald `imageUrl` gesetzt ist), `npm run lint`, `npm run build`
- Commit als `Christian M. Haas <christian@datingnischen.de>` (vorher `git var GIT_AUTHOR_IDENT` / `GIT_COMMITTER_IDENT`), nur eigene Pfade stagen, nach `main` pushen
- Prüf-URL: https://tierisch-verliebt.vercel.app/partnersuche/kassel/ (Bild im Kopf) und https://tierisch-verliebt.vercel.app/partnersuche/ (Kachel Kassel)
- Ergebnis als Kommentar in die Trello-Karte
