import React, { useEffect, useMemo, useRef, useState } from "react";
import { drawPlayerSprite } from "@/lib/atlasPixel";
import { buildHeroRenderDefinition, hasStaticModularArt, loadHeroRenderDefinition } from "@/lib/atlasHeroAssembler";
import { drawModularHero } from "@/lib/atlasHeroCanvasRenderer";
import { contextualClipOrFallback, resolveWeaponFamilyClip, sampleUniversalClip, sampleWeaponClip } from "@/lib/atlasHeroAnimationRuntime";
import { isHeroModularSurfaceEnabled, isUniversalAnimationSurfaceEnabled, isWeaponFamilyAnimationEnabled } from "@/lib/atlasHeroIntegrationFlags";

export default function ModularHeroSprite({ player, race, cls, direction="down", size=56, surface="characterSheet", moving=false, running=false, pose="idle", animation=null, sequence=null, qualityId="medio", landed=true, animationKind="basic", animationToken=0, style, className }) {
  const canvasRef=useRef(null); const rafRef=useRef(0); const [failed,setFailed]=useState(false);
  const safePlayer=useMemo(()=>player||{race:race||'Humano',class:cls||'Guerrero',equipmentUnlocks:{helmet:false,accessory2:false}},[player,race,cls]);
  const enabled=isHeroModularSurfaceEnabled(surface)&&hasStaticModularArt()&&!failed;
  const height=Math.round(size*(48/36));
  useEffect(()=>{ if(enabled)return; drawPlayerSprite(canvasRef.current,safePlayer.class,direction,0,3,safePlayer.race); },[enabled,safePlayer,direction,size]);
  useEffect(()=>{ if(!enabled)return undefined; let cancelled=false; let loaded=null; const started=performance.now();
    loadHeroRenderDefinition(buildHeroRenderDefinition(safePlayer,direction)).then(value=>{loaded=value; const tick=now=>{ if(cancelled||!canvasRef.current)return; const elapsed=now-started; let animState={transforms:{}};
      if(animation?.source==='phase7'&&isWeaponFamilyAnimationEnabled(surface)){ const clip=resolveWeaponFamilyClip({weaponId:animation.weaponId,family:animation.family,qualityId,kind:animationKind,landed}); animState=sampleWeaponClip(clip,{elapsedMs:elapsed,sequence,bodyHeightPx:value.bodyHeightPx}); }
      else if(isUniversalAnimationSurfaceEnabled(surface)){ const id=animation?.id||(moving?(running?'run':'walk'):(pose==='hurt'?'hurt_light':pose==='defeat'?'defeat':pose==='victory'?'victory':'idle_world')); const clip=contextualClipOrFallback(id,false); animState=sampleUniversalClip(clip,elapsed,value.bodyHeightPx); }
      drawModularHero(canvasRef.current.getContext('2d'),value,animState); rafRef.current=requestAnimationFrame(tick); }; rafRef.current=requestAnimationFrame(tick); }).catch(()=>{if(!cancelled)setFailed(true);});
    return()=>{cancelled=true;cancelAnimationFrame(rafRef.current);};
  },[enabled,safePlayer,direction,surface,moving,running,pose,animation,sequence,qualityId,landed,animationKind,animationToken]);
  return <canvas ref={canvasRef} width={enabled?288:36} height={enabled?384:48} className={className} data-atlas-modular={enabled?'true':'false'} style={{width:size,height,imageRendering:'auto',...style}} />;
}
