import { Lock } from "lucide-react";

export default function AtlasInventorySlot({
  children,
  selected = false,
  locked = false,
  count,
  rarity,
  label,
  className = "",
  onClick,
  ...props
}) {
  const Component = onClick && !locked ? "button" : "div";
  return (
    <Component
      {...props}
      type={Component === "button" ? "button" : undefined}
      onClick={locked ? undefined : onClick}
      data-selected={selected ? "true" : "false"}
      data-locked={locked ? "true" : "false"}
      className={`atlas-ui-slot ${className}`.trim()}
      aria-label={label}
      title={label}
      style={{ "--atlas-slot-rarity": rarity || "var(--atlas-ui-border-soft)", ...(props.style || {}) }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-1.5">{locked ? <Lock className="w-5 h-5 atlas-ui-dim" /> : children}</div>
      {count != null && !locked && <span className="absolute right-1 bottom-0.5 text-[10px] font-semibold text-white drop-shadow">{count}</span>}
    </Component>
  );
}
