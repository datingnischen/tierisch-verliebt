import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMarketRequest, previewPathForUrl } from '../lib/markets.ts';
import { handleWpRest } from '../lib/wp-rest-compat.ts';
import { loadMarketTeaserSource } from '../lib/wp-market-teasers.ts';
import { getAtArticles, atMagazineGraph } from '../lib/at-magazine.ts';
import { readFileSync, existsSync } from 'node:fs';
import { imageSize } from '../scripts/magazin-bildmasse.mjs';

const slugs = ['gassi-date', 'neuer-partner-und-katze', 'ausflug-mit-hund'];
test('AT Magazin wird live und in der Vorschau getrennt geroutet', () => {
  for (const slug of slugs) {
    for (const [path, host] of [[`/at/magazin/${slug}/`, 'localhost'], [`/magazin/${slug}/`, 'tierisch-verliebt.at']]) {
      assert.deepEqual(resolveMarketRequest(path, host), { action: 'at-magazine', market: 'at', pathname: `/market-at-magazin/${slug}` });
    }
    assert.equal(previewPathForUrl(`https://tierisch-verliebt.at/magazin/${slug}/`), `/at/magazin/${slug}/`);
  }
  assert.deepEqual(resolveMarketRequest('/at/magazin/zwei-singles-zwei-hunde/'), { action: 'not-found' });
  assert.deepEqual(resolveMarketRequest('/market-at-magazin/gassi-date/'), { action: 'not-found' });
  for (const path of ['/at/market-at-magazin/gassi-date/', '/de/market-at-magazin/gassi-date/']) {
    assert.deepEqual(resolveMarketRequest(path, 'tierisch-verliebt.de'), { action: 'not-found' });
    assert.deepEqual(resolveMarketRequest(path, 'localhost'), { action: 'not-found' });
  }
  assert.equal(resolveMarketRequest('/at/magazin/sitemap.xml').pathname, '/market-sitemap/at');
});
test('AT Startseitenteaser verweisen auf eigene Artikel und eigene Bildroute', () => {
  const result = handleWpRest('/wp/v2/posts/', new URLSearchParams('per_page=3&_embed=1'), loadMarketTeaserSource('at'));
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.map(post => post.slug).sort(), [...slugs].sort());
  for (const post of result.body) {
    assert.equal(post.link, `https://tierisch-verliebt.at/magazin/${post.slug}/`);
    assert.match(post._embedded['wp:featuredmedia'][0].source_url, /^https:\/\/tierisch-verliebt\.at\/magazin\/wp-json\/datingnischen\/v1\/bild\/magazin\/media\/at\//);
  }
});
test('AT Beiträge haben eigene Metadaten, echte Titelbildmaße und FAQ-Schema', () => {
  const articles = getAtArticles();
  assert.equal(articles.length, 3);
  for (const article of articles) {
    const graph = atMagazineGraph(article)['@graph'];
    const schema = graph.find(item => item['@type'] === 'Article');
    assert.equal(schema.url, `https://tierisch-verliebt.at/magazin/${article.slug}/`);
    assert.equal(schema.inLanguage, 'de-AT');
    assert.equal(graph.find(item => item['@type'] === 'FAQPage').mainEntity.length, 3);
    assert.doesNotMatch(article.content, /tierisch-verliebt\.(?:ch|de)|ElevenLabs|KI-Stimme/);
    assert.deepEqual(imageSize(readFileSync(new URL(`../public${article.image}`, import.meta.url))), [article.imageWidth, article.imageHeight]);
    for (const match of article.content.matchAll(/app-assets(\/magazin\/media\/[^"?]+)/g)) {
      assert.equal(existsSync(new URL(`../public${match[1]}`, import.meta.url)), true);
    }
  }
});
