import { useCallback, useRef } from "react";
import { COMBAT_WIN_THRESHOLD, isThreatEnemy, rollLootThreat, THREAT_MAX } from "@/lib/atlasThreat";

export default function useAtlasCombatThreatTracker({ setThreat, toast, pushLog }) {
  const combatWinCounterRef = useRef(0);
  const applyThreatDelta = useCallback((delta, cause) => {
    if (!delta || !cause) return;
    setThreat((value) => Math.max(0, Math.min(THREAT_MAX, value + delta)));
    const sign = delta > 0 ? `+${delta}` : `${delta}`;
    toast(`Amenaza ${sign}: ${cause}`, delta > 0 ? "trap" : "heal");
    pushLog(`◆ Amenaza ${sign}: ${cause}.`);
  }, [pushLog, setThreat, toast]);
  const resolveCombatThreat = useCallback((enemy) => {
    if (isThreatEnemy(enemy)) {
      const cause = enemy?.boss ? "guardián derrotado" : enemy?.corrupted ? "criatura corrupta" : (enemy?.addsThreat && !enemy?.elite) ? "enemigo de evento" : "enemigo élite";
      return { delta: 1, cause };
    }
    combatWinCounterRef.current += 1;
    if (combatWinCounterRef.current >= COMBAT_WIN_THRESHOLD) {
      combatWinCounterRef.current = 0;
      return { delta: 1, cause: "3 victorias acumuladas" };
    }
    const lootThreat = rollLootThreat();
    return { delta: lootThreat.delta, cause: lootThreat.cause };
  }, []);
  const resetCombatWinCounter = useCallback(() => { combatWinCounterRef.current = 0; }, []);
  return { applyThreatDelta, resolveCombatThreat, resetCombatWinCounter };
}
