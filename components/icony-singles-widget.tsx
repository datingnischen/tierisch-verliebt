"use client";

import { useMemo, useState } from "react";
import styles from "./icony-singles-widget.module.css";

type Gender = "women" | "men";
type Props = {
  city: string;
  zip: string;
  country: number;
  platformId: string;
  registrationUrl: string;
  searchUrl: string;
  /** Italienische Texte für den Pilot tierisch-verliebt.ch/it/; Standard ist Deutsch. */
  locale?: "de" | "it";
};

const COPY = {
  de: {
    noscript: "Für Profilvorschauen bitte JavaScript aktivieren oder die ausführliche Suche nutzen.",
    loading: "Singles werden geladen…",
    empty: "Gerade keine Schnelltreffer. Bitte nutze die ausführliche Suche.",
    photo: "Profilbild von ",
    profileFrom: "Profil aus ",
    years: " Jahre",
    women: "Frauen",
    men: "Männer",
    eyebrow: "Singles entdecken",
    title: (city: string) => `Neue tierliebe Singles in ${city}`,
    intro: (city: string) => `Wähle Frauen oder Männer und entdecke echte Profilvorschauen aus ${city} und Umgebung.`,
    legend: "Profile auswählen",
    from: (label: string, city: string) => `${label} aus ${city}`,
    lazy: (city: string) => `Die Profilvorschauen aus ${city} werden geladen, sobald du diesen Bereich ansiehst.`,
    search: (city: string) => `Ausführlicher in ${city} suchen`,
    claim: "Kostenlos starten · Umkreis erweitern · tierliebe Menschen treffen",
  },
  it: {
    noscript: "Per vedere i profili attiva JavaScript o usa la ricerca dettagliata.",
    loading: "Caricamento dei profili…",
    empty: "Al momento nessun profilo in evidenza. Usa la ricerca dettagliata.",
    photo: "Foto profilo di ",
    profileFrom: "Profilo da ",
    years: " anni",
    women: "Donne",
    men: "Uomini",
    eyebrow: "Scopri i single",
    title: (city: string) => `Single che amano gli animali vicino a ${city}`,
    intro: (city: string) => `Scegli donne o uomini e scopri profili reali da ${city} e dintorni.`,
    legend: "Scegli i profili",
    from: (label: string, city: string) => `${label} da ${city}`,
    lazy: (city: string) => `I profili da ${city} vengono caricati quando arrivi a questa sezione.`,
    search: (city: string) => `Cerca in modo dettagliato vicino a ${city}`,
    claim: "Iscrizione gratuita · Amplia il raggio · Incontra chi ama gli animali",
  },
};

function buildWidgetDocument({ city, zip, country, platformId, registrationUrl, gender, locale = "de" }: Props & { gender: Gender }) {
  const copy = COPY[locale];
  const options = JSON.stringify({
    city,
    zip,
    country,
    platformId,
    registrationUrl,
    gender: gender === "women" ? 2 : 1,
    count: 6,
    years: copy.years,
    photo: copy.photo,
    profileFrom: copy.profileFrom,
    loading: copy.loading,
    empty: copy.empty,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<meta name="referrer" content="no-referrer" />
<style>
:root{color-scheme:light;--red:#c02e2e;--dark:#6f1b1b;--green:#429a45;--line:#ead5d5;--muted:#655b5b}*{box-sizing:border-box}body{margin:0;background:transparent;color:#332b2b;font-family:"Open Sans",Arial,sans-serif}.state{display:grid;min-height:285px;place-items:center;padding:20px;border:1px solid var(--line);border-radius:20px;background:#fffafa;color:var(--dark);font-weight:700;text-align:center}.grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.tile{display:grid;min-width:0;gap:8px;padding:10px;border:1px solid var(--line);border-radius:18px;background:#fff;text-decoration:none;color:inherit;box-shadow:0 10px 24px rgba(80,30,30,.08);transition:.18s}.tile:hover,.tile:focus-visible{transform:translateY(-2px);border-color:var(--red);outline:none}.image{overflow:hidden;aspect-ratio:1;border-radius:14px;background:#f6eeee}.image img{display:block;width:100%;height:100%;object-fit:cover}.tile strong,.tile span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tile strong{font-size:.94rem}.tile span{color:var(--muted);font-size:.8rem}@media(max-width:700px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:430px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style></head><body>
<div id="root" class="state">${copy.noscript.replace(/</g, "&lt;")}</div>
<script>(function(){
var options=${options},completed=false,root=document.getElementById("root");root.textContent=options.loading;
function install(i,c,o,n,y,j,s){i.IconyObject=y;i[y]=i[y]||function(){function b(a){return a?(a^Math.random()*16>>a/4).toString(16):"i"+([1e7]+1e7).replace(/[018]/g,b)+1*new Date}var k=arguments;k.id=b();(i[y].q=i[y].q||[]).push(k);i[y].R?.();return k.id};j=c.createElement(o);s=c.getElementsByTagName(o)[0];j.async=1;j.src=n;s.parentNode.insertBefore(j,s)}
function fallback(){if(completed)return;completed=true;root.className="state";root.textContent=options.empty}
function safeImage(value){if(typeof value!=="string")return"";if(value.startsWith("//"))return"https:"+value;return value.startsWith("https://")?value:""}
function render(response){var items=response&&Array.isArray(response.data)?response.data.filter(function(item){return item&&item.gender===(options.gender===2?"female":"male")}):[];if(!items.length)return fallback();completed=true;root.className="grid";root.textContent="";items.slice(0,options.count).forEach(function(item){var a=document.createElement("a"),imageWrap=document.createElement("div"),strong=document.createElement("strong"),span=document.createElement("span"),image=safeImage(item.imageurl);a.className="tile";a.href=options.registrationUrl;a.target="_blank";a.rel="noopener noreferrer";imageWrap.className="image";if(image){var img=document.createElement("img");img.src=image;img.loading="lazy";img.alt=options.photo+String(item.username||"Profil");imageWrap.appendChild(img)}strong.textContent=String(item.username||options.profileFrom+options.city);span.textContent=String(item.userinfo_text||[item.age?item.age+options.years:"",item.city||options.city].filter(Boolean).join(", "));a.append(imageWrap,strong,span);root.appendChild(a)})}
install(window,document,"script","https://js.icony.com/api.js","icony");window.icony("create",options.platformId);window.icony("get", "activities", "json",render,{count:options.count,gender:options.gender,country:options.country,zip:options.zip,affiliate:"location",use_thumbnails:0,blurred:0});setTimeout(fallback,10000)
})();</script></body></html>`;
}

export function IconySinglesWidget(props: Props) {
  const [gender, setGender] = useState<Gender>("women");
  const srcDoc = useMemo(() => buildWidgetDocument({ ...props, gender }), [props, gender]);
  const copy = COPY[props.locale ?? "de"];
  const selectedLabel = gender === "women" ? copy.women : copy.men;
  const controlName = `tierisch-singles-${props.platformId}-${props.zip}`;

  return (
    <section className={styles.widget} aria-labelledby={`singles-${props.zip}`}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id={`singles-${props.zip}`}>{copy.title(props.city)}</h2>
        <p>{copy.intro(props.city)}</p>
      </div>
      <fieldset className={styles.controls}>
        <legend>{copy.legend}</legend>
        {(["women", "men"] as const).map((value) => (
          <label className={gender === value ? styles.active : undefined} key={value}>
            <input type="radio" name={controlName} checked={gender === value} onChange={() => setGender(value)} />
            {value === "women" ? copy.women : copy.men}
          </label>
        ))}
      </fieldset>
      <div className={styles.framePanel}>
        <strong>{copy.from(selectedLabel, props.city)}</strong>
        <p>{copy.lazy(props.city)}</p>
        <iframe key={gender} className={styles.frame} title={copy.from(selectedLabel, props.city)} srcDoc={srcDoc} loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" />
      </div>
      <div className={styles.actions}>
        <a href={props.searchUrl} target="_blank" rel="noopener noreferrer">{copy.search(props.city)}</a>
        <span>{copy.claim}</span>
      </div>
    </section>
  );
}
