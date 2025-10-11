"use client";

import React, { useEffect, useState } from "react";
import LiquidEther from "./LiquidEther";

export default function LiquidEtherWrapper() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function update() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isMobile = size.width > 0 && size.width <= 768;

  // conservative defaults for mobile to reduce GPU/CPU load
  const opts = isMobile
    ? {
        resolution: 0.35,
        iterationsViscous: 8,
        iterationsPoisson: 8,
        cursorSize: Math.max(40, Math.floor(size.width * 0.08)),
      }
    : {
        resolution: 0.5,
        iterationsViscous: 32,
        iterationsPoisson: 32,
        cursorSize: 100,
      };

  return (
    <div className="fixed inset-0 z-0">
      <LiquidEther
        colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
        mouseForce={20}
        cursorSize={opts.cursorSize}
        isViscous={false}
        viscous={30}
        iterationsViscous={opts.iterationsViscous}
        iterationsPoisson={opts.iterationsPoisson}
        resolution={opts.resolution}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />
    </div>
  );
}
