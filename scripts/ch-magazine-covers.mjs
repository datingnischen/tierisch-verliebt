// Eigene Vektorillustrationen; PNG-Ausgaben für Open Graph und ICONYs Bildschnittstelle.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const dir = new URL("../public/magazin/media/ch/", import.meta.url);
await mkdir(dir, { recursive: true });
const person = (x, y, shirt, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">
  <path d="M-28 150L-38 270H-7L14 164 38 270H68L47 146" fill="#3e4652"/>
  <path d="M-40 265H-6L2 282H-46Q-53 272-40 265M38 265H67L80 282H35Z" fill="#342d37"/>
  <path d="M-36 30Q4 10 43 36L57 158Q17 179-43 155Z" fill="${shirt}"/>
  <path d="M-33 43L-67 117-46 124-11 66M40 45L65 111 116 119 119 136 46 133 17 70" fill="${shirt}" stroke="${shirt}" stroke-width="16" stroke-linejoin="round"/>
  <path d="M112 119L132 124 130 138 115 136" fill="#c48b69"/>
  <rect x="-5" y="-1" width="25" height="34" rx="9" fill="#c48b69"/>
  <ellipse cx="7" cy="-24" rx="32" ry="38" fill="#dca37e"/>
  <path d="M-25-19Q-43-72 8-67 49-66 37-20L25-42Q-10-34-25-19" fill="#453039"/>
  <path d="M26-17Q32-14 25-9" fill="none" stroke="#825747" stroke-width="3"/>
</g>`;
const dog = (x, y, coat = "#b16b43", flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">
  <path d="M-83 13Q-127-16-113-44" fill="none" stroke="${coat}" stroke-width="17" stroke-linecap="round"/>
  <path d="M-90 0Q-60-23 12-2L40 13 12 57H-77Z" fill="${coat}"/>
  <path d="M-77 32L-80 95H-59L-49 44M-4 38L3 95H24L20 28" fill="${coat}"/>
  <path d="M3 14L17-51Q25-73 56-62L72-38 100-32 98-13 62-7 47 39" fill="${coat}"/>
  <path d="M22-52Q5-45 13-8 28 5 35-43" fill="#563c35"/>
  <ellipse cx="63" cy="-40" rx="4" ry="5" fill="#332c31"/><path d="M91-32H103V-20H94Z" fill="#332c31"/>
  <path d="M12-6L59 10" stroke="#5e7469" stroke-width="9"/>
</g>`;
const outdoors = `<path d="M0 397Q190 278 392 366T795 325T1200 352V800H0Z" fill="#cbd3ba"/>
  <path d="M0 480Q295 400 497 461T1200 430V800H0Z" fill="#b6c2a4"/>
  <path d="M-100 773Q479 459 1300 687" fill="none" stroke="#e8c9a4" stroke-width="154"/>
  <g fill="#687c66"><path d="M79 452V205H92V452Z"/><ellipse cx="83" cy="251" rx="77" ry="103"/><path d="M1088 401V202H1100V401Z"/><ellipse cx="1093" cy="229" rx="82" ry="105"/></g>`;
const base = (inner, room = false) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${room ? '#f1dfcc' : '#f5e7d4'}"/><circle cx="960" cy="150" r="65" fill="#e5b878"/>${inner}</svg>`;
const scenes = {
  "erstes-date-mit-hund": base(`${outdoors}<ellipse cx="572" cy="664" rx="340" ry="29" fill="#78604e" opacity=".13"/>${person(345,360,"#9c4150")}${person(780,351,"#e1b773",true)}<path d="M470 487Q520 506 584 558" stroke="#5b5955" stroke-width="5" fill="none"/>${dog(640,553)}<path d="M517 164Q544 120 571 163Q598 119 622 163Q627 192 570 224Q512 192 517 164" fill="#af5960" opacity=".7"/>`),
  "neuer-partner-und-katze": base(`<rect x="55" y="85" width="360" height="330" rx="90" fill="#d4d9cc"/><path d="M235 85V415M55 251H415" stroke="#fffcf5" stroke-width="12"/><path d="M0 570H1200V800H0Z" fill="#d6b99d"/><rect x="380" y="436" width="630" height="239" rx="50" fill="#8d9b83"/><rect x="410" y="402" width="560" height="210" rx="45" fill="#a7b297"/><rect x="448" y="641" width="30" height="73" fill="#6f584b"/><rect x="924" y="641" width="30" height="73" fill="#6f584b"/>${person(620,347,"#9c4150")}${person(850,345,"#e1b773",true)}<rect x="140" y="480" width="30" height="240" rx="10" fill="#a68362"/><rect x="78" y="464" width="163" height="26" rx="13" fill="#b18b68"/><ellipse cx="153" cy="438" rx="65" ry="39" fill="#4e5663"/><path d="M112 421L110 360 136 380 171 379 196 356 198 419Z" fill="#4e5663"/><path d="M118 390L120 375 132 389M178 388L190 373 189 394" fill="#c78f84"/><path d="M131 405L142 405M168 405L180 405" stroke="#ead8b9" stroke-width="4" stroke-linecap="round"/><path d="M210 442Q278 473 260 400" fill="none" stroke="#4e5663" stroke-width="15" stroke-linecap="round"/><ellipse cx="1060" cy="650" rx="64" ry="18" fill="#a78f70"/><path d="M1057 639V464M1057 564Q987 552 1000 493M1057 523Q1124 510 1112 455" fill="none" stroke="#6c8068" stroke-width="13"/><path d="M1005 651H1107L1092 721H1021Z" fill="#a85c4b"/>`,true),
  "zwei-singles-zwei-hunde": base(`${outdoors}<path d="M-40 572Q560 360 1240 480" fill="none" stroke="#eddbbe" stroke-width="74"/>${person(370,194,"#7c8a73")}<path d="M498 324Q551 340 619 397" fill="none" stroke="#565850" stroke-width="5"/>${dog(670,386,"#68534a")}<ellipse cx="640" cy="717" rx="380" ry="25" fill="#78604e" opacity=".13"/>${person(290,408,"#9c4150")}<path d="M414 533Q473 560 528 607" fill="none" stroke="#565850" stroke-width="5"/>${dog(581,597,"#bd8051")}<path d="M935 491V580M920 506L935 491 950 506M920 565L935 580 950 565" fill="none" stroke="#5f735e" stroke-width="5" stroke-linecap="round"/>`),
};
for (const [slug, svg] of Object.entries(scenes)) {
  await writeFile(new URL(`${slug}.svg`, dir), svg);
  await sharp(Buffer.from(svg)).png().toFile(new URL(`${slug}.png`, dir).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
}
console.log("3 Schweizer Magazinillustrationen als SVG und PNG erzeugt.");
