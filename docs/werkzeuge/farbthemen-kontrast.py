import json
def L(h):
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=sorted((L(a),L(b)),reverse=True); return (la+0.05)/(lb+0.05)
KEYS=['bg-a','bg-b','bg-check','edge','panel-dk','panel','panel-2','panel-3','panel-in','wood','wood-lt','wood-dk','text','text-soft','ink-dk','leaf','leaf-dk','leaf-hi','water','red','rare','repair']
T={
'standard':{'name':'Standard','hinweis':'Abendlicher Hof (wie bisher)','bg-a':'#0d1719','bg-b':'#14231f','bg-check':'#16262a','edge':'#0a1013','panel-dk':'#141f24','panel':'#1b2a2f','panel-2':'#24373a','panel-3':'#3a5450','panel-in':'#121d21','wood':'#d4a25a','wood-lt':'#f4d58e','wood-dk':'#76502a','text':'#f1e9d6','text-soft':'#9fb4ad','ink-dk':'#2a1708','leaf':'#7fcf8a','leaf-dk':'#367a4c','leaf-hi':'#c8f2cc','water':'#6fa8d0','red':'#e8604f','rare':'#c99cf2','repair':'#e0a85a'},
'wald':{'name':'Wald','hinweis':'Moos, Tannengrün, helles Birkenholz','bg-a':'#0c1610','bg-b':'#132116','bg-check':'#15261a','edge':'#08100b','panel-dk':'#122017','panel':'#192b1f','panel-2':'#22392a','panel-3':'#365a40','panel-in':'#0f1c13','wood':'#c9b27a','wood-lt':'#eee0b0','wood-dk':'#6b5a30','text':'#eef0dc','text-soft':'#a7bfa2','ink-dk':'#1f1a0a','leaf':'#9ad67c','leaf-dk':'#3f7a34','leaf-hi':'#d6f5c4','water':'#7fb7c4','red':'#ec6a52','rare':'#cfa4f0','repair':'#e3b25e'},
'herbst':{'name':'Herbst','hinweis':'Kürbis, Ahornrot, warmes Braun','bg-a':'#1a100c','bg-b':'#241610','bg-check':'#2a1a13','edge':'#120a07','panel-dk':'#22150f','panel':'#2e1d15','panel-2':'#3b271c','panel-3':'#5a3d2a','panel-in':'#1b110c','wood':'#e39a4c','wood-lt':'#f7cf8a','wood-dk':'#7a4320','text':'#f6e8d6','text-soft':'#c7ab92','ink-dk':'#2b1206','leaf':'#c9c76a','leaf-dk':'#6e6a2a','leaf-hi':'#efedb8','water':'#8fb0c8','red':'#f06a4a','rare':'#d4a6ee','repair':'#f0b860'},
'frost':{'name':'Frost','hinweis':'Winterblau, Schnee, kühles Silber','bg-a':'#0c1420','bg-b':'#121c2a','bg-check':'#152132','edge':'#080e17','panel-dk':'#121c29','panel':'#1a2636','panel-2':'#233246','panel-3':'#3a4f6a','panel-in':'#0f1824','wood':'#a9c4e0','wood-lt':'#e4f0fb','wood-dk':'#41597a','text':'#eef3f8','text-soft':'#a4b6c8','ink-dk':'#0c1a2c','leaf':'#86d0b8','leaf-dk':'#2f7462','leaf-hi':'#cdf2e6','water':'#7fb4ec','red':'#f07a74','rare':'#cbb0f6','repair':'#e8c07a'},
'meer':{'name':'Meer','hinweis':'Türkis, Sand, Muschelweiß','bg-a':'#08171c','bg-b':'#0d2026','bg-check':'#10252c','edge':'#051013','panel-dk':'#0e1f25','panel':'#132a32','panel-2':'#1b3842','panel-3':'#2e5a66','panel-in':'#0b1a1f','wood':'#e6c48a','wood-lt':'#f8e6bf','wood-dk':'#7a6036','text':'#eef6f4','text-soft':'#9cc0c0','ink-dk':'#2a1d08','leaf':'#6fd6c0','leaf-dk':'#24786a','leaf-hi':'#c6f4ea','water':'#79c4ee','red':'#f2766a','rare':'#c8a8f4','repair':'#ecb868'},
'kirschbluete':{'name':'Kirschblüte','hinweis':'Zartrosa, Pflaume, frisches Grün','bg-a':'#1a0f17','bg-b':'#22141e','bg-check':'#281824','edge':'#12090f','panel-dk':'#21131d','panel':'#2c1a27','panel-2':'#3a2434','panel-3':'#5a3a52','panel-in':'#1a0f17','wood':'#f2a6c4','wood-lt':'#fbd9e7','wood-dk':'#7c3d5a','text':'#f8ecf2','text-soft':'#c9a9bd','ink-dk':'#2c0f1e','leaf':'#9ed88c','leaf-dk':'#467a3a','leaf-hi':'#d8f4cc','water':'#8fb4e6','red':'#f2707a','rare':'#d0a8f4','repair':'#eab070'},
'pergament':{'name':'Pergament (hell)','hinweis':'Heller Hintergrund, dunkle Schrift – gut bei Tageslicht','bg-a':'#e9dfc8','bg-b':'#e2d6bb','bg-check':'#ddd0b2','edge':'#b9a882','panel-dk':'#efe6d2','panel':'#f7f0e0','panel-2':'#ece2cb','panel-3':'#cdbd98','panel-in':'#fffaf0','wood':'#8a5a24','wood-lt':'#5c3a12','wood-dk':'#d9b98a','text':'#2a2116','text-soft':'#5c4f3c','ink-dk':'#fffaf0','leaf':'#2e7a3c','leaf-dk':'#a9d8a8','leaf-hi':'#1f5a2a','water':'#2c6a98','red':'#b8352a','rare':'#7a4aa8','repair':'#9a5a12'},
}
# Kontrastpaare: (Vordergrund, Hintergrund, Mindestwert, Zweck)
P=[('text','panel',4.5,'Fließtext auf Karte'),('text','panel-dk',4.5,'Fließtext auf dunkler Karte'),('text','bg-a',4.5,'Text auf Hintergrund'),
   ('text-soft','panel',4.5,'Nebentext auf Karte'),('text-soft','panel-in',4.5,'Nebentext in Feld'),('wood-lt','panel',4.5,'Überschrift auf Karte'),
   ('wood','panel',3.0,'Rahmen/Akzent auf Karte'),('ink-dk','wood',4.5,'Knopftext auf Holzknopf'),('leaf','panel',3.0,'Status erledigt'),
   ('water','panel',3.0,'Mini/Link'),('red','panel',3.0,'Warnfarbe'),('rare','panel',3.0,'Selten'),('repair','panel',3.0,'Repariert'),('text','panel-in',4.5,'Eingabefeld')]
res={}; ok=True
for k,t in T.items():
    rows=[]
    for a,b,m,z in P:
        v=cr(t[a],t[b]); rows.append((z,a,b,round(v,2),m,v>=m)); ok&=v>=m
    res[k]=rows
for k,rows in res.items():
    bad=[r for r in rows if not r[5]]
    print(k, 'min', min(r[3] for r in rows), 'FAIL:' if bad else 'ok', [(r[0],r[3]) for r in bad])
json.dump({'hinweis':'Farbthemen der Oberfläche (v8b). Werte = CSS-Variablen aus public/styles.css. Kontraste nach WCAG 2.x geprüft (Text ≥ 4,5:1, Akzente/Bedienelemente ≥ 3:1). „Gut unterscheidbar“ überschreibt weiterhin nur Statusfarben.',
           'jahreszeit_automatisch':{'fruehling':'kirschbluete','sommer':'meer','herbst':'herbst','winter':'frost'},
           'themen':{k:{**{kk:v for kk,v in t.items()}} for k,t in T.items()},
           'kontraste':{k:[{'zweck':r[0],'vorne':r[1],'hinten':r[2],'wert':r[3],'mindestens':r[4]} for r in rows] for k,rows in res.items()}},
          open('farbthemen.json','w'),ensure_ascii=False,indent=1)
