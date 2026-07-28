import AtlasPressButton from "../AtlasPressButton";

export default function AtlasButton({
  children,
  variant = "secondary",
  icon: Icon,
  iconAfter: IconAfter,
  full = false,
  className = "",
  onPress,
  onClick,
  haptic = "ui",
  ...props
}) {
  const variantClass = {
    primary: "atlas-ui-button--primary",
    success: "atlas-ui-button--success",
    danger: "atlas-ui-button--danger",
    warning: "atlas-ui-button--warning",
    ghost: "atlas-ui-button--ghost",
    secondary: "",
  }[variant] || "";
  return (
    <AtlasPressButton
      {...props}
      onPress={onPress || onClick}
      haptic={haptic}
      className={`atlas-ui-button ${variantClass} ${full ? "w-full" : ""} ${className}`.trim()}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
      <span className="min-w-0 truncate">{children}</span>
      {IconAfter && <IconAfter className="w-4 h-4 shrink-0" aria-hidden="true" />}
    </AtlasPressButton>
  );
}
