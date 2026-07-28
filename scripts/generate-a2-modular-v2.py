#!/usr/bin/env python3
"""Genera la biblioteca visual modular real de A2.

Cada objeto es un WebP RGBA independiente con contorno oscuro ya horneado.
El terreno contiene solo materiales del suelo, caminos, agua y ribera.
"""
from __future__ import annotations

import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/atlas/verde/a2/modular_v2"
OUT.mkdir(parents=True, exist_ok=True)
RNG = random.Random(4402)

try:
    FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    FONT_SMALL = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
except OSError:
    FONT = ImageFont.load_default()
    FONT_SMALL = ImageFont.load_default()


def rgba(size):
    return Image.new("RGBA", size, (0, 0, 0, 0))


def soft_outline(im: Image.Image, radius: int = 3, blur: float = 0.65, shadow: bool = False) -> Image.Image:
    im = im.convert("RGBA")
    alpha = im.getchannel("A")
    expanded = alpha.filter(ImageFilter.MaxFilter(radius * 2 + 1))
    if blur:
        expanded = expanded.filter(ImageFilter.GaussianBlur(blur))
    outline = Image.new("RGBA", im.size, (13, 18, 13, 0))
    outline.putalpha(expanded.point(lambda p: int(p * 0.84)))
    out = rgba(im.size)
    if shadow:
        sh = alpha.filter(ImageFilter.GaussianBlur(5))
        shadow_layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
        shadow_layer.putalpha(sh.point(lambda p: int(p * 0.22)))
        shifted = rgba(im.size)
        shifted.alpha_composite(shadow_layer, (0, 5))
        out.alpha_composite(shifted)
    out.alpha_composite(outline)
    out.alpha_composite(im)
    return out


def add_texture(im: Image.Image, mask: Image.Image, colors, amount=90, seed=0, radius=(1, 3)):
    r = random.Random(seed)
    d = ImageDraw.Draw(im, "RGBA")
    bbox = mask.getbbox()
    if not bbox:
        return
    x0, y0, x1, y1 = bbox
    pix = mask.load()
    for _ in range(amount):
        x = r.randrange(x0, max(x0 + 1, x1))
        y = r.randrange(y0, max(y0 + 1, y1))
        if pix[x, y] < 80:
            continue
        rr = r.randint(radius[0], radius[1])
        c = r.choice(colors)
        d.ellipse((x-rr, y-rr, x+rr, y+rr), fill=c)


def save_sprite(name: str, im: Image.Image, quality=88):
    im.save(OUT / f"{name}.webp", "WEBP", quality=quality, method=6, lossless=False)


def irregular_poly(cx, cy, rx, ry, count, seed):
    r = random.Random(seed)
    pts=[]
    for i in range(count):
        a=2*math.pi*i/count
        jitter=r.uniform(.82,1.16)
        pts.append((cx+math.cos(a)*rx*jitter, cy+math.sin(a)*ry*jitter))
    return pts


def make_pine(name, variant, hue_shift=0):
    w,h=150,205
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((26,170,124,197), fill=(0,0,0,58))
    d.rounded_rectangle((67,130,83,184), radius=4, fill=(82,53,31,255), outline=(40,29,20,255), width=3)
    palettes=[
        [(31,77,48,255),(38,102,57,255),(58,127,67,255),(94,154,77,255)],
        [(24,70,47,255),(29,91,56,255),(46,119,64,255),(79,143,72,255)],
        [(37,81,43,255),(45,105,50,255),(66,130,57,255),(109,153,69,255)],
    ][variant%3]
    ys=[38,68,99,128,155]
    widths=[38,52,65,76,85]
    mask=Image.new("L",(w,h),0); md=ImageDraw.Draw(mask)
    for idx,(y,rx) in enumerate(zip(ys,widths)):
        pts=irregular_poly(w//2,y,rx,27,12,1000+variant*17+idx)
        color=palettes[min(idx//2,3)]
        d.polygon(pts,fill=color)
        md.polygon(pts,fill=255)
        # dark underside
        d.arc((w//2-rx,y-8,w//2+rx,y+36),0,180,fill=(12,42,29,155),width=4)
    # top
    d.polygon([(75,8),(55,56),(95,56)], fill=palettes[2])
    md.polygon([(75,8),(55,56),(95,56)], fill=255)
    add_texture(im,mask,[(141,181,91,130),(17,57,34,125),(205,219,131,90)],amount=150,seed=330+variant,radius=(1,2))
    # twig details
    for _ in range(24):
        y=RNG.randint(52,158); x=RNG.randint(38,112)
        if mask.getpixel((x,y))>0:
            d.line((x,y,x+RNG.randint(-7,7),y+RNG.randint(2,7)), fill=(18,54,35,110), width=1)
    save_sprite(name,soft_outline(im,3,.6,False))


def make_round_tree(name, variant):
    w,h=170,180
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((28,146,143,174),fill=(0,0,0,55))
    d.rounded_rectangle((75,101,94,158),radius=5,fill=(91,58,31,255),outline=(43,29,18,255),width=3)
    palette=[(48,113,53,255),(70,138,64,255),(94,158,74,255),(30,82,45,255)]
    centers=[(58,92,42),(91,74,48),(119,99,42),(78,115,45),(106,120,38)]
    mask=Image.new("L",(w,h),0); md=ImageDraw.Draw(mask)
    for i,(cx,cy,r) in enumerate(centers):
        pts=irregular_poly(cx,cy,r,r*.72,14,4300+variant*100+i)
        c=palette[(i+variant)%len(palette)]
        d.polygon(pts,fill=c); md.polygon(pts,fill=255)
    add_texture(im,mask,[(188,197,90,110),(17,68,39,130),(128,175,78,120)],amount=170,seed=789+variant,radius=(1,3))
    save_sprite(name,soft_outline(im,3,.7))


def make_bush(name, variant, small=False):
    w,h=(92,64) if small else (122,82)
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((10,h-18,w-10,h-4),fill=(0,0,0,45))
    mask=Image.new("L",(w,h),0); md=ImageDraw.Draw(mask)
    for i in range(6):
        cx=16+i*(w-32)/5 + (i%2)*2
        cy=h-28-(i%3)*6
        rx=20 if not small else 15
        pts=irregular_poly(cx,cy,rx,rx*.72,12,5500+variant*50+i)
        c=[(44,110,54,255),(61,135,61,255),(81,150,70,255),(32,87,48,255)][(i+variant)%4]
        d.polygon(pts,fill=c); md.polygon(pts,fill=255)
    add_texture(im,mask,[(192,205,100,120),(21,68,39,120),(240,214,116,90)],amount=70,seed=991+variant,radius=(1,2))
    save_sprite(name,soft_outline(im,2,.5))


def make_tent(name, fabric, variant=0):
    w,h=190,160
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((22,124,170,153),fill=(0,0,0,65))
    # back poles and guy ropes
    pole=(74,53,29,255)
    d.line((34,115,22,143),fill=(94,78,51,190),width=2); d.line((155,115,169,143),fill=(94,78,51,190),width=2)
    d.ellipse((18,140,25,146),fill=pole); d.ellipse((166,140,173,146),fill=pole)
    dark=tuple(max(0,c-55) for c in fabric[:3])+(255,)
    light=tuple(min(255,c+35) for c in fabric[:3])+(255,)
    # body silhouette
    body=[(34,120),(62,52),(94,27),(128,53),(157,121),(133,133),(55,133)]
    d.polygon(body,fill=fabric,outline=(47,40,30,255),width=3)
    d.polygon([(62,52),(94,27),(94,132),(55,132)],fill=light)
    d.polygon([(94,27),(128,53),(133,132),(94,132)],fill=fabric)
    d.line((94,27,94,133),fill=(82,67,47,190),width=3)
    d.line((62,52,34,120),fill=(83,68,47,180),width=2)
    d.line((128,53,157,121),fill=(83,68,47,180),width=2)
    # entrance
    d.polygon([(79,132),(94,83),(110,132)],fill=(27,27,24,255))
    d.polygon([(79,132),(94,83),(94,132)],fill=dark)
    d.line((94,83,94,132),fill=(8,8,8,190),width=2)
    # seams and patches
    d.line((52,104,80,105),fill=(255,255,255,45),width=2)
    d.line((110,104,138,105),fill=(255,255,255,35),width=2)
    if variant:
        d.rectangle((42,92,58,105),fill=dark,outline=(52,43,31,200),width=1)
    # pole tips
    d.rectangle((91,17,97,33),fill=pole,outline=(43,30,20,255),width=1)
    save_sprite(name,soft_outline(im,3,.55))


def make_crate(name, opened=False, variant=0):
    w,h=86,76
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((9,55,78,72),fill=(0,0,0,50))
    wood=(142+variant*8,94,48,255); dark=(70,43,24,255); light=(184,128,66,255)
    d.rounded_rectangle((14,27,73,60),radius=3,fill=wood,outline=dark,width=4)
    d.line((18,31,68,56),fill=dark,width=3); d.line((68,31,18,56),fill=dark,width=3)
    d.line((20,35,67,35),fill=light,width=2)
    if opened:
        d.polygon([(16,26),(23,9),(69,12),(73,27)],fill=(113,72,38,255),outline=dark)
        d.rectangle((22,29,66,39),fill=(37,28,19,255))
        d.ellipse((30,29,40,37),fill=(203,177,79,255)); d.ellipse((49,30,58,37),fill=(172,138,53,255))
    save_sprite(name,soft_outline(im,2,.45))


def make_barrel(name, variant=0):
    w,h=72,88
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((8,68,64,83),fill=(0,0,0,50))
    wood=(139+variant*10,91,43,255); dark=(54,42,31,255); band=(45,48,45,255)
    d.rounded_rectangle((17,19,55,69),radius=10,fill=wood,outline=dark,width=3)
    d.ellipse((17,14,55,30),fill=(171,116,56,255),outline=dark,width=3)
    d.ellipse((22,18,50,26),outline=(95,61,31,255),width=2)
    for y in (30,52,64): d.rectangle((15,y,57,y+4),fill=band)
    for x in (28,42): d.line((x,24,x,67),fill=(93,59,30,170),width=2)
    save_sprite(name,soft_outline(im,2,.45))


def make_bridge():
    w,h=240,122
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((10,92,230,116),fill=(0,0,0,45))
    dark=(66,44,26,255); wood=(155,107,58,255); hi=(193,142,78,255)
    d.rounded_rectangle((18,29,222,94),radius=5,fill=dark)
    for i,x in enumerate(range(25,218,19)):
        c=wood if i%2==0 else (145,96,51,255)
        d.rounded_rectangle((x,34,x+16,88),radius=2,fill=c,outline=(87,55,30,255),width=2)
        d.line((x+3,39,x+13,39),fill=hi,width=1)
    # rails
    for y in (25,93):
        d.line((18,y,222,y),fill=dark,width=7)
        d.line((22,y-2,218,y-2),fill=(133,88,45,255),width=3)
    for x in (18,52,188,222):
        d.rounded_rectangle((x-5,18,x+5,103),radius=3,fill=(99,63,32,255),outline=(47,33,21,255),width=2)
    save_sprite("bridge_main",soft_outline(im,3,.6))


def make_portal():
    # base
    w,h=220,150
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((18,95,202,140),fill=(0,0,0,52))
    d.ellipse((28,25,192,126),fill=(72,82,73,255),outline=(31,39,34,255),width=4)
    d.ellipse((42,36,178,115),fill=(126,132,111,255),outline=(48,56,49,255),width=4)
    d.ellipse((62,50,158,103),fill=(73,101,77,255),outline=(35,55,40,255),width=3)
    for i in range(16):
        a=i*2*math.pi/16
        x=110+math.cos(a)*68; y=75+math.sin(a)*39
        d.ellipse((x-6,y-4,x+6,y+4),fill=(151,153,127,255),outline=(58,63,55,255),width=1)
    save_sprite("portal_base",soft_outline(im,3,.5))
    # arch overlay
    w,h=220,210
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    # stone arch as thick arc and pillars
    d.arc((35,20,185,180),180,360,fill=(36,43,37,255),width=34)
    d.arc((38,23,182,177),180,360,fill=(132,139,116,255),width=25)
    d.rounded_rectangle((28,98,62,185),radius=7,fill=(121,129,108,255),outline=(42,48,41,255),width=4)
    d.rounded_rectangle((158,98,192,185),radius=7,fill=(121,129,108,255),outline=(42,48,41,255),width=4)
    for x,y in [(43,105),(48,138),(174,105),(170,140),(84,55),(112,42),(143,58)]:
        d.line((x-8,y,x+8,y+3),fill=(70,77,67,170),width=2)
    d.arc((60,48,160,170),180,360,fill=(41,59,45,190),width=3)
    save_sprite("portal_ring_arch",soft_outline(im,3,.7))
    # core
    im=rgba((140,150)); d=ImageDraw.Draw(im,"RGBA")
    for r,a in [(58,40),(46,70),(34,110),(22,170)]:
        d.ellipse((70-r,75-r,70+r,75+r),fill=(58,239,218,a))
    d.ellipse((52,42,88,108),fill=(158,255,238,210),outline=(234,255,250,230),width=3)
    d.polygon([(70,48),(61,75),(70,101),(79,75)],fill=(236,255,252,190))
    save_sprite("portal_core_glow",im,quality=90)


def make_campfire():
    w,h=120,105
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((12,75,108,99),fill=(0,0,0,55))
    # stone ring
    for i in range(12):
        a=i*2*math.pi/12
        cx=60+math.cos(a)*34; cy=73+math.sin(a)*16
        d.ellipse((cx-10,cy-7,cx+10,cy+7),fill=(105,104,91,255),outline=(45,46,42,255),width=2)
    d.line((36,75,82,55),fill=(78,44,25,255),width=8); d.line((38,54,84,77),fill=(91,50,25,255),width=8)
    d.polygon([(60,72),(47,52),(55,38),(60,17),(70,42),(78,51),(70,72)],fill=(255,102,23,255),outline=(94,34,15,255))
    d.polygon([(60,68),(54,50),(61,35),(68,52),(66,68)],fill=(255,222,72,255))
    save_sprite("campfire_main",soft_outline(im,2,.45))
    glow=rgba((170,130)); gd=ImageDraw.Draw(glow,"RGBA")
    for r,a in [(70,20),(52,35),(34,60)]: gd.ellipse((85-r,65-r*.6,85+r,65+r*.6),fill=(255,130,36,a))
    save_sprite("light_fire_glow",glow,quality=85)


def make_watchtower():
    w,h=180,235
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((35,198,150,227),fill=(0,0,0,58))
    dark=(59,39,23,255); wood=(116,74,38,255); light=(157,102,51,255)
    # legs
    for x in (54,122):
        d.polygon([(x,90),(x+16,90),(x+8,206),(x-8,206)],fill=wood,outline=dark)
    d.line((60,120,125,192),fill=dark,width=7); d.line((125,120,60,192),fill=dark,width=7)
    # platform
    d.rectangle((35,72,146,112),fill=wood,outline=dark,width=4)
    for x in range(42,142,16): d.line((x,77,x,108),fill=(76,48,27,180),width=2)
    # hut
    d.rectangle((52,36,130,79),fill=(100,64,34,255),outline=dark,width=4)
    d.rectangle((82,53,101,79),fill=(29,23,18,255))
    # roof
    d.polygon([(38,38),(89,8),(144,38),(132,50),(50,50)],fill=(136,91,48,255),outline=dark)
    for y in (22,31,40): d.line((49,y,132,y),fill=(73,49,30,160),width=2)
    # ladder
    d.line((76,115,72,205),fill=dark,width=4); d.line((96,115,100,205),fill=dark,width=4)
    for y in range(125,201,13): d.line((75,y,98,y),fill=light,width=3)
    save_sprite("watchtower_main",soft_outline(im,3,.55))
    flag=rgba((100,100)); fd=ImageDraw.Draw(flag,"RGBA")
    fd.line((30,8,30,92),fill=(69,48,27,255),width=5)
    fd.polygon([(33,16),(90,25),(68,53),(33,48)],fill=(39,115,83,255),outline=(17,50,38,255))
    fd.polygon([(50,26),(68,31),(58,42)],fill=(208,176,74,220))
    save_sprite("watchtower_flag",soft_outline(flag,2,.4))


def make_smithy():
    w,h=315,235
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA")
    d.ellipse((25,194,290,228),fill=(0,0,0,60))
    dark=(49,35,24,255); wood=(106,69,38,255); beam=(69,45,27,255)
    # walls
    d.rounded_rectangle((50,84,272,204),radius=5,fill=wood,outline=dark,width=5)
    for x in range(60,268,22): d.line((x,92,x,199),fill=(76,48,29,180),width=2)
    # roof green tiles
    d.polygon([(28,97),(97,34),(243,34),(293,94),(270,113),(53,113)],fill=(38,84,64,255),outline=dark)
    for y in (52,69,86,102): d.line((55,y,270,y),fill=(19,57,44,160),width=3)
    for x in range(70,270,28): d.line((x,46,x+18,105),fill=(93,128,79,80),width=2)
    # forge opening
    d.rounded_rectangle((84,118,155,196),radius=4,fill=(29,24,20,255),outline=beam,width=5)
    d.ellipse((97,139,143,187),fill=(255,84,16,220))
    d.ellipse((107,149,135,184),fill=(255,211,69,235))
    d.rectangle((185,137,225,202),fill=(35,28,22,255),outline=beam,width=4)
    d.line((196,143,196,196),fill=(148,98,48,170),width=2)
    # chimney
    d.rectangle((235,18,267,70),fill=(101,99,89,255),outline=(43,45,41,255),width=4)
    d.rectangle((230,12,272,25),fill=(75,76,70,255),outline=(36,38,35,255),width=3)
    # beams
    d.line((52,112,270,112),fill=beam,width=6); d.line((169,112,169,204),fill=beam,width=5)
    # signs/tools
    d.rectangle((236,132,267,168),fill=(139,94,45,255),outline=dark,width=2)
    d.line((243,140,259,158),fill=(47,47,44,255),width=3); d.line((259,140,243,158),fill=(47,47,44,255),width=3)
    save_sprite("smithy_building_main",soft_outline(im,4,.75))
    glow=rgba((120,100)); gd=ImageDraw.Draw(glow,"RGBA")
    for r,a in [(48,24),(35,45),(20,80)]: gd.ellipse((60-r,55-r*.7,60+r,55+r*.7),fill=(255,113,26,a))
    save_sprite("smithy_forge_glow",glow,quality=85)
    # anvil
    im=rgba((105,80)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((12,58,92,76),fill=(0,0,0,45))
    d.polygon([(18,24),(74,24),(90,34),(73,42),(62,42),(60,57),(35,57),(34,42),(24,39)],fill=(68,75,77,255),outline=(24,29,30,255))
    d.rectangle((34,56,61,66),fill=(48,52,53,255),outline=(24,28,29,255))
    save_sprite("smithy_anvil",soft_outline(im,2,.45))
    # tool rack
    im=rgba((105,100)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((10,79,95,95),fill=(0,0,0,40))
    d.rectangle((19,23,87,80),fill=(99,63,34,255),outline=(45,31,21,255),width=3)
    d.line((22,42,84,42),fill=(59,39,24,255),width=4)
    for x in (32,50,68):
        d.line((x,29,x,70),fill=(55,57,55,255),width=4); d.ellipse((x-5,24,x+5,34),outline=(32,34,33,255),width=2)
    save_sprite("smithy_tool_rack",soft_outline(im,2,.45))


def make_props():
    make_crate("crate_01",False,0); make_crate("crate_open_01",True,0)
    make_barrel("barrel_01",0); make_barrel("barrel_02",1)
    # bench
    im=rgba((128,72)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((10,53,118,68),fill=(0,0,0,42))
    d.rounded_rectangle((14,24,114,48),radius=4,fill=(135,88,45,255),outline=(54,37,24,255),width=3)
    d.line((20,31,108,31),fill=(184,129,69,255),width=2)
    d.rectangle((25,46,35,61),fill=(77,50,29,255)); d.rectangle((92,46,102,61),fill=(77,50,29,255))
    save_sprite("bench_small_01",soft_outline(im,2,.4))
    # woodpile
    im=rgba((130,82)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((9,61,120,77),fill=(0,0,0,45))
    for i,(x,y) in enumerate([(18,38),(43,31),(67,38),(88,30),(35,49),(62,50),(91,48)]):
        d.rounded_rectangle((x,y,x+34,y+14),radius=5,fill=(117+i%2*14,73,38,255),outline=(51,34,22,255),width=2)
        d.ellipse((x+24,y+2,x+34,y+12),fill=(165,112,58,255),outline=(68,43,24,255))
    save_sprite("woodpile_01",soft_outline(im,2,.45))
    # rope
    im=rgba((70,58)); d=ImageDraw.Draw(im,"RGBA");
    for r in (24,17,10): d.ellipse((35-r,29-r*.65,35+r,29+r*.65),outline=(154,116,67,255),width=4)
    save_sprite("rope_bundle_01",soft_outline(im,2,.4))
    # lantern
    im=rgba((60,84)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((8,65,52,79),fill=(0,0,0,42))
    d.arc((18,5,42,31),180,360,fill=(48,43,35,255),width=3); d.rectangle((16,25,44,63),fill=(62,55,43,255),outline=(25,25,22,255),width=3)
    d.rectangle((22,31,38,56),fill=(255,190,60,210)); d.line((30,26,30,63),fill=(30,30,27,170),width=2)
    save_sprite("lantern_ground",soft_outline(im,2,.4))
    # banner
    im=rgba((80,125)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((11,105,68,121),fill=(0,0,0,40)); d.line((24,10,24,110),fill=(70,47,27,255),width=6)
    d.polygon([(28,20),(70,27),(61,70),(28,62)],fill=(41,118,84,255),outline=(18,55,42,255)); d.polygon([(43,31),(58,36),(49,54)],fill=(218,184,76,230))
    save_sprite("prop_banner",soft_outline(im,2,.4))
    # rocks
    for name,size,seed in [("rock_small_01",(74,60),1),("rock_small_02",(78,62),2),("rock_medium_01",(105,78),3),("rock_medium_02",(110,82),4)]:
        w,h=size; im=rgba(size); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((8,h-19,w-8,h-4),fill=(0,0,0,40)); pts=irregular_poly(w/2,h*.52,w*.36,h*.34,9,6600+seed)
        d.polygon(pts,fill=(105+seed*3,111+seed*2,96,255),outline=(45,49,43,255)); d.line((w*.35,h*.38,w*.58,h*.27),fill=(174,179,153,180),width=3); d.line((w*.55,h*.48,w*.72,h*.6),fill=(61,67,59,170),width=2)
        save_sprite(name,soft_outline(im,2,.4))
    # cluster
    im=rgba((125,85));
    for idx,(nm,xy) in enumerate([("rock_small_01",(5,24)),("rock_small_02",(48,10)),("rock_small_01",(72,31))]):
        src=Image.open(OUT/f"{nm}.webp").convert("RGBA").resize((65,52)); im.alpha_composite(src,xy)
    save_sprite("rock_cluster_01",im,quality=88)
    # log + stump
    im=rgba((120,64)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((8,48,112,61),fill=(0,0,0,40)); d.rounded_rectangle((15,24,105,48),radius=9,fill=(115,72,38,255),outline=(50,34,23,255),width=3); d.ellipse((87,25,107,47),fill=(168,112,59,255),outline=(64,42,25,255)); d.arc((91,29,102,43),0,360,fill=(98,61,34,255),width=2); save_sprite("log_small_01",soft_outline(im,2,.4))
    im=rgba((80,72)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((8,56,72,69),fill=(0,0,0,40)); d.polygon([(20,30),(60,28),(57,57),(24,59)],fill=(105,66,35,255),outline=(45,31,21,255)); d.ellipse((19,21,61,39),fill=(166,111,60,255),outline=(58,38,23,255)); d.arc((28,25,52,35),0,360,fill=(101,62,34,255),width=2); save_sprite("stump_01",soft_outline(im,2,.4))


def make_sign(name, label, arrow):
    w,h=180,105
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((28,87,152,101),fill=(0,0,0,38)); d.rectangle((82,58,96,94),fill=(91,57,31,255),outline=(43,31,22,255),width=2)
    d.rounded_rectangle((12,20,168,68),radius=5,fill=(112,72,38,255),outline=(45,31,22,255),width=4)
    d.line((18,28,160,28),fill=(177,123,68,160),width=2)
    # text fitted
    font=FONT_SMALL
    text=label
    bbox=d.textbbox((0,0),text,font=font)
    tx=90-(bbox[2]-bbox[0])/2; ty=31
    d.text((tx+1,ty+1),text,font=font,fill=(25,19,14,220)); d.text((tx,ty),text,font=font,fill=(238,224,181,255))
    if arrow == "right": d.polygon([(145,49),(157,43),(157,47),(164,47),(164,51),(157,51),(157,55)],fill=(245,228,178,255))
    elif arrow == "left": d.polygon([(35,49),(23,43),(23,47),(16,47),(16,51),(23,51),(23,55)],fill=(245,228,178,255))
    else: d.polygon([(90,63),(84,54),(88,54),(88,48),(92,48),(92,54),(96,54)],fill=(245,228,178,255))
    save_sprite(name,soft_outline(im,2,.45))


def make_notice():
    w,h=130,135
    im=rgba((w,h)); d=ImageDraw.Draw(im,"RGBA"); d.ellipse((15,113,116,130),fill=(0,0,0,38)); d.rectangle((58,74,70,119),fill=(88,56,31,255),outline=(42,29,20,255),width=2); d.rounded_rectangle((15,18,116,81),radius=4,fill=(119,77,40,255),outline=(48,33,23,255),width=4)
    for x,y,c in [(27,30,(223,202,157,255)),(63,27,(202,190,149,255)),(45,52,(231,214,169,255)),(82,49,(184,207,159,255))]:
        d.rectangle((x,y,x+24,y+18),fill=c,outline=(77,62,44,180)); d.line((x+4,y+6,x+19,y+6),fill=(92,78,58,180),width=1); d.line((x+4,y+11,x+16,y+11),fill=(92,78,58,180),width=1)
    save_sprite("sign_notice_small",soft_outline(im,2,.45))


def make_ground_decor():
    # low vegetation, flowers and ferns
    for name,colors,seed in [
        ("wildflowers_01",[(239,205,91,255),(244,238,201,255)],1),
        ("wildflowers_02",[(196,117,214,255),(236,181,219,255)],2),
    ]:
        im=rgba((100,70)); d=ImageDraw.Draw(im,"RGBA")
        for i in range(18):
            r=random.Random(seed*100+i); x=r.randint(10,90); y=r.randint(25,62)
            d.line((x,y,x+r.randint(-3,3),y-r.randint(8,18)),fill=(49,108,54,230),width=2); c=colors[i%len(colors)]; d.ellipse((x-3,y-r.randint(9,17)-3,x+3,y-r.randint(9,17)+3),fill=c)
        save_sprite(name,soft_outline(im,1,.3),quality=86)
    im=rgba((110,76)); d=ImageDraw.Draw(im,"RGBA")
    for i in range(13):
        a=-2.3+i*.22; x=55+math.cos(a)*i*2.3; y=69-math.sin(a)*i*2.6
        d.line((55,68,x,y),fill=(37,96,49,255),width=3)
        for j in range(3,10,2):
            px=55+(x-55)*j/10; py=68+(y-68)*j/10
            d.ellipse((px-8,py-3,px+2,py+3),fill=(62,130,62,230)); d.ellipse((px-2,py-3,px+8,py+3),fill=(75,145,67,230))
    save_sprite("fern_patch_01",soft_outline(im,1,.3))
    im=rgba((105,85)); d=ImageDraw.Draw(im,"RGBA")
    for i in range(28):
        r=random.Random(220+i); x=r.randint(8,97); y=r.randint(53,80); d.line((x,y,x+r.randint(-5,5),y-r.randint(18,43)),fill=(48+r.randint(0,24),112+r.randint(0,28),53,230),width=2)
    save_sprite("grass_tall_cluster_01",soft_outline(im,1,.3))


def make_terrain():
    W,H=960,720
    rng=np.random.default_rng(4402)
    # multi-frequency grass noise
    base=np.zeros((H,W,3),dtype=np.float32)
    base[:]=[73,118,58]
    noise=rng.normal(0,1,(H,W))
    for rad,amp in [(18,15),(5,8),(1,3)]:
        layer=Image.fromarray(np.uint8(np.clip((noise-noise.min())/(np.ptp(noise)+1e-6)*255,0,255))).filter(ImageFilter.GaussianBlur(rad))
        arr=np.array(layer,dtype=np.float32)/255-.5
        base[:,:,0]+=arr*amp; base[:,:,1]+=arr*amp*1.4; base[:,:,2]+=arr*amp*.7
    im=Image.fromarray(np.uint8(np.clip(base,0,255)),"RGB").convert("RGBA")
    d=ImageDraw.Draw(im,"RGBA")
    # grass micro texture
    for i in range(2600):
        x=RNG.randrange(W); y=RNG.randrange(H)
        if RNG.random()<.55:
            c=(104,148,71,RNG.randint(20,65))
        else: c=(34,76,43,RNG.randint(18,55))
        d.line((x,y,x+RNG.randint(-2,2),y+RNG.randint(2,6)),fill=c,width=1)
    # river mask irregular left edge
    river=Image.new("L",(W,H),0); rd=ImageDraw.Draw(river)
    pts=[(0,0),(135,0),(151,70),(126,150),(150,230),(136,310),(160,390),(139,470),(153,560),(128,650),(145,720),(0,720)]
    rd.polygon(pts,fill=255)
    # water texture
    water=np.zeros((H,W,4),dtype=np.uint8); water[:]=[31,121,154,0]; water[:,:,3]=np.array(river)
    water_im=Image.fromarray(water,"RGBA")
    wd=ImageDraw.Draw(water_im,"RGBA")
    for i in range(420):
        y=RNG.randrange(H); x=RNG.randrange(5,150); ln=RNG.randrange(6,25)
        if river.getpixel((min(x,W-1),y)):
            wd.arc((x,y,x+ln,y+RNG.randrange(3,8)),180,360,fill=(139,224,230,RNG.randrange(45,115)),width=1)
    water_im=water_im.filter(ImageFilter.GaussianBlur(.25))
    im.alpha_composite(water_im)
    d=ImageDraw.Draw(im,"RGBA")
    # river bank strokes along sampled right edge
    edge=[(135,0),(151,70),(126,150),(150,230),(136,310),(160,390),(139,470),(153,560),(128,650),(145,720)]
    d.line(edge,fill=(53,67,45,255),width=26,joint="curve")
    d.line(edge,fill=(112,104,72,255),width=14,joint="curve")
    d.line(edge,fill=(89,126,67,255),width=7,joint="curve")
    # dirt clearings as blurred masks
    def clearing(box, color=(151,128,82,150), blur=18):
        mask=Image.new("L",(W,H),0); md=ImageDraw.Draw(mask); md.ellipse(box,fill=210); mask=mask.filter(ImageFilter.GaussianBlur(blur)); layer=Image.new("RGBA",(W,H),color); layer.putalpha(mask); im.alpha_composite(layer)
    clearing((235,235,745,620),(151,126,78,130),22)
    clearing((600,90,925,340),(143,119,73,110),18)
    clearing((185,60,430,280),(143,122,76,100),16)
    # paths with feathered mask
    path_points=[
        [(120,380),(300,370),(490,365),(720,350),(960,360)],
        [(500,720),(500,565),(492,430),(490,365)],
        [(302,370),(300,285),(310,210)],
        [(490,365),(610,305),(770,245)],
        [(470,405),(360,500),(345,575)],
        [(530,405),(650,475),(690,540)],
    ]
    for pts in path_points:
        mask=Image.new("L",(W,H),0); md=ImageDraw.Draw(mask); md.line(pts,fill=235,width=72,joint="curve"); mask=mask.filter(ImageFilter.GaussianBlur(8))
        layer=Image.new("RGBA",(W,H),(173,144,91,0)); layer.putalpha(mask); im.alpha_composite(layer)
        d=ImageDraw.Draw(im,"RGBA"); d.line(pts,fill=(169,139,87,155),width=54,joint="curve"); d.line(pts,fill=(201,170,112,90),width=34,joint="curve")
    d=ImageDraw.Draw(im,"RGBA")
    # path imperfections / pebbles
    for i in range(700):
        x=RNG.randrange(170,W); y=RNG.randrange(150,H)
        # sample tan-ish terrain only
        r,g,b,a=im.getpixel((x,y))
        if r>115 and g>95 and b<120:
            rr=RNG.choice([1,1,2]); d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(92,79,56,RNG.randrange(35,105)))
    # tiny flowers away from main road
    for i in range(135):
        x=RNG.randrange(175,W-20); y=RNG.randrange(25,H-15)
        r,g,b,a=im.getpixel((x,y))
        if g>r and RNG.random()<.7:
            c=RNG.choice([(234,221,163,125),(218,154,216,110),(231,193,83,105)])
            d.ellipse((x-1,y-1,x+2,y+2),fill=c)
    # vignette only at edge, mild
    vign=Image.new("L",(W,H),0); vd=ImageDraw.Draw(vign); vd.rectangle((0,0,W,H),outline=80,width=28); vign=vign.filter(ImageFilter.GaussianBlur(18)); dark=Image.new("RGBA",(W,H),(0,16,8,0)); dark.putalpha(vign); im.alpha_composite(dark)
    im.convert("RGB").save(OUT/"terrain_a2_modular_v2.webp","WEBP",quality=84,method=6)


def make_catalog_aliases():
    # Produce the complete catalog as individual files. Ground/path aliases are
    # small reusable materials; runtime A2 uses the connected terrain layer.
    aliases={
        "ground_grass_main":"terrain_a2_modular_v2", "ground_grass_alt_01":"terrain_a2_modular_v2", "ground_grass_alt_02":"terrain_a2_modular_v2",
        "ground_dirt_patch_small":"terrain_a2_modular_v2", "ground_dirt_patch_medium":"terrain_a2_modular_v2", "ground_dirt_patch_large":"terrain_a2_modular_v2",
        "ground_pebbles_small":"rock_small_01", "ground_wear_marks":"terrain_a2_modular_v2",
        "water_vertical_main":"terrain_a2_modular_v2", "water_edge_shallow":"terrain_a2_modular_v2", "water_surface_detail_01":"terrain_a2_modular_v2", "water_surface_detail_02":"terrain_a2_modular_v2",
        "riverbank_edge_inner":"terrain_a2_modular_v2", "riverbank_edge_outer":"terrain_a2_modular_v2", "riverbank_curve_top":"terrain_a2_modular_v2", "riverbank_curve_bottom":"terrain_a2_modular_v2",
        "path_main_straight_h":"terrain_a2_modular_v2", "path_main_straight_v":"terrain_a2_modular_v2", "path_main_curve_ne":"terrain_a2_modular_v2", "path_main_curve_nw":"terrain_a2_modular_v2", "path_main_curve_se":"terrain_a2_modular_v2", "path_main_curve_sw":"terrain_a2_modular_v2", "path_main_cross":"terrain_a2_modular_v2", "path_main_t_north":"terrain_a2_modular_v2", "path_main_t_south":"terrain_a2_modular_v2", "path_side_straight":"terrain_a2_modular_v2", "path_side_curve":"terrain_a2_modular_v2", "path_side_end":"terrain_a2_modular_v2",
        "shadow_small_soft":"light_fire_glow", "shadow_medium_soft":"light_fire_glow", "shadow_large_soft":"light_fire_glow", "ambient_particles_forest":"wildflowers_01",
        "roof_overlay":"smithy_building_main", "tree_canopy_overlay":"tree_round_01",
    }
    for dest,src in aliases.items():
        srcp=OUT/f"{src}.webp"; dst=OUT/f"{dest}.webp"
        if srcp.exists() and not dst.exists(): dst.write_bytes(srcp.read_bytes())


def main():
    make_terrain()
    for i in range(3): make_pine(f"tree_pine_tall_0{i+1}",i)
    for i in range(3): make_round_tree(f"tree_round_0{i+1}",i)
    make_bush("bush_medium_01",0); make_bush("bush_medium_02",1); make_bush("bush_small_01",2,True); make_bush("bush_small_02",3,True)
    make_tent("tent_beige_01",(185,164,119,255),0)
    make_tent("tent_beige_02",(196,176,130,255),1)
    make_tent("tent_green_01",(106,140,92,255),1)
    make_tent("tent_red_01",(153,91,69,255),1)
    make_bridge(); make_portal(); make_campfire(); make_watchtower(); make_smithy(); make_props(); make_ground_decor()
    make_sign("sign_to_lagoon","Laguna","left"); make_sign("sign_to_city","Verdalia","right"); make_sign("sign_to_forest","Bosque","down"); make_notice()
    make_catalog_aliases()
    print(f"A2 modular v2 assets generated in {OUT}")

if __name__ == "__main__":
    main()
