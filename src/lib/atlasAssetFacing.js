export const HERO_HORIZONTAL_CANONICAL = Object.freeze({
  humano_guerrero: { sourceDirection: "right", sourceFacing: "right" },
  humano_mago: { sourceDirection: "right", sourceFacing: "right" },
  humano_picaro: { sourceDirection: "right", sourceFacing: "right" },
  elfo_guerrero: { sourceDirection: "right", sourceFacing: "right" },
  elfo_mago: { sourceDirection: "right", sourceFacing: "right" },
  elfo_picaro: { sourceDirection: "right", sourceFacing: "right" },
  // Los tres enanos quedaron exportados con left/right intercambiados.
  enano_guerrero: { sourceDirection: "left", sourceFacing: "right" },
  enano_mago: { sourceDirection: "left", sourceFacing: "right" },
  enano_picaro: { sourceDirection: "left", sourceFacing: "right" },
});

export const ENEMY_HORIZONTAL_CANONICAL = Object.freeze({
  asesino_esqueletico: { sourceDirection: "left", sourceFacing: "right" },
  // Según la hoja de auditoría visual, la toma left mira realmente a la derecha.
  asesino_orco: { sourceDirection: "left", sourceFacing: "right" },
  aurel_ultimo_portador: { sourceDirection: "left", sourceFacing: "left" },
  brujo_feral: { sourceDirection: "left", sourceFacing: "left" },
  chaman_orco: { sourceDirection: "left", sourceFacing: "left" },
  guardian_verde: { sourceDirection: "right", sourceFacing: "left" },
  guerrero_esqueletico: { sourceDirection: "left", sourceFacing: "left" },
  lobo_salvaje: { sourceDirection: "left", sourceFacing: "left" },
  necromante: { sourceDirection: "left", sourceFacing: "right" },
  orco_bruto: { sourceDirection: "right", sourceFacing: "left" },
  // La pantera fue detectada por el usuario: left mira a la derecha.
  pantera_sombria: { sourceDirection: "left", sourceFacing: "right" },
});

function normalizeDirection(direction) {
  return ["up", "down", "left", "right"].includes(direction) ? direction : "down";
}

function normalizeHorizontal(direction, fallback = "right") {
  return direction === "left" || direction === "right" ? direction : fallback;
}

export function resolveHorizontalFacingDescriptor(root, assetId, direction = "down", canonicalMap = {}, defaults = {}) {
  if (!assetId || !root) return null;
  const desired = normalizeDirection(direction);
  if (desired === "up" || desired === "down") {
    return {
      path: `${root}/${assetId}/${desired}.webp`,
      sourceDirection: desired,
      sourceFacing: desired,
      desiredFacing: desired,
      mirrorX: false,
    };
  }

  const canonical = canonicalMap[assetId] || {
    sourceDirection: defaults.sourceDirection || "right",
    sourceFacing: defaults.sourceFacing || "right",
  };
  const desiredFacing = normalizeHorizontal(desired, canonical.sourceFacing || "right");
  const sourceFacing = normalizeHorizontal(canonical.sourceFacing || canonical.sourceDirection || "right");
  const sourceDirection = normalizeHorizontal(canonical.sourceDirection || sourceFacing, sourceFacing);

  return {
    path: `${root}/${assetId}/${sourceDirection}.webp`,
    sourceDirection,
    sourceFacing,
    desiredFacing,
    mirrorX: sourceFacing !== desiredFacing,
  };
}
