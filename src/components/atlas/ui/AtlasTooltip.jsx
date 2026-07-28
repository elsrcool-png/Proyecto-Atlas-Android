
export default function AtlasTooltip({ children, content, className = "" }) {
  return (
    <span className={`relative group inline-flex ${className}`.trim()}>
      {children}
      <span role="tooltip" className="atlas-ui-tooltip pointer-events-none absolute z-[90] left-1/2 bottom-full mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        {content}
      </span>
    </span>
  );
}
