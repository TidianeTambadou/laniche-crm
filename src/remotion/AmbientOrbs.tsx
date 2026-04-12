import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const ORBS = [
  { x: 0.15, y: 0.2,  size: 420, speedX: 0.3, speedY: 0.2, phase: 0,   opacity: 0.06 },
  { x: 0.75, y: 0.1,  size: 320, speedX: 0.2, speedY: 0.4, phase: 40,  opacity: 0.04 },
  { x: 0.85, y: 0.65, size: 360, speedX: 0.4, speedY: 0.2, phase: 80,  opacity: 0.05 },
  { x: 0.4,  y: 0.85, size: 260, speedX: 0.2, speedY: 0.3, phase: 20,  opacity: 0.04 },
  { x: 0.55, y: 0.4,  size: 300, speedX: 0.35,speedY: 0.25,phase: 60,  opacity: 0.05 },
  { x: 0.05, y: 0.7,  size: 280, speedX: 0.25,speedY: 0.35,phase: 100, opacity: 0.04 },
];

export const AmbientOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", overflow: "hidden" }}>
      {ORBS.map((orb, i) => {
        const dX = Math.sin((frame + orb.phase) / (80 + i * 12)) * 60 * orb.speedX;
        const dY = Math.cos((frame + orb.phase) / (100 + i * 8)) * 50 * orb.speedY;
        const breathe = interpolate(Math.sin((frame + orb.phase) / 70), [-1, 1], [0.9, 1.08]);
        const cx = orb.x * width  + dX;
        const cy = orb.y * height + dY;
        const sz = orb.size * breathe;
        return (
          <div key={i} style={{
            position: "absolute",
            width: sz, height: sz,
            borderRadius: "50%",
            background: `radial-gradient(circle at 40% 35%, rgba(0,0,0,0.9), transparent)`,
            opacity: orb.opacity,
            left: cx - sz / 2, top: cy - sz / 2,
            filter: `blur(${orb.size * 0.3}px)`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
