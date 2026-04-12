"use client";

import { Player } from "@remotion/player";
import { AmbientOrbs } from "./AmbientOrbs";

export default function AmbientOrbsPlayer({ className }: { className?: string }) {
  return (
    <Player
      component={AmbientOrbs}
      durationInFrames={600}
      compositionWidth={1440}
      compositionHeight={900}
      fps={30}
      autoPlay
      loop
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      className={className}
    />
  );
}
