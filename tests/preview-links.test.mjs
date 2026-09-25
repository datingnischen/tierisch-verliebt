import assert from "node:assert/strict";
import test from "node:test";
import { isPreviewHost, previewPath, previewPathForUrl } from "../lib/markets.ts";

test("recognises preview hosts", () => {
  assert.equal(isPreviewHost("tierisch-verliebt.vercel.app"), true);
  assert.equal(isPreviewHost("localhost"), true);
  assert.equal(isPreviewHost("tierisch-verliebt.ch"), false);
});

test("maps Next.js pages to their preview path", () => {
  assert.equal(previewPath("ch", "/partnersuche/zuerich"), "/ch/partnersuche/zuerich/");
  assert.equal(previewPath("at", "/"), "/at/");
  assert.equal(previewPathForUrl("https://tierisch-verliebt.ch/partnersuche/zug/"), "/ch/partnersuche/zug/");
  assert.equal(previewPathForUrl("https://tierisch-verliebt.at/partnersuche/"), "/at/partnersuche/");
  assert.equal(previewPathForUrl("https://tierisch-verliebt.de/magazin/christian/"), "/de/magazin/christian/");
});

test("keeps ICONY platform pages on the live domain", () => {
  assert.equal(previewPathForUrl("https://tierisch-verliebt.ch/registration/?AID=location"), null);
  assert.equal(previewPathForUrl("https://tierisch-verliebt.ch/suche/"), null);
  assert.equal(previewPathForUrl("https://tierisch-verliebt.at/impressum.html"), null);
  assert.equal(previewPathForUrl("https://tierisch-verliebt.ch/magazin/"), null);
  assert.equal(previewPathForUrl("https://example.com/partnersuche/"), null);
});
