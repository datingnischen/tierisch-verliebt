import test from "node:test";
import assert from "node:assert/strict";
import { relativizeInternalLinks } from "../lib/wordpress.ts";

test("internal WordPress content links become relative with trailing slash for Vercel previews", () => {
  const html = `<a href="https://tierisch-verliebt.de/magazin/zwergspitz/">Zwergspitz</a> <a href="https://www.tierisch-verliebt.de/partnersuche/berlin/#top">Berlin</a>`;
  assert.equal(relativizeInternalLinks(html), `<a href="/magazin/zwergspitz/">Zwergspitz</a> <a href="/partnersuche/berlin/#top">Berlin</a>`);
});

test("uploads, registration and external links stay absolute", () => {
  const html = [
    `<a href="https://tierisch-verliebt.de/magazin/wp-content/uploads/2024/08/bild.jpg">Bild</a>`,
    `<a href="https://tierisch-verliebt.de/?AID=magazin">Registrieren</a>`,
    `<a href="https://tierisch-verliebt.de/magazinpresse">Anderer Pfad</a>`,
    `<a href="https://example.com/magazin/x">Extern</a>`,
  ].join("");
  assert.equal(relativizeInternalLinks(html), html);
});
