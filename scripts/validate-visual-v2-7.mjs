import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ARCTIC_VISUAL_SCENES } from "../src/lib/atlasArcticVisualScenes.js";
import { DESERT_VISUAL_SCENES } from "../src/lib/atlasDesertVisualScenes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGIONS = { fria: ARCTIC_VISUAL_SCENES, desierto: DESERT_VISUAL_SCENES };
const sectors = ["A1","B1","C1","A2","B2","C2","A3","B3","C3"];
const W=960,H=720,STEP=12,R=14;
const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
let failures=0;

function blocked(x,y,collisions){
  if(x<R||x>W-R||y<R||y>H-R) return true;
  return collisions.some(c=>x+R>c.x&&x-R<c.x+c.w&&y+R>c.y&&y-R<c.y+c.h);
}
function bfs(scene){
  const sx=Math.round(scene.spawn.x/STEP), sy=Math.round(scene.spawn.y/STEP);
  const q=[[sx,sy]], seen=new Set([`${sx},${sy}`]);
  while(q.length){
    const [x,y]=q.shift();
    for(const [dx,dy] of dirs){
      const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;
      if(seen.has(k)) continue;
      const px=nx*STEP,py=ny*STEP;
      if(blocked(px,py,scene.collisions||[])) continue;
      seen.add(k); q.push([nx,ny]);
    }
  }
  return seen;
}
function near(reachable,p){
  const tx=Math.round(p.x/STEP),ty=Math.round(p.y/STEP);
  for(let ox=-3;ox<=3;ox++) for(let oy=-3;oy<=3;oy++) if(reachable.has(`${tx+ox},${ty+oy}`)) return true;
  return false;
}

for(const [regionId,scenes] of Object.entries(REGIONS)){
  for(const sid of sectors){
    const scene=scenes[sid]; const issues=[];
    if(!scene){ issues.push("escena ausente"); }
    else {
      if(scene.regionId!==regionId) issues.push(`regionId ${scene.regionId}`);
      if(scene.version!=="2.7.0") issues.push(`versión ${scene.version}`);
      if(!scene.baseLayers?.length) issues.push("sin terreno base");
      for(const item of [...(scene.baseLayers||[]),...(scene.objects||[])]){
        const rel=(item.src||item.asset||"").replace(/^\//,"");
        const p=path.join(root,"public",rel);
        if(!rel||!fs.existsSync(p)||fs.statSync(p).size<200) issues.push(`asset ausente ${rel}`);
      }
      for(const c of scene.collisions||[]){
        if(c.x<0||c.y<0||c.x+c.w>W||c.y+c.h>H) issues.push(`colisión fuera de mapa ${c.id}`);
      }
      if(blocked(scene.spawn.x,scene.spawn.y,scene.collisions||[])) issues.push("spawn bloqueado");
      const reachable=bfs(scene);
      const required=[scene.objectiveAnchor,...Object.values(scene.npcAnchors||{})];
      if(scene.sanctuary) required.push({x:scene.sanctuary.spawnX,y:scene.sanctuary.spawnY});
      if(scene.bossAnchor) required.push(scene.bossAnchor);
      for(const p of required.filter(Boolean)) if(!near(reachable,p)) issues.push(`objetivo inaccesible ${p.x},${p.y}`);
    }
    if(issues.length){ failures+=issues.length; console.error(`FAIL ${regionId}:${sid}`); issues.forEach(i=>console.error(" -",i)); }
    else console.log(`OK ${regionId}:${sid} · ${scene.objects.length} objetos · ${scene.collisions.length} colisiones`);
  }
}

const registry=fs.readFileSync(path.join(root,"src/lib/atlasVisualScenes.js"),"utf8");
for(const token of ["ARCTIC_VISUAL_SCENES","DESERT_VISUAL_SCENES","fria: ARCTIC_VISUAL_SCENES","desierto: DESERT_VISUAL_SCENES"]) if(!registry.includes(token)){ failures++; console.error(`Registro ausente: ${token}`); }
if(failures){ console.error(`Atlas Visual v2.7 falló con ${failures} incidencias.`); process.exit(1); }
console.log("Atlas Visual v2.7 validado: 18/18 escenas nuevas, assets presentes y puntos clave accesibles.");
