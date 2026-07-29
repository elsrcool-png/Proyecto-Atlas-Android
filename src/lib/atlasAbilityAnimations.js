// PROYECTO ATLAS — Biblioteca central de animaciones de habilidad.
// Una misma habilidad conserva su identidad visual en combate clásico,
// dungeon y jefe: ambos modos consultan esta definición. Solo puede
// variar la cámara/escala del efecto, no la identidad del ataque.
//
// Cada entrada define:
//   animationType   — identidad canónica (espADazo, estocada, hachazo...)
//   classicType     — tipo de VFX en combate clásico (CombatVfx)
//   dungeonType     — tipo de VFX en dungeon (lunge | projectile | magic)
//   weaponType      — arma que se muestra (sword|axe|dagger|bow|staff)
//   movementType    — lunge | step | stationary | retreat
//   impactType      — slash | pierce | blunt | elemental | heal
//   projectileType  — none | arrow | bolt | fireball
//   element         — fisico | arcano | sombra | fuego | hielo | rayo | veneno | sagrado
//   duration        — ms de la animación principal
//   soundId         — id de sonido sincronizado (placeholder)
//   cameraEffect    — { shake: 0..1, zoom: 0..1, hitstop: ms }

export const ELEMENT_COLOR = {
  fisico: "#fbbf24",
  arcano: "#c084fc",
  sombra: "#a78bfa",
  fuego: "#ff6a1a",
  hielo: "#7dd3fc",
  veneno: "#22c55e",
  rayo: "#fde047",
  sagrado: "#fde68a",
};

export const CLASS_WEAPON_TYPE = { Guerrero: "sword", Mago: "staff", "Pícaro": "dagger" };
export const CLASS_ELEMENT_DEFAULT = { Guerrero: "fisico", Mago: "arcano", "Pícaro": "fisico" };
const MAGIC_ELEMENTS = new Set(["arcano", "sombra", "fuego", "hielo", "rayo", "veneno", "sagrado"]);

function A(animationType, classicType, dungeonType, opts = {}) {
  return {
    animationType,
    classicType,
    dungeonType,
    weaponType: opts.weaponType || null,
    movementType: opts.movementType || "lunge",
    impactType: opts.impactType || "slash",
    projectileType: opts.projectileType || "none",
    element: opts.element || "fisico",
    duration: opts.duration || 360,
    soundId: opts.soundId || null,
    cameraEffect: opts.cameraEffect || { shake: 0.3, zoom: 0, hitstop: 0 },
  };
}

export const ABILITY_ANIMATIONS = {
  // ── Guerrero / espada ──
  "Espadazo": A("sword_slash", "slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 360 }),
  "Corte Preciso": A("sword_slash", "slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 340 }),
  "Estocada Veloz": A("thrust", "slash", "lunge", { weaponType: "sword", impactType: "pierce", movementType: "step", duration: 300 }),
  "Tajo pesado": A("sword_heavy", "slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 440, cameraEffect: { shake: 0.45, zoom: 0.05, hitstop: 30 } }),
  "Corte Múltiple": A("multi_slash", "multi_slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 480, cameraEffect: { shake: 0.4 } }),
  "Estocada Salvaje": A("multi_slash", "multi_slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 500, cameraEffect: { shake: 0.5, zoom: 0.08, hitstop: 40 } }),
  "Danza de Espadas": A("multi_slash", "multi_slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 480 }),
  "Furia del Bosque": A("multi_slash", "multi_slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 480, cameraEffect: { shake: 0.45 } }),
  "Dana Final": A("sword_ultimate", "multi_slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 560, cameraEffect: { shake: 0.7, zoom: 0.2, hitstop: 80 } }),
  "Corneta de Guerra": A("aura_red", "aura_red", "magic", { element: "fisico", impactType: "elemental", duration: 700, cameraEffect: { shake: 0.4 } }),

  // ── Hacha / martillo ──
  "Golpe Martillo": A("axe_chop", "impact", "lunge", { weaponType: "axe", impactType: "blunt", duration: 460, cameraEffect: { shake: 0.5, zoom: 0.05, hitstop: 50 } }),
  "Martillo Sísmico": A("shockwave", "impact", "lunge", { weaponType: "axe", impactType: "blunt", duration: 480, cameraEffect: { shake: 0.55, hitstop: 50 } }),
  "Movimiento Sísmico": A("shockwave", "shockwave", "magic", { weaponType: "staff", element: "fisico", impactType: "blunt", duration: 520, cameraEffect: { shake: 0.6, zoom: 0.1, hitstop: 60 } }),
  "Furia de la Montaña": A("axe_chop", "impact", "lunge", { weaponType: "axe", impactType: "blunt", duration: 500, cameraEffect: { shake: 0.6, zoom: 0.1, hitstop: 60 } }),

  // ── Daga / pícaro ──
  "Navajazo": A("dagger_flurry", "multi_slash", "lunge", { weaponType: "dagger", impactType: "pierce", duration: 320, movementType: "step" }),
  "Ataque Rápido": A("dagger_flurry", "multi_slash", "lunge", { weaponType: "dagger", impactType: "pierce", duration: 360, movementType: "step" }),
  "Estocada rápida": A("thrust", "slash", "lunge", { weaponType: "dagger", impactType: "pierce", movementType: "step", duration: 280 }),
  "Estocada Sombría": A("shadow_thrust", "shadow_clones", "lunge", { weaponType: "dagger", element: "sombra", impactType: "pierce", duration: 380, cameraEffect: { shake: 0.4 } }),
  "Castigo Nocturno": A("shadow_flurry", "shadow_clones", "lunge", { weaponType: "dagger", element: "sombra", impactType: "pierce", duration: 480, cameraEffect: { shake: 0.5, zoom: 0.08 } }),
  "Mil Cortes": A("dagger_ultimate", "multi_slash", "lunge", { weaponType: "dagger", element: "sombra", impactType: "pierce", duration: 560, cameraEffect: { shake: 0.7, zoom: 0.2, hitstop: 80 } }),
  "Emboscada Urbana": A("shadow_flurry", "shadow_clones", "lunge", { weaponType: "dagger", element: "sombra", impactType: "pierce", duration: 460 }),
  "Trampa de Acero": A("trap", "shield_break", "lunge", { weaponType: "dagger", impactType: "pierce", duration: 420 }),
  "Trampa Silenciosa": A("trap", "impact", "lunge", { weaponType: "dagger", impactType: "pierce", duration: 400 }),
  "Lanzamiento de Cuchillo": A("knife_throw", "projectile", "projectile", { weaponType: "dagger", projectileType: "arrow", impactType: "pierce", duration: 360 }),
  "Sabotaje Enano": A("shield_break", "shield_break", "lunge", { weaponType: "dagger", impactType: "pierce", duration: 440 }),
  "Sigilo Urbano": A("smoke", "smoke", "magic", { element: "sombra", impactType: "elemental", duration: 600 }),
  "Sombra Élfica": A("shadow_clones", "shadow_clones", "magic", { element: "sombra", impactType: "elemental", duration: 560 }),
  "Clones de Sombra": A("shadow_clones", "shadow_clones", "magic", { element: "sombra", impactType: "elemental", duration: 560 }),
  "Paso Sombrío": A("shadow_step", "shadow_clones", "magic", { element: "sombra", impactType: "elemental", movementType: "step", duration: 420 }),
  "Bomba de Humo": A("smoke", "smoke", "magic", { element: "fisico", impactType: "elemental", duration: 620 }),
  "Bomba Improvisada": A("smoke", "smoke", "magic", { element: "fisico", impactType: "elemental", duration: 560, cameraEffect: { shake: 0.4 } }),
  "Venganza": A("aura_red", "aura_red", "magic", { element: "fisico", impactType: "elemental", duration: 640, cameraEffect: { shake: 0.45 } }),

  // ── Arco / proyectil físico ──
  "Flecha Solar": A("bow_shot", "projectile", "projectile", { weaponType: "bow", projectileType: "arrow", element: "sagrado", impactType: "pierce", duration: 380, cameraEffect: { shake: 0.3 } }),
  "Disparo Silencioso": A("bow_shot", "projectile", "projectile", { weaponType: "bow", projectileType: "arrow", element: "sombra", impactType: "pierce", duration: 360 }),
  "Empujón de Viento": A("wind", "wind", "magic", { weaponType: "staff", element: "arcano", impactType: "elemental", movementType: "stationary", duration: 460, cameraEffect: { shake: 0.35 } }),

  // ── Bastón / mago ──
  "Bastonazo": A("magic_projectile", "projectile", "projectile", { weaponType: "staff", projectileType: "bolt", element: "arcano", impactType: "elemental", duration: 410, cameraEffect: { shake: 0.28 } }),
  "Golpe arcano": A("magic_projectile", "projectile", "projectile", { weaponType: "staff", projectileType: "bolt", element: "arcano", impactType: "elemental", duration: 420, cameraEffect: { shake: 0.3 } }),
  "Proyectil Arcano": A("magic_projectile", "projectile", "projectile", { weaponType: "staff", projectileType: "bolt", element: "arcano", impactType: "elemental", duration: 400 }),
  "Bola de Fuego": A("fireball", "fireball", "projectile", { weaponType: "staff", projectileType: "fireball", element: "fuego", impactType: "elemental", duration: 480, cameraEffect: { shake: 0.5, zoom: 0.12, hitstop: 50 } }),
  "Tormenta Eléctrica": A("lightning", "lightning", "magic", { weaponType: "staff", element: "rayo", impactType: "elemental", duration: 500, cameraEffect: { shake: 0.55, hitstop: 50 } }),
  "Cataclismo Arcano": A("magic_area", "shockwave", "magic", { weaponType: "staff", element: "arcano", impactType: "elemental", duration: 560, cameraEffect: { shake: 0.7, zoom: 0.2, hitstop: 70 } }),
  "Arcano Imperial": A("magic_area", "shockwave", "magic", { weaponType: "staff", element: "arcano", impactType: "elemental", duration: 540, cameraEffect: { shake: 0.6, zoom: 0.15, hitstop: 60 } }),
  "Magia del Bosque": A("magic_area", "shockwave", "magic", { weaponType: "staff", element: "arcano", impactType: "elemental", duration: 520, cameraEffect: { shake: 0.5 } }),
  "Runa Explosiva": A("magic_area", "shockwave", "magic", { weaponType: "staff", element: "arcano", impactType: "elemental", duration: 500, cameraEffect: { shake: 0.5, hitstop: 40 } }),
  "Runas de Guerra": A("shield_break", "shield_break", "magic", { weaponType: "staff", element: "arcano", impactType: "elemental", duration: 480 }),
  "Tornado Cortante": A("tornado", "tornado", "magic", { weaponType: "staff", element: "fisico", impactType: "slash", duration: 720, cameraEffect: { shake: 0.45 } }),
  "Gólem de Roca": A("golem", "golem", "magic", { element: "fisico", impactType: "blunt", duration: 700, cameraEffect: { shake: 0.4 } }),
  "Revienta Escudos": A("shield_break", "shield_break", "lunge", { weaponType: "axe", impactType: "blunt", duration: 520, cameraEffect: { shake: 0.65, zoom: 0.1, hitstop: 65 } }),

  // ── Catálogo activo v2.17+ / definitivas ──
  "Estandarte Imperial": A("banner_wave", "shockwave", "magic", { weaponType: "sword", element: "sagrado", impactType: "elemental", movementType: "stationary", duration: 820, cameraEffect: { shake: 0.75, zoom: 0.18, hitstop: 85 } }),
  "Danza Final del Bosque": A("sword_ultimate", "multi_slash", "lunge", { weaponType: "sword", element: "fisico", impactType: "slash", duration: 820, cameraEffect: { shake: 0.72, zoom: 0.18, hitstop: 80 } }),
  "Juramento Sombra": A("shadow_execution", "shadow_clones", "lunge", { weaponType: "dagger", element: "sombra", impactType: "pierce", movementType: "step", duration: 780, cameraEffect: { shake: 0.68, zoom: 0.2, hitstop: 90 } }),
  "Mil Cortes del Crepúsculo": A("dagger_ultimate", "multi_slash", "lunge", { weaponType: "dagger", element: "sombra", impactType: "pierce", duration: 860, cameraEffect: { shake: 0.75, zoom: 0.22, hitstop: 90 } }),
  "Forja Primigenia": A("primal_forge", "shockwave", "magic", { weaponType: "staff", element: "fuego", impactType: "elemental", duration: 860, cameraEffect: { shake: 0.78, zoom: 0.2, hitstop: 90 } }),
  "Juicio de la Luna": A("moon_judgement", "lightning", "magic", { weaponType: "staff", element: "sagrado", impactType: "elemental", duration: 820, cameraEffect: { shake: 0.62, zoom: 0.2, hitstop: 75 } }),
  "Aniquilación Mecánica": A("mechanical_barrage", "shield_break", "magic", { weaponType: "dagger", element: "fisico", impactType: "blunt", duration: 860, cameraEffect: { shake: 0.75, zoom: 0.16, hitstop: 80 } }),

  // ── Habilidades de armas activas ──
  "Golpe Firme": A("sword_slash", "slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 380 }),
  "Torbellino": A("whirlwind", "multi_slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 560, cameraEffect: { shake: 0.5, zoom: 0.08, hitstop: 45 } }),
  "Golpe Brutal": A("axe_chop", "impact", "lunge", { weaponType: "axe", impactType: "blunt", duration: 520, cameraEffect: { shake: 0.66, zoom: 0.1, hitstop: 65 } }),
  "Impacto Sísmico": A("shockwave", "shockwave", "lunge", { weaponType: "axe", impactType: "blunt", duration: 560, cameraEffect: { shake: 0.7, zoom: 0.1, hitstop: 70 } }),
  "Corte de Renovación": A("renewal_slash", "slash", "lunge", { weaponType: "sword", element: "sagrado", impactType: "slash", duration: 540, cameraEffect: { shake: 0.5, zoom: 0.08, hitstop: 55 } }),
  "Chispa Arcana": A("magic_projectile", "projectile", "projectile", { weaponType: "staff", projectileType: "bolt", element: "arcano", impactType: "elemental", duration: 400 }),
  "Rayo Arcano": A("magic_projectile", "projectile", "projectile", { weaponType: "staff", projectileType: "bolt", element: "arcano", impactType: "elemental", duration: 440, cameraEffect: { shake: 0.36, hitstop: 35 } }),
  "Explosión Elemental": A("elemental_burst", "shockwave", "magic", { weaponType: "staff", element: "arcano", impactType: "elemental", duration: 560, cameraEffect: { shake: 0.58, zoom: 0.1, hitstop: 55 } }),
  "Invocar Familiar": A("summon_familiar", "golem", "magic", { weaponType: "staff", element: "arcano", impactType: "elemental", movementType: "stationary", duration: 680, cameraEffect: { shake: 0.35 } }),
  "Pulso de Savia Ancestral": A("ancestral_pulse", "shockwave", "magic", { weaponType: "staff", element: "sagrado", impactType: "elemental", duration: 560, cameraEffect: { shake: 0.48, zoom: 0.08, hitstop: 50 } }),
  "Danza de Cuchillas": A("dagger_flurry", "multi_slash", "lunge", { weaponType: "dagger", impactType: "pierce", duration: 500, movementType: "step", cameraEffect: { shake: 0.45, hitstop: 40 } }),
  "Perforación Mortal": A("katar_pierce", "slash", "lunge", { weaponType: "dagger", impactType: "pierce", movementType: "step", duration: 440, cameraEffect: { shake: 0.55, zoom: 0.08, hitstop: 60 } }),
  "Disparo Preciso": A("bow_shot", "projectile", "projectile", { weaponType: "bow", projectileType: "arrow", impactType: "pierce", duration: 440, cameraEffect: { shake: 0.4, hitstop: 40 } }),
  "Danza del Brote": A("renewal_flurry", "multi_slash", "lunge", { weaponType: "dagger", element: "sagrado", impactType: "pierce", duration: 540, movementType: "step", cameraEffect: { shake: 0.48, hitstop: 50 } }),
  "Impulso Arcano": A("magic_projectile", "projectile", "projectile", { weaponType: "staff", projectileType: "bolt", element: "arcano", impactType: "elemental", duration: 410 }),
  "Puntería Certera": A("bow_shot", "projectile", "projectile", { weaponType: "bow", projectileType: "arrow", impactType: "pierce", duration: 420, cameraEffect: { shake: 0.36, hitstop: 35 } }),

  // ── Defensas / curas / invocaciones ──
  "Escudo Rúnico": A("shield", "shield", "magic", { element: "arcano", impactType: "heal", movementType: "stationary", duration: 600 }),
  "Forja de Maná": A("shield", "shield", "magic", { element: "arcano", impactType: "heal", movementType: "stationary", duration: 600 }),
  "Guardia Real": A("shield", "shield", "magic", { element: "fisico", impactType: "heal", movementType: "stationary", duration: 600 }),
  "Muro de Piedra": A("shield", "shield", "magic", { element: "fisico", impactType: "heal", movementType: "stationary", duration: 620 }),
  "Invocar Espíritu": A("shadow_clones", "shadow_clones", "magic", { element: "arcano", impactType: "elemental", duration: 600 }),
};

// Resuelve la animación de una habilidad. Si no tiene entrada en la
// biblioteca, asigna una según arma, clase y elemento (fallback correcto):
//   - elemento mágico → proyectil/área elemental correspondiente
//   - físico con arma → animación base del arma (espada, hacha, daga, arco, bastón)
//   - nunca un destello genérico sin movimiento del personaje.
export function resolveAbilityAnimation(skill, ctx = {}) {
  const name = skill?.name;
  if (name === "Estocada Veloz" && ctx.weaponType === "dagger") {
    return A("dagger_thrust", "slash", "lunge", { weaponType: "dagger", impactType: "pierce", movementType: "step", duration: 320 });
  }
  if (name && ABILITY_ANIMATIONS[name]) return ABILITY_ANIMATIONS[name];

  const cls = ctx.class || skill?.class;
  const weaponType = ctx.weaponType || (skill?.weaponType) || CLASS_WEAPON_TYPE[cls] || "sword";
  const element = skill?.element || ctx.element || CLASS_ELEMENT_DEFAULT[cls] || "fisico";

  if (MAGIC_ELEMENTS.has(element)) {
    if (element === "fuego") return A("fireball", "fireball", "projectile", { weaponType, projectileType: "fireball", element, impactType: "elemental", duration: 480, cameraEffect: { shake: 0.5, zoom: 0.1, hitstop: 40 } });
    if (element === "rayo") return A("lightning", "lightning", "magic", { weaponType, element, impactType: "elemental", duration: 500, cameraEffect: { shake: 0.55, hitstop: 50 } });
    if (element === "hielo") return A("ice", "ice", "magic", { weaponType, element, impactType: "elemental", duration: 480 });
    if (element === "veneno") return A("shadow", "shadow_clones", "magic", { weaponType, element: "sombra", impactType: "elemental", duration: 460 });
    if (element === "arcano") return A("magic_projectile", "projectile", "projectile", { weaponType, projectileType: "bolt", element, impactType: "elemental", duration: 420, cameraEffect: { shake: 0.3 } });
    if (element === "sombra") return A("shadow", "shadow_clones", "magic", { weaponType, element, impactType: "elemental", duration: 460 });
    if (element === "sagrado") return A("magic_projectile", "projectile", "projectile", { weaponType, projectileType: "bolt", element, impactType: "elemental", duration: 420 });
  }

  // Físico: animación base del arma
  if (weaponType === "bow") return A("bow_shot", "projectile", "projectile", { weaponType, projectileType: "arrow", impactType: "pierce", duration: 380 });
  if (weaponType === "dagger") return A("dagger_flurry", "multi_slash", "lunge", { weaponType, impactType: "pierce", duration: 320, movementType: "step" });
  if (weaponType === "axe") return A("axe_chop", "impact", "lunge", { weaponType, impactType: "blunt", duration: 440, cameraEffect: { shake: 0.5 } });
  if (weaponType === "staff") return A("staff_strike", "impact", "lunge", { weaponType, impactType: "blunt", duration: 380 });
  return A("sword_slash", "slash", "lunge", { weaponType: "sword", impactType: "slash", duration: 360 });
}

export function getElementColor(element) {
  return ELEMENT_COLOR[element] || ELEMENT_COLOR.fisico;
}

// Tipo de arma inferido del personaje (para fallback y mostrar arma).
export function weaponTypeFromPlayer(p) {
  if (!p) return "sword";
  const weaponId = String(p.classWeapon || p.weapon || "").toLowerCase();
  if (/ballesta|bow|arco/.test(weaponId)) return "bow";
  if (/hacha|martillo|axe|hammer/.test(weaponId)) return "axe";
  if (/daga|katar|hoja|knife/.test(weaponId)) return "dagger";
  if (/baston|bastón|vara|grimorio|staff/.test(weaponId)) return "staff";
  if (/espada|sword/.test(weaponId)) return "sword";
  if (p.class === "Mago") return "staff";
  if (p.class === "Pícaro") return "dagger";
  return "sword";
}