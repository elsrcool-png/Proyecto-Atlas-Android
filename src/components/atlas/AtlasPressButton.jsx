import React, { useRef } from "react";

// Botón común de Atlas.
// - Menús normales usan click nativo.
// - Los controles táctiles pueden activarse al tocar o al soltar.
// - Se bloquea el click de compatibilidad que Android genera después del toque.
//   Ese click podía caer sobre el modal recién abierto y cerrarlo de inmediato.
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

  const armGhostClickBlock = (pointerEvent) => {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    const startedAt = performance.now();
    const originX = Number(pointerEvent.clientX || 0);
    const originY = Number(pointerEvent.clientY || 0);
    const maxAgeMs = 520;
    const maxDistancePx = 48;

    const blockCompatibilityClick = (clickEvent) => {
      const age = performance.now() - startedAt;
      const dx = Number(clickEvent.clientX || 0) - originX;
      const dy = Number(clickEvent.clientY || 0) - originY;
      const sameTouchArea = (dx * dx + dy * dy) <= maxDistancePx * maxDistancePx;

      if (age > maxAgeMs || !sameTouchArea) return;

      clickEvent.preventDefault();
      clickEvent.stopPropagation();
      clickEvent.stopImmediatePropagation?.();
    };

    document.addEventListener("click", blockCompatibilityClick, true);
    window.setTimeout(() => {
      document.removeEventListener("click", blockCompatibilityClick, true);
    }, maxAgeMs + 80);
  };

  const activateFromPointer = (event) => {
    event.preventDefault();
    event.stopPropagation();
    armGhostClickBlock(event);
    lastPointerPressAt.current = Date.now();
    press?.(event);
  };

  const handlePointerDown = (event) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    activePointer.current = event.pointerId;
    if (pressOnPointerDown) activateFromPointer(event);
  };

  const handlePointerUp = (event) => {
    const samePointer = activePointer.current === event.pointerId;
    activePointer.current = null;
    if (disabled || !pressOnPointerUp || !samePointer) return;
    activateFromPointer(event);
  };

  const handlePointerCancel = (event) => {
    if (activePointer.current === event.pointerId) activePointer.current = null;
  };

  const handleClick = (event) => {
    if (disabled) return;

    // El toque directo ya ejecutó la acción. Este segundo click pertenece al
    // mismo gesto y no debe atravesar hacia el diálogo que acaba de montarse.
    if ((pressOnPointerDown || pressOnPointerUp) && Date.now() - lastPointerPressAt.current < 700) {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent?.stopImmediatePropagation?.();
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
