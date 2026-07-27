from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import random, math

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'assets' / 'atlas'
S=2
random.seed(2707)

def canvas(w,h):
    return Image.new('RGBA',(w*S,h*S),(0,0,0,0))

def D(im): return ImageDraw.Draw(im,'RGBA')
def sc(v): return int(round(v*S))
def pts(seq): return [(sc(x),sc(y)) for x,y in seq]

def line(d, xy, fill, width=1): d.line(pts(xy), fill=fill, width=sc(width), joint='curve')
def poly(d, xy, fill, outline=None, width=1):
    d.polygon(pts(xy), fill=fill)
    if outline: d.line(pts(list(xy)+[xy[0]]), fill=outline, width=sc(width), joint='curve')
def ell(d, box, fill, outline=None, width=1):
    b=tuple(sc(x) for x in box); d.ellipse(b, fill=fill, outline=outline, width=sc(width) if outline else 1)
def rect(d, box, fill, outline=None, width=1, radius=0):
    b=tuple(sc(x) for x in box)
    if radius: d.rounded_rectangle(b, radius=sc(radius), fill=fill, outline=outline, width=sc(width) if outline else 1)
    else: d.rectangle(b, fill=fill, outline=outline, width=sc(width) if outline else 1)

def finish(im, path):
    im=im.resize((im.width//S,im.height//S),Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True,exist_ok=True)
    im.save(path, 'WEBP', quality=86, method=0)

def shadow(im, box, alpha=70):
    layer=Image.new('RGBA', im.size,(0,0,0,0)); ld=D(layer)
    ell(ld,box,(20,25,30,alpha)); layer=layer.filter(ImageFilter.GaussianBlur(sc(3)))
    im.alpha_composite(layer)

# ---------- ARCTIC OBJECTS ----------
AR=ROOT/'fria'/'modular_v27'
DE=ROOT/'desierto'/'modular_v27'

def arctic_tree(name, variant=1):
    w,h=150,210; im=canvas(w,h); d=D(im); shadow(im,(35,182,115,205),65)
    trunk='#594b43'; outline='#23323a'
    rect(d,(70,120,82,190),trunk,outline,2,3)
    palettes=[('#dcecf2','#9db7c2','#567681'),('#eef7fa','#b8d0d9','#688994')]
    snow,mid,dark=palettes[(variant-1)%2]
    for i,(cy,half) in enumerate([(146,54),(114,46),(82,38),(54,29)]):
        poly(d,[(76,18+i*3),(76-half,cy),(76+half,cy)],dark,outline,2)
        poly(d,[(76,25+i*3),(76-half+7,cy-8),(76+half-7,cy-8)],mid,None)
        poly(d,[(76,30+i*3),(76-half+13,cy-17),(76+half-13,cy-17)],snow,None)
    ell(d,(63,183,89,199),(239,248,252,230))
    finish(im,AR/name)

def arctic_rock(name, crystal=False):
    w,h=130,95; im=canvas(w,h); d=D(im); shadow(im,(18,66,112,90),70)
    outline='#24333c'
    poly(d,[(20,70),(34,35),(63,18),(99,32),(116,69),(97,80),(41,82)],'#728b98',outline,3)
    poly(d,[(34,35),(63,18),(58,65),(20,70)],'#94abb5',None)
    poly(d,[(63,18),(99,32),(87,65),(58,65)],'#58717e',None)
    poly(d,[(28,58),(50,50),(75,56),(103,50),(114,65),(21,69)],'#e8f4f8','#b9d4df',2)
    if crystal:
        poly(d,[(69,53),(77,19),(88,9),(94,35),(89,62)],'#8ce6ff','#2c7188',2)
        poly(d,[(80,23),(87,13),(89,39)],'#d7f8ff',None)
    finish(im,AR/name)

def arctic_bush(name):
    w,h=120,78; im=canvas(w,h); d=D(im); shadow(im,(15,55,105,73),45)
    for x,y,r in [(31,46,23),(53,36,27),(78,40,26),(96,49,19)]: ell(d,(x-r,y-r,x+r,y+r),'#49685e','#243d3b',2)
    for x,y,r in [(30,35,16),(55,25,19),(80,29,18),(96,40,12)]: ell(d,(x-r,y-r,x+r,y+r),(225,241,246,235),None)
    finish(im,AR/name)

def arctic_tent(name, blue=False):
    w,h=210,165; im=canvas(w,h); d=D(im); shadow(im,(20,132,190,158),75)
    out='#26343b'; main='#658da5' if blue else '#c5b596'; shade='#3d657e' if blue else '#98846a'; snow='#eef8fb'
    poly(d,[(25,130),(78,43),(105,25),(182,130)],shade,out,3)
    poly(d,[(25,130),(78,43),(105,130)],main,out,2)
    poly(d,[(105,25),(182,130),(105,130)],'#547b91' if blue else '#ad997a',out,2)
    poly(d,[(78,43),(105,25),(150,93),(113,78)],snow,'#b8d8e3',1)
    rect(d,(91,88,119,132),'#26343b',out,2,3)
    line(d,[(25,130),(15,146)],'#6d5a45',2); line(d,[(182,130),(195,146)],'#6d5a45',2)
    finish(im,AR/name)

def arctic_house(name, large=False):
    w,h=(300,250) if large else (245,210); im=canvas(w,h); d=D(im); shadow(im,(20,h-40,w-20,h-8),85)
    out='#25343d'; wall='#8fa5ad'; wall2='#657b84'; roof='#493f3b'; snow='#edf8fb'
    base_y=h-42; roof_y=62 if large else 55
    rect(d,(38,roof_y+45,w-38,base_y),wall,out,3,4)
    poly(d,[(22,roof_y+58),(w/2,22),(w-22,roof_y+58)],roof,out,4)
    poly(d,[(31,roof_y+51),(w/2,30),(w-31,roof_y+51),(w-49,roof_y+63),(w/2,43),(49,roof_y+63)],snow,'#b9d6e0',2)
    rect(d,(w/2-20,base_y-55,w/2+20,base_y),'#3a3030',out,3,3)
    rect(d,(58,base_y-52,90,base_y-22),'#8fe6ff',out,2,3); rect(d,(w-90,base_y-52,w-58,base_y-22),'#8fe6ff',out,2,3)
    if large:
        rect(d,(205,28,226,88),'#5a4a42',out,3,3); poly(d,[(199,28),(232,28),(226,18),(205,18)],snow,'#b9d6e0',1)
    finish(im,AR/name)

def portal_asset(path, desert=False):
    w,h=180,210; im=canvas(w,h); d=D(im); shadow(im,(15,175,165,203),70)
    out='#26333a' if not desert else '#493421'; stone='#617684' if not desert else '#9a6a3f'; hi='#9ab4bf' if not desert else '#c9925b'; glow='#70e9ff' if not desert else '#7ef0d2'
    rect(d,(30,145,150,184),stone,out,3,8)
    rect(d,(42,130,138,158),hi,out,2,6)
    for x in [45,70,110,135]:
        poly(d,[(x,145),(x-10,76),(x+2,48),(x+12,76)],stone,out,3)
        poly(d,[(x-1,55),(x+2,48),(x+5,63)],hi,None)
    ell(d,(60,50,120,120),(glow+'99' if False else (80,240,255,70) if not desert else (80,255,210,70)),None)
    ell(d,(70,60,110,110),(40,220,255,180) if not desert else (60,235,190,180),out,2)
    ell(d,(80,70,100,100),(220,255,255,235) if not desert else (220,255,235,235),None)
    finish(im,path)

def arctic_bridge(name):
    w,h=300,120; im=canvas(w,h); d=D(im); shadow(im,(10,80,290,110),70)
    out='#26343b';
    for i in range(11):
        x=22+i*25; poly(d,[(x,38),(x+20,35),(x+21,83),(x,87)],'#816b57',out,2)
        poly(d,[(x,38),(x+20,35),(x+18,47),(x+2,49)],'#e4f2f6',None)
    line(d,[(10,26),(290,19)],'#4c3a31',4); line(d,[(10,98),(290,91)],'#4c3a31',4)
    for x in range(15,291,35): line(d,[(x,25),(x,98)],'#4c3a31',2)
    finish(im,AR/name)

def arctic_arch(name):
    w,h=260,230; im=canvas(w,h); d=D(im); shadow(im,(15,195,245,224),75)
    out='#26343b'; stone='#6e8792'; snow='#e7f4f8'
    # pillars and arch segments
    rect(d,(35,82,78,205),stone,out,4,5); rect(d,(182,82,225,205),stone,out,4,5)
    for box in [(42,90,73,115),(188,90,218,115),(42,130,73,157),(188,130,218,157)]: rect(d,box,'#89a0a9','#506773',1,3)
    d.arc(tuple(sc(x) for x in (55,20,205,165)),180,360,fill=out,width=sc(44))
    d.arc(tuple(sc(x) for x in (55,20,205,165)),180,360,fill=stone,width=sc(34))
    d.arc(tuple(sc(x) for x in (65,30,195,155)),180,360,fill=snow,width=sc(10))
    finish(im,AR/name)

def arctic_cave(name):
    w,h=280,190; im=canvas(w,h); d=D(im); shadow(im,(10,150,270,185),90)
    out='#22313a';
    poly(d,[(18,155),(48,62),(88,32),(140,18),(202,42),(250,84),(270,155)],'#607986',out,4)
    poly(d,[(54,151),(76,88),(112,60),(145,54),(187,70),(221,105),(235,153)],'#142530',out,3)
    poly(d,[(27,145),(53,66),(88,36),(140,23),(196,46),(243,88),(256,119),(224,103),(190,66),(145,48),(103,55),(70,78),(52,130)],'#e7f4f8','#bdd9e2',2)
    finish(im,AR/name)

def shipwreck(name):
    w,h=340,210; im=canvas(w,h); d=D(im); shadow(im,(20,160,320,200),70)
    out='#26343b'; wood='#665044';
    poly(d,[(35,126),(72,170),(250,170),(306,120),(274,185),(76,187)],wood,out,4)
    poly(d,[(58,129),(83,153),(252,153),(287,119),(250,170),(75,170)],'#806654',None)
    line(d,[(150,42),(150,162)],'#46352e',5); line(d,[(150,52),(250,92)],'#46352e',3); line(d,[(150,54),(75,100)],'#46352e',3)
    poly(d,[(155,55),(239,91),(157,108)],'#b7c6c8',out,2); poly(d,[(145,60),(80,101),(143,115)],'#8da1a7',out,2)
    for x in [70,115,205,255]: poly(d,[(x,150),(x+15,145),(x+10,166)],'#eef8fb',None)
    finish(im,AR/name)

def arctic_watchtower(name):
    w,h=180,250; im=canvas(w,h); d=D(im); shadow(im,(20,220,160,244),75)
    out='#26343b'; wood='#5f4d42'; snow='#edf8fb'
    rect(d,(66,85,112,225),wood,out,4,3)
    line(d,[(55,225),(95,85)],out,5); line(d,[(125,225),(88,85)],out,5)
    rect(d,(35,60,145,112),'#6d5a4e',out,4,4)
    poly(d,[(25,66),(90,22),(155,66)],'#493f3b',out,4); poly(d,[(34,60),(90,30),(145,60),(132,68),(90,43),(47,68)],snow,'#b9d6e0',2)
    finish(im,AR/name)

def arctic_fortress(name):
    w,h=420,310; im=canvas(w,h); d=D(im); shadow(im,(20,270,400,305),95)
    out='#22313a'; stone='#627a86'; hi='#91a8b2'; snow='#edf8fb'
    rect(d,(35,95,385,270),stone,out,5,8)
    for x in [45,135,245,335]: rect(d,(x,58,x+50,270),hi,out,4,5)
    for x in [45,65,85,135,155,175,245,265,285,335,355,375]: rect(d,(x,45,x+18,70),stone,out,2,2)
    rect(d,(170,160,250,270),'#172630',out,4,8)
    poly(d,[(160,162),(210,115),(260,162)],snow,'#b9d6e0',2)
    for x in [55,145,255,345]: poly(d,[(x,58),(x+25,45),(x+50,58),(x+42,66),(x+25,58),(x+8,66)],snow,None)
    finish(im,AR/name)

# ---------- DESERT OBJECTS ----------
def desert_palm(name,variant=1):
    w,h=170,225; im=canvas(w,h); d=D(im); shadow(im,(35,190,135,218),65)
    out='#3f3021'; trunk='#8a6036'; leaf='#3f7044' if variant==1 else '#5d8247'
    poly(d,[(78,198),(90,78),(105,76),(96,200)],trunk,out,3)
    for yy in [105,135,165]: line(d,[(83,yy),(99,yy-3)],'#bd8650',2)
    cx,cy=97,72
    for ang in [-160,-125,-90,-55,-20,20,55,90,125,160]:
        a=math.radians(ang); ex=cx+math.cos(a)*68; ey=cy+math.sin(a)*45
        poly(d,[(cx,cy),(ex,ey),(cx+math.cos(a+0.25)*28,cy+math.sin(a+0.25)*18)],leaf,out,2)
    for x in [88,98,108]: ell(d,(x-5,68,x+5,80),'#8b5b2c',out,1)
    finish(im,DE/name)

def desert_cactus(name,variant=1):
    w,h=100,150; im=canvas(w,h); d=D(im); shadow(im,(18,125,82,147),55)
    out='#3a3b27'; green='#4f7a47' if variant==1 else '#6c884b'; hi='#81a363'
    rect(d,(43,25,63,132),green,out,3,9)
    rect(d,(22,58,46,78),green,out,3,9); rect(d,(20,48,35,78),green,out,3,8)
    rect(d,(60,70,84,90),green,out,3,9); rect(d,(72,54,86,90),green,out,3,8)
    line(d,[(51,35),(51,122)],hi,2); line(d,[(27,55),(27,72)],hi,1); line(d,[(78,60),(78,84)],hi,1)
    finish(im,DE/name)

def desert_rock(name,variant=1):
    w,h=145,110; im=canvas(w,h); d=D(im); shadow(im,(14,82,130,106),70)
    out='#4a3424'; base='#a86f43' if variant==1 else '#8b5c3b'; hi='#c9915e'
    poly(d,[(15,84),(35,42),(60,22),(91,31),(119,48),(134,83),(112,96),(37,96)],base,out,3)
    poly(d,[(35,42),(60,22),(69,79),(15,84)],hi,None)
    poly(d,[(60,22),(91,31),(92,78),(69,79)],'#8a5738',None)
    line(d,[(40,68),(69,63),(92,70)],'#6d4630',2)
    finish(im,DE/name)

def desert_tent(name,dark=False):
    w,h=220,165; im=canvas(w,h); d=D(im); shadow(im,(20,133,200,159),75)
    out='#493421'; main='#6b4d39' if dark else '#d0b283'; shade='#4d3428' if dark else '#aa875c'; stripe='#d6a445'
    poly(d,[(22,132),(77,48),(110,28),(196,132)],shade,out,3)
    poly(d,[(22,132),(77,48),(110,132)],main,out,2); poly(d,[(110,28),(196,132),(110,132)],shade,out,2)
    poly(d,[(83,49),(110,32),(140,72),(130,80),(108,57),(92,69)],stripe,None)
    rect(d,(94,89,126,132),'#30241e',out,2,3)
    finish(im,DE/name)

def adobe_house(name,large=False):
    w,h=(300,235) if large else (235,190); im=canvas(w,h); d=D(im); shadow(im,(18,h-35,w-18,h-7),80)
    out='#4b3525'; wall='#d2a56d'; shade='#ad7d4f'; roof='#8c643e'; base_y=h-32
    rect(d,(34,52,w-34,base_y),wall,out,3,5)
    rect(d,(25,43,w-25,70),roof,out,3,3)
    for x in range(35,w-35,28): rect(d,(x,35,x+18,54),roof,out,2,2)
    rect(d,(w/2-18,base_y-55,w/2+18,base_y),'#5a3d2b',out,3,4)
    rect(d,(52,base_y-53,84,base_y-27),'#68a6b1',out,2,3)
    if large: rect(d,(w-92,base_y-58,w-56,base_y-29),'#68a6b1',out,2,3)
    line(d,[(38,88),(78,88)],shade,2); line(d,[(w-84,98),(w-45,98)],shade,2)
    finish(im,DE/name)

def market_building(name):
    w,h=360,245; im=canvas(w,h); d=D(im); shadow(im,(15,210,345,240),90)
    out='#4b3525'; wall='#c9975d'; shade='#95663e';
    rect(d,(30,70,330,210),wall,out,4,7)
    poly(d,[(20,78),(180,28),(340,78)],shade,out,4)
    for i,x in enumerate([55,125,195,265]):
        rect(d,(x,112,x+42,210),'#b88250',out,2,3)
        rect(d,(x-8,100,x+50,122),'#d7aa6c',out,2,2)
        for j,c in enumerate(['#c9473e','#e2b83d','#4f8395']): rect(d,(x-8+j*19,100,x+11+j*19,122),c,None)
    rect(d,(158,135,202,210),'#51372a',out,3,4)
    finish(im,DE/name)

def desert_arch(name):
    w,h=260,220; im=canvas(w,h); d=D(im); shadow(im,(18,190,242,216),75)
    out='#4b3525'; stone='#b98654'; hi='#d3aa74'
    rect(d,(35,84,80,198),stone,out,4,5); rect(d,(180,84,225,198),stone,out,4,5)
    d.arc(tuple(sc(x) for x in (55,25,205,165)),180,360,fill=out,width=sc(46))
    d.arc(tuple(sc(x) for x in (55,25,205,165)),180,360,fill=stone,width=sc(35))
    d.arc(tuple(sc(x) for x in (65,35,195,155)),180,360,fill=hi,width=sc(8))
    line(d,[(54,120),(78,127)],'#865a39',2); line(d,[(184,135),(218,126)],'#865a39',2)
    finish(im,DE/name)

def desert_bridge(name):
    w,h=330,125; im=canvas(w,h); d=D(im); shadow(im,(10,85,320,117),70)
    out='#493421';
    for i in range(12):
        x=20+i*25; poly(d,[(x,38),(x+21,35),(x+23,88),(x+1,91)],'#8b6545',out,2)
    line(d,[(10,22),(320,15)],'#5b3d2b',4); line(d,[(10,106),(320,99)],'#5b3d2b',4)
    for x in range(15,321,35): line(d,[(x,21),(x,106)],'#5b3d2b',2)
    finish(im,DE/name)

def desert_cave(name):
    w,h=285,190; im=canvas(w,h); d=D(im); shadow(im,(10,150,275,186),90)
    out='#4b3424';
    poly(d,[(12,155),(44,74),(82,35),(137,18),(200,34),(245,72),(275,155)],'#9b6740',out,4)
    poly(d,[(55,154),(75,94),(110,63),(145,54),(188,70),(224,106),(238,154)],'#2e211b',out,3)
    poly(d,[(22,140),(48,79),(85,42),(138,26),(197,42),(238,78)],'#c18a58',None)
    finish(im,DE/name)

def desert_watchtower(name):
    w,h=195,250; im=canvas(w,h); d=D(im); shadow(im,(20,220,175,245),75)
    out='#4b3525'; stone='#b17c4b'; hi='#d0a06a'
    poly(d,[(46,220),(58,70),(137,70),(151,220)],stone,out,4)
    rect(d,(38,50,157,86),hi,out,4,4)
    for x in [44,72,100,128]: rect(d,(x,35,x+22,58),stone,out,3,2)
    rect(d,(78,155,116,220),'#51382a',out,3,4)
    rect(d,(76,95,118,125),'#6ea7ad',out,2,3)
    finish(im,DE/name)

def desert_temple(name):
    w,h=430,315; im=canvas(w,h); d=D(im); shadow(im,(20,275,410,309),95)
    out='#4b3525'; stone='#b98654'; hi='#d4aa70'
    rect(d,(40,145,390,278),stone,out,5,7)
    for i in range(4):
        poly(d,[(70+i*45,145),(215,40+i*20),(360-i*45,145)],hi if i%2==0 else stone,out,3)
    rect(d,(178,170,252,278),'#2f211a',out,4,8)
    rect(d,(55,120,375,153),hi,out,3,3)
    for x in [65,110,290,335]: rect(d,(x,88,x+28,150),stone,out,3,3)
    finish(im,DE/name)

def caravan(name):
    w,h=220,135; im=canvas(w,h); d=D(im); shadow(im,(20,102,200,130),65)
    out='#493421'; wood='#8a6542'; cloth='#d4b580'
    rect(d,(40,45,175,105),wood,out,3,4)
    poly(d,[(32,50),(68,20),(164,20),(187,50)],cloth,out,3)
    for x in [55,160]: ell(d,(x-18,88,x+18,124),'#4b3628',out,3); ell(d,(x-7,99,x+7,113),'#b98654',out,2)
    rect(d,(55,58,85,86),'#6f9fad',out,2,3); rect(d,(128,58,158,86),'#6f9fad',out,2,3)
    finish(im,DE/name)

# Common portal/campfire/crate assets
portal_asset(AR/'portal_ice.webp',False); portal_asset(DE/'portal_sand.webp',True)

def campfire(path, cold=False):
    w,h=110,95; im=canvas(w,h); d=D(im); shadow(im,(12,70,98,92),50)
    for ang in range(0,360,45):
        a=math.radians(ang); cx=55+math.cos(a)*26; cy=69+math.sin(a)*12; ell(d,(cx-8,cy-6,cx+8,cy+6),'#6e6f72','#2e3337',2)
    poly(d,[(55,66),(42,45),(52,20),(59,42),(68,28),(70,51)],'#ff8a2d','#7a3519',2)
    poly(d,[(55,62),(49,45),(56,30),(61,47)],'#ffe16b',None)
    finish(im,path)

def crate(path, desert=False):
    w,h=90,80; im=canvas(w,h); d=D(im); shadow(im,(10,60,80,77),50); out='#26343b' if not desert else '#4b3525'; wood='#7c6656' if not desert else '#a77748'
    rect(d,(12,12,78,65),wood,out,3,3); line(d,[(18,18),(72,60)],out,3); line(d,[(72,18),(18,60)],out,3); finish(im,path)

# generate
for v in [1,2]: arctic_tree(f'tree_snow_0{v}.webp',v)
arctic_rock('ice_rock_01.webp'); arctic_rock('ice_crystal_01.webp',True); arctic_bush('snow_bush_01.webp')
arctic_tent('tent_boreal_01.webp',False); arctic_tent('tent_boreal_blue.webp',True)
arctic_house('ice_house_01.webp'); arctic_house('ice_hall_01.webp',True)
arctic_bridge('ice_bridge_01.webp'); arctic_arch('ice_arch_01.webp'); arctic_cave('ice_cave_01.webp'); shipwreck('shipwreck_01.webp'); arctic_watchtower('ice_watchtower_01.webp'); arctic_fortress('ice_fortress_01.webp'); campfire(AR/'campfire_01.webp'); crate(AR/'crate_01.webp')
for v in [1,2]: desert_palm(f'palm_0{v}.webp',v); desert_cactus(f'cactus_0{v}.webp',v); desert_rock(f'desert_rock_0{v}.webp',v)
desert_tent('tent_nomad_01.webp',False); desert_tent('tent_nomad_dark.webp',True); adobe_house('adobe_house_01.webp'); adobe_house('adobe_hall_01.webp',True); market_building('market_building_01.webp'); desert_arch('desert_arch_01.webp'); desert_bridge('rope_bridge_01.webp'); desert_cave('canyon_cave_01.webp'); desert_watchtower('desert_watchtower_01.webp'); desert_temple('solar_temple_01.webp'); caravan('caravan_01.webp'); campfire(DE/'campfire_01.webp'); crate(DE/'crate_01.webp',True)

# ---------- TERRAIN ----------
def texture_base(region, sid):
    W,H=960,720; im=Image.new('RGBA',(W*S,H*S),(0,0,0,255)); d=D(im)
    if region=='fria':
        bg='#cbdde4'; bg2='#b8cdd6'; path='#9fb4bc'; edge='#748d99'; accent='#eaf5f8'
    else:
        bg='#d7ae70'; bg2='#c99356'; path='#bc844b'; edge='#8a5a35'; accent='#e7c68d'
    rect(d,(0,0,W,H),bg)
    # subtle irregular patches
    rng=random.Random(f'{region}:{sid}:2707')
    for _ in range(95):
        x=rng.randrange(0,W); y=rng.randrange(0,H); rx=rng.randrange(8,38); ry=rng.randrange(4,18)
        ell(d,(x-rx,y-ry,x+rx,y+ry),(190,212,220,255) if region=='fria' else (207,155,91,255))
    # default paths from center to exits
    def pathline(seq,width=74): line(d,seq,path,width); line(d,seq,accent,2)
    pathline([(480,720),(480,360),(480,0)])
    pathline([(0,360),(480,360),(960,360)])
    # sector-specific landforms, only terrain
    if region=='fria':
        if sid=='A1':
            ell(d,(80,70,700,610),'#7fc2dc','#526f7c',5); ell(d,(120,105,660,570),'#a8d7e8','#dff5fb',3)
            for _ in range(16):
                x=rng.randrange(150,630); y=rng.randrange(135,545); line(d,[(x,y),(x+rng.randrange(-35,36),y+rng.randrange(10,45))],'#6ba9c1',2)
            pathline([(760,720),(760,400),(840,300),(960,300)],70)
        elif sid=='C2':
            poly(d,[(0,80),(350,60),(410,250),(330,450),(0,500)],'#7eb0c4','#577786',5)
            poly(d,[(960,70),(650,60),(560,260),(650,500),(960,550)],'#7eb0c4','#577786',5)
            pathline([(480,720),(480,500),(480,220),(480,0)],60)
        elif sid=='C3':
            rect(d,(175,80,785,610),'#aebfc7','#718994',5,28); pathline([(480,720),(480,610)],80)
        elif sid=='B2':
            rect(d,(120,100,840,620),'#aabdc6','#718994',4,24); pathline([(0,360),(120,360)],70); pathline([(840,360),(960,360)],70)
        elif sid=='B3':
            for box in [(70,90,320,260),(350,80,620,250),(650,100,890,280)]: rect(d,box,'#c4d5dc','#9eb3bc',2,25)
        elif sid=='A2':
            for box in [(100,100,250,180),(710,100,850,180),(140,500,280,590),(690,500,830,590)]: rect(d,box,'#b5c8d0','#8ea3ad',2,15)
    else:
        if sid=='A1':
            ell(d,(90,90,650,570),'#65a9a4','#557861',5); ell(d,(135,130,610,530),'#73b9b4','#c9e8cf',3)
            pathline([(720,720),(720,450),(770,330),(960,330)],70)
        elif sid=='A2':
            poly(d,[(0,0),(320,0),(390,180),(330,520),(0,720)],'#9f633d','#70442c',5)
            poly(d,[(960,0),(650,0),(575,200),(640,520),(960,720)],'#9f633d','#70442c',5)
            pathline([(480,720),(480,460),(480,260),(480,0)],60)
        elif sid=='B2':
            rect(d,(115,90,845,625),'#c39862','#895d3a',4,24)
        elif sid=='C2':
            # dune bands
            for y in [110,230,470,590]:
                d.arc(tuple(sc(x) for x in (40,y-70,920,y+90)),180,350,fill='#b57c45',width=sc(16))
        elif sid=='B3':
            ell(d,(350,255,610,475),'#67a99e','#526f5e',4); ell(d,(385,285,575,445),'#79bcb0','#c6e4c8',2)
            pathline([(480,720),(480,500)],65); pathline([(0,360),(330,360)],65); pathline([(630,360),(960,360)],65)
        elif sid=='C3':
            rect(d,(165,75,795,620),'#c09761','#865a38',5,25); pathline([(480,720),(480,620)],80)
    # clean opaque edge, avoiding transparent cutout artifacts
    d.rectangle((0,0,sc(W)-1,sc(H)-1), outline=(110,135,146,255) if region=='fria' else (151,98,54,255), width=sc(3))
    im=im.resize((W,H),Image.Resampling.LANCZOS)
    out=(AR if region=='fria' else DE)/f'terrain_{sid.lower()}.webp'; im.save(out,'WEBP',quality=86,method=0)

for reg in ['fria','desierto']:
    for c in 'ABC':
        for r in '123': texture_base(reg,c+r)
print('generated', AR, DE)
