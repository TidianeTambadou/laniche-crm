import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const GridAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Create an infinite moving perspective grid
  const move = frame % 100;
  
  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", perspective: "800px", overflow: "hidden" }}>
      <div 
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          left: "-50%",
          top: "0%",
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: `rotateX(60deg) translateY(${move}px)`,
          opacity: 0.1,
          maskImage: "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))"
        }} 
      />
    </AbsoluteFill>
  );
};
