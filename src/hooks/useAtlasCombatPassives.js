import { useRef, useState } from "react";
import { CLASS_DMG_TYPE } from "@/lib/atlasSkillDesign";
import { rollDie } from "@/lib/atlasEngine";
import { primaryStatusForSkillName } from "@/lib/atlasSkillStatusHints";
import {
  ATLAS_STATUSES,
  applyAtlasStatus,
  atlasStatusAtkMod,
  atlasStatusDefMod,
} from "@/lib/atlasStatusAtlas";

// Aísla pasivas, modificadores y estados de combate. Este módulo no controla
// turnos ni animaciones: solo transforma instantáneas de jugador/enemigo.
export default function useAtlasCombatPassives({
  player,
  enemy,
  skills,
  playerRef,
  setPlayer,
  pushLog,
}) {
  const combatRef = useRef({
    turn: 0,
    physStacks: 0,
    firstCritUsed: false,
    sigilUsed: false,
    playerStatuses: {},
  });
  const [playerStatuses, setPlayerStatuses] = useState({});

  const racePassiveName = skills?.racePassive?.name;
  const classPassiveName = skills?.classPassive?.name;
  const className = player?.class;
  const isMage = className === "Mago";
  const racePassiveActive = !!skills?.racePassive && (player?.level || 0) >= skills.racePassive.unlock;
  const classPassiveActive = !!skills?.classPassive && (player?.level || 0) >= skills.classPassive.unlock;

  const addEnergy = (amount) => {
    const current = playerRef.current;
    if (!current || amount <= 0) return 0;
    const maxMp = Number(current.maxMp || 0);
    const before = Number(current.mp || 0);
    const after = Math.min(maxMp, before + amount);
    const gained = Math.max(0, after - before);
    if (gained > 0) {
      const updated = { ...current, mp: after };
      playerRef.current = updated;
      setPlayer(updated);
    }
    return gained;
  };

  const turnStart = () => {
    const runtime = combatRef.current;
    runtime.turn += 1;
    const current = playerRef.current;
    if (racePassiveActive && racePassiveName === "Determinación" && current && current.hp <= current.maxHp * 0.3) addEnergy(2);
    if (racePassiveActive && racePassiveName === "Sabiduría Arcana" && runtime.turn % 3 === 0) addEnergy(2);
  };

  const modifyIncoming = (damage) => {
    if (damage <= 0) return { dmg: 0, log: null, dodged: false };
    if (racePassiveActive && racePassiveName === "Agilidad Natural" && Math.random() < 0.15) {
      const gained = addEnergy(1);
      return {
        dmg: 0,
        log: gained > 0 ? "¡Esquiva élfica! +1 adrenalina" : "¡Esquiva élfica!",
        dodged: true,
      };
    }

    let adjusted = damage;
    const current = playerRef.current;
    let log = null;
    if (racePassiveActive && racePassiveName === "Piel de Acero") adjusted *= 0.9;
    if (racePassiveActive && racePassiveName === "Determinación" && current && current.hp <= current.maxHp * 0.3) adjusted *= 0.8;
    if (
      racePassiveActive
      && racePassiveName === "Instinto de Supervivencia"
      && !combatRef.current.firstCritUsed
      && current
      && (current.hp - damage) > 0
      && (current.hp - damage) <= current.maxHp * 0.3
    ) {
      combatRef.current.firstCritUsed = true;
      adjusted *= 0.5;
      const gained = addEnergy(2);
      log = gained > 0
        ? "Instinto de Supervivencia: daño reducido, +2 concentración"
        : "Instinto de Supervivencia: daño reducido";
    }
    return { dmg: Math.max(0, Math.round(adjusted)), log, dodged: false };
  };

  const modifyOutgoing = (damage) => {
    if (damage <= 0) return 0;
    let adjusted = damage;
    const runtime = combatRef.current;
    if (classPassiveActive && classPassiveName === "Espíritu de Batalla") adjusted *= 1 + 0.05 * runtime.physStacks;
    if (classPassiveActive && classPassiveName === "Oportunista" && enemy && enemy.hp <= enemy.maxHp * 0.4) adjusted *= 1.15;
    if (racePassiveActive && racePassiveName === "Maestro del Sigilo" && !runtime.sigilUsed) {
      adjusted *= 1.25;
      runtime.sigilUsed = true;
    }
    return Math.round(adjusted);
  };

  const onKillEnergy = () => {
    let gain = 0;
    const runtime = combatRef.current;
    if (classPassiveActive && classPassiveName === "Espíritu de Batalla") {
      if (runtime.physStacks < 3) runtime.physStacks += 1;
      gain += 3;
    }
    if (racePassiveActive && racePassiveName === "Conexión Elemental" && isMage) gain += 1;
    if (gain > 0) {
      const real = addEnergy(gain);
      if (real > 0) pushLog(`Pasiva: recuperas ${real} de energía.`);
    }
  };

  const maybeChannel = (playerSnapshot) => {
    if (classPassiveName !== "Canalización" || !isMage || !classPassiveActive) return 0;
    const roll = rollDie(20);
    if (roll < 12) return 0;
    const requested = 1 + Math.floor((roll - 12) / 4);
    const before = Number(playerSnapshot?.mp || 0);
    const maxMp = Number(playerSnapshot?.maxMp || 0);
    const recovered = Math.max(0, Math.min(maxMp, before + requested) - before);
    if (recovered > 0) pushLog(`Canalización: recuperas ${recovered} de magia.`);
    return recovered;
  };

  const classDamageType = () => CLASS_DMG_TYPE[className] || "fisico";
  const enemyDefForClass = (target) => {
    if (!target) return 0;
    const base = classDamageType() === "magico"
      ? (target.magicalDefense ?? target.defense ?? 0)
      : (target.physicalDefense ?? target.defense ?? 0);
    return Math.max(0, base + atlasStatusDefMod(target.statuses));
  };
  const playerDefVsType = (target, type) => type === "magico"
    ? (target?.magicalDefense ?? target?.defense ?? 0)
    : (target?.physicalDefense ?? target?.defense ?? 0);
  const enemyAtkVsType = (target, type) => {
    const base = type === "magico"
      ? (target?.magicalAttack ?? target?.attack ?? 0)
      : (target?.physicalAttack ?? target?.attack ?? 0);
    return Math.max(0, base + atlasStatusAtkMod(target?.statuses));
  };

  const applyStatusToEnemy = (target, statusId, qualityId, amount = 1) => {
    if (!target || !statusId || !ATLAS_STATUSES[statusId]) return target;
    const nextStatuses = applyAtlasStatus(target.statuses || {}, statusId, qualityId, amount);
    const applied = nextStatuses[statusId];
    if (applied) {
      pushLog(`${ATLAS_STATUSES[statusId].icon} ${ATLAS_STATUSES[statusId].name}: ${applied.duration} turno${applied.duration === 1 ? "" : "s"}.`);
    }
    return { ...target, statuses: nextStatuses };
  };

  const statusForSkillName = (name) => primaryStatusForSkillName(name) || "debilitado";

  const roguePierce = (quality, isCrit) => {
    if (className !== "Pícaro" || !classPassiveActive) return 0;
    if (isCrit || quality?.id === "critico") return Infinity;
    if (quality?.id === "alto") return 3;
    if (quality?.id === "medio") return 2;
    if (quality?.id === "bajo") return 1;
    return 0;
  };
  const applyPierce = (effectiveDefense, quality, isCrit) => {
    const pierce = roguePierce(quality, isCrit);
    if (!Number.isFinite(pierce)) return 0;
    return Math.max(0, effectiveDefense - pierce);
  };
  const roguePhysAtkReduce = () => (className === "Pícaro" && classPassiveActive ? 1 : 0);
  const withEnemyAtkBonus = (target, bonus) => bonus ? {
    ...target,
    attack: (target.attack || 0) + bonus,
    physicalAttack: (target.physicalAttack ?? target.attack ?? 0) + bonus,
    magicalAttack: (target.magicalAttack ?? 0) + bonus,
  } : target;

  return {
    combatRef,
    playerStatuses,
    setPlayerStatuses,
    turnStart,
    modifyIncoming,
    modifyOutgoing,
    onKillEnergy,
    maybeChannel,
    enemyDefForClass,
    playerDefVsType,
    enemyAtkVsType,
    applyStatusToEnemy,
    statusForSkillName,
    applyPierce,
    roguePhysAtkReduce,
    withEnemyAtkBonus,
  };
}
