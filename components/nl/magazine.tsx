import { MarketLink } from "@/components/market-link";
import { PreviewLinkRewriter } from "@/components/preview-link-rewriter";
import { PawIcon } from "@/components/city-page/tier-icons";
import { display } from "@/components/city-page/display-font";
import { getNlBreeds, type NlBreedEntry } from "@/lib/nl-magazine";
import { publicUrl } from "@/lib/markets";
import { staticAsset } from "#static-asset";
import { buildMagazineFaqGraph } from "@/lib/magazine-faq";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";
import "@/app/magazin/[slug]/magazin-article.css";

export function BreedGrid({ animal }: { animal?: "dog" | "cat" }) {
  return <ul className="tvh-grid nl-breed-grid">{getNlBreeds(animal).map(breed => <li key={breed.slug}>
    <MarketLink market="nl" path={`/magazin/${breed.slug}`} className="tvh-card">
      <span className="tvh-card-media"><img src={breed.image} alt={breed.imageAlt} loading="lazy" decoding="async"/><span className="tvh-card-region">{breed.animal === "dog" ? "Hondenrassen" : "Kattenrassen"}</span></span>
      <span className="tvh-card-body"><small>Rasportret</small><strong>{breed.name}</strong><span>{breed.description}</span><span className="tvh-card-go">Lees het rasportret <span aria-hidden="true">→</span></span></span>
    </MarketLink>
  </li>)}</ul>;
}

export function NlMagazine({ animal }: { animal?: "dog" | "cat" }) {
  const title = animal === "dog" ? "Hondenrassen: ontdek jouw favoriete hond" : animal === "cat" ? "Kattenrassen: ontdek jouw favoriete kat" : "Het magazine voor dierenliefhebbers";
  return <main className={`tvc tvh ${display.variable}`}><section className="tvc-hero tvh-hero"><div className="tvc-wrap"><nav className="tvc-crumbs" aria-label="Broodkruimels"><MarketLink market="nl" path="/">Home</MarketLink><span>›</span><MarketLink market="nl" path="/magazin">Magazine</MarketLink></nav><span className="tvc-badge"><PawIcon className="tvc-badge-paw"/>Met hart voor dieren</span><h1>{title}</h1><p className="tvc-lead">Van karakter en herkomst tot verzorging en samenleven: leer onze vijf hondenrassen en vijf kattenrassen kennen.</p><div className="tvc-actions"><MarketLink className="tvc-btn tvc-btn-primary" market="nl" path="/magazin/hondenrassen">Hondenrassen</MarketLink><MarketLink className="tvc-btn tvc-btn-ghost" market="nl" path="/magazin/kattenrassen">Kattenrassen</MarketLink></div></div></section><section className="tvc-wrap nl-breeds-section"><BreedGrid animal={animal}/></section></main>;
}

export function NlBreedPage({ entry }: { entry: NlBreedEntry }) {
  const animalPath = entry.animal === "dog" ? "/magazin/hondenrassen" : "/magazin/kattenrassen";
  const faqGraph = buildMagazineFaqGraph({ items: entry.faqItems, pageUrl: publicUrl("nl", `/magazin/${entry.slug}/`), pageName: `Veelgestelde vragen over ${entry.name}`, language: "nl-NL" });
  return <main className={`tvc ${display.variable}`}>
    {faqGraph ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqGraph).replace(/</g, "\\u003c") }}/> : null}
    <section className="tvc-hero tvm-article-hero tvm-breed-hero"><div className="tvc-wrap tvm-article-grid breed-hero-grid"><div className="tvc-hero-copy">
      <nav className="tvc-crumbs" aria-label="Broodkruimels"><MarketLink market="nl" path="/">Home</MarketLink><span>›</span><MarketLink market="nl" path="/magazin">Magazine</MarketLink><span>›</span><MarketLink market="nl" path={animalPath}>{entry.animal === "dog" ? "Hondenrassen" : "Kattenrassen"}</MarketLink></nav>
      <span className="tvc-badge"><PawIcon className="tvc-badge-paw"/>Rasportret · Profiel &amp; verzorging</span><h1>{entry.title}</h1><p className="tvc-lead">{entry.description}</p>
      <p className="tvm-article-meta">Door Christian M. Haas · Nederlandse vertaling</p><div className="tvc-actions"><a className="tvc-btn tvc-btn-primary" href={publicUrl("nl", "/registration/?AID=magazin")}>Dierenliefhebbers ontmoeten</a><a className="tvc-btn tvc-btn-ghost" href="#inhoud">Naar het rasportret ↓</a></div>
    </div><figure className="tvm-article-photo"><img src={entry.image} alt={entry.imageAlt} fetchPriority="high" decoding="async"/><figcaption><PawIcon/>{entry.name}</figcaption></figure></div></section>
    <div id="inhoud" className="shell shell-narrow magazine-detail-shell breed-detail-shell">
      <nav className="content-section content-section-tight breed-jump-nav-wrap" aria-label="Inhoud"><div className="breed-jump-nav"><span className="breed-jump-title">Inhoud</span>{entry.sections.map(section => <a className="breed-jump-link" key={section.id} href={`#${section.id}`}>{section.label}</a>)}</div></nav>
      <article className="content-section nl-breed-article"><div className="rich-content breed-rich-content" dangerouslySetInnerHTML={{ __html: entry.content }}/></article>
      <section className="content-section nl-flirt-radar" aria-labelledby="nl-radar-title">
        <MarketLink market="nl" path="/partnersuche" aria-label="Ontdek de stadsgidsen"><img src={staticAsset("/brand/flirtradar-nl.svg")} alt="Flirtradar voor dierenliefhebbers met gedeelde interesses" width={320} height={480} loading="lazy" decoding="async"/></MarketLink>
        <div><span className="eyebrow eyebrow-brand">Met hart voor dieren</span><h2 id="nl-radar-title">Jouw flirtradar: samen begint bij dierenliefde</h2><p>{entry.animal === "cat" ? `Dol op ${entry.name} en op mensen die jouw liefde voor katten begrijpen?` : `Dol op ${entry.name} en op mensen die jouw liefde voor honden delen?`} Een gedeelde passie is een mooi begin voor een gesprek.</p><p>Het Nederlandse ledenplatform opent bij de lancering. Ontdek tot die tijd onze stadsgidsen en vind inspiratie voor een ontspannen eerste date.</p><MarketLink market="nl" path="/partnersuche" className="tvc-btn tvc-btn-primary">Ontdek dating in jouw stad →</MarketLink><small>Illustratie met voorbeeldportretten; geen actuele leden of afstanden.</small></div>
      </section>
      <section className="content-section"><h2>Ontdek meer {entry.animal === "dog" ? "hondenrassen" : "kattenrassen"}</h2><BreedGrid animal={entry.animal}/></section>
    </div><PreviewLinkRewriter selector=".nl-breed-article"/>
  </main>;
}
