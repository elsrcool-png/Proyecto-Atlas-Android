import { useEffect } from "react";
import { atlasVibrate, configureAtlasHaptics, stopAtlasVibration } from "@/lib/atlasHaptics";

export default function useAtlasHaptics({ settings }) {

  useEffect(() => {
    configureAtlasHaptics(settings || {});
  }, [settings?.hapticsEnabled, settings?.hapticIntensity]);

  // Una vibración mínima para los botones del juego, sin tocar inputs ni sliders.
  useEffect(() => {
    const onPointerDown = (event) => {
      const target = event.target?.closest?.("button, [data-atlas-haptic]");
      if (!target || target.disabled || target.closest("[data-atlas-no-haptic]")) return;
      atlasVibrate(target.dataset?.atlasHaptic || "ui");
    };
    document.addEventListener("pointerdown", onPointerDown, { passive: true, capture: true });
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  useEffect(() => () => stopAtlasVibration(), []);
}
