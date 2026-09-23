import assert from "node:assert/strict";
import test from "node:test";
import { detectMagazineAnimal, getMagazineSidebarVariant, MAGAZINE_SIDEBAR_DEFAULT_IMAGE } from "../lib/magazine-animal.ts";

test("tierwelt group wins over everything else", () => {
  assert.equal(detectMagazineAnimal({ tierweltGroupId: "katzenwelten", title: "Ragdoll", content: "Hund Hund Hund" }), "katze");
});

test("wordpress category decides for posts", () => {
  assert.equal(detectMagazineAnimal({ title: "Futter im Test", content: "", categorySlugs: ["ratgeber-hund"] }), "hund");
});

test("title and dominant content keywords are used as fallback", () => {
  assert.equal(detectMagazineAnimal({ title: "Sibirische Katze", content: "" }), "katze");
  assert.equal(detectMagazineAnimal({ title: "Korat", content: "<p>Die Katze ist ruhig. Katzen mögen Wärme. Ein Kater braucht Platz.</p>" }), "katze");
  assert.equal(detectMagazineAnimal({ title: "Hundertwasser", content: "" }), "allgemein");
});

test("mixed content stays generic", () => {
  assert.equal(detectMagazineAnimal({ title: "Hunde und Katzen zusammen", content: "Hund Katze Hund Katze" }), "allgemein");
});

test("every variant resolves to an image", () => {
  for (const animal of ["katze", "hund", "vogel", "pferd", "allgemein"]) {
    const variant = getMagazineSidebarVariant(animal);
    assert.ok(variant.image);
    assert.ok(variant.audience);
  }
  assert.equal(getMagazineSidebarVariant("allgemein").image, MAGAZINE_SIDEBAR_DEFAULT_IMAGE);
});

test("cat pages use the couple-with-cat image", () => {
  assert.equal(getMagazineSidebarVariant("katze").image, "/home/sidebar-paar-katze.webp");
});
