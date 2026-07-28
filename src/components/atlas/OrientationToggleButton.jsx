import React from "react";
import { RotateCw } from "lucide-react";
import AtlasPressButton from "./AtlasPressButton";

export default function OrientationToggleButton({ settings, onChange, onRequestOrientation, className = "", label = false }) {
  const rotate = async () => {
    const current = settings?.orientation || "auto";
    const next = current === "horizontal" ? "vertical" : "horizontal";
    onChange?.({ ...settings, orientation: next });
    await onRequestOrientation?.(next);
  };
  return (
    <AtlasPressButton onPress={rotate} haptic="uiStrong" className={className} title="Girar pantalla" aria-label="Girar pantalla">
      <RotateCw className="w-4 h-4" />{label && <span>Girar pantalla</span>}
    </AtlasPressButton>
  );
}
