import React, { useRef } from "react";

// Botón común de Atlas.
// - Por defecto usa el click nativo, que es la ruta más compatible para menú,
//   modales, teclado, ratón, Android WebView y lectores de pantalla.
// - Los controles que realmente necesitan respuesta inmediata/multitáctil
//   pueden activar pressOnPointerDown.
export default function AtlasPressButton({
  onPress,
  onClick,
  disabled,
  children,
  className = "",
  style,
  haptic = "ui",
  pressOnPointerDown = false,
  ...props
}) {
  const lastImmediatePointerAt = useRef(0);
  const activePointer = useRef(null);
  const press = onPress || onClick;

  const handlePointerDown = (event) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    activePointer.current = event.pointerId;

    // No cancelar el gesto de botones normales. En algunas WebView Android,
    // preventDefault + pointer capture sobre el menú elimina el click final.
    if (!pressOnPointerDown) return;

    lastImmediatePointerAt.current = Date.now();
    event.preventDefault();
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch {}
    press?.(event);
  };

  const handleClick = (event) => {
    if (disabled) return;

    // Un control inmediato ya ejecutó la acción en pointerdown. Se descarta
    // únicamente su click de compatibilidad para evitar dobles acciones.
    if (pressOnPointerDown && Date.now() - lastImmediatePointerAt.current < 650) {
      event.preventDefault();
      return;
    }

    press?.(event);
  };

  const release = (event) => {
    if (activePointer.current === event.pointerId) activePointer.current = null;
  };

  return (
    <button
      {...props}
      type={props.type || "button"}
      disabled={disabled}
      data-atlas-control="true"
      data-atlas-haptic={haptic}
      data-atlas-immediate={pressOnPointerDown ? "true" : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={release}
      onPointerCancel={release}
      onClick={handleClick}
      className={`atlas-touch-control select-none ${className}`}
      style={{
        touchAction: pressOnPointerDown ? "none" : "manipulation",
        WebkitUserSelect: "none",
        userSelect: "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
