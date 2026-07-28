import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GREEN_VISUAL_SCENES } from "../src/lib/atlasGreenVisualScenes.js";
const GREEN_RUNTIME_SCENES = GREEN_VISUAL_SCENES;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W=960,H=720,STEP=12,R=16;
const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
const coord = (sid) => ({ col:"ABC".indexOf(sid[0]), row:Number(sid[1])-1 });
const targetsFor = (sid,scene) => {
  const {col,row}=coord(sid); const out=[];
  if(row>0) out.push({name:"north",x:480,y:20});
  if(row<2) out.push({name:"south",x:480,y:700});
  if(col>0) out.push({name:"west",x:20,y:360});
  if(col<2) out.push({name:"east",x:940,y:360});
  for(const [role,p] of Object.entries(scene.npcAnchors||{})) out.push({name:`npc:${role}`,...p});
  if(scene.sanctuary) out.push({name:"sanctuary-spawn",x:scene.sanctuary.spawnX,y:scene.sanctuary.spawnY});
  if(scene.bossAnchor) out.push({name:"boss",...scene.bossAnchor});
  out.push({name:"objective",...scene.objectiveAnchor});
  return out;
};
function blocked(x,y,collisions){
  if(x<R||x>W-R||y<R||y>H-R) return true;
  return collisions.some(c=>x+R>c.x&&x-R<c.x+c.w&&y+R>c.y&&y-R<c.y+c.h);
}
function bfs(scene){
  const sx=Math.round(scene.spawn.x/STEP),sy=Math.round(scene.spawn.y/STEP);
  const q=[[sx,sy]], seen=new Set([`${sx},${sy}`]);
  while(q.length){ const [x,y]=q.shift(); for(const [dx,dy] of dirs){ const nx=x+dx,ny=y+dy,k=`${nx},${ny}`; if(seen.has(k)) continue; const px=nx*STEP,py=ny*STEP; if(blocked(px,py,scene.collisions||[])) continue; seen.add(k); q.push([nx,ny]); }}
  return seen;
}
let errors=0;
for(const [sid,scene] of Object.entries(GREEN_RUNTIME_SCENES)){
  const issues=[];
  if(blocked(scene.spawn.x,scene.spawn.y,scene.collisions||[])) issues.push(`spawn blocked ${scene.spawn.x},${scene.spawn.y}`);
  for(const item of [...(scene.baseLayers||[]),...(scene.objects||[])]){
    const rel=item.asset?.replace(/^\//,""); if(rel&&!fs.existsSync(path.join(root,"public",rel))) issues.push(`missing asset ${item.asset}`);
  }
  for(const c of scene.collisions||[]){ if(c.x<0||c.y<0||c.x+c.w>W||c.y+c.h>H) issues.push(`collision out of bounds ${c.id}`); }
  const reachable=bfs(scene);
  for(const t of targetsFor(sid,scene)){
    const tx=Math.round(t.x/STEP),ty=Math.round(t.y/STEP); let ok=false;
    for(let ox=-2;ox<=2&&!ok;ox++)for(let oy=-2;oy<=2&&!ok;oy++) if(reachable.has(`${tx+ox},${ty+oy}`)) ok=true;
    if(!ok) issues.push(`unreachable ${t.name} @ ${t.x},${t.y}`);
  }
  if(issues.length){ errors+=issues.length; console.log(`FAIL ${sid}`); for(const i of issues) console.log(`  - ${i}`); }
  else console.log(`OK   ${sid}: ${scene.objects.length} objects, ${scene.collisions.length} collisions`);
}
if(errors){ console.error(`\n${errors} scene validation errors.`); process.exit(1); }
console.log("\nAll Green Region scenes are asset-complete and reachable.");
