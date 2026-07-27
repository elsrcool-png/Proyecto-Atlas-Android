import { useCallback, useEffect, useRef } from "react";
import { makeCombatAction } from "@/lib/atlasCombatTransactions";

// Mantiene todos los temporizadores de combate en un único lugar y asigna un
// actionId monotónico. Es la primera extracción segura desde useAtlasSession.
export default function useAtlasCombatRuntime({
  setLastResult,
  setCombatAnimating,
  setEnemy,
  setPlayer,
  playerRef,
  enemyRef,
  onPlayerDefeatRef,
  toast,
}) {
  const actionIdRef = useRef(0);
  const combatAnimationTimerRef = useRef(null);
  const enemyTurnTimerRef = useRef(null);
  const enemyDefeatTimerRef = useRef(null);
  const playerDefeatTimerRef = useRef(null);

  const clearCombatTimers = useCallback(() => {
    if (combatAnimationTimerRef.current) clearTimeout(combatAnimationTimerRef.current);
    if (enemyTurnTimerRef.current) clearTimeout(enemyTurnTimerRef.current);
    if (enemyDefeatTimerRef.current) clearTimeout(enemyDefeatTimerRef.current);
    if (playerDefeatTimerRef.current) clearTimeout(playerDefeatTimerRef.current);
    combatAnimationTimerRef.current = null;
    enemyTurnTimerRef.current = null;
    enemyDefeatTimerRef.current = null;
    playerDefeatTimerRef.current = null;
  }, []);

  const commitCombatResult = useCallback((result, durationOverride = null, snapshots = {}) => {
    const actionId = ++actionIdRef.current;
    const beforePlayer = snapshots.beforePlayer ?? playerRef.current;
    const beforeEnemy = snapshots.beforeEnemy ?? enemyRef.current;
    const afterPlayer = snapshots.afterPlayer ?? beforePlayer;
    const afterEnemy = snapshots.afterEnemy ?? beforeEnemy;
    const action = makeCombatAction({
      actionId,
      result,
      beforePlayer,
      beforeEnemy,
      afterPlayer,
      afterEnemy,
      resolution: snapshots.resolution,
    });

    setLastResult(action);
    const duration = Math.max(420, Number(durationOverride || result?.animationSequence?.totalDuration || 720));
    setCombatAnimating(true);
    if (combatAnimationTimerRef.current) clearTimeout(combatAnimationTimerRef.current);
    combatAnimationTimerRef.current = setTimeout(() => {
      combatAnimationTimerRef.current = null;
      setCombatAnimating(false);
    }, duration + 180);
    return duration;
  }, [enemyRef, playerRef, setCombatAnimating, setLastResult]);

  const stageEnemyDefeat = useCallback((enemySnapshot, sequence) => {
    const id = enemySnapshot?.id;
    const delay = Math.max(420, Number(sequence?.totalDuration || 720));
    const defeated = { ...enemySnapshot, hp: 0, dying: false };
    enemyRef.current = defeated;
    setEnemy(defeated);
    if (enemyDefeatTimerRef.current) clearTimeout(enemyDefeatTimerRef.current);
    enemyDefeatTimerRef.current = setTimeout(() => {
      enemyDefeatTimerRef.current = null;
      setEnemy(current => {
        if (!current || current.id !== id || current.hp > 0) return current;
        const dyingEnemy = { ...current, dying: true };
        enemyRef.current = dyingEnemy;
        return dyingEnemy;
      });
    }, delay + 40);
  }, [enemyRef, setEnemy]);

  const stagePlayerDefeat = useCallback((playerSnapshot, sequence, options = {}) => {
    const delay = Math.max(420, Number(sequence?.totalDuration || options.duration || 720));
    const defeated = { ...playerSnapshot, hp: 0 };
    playerRef.current = defeated;
    setPlayer(defeated);
    if (playerDefeatTimerRef.current) clearTimeout(playerDefeatTimerRef.current);
    playerDefeatTimerRef.current = setTimeout(() => {
      playerDefeatTimerRef.current = null;
      onPlayerDefeatRef.current?.(options.reason || "combat");
      if (options.toastMessage) toast(options.toastMessage, "trap");
    }, delay + 40);
  }, [onPlayerDefeatRef, playerRef, setPlayer, toast]);

  const scheduleEnemyTurn = useCallback((callback, delayMs = 400) => {
    if (enemyTurnTimerRef.current) clearTimeout(enemyTurnTimerRef.current);
    setCombatAnimating(true);
    enemyTurnTimerRef.current = setTimeout(() => {
      enemyTurnTimerRef.current = null;
      setCombatAnimating(false);
      callback();
    }, Math.max(200, Number(delayMs) || 400));
  }, [setCombatAnimating]);

  useEffect(() => clearCombatTimers, [clearCombatTimers]);

  return {
    clearCombatTimers,
    commitCombatResult,
    stageEnemyDefeat,
    stagePlayerDefeat,
    scheduleEnemyTurn,
  };
}
