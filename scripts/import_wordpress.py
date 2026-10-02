"""Einmal-Import: WordPress-Magazin (tierisch-verliebt.de/magazin) -> Dateien im Repo.

Quelle: .wp-cache/{posts,pages,categories,users,media}.json (REST-Dump vom Plesk-VPS,
siehe /root/migration-backups/tierisch-verliebt.de/rest) und .wp-cache/uploads/ (Medien-Dump).
Ziel:
  content/magazin/<slug>.md            Frontmatter + Inhalt (HTML wie in WordPress)
  data/magazin/kategorien.json         Kategorien
  data/magazin/autoren.json            Autoren
  data/magazin/slugs.json              Slug-Inventar (Vergleich vorher/nachher)
  public/magazin/wp-content/uploads/   alle im Inhalt/als Beitragsbild genutzten Dateien

Nach redaktionellen Korrekturen im Repo NICHT erneut laufen lassen (ueberschreibt Dateien).
Aufruf: PYTHONIOENCODING=utf-8 python scripts/import_wordpress.py
"""
import html
import unicodedata
from urllib.parse import unquote
import json
import os
import re
import shutil
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".wp-cache")
CONTENT = os.path.join(ROOT, "content", "magazin")
DATA = os.path.join(ROOT, "data", "magazin")
PUBLIC_UPLOADS = os.path.join(ROOT, "public", "magazin", "wp-content", "uploads")

SITE = "https://tierisch-verliebt.de"
UPLOAD_ABS = SITE + "/magazin/wp-content/uploads/"
UPLOAD_REL = "/magazin/wp-content/uploads/"

# Platzhalter-Autoren (Redaktion = 1, Tierliebe = 2) werden Christian M. Haas (WP-Autor 3).
AUTHOR_MAP = {1: 3, 2: 3, 3: 3}

# Textkorrekturen (alt -> neu); Standard: keine. Jede Korrektur im Abschlussbericht auflisten.
TEXT_KORREKTUR: list[tuple[str, str]] = []

# AIOSEO haengt " | tierisch-verliebt.de" an; die App ergaenzt das ueber das Titel-Template.


TRANSLIT = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "Ä": "Ae", "Ö": "Oe", "Ü": "Ue", "ß": "ss"})


def safe_rel(rel):
    """Nicht-ASCII-Dateinamen werden umbenannt (ae/oe/ue/ss), damit Vercel und Browser sie sicher ausliefern."""
    plain = unquote(rel).translate(TRANSLIT)
    plain = unicodedata.normalize("NFKD", plain).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^A-Za-z0-9._/-]", "-", plain)


def rename_uploads(text):
    def repl(match):
        return UPLOAD_REL + safe_rel(match.group(1))

    return re.sub(r"/magazin/wp-content/uploads/([^\"'\s<>,)?]+)", repl, text)


def load(name):
    with open(os.path.join(CACHE, name + ".json"), encoding="utf-8") as f:
        return json.load(f)


def q(value):
    """JSON-String ist gueltiges YAML (doppelte Anfuehrungszeichen)."""
    return json.dumps(value, ensure_ascii=False)


def unescape(text):
    return html.unescape(text or "").strip()


def clean_filename_alt(src):
    base = os.path.splitext(os.path.basename(src.split("?")[0]))[0]
    base = re.sub(r"-\d+x\d+$", "", base)
    base = re.sub(r"[-_.]+", " ", base).strip()
    return base


def main():
    posts = load("posts")
    pages = load("pages")
    cats = load("categories")
    users = load("users")
    media = {m["id"]: m for m in load("media")}
    media_by_base = {}
    for m in media.values():
        media_by_base[os.path.basename(m["source_url"])] = m

    cat_by_id = {c["id"]: c for c in cats}
    entries = [(p, "post") for p in posts] + [(g, "page") for g in pages]
    slugs = [e["slug"] for e, _ in entries]
    assert len(slugs) == len(set(slugs)), "doppelte Slugs"

    os.makedirs(CONTENT, exist_ok=True)
    os.makedirs(DATA, exist_ok=True)
    for old in os.listdir(CONTENT):
        if old.endswith(".md"):
            os.remove(os.path.join(CONTENT, old))

    needed_uploads = set()
    stats = Counter()
    post_cat_counts = Counter()

    def collect_uploads(text):
        for m in re.finditer(r"/magazin/wp-content/uploads/([^\"'\s<>,?)]+)", text):
            needed_uploads.add(m.group(1))

    for item, typ in entries:
        slug = item["slug"]
        title = unescape(item["title"]["rendered"])
        body = item["content"]["rendered"]
        # NextGEN-Galerien rendert die REST-API nur als Platzhalter-Text; <!--more--> ist ein WP-Rest.
        body = re.sub(r"ngg_shortcode_\d+_placeholder", "", body)
        body = body.replace("<!--more-->", "")
        body = body.replace(UPLOAD_ABS, UPLOAD_REL)
        body = re.sub(r"http://(?:www\.)?tierisch-verliebt\.de/magazin/wp-content/uploads/", UPLOAD_REL, body)
        for old, new in TEXT_KORREKTUR:
            body = body.replace(old, new)

        def fix_img(match):
            tag = match.group(0)
            alt = re.search(r"\salt=([\"'])(.*?)\1", tag, re.S)
            if alt and alt.group(2).strip():
                return tag
            src = re.search(r"\ssrc=[\"']([^\"']+)", tag)
            cls = re.search(r"wp-image-(\d+)", tag)
            text = ""
            m = media.get(int(cls.group(1))) if cls else None
            if not m and src:
                m = media_by_base.get(os.path.basename(src.group(1)))
                if not m:
                    m = media_by_base.get(re.sub(r"-\d+x\d+(\.\w+)$", r"\1", os.path.basename(src.group(1))))
            if m:
                text = unescape(m.get("alt_text")) or unescape(m["title"]["rendered"])
                text = text if text and not re.fullmatch(r"[\w.-]*\d[\w.-]*", text) else ""
            if not text and src:
                text = clean_filename_alt(src.group(1))
            if not text or len(text) < 3:
                text = title
            stats["alt_ergaenzt"] += 1
            safe = html.escape(text, quote=True)
            if alt:
                return tag.replace(alt.group(0), f' alt="{safe}"')
            return re.sub(r"<img\b", f'<img alt="{safe}"', tag, count=1)

        body = re.sub(r"<img\b[^>]*>", fix_img, body)
        collect_uploads(body)
        body = rename_uploads(body)

        head = item.get("aioseo_head_json") or {}
        seo_title = unescape(head.get("title"))
        seo_title = re.sub(r"\s*\|\s*tierisch-verliebt\.de$", "", seo_title).strip()
        if seo_title in ("", "tierisch-verliebt.de"):
            seo_title = ""
        description = unescape(head.get("description"))
        if description == "tierisch-verliebt.de":
            description = ""
        robots = head.get("robots") or ""
        noindex = "noindex" in robots

        image = ""
        image_alt = ""
        fm = item.get("featured_media")
        if fm and fm in media:
            m = media[fm]
            image = m["source_url"].replace(UPLOAD_ABS, UPLOAD_REL)
            collect_uploads(image)
            image = rename_uploads(image)
            image_alt = unescape(m.get("alt_text")) or title

        author_id = AUTHOR_MAP.get(item["author"], item["author"])
        author_slug = next(u["slug"] for u in users if u["id"] == author_id)
        cat_slugs = [cat_by_id[c]["slug"] for c in item.get("categories", []) if c in cat_by_id]
        if typ == "post":
            for s in cat_slugs:
                post_cat_counts[s] += 1

        lines = ["---"]
        lines.append(f"title: {q(title)}")
        lines.append(f"slug: {q(slug)}")
        lines.append(f"type: {typ}")
        lines.append(f"wpId: {item['id']}")
        lines.append(f"published: {q(item['date'])}")
        lines.append(f"updated: {q(item['modified'])}")
        lines.append(f"author: {q(author_slug)}")
        lines.append(f"categories: {json.dumps(cat_slugs)}")
        if image:
            lines.append(f"image: {q(image)}")
            lines.append(f"imageAlt: {q(image_alt)}")
        if seo_title:
            lines.append(f"seoTitle: {q(seo_title)}")
        if description:
            lines.append(f"description: {q(description)}")
        if noindex:
            lines.append("noindex: true")
        lines.append(f"excerpt: {q(item['excerpt']['rendered'].strip())}")
        lines.append("---")
        fname = re.sub(r"[^a-z0-9._-]", "-", slug.lower()) + ".md"
        with open(os.path.join(CONTENT, fname), "w", encoding="utf-8", newline="\n") as f:
            f.write("\n".join(lines) + "\n\n" + body.strip() + "\n")
        stats[typ] += 1
        if noindex:
            stats["noindex"] += 1

    # Kategorien
    cat_out = []
    for c in sorted(cats, key=lambda c: -post_cat_counts[c["slug"]]):
        head = c.get("aioseo_head_json") or {}
        cat_out.append(
            {
                "id": c["id"],
                "name": unescape(c["name"]),
                "slug": c["slug"],
                "description": unescape(c["description"]),
                "noindex": "noindex" in (head.get("robots") or ""),
                "wpCount": c["count"],
            }
        )
        assert post_cat_counts[c["slug"]] == c["count"], (c["slug"], post_cat_counts[c["slug"]], c["count"])
    with open(os.path.join(DATA, "kategorien.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(cat_out, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # Autoren (nur die tatsaechlich verwendeten; Redaktion/Tierliebe -> Christian M. Haas)
    used = {AUTHOR_MAP.get(e["author"], e["author"]) for e, _ in entries}
    authors = [
        {"id": u["id"], "name": unescape(u["name"]), "slug": u["slug"], "url": u.get("url") or ""}
        for u in users
        if u["id"] in used
    ]
    with open(os.path.join(DATA, "autoren.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(authors, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # Slug-Inventar fuer den Vorher/Nachher-Vergleich
    inv = {"posts": sorted(p["slug"] for p in posts), "pages": sorted(g["slug"] for g in pages)}
    with open(os.path.join(DATA, "slugs.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(inv, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # Medien kopieren
    src_root = os.path.join(CACHE, "uploads")
    missing = []
    copied = 0
    for rel in sorted(needed_uploads):
        src = os.path.join(src_root, unquote(rel))
        dst = os.path.join(PUBLIC_UPLOADS, safe_rel(rel))
        if not os.path.exists(src):
            missing.append(rel)
            continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst)
        copied += 1
    print(dict(stats), "uploads kopiert", copied, "fehlend", len(missing))
    for m in missing[:30]:
        print("FEHLT", m)
    if missing:
        sys.exit(1)


if __name__ == "__main__":
    main()
