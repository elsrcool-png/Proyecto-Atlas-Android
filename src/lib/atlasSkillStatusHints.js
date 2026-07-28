import { ATLAS_STATUSES } from "@/lib/atlasStatusAtlas";

const EXTRA = Object.freeze({
  paralisis: { id: "paralisis", name: "Parálisis", icon: "⚡", desc: "Pierde una acción.", conditional: true },
  purificar: { id: "purificar", name: "Purificación", icon: "✨", desc: "Limpia corrupción o estados." },
  invocacion: { id: "invocacion", name: "Invocación", icon: "🗿", desc: "Crea una entidad temporal." },
  clones: { id: "clones", name: "Clones", icon: "👥", desc: "Crea señuelos temporales." },
});

const NAME_HINTS = Object.freeze([
  [/Bola de Fuego|Forja Primigenia|Cataclismo Arcano/, ["quemadura"]],
  [/Corte Múltiple|Estocada Sombría|Estocada Salvaje|Danza Final|Mil Cortes/, ["sangrado"]],
  [/Tormenta Eléctrica/, ["paralisis"]],
  [/Furia de la Montaña|Aniquilación Mecánica|Impacto Sísmico/, ["aturdido"]],
  [/Revienta Escudos|Estandarte Imperial|Golpe Firme|Torbellino|Golpe Brutal|Perforación Mortal/, ["vulnerable"]],
  [/Bomba de Humo|Tornado Cortante|Juicio de la Luna|Rayo Arcano|Chispa Arcana|Invocar Familiar/, ["debilitado"]],
  [/Castigo Nocturno|Juramento Sombra/, ["lento"]],
  [/Clones de Sombra/, ["clones"]],
  [/Gólem de Roca/, ["invocacion"]],
  [/Corte de Renovación|Pulso de Savia Ancestral|Danza del Brote/, ["purificar"]],
]);

export function getSkillStatusIds(skill) {
  if (!skill) return [];
  const effect = skill.effect || {};
  const ids = [];
  if (effect.statusId) ids.push(effect.statusId);
  if (Array.isArray(effect.statusPool)) ids.push(...effect.statusPool);
  if (effect.purify) ids.push("purificar");
  if (effect.summon) ids.push("invocacion");
  for (const [matcher, mapped] of NAME_HINTS) {
    if (matcher.test(skill.name || "")) ids.push(...mapped);
  }
  return [...new Set(ids)].filter(Boolean);
}

export function getSkillStatusHints(skill) {
  return getSkillStatusIds(skill).map(id => {
    const def = ATLAS_STATUSES[id] || EXTRA[id] || { id, name: id, icon: "◆", desc: "Estado alterado." };
    const conditional = skill?.effect?.crit === "highroll" || /puede|tirada alta|según la calidad/i.test(skill?.desc || "") || id === "paralisis";
    const random = Array.isArray(skill?.effect?.statusPool);
    return { ...def, conditional, random };
  });
}

export function primaryStatusForSkillName(name = "") {
  for (const [matcher, ids] of NAME_HINTS) {
    if (matcher.test(name)) {
      const gameplayId = ids.find(id => ATLAS_STATUSES[id]);
      if (gameplayId) return gameplayId;
      if (ids.includes("paralisis")) return "paralisis";
    }
  }
  return null;
}
