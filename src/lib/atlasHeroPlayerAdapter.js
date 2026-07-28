import { resolveWeaponDefId } from "@/lib/atlasWeaponInstances";
import { HERO_INITIAL_LOADOUTS } from "@/lib/atlasHeroModularData";
const raceId = value => String(value || "Humano").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const classId = value => String(value || "Guerrero").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export function heroCombinationId(player) { return `${raceId(player?.race)}_${classId(player?.class)}`; }
export function buildPlayerVisualStateV221(player) {
  if (!player) throw new Error("player es obligatorio");
  const lootWeaponId = player.weapon ? resolveWeaponDefId(player, player.weapon) : null;
  const weaponDefinitionId = lootWeaponId || player.classWeapon || null;
  const loadout = HERO_INITIAL_LOADOUTS.heroes?.[heroCombinationId(player)] || null;
  return {
    race: raceId(player.race), className: player.class, combinationId: heroCombinationId(player),
    appearance: player.appearance || (loadout ? { version: 1, profileId: loadout.appearance, raceBase: loadout.body } : null),
    archetypeSecondary: loadout?.archetype_secondary || null,
    equipment: {
      weaponDefinitionId, weaponSource: lootWeaponId ? "lootWeapon" : player.classWeapon ? "classWeapon" : "none",
      armorId: player.armor || loadout?.armor || null,
      helmetId: player.equipmentUnlocks?.helmet ? (player.helmet || null) : null,
      accessory1Id: player.accessory || null,
      accessory2Id: player.equipmentUnlocks?.accessory2 ? (player.accessory2 || null) : null,
      helmetUnlocked: !!player.equipmentUnlocks?.helmet,
      accessory2Unlocked: !!player.equipmentUnlocks?.accessory2,
    },
  };
}
