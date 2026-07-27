import React, { useRef, useEffect } from "react";
import { drawPlayerSprite } from "@/lib/atlasPixel";

export default function ChibiSprite({ race = "Humano", cls, dir = "down", frame = 0, size = 56, style }) {
  const ref = useRef(null);
  useEffect(() => {
    drawPlayerSprite(ref.current, cls, dir, frame, 3, race);
  }, [race, cls, dir, frame, size]);
  const h = Math.round(size * (48 / 36));
  return React.createElement("canvas", { ref, style: { width: size, height: h, imageRendering: "auto", ...style } });
}