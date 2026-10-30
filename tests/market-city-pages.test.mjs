import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";

const ICONY_IMAGE_HOST = /icony-hosting\.de/i;

const EXPECTED = {
  de: ["berlin", "duesseldorf", "stuttgart", "koeln", "muenchen", "hamburg", "dortmund", "essen", "leipzig", "frankfurt-am-main", "bremen", "dresden", "hannover", "nuernberg", "duisburg", "bochum", "wuppertal", "bielefeld", "bonn", "muenster", "kassel"],
  at: ["graz", "innsbruck", "salzburg", "klagenfurt", "dornbirn", "amstetten", "steyr", "wien", "linz", "st-poelten", "wels", "villach", "bregenz", "leoben", "eisenstadt"],
  ch: ["bern", "basel", "luzern", "st-gallen", "winterthur", "zuerich", "lausanne", "genf", "thun", "schaffhausen", "biel", "chur", "zug", "fribourg", "aarau"],
};

async function loadContent() {
  try {
    return await import("../lib/market-partnersuche.ts");
  } catch (error) {
    assert.fail(`lib/market-partnersuche.ts must expose the complete static city contract: ${error.message}`);
  }
}

for (const market of ["de", "at", "ch"]) {
  test(`publishes the exact ${market.toUpperCase()} legacy city inventory`, async () => {
    const { getMarketCityPages } = await loadContent();
    assert.deepEqual(getMarketCityPages(market).map((page) => page.slug), EXPECTED[market]);
  });
}

test("keeps every imported city complete, sanitized and market-local", async () => {
  const { getMarketCityPages, getMarketPartnersucheHub, withPostcodeSearch } = await loadContent();

  for (const market of ["de", "at", "ch"]) {
    const domain = `tierisch-verliebt.${market}`;
    const hub = getMarketPartnersucheHub(market);
    const pages = getMarketCityPages(market);
    assert.equal(hub.cities.length, EXPECTED[market].length);
    assert.match(hub.editorial.heroImageUrl ?? "", new RegExp(`/cities/${market}/partnersuche-[a-z-]+\.jpg$`));
    assert.doesNotMatch(hub.editorial.heroImageUrl ?? "", ICONY_IMAGE_HOST);
    assert.ok(hub.editorial.introParagraphs.length >= 2);

    for (const page of pages) {
      assert.equal(page.market, market);
      assert.equal(page.path, `/partnersuche/${page.slug}`);
      assert.equal(new URL(page.sourceUrl).hostname, domain);
      assert.ok(page.title.length > 10);
      assert.ok(page.description.length > 40);
      assert.ok(page.cityName.length > 1);
      assert.ok(page.contentHtml.length > 300);
      // Regel 2026-10-20: Bilder liegen im Repo (public/cities/<land>/), nie vom ICONY-CMS.
      // Eigene Stadtseiten (mit sources) dürfen bis zur Codex-Lieferung ohne Titelbild erscheinen.
      const ownPage = Boolean(page.sources?.length);
      assert.doesNotMatch(page.contentHtml, ICONY_IMAGE_HOST);
      if (!ownPage || page.imageUrl) {
        assert.match(page.imageUrl ?? "", new RegExp(`/cities/${market}/${page.slug}\.jpg$`));
        assert.doesNotMatch(page.imageUrl ?? "", ICONY_IMAGE_HOST);
        assert.ok(page.imageAlt && page.imageAlt.trim().length > 8, `${market}/${page.slug}: sprechender Alt-Text fehlt`);
        assert.ok(existsSync(new URL(`../public/cities/${market}/${page.slug}.jpg`, import.meta.url)), `${market}/${page.slug}: Bilddatei fehlt`);
      }
      for (const img of page.contentHtml.match(/<img[^>]*>/gi) ?? []) {
        assert.match(img, /alt="[^"]{8,}"/, `${market}/${page.slug}: Bild ohne sinnvollen Alt-Text`);
        const src = img.match(/src="([^"]+)"/)?.[1] ?? "";
        assert.ok(existsSync(new URL(`../public${new URL(src).pathname.replace(/^\/app-assets/, "")}`, import.meta.url)), `${market}/${page.slug}: Bilddatei fehlt (${src})`);
      }
      assert.ok(page.icony.platformId.startsWith("tierischverliebt"));
      assert.ok(page.icony.zip.length >= 4);
      assert.equal(page.icony.country, market === "de" ? 49 : market === "at" ? 43 : 41);
      assert.equal(new URL(page.registrationUrl).hostname, domain);
      const searchUrl = new URL(page.searchUrl);
      assert.equal(searchUrl.hostname, domain);
      assert.equal(searchUrl.pathname, "/suche/");
      assert.equal(searchUrl.searchParams.get("plz"), page.icony.zip);
      assert.equal(searchUrl.searchParams.get("AID"), "location");
      assert.deepEqual([...searchUrl.searchParams.keys()], ["plz", "AID"]);
      assert.doesNotMatch(page.contentHtml, /<(?:script|iframe|form|input|button)\b/i);
      assert.doesNotMatch(page.contentHtml, /\son[a-z]+\s*=/i);
      assert.doesNotMatch(page.contentHtml, /(?:href|src)\s*=\s*["']\s*javascript:/i);
    }
  }

  const valid = getMarketCityPages("de")[0];
  for (const zip of ["", "1234", "ABCDE"]) {
    assert.throws(
      () => withPostcodeSearch({ ...valid, icony: { ...valid.icony, zip } }),
      /Invalid postcode/,
    );
  }
  assert.throws(
    () => withPostcodeSearch({ ...valid, searchUrl: "https://tierisch-verliebt.de/suche/" }),
    /Invalid search attribution/,
  );
});

// Regel von Christian (2026-10-20): keine Bilder zur Laufzeit von ICONY-Hosts (static-cms/static2/cdn3/dynamic-cdn
// .icony-hosting.de) – weder im Code, in Daten, CSS noch in next.config. Ausgenommen: Importskripte/Tests und
// reine Herkunftsfelder (sourceUrl), die nicht gerendert werden.
test("eigene Stadtseite Kassel: belegt, Quellen zugeklappt, nicht im ICONY-Import", async () => {
  const { getMarketCityPage } = await loadContent();
  const page = getMarketCityPage("de", "kassel");
  assert.ok(page, "Kassel fehlt");
  assert.ok(page.sources.length >= 5, "zu wenige Belege");
  for (const source of page.sources) assert.equal(new URL(source.url).protocol, "https:");
  assert.equal(page.icony.zip, "34117");
  assert.match(page.contentHtml, /Wolfsanger/);
  assert.match(page.contentHtml, /href="https:\/\/tierisch-verliebt\.de\/magazin\/tierisch-verliebt-de-kassel-huskies\/"/);
  const imported = JSON.parse(readFileSync(new URL("../data/partnersuche-markets.json", import.meta.url), "utf8"));
  assert.ok(!imported.de.pages.some((entry) => entry.slug === "kassel"), "Kassel gehört in data/partnersuche-eigene-staedte.json");
  const view = readFileSync(new URL("../components/city-page/tier-city-page.tsx", import.meta.url), "utf8");
  assert.match(view, /<details className="tvc-sources">/);
  assert.doesNotMatch(view, /<details className="tvc-sources"[^>]*open/);
  assert.match(readFileSync(new URL("../components/city-page/tier-city-page.css", import.meta.url), "utf8"), /\.tvc-sources \{[^}]*font-size: 13px/);
});

test("lädt keine Bilder von ICONY-Hosts (Code, Daten, next.config)", () => {
  const root = new URL("../", import.meta.url);
  const IMAGE_ON_ICONY = /https?:\/\/[a-z0-9.-]*icony-hosting\.de\/[^"'\s)]*\.(?:jpe?g|png|webp|gif|svg|avif)\b/i;
  const offenders = [];
  const walk = (dir) => {
    for (const name of readdirSync(new URL(dir, root))) {
      const rel = `${dir}${name}`;
      if (statSync(new URL(rel, root)).isDirectory()) walk(`${rel}/`);
      else if (/\.(?:tsx?|mjs|js|json|css|md)$/.test(name) && IMAGE_ON_ICONY.test(readFileSync(new URL(rel, root), "utf8"))) offenders.push(rel);
    }
  };
  for (const dir of ["app/", "components/", "lib/", "data/", "content/"]) walk(dir);
  for (const file of readdirSync(root).filter((name) => /^next\.config\./.test(name))) {
    const source = readFileSync(new URL(file, root), "utf8");
    if (/icony-hosting\.de/i.test(source)) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});
