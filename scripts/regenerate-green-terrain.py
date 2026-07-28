from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import numpy as np, random, math

OUT=Path('/mnt/data/atlas_refactor_work/public/assets/atlas/verde/modular_v1')
W,H=960,720; S=2

def base_texture(color, seed):
    rng=np.random.default_rng(seed)
    low=rng.normal(0,1,(36,48)).astype(np.float32)
    low_img=Image.fromarray(np.uint8(np.clip((low-low.min())/(low.max()-low.min())*255,0,255))).resize((W,H),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(12))
    lo=np.asarray(low_img,dtype=np.float32)/255-.5
    fine=rng.normal(0,1,(H,W)).astype(np.float32)
    arr=np.zeros((H,W,4),dtype=np.uint8)
    for i,c in enumerate(color):
        arr[:,:,i]=np.clip(c+lo*18+fine*2.4,0,255)
    arr[:,:,3]=255
    return Image.fromarray(arr,'RGBA')

def draw_path(d, pts, width=96, color=(174,145,91,255), edge=(92,74,45,180)):
    d.line(pts,fill=edge,width=width+18,joint='curve')
    d.line(pts,fill=color,width=width,joint='curve')
    d.line(pts,fill=(205,180,126,75),width=max(5,width//8),joint='curve')

def terrain(sec):
    seed=900+sum(map(ord,sec))
    color=(63,112,54) if sec!='C3' else (40,63,43)
    if sec=='B2': color=(67,104,59)
    im=base_texture(color,seed).resize((W*S,H*S),Image.Resampling.BICUBIC)
    d=ImageDraw.Draw(im,'RGBA')
    center=(480*S,360*S)
    coords={'north':(480*S,-20*S),'south':(480*S,740*S),'west':(-20*S,360*S),'east':(980*S,360*S)}
    col='ABC'.index(sec[0]); row=int(sec[1])-1
    dirs=[]
    if row>0: dirs.append('north')
    if row<2: dirs.append('south')
    if col>0: dirs.append('west')
    if col<2: dirs.append('east')
    dirt=(171,143,90,255)
    for idx,di in enumerate(dirs):
        ex=coords[di]; mx=(center[0]+ex[0])//2+((-1 if idx%2==0 else 1)*26*S); my=(center[1]+ex[1])//2+((1 if idx%2==0 else -1)*16*S)
        draw_path(d,[center,(mx,my),ex],88*S,dirt,(88,70,42,190))
    if sec=='A1':
        d.ellipse((45*S,45*S,420*S,305*S),fill=(31,105,137,255),outline=(28,62,58,255),width=10*S)
        for i in range(18):
            x=(70+(i%5)*65)*S; y=(75+(i//5)*55)*S
            d.arc((x,y,x+55*S,y+14*S),185,350,fill=(146,220,230,120),width=2*S)
    elif sec=='A2':
        d.polygon([(0,0),(145*S,0),(165*S,200*S),(140*S,390*S),(158*S,720*S),(0,720*S)],fill=(31,105,137,255))
        d.line([(145*S,0),(165*S,200*S),(140*S,390*S),(158*S,720*S)],fill=(42,62,40,255),width=10*S)
    elif sec=='B3':
        d.polygon([(410*S,0),(535*S,0),(515*S,250*S),(555*S,430*S),(520*S,720*S),(390*S,720*S),(430*S,430*S),(395*S,250*S)],fill=(31,105,137,255))
        d.line([(410*S,0),(395*S,250*S),(430*S,430*S),(390*S,720*S)],fill=(42,62,40,255),width=10*S)
        d.line([(535*S,0),(515*S,250*S),(555*S,430*S),(520*S,720*S)],fill=(42,62,40,255),width=10*S)
    elif sec=='B2':
        d.rounded_rectangle((205*S,95*S,755*S,610*S),radius=42*S,fill=(125,120,103,255),outline=(72,73,65,255),width=8*S)
        for yy in range(115,600,38):
            for xx in range(220+(yy//38%2)*18,745,54):
                d.rectangle((xx*S,yy*S,(xx+45)*S,(yy+28)*S),outline=(89,87,76,85),width=2*S)
        for di in dirs: draw_path(d,[center,coords[di]],78*S,(153,141,112,255),(78,72,56,180))
    elif sec=='C2':
        for yy in [125,205,285]:
            d.rounded_rectangle((650*S,yy*S,890*S,(yy+55)*S),radius=7*S,fill=(84,112,49,255),outline=(40,72,36,255),width=4*S)
            for x in range(670,880,24): d.line((x*S,(yy+8)*S,x*S,(yy+47)*S),fill=(137,154,79,140),width=3*S)
    elif sec=='C3':
        d.ellipse((300*S,95*S,850*S,600*S),fill=(59,56,53,255),outline=(25,29,26,255),width=13*S)
        for a in range(0,360,30):
            x=575+math.cos(math.radians(a))*210; y=345+math.sin(math.radians(a))*170
            d.ellipse(((x-6)*S,(y-6)*S,(x+6)*S,(y+6)*S),fill=(80,126,82,130))
    elif sec in ('B1','C1'):
        rng=random.Random(seed)
        for _ in range(28):
            x=rng.randint(230,790); y=rng.randint(120,570); ww=rng.randint(12,34); hh=rng.randint(7,16)
            d.rounded_rectangle((x*S,y*S,(x+ww)*S,(y+hh)*S),radius=2*S,fill=(112,108,88,48))
    # grass blades and tiny stones, kept subtle
    rng=random.Random(seed+1)
    for _ in range(1100):
        x=rng.randrange(W)*S; y=rng.randrange(H)*S
        if rng.random()<.7:
            colr=(28,72,34,rng.randint(35,80)); d.line((x,y,x+rng.randint(-2,2)*S,y-rng.randint(2,5)*S),fill=colr,width=1*S)
        else:
            rr=rng.randint(1,2)*S; d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(112,105,79,rng.randint(25,65)))
    return im.resize((W,H),Image.Resampling.LANCZOS)

for sec in ['A1','B1','C1','A2','B2','C2','A3','B3','C3']:
    terrain(sec).save(OUT/f'terrain_{sec.lower()}.webp','WEBP',quality=91,method=4)
print('terrain regenerated')
