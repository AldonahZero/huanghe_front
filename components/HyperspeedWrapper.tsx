"use client";

import React, { useCallback } from "react";
import Hyperspeed from "./Hyperspeed";
import { hyperspeedPresets } from "./hyperspeedPresets";

export default function HyperspeedWrapper({
  preset = "one",
}: {
  preset?: string;
}) {
  const opts = hyperspeedPresets[preset] || hyperspeedPresets.one;

  const handleSpeedUp = useCallback((ev: MouseEvent | TouchEvent) => {
    // placeholder: you can add analytics or UI reactions here
    // console.log('speed up', ev);
  }, []);

  const handleSlowDown = useCallback((ev: MouseEvent | TouchEvent) => {
    // placeholder: you can add analytics or UI reactions here
    // console.log('slow down', ev);
  }, []);

  return (
    <Hyperspeed
      effectOptions={{
        ...opts,
        onSpeedUp: handleSpeedUp,
        onSlowDown: handleSlowDown,
      }}
    />
  );
}
