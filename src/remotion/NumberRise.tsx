import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, useVideoConfig } from "remotion";

interface NumberRiseProps {
  value: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

export const NumberRise: React.FC<NumberRiseProps> = ({
  value,
  prefix = "",
  suffix = "",
  color = "hsl(240,10%,15%)",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames * 0.7], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const displayed = Math.round(progress * value);

  const scale = interpolate(frame, [0, 8, 14], [0.5, 1.1, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      <span
        style={{
          fontSize: 56,
          fontWeight: 800,
          color,
          opacity,
          transform: `scale(${scale})`,
          letterSpacing: "-2px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {prefix}{displayed.toLocaleString("fr-FR")}{suffix}
      </span>
    </AbsoluteFill>
  );
};
