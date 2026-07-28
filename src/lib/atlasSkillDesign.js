// PROYECTO ATLAS — Diseño canónico de habilidades (catálogo de diseño)
import { UNLOCK } from "@/lib/atlasSkills";

export const ENERGY = {
  Guerrero: { id: "adrenalina", name: "Adrenalina", short: "Adr" },
  Mago: { id: "magia", name: "Magia", short: "Mag" },
  "Pícaro": { id: "concentracion", name: "Concentración", short: "Con" },
};

export const OFFENSIVE_STAT = {
  Guerrero: { name: "ATK", icon: "swords", short: "ATK", offType: "atk" },
  Mago: { name: "Poder Arcano", icon: "sparkles", short: "Arca", offType: "arcane" },
  "Pícaro": { name: "Precisión", icon: "target", short: "Prec", offType: "precision" },
};

export const CLASS_DMG_TYPE = { Guerrero: "fisico", Mago: "magico", "Pícaro": "fisico" };

export const BASIC_ATTACKS = {
  humano_guerrero: { name: "Espadazo", cost: 0, desc: "Golpe básico con la espada." },
  humano_mago: { name: "Bastonazo", cost: 0, desc: "Hechizo básico sin coste: un destello arcano impacta al enemigo. Usa Defensa Mágica." },
  humano_picaro: { name: "Navajazo", cost: 0, desc: "Corte rápido con la navaja." },
  enano_guerrero: { name: "Golpe Martillo", cost: 0, desc: "Aplastamiento con el martillo." },
  enano_mago: { name: "Movimiento Sísmico", cost: 0, desc: "Hechizo básico sin coste: una sacudida telúrica mágica golpea al enemigo. Usa Defensa Mágica." },
  enano_picaro: { name: "Trampa Silenciosa", cost: 0, desc: "Coloca una trampa discreta." },
  elfo_guerrero: { name: "Ataque Rápido", cost: 0, desc: "Estocada veloz." },
  elfo_mago: { name: "Empujón de Viento", cost: 0, desc: "Hechizo básico sin coste: una ráfaga de viento mágico impacta al enemigo. Usa Defensa Mágica." },
  elfo_picaro: { name: "Lanzamiento de Cuchillo", cost: 0, desc: "Arroja un cuchillo al objetivo." },
};

export const CLASS_ABILITIES = {
  Guerrero: {
    name: "Corte Múltiple", energy: "adrenalina", cost: 3,
    desc: "Realiza de 2 a 4 cortes según el dado. Cada corte aumenta un 10% el daño del siguiente hasta finalizar la cadena.",
  },
  Mago: {
    name: "Bola de Fuego", energy: "magia", cost: 4,
    desc: "Invoca una bola de fuego que hace daño inicial y aplica quemadura. Tirada baja → leve (2 turnos); media → media (3 turnos); alta → fuerte (4 turnos).",
  },
  "Pícaro": {
    name: "Estocada Sombría", energy: "concentracion", cost: 4,
    desc: "Aparece detrás del enemigo realizando de 2 a 3 estocadas según el dado. Cada golpe ignora el 30% de la defensa. Si el dado es alto, el último golpe es crítico.",
  },
};

export const HYBRID_ABILITIES = {
  humano_guerrero: { name: "Venganza", energy: "adrenalina", cost: 8, desc: "Durante los siguientes 3 turnos acumula el daño recibido. Al activarse devuelve todo el daño acumulado ignorando el 50% de la defensa. Si el daño recibido era letal, sobrevive con 1 HP una única vez por combate." },
  humano_mago: { name: "Tormenta Eléctrica", energy: "magia", cost: 6, desc: "Invoca una tormenta de rayos durante 2 turnos. Cada turno lanza un rayo cuyo daño depende del dado. Con tiradas altas puede paralizar durante 1 turno." },
  humano_picaro: { name: "Clones de Sombra", energy: "concentracion", cost: 7, desc: "Crea de 2 a 3 clones según el dado. Cada clon puede atacar una vez o recibir un golpe por el jugador. Permanecen un máximo de 2 turnos." },
  enano_guerrero: { name: "Revienta Escudos", energy: "adrenalina", cost: 7, desc: "Salta y golpea con el martillo. Ignora el 75% de la defensa. Si el dado obtiene un resultado alto el ataque es crítico." },
  enano_mago: { name: "Gólem de Roca", energy: "magia", cost: 6, desc: "Invoca un gólem durante 2 turnos. El poder, vida y daño del golem dependen del dado." },
  enano_picaro: { name: "Bomba de Humo", energy: "concentracion", cost: 5, desc: "Desaparece entre humo y reaparece detrás del enemigo realizando un ataque que ignora el 50% de la defensa. Si el dado es alto el ataque también es crítico." },
  elfo_guerrero: { name: "Estocada Salvaje", energy: "adrenalina", cost: 6, desc: "Ejecuta entre 3 y 4 estocadas según el dado durante un único turno. Cada golpe aumenta ligeramente el daño del siguiente. No ignora defensa." },
  elfo_mago: { name: "Tornado Cortante", energy: "magia", cost: 6, desc: "Invoca un tornado durante 3 turnos. Cada turno golpea al enemigo. El daño depende del dado y puede reducir ligeramente su precisión." },
  elfo_picaro: { name: "Castigo Nocturno", energy: "concentracion", cost: 6, desc: "Envuelve al enemigo en oscuridad durante 1 turno y realiza de 2 a 4 ataques según el dado. Solo el último golpe puede ser crítico." },
};

export const DEFINITIVE_ABILITIES = {
  humano_guerrero: { name: "Estandarte Imperial", energy: "adrenalina", cost: 10, desc: "Clavas el estandarte real: onda expansiva que aplasta a los enemigos cercanos e ignora toda defensa." },
  enano_guerrero: { name: "Furia de la Montaña", energy: "adrenalina", cost: 10, desc: "Golpeas el suelo con toda tu furia: terremoto devastador que parte la tierra bajo el enemigo." },
  elfo_guerrero: { name: "Danza Final del Bosque", energy: "adrenalina", cost: 9, desc: "Una cadena imparable de cortes veloces que eclipsa todo lo visto. Cada golpe es más fuerte que el anterior." },
  humano_mago: { name: "Cataclismo Arcano", energy: "magia", cost: 9, desc: "Canalizas el linaje imperial en una explosión arcana que devora la energía del enemigo." },
  enano_mago: { name: "Forja Primigenia", energy: "magia", cost: 10, desc: "Fusionas tierra y fuego primigenios en una sola erupción que funde las defensas enemigas." },
  elfo_mago: { name: "Juicio de la Luna", energy: "magia", cost: 9, desc: "Invocas la luz lunar para que caiga como un juicio incandescente sobre el objetivo." },
  humano_picaro: { name: "Juramento Sombra", energy: "concentracion", cost: 9, desc: "Sellado en sombra, apareces y desapareces asestando un único golpe ejecutor impossible de esquivar." },
  enano_picaro: { name: "Aniquilación Mecánica", energy: "concentracion", cost: 10, desc: "Despliegues un arsenal de trampas y mecanismos que se cierran sobre el enemigo a la vez." },
  elfo_picaro: { name: "Mil Cortes del Crepúsculo", energy: "concentracion", cost: 9, desc: "El crepúsculo se detiene y descargas mil cortes en un instante contra un enemigo indefenso." },
};

export const RACE_PASSIVES = {
  humano_guerrero: { name: "Determinación", desc: "Cuando su vida baja del 30%, obtiene un 20% de reducción de daño y recupera 2 de adrenalina por turno hasta salir del estado crítico." },
  humano_mago: { name: "Sabiduría Arcana", desc: "Cada 3 turnos recupera 2 puntos de magia automáticamente. Los efectos negativos sobre su magia duran un turno menos." },
  humano_picaro: { name: "Instinto de Supervivencia", desc: "La primera vez que recibe un golpe crítico en combate, reduce el daño a la mitad y obtiene 2 de concentración." },
  enano_guerrero: { name: "Piel de Acero", desc: "Reduce permanentemente un 10% el daño físico recibido. Los efectos de reducción de defensa duran un turno menos." },
  enano_mago: { name: "Afinidad Mineral", desc: "Las invocaciones (como el Gólem) obtienen un 20% más de vida. Además, los hechizos de tierra tienen una pequeña probabilidad de aturdir según el dado." },
  enano_picaro: { name: "Ingeniero Nato", desc: "Las trampas y bombas infligen un 20% más de daño. Los cofres tienen una mayor probabilidad de contener objetos raros." },
  elfo_guerrero: { name: "Agilidad Natural", desc: "Obtiene un 15% de probabilidad de esquivar ataques físicos. Si esquiva, gana 1 de adrenalina." },
  elfo_mago: { name: "Conexión Elemental", desc: "Los efectos de viento y naturaleza duran un turno adicional. Recupera 1 de magia al derrotar un enemigo." },
  elfo_picaro: { name: "Maestro del Sigilo", desc: "El primer ataque realizado contra un enemigo que aún no ha actuado tiene un 25% más de daño y aumenta ligeramente la probabilidad de crítico." },
};

export const CLASS_PASSIVES = {
  Guerrero: { name: "Espíritu de Batalla", desc: "Cada vez que derrota un enemigo recupera 3 de adrenalina y aumenta un 5% su daño físico hasta finalizar el combate (máximo 3 acumulaciones)." },
  Mago: { name: "Canalización", desc: "Cuando lanza una habilidad mágica existe una probabilidad, determinada por el dado, de recuperar parte del coste de magia (entre 1 y 3 puntos)." },
  "Pícaro": { name: "Oportunista", desc: "Cuando un enemigo tiene menos del 40% de vida, los ataques del pícaro aumentan un 15% su daño y su probabilidad de crítico." },
};

export const RACE_IDENTITY = {
  Humano: "Supervivencia, adaptación y recuperación.",
  Enano: "Resistencia, defensa y utilidad.",
  Elfo: "Velocidad, precisión y control.",
};
export const CLASS_IDENTITY = {
  Guerrero: "Combate prolongado y daño físico sostenido.",
  Mago: "Gestión eficiente de recursos, daño elemental y estados alterados.",
  "Pícaro": "Ejecución, movilidad, críticos y precisión.",
};

export function getSkillDesign(character) {
  const id = character?.id;
  const cls = character?.class;
  return {
    energy: ENERGY[cls] || null,
    basic: BASIC_ATTACKS[id] || null,
    classAbility: CLASS_ABILITIES[cls] || null,
    hybrid: HYBRID_ABILITIES[id] || null,
    racePassive: RACE_PASSIVES[id] || null,
    classPassive: CLASS_PASSIVES[cls] || null,
  };
}

export function getSkillSet(character) {
  const d = getSkillDesign(character);
  if (!d.basic && !d.classAbility) return null;
  return {
    basic: d.basic ? { ...d.basic, unlock: UNLOCK.basic, kind: "Ataque básico" } : null,
    classAbility: d.classAbility ? { ...d.classAbility, unlock: UNLOCK.classAbility, kind: "Habilidad de clase" } : null,
    hybrid: d.hybrid ? { ...d.hybrid, unlock: UNLOCK.hybrid, kind: "Habilidad híbrida" } : null,
    definitive: DEFINITIVE_ABILITIES[character.id] ? { ...DEFINITIVE_ABILITIES[character.id], unlock: UNLOCK.definitive, kind: "Habilidad definitiva" } : null,
    racePassive: d.racePassive ? { ...d.racePassive, unlock: UNLOCK.racePassive, kind: "Pasiva de raza" } : null,
    classPassive: d.classPassive ? { ...d.classPassive, unlock: UNLOCK.classPassive, kind: "Pasiva de clase" } : null,
  };
}