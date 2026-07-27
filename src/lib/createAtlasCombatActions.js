import { resolveCombatTurn } from "@/lib/atlasEngine";
import { resolveAttack } from "@/lib/atlasDamageSystem";
import { randInt } from "@/lib/atlasWorld";
import { tickPlayerStatuses } from "@/lib/atlasEnemyAI";
import { rollDiceGroup, resolveQuality, upgradeQuality, QUALITY } from "@/lib/atlasDiceSystem";
import { buildCombatSequence, combatSequenceDelay } from "@/lib/atlasCombatDirector";
import { resolveShieldedDamage } from "@/lib/atlasCombatTransactions";

const CLASS_ELEMENT = { Guerrero: "fisico", Mago: "arcano", "Pícaro": "sombra" };

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
      return { canAct: false, died: true, damage: sr.damage, playerBeforeTick, playerAfterTick };
    }

    return { canAct: sr.canAct, died: false, damage: sr.damage, playerBeforeTick, playerAfterTick };
  };
  const triggerEnemyTurn = (updatedEnemy, playerSnapshot, delayMs = 400) => {
    if (!updatedEnemy || updatedEnemy.hp <= 0 || updatedEnemy.dying) return;
    scheduleEnemyTurn(() => {
      const curPlayer = playerSnapshot || { ...playerRef.current };
      enemyTurn(updatedEnemy, curPlayer);
    }, delayMs);
  };

  const handleAttack = () => {
    if (!enemy || diceAnim || combatAnimating) return;
    damageWeapon(1);
    turnStart();
    const statusResult = tickPlayerStatusTurn();
    if (statusResult.died) return;
    const actingPlayer = statusResult.playerAfterTick;
    if (!statusResult.canAct) {
      triggerEnemyTurn(enemy, actingPlayer, 400);
      return;
    }
    const dr = rollDiceGroup("basico");
    const roll = dr.total;
    showDice(dr, skills?.basic?.name || "Ataque", () => {
      const bType = enemy.basicAttackType || "fisico";
      const eAtkForThreshold = enemyAtkVsType(enemy, bType);
      let quality = resolveQuality(dr);
      // Crítico de equipo: sube un tier de calidad (mismo cálculo de daño, no +3 plano).
      if (quality.id !== "fallo_critico" && quality.id !== "critico" && (actingPlayer.crit || 0) > 0 && Math.random() < (actingPlayer.crit || 0)) {
        quality = QUALITY[upgradeQuality(quality.id)];
      }
      const isCrit = quality.id === "critico";
      const effDef = applyPierce(enemyDefForClass(enemy), quality, isCrit);
      const routedEnemy = { ...enemy, attack: eAtkForThreshold, defense: effDef };
      const routedPlayer = { ...actingPlayer, defense: playerDefVsType(actingPlayer, bType) };
      const res = resolveCombatTurn(routedPlayer, routedEnemy, quality);
      if (res.counter) {
        // Fallo crítico: 0 daño al enemigo + contraataque. Sustituye al turno enemigo.
        const afterPlayer = { ...actingPlayer, hp: Math.max(0, actingPlayer.hp - res.playerDamage) };
        const animationSequence = buildCombatSequence({
          skill: skills?.basic, className: actingPlayer.class, diceGroup: "basico", rollTotal: roll,
          qualityId: quality.id, totalDamage: 0, playerDamage: res.playerDamage, counter: true, kind: "basic",
        });
        commitCombatResult(
          { type: "FALLO_CRÍTICO", enemyDamage: 0, playerDamage: res.playerDamage, counter: true, rollTotal: roll, diceGroup: "basico", qualityId: quality.id, animationSequence },
          null,
          { beforePlayer: actingPlayer, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: res.playerDamage, hpDamage: res.playerDamage } },
        );
        pushLog(`Fallo crítico (d20 ${roll}). ¡Contraataque! Recibes ${res.playerDamage} daño.`);
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
    damageWeapon(2);
    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    const actingPlayer = stChk.playerAfterTick;
    if (!stChk.canAct) { triggerEnemyTurn(enemy, actingPlayer); return; }
    const dr = rollDiceGroup(wa.diceGroup || "versatil");
    const roll = dr.total;
    showDice(dr, `${wa.name}`, () => {
      const eff = wa.effect || {};
      const ignoreFrac = typeof eff.ignoreDef === "number" ? eff.ignoreDef : (eff.ignoreDef === "highroll" ? (roll >= 14 ? 0.6 : 0.2) : 0);
      let qId = resolveQuality(dr).id;
      if (qId !== "fallo_critico") {
        if (eff.crit === "always") qId = "critico";
        else if (eff.crit === "highroll" && roll >= 14) qId = "critico";
        else if (qId !== "critico" && (actingPlayer.crit || 0) > 0 && Math.random() < (actingPlayer.crit || 0)) qId = upgradeQuality(qId);
      }
      const quality = QUALITY[qId];
      const isCrit = qId === "critico";
      const effDef = applyPierce(Math.round(enemyDefForClass(enemy) * (1 - ignoreFrac)), quality, isCrit);
      const res = resolveAttack({
        qualityId: qId,
        atk: Math.max(0, Math.round(actingPlayer.attack * (eff.power || 1))),
        def: effDef,
        opponentAtk: enemyAtkVsType(enemy, "fisico"),
        opponentDef: playerDefVsType(actingPlayer, "fisico"),
      });
      const newMp = Math.max(0, (actingPlayer.mp || 0) - wa.cost);
      if (res.isFalloCritico) {
        const afterPlayer = { ...actingPlayer, mp: newMp, hp: Math.max(0, actingPlayer.hp - res.counter.damage) };
        const animationSequence = buildCombatSequence({
          skill: wa, className: actingPlayer.class, diceGroup: wa.diceGroup || "versatil", rollTotal: roll,
          qualityId: qId, totalDamage: 0, playerDamage: res.counter.damage, counter: true, kind: "weapon",
        });
        commitCombatResult(
          { type: "FALLO_CRÍTICO", enemyDamage: 0, playerDamage: res.counter.damage, counter: true, skill: "weapon", rollTotal: roll, diceGroup: wa.diceGroup || "versatil", qualityId: qId, animationSequence },
          null,
          { beforePlayer: actingPlayer, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: res.counter.damage, hpDamage: res.counter.damage } },
        );
        pushLog(`${wa.name}: fallo crítico (d20 ${roll}). ¡Contraataque! Recibes ${res.counter.damage} daño. ${actingPlayer.energyName || "MP"} -${wa.cost}.`);
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
          statusId, rollTotal: roll, diceGroup: wa.diceGroup || "versatil", qualityId: qId, animationSequence,
        },
        null,
        { beforePlayer: actingPlayer, afterPlayer: updatedPlayer, beforeEnemy: enemy, afterEnemy: updatedEnemy, resolution: damageResolution },
      );
      pushLog(`${wa.name}: infliges ${rawDamage} daño${isCrit ? " (¡crítico, ignora DEF!)" : ""}. ${actingPlayer.energyName || "MP"} -${wa.cost}.`);
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
    damageWeapon(2);
    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    const actingPlayer = stChk.playerAfterTick;
    if (!stChk.canAct) { triggerEnemyTurn(enemy, actingPlayer); return; }
    const dr = rollDiceGroup("versatil");
    const roll = dr.total;
    showDice(dr, `${da.name}`, () => {
      let qId = resolveQuality(dr).id;
      if (qId !== "fallo_critico" && qId !== "critico" && (actingPlayer.crit || 0) > 0 && Math.random() < (actingPlayer.crit || 0)) qId = upgradeQuality(qId);
      const quality = QUALITY[qId];
      const isCrit = qId === "critico";
      const effDef = applyPierce(enemyDefForClass(enemy), quality, isCrit);
      const res = resolveAttack({
        qualityId: qId,
        atk: Math.max(0, Math.round(actingPlayer.attack * 1.2)),
        def: effDef,
        opponentAtk: enemyAtkVsType(enemy, "fisico"),
        opponentDef: playerDefVsType(actingPlayer, "fisico"),
      });
      const newMp = Math.max(0, (actingPlayer.mp || 0) - da.cost);
      if (res.isFalloCritico) {
        const afterPlayer = { ...actingPlayer, mp: newMp, hp: Math.max(0, actingPlayer.hp - res.counter.damage) };
        const animationSequence = buildCombatSequence({
          skill: da, className: actingPlayer.class, element: CLASS_ELEMENT[actingPlayer.class], diceGroup: "versatil", rollTotal: roll,
          qualityId: qId, totalDamage: 0, playerDamage: res.counter.damage, counter: true, kind: "definitive",
        });
        commitCombatResult(
          { type: "FALLO_CRÍTICO", enemyDamage: 0, playerDamage: res.counter.damage, counter: true, skill: "definitive", element: CLASS_ELEMENT[actingPlayer.class], rollTotal: roll, diceGroup: "versatil", qualityId: qId, animationSequence },
          null,
          { beforePlayer: actingPlayer, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: res.counter.damage, hpDamage: res.counter.damage } },
        );
        pushLog(`${da.name} (DEFINITIVA): fallo crítico (d20 ${roll}). ¡Contraataque! Recibes ${res.counter.damage} daño. ${actingPlayer.energyName || "MP"} -${da.cost}.`);
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
          statusId, rollTotal: roll, diceGroup: "versatil", qualityId: qId, animationSequence,
        },
        null,
        { beforePlayer: actingPlayer, afterPlayer: updatedPlayer, beforeEnemy: enemy, afterEnemy: updatedEnemy, resolution: damageResolution },
      );
      pushLog(`${da.name} (DEFINITIVA)${isCrit ? " · CRÍTICO (ignora DEF)" : ""}: infliges ${rawDamage} daño y alteras el combate. ${actingPlayer.energyName || "MP"} -${da.cost}.`);
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
    damageWeapon(1);
    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    const actingPlayer = stChk.playerAfterTick;
    if (!stChk.canAct) { triggerEnemyTurn(enemy, actingPlayer); return; }
    const groupId = key === "classAbility" ? "tecnica" : key === "hybrid" ? "fuerza" : "basico";
    const dr = rollDiceGroup(groupId);
    const roll = dr.total;
    showDice(dr, `${skills[key].name}`, () => {
      const name = skills[key].name;
      const ignoreFrac = /Estocada Sombría/.test(name) ? 0.3 : /Revienta Escudos/.test(name) ? 0.75 : /Bomba de Humo/.test(name) ? 0.5 : 0;
      let qId = resolveQuality(dr).id;
      if (qId !== "fallo_critico") {
        if (/Castigo Nocturno/.test(name) && roll >= 14) qId = "critico";
        else if (/Revienta Escudos|Bomba de Humo/.test(name) && roll >= 16) qId = "critico";
        else if (qId !== "critico" && (actingPlayer.crit || 0) > 0 && Math.random() < (actingPlayer.crit || 0)) qId = upgradeQuality(qId);
      }
      const quality = QUALITY[qId];
      const isCrit = qId === "critico";
      const effDef = applyPierce(Math.round(enemyDefForClass(enemy) * (1 - ignoreFrac)), quality, isCrit);
      const res = resolveAttack({
        qualityId: qId,
        atk: actingPlayer.attack,
        def: effDef,
        opponentAtk: enemyAtkVsType(enemy, "fisico"),
        opponentDef: playerDefVsType(actingPlayer, "fisico"),
      });
      const newMp = Math.max(0, (actingPlayer.mp || 0) - cost);
      if (res.isFalloCritico) {
        const afterPlayer = { ...actingPlayer, mp: newMp, hp: Math.max(0, actingPlayer.hp - res.counter.damage) };
        const animationSequence = buildCombatSequence({
          skill: skills[key], className: actingPlayer.class, element: CLASS_ELEMENT[actingPlayer.class], diceGroup: groupId, rollTotal: roll,
          qualityId: qId, totalDamage: 0, playerDamage: res.counter.damage, counter: true, kind: key,
        });
        commitCombatResult(
          { type: "FALLO_CRÍTICO", enemyDamage: 0, playerDamage: res.counter.damage, counter: true, skill: key, element: CLASS_ELEMENT[actingPlayer.class], rollTotal: roll, diceGroup: groupId, qualityId: qId, animationSequence },
          null,
          { beforePlayer: actingPlayer, afterPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: res.counter.damage, hpDamage: res.counter.damage } },
        );
        pushLog(`${name}: fallo crítico (d20 ${roll}). ¡Contraataque! Recibes ${res.counter.damage} daño. ${actingPlayer.energyName || "MP"} -${cost}.`);
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
          diceGroup: groupId, qualityId: qId, animationSequence,
        },
        null,
        { beforePlayer: actingPlayer, afterPlayer: updatedPlayer, beforeEnemy: enemy, afterEnemy: updatedEnemy, resolution: damageResolution },
      );
      pushLog(`${name} (${type}): infliges ${rawDamage} daño${isCrit ? " (ignora DEF)" : ""}. ${actingPlayer.energyName || "MP"} -${cost}.`);
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

  const usePotion = () => {
    if (!enemy || enemy.dying || diceAnim || combatAnimating) return;
    if ((player.potions || 0) <= 0) return;
    turnStart();
    const stChk = tickPlayerStatusTurn();
    if (stChk.died) return;
    const actingPlayer = stChk.playerAfterTick;
    if (!stChk.canAct) { triggerEnemyTurn(enemy, actingPlayer); return; }
    const healedHp = Math.min(actingPlayer.maxHp, actingPlayer.hp + 6);
    const healAmount = Math.max(0, healedHp - actingPlayer.hp);
    const updatedPlayer = { ...actingPlayer, hp: healedHp, potions: actingPlayer.potions - 1 };
    playerRef.current = updatedPlayer;
    setPlayer(updatedPlayer);
    commitCombatResult(
      { type: "OBJETO", enemyDamage: 0, playerDamage: 0, item: "potion", healAmount },
      620,
      { beforePlayer: actingPlayer, afterPlayer: updatedPlayer, beforeEnemy: enemy, afterEnemy: enemy, resolution: { rawDamage: 0, hpDamage: 0 } },
    );
    pushLog(`Usas una poción. HP +${healAmount} (quedan ${updatedPlayer.potions}).`);
    toast(`Poción: +${healAmount} HP`, "heal");
    triggerEnemyTurn(enemy, updatedPlayer, 720);
  };

  return {
    handleAttack,
    handleSkill,
    usePotion,
    triggerEnemyTurn,
    tickPlayerStatusTurn,
  };
}

export default createAtlasCombatActions;
