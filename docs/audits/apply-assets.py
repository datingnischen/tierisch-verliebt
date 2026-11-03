from pathlib import Path
import re,json,csv,html
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
AUDIT=ROOT/'docs/audits'
CSV={int(r['id']):r for r in csv.DictReader((AUDIT/'2026-11-03-bildinventar.csv').open(encoding='utf-8-sig'))}
MANIFESTS=['2026-11-03-initial-four.json','2026-11-03-graphics.json','2026-11-03-food-a.json','2026-11-03-food-b.json','2026-11-03-other-photos.json']
records={}
for name in MANIFESTS:
 p=AUDIT/name
 if not p.exists():continue
 for r in json.loads(p.read_text(encoding='utf-8-sig')):
  r['id']=int(r['id']);r['oldAsset']=CSV[r['id']]['asset']
  r['articles']=CSV[r['id']]['artikel'].split(';')
  if not r.get('alt'):r['alt']='; '.join([r.get('title','Schaubild'),*r.get('labels',[])])
  records[r['id']]=r
byarticle={}
for r in records.values():
 assert (ROOT/'public'/r['newAsset'].lstrip('/')).is_file(),r
 for slug in r['articles']:byarticle.setdefault(slug,[]).append(r)
changed=[]
for slug,rs in byarticle.items():
 p=ROOT/'content/magazin'/f'{slug}.md'
 raw=p.read_bytes();newline='\r\n' if b'\r\n' in raw else '\n';t=raw.decode('utf-8').replace('\r\n','\n');before=t
 for r in rs:
  key=re.sub(r'-\d+x\d+(?=\.)','',r['oldAsset']);stem,ext=key.rsplit('.',1)
  family=re.compile(re.escape(stem)+r'(?:-\d+x\d+)?\.'+re.escape(ext))
  w,h=Image.open(ROOT/'public'/r['newAsset'].lstrip('/')).size
  isgraphic=bool(r.get('urls')) and not r.get('photo',False)
  def img(m):
   tag=m.group(0)
   if r['newAsset'] in tag:
    return re.sub(r'\salt=([\"\'])(.*?)\1', ' alt=\"'+html.escape(r['alt'],quote=True)+'\"', tag)
   if not family.search(tag):return tag
   alt=html.escape(r['alt'],quote=True)
   new=f'<img decoding="async" loading="lazy" src="{r["newAsset"]}" alt="{alt}" width="{w}" height="{h}" />'
   if isgraphic:new=f'<a href="{r["newAsset"]}" target="_blank" rel="noopener" aria-label="Grafik in voller Größe öffnen">{new}</a>'
   return new
  t=re.sub(r'<img\b[^>]*>',img,t)
  oldfeatured=re.search(r'^image: ["\']?([^\n"\']+)',t,re.M)
  if oldfeatured and (family.search(oldfeatured.group(1)) or oldfeatured.group(1)==r['newAsset']):
   t=re.sub(r'^image: .*$',f'image: "{r["newAsset"]}"',t,flags=re.M)
   t=re.sub(r'^imageAlt: .*$',f'imageAlt: {json.dumps(r["alt"],ensure_ascii=False)}',t,flags=re.M)
  t=family.sub(r['newAsset'],t)
  # Current paths identify an already updated record; refresh accessible labels idempotently.
  if isgraphic and r.get('labels'):
   mark=f'<!-- graphic-text-{r["id"]} -->'
   if mark not in t:
    items=''.join(f'<li>{html.escape(label)}</li>' for label in r['labels'])
    block=f'{mark}<details><summary>Grafik als Text lesen</summary><ul>{items}</ul></details><!-- /graphic-text-{r["id"]} -->'
    # Place immediately after paragraph/figure containing the image where possible.
    pos=t.find(r['newAsset'],t.find('---',3)+3)
    if pos>=0:
     close=re.search(r'</(?:figure|p|h2)>',t[pos:])
     if close:t=t[:pos+close.end()]+'\n'+block+t[pos+close.end():]
  if isgraphic and r.get('id')==444 and 'Die Volierenzeichnung ist schematisch und nicht maßstabsgetreu.' not in t:
   t+='\n<p>Die Volierenzeichnung ist schematisch und nicht maßstabsgetreu. Größe und Ausstattung müssen zur Vogelart und zur Zahl der Tiere passen.</p>\n'
 # Remove previous generated credit paragraphs and build a single auto-collapsed credit group.
 t=re.sub(r'<!-- audit-visual-credit -->[\s\S]*?<!-- /audit-visual-credit -->\s*','',t)
 urls=list(dict.fromkeys(u for r in rs for u in r.get('urls',[])))
 credit='<p class="bildnachweis">Bildnachweis: Die im November 2026 erneuerten Bilder und Grafiken wurden mit KI-Unterstützung von Codex erstellt. Fotos zeigen Symbolmotive; Illustrationen sind schematisch und nicht maßstabsgetreu.</p>'
 if urls:credit+='\n<p class="bildnachweis">Quellen zu den neuen Schaubildern (abgerufen am 3. November 2026): '+', '.join(f'<a href="{html.escape(u,quote=True)}" target="_blank" rel="noopener noreferrer">{html.escape(u.split("/")[2])}</a>' for u in urls)+'.</p>'
 t=t.rstrip()+'\n\n<!-- audit-visual-credit -->\n'+credit+'\n<!-- /audit-visual-credit -->\n'
 if t!=before:
  t=re.sub(r'^updated: .*$', 'updated: "2026-11-03T12:00:00+01:00"',t,flags=re.M)
  p.write_bytes(t.replace('\n',newline).encode('utf-8'));changed.append(slug)
# Complete mapping can be read by QA without modifying the audit CSV.
(AUDIT/'2026-11-03-applied.json').write_text(json.dumps(list(records.values()),ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'records':len(records),'articles':len(byarticle),'changed':len(changed)},ensure_ascii=False))
