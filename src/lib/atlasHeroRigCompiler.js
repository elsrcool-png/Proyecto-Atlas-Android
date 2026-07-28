import { HERO_RIG_SOURCE } from "@/lib/atlasHeroModularData";
function finite(node, id) { if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) throw new Error(`Coordenada inválida en ${id}`); }
export function compileDirectionRig(directionRig) {
  const source = directionRig?.bones || {}; const localBones = {}; const visiting = new Set(); const done = new Set();
  function compile(id) {
    if (done.has(id)) return localBones[id];
    if (visiting.has(id)) throw new Error(`Ciclo de rig detectado en ${id}`);
    const bone = source[id]; if (!bone) throw new Error(`Hueso inexistente: ${id}`); finite(bone, id); visiting.add(id);
    let x = bone.x; let y = bone.y;
    if (bone.parent) { const parent = source[bone.parent]; if (!parent) throw new Error(`Padre inexistente ${bone.parent} para ${id}`); compile(bone.parent); x -= parent.x; y -= parent.y; }
    localBones[id] = { id, parent: bone.parent || null, x, y, sourceX: bone.x, sourceY: bone.y };
    visiting.delete(id); done.add(id); return localBones[id];
  }
  Object.keys(source).forEach(compile);
  return { ...directionRig, coordinateMode: "local_hierarchical", bones: localBones };
}
export function compileHeroRig(sourceRig) {
  const directions = {}; for (const [direction, data] of Object.entries(sourceRig?.directions || {})) directions[direction] = compileDirectionRig(data);
  return { ...sourceRig, compiled: true, directions };
}
const cache = new Map();
export function getCompiledHeroRig(race) {
  const id = String(race || "humano").toLowerCase(); const key = id.includes("elf") ? "elfo" : id.includes("enan") ? "enano" : "humano";
  if (!cache.has(key)) cache.set(key, compileHeroRig(HERO_RIG_SOURCE[key]));
  return cache.get(key);
}
