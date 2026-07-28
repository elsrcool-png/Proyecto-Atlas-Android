// PROYECTO ATLAS — Validación automática de misiones (integrada con campaña).
const BLOCK_OF = { campamento: 0, pueblo: 1, ciudad: 2 };

// Roles de NPC que pueden entregar o avanzar misiones de "talk"
const TALK_ROLES = [
  "main", "quest", "paid", "flavor", "merchant", "inn",
  "smith", "explorer", "herbalist", "cartographer", "hunter",
  "historian", "artisan", "researcher", "captain", "priest",
  "flavor1", "flavor2", "forger", "cartographer",
];

export function validateMissionDef(def, blocks) {
  if (!def || !blocks) return false;
  const blk = blocks[BLOCK_OF[def.sector]];
  if (!blk) return false;
  switch (def.tracker) {
    case "talk": {
      const npcs = blk.npcs || [];
      // Si el rol del giver existe en el bloque, o si hay cualquier NPC de diálogo
      const giver = npcs.some(n => n.role === def.role);
      const anyTalk = npcs.some(n => TALK_ROLES.includes(n.role));
      return giver && anyTalk;
    }
    case "kill": {
      const total = blocks.reduce((s, b) => s + ((b?.enemies || []).length), 0);
      return total >= def.target;
    }
    case "chest": {
      const total = blocks.reduce((s, b) => s + ((b?.chests || []).length), 0);
      return total >= def.target;
    }
    case "reach": {
      return blocks.some(b => !!b?.objective);
    }
    default:
      return false;
  }
}

export function filterValidMissions(rawDefs, blocks) {
  const out = {};
  for (const sec of Object.keys(rawDefs || {})) {
    out[sec] = (rawDefs[sec] || []).filter(d => validateMissionDef(d, blocks));
  }
  return out;
}