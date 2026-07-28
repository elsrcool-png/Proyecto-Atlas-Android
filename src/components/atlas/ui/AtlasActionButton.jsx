import AtlasPressButton from "../AtlasPressButton";

export default function AtlasActionButton({
  kind = "a",
  label,
  sublabel,
  icon: Icon,
  active = false,
  className = "",
  onPress,
  onClick,
  haptic = "uiStrong",
  ...props
}) {
  // A debe responder al primer contacto. En algunas WebView Android el
  // pointerup de un toque rápido puede cancelarse.
  const activateImmediately = kind === "a";

  return (
    <AtlasPressButton
      {...props}
      onPress={onPress || onClick}
      pressOnPointerDown={activateImmediately}
      pressOnPointerUp={!activateImmediately}
      haptic={haptic}
      data-active={active ? "true" : "false"}
      className={`atlas-ui-action-button atlas-ui-action-button--${kind} ${className}`.trim()}
    >
      {Icon ? <Icon className="w-5 h-5" aria-hidden="true" /> : <span className="text-lg">{label}</span>}
      {Icon && label && <span className="text-[10px]">{label}</span>}
      {sublabel && <span className="text-[8px] opacity-80">{sublabel}</span>}
    </AtlasPressButton>
  );
}
