import fs from "node:fs";
import path from "node:path";
import { loadMagazineStore } from "#magazine-store";
import type { MagazineEntry } from "#magazine";
import { publicUrl } from "#markets";
import { assetBaseUrl } from "#static-asset";

/**
 * WordPress-kompatibler REST-Endpunkt für die Magazin-BEITRÄGE, erzeugt aus den Dateien im Repo.
 *
 * Hintergrund: ICONY (Heiko Grossmann) liest auf der Startseite der Plattform immer drei Magazin-Teaser über
 * <magazin-pfad>/wp-json/wp/v2/posts. Das WordPress ist abgelöst, der Endpunkt bleibt: gleiche URL, gleiche Felder
 * (WP-REST-Format), aber aus den Magazin-Dateien erzeugt. Pfade siehe lib/wp-rest-paths.ts.
 *
 * Bewusst NICHT vorhanden: Seiten, Stadt-/Lexikon-/Studio-Inhalte und /wp/v2/users (Prüfbefund bei elFlirt war die
 * Enumeration der Autorennamen). `author` ist nur die ID, `_embedded.author` gibt es nicht. Alles andere als Beiträge,
 * Kategorien, Schlagwörter und Beitragsbilder antwortet mit 404.
 */

// Das frühere WordPress lag unter /magazin/: Basis für guid und _links.
const WP_BASE = "https://tierisch-verliebt.de/magazin";
const SITE_NAME = "Tierisch Verliebt - Magazin";

export const WP_REST_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type",
  "Access-Control-Expose-Headers": "X-WP-Total, X-WP-TotalPages, Link",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  "X-Robots-Tag": "noindex",
  "X-Content-Type-Options": "nosniff",
  Allow: "GET",
};

export type WpRestResponse = {
  status: number;
  body: unknown;
  headers: Record<string, string>;
};

type Json = Record<string, unknown>;

// ---------------------------------------------------------------- Quelle (projektspezifisch)

export type WpTerm = { id: number; name: string; slug: string; description: string; count: number; link: string };
export type WpMedia = {
  id: number;
  slug: string;
  title: string;
  date: string;
  dateGmt: string;
  modified: string;
  modifiedGmt: string;
  author: number;
  post: number;
  alt: string;
  url: string;
  file: string;
  mime: string;
  width: number;
  height: number;
};
export type WpPost = {
  id: number;
  slug: string;
  date: string;
  dateGmt: string;
  modified: string;
  modifiedGmt: string;
  title: string;
  content: string;
  excerpt: string;
  author: number;
  categories: number[];
  media?: WpMedia;
  link: string;
};
export type WpSource = { posts: WpPost[]; categories: WpTerm[] };

/** Wie bei WordPress: Beiträge liegen in der Zeitzone der Website (Europe/Berlin), *_gmt ist UTC. */
export function berlinToUtc(local: string): string {
  const match = local.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/);
  if (!match) return local;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const offsetAt = (instant: number) => {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]));
    return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second) - instant;
  };
  let instant = wall - offsetAt(wall);
  instant = wall - offsetAt(instant);
  return new Date(instant).toISOString().slice(0, 19);
}

const escapeHtml = (value: string) => value.replace(/&(?!#?\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plainText = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** Auszug als WP-HTML; mitten im Satz abgeschnittene Auszüge werden durch die Meta-Description ersetzt. */
function excerptHtml(entry: MagazineEntry): string {
  const complete = (text: string) => /[.!?…"“”)]$/.test(text);
  let text = plainText(entry.excerpt || "");
  const description = plainText(entry.description || "");
  if ((!text || !complete(text)) && description) text = description;
  if (text && !complete(text)) text = `${text.replace(/[,;:\-–]+$/, "")} …`;
  return text ? `<p>${escapeHtml(text)}</p>\n` : "";
}

const MEDIA_ID_OFFSET = 1_000_000;

function readSizes(): Record<string, [number, number]> {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "magazin", "bildmasse.json"), "utf8"));
  } catch {
    return {};
  }
}

function buildSource(): WpSource {
  const authors = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "magazin", "autoren.json"), "utf8")) as Array<{ id: number; slug: string }>;
  const sizes = readSizes();
  const store = loadMagazineStore();
  const categories = store.categories;

  const posts = store.posts.map((entry): WpPost => {
    const date = entry.date ?? "";
    const modified = entry.modified ?? date;
    const author = authors.find((item) => item.slug === entry.authorSlug)?.id ?? 1;
    const upload = entry.featuredImage?.match(/\/magazin\/wp-content\/uploads\/.+$/)?.[0];
    const [width, height] = (upload && sizes[upload]) || [0, 0];
    const media: WpMedia | undefined = upload && entry.featuredImage
      ? {
          id: MEDIA_ID_OFFSET + entry.id,
          slug: path.basename(upload).replace(/\.[^.]+$/, ""),
          title: path.basename(upload).replace(/\.[^.]+$/, ""),
          date,
          dateGmt: berlinToUtc(date),
          modified,
          modifiedGmt: berlinToUtc(modified),
          author,
          post: entry.id,
          // Alt-Text nie leer: Bildbeschreibung aus dem Beitrag, sonst der Titel.
          alt: (entry.featuredImageAlt || "").trim() || plainText(entry.title),
          url: entry.featuredImage.startsWith("http") ? entry.featuredImage : `${assetBaseUrl}${upload}`,
          file: upload.replace("/magazin/wp-content/uploads/", ""),
          mime: /\.png$/i.test(upload) ? "image/png" : /\.webp$/i.test(upload) ? "image/webp" : /\.gif$/i.test(upload) ? "image/gif" : "image/jpeg",
          width,
          height,
        }
      : undefined;
    return {
      id: entry.id,
      slug: entry.slug,
      date,
      dateGmt: berlinToUtc(date),
      modified,
      modifiedGmt: berlinToUtc(modified),
      title: escapeHtml(entry.title),
      content: entry.content,
      excerpt: excerptHtml(entry),
      author,
      categories: entry.categories.map((category) => category.id),
      media,
      link: publicUrl("de", `/magazin/${entry.slug}`),
    };
  });

  const terms = categories.map((category): WpTerm => ({
    id: category.id,
    name: escapeHtml(category.name),
    slug: category.slug,
    description: category.description,
    count: category.count,
    link: publicUrl("de", `/magazin/thema/${category.slug}`),
  }));
  return { posts, categories: terms };
}

let cached: WpSource | null = null;

export function loadWpSource(): WpSource {
  if (cached) return cached;
  const built = buildSource();
  // Dateien ändern sich zur Laufzeit nicht: in Production einmal bauen, in dev immer frisch.
  if (process.env.NODE_ENV === "production") cached = built;
  return built;
}

// ---------------------------------------------------------------- Allgemeines

const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;
const NAMESPACE_ROUTES = ["/wp/v2/posts", "/wp/v2/categories", "/wp/v2/tags", "/wp/v2/media"];
const restBase = `${WP_BASE}/wp-json/wp/v2`;

function error(status: number, code: string, message: string): WpRestResponse {
  return { status, body: { code, message, data: { status } }, headers: {} };
}

const NO_ROUTE = () => error(404, "rest_no_route", "Es wurde keine Route gefunden, die der URL und der Anfragemethode entspricht.");

// ---------------------------------------------------------------- Objekte im WordPress-Format

function mediaObject(media: WpMedia): Json {
  return {
    id: media.id,
    date: media.date,
    date_gmt: media.dateGmt,
    guid: { rendered: media.url },
    modified: media.modified,
    modified_gmt: media.modifiedGmt,
    slug: media.slug,
    status: "inherit",
    type: "attachment",
    link: media.url,
    title: { rendered: media.title },
    author: media.author,
    comment_status: "closed",
    ping_status: "closed",
    template: "",
    meta: [],
    description: { rendered: "" },
    caption: { rendered: "" },
    alt_text: media.alt,
    media_type: "image",
    mime_type: media.mime,
    media_details: {
      width: media.width,
      height: media.height,
      file: media.file,
      sizes: { full: { file: path.basename(media.file), width: media.width, height: media.height, mime_type: media.mime, source_url: media.url } },
    },
    post: media.post,
    source_url: media.url,
    _links: {
      self: [{ href: `${restBase}/media/${media.id}` }],
      collection: [{ href: `${restBase}/media` }],
    },
  };
}

function termObject(term: WpTerm): Json {
  return { id: term.id, link: term.link, name: term.name, slug: term.slug, taxonomy: "category" };
}

function categoryObject(term: WpTerm): Json {
  return {
    id: term.id,
    count: term.count,
    description: term.description,
    link: term.link,
    name: term.name,
    slug: term.slug,
    taxonomy: "category",
    parent: 0,
    meta: [],
    _links: {
      self: [{ href: `${restBase}/categories/${term.id}` }],
      collection: [{ href: `${restBase}/categories` }],
      "wp:post_type": [{ href: `${restBase}/posts?categories=${term.id}` }],
    },
  };
}

function postObject(post: WpPost, source: WpSource, embed: Set<string> | null): Json {
  const media = post.media;
  const object: Json = {
    id: post.id,
    date: post.date,
    date_gmt: post.dateGmt,
    guid: { rendered: `${WP_BASE}/?p=${post.id}` },
    modified: post.modified,
    modified_gmt: post.modifiedGmt,
    slug: post.slug,
    status: "publish",
    type: "post",
    link: post.link,
    title: { rendered: post.title },
    content: { rendered: post.content, protected: false },
    excerpt: { rendered: post.excerpt, protected: false },
    author: post.author,
    featured_media: media ? media.id : 0,
    comment_status: "closed",
    ping_status: "closed",
    sticky: false,
    template: "",
    format: "standard",
    meta: { footnotes: "" },
    categories: post.categories,
    tags: [],
  };

  const links: Json = {
    self: [{ href: `${restBase}/posts/${post.id}` }],
    collection: [{ href: `${restBase}/posts` }],
    about: [{ href: `${restBase}/types/post` }],
  };
  if (media) links["wp:featuredmedia"] = [{ embeddable: true, href: `${restBase}/media/${media.id}` }];
  links["wp:term"] = [
    { taxonomy: "category", embeddable: true, href: `${restBase}/categories?post=${post.id}` },
    { taxonomy: "post_tag", embeddable: true, href: `${restBase}/tags?post=${post.id}` },
  ];
  object._links = links;

  if (embed) {
    const embedded: Json = {};
    if (media && embed.has("wp:featuredmedia")) embedded["wp:featuredmedia"] = [mediaObject(media)];
    if (embed.has("wp:term")) {
      embedded["wp:term"] = [
        post.categories
          .map((id) => source.categories.find((term) => term.id === id))
          .filter((term): term is WpTerm => Boolean(term))
          .map(termObject),
        [],
      ];
    }
    if (Object.keys(embedded).length) object._embedded = embedded;
  }
  return object;
}

// ---------------------------------------------------------------- Parameter

function intParam(params: URLSearchParams, key: string, fallback: number, min: number, max: number) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function idList(params: URLSearchParams, key: string): number[] | null {
  const raw = params.getAll(key).flatMap((value) => value.split(","));
  if (!raw.length) return null;
  return raw.map((value) => Number.parseInt(value, 10)).filter((value) => Number.isFinite(value));
}

function embedSet(params: URLSearchParams): Set<string> | null {
  if (!params.has("_embed")) return null;
  const raw = params.get("_embed") ?? "";
  if (raw === "" || raw === "1" || raw === "true") return new Set(["wp:featuredmedia", "wp:term"]);
  if (raw === "0" || raw === "false") return null;
  return new Set(raw.split(",").map((value) => value.trim()));
}

function fieldPaths(params: URLSearchParams): string[] | null {
  const raw = params.get("_fields");
  if (!raw) return null;
  const paths = raw.split(",").map((value) => value.trim()).filter(Boolean);
  return paths.length ? paths : null;
}

function pickPaths(value: unknown, paths: string[][]): unknown {
  if (!paths.length) return value;
  if (Array.isArray(value)) return value.map((item) => pickPaths(item, paths));
  if (value === null || typeof value !== "object") return value;
  const source = value as Json;
  const out: Json = {};
  const wholeKeys = new Set(paths.filter((entry) => entry.length === 1).map((entry) => entry[0]));
  const nested = new Map<string, string[][]>();
  for (const entry of paths) {
    if (entry.length > 1) nested.set(entry[0], [...(nested.get(entry[0]) || []), entry.slice(1)]);
  }
  for (const key of Object.keys(source)) {
    if (wholeKeys.has(key)) out[key] = source[key];
    else if (nested.has(key)) out[key] = pickPaths(source[key], nested.get(key) || []);
  }
  return out;
}

function applyFields(object: Json, fields: string[] | null): Json {
  if (!fields) return object;
  return pickPaths(object, fields.map((field) => field.split("."))) as Json;
}

const searchable = (value: string) => plainText(value).toLowerCase();

function queryPosts(posts: WpPost[], params: URLSearchParams) {
  let items = posts.slice();

  const include = idList(params, "include");
  if (include) items = items.filter((post) => include.includes(post.id));
  const exclude = idList(params, "exclude");
  if (exclude) items = items.filter((post) => !exclude.includes(post.id));
  const slugs = params.getAll("slug").flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);
  if (slugs.length) items = items.filter((post) => slugs.includes(post.slug));
  const authors = idList(params, "author");
  if (authors) items = items.filter((post) => authors.includes(post.author));
  const categories = idList(params, "categories");
  if (categories) items = items.filter((post) => post.categories.some((id) => categories.includes(id)));
  const categoriesExclude = idList(params, "categories_exclude");
  if (categoriesExclude) items = items.filter((post) => !post.categories.some((id) => categoriesExclude.includes(id)));
  if (idList(params, "tags")) items = [];
  const search = params.get("search")?.trim().toLowerCase();
  if (search) items = items.filter((post) => `${searchable(post.title)} ${searchable(post.excerpt)} ${searchable(post.content)}`.includes(search));
  const after = params.get("after");
  if (after) items = items.filter((post) => post.date > after.replace(/Z$/, ""));
  const before = params.get("before");
  if (before) items = items.filter((post) => post.date < before.replace(/Z$/, ""));
  const modifiedAfter = params.get("modified_after");
  if (modifiedAfter) items = items.filter((post) => post.modified > modifiedAfter.replace(/Z$/, ""));
  const modifiedBefore = params.get("modified_before");
  if (modifiedBefore) items = items.filter((post) => post.modified < modifiedBefore.replace(/Z$/, ""));

  const filtered = Boolean(authors || categories);
  const orderby = params.get("orderby") || "date";
  // orderby=include behält wie in WordPress die Reihenfolge der include-Liste.
  const direction = orderby === "include" || (params.get("order") || "desc").toLowerCase() === "asc" ? 1 : -1;
  const key = (post: WpPost): string | number => {
    switch (orderby) {
      case "modified": return post.modified;
      case "title": return post.title.toLowerCase();
      case "slug": return post.slug;
      case "id": return post.id;
      case "author": return post.author;
      case "include": return include ? include.indexOf(post.id) : 0;
      default: return post.date;
    }
  };
  items.sort((a, b) => {
    const left = key(a);
    const right = key(b);
    const order = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "de");
    // Wie WordPress: bei gleichem Datum ist die Reihenfolge ungefiltert ID absteigend, mit Autor-/Kategorie-Filter ID aufsteigend.
    return order * direction || (filtered ? a.id - b.id : b.id - a.id);
  });

  const total = items.length;
  const perPage = intParam(params, "per_page", DEFAULT_PER_PAGE, 1, MAX_PER_PAGE);
  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);
  const offset = params.has("offset")
    ? intParam(params, "offset", 0, 0, Number.MAX_SAFE_INTEGER)
    : (intParam(params, "page", 1, 1, Number.MAX_SAFE_INTEGER) - 1) * perPage;
  return { items: items.slice(offset, offset + perPage), total, totalPages };
}

function collectionHeaders(route: string, params: URLSearchParams, total: number, totalPages: number): Record<string, string> {
  const page = intParam(params, "page", 1, 1, Number.MAX_SAFE_INTEGER);
  const headers: Record<string, string> = { "X-WP-Total": String(total), "X-WP-TotalPages": String(totalPages) };
  const link = (target: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(target));
    return `<${WP_BASE}/wp-json/wp/v2/${route}?${next.toString()}>`;
  };
  const parts: string[] = [];
  if (page > 1) parts.push(`${link(page - 1)}; rel="prev"`);
  if (page < totalPages) parts.push(`${link(page + 1)}; rel="next"`);
  if (parts.length) headers.Link = parts.join(", ");
  return headers;
}

function postCollection(params: URLSearchParams, source: WpSource): WpRestResponse {
  const { items, total, totalPages } = queryPosts(source.posts, params);
  const page = intParam(params, "page", 1, 1, Number.MAX_SAFE_INTEGER);
  if (page > 1 && page > totalPages && !params.has("offset")) {
    return error(400, "rest_post_invalid_page_number", "Die angeforderte Seitennummer ist größer als die Anzahl der verfügbaren Seiten.");
  }
  const embed = embedSet(params);
  const fields = fieldPaths(params);
  return {
    status: 200,
    body: items.map((post) => applyFields(postObject(post, source, embed), fields)),
    headers: collectionHeaders("posts", params, total, totalPages),
  };
}

function categoryCollection(params: URLSearchParams, source: WpSource): WpRestResponse {
  let rows = source.categories.filter((row) => row.count > 0 || params.get("hide_empty") === "false");
  const include = idList(params, "include");
  if (include) rows = rows.filter((row) => include.includes(row.id));
  const slugs = params.getAll("slug").flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);
  if (slugs.length) rows = rows.filter((row) => slugs.includes(row.slug));
  const post = idList(params, "post");
  if (post) {
    const selected = source.posts.filter((entry) => post.includes(entry.id));
    rows = rows.filter((row) => selected.some((entry) => entry.categories.includes(row.id)));
  }
  const orderby = params.get("orderby") || "name";
  const direction = (params.get("order") || "asc").toLowerCase() === "desc" ? -1 : 1;
  rows.sort((a, b) => {
    const order = orderby === "count" ? a.count - b.count : orderby === "id" ? a.id - b.id : orderby === "slug" ? a.slug.localeCompare(b.slug) : a.name.localeCompare(b.name, "de");
    return order * direction;
  });
  const total = rows.length;
  const perPage = intParam(params, "per_page", DEFAULT_PER_PAGE, 1, MAX_PER_PAGE);
  const page = intParam(params, "page", 1, 1, Number.MAX_SAFE_INTEGER);
  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);
  const fields = fieldPaths(params);
  return {
    status: 200,
    body: rows.slice((page - 1) * perPage, page * perPage).map((row) => applyFields(categoryObject(row), fields)),
    headers: collectionHeaders("categories", params, total, totalPages),
  };
}

// ---------------------------------------------------------------- Einstieg

/**
 * @param route  Pfad hinter /wp-json, z. B. "/wp/v2/posts" oder "/wp/v2/posts/698" (mit oder ohne Slash am Ende)
 * @param params Query-Parameter der Anfrage
 */
export function handleWpRest(route: string, params: URLSearchParams, source: WpSource = loadWpSource()): WpRestResponse {
  const normalized = `/${route.replace(/^\/+|\/+$/g, "")}`;
  const parts = normalized.split("/").filter(Boolean);

  if (normalized === "/") {
    return {
      status: 200,
      body: {
        name: SITE_NAME,
        description: "",
        url: publicUrl("de", "/magazin"),
        home: publicUrl("de", "/magazin"),
        namespaces: ["wp/v2"],
        authentication: {},
        routes: Object.fromEntries(NAMESPACE_ROUTES.map((entry) => [entry, { namespace: "wp/v2", methods: ["GET"] }])),
      },
      headers: {},
    };
  }

  if (parts[0] !== "wp" || parts[1] !== "v2") return NO_ROUTE();
  if (parts.length === 2) return { status: 200, body: { namespace: "wp/v2", routes: NAMESPACE_ROUTES }, headers: {} };

  const resource = parts[2];
  const idPart = parts[3];
  if (parts.length > 4) return NO_ROUTE();

  // Kein /users-Endpunkt (Prüfbefund: Autorennamen-Enumeration). Autoren gibt es nur als ID im Beitrag.
  if (resource === "posts") {
    if (!idPart) return postCollection(params, source);
    const post = /^\d+$/.test(idPart) ? source.posts.find((item) => item.id === Number(idPart)) : undefined;
    if (!post) return error(404, "rest_post_invalid_id", "Ungültige Beitrags-ID.");
    return { status: 200, body: applyFields(postObject(post, source, embedSet(params)), fieldPaths(params)), headers: {} };
  }

  if (resource === "categories") {
    if (!idPart) return categoryCollection(params, source);
    const row = /^\d+$/.test(idPart) ? source.categories.find((item) => item.id === Number(idPart)) : undefined;
    if (!row) return error(404, "rest_term_invalid", "Begriff existiert nicht.");
    return { status: 200, body: applyFields(categoryObject(row), fieldPaths(params)), headers: {} };
  }

  // Schlagwörter gibt es nicht (alle Archive waren leer): leere Liste im WP-Format.
  if (resource === "tags") {
    if (idPart) return error(404, "rest_term_invalid", "Begriff existiert nicht.");
    return { status: 200, body: [], headers: collectionHeaders("tags", params, 0, 0) };
  }

  // Nur Beitragsbilder (die einzigen Medien); keine Liste der ganzen Mediathek.
  if (resource === "media" && idPart && /^\d+$/.test(idPart)) {
    const media = source.posts.find((item) => item.media?.id === Number(idPart))?.media;
    if (!media) return error(404, "rest_post_invalid_id", "Ungültige Beitrags-ID.");
    return { status: 200, body: applyFields(mediaObject(media), fieldPaths(params)), headers: {} };
  }

  return NO_ROUTE();
}

/** Antwort als Response-Objekt inklusive CORS-, Cache- und WP-Headern. */
export function wpRestResponse(result: WpRestResponse, method = "GET"): Response {
  const headers = new Headers({ ...WP_REST_HEADERS, ...result.headers });
  if (result.status >= 400) headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
  const body = method === "HEAD" ? null : JSON.stringify(result.body);
  return new Response(body, { status: result.status, headers });
}

export function wpRestPreflight(): Response {
  const headers = new Headers(WP_REST_HEADERS);
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

/** Gemeinsamer Einstieg für die index.php-/?rest_route=-Routen. */
export function handleRestRouteQuery(url: string, method: string, fallbackLocation: string): Response {
  const params = new URL(url).searchParams;
  const route = params.get("rest_route");
  if (!route) return new Response(null, { status: 308, headers: { Location: fallbackLocation } });
  params.delete("rest_route");
  return wpRestResponse(handleWpRest(route, params), method);
}
