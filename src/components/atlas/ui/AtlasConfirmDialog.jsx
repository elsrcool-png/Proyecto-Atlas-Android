import { AlertTriangle } from "lucide-react";
import AtlasModal from "./AtlasModal";
import AtlasButton from "./AtlasButton";

export default function AtlasConfirmDialog({ open, title = "Confirmar", description, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger = false, onConfirm, onCancel }) {
  return (
    <AtlasModal open={open} title={title} onClose={onCancel} className="max-w-md" bodyClassName="p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: danger ? "var(--atlas-ui-danger)" : "var(--atlas-ui-warning)" }} />
        <p className="atlas-ui-muted leading-relaxed">{description}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <AtlasButton variant="ghost" onPress={onCancel}>{cancelLabel}</AtlasButton>
        <AtlasButton variant={danger ? "danger" : "warning"} onPress={onConfirm}>{confirmLabel}</AtlasButton>
      </div>
    </AtlasModal>
  );
}
