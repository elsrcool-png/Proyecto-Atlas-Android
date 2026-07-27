// PROYECTO ATLAS — Motor de audio ligero para navegador y móvil.
// Mantiene música, ambiente y efectos separados, con crossfade y desbloqueo
// tras el primer gesto del usuario para cumplir las reglas de autoplay.

const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

class AtlasAudioEngine {
  constructor() {
    this.unlocked = false;
    this.enabled = true;
    this.settings = { masterVolume: 0.8, musicVolume: 0.55, ambienceVolume: 0.45, sfxVolume: 0.8 };
    this.music = null;
    this.ambience = null;
    this.desiredMusic = null;
    this.desiredAmbience = null;
    this.musicFade = null;
    this.ambienceFade = null;
    this.sfx = new Set();
  }

  configure(settings = {}) {
    this.enabled = settings.audioEnabled !== false;
    this.settings = {
      masterVolume: clamp01(settings.masterVolume ?? 0.8),
      musicVolume: clamp01(settings.musicVolume ?? 0.55),
      ambienceVolume: clamp01(settings.ambienceVolume ?? 0.45),
      sfxVolume: clamp01(settings.sfxVolume ?? 0.8),
    };
    if (!this.enabled) {
      this.pauseChannel(this.music);
      this.pauseChannel(this.ambience);
      for (const a of this.sfx) { try { a.pause(); } catch {} }
      this.sfx.clear();
      return;
    }
    this.applyVolumes();
    if (this.unlocked) {
      if (this.desiredMusic) this.playMusic(this.desiredMusic);
      if (this.desiredAmbience) this.playAmbience(this.desiredAmbience);
    }
  }

  async unlock() {
    if (this.unlocked || typeof Audio === "undefined") return this.unlocked;
    this.unlocked = true;
    if (!this.enabled) return true;
    try {
      const a = new Audio();
      a.volume = 0;
      a.muted = true;
      const p = a.play();
      if (p?.catch) await p.catch(() => {});
      a.pause();
    } catch {}
    if (this.desiredMusic) this.playMusic(this.desiredMusic);
    if (this.desiredAmbience) this.playAmbience(this.desiredAmbience);
    return true;
  }

  makeAudio(src, loop = false) {
    if (typeof Audio === "undefined") return null;
    const a = new Audio(src);
    a.preload = "auto";
    a.loop = !!loop;
    a.playsInline = true;
    return a;
  }

  channelVolume(kind, gain = 1) {
    const master = this.settings.masterVolume;
    const group = kind === "music" ? this.settings.musicVolume : kind === "ambience" ? this.settings.ambienceVolume : this.settings.sfxVolume;
    return clamp01(master * group * gain);
  }

  applyVolumes() {
    if (this.music?.audio) this.music.audio.volume = this.channelVolume("music", this.music.gain) * (this.music.duck ?? 1);
    if (this.ambience?.audio) this.ambience.audio.volume = this.channelVolume("ambience", this.ambience.gain);
  }

  fade(audio, from, to, duration = 700, onDone) {
    if (!audio) return;
    const nowMs = () => (typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now());
    const schedule = (fn) => (typeof requestAnimationFrame === "function" ? requestAnimationFrame(fn) : setTimeout(fn, 16));
    const started = nowMs();
    const tick = () => {
      const now = nowMs();
      const p = Math.min(1, (now - started) / Math.max(1, duration));
      audio.volume = clamp01(from + (to - from) * p);
      if (p < 1) schedule(tick);
      else onDone?.();
    };
    tick();
  }

  playMusic(def, options = {}) {
    this.desiredMusic = def || null;
    if (!def) return this.stopMusic(options.fadeMs ?? 500);
    if (!this.enabled || !this.unlocked || typeof Audio === "undefined") return;
    if (this.music?.id === def.id) {
      this.music.gain = def.gain ?? 1;
      this.music.audio.volume = this.channelVolume("music", this.music.gain) * (this.music.duck ?? 1);
      if (this.music.audio.paused) this.music.audio.play().catch(() => {});
      return;
    }
    const previous = this.music;
    const audio = this.makeAudio(def.src, def.loop !== false);
    if (!audio) return;
    const target = this.channelVolume("music", def.gain ?? 1);
    audio.volume = 0;
    const next = { id: def.id, audio, gain: def.gain ?? 1, duck: 1 };
    this.music = next;
    try {
      const play = audio.play();
      if (play?.then) play.then(() => this.fade(audio, 0, target, options.fadeMs ?? 900)).catch(() => {});
      else this.fade(audio, 0, target, options.fadeMs ?? 900);
    } catch {}
    if (previous?.audio) {
      const pv = previous.audio.volume;
      this.fade(previous.audio, pv, 0, options.fadeMs ?? 900, () => this.pauseChannel(previous));
    }
  }

  stopMusic(fadeMs = 500) {
    this.desiredMusic = null;
    const current = this.music;
    this.music = null;
    if (!current?.audio) return;
    this.fade(current.audio, current.audio.volume, 0, fadeMs, () => this.pauseChannel(current));
  }

  playAmbience(def, options = {}) {
    this.desiredAmbience = def || null;
    if (!def) return this.stopAmbience(options.fadeMs ?? 450);
    if (!this.enabled || !this.unlocked || typeof Audio === "undefined") return;
    if (this.ambience?.id === def.id) {
      this.ambience.gain = def.gain ?? 1;
      this.ambience.audio.volume = this.channelVolume("ambience", this.ambience.gain);
      if (this.ambience.audio.paused) this.ambience.audio.play().catch(() => {});
      return;
    }
    const previous = this.ambience;
    const audio = this.makeAudio(def.src, def.loop !== false);
    if (!audio) return;
    const target = this.channelVolume("ambience", def.gain ?? 1);
    audio.volume = 0;
    const next = { id: def.id, audio, gain: def.gain ?? 1 };
    this.ambience = next;
    try {
      const play = audio.play();
      if (play?.then) play.then(() => this.fade(audio, 0, target, options.fadeMs ?? 800)).catch(() => {});
      else this.fade(audio, 0, target, options.fadeMs ?? 800);
    } catch {}
    if (previous?.audio) this.fade(previous.audio, previous.audio.volume, 0, options.fadeMs ?? 800, () => this.pauseChannel(previous));
  }

  stopAmbience(fadeMs = 450) {
    this.desiredAmbience = null;
    const current = this.ambience;
    this.ambience = null;
    if (!current?.audio) return;
    this.fade(current.audio, current.audio.volume, 0, fadeMs, () => this.pauseChannel(current));
  }

  duckMusic(factor = 0.25, durationMs = 0) {
    if (!this.music?.audio) return;
    this.music.duck = clamp01(factor);
    this.music.audio.volume = this.channelVolume("music", this.music.gain) * this.music.duck;
    if (durationMs > 0) setTimeout(() => this.restoreMusic(), durationMs);
  }

  restoreMusic() {
    if (!this.music?.audio) return;
    this.music.duck = 1;
    this.fade(this.music.audio, this.music.audio.volume, this.channelVolume("music", this.music.gain), 450);
  }

  playSfx(src, options = {}) {
    if (!src || !this.enabled || !this.unlocked || typeof Audio === "undefined") return null;
    const run = () => {
      const audio = this.makeAudio(src, false);
      if (!audio) return null;
      audio.volume = this.channelVolume("sfx", options.gain ?? 1);
      if (Number.isFinite(options.playbackRate)) audio.playbackRate = options.playbackRate;
      this.sfx.add(audio);
      const clean = () => this.sfx.delete(audio);
      audio.addEventListener("ended", clean, { once: true });
      audio.addEventListener("error", clean, { once: true });
      try { const play = audio.play(); if (play?.catch) play.catch(clean); } catch { clean(); }
      return audio;
    };
    if ((options.delayMs || 0) > 0) {
      const t = setTimeout(run, options.delayMs);
      return { cancel: () => clearTimeout(t) };
    }
    return run();
  }

  pauseChannel(channel) {
    if (!channel?.audio) return;
    try { channel.audio.pause(); channel.audio.currentTime = 0; } catch {}
  }

  stopAll() {
    this.desiredMusic = null;
    this.desiredAmbience = null;
    this.pauseChannel(this.music);
    this.pauseChannel(this.ambience);
    this.music = null;
    this.ambience = null;
    for (const a of this.sfx) { try { a.pause(); } catch {} }
    this.sfx.clear();
  }
}

export const atlasAudioEngine = new AtlasAudioEngine();
