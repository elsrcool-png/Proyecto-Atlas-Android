
export default function AtlasStatusBar({ value, max, kind = "hp", label, compact = false, className = "" }) {
  const safeMax = Math.max(1, Number(max) || 1);
  const safeValue = Math.max(0, Math.min(safeMax, Number(value) || 0));
  const pct = (safeValue / safeMax) * 100;
  return (
    <div className={className}>
      {label && (
        <div className={`flex items-center justify-between ${compact ? "text-[9px]" : "text-xs"} mb-1`}>
          <span className="atlas-ui-muted">{label}</span>
          <span>{safeValue}/{safeMax}</span>
        </div>
      )}
      <div className={`atlas-ui-progress atlas-ui-progress--${kind}`} role="progressbar" aria-label={label || kind} aria-valuemin="0" aria-valuemax={safeMax} aria-valuenow={safeValue}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
