
export default function AtlasSectionHeader({ children, icon: Icon, className = "" }) {
  return <h3 className={`atlas-ui-section-title ${className}`.trim()}>{Icon && <Icon className="w-4 h-4" aria-hidden="true" />}<span>{children}</span></h3>;
}
