"use client";

interface GameStatsProps {
  score: number;
  onReset: () => void;
}

export default function GameStats({ score, onReset }: GameStatsProps) {
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
      <span aria-live="polite">Score: {score}</span>
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset score"
        className="rounded-full px-2 py-0.5 text-white/60 hover:bg-white/10 hover:text-white"
      >
        Reset
      </button>
    </div>
  );
}
