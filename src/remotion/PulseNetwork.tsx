import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from "remotion";

export const PulseNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  const circles = 5;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {new Array(circles).fill(0).map((_, i) => {
        const offsetFrame = frame - (i * 30);
        const progress = Math.max(0, (offsetFrame % 150) / 150);
        
        const size = interpolate(progress, [0, 1], [0, width * 1.5]);
        const opacity = interpolate(progress, [0, 0.5, 1], [0, 0.4, 0]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "1px solid currentColor",
              opacity,
              boxShadow: "0 0 20px currentColor",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
