import React from "react";

const PALETTES = {
  verde: {
    plateauTop: "#7f9c57", plateauSide: "#425b36", cliffTop: "#8b8764", cliffSide: "#4e4938",
    water: "#2f8795", path: "#aa8b5b", snow: "#d8e4e8", dune: "#cda55e",
  },
  fria: {
    plateauTop: "#d3e2e7", plateauSide: "#71848e", cliffTop: "#b7cad2", cliffSide: "#60737e",
    water: "#3f8aa4", path: "#aab5b8", snow: "#e9f2f4", dune: "#c8d4d8",
  },
  desierto: {
    plateauTop: "#d6aa5d", plateauSide: "#8d6331", cliffTop: "#c98c43", cliffSide: "#79451f",
    water: "#278a86", path: "#b8813d", snow: "#ead7aa", dune: "#d9b765",
  },
};

function shapeStyle(shape, palette) {
  const base = {
    position: "absolute",
    left: shape.x,
    top: shape.y,
    width: shape.w,
    height: shape.h,
    transform: `rotate(${shape.rotate || 0}deg)`,
    transformOrigin: "center",
    pointerEvents: "none",
  };

  switch (shape.type) {
    case "plateau":
      return {
        ...base,
        borderRadius: shape.radius || "44% 56% 48% 52% / 38% 42% 58% 62%",
        background: `radial-gradient(circle at 34% 24%, rgba(255,255,255,.18), transparent 32%), linear-gradient(155deg, ${shape.color || palette.plateauTop}, ${palette.plateauTop})`,
        border: "2px solid rgba(30,35,24,.38)",
        boxShadow: `0 ${shape.depth || 16}px 0 ${shape.side || palette.plateauSide}, 0 ${(shape.depth || 16) + 10}px 18px rgba(0,0,0,.32)`,
      };
    case "cliff":
      return {
        ...base,
        borderRadius: shape.radius || "35% 55% 40% 60% / 40% 30% 70% 60%",
        background: `linear-gradient(145deg, ${shape.color || palette.cliffTop}, ${palette.cliffTop})`,
        border: "2px solid rgba(45,38,24,.35)",
        boxShadow: `0 ${shape.depth || 20}px 0 ${shape.side || palette.cliffSide}, 0 ${(shape.depth || 20) + 8}px 20px rgba(0,0,0,.38)`,
      };
    case "water":
      return {
        ...base,
        borderRadius: shape.radius || "50%",
        background: `radial-gradient(circle at 35% 25%, rgba(255,255,255,.35), transparent 25%), linear-gradient(160deg, ${shape.color || palette.water}, #174f67)`,
        border: "5px solid rgba(214,232,198,.35)",
        boxShadow: "inset 0 0 26px rgba(255,255,255,.24), 0 8px 18px rgba(0,0,0,.28)",
      };
    case "river":
      return {
        ...base,
        borderRadius: shape.radius || 999,
        background: `linear-gradient(90deg, rgba(255,255,255,.18), transparent 24%, rgba(255,255,255,.12) 52%, transparent 76%), linear-gradient(180deg, ${shape.color || palette.water}, #1c5c73)`,
        border: "4px solid rgba(214,232,198,.28)",
        boxShadow: "inset 0 0 22px rgba(255,255,255,.18), 0 8px 16px rgba(0,0,0,.24)",
      };
    case "dune":
      return {
        ...base,
        borderRadius: shape.radius || "58% 42% 52% 48% / 62% 56% 44% 38%",
        background: `radial-gradient(circle at 35% 28%, rgba(255,244,202,.25), transparent 32%), linear-gradient(155deg, ${shape.color || palette.dune}, #ad7c3d)`,
        boxShadow: `0 ${shape.depth || 10}px 0 rgba(128,79,31,.58), 0 ${(shape.depth || 10) + 7}px 14px rgba(0,0,0,.2)`,
      };
    case "snowbank":
      return {
        ...base,
        borderRadius: shape.radius || "55% 45% 52% 48% / 50% 44% 56% 50%",
        background: `linear-gradient(155deg, ${shape.color || palette.snow}, #9fb8c1)`,
        boxShadow: `0 ${shape.depth || 10}px 0 rgba(94,119,129,.7), 0 ${(shape.depth || 10) + 7}px 14px rgba(0,0,0,.2)`,
      };
    case "groundPatch":
    default:
      return {
        ...base,
        borderRadius: shape.radius || "45%",
        background: shape.color || palette.path,
        opacity: shape.opacity ?? 0.5,
        filter: "blur(.2px)",
      };
  }
}

export default function TerrainHeightLayer({ world }) {
  const shapes = world?.terrainShapes || [];
  if (!shapes.length) return null;
  const palette = PALETTES[world.biome] || PALETTES.verde;
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {shapes.map((shape, index) => (
        <div key={`${shape.type}-${index}`} style={shapeStyle(shape, palette)} />
      ))}
    </div>
  );
}
