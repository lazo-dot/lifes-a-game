# Stil-B-Palette: Rampen je Material mit Farbtonverschiebung
# (Schatten Richtung Blau/Violett, Licht Richtung Gelb) – Grundlage für Aseprite.
import colorsys, json
from PIL import Image, ImageDraw
def hx(h,s,l):
    r,g,b=colorsys.hls_to_rgb((h%360)/360,max(0,min(1,l)),max(0,min(1,s)))
    return '#%02x%02x%02x'%(round(r*255),round(g*255),round(b*255))
def toward(h, target, amt):
    d=((target-h+180)%360)-180
    step=max(-abs(amt),min(abs(amt),d))
    return h+step
def ramp(h,s,l,steps=5,dl=0.13,dh=12,ds=0.05):
    # Index 0 = tiefster Schatten, Mitte = Grundton, letzter = Glanzlicht.
    # Schatten wandern im Farbton Richtung Blau-Violett (250), Lichter Richtung Warmgelb (50).
    mid=steps//2; out=[]
    for i in range(steps):
        k=i-mid
        if k<0: hh=toward(h,250,dh*(-k)); ss=s+ds*(-k)*0.5; ll=l+dl*k
        elif k>0: hh=toward(h,50,dh*k*0.7); ss=s-ds*k; ll=l+dl*k*0.85
        else: hh,ss,ll=h,s,l
        out.append(hx(hh,ss,ll))
    return out
R = {
 'Umriss & Nacht':   ['#1b1630','#2a2346','#3b3560','#4f4a7a'],
 'Gras':             ramp(100,0.42,0.47),
 'Laub':             ramp(118,0.42,0.40),
 'Erde & Beet':      ramp(26,0.42,0.33,dl=0.10),
 'Weg & Sand':       ramp(38,0.42,0.67,dl=0.11,dh=5),
 'Holz':             ramp(24,0.48,0.40),
 'Dach rot':         ramp(7,0.55,0.50),
 'Dach schiefer':    ramp(222,0.20,0.45),
 'Stein':            ramp(220,0.10,0.62,dl=0.11),
 'Putz & Stoff':     ramp(40,0.30,0.86,steps=4,dl=0.09,dh=5),
 'Wasser':           ramp(210,0.55,0.50),
 'Glas':             ramp(195,0.60,0.78,steps=4,dl=0.09),
 'Blüte rosa':       ramp(330,0.70,0.75,steps=4,dl=0.09,dh=6),
 'Frucht rot':       ramp(5,0.75,0.58,steps=4,dl=0.10),
 'Frucht gelb':      ramp(46,0.85,0.60,steps=4,dl=0.10),
 'Licht & Glut':     ['#fff3c4','#ffd27a','#f2a24a','#d66a2c'],
}
# Fähigkeitsfarben (passen zu den bisherigen Skill-Symbolen)
SK = {'Körper':'#e0605a','Geist':'#5a8fe0','Kreativität':'#f080c0','Alltag':'#d99a5a','Soziales':'#f0607a','Musik':'#b48cf0','Kochen':'#e8a03a','Finanzen':'#e3c04a'}
R['Fähigkeiten']=list(SK.values())
json.dump(R,open('palette-stil-b.json','w'),ensure_ascii=False,indent=1)
# GIMP/Aseprite-Palette (.gpl)
with open('palette-stil-b.gpl','w') as f:
    f.write('GIMP Palette\nName: Lifes a Game - Stil B\nColumns: 8\n#\n')
    for name,cols in R.items():
        for i,c in enumerate(cols):
            r,g,b=(int(c[j:j+2],16) for j in (1,3,5)); f.write(f'{r:3d} {g:3d} {b:3d}\t{name} {i+1}\n')
# Vorschau-PNG
sw=28; lab=150
img=Image.new('RGB',(lab+sw*8+12,len(R)*(sw+6)+12),'#121c1f'); d=ImageDraw.Draw(img); from PIL import ImageFont; fnt=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
for row,(name,cols) in enumerate(R.items()):
    y=8+row*(sw+6); d.text((8,y+6),name,fill='#ece4cf',font=fnt)
    for i,c in enumerate(cols): d.rectangle([lab+i*sw,y,lab+(i+1)*sw-2,y+sw-1],fill=c)
img.save('palette-stil-b.png')
print(sum(len(v) for v in R.values()),'Farben')
for k,v in R.items(): print(k, v)
