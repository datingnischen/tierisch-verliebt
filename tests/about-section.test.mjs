import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const repoRoot = new URL("../", import.meta.url);

async function readRepoFile(relativePath) {
  return readFile(new URL(relativePath, repoRoot), "utf8");
}

test("maps moved ueber-uns content to canonical about routes", async () => {
  const aboutSource = await readRepoFile("lib/about-section.ts");
  assert.ok(aboutSource.includes('ABOUT_OVERVIEW_PATH = "/ueber-uns"'));
  assert.ok(aboutSource.includes('ABOUT_STORY_PATH = "/ueber-uns/geschichte"'));
  assert.ok(aboutSource.includes('ABOUT_SOCIAL_MEDIA_PATH = "/ueber-uns/social-media"'));
  assert.ok(aboutSource.includes('ABOUT_PRESS_PATH = "/magazin/thema/presse"'));
  assert.ok(aboutSource.includes('if (slug === "ueber-uns") return ABOUT_STORY_PATH'));
  assert.ok(aboutSource.includes('return `/magazin/${slug}`'));
});

test("legacy about routes permanently redirect to the new about section", async () => {
  const [legacyStory, legacySocial] = await Promise.all([
    readRepoFile("app/magazin/ueber-uns/page.tsx"),
    readRepoFile("app/social-media/page.tsx"),
  ]);
  assert.match(legacyStory, /permanentRedirect\(ABOUT_STORY_PATH\)/);
  assert.match(legacySocial, /permanentRedirect\(ABOUT_SOCIAL_MEDIA_PATH\)/);
});

test("internal navigation and expert trust links use canonical Christian path", async () => {
  const [shellSource, themeSource, aboutSource, authorProfilesSource] = await Promise.all([
    readRepoFile("components/site-shell.tsx"),
    readRepoFile("app/magazin/thema/[slug]/page.tsx"),
    readRepoFile("app/ueber-uns/page.tsx"),
    readRepoFile("lib/author-profiles.ts"),
  ]);
  assert.ok(shellSource.includes('href: "/magazin/christian"'));
  assert.ok(!shellSource.includes('href: "/magazin/author/christian-m-haas"'));
  assert.ok(themeSource.includes('href="/magazin/christian"'));
  assert.ok(authorProfilesSource.includes('profileUrl: "/magazin/christian"'));
  assert.ok(authorProfilesSource.includes('label: "Ausführliche Vita", href: "/magazin/christian"'));
  assert.match(aboutSource, /ExpertTrustCard[\s\S]*profile=\{expert\}/);
});

test("sitemap publishes only canonical about URLs", async () => {
  const sitemapSource = await readRepoFile("app/sitemap.ts");
  assert.match(sitemapSource, /ABOUT_OVERVIEW_PATH/);
  assert.match(sitemapSource, /ABOUT_STORY_PATH/);
  assert.match(sitemapSource, /ABOUT_SOCIAL_MEDIA_PATH/);
  assert.match(sitemapSource, /filter\(\(page\) => page\.slug !== "ueber-uns"\)/);
  assert.doesNotMatch(sitemapSource, /`\$\{SITE_URL\}\/social-media`/);
});
