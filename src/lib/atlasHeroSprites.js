// PROYECTO ATLAS — Nueve héroes visualmente distintos (3 razas × 3 clases).
// Canvas procedural 36×48, sin depender de imágenes externas.
import { drawPilotHumanWarrior } from "@/lib/atlasPilotSprites";
import { drawHeroAssetSprite, hasHeroAssetVisual, preloadHeroAssetVisuals } from "@/lib/atlasHeroAssetSprites";

const HERO_PROFILES = Object.freeze({
  "Humano:Guerrero": { body:"#315d5a", bodyS:"#1d3938", accent:"#a9403a", metal:"#aab5c5", metalS:"#596474", skin:"#e8b48d", skinS:"#bd7d5f", hair:"#4b2d1d", hairH:"#765039", boots:"#2d2119", weapon:"swordShield", head:"short", build:"normal" },
  "Humano:Mago": { body:"#315f9a", bodyS:"#1f3b6b", accent:"#9b75c8", metal:"#d8b45d", metalS:"#8a6b31", skin:"#e8b48d", skinS:"#bd7d5f", hair:"#2d2948", hairH:"#5b4f7b", boots:"#26243a", weapon:"orbStaff", head:"mageHood", build:"normal", glow:"#c8a0f0" },
  "Humano:Pícaro": { body:"#3f7651", bodyS:"#244b32", accent:"#7d5d35", metal:"#d7dde8", metalS:"#7d8795", skin:"#e8b48d", skinS:"#bd7d5f", hair:"#3a2a1a", hairH:"#6a4b2d", boots:"#241808", weapon:"dualDaggers", head:"hood", build:"slim" },

  "Elfo:Guerrero": { body:"#4f7268", bodyS:"#2d4841", accent:"#b8c46a", metal:"#d6e6dd", metalS:"#7d9e91", skin:"#efc7a3", skinS:"#c89473", hair:"#d4c88e", hairH:"#fff0b1", boots:"#2f352a", weapon:"spearShield", head:"long", build:"slim", raceMark:"leaf" },
  "Elfo:Mago": { body:"#426b87", bodyS:"#263f58", accent:"#67c8bd", metal:"#e3dca5", metalS:"#8e8656", skin:"#efc7a3", skinS:"#c89473", hair:"#e8e5cf", hairH:"#ffffff", boots:"#28343c", weapon:"crystalStaff", head:"circlet", build:"slim", glow:"#8ff3e7", raceMark:"rune" },
  "Elfo:Pícaro": { body:"#2f6847", bodyS:"#1a412c", accent:"#8cab55", metal:"#d8e4db", metalS:"#6f8177", skin:"#efc7a3", skinS:"#c89473", hair:"#6b4b2a", hairH:"#a17842", boots:"#1d2a20", weapon:"bowDagger", head:"forestHood", build:"slim", raceMark:"leaf" },

  "Enano:Guerrero": { body:"#6b4f3a", bodyS:"#3d2b20", accent:"#bd7d3f", metal:"#aeb7bd", metalS:"#59636b", skin:"#dca076", skinS:"#a9684d", hair:"#8b4b28", hairH:"#c7753e", boots:"#271b15", weapon:"hammerShield", head:"helm", build:"stocky", beard:true, raceMark:"rune" },
  "Enano:Mago": { body:"#5a477b", bodyS:"#34284e", accent:"#4fc0c7", metal:"#c7b36d", metalS:"#7d6b35", skin:"#dca076", skinS:"#a9684d", hair:"#6d3b27", hairH:"#a86342", boots:"#2c2435", weapon:"runeStaff", head:"runeCap", build:"stocky", beard:true, glow:"#6ee8ef", raceMark:"rune" },
  "Enano:Pícaro": { body:"#5b5a38", bodyS:"#35331f", accent:"#b27835", metal:"#c9d0d5", metalS:"#69727a", skin:"#dca076", skinS:"#a9684d", hair:"#51301f", hairH:"#815039", boots:"#241a13", weapon:"crossbowAxe", head:"leatherCap", build:"stocky", beard:true, raceMark:"gear" },
});

export const HERO_VISUAL_KEYS = Object.freeze(Object.keys(HERO_PROFILES));
export function hasHeroVisual(race, cls) { return !!HERO_PROFILES[`${race}:${cls}`]; }

function rr(ctx,x,y,w,h,r,fill,stroke="#17191d",lw=1.2){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function circ(ctx,x,y,r,fill,stroke="#17191d",lw=1.1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function line(ctx,x1,y1,x2,y2,c,w=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap="round";ctx.stroke();}
function poly(ctx,pts,fill,stroke="#17191d",lw=1){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}

function drawRaceMarks(ctx,p,dir,bob,race){
  if(race==="Elfo" && dir!=="up"){
    poly(ctx,[[10,13+bob],[3,10+bob],[10,17+bob]],p.skinS);
    if(dir==="down") poly(ctx,[[26,13+bob],[33,10+bob],[26,17+bob]],p.skinS);
  }
  if(p.raceMark==="rune"){
    ctx.strokeStyle=p.accent;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(16,29+bob);ctx.lineTo(18,27+bob);ctx.lineTo(20,29+bob);ctx.lineTo(18,31+bob);ctx.closePath();ctx.stroke();
  } else if(p.raceMark==="leaf"){
    poly(ctx,[[16,29+bob],[18,26+bob],[20,29+bob],[18,32+bob]],p.accent,null);
  } else if(p.raceMark==="gear"){
    circ(ctx,18,29+bob,2.1,p.accent,p.metalS,.8);circ(ctx,18,29+bob,.7,p.bodyS,null);
  }
}

function drawHead(ctx,p,dir,bob,race){
  circ(ctx,18,15+bob,8.6,p.skin,"#17191d",1.4);
  drawRaceMarks(ctx,p,dir,bob,race);
  if(p.head==="short"){
    rr(ctx,9.5,7+bob,17,6,3,p.hair);poly(ctx,[[10,10+bob],[12,5+bob],[15,9+bob],[18,4+bob],[21,9+bob],[24,5+bob],[26,11+bob]],p.hairH,"#17191d",.7);
  } else if(p.head==="mageHood"){
    poly(ctx,[[8,14+bob],[28,14+bob],[18,1+bob]],p.bodyS);circ(ctx,18,3+bob,2,p.accent,"#17191d",.8);rr(ctx,8.5,11+bob,19,5,2,p.body);
  } else if(p.head==="hood" || p.head==="forestHood"){
    circ(ctx,18,12+bob,8.8,p.head==="forestHood"?p.body:p.accent);rr(ctx,9,8+bob,18,8,3,p.head==="forestHood"?p.body:p.accent);poly(ctx,[[15,8+bob],[18,3+bob],[21,8+bob]],p.accent);
  } else if(p.head==="long"){
    rr(ctx,9,8+bob,4,18,2,p.hair);rr(ctx,23,8+bob,4,18,2,p.hair);circ(ctx,18,10+bob,7.5,p.hair);rr(ctx,10,8+bob,16,5,2,p.hairH,null);
  } else if(p.head==="circlet"){
    rr(ctx,9,8+bob,4,17,2,p.hair);rr(ctx,23,8+bob,4,17,2,p.hair);circ(ctx,18,10+bob,7.2,p.hair);line(ctx,11,11+bob,25,11+bob,p.metal,1.2);circ(ctx,18,10.5+bob,1.5,p.glow,p.metalS,.6);
  } else if(p.head==="helm"){
    circ(ctx,18,11+bob,8,p.metalS);rr(ctx,9.5,10+bob,17,6,2,p.metal);poly(ctx,[[16,5+bob],[18,1+bob],[20,5+bob]],p.accent);
  } else if(p.head==="runeCap"){
    rr(ctx,9,7+bob,18,8,4,p.bodyS);poly(ctx,[[13,8+bob],[18,2+bob],[23,8+bob]],p.body);circ(ctx,18,7+bob,1.4,p.glow,null);
  } else if(p.head==="leatherCap"){
    rr(ctx,9,7+bob,18,7,3,p.accentS||p.bodyS);rr(ctx,11,6+bob,14,4,2,p.accent);
  }
  if(dir==="down"){
    rr(ctx,14,14+bob,2,2.5,.6,"#241a18",null);rr(ctx,20,14+bob,2,2.5,.6,"#241a18",null);
  } else if(dir==="left") rr(ctx,13,14+bob,2,2.5,.6,"#241a18",null);
  if(p.beard && dir!=="up"){
    rr(ctx,10.5,17+bob,15,7,3.5,p.hair,"#17191d",.9);poly(ctx,[[12,21+bob],[18,27+bob],[24,21+bob]],p.hairH,"#17191d",.7);
  }
}

function drawWeapon(ctx,p,dir,bob,pose="idle"){
  const left=dir==="left";const hand=left?9:29;const outer=left?3:33;
  ctx.save();
  const pivotX=hand,pivotY=34+bob;
  if(["attack","slash","dual"].includes(pose)){ctx.translate(pivotX,pivotY);ctx.rotate((left?-1:1)*0.34);ctx.translate(-pivotX,-pivotY);}
  else if(pose==="heavy"){ctx.translate(pivotX,pivotY);ctx.rotate((left?-1:1)*0.65);ctx.translate(-pivotX,-pivotY-3);}
  else if(pose==="thrust"){ctx.translate(left?-4:4,1);}
  else if(pose==="shoot"){ctx.translate(left?-2:2,-2);}
  else if(pose==="cast"){ctx.translate(0,-4);}
  else if(pose==="miss"){ctx.translate(left?3:-3,2);ctx.rotate((left?1:-1)*0.18);}
  switch(p.weapon){
    case "swordShield":
      line(ctx,hand,34+bob,outer,18+bob,p.metal,3);line(ctx,hand,34+bob,outer,18+bob,"#fff",.8);circ(ctx,left?28:7,30+bob,5,p.metalS);circ(ctx,left?28:7,30+bob,3.3,p.accent,p.metal,.8);break;
    case "orbStaff":case "crystalStaff":case "runeStaff":{
      const x=left?9:29;line(ctx,x,45,x,10,p.metalS,2.4);const glow=p.glow||p.accent;circ(ctx,x,8,4.7,glow,"#17191d",1);if(p.weapon==="crystalStaff")poly(ctx,[[x,2],[x-4,8],[x,13],[x+4,8]],glow,"#17191d",.8);if(p.weapon==="runeStaff")circ(ctx,x,8,2,p.bodyS,p.metal,.8);break;}
    case "dualDaggers":
      line(ctx,hand,34+bob,outer,26+bob,p.metal,2.3);line(ctx,left?27:9,34+bob,left?33:3,27+bob,p.metal,2.3);break;
    case "spearShield":
      line(ctx,hand,42+bob,outer,10+bob,p.metal,2.5);poly(ctx,[[outer,6+bob],[outer-3,12+bob],[outer+3,12+bob]],p.metal);circ(ctx,left?28:7,31+bob,4.6,p.bodyS,p.metal,.9);poly(ctx,[[left?28:7,27+bob],[left?32:11,31+bob],[left?28:7,35+bob],[left?24:3,31+bob]],p.accent,null);break;
    case "bowDagger":
      ctx.strokeStyle=p.accent;ctx.lineWidth=2;ctx.beginPath();ctx.arc(outer,29+bob,8,-1.2,1.2);ctx.stroke();line(ctx,hand,34+bob,left?5:31,28+bob,p.metal,2);break;
    case "hammerShield":
      line(ctx,hand,42+bob,outer,18+bob,p.hair,3);rr(ctx,left?0:29,14+bob,8,7,1.5,p.metal,"#17191d",1.2);circ(ctx,left?28:7,31+bob,5.4,p.metalS);circ(ctx,left?28:7,31+bob,3.5,p.accent,p.metal,.8);break;
    case "crossbowAxe":
      line(ctx,hand,34+bob,outer,29+bob,p.hair,2.5);line(ctx,outer-4,26+bob,outer+4,32+bob,p.metal,2);line(ctx,left?27:9,36+bob,left?32:4,27+bob,p.metal,2.5);break;
  }
  ctx.restore();
}

function drawHeroCore(ctx,p,dir,frame,race,pose="idle"){
  const bob=frame?-1:0;const step=frame?1:-1;ctx.fillStyle="rgba(0,0,0,.32)";ctx.beginPath();ctx.ellipse(18,45.5,11.5,3.2,0,0,Math.PI*2);ctx.fill();
  const stock=p.build==="stocky",slim=p.build==="slim";const bodyX=stock?7.5:slim?10:8.5;const bodyW=stock?21:slim?16:19;
  rr(ctx,11,36+step+bob,6,9,2,p.boots);rr(ctx,19,36-step+bob,6,9,2,p.boots);
  rr(ctx,bodyX,21+bob,bodyW,18,stock?6:5,p.body);rr(ctx,bodyX+1.5,22+bob,bodyW-3,9,3,p.bodyS,null);rr(ctx,bodyX,31+bob,bodyW,3,1.5,p.accent);
  if(dir==="left"){rr(ctx,7,24+bob,5.5,12,2.5,p.bodyS);circ(ctx,9.5,35+bob,2.3,p.skin);}else{rr(ctx,4.5,24+bob,5.5,12,2.5,p.bodyS);rr(ctx,26,24+bob,5.5,12,2.5,p.bodyS);circ(ctx,7.2,35+bob,2.3,p.skin);circ(ctx,28.8,35+bob,2.3,p.skin);}
  drawHead(ctx,p,dir,bob,race);drawWeapon(ctx,p,dir,bob,pose);
}

function drawProceduralHeroSprite(canvas,race="Humano",cls="Guerrero",dir="down",frame=0,hurt=false,pose="idle"){
  if(!canvas)return;
  if(race==="Humano"&&cls==="Guerrero"){drawPilotHumanWarrior(canvas,dir,frame,hurt,pose);return;}
  const p=HERO_PROFILES[`${race}:${cls}`]||HERO_PROFILES["Humano:Guerrero"];
  canvas.width=36;canvas.height=48;const ctx=canvas.getContext("2d");ctx.clearRect(0,0,36,48);ctx.imageSmoothingEnabled=true;
  if(dir==="right"){ctx.save();ctx.translate(36,0);ctx.scale(-1,1);drawHeroCore(ctx,p,"left",frame,race,pose);ctx.restore();}else drawHeroCore(ctx,p,dir,frame,race,pose);
  if(hurt){ctx.globalCompositeOperation="source-atop";ctx.fillStyle="rgba(220,40,40,.45)";ctx.fillRect(0,0,36,48);ctx.globalCompositeOperation="source-over";}
}

// Entrada pública: usa el arte maestro aprobado en selección, mundo libre y
// combate. El renderer procedural anterior sigue como respaldo seguro.
export function drawHeroSprite(canvas, race="Humano", cls="Guerrero", dir="down", frame=0, hurt=false, pose="idle") {
  if (!canvas) return;
  if (hasHeroAssetVisual(race, cls)) {
    const painted = drawHeroAssetSprite(canvas, race, cls, dir, frame, hurt);
    if (painted) return;
  }
  drawProceduralHeroSprite(canvas, race, cls, dir, frame, hurt, pose);
}

export { preloadHeroAssetVisuals };

