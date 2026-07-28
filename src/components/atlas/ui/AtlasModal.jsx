import { X } from "lucide-react";
import AtlasIconButton from "./AtlasIconButton";

export default function AtlasModal({
  open = true,
  title,
  subtitle,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  className = "",
  bodyClassName = "",
  zIndex,
}) {
  if (!open) return null;

  const closeFromBackdrop = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) onClose?.();
  };

  return (
    <div
      className="atlas-ui-v3 atlas-ui-modal-backdrop"
      style={zIndex ? { zIndex } : undefined}
      onClick={closeFromBackdrop}
      role="presentation"
    >
      <section
        className={`atlas-ui-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Ventana de Atlas"}
      >
        {(title || subtitle || onClose) && (
          <header className="atlas-ui-panel-header atlas-ui-modal-header">
            <div className="min-w-0">
              {title && <h2 className="atlas-ui-title truncate">{title}</h2>}
              {subtitle && <p className="atlas-ui-muted mt-1 text-sm leading-snug">{subtitle}</p>}
            </div>
            {onClose && <AtlasIconButton icon={X} label="Cerrar" onPress={onClose} />}
          </header>
        )}
        <div className={`atlas-ui-modal-body ${bodyClassName}`.trim()}>{children}</div>
        {footer && (
          <footer className="atlas-ui-modal-footer border-t px-4 py-3" style={{ borderColor: "var(--atlas-ui-border-soft)" }}>
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
