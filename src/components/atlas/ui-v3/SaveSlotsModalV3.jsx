import { useState } from "react";
import { Clock, Play, Plus, Trash2 } from "lucide-react";
import ChibiSprite from "../ChibiSprite";
import { AtlasButton, AtlasConfirmDialog, AtlasModal } from "@/components/atlas/ui";
import { getRegionLabel } from "@/lib/atlasRegionRegistry";

function fmtDate(ms) {
  if (!ms) return "—";
  try {
    const d = new Date(ms);
    return `${d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "2-digit" })} ${d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return "—";
  }
}

function fmtTime(ms) {
  if (!ms || ms < 0) return "0 min";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  if (m > 0) return `${m} min`;
  return `${total} s`;
}

function SlotCard({ index, slot, mode, onPick, onDelete }) {
  const [confirmMode, setConfirmMode] = useState(null);
  const occupied = Boolean(slot);
  const player = slot?.player;
  const region = getRegionLabel(slot?.worldState?.currentRegionId || slot?.lastRegionId, slot?.regionLabel || "—");
  const sector = slot?.lastSectorName || (slot ? `${String.fromCharCode(65 + (slot.blockIndex || 0))}${(slot.sectorRow || 0) + 1}` : "—");

  const choose = () => {
    if (mode === "new" && occupied) return setConfirmMode("overwrite");
    onPick(index);
  };

  return (
    <article className="atlas-ui-panel atlas-ui-panel--soft p-3 flex min-h-[220px] flex-col">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="atlas-ui-title text-sm">Espacio {index}</p>
          <span className="atlas-ui-badge mt-1">{occupied ? "Ocupado" : "Vacío"}</span>
        </div>
        {occupied && <ChibiSprite player={player} race={player?.race} cls={player?.class} size={48} />}
      </div>

      {occupied ? (
        <div className="mt-3 flex-1 space-y-1 text-xs">
          <p className="font-semibold">{player?.race || "?"} {player?.class || "?"}</p>
          <p className="atlas-ui-muted">Nivel {player?.level ?? 1} · {region}</p>
          <p className="atlas-ui-muted">Sector {sector}</p>
          <p className="atlas-ui-muted flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtTime(slot.playTimeMs)}</p>
          <p className="atlas-ui-dim truncate">Misión: {slot?.priorityMissionName || "—"}</p>
          <p className="atlas-ui-dim">Guardado: {fmtDate(slot.savedAt)}</p>
        </div>
      ) : (
        <div className="atlas-ui-empty flex-1"><p>Sin partida guardada</p></div>
      )}

      <div className="mt-3 flex gap-2">
        <AtlasButton
          variant={mode === "load" ? "success" : "primary"}
          icon={mode === "load" ? Play : Plus}
          full
          disabled={mode === "load" && !occupied}
          onPress={choose}
        >
          {mode === "load" ? "Cargar" : occupied ? "Sobrescribir" : "Nueva partida"}
        </AtlasButton>
        {occupied && <AtlasButton variant="danger" icon={Trash2} aria-label="Eliminar ranura" onPress={() => setConfirmMode("delete")} />}
      </div>

      <AtlasConfirmDialog
        open={confirmMode === "overwrite"}
        title="Sobrescribir partida"
        description={`El espacio ${index} será reemplazado por una nueva partida.`}
        confirmLabel="Sobrescribir"
        onCancel={() => setConfirmMode(null)}
        onConfirm={() => { setConfirmMode(null); onPick(index); }}
      />
      <AtlasConfirmDialog
        open={confirmMode === "delete"}
        title="Eliminar partida"
        description={`La partida del espacio ${index} se eliminará de forma permanente.`}
        confirmLabel="Eliminar"
        danger
        onCancel={() => setConfirmMode(null)}
        onConfirm={() => { setConfirmMode(null); onDelete(index); }}
      />
    </article>
  );
}

export default function SaveSlotsModalV3({ mode, slots, onPick, onDelete, onClose }) {
  return (
    <AtlasModal
      title={mode === "new" ? "Nueva partida" : "Cargar partida"}
      subtitle="Cada espacio conserva su propio personaje, progreso, regiones y santuarios."
      onClose={onClose}
      className="max-w-5xl"
      bodyClassName="p-4"
      footer={<AtlasButton variant="ghost" full onPress={onClose}>Volver</AtlasButton>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((n, i) => <SlotCard key={n} index={n} slot={slots[i]} mode={mode} onPick={onPick} onDelete={onDelete} />)}
      </div>
    </AtlasModal>
  );
}
