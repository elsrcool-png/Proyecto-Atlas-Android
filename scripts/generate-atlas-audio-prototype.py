#!/usr/bin/env python3
"""Genera el paquete de audio prototipo original de Atlas v2.18.

No utiliza muestras externas. Música y efectos se sintetizan de forma determinista
con NumPy/SciPy y se codifican a OGG mediante ffmpeg.
"""
from __future__ import annotations

import json
import math
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44_100
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "audio"
RNG = np.random.default_rng(20260727)


def ensure_dirs() -> None:
    for rel in [
        "music/menu", "music/green", "music/combat", "music/bosses", "music/stingers",
        "ambience/green", "sfx/combat", "sfx/dice", "sfx/ui", "sfx/world",
        "enemies/green",
    ]:
        (OUT / rel).mkdir(parents=True, exist_ok=True)


def env(n: int, attack: float = 0.02, release: float = 0.12) -> np.ndarray:
    e = np.ones(n, dtype=np.float32)
    a = min(n, max(1, int(attack * SR)))
    r = min(n, max(1, int(release * SR)))
    e[:a] = np.linspace(0, 1, a, dtype=np.float32)
    e[-r:] *= np.linspace(1, 0, r, dtype=np.float32)
    return e


def osc(freq: float, dur: float, kind: str = "sine", phase: float = 0.0) -> np.ndarray:
    n = max(1, int(dur * SR))
    t = np.arange(n, dtype=np.float32) / SR
    x = 2 * np.pi * freq * t + phase
    if kind == "sine":
        y = np.sin(x)
    elif kind == "triangle":
        y = (2 / np.pi) * np.arcsin(np.sin(x))
    elif kind == "softsaw":
        y = np.sin(x) + 0.35 * np.sin(2*x) + 0.16 * np.sin(3*x)
        y /= 1.51
    elif kind == "square":
        y = np.tanh(2.2 * np.sin(x))
    else:
        y = np.sin(x)
    return y.astype(np.float32)


def stereo(sig: np.ndarray, pan: float = 0.0) -> np.ndarray:
    pan = float(np.clip(pan, -1, 1))
    left = math.sqrt((1 - pan) / 2)
    right = math.sqrt((1 + pan) / 2)
    return np.column_stack((sig * left, sig * right)).astype(np.float32)


def empty(dur: float) -> np.ndarray:
    return np.zeros((int(dur * SR), 2), dtype=np.float32)


def add(dst: np.ndarray, sig: np.ndarray, start: float, gain: float = 1.0, pan: float = 0.0) -> None:
    pos = int(start * SR)
    if pos >= len(dst):
        return
    s = stereo(sig, pan) if sig.ndim == 1 else sig
    end = min(len(dst), pos + len(s))
    if end > pos:
        dst[pos:end] += s[:end-pos] * gain


def note(dst: np.ndarray, start: float, dur: float, freq: float, gain: float,
         kind: str = "sine", pan: float = 0.0, attack: float = 0.02, release: float = 0.14,
         vibrato: float = 0.0) -> None:
    n = max(1, int(dur * SR))
    if vibrato:
        t = np.arange(n, dtype=np.float32) / SR
        phase = 2*np.pi*freq*t + vibrato*np.sin(2*np.pi*5*t)
        sig = np.sin(phase).astype(np.float32)
    else:
        sig = osc(freq, dur, kind)
    sig *= env(n, attack, release)
    add(dst, sig, start, gain, pan)


def noise_burst(dur: float, color: str = "white", attack: float = 0.003, release: float = 0.15) -> np.ndarray:
    n = max(1, int(dur * SR))
    x = RNG.normal(0, 1, n).astype(np.float32)
    if color == "low":
        sos = butter(4, 900, btype="lowpass", fs=SR, output="sos")
        x = sosfilt(sos, x).astype(np.float32)
    elif color == "high":
        sos = butter(3, 1800, btype="highpass", fs=SR, output="sos")
        x = sosfilt(sos, x).astype(np.float32)
    elif color == "band":
        sos = butter(3, [450, 2600], btype="bandpass", fs=SR, output="sos")
        x = sosfilt(sos, x).astype(np.float32)
    x /= max(1e-6, float(np.max(np.abs(x))))
    return x * env(n, attack, release)


def drum(dst: np.ndarray, start: float, gain: float = 0.35, pan: float = 0.0, deep: bool = False) -> None:
    dur = 0.32 if deep else 0.22
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    f0 = 95 if deep else 135
    f1 = 42 if deep else 62
    phase = 2*np.pi*(f1*t + (f0-f1)*(1-np.exp(-10*t))/10)
    sig = np.sin(phase) * np.exp(-12*t)
    sig += noise_burst(dur, "low", release=dur*0.9) * 0.18
    add(dst, sig.astype(np.float32), start, gain, pan)


def wood(dst: np.ndarray, start: float, gain: float = 0.22, pan: float = 0.0) -> None:
    sig = noise_burst(0.11, "band", release=0.10)
    add(dst, sig, start, gain, pan)


def chime(dst: np.ndarray, start: float, freq: float, gain: float = 0.15, pan: float = 0.0, dur: float = 1.2) -> None:
    n = int(dur * SR)
    t = np.arange(n, dtype=np.float32) / SR
    sig = (np.sin(2*np.pi*freq*t) + .35*np.sin(2*np.pi*freq*2.01*t) + .2*np.sin(2*np.pi*freq*3.97*t))
    sig *= np.exp(-3.3*t)
    add(dst, sig.astype(np.float32), start, gain, pan)


def finalize(x: np.ndarray, loop: bool = False) -> np.ndarray:
    # Evita clicks. Las piezas en loop respiran brevemente en la unión.
    n = min(len(x)//4, int((0.28 if loop else 0.06) * SR))
    if n:
        fade = np.linspace(0, 1, n, dtype=np.float32)[:, None]
        x[:n] *= fade
        x[-n:] *= fade[::-1]
    peak = float(np.max(np.abs(x))) if len(x) else 1.0
    if peak > 0:
        x = x * (0.91 / max(0.91, peak))
    return np.clip(x, -0.98, 0.98).astype(np.float32)


def encode(rel: str, x: np.ndarray, loop: bool = False, quality: int = 4) -> dict:
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    x = finalize(x, loop)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav_path = Path(tmp.name)
    wavfile.write(wav_path, SR, (x * 32767).astype(np.int16))
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
        "-c:a", "libvorbis", "-q:a", str(quality), str(path)
    ], check=True)
    wav_path.unlink(missing_ok=True)
    return {
        "path": f"/assets/audio/{rel}",
        "durationSeconds": round(len(x)/SR, 3),
        "loop": loop,
        "sampleRate": SR,
        "channels": 2,
        "bytes": path.stat().st_size,
    }


def music_menu() -> np.ndarray:
    dur = 24.0; x = empty(dur)
    # Dm, Bb, F, C. Motivo de Atlas: D-F-A-G-F-D.
    chords = [(146.83,174.61,220.00), (116.54,146.83,174.61), (174.61,220,261.63), (130.81,164.81,196.00)]
    for bar in range(8):
        st = bar*3.0; chord = chords[bar%4]
        for f in chord:
            note(x, st, 2.8, f, 0.075, "sine", pan=(f/chord[1]-1)*.35, attack=.35, release=.55)
        note(x, st, 2.7, chord[0]/2, .11, "softsaw", pan=-.1, attack=.25, release=.55)
    motif = [293.66,349.23,440,392,349.23,293.66]
    times = [1.0,1.5,2.0,2.55,3.1,3.65]
    for cycle in [0,12]:
        for t,f in zip(times,motif): chime(x, cycle+t, f, .085, .2, .8)
    for t in np.arange(0,24,6): chime(x,t+5.2,587.33,.06,-.25,1.4)
    return x


def music_green_camp() -> np.ndarray:
    dur=24.; x=empty(dur); bpm=92; beat=60/bpm
    chords=[(196,246.94,293.66),(174.61,220,261.63),(196,246.94,329.63),(146.83,196,246.94)]
    for bar in range(8):
        st=bar*3
        c=chords[bar%4]
        for i,f in enumerate(c):
            for k in range(3): note(x,st+k*.72,.48,f*(2 if i==2 else 1),.045,"triangle",pan=-.4+i*.4,attack=.01,release=.25)
        note(x,st,2.8,c[0]/2,.055,"sine",pan=-.2,attack=.2,release=.5)
    melody=[392,440,493.88,440,392,329.63,293.66,329.63]
    for cycle in [0,12]:
        for i,f in enumerate(melody): note(x,cycle+1+i*.62,.48,f,.06,"sine",pan=.3,vibrato=.08)
    for t in np.arange(0,24,beat*2): wood(x,float(t),.07,pan=-.4 if int(t/beat)%4==0 else .35)
    for t in [5.6,11.6,17.6,23.0]: chime(x,t,783.99,.045,.35,.65)
    return x


def music_green_explore() -> np.ndarray:
    dur=24.; x=empty(dur)
    chords=[(164.81,196,246.94),(146.83,196,220),(174.61,220,261.63),(146.83,185,246.94)]
    for bar in range(8):
        st=bar*3; c=chords[bar%4]
        for f in c: note(x,st,2.9,f,.05,"sine",pan=RNG.uniform(-.45,.45),attack=.5,release=.7)
        for k in range(6): note(x,st+k*.45,.34,c[k%3]*2,.026,"triangle",pan=-.55+(k%3)*.55,attack=.005,release=.22)
    motif=[329.63,392,440,493.88,440,392,329.63,293.66]
    for cycle in [1.0,13.0]:
        for i,f in enumerate(motif): note(x,cycle+i*.55,.45,f,.052,"sine",pan=.25,vibrato=.12)
    # Viento tonal muy leve
    wind=noise_burst(dur,"band",attack=.8,release=.8)
    sos=butter(2,[250,1500],btype="bandpass",fs=SR,output="sos")
    wind=sosfilt(sos,wind).astype(np.float32)
    add(x,wind,0,.018,-.15)
    return x


def music_green_corruption() -> np.ndarray:
    dur=24.; x=empty(dur)
    chords=[(146.83,174.61,233.08),(138.59,174.61,220),(130.81,164.81,220),(138.59,185,233.08)]
    for bar in range(8):
        st=bar*3; c=chords[bar%4]
        for i,f in enumerate(c): note(x,st,2.95,f,.065,"softsaw",pan=-.3+i*.3,attack=.55,release=.75)
        note(x,st,2.85,c[0]/2,.1,"sine",pan=0,attack=.35,release=.7)
        if bar%2==1: chime(x,st+2.25,739.99,.045,.35,1.1)
    for t in np.arange(1.5,24,3):
        add(x,noise_burst(.5,"low",release=.45),float(t),.035,RNG.uniform(-.5,.5))
    motif=[293.66,277.18,233.08,246.94]
    for cycle in [2,14]:
        for i,f in enumerate(motif): note(x,cycle+i*.8,.7,f,.052,"triangle",pan=-.25+i*.18,attack=.08,release=.4)
    return x


def music_green_combat() -> np.ndarray:
    dur=24.; x=empty(dur); bpm=120; beat=.5
    roots=[146.83,138.59,130.81,116.54]
    for bar in range(12):
        st=bar*2; root=roots[bar%4]
        for k in range(8):
            note(x,st+k*.25,.19,root*(2 if k%2 else 1),.055,"softsaw",pan=-.25 if k%2 else .25,attack=.005,release=.11)
        note(x,st,1.9,root/2,.08,"sine",attack=.08,release=.3)
        drum(x,st,.22,0,deep=True); drum(x,st+1,.19,.05,deep=True)
        wood(x,st+.5,.08,-.45); wood(x,st+1.5,.09,.45)
    melody=[293.66,349.23,392,440,392,349.23,329.63,293.66]
    for cycle in [1,9,17]:
        for i,f in enumerate(melody): note(x,cycle+i*.25,.18,f,.042,"triangle",pan=.25,attack=.004,release=.1)
    return x


def music_guardian() -> np.ndarray:
    dur=24.; x=empty(dur)
    roots=[73.42,69.30,65.41,58.27]
    for bar in range(8):
        st=bar*3; r=roots[bar%4]
        note(x,st,2.95,r,.14,"softsaw",attack=.25,release=.65)
        note(x,st,2.95,r*2,.055,"sine",pan=-.3,attack=.45,release=.7)
        note(x,st,2.95,r*2.5,.045,"sine",pan=.35,attack=.55,release=.7)
        drum(x,st,.34,0,deep=True); drum(x,st+1.5,.26,.1,deep=True)
        for k in [0.7,2.15]: wood(x,st+k,.11,RNG.uniform(-.5,.5))
    motif=[293.66,349.23,440,392,349.23,293.66]
    for cycle in [2,14]:
        for i,f in enumerate(motif):
            note(x,cycle+i*.52,.42,f,.052,"softsaw",pan=-.2+i*.08,attack=.04,release=.25)
    # Crujidos de raíces
    for t in [1.1,4.8,7.4,10.6,13.2,16.9,20.2,22.7]: add(x,noise_burst(.3,"low",release=.28),t,.065,RNG.uniform(-.6,.6))
    return x


def stinger_victory() -> np.ndarray:
    dur=7.; x=empty(dur)
    notes=[293.66,349.23,440,587.33]
    for i,f in enumerate(notes):
        note(x,.35+i*.55,.65,f,.1,"triangle",pan=-.25+i*.17,release=.3)
        chime(x,.35+i*.55,f*2,.045,.3,.9)
    for f in [146.83,220,293.66]: note(x,2.1,3.8,f,.08,"sine",pan=RNG.uniform(-.3,.3),attack=.25,release=1.2)
    drum(x,2.05,.18,0,deep=True)
    return x


def ambience_forest() -> np.ndarray:
    dur=24.; x=empty(dur)
    base=RNG.normal(0,1,int(dur*SR)).astype(np.float32)
    sos=butter(4,[120,1100],btype="bandpass",fs=SR,output="sos")
    wind=sosfilt(sos,base).astype(np.float32); wind/=max(1e-6,np.max(np.abs(wind)))
    lfo=(.55+.45*np.sin(2*np.pi*np.arange(len(wind))/SR/7.0)).astype(np.float32)
    add(x,wind*lfo,0,.045,-.15)
    # Pájaros sintéticos
    for t in [1.4,3.1,6.8,9.9,12.3,15.7,18.4,21.8]:
        freq=RNG.choice([1200,1450,1700,1950])
        for k in range(RNG.integers(2,5)):
            note(x,t+k*.12,.09,float(freq+k*80),.018,"sine",pan=float(RNG.uniform(-.8,.8)),attack=.008,release=.04,vibrato=.2)
    return x


def ambience_camp() -> np.ndarray:
    dur=24.; x=empty(dur)
    # Fogata y aire
    crack=RNG.normal(0,1,int(dur*SR)).astype(np.float32)
    sos=butter(4,[300,2600],btype="bandpass",fs=SR,output="sos")
    crack=sosfilt(sos,crack).astype(np.float32)
    gate=(RNG.random(len(crack))>.992).astype(np.float32)
    gate=np.convolve(gate,np.exp(-np.linspace(0,8,int(.08*SR))).astype(np.float32),mode="same")
    crack*=np.clip(gate,0,1)
    add(x,crack,0,.11,-.2)
    wind=noise_burst(dur,"low",attack=.8,release=.8)
    add(x,wind,0,.018,.2)
    for t in [2.3,7.7,11.1,16.4,20.8]: wood(x,t,.035,.35)
    return x


def sfx_combat_start() -> np.ndarray:
    x=empty(1.05)
    add(x,noise_burst(.55,"high",release=.5),0,.20,-.25)
    note(x,.15,.75,110,.22,"softsaw",attack=.03,release=.5)
    drum(x,.55,.38,0,deep=True)
    chime(x,.58,440,.08,.2,.45)
    return x


def sfx_slash(heavy=False, dagger=False) -> np.ndarray:
    dur=.55 if heavy else .38; x=empty(dur)
    sig=noise_burst(.22 if not heavy else .34,"high",attack=.002,release=.2 if not heavy else .32)
    n=len(sig); t=np.arange(n)/SR
    sig*=np.linspace(1.2,.2,n,dtype=np.float32)
    add(x,sig,.03,.28 if heavy else .22,-.25 if dagger else .15)
    if dagger:
        add(x,noise_burst(.11,"high",release=.1),.13,.16,.35)
    if heavy: drum(x,.24,.18,.1,deep=True)
    return x


def sfx_magic() -> np.ndarray:
    x=empty(.7)
    for i,f in enumerate([392,523.25,659.25]): note(x,.03+i*.08,.45,f,.09,"sine",pan=-.35+i*.35,attack=.01,release=.35,vibrato=.15)
    add(x,noise_burst(.35,"high",release=.34),.22,.07,.2)
    return x


def sfx_impact(deep=False) -> np.ndarray:
    x=empty(.48)
    drum(x,.02,.38 if deep else .25,0,deep=deep)
    add(x,noise_burst(.22,"band",release=.2),.02,.16,.05)
    return x


def sfx_miss() -> np.ndarray:
    x=empty(.42); add(x,noise_burst(.34,"high",release=.33),.01,.18,.55); note(x,.14,.24,180,.06,"sine",pan=-.3,release=.18); return x


def sfx_critical() -> np.ndarray:
    x=empty(.9); drum(x,.12,.34,0,deep=True); chime(x,.13,880,.13,-.25,.7); chime(x,.18,1320,.08,.35,.65); return x


def sfx_enemy_death() -> np.ndarray:
    x=empty(1.0); note(x,.02,.75,120,.16,"softsaw",release=.65); add(x,noise_burst(.75,"low",release=.7),.12,.13,0); drum(x,.55,.22,0,deep=True); return x


def sfx_dice_roll() -> np.ndarray:
    x=empty(1.25)
    for i,t in enumerate(np.arange(.02,1.02,.09)):
        add(x,noise_burst(.045,"band",release=.04),float(t),.06+(i%3)*.01,float(RNG.uniform(-.45,.45)))
        note(x,float(t),.055,260+(i%5)*35,.025,"triangle",pan=float(RNG.uniform(-.4,.4)),release=.04)
    return x


def sfx_dice_settle() -> np.ndarray:
    x=empty(.5); add(x,noise_burst(.08,"band",release=.075),.02,.12,-.12); chime(x,.04,659.25,.07,.2,.4); return x


def sfx_ui_confirm() -> np.ndarray:
    x=empty(.3); chime(x,.01,660,.06,-.1,.25); chime(x,.055,880,.045,.2,.22); return x


def sfx_portal() -> np.ndarray:
    x=empty(2.2)
    for i,f in enumerate([146.83,220,293.66,440,587.33]): note(x,i*.24,1.35,f,.07,"sine",pan=-.5+i*.25,attack=.12,release=.75)
    add(x,noise_burst(1.7,"high",attack=.25,release=.8),.25,.06,0)
    return x


def intro_orc_brute() -> np.ndarray:
    x=empty(1.55)
    # Rugido sintético gutural
    n=int(.9*SR); t=np.arange(n)/SR
    roar=np.sin(2*np.pi*(95+12*np.sin(2*np.pi*7*t))*t)+.4*np.sin(2*np.pi*47*t)
    roar*=env(n,.04,.35)*(.7+.3*RNG.random(n))
    add(x,roar.astype(np.float32),0,.18,-.1)
    drum(x,.88,.45,.15,deep=True); return x


def intro_shaman() -> np.ndarray:
    x=empty(1.9)
    for i,f in enumerate([138.59,146.83,174.61,155.56]): note(x,.05+i*.18,.7,f,.07,"softsaw",pan=-.35+i*.2,attack=.05,release=.45,vibrato=.25)
    wood(x,.82,.28,0); chime(x,.88,415.3,.1,.25,.8); return x


def intro_orc_assassin() -> np.ndarray:
    x=empty(1.35); add(x,noise_burst(.45,"high",release=.42),.02,.20,-.55); add(x,noise_burst(.30,"high",release=.28),.34,.18,.55); chime(x,.62,1100,.055,.3,.35); return x


def intro_wolf() -> np.ndarray:
    x=empty(1.65); n=int(1.35*SR); t=np.arange(n)/SR
    f=250+260*np.sin(np.pi*np.clip(t/1.1,0,1))
    phase=2*np.pi*np.cumsum(f)/SR
    howl=(np.sin(phase)+.25*np.sin(2*phase))*env(n,.12,.35)
    add(x,howl.astype(np.float32),.05,.14,-.15)
    add(x,noise_burst(.25,"low",release=.22),1.05,.08,.25); return x


def intro_feral_warlock() -> np.ndarray:
    x=empty(1.75)
    for i,f in enumerate([110,103.83,92.5]): note(x,.08+i*.22,1.1,f,.10,"softsaw",pan=-.3+i*.3,attack=.08,release=.6,vibrato=.32)
    chime(x,.72,311.13,.07,.3,.8); add(x,noise_burst(.65,"low",release=.6),.65,.08,0); return x


def intro_panther() -> np.ndarray:
    x=empty(1.45); n=int(.75*SR); t=np.arange(n)/SR
    growl=(np.sin(2*np.pi*(72+8*np.sin(2*np.pi*10*t))*t)+.3*np.sin(2*np.pi*144*t))*env(n,.03,.25)
    add(x,growl.astype(np.float32),0,.15,-.3); add(x,noise_burst(.42,"high",release=.4),.55,.18,.6); drum(x,.88,.18,.45,deep=False); return x


def intro_guardian() -> np.ndarray:
    x=empty(5.4)
    # Raíces y madera
    for t,p in [(0.05,-.6),(.42,.4),(.9,-.2),(1.3,.6),(1.75,-.5)]:
        add(x,noise_burst(.55,"low",release=.5),t,.10,p)
        wood(x,t+.12,.16,p)
    # Rugido grave
    n=int(2.2*SR); t=np.arange(n)/SR
    freq=62+8*np.sin(2*np.pi*3.2*t)
    phase=2*np.pi*np.cumsum(freq)/SR
    roar=(np.sin(phase)+.5*np.sin(2*phase)+.2*np.sin(3*phase))*env(n,.18,.8)
    add(x,roar.astype(np.float32),1.7,.20,0)
    drum(x,3.55,.55,0,deep=True)
    add(x,noise_burst(1.1,"low",release=1.0),3.5,.18,0)
    for f in [146.83,220,293.66]: chime(x,3.7,f,.055,(f-220)/200,1.5)
    return x


def intro_elite() -> np.ndarray:
    x=empty(.95); note(x,.02,.7,82.41,.15,"softsaw",release=.55); drum(x,.38,.30,0,deep=True); chime(x,.42,740,.08,.2,.5); return x


def guardian_death() -> np.ndarray:
    x=empty(3.4)
    for t,p in [(0,-.5),(.4,.5),(.8,-.2),(1.2,.3)]: add(x,noise_burst(.7,"low",release=.65),t,.13,p)
    note(x,.1,2.8,73.42,.16,"softsaw",attack=.06,release=1.2)
    drum(x,1.45,.5,0,deep=True); chime(x,1.65,293.66,.08,-.25,1.5); chime(x,1.8,440,.065,.3,1.4)
    return x


def main() -> None:
    ensure_dirs()
    manifest = {
        "version": "1.0.0-prototype-green",
        "generated": "2026-07-27",
        "origin": "Procedural original, sin muestras externas",
        "assets": {},
    }
    assets = [
        ("music/menu/atlas_theme_prototype.ogg", music_menu(), True),
        ("music/green/camp_green_loop.ogg", music_green_camp(), True),
        ("music/green/explore_green_loop.ogg", music_green_explore(), True),
        ("music/green/corruption_green_loop.ogg", music_green_corruption(), True),
        ("music/combat/combat_green_loop.ogg", music_green_combat(), True),
        ("music/bosses/guardian_green_loop.ogg", music_guardian(), True),
        ("music/stingers/green_victory.ogg", stinger_victory(), False),
        ("ambience/green/forest_loop.ogg", ambience_forest(), True),
        ("ambience/green/camp_loop.ogg", ambience_camp(), True),
        ("sfx/combat/combat_start.ogg", sfx_combat_start(), False),
        ("sfx/combat/sword_slash.ogg", sfx_slash(), False),
        ("sfx/combat/dagger_slash.ogg", sfx_slash(dagger=True), False),
        ("sfx/combat/heavy_swing.ogg", sfx_slash(heavy=True), False),
        ("sfx/combat/magic_cast.ogg", sfx_magic(), False),
        ("sfx/combat/impact.ogg", sfx_impact(), False),
        ("sfx/combat/impact_heavy.ogg", sfx_impact(True), False),
        ("sfx/combat/miss.ogg", sfx_miss(), False),
        ("sfx/combat/critical.ogg", sfx_critical(), False),
        ("sfx/combat/enemy_death.ogg", sfx_enemy_death(), False),
        ("sfx/dice/dice_roll.ogg", sfx_dice_roll(), False),
        ("sfx/dice/dice_settle.ogg", sfx_dice_settle(), False),
        ("sfx/ui/confirm.ogg", sfx_ui_confirm(), False),
        ("sfx/world/portal_activate.ogg", sfx_portal(), False),
        ("enemies/green/orco_bruto_intro.ogg", intro_orc_brute(), False),
        ("enemies/green/chaman_orco_intro.ogg", intro_shaman(), False),
        ("enemies/green/asesino_orco_intro.ogg", intro_orc_assassin(), False),
        ("enemies/green/lobo_salvaje_intro.ogg", intro_wolf(), False),
        ("enemies/green/brujo_feral_intro.ogg", intro_feral_warlock(), False),
        ("enemies/green/pantera_sombria_intro.ogg", intro_panther(), False),
        ("enemies/green/guardian_verde_intro.ogg", intro_guardian(), False),
        ("enemies/green/elite_stinger.ogg", intro_elite(), False),
        ("enemies/green/guardian_verde_death.ogg", guardian_death(), False),
    ]
    for rel, audio, loop in assets:
        manifest["assets"][rel] = encode(rel, audio, loop=loop, quality=4 if loop else 5)
        print(f"generated {rel}")
    (OUT / "audio_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT / "README.md").write_text(
        "# Atlas Audio Prototype v1.0 · Región Verde\n\n"
        "Audio original generado por síntesis procedural, sin muestras externas. "
        "Los OGG son recursos runtime de prueba y pueden reemplazarse por masters finales "
        "manteniendo los mismos identificadores y rutas.\n",
        encoding="utf-8",
    )
    print(f"manifest: {OUT / 'audio_manifest.json'}")


if __name__ == "__main__":
    main()
