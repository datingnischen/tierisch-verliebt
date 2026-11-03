from pathlib import Path
import re
changes={
'ara-futter':[
('Die Basis sollte aus frischer, pflanzlicher Kost bestehen – ergänzt durch hochwertige Saaten und Nüsse in kontrollierten Mengen.','Welche Futterbasis und welche Ergänzungen passen, hängt unter anderem von Ara-Art, Aktivität und Gesundheitszustand ab. Saaten und Nüsse allein ergeben keine ausgewogene Ernährung.'),
('<p>Ein ausgewogener Futterplan besteht aus:</p>\n<ul>\n<li>60–70 % frischem Gemüse</li>\n<li>15–25 % Obst</li>\n<li>10–20 % hochwertigen Körnern, Nüssen oder Pellets</li>\n</ul>\n<p>Die genaue Zusammensetzung kann je nach Aktivitätslevel variieren.</p>','<p>VCA Animal Hospitals beschreibt geeignete Pellets als mögliche Futterbasis für Aras, ergänzt durch Gemüse, bedarfsabhängige Nüsse und begrenzte Obstmengen. Die Empfehlungen lassen sich nicht als pauschale Prozentformel auf jede Ara-Art übertragen. Stimme die Ration und eine Futterumstellung mit einer vogelkundigen Praxis ab.</p>'),
('Gemüse – die wichtigste Grundlage','Gemüse – eine frische Ergänzung'),
('Gemüse sollte täglich frisch angeboten werden und den größten Anteil der Nahrung ausmachen.','Gemüse ergänzt die abgestimmte Grundration. Wasche es gründlich, schneide es passend zum Vogel und entferne verderbliche Reste zeitnah.'),
('Körner &amp; Pellets – ergänzend einsetzen','Grundfutter: Körnermischungen und Pellets unterscheiden'),
('Hochwertige Körnermischungen oder spezielle Großpapageien-Pellets können eine sinnvolle Ergänzung sein. Achte auf:','Körnermischungen und formulierte Pellets sind nicht gleichwertig: Bei Mischungen können Vögel bevorzugte Saaten auswählen. Geeignete Pellets sollen dagegen eine ausgewogene Nährstoffversorgung erleichtern. Die Auswahl gehört zum individuellen Futterplan. Achte auf:'),
('Pellets können helfen, Nährstofflücken zu schließen, sollten jedoch Frischfutter nicht ersetzen.','Eine Umstellung auf Pellets braucht Geduld und fachliche Begleitung. Stelle sicher, dass dein Ara das neue Futter tatsächlich frisst; entziehe ihm nicht einfach die vertraute Nahrung.'),
('Auch Mineralstoffe wie Kalzium sollten dauerhaft verfügbar sein.','Zusätzliche Vitamin- oder Mineralstoffpräparate nur nach vogelkundiger Empfehlung einsetzen; der Bedarf hängt auch vom verwendeten Grundfutter ab.'),
('Frisches Gemüse bildet die Basis, Obst und Nüsse ergänzen, während Körner und Pellets kontrolliert eingesetzt werden sollten.','Eine geeignete Futterbasis wird durch passende Frischkost ergänzt. Wie viel Obst, Nüsse oder Saaten sinnvoll sind, muss zur jeweiligen Ara-Art und zum einzelnen Tier passen.')],
'graupapagei-futter':[
('Die Basis: Frisches Gemüse als Hauptbestandteil','Abwechslungsreiche Ernährung individuell planen'),
('Graupapageien sollten überwiegend pflanzlich und abwechslungsreich ernährt werden. Der größte Anteil der täglichen Fütterung sollte aus frischem Gemüse bestehen (ca. 60–70 %).','Graupapageien brauchen eine abwechslungsreiche, bedarfsgerechte Ration. Die Universität Leipzig beschreibt Samen und Sämereien beziehungsweise geeignete Pellets als Grundfutter, ergänzt durch Gemüse, Grünfutter und Obst. Eine allgemeine Gemüse-Prozentformel ersetzt keinen abgestimmten Futterplan.'),
('Obst enthält natürlichen Zucker und sollte deshalb nur ergänzend gefüttert werden (ca. 20–30 % der Frischkost).','Obst gehört in den abgestimmten Futterplan und sollte die übrigen Bestandteile nicht verdrängen. Die passende Menge hängt von der Gesamtration und vom einzelnen Vogel ab.'),
('Graupapageien sind keine reinen Körnerfresser. Hochwertige Körnermischungen sollten nur einen kleinen Teil der täglichen Ernährung ausmachen.','Saaten können zur Ration gehören, eine einseitige Auswahl bevorzugter Körner ist jedoch zu vermeiden. Ob eine geeignete Mischung oder formulierte Pellets besser passen, sollte mit einer vogelkundigen Praxis besprochen werden.')],
'papageien-gesundheit':[
('Wenn mehrere dieser Symptome gleichzeitig auftreten, sollte schnell gehandelt werden.','Schon eine auffällige Veränderung ist ein Anlass, eine vogelkundige Praxis zu kontaktieren. Warte nicht darauf, dass mehrere Symptome zusammenkommen.'),
('Wenn ein Papagei plötzlich krank wirkt, sind einige Sofortmaßnahmen hilfreich:','Wenn ein Papagei plötzlich krank wirkt, kontaktiere eine vogelkundige Praxis und kläre das weitere Vorgehen. Bei Atemnot, starker Blutung oder fehlender Sitzfähigkeit ist sofortige Hilfe im Notdienst nötig. Bis dahin:'),
('<li>Vogel warm halten</li>','<li>Temperatur und Transport mit der Praxis abstimmen; keine eigenmächtige starke Wärmezufuhr</li>'),
('Wichtig: Erste Hilfe ersetzt keinen Tierarzt. Sie dient nur dazu, den Vogel zu stabilisieren.','Wichtig: Diese Schritte ersetzen keine Untersuchung. Verabreiche keine Medikamente oder Hausmittel ohne tierärztliche Anweisung.'),
('<li>Atemproblemen</li>','<li>Atemnot</li>\n<li>Unfähigkeit, auf einer Stange zu sitzen</li>')],
'voegel-als-haustiere':[
('Einige Vogelarten benötigen mehrere Stunden Aufmerksamkeit am Tag, andere kommen besser mit Phasen allein zurecht. Besonders Papageien und Sittiche brauchen soziale Interaktion, Spiel und Freiflug.','Versorgung, Reinigung, Beobachtung und Beschäftigung gehören jeden Tag dazu. Eine pauschale Stundenangabe sagt wenig darüber aus, ob die Bedürfnisse einer Vogelart erfüllt werden. Gesellschaft von Artgenossen lässt sich durch menschliche Aufmerksamkeit nicht ersetzen.'),
('Während kleine Vögel auch in Wohnungen gut gehalten werden können, brauchen größere Arten viel Raum, große Käfige oder sogar eigene Vogelzimmer.','Auch kleine Vögel benötigen viel Flugraum. Eine großzügige Voliere und ein sicherer Bereich für zusätzlichen Freiflug müssen vor der Anschaffung geplant werden; kleine Standardkäfige reichen dafür nicht aus.'),
('Anfänger sollten mit robusten und pflegeleichten Arten starten, bevor sie sich an anspruchsvolle Vögel wagen.','Informiere dich vor der Aufnahme über die konkrete Vogelart und lass dich fachkundig beraten. Auch bei kleineren Arten sind Sozialkontakt, Flugraum und langfristige Versorgung anspruchsvolle Aufgaben.'),
('Wellensittiche – die unkomplizierten Klassiker','Wellensittiche – gesellige Flugkünstler'),
('Sie sind klein, lebhaft und relativ pflegeleicht. Besonders für Anfänger sind sie eine gute Wahl, da sie sich schnell an Menschen gewöhnen und in Paaren oder kleinen Gruppen gehalten werden können.','Sie sind klein und lebhaft, brauchen aber viel Flugraum und müssen mit Artgenossen leben. Der Deutsche Tierschutzbund empfiehlt Gruppenhaltung, mindestens jedoch ein Pärchen.'),
('Berufstätige mit etwas Zeit am Abend, Familien, Anfänger','Menschen, die tägliche Versorgung, Artgenossen und sicheren Flugraum dauerhaft gewährleisten können'),
('Sie sind weniger auf menschliche Nähe angewiesen und beschäftigen sich oft gut allein oder mit Artgenossen. Wer einen ruhigen, schönen Vogel sucht, der das Zuhause mit Klang erfüllt, findet hier einen idealen Begleiter.','Menschliche Zuwendung ersetzt auch bei ihnen keinen passenden Artgenossen. Sie brauchen Flugraum und eine Haltung, die ihr Sozialverhalten berücksichtigt.'),
('Menschen mit wenig Zeit, Ruhesuchende, kleine Wohnungen','Menschen, die Freude am Beobachten haben und die Bedürfnisse der Art dauerhaft erfüllen können'),
('und idealerweise einen Artgenossen.','und einen passenden artgleichen Partner.'),
('<p><strong>Geeignet für:</strong> Erfahrene Halter, Menschen mit viel Zeit und Platz, echte Tierliebhaber</p>','<p>Großpapageien stellen besonders hohe Anforderungen. Das Bayerische LGL rät von ihrer privaten Haltung ab, weil ihre Bedürfnisse in menschlicher Obhut kaum erfüllt werden können. Wer bereits solche Vögel hält, braucht fachkundige Unterstützung bei Haltung und Versorgung.</p>'),
('Die meisten Vogelarten sind soziale Tiere. Sie fühlen sich in Gesellschaft wohler und zeigen ein ausgeglicheneres Verhalten. Besonders Sittiche und Papageien sollten nicht dauerhaft allein gehalten werden.','Die hier beschriebenen Ziervögel brauchen passende Artgenossen. Einzelhaltung ist keine geeignete Lösung, um einen Vogel stärker an den Menschen zu binden.'),
('Welcher Vogel passt zu deinen Alltag?','Vier Bedürfnisse für einen vogelfreundlichen Lebensraum')]
}
for slug,replacements in changes.items():
 p=Path('content/magazin')/(slug+'.md');raw=p.read_bytes();nl='\r\n' if b'\r\n' in raw else '\n';t=raw.decode().replace('\r\n','\n')
 for old,new in replacements:
  if old not in t:
   if new in t:continue
   raise RuntimeError(slug+' missing '+old[:80])
  t=t.replace(old,new)
 if slug=='voegel-als-haustiere':
  # Replace unsupported numerical ranking with an accessible checklist matching the new graphic.
  table='<details><summary>Die vier Bedürfnisse als Text lesen</summary><ul><li>Artgenossen: passende Tiere derselben Art halten.</li><li>Flugraum: großzügige Unterbringung und sicheren Freiflug ermöglichen.</li><li>Beschäftigung: geeignete Materialien zum Entdecken und Knabbern anbieten.</li><li>Versorgung: täglich Futter, frisches Wasser, Reinigung und Beobachtung einplanen.</li></ul></details>'
  t=re.sub(r'<table>[\s\S]*?</table>',table,t,count=1)
 p.write_bytes(t.replace('\n',nl).encode());print(slug,'abgeglichen')
