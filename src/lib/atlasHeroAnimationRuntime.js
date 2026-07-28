import { HERO_UNIVERSAL_CLIPS, HERO_WEAPON_CLIPS, HERO_WEAPON_QUALITY_PROFILES } from "@/lib/atlasHeroModularData";
import { getWeaponAnimationAssignment } from "@/lib/atlasHeroEquipmentVisualCatalog";
const lerp = (a, b, t) => a + (b - a) * t;
export function sampleAnimationKeys(keys, t) {
  if (!Array.isArray(keys) || !keys.length) return {};
  if (t <= keys[0].t) return { ...keys[0] }; if (t >= keys.at(-1).t) return { ...keys.at(-1) };
  for (let i=1;i<keys.length;i+=1) { const a=keys[i-1], b=keys[i]; if (t<=b.t) { const q=(t-a.t)/Math.max(1e-6,b.t-a.t); const out={t}; for (const key of new Set([...Object.keys(a),...Object.keys(b)])) { if(key==='t') continue; const av=a[key]??b[key], bv=b[key]??a[key]; out[key]=typeof av==='number'&&typeof bv==='number'?lerp(av,bv,q):(q<.5?av:bv); } return out; } }
  return { ...keys.at(-1) };
}
function sampleTracks(tracks, t, bodyHeightPx, universal = false) {
  const transforms={}; const pseudoLayers={};
  for (const track of tracks || []) { const v=sampleAnimationKeys(track.keys,t); const normalized = universal ? track.unit === 'normalized_body' : true; const target=track.bone==='shadow'?pseudoLayers:transforms; target[track.bone]={ x:(v.x||0)*(normalized?bodyHeightPx:1), y:(v.y||0)*(normalized?bodyHeightPx:1), rotation:v.rotation||0, scaleX:v.scale_x??1, scaleY:v.scale_y??1, opacity:v.opacity??1, assetVariant:v.asset_variant??null }; }
  return { transforms, pseudoLayers };
}
export function resolveUniversalClip(id) { return HERO_UNIVERSAL_CLIPS[id] || HERO_UNIVERSAL_CLIPS.idle_world || null; }
export function resolveWeaponFamilyClip({ weaponId, family, qualityId='medio', kind='basic', landed=true }={}) {
  const assignment=getWeaponAnimationAssignment(weaponId); const f=family||assignment?.family||'straight_sword';
  let clipId; if(!landed||qualityId==='fallo_critico') clipId=assignment?.miss_clip||`${f}.miss`; else if(qualityId==='critico') clipId=assignment?.critical_clip||`${f}.critical`; else if(kind==='weapon_skill'||kind==='skill'||kind==='classAbility'||kind==='hybrid'||kind==='definitive') clipId=assignment?.skill_clip||`${f}.skill`; else clipId=assignment?.basic_clip||`${f}.basic`;
  return HERO_WEAPON_CLIPS[clipId] || HERO_WEAPON_CLIPS[`${f}.basic`] || null;
}
export function warpWeaponClipToSequence(clip, sequence, elapsedMs) {
  const total=Math.max(1,Number(sequence?.totalDuration||clip?.duration_ms||1)); const events=sequence?.events||[];
  const moveAt=Number(events.find(e=>e.type==='MOVE_ATTACKER')?.at??total*.24); const returnAt=Number(events.find(e=>e.type==='RETURN_ATTACKER')?.at??total*.82);
  if(elapsedMs<=moveAt) return .24*Math.max(0,elapsedMs/Math.max(1,moveAt)); if(elapsedMs<returnAt) return .24+.58*((elapsedMs-moveAt)/Math.max(1,returnAt-moveAt)); return Math.min(1,.82+.18*((elapsedMs-returnAt)/Math.max(1,total-returnAt)));
}
export function sampleUniversalClip(clip, elapsedMs, bodyHeightPx, speed=1) {
  if(!clip) return {complete:true,normalized:1,transforms:{},pseudoLayers:{}}; const duration=Math.max(1,Number(clip.duration_ms)||1); const scaled=Math.max(0,elapsedMs)*Math.max(.01,speed); const local=clip.loop?scaled%duration:Math.min(duration,scaled); const normalized=local/duration; return {duration,localMs:local,normalized,complete:!clip.loop&&scaled>=duration,...sampleTracks(clip.tracks,normalized,bodyHeightPx,true)};
}
export function sampleWeaponClip(clip, { elapsedMs=0, sequence=null, bodyHeightPx=300 }={}) {
  if(!clip) return {complete:true,normalized:1,transforms:{},pseudoLayers:{},layers:{}}; const normalized=sequence?warpWeaponClipToSequence(clip,sequence,elapsedMs):Math.min(1,elapsedMs/Math.max(1,clip.duration_ms)); const layers={}; for(const c of clip.layer_changes||[]) if(normalized>=c.anchor) layers[c.attachment]=c.layer; return {duration:sequence?.totalDuration||clip.duration_ms,normalized,complete:normalized>=1,layers,...sampleTracks(clip.tracks,normalized,bodyHeightPx,false)};
}
export function getQualityProfile(id) { const p=HERO_WEAPON_QUALITY_PROFILES.profiles||{}; return Object.values(p).find(v=>(v.source_quality_ids||[]).includes(id))||p.normal||null; }
export function contextualClipOrFallback(id, supportAvailable=false) { if(id==='sit_rest'&&!supportAvailable) return resolveUniversalClip('idle_world'); return resolveUniversalClip(id); }
