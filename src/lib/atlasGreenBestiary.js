// PROYECTO ATLAS — Bestiario canónico de la Región Verde v2.4.
// Fuente única para mundo libre, sectores, encuentros aleatorios y validaciones.

export const GREEN_MONSTER_IDS = Object.freeze([
  "pantera_sombria",
  "lobo_salvaje",
  "brujo_feral",
  "asesino_orco",
  "orco_bruto",
  "chaman_orco",
]);

export const GREEN_BOSS_IDS = Object.freeze(["guardian_verde"]);

// Distribución narrativa por sector. Evita que un mapa reciba criaturas al azar
// que no corresponden a su identidad. A2 usa Pantera Sombría como amenaza base,
// tal como aparece en la campaña activa del Campamento del Umbral.
export const GREEN_SECTOR_ENEMY_POOLS = Object.freeze({
  A1: Object.freeze(["pantera_sombria", "brujo_feral"]),
  B1: Object.freeze(["lobo_salvaje", "brujo_feral", "asesino_orco"]),
  C1: Object.freeze(["pantera_sombria", "asesino_orco", "brujo_feral"]),
  A2: Object.freeze(["pantera_sombria"]),
  B2: Object.freeze(["asesino_orco"]),
  C2: Object.freeze(["orco_bruto", "chaman_orco", "asesino_orco"]),
  A3: Object.freeze(["pantera_sombria", "lobo_salvaje", "brujo_feral"]),
  B3: Object.freeze(["orco_bruto", "chaman_orco", "brujo_feral"]),
  C3: Object.freeze([]),
});

export const GREEN_DUNGEON_ENEMY_POOLS = Object.freeze({
  verde_b1: Object.freeze(["lobo_salvaje", "brujo_feral", "asesino_orco"]),
  verde_c1: Object.freeze(["pantera_sombria", "asesino_orco"]),
  verde_b3: Object.freeze(["orco_bruto", "chaman_orco", "brujo_feral"]),
  verde_c3: Object.freeze(["brujo_feral", "pantera_sombria", "orco_bruto"]),
});

export function getGreenEnemyPool(sectorId) {
  return GREEN_SECTOR_ENEMY_POOLS[String(sectorId || "").toUpperCase()] || GREEN_MONSTER_IDS;
}

export const GREEN_BESTIARY_AUDIT = Object.freeze({
  regionId: "verde",
  version: "2.4.0",
  monsters: Object.freeze([
    Object.freeze({ id: "pantera_sombria", name: "Pantera Sombría", role: "depredador", silhouette: "cuadrúpeda felina" }),
    Object.freeze({ id: "lobo_salvaje", name: "Lobo Salvaje", role: "cazador de manada", silhouette: "cuadrúpeda canina" }),
    Object.freeze({ id: "brujo_feral", name: "Brujo Feral", role: "hostigador mágico", silhouette: "humanoide encorvado" }),
    Object.freeze({ id: "asesino_orco", name: "Asesino Orco", role: "emboscador", silhouette: "humanoide ligero con dos dagas" }),
    Object.freeze({ id: "orco_bruto", name: "Orco Bruto", role: "tanque físico", silhouette: "humanoide pesado con maza" }),
    Object.freeze({ id: "chaman_orco", name: "Chamán Orco", role: "apoyo mágico", silhouette: "humanoide con bastón y tótem" }),
  ]),
  bosses: Object.freeze([
    Object.freeze({ id: "guardian_verde", name: "Guardián Verde", role: "jefe regional", silhouette: "guardián de raíces y piedra" }),
  ]),
});
