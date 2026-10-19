# tierisch-verliebt.ch/it/: italienischer Pilot für das Tessin

Test, ob sich italienischsprachige Schweizer über eine eigene Sprachvariante gewinnen lassen. Die Variante gehört zur Schweizer Seite und nutzt dieselbe ICONY-Plattform (`tierischverliebtch`) und dieselben Mitglieder. ICONY bleibt bewusst bei der Schweiz und öffnet nicht für Italien.

## Umfang

- Startseite `/it/` mit Städteübersicht, drei Ratgeberabschnitten und FAQ (FAQPage-JSON-LD).
- Fünf Stadtseiten: `/it/lugano/`, `/it/bellinzona/`, `/it/locarno/`, `/it/mendrisio/`, `/it/chiasso/`, jeweils mit ICONY-Profilvorschau über die Tessiner Postleitzahl (6900, 6500, 6600, 6850, 6830) und Italienisch beschrifteten Widget-Texten.
- Inhalte in `data/it-partnersuche.json`. Ortsangaben nur mit Beleg: Regolamento cantonale sui cani (RCani, 30.12.2025), Hundeverordnung Lugano und Dog Park Pregassona, Hundeparcours am Ticino in Bellinzona (Molinazzo–Pratocarasso, ca. 900 m, seit 2017), Leinenpflicht und Freilauffläche am Maggia-Damm in Locarno (Hinweis der Stadt vom 3.2.2026), Hundeverordnung Mendrisio, Urin-Regel in Chiasso seit August 2026 (RSI).
- Noch keine eigenen Stadtbilder. Das Bild der Schweizer Partnersuche enthält deutschen Text und wird deshalb nicht verwendet. Motive wären eine Aufgabe für Codex.

## Technik

- Marktcode `it` in `lib/markets.ts` mit Domain `tierisch-verliebt.ch` und `basePath: "/it"`. Der Host wird nie als `it` erkannt, nur der Pfad `/it/` unter `ch`.
- Vorschau: `https://tierisch-verliebt.vercel.app/ch/it/…`. Live erwartet die App von nginx `/ch/it/…` (wie bei den übrigen `.ch`-Pfaden).
- Seiten: `app/market-it/[[...path]]/page.tsx`, Komponenten in `components/it/`.
- Registrierung, Login und Suche: `IT_PLATFORM` in `lib/it-routes.ts`. Diese Adressen zeigen vorerst auf die deutschsprachige Schweizer Plattform und werden umgestellt, sobald ICONY die italienische Oberfläche liefert.

## Vor dem Start

1. ICONY liefert die italienische Oberfläche; `IT_PLATFORM` auf die italienischen Adressen umstellen.
2. nginx für `tierisch-verliebt.ch/it/` auf Vercel (`/ch/it/`) durchreichen, Host als `X-Forwarded-Host` mitgeben (sonst landen Schrägstrich-Umleitungen relativ).
3. `IT_PILOT_INDEXABLE` auf `true` setzen: Dann sind die Seiten indexierbar und stehen in der Schweizer Sitemap. Zusätzlich hreflang auf der deutschen CH-Startseite ergänzen.
4. Google-Ads-Test mit Geo-Targeting Tessin und Sprache Italienisch, Messung der Registrierungen über AID `location`.
