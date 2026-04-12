"use client";

import { Player } from "@remotion/player";
import { GridAnimation } from "@/remotion/GridAnimation";

export default function LoginAnimation() {
  return (
    <Player
      component={GridAnimation}
      durationInFrames={300}
      compositionWidth={1080}
      compositionHeight={1080}
      fps={30}
      autoPlay
      loop
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
