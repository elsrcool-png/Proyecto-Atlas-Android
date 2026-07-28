import { HERO_PART_CATALOG, HERO_ASSET_GATE_STATUS } from "@/lib/atlasHeroModularData";
import { buildPlayerVisualStateV221 } from "@/lib/atlasHeroPlayerAdapter";
import { getCompiledHeroRig } from "@/lib/atlasHeroRigCompiler";
import { loadHeroImage } from "@/lib/atlasHeroImageCache";
const partBone = part => {
  if (part==='head_base') return 'head'; if (part==='neck') return 'neck'; if (part==='torso') return 'torso'; if (part==='pelvis') return 'pelvis';
  return part.replace(/_neutral$|_step$|_push$|_grip$|_open$|_cast$|_raised$|_bent$/, '');
};
export function hasStaticModularArt() { const g=HERO_ASSET_GATE_STATUS.art_gates; return (g.base_core_webp?.available||0)>=g.base_core_webp.required && (g.starter_equipment_and_appearance_webp?.available||0)>=g.starter_equipment_and_appearance_webp.required; }
export function buildHeroRenderDefinition(player, direction='down') {
  const visual=buildPlayerVisualStateV221(player); const rig=getCompiledHeroRig(visual.race);
  const parts=(HERO_PART_CATALOG.assets||[]).filter(p=>p.race===visual.race&&p.direction===direction&&p.tier==='mandatory_core').map(p=>({ id:p.id, src:p.src, bone:partBone(p.part), pivot:p.pivot_local, offset:{x:0,y:0}, scale:1, visible:true, status:p.status }));
  return { visual, rig, direction, parts, bodyHeightPx:rig.body_height_px };
}
export async function loadHeroRenderDefinition(definition) {
  const loaded=[]; for(const part of definition.parts) { if(part.status!=='ready' || !part.pivot) throw new Error(`Asset modular aún no producido/calibrado: ${part.id}`); loaded.push({...part,image:await loadHeroImage(part.src)}); }
  return {...definition,parts:loaded};
}
