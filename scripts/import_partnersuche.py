"""Importiert die ICONY-Stadtseiten „Partnersuche in <Stadt>“ nach data/partnersuche-markets.json.

Quelle sind die Live-Seiten der drei Märkte:
  https://tierisch-verliebt.de/partnersuche/<slug>/  (de)
  https://tierisch-verliebt.at/partnersuche/<slug>/  (at)
  https://tierisch-verliebt.ch/partnersuche/<slug>/  (ch)

Die Städteliste und ihre Reihenfolge kommen aus der Linkliste der jeweiligen Übersicht
/partnersuche/. Texte werden unverändert übernommen; der Artikeltext (div.text-content) wird nur
normalisiert: Entities aufgelöst, Attribute alphabetisch sortiert, data-media-id entfernt,
Void-Elemente als <img …/>. Links im Text bleiben absolut auf der Live-Domain – das Umschreiben
auf eigene Routen passiert beim Rendern. Registrierung und Suche bleiben ICONY-Seiten und tragen
AID=location.

Nur Python-Standardbibliothek.

Aufruf:
  python scripts/import_partnersuche.py                     # schreibt data/partnersuche-markets.json
  python scripts/import_partnersuche.py --out /tmp/x.json   # zum Vergleichen
  python scripts/import_partnersuche.py --market at         # nur einen Markt neu holen
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "data" / "partnersuche-markets.json"
UA = {"User-Agent": "Mozilla/5.0 (tierisch-verliebt partnersuche import)"}
AID = "location"

MARKETS: dict[str, str] = {
    "de": "https://tierisch-verliebt.de",
    "at": "https://tierisch-verliebt.at",
    "ch": "https://tierisch-verliebt.ch",
}

# Editor-Attribut des ICONY-CMS; andere Attribute bleiben unverändert erhalten
DROPPED_ATTRS = {"data-media-id"}

# Das Widget auf der ICONY-Seite nennt teils den amtlichen Ortsnamen; angezeigt wird der
# gebräuchliche Name
CITY_NAME_OVERRIDES: dict[tuple[str, str], str] = {
    ("at", "klagenfurt"): "Klagenfurt",
    ("ch", "genf"): "Genf",
    ("ch", "biel"): "Biel",
}

VOID_ELEMENTS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr",
}


def fetch(url: str) -> str:
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def text(value: str) -> str:
    """Tags entfernen, Entities auflösen, Leerraum zusammenziehen."""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def block(page: str, marker: str) -> str:
    """Inhalt des ersten <div>, dessen Tag marker enthält (verschachtelte divs mitgezählt)."""
    start = page.find(marker)
    if start < 0:
        return ""
    start = page.find(">", start) + 1
    depth = 1
    for match in re.finditer(r"<(/?)div\b[^>]*>", page[start:]):
        depth += -1 if match.group(1) else 1
        if depth == 0:
            return page[start:start + match.start()]
    return page[start:]


# --- HTML-Normalisierung --------------------------------------------------------------------
# Die committeten Daten stammen aus einem BeautifulSoup-Export (Formatter „minimal“). Dieser
# Serializer bildet dessen Ausgabe mit der Standardbibliothek nach, damit ein Re-Import
# byte-gleich bleibt, solange sich upstream nichts ändert.


def _escape_text(value: str) -> str:
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _format_attr(name: str, value: str | None) -> str:
    value = "" if value is None else value
    if name == "class":
        value = " ".join(value.split())
    value = _escape_text(value)
    if '"' in value:
        if "'" in value:
            return f'{name}="{value.replace(chr(34), "&quot;")}"'
        return f"{name}='{value}'"
    return f'{name}="{value}"'


class _Normalizer(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []

    def _tag(self, tag: str, attrs: list[tuple[str, str | None]], close: bool) -> str:
        kept = sorted((k, v) for k, v in attrs if k not in DROPPED_ATTRS)
        parts = [tag] + [_format_attr(k, v) for k, v in kept]
        return "<" + " ".join(parts) + ("/>" if close else ">")

    def handle_starttag(self, tag, attrs):
        self.out.append(self._tag(tag, attrs, tag in VOID_ELEMENTS))

    def handle_startendtag(self, tag, attrs):
        self.out.append(self._tag(tag, attrs, True))
        if tag not in VOID_ELEMENTS:
            self.out.append(f"</{tag}>")

    def handle_endtag(self, tag):
        if tag not in VOID_ELEMENTS:
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        self.out.append(_escape_text(data))

    def handle_comment(self, data):
        self.out.append(f"<!--{data}-->")


def normalize_html(fragment: str) -> str:
    parser = _Normalizer()
    parser.feed(fragment)
    parser.close()
    return "".join(parser.out).strip()


# --- Import -------------------------------------------------------------------------------


def first_image(content: str) -> tuple[str | None, str | None]:
    tag = re.search(r"<img\b[^>]*>", content)
    if not tag:
        return None, None
    src = re.search(r'\ssrc="([^"]*)"', tag.group(0))
    alt = re.search(r'\salt="([^"]*)"', tag.group(0))
    return (html.unescape(src.group(1)).strip() if src else None), (html.unescape(alt.group(1)).strip() if alt else None)


def overview_slugs(market: str) -> tuple[dict, list[str]]:
    base = MARKETS[market]
    page = fetch(f"{base}/partnersuche/")
    domain = re.escape(base)
    slugs: list[str] = []
    for slug in re.findall(rf'<li><a href="{domain}/partnersuche/([a-z0-9-]+)/">', page):
        if slug not in slugs:
            slugs.append(slug)
    if not slugs:
        raise SystemExit(f"{market}: keine Städte in der Übersicht {base}/partnersuche/ gefunden")
    meta = {
        "market": market,
        "title": text(re.search(r"<title>(.*?)</title>", page, re.S).group(1)),
        "description": text(re.search(r'<meta name="description" content="([^"]*)"', page).group(1)),
    }
    return meta, slugs


def import_city(market: str, slug: str) -> dict:
    base = MARKETS[market]
    source_url = f"{base}/partnersuche/{slug}/"
    page = fetch(source_url)

    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S)
    title = text(h1.group(1)) if h1 else text(re.search(r"<title>(.*?)</title>", page, re.S).group(1))
    description = text(re.search(r'<meta name="description" content="([^"]*)"', page).group(1))
    city = re.search(r"Finde kostenlos Singles in (.*?) und Umgebung", page)
    if not city:
        raise SystemExit(f"{source_url}: Stadtname („Finde kostenlos Singles in …“) nicht gefunden")

    frame = re.search(r'<iframe src="(https://js\.icony\.com/frame/[^"]+)"', page)
    if not frame:
        raise SystemExit(f"{source_url}: ICONY-Profil-Widget (iframe) nicht gefunden")
    frame_url = html.unescape(frame.group(1))
    platform_id = re.search(r"[?&]id=([^&]+)", frame_url)
    zip_code = re.search(r"[?&]z=(\d+)", frame_url)
    country = re.search(r"[?&]ctr=(\d+)", frame_url)

    content = normalize_html(block(page, '<div class="text-content'))
    image_url, image_alt = first_image(content)

    return {
        "market": market,
        "slug": slug,
        "path": f"/partnersuche/{slug}",
        "sourceUrl": source_url,
        "title": title,
        "description": description,
        "cityName": CITY_NAME_OVERRIDES.get((market, slug), text(city.group(1))),
        "lead": description,
        "imageUrl": image_url,
        # Bilder ohne alt-Text bekommen die Seitenüberschrift
        "imageAlt": image_alt or (title if image_url else None),
        "contentHtml": content,
        "sourceAttributionUrl": None,
        "registrationUrl": f"{base}/registration/?AID={AID}",
        "searchUrl": f"{base}/suche/?AID={AID}",
        "icony": {
            "platformId": platform_id.group(1) if platform_id else "",
            "zip": zip_code.group(1) if zip_code else "",
            "country": int(country.group(1)) if country else 0,
            "frameUrl": frame_url,
        },
    }


def import_market(market: str) -> dict:
    meta, slugs = overview_slugs(market)
    pages = []
    for slug in slugs:
        print(f"  {market}/{slug}", file=sys.stderr)
        pages.append(import_city(market, slug))
    return {**meta, "pages": pages}


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="Zieldatei (Standard: %(default)s)")
    parser.add_argument("--market", choices=sorted(MARKETS), action="append",
                        help="nur diese(n) Markt/Märkte neu importieren, übrige aus --out übernehmen")
    args = parser.parse_args(argv)

    markets = args.market or list(MARKETS)
    data: dict = {}
    if args.market and args.out.exists():
        data = json.loads(args.out.read_text(encoding="utf-8"))
    for market in markets:
        data[market] = import_market(market)
    data = {market: data[market] for market in MARKETS if market in data}

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    counts = ", ".join(f"{m}: {len(data[m]['pages'])}" for m in data)
    print(f"Stadtseiten ({counts}) -> {args.out}")


if __name__ == "__main__":
    main()
