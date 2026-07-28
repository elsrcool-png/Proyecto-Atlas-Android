import { isHeroModularSurfaceEnabled } from "@/lib/atlasHeroIntegrationFlags";
import { hasStaticModularArt } from "@/lib/atlasHeroAssembler";
export function drawPlayerFrameWithModularFallback({ surface, legacyDraw }) {
  // El puente queda conectado desde mundo y dungeon. Hasta que el gate de arte pase,
  // el sprite maestro continúa siendo la única salida visible y estable.
  if (!isHeroModularSurfaceEnabled(surface) || !hasStaticModularArt()) { legacyDraw?.(); return { mode: "legacy" }; }
  // La activación final usará ModularHeroSprite para no bloquear el bucle de movimiento con cargas asíncronas.
  legacyDraw?.(); return { mode: "legacy_pending_async_surface_activation" };
}
