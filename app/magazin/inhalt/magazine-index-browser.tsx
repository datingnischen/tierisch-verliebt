"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { MagazineIndexItem, MagazineIndexSection } from "@/lib/magazine-index";

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss");
}

function filterItems(items: MagazineIndexItem[], query: string) {
  if (!query) return items;
  const result: MagazineIndexItem[] = [];
  for (const item of items) {
    if (normalize(item.label).includes(query)) {
      result.push(item);
      continue;
    }
    const children = item.children.filter((child) => normalize(child.label).includes(query));
    if (children.length) result.push({ ...item, children });
  }
  return result;
}

export function MagazineIndexBrowser({ sections, total }: { sections: MagazineIndexSection[]; total: number }) {
  const [input, setInput] = useState("");
  const query = normalize(useDeferredValue(input).trim());

  const visible = useMemo(
    () =>
      sections
        .map((section) => ({ ...section, items: filterItems(section.items, query) }))
        .filter((section) => section.items.length > 0),
    [sections, query],
  );
  const hits = visible.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <>
      <div className="magazine-index-toolbar">
        <label className="magazine-index-search">
          <span className="magazine-index-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Suchen, z. B. Beagle, Maine Coon, Wellensittich …"
            aria-label="Inhaltsverzeichnis durchsuchen"
          />
        </label>
        <p className="magazine-index-status" aria-live="polite">
          {query ? `${hits} Treffer` : `${total} Inhalte`}
        </p>
      </div>

      <nav className="magazine-index-jump" aria-label="Direkt zum Thema">
        {visible.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            <span aria-hidden="true">{section.emoji}</span>
            {section.title}
            <small>{section.items.length}</small>
          </a>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="magazine-index-empty">
          Nichts gefunden für „{input.trim()}“. Probier einen anderen Begriff oder{" "}
          <button type="button" onClick={() => setInput("")}>
            zeig wieder alles
          </button>
          .
        </p>
      ) : null}

      <div className="magazine-index-sections">
        {visible.map((section) => (
          <section key={section.id} id={section.id} className="magazine-index-section">
            <header>
              <h2>
                <span aria-hidden="true">{section.emoji}</span> {section.title}
                <small>{section.items.length}</small>
              </h2>
              {section.href ? (
                <Link href={section.href} className="magazine-index-section-more">
                  {section.kind === "posts" ? "Zum Thema" : "Zur Übersicht"} →
                </Link>
              ) : null}
            </header>
            <ul className={section.kind === "posts" ? "magazine-index-list is-posts" : "magazine-index-list"}>
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                  {item.meta ? <span className="magazine-index-meta">{item.meta}</span> : null}
                  {item.children.length ? (
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href}>{child.label}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
