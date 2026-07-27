import { getHeroAssetPath, getHeroMasterId } from "@/lib/atlasHeroAssetSprites";
import { getEnemyAssetPath, getEnemyAssetProfile } from "@/lib/atlasEnemyAssetSprites";

// v2.19.5: los archivos runtime left/right fueron normalizados físicamente.
// El mismo asset sirve ahora en mundo libre y combate sin espejos especiales.
function normalizeFacing(facing) {
  return facing === "left" ? "left" : "right";
}

export function getHeroCombatAssetDescriptor(race, cls, desiredFacing = "right") {
  const assetId = getHeroMasterId(race, cls);
  if (!assetId) return null;
  const facing = normalizeFacing(desiredFacing);
  return {
    path: getHeroAssetPath(race, cls, facing),
    sourceDirection: facing,
    sourceFacing: facing,
    desiredFacing: facing,
    mirrorX: false,
  };
}

export function getEnemyCombatAssetDescriptor(type, variant, desiredFacing = "left") {
  const profile = getEnemyAssetProfile(type, variant);
  if (!profile) return null;
  const facing = normalizeFacing(desiredFacing);
  return {
    path: getEnemyAssetPath(type, variant, facing),
    sourceDirection: facing,
    sourceFacing: facing,
    desiredFacing: facing,
    mirrorX: false,
  };
}

export const ATLAS_COMBAT_FACING_AUDIT = Object.freeze({
  version: "2.19.5",
  normalizedRuntimeAssets: true,
  playerSide: "right",
  playerFacing: "left",
  enemySide: "left",
  enemyFacing: "right",
});
