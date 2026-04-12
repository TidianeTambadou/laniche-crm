import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const DataAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const lines = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", alignItems: "center", justifyContent: "center", perspective: "1000px" }}>
      {new Array(lines).fill(0).map((_, i) => {
        // Create an organic wave effect for each line
        const wave = Math.sin((frame + i * 4) / 10) * 100;
        const opacity = interpolate(
          wave,
          [-100, 100],
          [0.1, 1]
        );

        const widthLine = interpolate(
          wave,
          [-100, 100],
          [100, width * 0.8]
        );

        return (
          <div
            key={i}
            style={{
              width: widthLine,
              height: 2,
              backgroundColor: "currentColor",
              opacity,
              margin: "6px 0",
              borderRadius: "4px",
              boxShadow: "0 0 10px currentColor",
              transform: `rotateZ(${Math.sin(frame / 50) * 5}deg)`
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
