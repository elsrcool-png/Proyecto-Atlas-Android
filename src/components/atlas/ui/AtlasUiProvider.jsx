
export default function AtlasUiProvider({
  children,
  regionId,
  mode,
  density = "clean",
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      {...props}
      className={`atlas-ui-v3 ${className}`.trim()}
      data-region={regionId || undefined}
      data-mode={mode || undefined}
      data-density={density}
    >
      {children}
    </Component>
  );
}
