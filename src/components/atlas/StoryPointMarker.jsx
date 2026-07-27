import React from "react";
import { GIcon } from "@/lib/atlasIcons";
import { getWorldDepth } from "@/lib/atlasDepth";
import EntitySprite from "./EntitySprite";

// Decalso de suelo para distintos tipos de puntos narrativos.
function GroundDecal({ type, x, y, isTarget }) {
  const gold = isTarget ? "rgba(252,211,77,0.45)" : "rgba(94,234,212,0.3)";
  const dark = "rgba(60,50,30,0.5)";

  if (type === "footprints") {
    // Huellas dispersas sobre el suelo + tierra removida + ramas rotas
    const prints = [
      { dx: -14, dy: -8, r: -12 },
      { dx: -4, dy: 2, r: 8 },
      { dx: 8, dy: 12, r: -5 },
      { dx: 18, dy: 22, r: 14 },
    ];
    return (
      <div className="absolute pointer-events-none" style={{ left: x - 24, top: y - 4 }}>
        {/* Tierra removida */}
        <div className="absolute rounded-full" style={{ width: 52, height: 40, left: -4, top: 0, background: `radial-gradient(ellipse, ${dark}, transparent 70%)` }} />
        {/* Huellas */}
        {prints.map((p, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: 7, height: 10, left: p.dx + 12, top: p.dy + 4,
            background: `rgba(50,35,15,0.65)`,
            transform: `rotate(${p.r}deg)`,
            boxShadow: `0 0 4px ${gold}`,
          }} />
        ))}
        {/* Ramas rotas */}
        <div className="absolute" style={{ left: -16, top: 16, width: 14, height: 2, background: "rgba(80,55,20,0.7)", transform: "rotate(35deg)" }} />
        <div className="absolute" style={{ left: 20, top: -6, width: 12, height: 2, background: "rgba(80,55,20,0.7)", transform: "rotate(-20deg)" }} />
        {/* Brillo dorado si es objetivo activo */}
        {isTarget && <div className="absolute rounded-full animate-pulse" style={{ width: 56, height: 44, left: -6, top: -2, background: `radial-gradient(ellipse, ${gold}, transparent 70%)` }} />}
      </div>
    );
  }

  if (type === "cart") {
    return (
      <div className="absolute pointer-events-none flex items-end justify-center" style={{ left: x - 20, top: y - 18 }}>
        <div className="absolute rounded" style={{ width: 36, height: 14, background: "rgba(90,60,25,0.7)", border: "2px solid rgba(60,40,15,0.8)", transform: "rotate(-8deg)" }} />
        <div className="absolute" style={{ left: -10, top: 6, width: 14, height: 14, borderRadius: "50%", border: "3px solid rgba(50,35,15,0.8)" }} />
        <div className="absolute" style={{ left: 18, top: 6, width: 14, height: 14, borderRadius: "50%", border: "3px solid rgba(50,35,15,0.8)" }} />
        {isTarget && <div className="absolute rounded-full animate-pulse" style={{ width: 50, height: 40, left: -7, top: -4, background: `radial-gradient(ellipse, ${gold}, transparent 70%)` }} />}
      </div>
    );
  }

  if (type === "toolbox") {
    return (
      <div className="absolute pointer-events-none flex items-center justify-center" style={{ left: x - 16, top: y - 12 }}>
        <div className="absolute rounded" style={{ width: 28, height: 18, background: "rgba(100,80,50,0.8)", border: "2px solid rgba(70,55,30,0.9)", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />
        <div className="absolute" style={{ width: 20, height: 3, top: -2, background: "rgba(70,55,30,0.9)", borderRadius: 2 }} />
        {isTarget && <div className="absolute rounded-full animate-pulse" style={{ width: 44, height: 36, left: -8, top: -6, background: `radial-gradient(ellipse, ${gold}, transparent 70%)` }} />}
      </div>
    );
  }

  // Fallback genérico: aro dorado en el suelo para cualquier tipo desconocido
  return (
    <div className="absolute pointer-events-none flex items-center justify-center" style={{ left: x - 20, top: y - 20 }}>
      <div className="absolute rounded-full border-2 border-dashed" style={{ width: 40, height: 40, borderColor: isTarget ? "rgba(252,211,77,0.5)" : "rgba(94,234,212,0.3)" }} />
      <div className="absolute rounded-full" style={{ width: 20, height: 20, background: `radial-gradient(circle, ${isTarget ? "rgba(252,211,77,0.2)" : "rgba(94,234,212,0.15)"}, transparent 70%)` }} />
    </div>
  );
}

export default function StoryPointMarker({ sp, near, isTarget, debug }) {
  const interactionRadius = sp.interactionRadius || 42;
  const highlightRadius = sp.highlightRadius || 75;

  return (
    <div className="absolute flex flex-col items-center pointer-events-none" style={{ left: sp.x - 20, top: sp.y - 30, zIndex: getWorldDepth(sp.y, isTarget ? 8 : 1) }}>
      {/* Decal de suelo */}
      <GroundDecal type={sp.visualType || sp.icon} x={20} y={30} isTarget={isTarget} />

      <div className="relative">
        <div className="atlas-shadow" />

        {/* Aro de resaltado (highlightRadius) */}
        {isTarget && (
          <span className="absolute rounded-full border border-amber-300/30" style={{ width: highlightRadius, height: highlightRadius, left: 20 - highlightRadius / 2, top: 30 - highlightRadius / 2 }} />
        )}

        {/* Aro de misión + haz vertical */}
        {isTarget && (
          <>
            <span className="absolute -inset-3 rounded-full border-2 border-amber-300 animate-ping opacity-70" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-12 h-10 w-1 rounded-full bg-gradient-to-b from-transparent to-amber-300" />
          </>
        )}

        {/* Icono principal o NPC narrativo maestro */}
        <span className={near || isTarget ? "animate-bounce" : "animate-pulse"}>
          {sp.sprite ? (
            <EntitySprite
              type={sp.sprite.type || "npc"}
              variant={sp.sprite.variant}
              dir={sp.sprite.dir || "down"}
              turn
              animationKey={sp.id}
              size={isTarget ? 52 : 46}
              className="drop-shadow-[0_3px_5px_rgba(0,0,0,0.7)]"
            />
          ) : (
            <GIcon name={sp.icon || "sparkles"} size={isTarget ? 42 : 36} style={{ color: isTarget ? "#fcd34d" : near ? "#fde68a" : "#5eead4" }} />
          )}
        </span>

        {/* Indicador de interacción */}
        {(near || isTarget) && (
          <span className="absolute -top-2 -right-2 rounded-full bg-amber-300 text-slate-950 text-[9px] font-bold w-4 h-4 flex items-center justify-center">!</span>
        )}
      </div>

      {/* Etiqueta */}
      <span className={`text-[8px] px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap ${isTarget ? "text-slate-950 bg-amber-300 font-bold" : "text-amber-100 bg-slate-950/80 border border-amber-700/50"}`}>{sp.label}</span>

      {/* ── Modo depuración ── */}
      {debug && (
        <div className="absolute pointer-events-none" style={{ left: -40, top: 60, width: 120 }}>
          {/* Círculo de radio de interacción */}
          <div className="absolute rounded-full border-2 border-emerald-400/60" style={{ width: interactionRadius * 2, height: interactionRadius * 2, left: 20 - interactionRadius, top: 10 - interactionRadius }} />
          {/* Punto central */}
          <div className="absolute rounded-full bg-emerald-400" style={{ width: 4, height: 4, left: 18, top: 8 }} />
          {/* Info de depuración */}
          <div className="absolute rounded bg-slate-950/90 border border-emerald-500/50 px-1.5 py-0.5 text-[7px] text-emerald-300 font-mono whitespace-nowrap" style={{ top: interactionRadius + 14 }}>
            <div>{sp.id}</div>
            <div>x:{sp.x} y:{sp.y}</div>
            <div>r:{interactionRadius} · {isTarget ? "ACTIVO" : "inactivo"}</div>
          </div>
        </div>
      )}
    </div>
  );
}