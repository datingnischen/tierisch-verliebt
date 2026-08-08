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
};

function buildWidgetDocument({ city, zip, country, platformId, registrationUrl, gender }: Props & { gender: Gender }) {
  const options = JSON.stringify({
    city,
    zip,
    country,
    platformId,
    registrationUrl,
    gender: gender === "women" ? 2 : 1,
    count: 6,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<meta name="referrer" content="no-referrer" />
<style>
:root{color-scheme:light;--red:#c02e2e;--dark:#6f1b1b;--green:#429a45;--line:#ead5d5;--muted:#655b5b}*{box-sizing:border-box}body{margin:0;background:transparent;color:#332b2b;font-family:"Open Sans",Arial,sans-serif}.state{display:grid;min-height:285px;place-items:center;padding:20px;border:1px solid var(--line);border-radius:20px;background:#fffafa;color:var(--dark);font-weight:700;text-align:center}.grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.tile{display:grid;min-width:0;gap:8px;padding:10px;border:1px solid var(--line);border-radius:18px;background:#fff;text-decoration:none;color:inherit;box-shadow:0 10px 24px rgba(80,30,30,.08);transition:.18s}.tile:hover,.tile:focus-visible{transform:translateY(-2px);border-color:var(--red);outline:none}.image{overflow:hidden;aspect-ratio:1;border-radius:14px;background:#f6eeee}.image img{display:block;width:100%;height:100%;object-fit:cover}.tile strong,.tile span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tile strong{font-size:.94rem}.tile span{color:var(--muted);font-size:.8rem}@media(max-width:700px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:430px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style></head><body>
<div id="root" class="state">Für Profilvorschauen bitte JavaScript aktivieren oder die ausführliche Suche nutzen.</div>
<script>(function(){
var options=${options},completed=false,root=document.getElementById("root");root.textContent="Singles werden geladen…";
function install(i,c,o,n,y,j,s){i.IconyObject=y;i[y]=i[y]||function(){function b(a){return a?(a^Math.random()*16>>a/4).toString(16):"i"+([1e7]+1e7).replace(/[018]/g,b)+1*new Date}var k=arguments;k.id=b();(i[y].q=i[y].q||[]).push(k);i[y].R?.();return k.id};j=c.createElement(o);s=c.getElementsByTagName(o)[0];j.async=1;j.src=n;s.parentNode.insertBefore(j,s)}
function fallback(){if(completed)return;completed=true;root.className="state";root.textContent="Gerade keine Schnelltreffer. Bitte nutze die ausführliche Suche."}
function safeImage(value){if(typeof value!=="string")return"";if(value.startsWith("//"))return"https:"+value;return value.startsWith("https://")?value:""}
function render(response){var items=response&&Array.isArray(response.data)?response.data.filter(function(item){return item&&item.gender===(options.gender===2?"female":"male")}):[];if(!items.length)return fallback();completed=true;root.className="grid";root.textContent="";items.slice(0,options.count).forEach(function(item){var a=document.createElement("a"),imageWrap=document.createElement("div"),strong=document.createElement("strong"),span=document.createElement("span"),image=safeImage(item.imageurl);a.className="tile";a.href=options.registrationUrl;a.target="_blank";a.rel="noopener noreferrer";imageWrap.className="image";if(image){var img=document.createElement("img");img.src=image;img.loading="lazy";img.alt="Profilbild von "+String(item.username||"Profil");imageWrap.appendChild(img)}strong.textContent=String(item.username||"Profil aus "+options.city);span.textContent=String(item.userinfo_text||[item.age?item.age+" Jahre":"",item.city||options.city].filter(Boolean).join(", "));a.append(imageWrap,strong,span);root.appendChild(a)})}
install(window,document,"script","https://js.icony.com/api.js","icony");window.icony("create",options.platformId);window.icony("get", "activities", "json",render,{count:options.count,gender:options.gender,country:options.country,zip:options.zip,affiliate:"location",use_thumbnails:0,blurred:0});setTimeout(fallback,10000)
})();</script></body></html>`;
}

export function IconySinglesWidget(props: Props) {
  const [gender, setGender] = useState<Gender>("women");
  const srcDoc = useMemo(() => buildWidgetDocument({ ...props, gender }), [props, gender]);
  const selectedLabel = gender === "women" ? "Frauen" : "Männer";
  const controlName = `tierisch-singles-${props.platformId}-${props.zip}`;

  return (
    <section className={styles.widget} aria-labelledby={`singles-${props.zip}`}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Singles entdecken</p>
        <h2 id={`singles-${props.zip}`}>Neue tierliebe Singles in {props.city}</h2>
        <p>Wähle Frauen oder Männer und entdecke echte Profilvorschauen aus deiner Region.</p>
      </div>
      <fieldset className={styles.controls}>
        <legend>Profile auswählen</legend>
        {(["women", "men"] as const).map((value) => (
          <label className={gender === value ? styles.active : undefined} key={value}>
            <input type="radio" name={controlName} checked={gender === value} onChange={() => setGender(value)} />
            {value === "women" ? "Frauen" : "Männer"}
          </label>
        ))}
      </fieldset>
      <div className={styles.framePanel}>
        <strong>{selectedLabel} aus {props.city}</strong>
        <p>Die Profilvorschauen werden geladen, sobald du diesen Bereich ansiehst.</p>
        <iframe key={gender} className={styles.frame} title={`${selectedLabel} aus ${props.city}`} srcDoc={srcDoc} loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" />
      </div>
      <div className={styles.actions}>
        <a href={props.searchUrl} target="_blank" rel="noopener noreferrer">Ausführlicher in {props.city} suchen</a>
        <span>Kostenlos starten · Umkreis erweitern · tierliebe Menschen treffen</span>
      </div>
    </section>
  );
}
