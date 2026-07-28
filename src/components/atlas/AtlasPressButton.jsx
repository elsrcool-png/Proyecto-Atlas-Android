import React, { useRef } from "react";

// Botón común de Atlas.
// - Los menús usan click nativo.
// - La acción principal puede activarse al tocar; otros controles pueden hacerlo
//   al soltar. Ambos modos conservan multitáctil y bloquean el click sintético.
export default function AtlasPressButton({
  onPress,
  onClick,
  disabled,
  children,
  className = "",
  style,
  haptic = "ui",
  pressOnPointerDown = false,
  pressOnPointerUp = false,
  ...props
}) {
  const activePointer = useRef(null);
  const lastPointerPressAt = useRef(0);
  const press = onPress || onClick;

  const handlePointerDown = (event) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    activePointer.current = event.pointerId;

    if (!pressOnPointerDown) return;

    // No usamos pointer capture. La acción A se ejecuta aquí para no depender
    // del pointerup, que algunas WebView Android cancelan en toques breves.
    lastPointerPressAt.current = Date.now();
    press?.(event);
  };

  const handlePointerUp = (event) => {
    const samePointer = activePointer.current === event.pointerId;
    activePointer.current = null;
    if (disabled || !pressOnPointerUp || !samePointer) return;

    lastPointerPressAt.current = Date.now();
    press?.(event);
  };

  const handlePointerCancel = (event) => {
    if (activePointer.current === event.pointerId) activePointer.current = null;
  };

  const handleClick = (event) => {
    if (disabled) return;

    // PointerDown/PointerUp ya ejecutaron el toque. Solo se ignora el click
    // sintético posterior; teclado y lectores de pantalla siguen usando click.
    if ((pressOnPointerDown || pressOnPointerUp) && Date.now() - lastPointerPressAt.current < 650) {
      event.preventDefault();
      return;
    }

    press?.(event);
  };

  const directPointerMode = pressOnPointerDown || pressOnPointerUp;

  return (
    <button
      {...props}
      type={props.type || "button"}
      disabled={disabled}
      data-atlas-control="true"
      data-atlas-haptic={haptic}
      data-atlas-pointer-mode={pressOnPointerDown ? "down" : pressOnPointerUp ? "up" : undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
      className={`atlas-touch-control select-none ${className}`}
      style={{
        touchAction: directPointerMode ? "none" : "manipulation",
        WebkitUserSelect: "none",
        userSelect: "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
