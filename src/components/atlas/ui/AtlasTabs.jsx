
export default function AtlasTabs({ items, value, onChange, className = "", ariaLabel = "Secciones" }) {
  return (
    <div className={`atlas-ui-tabs ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {items.map(({ id, label, Icon, disabled, badge }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          disabled={disabled}
          onClick={() => onChange(id)}
          className="atlas-ui-tab"
        >
          {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
          <span>{label}</span>
          {badge != null && <span className="atlas-ui-badge">{badge}</span>}
        </button>
      ))}
    </div>
  );
}
