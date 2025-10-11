"use client";

import React, { useEffect, useRef } from "react";

interface ShuffleTextProps {
  text: string;
  className?: string;
  duration?: number; // total duration in ms
  fps?: number;
  onComplete?: () => void;
}

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.<>?/";

export default function ShuffleText({
  text,
  className = "",
  duration = 1200,
  fps = 30,
  onComplete,
}: ShuffleTextProps) {
  const elRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps));
    const len = text.length;

    let frame = 0;
    const start = performance.now();

    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / duration);
      // reveal progress from 0..len
      const revealCount = Math.floor(t * len);

      let out = "";
      for (let i = 0; i < len; i++) {
        if (i < revealCount) {
          out += text[i];
        } else {
          out += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
        }
      }
      el.textContent = out;

      frame++;
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // ensure final text
        el.textContent = text;
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, duration, fps, onComplete]);

  return <span aria-hidden className={className} ref={elRef} />;
}
