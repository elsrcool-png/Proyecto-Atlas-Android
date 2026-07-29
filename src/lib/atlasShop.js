// Catálogo de pociones y precios para la tienda de zonas seguras.
export const HP_POTIONS = [
  { id: "hp_s", name: "Poción pequeña de vida", heal: 6, price: 10, size: "Pequeña" },
  { id: "hp_m", name: "Poción mediana de vida", heal: 14, price: 25, size: "Mediana" },
  { id: "hp_l", name: "Poción grande de vida", heal: 30, price: 60, size: "Grande" },
];

export const ENERGY_POTIONS = {
  Guerrero: [
    { id: "en_g_s", name: "Poción pequeña de adrenalina", restore: 2, price: 10, size: "Pequeña" },
    { id: "en_g_m", name: "Poción mediana de adrenalina", restore: 5, price: 25, size: "Mediana" },
    { id: "en_g_l", name: "Poción grande de adrenalina", restore: 10, price: 60, size: "Grande" },
  ],
  Mago: [
    { id: "en_m_s", name: "Poción pequeña de magia", restore: 3, price: 12, size: "Pequeña" },
    { id: "en_m_m", name: "Poción mediana de magia", restore: 6, price: 28, size: "Mediana" },
    { id: "en_m_l", name: "Poción grande de magia", restore: 12, price: 65, size: "Grande" },
  ],
  "Pícaro": [
    { id: "en_p_s", name: "Poción pequeña de concentración", restore: 2, price: 10, size: "Pequeña" },
    { id: "en_p_m", name: "Poción mediana de concentración", restore: 4, price: 22, size: "Mediana" },
    { id: "en_p_l", name: "Poción grande de concentración", restore: 8, price: 55, size: "Grande" },
  ],
};

export const ALL_POTIONS = [...HP_POTIONS, ...Object.values(ENERGY_POTIONS).flat()];

export function getPotion(id) {
  return ALL_POTIONS.find(p => p.id === id);
}

export function energyPotionsFor(cls) {
  return ENERGY_POTIONS[cls] || [];
}