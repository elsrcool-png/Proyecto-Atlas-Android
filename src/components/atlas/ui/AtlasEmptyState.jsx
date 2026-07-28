
export default function AtlasEmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={`atlas-ui-empty ${className}`.trim()}>
      {Icon && <Icon className="w-6 h-6" aria-hidden="true" />}
      {title && <p className="font-medium" style={{ color: "var(--atlas-ui-text)" }}>{title}</p>}
      {description && <p className="text-sm atlas-ui-muted max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
