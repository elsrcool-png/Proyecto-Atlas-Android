import { useEffect, useMemo, useRef, useState } from "react";
import { atlasAudioEngine } from "@/lib/atlasAudioEngine";
import {
  ATLAS_MUSIC, ATLAS_SFX, getCombatMusic, getEnemyAudio, getWorldAudio,
  resolveActionSound, resolveEnemyAttackSound,
} from "@/lib/atlasAudioCatalog";
import { resolveAbilityAnimation, weaponTypeFromPlayer } from "@/lib/atlasAbilityAnimations";

function enemyKey(enemy) {
  return enemy ? (enemy.uid || `${enemy.id}:${enemy.level || 0}`) : null;
}

export default function useAtlasAudio({
  mode, player, region, sectorDef, enemy, lastResult, diceAnim, settings, skills,
}) {
  const [combatIntro, setCombatIntro] = useState(null);
  const timersRef = useRef([]);
  const resultTimersRef = useRef([]);
  const previousEnemyRef = useRef(null);
  const lastResultRef = useRef(null);
  const lastDiceRef = useRef(null);
  const introEnemyKeyRef = useRef(null);

  const worldAudio = useMemo(
    () => getWorldAudio(region?.id, sectorDef?.type),
    [region?.id, sectorDef?.type],
  );

  const clearTimers = () => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  };
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };
  const clearResultTimers = () => {
    for (const t of resultTimersRef.current) clearTimeout(t);
    resultTimersRef.current = [];
  };
  const resultLater = (fn, ms = 0) => {
    const t = setTimeout(fn, Math.max(0, Number(ms) || 0));
    resultTimersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    atlasAudioEngine.configure(settings);
  }, [settings?.audioEnabled, settings?.masterVolume, settings?.musicVolume, settings?.ambienceVolume, settings?.sfxVolume]);

  // Desbloquea Audio tras el primer gesto real del jugador.
  useEffect(() => {
    const unlock = () => atlasAudioEngine.unlock();
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Música del menú y exploración. El combate controla su propia transición.
  useEffect(() => {
    if (!player || mode == null) {
      atlasAudioEngine.playMusic(ATLAS_MUSIC.menu, { fadeMs: 900 });
      atlasAudioEngine.stopAmbience(400);
      return;
    }
    if (enemy || previousEnemyRef.current) return;
    atlasAudioEngine.playMusic(worldAudio.music, { fadeMs: 1000 });
    atlasAudioEngine.playAmbience(worldAudio.ambience, { fadeMs: 900 });
  }, [mode, !!player, region?.id, sectorDef?.type, !!enemy, worldAudio.music?.id, worldAudio.ambience?.id]);

  // Entrada de combate: transición, voz/ruido del enemigo y música regional.
  useEffect(() => {
    const currentKey = enemyKey(enemy);
    const previous = previousEnemyRef.current;
    const previousKey = enemyKey(previous);

    if (settings?.audioEnabled === false) {
      clearTimers();
      setCombatIntro(null);
      introEnemyKeyRef.current = currentKey;
      previousEnemyRef.current = enemy;
      return;
    }

    if (enemy && currentKey !== previousKey && currentKey !== introEnemyKeyRef.current) {
      clearTimers();
      introEnemyKeyRef.current = currentKey;
      const profile = getEnemyAudio(enemy) || {};
      const introMs = profile.introMs || (enemy.boss ? 3800 : enemy.elite ? 2200 : 1150);
      const musicDelayMs = profile.musicDelayMs ?? Math.max(650, introMs - 420);
      setCombatIntro({
        key: currentKey,
        name: enemy.name,
        label: profile.label || (enemy.boss ? "JEFE" : "ENCUENTRO"),
        title: profile.title || (enemy.elite ? "Una presencia superior entra en escena" : null),
        boss: !!enemy.boss,
        elite: !!enemy.elite,
        durationMs: introMs,
      });
      atlasAudioEngine.duckMusic(0.12);
      atlasAudioEngine.stopAmbience(450);
      atlasAudioEngine.playSfx(ATLAS_SFX.combatStart, { gain: enemy.boss ? 1 : 0.82 });
      if (profile.intro) atlasAudioEngine.playSfx(profile.intro, { delayMs: enemy.boss ? 180 : 130, gain: enemy.boss ? 1 : 0.9 });
      if (profile.eliteStinger) atlasAudioEngine.playSfx(profile.eliteStinger, { delayMs: 760, gain: 0.9 });
      later(() => atlasAudioEngine.playMusic(getCombatMusic(region?.id, enemy), { fadeMs: enemy.boss ? 1100 : 650 }), musicDelayMs);
      later(() => setCombatIntro(null), introMs);
    }

    if (!enemy && previous) {
      clearTimers();
      setCombatIntro(null);
      introEnemyKeyRef.current = null;
      const defeated = !!previous.dying || Number(previous.hp || 0) <= 0;
      if (defeated && region?.id === "verde") {
        atlasAudioEngine.playSfx(ATLAS_SFX.greenVictory, { gain: previous.boss ? 1 : 0.72 });
        later(() => {
          atlasAudioEngine.playMusic(worldAudio.music, { fadeMs: 1200 });
          atlasAudioEngine.playAmbience(worldAudio.ambience, { fadeMs: 1000 });
        }, previous.boss ? 2600 : 1100);
      } else {
        atlasAudioEngine.playMusic(worldAudio.music, { fadeMs: 800 });
        atlasAudioEngine.playAmbience(worldAudio.ambience, { fadeMs: 700 });
      }
    }

    previousEnemyRef.current = enemy;
  }, [enemyKey(enemy), !!enemy?.dying, region?.id, worldAudio.music?.id, worldAudio.ambience?.id, settings?.audioEnabled]);

  // Muerte: sonido propio de jefe o caída genérica.
  useEffect(() => {
    if (!enemy?.dying) return;
    const profile = getEnemyAudio(enemy);
    atlasAudioEngine.duckMusic(enemy.boss ? 0.22 : 0.55);
    atlasAudioEngine.playSfx(profile?.death || ATLAS_SFX.enemyDeath, { gain: enemy.boss ? 1 : 0.8 });
  }, [enemy?.dying]);

  // Dados: rodar y asentarse.
  useEffect(() => {
    if (!diceAnim || diceAnim === lastDiceRef.current) return;
    lastDiceRef.current = diceAnim;
    atlasAudioEngine.playSfx(ATLAS_SFX.diceRoll, { gain: diceAnim.isEnemy ? 0.72 : 0.82 });
    atlasAudioEngine.playSfx(ATLAS_SFX.diceSettle, { delayMs: 1030, gain: 0.75 });
  }, [diceAnim]);

  // Sonido sincronizado con el director temporal de combate.
  // En v2.19 la secuencia visual es el reloj maestro: cada impacto visible
  // recibe su propio sonido, incluidos los ataques múltiples.
  useEffect(() => {
    if (!lastResult?.actionId || lastResult.actionId === lastResultRef.current || !enemy) return;
    lastResultRef.current = lastResult.actionId;
    clearResultTimers();

    const type = lastResult.type || "";
    const enemyResult = type === "ENEMY_ATTACK" || type === "ENEMY_ABILITY";
    const landedDamage = enemyResult
      ? Number(lastResult.playerDamage || 0)
      : Number(lastResult.resolution?.rawDamage ?? lastResult.rawEnemyDamage ?? lastResult.enemyDamage ?? 0);
    const missed = type === "FALLO" || type === "MISS" || type === "FALLO_CRÍTICO" || landedDamage <= 0;
    const sequence = lastResult.animationSequence || null;

    // Los ataques enemigos todavía usan la secuencia compacta del motor base.
    if (enemyResult) {
      if (missed) {
        resultLater(() => atlasAudioEngine.playSfx(ATLAS_SFX.miss, { gain: 0.75 }), 230);
        return clearResultTimers;
      }
      const impactAt = 250;
      atlasAudioEngine.playSfx(resolveEnemyAttackSound(enemy), { gain: 0.78 });
      resultLater(() => atlasAudioEngine.playSfx(lastResult.vfxType === "impact" ? ATLAS_SFX.impactHeavy : ATLAS_SFX.impact, { gain: 0.82 }), impactAt);
      if (lastResult.crit || /CRÍTIC/.test(type)) {
        resultLater(() => atlasAudioEngine.playSfx(ATLAS_SFX.critical, { gain: 0.92 }), impactAt + 35);
      }
      return clearResultTimers;
    }

    const skill = lastResult.skill ? skills?.[lastResult.skill] : skills?.basic;
    const animation = sequence?.animation || resolveAbilityAnimation(skill || { name: "Espadazo" }, {
      class: player?.class,
      weaponType: weaponTypeFromPlayer(player),
      element: lastResult.element,
    });

    if (missed) {
      const missAt = sequence?.events?.find(event => event.type === "MISS_REACTION")?.at ?? 300;
      resultLater(() => atlasAudioEngine.playSfx(ATLAS_SFX.miss, { gain: 0.76 }), missAt);
      const counterAt = sequence?.events?.find(event => event.type === "COUNTER_HIT")?.at;
      if (Number.isFinite(counterAt)) {
        resultLater(() => atlasAudioEngine.playSfx(resolveEnemyAttackSound(enemy), { gain: 0.78 }), Math.max(0, counterAt - 110));
        resultLater(() => atlasAudioEngine.playSfx(ATLAS_SFX.impactHeavy, { gain: 0.84 }), counterAt);
      }
      return clearResultTimers;
    }

    const hits = Array.isArray(sequence?.hits) && sequence.hits.length
      ? sequence.hits
      : [{ at: Math.max(170, Math.min(420, Math.round((animation?.duration || 360) * 0.48))), crit: !!lastResult.crit, final: true }];
    const actionSound = resolveActionSound(animation, player?.class);
    const magical = animation?.weaponType === "staff" || animation?.dungeonType === "magic" || animation?.dungeonType === "projectile" || player?.class === "Mago";

    if (magical) {
      atlasAudioEngine.playSfx(actionSound, { gain: 0.86 });
    }

    hits.forEach((hit, index) => {
      const hitAt = Number(hit.at || 0);
      if (!magical) {
        resultLater(() => atlasAudioEngine.playSfx(actionSound, {
          gain: index === hits.length - 1 ? 0.9 : 0.78,
          playbackRate: Math.min(1.12, 0.96 + index * 0.025),
        }), Math.max(0, hitAt - 90));
      }
      resultLater(() => atlasAudioEngine.playSfx(animation?.impactType === "blunt" ? ATLAS_SFX.impactHeavy : ATLAS_SFX.impact, {
        gain: hit.final ? 0.9 : 0.72,
        playbackRate: Math.min(1.1, 0.97 + index * 0.02),
      }), hitAt);
      if (hit.crit || (hit.final && (lastResult.crit || /CRÍTIC/.test(type)))) {
        resultLater(() => atlasAudioEngine.playSfx(ATLAS_SFX.critical, { gain: 0.94 }), hitAt + 28);
      }
    });

    return clearResultTimers;
  }, [lastResult?.actionId, enemyKey(enemy), player?.class]);

  useEffect(() => () => {
    clearTimers();
    clearResultTimers();
    atlasAudioEngine.stopAll();
  }, []);

  return {
    combatIntro,
    combatIntroActive: !!combatIntro,
    playUiConfirm: () => atlasAudioEngine.playSfx(ATLAS_SFX.uiConfirm, { gain: 0.65 }),
    playPortal: () => atlasAudioEngine.playSfx(ATLAS_SFX.portalActivate, { gain: 0.9 }),
  };
}
