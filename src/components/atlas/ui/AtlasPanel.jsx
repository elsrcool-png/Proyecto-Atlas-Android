
export default function AtlasPanel({
  children,
  title,
  subtitle,
  actions,
  variant = "default",
  className = "",
  bodyClassName = "",
  as: Component = "section",
  ...props
}) {
  const variantClass = variant === "soft" ? "atlas-ui-panel--soft" : variant === "glass" ? "atlas-ui-panel--glass" : "";
  return (
    <Component {...props} className={`atlas-ui-panel ${variantClass} ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="atlas-ui-panel-header">
          <div className="min-w-0">
            {title && <h2 className="atlas-ui-title truncate">{title}</h2>}
            {subtitle && <p className="atlas-ui-muted mt-1 text-sm leading-snug">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </Component>
  );
}
