import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("magazine articles close with the compact author box", async () => {
  const [page, card, css] = await Promise.all([
    source("../app/magazin/[slug]/page.tsx"),
    source("../components/expert-trust-card.tsx"),
    source("../app/globals.css"),
  ]);

  assert.match(page, /variant="compact"/);
  assert.match(card, /const compact = variant === "compact";/);
  // The tall trust headline and the bullet list are what made the box 1000px+ high.
  assert.match(card, /\{compact \? null : \(\s*<div className="author-box-intro">/);
  assert.match(card, /\{compact \? null : \(\s*<ul className="expert-facts"/);
  assert.match(css, /\.author-box-compact \.author-box-body\s*\{[^}]*grid-template-columns:\s*116px/s);
  assert.match(css, /\.author-box-media img\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/s);
});

test("the author box shows the job title, topic chips and social profiles", async () => {
  const [card, css] = await Promise.all([
    source("../components/expert-trust-card.tsx"),
    source("../app/globals.css"),
  ]);

  assert.match(card, /className="author-box-jobtitle"/);
  assert.match(card, /className="author-box-topics"/);
  assert.match(card, /<AuthorSocialIcon platform=\{social\.platform\} \/>/);
  assert.match(card, /rel="noopener noreferrer nofollow"/);
  assert.match(css, /\.author-box-topics li\s*\{/);
  assert.match(css, /\.author-box-socials a\s*\{/);
});

test("the compact bio is written copy, never a truncated CMS excerpt", async () => {
  const profiles = await source("../lib/author-profiles.ts");
  const card = await source("../components/expert-trust-card.tsx");

  assert.match(profiles, /shortBio:/);
  assert.match(card, /\{compact \? profile\.shortBio : profile\.bio\}/);
  // The CMS excerpt cut at 280 chars produced "Über Christian Christian M. Haas … Die Idee".
  assert.doesNotMatch(profiles, /shortBio:\s*\n?\s*bio\b/);
});

test("the Christian profile page states its facts for readers and machines alike", async () => {
  const [page, facts, profiles, css] = await Promise.all([
    source("../app/magazin/[slug]/page.tsx"),
    source("../components/author-profile-facts.tsx"),
    source("../lib/author-profiles.ts"),
    source("../app/globals.css"),
  ]);

  assert.match(page, /slug === "christian" && authorProfile \? \(/);
  assert.match(page, /<AuthorProfileFacts profile=\{authorProfile\} \/>/);
  assert.match(facts, /className="author-facts-grid"/);
  assert.match(facts, /<dt>\{fact\.label\}<\/dt>/);
  assert.match(profiles, /profileFacts: \[/);
  assert.match(profiles, /Tiere im Haushalt/);
  assert.match(css, /\.author-facts-item dt\s*\{/);

  // The page is the profile, so it must not repeat the author box underneath.
  assert.match(page, /authorProfile && slug !== "christian" \? \(/);
  // The hero lead used the same truncated excerpt as the old bio.
  assert.match(page, /slug === "christian" \? CHRISTIAN_PAGE_DESCRIPTION/);
});

test("Christian's identity profiles are complete and shared by box and schema", async () => {
  const profiles = await source("../lib/author-profiles.ts");

  assert.match(profiles, /https:\/\/datingnischen\.de\/christian/);
  assert.match(profiles, /https:\/\/www\.linkedin\.com\/in\/christian-m-haas-457323379/);
  assert.match(profiles, /https:\/\/www\.xing\.com\/profile\/ChristianM_Haas\/web_profiles/);
  assert.match(profiles, /https:\/\/gravatar\.com\/automatic8c1daff973/);
});
