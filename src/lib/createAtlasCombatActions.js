import { resolveCombatTurn } from "@/lib/atlasEngine";
import { resolveAttack, resolveD20Quality, upgradeCombatRollBand } from "@/lib/atlasDamageSystem";
import { randInt } from "@/lib/atlasWorld";
import { tickPlayerStatuses } from "@/lib/atlasEnemyAI";
import { rollDiceGroup, isCriticalFailureRoll, countNaturalOnes, criticalFailureThreshold } from "@/lib/atlasDiceSystem";
import { buildCombatSequence, combatSequenceDelay } from "@/lib/atlasCombatDirector";
import { resolveShieldedDamage } from "@/lib/atlasCombatTransactions";
import { getPotion } from "@/lib/atlasShop";

const CLASS_ELEMENT = { Guerrero: "fisico", Mago: "arcano", "Pícaro": "sombra" };

const criticalFailureMeta = rollResult => ({
  criticalFailureByOnes: isCriticalFailureRoll(rollResult),
  naturalOnes: countNaturalOnes(rollResult),
  criticalFailureThreshold: criticalFailureThreshold(rollResult),
  diceCount: Array.isArray(rollResult?.rolls) ? rollResult.rolls.length : 0,
  diceFaces: Array.isArray(rollResult?.rolls) ? rollResult.rolls.map(die => Number(die.result) || 0) : [],
});

const formatCriticalFailure = (rollResult) => {
  const meta = criticalFailureMeta(rollResult);
  return `${rollResult.label}: [${meta.diceFaces.join(", ")}], ${meta.naturalOnes}/${meta.diceCount} dados en 1`;
};

/**
 * Construye las acciones de combate del jugador.
 *
 * Este módulo mantiene fuera de useAtlasSession la resolución de ataques,
 * habilidades, pociones, estados de inicio de turno y programación del turno
 * enemigo. Todas las dependencias con estado se reciben de forma explícita,
 * evitando imports circulares y haciendo visible el contrato del subsistema.
 */
export function createAtlasCombatActions({
  enemy,
  player,
  diceAnim,
  combatAnimating,
  skills,
  combatRef,
  playerRef,
  enemyRef,
  pendingDeadRef,
  setPlayer,
  setEnemy,
  setPlayerStatuses,
  pushLog,
  toast,
  damageWeapon,
  turnStart,
  showDice,
  modifyOutgoing,
  enemyAtkVsType,
  enemyDefForClass,
  playerDefVsType,
  applyPierce,
  applyStatusToEnemy,
  statusForSkillName,
  maybeChannel,
  commitCombatResult,
  stagePlayerDefeat,
  stageEnemyDefeat,
  scheduleEnemyTurn,
  enemyTurn,
  onKillEnergy,
  onMasterySkillUsed,
}) {
  const tickPlayerStatusTurn = () => {
    const sr = tickPlayerStatuses(combatRef.current.playerStatuses);
    combatRef.current.playerStatuses = sr.nextStatuses;
    setPlayerStatuses({ ...sr.nextStatuses });

    const playerBeforeTick = { ...playerRef.current };
    const nextHp = Math.max(0, Number(playerBeforeTick.hp || 0) - Number(sr.damage || 0));
    const playerAfterTick = { ...playerBeforeTick, hp: nextHp };
    playerRef.current = playerAfterTick;
    if (sr.damage > 0) setPlayer(playerAfterTick);

    if (sr.damage > 0 || !sr.canAct) [...new Set(sr.logs || [])].forEach(line => pushLog(line));
    if (nextHp <= 0) {
      stagePlayerDefeat(playerAfterTick, { totalDuration: 420 }, { toastMessage: "Has caído" });
      return { canAct: false, died: true, blockedBy: sr.blockedBy || null, damage: sr.damage, playerBeforeTick, playerAfterTick };
    }

    return { canAct: sr.canAct, died: false, blockedBy: sr.blockedBy || null, damage: sr.damage, playerBeforeTick, playerAfterTick };
  };
  const triggerEnemyTurn = (updatedEnemy, playerSnapshot, delayMs = 400) => {
    if (!updatedEnemy || updatedEnemy.hp <= 0 || updatedEnemy.dying) return;
    scheduleEnemyTurn(() => {
      const curPlayer = playerSnapshot || { ...playerRef.current };
      enemyTurn(updatedEnemy, curPlayer);
    }, delayMs);
  };

  const resolveBlockedPlayerAction = (statusResult, attempted = "acción") => {
    const actingPlayer = statusResult.playerAfterTick;
    const frozen = statusResult.blockedBy === "freeze";
    const type = frozen ? "PLAYER_FROZEN" : "PLAYER_PARALYZED";
    commitCombatResult(
      { type, enemyDamage: 0, playerDamage: 0, blockedBy: statusResult.blockedBy, attemptedAction: attempted, actionFailed: true, skipDice: true },
      540,
      { beforePlayer: statusResult.playerBeforeTick, afterPlayer: actingPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: 0, hpDamage: 0 } },
    );
    pushLog(`${frozen ? "Congelación" : "Parálisis"}: ${attempted} falla automáticamente. No gastas energía, consumibles ni durabilidad.`);
    triggerEnemyTurn(enemy, actingPlayer, 620);
    return actingPlayer;
  };

  const handleAttack = () => {
    if (!enemy || diceAnim || combatAnimating) return;
    turnStart();
    const statusResult = tickPlayerStatusTurn();
    if (statusResult.died) return;
    const actingPlayer = statusResult.playerAfterTick;
    if (!statusResult.canAct) { resolveBlockedPlayerAction(statusResult, "el ataque básico"); return; }
    damageWeapon(1);
    const dr = rollDiceGroup("basico");
    const roll = dr.total;
    showDice(dr, skills?.basic?.name || "Ataque", () => {
      const bType = enemy.basicAttackType || "fisico";
      const eAtkForThreshold = enemyAtkVsType(enemy, bType);
      const criticalFailure = isCriticalFailureRoll(dr);
      const quality = resolveD20Quality(criticalFailure ? 1 : roll);
      // En el ataque básico, solo un 20 natural es crítico. El crítico de equipo
      // sigue aplicándose a habilidades de dados compuestos, no altera esta tabla.
      const isCrit = !criticalFailure && quality.id === "critico";
      const effDef = applyPierce(enemyDefForClass(enemy), quality, isCrit);
      const routedEnemy = { ...enemy, attack: eAtkForThreshold, defense: effDef };
      const routedPlayer = { ...actingPlayer, defense: playerDefVsType(actingPlayer, bType) };
      const res = resolveCombatTurn(routedPlayer, routedEnemy, quality, { rollTotal: roll, forceCritical: !criticalFailure && roll === 20, forceCriticalFailure: criticalFailure });
      if (res.counter) {
        // Fallo crítico: 0 daño al enemigo + contraataque. Sustituye al turno enemigo.
        const afterPlayer = { ...actingPlayer, hp: Math.max(0, actingPlayer.hp - res.playerDamage) };
        const animationSequence = buildCombatSequence({
          skill: skills?.basic, className: actingPlayer.class, diceGroup: "basico", rollTotal: roll,
          qualityId: quality.id, totalDamage: 0, playerDamage: res.playerDamage, counter: true, kind: "basic",
        });
        commitCombatResult(
          { type: "FALLO_CRÍTICO", enemyDamage: 0, playerDamage: res.playerDamage, counter: true, rollTotal: roll, diceGroup: "basico", qualityId: quality.id, ...criticalFailureMeta(dr), animationSequence },
          null,
          { beforePlayer: actingPlayer, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: res.playerDamage, hpDamage: res.playerDamage } },
        );
        pushLog(`Fallo crítico (${formatCriticalFailure(dr)}). ¡Contraataque! Recibes ${res.playerDamage} daño.`);
        if (afterPlayer.hp <= 0) {
          stagePlayerDefeat(afterPlayer, animationSequence, { toastMessage: "Has caído por un contraataque" });
          return;
        }
        playerRef.current = afterPlayer;
        setPlayer(afterPlayer);
        return;
      }

      const rawDamage = modifyOutgoing(res.enemyDamage);
      const damageResolution = resolveShieldedDamage(enemy, rawDamage);
      const updatedEnemy = damageResolution.enemyAfter;
      const animationSequence = buildCombatSequence({
        skill: skills?.basic, className: actingPlayer.class, diceGroup: "basico", rollTotal: roll,
        qualityId: quality.id, totalDamage: damageResolution.hpDamage, landed: rawDamage > 0, kind: "basic",
      });
      commitCombatResult(
        {
          type: res.type, enemyDamage: damageResolution.hpDamage, rawEnemyDamage: rawDamage,
          shieldDamage: damageResolution.shieldDamage, playerDamage: 0, crit: isCrit, rollTotal: roll,
          diceGroup: "basico", qualityId: quality.id, animationSequence,
        },
        null,
        {
          beforePlayer: actingPlayer, afterPlayer: actingPlayer, beforeEnemy: enemy, afterEnemy: updatedEnemy,
          resolution: damageResolution,
        },
      );
      pushLog(`(d20 ${roll}) ${res.log}`);
      if (damageResolution.shieldDamage > 0) pushLog(`El escudo de ${enemy.name} absorbe ${damageResolution.shieldDamage} daño.`);
      if (updatedEnemy.hp <= 0) {
        pushLog(`Derrotas a ${enemy.name}.`);
        pendingDeadRef.current = { wasBoss: !!enemy.boss, enemyId: enemy.id };
        stageEnemyDefeat(updatedEnemy, animationSequence);
        onKillEnergy();
        return;
      }
      enemyRef.current = updatedEnemy;
      setEnemy(updatedEnemy);
      triggerEnemyTurn(updatedEnemy, actingPlayer, combatSequenceDelay(animationSequence));
    });
  };

  const handleWeaponSkill = () => {
    if (!enemy || enemy.dying || diceAnim || combatAnimating) return;
    const wa = skills?.weapon; if (!wa) return;
    if ((player.mp || 0) < wa.cost) return;
    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    const actingPlayer = stChk.playerAfterTick;
    if (!stChk.canAct) { resolveBlockedPlayerAction(stChk, `la habilidad ${wa.name}`); return; }
    damageWeapon(2);
    const dr = rollDiceGroup(wa.diceGroup || "versatil");
    const roll = dr.total;
    showDice(dr, `${wa.name}`, () => {
      const eff = wa.effect || {};
      const ignoreFrac = typeof eff.ignoreDef === "number" ? eff.ignoreDef : (eff.ignoreDef === "highroll" ? (roll >= 14 ? 0.6 : 0.2) : 0);
      const criticalFailure = isCriticalFailureRoll(dr);
      let effectiveRoll = roll;
      const baseQuality = resolveD20Quality(criticalFailure ? 1 : roll);
      if (baseQuality.id !== "fallo_critico") {
        if (eff.crit === "always") effectiveRoll = 20;
        else if (eff.crit === "highroll" && roll >= 14) effectiveRoll = 20;
        else if (roll < 20 && (actingPlayer.crit || 0) > 0 && Math.random() < (actingPlayer.crit || 0)) effectiveRoll = upgradeCombatRollBand(roll);
      }
      const quality = resolveD20Quality(criticalFailure ? 1 : effectiveRoll);
      const qId = quality.id;
      const isCrit = !criticalFailure && effectiveRoll === 20;
      const effDef = applyPierce(Math.round(enemyDefForClass(enemy) * (1 - ignoreFrac)), quality, isCrit);
      const res = resolveAttack({
        qualityId: qId,
        atk: Math.max(0, Math.round(actingPlayer.attack * (eff.power || 1))),
        def: effDef,
        opponentAtk: enemyAtkVsType(enemy, "fisico"),
        opponentDef: playerDefVsType(actingPlayer, "fisico"),
        rollTotal: effectiveRoll,
        forceCritical: isCrit,
        forceCriticalFailure: criticalFailure,
      });
      const newMp = Math.max(0, (actingPlayer.mp || 0) - wa.cost);
      if (res.isFalloCritico) {
        const afterPlayer = { ...actingPlayer, mp: newMp, hp: Math.max(0, actingPlayer.hp - res.counter.damage) };
        const animationSequence = buildCombatSequence({
          skill: wa, className: actingPlayer.class, diceGroup: wa.diceGroup || "versatil", rollTotal: roll,
          qualityId: qId, totalDamage: 0, playerDamage: res.counter.damage, counter: true, kind: "weapon",
        });
        commitCombatResult(
          { type: "FALLO_CRÍTICO", enemyDamage: 0, playerDamage: res.counter.damage, counter: true, skill: "weapon", rollTotal: roll, effectiveRollTotal: effectiveRoll, diceGroup: wa.diceGroup || "versatil", qualityId: qId, rollBand: res.rollBand?.label, ...criticalFailureMeta(dr), animationSequence },
          null,
          { beforePlayer: actingPlayer, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: res.counter.damage, hpDamage: res.counter.damage } },
        );
        pushLog(`${wa.name}: fallo crítico (${formatCriticalFailure(dr)}; suma ${roll}). ¡Contraataque! Recibes ${res.counter.damage} daño. ${actingPlayer.energyName || "MP"} -${wa.cost}.`);
        if (afterPlayer.hp <= 0) { stagePlayerDefeat(afterPlayer, animationSequence); return; }
        playerRef.current = afterPlayer;
        setPlayer(afterPlayer);
        return;
      }

      const rawDamage = modifyOutgoing(res.damage);
      const damageResolution = resolveShieldedDamage(enemy, rawDamage);
      let updatedEnemy = damageResolution.enemyAfter;
      const statusId = Array.isArray(eff.statusPool) && eff.statusPool.length
        ? eff.statusPool[randInt(0, eff.statusPool.length - 1)]
        : eff.statusId;
      if (updatedEnemy.hp > 0 && statusId) updatedEnemy = applyStatusToEnemy(updatedEnemy, statusId, qId, eff.statusAmount || 1);
      if (eff.summon) pushLog("✦ El familiar abre una oportunidad táctica.");
      if (eff.purify && enemy.boss) pushLog("✦ La reliquia fractura la corrupción que envuelve al Guardián.");
      const spentPlayer = { ...actingPlayer, mp: newMp };
      const channelGain = maybeChannel(spentPlayer);
      const updatedPlayer = { ...spentPlayer, mp: Math.min(spentPlayer.maxMp || 0, newMp + channelGain) };
      const animationSequence = buildCombatSequence({
        skill: wa, className: actingPlayer.class, element: CLASS_ELEMENT[actingPlayer.class], diceGroup: wa.diceGroup || "versatil", rollTotal: roll,
        qualityId: qId, totalDamage: damageResolution.hpDamage, landed: rawDamage > 0, statusId, kind: "weapon",
      });
      commitCombatResult(
        {
          type: isCrit ? "¡HABILIDAD CRÍTICA!" : "HABILIDAD", enemyDamage: damageResolution.hpDamage, rawEnemyDamage: rawDamage,
          shieldDamage: damageResolution.shieldDamage, playerDamage: 0, skill: "weapon", element: CLASS_ELEMENT[actingPlayer.class],
          statusId, rollTotal: roll, effectiveRollTotal: effectiveRoll, diceGroup: wa.diceGroup || "versatil", qualityId: qId, rollBand: res.rollBand?.label, animationSequence,
        },
        null,
        { beforePlayer: actingPlayer, afterPlayer: updatedPlayer, beforeEnemy: enemy, afterEnemy: updatedEnemy, resolution: damageResolution },
      );
      pushLog(`${wa.name} (${dr.label} = ${roll}${effectiveRoll !== roll ? ` → ${effectiveRoll}` : ""} · ${res.rollBand?.label || quality.name}): infliges ${rawDamage} daño${isCrit ? " (¡crítico, ignora DEF!)" : ""}. ${actingPlayer.energyName || "MP"} -${wa.cost}.`);
      if (damageResolution.shieldDamage > 0) pushLog(`El escudo de ${enemy.name} absorbe ${damageResolution.shieldDamage} daño.`);
      playerRef.current = updatedPlayer;
      setPlayer(updatedPlayer);
      if (updatedEnemy.hp <= 0) {
        pushLog(`¡Derrotas a ${enemy.name} con ${wa.name}!`);
        pendingDeadRef.current = { wasBoss: !!enemy.boss, enemyId: enemy.id };
        stageEnemyDefeat(updatedEnemy, animationSequence);
        onKillEnergy();
        return;
      }
      enemyRef.current = updatedEnemy;
      setEnemy(updatedEnemy);
      triggerEnemyTurn(updatedEnemy, updatedPlayer, combatSequenceDelay(animationSequence));
    });
  };

  const handleDefinitiveSkill = () => {
    if (!enemy || enemy.dying || diceAnim || combatAnimating) return;
    const da = skills?.definitive; if (!da) return;
    if (player.level < da.unlock) return;
    if ((player.mp || 0) < da.cost) return;
    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    const actingPlayer = stChk.playerAfterTick;
    if (!stChk.canAct) { resolveBlockedPlayerAction(stChk, `la definitiva ${da.name}`); return; }
    damageWeapon(2);
    const dr = rollDiceGroup("versatil");
    const roll = dr.total;
    showDice(dr, `${da.name}`, () => {
      const criticalFailure = isCriticalFailureRoll(dr);
      let effectiveRoll = roll;
      const baseQuality = resolveD20Quality(criticalFailure ? 1 : roll);
      if (baseQuality.id !== "fallo_critico" && roll < 20 && (actingPlayer.crit || 0) > 0 && Math.random() < (actingPlayer.crit || 0)) {
        effectiveRoll = upgradeCombatRollBand(roll);
      }
      const quality = resolveD20Quality(criticalFailure ? 1 : effectiveRoll);
      const qId = quality.id;
      const isCrit = !criticalFailure && effectiveRoll === 20;
      const effDef = applyPierce(enemyDefForClass(enemy), quality, isCrit);
      const res = resolveAttack({
        qualityId: qId,
        atk: Math.max(0, Math.round(actingPlayer.attack * 1.2)),
        def: effDef,
        opponentAtk: enemyAtkVsType(enemy, "fisico"),
        opponentDef: playerDefVsType(actingPlayer, "fisico"),
        rollTotal: effectiveRoll,
        forceCritical: isCrit,
        forceCriticalFailure: criticalFailure,
      });
      const newMp = Math.max(0, (actingPlayer.mp || 0) - da.cost);
      if (res.isFalloCritico) {
        const afterPlayer = { ...actingPlayer, mp: newMp, hp: Math.max(0, actingPlayer.hp - res.counter.damage) };
        const animationSequence = buildCombatSequence({
          skill: da, className: actingPlayer.class, element: CLASS_ELEMENT[actingPlayer.class], diceGroup: "versatil", rollTotal: roll,
          qualityId: qId, totalDamage: 0, playerDamage: res.counter.damage, counter: true, kind: "definitive",
        });
        commitCombatResult(
          { type: "FALLO_CRÍTICO", enemyDamage: 0, playerDamage: res.counter.damage, counter: true, skill: "definitive", element: CLASS_ELEMENT[actingPlayer.class], rollTotal: roll, effectiveRollTotal: effectiveRoll, diceGroup: "versatil", qualityId: qId, rollBand: res.rollBand?.label, ...criticalFailureMeta(dr), animationSequence },
          null,
          { beforePlayer: actingPlayer, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: res.counter.damage, hpDamage: res.counter.damage } },
        );
        pushLog(`${da.name} (DEFINITIVA): fallo crítico (${formatCriticalFailure(dr)}; suma ${roll}). ¡Contraataque! Recibes ${res.counter.damage} daño. ${actingPlayer.energyName || "MP"} -${da.cost}.`);
        if (afterPlayer.hp <= 0) { stagePlayerDefeat(afterPlayer, animationSequence); return; }
        playerRef.current = afterPlayer;
        setPlayer(afterPlayer);
        return;
      }

      const rawDamage = modifyOutgoing(res.damage);
      const damageResolution = resolveShieldedDamage(enemy, rawDamage);
      const statusId = statusForSkillName(da.name);
      let updatedEnemy = damageResolution.enemyAfter;
      if (updatedEnemy.hp > 0) updatedEnemy = applyStatusToEnemy(updatedEnemy, statusId, qId, 2);
      const spentPlayer = { ...actingPlayer, mp: newMp };
      const channelGain = maybeChannel(spentPlayer);
      const updatedPlayer = { ...spentPlayer, mp: Math.min(spentPlayer.maxMp || 0, newMp + channelGain) };
      const animationSequence = buildCombatSequence({
        skill: da, className: actingPlayer.class, element: CLASS_ELEMENT[actingPlayer.class], diceGroup: "versatil", rollTotal: roll,
        qualityId: qId, totalDamage: damageResolution.hpDamage, landed: rawDamage > 0, statusId, kind: "definitive",
      });
      commitCombatResult(
        {
          type: isCrit ? "¡HABILIDAD CRÍTICA!" : "HABILIDAD", enemyDamage: damageResolution.hpDamage, rawEnemyDamage: rawDamage,
          shieldDamage: damageResolution.shieldDamage, playerDamage: 0, skill: "definitive", element: CLASS_ELEMENT[actingPlayer.class],
          statusId, rollTotal: roll, effectiveRollTotal: effectiveRoll, diceGroup: "versatil", qualityId: qId, rollBand: res.rollBand?.label, animationSequence,
        },
        null,
        { beforePlayer: actingPlayer, afterPlayer: updatedPlayer, beforeEnemy: enemy, afterEnemy: updatedEnemy, resolution: damageResolution },
      );
      pushLog(`${da.name} (DEFINITIVA · ${dr.label} = ${roll}${effectiveRoll !== roll ? ` → ${effectiveRoll}` : ""} · ${res.rollBand?.label || quality.name})${isCrit ? " · CRÍTICO (ignora DEF)" : ""}: infliges ${rawDamage} daño y alteras el combate. ${actingPlayer.energyName || "MP"} -${da.cost}.`);
      if (damageResolution.shieldDamage > 0) pushLog(`El escudo de ${enemy.name} absorbe ${damageResolution.shieldDamage} daño.`);
      playerRef.current = updatedPlayer;
      setPlayer(updatedPlayer);
      if (updatedEnemy.hp <= 0) {
        pushLog(`¡Derrotas a ${enemy.name} con ${da.name}!`);
        pendingDeadRef.current = { wasBoss: !!enemy.boss, enemyId: enemy.id };
        stageEnemyDefeat(updatedEnemy, animationSequence);
        onKillEnergy();
        return;
      }
      enemyRef.current = updatedEnemy;
      setEnemy(updatedEnemy);
      triggerEnemyTurn(updatedEnemy, updatedPlayer, combatSequenceDelay(animationSequence));
    });
  };

  const handleSkill = (key) => {
    if (key === "weapon") return handleWeaponSkill();
    if (key === "definitive") return handleDefinitiveSkill();
    if (!enemy || enemy.dying || diceAnim || combatAnimating) return;
    if (!skills || !skills[key]) return;
    if (player.level < skills[key].unlock) return;
    const cost = skills[key].cost;
    if ((player.mp || 0) < cost) return;
    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    const actingPlayer = stChk.playerAfterTick;
    if (!stChk.canAct) { resolveBlockedPlayerAction(stChk, `la habilidad ${skills[key].name}`); return; }
    if (skills[key]?.id) onMasterySkillUsed?.(skills[key].id);
    damageWeapon(1);
    const groupId = key === "classAbility" ? "tecnica" : key === "hybrid" ? "fuerza" : "basico";
    const dr = rollDiceGroup(groupId);
    const roll = dr.total;
    showDice(dr, `${skills[key].name}`, () => {
      const name = skills[key].name;
      const ignoreFrac = /Estocada Sombría/.test(name) ? 0.3 : /Revienta Escudos/.test(name) ? 0.75 : /Bomba de Humo/.test(name) ? 0.5 : 0;
      const criticalFailure = isCriticalFailureRoll(dr);
      let effectiveRoll = roll;
      const baseQuality = resolveD20Quality(criticalFailure ? 1 : roll);
      if (baseQuality.id !== "fallo_critico") {
        if (/Castigo Nocturno/.test(name) && roll >= 14) effectiveRoll = 20;
        else if (/Revienta Escudos|Bomba de Humo/.test(name) && roll >= 16) effectiveRoll = 20;
        else if (roll < 20 && (actingPlayer.crit || 0) > 0 && Math.random() < (actingPlayer.crit || 0)) effectiveRoll = upgradeCombatRollBand(roll);
      }
      const quality = resolveD20Quality(criticalFailure ? 1 : effectiveRoll);
      const qId = quality.id;
      const isCrit = !criticalFailure && effectiveRoll === 20;
      const effDef = applyPierce(Math.round(enemyDefForClass(enemy) * (1 - ignoreFrac)), quality, isCrit);
      const res = resolveAttack({
        qualityId: qId,
        atk: actingPlayer.attack,
        def: effDef,
        opponentAtk: enemyAtkVsType(enemy, "fisico"),
        opponentDef: playerDefVsType(actingPlayer, "fisico"),
        rollTotal: effectiveRoll,
        forceCritical: isCrit,
        forceCriticalFailure: criticalFailure,
      });
      const newMp = Math.max(0, (actingPlayer.mp || 0) - cost);
      if (res.isFalloCritico) {
        const afterPlayer = { ...actingPlayer, mp: newMp, hp: Math.max(0, actingPlayer.hp - res.counter.damage) };
        const animationSequence = buildCombatSequence({
          skill: skills[key], className: actingPlayer.class, element: CLASS_ELEMENT[actingPlayer.class], diceGroup: groupId, rollTotal: roll,
          qualityId: qId, totalDamage: 0, playerDamage: res.counter.damage, counter: true, kind: key,
        });
        commitCombatResult(
          { type: "FALLO_CRÍTICO", enemyDamage: 0, playerDamage: res.counter.damage, counter: true, skill: key, element: CLASS_ELEMENT[actingPlayer.class], rollTotal: roll, effectiveRollTotal: effectiveRoll, diceGroup: groupId, qualityId: qId, rollBand: res.rollBand?.label, ...criticalFailureMeta(dr), animationSequence },
          null,
          { beforePlayer: actingPlayer, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: res.counter.damage, hpDamage: res.counter.damage } },
        );
        pushLog(`${name}: fallo crítico (${formatCriticalFailure(dr)}; suma ${roll}). ¡Contraataque! Recibes ${res.counter.damage} daño. ${actingPlayer.energyName || "MP"} -${cost}.`);
        if (afterPlayer.hp <= 0) { stagePlayerDefeat(afterPlayer, animationSequence); return; }
        playerRef.current = afterPlayer;
        setPlayer(afterPlayer);
        return;
      }

      const rawDamage = modifyOutgoing(res.damage);
      const damageResolution = resolveShieldedDamage(enemy, rawDamage);
      const type = isCrit ? "¡HABILIDAD CRÍTICA!" : "HABILIDAD";
      const statusId = statusForSkillName(name);
      let updatedEnemy = damageResolution.enemyAfter;
      if (updatedEnemy.hp > 0) updatedEnemy = applyStatusToEnemy(updatedEnemy, statusId, qId, key === "hybrid" ? 2 : 1);
      const spentPlayer = { ...actingPlayer, mp: newMp };
      const channelGain = maybeChannel(spentPlayer);
      const updatedPlayer = { ...spentPlayer, mp: Math.min(spentPlayer.maxMp || 0, newMp + channelGain) };
      const animationSequence = buildCombatSequence({
        skill: skills[key], className: actingPlayer.class, element: CLASS_ELEMENT[actingPlayer.class], diceGroup: groupId, rollTotal: roll,
        qualityId: qId, totalDamage: damageResolution.hpDamage, landed: rawDamage > 0, statusId, kind: key,
      });
      commitCombatResult(
        {
          type, enemyDamage: damageResolution.hpDamage, rawEnemyDamage: rawDamage, shieldDamage: damageResolution.shieldDamage,
          playerDamage: 0, skill: key, element: CLASS_ELEMENT[actingPlayer.class], statusId, rollTotal: roll,
          diceGroup: groupId, qualityId: qId, effectiveRollTotal: effectiveRoll, rollBand: res.rollBand?.label, animationSequence,
        },
        null,
        { beforePlayer: actingPlayer, afterPlayer: updatedPlayer, beforeEnemy: enemy, afterEnemy: updatedEnemy, resolution: damageResolution },
      );
      pushLog(`${name} (${dr.label} = ${roll}${effectiveRoll !== roll ? ` → ${effectiveRoll}` : ""} · ${res.rollBand?.label || quality.name}): infliges ${rawDamage} daño${isCrit ? " (ignora DEF)" : ""}. ${actingPlayer.energyName || "MP"} -${cost}.`);
      if (damageResolution.shieldDamage > 0) pushLog(`El escudo de ${enemy.name} absorbe ${damageResolution.shieldDamage} daño.`);
      playerRef.current = updatedPlayer;
      setPlayer(updatedPlayer);
      if (updatedEnemy.hp <= 0) {
        pushLog(`¡Derrotas a ${enemy.name} con ${name}!`);
        pendingDeadRef.current = { wasBoss: !!enemy.boss, enemyId: enemy.id };
        stageEnemyDefeat(updatedEnemy, animationSequence);
        onKillEnergy();
        return;
      }
      enemyRef.current = updatedEnemy;
      setEnemy(updatedEnemy);
      triggerEnemyTurn(updatedEnemy, updatedPlayer, combatSequenceDelay(animationSequence));
    });
  };

  const useCombatConsumable = (id) => {
    if (!enemy || enemy.dying || diceAnim || combatAnimating || !id) return;
    const livePlayer = playerRef.current || player;
    const count = id === "hp_s" ? (livePlayer.potions || 0) : (livePlayer.consumables?.[id] || 0);
    if (count <= 0) return;

    const potion = getPotion(id);
    const isAntidote = id === "antidote";
    const poisonActive = !!combatRef.current.playerStatuses?.poison;
    if (potion?.heal && livePlayer.hp >= livePlayer.maxHp) { toast("La vida ya está llena", "info"); return; }
    if (potion?.restore && (livePlayer.mp || 0) >= (livePlayer.maxMp || 0)) { toast("La energía ya está llena", "info"); return; }
    if (isAntidote && !poisonActive) { toast("No estás envenenado", "info"); return; }
    if (!potion && !isAntidote) return;

    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    const actingPlayer = stChk.playerAfterTick;
    if (!stChk.canAct) { resolveBlockedPlayerAction(stChk, "usar un consumible"); return; }

    let updatedPlayer = { ...actingPlayer };
    let resultText = "";
    if (id === "hp_s") updatedPlayer.potions = Math.max(0, (actingPlayer.potions || 0) - 1);
    else updatedPlayer.consumables = { ...(actingPlayer.consumables || {}), [id]: Math.max(0, (actingPlayer.consumables?.[id] || 0) - 1) };

    if (potion?.heal) {
      const before = updatedPlayer.hp;
      updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + potion.heal);
      resultText = `HP +${updatedPlayer.hp - before}`;
    }
    if (potion?.restore) {
      const before = updatedPlayer.mp || 0;
      updatedPlayer.mp = Math.min(updatedPlayer.maxMp || 0, before + potion.restore);
      resultText = `${updatedPlayer.energyName || "Energía"} +${updatedPlayer.mp - before}`;
    }
    if (isAntidote) {
      const nextStatuses = { ...(combatRef.current.playerStatuses || {}) };
      delete nextStatuses.poison;
      combatRef.current.playerStatuses = nextStatuses;
      setPlayerStatuses(nextStatuses);
      resultText = "Veneno eliminado";
    }

    const itemName = isAntidote ? "Antídoto" : (potion?.name || "Consumible");
    playerRef.current = updatedPlayer;
    setPlayer(updatedPlayer);
    commitCombatResult(
      { type: "OBJETO", enemyDamage: 0, playerDamage: 0, item: id, itemName, resultText },
      620,
      { beforePlayer: actingPlayer, afterPlayer: updatedPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: 0, hpDamage: 0 } },
    );
    pushLog(`Usas ${itemName}. ${resultText}.`);
    toast(`${itemName}: ${resultText}`, "heal");
    triggerEnemyTurn(enemy, updatedPlayer, 720);
  };

  return {
    handleAttack,
    handleSkill,
    useCombatConsumable,
    triggerEnemyTurn,
    tickPlayerStatusTurn,
  };
}

export default createAtlasCombatActions;
