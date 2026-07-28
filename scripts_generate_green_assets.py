from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps
from pathlib import Path
import random, math, colorsys

ROOT = Path('/mnt/data/atlas_refactor_work')
SRC = ROOT/'public/atlas/verde/a2/real_v1'
OUT = ROOT/'public/assets/atlas/verde/modular_v1'
OUT.mkdir(parents=True, exist_ok=True)
W,H = 960,720
S=2
random.seed(4402)

def save_webp(im, name, quality=92):
    im.save(OUT/name, 'WEBP', quality=quality, method=3)

def soft_outline(im, radius=2, alpha=170):
    im=im.convert('RGBA')
    a=im.getchannel('A')
    dil=a.filter(ImageFilter.MaxFilter(radius*2+1)).filter(ImageFilter.GaussianBlur(radius*0.65))
    out=Image.new('RGBA', im.size, (0,0,0,0))
    black=Image.new('RGBA', im.size, (16,18,14,alpha))
    black.putalpha(dil.point(lambda p: min(alpha, p)))
    out.alpha_composite(black)
    out.alpha_composite(im)
    return out

def crop_cluster(src_name, box, name, mask_poly=None):
    src=Image.open(SRC/src_name).convert('RGBA').crop(box)
    if mask_poly:
        mask=Image.new('L', src.size,0); d=ImageDraw.Draw(mask)
        d.polygon(mask_poly,fill=255)
        mask=mask.filter(ImageFilter.GaussianBlur(2))
        a=Image.composite(src.getchannel('A'), Image.new('L',src.size,0), mask)
        src.putalpha(a)
    save_webp(soft_outline(src,2,145), name)

# Core assets copied with baked soft outline.
for filename in [
    'portal_altar.webp','watchtower.webp','bren_forge.webp','tent_command.webp','tent_supply.webp',
    'tent_healer.webp','tent_rest.webp','tent_scout.webp','wood_bridge.webp','campfire.webp',
    'notice_board.webp','sign_laguna.webp','sign_verdalia.webp','sign_bosque.webp','prop_crates.webp',
    'prop_barrels.webp','prop_fence.webp','prop_logs.webp','prop_banner.webp','prop_rock.webp',
    'prop_flower_patch.webp']:
    im=Image.open(SRC/filename).convert('RGBA')
    save_webp(soft_outline(im,2,150), filename)

# Individual/cluster vegetation extracted from the approved art.
crop_cluster('forest_top_right.webp',(108,8,206,145),'pine_cluster_01.webp',[(0,125),(10,48),(28,22),(47,0),(66,34),(82,52),(98,125)])
crop_cluster('forest_top_right.webp',(28,34,132,145),'pine_cluster_02.webp',[(0,105),(10,48),(36,12),(60,30),(78,0),(98,58),(104,110)])
crop_cluster('forest_top_right.webp',(292,12,410,145),'pine_cluster_03.webp',[(0,125),(10,68),(34,26),(56,0),(74,34),(96,14),(118,125)])
crop_cluster('forest_bottom_right.webp',(0,55,142,220),'pine_cluster_04.webp',[(0,165),(10,95),(28,50),(48,0),(70,42),(96,15),(122,64),(142,175)])
crop_cluster('forest_bottom_right.webp',(122,45,310,220),'pine_cluster_05.webp',[(0,175),(18,80),(48,20),(78,50),(110,0),(146,55),(188,175)])
crop_cluster('forest_top_left.webp',(215,74,330,125),'bush_cluster_01.webp',[(0,50),(4,18),(32,0),(64,12),(92,0),(115,50)])
crop_cluster('forest_top_right.webp',(205,88,310,145),'bush_cluster_02.webp',[(0,57),(5,18),(32,0),(58,12),(80,0),(105,57)])

# Recoloured forge-derived house variants to expand the modular kit.
base_house=Image.open(SRC/'bren_forge.webp').convert('RGBA')
def recolor_roof(im, hue_shift=0.0, sat_mul=1.0, val_mul=1.0):
    px=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=px[x,y]
            if a<8: continue
            # target green roof pixels: green channel dominant and upper half
            if y < im.height*0.58 and g > r*0.9 and g > b*0.75 and g>45:
                h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
                h=(h+hue_shift)%1
                s=max(0,min(1,s*sat_mul)); v=max(0,min(1,v*val_mul))
                rr,gg,bb=colorsys.hsv_to_rgb(h,s,v)
                px[x,y]=(int(rr*255),int(gg*255),int(bb*255),a)
    return im
for name,shift,sat,val,flip in [
    ('house_green.webp',0,0.85,1.0,False),
    ('house_brown.webp',-0.22,0.75,0.9,False),
    ('house_blue.webp',0.28,0.85,0.9,True),
    ('house_red.webp',-0.38,0.95,0.92,True),
]:
    im=recolor_roof(base_house.copy(),shift,sat,val)
    if flip: im=ImageOps.mirror(im)
    save_webp(soft_outline(im,2,150),name)

# Cave entrance composed from textured stones and a dark opening.
rock=Image.open(SRC/'prop_rock.webp').convert('RGBA')
def make_cave():
    im=Image.new('RGBA',(250,170),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.ellipse((28,42,222,176),fill=(42,46,38,255),outline=(18,20,16,255),width=6)
    d.ellipse((72,64,180,176),fill=(8,10,12,255))
    # stone blocks
    for i,(x,y,sc) in enumerate([(35,80,.75),(55,48,.7),(88,32,.65),(122,26,.7),(158,35,.65),(188,55,.7),(205,88,.72),(20,112,.62),(208,118,.62)]):
        rr=rock.resize((int(70*sc),int(53*sc)),Image.Resampling.LANCZOS)
        im.alpha_composite(rr,(x,y))
    d.arc((65,58,187,185),190,350,fill=(94,109,76,255),width=5)
    return soft_outline(im,3,170)
save_webp(make_cave(),'cave_entrance.webp')

# Ruin arch from portal stones with portal glow subdued.
portal=Image.open(SRC/'portal_altar.webp').convert('RGBA')
ruin=portal.copy()
# darken cyan glow region only
ov=Image.new('RGBA',ruin.size,(0,0,0,0)); od=ImageDraw.Draw(ov)
od.ellipse((70,55,170,150),fill=(30,34,28,150))
ruin=Image.alpha_composite(ruin,ov)
save_webp(soft_outline(ruin,2,155),'ruin_arch.webp')

# Fortress gate composed from two towers and a stone gate.
tower=Image.open(SRC/'watchtower.webp').convert('RGBA')
def make_fortress():
    im=Image.new('RGBA',(380,250),(0,0,0,0)); d=ImageDraw.Draw(im)
    # base wall
    d.rounded_rectangle((70,100,310,225),radius=10,fill=(84,76,61,255),outline=(26,24,20,255),width=6)
    for yy in range(112,210,26):
        off=0 if (yy//26)%2==0 else 18
        for xx in range(76-off,310,42):
            d.rectangle((xx,yy,xx+36,yy+20),fill=(104,96,78,255),outline=(48,44,36,255),width=2)
    d.rounded_rectangle((145,132,235,225),radius=34,fill=(12,14,16,255),outline=(34,30,24,255),width=6)
    lt=tower.resize((135,190),Image.Resampling.LANCZOS); rt=ImageOps.mirror(lt)
    im.alpha_composite(lt,(22,20)); im.alpha_composite(rt,(223,20))
    return soft_outline(im,3,175)
save_webp(make_fortress(),'fortress_gate.webp')

# Simple stone ruin cluster, built from detailed rock asset.
def make_ruins():
    im=Image.new('RGBA',(210,130),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rectangle((28,70,180,112),fill=(91,88,71,255),outline=(28,28,22,255),width=5)
    d.rectangle((45,35,75,110),fill=(101,97,77,255),outline=(30,28,23,255),width=4)
    d.rectangle((138,18,168,110),fill=(104,100,82,255),outline=(30,28,23,255),width=4)
    d.polygon([(72,70),(105,42),(142,70)],fill=(87,85,68,255),outline=(29,27,22,255))
    rr=rock.resize((58,44),Image.Resampling.LANCZOS)
    im.alpha_composite(rr,(5,80)); im.alpha_composite(rr,(150,78))
    return soft_outline(im,3,170)
save_webp(make_ruins(),'ruins_cluster.webp')

# Terrain generator.
def add_noise(im, amount=18, seed=0):
    rnd=random.Random(seed); pix=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=pix[x,y]
            n=rnd.randint(-amount,amount)
            pix[x,y]=(max(0,min(255,r+n)),max(0,min(255,g+n)),max(0,min(255,b+n)),a)
    return im.filter(ImageFilter.GaussianBlur(0.35))

def draw_path(draw, pts, width=96, color=(174,145,91,255), edge=(101,82,49,110)):
    draw.line(pts,fill=edge,width=width+18,joint='curve')
    draw.line(pts,fill=color,width=width,joint='curve')
    draw.line(pts,fill=(205,178,120,65),width=max(4,width//8),joint='curve')

def terrain_base(sector):
    im=Image.new('RGBA',(W*S,H*S),(0,0,0,255)); d=ImageDraw.Draw(im)
    grass=(67,117,55,255); dark=(43,82,43,255); dirt=(169,139,83,255)
    if sector=='C3': grass=(45,67,44,255); dark=(25,36,30,255); dirt=(104,86,62,255)
    if sector=='B2': grass=(73,111,63,255); dirt=(145,132,108,255)
    d.rectangle((0,0,W*S,H*S),fill=grass)
    # soft patches
    rnd=random.Random(100+sum(map(ord,sector)))
    for i in range(90):
        x=rnd.randint(0,W*S); y=rnd.randint(0,H*S); rx=rnd.randint(12,65)*S; ry=rnd.randint(8,42)*S
        c=(dark[0]+rnd.randint(-6,10),dark[1]+rnd.randint(-6,14),dark[2]+rnd.randint(-4,10),rnd.randint(18,42))
        d.ellipse((x-rx,y-ry,x+rx,y+ry),fill=c)
    # paths by exits
    center=(480*S,360*S)
    coords={'north':(480*S,-20*S),'south':(480*S,740*S),'west':(-20*S,360*S),'east':(980*S,360*S)}
    col='ABC'.index(sector[0]); row=int(sector[1])-1
    dirs=[]
    if row>0: dirs.append('north')
    if row<2: dirs.append('south')
    if col>0: dirs.append('west')
    if col<2: dirs.append('east')
    # sector-specific path bends
    for idx,di in enumerate(dirs):
        ex=coords[di]
        mx=(center[0]+ex[0])//2 + ((idx%2)*2-1)*30*S
        my=(center[1]+ex[1])//2 + (((idx+1)%2)*2-1)*20*S
        draw_path(d,[center,(mx,my),ex],90*S,dirt,(80,66,42,100))
    # features
    if sector=='A1':
        d.ellipse((45*S,45*S,420*S,305*S),fill=(35,110,139,255),outline=(24,65,71,255),width=12*S)
        for i in range(20):
            y=(75+i*10)*S; x=(80+(i%4)*60)*S
            d.arc((x,y,x+70*S,y+18*S),180,355,fill=(130,205,219,130),width=2*S)
    elif sector=='A2':
        d.polygon([(0,0),(150*S,0),(172*S,205*S),(145*S,390*S),(165*S,720*S),(0,720*S)],fill=(32,105,137,255))
        d.line([(150*S,0),(172*S,205*S),(145*S,390*S),(165*S,720*S)],fill=(47,58,39,255),width=12*S)
    elif sector=='B3':
        d.polygon([(410*S,0),(535*S,0),(515*S,250*S),(555*S,430*S),(520*S,720*S),(390*S,720*S),(430*S,430*S),(395*S,250*S)],fill=(33,105,137,255))
        d.line([(410*S,0),(395*S,250*S),(430*S,430*S),(390*S,720*S)],fill=(45,57,40,255),width=12*S)
        d.line([(535*S,0),(515*S,250*S),(555*S,430*S),(520*S,720*S)],fill=(45,57,40,255),width=12*S)
    elif sector=='B2':
        d.rounded_rectangle((205*S,95*S,755*S,610*S),radius=42*S,fill=(128,124,105,255),outline=(79,78,69,255),width=8*S)
        for yy in range(115,600,38):
            for xx in range(220+(yy//38%2)*18,745,54):
                d.rectangle((xx*S,yy*S,(xx+45)*S,(yy+28)*S),outline=(92,90,78,95),width=2*S)
        for di in dirs:
            ex=coords[di]; draw_path(d,[center,ex],80*S,(154,142,112,255),(83,76,59,100))
    elif sector=='C2':
        # fields on the right, paths remain clean
        for yy in [125,205,285]:
            d.rounded_rectangle((650*S,yy*S,890*S,(yy+55)*S),radius=8*S,fill=(89,117,50,255),outline=(45,76,39,255),width=5*S)
            for x in range(670,880,24): d.line((x*S,(yy+8)*S,x*S,(yy+47)*S),fill=(133,151,76,170),width=3*S)
    elif sector=='A3':
        # corruption patches deep forest
        for x,y in [(250,210),(700,180),(650,520)]: d.ellipse(((x-85)*S,(y-55)*S,(x+85)*S,(y+55)*S),fill=(52,72,49,100))
    elif sector=='C3':
        d.ellipse((300*S,95*S,850*S,600*S),fill=(62,58,55,255),outline=(28,30,27,255),width=14*S)
        for a in range(0,360,30):
            x=575+math.cos(math.radians(a))*210; y=345+math.sin(math.radians(a))*170
            d.ellipse(((x-7)*S,(y-7)*S,(x+7)*S,(y+7)*S),fill=(78,120,79,150))
    elif sector in ['B1','C1']:
        # worn stone marks in ruin zones
        for i in range(34):
            x=rnd.randint(230,790); y=rnd.randint(110,580)
            d.rectangle((x*S,y*S,(x+rnd.randint(12,35))*S,(y+rnd.randint(7,18))*S),fill=(112,108,88,rnd.randint(35,70)))
    # micro texture after downscale
    im=im.resize((W,H),Image.Resampling.LANCZOS)
    pix=im.load(); rnd=random.Random(400+sum(map(ord,sector)))
    for i in range(5200):
        x=rnd.randrange(W); y=rnd.randrange(H)
        r,g,b,a=pix[x,y]; n=rnd.randint(-7,7)
        pix[x,y]=(max(0,min(255,r+n)),max(0,min(255,g+n)),max(0,min(255,b+n)),a)
    return im.filter(ImageFilter.GaussianBlur(.15))

for sec in ['A1','B1','C1','A2','B2','C2','A3','B3','C3']:
    target=OUT/f'terrain_{sec.lower()}.webp'
    if target.exists() and target.stat().st_size>1000: continue
    save_webp(terrain_base(sec),target.name,90)

print('generated',len(list(OUT.glob('*.webp'))),'assets in',OUT)
