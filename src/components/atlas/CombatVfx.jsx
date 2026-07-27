import React from "react";
import { motion } from "framer-motion";
import { resolveAbilityAnimation } from "@/lib/atlasAbilityAnimations";

const EL_COLOR = {
  fisico: "#fbbf24", arcano: "#c084fc", sombra: "#a78bfa",
  fuego: "#ff6a1a", hielo: "#7dd3fc", veneno: "#22c55e", electrico: "#fbbf24",
};

export function vfxTypeFor(name, ctx) { return resolveAbilityAnimation({ name }, ctx || {}).classicType; }

function pointStyle(point, width, height) {
  return {
    left: Number.isFinite(point?.x) ? point.x : width * 0.5,
    top: Number.isFinite(point?.y) ? point.y : height * 0.5,
  };
}

function vectorBetween(origin, target) {
  const dx = Number(target?.x || 0) - Number(origin?.x || 0);
  const dy = Number(target?.y || 0) - Number(origin?.y || 0);
  return {
    dx,
    dy,
    distance: Math.max(1, Math.hypot(dx, dy)),
    angle: Math.atan2(dy, dx) * (180 / Math.PI),
  };
}

function Slash({ point, color, delay = 0, rot = -20, scale = 1 }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.4 * scale, rotate: rot - 25 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4 * scale, 1.3 * scale, 1.5 * scale], rotate: [rot - 25, rot, rot + 25] }}
      transition={{ duration: 0.32, delay, ease: "easeOut" }}
      className="absolute"
      style={{ ...pointStyle(point, 0, 0), width: 74, height: 8, marginLeft: -37, marginTop: -4, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, borderRadius: 8, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

function Ring({ point, color, delay = 0, scale = 2.4, flattened = false }) {
  return (
    <motion.span
      initial={{ opacity: 0.85, scale: 0.2 }}
      animate={{ opacity: [0.85, 0], scale: [0.2, scale] }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="absolute rounded-full"
      style={{ ...pointStyle(point, 0, 0), width: 60, height: flattened ? 22 : 60, marginLeft: -30, marginTop: flattened ? -11 : -30, border: `3px solid ${color}`, boxShadow: `0 0 10px ${color}` }}
    />
  );
}

function TravelingBolt({ origin, target, color, fireball = false, delay = 0 }) {
  const v = vectorBetween(origin, target);
  const size = fireball ? 34 : 18;
  return (
    <motion.span
      initial={{ opacity: 0, x: 0, y: 0, scale: fireball ? 0.45 : 0.65, rotate: v.angle }}
      animate={{ opacity: [0, 1, 1, 0], x: v.dx, y: v.dy, scale: fireball ? [0.45, 1, 1.15, 0.3] : [0.65, 1, 1, 0.8], rotate: v.angle }}
      transition={{ duration: fireball ? 0.55 : 0.42, delay, ease: "easeInOut" }}
      className="absolute"
      style={{
        ...pointStyle(origin, 0, 0),
        width: size,
        height: fireball ? size : 6,
        marginLeft: -size / 2,
        marginTop: fireball ? -size / 2 : -3,
        borderRadius: fireball ? "999px" : 3,
        background: fireball ? "radial-gradient(circle, #fff3b0, #ff7a1a 50%, #b02000)" : color,
        boxShadow: fireball ? "0 0 18px #ff6a1a" : `0 0 8px ${color}`,
        transformOrigin: "center",
      }}
    />
  );
}

export default function CombatVfx({ type, element, crit, hitCount = 1, quality = "normal", origin, target, arenaSize }) {
  if (!type) return null;
  const width = Math.max(1, Number(arenaSize?.width || 100));
  const height = Math.max(1, Number(arenaSize?.height || 100));
  const safeOrigin = origin || { x: width * 0.16, y: height * 0.55 };
  const safeTarget = target || { x: width * 0.70, y: height * 0.55 };
  const v = vectorBetween(safeOrigin, safeTarget);
  const color = EL_COLOR[element] || "#fbbf24";
  const sc = crit ? "#fde68a" : color;
  const count = Math.max(1, Math.min(8, Number(hitCount) || 1));
  const qualityScale = quality === "exceptional" ? 1.18 : quality === "high" ? 1.08 : quality === "low" ? 0.9 : 1;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-visible" aria-hidden="true">
      {type === "slash" && <Slash point={safeTarget} color={sc} scale={qualityScale} />}

      {type === "multi_slash" && Array.from({ length: count }).map((_, i) => {
        const progress = count <= 1 ? 0.5 : i / (count - 1);
        const point = { x: safeTarget.x - 10 + progress * 20, y: safeTarget.y - 12 + progress * 22 };
        return <Slash key={i} point={point} color={crit && i === count - 1 ? "#fde68a" : color} delay={i * 0.11} rot={-38 + progress * 76} scale={qualityScale} />;
      })}

      {type === "impact" && (
        <>
          <motion.span initial={{ opacity: 0, scale: 0.2 }} animate={{ opacity: [1, 0], scale: [0.2, 1.7 * qualityScale] }} transition={{ duration: 0.5 }} className="absolute" style={{ ...pointStyle(safeTarget, width, height), width: 72, height: 72, marginLeft: -36, marginTop: -36, background: `radial-gradient(circle, ${sc}, transparent 60%)` }} />
          <Ring point={safeTarget} color={sc} scale={2.4 * qualityScale} />
        </>
      )}

      {type === "shockwave" && (
        <>
          <motion.span
            initial={{ opacity: 0.15, scaleX: 0.1 }}
            animate={{ opacity: [0.15, 0.8, 0], scaleX: [0.1, 1, 0.75] }}
            transition={{ duration: 0.52, ease: "easeOut" }}
            className="absolute"
            style={{ ...pointStyle(safeOrigin, width, height), width: Math.max(42, v.distance), height: 10, marginTop: -5, transformOrigin: "left center", rotate: `${v.angle}deg`, background: `linear-gradient(90deg, transparent, ${sc}, transparent)`, borderRadius: 10 }}
          />
          {[0.08, 0.20, 0.32].map((d, i) => <Ring key={i} point={safeTarget} color={sc} delay={d} scale={(2.1 + i * 0.45) * qualityScale} flattened />)}
        </>
      )}

      {type === "wind" && [0, 1, 2].map(i => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, rotate: v.angle }}
          animate={{ opacity: [0, 0.9, 0], x: v.dx, y: v.dy + (i - 1) * 8, rotate: v.angle }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
          className="absolute"
          style={{ ...pointStyle(safeOrigin, width, height), width: 56, height: 4, marginLeft: -8, marginTop: -2, background: `linear-gradient(90deg, transparent, ${sc}, transparent)`, borderRadius: 4 }}
        />
      ))}

      {type === "projectile" && <TravelingBolt origin={safeOrigin} target={safeTarget} color={sc} />}

      {type === "fireball" && (
        <>
          <motion.span initial={{ opacity: 0, scale: 0.2 }} animate={{ opacity: [0, 0.8, 0], scale: [0.2, 1.2, 0.7] }} transition={{ duration: 0.28 }} className="absolute rounded-full" style={{ ...pointStyle(safeOrigin, width, height), width: 44, height: 44, marginLeft: -22, marginTop: -22, background: "radial-gradient(circle, #fff3b0aa, #ff6a1a44, transparent 70%)" }} />
          <TravelingBolt origin={safeOrigin} target={safeTarget} color={sc} fireball />
          <motion.span initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: [0, 1, 0], scale: [0.3, 2.1 * qualityScale] }} transition={{ duration: 0.48, delay: 0.47 }} className="absolute rounded-full" style={{ ...pointStyle(safeTarget, width, height), width: 64, height: 64, marginLeft: -32, marginTop: -32, background: "radial-gradient(circle, #ffd840, transparent 60%)" }} />
        </>
      )}

      {type === "lightning" && [0, 1, 2].map(i => (
        <motion.span key={i} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 1] }} transition={{ duration: 0.3, delay: i * 0.12 }} className="absolute" style={{ left: safeTarget.x - 8 + i * 8, top: safeTarget.y - 58, width: 4, height: 92, transformOrigin: "top", background: `linear-gradient(${sc}, #fff)`, boxShadow: `0 0 10px ${sc}`, clipPath: "polygon(40% 0,100% 40%,50% 45%,100% 100%,0 60%,50% 55%)" }} />
      ))}

      {type === "tornado" && (
        <motion.span initial={{ opacity: 0, scale: 0.4, rotate: 0 }} animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.3 * qualityScale], rotate: 720 }} transition={{ duration: 0.8 }} className="absolute rounded-full" style={{ ...pointStyle(safeTarget, width, height), width: 50, height: 84, marginLeft: -25, marginTop: -42, border: `3px solid ${sc}`, borderTopColor: "transparent", borderBottomColor: "transparent", boxShadow: `0 0 14px ${sc}` }} />
      )}

      {type === "smoke" && (
        <>
          {[0, 1, 2].map(i => (
            <motion.span key={`origin-${i}`} initial={{ opacity: 0, scale: 0.3, y: 0 }} animate={{ opacity: [0, 0.72, 0], scale: [0.3, 1.9], y: -34 }} transition={{ duration: 0.7, delay: i * 0.08 }} className="absolute rounded-full" style={{ left: safeOrigin.x - 12 + i * 12, top: safeOrigin.y, width: 38, height: 38, marginLeft: -19, marginTop: -19, background: "radial-gradient(circle, #64748b, transparent 65%)" }} />
          ))}
          <Slash point={safeTarget} color={sc} delay={0.28} rot={-18} scale={qualityScale} />
        </>
      )}

      {type === "shadow_clones" && (
        <>
          {Array.from({ length: Math.max(2, Math.min(4, count)) }).map((_, i, arr) => {
            const progress = (i + 1) / (arr.length + 1);
            const center = (arr.length - 1) / 2;
            const point = { x: safeOrigin.x + v.dx * progress, y: safeOrigin.y + v.dy * progress + (i - center) * 12 };
            return <motion.span key={i} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: [0, 0.62, 0.45, 0], scale: [0.4, 0.9 * qualityScale], x: (i - center) * 8 }} transition={{ duration: 0.62, delay: i * 0.07 }} className="absolute rounded-full" style={{ ...pointStyle(point, width, height), width: 42, height: 52, marginLeft: -21, marginTop: -26, background: `radial-gradient(circle, ${color}aa, transparent 70%)` }} />;
          })}
          <Slash point={safeTarget} color={sc} delay={0.30} rot={22} scale={qualityScale} />
        </>
      )}

      {type === "shield_break" && [0, 1, 2, 3].map(i => (
        <motion.span key={i} initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }} animate={{ opacity: [1, 0], scale: [0.5, 0.2], x: (i - 1.5) * 26, y: i % 2 ? 18 : -18 }} transition={{ duration: 0.5, delay: 0.12 }} className="absolute" style={{ ...pointStyle(safeTarget, width, height), width: 14, height: 14, background: `linear-gradient(135deg, ${sc}, #fff8)`, borderRadius: 2 }} />
      ))}

      {type === "golem" && (
        <motion.span initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 1] }} transition={{ duration: 0.7 }} className="absolute" style={{ ...pointStyle(safeTarget, width, height), width: 44, height: 54, marginLeft: -22, marginTop: -54, transformOrigin: "bottom", background: "linear-gradient(#a89070,#5a4a3a)", borderRadius: 6, boxShadow: "0 0 10px #8a7a5a" }} />
      )}

      {type === "aura_red" && (
        <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: [0, 0.8, 0], scale: [0.6, 1.7 * qualityScale] }} transition={{ duration: 0.7 }} className="absolute rounded-full" style={{ ...pointStyle(safeOrigin, width, height), width: 74, height: 74, marginLeft: -37, marginTop: -37, background: "radial-gradient(circle, #ef4444, transparent 65%)" }} />
      )}

      {type === "ice" && [0, 1, 2, 3].map(i => (
        <motion.span key={i} initial={{ opacity: 0, y: -50, scaleY: 0 }} animate={{ opacity: [0, 1, 0], y: 0, scaleY: [0, 1, 1] }} transition={{ duration: 0.5, delay: i * 0.08 }} className="absolute" style={{ left: safeTarget.x - 10 + i * 7, top: safeTarget.y - 28, width: 8, height: 56, transformOrigin: "top", background: `linear-gradient(${sc}, #fff)`, boxShadow: `0 0 8px ${sc}`, clipPath: "polygon(40% 0, 60% 0, 100% 80%, 50% 100%, 0 80%)" }} />
      ))}

      {type === "shield" && (
        <motion.span initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: [0, 0.8, 0], scale: [0.3, 1.5, 1.8] }} transition={{ duration: 0.7 }} className="absolute rounded-full" style={{ ...pointStyle(safeTarget, width, height), width: 80, height: 80, marginLeft: -40, marginTop: -40, border: `4px solid ${sc}`, boxShadow: `0 0 12px ${sc}`, background: `radial-gradient(circle, ${sc}22, transparent 70%)` }} />
      )}

      {type === "charge" && (
        <>
          <motion.span initial={{ opacity: 0, scaleX: 0.1 }} animate={{ opacity: [0, 1, 0], scaleX: [0.1, 1, 1] }} transition={{ duration: 0.42 }} className="absolute" style={{ ...pointStyle(safeOrigin, width, height), width: v.distance, height: 8, marginTop: -4, transformOrigin: "left center", rotate: `${v.angle}deg`, background: `linear-gradient(90deg, transparent, ${sc}, transparent)`, borderRadius: 4, boxShadow: `0 0 8px ${sc}` }} />
          <Ring point={safeTarget} color={sc} scale={1.8 * qualityScale} />
        </>
      )}
    </div>
  );
}
