"use client";

import { Player } from "@remotion/player";
import { DataAnimation } from "./DataAnimation";

export default function DataAnimationPlayer() {
  return (
    <Player
      component={DataAnimation}
      durationInFrames={300}
      compositionWidth={1920}
      compositionHeight={600}
      fps={30}
      autoPlay
      loop
      style={{ width: "100%", height: "100%" }}
    />
  );
}
