"use client";

import { SPEED_MAX, SPEED_MIN } from "@/lib/types";

const LABELS = ["Very Slow", "Slow", "Normal", "Fast", "Very Fast"];

function labelFor(speed: number) {
  const idx = Math.min(
    LABELS.length - 1,
    Math.floor(((speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * LABELS.length)
  );
  return LABELS[idx];
}

interface SpeedControlProps {
  value: number;
  onChange: (speed: number) => void;
}

export default function SpeedControl({ value, onChange }: SpeedControlProps) {
  return (
    <div>
      <label htmlFor="speed-range" className="mb-1 flex justify-between text-sm text-white/80">
        <span>Speed</span>
        <span>{labelFor(value)}</span>
      </label>
      <input
        id="speed-range"
        type="range"
        min={SPEED_MIN}
        max={SPEED_MAX}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={labelFor(value)}
        className="w-full accent-sky-400"
      />
    </div>
  );
}
