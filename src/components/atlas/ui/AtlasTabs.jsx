import AtlasPressButton from "../AtlasPressButton";

export default function AtlasTabs({ items, value, onChange, className = "", ariaLabel = "Secciones", panelIdPrefix = null }) {
  return (
    <div className={`atlas-ui-tabs ${className}`.trim()} role="tablist" aria-label={ariaLabel}>
      {items.map(({ id, label, Icon, disabled, badge }) => (
        <AtlasPressButton
          key={id}
          role="tab"
          aria-selected={value === id}
          aria-controls={panelIdPrefix ? `${panelIdPrefix}-${id}` : undefined}
          disabled={disabled}
          onPress={() => onChange(id)}
          data-selected={value === id ? "true" : "false"}
          className="atlas-ui-tab"
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
          <span>{label}</span>
          {badge != null && <span className="atlas-ui-badge">{badge}</span>}
        </AtlasPressButton>
      ))}
    </div>
  );
}
