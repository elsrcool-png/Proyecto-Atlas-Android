import { useEffect, useRef } from "react";
import { getMissionLockReason as missionLockReason } from "@/lib/atlasMissionEngine";

// Red de seguridad de campaña + cierre automático de la misión introductoria.
export default function useAtlasMissionSafety({
  player, missions, regionId, missionDefMap, threat, worldFlags, worldFlagsRef, missionsRef, claimMission, activateMission,
}) {
  const autoClaimIntroRef = useRef(false);

  useEffect(() => {
    if (missions.v1?.status === "pending") autoClaimIntroRef.current = false;
  }, [missions.v1?.status]);

  useEffect(() => {
    if (!player || regionId !== "verde") return;
    const intro = missions.v1;
    if (intro?.status !== "ready" || autoClaimIntroRef.current) return;
    autoClaimIntroRef.current = true;
    claimMission("v1");
  }, [regionId, missions.v1?.status]);

  // Cuando no queda ninguna misión activa ni lista, inicia la primera misión
  // principal disponible cuyas condiciones ya estén cumplidas.
  useEffect(() => {
    if (!player) return;
    const current = missionsRef.current || {};
    const hasLiveMission = Object.values(current).some(m => m.active && m.status !== "done");
    const hasReadyMission = Object.values(current).some(m => m.status === "ready");
    if (hasLiveMission || hasReadyMission) return;
    const next = Object.values(missionDefMap)
      .sort((a, b) => Number(String(a.id).replace(/\D/g, "")) - Number(String(b.id).replace(/\D/g, "")))
      .find(def => {
        const state = current[def.id];
        return state && state.status === "pending" && !state.accepted && !missionLockReason(def, current, worldFlagsRef.current, threat);
      });
    if (next) activateMission(next.id);
  }, [regionId, missions, worldFlags, threat]);
}