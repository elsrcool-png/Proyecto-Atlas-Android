import AtlasPressButton from "../AtlasPressButton";

export default function AtlasIconButton({ icon: Icon, label, className = "", onPress, onClick, haptic = "ui", ...props }) {
  if (!Icon) throw new Error("AtlasIconButton requiere la propiedad icon.");
  return (
    <AtlasPressButton
      {...props}
      onPress={onPress || onClick}
      haptic={haptic}
      aria-label={label}
      title={props.title || label}
      className={`atlas-ui-icon-button ${className}`.trim()}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </AtlasPressButton>
  );
}
