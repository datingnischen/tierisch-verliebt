import test from "node:test";
import assert from "node:assert/strict";
import { cleanMagazineHtml, limitStrong, withoutEmptyHeadings, withoutHeadingSkips, withoutH1Repeat } from "#html-cleanup";
import { withUniqueLinkTargets } from "#link-targets";

test("empty headings disappear, image-only headings keep their image", () => {
  assert.equal(withoutEmptyHeadings("<h3>&nbsp;</h3><p>x</p>"), "<p>x</p>");
  assert.equal(withoutEmptyHeadings('<h2><img src="a.jpg" alt="A"></h2>'), '<p><img src="a.jpg" alt="A"></p>');
});

test("a sub-heading repeating the H1 is removed", () => {
  assert.equal(withoutH1Repeat("<h2>Reiter Singles</h2><p>Text</p>", "Reiter Singles"), "<p>Text</p>");
  assert.equal(withoutH1Repeat("<h2>Reiter &#8211; Singles</h2>", "Reiter – Singles"), "");
});

test("heading levels never skip and siblings stay siblings", () => {
  assert.equal(
    withoutHeadingSkips("<h2>A</h2><h4>B</h4><h4>C</h4><h3>D</h3><h2>E</h2><h5>F</h5>"),
    "<h2>A</h2><h3>B</h3><h3>C</h3><h3>D</h3><h2>E</h2><h3>F</h3>",
  );
  assert.equal(withoutHeadingSkips("<h3>Erste</h3><p>x</p>"), "<h2>Erste</h2><p>x</p>");
  assert.equal(withoutHeadingSkips("<h1>Doppelt</h1>"), "<h2>Doppelt</h2>");
});

test("strong tags are capped, deduplicated and emptied ones dropped without losing text", () => {
  const html = "<strong>a</strong><strong>b</strong><strong>a</strong><strong> </strong><b>c</b><strong>d</strong><strong>e</strong>";
  assert.equal(limitStrong(html), '<strong>a</strong><strong>b</strong><span class="em-strong">a</span> <b>c</b><strong>d</strong><span class="em-strong">e</span>');
  // Ein leeres strong mit Leerzeichen zwischen zwei Wörtern darf sie nicht zusammenkleben.
  assert.equal(limitStrong("Nachhaltige<strong> </strong>französische"), "Nachhaltige französische");
});

test("the cleanup pipeline combines all steps", () => {
  assert.equal(cleanMagazineHtml("<h2>Mops</h2><h4>&nbsp;</h4><h4>Pflege</h4>", "Mops"), "<h2>Pflege</h2>");
});

test("one link text points to one target across the magazine", () => {
  const [a, b, c] = withUniqueLinkTargets([
    { content: '<a href="/magazin/beliebtesten-hunderassen/">Hunde</a> <a href="/magazin/getreidefreies-futter/">Futter</a>' },
    { content: '<a href="/magazin/getreidefreies-futter/">Futter</a> <a href="https://tierisch-verliebt.de/magazin/katzenfutter-im-test/">Futter</a>' },
    { content: '<a href="https://example.com/">Futter</a>' },
  ]);
  // Themenwort: dasselbe Ziel wie in der Navigation.
  assert.equal(a.content, '<a href="/magazin/hunderassen/">Hunde</a> <a href="/magazin/getreidefreies-futter/">Futter</a>');
  // Sonst bleibt das häufigste Ziel verlinkt, abweichende Vorkommen werden Text.
  assert.equal(b.content, '<a href="/magazin/getreidefreies-futter/">Futter</a> Futter');
  // Externe Links bleiben unberührt.
  assert.equal(c.content, '<a href="https://example.com/">Futter</a>');
});

test("doppelt verschachtelte Hervorhebungen ergeben gültiges HTML", () => {
  assert.equal(limitStrong("<strong>a</strong><strong>a</strong><strong><strong>T</strong></strong>"), "<strong>a</strong><span class=\"em-strong\">a</span><strong>T</strong>");
});
