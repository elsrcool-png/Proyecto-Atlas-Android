
export default function AtlasHudCard({ children, title, icon: Icon, className = "", ...props }) {
  return (
    <section {...props} className={`atlas-ui-hud-card px-3 py-2 ${className}`.trim()}>
      {title && <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider atlas-ui-dim mb-1">{Icon && <Icon className="w-3 h-3" />}<span>{title}</span></div>}
      {children}
    </section>
  );
}
