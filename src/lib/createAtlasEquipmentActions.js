import { recomputePlayer, ACCESSORIES, RARITY_VALUE, RARITY_SELLABLE } from "@/lib/atlasSkills";
import { HELMETS, RARITIES } from "@/lib/atlasLoot";

export default function createAtlasEquipmentActions({ playerRef, setPlayer, toast }) {
  const equipAccessory = (id, slot = 1) => {
    const player = playerRef.current;
    if (!player || !ACCESSORIES[id]) return;

    const secondSlot = Number(slot) === 2;
    if (secondSlot && !player.equipmentUnlocks?.accessory2) {
      toast("Accesorio II aún está bloqueado", "info");
      return;
    }

    const targetKey = secondSlot ? "accessory2" : "accessory";
    const otherKey = secondSlot ? "accessory" : "accessory2";
    const wasEquipped = player[targetKey] === id;

    if (!wasEquipped && player[otherKey] === id) {
      toast("No puedes equipar el mismo accesorio dos veces", "info");
      return;
    }

    setPlayer(prev => recomputePlayer({
      ...prev,
      [targetKey]: prev[targetKey] === id ? null : id,
    }));
    toast(
      wasEquipped
        ? "Accesorio desequipado"
        : `Equipado en Accesorio ${secondSlot ? "II" : "I"}: ${ACCESSORIES[id].name}`,
      "equip",
    );
  };

  const equipHelmet = (id) => {
    const player = playerRef.current;
    if (!player || !HELMETS[id]) return;
    if (!player.equipmentUnlocks?.helmet) {
      toast("El espacio de Casco aún está bloqueado", "info");
      return;
    }

    const wasEquipped = player.helmet === id;
    setPlayer(prev => recomputePlayer({
      ...prev,
      helmet: prev.helmet === id ? null : id,
    }));
    toast(wasEquipped ? "Casco desequipado" : `Equipado: ${HELMETS[id].name}`, "equip");
  };

  const sellHelmet = (id) => {
    const helmet = HELMETS[id];
    if (!helmet) return;
    if (!RARITIES[helmet.rarity]?.sellable) {
      toast("Este casco no se puede vender", "info");
      return;
    }

    const value = RARITIES[helmet.rarity]?.sell || 10;
    setPlayer(prev => recomputePlayer({
      ...prev,
      helmet: prev.helmet === id ? null : prev.helmet,
      helmetInventory: (prev.helmetInventory || []).filter(itemId => itemId !== id),
      gold: (prev.gold || 0) + value,
    }));
    toast(`Vendido: +${value} oro`, "gold");
  };

  const sellAccessory = (id) => {
    const accessory = ACCESSORIES[id];
    if (!accessory) return;
    if (!RARITY_SELLABLE[accessory.rarity]) {
      toast("Los objetos legendarios no se pueden vender", "info");
      return;
    }

    const value = RARITY_VALUE[accessory.rarity] || 10;
    setPlayer(prev => recomputePlayer({
      ...prev,
      accessory: prev.accessory === id ? null : prev.accessory,
      accessory2: prev.accessory2 === id ? null : prev.accessory2,
      accessoryInventory: (prev.accessoryInventory || []).filter(itemId => itemId !== id),
      gold: (prev.gold || 0) + value,
    }));
    toast(`Vendido: +${value} oro`, "gold");
  };

  const discardAccessory = (id) => {
    setPlayer(prev => recomputePlayer({
      ...prev,
      accessory: prev.accessory === id ? null : prev.accessory,
      accessory2: prev.accessory2 === id ? null : prev.accessory2,
      accessoryInventory: (prev.accessoryInventory || []).filter(itemId => itemId !== id),
    }));
    toast("Objeto descartado", "info");
  };

  return {
    equipAccessory,
    equipHelmet,
    sellHelmet,
    sellAccessory,
    discardAccessory,
  };
}
