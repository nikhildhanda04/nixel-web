"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Row order and frame rates mirror NikxelView.stateRow / fps in the macOS app.
const ROWS = {
  idle: 0,
  typing: 1,
  thinking: 2,
  done: 3,
  dragging: 4,
  pounce: 5,
  petted: 6,
  alert: 7,
  recording: 8,
  momReady: 9,
} as const;

const FPS: Record<Mood, number> = {
  idle: 3,
  typing: 8,
  thinking: 2.5,
  done: 6,
  dragging: 8,
  pounce: 8,
  petted: 3,
  alert: 6,
  recording: 4,
  momReady: 6,
};

export type Mood = keyof typeof ROWS;
export const MOODS = Object.keys(ROWS) as Mood[];

type Props = {
  mood: Mood;
  /** Rendered size in px; keep it a multiple of 64 for crisp pixels. */
  size?: number;
  /** The sheet faces right; pass true to mirror it to face left. */
  faceLeft?: boolean;
  className?: string;
};

export function Sprite({ mood, size = 128, faceLeft = false, className }: Props) {
  // Frame is tagged with its mood so a mood change restarts at frame 0.
  const [tick, setTick] = useState({ mood, frame: 0 });
  const frame = tick.mood === mood ? tick.frame : 0;
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setTick((t) => ({ mood, frame: t.mood === mood ? (t.frame + 1) % 4 : 1 })),
      1000 / FPS[mood],
    );
    return () => clearInterval(id);
  }, [mood, reduce]);

  return (
    <div
      role="img"
      aria-label={`Nikxel, ${mood}`}
      className={`pixel shrink-0 ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url(/sprites.png)",
        backgroundSize: `${size * 4}px ${size * 10}px`,
        backgroundPosition: `-${frame * size}px -${ROWS[mood] * size}px`,
        transform: faceLeft ? "scaleX(-1)" : undefined,
      }}
    />
  );
}
