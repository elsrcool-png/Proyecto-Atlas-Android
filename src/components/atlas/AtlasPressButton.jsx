import React, { useRef } from "react";

// Botón Pointer Events: permite mantener el joystick con un dedo y accionar
// otro control con un segundo dedo, sin selección de texto ni espera de click.
export default function AtlasPressButton({ onPress, onClick, disabled, children, className = "", style, haptic = "ui", ...props }) {
  const lastPointerAt = useRef(0);
  const activePointer = useRef(null);
  const press = onPress || onClick;

  const onPointerDown = (event) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    activePointer.current = event.pointerId;
    lastPointerAt.current = Date.now();
    event.preventDefault();
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch {}
    press?.(event);
  };

  const handleClick = (event) => {
    if (disabled) return;
    // El click de compatibilidad llega después del pointerdown táctil. Se ignora
    // para que cada dedo dispare exactamente una acción. Click de teclado/mouse
    // sigue funcionando cuando no hubo pointer reciente.
    if (Date.now() - lastPointerAt.current < 650) {
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
      onPointerDown={onPointerDown}
      onPointerUp={release}
      onPointerCancel={release}
      onClick={handleClick}
      className={`atlas-touch-control select-none ${className}`}
      style={{ touchAction: "none", WebkitUserSelect: "none", userSelect: "none", ...style }}
    >
      {children}
    </button>
  );
}
