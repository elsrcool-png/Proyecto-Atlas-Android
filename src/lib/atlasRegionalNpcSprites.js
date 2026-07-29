// PROYECTO ATLAS — NPC propios para Reino Ártico y Reino Árido.
// Cada personaje nombrado posee silueta, paleta y accesorio reconocibles.

const P = Object.freeze({
  // Ártico
  fria_boreas:{region:"fria",role:"leader",coat:"#315a78",trim:"#8fd9ef",hair:"#d6e4ea",skin:"#ddb28e",acc:"spear",hat:"fur"},
  fria_lyra_cartographer:{region:"fria",role:"scholar",coat:"#496d91",trim:"#c9e8f4",hair:"#7b5b42",skin:"#e6bb95",acc:"scroll",hat:"hood"},
  fria_freya:{region:"fria",role:"hunter",coat:"#365f58",trim:"#a9d4c0",hair:"#b77743",skin:"#e1b18a",acc:"bow",hat:"fur"},
  fria_merchant_camp:{region:"fria",role:"merchant",coat:"#6b527e",trim:"#d7b56e",hair:"#554035",skin:"#deb18c",acc:"bag",hat:"cap"},
  fria_refuge_keeper:{region:"fria",role:"inn",coat:"#724b42",trim:"#e3b77a",hair:"#60402d",skin:"#ddb18c",acc:"lantern",hat:"fur"},
  fria_dvalin:{region:"fria",role:"climber",coat:"#4f6875",trim:"#b9ced5",hair:"#3e3531",skin:"#d7aa84",acc:"pick",hat:"cap"},
  fria_shaman:{region:"fria",role:"shaman",coat:"#405e82",trim:"#8ef0ef",hair:"#eef5f6",skin:"#d9ad89",acc:"staff",hat:"antler",glow:"#7ce7ef"},
  fria_merchant_glacial:{region:"fria",role:"merchant",coat:"#5a6b89",trim:"#d6d4a2",hair:"#634c3e",skin:"#dfb28b",acc:"bag",hat:"hood"},
  fria_helga:{region:"fria",role:"inn",coat:"#7d4f5b",trim:"#f0c57b",hair:"#c48a57",skin:"#e8bb94",acc:"mug",hat:"cap"},
  fria_astra:{region:"fria",role:"fisher",coat:"#38717a",trim:"#b7e4e8",hair:"#283e49",skin:"#dcae88",acc:"rod",hat:"hood"},
  fria_queen:{region:"fria",role:"queen",coat:"#496aa3",trim:"#d8f8ff",hair:"#eef8ff",skin:"#e9c3a3",acc:"scepter",hat:"crown",glow:"#9eefff"},
  fria_lyra_researcher:{region:"fria",role:"researcher",coat:"#5c4e8c",trim:"#93e6f2",hair:"#7b5b42",skin:"#e6bb95",acc:"crystal",hat:"circlet",glow:"#77e7f2"},
  fria_captain:{region:"fria",role:"captain",coat:"#344f73",trim:"#c9d8e8",hair:"#3d3130",skin:"#d9a984",acc:"sword",hat:"helm"},
  fria_kael_forger:{region:"fria",role:"forger",coat:"#5d5149",trim:"#e09455",hair:"#693d29",skin:"#d6a37b",acc:"hammer",hat:"goggles"},
  fria_merchant_royal:{region:"fria",role:"merchant",coat:"#67578f",trim:"#f0d37a",hair:"#4a3e36",skin:"#e0b38d",acc:"bag",hat:"noble"},
  fria_hostelera:{region:"fria",role:"inn",coat:"#744f68",trim:"#f1c798",hair:"#9b6041",skin:"#e5b891",acc:"key",hat:"cap"},
  fria_borin:{region:"fria",role:"smith",coat:"#4e4f59",trim:"#8bd7ef",hair:"#70402b",skin:"#d9a57d",acc:"hammer",hat:"helm"},
  fria_einar:{region:"fria",role:"survivor",coat:"#4a5963",trim:"#90b9c8",hair:"#5d4639",skin:"#c99775",acc:"bandage",hat:"none"},

  // Árido
  desierto_sahara_nomad:{region:"desierto",role:"leader",coat:"#a95f37",trim:"#f1c36a",hair:"#2f241e",skin:"#b97852",acc:"spear",hat:"veil"},
  desierto_kael_explorer:{region:"desierto",role:"explorer",coat:"#9b7743",trim:"#d8b36e",hair:"#4f3527",skin:"#c88c63",acc:"compass",hat:"wrap"},
  desierto_merchant_camp:{region:"desierto",role:"merchant",coat:"#8d4d54",trim:"#e6b45b",hair:"#473129",skin:"#c78962",acc:"bag",hat:"turban"},
  desierto_oasis_keeper:{region:"desierto",role:"inn",coat:"#3b7b78",trim:"#e2c47a",hair:"#50362b",skin:"#c98d65",acc:"jug",hat:"wrap"},
  desierto_dara_bedouin:{region:"desierto",role:"bedouin",coat:"#785d42",trim:"#c89a56",hair:"#362820",skin:"#b97954",acc:"staff",hat:"veil"},
  desierto_oasis_guardian:{region:"desierto",role:"guardian",coat:"#2f7b68",trim:"#f0c76b",hair:"#3b2922",skin:"#c98761",acc:"spearShield",hat:"circlet"},
  desierto_aran:{region:"desierto",role:"historian",coat:"#715b72",trim:"#d6b66f",hair:"#d3c2a1",skin:"#c68a64",acc:"scroll",hat:"turban"},
  desierto_crystal_artisan:{region:"desierto",role:"artisan",coat:"#8a4e72",trim:"#7fe1d7",hair:"#3f2926",skin:"#cf916a",acc:"crystal",hat:"goggles",glow:"#62ddd4"},
  desierto_merchant_oasis:{region:"desierto",role:"merchant",coat:"#9b673f",trim:"#e6c069",hair:"#4b3328",skin:"#c98c65",acc:"bag",hat:"turban"},
  desierto_posadera:{region:"desierto",role:"inn",coat:"#a0524d",trim:"#f0ca83",hair:"#5b362b",skin:"#d0946d",acc:"mug",hat:"veil"},
  desierto_dara_trader:{region:"desierto",role:"trader",coat:"#6f5b3e",trim:"#c6a158",hair:"#392821",skin:"#bd7f5b",acc:"coins",hat:"wrap"},
  desierto_pharaoh:{region:"desierto",role:"pharaoh",coat:"#68416f",trim:"#ffd45a",hair:"#241a1a",skin:"#bd7c53",acc:"scepter",hat:"pharaoh",glow:"#ffca3a"},
  desierto_solar_priest:{region:"desierto",role:"priest",coat:"#f0e1b5",trim:"#e29a32",hair:"#5c3928",skin:"#c78a62",acc:"sunStaff",hat:"sun",glow:"#ffc94d"},
  desierto_merchant_ancient:{region:"desierto",role:"merchant",coat:"#6e457e",trim:"#e6b558",hair:"#403027",skin:"#c98b65",acc:"relic",hat:"noble"},
  desierto_hostelera:{region:"desierto",role:"inn",coat:"#7c4c4a",trim:"#efc27e",hair:"#6a3f31",skin:"#d0926a",acc:"key",hat:"veil"},
  desierto_solar_forger:{region:"desierto",role:"smith",coat:"#664239",trim:"#ff9f35",hair:"#4e2d22",skin:"#c4825c",acc:"hammer",hat:"goggles",glow:"#ff9e31"},
});

export const REGIONAL_NPC_VARIANTS=Object.freeze(new Set(Object.keys(P)));
export function isRegionalNpcVariant(v){return REGIONAL_NPC_VARIANTS.has(v);}

function rr(c,x,y,w,h,r,f,s="#171412",lw=1.1){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();if(f){c.fillStyle=f;c.fill();}if(s){c.strokeStyle=s;c.lineWidth=lw;c.stroke();}}
function circ(c,x,y,r,f,s="#171412",lw=1){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(f){c.fillStyle=f;c.fill();}if(s){c.strokeStyle=s;c.lineWidth=lw;c.stroke();}}
function line(c,x1,y1,x2,y2,col,w=2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=w;c.lineCap="round";c.stroke();}
function poly(c,pts,f,s="#171412",lw=1){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();if(f){c.fillStyle=f;c.fill();}if(s){c.strokeStyle=s;c.lineWidth=lw;c.stroke();}}

function headgear(c,p,b){
  switch(p.hat){
    case"fur":rr(c,8.5,6+b,19,8,4,"#e7edf0");rr(c,10,8+b,16,5,2,p.coat);break;
    case"hood":case"veil":rr(c,8.5,7+b,19,10,5,p.coat);rr(c,10,10+b,16,5,3,p.trim,null);break;
    case"cap":rr(c,9,7+b,18,7,3,p.coat);rr(c,11,6+b,14,3,1.5,p.trim,null);break;
    case"antler":poly(c,[[9,11+b],[5,4+b],[10,7+b],[12,2+b],[14,9+b]],p.trim);poly(c,[[27,11+b],[31,4+b],[26,7+b],[24,2+b],[22,9+b]],p.trim);rr(c,9,8+b,18,7,3,p.coat);break;
    case"crown":case"noble":poly(c,[[9,12+b],[11,5+b],[15,10+b],[18,3+b],[21,10+b],[25,5+b],[27,12+b]],p.trim);rr(c,9,11+b,18,4,1.5,p.coat);break;
    case"circlet":line(c,10,11+b,26,11+b,p.trim,1.3);circ(c,18,10.5+b,1.5,p.glow||p.trim,null);break;
    case"helm":rr(c,9,6+b,18,9,4,"#8e9aa3");rr(c,10,10+b,16,5,2,p.coat);break;
    case"goggles":rr(c,10,8+b,16,6,3,p.coat);circ(c,14,11+b,2,"#86dbe8");circ(c,22,11+b,2,"#86dbe8");line(c,16,11+b,20,11+b,p.trim,1);break;
    case"turban":case"wrap":rr(c,8.5,6+b,19,9,4,p.trim);rr(c,10,9+b,16,5,2,p.coat);break;
    case"pharaoh":poly(c,[[8,7+b],[28,7+b],[25,24+b],[20,17+b],[16,17+b],[11,24+b]],p.coat);rr(c,9,7+b,18,6,2,p.trim);break;
    case"sun":circ(c,18,7+b,6,p.trim);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(c,18+Math.cos(a)*7,7+b+Math.sin(a)*7,18+Math.cos(a)*10,7+b+Math.sin(a)*10,p.trim,1.5);}rr(c,10,9+b,16,6,2,p.coat);break;
  }
}
function accessory(c,p,dir,b){const left=dir==="left",x=left?8:30,o=left?2:34;switch(p.acc){
  case"spear":line(c,x,43+b,o,13+b,p.trim,2.5);poly(c,[[o,9+b],[o-3,15+b],[o+3,15+b]],"#d9e1e5");break;
  case"spearShield":line(c,x,43+b,o,13+b,p.trim,2.5);circ(c,left?28:7,31+b,5,p.coat);circ(c,left?28:7,31+b,3,p.trim,null);break;
  case"bow":c.strokeStyle="#7b5232";c.lineWidth=2;c.beginPath();c.arc(o,29+b,8,-1.2,1.2);c.stroke();break;
  case"scroll":rr(c,left?2:28,27+b,7,10,2,"#e7d4a4");line(c,left?3:29,30+b,left?8:34,30+b,"#9a6f3a",1);break;
  case"bag":rr(c,left?2:27,29+b,8,9,3,"#76502f");line(c,left?4:29,29+b,left?7:32,25+b,p.trim,1.5);break;
  case"lantern":line(c,x,31+b,x,37+b,p.trim,1.5);rr(c,left?4:26,36+b,8,8,2,"#ffcf55");break;
  case"pick":line(c,x,41+b,o,24+b,"#67452c",2.5);line(c,o-4,22+b,o+4,26+b,"#a6b0b6",2.5);break;
  case"staff":case"sunStaff":line(c,x,45,x,10,"#6d4a2e",2.4);circ(c,x,8,4.2,p.glow||p.trim);break;
  case"mug":rr(c,left?2:27,31+b,7,7,1.5,"#a96d3a");circ(c,left?2:34,34+b,2.5,null,"#a96d3a",1.5);break;
  case"rod":line(c,x,42+b,o,14+b,"#745234",1.8);line(c,o,14+b,o+3,28+b,"#cfdde1",.8);break;
  case"scepter":line(c,x,44,x,13,p.trim,2.5);circ(c,x,10,3.2,p.glow||p.trim);break;
  case"crystal":poly(c,[[o,24+b],[o-4,31+b],[o,38+b],[o+4,31+b]],p.glow||p.trim);break;
  case"sword":line(c,x,36+b,o,19+b,"#d9e0e5",2.8);break;
  case"hammer":line(c,x,41+b,o,28+b,"#71462b",2.5);rr(c,left?0:30,24+b,8,7,1,"#929da4");break;
  case"bandage":rr(c,12,24+b,12,3,1,"#d8d1bd",null);break;
  case"compass":circ(c,o,31+b,4,p.trim);line(c,o,28+b,o+2,33+b,p.coat,1);break;
  case"jug":rr(c,left?2:27,29+b,8,11,3,"#58a5a0");break;
  case"coins":circ(c,o,32+b,3,p.trim);circ(c,o+2,35+b,2.4,"#e7b851");break;
  case"relic":poly(c,[[o,24+b],[o-5,31+b],[o,39+b],[o+5,31+b]],p.trim);break;
  case"key":line(c,o,29+b,o,38+b,p.trim,2);circ(c,o,27+b,3,null,p.trim,1.5);break;
}}

function core(c,p,dir,frame){const b=frame?-1:0,step=frame?1:-1;c.fillStyle="rgba(0,0,0,.3)";c.beginPath();c.ellipse(18,45.5,11.5,3.1,0,0,Math.PI*2);c.fill();rr(c,11,36+step+b,6,9,2,"#2b211a");rr(c,19,36-step+b,6,9,2,"#2b211a");rr(c,8,21+b,20,18,6,p.coat);rr(c,9,22+b,18,9,4,p.trim,null);rr(c,8,31+b,20,3,1,p.coat);rr(c,4.5,24+b,5.5,12,2.5,p.coat);rr(c,26,24+b,5.5,12,2.5,p.coat);circ(c,7.2,35+b,2.2,p.skin);circ(c,28.8,35+b,2.2,p.skin);circ(c,18,15+b,8.5,p.skin);headgear(c,p,b);if(dir==="down"){rr(c,14,14+b,2,2.5,.5,"#2a1b16",null);rr(c,20,14+b,2,2.5,.5,"#2a1b16",null);}else if(dir==="left")rr(c,13,14+b,2,2.5,.5,"#2a1b16",null);accessory(c,p,dir,b);}

export function drawRegionalNpc(canvas,variant,dir="down",frame=0,hurt=false){const p=P[variant];if(!canvas||!p)return;canvas.width=36;canvas.height=48;const c=canvas.getContext("2d");c.clearRect(0,0,36,48);c.imageSmoothingEnabled=true;if(dir==="right"){c.save();c.translate(36,0);c.scale(-1,1);core(c,p,"left",frame);c.restore();}else core(c,p,dir,frame);if(hurt){c.globalCompositeOperation="source-atop";c.fillStyle="rgba(220,40,40,.45)";c.fillRect(0,0,36,48);c.globalCompositeOperation="source-over";}}
