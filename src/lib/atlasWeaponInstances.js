// PROYECTO ATLAS — Instancias únicas de armas de botín.
import { WEAPONS } from "@/lib/atlasLoot";

let _seq = 0;
export function genWeaponUid() {
  _seq = (_seq + 1) % 100000;
  return `w${Date.now().toString(36)}${_seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function makeWeaponInstance(defId, meta = {}) {
  return { uid: genWeaponUid(), defId, ...meta };
}

export function normalizeWeaponInventory(inv) {
  if (!Array.isArray(inv)) return [];
  const out = [];
  for (const entry of inv) {
    if (!entry) continue;
    if (typeof entry === "string") {
      if (WEAPONS[entry]) out.push(makeWeaponInstance(entry));
    } else if (entry.defId && WEAPONS[entry.defId]) {
      out.push(entry.uid ? { ...entry } : makeWeaponInstance(entry.defId, entry));
    }
  }
  return out;
}

export function resolveWeaponInstance(player, ref) {
  if (!ref || typeof ref !== "string") return null;
  return (player?.weaponInventory || []).find(entry => {
    if (typeof entry === "string") return entry === ref;
    return entry?.uid === ref;
  }) || null;
}

export function resolveWeaponDefId(player, ref) {
  if (!ref) return null;
  if (typeof ref === "string") {
    if (WEAPONS[ref]) return ref;
    const inst = resolveWeaponInstance(player, ref);
    return inst ? (typeof inst === "string" ? inst : inst.defId) : null;
  }
  return null;
}

export function equippedWeaponDefId(player) {
  return resolveWeaponDefId(player, player?.weapon);
}

export function weaponDisplayData(player, ref) {
  const defId = resolveWeaponDefId(player, ref);
  const def = defId ? WEAPONS[defId] : null;
  const instance = resolveWeaponInstance(player, ref);
  if (!def) return null;
  if (!instance || typeof instance === "string") return { ...def, defId, instance: null };
  return {
    ...def,
    defId,
    instance,
    name: instance.name || def.name,
    rarity: instance.rarity || def.rarity,
    stats: {
      ...(def.stats || {}),
      attack: (def.stats?.attack || 0) + (instance.bonus?.attack || 0),
      maxMp: (def.stats?.maxMp || 0) + (instance.bonus?.maxMp || 0),
      crit: (def.stats?.crit || 0) + (instance.bonus?.crit || 0),
      speed: (def.stats?.speed || 0) + (instance.bonus?.speed || 0),
    },
    sellable: instance.sellable ?? def.sellable,
    quality: instance.quality,
  };
}
