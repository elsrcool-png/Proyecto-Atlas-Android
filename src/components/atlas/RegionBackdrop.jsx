import React, { useMemo } from "react";
import { GIcon } from "@/lib/atlasIcons";

export default function RegionBackdrop({ region }) {
  const { theme } = region;
  const particles = useMemo(() => {
    return Array.from({ length: theme.particleCount || 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 14 + Math.random() * 18,
      duration: 9 + Math.random() * 10,
      delay: Math.random() * 12,
    }));
  }, [region.id, theme.particleCount]);

  return (
    <div className={`fixed inset-0 -z-10 bg-gradient-to-b ${theme.bgGradient} overflow-hidden`}>
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {particles.map(p => (
          <span key={p.id} className="absolute" style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
          }}><GIcon name={theme.particle} size={p.size} /></span>
        ))}
      </div>
    </div>
  );
}